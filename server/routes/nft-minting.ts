import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import {
  users,
  nftAchievements,
  xIntegrations,
  projects,
  leaderboardScores,
  type NftAchievement,
  type InsertNftAchievement
} from '@shared/schema';

import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { StacksService } from '../services/stacks';

const router = Router();

// Achievement requirements
const ACHIEVEMENT_REQUIREMENTS = {
  bronze: {
    minProjects: 10,
    minReputation: 1000,
    xVerified: false,
    description: 'Complete 10+ projects with good reputation'
  },
  silver: {
    minProjects: 25,
    minReputation: 2000,
    xVerified: true,
    description: 'Complete 25+ projects with X verification'
  },
  gold: {
    minProjects: 50,
    minReputation: 5000,
    xVerified: true,
    description: 'Complete 50+ projects with excellent reputation'
  },
  platinum: {
    minProjects: 100,
    minReputation: 10000,
    xVerified: true,
    description: 'Complete 100+ projects with outstanding reputation'
  },
  verified: {
    minProjects: 0,
    minReputation: 0,
    xVerified: true,
    description: 'Verify your X (Twitter) account'
  }
};

// Request schemas
const mintNftSchema = z.object({
  achievementType: z.enum(['bronze', 'silver', 'gold', 'platinum', 'verified']),
  recipientAddress: z.string(), // Added recipientAddress
  metadata: z.object({ // Added metadata
    description: z.string().optional(),
    image: z.string().optional(),
  }).optional(),
});

const checkEligibilitySchema = z.object({
  userId: z.string().uuid(),
  achievementType: z.enum(['bronze', 'silver', 'gold', 'platinum', 'verified']),
});

import { authenticateToken } from '../middleware/auth';

// Check user eligibility for achievement
router.post('/check-eligibility', async (req, res) => {
  try {
    const { userId, achievementType } = checkEligibilitySchema.parse(req.body);

    const eligibility = await checkUserEligibility(userId, achievementType);

    res.json({
      success: true,
      data: eligibility
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check user eligibility for specific achievement
async function checkUserEligibility(userId: string, achievementType: string): Promise<any> {
  try {
    const requirements = ACHIEVEMENT_REQUIREMENTS[achievementType as keyof typeof ACHIEVEMENT_REQUIREMENTS];

    // Check if user already has this achievement
    const existingNft = await db.select()
      .from(nftAchievements)
      .where(and(
        eq(nftAchievements.userId, userId),
        eq(nftAchievements.achievementType, achievementType)
      ))
      .limit(1)
      .execute();

    if (existingNft.length) {
      return {
        eligible: false,
        reason: 'Already earned this achievement',
        requirements,
        currentStats: null
      };
    }

    // Get user's current stats
    const userStats = await getUserStats(userId);

    // Check X verification if required
    let xVerified = false;
    if (requirements.xVerified) {
      const xIntegration = await db.select()
        .from(xIntegrations)
        .where(eq(xIntegrations.userId, userId))
        .limit(1)
        .execute();

      xVerified = xIntegration.length > 0 && xIntegration[0].verified;
    }

    // Check all requirements
    const meetsRequirements =
      userStats.completedProjects >= requirements.minProjects &&
      userStats.reputation >= requirements.minReputation &&
      (requirements.xVerified ? xVerified : true);

    return {
      eligible: meetsRequirements,
      reason: meetsRequirements ? 'Eligible for achievement' : 'Requirements not met',
      requirements,
      currentStats: {
        ...userStats,
        xVerified
      },
      missingRequirements: meetsRequirements ? [] : [
        ...(userStats.completedProjects < requirements.minProjects && userStats.completedProjects > 0) ?
          [`Need ${requirements.minProjects - userStats.completedProjects} more projects`] : [],
        ...(userStats.reputation < requirements.minReputation && userStats.reputation > 0) ?
          [`Need ${requirements.minReputation - userStats.reputation} more reputation`] : [],
        ...(requirements.xVerified && !xVerified && userStats.reputation > 0) ?
          ['X verification required'] : []
      ]
    };
  } catch (error) {
    console.error('Error checking user eligibility:', error);
    throw error;
  }
}

// Get user's current stats
async function getUserStats(userId: string): Promise<any> {
  try {
    const user = await db.select({
      reputation: users.reputation,
      completedProjects: users.completedProjects,
      totalEarnings: users.totalEarnings
    })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .execute();

    if (!user.length) {
      return {
        reputation: 0,
        completedProjects: 0,
        totalEarnings: 0
      };
    }

    return user[0];
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      reputation: 0,
      completedProjects: 0,
      totalEarnings: 0
    };
  }
}

// Mint NFT achievement
router.post('/mint', async (req, res) => {
  try {
    const { achievementType, userId, recipientAddress, metadata } = mintNftSchema.parse(req.body);
    const requestUserId = userId || (req as any).user?.id;

    if (!requestUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check eligibility first
    const eligibility = await checkUserEligibility(requestUserId, achievementType);

    if (!eligibility.eligible) {
      return res.status(400).json({
        error: 'User not eligible for this achievement',
        reason: eligibility.reason,
        missing: eligibility.missingRequirements
      });
    }

    // Get recipient address (either provided or from user profile)
    let finalRecipient = recipientAddress;
    if (!finalRecipient) {
      const user = await db.select().from(users).where(eq(users.id, requestUserId)).limit(1).execute();
      finalRecipient = user[0]?.stxAddress;
    }

    if (!finalRecipient) {
      return res.status(400).json({ error: 'Recipient address required' });
    }

    // 1. Upload metadata to IPFS
    const { IPFSService } = await import('../services/ipfs');
    const cid = await IPFSService.uploadJSON({
      name: `Degrants Achievement: ${achievementType}`,
      description: metadata?.description || ACHIEVEMENT_REQUIREMENTS[achievementType as keyof typeof ACHIEVEMENT_REQUIREMENTS].description,
      image: metadata?.image || process.env.NFT_IMAGE_PLACEHOLDER || 'https://stxworx.io/nft-placeholder.png',
      attributes: [
        { trait_type: 'Achievement', value: achievementType },
        { trait_type: 'Proposer', value: requestUserId },
        { trait_type: 'Date', value: new Date().toISOString() }
      ]
    });

    const metadataUrl = IPFSService.getGatewayUrl(cid);
    console.log(`✓ Metadata uploaded to IPFS: ${metadataUrl}`);

    // 2. Mint achievement on-chain
    const txid = await StacksService.mintAchievementOnChain(finalRecipient, achievementType);

    // 3. Record in database
    const [achievement] = await db.insert(nftAchievements).values({
      userId: requestUserId,
      achievementType,
      transactionId: txid,
      metadataUrl: metadataUrl,
      tokenId: null, // Will be updated by monitor
      contractAddress: process.env.NFT_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    }).returning();

    res.json({
      success: true,
      data: {
        id: achievement.id,
        txid,
        achievementType,
        recipientAddress: finalRecipient,
        metadataUrl
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error minting achievement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mint achievement NFT via smart contract
async function mintAchievementNft(userId: string, achievementType: string): Promise<string> {
  try {
    // Get user's STX address
    const user = await db.select({ stxAddress: users.stxAddress })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .execute();

    if (!user.length || !user[0].stxAddress) {
      throw new Error('User Stacks address not found. Please link wallet first.');
    }

    const typeId = StacksService.getAchievementTypeId(achievementType);
    if (typeId === 0) {
      throw new Error(`Invalid achievement type: ${achievementType}`);
    }

    console.log(`Minting ${achievementType} (ID: ${typeId}) NFT for user ${userId} at address ${user[0].stxAddress}`);

    const txId = await StacksService.mintAchievementOnChain(user[0].stxAddress, typeId);
    return txId;
  } catch (error) {
    console.error('Error minting achievement NFT:', error);
    throw error;
  }
}

// Get user's NFT achievements
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const nfts = await db.select({
      nftAchievements: {
        id: true,
        tokenId: true,
        achievementType: true,
        mintedAt: true
      },
      users: {
        username: true,
        id: true
      }
    })
      .from(nftAchievements)
      .leftJoin(users, eq(nftAchievements.userId, users.id))
      .where(eq(nftAchievements.userId, userId))
      .orderBy(desc(nftAchievements.mintedAt))
      .execute();

    res.json({
      success: true,
      data: nfts,
      total: nfts.length
    });
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all NFT achievements (admin)
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 50, achievementType } = req.query;

    let query = db.select({
      nftAchievements: {
        id: true,
        userId: true,
        tokenId: true,
        achievementType: true,
        mintedAt: true
      },
      users: {
        username: true,
        id: true
      }
    })
      .from(nftAchievements)
      .leftJoin(users, eq(nftAchievements.userId, users.id));

    if (achievementType) {
      query = query.where(eq(nftAchievements.achievementType, achievementType as string));
    }

    const nfts = await query
      .orderBy(desc(nftAchievements.mintedAt))
      .limit(parseInt(limit as string))
      .offset((parseInt(page as string) - 1) * parseInt(limit as string))
      .execute();

    res.json({
      success: true,
      data: nfts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: nfts.length
      }
    });
  } catch (error) {
    console.error('Error fetching all NFTs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get NFT statistics
router.get('/stats', async (req, res) => {
  try {
    // Total NFTs by type
    const nftsByType = await db.select({
      achievementType: nftAchievements.achievementType,
      count: { count: nftAchievements.id }
    })
      .from(nftAchievements)
      .groupBy(nftAchievements.achievementType)
      .execute();

    // Total unique users with NFTs
    const uniqueUsers = await db.select({ count: nftAchievements.userId })
      .from(nftAchievements)
      .execute();

    // Recent mints (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMints = await db.select({ count: sql`count(${nftAchievements.id})` })
      .from(nftAchievements)
      .where(gte(nftAchievements.mintedAt, sevenDaysAgo))
      .execute();

    res.json({
      success: true,
      data: {
        totalNfts: nftsByType.reduce((sum, type) => sum + type.count, 0),
        uniqueUsers: uniqueUsers[0].count,
        recentMints: recentMints[0].count,
        nftsByType: nftsByType.reduce((acc, type) => {
          acc[type.achievementType] = type.count;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error) {
    console.error('Error fetching NFT stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch mint eligible achievements (admin job)
router.post('/batch-mint', async (req, res) => {
  try {
    const { achievementType } = req.body;

    if (!achievementType || !Object.keys(ACHIEVEMENT_REQUIREMENTS).includes(achievementType)) {
      return res.status(400).json({ error: 'Invalid achievement type' });
    }

    // Get all users who might be eligible
    const users = await db.select({
      id: users.id,
      reputation: users.reputation,
      completedProjects: users.completedProjects
    })
      .from(users)
      .execute();

    let minted = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        const eligibility = await checkUserEligibility(user.id, achievementType);

        if (eligibility.eligible) {
          const txId = await mintAchievementNft(user.id, achievementType);

          await db.insert(nftAchievements)
            .values({
              userId: user.id,
              tokenId: 0,
              txId,
              achievementType,
              mintedAt: new Date()
            })
            .execute();

          minted++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        skipped++;
      }
    }

    res.json({
      success: true,
      data: {
        achievementType,
        totalUsers: users.length,
        minted,
        skipped
      }
    });
  } catch (error) {
    console.error('Error in batch mint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get achievement requirements
router.get('/requirements', async (req, res) => {
  try {
    res.json({
      success: true,
      data: ACHIEVEMENT_REQUIREMENTS
    });
  } catch (error) {
    console.error('Error fetching requirements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get NFT metadata
router.get('/metadata/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;

    const nft = await db.select({
      nftAchievements: {
        id: true,
        achievementType: true,
        mintedAt: true
      },
      users: {
        username: true
      }
    })
      .from(nftAchievements)
      .leftJoin(users, eq(nftAchievements.userId, users.id))
      .where(eq(nftAchievements.tokenId, parseInt(tokenId as string)))
      .limit(1)
      .execute();

    if (!nft.length) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    const nftData = nft[0];
    const metadata = {
      name: `${nftData.nftAchievements.achievementType.charAt(0).toUpperCase() + nftData.nftAchievements.achievementType.slice(1)} Achievement`,
      description: ACHIEVEMENT_REQUIREMENTS[nftData.nftAchievements.achievementType as keyof typeof ACHIEVEMENT_REQUIREMENTS].description,
      image: `https://ipfs.io/ipfs/Qm${nftData.nftAchievements.achievementType}Achievement`,
      attributes: [
        {
          trait_type: 'Achievement Type',
          value: nftData.nftAchievements.achievementType
        },
        {
          trait_type: 'Minted Date',
          value: nftData.nftAchievements.mintedAt.toISOString().split('T')[0]
        },
        {
          trait_type: 'Earner',
          value: nftData.users?.username || 'Anonymous'
        }
      ]
    };

    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

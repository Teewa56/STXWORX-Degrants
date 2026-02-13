import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { db } from '../db';
import { 
  users, 
  xIntegrations, 
  nftAchievements,
  type XIntegration,
  type InsertXIntegration
} from '@shared/schema';

const router = Router();

// X API configuration
const X_API_BASE = 'https://api.twitter.com/2';
const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN;

// Request schemas
const connectXSchema = z.object({
  handle: z.string().min(1).max(50),
  oauthToken: z.string().min(1),
  oauthTokenSecret: z.string().min(1),
});

const verifyXSchema = z.object({
  userId: z.string().uuid(),
});

// Middleware to check X API availability
const checkXApi = (req: any, res: any, next: any) => {
  if (!X_BEARER_TOKEN) {
    return res.status(503).json({ error: 'X API not configured' });
  }
  next();
};

// Connect X account
router.post('/connect', async (req, res) => {
  try {
    const { handle, oauthToken, oauthTokenSecret } = connectXSchema.parse(req.body);
    const userId = req.user?.id; // TODO: Get from auth
    
    // Get user profile from X API
    const userProfile = await getXUserProfile(oauthToken, oauthTokenSecret);
    
    if (!userProfile) {
      return res.status(400).json({ error: 'Invalid X credentials' });
    }
    
    // Verify handle matches
    if (userProfile.username.toLowerCase() !== handle.toLowerCase()) {
      return res.status(400).json({ error: 'Handle does not match X profile' });
    }
    
    // Calculate engagement score (simplified)
    const engagementScore = calculateEngagementScore(userProfile);
    
    // Save integration
    const integrationData: InsertXIntegration = {
      userId,
      handle: userProfile.username,
      verified: userProfile.verified || false,
      followerCount: userProfile.public_metrics?.followers_count || 0,
      engagementScore,
    };
    
    const savedIntegration = await db.insert(xIntegrations)
      .values(integrationData)
      .onConflictDoUpdate({
        target: xIntegrations.userId,
        set: {
          handle: userProfile.username,
          verified: userProfile.verified || false,
          followerCount: userProfile.public_metrics?.followers_count || 0,
          engagementScore,
          lastSync: new Date()
        }
      })
      .returning()
      .execute();
    
    // Mint verified NFT if user is verified
    if (userProfile.verified) {
      await mintVerifiedNft(userId);
    }
    
    res.json({
      success: true,
      data: savedIntegration[0],
      message: 'X account connected successfully'
    });
    
  } catch (error) {
    console.error('Error connecting X account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get X user profile
async function getXUserProfile(oauthToken: string, oauthTokenSecret: string): Promise<any> {
  try {
    const response = await axios.get(`${X_API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${X_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        'user.fields': 'public_metrics,verified,description,profile_image_url',
        'expansions': 'pinned_tweet_id'
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching X user profile:', error);
    return null;
  }
}

// Calculate engagement score
function calculateEngagementScore(profile: any): number {
  const metrics = profile.public_metrics || {};
  const followers = metrics.followers_count || 0;
  const following = metrics.following_count || 0;
  const tweetCount = metrics.tweet_count || 0;
  const listedCount = metrics.listed_count || 0;
  
  // Simple engagement calculation
  const engagementScore = Math.floor(
    (followers * 0.4) + 
    (tweetCount * 0.3) + 
    (listedCount * 0.2) + 
    (following > 0 ? (followers / following) * 0.1 : 0)
  );
  
  return Math.min(engagementScore, 10000); // Cap at 10000
}

// Mint verified NFT
async function mintVerifiedNft(userId: string): Promise<void> {
  try {
    // Check if user already has verified NFT
    const existingNft = await db.select()
      .from(nftAchievements)
      .where((nftAchievements, { 
        and: [
          eq(nftAchievements.userId, userId),
          eq(nftAchievements.achievementType, 'verified')
        ]
      }))
      .limit(1)
      .execute();
    
    if (existingNft.length) {
      return; // Already has verified NFT
    }
    
    // TODO: Call smart contract to mint NFT
    // For now, just save to database
    await db.insert(nftAchievements)
      .values({
        userId,
        tokenId: Date.now(), // Temporary token ID
        achievementType: 'verified',
        mintedAt: new Date()
      })
      .execute();
    
    console.log(`Minted verified NFT for user ${userId}`);
  } catch (error) {
    console.error('Error minting verified NFT:', error);
  }
}

// Get user's X integration
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const integration = await db.select()
      .from(xIntegrations)
      .where((xIntegrations, { eq: xIntegrations.userId, userId }))
      .limit(1)
      .execute();
    
    if (!integration.length) {
      return res.status(404).json({ error: 'X integration not found' });
    }
    
    res.json({
      success: true,
      data: integration[0]
    });
  } catch (error) {
    console.error('Error fetching X integration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update X integration data
router.post('/sync/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get existing integration
    const existing = await db.select()
      .from(xIntegrations)
      .where((xIntegrations, { eq: xIntegrations.userId, userId }))
      .limit(1)
      .execute();
    
    if (!existing.length) {
      return res.status(404).json({ error: 'X integration not found' });
    }
    
    // Fetch fresh data from X API
    const userProfile = await fetchXProfileByHandle(existing[0].handle);
    
    if (!userProfile) {
      return res.status(400).json({ error: 'Failed to fetch X profile' });
    }
    
    // Update integration
    const engagementScore = calculateEngagementScore(userProfile);
    
    await db.update(xIntegrations)
      .set({
        verified: userProfile.verified || false,
        followerCount: userProfile.public_metrics?.followers_count || 0,
        engagementScore,
        lastSync: new Date()
      })
      .where((xIntegrations, { eq: xIntegrations.userId, userId }))
      .execute();
    
    // Mint verified NFT if newly verified
    if (userProfile.verified && !existing[0].verified) {
      await mintVerifiedNft(userId);
    }
    
    res.json({
      success: true,
      message: 'X integration updated successfully'
    });
    
  } catch (error) {
    console.error('Error syncing X integration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch X profile by handle
async function fetchXProfileByHandle(handle: string): Promise<any> {
  try {
    const response = await axios.get(`${X_API_BASE}/users/by/username/${handle}`, {
      headers: {
        'Authorization': `Bearer ${X_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        'user.fields': 'public_metrics,verified,description,profile_image_url'
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching X profile by handle:', error);
    return null;
  }
}

// Get all X integrations (admin)
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 50, verified } = req.query;
    
    let query = db.select({
      xIntegrations: {
        id: true,
        userId: true,
        handle: true,
        verified: true,
        followerCount: true,
        engagementScore: true,
        lastSync: true
      },
      users: {
        username: true,
        id: true
      }
    })
      .from(xIntegrations)
      .leftJoin(users, (xIntegrations, { eq: xIntegrations.userId, users.id }));
    
    if (verified !== undefined) {
      query = query.where((xIntegrations, { eq: xIntegrations.verified, verified === 'true' }));
    }
    
    const integrations = await query
      .orderBy((xIntegrations, { desc: xIntegrations.lastSync }))
      .limit(parseInt(limit as string))
      .offset((parseInt(page as string) - 1) * parseInt(limit as string))
      .execute();
    
    res.json({
      success: true,
      data: integrations,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: integrations.length
      }
    });
  } catch (error) {
    console.error('Error fetching X integrations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Disconnect X account
router.delete('/disconnect/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await db.delete(xIntegrations)
      .where((xIntegrations, { eq: xIntegrations.userId, userId }))
      .execute();
    
    res.json({
      success: true,
      message: 'X account disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting X account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get X statistics
router.get('/stats', async (req, res) => {
  try {
    const totalIntegrations = await db.select({ count: xIntegrations.userId })
      .from(xIntegrations)
      .execute();
    
    const verifiedIntegrations = await db.select({ count: xIntegrations.userId })
      .from(xIntegrations)
      .where((xIntegrations, { eq: xIntegrations.verified, true }))
      .execute();
    
    const avgFollowers = await db.select({ avg: xIntegrations.followerCount })
      .from(xIntegrations)
      .execute();
    
    const avgEngagement = await db.select({ avg: xIntegrations.engagementScore })
      .from(xIntegrations)
      .execute();
    
    res.json({
      success: true,
      data: {
        totalIntegrations: totalIntegrations[0].count,
        verifiedIntegrations: verifiedIntegrations[0].count,
        verificationRate: totalIntegrations[0].count > 0 
          ? (verifiedIntegrations[0].count / totalIntegrations[0].count) * 100 
          : 0,
        averageFollowers: Math.floor(avgFollowers[0].avg || 0),
        averageEngagementScore: Math.floor(avgEngagement[0].avg || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching X stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch sync all X integrations (admin job)
router.post('/batch-sync', async (req, res) => {
  try {
    const integrations = await db.select()
      .from(xIntegrations)
      .execute();
    
    let updated = 0;
    let errors = 0;
    
    for (const integration of integrations) {
      try {
        const userProfile = await fetchXProfileByHandle(integration.handle);
        
        if (userProfile) {
          const engagementScore = calculateEngagementScore(userProfile);
          
          await db.update(xIntegrations)
            .set({
              verified: userProfile.verified || false,
              followerCount: userProfile.public_metrics?.followers_count || 0,
              engagementScore,
              lastSync: new Date()
            })
            .where((xIntegrations, { eq: xIntegrations.userId, integration.userId }))
            .execute();
          
          // Mint verified NFT if newly verified
          if (userProfile.verified && !integration.verified) {
            await mintVerifiedNft(integration.userId);
          }
          
          updated++;
        }
      } catch (error) {
        console.error(`Error syncing ${integration.handle}:`, error);
        errors++;
      }
    }
    
    res.json({
      success: true,
      data: {
        total: integrations.length,
        updated,
        errors
      }
    });
  } catch (error) {
    console.error('Error in batch sync:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

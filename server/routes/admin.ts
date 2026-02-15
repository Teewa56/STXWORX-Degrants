import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import {
  adminActions,
  projects,
  nftAchievements,
  leaderboardScores,
  xIntegrations,
  daoTransactions,
  users,
  type Project,
  type DaoTransaction
} from '@shared/schema';
import { AuthenticatedRequest, authenticateAdmin } from '../middleware/auth';
import { StacksService } from '../services/stacks';
import { eq, desc, ilike, gte, lte, sql, and } from 'drizzle-orm';

const router = Router();

// all admin actions (audit log)
router.get('/actions', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const actions = await db.select().from(adminActions)
      .orderBy(desc(adminActions.timestamp))
      .limit(100)
      .execute();

    res.json({
      success: true,
      data: actions,
      total: actions.length
    });
  } catch (error) {
    console.error('Error fetching admin actions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get escrow management data
router.get('/escrows', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const escrows = await db.select().from(projects)
      .where(eq(projects.status, 'ACTIVE'))
      .orderBy(desc(projects.createdAt))
      .limit(50)
      .execute();

    res.json({
      success: true,
      data: escrows,
      total: escrows.length
    });
  } catch (error) {
    console.error('Error fetching escrows:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific escrow details
router.get('/escrows/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const escrowId = req.params.id;
    const escrowList = await db.select().from(projects)
      .where(eq(projects.id, escrowId))
      .limit(1)
      .execute();

    if (!escrowList.length) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    res.json({
      success: true,
      data: escrowList[0]
    });
  } catch (error) {
    console.error('Error fetching escrow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve or reject escrow
router.post('/escrows/:id/approve', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const escrowId = req.params.id;
    const { action, reason } = req.body;

    // Log admin action
    await db.insert(adminActions).values({
      adminId: req.user?.id || 'system',
      actionType: action,
      actionData: {
        escrowId,
        action,
        reason,
        timestamp: new Date().toISOString()
      }
    }).execute();

    // Execute real escrow action on-chain if appropriate
    let txId = null;
    if (action === 'APPROVE') {
      const projectList = await db.select().from(projects).where(eq(projects.id, escrowId)).limit(1).execute();
      const project = projectList[0];
      if (project && project.onChainId) {
        txId = await StacksService.approveEscrowOnChain(project.onChainId);
      }
    }

    res.json({
      success: true,
      message: `Escrow ${action} processed`,
      txId
    });
  } catch (error) {
    console.error('Error approving escrow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pause/unpause escrow
router.post('/escrows/:id/pause', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const escrowId = req.params.id;
    const { paused, reason } = req.body;

    // Log admin action
    await db.insert(adminActions).values({
      adminId: req.user?.id || 'system',
      actionType: paused ? 'PAUSE_ESCROW' : 'UNPAUSE_ESCROW',
      actionData: {
        escrowId,
        paused,
        reason,
        timestamp: new Date().toISOString()
      }
    }).execute();

    // Execute real platform pause on-chain
    const txId = await StacksService.setPlatformPauseOnChain(paused);

    res.json({
      success: true,
      message: `Escrow ${paused ? 'paused' : 'unpaused'}`,
      txId
    });
  } catch (error) {
    console.error('Error pausing escrow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user management data
router.get('/users', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';

    let filters = [];
    if (search) {
      filters.push(ilike(users.username, `%${search}%`));
    }

    let query = db.select().from(users);
    if (filters.length > 0) {
      query = query.where(and(...filters)) as any;
    }

    const results = await query
      .orderBy(desc(users.username))
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    res.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total: results.length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get platform statistics
router.get('/stats', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    // Get total projects
    const totalProjects = await db.select({ count: sql<number>`count(${projects.id})` })
      .from(projects)
      .execute();

    // Get active escrows
    const activeEscrows = await db.select({ count: sql<number>`count(${projects.id})` })
      .from(projects)
      .where(eq(projects.status, 'ACTIVE'))
      .execute();

    // Get completed projects
    const completedProjects = await db.select({ count: sql<number>`count(${projects.id})` })
      .from(projects)
      .where(eq(projects.status, 'COMPLETED'))
      .execute();

    // Get total users
    const totalUsers = await db.select({ count: sql<number>`count(${users.id})` })
      .from(users)
      .execute();

    // Get total volume
    const volumeResult = await db.select({
      total: projects.totalAmount
    }).from(projects)
      .execute();

    const totalVolume = volumeResult.reduce((sum: number, row: any) => sum + Number(row.total), 0);

    res.json({
      success: true,
      data: {
        totalProjects: totalProjects[0]?.count || 0,
        activeEscrows: activeEscrows[0]?.count || 0,
        completedProjects: completedProjects[0]?.count || 0,
        totalUsers: totalUsers[0]?.count || 0,
        totalVolume: totalVolume / 1000000, // Convert from microstacks to STX
        daoFees: totalVolume * 0.1 // 10% of total volume
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get NFT achievements data
router.get('/nfts', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const nfts = await db.select({
      nftAchievements: {
        id: nftAchievements.id,
        userId: nftAchievements.userId,
        tokenId: nftAchievements.tokenId,
        achievementType: nftAchievements.achievementType,
        mintedAt: nftAchievements.mintedAt
      },
      users: {
        username: users.username,
        id: users.id
      }
    })
      .from(nftAchievements)
      .leftJoin(users, eq(nftAchievements.userId, users.id))
      .orderBy(desc(nftAchievements.mintedAt))
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    res.json({
      success: true,
      data: nfts,
      pagination: {
        page,
        limit,
        total: nfts.length
      }
    });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leaderboard data
router.get('/leaderboard', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { category, limit = '100' } = req.query;
    const limitVal = parseInt(limit as string);

    let query = db.select({
      leaderboardScores: {
        scoreValue: leaderboardScores.scoreValue,
        lastUpdated: leaderboardScores.lastUpdated
      },
      users: {
        username: users.username,
        id: users.id
      }
    })
      .from(leaderboardScores)
      .leftJoin(users, eq(leaderboardScores.userId, users.id));

    if (category) {
      query = query.where(eq(leaderboardScores.scoreType, category as string)) as any;
    }

    const scores = await query
      .orderBy(desc(leaderboardScores.scoreValue))
      .limit(limitVal)
      .execute();

    res.json({
      success: true,
      data: scores,
      category: category || 'all',
      total: scores.length
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get X integrations
router.get('/x-integrations', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const verified = req.query.verified === 'true';

    let query = db.select().from(xIntegrations);

    if (verified) {
      query = query.where(eq(xIntegrations.verified, true)) as any;
    }

    const integrations = await query
      .orderBy(desc(xIntegrations.lastSync))
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    res.json({
      success: true,
      data: integrations,
      pagination: {
        page,
        limit,
        total: integrations.length
      }
    });
  } catch (error) {
    console.error('Error fetching X integrations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get DAO transactions
router.get('/dao-transactions', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const { tokenType, startDate, endDate } = req.query;

    let filters = [];
    if (tokenType) {
      filters.push(eq(daoTransactions.tokenType, tokenType as string));
    }
    if (startDate) {
      filters.push(gte(daoTransactions.timestamp, startDate as string));
    }
    if (endDate) {
      filters.push(lte(daoTransactions.timestamp, endDate as string));
    }

    let query = db.select().from(daoTransactions);
    if (filters.length > 0) {
      query = query.where(and(...filters)) as any;
    }

    const transactions = await query
      .orderBy(desc(daoTransactions.timestamp))
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total: transactions.length
      }
    });
  } catch (error) {
    console.error('Error fetching DAO transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

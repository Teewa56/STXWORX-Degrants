import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { 
  users, 
  adminActions, 
  projects, 
  nftAchievements, 
  leaderboardScores, 
  xIntegrations,
  daoTransactions,
  type AdminAction,
  type InsertAdminAction,
  type Project,
  type NftAchievement,
  type LeaderboardScore,
  type XIntegration,
  type DaoTransaction
} from '@shared/schema';

const router = Router();

// Middleware for admin authentication (simplified for now)
const adminAuth = (req: any, res: any, next: any) => {
  // TODO: Implement proper JWT/MFA authentication
  const adminAddress = process.env.ADMIN_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  if (req.user?.address !== adminAddress) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

// Get all admin actions (audit log)
router.get('/actions', adminAuth, async (req, res) => {
  try {
    const actions = await db.select().from(adminActions)
      .orderBy((adminActions, { desc: adminActions.timestamp }))
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
router.get('/escrows', adminAuth, async (req, res) => {
  try {
    const escrows = await db.select().from(projects)
      .where((projects, { eq: projects.status, 'ACTIVE' }))
      .orderBy((projects, { desc: projects.createdAt }))
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
router.get('/escrows/:id', adminAuth, async (req, res) => {
  try {
    const escrowId = req.params.id;
    const escrow = await db.select().from(projects)
      .where((projects, { eq: projects.id, escrowId }))
      .limit(1)
      .execute();
    
    if (!escrow.length) {
      return res.status(404).json({ error: 'Escrow not found' });
    }
    
    res.json({
      success: true,
      data: escrow[0]
    });
  } catch (error) {
    console.error('Error fetching escrow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve or reject escrow
router.post('/escrows/:id/approve', adminAuth, async (req, res) => {
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
    
    // TODO: Implement actual escrow approval logic via smart contract
    res.json({
      success: true,
      message: `Escrow ${action} processed`
    });
  } catch (error) {
    console.error('Error approving escrow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pause/unpause escrow
router.post('/escrows/:id/pause', adminAuth, async (req, res) => {
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
    
    // TODO: Implement actual pause logic via smart contract
    res.json({
      success: true,
      message: `Escrow ${paused ? 'paused' : 'unpaused'}`
    });
  } catch (error) {
    console.error('Error pausing escrow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user management data
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    
    let query = db.select().from(users);
    
    if (search) {
      query = query.where((users, { 
        ilike: users.username, `%${search}%` 
      }));
    }
    
    const users = await query
      .orderBy((users, { desc: users.createdAt }))
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: users.length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get platform statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    // Get total projects
    const totalProjects = await db.select({ count: projects.id })
      .from(projects)
      .execute();
    
    // Get active escrows
    const activeEscrows = await db.select({ count: projects.id })
      .from(projects)
      .where((projects, { eq: projects.status, 'ACTIVE' }))
      .execute();
    
    // Get completed projects
    const completedProjects = await db.select({ count: projects.id })
      .from(projects)
      .where((projects, { eq: projects.status, 'COMPLETED' }))
      .execute();
    
    // Get total users
    const totalUsers = await db.select({ count: users.id })
      .from(users)
      .execute();
    
    // Get total volume
    const volumeResult = await db.select({
      total: projects.totalAmount
    }).from(projects)
      .execute();
    
    const totalVolume = volumeResult.reduce((sum, row) => sum + Number(row.total), 0);
    
    res.json({
      success: true,
      data: {
        totalProjects: totalProjects[0].count,
        activeEscrows: activeEscrows[0].count,
        completedProjects: completedProjects[0].count,
        totalUsers: totalUsers[0].count,
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
router.get('/nfts', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const nfts = await db.select({
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
      .leftJoin(users, (nftAchievements, { eq: nftAchievements.userId, users.id }))
      .orderBy((nftAchievements, { desc: nftAchievements.mintedAt }))
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
router.get('/leaderboard', adminAuth, async (req, res) => {
  try {
    const { category, limit = 100 } = req.query;
    
    let query = db.select({
      leaderboardScores: {
        scoreValue: true,
        lastUpdated: true
      },
      users: {
        username: true,
        id: true
      }
    })
      .from(leaderboardScores)
      .leftJoin(users, (leaderboardScores, { eq: leaderboardScores.userId, users.id }));
    
    if (category) {
      query = query.where((leaderboardScores, { eq: leaderboardScores.scoreType, category }));
    }
    
    const scores = await query
      .orderBy((leaderboardScores, { desc: leaderboardScores.scoreValue }))
      .limit(limit)
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
router.get('/x-integrations', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const verified = req.query.verified === 'true';
    
    const integrations = await db.select().from(xIntegrations)
      .where(verified ? 
        (xIntegrations, { eq: xIntegrations.verified, true }) : 
        undefined
      )
      .orderBy((xIntegrations, { desc: xIntegrations.lastSync }))
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
router.get('/dao-transactions', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const { tokenType, startDate, endDate } = req.query;
    
    let query = db.select().from(daoTransactions);
    
    if (tokenType) {
      query = query.where((daoTransactions, { eq: daoTransactions.tokenType, tokenType }));
    }
    
    if (startDate) {
      query = query.where((daoTransactions, { gte: daoTransactions.timestamp, startDate }));
    }
    
    if (endDate) {
      query = query.where((daoTransactions, { lte: daoTransactions.timestamp, endDate }));
    }
    
    const transactions = await query
      .orderBy((daoTransactions, { desc: daoTransactions.timestamp }))
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

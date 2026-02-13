import { db } from '../db';
import { 
  users, 
  projects, 
  nftAchievements, 
  leaderboardScores, 
  xIntegrations,
  type LeaderboardScore,
  type InsertLeaderboardScore
} from '@shared/schema';

export class LeaderboardService {
  // Calculate and update all leaderboard scores
  static async updateAllLeaderboards(): Promise<void> {
    try {
      console.log('Starting leaderboard calculations...');
      
      // Calculate total earnings leaderboard
      await this.calculateTotalEarningsLeaderboard();
      
      // Calculate project completion leaderboard
      await this.calculateProjectCompletionLeaderboard();
      
      // Calculate reputation leaderboard
      await this.calculateReputationLeaderboard();
      
      // Calculate X verification bonus leaderboard
      await this.calculateXVerificationLeaderboard();
      
      // Calculate NFT achievement leaderboard
      await this.calculateNftAchievementLeaderboard();
      
      console.log('Leaderboard calculations completed');
    } catch (error) {
      console.error('Error updating leaderboards:', error);
      throw error;
    }
  }
  
  // Calculate total earnings leaderboard
  static async calculateTotalEarningsLeaderboard(): Promise<void> {
    try {
      // Get all completed projects and sum earnings by user
      const earningsData = await db.select({
        freelancerId: projects.freelancerId,
        totalEarnings: projects.totalAmount
      })
        .from(projects)
        .where((projects, { eq: projects.status, 'COMPLETED' }))
        .execute();
      
      // Group by freelancer and sum earnings
      const userEarnings = new Map<string, number>();
      earningsData.forEach(record => {
        const current = userEarnings.get(record.freelancerId) || 0;
        userEarnings.set(record.freelancerId, current + Number(record.totalEarnings));
      });
      
      // Update leaderboard scores
      for (const [userId, earnings] of userEarnings.entries()) {
        await db.insert(leaderboardScores)
          .values({
            userId,
            scoreType: 'total-earnings',
            scoreValue: Math.floor(earnings),
            lastUpdated: new Date()
          })
          .onConflictDoUpdate({
            target: leaderboardScores.userId,
            set: {
              scoreValue: Math.floor(earnings),
              lastUpdated: new Date()
            }
          })
          .execute();
      }
      
      console.log(`Updated total earnings leaderboard for ${userEarnings.size} users`);
    } catch (error) {
      console.error('Error calculating total earnings leaderboard:', error);
      throw error;
    }
  }
  
  // Calculate project completion leaderboard
  static async calculateProjectCompletionLeaderboard(): Promise<void> {
    try {
      const completionData = await db.select({
        freelancerId: projects.freelancerId,
        completedProjects: projects.id
      })
        .from(projects)
        .where((projects, { eq: projects.status, 'COMPLETED' }))
        .execute();
      
      // Count completed projects by user
      const userCompletions = new Map<string, number>();
      completionData.forEach(record => {
        const current = userCompletions.get(record.freelancerId) || 0;
        userCompletions.set(record.freelancerId, current + 1);
      });
      
      // Update leaderboard scores
      for (const [userId, completions] of userCompletions.entries()) {
        await db.insert(leaderboardScores)
          .values({
            userId,
            scoreType: 'project-completion',
            scoreValue: completions,
            lastUpdated: new Date()
          })
          .onConflictDoUpdate({
            target: leaderboardScores.userId,
            set: {
              scoreValue: completions,
              lastUpdated: new Date()
            }
          })
          .execute();
      }
      
      console.log(`Updated project completion leaderboard for ${userCompletions.size} users`);
    } catch (error) {
      console.error('Error calculating project completion leaderboard:', error);
      throw error;
    }
  }
  
  // Calculate reputation leaderboard
  static async calculateReputationLeaderboard(): Promise<void> {
    try {
      const reputationData = await db.select({
        id: users.id,
        reputation: users.reputation
      })
        .from(users)
        .where((users, { gt: users.reputation, 0 }))
        .execute();
      
      // Update leaderboard scores
      for (const user of reputationData) {
        await db.insert(leaderboardScores)
          .values({
            userId: user.id,
            scoreType: 'reputation',
            scoreValue: user.reputation,
            lastUpdated: new Date()
          })
          .onConflictDoUpdate({
            target: leaderboardScores.userId,
            set: {
              scoreValue: user.reputation,
              lastUpdated: new Date()
            }
          })
          .execute();
      }
      
      console.log(`Updated reputation leaderboard for ${reputationData.length} users`);
    } catch (error) {
      console.error('Error calculating reputation leaderboard:', error);
      throw error;
    }
  }
  
  // Calculate X verification bonus leaderboard
  static async calculateXVerificationLeaderboard(): Promise<void> {
    try {
      const verifiedUsers = await db.select({
        userId: xIntegrations.userId,
        followerCount: xIntegrations.followerCount,
        engagementScore: xIntegrations.engagementScore,
        verified: xIntegrations.verified
      })
        .from(xIntegrations)
        .where((xIntegrations, { eq: xIntegrations.verified, true }))
        .execute();
      
      // Calculate social score based on followers and engagement
      for (const user of verifiedUsers) {
        const socialScore = user.followerCount * 10 + user.engagementScore * 5;
        
        await db.insert(leaderboardScores)
          .values({
            userId: user.userId,
            scoreType: 'social-verification',
            scoreValue: socialScore,
            lastUpdated: new Date()
          })
          .onConflictDoUpdate({
            target: leaderboardScores.userId,
            set: {
              scoreValue: socialScore,
              lastUpdated: new Date()
            }
          })
          .execute();
      }
      
      console.log(`Updated X verification leaderboard for ${verifiedUsers.length} users`);
    } catch (error) {
      console.error('Error calculating X verification leaderboard:', error);
      throw error;
    }
  }
  
  // Calculate NFT achievement leaderboard
  static async calculateNftAchievementLeaderboard(): Promise<void> {
    try {
      const achievementData = await db.select({
        userId: nftAchievements.userId,
        achievementType: nftAchievements.achievementType
      })
        .from(nftAchievements)
        .execute();
      
      // Count achievements by user and type
      const userAchievements = new Map<string, Map<string, number>>();
      
      achievementData.forEach(record => {
        if (!userAchievements.has(record.userId)) {
          userAchievements.set(record.userId, new Map());
        }
        const userMap = userAchievements.get(record.userId)!;
        const current = userMap.get(record.achievementType) || 0;
        userMap.set(record.achievementType, current + 1);
      });
      
      // Calculate achievement score based on rarity
      const achievementWeights = {
        'bronze': 10,
        'silver': 25,
        'gold': 50,
        'platinum': 100,
        'verified': 5
      };
      
      for (const [userId, achievements] of userAchievements.entries()) {
        let totalScore = 0;
        
        for (const [achievementType, count] of achievements.entries()) {
          const weight = achievementWeights[achievementType as keyof typeof achievementWeights] || 1;
          totalScore += weight * count;
        }
        
        await db.insert(leaderboardScores)
          .values({
            userId,
            scoreType: 'nft-achievements',
            scoreValue: totalScore,
            lastUpdated: new Date()
          })
          .onConflictDoUpdate({
            target: leaderboardScores.userId,
            set: {
              scoreValue: totalScore,
              lastUpdated: new Date()
            }
          })
          .execute();
      }
      
      console.log(`Updated NFT achievement leaderboard for ${userAchievements.size} users`);
    } catch (error) {
      console.error('Error calculating NFT achievement leaderboard:', error);
      throw error;
    }
  }
  
  // Get leaderboard by type
  static async getLeaderboard(
    scoreType: string, 
    limit: number = 100, 
    offset: number = 0
  ): Promise<any[]> {
    try {
      const leaderboard = await db.select({
        leaderboardScores: {
          scoreValue: true,
          lastUpdated: true
        },
        users: {
          id: true,
          username: true,
          reputation: true
        }
      })
        .from(leaderboardScores)
        .leftJoin(users, (leaderboardScores, { eq: leaderboardScores.userId, users.id }))
        .where((leaderboardScores, { eq: leaderboardScores.scoreType, scoreType }))
        .orderBy((leaderboardScores, { desc: leaderboardScores.scoreValue })
        .limit(limit)
        .offset(offset)
        .execute();
      
      return leaderboard.map((entry, index) => ({
        rank: offset + index + 1,
        userId: entry.users?.id,
        username: entry.users?.username,
        reputation: entry.users?.reputation,
        score: entry.leaderboardScores.scoreValue,
        lastUpdated: entry.leaderboardScores.lastUpdated
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
  
  // Get user's rank in specific leaderboard
  static async getUserRank(userId: string, scoreType: string): Promise<number | null> {
    try {
      const userScore = await db.select({
        scoreValue: leaderboardScores.scoreValue
      })
        .from(leaderboardScores)
        .where((leaderboardScores, { 
          and: [
            eq(leaderboardScores.userId, userId),
            eq(leaderboardScores.scoreType, scoreType)
          ]
        }))
        .limit(1)
        .execute();
      
      if (!userScore.length) {
        return null;
      }
      
      // Count how many users have higher scores
      const higherScores = await db.select({ count: leaderboardScores.userId })
        .from(leaderboardScores)
        .where((leaderboardScores, { 
          and: [
            eq(leaderboardScores.scoreType, scoreType),
            gt(leaderboardScores.scoreValue, userScore[0].scoreValue)
          ]
        }))
        .execute();
      
      return higherScores.length + 1;
    } catch (error) {
      console.error('Error getting user rank:', error);
      throw error;
    }
  }
  
  // Get user's scores across all leaderboards
  static async getUserScores(userId: string): Promise<any[]> {
    try {
      const scores = await db.select({
        scoreType: leaderboardScores.scoreType,
        scoreValue: leaderboardScores.scoreValue,
        lastUpdated: leaderboardScores.lastUpdated
      })
        .from(leaderboardScores)
        .where((leaderboardScores, { eq: leaderboardScores.userId, userId }))
        .execute();
      
      const results = [];
      for (const score of scores) {
        const rank = await this.getUserRank(userId, score.scoreType);
        results.push({
          scoreType: score.scoreType,
          scoreValue: score.scoreValue,
          rank,
          lastUpdated: score.lastUpdated
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error getting user scores:', error);
      throw error;
    }
  }
  
  // Get leaderboard summary statistics
  static async getLeaderboardStats(): Promise<any> {
    try {
      const stats = await db.select({
        scoreType: leaderboardScores.scoreType,
        totalUsers: { count: leaderboardScores.userId },
        averageScore: { avg: leaderboardScores.scoreValue },
        topScore: { max: leaderboardScores.scoreValue }
      })
        .from(leaderboardScores)
        .groupBy(leaderboardScores.scoreType)
        .execute();
      
      return stats;
    } catch (error) {
      console.error('Error getting leaderboard stats:', error);
      throw error;
    }
  }
}

// Schedule leaderboard updates (run every hour)
setInterval(async () => {
  try {
    await LeaderboardService.updateAllLeaderboards();
  } catch (error) {
    console.error('Scheduled leaderboard update failed:', error);
  }
}, 60 * 60 * 1000); // Every hour

export default LeaderboardService;

import { db } from '../db';
import { xIntegrations } from '@shared/schema';
import { storage } from '../storage';
import { XAuthService } from './x-auth';
import axios from 'axios';

export class XSyncService {
    private static isRunning = false;
    private static interval: NodeJS.Timeout | null = null;
    private static readonly X_API_BASE = 'https://api.twitter.com/2';

    static start(intervalMs: number = 3600000) { // Default every 1 hour
        if (this.isRunning) return;

        this.isRunning = true;
        console.log('[XSync] Starting X profile sync service');

        this.interval = setInterval(() => this.syncAllProfiles(), intervalMs);
        // Initial sync
        this.syncAllProfiles();
    }

    static stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }

    private static async syncAllProfiles() {
        try {
            const integrations = await db.select().from(xIntegrations).execute();
            console.log(`[XSync] Syncing ${integrations.length} profiles...`);

            for (const integration of integrations) {
                try {
                    await this.syncProfile(integration);
                } catch (error) {
                    console.error(`[XSync] Error syncing profile for user ${integration.userId}:`, error);
                }
            }
        } catch (error) {
            console.error('[XSync] Error in syncAllProfiles:', error);
        }
    }

    private static async syncProfile(integration: any) {
        let accessToken = integration.accessToken;

        // Check if token needs refresh (if within 10 minutes of expiry)
        const isExpired = integration.expiresAt &&
            (new Date(integration.expiresAt).getTime() - Date.now() < 600000);

        if (isExpired && integration.refreshToken) {
            console.log(`[XSync] Refreshing token for user ${integration.userId}`);
            const tokens = await XAuthService.refreshAccessToken(integration.refreshToken);
            accessToken = tokens.accessToken;

            const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
            await storage.upsertXIntegration({
                ...integration,
                accessToken,
                refreshToken: tokens.refreshToken || integration.refreshToken,
                expiresAt
            });
        }

        if (!accessToken) return;

        // Fetch fresh data
        const response = await axios.get(`${this.X_API_BASE}/users/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: { 'user.fields': 'public_metrics,verified' }
        });

        const userProfile = response.data.data;
        if (userProfile) {
            const metrics = userProfile.public_metrics || {};
            const followers = metrics.followers_count || 0;
            const following = metrics.following_count || 0;

            const engagementScore = Math.floor(
                (followers * 0.4) +
                ((metrics.tweet_count || 0) * 0.3) +
                (following > 0 ? (followers / following) * 0.1 : 0)
            );

            await storage.upsertXIntegration({
                ...integration,
                verified: userProfile.verified || false,
                followerCount: metrics.followers_count || 0,
                engagementScore: Math.min(engagementScore, 10000),
            });
        }
    }
}

// Simple engagement helper
function calculateEngagement(profile: any): number {
    const metrics = profile.public_metrics || {};
    const followers = metrics.followers_count || 0;
    const following = metrics.following_count || 0;
    const tweetCount = metrics.tweet_count || 0;

    const score = Math.floor(
        (followers * 0.4) +
        (tweetCount * 0.3) +
        (following > 0 ? (followers / following) * 0.1 : 0)
    );

    return Math.min(score, 10000);
}

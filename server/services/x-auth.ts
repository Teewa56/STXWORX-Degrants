import crypto from 'crypto';
import axios from 'axios';
import { CacheManager } from '../middleware/redis';

const X_CLIENT_ID = process.env.X_CLIENT_ID;
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET;
const X_REDIRECT_URI = process.env.X_REDIRECT_URI || 'http://localhost:5000/api/x/callback';

export interface XTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
}

export class XAuthService {
    private static readonly AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
    private static readonly TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';

    // Generate PKCE code verifier and challenge
    private static generatePKCE() {
        const verifier = crypto.randomBytes(32).toString('base64url');
        const challenge = crypto.createHash('sha256')
            .update(verifier)
            .digest()
            .toString('base64url');
        return { verifier, challenge };
    }

    // Step 1: Generate Authorization URL
    static async generateAuthUrl(userId: string) {
        if (!X_CLIENT_ID) throw new Error('X_CLIENT_ID not configured');

        const state = crypto.randomBytes(16).toString('hex');
        const { verifier, challenge } = this.generatePKCE();

        // Store state and verifier in cache (valid for 10 mins)
        await CacheManager.set(`x_auth_state:${state}`, { userId, verifier }, 600);

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: X_CLIENT_ID,
            redirect_uri: X_REDIRECT_URI,
            scope: 'tweet.read users.read follows.read offline.access',
            state,
            code_challenge: challenge,
            code_challenge_method: 'S256',
        });

        return `${this.AUTH_URL}?${params.toString()}`;
    }

    // Step 2: Exchange Code for Tokens
    static async exchangeCodeForTokens(code: string, verifier: string): Promise<XTokens> {
        if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
            throw new Error('X API credentials not configured');
        }

        const auth = Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64');

        const response = await axios.post(
            this.TOKEN_URL,
            new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                client_id: X_CLIENT_ID,
                redirect_uri: X_REDIRECT_URI,
                code_verifier: verifier,
            }),
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in,
        };
    }

    // Step 3: Refresh Access Token
    static async refreshAccessToken(refreshToken: string): Promise<XTokens> {
        if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
            throw new Error('X API credentials not configured');
        }

        const auth = Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64');

        const response = await axios.post(
            this.TOKEN_URL,
            new URLSearchParams({
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
                client_id: X_CLIENT_ID,
            }),
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in,
        };
    }
}

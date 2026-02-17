import { db } from '../db';
import { nftAchievements } from '@shared/schema';
import { eq, isNull } from 'drizzle-orm';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

const STX_NETWORK = process.env.STX_NETWORK!;
const API_URL = STX_NETWORK === 'mainnet' ? 'https://api.mainnet.hiro.so' : 'https://api.testnet.hiro.so';

export class TransactionMonitor {
    private static isRunning = false;
    private static interval: NodeJS.Timeout | null = null;

    static start(intervalMs: number = 30000) { // Default every 30 seconds
        if (this.isRunning) return;

        this.isRunning = true;
        console.log(`[TxMonitor] Starting transaction monitor (${STX_NETWORK})`);

        this.interval = setInterval(() => this.pollTransactions(), intervalMs);
        // Initial run
        this.pollTransactions();
    }

    static stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }

    private static async pollTransactions() {
        try {
            // Find NFTs that have a txId but no tokenId (pending confirmation)
            const pendingNfts = await db.select()
                .from(nftAchievements)
                .where(isNull(nftAchievements.tokenId)) // We use 0 or null for pending
                .execute();

            // Also check those where tokenId is 0 if we used 0 as placeholder
            const zeroTokenNfts = await db.select()
                .from(nftAchievements)
                .where(eq(nftAchievements.tokenId, 0))
                .execute();

            const allPending = [...pendingNfts, ...zeroTokenNfts];

            if (allPending.length === 0) return;

            console.log(`[TxMonitor] Checking status for ${allPending.length} pending transactions...`);

            for (const nft of allPending) {
                if (!nft.txId) continue;
                await this.checkTransactionStatus(nft);
            }
        } catch (error) {
            console.error('[TxMonitor] Error polling transactions:', error);
        }
    }

    private static async checkTransactionStatus(nft: any) {
        try {
            const response = await fetch(`${API_URL}/extended/v1/tx/${nft.txId}`);

            if (!response.ok) {
                console.error(`[TxMonitor] Failed to fetch tx ${nft.txId}: ${response.statusText}`);
                return;
            }

            const txData = await response.json();

            if (txData.tx_status === 'success') {
                console.log(`[TxMonitor] Transaction ${nft.txId} confirmed!`);

                // Extract token ID from events if possible
                // The achievement-nfts contract prints: {event: "nft-minted", token-id: ..., recipient: ..., type: ...}
                const mintedEvent = txData.events?.find((e: any) =>
                    e.event_type === 'smart_contract_log' &&
                    e.contract_log?.value?.data?.event?.value === 'nft-minted'
                );

                let finalTokenId = 0;
                if (mintedEvent) {
                    const tokenIdStr = mintedEvent.contract_log.value.data['token-id']?.value;
                    finalTokenId = parseInt(tokenIdStr, 10) || 0;
                }

                if (finalTokenId > 0) {
                    await db.update(nftAchievements)
                        .set({ tokenId: finalTokenId })
                        .where(eq(nftAchievements.id, nft.id))
                        .execute();
                    console.log(`[TxMonitor] Updated NFT ${nft.id} with token ID ${finalTokenId}`);
                } else {
                    // Fallback: If we can't parse events, it's still confirmed. 
                    // We might need to call a read-only function or just wait if we can't find it here.
                    console.warn(`[TxMonitor] Tx confirmed but couldn't find token-id in events for ${nft.txId}`);
                }
            } else if (txData.tx_status === 'abort') {
                console.error(`[TxMonitor] Transaction ${nft.txId} aborted: ${txData.error_code}`);
                // Optionally mark as failed in DB
            }
        } catch (error) {
            console.error(`[TxMonitor] Error checking status for ${nft.txId}:`, error);
        }
    }
}

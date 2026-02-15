import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    Cl,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

// Load environment variables
const STX_NETWORK = process.env.STX_NETWORK || 'testnet';
const STX_MINTER_KEY = process.env.STX_MINTER_KEY;
const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'achievement-nfts';

export class StacksService {
    private static getNetwork() {
        return STX_NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    }

    static async mintAchievementOnChain(recipientAddress: string, achievementTypeId: number): Promise<string> {
        if (!STX_MINTER_KEY) {
            throw new Error('STX_MINTER_KEY not configured');
        }

        const network = this.getNetwork();

        const txOptions = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'mint-achievement',
            functionArgs: [
                Cl.principal(recipientAddress),
                Cl.uint(achievementTypeId)
            ],
            senderKey: STX_MINTER_KEY,
            validateWithAbi: true,
            network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        try {
            const transaction = await makeContractCall(txOptions);
            const response = await broadcastTransaction({ transaction, network });

            if ('error' in response && response.error) {
                throw new Error(`Broadcast error: ${response.error} (Reason: ${(response as any).reason})`);
            }

            const txid = (response as any).txid || response;
            console.log(`Mint transaction broadcasted: ${txid}`);
            return typeof txid === 'string' ? txid : (txid as any).toString();
        } catch (error) {
            console.error('Error in Stacks mint transaction:', error);
            throw error;
        }
    }

    // Map achievement strings (bronze, etc) to contract uints
    static getAchievementTypeId(type: string): number {
        const mapping: Record<string, number> = {
            'bronze': 1,
            'silver': 2,
            'gold': 3,
            'platinum': 4,
            'verified': 5
        };
        return mapping[type] || 0;
    }
}

import { connect, disconnect, request, getLocalStorage } from '@stacks/connect';
import { Cl, cvToJSON, hexToCV } from '@stacks/transactions';

// Contract configuration - V4 DEPLOYMENT WITH sBTC POST-CONDITION FIX
export const CONTRACT_ADDRESS = 'ST374G41QS4FB1WG73RFS1MM9CCHF8DA73Q54QX7Z';
export const CONTRACT_NAME = 'escrow-v4';

// Real sBTC Token on Testnet - Official sBTC from Faucet
export const SBTC_CONTRACT_ADDRESS = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT';
export const SBTC_CONTRACT_NAME = 'sbtc-token';
// Asset name in the sBTC contract (usually 'sbtc' or 'sbtc-token')
export const SBTC_ASSET_NAME = 'sbtc-token';  // Change if needed based on actual token

// TESTNET CONFIG
const TESTNET_CONFIG = {
  url: 'https://api.testnet.hiro.so',
  chainId: 'testnet',
  network: 'testnet' as const,
};

// Connect wallet using @stacks/connect v8+ API
export async function connectWallet(onFinish: (address: string) => void, onCancel: () => void) {
  try {
    console.log('Attempting to connect wallet...');
    
    // Use the simple connect() method which handles everything automatically
    await connect();
    
    console.log('Wallet connected!');
    
    // Get address from localStorage where connect() stores it automatically
    const storage = getLocalStorage();
    const stxAddress = storage?.addresses?.stx?.[0]?.address;
    
    if (stxAddress) {
      localStorage.setItem('stx_wallet_address', stxAddress);
      onFinish(stxAddress);
    } else {
      console.error('No STX address found in storage:', storage);
      onCancel();
    }
  } catch (error: any) {
    console.error('Wallet connection failed:', error);
    
    // Check if user cancelled
    if (error?.code === 4001 || error?.code === -31001 || error?.message?.includes('cancel')) {
      console.log('User cancelled wallet connection');
    }
    
    onCancel();
  }
}

// Check if user is signed in
export function isSignedIn(): boolean {
  return !!localStorage.getItem('stx_wallet_address');
}

// Get current user address
export function getUserAddress(): string | null {
  return localStorage.getItem('stx_wallet_address');
}

// Convert STX to microstacks (1 STX = 1,000,000 microstacks)
const stxToMicrostacks = (stx: number): number => {
  return Math.floor(stx * 1_000_000);
};

// Create project on-chain with multi-token support (STX or sBTC)
// This creates the project in the contract and returns the project ID
// totalAmount will be divided equally among 4 milestones
// 
// IMPORTANT FOR sBTC: This is a TWO-STEP process!
// Step 1: Transfer sBTC to contract (separate transaction)
// Step 2: Call create-project-sbtc (this function)
export async function createEscrowOnChain(
  freelancerAddress: string,
  amountInStx: number,
  tokenType: 'STX' | 'sBTC',
  onFinish: (data: any) => void,
  onCancel: () => void
): Promise<void> {
  try {
    // Get user address for validation
    const userAddress = getUserAddress();
    if (!userAddress) {
      throw new Error('User address not found. Please connect wallet.');
    }
    
    // Validate addresses
    if (userAddress === freelancerAddress) {
      throw new Error('Client and freelancer cannot be the same address. Please use a different freelancer address.');
    }
    
    // Convert to micro-units (STX = 6 decimals, sBTC = 8 decimals)
    const decimals = tokenType === 'sBTC' ? 100_000_000 : 1_000_000;
    const totalMicroUnits = Math.floor(amountInStx * decimals);
    
    // Validate minimum amount
    const minAmount = tokenType === 'sBTC' ? 1000 : 10000; // 0.00001 sBTC or 0.01 STX
    if (totalMicroUnits < minAmount) {
      throw new Error(`Amount too small. Minimum is ${tokenType === 'sBTC' ? '0.00001 sBTC' : '0.01 STX'}.`);
    }
    
    // Divide into 4 equal parts (integer division)
    const milestoneAmount = Math.floor(totalMicroUnits / 4);
    const remainder = totalMicroUnits - (milestoneAmount * 4);
    const lastMilestoneAmount = milestoneAmount + remainder;
    
    console.log(`=== Creating ${tokenType} Project on Testnet ===`);
    console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log('Client:', userAddress);
    console.log('Freelancer:', freelancerAddress);
    console.log('Total Amount:', amountInStx, tokenType, `(${totalMicroUnits} micro-units)`);
    console.log('Milestone 1-3:', milestoneAmount, 'micro-units each');
    console.log('Milestone 4:', lastMilestoneAmount, 'micro-units (includes remainder)');
    
    // FOR sBTC: First transfer tokens to contract, then create project
    if (tokenType === 'sBTC') {
      console.log('=== Step 1: Transferring sBTC to contract ===');
      
      // Transfer sBTC to contract first
      const transferResponse = await request('stx_callContract', {
        contract: `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}`,
        functionName: 'transfer',
        functionArgs: [
          Cl.uint(totalMicroUnits),
          Cl.principal(userAddress),
          Cl.principal(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`),
          Cl.none()
        ],
        postConditions: [{
          type: 'ft-postcondition' as const,
          address: userAddress,
          condition: 'eq' as const,
          amount: totalMicroUnits.toString(),
          asset: `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}::${SBTC_CONTRACT_NAME}` as `${string}.${string}::${string}`,
        }],
        network: TESTNET_CONFIG.network,
      });
      
      console.log('✅ sBTC transferred to contract:', transferResponse.txid);
      console.log('⏳ Waiting for confirmation before creating project...');
      console.log('⚠️ Please confirm the next transaction to create the project');
      
      // Wait a bit for the transfer to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Choose function based on token type
    const functionName = tokenType === 'STX' ? 'create-project-stx' : 'create-project-sbtc';
    
    // Build function arguments
    const functionArgs: any[] = [
      Cl.principal(freelancerAddress),
      Cl.uint(milestoneAmount),
      Cl.uint(milestoneAmount),
      Cl.uint(milestoneAmount),
      Cl.uint(lastMilestoneAmount),
    ];
    
    // For sBTC, add the token contract principal
    if (tokenType === 'sBTC') {
      functionArgs.push(Cl.contractPrincipal(SBTC_CONTRACT_ADDRESS, SBTC_CONTRACT_NAME));
      console.log('=== Step 2: Creating sBTC project ===');
    }
    
    // Build post-conditions based on token type
    // For STX: User sends STX to contract
    // For sBTC: No post-condition needed (tokens already transferred)
    const postConditions = tokenType === 'STX' 
      ? [{
          type: 'stx-postcondition' as const,
          address: userAddress,
          condition: 'eq' as const,
          amount: totalMicroUnits.toString(),
        }]
      : []; // No post-conditions for sBTC create (already transferred)
    
    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName,
      functionArgs,
      postConditions,
      network: TESTNET_CONFIG.network,
    });
    
    console.log(`✅ ${tokenType} Project created successfully!`);
    console.log('Transaction ID:', response.txid);
    onFinish({ txId: response.txid, response, tokenType });
  } catch (error: any) {
    console.error('❌ Transaction failed:', error);
    console.error('❌ Error code:', error?.code);
    console.error('❌ Error message:', error?.message);
    
    // Enhanced error messages
    if (error?.message?.includes('same address')) {
      console.error('Error: You cannot be both client and freelancer');
    } else if (error?.code === 4001 || error?.code === -31001 || error?.message?.includes('cancel')) {
      console.log('User cancelled transaction');
    } else if (error?.message?.includes('insufficient funds')) {
      console.error(`Error: Not enough ${tokenType} in wallet`);
    } else if (error?.message?.includes('ERR-INSUFFICIENT_BALANCE')) {
      console.error('Error: sBTC transfer to contract failed or not confirmed yet');
    }
    
    onCancel();
  }
}

// NOTE: V2 Contract - fund-milestone function removed
// All funds are transferred when creating the project
// These functions are kept for backwards compatibility but won't work with v2
export async function fundMilestoneOnChain(
  projectId: number,
  milestoneNum: number,
  onFinish: (data: any) => void,
  onCancel: () => void
): Promise<void> {
  console.warn('fundMilestoneOnChain: This function is deprecated in v2. All funds are transferred during project creation.');
  onCancel();
}

// NOTE: V2 Contract - fund-milestone function removed
// This function is kept for backwards compatibility but won't work with v2
export async function fundEscrowOnChain(
  projectId: number,
  milestoneNum: number,
  onFinish: (data: any) => void,
  onCancel: () => void
): Promise<void> {
  console.warn('fundEscrowOnChain: This function is deprecated in v2. All funds are transferred during project creation.');
  onCancel();
}

// Simplified lock function for frontend - creates project with all funds
// V2: All funds transferred during project creation (4 equal milestones)
export async function lockStxOnChain(
  freelancerAddress: string,
  amountInStx: number,
  onFinish: (data: any) => void,
  onCancel: () => void
): Promise<void> {
  try {
    // Get user address for validation
    const userAddress = getUserAddress();
    if (!userAddress) {
      throw new Error('User address not found. Please connect wallet.');
    }
    
    // Validate addresses
    if (userAddress === freelancerAddress) {
      throw new Error('Client and freelancer cannot be the same address. Please use a different freelancer address.');
    }
    
    // Convert to microstacks first, then divide to avoid rounding issues
    const totalMicrostacks = stxToMicrostacks(amountInStx);
    
    // Validate minimum amount
    if (totalMicrostacks < 10000) {
      throw new Error('Amount too small. Minimum is 0.01 STX.');
    }
    
    // Divide into 4 equal parts (integer division with extra safety)
    const milestoneAmount = Math.floor(Math.floor(totalMicrostacks) / 4);
    
    // Calculate remainder to add to last milestone (ensures total matches exactly)
    const remainder = Math.floor(totalMicrostacks) - (milestoneAmount * 4);
    const lastMilestoneAmount = milestoneAmount + remainder;
    
    console.log('=== Locking STX on Testnet ===');
    console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log('Client:', userAddress);
    console.log('Freelancer:', freelancerAddress);
    console.log('Total Amount:', amountInStx, 'STX', `(${totalMicrostacks} microstacks)`);
    console.log('Milestone 1-3:', milestoneAmount, 'microstacks');
    console.log('Milestone 4:', lastMilestoneAmount, 'microstacks');
    
    // Create project with all funds transferred immediately
    const createResponse = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'create-project-stx',
      functionArgs: [
        Cl.principal(freelancerAddress),
        // 4 milestones - last one gets remainder
        Cl.uint(milestoneAmount),
        Cl.uint(milestoneAmount),
        Cl.uint(milestoneAmount),
        Cl.uint(lastMilestoneAmount),
      ],
      // Post-condition: User must transfer exact STX amount to contract
      postConditions: [
        {
          type: 'stx-postcondition',
          address: userAddress,
          condition: 'eq',
          amount: totalMicrostacks.toString(),
        }
      ],
      network: TESTNET_CONFIG.network,
    });
    
    console.log('✅ Funds locked successfully!');
    console.log('Transaction ID:', createResponse.txid);
    
    // Return the create response - all funds are now in contract
    onFinish(createResponse);
  } catch (error: any) {
    console.error('❌ Lock STX failed:', error);
    
    // Enhanced error messages
    if (error?.message?.includes('same address')) {
      console.error('Error: You cannot be both client and freelancer');
    } else if (error?.message?.includes('insufficient funds')) {
      console.error('Error: Not enough STX in wallet');
    } else {
      console.error('Error details:', error?.message || error);
    }
    
    onCancel();
  }
}

// Alias for sBTC (uses same STX contract for now)
export const lockSbtcOnChain = lockStxOnChain;

// Mark milestone as complete (freelancer marks delivery)
export async function markCompleteOnChain(
  projectId: number,
  milestoneNum: number,
  onFinish: (data: any) => void,
  onCancel: () => void
): Promise<void> {
  try {
    console.log('Marking milestone complete on-chain...');
    console.log('Project ID:', projectId);
    console.log('Milestone:', milestoneNum);
    
    const response = await request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName: 'complete-milestone',
      functionArgs: [
        Cl.uint(projectId),
        Cl.uint(milestoneNum)
      ],
      network: TESTNET_CONFIG.network,
    });
    
    console.log('Milestone marked complete on-chain:', response);
    onFinish(response);
  } catch (error: any) {
    console.error('Mark complete transaction failed:', error);
    onCancel();
  }
}

// Release milestone payment to freelancer (supports STX and sBTC)
// Client releases funds after confirming work completion
export async function releaseEscrowOnChain(
  projectId: number,
  milestoneNum: number,
  tokenType: 'STX' | 'sBTC',
  onFinish: (data: any) => void,
  onCancel: () => void,
  freelancerAddress?: string,
  milestoneAmount?: number
): Promise<void> {
  try {
    console.log(`Releasing ${tokenType} milestone payment on-chain...`);
    console.log('Project ID:', projectId);
    console.log('Milestone:', milestoneNum);
    console.log('Freelancer:', freelancerAddress);
    console.log('Milestone Amount (micro-units):', milestoneAmount);
    
    // Calculate fee (5%)
    const fee = milestoneAmount ? Math.floor((milestoneAmount * 500) / 10000) : 0;
    const payout = milestoneAmount ? milestoneAmount - fee : 0;
    
    console.log('Fee (5%):', fee);
    console.log('Payout to freelancer:', payout);
    
    // Choose function based on token type
    const functionName = tokenType === 'STX' ? 'release-milestone-stx' : 'release-milestone-sbtc';
    
    // Build function arguments
    const functionArgs: any[] = [
      Cl.uint(projectId),
      Cl.uint(milestoneNum)
    ];
    
    // For sBTC, add the token contract principal
    if (tokenType === 'sBTC') {
      functionArgs.push(Cl.contractPrincipal(SBTC_CONTRACT_ADDRESS, SBTC_CONTRACT_NAME));
    }
    
    const requestOptions: any = {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName,
      functionArgs,
      network: TESTNET_CONFIG.network,
    };
    
    // Add post-conditions if we have the amounts
    if (freelancerAddress && milestoneAmount && payout > 0) {
      if (tokenType === 'STX') {
        // STX post-condition: Contract sends STX
        requestOptions.postConditions = [
          {
            type: 'stx-postcondition' as const,
            address: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
            condition: 'gte' as const,
            amount: payout.toString(),
          }
        ];
      } else if (tokenType === 'sBTC') {
        // sBTC post-condition: Contract sends total (payout + fee) sBTC
        const totalAmount = payout + fee;
        requestOptions.postConditions = [
          {
            type: 'ft-postcondition' as const,
            address: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
            condition: 'eq' as const,
            amount: totalAmount.toString(),
            asset: `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}::${SBTC_ASSET_NAME}` as `${string}.${string}::${string}`,
          }
        ];
        console.log('sBTC post-condition - total transfer:', totalAmount, '(payout:', payout, '+ fee:', fee, ')');
        console.log('sBTC asset:', `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}::${SBTC_ASSET_NAME}`);
      }
    }
    
    const response = await request('stx_callContract', requestOptions);
    
    console.log(`${tokenType} payment released on-chain:`, response);
    onFinish(response);
  } catch (error: any) {
    console.error('Release payment transaction failed:', error);
    onCancel();
  }
}

// Backward compatibility aliases
export const releaseSbtcOnChain = (
  projectId: number,
  milestoneNum: number,
  onFinish: (data: any) => void,
  onCancel: () => void,
  freelancerAddress?: string,
  milestoneAmount?: number
) => releaseEscrowOnChain(projectId, milestoneNum, 'sBTC', onFinish, onCancel, freelancerAddress, milestoneAmount);

// Helper function to get current project count from contract (READ-ONLY - no wallet popup)
export async function getProjectCount(): Promise<number> {
  try {
    // Use Stacks API for read-only calls (no wallet popup needed)
    const response = await fetch(
      `${TESTNET_CONFIG.url}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-project-count`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: CONTRACT_ADDRESS,
          arguments: []
        })
      }
    );
    
    const data = await response.json();
    
    console.log('📊 Raw API response:', data);
    
    if (!data.okay) {
      console.error('Failed to get project count:', data);
      return 0;
    }
    
    // The result comes as a hex string representing a Clarity value
    const resultHex = data.result;
    console.log('📊 Result hex:', resultHex);
    
    // Parse the hex string to Clarity value, then to JSON
    const clarityValue = hexToCV(resultHex);
    const jsonValue = cvToJSON(clarityValue);
    
    console.log('📊 Clarity value:', clarityValue);
    console.log('📊 JSON value:', jsonValue);
    
    // Extract the actual number
    let count = 0;
    if (jsonValue.type === 'uint') {
      count = parseInt(jsonValue.value, 10);
    } else if (typeof jsonValue.value === 'string') {
      count = parseInt(jsonValue.value, 10);
    } else if (typeof jsonValue.value === 'number') {
      count = jsonValue.value;
    }
    
    // Validate the result
    if (!Number.isFinite(count) || count < 0 || count > 1000000) {
      console.error('❌ Invalid project count parsed:', count, 'from', jsonValue);
      return 0;
    }
    
    console.log('✅ Project count (read-only):', count);
    return count;
  } catch (error) {
    console.error('❌ Failed to get project count:', error);
    return 0;
  }
}

// Disconnect wallet
export function disconnectWallet() {
  disconnect();
  localStorage.removeItem('stx_wallet_address');
}

// Helper function to get contract balance
// Helper function to get contract balance (READ-ONLY - no wallet popup)
export async function getContractBalance(): Promise<any> {
  try {
    const response = await fetch(
      `${TESTNET_CONFIG.url}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-contract-balance-stx`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: CONTRACT_ADDRESS,
          arguments: []
        })
      }
    );
    
    const data = await response.json();
    return data.okay ? data.result : null;
  } catch (error) {
    console.error('Failed to get contract balance:', error);
    return null;
  }
}

// Helper function to verify contract exists and is accessible (READ-ONLY - no wallet popup)
export async function verifyContractDeployment(): Promise<boolean> {
  try {
    console.log('Verifying contract deployment...');
    console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    
    const response = await fetch(
      `${TESTNET_CONFIG.url}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-project-count`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: CONTRACT_ADDRESS,
          arguments: []
        })
      }
    );
    
    const data = await response.json();
    
    if (data.okay) {
      console.log('Contract verified! Project count:', data.result);
      return true;
    }
    
    console.error('Contract verification failed:', data);
    return false;
  } catch (error: any) {
    console.error('Contract verification failed:', error);
    return false;
  }
}

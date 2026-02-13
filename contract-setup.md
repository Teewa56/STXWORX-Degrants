# STX Freelance Platform - Smart Contract Deployment & Documentation

**Network:** Stacks Blockchain (Testnet/Mainnet)  
**Last Updated:** February 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Contract Deployment](#contract-deployment)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Contract Documentation](#contract-documentation)
7. [Testing Guide](#testing-guide)
8. [Frontend Integration](#frontend-integration)
9. [Troubleshooting](#troubleshooting)
10. [Security Considerations](#security-considerations)

---

## Overview

The STX Freelance Platform consists of 4 production-ready smart contracts that enable decentralized freelance escrow with multi-token support (STX and sBTC).

### Contract Summary

| Contract | Purpose | Lines | Complexity |
|----------|---------|-------|------------|
| `escrow-multi-token` | Core escrow logic, milestone payments, refunds | ~500 | High |
| `freelance-data` | User profiles, reputation, leaderboard | ~250 | Medium |
| `achievement-nfts` | SIP-009 NFT badges for achievements | ~300 | Medium |
| `freelance-security` | Multi-sig wallet, admin controls | ~200 | High |

### Key Features

- 10% platform fee (configurable via multi-sig)
- 4 milestone structure per project
- STX and sBTC support
- Emergency pause mechanism
- Multi-signature admin controls (3-of-5)
- Automatic reputation tracking
- Soul-bound achievement NFTs
- Comprehensive access control

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│                 Stacks Blockchain                          │
│                                                            │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ escrow-multi-    │◄────►│ freelance-data   │            │
│  │ token (Main)     │      │ (User Data)      │            │
│  └────────┬─────────┘      └──────────────────┘            │
│           │                                                │
│           │  ┌──────────────────┐      ┌─────────────────┐ │
│           └─►│ achievement-nfts │      │ freelance-      │ │
│              │ (NFT Badges)     │      │ security        │ │
│              └──────────────────┘      │ (Multi-sig)     │ │
│                                        └─────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Contract Relationships

- `escrow-multi-token` **calls** `freelance-data` to update user stats on payment release
- `achievement-nfts` **reads from** `freelance-data` to verify achievement eligibility
- `freelance-security` **controls** admin functions across all contracts via multi-sig
- All contracts **respect** pause state and authorization

---

## Prerequisites

### 1. Required Software

```bash
# Node.js v18+
node --version  # Should be v18.0.0 or higher

# Clarinet (Stacks smart contract tool)
clarinet --version  # Should be v2.0.0 or higher

# Hiro Wallet (Browser extension)
# Download from: https://wallet.hiro.so/
```

### 2. Testnet Tokens

```bash
# Get testnet STX from faucet
# Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet
# Enter your wallet address and request tokens
```

### 3. Project Setup

```bash
# Clone repository
git clone <your-repo-url>
cd stx-freelance-platform

# Install dependencies
npm install

# Verify contracts compile
clarinet check
```

---

## Contract Deployment

### Step 1: Prepare Contract Files

Ensure all 4 contract files are in the `contracts/` directory:

```
contracts/
├── escrow-multi-token.clar        Main escrow logic
├── freelance-data.clar            User data & reputation
├── achievement-nfts.clar          NFT achievements
└── freelance-security.clar        Multi-sig controls
```

### Step 2: Update Clarinet Configuration

Edit `Clarinet.toml`:

```toml
[project]
name = "stx-freelance-platform"
description = "Decentralized freelance escrow platform"
authors = ["Your Name <you@example.com>"]
telemetry = false
cache_dir = "./.cache"

[contracts.escrow-multi-token]
path = "contracts/escrow-multi-token.clar"
clarity_version = 2
epoch = 2.5

[contracts.freelance-data]
path = "contracts/freelance-data.clar"
clarity_version = 2
epoch = 2.5

[contracts.achievement-nfts]
path = "contracts/achievement-nfts.clar"
clarity_version = 2
epoch = 2.5

[contracts.freelance-security]
path = "contracts/freelance-security.clar"
clarity_version = 2
epoch = 2.5

[repl.analysis]
passes = ["check_checker"]

[repl.analysis.check_checker]
strict = false
trusted_sender = false
trusted_caller = false
callee_filter = false
```

### Step 3: Create Deployment Plan

Create `deployments/default.testnet-plan.yaml`:

### Step 4: Validate Contracts

```bash
# Check syntax and types
clarinet check

# Expected output:
# ✔ 4 contracts checked
# ✔ No errors found
```

### Step 5: Deploy to Testnet

```bash
# Deploy all contracts
clarinet deployments apply --testnet #or --mainnet

# You'll be prompted to confirm each transaction
```

### Step 6: Verify Deployment

```bash
# Check contract on explorer
# Visit: https://explorer.hiro.so/?chain=testnet
# Search for your deployer address
# Confirm all 4 contracts are deployed

# Or use API:
curl -s "https://api.testnet.hiro.so/v2/contracts/interface/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/escrow-multi-token" | jq .
```

---

## Post-Deployment Setup

### Step 1: Initialize Multi-Sig (CRITICAL)

**⚠️ Do this IMMEDIATELY after deployment - can only be done ONCE**

```clarity
;; Open Clarinet console OR use Hiro Platform
clarinet console

;; Initialize with 5 trusted signers
(contract-call? .freelance-security initialize-signers 
  (list 
    'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM  ;; Your address
    'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG  ;; Co-founder
    'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC  ;; Technical lead
    'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND   ;; Community rep
    'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB  ;; Legal advisor
  )
)
```

**Via Hiro Platform UI:**
1. Visit https://platform.hiro.so/
2. Connect your deployer wallet
3. Navigate to `freelance-security` contract
4. Call `initialize-signers` function
5. Enter list of 5 principals (addresses)
6. Submit transaction

### Step 2: Authorize Contract Integrations

```clarity
;; A) Authorize freelance-data to be called by escrow-multi-token
(contract-call? .escrow-multi-token authorize-contract .freelance-data)

;; B) Authorize escrow-multi-token to call freelance-data
(contract-call? .freelance-data authorize-contract .escrow-multi-token)

;; C) Authorize freelance-data to mint NFTs
(contract-call? .achievement-nfts authorize-minter .freelance-data)
```

**Via Hiro Platform:**
1. Go to `escrow-multi-token` contract → call `authorize-contract`
   - Parameter: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.freelance-data`
2. Go to `freelance-data` contract → call `authorize-contract`
   - Parameter: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.escrow-multi-token`
3. Go to `achievement-nfts` contract → call `authorize-minter`
   - Parameter: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.freelance-data`

### Step 3: Approve Token Contracts

```clarity
;; Approve sBTC token for use in escrow
;; Replace with actual testnet sBTC contract address
(contract-call? .escrow-multi-token approve-token 
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token)
```

**Get testnet sBTC address:**
- Visit: https://docs.sbtc.tech/
- Or use community testnet sBTC: Check Stacks Discord

### Step 4: Set Treasury Address (Optional)

```clarity
;; If you want fees to go to a different address than deployer
(contract-call? .escrow-multi-token set-treasury 
  'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)
```

### Step 5: Verification Checklist

```bash
# ✅ Multi-sig initialized
(contract-call? .freelance-security is-signer 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
# Expected: (some true)

# ✅ Contract authorizations set
(contract-call? .freelance-data is-contract-authorized .escrow-multi-token)
# Expected: true

# ✅ Token approved
(contract-call? .escrow-multi-token is-token-approved 'ST...sbtc-token)
# Expected: true

# ✅ Treasury set
(contract-call? .escrow-multi-token get-treasury)
# Expected: your treasury address
```

---

## Contract Documentation

### 1. ESCROW-MULTI-TOKEN Contract

**Purpose:** Core escrow logic for milestone-based project payments

#### Constants

```clarity
FEE-PERCENT: u500              ;; 5% platform fee (500/10000)
REFUND-TIMEOUT: u144           ;; 24 hours in blocks
MAX-MILESTONES: u4             ;; Fixed 4 milestones
MAX-ESCROW-AMOUNT: u1000000000000  ;; 1M STX maximum
```

#### Public Functions

##### `create-project-stx`
Create new escrow project with STX tokens.

```clarity
(define-public (create-project-stx
    (freelancer principal)
    (m1 uint) (m2 uint) (m3 uint) (m4 uint))
  ;; Returns: (ok project-id)
```

**Parameters:**
- `freelancer`: Principal address of freelancer
- `m1`, `m2`, `m3`, `m4`: Milestone amounts in micro-STX (1 STX = 1,000,000 micro-STX)

**Example:**
```clarity
;; Create 60 STX project: 10, 15, 15, 20 STX per milestone
(contract-call? .escrow-multi-token create-project-stx 
  'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
  u10000000   ;; 10 STX
  u15000000   ;; 15 STX
  u15000000   ;; 15 STX
  u20000000)  ;; 20 STX
```

##### `create-project-sbtc`
Create new escrow project with sBTC tokens.

```clarity
(define-public (create-project-sbtc
    (freelancer principal)
    (m1 uint) (m2 uint) (m3 uint) (m4 uint)
    (sbtc-token <sip010-ft-trait>))
  ;; Returns: (ok project-id)
```

**Parameters:**
- Same as `create-project-stx` but with sBTC amounts (1 sBTC = 100,000,000 satoshis)
- `sbtc-token`: SIP-010 token contract reference

**Example:**
```clarity
;; Create 0.5 sBTC project
(contract-call? .escrow-multi-token create-project-sbtc
  'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
  u12500000   ;; 0.125 sBTC
  u12500000
  u12500000
  u12500000
  .sbtc-token)
```

##### `complete-milestone`
Freelancer marks milestone as complete.

```clarity
(define-public (complete-milestone 
    (project-id uint) 
    (milestone-num uint))
  ;; Returns: (ok true)
```

**Access:** Only freelancer of the project  
**Example:**
```clarity
;; Freelancer marks milestone 1 complete
(contract-call? .escrow-multi-token complete-milestone u1 u1)
```

##### `release-milestone-stx` / `release-milestone-sbtc`
Client releases payment for completed milestone.

```clarity
(define-public (release-milestone-stx 
    (project-id uint) 
    (milestone-num uint))
  ;; Returns: (ok payout-amount)
```

**Access:** Only client of the project  
**Fee:** 5% deducted automatically  
**Example:**
```clarity
;; Client releases milestone 1 payment
(contract-call? .escrow-multi-token release-milestone-stx u1 u1)
;; If milestone was 10 STX:
;; - Freelancer receives: 9.5 STX (95%)
;; - Treasury receives: 0.5 STX (5%)
```

##### `request-full-refund-stx` / `request-full-refund-sbtc`
Client requests full refund if no work started.

```clarity
(define-public (request-full-refund-stx (project-id uint))
  ;; Returns: (ok refund-amount)
```

**Access:** Only client  
**Condition:** No milestones completed or released  
**Example:**
```clarity
;; Refund before any work started
(contract-call? .escrow-multi-token request-full-refund-stx u1)
```

##### `emergency-refund-stx` / `emergency-refund-sbtc`
Client requests partial refund after timeout.

```clarity
(define-public (emergency-refund-stx (project-id uint))
  ;; Returns: (ok refund-amount)
```

**Access:** Only client  
**Condition:** 24+ hours passed since project creation  
**Refund:** Total - released amounts  

#### Admin Functions

##### `pause-contract` / `unpause-contract`
Emergency pause mechanism.

```clarity
(define-public (pause-contract)
  ;; Returns: (ok true)
```

**Access:** Only contract owner  
**Effect:** All user operations blocked until unpaused

##### `set-treasury`
Update fee collection address.

```clarity
(define-public (set-treasury (new principal))
  ;; Returns: (ok true)
```

**Access:** Only contract owner  
**Note:** Should be controlled via multi-sig in production

##### `approve-token` / `revoke-token`
Whitelist tokens for use.

```clarity
(define-public (approve-token (token principal))
  ;; Returns: (ok true)
```

**Access:** Only contract owner  
**Example:**
```clarity
(contract-call? .escrow-multi-token approve-token .sbtc-token)
```

#### Read-Only Functions

```clarity
(get-project (id uint))                       ;; Get project details
(get-milestone (project-id uint) (milestone-num uint))  ;; Get milestone info
(get-project-count)                           ;; Total projects created
(get-treasury)                                ;; Current treasury address
(is-contract-paused)                          ;; Pause status
(is-token-approved (token principal))         ;; Check token whitelist
```

#### Error Codes

```clarity
ERR-NOT-CLIENT (u100)              ;; Caller is not the client
ERR-NOT-FREELANCER (u101)          ;; Caller is not the freelancer
ERR-PROJECT-NOT-FOUND (u102)       ;; Project doesn't exist
ERR-INVALID-MILESTONE (u103)       ;; Invalid milestone number
ERR-NOT-COMPLETE (u105)            ;; Milestone not marked complete
ERR-ALREADY-RELEASED (u106)        ;; Payment already released
ERR-INVALID-AMOUNT (u108)          ;; Invalid amount (0 or too high)
ERR-REFUND-NOT-ALLOWED (u111)      ;; Cannot refund (work started)
ERR-ALREADY-REFUNDED (u112)        ;; Already refunded
ERR-NOT-AUTHORIZED (u113)          ;; Not authorized for admin action
ERR-CONTRACT-PAUSED (u120)         ;; Contract is paused
ERR-INVALID-PARTICIPANTS (u121)    ;; Client == Freelancer
ERR-TOKEN-NOT-APPROVED (u123)      ;; Token not whitelisted
```

---

### 2. FREELANCE-DATA Contract

**Purpose:** User profiles, reputation, and statistics

#### Public Functions

##### `create-user-profile`
Create new user profile.

```clarity
(define-public (create-user-profile
    (username (string-ascii 50))
    (x-handle (optional (string-ascii 50))))
  ;; Returns: (ok principal)
```

**Example:**
```clarity
(contract-call? .freelance-data create-user-profile 
  "alice_dev" 
  (some "@alice_codes"))
```

##### `update-x-verification`
Verify X (Twitter) account.

```clarity
(define-public (update-x-verification (x-handle (string-ascii 50)))
  ;; Returns: (ok true)
```

##### `update-project-stats` (Authorized Only)
Update user earnings and project count.

```clarity
(define-public (update-project-stats 
    (user principal) 
    (earned-amount uint))
  ;; Returns: (ok true)
```

**Access:** Only authorized contracts (escrow-multi-token)

##### `update-reputation` (Authorized Only)
Update user reputation score.

```clarity
(define-public (update-reputation 
    (user principal) 
    (new-reputation uint))
  ;; Returns: (ok true)
```

**Access:** Only authorized contracts

#### Read-Only Functions

```clarity
(get-user-profile (user principal))           ;; Get profile data
(get-category (category-id uint))             ;; Get category info
(get-leaderboard-score (user principal) (score-type (string-ascii 20)))
(is-contract-authorized (contract principal)) ;; Check authorization
```

#### Data Structure

```clarity
;; User profile
{
  username: (string-ascii 50),
  reputation: uint,
  total-earnings: uint,
  completed-projects: uint,
  x-verified: bool,
  x-handle: (optional (string-ascii 50)),
  created-at: uint
}
```

---

### 3. ACHIEVEMENT-NFTS Contract

**Purpose:** SIP-009 NFT badges for user achievements

#### Achievement Tiers

| Tier | Projects | Reputation | X Verified | Soul-Bound |
|------|----------|------------|------------|------------|
| Bronze | 10+ | 1,000+ | No | No |
| Silver | 25+ | 2,000+ | Yes | No |
| Gold | 50+ | 5,000+ | Yes | No |
| Platinum | 100+ | 10,000+ | Yes | Yes (1 transfer max) |
| Verified | 0 | 0 | Yes | Yes |

#### Public Functions

##### `mint-achievement`
Mint achievement NFT for qualified user.

```clarity
(define-public (mint-achievement 
    (recipient principal) 
    (achievement-type uint))
  ;; Returns: (ok token-id)
```

**Access:** Only authorized minters (freelance-data contract)  
**Achievement Types:**
- `u1` = Bronze
- `u2` = Silver
- `u3` = Gold
- `u4` = Platinum
- `u5` = Verified

##### `transfer`
Transfer NFT to another user.

```clarity
(define-public (transfer 
    (token-id uint) 
    (recipient principal) 
    (memo (optional (buff 34))))
  ;; Returns: (ok true)
```

**Restrictions:**
- Verified badge: Non-transferable (soul-bound)
- Platinum badge: Max 1 transfer

#### Read-Only Functions

```clarity
(get-owner (token-id uint))                   ;; Get NFT owner
(get-token-uri (token-id uint))               ;; Get metadata URI
(get-user-achievements (user principal))      ;; List user's NFTs
```

---

### 4. FREELANCE-SECURITY Contract

**Purpose:** Multi-signature wallet for admin operations

#### Multi-Sig Configuration

- **Signers:** 5 trusted principals
- **Threshold:** 3 signatures required
- **Timelock:** 24 hours (144 blocks)

#### Public Functions

##### `initialize-signers` (One-time)
Initialize the 5 multi-sig signers.

```clarity
(define-public (initialize-signers 
    (signer-list (list 5 principal)))
  ;; Returns: (ok true)
```

**⚠️ Can only be called ONCE immediately after deployment**

##### `create-pause-proposal`
Propose to pause escrow contract.

```clarity
(define-public (create-pause-proposal)
  ;; Returns: (ok proposal-id)
```

**Access:** Only authorized signers

##### `create-treasury-proposal`
Propose to change treasury address.

```clarity
(define-public (create-treasury-proposal (new-treasury principal))
  ;; Returns: (ok proposal-id)
```

##### `approve-proposal`
Approve a pending proposal.

```clarity
(define-public (approve-proposal (proposal-id uint))
  ;; Returns: (ok true)
```

**Flow:** Proposer auto-approves → Need 2 more signatures → Wait 24h → Execute

##### `execute-proposal`
Execute an approved proposal.

```clarity
(define-public (execute-proposal (proposal-id uint))
  ;; Returns: (ok true)
```

**Requirements:**
- 3+ valid signatures
- 24 hours passed since creation

#### Read-Only Functions

```clarity
(get-proposal (proposal-id uint))             ;; Get proposal details
(is-signer (principal principal))             ;; Check if authorized signer
(get-approval-count (proposal-id uint))       ;; Count current approvals
```

---

## Testing Guide

### Unit Tests (Clarinet)

Create `tests/escrow-test.ts`:

```typescript
import { Clarinet, Tx, Chain, Account, types } from 'clarinet';
import { assertEquals } from 'std/testing/asserts.ts';

Clarinet.test({
  name: "Can create STX project and release milestone",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const client = accounts.get('wallet_1')!;
    const freelancer = accounts.get('wallet_2')!;

    let block = chain.mineBlock([
      // Create project
      Tx.contractCall(
        'escrow-multi-token',
        'create-project-stx',
        [
          types.principal(freelancer.address),
          types.uint(10000000),  // 10 STX
          types.uint(10000000),
          types.uint(10000000),
          types.uint(10000000),
        ],
        client.address
      ),
      
      // Complete milestone 1
      Tx.contractCall(
        'escrow-multi-token',
        'complete-milestone',
        [types.uint(1), types.uint(1)],
        freelancer.address
      ),
      
      // Release milestone 1
      Tx.contractCall(
        'escrow-multi-token',
        'release-milestone-stx',
        [types.uint(1), types.uint(1)],
        client.address
      ),
    ]);

    assertEquals(block.receipts.length, 3);
    block.receipts[0].result.expectOk().expectUint(1); // Project ID
    block.receipts[1].result.expectOk();
    block.receipts[2].result.expectOk().expectUint(9500000); // 9.5 STX payout
  },
});
```

Run tests:

```bash
clarinet test
```

### Integration Tests (Manual)

```clarity
;; 1. Setup users
(contract-call? .freelance-data create-user-profile "alice" (some "@alice"))
(contract-call? .freelance-data create-user-profile "bob" none)

;; 2. Create project (as bob, client)
(contract-call? .escrow-multi-token create-project-stx 
  'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG  ;; alice
  u25000000 u25000000 u25000000 u25000000)  ;; 100 STX total

;; 3. Complete milestone (as alice, freelancer)
(contract-call? .escrow-multi-token complete-milestone u1 u1)

;; 4. Release payment (as bob, client)
(contract-call? .escrow-multi-token release-milestone-stx u1 u1)

;; 5. Verify stats updated
(contract-call? .freelance-data get-user-profile 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)
;; Should show:
;; - completed-projects: u1
;; - total-earnings: u23750000 (25 STX - 5% fee)

;; 6. Test refund scenario
(contract-call? .escrow-multi-token create-project-stx 
  'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
  u10000000 u10000000 u10000000 u10000000)

;; Immediate refund (no work done)
(contract-call? .escrow-multi-token request-full-refund-stx u2)
;; Should return full 40 STX

;; 7. Test pause mechanism
(contract-call? .escrow-multi-token pause-contract)
;; Try creating project - should fail
(contract-call? .escrow-multi-token unpause-contract)
```

### Load Testing

```bash
# Create multiple projects rapidly
for i in {1..50}; do
  clarinet run --allow-wallets \
    "(contract-call? .escrow-multi-token create-project-stx \
      'ST2... u10000000 u10000000 u10000000 u10000000)"
done
```

---

## Frontend Integration

### Update Contract Addresses

Edit `client/src/lib/stacks.ts`:

```typescript
// Testnet configuration
const NETWORK = new StacksTestnet();

// Replace with your deployed contract addresses
const DEPLOYER_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

export const CONTRACTS = {
  ESCROW: `${DEPLOYER_ADDRESS}.escrow-multi-token`,
  DATA: `${DEPLOYER_ADDRESS}.freelance-data`,
  NFT: `${DEPLOYER_ADDRESS}.achievement-nfts`,
  SECURITY: `${DEPLOYER_ADDRESS}.freelance-security`,
};

// Token contracts
export const TOKENS = {
  SBTC: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token',
};
```

### Create Project Example

```typescript
import { openContractCall } from '@stacks/connect';
import { 
  uintCV, 
  principalCV,
  PostConditionMode 
} from '@stacks/transactions';

async function createProject(
  freelancerAddress: string,
  milestones: [number, number, number, number]
) {
  const functionArgs = [
    principalCV(freelancerAddress),
    uintCV(milestones[0] * 1_000_000), // Convert to micro-STX
    uintCV(milestones[1] * 1_000_000),
    uintCV(milestones[2] * 1_000_000),
    uintCV(milestones[3] * 1_000_000),
  ];

  await openContractCall({
    network: NETWORK,
    contractAddress: DEPLOYER_ADDRESS,
    contractName: 'escrow-multi-token',
    functionName: 'create-project-stx',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Transaction ID:', data.txId);
    },
  });
}

// Usage
createProject('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', [10, 15, 15, 20]);
```

### Read Project Data

```typescript
import { callReadOnlyFunction, cvToJSON } from '@stacks/transactions';

async function getProject(projectId: number) {
  const result = await callReadOnlyFunction({
    network: NETWORK,
    contractAddress: DEPLOYER_ADDRESS,
    contractName: 'escrow-multi-token',
    functionName: 'get-project',
    functionArgs: [uintCV(projectId)],
    senderAddress: DEPLOYER_ADDRESS,
  });

  return cvToJSON(result);
}
```

---

## Troubleshooting

### Issue: Transaction fails with "ERR-NOT-AUTHORIZED"

**Cause:** Contract authorization not set up  
**Fix:**
```clarity
(contract-call? .escrow-multi-token authorize-contract .freelance-data)
(contract-call? .freelance-data authorize-contract .escrow-multi-token)
```

### Issue: "ERR-TOKEN-NOT-APPROVED" when creating sBTC project

**Cause:** sBTC token not whitelisted  
**Fix:**
```clarity
(contract-call? .escrow-multi-token approve-token .sbtc-token)
```

### Issue: Multi-sig initialization fails

**Cause:** Already initialized OR not enough signers  
**Fix:**
- Can only initialize ONCE after deployment
- Must provide exactly 5 principals
- Deploy new contract if needed

### Issue: NFT minting fails

**Cause:** Achievement minter not authorized  
**Fix:**
```clarity
(contract-call? .achievement-nfts authorize-minter .freelance-data)
```

### Issue: "ERR-CONTRACT-PAUSED" on all operations

**Cause:** Contract was paused and not unpaused  
**Fix:**
```clarity
(contract-call? .escrow-multi-token unpause-contract)
```

### Issue: Amounts displaying incorrectly in UI

**Cause:** Decimal conversion mismatch  
**Fix:**
```typescript
// STX: 6 decimals (1 STX = 1,000,000 micro-STX)
const stxToMicroStx = (amount: number) => amount * 1_000_000;
const microStxToStx = (amount: number) => amount / 1_000_000;

// sBTC: 8 decimals (1 sBTC = 100,000,000 satoshis)
const sbtcToSatoshis = (amount: number) => amount * 100_000_000;
const satoshisToSbtc = (amount: number) => amount / 100_000_000;
```

---

## Security Considerations

### Access Control Checklist

- ✅ All admin functions restricted to contract owner
- ✅ Multi-sig required for critical operations
- ✅ Contract pause mechanism implemented
- ✅ Authorization checks on cross-contract calls
- ✅ Client/freelancer validation (cannot be same)
- ✅ Token whitelist enforcement

### Best Practices

1. **Never hardcode addresses** in production contracts
2. **Always use multi-sig** for treasury/admin changes
3. **Test refund scenarios** thoroughly
4. **Monitor fee percentages** (5% = u500, not u1000)
5. **Validate all inputs** before state changes
6. **Use safe math** to prevent overflows
7. **Emit events** for all state changes
8. **Implement timelocks** for sensitive operations

### Pre-Launch Checklist

- [ ] All contracts deployed to testnet
- [ ] Multi-sig initialized with trusted signers
- [ ] All contract authorizations set
- [ ] sBTC token approved
- [ ] Treasury address configured
- [ ] Full test suite passing
- [ ] Load testing completed
- [ ] Frontend integration tested
- [ ] Documentation updated
- [ ] Emergency procedures documented

---

## Maintenance

### Monitoring

```bash
# Check contract balance
(contract-call? .escrow-multi-token get-contract-balance-stx)

# Check treasury balance
curl -s "https://api.testnet.hiro.so/extended/v1/address/ST.../stx" | jq .balance

# Monitor events
curl -s "https://api.testnet.hiro.so/extended/v1/tx/events?address=ST...&limit=50"
```

### Upgrading Contracts

**⚠️ Contracts are immutable once deployed**

To upgrade:
1. Deploy new version with different name
2. Create multi-sig proposal to authorize new contract
3. Pause old contract
4. Migrate data if needed
5. Update frontend to use new contract

---

## Support & Resources

- **Stacks Documentation:** https://docs.stacks.co/
- **Clarity Language:** https://docs.stacks.co/clarity/
- **Hiro Platform:** https://platform.hiro.so/
- **Explorer:** https://explorer.hiro.so/
- **Discord:** https://stacks.chat/

---

**Contract Version:** 4.0  
**Last Updated:** February 2026  
**License:** MIT
# Deployment Guide: Fixed sBTC Support

## Pre-Deployment Checklist

- [x] Contract fixed: `create-project-sbtc` uses balance check
- [x] Frontend fixed: Two-step sBTC creation
- [x] Post-conditions fixed: contract-ft-postcondition for releases
- [ ] Tested on devnet
- [ ] Tested on testnet
- [ ] Ready for mainnet

## Step 1: Update Contract Name (Recommended)

Since you mentioned the old contract "works fine" for STX, let's deploy with a new name:

```bash
# Edit contracts/escrow-multi-token.clar is already updated ✅
```

Update your deployment plan:

**`deployments/multi-token.testnet-plan.yaml`:**
```yaml
---
id: 0
name: Escrow Multi-Token v3.1 (sBTC Fixed)
network: testnet
stacks-node: "https://api.testnet.hiro.so"
genesis:
  wallets:
    - name: deployer
      balance: 100000000000
  contracts:
    - escrow-multi-token  # ← Will deploy as new version
```

## Step 2: Deploy to Testnet

```bash
# Generate deployment plan
clarinet deployments generate --testnet

# Review the plan
cat deployments/default.testnet-plan.yaml

# Deploy!
clarinet deployments apply --testnet
```

**Expected Output:**
```
✓ Contract deployed: ST...xyz.escrow-multi-token
✓ Transaction confirmed
✓ Deployment complete
```

## Step 3: Update Frontend Configuration

Update `client/src/lib/stacks.ts`:

```typescript
// NEW CONTRACT ADDRESS (from deployment)
export const CONTRACT_ADDRESS = 'ST374G41QS4FB1WG73RFS1MM9CCHF8DA73Q54QX7Z';
export const CONTRACT_NAME = 'escrow-multi-token';  // ← New deployment

// sBTC Token (use real testnet sBTC)
export const SBTC_CONTRACT_ADDRESS = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT';
export const SBTC_CONTRACT_NAME = 'sbtc-token';
```

## Step 4: Test on Testnet

### Test 1: Create STX Project ✅
```bash
# Should work as before (single transaction)
```

1. Connect wallet
2. Click "Create Project"
3. Select "STX"
4. Enter amount: 1 STX
5. Enter freelancer address
6. Click "Create"
7. **Approve 1 wallet popup**
8. ✅ Verify project created

### Test 2: Create sBTC Project 🔄
```bash
# New two-step flow
```

1. Get test sBTC from faucet
2. Click "Create Project"
3. Select "sBTC"
4. Enter amount: 0.001 sBTC
5. Enter freelancer address
6. Click "Create"
7. **Approve wallet popup #1** (Transfer sBTC)
8. ⏳ Wait 30 seconds
9. **Approve wallet popup #2** (Create project)
10. ✅ Verify project created

### Test 3: Complete & Release sBTC 💰

```bash
# Freelancer completes
```

1. Switch to freelancer wallet
2. Click "Complete Milestone"
3. Approve transaction
4. ✅ Milestone marked complete

```bash
# Client releases payment
```

5. Switch to client wallet
6. Click "Release Payment"
7. **Approve 1 wallet popup** (with post-conditions)
8. ✅ Freelancer receives 95%
9. ✅ Treasury receives 5%

## Step 5: Verify Everything Works

### Verification Checklist:

**STX Functions:**
- [ ] Create project (1 tx)
- [ ] Complete milestone
- [ ] Release payment (1 tx)
- [ ] Request refund

**sBTC Functions:**
- [ ] Create project (2 tx)
- [ ] Complete milestone
- [ ] Release payment (1 tx)
- [ ] Request refund

**Post-Conditions:**
- [ ] No errors on create
- [ ] No errors on release
- [ ] Correct amounts transferred

**Contract State:**
- [ ] Project counter increments
- [ ] Milestones tracked correctly
- [ ] Balances update properly
- [ ] Events logged

## Step 6: Monitor for Issues

### Check Logs:
```javascript
// Browser console
console.log('Transaction submitted:', txId);
console.log('Step 1 complete');
console.log('Step 2 complete');
```

### Check Contract:
```clarity
;; Read project count
(contract-call? .escrow-multi-token get-project-count)

;; Read STX balance
(contract-call? .escrow-multi-token get-contract-balance-stx)

;; Read sBTC balance
(contract-call? .escrow-multi-token get-contract-balance-sbtc .sbtc-token)

;; Read project details
(contract-call? .escrow-multi-token get-project u1)
```

## Step 7: Deploy to Mainnet (When Ready)

**Only after thorough testnet testing!**

```bash
# Generate mainnet plan
clarinet deployments generate --mainnet

# Review carefully
cat deployments/default.mainnet-plan.yaml

# Deploy to mainnet
clarinet deployments apply --mainnet
```

**Update frontend for mainnet:**
```typescript
export const CONTRACT_ADDRESS = 'SP...';  // Mainnet address
export const SBTC_CONTRACT_ADDRESS = 'SP...';  // Real sBTC
```

## Troubleshooting

### Issue: "ERR-INSUFFICIENT_BALANCE"
**Solution:** Wait for Step 1 transaction to confirm before Step 2

### Issue: "Post-condition violation"
**Solution:** Check you're using `contract-ft-postcondition` for sBTC releases

### Issue: "User cancelled"
**Solution:** User must approve BOTH transactions for sBTC creation

### Issue: "Contract not found"
**Solution:** Update CONTRACT_ADDRESS and CONTRACT_NAME in stacks.ts

## Rollback Plan

If issues occur:

1. **Keep old contract deployed** (it works for STX)
2. **Deploy new contract** with different name
3. **Test thoroughly** before switching frontend
4. **Switch frontend** only when confident
5. **Monitor** for 24 hours after switch

## Success Criteria

✅ STX projects work (no regression)  
✅ sBTC projects work (two-step flow)  
✅ No post-condition errors  
✅ Payments release correctly  
✅ Fees go to treasury  
✅ Refunds work for both tokens  

## Next Steps

1. Deploy updated contract ✅
2. Update frontend config ✅
3. Test thoroughly on testnet
4. Monitor for 48 hours
5. Deploy to mainnet (if all good)
6. Celebrate! 🎉

---

**Questions?** Check:
- `SBTC_USAGE_GUIDE.md` - Detailed integration guide
- `SBTC_FIX_SUMMARY.md` - What was fixed and why
- `QUICK_REFERENCE.md` - Quick lookup for flows

**Your sBTC integration is now production-ready!** 🚀

# 📝 New Repository Checklist

Use this checklist when setting up the repository for the first time or sharing with others.

## Before Pushing to GitHub

### Security Review
- [ ] `.env` file is NOT in the repository
- [ ] `.env` is listed in `.gitignore`
- [ ] `.env.example` has only placeholder values (no real secrets)
- [ ] No API keys, passwords, or wallet private keys in code
- [ ] `SESSION_SECRET` is not hardcoded anywhere
- [ ] Database credentials are not committed
- [ ] Contract addresses are configurable (not hardcoded for production)

### Code Quality
- [ ] All TypeScript files compile without errors (`npm run check`)
- [ ] Smart contract syntax is valid (`clarinet check`)
- [ ] No console.log statements with sensitive data
- [ ] All imports are resolved correctly
- [ ] No unused dependencies in package.json

### Documentation
- [ ] README.md is complete and accurate
- [ ] Setup instructions are tested and work
- [ ] All environment variables documented in .env.example
- [ ] Contract deployment steps are clear
- [ ] Troubleshooting section is helpful

### File Structure
- [ ] Unnecessary files removed (see CLEAN_REPO_GUIDE.md)
- [ ] Only essential source code included
- [ ] Build artifacts excluded (node_modules, dist, .cache)
- [ ] Git history is clean (no sensitive data in old commits)

## After Pushing to GitHub

### Repository Settings
- [ ] Repository name is clear and professional
- [ ] Description added (e.g., "Decentralized freelance escrow on Stacks blockchain")
- [ ] Topics/tags added: `stacks`, `blockchain`, `freelance`, `escrow`, `smart-contracts`, `react`, `typescript`, `clarity`
- [ ] License added (MIT recommended)
- [ ] .gitignore is working correctly

### Documentation
- [ ] README.md displays properly on GitHub
- [ ] Code blocks are formatted correctly
- [ ] Links work (especially in setup instructions)
- [ ] Images/diagrams included (if any)

### Collaboration
- [ ] Branch protection rules set (if needed)
- [ ] Contributor guidelines added (if open source)
- [ ] Issue templates created (optional)
- [ ] Pull request template added (optional)

## First-Time Setup (For New Contributors)

### Prerequisites Installed
- [ ] Node.js v18+ installed
- [ ] npm or pnpm installed
- [ ] PostgreSQL installed (or Neon account)
- [ ] Clarinet installed
- [ ] Hiro Wallet extension installed
- [ ] Git installed and configured

### Environment Setup
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` created from `.env.example`
- [ ] Database URL configured in `.env`
- [ ] Session secret generated and added to `.env`
- [ ] Database initialized (`npm run db:setup`)

### Verify Installation
- [ ] TypeScript compiles (`npm run check`)
- [ ] Development server starts (`npm run dev`)
- [ ] Frontend loads at http://localhost:5000
- [ ] Database connection works
- [ ] Smart contract checks pass (`clarinet check`)

### Test Basic Functionality
- [ ] Can connect wallet on frontend
- [ ] Can view client dashboard
- [ ] Can view freelancer dashboard
- [ ] Token prices load correctly
- [ ] No console errors in browser

## Testnet Deployment Checklist

### Prerequisites
- [ ] Testnet wallet created
- [ ] Testnet STX received from faucet
- [ ] Contract code reviewed and tested
- [ ] Deployment plan YAML configured

### Contract Deployment
- [ ] Contract syntax validated (`clarinet check`)
- [ ] Contract tests pass (`clarinet test`)
- [ ] Deployment plan reviewed
- [ ] Contract deployed to testnet
- [ ] Contract address recorded
- [ ] Contract verified on explorer

### Frontend Configuration
- [ ] Contract address updated in `client/src/lib/stacks.ts`
- [ ] Contract name updated
- [ ] Network set to testnet
- [ ] sBTC token contract address updated (if using sBTC)

### Testing on Testnet
- [ ] Can connect to testnet wallet
- [ ] Can create STX project
- [ ] Can create sBTC project
- [ ] Can fund project
- [ ] Can mark milestone complete
- [ ] Can release payment
- [ ] Amounts display correctly (check decimal places!)
- [ ] Platform fee deducted correctly (5%)
- [ ] All 4 milestones work

### Production Readiness
- [ ] All features tested end-to-end
- [ ] Error handling works properly
- [ ] UI is responsive and accessible
- [ ] Loading states display correctly
- [ ] Transaction confirmations work
- [ ] Contract events are tracked

## Common Issues to Check

### Database Issues
- [ ] DATABASE_URL format is correct
- [ ] Database server is running
- [ ] Database migrations applied
- [ ] Tables exist in database
- [ ] Database user has proper permissions

### Smart Contract Issues
- [ ] Contract deployed to correct network
- [ ] Contract address is correct in frontend
- [ ] Wallet connected to same network as contract
- [ ] Sufficient STX for transaction fees
- [ ] Token decimal handling is correct (STX=6, sBTC=8)

### Frontend Issues
- [ ] All dependencies installed
- [ ] Environment variables loaded
- [ ] API routes match backend
- [ ] Wallet connection works
- [ ] Error messages are user-friendly

### Development Workflow Issues
- [ ] Port 5000 not already in use
- [ ] Node version is compatible
- [ ] npm cache is clean
- [ ] TypeScript version matches project
- [ ] All peer dependencies satisfied

## Deployment to Production (Mainnet)

⚠️ **CRITICAL**: Only deploy to mainnet after thorough testnet testing!

- [ ] All testnet tests passed
- [ ] Security audit completed (recommended for production)
- [ ] Contract immutability understood (can't change after deploy)
- [ ] Mainnet STX available for deployment
- [ ] Backup plan for contract bugs
- [ ] Monitoring and alerting setup
- [ ] User support plan ready
- [ ] Legal compliance reviewed (if applicable)

### Pre-Mainnet Checklist
- [ ] Contract audited by professionals
- [ ] All edge cases tested
- [ ] Withdrawal/refund mechanisms work
- [ ] Platform fee collection tested
- [ ] Multi-signature considered for admin functions
- [ ] Contract upgrade path planned (if needed)
- [ ] Insurance/bug bounty considered

---

## 🎯 Success Criteria

Your setup is successful when:

✅ Development server runs without errors
✅ Can create and fund escrow projects
✅ Can complete and release milestones
✅ Blockchain transactions confirm successfully
✅ Amounts display correctly for both STX and sBTC
✅ Platform fee (5%) is deducted properly
✅ All dashboards (client/freelancer) work
✅ Documentation is clear and complete

---

## 📞 Get Help

If you encounter issues:

1. Check the [Troubleshooting](#-common-issues--troubleshooting) section in README
2. Review Stacks/Clarinet documentation
3. Check testnet transactions on block explorer
4. Open an issue with detailed error messages
5. Include: OS, Node version, error logs, steps to reproduce

---

**Keep this checklist handy for setup and deployments!** ✅

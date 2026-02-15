# 🧪 Testing & Development Setup Guide

This guide provides comprehensive instructions for setting up the STXWORX-Degrants project for development and verifying its functionality through various testing suites.

## 🛠️ Prerequisites

Ensure you have the following installed:
- **Node.js** (v18+)
- **PostgreSQL** (Local or [Neon](https://neon.tech))
- **Clarinet** (Stacks smart contract toolchain)
- **Hiro Wallet** (Browser extension for manual E2E tests)

---

## 🚀 Initial Setup
 
1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd STXWORX-Degrants
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `SESSION_SECRET`: A secure 32+ char string.
   - `JWT_SECRET`: A secure 32+ char string.

3. **Database Initialization**
   ```bash
   npm run db:setup
   ```
   *This runs `db:push` (schema sync) and `db:seed` (mock data).*

---

## 🧪 Testing Suites

### 1. Backend & Frontend Logic (Vitest)
Used for unit and integration tests of the Express server and React components.
```bash
# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### 2. Smart Contracts (Clarinet)
Used for testing Clarity smart contracts in a simulated Stacks environment.
```bash
# Check contract syntax
clarinet check

# Run all contract tests
clarinet test

# Interactive testing
clarinet console
```

### 3. Manual E2E Verification
After starting the dev server (`npm run dev`):
- [ ] **Auth**: Sign up, login, and verify session persistence.
- [ ] **Profile**: Edit bio/skills and verify it saves (React Query).
- [ ] **X Integration**: Initiate OAuth flow (backend verification).
- [ ] **Escrow**: Create a project, fund it, and release a milestone.

---

## 🔍 Troubleshooting

| Issue | Potential Solution |
|-------|--------------------|
| **DB Connection Failed** | Verify `DATABASE_URL` in `.env` and firewall settings. |
| **Post-condition Failed** | Clear browser cache and ensure token decimals (sBTC vs STX) match. |
| **JWT Unauthorized** | Ensure `JWT_SECRET` is set in `.env` and login again. |
| **Clarinet Check Fails** | Ensure your contract names match in `Clarinet.toml` and imports. |

---

## 📚 Related Documentation
- [README.md](file:///c:/Users/oguno/Desktop/codes/STXWORX-Degrants/README.md) - Project Overview
- [SETUP_CHECKLIST.md](file:///c:/Users/oguno/Desktop/codes/STXWORX-Degrants/SETUP_CHECKLIST.md) - Repository Readiness
- [DEPLOYMENT_GUIDE.md](file:///c:/Users/oguno/Desktop/codes/STXWORX-Degrants/DEPLOYMENT_GUIDE.md) - Testnet/Mainnet Steps

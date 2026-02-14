import { Clarinet, Tx, Chain, Account } from '@hirosystems/clarinet-sdk';
import { ok } from 'assert';
import { types } from 'util';

const ERR_UNAUTHORIZED = 1000;
const ERR_ALREADY_EXISTS = 1001;

describe('Freelance Data Contract Tests', () => {
  let alice: Account;
  let bob: Account;
  let contract: string;

  const chain = new Chain();
  beforeEach(() => {
    alice = new Account({ address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' });
    bob = new Account({ address: 'ST1SJ3DTEQDN9XJYV8KHGXG4M0DCE0P6Z2' });
    contract = alice.address;
    
    // Deploy contract
    chain.deployContract('freelance-data', 'contracts/freelance-data.clar', {
      address: contract,
    });
  });

  describe('User Profile Management', () => {
    it('should create a new user profile', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'create-user-profile', [
          types.ascii('alice_freelance'),
          types.some(types.ascii('alice_crypto')),
        ]),
        Tx.contractCall(contract, 'get-user-profile', [types.principal(alice.address)]),
      ]);

      const result = block.receipts[1].result;
      expect(result).toHaveProperty('user-id');
      expect(result['user-id']).toBe(alice.address);
    });

    it('should not allow duplicate user profiles', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'create-user-profile', [
          types.ascii('alice_duplicate'),
          types.none(),
        ]),
      ]);

      expect(block.receipts[0].result).toBeErr(ERR_ALREADY_EXISTS);
    });

    it('should update user reputation', () => {
      // First create user
      chain.mineBlock([
        Tx.contractCall(contract, 'create-user-profile', [
          types.ascii('bob_freelance'),
          types.none(),
        ]),
      ]);

      // Update reputation
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'update-reputation', [
          types.principal(bob.address),
          types.uint(5000),
        ]),
      ]);

      const profile = chain.callReadOnlyFn(contract, 'get-user-profile', [types.principal(bob.address)]);
      expect(profile.result).toBe(200);
      expect(profile.result.ok?.reputation).toBe(5000);
    });
  });

  describe('Category Management', () => {
    it('should add new category (admin only)', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'add-category', [
          types.ascii('Web Development'),
          types.ascii('💻'),
          types.list([types.ascii('Frontend'), types.ascii('Backend'), types.ascii('Full Stack')]),
        ]),
      ]);

      const result = block.receipts[0].result;
      expect(result).toHaveProperty('category-id');
      expect(result['category-id']).toBe(0); // First category
    });

    it('should retrieve category by ID', () => {
      // Add category first
      chain.mineBlock([
        Tx.contractCall(contract, 'add-category', [
          types.ascii('Mobile Development'),
          types.ascii('📱'),
          types.list([types.ascii('iOS'), types.ascii('Android')]),
        ]),
      ]);

      const category = chain.callReadOnlyFn(contract, 'get-category', [types.uint(1)]);
      expect(category.result).toBe(200);
      expect(category.result.ok?.name).toBe('Mobile Development');
      expect(category.result.ok?.subcategories).toHaveLength(2);
    });

    it('should not allow non-admin to add categories', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'add-category', [
          types.ascii('Unauthorized Category'),
          types.ascii('🚫'),
          types.list([types.ascii('Test')]),
        ]),
      ]);

      expect(block.receipts[0].result).toBeErr(ERR_UNAUTHORIZED);
    });
  });

  describe('Leaderboard System', () => {
    it('should update leaderboard score', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'update-leaderboard-score', [
          types.ascii('total-earnings'),
          types.uint(100000),
        ]),
      ]);

      expect(block.receipts[0].result).toBe(200);
    });

    it('should retrieve leaderboard score', () => {
      // Update score first
      chain.mineBlock([
        Tx.contractCall(contract, 'update-leaderboard-score', [
          types.ascii('project-completion'),
          types.uint(25),
        ]),
      ]);

      const score = chain.callReadOnlyFn(contract, 'get-leaderboard-score', [
        types.principal(alice.address),
        types.ascii('project-completion'),
      ]);

      expect(score.result).toBe(200);
      expect(score.result.ok?.['score-value']).toBe(25);
    });
  });

  describe('Achievement System', () => {
    it('should mint achievement NFT', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'mint-achievement', [
          types.ascii('bronze'),
          types.uint(100),
        ]),
      ]);

      const result = block.receipts[0].result;
      expect(result).toHaveProperty('token-id');
      expect(result['token-id']).toBe(100);
    });

    it('should not allow duplicate achievements', () => {
      // Mint first achievement
      chain.mineBlock([
        Tx.contractCall(contract, 'mint-achievement', [
          types.ascii('bronze'),
          types.uint(101),
        ]),
      ]);

      // Try to mint same achievement again
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'mint-achievement', [
          types.ascii('bronze'),
          types.uint(102),
        ]),
      ]);

      expect(block.receipts[0].result).toBeErr(ERR_ALREADY_EXISTS);
    });

    it('should retrieve user achievements', () => {
      // Mint some achievements
      chain.mineBlock([
        Tx.contractCall(contract, 'mint-achievement', [
          types.ascii('bronze'),
          types.uint(200),
        ]),
        Tx.contractCall(contract, 'mint-achievement', [
          types.ascii('silver'),
          types.uint(201),
        ]),
      ]);

      const achievements = chain.callReadOnlyFn(contract, 'get-user-achievements', [types.principal(alice.address)]);
      expect(achievements.result).toBe(200);
      expect(Object.keys(achievements.result.ok || {})).toHaveLength(2);
    });
  });

  describe('Project Statistics', () => {
    it('should update project completion stats', () => {
      // Create user first
      chain.mineBlock([
        Tx.contractCall(contract, 'create-user-profile', [
          types.ascii('bob_stats'),
          types.none(),
        ]),
      ]);

      // Update stats
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'update-project-stats', [
          types.principal(bob.address),
          types.uint(50000), // 0.05 STX
        ]),
      ]);

      expect(block.receipts[0].result).toBe(200);

      // Check updated profile
      const profile = chain.callReadOnlyFn(contract, 'get-user-profile', [types.principal(bob.address)]);
      expect(profile.result.ok?.['completed-projects']).toBe(1);
      expect(profile.result.ok?.['total-earnings']).toBe(50000);
    });
  });
});

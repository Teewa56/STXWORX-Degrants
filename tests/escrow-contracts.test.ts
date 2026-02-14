import { Clarinet, Tx, Chain, Account, types } from '@hirosystems/clarinet-sdk';

describe('Freelance Logic Contract Tests', () => {
  let alice: Account;
  let bob: Account;
  let dao: Account;
  let contract: string;

  const ERR_NOT_CLIENT = 100;
  const ERR_NOT_FREELANCER = 101;
  const ERR_PROJECT_NOT_FOUND = 102;
  const ERR_INVALID_MILESTONE = 103;
  const ERR_NOT_COMPLETE = 105;
  const ERR_ALREADY_RELEASED = 106;
  const ERR_ALREADY_COMPLETE = 116;
  const ERR_CONTRACT_PAUSED = 120;

  const chain = new Chain();
  beforeEach(() => {
    alice = new Account({
      address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      balance: 100000000 // 100 STX
    });
    bob = new Account({
      address: 'ST1SJ3DTEQDN9XJYV8KHGXG4M0DCE0P6Z2',
      balance: 50000000 // 50 STX
    });
    dao = new Account({
      address: 'SP17764FQ0XK7W6QMSJYE09Y938Z1RSEGT925P30S',
      balance: 0
    });
    contract = process.env.CONTRACT_ADDRESS!;
    // Deploy contracts
    chain.deployContract('escrow-multi-token', 'contracts/escrow-multi-token.clar', {
      address: contract,
    });
  });

  describe('Escrow Creation', () => {
    it('should create new escrow with valid data', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'create-project-stx', [
          types.principal(bob.address),
          types.uint(15000000), // m1
          types.uint(15000000), // m2
          types.uint(15000000), // m3
          types.uint(15000000), // m4
        ]),
      ]);

      const result = block.receipts[0].result;
      expect(result).toHaveProperty('escrow-id');
      expect(result['escrow-id']).toBe(0); // First escrow
    });

    it('should validate milestone amounts sum to total', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'create-project-stx', [
          types.principal(bob.address),
          types.uint(12500000), // m1
          types.uint(12500000), // m2
          types.uint(12500000), // m3
          types.uint(12500000), // m4
        ]),
      ]);

      expect(block.receipts[0].result).toBe(400);
    });

    it('should create escrow with correct milestone amounts', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'create-project-stx', [
          types.principal(bob.address),
          types.uint(20000000), // m1
          types.uint(20000000), // m2
          types.uint(20000000), // m3
          types.uint(20000000), // m4
        ]),
      ]);

      const escrow = chain.callReadOnlyFn(contract, 'get-escrow', [types.uint(1)]);
      expect(escrow.result).toBe(200);

      const escrowData = escrow.result.ok;
      expect(escrowData['milestone-1'].amount).toBe(20000000); // 20 STX each
      expect(escrowData['milestone-2'].amount).toBe(20000000);
      expect(escrowData['milestone-3'].amount).toBe(20000000);
      expect(escrowData['milestone-4'].amount).toBe(20000000);
    });
  });

  // Funding is now handled within create-project-stx

  describe('Milestone Management', () => {
    beforeEach(() => {
      // Create project
      chain.mineBlock([
        Tx.contractCall(contract, 'create-project-stx', [
          types.principal(bob.address),
          types.uint(10000000),
          types.uint(10000000),
          types.uint(10000000),
          types.uint(10000000),
        ]),
      ]);
    });

    it('should allow freelancer to mark milestone complete', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'complete-milestone', [
          types.uint(1), // project-id starts at 1
          types.uint(1), // milestone-num
        ], {
          sender: bob, // Bob is freelancer
        }),
      ]);

      expect(block.receipts[0].result).toBe(true);

      // Check milestone status
      const milestone = chain.callReadOnlyFn(contract, 'get-milestone', [types.uint(1), types.uint(1)]);
      expect(milestone.result.ok?.complete).toBe(true);
    });

    it('should not allow client to mark milestone complete', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'mark-milestone-complete', [
          types.uint(0),
          types.uint(1),
        ], {
          sender: alice, // Alice is client
        }),
      ]);

      expect(block.receipts[0].result).toBe(ERR_NOT_FREELANCER);
    });

    it('should reject invalid milestone numbers', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'mark-milestone-complete', [
          types.uint(0),
          types.uint(5), // Invalid milestone
        ], {
          sender: bob,
        }),
      ]);

      expect(block.receipts[0].result).toBe(ERR_INVALID_MILESTONE);
    });
  });

  describe('Payment Release', () => {
    beforeEach(() => {
      // Create, fund, and complete milestone
      chain.mineBlock([
        Tx.contractCall(contract, 'create-escrow', [
          types.principal(bob.address),
          types.uint(40000000),
          types.uint(0),
          types.ascii('Work 1'),
          types.ascii('Work 2'),
          types.ascii('Work 3'),
          types.ascii('Work 4'),
        ]),
        Tx.contractCall(contract, 'fund-escrow', [types.uint(0)]),
        Tx.contractCall(contract, 'mark-milestone-complete', [
          types.uint(0),
          types.uint(1),
        ], {
          sender: bob,
        }),
      ]);
    });

    it('should release milestone payment with correct fee distribution', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'release-milestone-stx', [
          types.uint(1),
          types.uint(1),
        ], {
          sender: alice, // Alice is client
        }),
      ]);

      const result = block.receipts[0].result;
      expect(result).toBe(9000000); // 90% of 10 STX
    });

    it('should only allow client to release payments', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'release-milestone-payment', [
          types.uint(0),
          types.uint(2),
        ], {
          sender: bob, // Bob is freelancer
        }),
      ]);

      expect(block.receipts[0].result).toBe(ERR_NOT_CLIENT);
    });

    it('should not release already completed milestones', () => {
      // Complete milestone 2 first
      chain.mineBlock([
        Tx.contractCall(contract, 'release-milestone-stx', [
          types.uint(1),
          types.uint(1),
        ], {
          sender: alice,
        }),
      ]);

      // Try to release same milestone again
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'release-milestone-stx', [
          types.uint(1),
          types.uint(1),
        ], {
          sender: alice,
        }),
      ]);

      expect(block.receipts[0].result).toBe(ERR_ALREADY_COMPLETE);
    });
  });

  describe('Project Completion', () => {
    it('should detect incomplete project', () => {
      // Create and fund escrow
      chain.mineBlock([
        Tx.contractCall(contract, 'create-escrow', [
          types.principal(bob.address),
          types.uint(40000000),
          types.uint(0),
          types.ascii('Task 1'),
          types.ascii('Task 2'),
          types.ascii('Task 3'),
          types.ascii('Task 4'),
        ]),
        Tx.contractCall(contract, 'fund-escrow', [types.uint(0)]),
      ]);

      const isComplete = chain.callReadOnlyFn(contract, 'is-project-complete', [types.uint(1)]);
      expect(isComplete.result).toBe(200);
      expect(isComplete.result.ok).toBe(false);
    });

    it('should detect completed project', () => {
      // Create, fund, and complete all milestones
      chain.mineBlock([
        Tx.contractCall(contract, 'create-escrow', [
          types.principal(bob.address),
          types.uint(40000000),
          types.uint(0),
          types.ascii('Task 1'),
          types.ascii('Task 2'),
          types.ascii('Task 3'),
          types.ascii('Task 4'),
        ]),
        Tx.contractCall(contract, 'fund-escrow', [types.uint(0)]),
        Tx.contractCall(contract, 'mark-milestone-complete', [types.uint(0), types.uint(1)], { sender: bob }),
        Tx.contractCall(contract, 'mark-milestone-complete', [types.uint(0), types.uint(2)], { sender: bob }),
        Tx.contractCall(contract, 'mark-milestone-complete', [types.uint(0), types.uint(3)], { sender: bob }),
        Tx.contractCall(contract, 'mark-milestone-complete', [types.uint(0), types.uint(4)], { sender: bob }),
        Tx.contractCall(contract, 'release-milestone-stx', [types.uint(0), types.uint(1)], { sender: alice }),
        Tx.contractCall(contract, 'release-milestone-stx', [types.uint(0), types.uint(2)], { sender: alice }),
        Tx.contractCall(contract, 'release-milestone-stx', [types.uint(0), types.uint(3)], { sender: alice }),
        Tx.contractCall(contract, 'release-milestone-stx', [types.uint(0), types.uint(4)], { sender: alice }),
      ]);

      const isComplete = chain.callReadOnlyFn(contract, 'is-project-complete', [types.uint(1)]);
      expect(isComplete.result).toBe(200);
      expect(isComplete.result.ok).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent escrow', () => {
      const escrow = chain.callReadOnlyFn(contract, 'get-escrow', [types.uint(999)]);
      expect(escrow.result).toBe(ERR_PROJECT_NOT_FOUND);
    });

    it('should handle invalid milestone numbers', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'mark-milestone-complete', [
          types.uint(0),
          types.uint(0), // Invalid (milestones start at 1)
        ], {
          sender: bob,
        }),
      ]);

      expect(block.receipts[0].result).toBe(ERR_INVALID_MILESTONE);
    });
  });
});

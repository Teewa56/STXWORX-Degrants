import { Clarinet, Tx, Chain, Account } from '@hirosystems/clarinet-sdk';

describe('Freelance Logic Contract Tests', () => {
  let alice: Account;
  let bob: Account;
  let dao: Account;
  let contract: string;

  beforeEach(() => {
    const chain = new Chain();
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

    // Deploy contracts
    chain.deployContract('freelance-logic', 'contracts/freelance-logic.clar', {
      address: contract,
    });
  });

  describe('Escrow Creation', () => {
    it('should create new escrow with valid data', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'create-escrow', [
          types.principal(bob.address),
          types.uint(60000000), // 60 STX
          types.uint(0), // STX token type
          types.ascii('Milestone 1: Setup'),
          types.ascii('Milestone 2: Development'),
          types.ascii('Milestone 3: Testing'),
          types.ascii('Milestone 4: Deployment'),
        ]),
      ]);

      const result = block.receipts[0].result;
      expect(result).toHaveProperty('escrow-id');
      expect(result['escrow-id']).toBe(0); // First escrow
    });

    it('should validate milestone amounts sum to total', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'create-escrow', [
          types.principal(bob.address),
          types.uint(50000000), // 50 STX - not divisible by 4
          types.uint(0),
          types.ascii('Milestone 1'),
          types.ascii('Milestone 2'),
          types.ascii('Milestone 3'),
          types.ascii('Milestone 4'),
        ]),
      ]);

      expect(block.receipts[0].result).toBeErr(ERR_INVALID_AMOUNT);
    });

    it('should create escrow with correct milestone amounts', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'create-escrow', [
          types.principal(bob.address),
          types.uint(80000000), // 80 STX
          types.uint(0),
          types.ascii('Phase 1'),
          types.ascii('Phase 2'),
          types.ascii('Phase 3'),
          types.ascii('Phase 4'),
        ]),
      ]);

      const escrow = chain.callReadOnlyFn(contract, 'get-escrow', [types.uint(1)]);
      expect(escrow.result).toBeOk();

      const escrowData = escrow.result.ok;
      expect(escrowData['milestone-1'].amount).toBe(20000000); // 20 STX each
      expect(escrowData['milestone-2'].amount).toBe(20000000);
      expect(escrowData['milestone-3'].amount).toBe(20000000);
      expect(escrowData['milestone-4'].amount).toBe(20000000);
    });
  });

  describe('Escrow Funding', () => {
    beforeEach(() => {
      // Create escrow first
      chain.mineBlock([
        Tx.contractCall(contract, 'create-escrow', [
          types.principal(bob.address),
          types.uint(40000000), // 40 STX
          types.uint(0),
          types.ascii('Design'),
          types.ascii('Build'),
          types.ascii('Test'),
          types.ascii('Deploy'),
        ]),
      ]);
    });

    it('should fund escrow with sufficient balance', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'fund-escrow', [types.uint(0)]),
      ]);

      expect(block.receipts[0].result).toBeOk(true);

      // Check escrow status
      const escrow = chain.callReadOnlyFn(contract, 'get-escrow', [types.uint(0)]);
      expect(escrow.result.ok?.status).toBe('FUNDED');
    });

    it('should reject funding with insufficient balance', () => {
      // Use alice with insufficient balance
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'fund-escrow', [types.uint(0)], {
          sender: alice,
        }),
      ]);

      expect(block.receipts[0].result).toBeErr(ERR_INSUFFICIENT_FUNDS);
    });

    it('should only allow client to fund escrow', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'fund-escrow', [types.uint(0)], {
          sender: bob, // Bob is freelancer, not client
        }),
      ]);

      expect(block.receipts[0].result).toBeErr(ERR_NOT_CLIENT);
    });
  });

  describe('Milestone Management', () => {
    beforeEach(() => {
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
    });

    it('should allow freelancer to mark milestone complete', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'mark-milestone-complete', [
          types.uint(0),
          types.uint(1),
        ], {
          sender: bob, // Bob is freelancer
        }),
      ]);

      expect(block.receipts[0].result).toBeOk(true);

      // Check milestone status
      const escrow = chain.callReadOnlyFn(contract, 'get-escrow', [types.uint(0)]);
      expect(escrow.result.ok?.['milestone-1'].complete).toBe(true);
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

      expect(block.receipts[0].result).toBeErr(ERR_NOT_FREELANCER);
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

      expect(block.receipts[0].result).toBeErr(ERR_INVALID_MILESTONE);
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
        Tx.contractCall(contract, 'release-milestone-payment', [
          types.uint(0),
          types.uint(1),
        ], {
          sender: alice, // Alice is client
        }),
      ]);

      const result = block.receipts[0].result;
      expect(result).toBeOk();
      expect(result.ok?.released).toBe(true);
      expect(result.ok?.amount).toBe(9000000); // 90% of 10 STX
      expect(result.ok?.fee).toBe(1000000); // 10% of 10 STX
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

      expect(block.receipts[0].result).toBeErr(ERR_NOT_CLIENT);
    });

    it('should not release already completed milestones', () => {
      // Complete milestone 2 first
      chain.mineBlock([
        Tx.contractCall(contract, 'release-milestone-payment', [
          types.uint(0),
          types.uint(1),
        ], {
          sender: alice,
        }),
      ]);

      // Try to release same milestone again
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'release-milestone-payment', [
          types.uint(0),
          types.uint(1),
        ], {
          sender: alice,
        }),
      ]);

      expect(block.receipts[0].result).toBeErr(ERR_ALREADY_COMPLETE);
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
      expect(isComplete.result).toBeOk();
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
        Tx.contractCall(contract, 'release-milestone-payment', [types.uint(0), types.uint(1)], { sender: alice }),
        Tx.contractCall(contract, 'release-milestone-payment', [types.uint(0), types.uint(2)], { sender: alice }),
        Tx.contractCall(contract, 'release-milestone-payment', [types.uint(0), types.uint(3)], { sender: alice }),
        Tx.contractCall(contract, 'release-milestone-payment', [types.uint(0), types.uint(4)], { sender: alice }),
      ]);

      const isComplete = chain.callReadOnlyFn(contract, 'is-project-complete', [types.uint(1)]);
      expect(isComplete.result).toBeOk();
      expect(isComplete.result.ok).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent escrow', () => {
      const escrow = chain.callReadOnlyFn(contract, 'get-escrow', [types.uint(999)]);
      expect(escrow.result).toBeErr(ERR_PROJECT_NOT_FOUND);
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

      expect(block.receipts[0].result).toBeErr(ERR_INVALID_MILESTONE);
    });
  });
});

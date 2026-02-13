import { Clarinet, Tx, Chain, Account } from '@clarinet/sdk';

describe('Freelance Security Contract Tests', () => {
  let alice: Account;
  let bob: Account;
  let charlie: Account;
  let contract: string;

  beforeEach(() => {
    const chain = new Chain();
    alice = new Account({ address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' });
    bob = new Account({ address: 'ST1SJ3DTEQDN9XJYV8KHGXG4M0DCE0P6Z2' });
    charlie = new Account({ address: 'SP3BYAM6836B3N35XERPQ2ACWD3HYTK1KE7CB27E1' });

    // Deploy contract
    chain.deployContract('freelance-security', 'contracts/freelance-security.clar', {
      address: contract,
    });
  });

  describe('Multi-Sig Initialization', () => {
    it('should initialize authorized signers', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'initialize-signers', [
          [alice.address, bob.address, charlie.address],
        ]),
      ]);

      expect(block.receipts[0].result).toBeOk(true);
    });

    it('should reject invalid number of signers', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'initialize-signers', [
          [alice.address, bob.address], // Only 2 signers
        ]),
      ]);

      expect(block.receipts[0].result).toBeErr(3005);
    });

    it('should reject non-deployer initialization', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'initialize-signers', [
          [alice.address, bob.address, charlie.address],
        ], {
          sender: bob, // Bob is not deployer
        }),
      ]);

      expect(block.receipts[0].result).toBeErr(3000);
    });
  });

  describe('Proposal Management', () => {
    beforeEach(() => {
      // Initialize signers first
      chain.mineBlock([
        Tx.contractCall(contract, 'initialize-signers', [
          [alice.address, bob.address, charlie.address],
        ]),
      ]);
    });

    it('should create new proposal', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'create-proposal', [
          alice.address, // Target contract (logic contract)
          'pause-escrow',
          ['test-argument'],
        ]),
      ]);

      const result = block.receipts[0].result;
      expect(result).toHaveProperty('proposal-id');
      expect(result['proposal-id']).toBe(0); // First proposal
    });

    it('should reject proposal from non-signer', () => {
      const dave = new Account({ address: 'SP2C5KY4SJ3DTEQDN9XJYV8KHGXG4M0DCE0P6Z2' });
      
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'create-proposal', [
          alice.address,
          'test-function',
          ['arg'],
        ], {
          sender: dave, // Dave is not a signer
        }),
      ]);

      expect(block.receipts[0].result).toBeErr(3006);
    });
  });

  describe('Proposal Approval', () => {
    beforeEach(() => {
      // Initialize signers and create proposal
      chain.mineBlock([
        Tx.contractCall(contract, 'initialize-signers', [
          [alice.address, bob.address, charlie.address],
        ]),
        Tx.contractCall(contract, 'create-proposal', [
          alice.address,
          'test-proposal',
          ['arg1', 'arg2'],
        ]),
      ]);
    });

    it('should allow signer to approve proposal', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'approve-proposal', [0], {
          sender: bob, // Bob is a signer
        }),
      ]);

      expect(block.receipts[0].result).toBeOk(true);

      // Check proposal has 2 approvals now
      const proposal = chain.callReadOnlyFn(contract, 'get-proposal', [0]);
      expect(proposal.result.ok?.approvals).toHaveLength(2);
    });

    it('should reject duplicate approval', () => {
      // Bob already approved in beforeEach
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'approve-proposal', [0], {
          sender: bob,
        }),
      ]);

      expect(block.receipts[0].result).toBeErr(3004);
    });

    it('should reject approval from non-signer', () => {
      const dave = new Account({ address: 'SP2C5KY4SJ3DTEQDN9XJYV8KHGXG4M0DCE0P6Z2' });
      
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'approve-proposal', [0], {
          sender: dave, // Dave is not a signer
        }),
      ]);

      expect(block.receipts[0].result).toBeErr(3006);
    });
  });

  describe('Proposal Execution', () => {
    beforeEach(() => {
      // Setup: initialize signers, create proposal, get approvals
      chain.mineBlock([
        Tx.contractCall(contract, 'initialize-signers', [
          [alice.address, bob.address, charlie.address],
        ]),
        Tx.contractCall(contract, 'create-proposal', [
          alice.address,
          'test-execution',
          ['exec-arg'],
        ]),
        Tx.contractCall(contract, 'approve-proposal', [0], { sender: bob }),
        Tx.contractCall(contract, 'approve-proposal', [0], { sender: charlie }),
      ]);
    });

    it('should execute proposal after timelock', () => {
      // Mine blocks to pass timelock
      chain.mineBlock([], [], [], [], 150); // Mine 150 empty blocks

      const block = chain.mineBlock([
        Tx.contractCall(contract, 'execute-proposal', [0]),
      ]);

      expect(block.receipts[0].result).toBeOk();
      expect(block.receipts[0].result.ok?.executed).toBe(true);
    });

    it('should reject execution before timelock', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'execute-proposal', [0]),
      ]);

      expect(block.receipts[0].result).toBeErr(3003);
    });

    it('should reject execution with insufficient signatures', () => {
      // Only 2 approvals, need 3
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'execute-proposal', [0], {
          sender: alice, // Remove alice's approval
        }),
      ]);

      expect(block.receipts[0].result).toBeErr(3002);
    });

    it('should reject double execution', () => {
      // Execute once
      chain.mineBlock([], [], [], 150);
      chain.mineBlock([
        Tx.contractCall(contract, 'execute-proposal', [0]),
      ]);

      // Try to execute again
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'execute-proposal', [0]),
      ]);

      expect(block.receipts[0].result).toBeErr(3004);
    });
  });

  describe('Admin Permissions', () => {
    it('should update admin permissions', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'update-admin-permissions', [
          alice.address,
          {
            'can-pause': true,
            'can-unpause': true,
            'can-emergency-withdraw': true,
            'can-update-contract': false,
          },
        ]),
      ]);

      expect(block.receipts[0].result).toBeOk(true);
    });

    it('should check admin permissions', () => {
      // First set permissions
      chain.mineBlock([
        Tx.contractCall(contract, 'update-admin-permissions', [
          alice.address,
          {
            'can-pause': true,
            'can-unpause': false,
            'can-emergency-withdraw': true,
            'can-update-contract': true,
          },
        ]),
      ]);

      // Check permissions
      const canPause = chain.callReadOnlyFn(contract, 'check-admin-permissions', [
        alice.address,
        'can-pause',
      ]);
      expect(canPause.result).toBeOk();
      expect(canPause.result.ok).toBe(true);

      const canUnpause = chain.callReadOnlyFn(contract, 'check-admin-permissions', [
        alice.address,
        'can-unpause',
      ]);
      expect(canUnpause.result).toBeOk();
      expect(canUnpause.result.ok).toBe(false);
    });

    it('should reject permission update from non-deployer', () => {
      const block = chain.mineBlock([
        Tx.contractCall(contract, 'update-admin-permissions', [
          bob.address,
          {
            'can-pause': true,
            'can-unpause': true,
            'can-emergency-withdraw': true,
            'can-update-contract': true,
          },
        ]),
      ]);

      expect(block.receipts[0].result).toBeErr(3000);
    });
  });

  describe('Security Functions', () => {
    it('should check authorized signer', () => {
      const isAuthorized = chain.callReadOnlyFn(contract, 'is-authorized-signer', [alice.address]);
      expect(isAuthorized.result).toBeOk();
      expect(isAuthorized.result.ok).toBe(true);

      const isNotAuthorized = chain.callReadOnlyFn(contract, 'is-authorized-signer', [
        'SP2C5KY4SJ3DTEQDN9XJYV8KHGXG4M0DCE0P6Z2', // Dave is not a signer
      ]);
      expect(isNotAuthorized.result).toBeOk();
      expect(isNotAuthorized.result.ok).toBe(false);
    });

    it('should retrieve proposal details', () => {
      // Create proposal first
      chain.mineBlock([
        Tx.contractCall(contract, 'create-proposal', [
          alice.address,
          'test-retrieval',
          ['data'],
        ]),
      ]);

      const proposal = chain.callReadOnlyFn(contract, 'get-proposal', [0]);
      expect(proposal.result).toBeOk();
      expect(proposal.result.ok?.proposer).toBe(alice.address);
      expect(proposal.result.ok?.['function-name']).toBe('test-retrieval');
    });

    it('should reject direct emergency calls', () => {
      const pauseBlock = chain.mineBlock([
        Tx.contractCall(contract, 'emergency-pause-all-escrows', []),
      ]);
      expect(pauseBlock.receipts[0].result).toBeErr(3000);

      const withdrawBlock = chain.mineBlock([
        Tx.contractCall(contract, 'emergency-withdraw-all-funds', []),
      ]);
      expect(withdrawBlock.receipts[0].result).toBeErr(3000);
    });
  });
});

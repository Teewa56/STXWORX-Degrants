import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Test 1: Create STX project successfully",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const client = accounts.get('wallet_1')!;
        const freelancer = accounts.get('wallet_2')!;

        let block = chain.mineBlock([
            Tx.contractCall(
                'escrow-multi-token-v4',
                'create-project-stx',
                [
                    types.principal(freelancer.address),
                    types.uint(100000),  // 0.1 STX
                    types.uint(100000),
                    types.uint(100000),
                    types.uint(100000)
                ],
                client.address
            )
        ]);

        block.receipts[0].result.expectOk().expectUint(1);
        console.log("✅ STX Project created successfully");
    },
});

Clarinet.test({
    name: "Test 2: Complete and release STX milestone",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const client = accounts.get('wallet_1')!;
        const freelancer = accounts.get('wallet_2')!;

        // Create project
        let block = chain.mineBlock([
            Tx.contractCall(
                'escrow-multi-token-v4',
                'create-project-stx',
                [
                    types.principal(freelancer.address),
                    types.uint(100000),
                    types.uint(100000),
                    types.uint(100000),
                    types.uint(100000)
                ],
                client.address
            )
        ]);

        // Complete milestone
        block = chain.mineBlock([
            Tx.contractCall(
                'escrow-multi-token-v4',
                'complete-milestone',
                [types.uint(1), types.uint(1)],
                freelancer.address
            )
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
        console.log("✅ Milestone completed");

        // Release payment
        block = chain.mineBlock([
            Tx.contractCall(
                'escrow-multi-token-v4',
                'release-milestone-stx',
                [types.uint(1), types.uint(1)],
                client.address
            )
        ]);

        block.receipts[0].result.expectOk();
        console.log("✅ STX payment released successfully");
    },
});

Clarinet.test({
    name: "Test 3: Get contract info",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const client = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(
                'escrow-multi-token-v4',
                'get-project-count',
                [],
                client.address
            )
        ]);

        console.log("✅ Project count:", block.receipts[0].result);
    },
});

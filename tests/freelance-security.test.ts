import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;
const dave = accounts.get("wallet_4")!;
const eve = accounts.get("wallet_5")!;

describe("Freelance Security Contract Tests", () => {
  
  describe("Multi-Sig Initialization", () => {
    it("should initialize 5 signers", () => {
      const { result } = simnet.callPublicFn(
        "freelance-security",
        "initialize-signers",
        [
          Cl.list([
            Cl.principal(alice),
            Cl.principal(bob),
            Cl.principal(charlie),
            Cl.principal(dave),
            Cl.principal(eve),
          ]),
        ],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should reject re-initialization", () => {
      simnet.callPublicFn(
        "freelance-security",
        "initialize-signers",
        [
          Cl.list([
            Cl.principal(alice),
            Cl.principal(bob),
            Cl.principal(charlie),
            Cl.principal(dave),
            Cl.principal(eve),
          ]),
        ],
        deployer
      );

      const { result } = simnet.callPublicFn(
        "freelance-security",
        "initialize-signers",
        [
          Cl.list([
            Cl.principal(alice),
            Cl.principal(bob),
            Cl.principal(charlie),
            Cl.principal(dave),
            Cl.principal(eve),
          ]),
        ],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(3000)); // ERR-UNAUTHORIZED
    });
  });

  describe("Proposal Creation", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "freelance-security",
        "initialize-signers",
        [
          Cl.list([
            Cl.principal(alice),
            Cl.principal(bob),
            Cl.principal(charlie),
            Cl.principal(dave),
            Cl.principal(eve),
          ]),
        ],
        deployer
      );
    });

    it("should create pause proposal", () => {
      const { result } = simnet.callPublicFn(
        "freelance-security",
        "create-pause-proposal",
        [],
        alice
      );
      
      expect(result).toBeOk(Cl.uint(1));
    });

    it("should reject proposal from non-signer", () => {
      const nonSigner = accounts.get("wallet_6")!;
      
      const { result } = simnet.callPublicFn(
        "freelance-security",
        "create-pause-proposal",
        [],
        nonSigner
      );
      
      expect(result).toBeErr(Cl.uint(3006)); // ERR-NOT-SIGNER
    });
  });

  describe("Proposal Approval", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "freelance-security",
        "initialize-signers",
        [
          Cl.list([
            Cl.principal(alice),
            Cl.principal(bob),
            Cl.principal(charlie),
            Cl.principal(dave),
            Cl.principal(eve),
          ]),
        ],
        deployer
      );

      simnet.callPublicFn(
        "freelance-security",
        "create-pause-proposal",
        [],
        alice
      );
    });

    it("should allow signer to approve", () => {
      const { result } = simnet.callPublicFn(
        "freelance-security",
        "approve-proposal",
        [Cl.uint(1)],
        bob
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should reject duplicate approval", () => {
      simnet.callPublicFn(
        "freelance-security",
        "approve-proposal",
        [Cl.uint(1)],
        bob
      );

      const { result } = simnet.callPublicFn(
        "freelance-security",
        "approve-proposal",
        [Cl.uint(1)],
        bob
      );
      
      expect(result).toBeErr(Cl.uint(3007)); // ERR-ALREADY-APPROVED
    });
  });

  describe("Proposal Execution", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "freelance-security",
        "initialize-signers",
        [
          Cl.list([
            Cl.principal(alice),
            Cl.principal(bob),
            Cl.principal(charlie),
            Cl.principal(dave),
            Cl.principal(eve),
          ]),
        ],
        deployer
      );

      simnet.callPublicFn(
        "freelance-security",
        "create-pause-proposal",
        [],
        alice
      );

      simnet.callPublicFn(
        "freelance-security",
        "approve-proposal",
        [Cl.uint(1)],
        bob
      );

      simnet.callPublicFn(
        "freelance-security",
        "approve-proposal",
        [Cl.uint(1)],
        charlie
      );
    });

    it("should reject execution before timelock", () => {
      const { result } = simnet.callPublicFn(
        "freelance-security",
        "execute-proposal",
        [Cl.uint(1)],
        alice
      );
      
      expect(result).toBeErr(Cl.uint(3003)); // ERR-TIMELOCK-NOT-EXPIRED
    });

    it("should execute after timelock with 3 signatures", () => {
      // Mine 144 blocks
      simnet.mineEmptyBlocks(145);

      const { result } = simnet.callPublicFn(
        "freelance-security",
        "execute-proposal",
        [Cl.uint(1)],
        alice
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });
});
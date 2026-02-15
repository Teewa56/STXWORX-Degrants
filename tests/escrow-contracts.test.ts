import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

describe("Escrow Multi-Token Contract Tests", () => {
  
  describe("Project Creation", () => {
    it("should create STX project successfully", () => {
      const { result } = simnet.callPublicFn(
        "escrow-multi-token",
        "create-project-stx",
        [
          Cl.principal(bob),
          Cl.uint(10000000), // m1: 10 STX
          Cl.uint(10000000), // m2: 10 STX
          Cl.uint(10000000), // m3: 10 STX
          Cl.uint(10000000), // m4: 10 STX
        ],
        alice
      );
      
      expect(result).toBeOk(Cl.uint(1));
    });

    it("should reject client == freelancer", () => {
      const { result } = simnet.callPublicFn(
        "escrow-multi-token",
        "create-project-stx",
        [
          Cl.principal(alice), // Same as sender
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
        ],
        alice
      );
      
      expect(result).toBeErr(Cl.uint(121)); // ERR-INVALID-PARTICIPANTS
    });

    it("should reject zero amount", () => {
      const { result } = simnet.callPublicFn(
        "escrow-multi-token",
        "create-project-stx",
        [
          Cl.principal(bob),
          Cl.uint(0),
          Cl.uint(0),
          Cl.uint(0),
          Cl.uint(0),
        ],
        alice
      );
      
      expect(result).toBeErr(Cl.uint(108)); // ERR-INVALID-AMOUNT
    });
  });

  describe("Milestone Management", () => {
    beforeEach(() => {
      // Create project first
      simnet.callPublicFn(
        "escrow-multi-token",
        "create-project-stx",
        [
          Cl.principal(bob),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
        ],
        alice
      );
    });

    it("should allow freelancer to complete milestone", () => {
      const { result } = simnet.callPublicFn(
        "escrow-multi-token",
        "complete-milestone",
        [Cl.uint(1), Cl.uint(1)],
        bob
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should reject client completing milestone", () => {
      const { result } = simnet.callPublicFn(
        "escrow-multi-token",
        "complete-milestone",
        [Cl.uint(1), Cl.uint(1)],
        alice // Client, not freelancer
      );
      
      expect(result).toBeErr(Cl.uint(101)); // ERR-NOT-FREELANCER
    });

    it("should reject duplicate completion", () => {
      // Complete once
      simnet.callPublicFn(
        "escrow-multi-token",
        "complete-milestone",
        [Cl.uint(1), Cl.uint(1)],
        bob
      );

      // Try again
      const { result } = simnet.callPublicFn(
        "escrow-multi-token",
        "complete-milestone",
        [Cl.uint(1), Cl.uint(1)],
        bob
      );
      
      expect(result).toBeErr(Cl.uint(116)); // ERR-ALREADY-COMPLETE
    });
  });

  describe("Payment Release", () => {
    beforeEach(() => {
      // Create and complete milestone
      simnet.callPublicFn(
        "escrow-multi-token",
        "create-project-stx",
        [
          Cl.principal(bob),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
        ],
        alice
      );

      simnet.callPublicFn(
        "escrow-multi-token",
        "complete-milestone",
        [Cl.uint(1), Cl.uint(1)],
        bob
      );
    });

    it("should release payment with 10% fee", () => {
      const { result } = simnet.callPublicFn(
        "escrow-multi-token",
        "release-milestone-stx",
        [Cl.uint(1), Cl.uint(1)],
        alice
      );
      
      // 10 STX - 10% = 9 STX payout
      expect(result).toBeOk(Cl.uint(9000000));
    });

    it("should reject release by freelancer", () => {
      const { result } = simnet.callPublicFn(
        "escrow-multi-token",
        "release-milestone-stx",
        [Cl.uint(1), Cl.uint(1)],
        bob // Freelancer, not client
      );
      
      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-CLIENT
    });

    it("should reject release before completion", () => {
      // Create new project without completion
      simnet.callPublicFn(
        "escrow-multi-token",
        "create-project-stx",
        [
          Cl.principal(bob),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
        ],
        alice
      );

      const { result } = simnet.callPublicFn(
        "escrow-multi-token",
        "release-milestone-stx",
        [Cl.uint(2), Cl.uint(1)],
        alice
      );
      
      expect(result).toBeErr(Cl.uint(105)); // ERR-NOT-COMPLETE
    });
  });

  describe("Refunds", () => {
    it("should allow full refund with no activity", () => {
      simnet.callPublicFn(
        "escrow-multi-token",
        "create-project-stx",
        [
          Cl.principal(bob),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
        ],
        alice
      );

      const { result } = simnet.callPublicFn(
        "escrow-multi-token",
        "request-full-refund-stx",
        [Cl.uint(1)],
        alice
      );
      
      expect(result).toBeOk(Cl.uint(40000000)); // Full 40 STX
    });

    it("should reject refund after milestone completion", () => {
      simnet.callPublicFn(
        "escrow-multi-token",
        "create-project-stx",
        [
          Cl.principal(bob),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
        ],
        alice
      );

      simnet.callPublicFn(
        "escrow-multi-token",
        "complete-milestone",
        [Cl.uint(1), Cl.uint(1)],
        bob
      );

      const { result } = simnet.callPublicFn(
        "escrow-multi-token",
        "request-full-refund-stx",
        [Cl.uint(1)],
        alice
      );
      
      expect(result).toBeErr(Cl.uint(111)); // ERR-REFUND-NOT-ALLOWED
    });
  });

  describe("Read-Only Functions", () => {
    it("should read project details", () => {
      simnet.callPublicFn(
        "escrow-multi-token",
        "create-project-stx",
        [
          Cl.principal(bob),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
          Cl.uint(10000000),
        ],
        alice
      );

      const { result } = simnet.callReadOnlyFn(
        "escrow-multi-token",
        "get-project",
        [Cl.uint(1)],
        deployer
      );
      
      expect(result).toBeSome();
    });

    it("should return project count", () => {
      const { result } = simnet.callReadOnlyFn(
        "escrow-multi-token",
        "get-project-count",
        [],
        deployer
      );
      
      expect(result).toBeUint(0);
    });
  });
});
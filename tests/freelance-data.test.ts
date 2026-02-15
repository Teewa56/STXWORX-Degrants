import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

describe("Freelance Data Contract Tests", () => {
  
  describe("User Profile Management", () => {
    it("should create user profile", () => {
      const { result } = simnet.callPublicFn(
        "freelance-data",
        "create-user-profile",
        [
          Cl.stringAscii("alice_dev"),
          Cl.some(Cl.stringAscii("@alice_x")),
        ],
        alice
      );
      
      expect(result).toBeOk(Cl.principal(alice));
    });

    it("should reject duplicate profile", () => {
      simnet.callPublicFn(
        "freelance-data",
        "create-user-profile",
        [
          Cl.stringAscii("alice_dev"),
          Cl.none(),
        ],
        alice
      );

      const { result } = simnet.callPublicFn(
        "freelance-data",
        "create-user-profile",
        [
          Cl.stringAscii("alice_duplicate"),
          Cl.none(),
        ],
        alice
      );
      
      expect(result).toBeErr(Cl.uint(1002)); // ERR-ALREADY-EXISTS
    });

    it("should reject invalid username", () => {
      const { result } = simnet.callPublicFn(
        "freelance-data",
        "create-user-profile",
        [
          Cl.stringAscii("ab"), // Too short
          Cl.none(),
        ],
        alice
      );
      
      expect(result).toBeErr(Cl.uint(1005)); // ERR-INVALID-USERNAME
    });
  });

  describe("Category Management", () => {
    it("should allow admin to add category", () => {
      const { result } = simnet.callPublicFn(
        "freelance-data",
        "add-category",
        [
          Cl.stringAscii("Web Development"),
          Cl.stringAscii("💻"),
          Cl.list([
            Cl.stringAscii("Frontend"),
            Cl.stringAscii("Backend"),
          ]),
        ],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(1));
    });

    it("should reject non-admin category addition", () => {
      const { result } = simnet.callPublicFn(
        "freelance-data",
        "add-category",
        [
          Cl.stringAscii("Unauthorized"),
          Cl.stringAscii("🚫"),
          Cl.list([Cl.stringAscii("Test")]),
        ],
        alice
      );
      
      expect(result).toBeErr(Cl.uint(1000)); // ERR-UNAUTHORIZED
    });
  });

  describe("X Verification", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "freelance-data",
        "create-user-profile",
        [Cl.stringAscii("bob_dev"), Cl.none()],
        bob
      );
    });

    it("should update X verification", () => {
      const { result } = simnet.callPublicFn(
        "freelance-data",
        "update-x-verification",
        [Cl.stringAscii("@bob_verified")],
        bob
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });
});
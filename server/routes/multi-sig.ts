import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import {
  users,
  adminActions,
  type AdminAction,
  type InsertAdminAction
} from '@shared/schema';

const router = Router();

// Multi-sig configuration
const SIGNERS = process.env.MULTISIG_SIGNERS?.split(',') || [];
const THRESHOLD = parseInt(process.env.MULTISIG_THRESHOLD || '3');
const TIMELOCK = parseInt(process.env.MULTISIG_TIMELOCK || '86400'); // 24 hours
const MULTISIG_CONTRACT_ADDRESS = process.env.MULTISIG_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const MULTISIG_CONTRACT_NAME = 'freelance-security';

// Request schemas
const createProposalSchema = z.object({
  targetContract: z.string().min(1),
  functionName: z.string().min(1),
  functionArgs: z.array(z.string()),
  description: z.string().min(1).max(500),
});

const approveProposalSchema = z.object({
  proposalId: z.string().uuid(),
});

const executeProposalSchema = z.object({
  proposalId: z.string().uuid(),
});

// No longer using in-memory storage, using storage from ../storage
import { storage } from '../storage';
import { StacksService } from '../services/stacks';
import { authenticateToken } from '../middleware/auth';
import { type DaoProposal } from '@shared/schema';

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

// Create new multi-sig proposal
router.post('/proposals', authenticateToken, async (req: any, res) => {
  try {
    const { targetContract, functionName, functionArgs, description } = createProposalSchema.parse(req.body);
    const proposerId = req.user?.id;

    if (!proposerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify proposer is authorized signer (check by userId or linked stxAddress)
    const isAuthorized = await isAuthorizedSigner(proposerId);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to create proposals' });
    }

    const executeAt = new Date(Date.now() + TIMELOCK * 1000);

    const proposal = await storage.createDaoProposal({
      proposerId,
      targetContract,
      functionName,
      functionArgs,
      description,
      executeAt,
    });

    // Automatically approve by proposer
    await storage.addDaoApproval({
      proposalId: proposal.id,
      signerId: proposerId,
    });

    // Log admin action
    await logAdminAction(proposerId, 'CREATE_PROPOSAL', {
      proposalId: proposal.id,
      targetContract,
      functionName,
      description
    }, req.ip);

    res.json({
      success: true,
      data: proposal,
      message: 'Proposal created successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate proposal ID
function generateProposalId(): string {
  return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Check if user is authorized signer
async function isAuthorizedSigner(userId: string): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    if (!user || !user.stxAddress) return false;

    // Check if user's Stacks address is in the SIGNERS list
    return SIGNERS.includes(user.stxAddress);
  } catch (error) {
    console.error('Error verifying signer:', error);
    return false;
  }
}

// Log admin action
async function logAdminAction(adminId: string, actionType: string, actionData: any, ipAddress?: string): Promise<void> {
  try {
    await storage.createAdminAction({
      adminId,
      actionType,
      actionData,
      ipAddress
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

// Get all proposals
router.get('/proposals', async (req, res) => {
  try {
    const { status } = req.query;
    const allProposals = await storage.getDaoProposals(status as string);

    // Enhance with approvals count
    const enhancedProposals = await Promise.all(allProposals.map(async (p) => {
      const approvals = await storage.getDaoApprovals(p.id);
      return {
        ...p,
        approvals: approvals.map(a => a.signerId),
        approvalCount: approvals.length,
        threshold: THRESHOLD
      };
    }));

    res.json({
      success: true,
      data: enhancedProposals
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific proposal
router.get('/proposals/:proposalId', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const result = await storage.getDaoProposal(proposalId);

    if (!result) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json({
      success: true,
      data: {
        ...result.proposal,
        approvals: result.approvals.map(a => a.signerId),
        approvalCount: result.approvals.length,
        threshold: THRESHOLD
      }
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve proposal
router.post('/proposals/:proposalId/approve', authenticateToken, async (req: any, res) => {
  try {
    const { proposalId } = req.params;
    const approverId = req.user?.id;

    if (!approverId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify approver is authorized signer
    const isAuthorized = await isAuthorizedSigner(approverId);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to approve proposals' });
    }

    const result = await storage.getDaoProposal(proposalId);
    if (!result) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const { proposal, approvals } = result;
    if (proposal.status !== 'pending') {
      return res.status(400).json({ error: 'Proposal is not pending' });
    }

    if (approvals.find(a => a.signerId === approverId)) {
      return res.status(400).json({ error: 'Already approved this proposal' });
    }

    // Add approval
    await storage.addDaoApproval({
      proposalId,
      signerId: approverId
    });

    const newApprovalCount = approvals.length + 1;
    let newStatus = proposal.status;

    // Check if threshold is met
    if (newApprovalCount >= THRESHOLD) {
      newStatus = 'ready';
      await storage.updateDaoProposal(proposalId, { status: 'ready' });
    }

    // Log admin action
    await logAdminAction(approverId, 'APPROVE_PROPOSAL', {
      proposalId,
      currentApprovals: newApprovalCount,
      threshold: THRESHOLD
    }, req.ip);

    res.json({
      success: true,
      data: {
        proposalId,
        approvals: newApprovalCount,
        threshold: THRESHOLD,
        status: newStatus,
        canExecute: newStatus === 'ready' && new Date() >= proposal.executeAt
      }
    });

  } catch (error) {
    console.error('Error approving proposal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Execute proposal
router.post('/proposals/:proposalId/execute', authenticateToken, async (req: any, res) => {
  try {
    const { proposalId } = req.params;
    const executorId = req.user?.id;

    if (!executorId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify executor is authorized signer
    const isAuthorized = await isAuthorizedSigner(executorId);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to execute proposals' });
    }

    const result = await storage.getDaoProposal(proposalId);
    if (!result) return res.status(404).json({ error: 'Proposal not found' });

    const { proposal } = result;
    if (proposal.status !== 'ready') {
      return res.status(400).json({ error: 'Proposal is not ready for execution' });
    }

    if (new Date() < proposal.executeAt) {
      return res.status(400).json({
        error: 'Timelock not expired',
        executeAt: proposal.executeAt
      });
    }

    // Update status to executing to prevent double execution
    await storage.updateDaoProposal(proposalId, { status: 'executing' });

    // Execute the proposal on-chain
    const executionResult = await executeProposal(proposal);

    const finalStatus = executionResult.success ? 'executed' : 'failed';
    await storage.updateDaoProposal(proposalId, {
      status: finalStatus,
      executionTxId: executionResult.txHash,
      executionResult
    });

    // Log admin action
    await logAdminAction(executorId, 'EXECUTE_PROPOSAL', {
      proposalId,
      executionResult
    }, req.ip);

    res.json({
      success: true,
      data: {
        proposalId,
        status: finalStatus,
        executionResult
      }
    });

  } catch (error) {
    console.error('Error executing proposal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Execute proposal (call smart contract)
async function executeProposal(proposal: DaoProposal): Promise<any> {
  try {
    // Determine action-type for contract
    let actionType = "default";
    if (proposal.functionName.includes("pause")) actionType = "pause-contract";
    if (proposal.functionName.includes("treasury")) actionType = "set-treasury";

    // In production, we'd broadcast a transaction to the freelance-security contract
    // For now, we utilize the StacksService to perform the call
    const txId = await StacksService.executeProposalOnChain(proposal.onChainId || 0);

    return {
      success: true,
      txHash: txId,
      message: 'Transaction broadcasted to Stacks network'
    };
  } catch (error: any) {
    console.error('Error executing proposal on-chain:', error);
    return {
      success: false,
      error: error.message,
      txHash: null
    };
  }
}

// Get multi-sig status
router.get('/status', async (req, res) => {
  try {
    const allProposals = await storage.getDaoProposals();

    const status = {
      signers: SIGNERS,
      threshold: THRESHOLD,
      timelock: TIMELOCK,
      totalProposals: allProposals.length,
      pendingProposals: allProposals.filter(p => p.status === 'pending').length,
      readyProposals: allProposals.filter(p => p.status === 'ready').length,
      executedProposals: allProposals.filter(p => p.status === 'executed').length,
      failedProposals: allProposals.filter(p => p.status === 'failed').length,
      recentActivity: allProposals
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          description: p.description,
          status: p.status,
          createdAt: p.createdAt
        }))
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching multi-sig status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get proposal history
router.get('/history', async (req, res) => {
  try {
    const { signer } = req.query;

    let allProposals = await storage.getDaoProposals();

    // Filter by signer if provided
    if (signer) {
      const filtered = [];
      for (const p of allProposals) {
        const approvals = await storage.getDaoApprovals(p.id);
        if (p.proposerId === signer || approvals.some(a => a.signerId === signer)) {
          filtered.push(p);
        }
      }
      allProposals = filtered;
    }

    allProposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      data: allProposals
    });
  } catch (error) {
    console.error('Error fetching proposal history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel proposal (only proposer can cancel)
router.post('/proposals/:proposalId/cancel', authenticateToken, async (req: any, res) => {
  try {
    const { proposalId } = req.params;
    const cancellerId = req.user?.id;

    if (!cancellerId) return res.status(401).json({ error: 'Unauthorized' });

    const result = await storage.getDaoProposal(proposalId);
    if (!result) return res.status(404).json({ error: 'Proposal not found' });

    const { proposal } = result;
    if (proposal.proposerId !== cancellerId) {
      return res.status(403).json({ error: 'Only proposer can cancel proposal' });
    }

    if (proposal.status !== 'pending' && proposal.status !== 'ready') {
      return res.status(400).json({ error: 'Cannot cancel proposal in current status' });
    }

    await storage.updateDaoProposal(proposalId, { status: 'cancelled' });

    // Log admin action
    await logAdminAction(cancellerId, 'CANCEL_PROPOSAL', {
      proposalId,
      reason: 'Cancelled by proposer'
    }, req.ip);

    res.json({
      success: true,
      data: {
        proposalId,
        status: 'cancelled'
      }
    });

  } catch (error) {
    console.error('Error cancelling proposal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get signer information
router.get('/signers', async (req, res) => {
  try {
    const signerInfo = await Promise.all(
      SIGNERS.map(async (signerId) => {
        const user = await storage.getUser(signerId);

        return {
          id: signerId,
          username: user ? user.username : 'Unknown',
          isAuthorized: true
        };
      })
    );

    res.json({
      success: true,
      data: {
        signers: signerInfo,
        threshold: THRESHOLD,
        totalSigners: SIGNERS.length
      }
    });
  } catch (error) {
    console.error('Error fetching signers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

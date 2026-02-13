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

// In-memory storage for proposals (in production, use database)
const proposals = new Map<string, any>();
const approvals = new Map<string, Set<string>>();

// Create new multi-sig proposal
router.post('/proposals', async (req, res) => {
  try {
    const { targetContract, functionName, functionArgs, description } = createProposalSchema.parse(req.body);
    const proposerId = req.user?.id; // TODO: Get from auth
    
    // Verify proposer is authorized signer
    if (!isAuthorizedSigner(proposerId)) {
      return res.status(403).json({ error: 'Not authorized to create proposals' });
    }
    
    const proposalId = generateProposalId();
    const executeAt = new Date(Date.now() + TIMELOCK * 1000);
    
    const proposal = {
      id: proposalId,
      proposerId,
      targetContract,
      functionName,
      functionArgs,
      description,
      status: 'pending',
      createdAt: new Date(),
      executeAt,
      approvals: [],
      executionResult: null
    };
    
    proposals.set(proposalId, proposal);
    approvals.set(proposalId, new Set());
    
    // Log admin action
    await logAdminAction(proposerId, 'CREATE_PROPOSAL', {
      proposalId,
      targetContract,
      functionName,
      description
    });
    
    res.json({
      success: true,
      data: proposal,
      message: 'Proposal created successfully'
    });
    
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate proposal ID
function generateProposalId(): string {
  return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Check if user is authorized signer
function isAuthorizedSigner(userId: string): boolean {
  // TODO: Implement proper signer verification
  // For now, check against environment variable
  return SIGNERS.includes(userId);
}

// Log admin action
async function logAdminAction(adminId: string, actionType: string, actionData: any): Promise<void> {
  try {
    await db.insert(adminActions)
      .values({
        adminId,
        actionType,
        actionData,
        ipAddress: req.ip // TODO: Get proper IP
      })
      .execute();
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

// Get all proposals
router.get('/proposals', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let allProposals = Array.from(proposals.values());
    
    // Filter by status if provided
    if (status) {
      allProposals = allProposals.filter(p => p.status === status);
    }
    
    // Sort by creation date (newest first)
    allProposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Paginate
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedProposals = allProposals.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedProposals,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: allProposals.length,
        totalPages: Math.ceil(allProposals.length / parseInt(limit as string))
      }
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
    
    const proposal = proposals.get(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve proposal
router.post('/proposals/:proposalId/approve', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const approverId = req.user?.id; // TODO: Get from auth
    
    // Verify approver is authorized signer
    if (!isAuthorizedSigner(approverId)) {
      return res.status(403).json({ error: 'Not authorized to approve proposals' });
    }
    
    const proposal = proposals.get(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    if (proposal.status !== 'pending') {
      return res.status(400).json({ error: 'Proposal is not pending' });
    }
    
    const proposalApprovals = approvals.get(proposalId) || new Set();
    
    if (proposalApprovals.has(approverId)) {
      return res.status(400).json({ error: 'Already approved this proposal' });
    }
    
    // Add approval
    proposalApprovals.add(approverId);
    approvals.set(proposalId, proposalApprovals);
    
    proposal.approvals = Array.from(proposalApprovals);
    
    // Check if threshold is met
    if (proposalApprovals.size >= THRESHOLD) {
      proposal.status = 'ready';
    }
    
    // Log admin action
    await logAdminAction(approverId, 'APPROVE_PROPOSAL', {
      proposalId,
      currentApprovals: proposalApprovals.size,
      threshold: THRESHOLD
    });
    
    res.json({
      success: true,
      data: {
        proposalId,
        approvals: proposalApprovals.size,
        threshold: THRESHOLD,
        status: proposal.status,
        canExecute: proposal.status === 'ready' && new Date() >= proposal.executeAt
      }
    });
    
  } catch (error) {
    console.error('Error approving proposal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Execute proposal
router.post('/proposals/:proposalId/execute', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const executorId = req.user?.id; // TODO: Get from auth
    
    // Verify executor is authorized signer
    if (!isAuthorizedSigner(executorId)) {
      return res.status(403).json({ error: 'Not authorized to execute proposals' });
    }
    
    const proposal = proposals.get(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    if (proposal.status !== 'ready') {
      return res.status(400).json({ error: 'Proposal is not ready for execution' });
    }
    
    if (new Date() < proposal.executeAt) {
      return res.status(400).json({ 
        error: 'Timelock not expired',
        executeAt: proposal.executeAt
      });
    }
    
    // Execute the proposal
    const executionResult = await executeProposal(proposal);
    
    proposal.status = executionResult.success ? 'executed' : 'failed';
    proposal.executionResult = executionResult;
    proposal.executedAt = new Date();
    
    // Log admin action
    await logAdminAction(executorId, 'EXECUTE_PROPOSAL', {
      proposalId,
      executionResult
    });
    
    res.json({
      success: true,
      data: {
        proposalId,
        status: proposal.status,
        executionResult
      }
    });
    
  } catch (error) {
    console.error('Error executing proposal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Execute proposal (call smart contract)
async function executeProposal(proposal: any): Promise<any> {
  try {
    // TODO: Implement actual smart contract execution
    // For now, simulate execution
    
    console.log(`Executing proposal ${proposal.id}:`);
    console.log(`Target: ${proposal.targetContract}`);
    console.log(`Function: ${proposal.functionName}`);
    console.log(`Args: ${proposal.functionArgs.join(', ')}`);
    
    // Simulate different execution scenarios
    const executionScenarios = {
      'pause-escrow': { success: true, txHash: '0xabc123...', message: 'Escrow paused successfully' },
      'emergency-withdraw': { success: true, txHash: '0xdef456...', message: 'Emergency withdrawal executed' },
      'update-contract': { success: true, txHash: '0xghi789...', message: 'Contract updated successfully' },
      'default': { success: true, txHash: '0xjkl012...', message: 'Transaction executed successfully' }
    };
    
    const scenario = executionScenarios[proposal.functionName as keyof typeof executionScenarios] || executionScenarios.default;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return scenario;
  } catch (error) {
    console.error('Error executing proposal:', error);
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
    const allProposals = Array.from(proposals.values());
    
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
    const { page = 1, limit = 50, signer } = req.query;
    
    let allProposals = Array.from(proposals.values());
    
    // Filter by signer if provided
    if (signer) {
      allProposals = allProposals.filter(p => 
        p.proposerId === signer || p.approvals.includes(signer as string)
      );
    }
    
    // Sort by execution date (most recent first)
    allProposals.sort((a, b) => {
      const dateA = a.executedAt || a.createdAt;
      const dateB = b.executedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    // Paginate
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedProposals = allProposals.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedProposals,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: allProposals.length,
        totalPages: Math.ceil(allProposals.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching proposal history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel proposal (only proposer can cancel)
router.post('/proposals/:proposalId/cancel', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const cancellerId = req.user?.id; // TODO: Get from auth
    
    const proposal = proposals.get(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    if (proposal.proposerId !== cancellerId) {
      return res.status(403).json({ error: 'Only proposer can cancel proposal' });
    }
    
    if (proposal.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel proposal in current status' });
    }
    
    proposal.status = 'cancelled';
    proposal.cancelledAt = new Date();
    
    // Log admin action
    await logAdminAction(cancellerId, 'CANCEL_PROPOSAL', {
      proposalId,
      reason: 'Cancelled by proposer'
    });
    
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
        const user = await db.select({
          id: users.id,
          username: users.username
        })
          .from(users)
          .where((users, { eq: users.id, signerId }))
          .limit(1)
          .execute();
        
        return {
          id: signerId,
          username: user.length > 0 ? user[0].username : 'Unknown',
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

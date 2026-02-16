# User Flows - STXWORX V2 Platform

This document outlines the primary user journeys for the three main roles: **Freelancer**, **Client**, and **Admin**.

---

## 1. Collaborative Onboarding (All Users)
All users go through a unified authentication and onboarding process before accessing their specific dashboards.

1.  **Registration / Login**
    -   User visits `/auth`.
    -   **Sign Up**: Enters Username and Password.
    -   **Login**: Enters credentials (checks MFA if enabled).
2.  **Onboarding** (First-time only)
    -   User is redirected to `/onboarding`.
    -   **Step 1: Role Selection**: Choose "Client" or "Freelancer".
    -   **Step 2: Profile Details**: Enter Display Name, Title, and Bio.
    -   **Step 3: Social Sync**: Connect X (Twitter) account for identity verification.
3.  **Dashboard Access**
    -   Upon completion, user is routed to their role-specific dashboard (`/client` or `/freelancer`).

---

## 2. Client User Flow
Clients focus on posting jobs, reviewing talent, and managing project funds.

### A. Posting a Job
1.  Navigate to **Client Dashboard**.
2.  Click **Post New Project** tab.
3.  Fill in project details:
    -   **Budget**: Total amount and Token (STX / sBTC).
    -   **Description**: Detailed requirements.
    -   **Milestones**: Define deliverables for up to 4 milestones.
4.  **Publish**: Click "Post Project".
    -   *Status*: `PENDING` (Open for applications).
    -   *Note*: No funds are locked at this stage.

### B. Hiring a Freelancer
1.  Go to **My Projects** in the dashboard.
2.  Expand a project card to view **Applications**.
3.  Review proposals (Bid Amount, Freelancer Stats).
4.  Click **Hire** on the chosen freelancer.
5.  **Wallet Interaction**:
    -   The Leather/Xverse wallet popup appears.
    -   Client confirms the transaction to lock the **Total Budget** into the Escrow Contract.
6.  **Confirmation**:
    -   Once the transaction is mined on Stacks, the project status updates to `ACTIVE`.
    -   Freelancer is notified.

### C. Managing an Active Project
1.  **Communication**: Use the **Chat Widget** (bottom-right) to discuss requirements with the freelancer.
2.  **Milestone Review**:
    -   When a freelancer submits work, the specific milestone indicator turns yellow (⏳).
3.  **Release Funds**:
    -   Review the submitted work/proof.
    -   Click **Release Milestone**.
    -   **Wallet Interaction**: Confirm the transaction to release the % of funds for that milestone to the freelancer.
    -   *Status*: Milestone turns green (✅).

---

## 3. Freelancer User Flow
Freelancers focus on finding work, submitting deliverables, and building reputation.

### A. Finding Work
1.  Navigate to **Browse Projects**.
2.  Filter active listings by Category or Token Type.
3.  Click on a project to view details (Milestones, Budget, Client Reputation).

### B. Applying
1.  Click **Apply Now** on a Project Card.
2.  **Submit Proposal**:
    -   **Bid Amount**: Can be different from the client's budget.
    -   **Message**: Pitch why you are the best fit.
3.  **Track Status**:
    -   Go to **Freelancer Dashboard > My Applications**.
    -   Status: `PENDING` -> `ACCEPTED` (Hired) or `REJECTED`.

### C. Working & Getting Paid
1.  **Project Activation**:
    -   Once hired, the project appears in **Freelancer Dashboard > Active Jobs**.
2.  **Execution**:
    -   Communicate via **Chat Widget**.
    -   Complete the work for the current milestone.
3.  **Submit Work**:
    -   Click **Complete Milestone X**.
    -   Provide a description or link to the deliverable.
    -   Status updates to "Submitted" (Waiting for Client).
4.  **Payment**:
    -   Receive funds in your Stacks wallet once the Client approves the milestone release.
    -   Platform fees (if any) are deducted automatically by the smart contract.

---

## 4. Admin User Flow
Admins oversee platform health and handle disputes.

### A. Platform Management
1.  Navigate to **Admin Dashboard**.
2.  **User Oversight**: View list of all users, their verification status, and recent activity.
3.  **Project Oversight**: Monitor active escrows and platform volume.

### B. Dispute Resolution (Future V2.1)
1.  If a Client/Freelancer dispute arises:
    -   Admin reviews the Chat History and Evidence.
    -   Admin interacts with the Dispute Contract to override the escrow lock (releasing funds to either party or splitting).

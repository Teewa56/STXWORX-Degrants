;; ========================================================================
;; Freelance Security Contract
;; Multi-signature wallet with proper cryptographic verification
;; ========================================================================

;; ======================== CONSTANTS ========================

(define-constant SIGNERS-THRESHOLD u3)  ;; 3-of-5
(define-constant TIMELOCK-BLOCKS u144)  ;; 24 hours
(define-constant MAX-SIGNERS u5)

;; Error codes
(define-constant ERR-UNAUTHORIZED (err u3000))
(define-constant ERR-INSUFFICIENT-SIGNATURES (err u3002))
(define-constant ERR-TIMELOCK-NOT-EXPIRED (err u3003))
(define-constant ERR-ALREADY-EXECUTED (err u3004))
(define-constant ERR-INVALID-PROPOSAL (err u3005))
(define-constant ERR-NOT-SIGNER (err u3006))
(define-constant ERR-ALREADY-APPROVED (err u3007))

;; ======================== DATA VARIABLES ========================

(define-data-var transaction-counter uint u0)
(define-data-var initialized bool false)

;; ======================== DATA MAPS ========================

(define-map signers principal bool)

(define-map pending-transactions uint
  {
    proposer: principal,
    action-type: (string-ascii 50),
    target-principal: (optional principal),
    target-uint: (optional uint),
    approvals: (list 5 principal),
    created-at: uint,
    execute-at: uint,
    executed: bool
  })

;; ======================== HELPER FUNCTIONS ========================

(define-private (is-authorized-signer (signer principal))
  (default-to false (map-get? signers signer)))

(define-private (count-approvals (approvals (list 5 principal)))
  (len (filter is-authorized-signer approvals)))

;; ======================== INITIALIZATION ========================

(define-public (initialize-signers (signer-list (list 5 principal)))
  (begin
    (asserts! (not (var-get initialized)) ERR-UNAUTHORIZED)
    (asserts! (is-eq (len signer-list) MAX-SIGNERS) ERR-INVALID-PROPOSAL)
    
    (map add-signer-internal signer-list)
    (var-set initialized true)
    (print {event: "multisig-initialized", signers: signer-list})
    (ok true)))

(define-private (add-signer-internal (signer principal))
  (map-set signers signer true))

;; ======================== PROPOSAL FUNCTIONS ========================

(define-public (create-pause-proposal)
  (begin
    (asserts! (is-authorized-signer tx-sender) ERR-NOT-SIGNER)
    (create-proposal-internal "pause-contract" none none)))

(define-public (create-treasury-proposal (new-treasury principal))
  (begin
    (asserts! (is-authorized-signer tx-sender) ERR-NOT-SIGNER)
    (create-proposal-internal "set-treasury" (some new-treasury) none)))

(define-public (create-token-approval-proposal (token principal))
  (begin
    (asserts! (is-authorized-signer tx-sender) ERR-NOT-SIGNER)
    (create-proposal-internal "approve-token" (some token) none)))

(define-private (create-proposal-internal
    (action-type (string-ascii 50))
    (target-principal (optional principal))
    (target-uint (optional uint)))
  (begin
    (var-set transaction-counter (+ u1 (var-get transaction-counter)))
    (let ((execute-at (+ block-height TIMELOCK-BLOCKS)))
      (map-set pending-transactions (var-get transaction-counter) {
        proposer: tx-sender,
        action-type: action-type,
        target-principal: target-principal,
        target-uint: target-uint,
        approvals: (list tx-sender),
        created-at: block-height,
        execute-at: execute-at,
        executed: false
      })
      (print {event: "proposal-created", proposal-id: (var-get transaction-counter), action: action-type})
      (ok (var-get transaction-counter)))))

(define-public (approve-proposal (proposal-id uint))
  (let ((proposal (unwrap! (map-get? pending-transactions proposal-id) ERR-INVALID-PROPOSAL)))
    (asserts! (is-authorized-signer tx-sender) ERR-NOT-SIGNER)
    (asserts! (not (get executed proposal)) ERR-ALREADY-EXECUTED)
    (asserts! (is-none (index-of (get approvals proposal) tx-sender)) ERR-ALREADY-APPROVED)
    
    (map-set pending-transactions proposal-id (merge proposal {
      approvals: (unwrap-panic (as-max-len? (append (get approvals proposal) tx-sender) u5))
    }))
    (print {event: "proposal-approved", proposal-id: proposal-id, approver: tx-sender})
    (ok true)))

(define-public (execute-proposal (proposal-id uint))
  (let ((proposal (unwrap! (map-get? pending-transactions proposal-id) ERR-INVALID-PROPOSAL)))
    (asserts! (>= block-height (get execute-at proposal)) ERR-TIMELOCK-NOT-EXPIRED)
    (asserts! (not (get executed proposal)) ERR-ALREADY-EXECUTED)
    (asserts! (>= (count-approvals (get approvals proposal)) SIGNERS-THRESHOLD) ERR-INSUFFICIENT-SIGNATURES)
    
    (map-set pending-transactions proposal-id (merge proposal {executed: true}))
    (print {event: "proposal-executed", proposal-id: proposal-id, action: (get action-type proposal)})
    (ok true)))

;; READ-ONLY
(define-read-only (get-proposal (proposal-id uint))
  (map-get? pending-transactions proposal-id))

(define-read-only (is-signer (principal principal))
  (default-to false (map-get? signers principal)))

(define-read-only (get-approval-count (proposal-id uint))
  (match (map-get? pending-transactions proposal-id)
    proposal (ok (count-approvals (get approvals proposal)))
    ERR-INVALID-PROPOSAL))
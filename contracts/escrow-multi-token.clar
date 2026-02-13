;; ========================================================================
;; Freelance Escrow v3.0 - Multi-Token Support (STX + sBTC)
;; Supports both native STX and sBTC (SIP-010) tokens
;; Deployable on Stacks Testnet/Mainnet - Nov 2025
;; ========================================================================

;; ======================== TRAITS ========================

;; SIP-010 Fungible Token Trait
(define-trait sip010-ft-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    (get-balance (principal) (response uint uint))
  ))

;; ======================== CONSTANTS ========================

(define-constant FEE-PERCENT u1000)      ;; 10% = 1000 basis points (10%)
(define-constant REFUND-TIMEOUT u144)   ;; ~24 hours (10 min blocks)
(define-constant MAX-MILESTONES u4)     ;; Fixed 4 milestones

;; Token types
(define-constant TOKEN-STX u0)
(define-constant TOKEN-SBTC u1)

;; Error codes
(define-constant ERR-NOT-CLIENT (err u100))
(define-constant ERR-NOT-FREELANCER (err u101))
(define-constant ERR-PROJECT-NOT-FOUND (err u102))
(define-constant ERR-INVALID-MILESTONE (err u103))
(define-constant ERR-NOT-FUNDED (err u104))
(define-constant ERR-NOT-COMPLETE (err u105))
(define-constant ERR-ALREADY-RELEASED (err u106))
(define-constant ERR-INVALID-AMOUNT (err u108))
(define-constant ERR-REFUND-NOT-ALLOWED (err u111))
(define-constant ERR-ALREADY-REFUNDED (err u112))
(define-constant ERR-NOT-OWNER (err u113))
(define-constant ERR-TOO-MANY-MILESTONES (err u114))
(define-constant ERR-ALREADY-COMPLETE (err u116))
(define-constant ERR-INVALID-TOKEN (err u117))
(define-constant ERR-INSUFFICIENT_BALANCE (err u118))

;; ======================== DATA VARIABLES ========================

(define-data-var project-counter uint u0)
(define-data-var treasury principal tx-sender)
(define-data-var contract-owner principal tx-sender)

;; ======================== DATA MAPS ========================

(define-map projects uint
  {
    client: principal,
    freelancer: principal,
    total-amount: uint,
    num-milestones: uint,
    refunded: bool,
    created-at: uint,
    token-type: uint  ;; 0 = STX, 1 = sBTC
  })

;; Individual milestone tracking (project-id, milestone-index) -> milestone-data
(define-map milestones {project-id: uint, milestone-num: uint}
  {
    amount: uint,
    complete: bool,
    released: bool
  })

;; ======================== HELPER FUNCTIONS ========================

;; Validate milestone number (1-4)
(define-private (valid-milestone (n uint))
  (and (>= n u1) (<= n MAX-MILESTONES)))

;; Validate token type
(define-private (valid-token-type (t uint))
  (or (is-eq t TOKEN-STX) (is-eq t TOKEN-SBTC)))

;; ======================== ADMIN FUNCTIONS ========================

;; Update treasury address
(define-public (set-treasury (new principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (asserts! (not (is-eq new (var-get treasury))) ERR-INVALID-AMOUNT)
    (var-set treasury new)
    (print {event: "treasury-updated", new-treasury: new})
    (ok true)))

;; Transfer contract ownership
(define-public (transfer-ownership (new principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (asserts! (not (is-eq new (var-get contract-owner))) ERR-INVALID-AMOUNT)
    (var-set contract-owner new)
    (print {event: "ownership-transferred", new-owner: new})
    (ok true)))

;; Get sBTC balance (public because it calls another contract)
(define-public (get-balance-sbtc (sbtc-token <sip010-ft-trait>))
  (contract-call? sbtc-token get-balance (as-contract tx-sender)))

;; ======================== CORE FUNCTIONS - STX ========================

;; Create a new project with STX
(define-public (create-project-stx
    (freelancer principal)
    (m1 uint) (m2 uint) (m3 uint) (m4 uint))
  (let (
    (id (+ (var-get project-counter) u1))
    (total (+ m1 (+ m2 (+ m3 m4))))
    (num-milestones (+ (if (> m1 u0) u1 u0)
                       (+ (if (> m2 u0) u1 u0)
                          (+ (if (> m3 u0) u1 u0)
                             (if (> m4 u0) u1 u0)))))
  )
    ;; Validations
    (asserts! (> total u0) ERR-INVALID-AMOUNT)
    (asserts! (not (is-eq tx-sender freelancer)) ERR-NOT-CLIENT)
    (asserts! (and (> num-milestones u0) (<= num-milestones MAX-MILESTONES)) ERR-TOO-MANY-MILESTONES)

    ;; Transfer STX to contract
    (try! (stx-transfer? total tx-sender (as-contract tx-sender)))

    ;; Create project
    (var-set project-counter id)
    (map-set projects id {
      client: tx-sender,
      freelancer: freelancer,
      total-amount: total,
      num-milestones: num-milestones,
      refunded: false,
      created-at: burn-block-height,
      token-type: TOKEN-STX
    })
    
    ;; Create milestones
    (if (> m1 u0) (map-set milestones {project-id: id, milestone-num: u1} {amount: m1, complete: false, released: false}) true)
    (if (> m2 u0) (map-set milestones {project-id: id, milestone-num: u2} {amount: m2, complete: false, released: false}) true)
    (if (> m3 u0) (map-set milestones {project-id: id, milestone-num: u3} {amount: m3, complete: false, released: false}) true)
    (if (> m4 u0) (map-set milestones {project-id: id, milestone-num: u4} {amount: m4, complete: false, released: false}) true)
    
    (print {
      event: "project-created",
      project-id: id,
      client: tx-sender,
      freelancer: freelancer,
      total-amount: total,
      num-milestones: num-milestones,
      token: "STX"
    })
    (ok id)))

;; ======================== CORE FUNCTIONS - sBTC ========================

;; Create a new project with sBTC
;; NOTE: Client must transfer sBTC to this contract BEFORE calling this function
;; The frontend should execute: (contract-call? sbtc-token transfer total client-addr escrow-contract-addr none)
(define-public (create-project-sbtc
    (freelancer principal)
    (m1 uint) (m2 uint) (m3 uint) (m4 uint)
    (sbtc-token <sip010-ft-trait>))
  (let (
    (id (+ (var-get project-counter) u1))
    (total (+ m1 (+ m2 (+ m3 m4))))
    (num-milestones (+ (if (> m1 u0) u1 u0)
                       (+ (if (> m2 u0) u1 u0)
                          (+ (if (> m3 u0) u1 u0)
                             (if (> m4 u0) u1 u0)))))
    (contract-addr (as-contract tx-sender))
    (balance-before (unwrap! (contract-call? sbtc-token get-balance contract-addr) ERR-INSUFFICIENT_BALANCE))
  )
    ;; Validations
    (asserts! (> total u0) ERR-INVALID-AMOUNT)
    (asserts! (not (is-eq tx-sender freelancer)) ERR-NOT-CLIENT)
    (asserts! (and (> num-milestones u0) (<= num-milestones MAX-MILESTONES)) ERR-TOO-MANY-MILESTONES)
    
    ;; Verify contract has sufficient sBTC balance
    ;; Client should have transferred sBTC to contract before calling this
    (asserts! (>= balance-before total) ERR-INSUFFICIENT_BALANCE)

    ;; Create project
    (var-set project-counter id)
    (map-set projects id {
      client: tx-sender,
      freelancer: freelancer,
      total-amount: total,
      num-milestones: num-milestones,
      refunded: false,
      created-at: burn-block-height,
      token-type: TOKEN-SBTC
    })
    
    ;; Create milestones
    (if (> m1 u0) (map-set milestones {project-id: id, milestone-num: u1} {amount: m1, complete: false, released: false}) true)
    (if (> m2 u0) (map-set milestones {project-id: id, milestone-num: u2} {amount: m2, complete: false, released: false}) true)
    (if (> m3 u0) (map-set milestones {project-id: id, milestone-num: u3} {amount: m3, complete: false, released: false}) true)
    (if (> m4 u0) (map-set milestones {project-id: id, milestone-num: u4} {amount: m4, complete: false, released: false}) true)
    
    (print {
      event: "project-created",
      project-id: id,
      client: tx-sender,
      freelancer: freelancer,
      total-amount: total,
      num-milestones: num-milestones,
      token: "sBTC",
      balance-before: balance-before
    })
    (ok id)))

;; ======================== SHARED FUNCTIONS ========================

;; Freelancer marks milestone as complete
(define-public (complete-milestone (project-id uint) (milestone-num uint))
  (let (
    (project (unwrap! (map-get? projects project-id) ERR-PROJECT-NOT-FOUND))
    (milestone (unwrap! (map-get? milestones {project-id: project-id, milestone-num: milestone-num}) ERR-INVALID-MILESTONE))
  )
    (asserts! (is-eq tx-sender (get freelancer project)) ERR-NOT-FREELANCER)
    (asserts! (valid-milestone milestone-num) ERR-INVALID-MILESTONE)
    (asserts! (not (get refunded project)) ERR-ALREADY-REFUNDED)
    (asserts! (not (get complete milestone)) ERR-ALREADY-COMPLETE)

    (map-set milestones {project-id: project-id, milestone-num: milestone-num}
      (merge milestone {complete: true}))
    
    (print {
      event: "milestone-completed",
      project-id: project-id,
      milestone: milestone-num,
      freelancer: tx-sender
    })
    (ok true)))

;; ======================== RELEASE FUNCTIONS ========================

;; Client releases STX payment for completed milestone
(define-public (release-milestone-stx (project-id uint) (milestone-num uint))
  (let (
    (project (unwrap! (map-get? projects project-id) ERR-PROJECT-NOT-FOUND))
    (milestone (unwrap! (map-get? milestones {project-id: project-id, milestone-num: milestone-num}) ERR-INVALID-MILESTONE))
    (amount (get amount milestone))
    (fee (/ (* amount FEE-PERCENT) u10000))
    (payout (- amount fee))
  )
    (asserts! (is-eq tx-sender (get client project)) ERR-NOT-CLIENT)
    (asserts! (valid-milestone milestone-num) ERR-INVALID-MILESTONE)
    (asserts! (not (get refunded project)) ERR-ALREADY-REFUNDED)
    (asserts! (is-eq (get token-type project) TOKEN-STX) ERR-INVALID-TOKEN)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (get complete milestone) ERR-NOT-COMPLETE)
    (asserts! (not (get released milestone)) ERR-ALREADY-RELEASED)

    ;; Transfer payout to freelancer
    (try! (as-contract (stx-transfer? payout tx-sender (get freelancer project))))
    
    ;; Transfer fee to treasury if > 0
    (if (> fee u0)
      (try! (as-contract (stx-transfer? fee tx-sender (var-get treasury))))
      true)

    (map-set milestones {project-id: project-id, milestone-num: milestone-num}
      (merge milestone {released: true}))
    
    (print {
      event: "milestone-released",
      project-id: project-id,
      milestone: milestone-num,
      amount: amount,
      payout: payout,
      fee: fee,
      token: "STX"
    })
    (ok payout)))

;; Client releases sBTC payment for completed milestone
(define-public (release-milestone-sbtc (project-id uint) (milestone-num uint) (sbtc-token <sip010-ft-trait>))
  (let (
    (project (unwrap! (map-get? projects project-id) ERR-PROJECT-NOT-FOUND))
    (milestone (unwrap! (map-get? milestones {project-id: project-id, milestone-num: milestone-num}) ERR-INVALID-MILESTONE))
    (amount (get amount milestone))
    (fee (/ (* amount FEE-PERCENT) u10000))
    (payout (- amount fee))
  )
    (asserts! (is-eq tx-sender (get client project)) ERR-NOT-CLIENT)
    (asserts! (valid-milestone milestone-num) ERR-INVALID-MILESTONE)
    (asserts! (not (get refunded project)) ERR-ALREADY-REFUNDED)
    (asserts! (is-eq (get token-type project) TOKEN-SBTC) ERR-INVALID-TOKEN)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (get complete milestone) ERR-NOT-COMPLETE)
    (asserts! (not (get released milestone)) ERR-ALREADY-RELEASED)

    ;; Transfer payout to freelancer
    (try! (as-contract (contract-call? sbtc-token transfer payout tx-sender (get freelancer project) none)))
    
    ;; Transfer fee to treasury if > 0
    (if (> fee u0)
      (try! (as-contract (contract-call? sbtc-token transfer fee tx-sender (var-get treasury) none)))
      true)

    (map-set milestones {project-id: project-id, milestone-num: milestone-num}
      (merge milestone {released: true}))
    
    (print {
      event: "milestone-released",
      project-id: project-id,
      milestone: milestone-num,
      amount: amount,
      payout: payout,
      fee: fee,
      token: "sBTC"
    })
    (ok payout)))

;; ======================== REFUND FUNCTIONS ========================

;; Helper to check if any milestone is complete or released
(define-private (has-activity (project-id uint) (num-milestones uint))
  (or (or (is-milestone-active project-id u1)
          (is-milestone-active project-id u2))
      (or (is-milestone-active project-id u3)
          (is-milestone-active project-id u4))))

(define-private (is-milestone-active (project-id uint) (milestone-num uint))
  (match (map-get? milestones {project-id: project-id, milestone-num: milestone-num})
    m (or (get complete m) (get released m))
    false))

;; Request full refund STX (only if nothing completed or released)
(define-public (request-full-refund-stx (project-id uint))
  (let ((project (unwrap! (map-get? projects project-id) ERR-PROJECT-NOT-FOUND)))
    (asserts! (is-eq tx-sender (get client project)) ERR-NOT-CLIENT)
    (asserts! (not (get refunded project)) ERR-ALREADY-REFUNDED)
    (asserts! (is-eq (get token-type project) TOKEN-STX) ERR-INVALID-TOKEN)
    (asserts! (not (has-activity project-id (get num-milestones project))) ERR-REFUND-NOT-ALLOWED)

    (let ((total (get total-amount project)))
      (try! (as-contract (stx-transfer? total tx-sender (get client project))))
      (map-set projects project-id (merge project {refunded: true}))
      
      (print {
        event: "full-refund",
        project-id: project-id,
        amount: total,
        client: (get client project),
        token: "STX"
      })
      (ok total))))

;; Request full refund sBTC
(define-public (request-full-refund-sbtc (project-id uint) (sbtc-token <sip010-ft-trait>))
  (let (
    (project (unwrap! (map-get? projects project-id) ERR-PROJECT-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (get client project)) ERR-NOT-CLIENT)
    (asserts! (not (get refunded project)) ERR-ALREADY-REFUNDED)
    (asserts! (is-eq (get token-type project) TOKEN-SBTC) ERR-INVALID-TOKEN)
    (asserts! (not (has-activity project-id (get num-milestones project))) ERR-REFUND-NOT-ALLOWED)

    (let ((total (get total-amount project)))
      (try! (as-contract (contract-call? sbtc-token transfer total tx-sender (get client project) none)))
      (map-set projects project-id (merge project {refunded: true}))
      
      (print {
        event: "full-refund",
        project-id: project-id,
        amount: total,
        client: (get client project),
        token: "sBTC"
      })
      (ok total))))

;; Calculate released amount
(define-private (calc-released (project-id uint))
  (+ (get-milestone-released project-id u1)
     (+ (get-milestone-released project-id u2)
        (+ (get-milestone-released project-id u3)
           (get-milestone-released project-id u4)))))

(define-private (get-milestone-released (project-id uint) (milestone-num uint))
  (match (map-get? milestones {project-id: project-id, milestone-num: milestone-num})
    m (if (get released m) (get amount m) u0)
    u0))

;; Emergency refund STX after timeout
(define-public (emergency-refund-stx (project-id uint))
  (let ((project (unwrap! (map-get? projects project-id) ERR-PROJECT-NOT-FOUND)))
    (asserts! (is-eq tx-sender (get client project)) ERR-NOT-CLIENT)
    (asserts! (not (get refunded project)) ERR-ALREADY-REFUNDED)
    (asserts! (is-eq (get token-type project) TOKEN-STX) ERR-INVALID-TOKEN)
    (asserts! (>= (- burn-block-height (get created-at project)) REFUND-TIMEOUT) ERR-REFUND-NOT-ALLOWED)

    (let (
      (total (get total-amount project))
      (released-total (calc-released project-id))
      (refund-amount (- total released-total))
    )
      (asserts! (> refund-amount u0) ERR-REFUND-NOT-ALLOWED)
      
      (try! (as-contract (stx-transfer? refund-amount tx-sender (get client project))))
      (map-set projects project-id (merge project {refunded: true}))
      
      (print {
        event: "emergency-refund",
        project-id: project-id,
        refund-amount: refund-amount,
        released-amount: released-total,
        client: (get client project),
        token: "STX"
      })
      (ok refund-amount))))

;; Emergency refund sBTC after timeout
(define-public (emergency-refund-sbtc (project-id uint) (sbtc-token <sip010-ft-trait>))
  (let (
    (project (unwrap! (map-get? projects project-id) ERR-PROJECT-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (get client project)) ERR-NOT-CLIENT)
    (asserts! (not (get refunded project)) ERR-ALREADY-REFUNDED)
    (asserts! (is-eq (get token-type project) TOKEN-SBTC) ERR-INVALID-TOKEN)
    (asserts! (>= (- burn-block-height (get created-at project)) REFUND-TIMEOUT) ERR-REFUND-NOT-ALLOWED)

    (let (
      (total (get total-amount project))
      (released-total (calc-released project-id))
      (refund-amount (- total released-total))
    )
      (asserts! (> refund-amount u0) ERR-REFUND-NOT-ALLOWED)
      
      (try! (as-contract (contract-call? sbtc-token transfer refund-amount tx-sender (get client project) none)))
      (map-set projects project-id (merge project {refunded: true}))
      
      (print {
        event: "emergency-refund",
        project-id: project-id,
        refund-amount: refund-amount,
        released-amount: released-total,
        client: (get client project),
        token: "sBTC"
      })
      (ok refund-amount))))

;; ======================== READ-ONLY FUNCTIONS ========================

(define-read-only (get-project (id uint))
  (map-get? projects id))

(define-read-only (get-milestone (project-id uint) (milestone-num uint))
  (map-get? milestones {project-id: project-id, milestone-num: milestone-num}))

(define-read-only (get-project-count)
  (var-get project-counter))

(define-read-only (get-contract-balance-stx)
  (stx-get-balance (as-contract tx-sender)))

;; Note: Cannot create read-only function for sBTC balance due to contract-call restrictions
;; Use: (contract-call? .escrow-multi-token-v4 get-balance-sbtc .sbtc-token) as public function
;; Or call the token contract directly: (contract-call? .sbtc-token get-balance .escrow-multi-token-v4)

(define-read-only (get-refundable (id uint))
  (match (map-get? projects id)
    project (if (get refunded project)
      (ok u0)
      (ok (- (get total-amount project) (calc-released id))))
    ERR-PROJECT-NOT-FOUND))

(define-read-only (get-treasury)
  (var-get treasury))

(define-read-only (get-contract-owner)
  (var-get contract-owner))

(define-read-only (get-token-name (token-type uint))
  (if (is-eq token-type TOKEN-STX)
    (ok "STX")
    (if (is-eq token-type TOKEN-SBTC)
      (ok "sBTC")
      (err ERR-INVALID-TOKEN))))

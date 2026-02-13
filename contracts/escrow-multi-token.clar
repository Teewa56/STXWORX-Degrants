;; ========================================================================
;; Freelance Escrow
;; Multi-Token Support (STX + sBTC) with Security Enhancements
;; ========================================================================

;; ======================== TRAITS ========================

(define-trait sip010-ft-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    (get-balance (principal) (response uint uint))
  ))

;; ======================== CONSTANTS ========================

(define-constant FEE-PERCENT u1000)           ;;10% = 1000 basis points
(define-constant REFUND-TIMEOUT u144)        ;; ~24 hours
(define-constant MAX-MILESTONES u4)
(define-constant MAX-ESCROW-AMOUNT u1000000000000) ;; 1M STX max

;; Token types
(define-constant TOKEN-STX u0)
(define-constant TOKEN-SBTC u1)

;; Error codes
(define-constant ERR-NOT-CLIENT (err u100))
(define-constant ERR-NOT-FREELANCER (err u101))
(define-constant ERR-PROJECT-NOT-FOUND (err u102))
(define-constant ERR-INVALID-MILESTONE (err u103))
(define-constant ERR-NOT-COMPLETE (err u105))
(define-constant ERR-ALREADY-RELEASED (err u106))
(define-constant ERR-INVALID-AMOUNT (err u108))
(define-constant ERR-REFUND-NOT-ALLOWED (err u111))
(define-constant ERR-ALREADY-REFUNDED (err u112))
(define-constant ERR-NOT-AUTHORIZED (err u113))
(define-constant ERR-TOO-MANY-MILESTONES (err u114))
(define-constant ERR-ALREADY-COMPLETE (err u116))
(define-constant ERR-INVALID-TOKEN (err u117))
(define-constant ERR-OVERFLOW (err u119))
(define-constant ERR-CONTRACT-PAUSED (err u120))
(define-constant ERR-INVALID-PARTICIPANTS (err u121))
(define-constant ERR-AMOUNT-TOO-HIGH (err u122))
(define-constant ERR-TOKEN-NOT-APPROVED (err u123))

;; ======================== DATA VARIABLES ========================

(define-data-var project-counter uint u0)
(define-data-var treasury principal tx-sender)
(define-data-var contract-owner principal tx-sender)
(define-data-var contract-paused bool false)

;; ======================== DATA MAPS ========================

(define-map projects uint
  {
    client: principal,
    freelancer: principal,
    total-amount: uint,
    num-milestones: uint,
    refunded: bool,
    created-at: uint,
    token-type: uint
  })

(define-map milestones {project-id: uint, milestone-num: uint}
  {
    amount: uint,
    complete: bool,
    released: bool
  })

(define-map approved-tokens principal bool)
(define-map authorized-contracts principal bool)

;; ======================== HELPER FUNCTIONS ========================

(define-private (is-admin)
  (is-eq tx-sender (var-get contract-owner)))

(define-private (valid-milestone (n uint))
  (and (>= n u1) (<= n MAX-MILESTONES)))

;; Safe math
(define-private (safe-add (a uint) (b uint))
  (let ((result (+ a b)))
    (asserts! (>= result a) ERR-OVERFLOW)
    (ok result)))

(define-private (safe-mul (a uint) (b uint))
  (let ((result (* a b)))
    (asserts! (or (is-eq a u0) (is-eq (/ result a) b)) ERR-OVERFLOW)
    (ok result)))

(define-private (safe-div (a uint) (b uint))
  (begin
    (asserts! (> b u0) ERR-INVALID-AMOUNT)
    (ok (/ a b))))

;; ======================== ADMIN FUNCTIONS ========================

(define-public (set-treasury (new principal))
  (begin
    (asserts! (is-admin) ERR-NOT-AUTHORIZED)
    (asserts! (not (is-eq new (var-get treasury))) ERR-INVALID-AMOUNT)
    (var-set treasury new)
    (print {event: "treasury-updated", new-treasury: new, block: block-height})
    (ok true)))

(define-public (transfer-ownership (new principal))
  (begin
    (asserts! (is-admin) ERR-NOT-AUTHORIZED)
    (var-set contract-owner new)
    (print {event: "ownership-transferred", new-owner: new})
    (ok true)))

(define-public (pause-contract)
  (begin
    (asserts! (is-admin) ERR-NOT-AUTHORIZED)
    (var-set contract-paused true)
    (print {event: "contract-paused", by: tx-sender})
    (ok true)))

(define-public (unpause-contract)
  (begin
    (asserts! (is-admin) ERR-NOT-AUTHORIZED)
    (var-set contract-paused false)
    (print {event: "contract-unpaused"})
    (ok true)))

(define-public (approve-token (token principal))
  (begin
    (asserts! (is-admin) ERR-NOT-AUTHORIZED)
    (map-set approved-tokens token true)
    (ok true)))

(define-public (authorize-contract (contract principal))
  (begin
    (asserts! (is-admin) ERR-NOT-AUTHORIZED)
    (map-set authorized-contracts contract true)
    (ok true)))

;; ======================== STX FUNCTIONS ========================

(define-public (create-project-stx
    (freelancer principal)
    (m1 uint) (m2 uint) (m3 uint) (m4 uint))
  (let (
    (id (+ (var-get project-counter) u1))
    (total (unwrap! (safe-add m1 (unwrap! (safe-add m2 (unwrap! (safe-add m3 m4) ERR-OVERFLOW)) ERR-OVERFLOW)) ERR-OVERFLOW))
    (num-milestones (+ (if (> m1 u0) u1 u0)
                       (+ (if (> m2 u0) u1 u0)
                          (+ (if (> m3 u0) u1 u0)
                             (if (> m4 u0) u1 u0)))))
  )
    (asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)
    (asserts! (> total u0) ERR-INVALID-AMOUNT)
    (asserts! (<= total MAX-ESCROW-AMOUNT) ERR-AMOUNT-TOO-HIGH)
    (asserts! (not (is-eq tx-sender freelancer)) ERR-INVALID-PARTICIPANTS)
    (asserts! (and (> num-milestones u0) (<= num-milestones MAX-MILESTONES)) ERR-TOO-MANY-MILESTONES)

    (try! (stx-transfer? total tx-sender (as-contract tx-sender)))

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
    
    (if (> m1 u0) (map-set milestones {project-id: id, milestone-num: u1} {amount: m1, complete: false, released: false}) true)
    (if (> m2 u0) (map-set milestones {project-id: id, milestone-num: u2} {amount: m2, complete: false, released: false}) true)
    (if (> m3 u0) (map-set milestones {project-id: id, milestone-num: u3} {amount: m3, complete: false, released: false}) true)
    (if (> m4 u0) (map-set milestones {project-id: id, milestone-num: u4} {amount: m4, complete: false, released: false}) true)
    
    (print {event: "project-created", project-id: id, client: tx-sender, freelancer: freelancer, total: total, token: "STX"})
    (ok id)))

;; ======================== sBTC FUNCTIONS ========================

(define-public (create-project-sbtc
    (freelancer principal)
    (m1 uint) (m2 uint) (m3 uint) (m4 uint)
    (sbtc-token <sip010-ft-trait>))
  (let (
    (id (+ (var-get project-counter) u1))
    (total (unwrap! (safe-add m1 (unwrap! (safe-add m2 (unwrap! (safe-add m3 m4) ERR-OVERFLOW)) ERR-OVERFLOW)) ERR-OVERFLOW))
    (num-milestones (+ (if (> m1 u0) u1 u0)
                       (+ (if (> m2 u0) u1 u0)
                          (+ (if (> m3 u0) u1 u0)
                             (if (> m4 u0) u1 u0)))))
    (contract-addr (as-contract tx-sender))
    (token-principal (contract-of sbtc-token))
  )
    (asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)
    (asserts! (> total u0) ERR-INVALID-AMOUNT)
    (asserts! (<= total MAX-ESCROW-AMOUNT) ERR-AMOUNT-TOO-HIGH)
    (asserts! (not (is-eq tx-sender freelancer)) ERR-INVALID-PARTICIPANTS)
    (asserts! (and (> num-milestones u0) (<= num-milestones MAX-MILESTONES)) ERR-TOO-MANY-MILESTONES)
    (asserts! (default-to false (map-get? approved-tokens token-principal)) ERR-TOKEN-NOT-APPROVED)
    
    (try! (contract-call? sbtc-token transfer total tx-sender contract-addr none))

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
    
    (if (> m1 u0) (map-set milestones {project-id: id, milestone-num: u1} {amount: m1, complete: false, released: false}) true)
    (if (> m2 u0) (map-set milestones {project-id: id, milestone-num: u2} {amount: m2, complete: false, released: false}) true)
    (if (> m3 u0) (map-set milestones {project-id: id, milestone-num: u3} {amount: m3, complete: false, released: false}) true)
    (if (> m4 u0) (map-set milestones {project-id: id, milestone-num: u4} {amount: m4, complete: false, released: false}) true)
    
    (print {event: "project-created", project-id: id, client: tx-sender, freelancer: freelancer, total: total, token: "sBTC"})
    (ok id)))

;; ======================== MILESTONE FUNCTIONS ========================

(define-public (complete-milestone (project-id uint) (milestone-num uint))
  (let (
    (project (unwrap! (map-get? projects project-id) ERR-PROJECT-NOT-FOUND))
    (milestone (unwrap! (map-get? milestones {project-id: project-id, milestone-num: milestone-num}) ERR-INVALID-MILESTONE))
  )
    (asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)
    (asserts! (is-eq tx-sender (get freelancer project)) ERR-NOT-FREELANCER)
    (asserts! (valid-milestone milestone-num) ERR-INVALID-MILESTONE)
    (asserts! (not (get refunded project)) ERR-ALREADY-REFUNDED)
    (asserts! (not (get complete milestone)) ERR-ALREADY-COMPLETE)

    (map-set milestones {project-id: project-id, milestone-num: milestone-num}
      (merge milestone {complete: true}))
    
    (print {event: "milestone-completed", project-id: project-id, milestone: milestone-num})
    (ok true)))

(define-public (release-milestone-stx (project-id uint) (milestone-num uint))
  (let (
    (project (unwrap! (map-get? projects project-id) ERR-PROJECT-NOT-FOUND))
    (milestone (unwrap! (map-get? milestones {project-id: project-id, milestone-num: milestone-num}) ERR-INVALID-MILESTONE))
    (amount (get amount milestone))
    (fee (unwrap! (safe-div (unwrap! (safe-mul amount FEE-PERCENT) ERR-OVERFLOW) u10000) ERR-OVERFLOW))
    (payout (- amount fee))
  )
    (asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)
    (asserts! (is-eq tx-sender (get client project)) ERR-NOT-CLIENT)
    (asserts! (valid-milestone milestone-num) ERR-INVALID-MILESTONE)
    (asserts! (not (get refunded project)) ERR-ALREADY-REFUNDED)
    (asserts! (is-eq (get token-type project) TOKEN-STX) ERR-INVALID-TOKEN)
    (asserts! (get complete milestone) ERR-NOT-COMPLETE)
    (asserts! (not (get released milestone)) ERR-ALREADY-RELEASED)

    (try! (as-contract (stx-transfer? payout tx-sender (get freelancer project))))
    (if (> fee u0) (try! (as-contract (stx-transfer? fee tx-sender (var-get treasury)))) true)

    (map-set milestones {project-id: project-id, milestone-num: milestone-num}
      (merge milestone {released: true}))
    
    (print {event: "milestone-released", project-id: project-id, milestone: milestone-num, payout: payout, fee: fee})
    (ok payout)))

(define-public (release-milestone-sbtc (project-id uint) (milestone-num uint) (sbtc-token <sip010-ft-trait>))
  (let (
    (project (unwrap! (map-get? projects project-id) ERR-PROJECT-NOT-FOUND))
    (milestone (unwrap! (map-get? milestones {project-id: project-id, milestone-num: milestone-num}) ERR-INVALID-MILESTONE))
    (amount (get amount milestone))
    (fee (unwrap! (safe-div (unwrap! (safe-mul amount FEE-PERCENT) ERR-OVERFLOW) u10000) ERR-OVERFLOW))
    (payout (- amount fee))
    (token-principal (contract-of sbtc-token))
  )
    (asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)
    (asserts! (is-eq tx-sender (get client project)) ERR-NOT-CLIENT)
    (asserts! (valid-milestone milestone-num) ERR-INVALID-MILESTONE)
    (asserts! (not (get refunded project)) ERR-ALREADY-REFUNDED)
    (asserts! (is-eq (get token-type project) TOKEN-SBTC) ERR-INVALID-TOKEN)
    (asserts! (default-to false (map-get? approved-tokens token-principal)) ERR-TOKEN-NOT-APPROVED)
    (asserts! (get complete milestone) ERR-NOT-COMPLETE)
    (asserts! (not (get released milestone)) ERR-ALREADY-RELEASED)

    (try! (as-contract (contract-call? sbtc-token transfer payout tx-sender (get freelancer project) none)))
    (if (> fee u0) (try! (as-contract (contract-call? sbtc-token transfer fee tx-sender (var-get treasury) none))) true)

    (map-set milestones {project-id: project-id, milestone-num: milestone-num}
      (merge milestone {released: true}))
    
    (print {event: "milestone-released", project-id: project-id, milestone: milestone-num, payout: payout, fee: fee})
    (ok payout)))

;; ======================== REFUND FUNCTIONS ========================

(define-private (is-milestone-active (project-id uint) (milestone-num uint))
  (match (map-get? milestones {project-id: project-id, milestone-num: milestone-num})
    m (or (get complete m) (get released m))
    false))

(define-private (has-activity (project-id uint))
  (or (or (is-milestone-active project-id u1) (is-milestone-active project-id u2))
      (or (is-milestone-active project-id u3) (is-milestone-active project-id u4))))

(define-public (request-full-refund-stx (project-id uint))
  (let ((project (unwrap! (map-get? projects project-id) ERR-PROJECT-NOT-FOUND)))
    (asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)
    (asserts! (is-eq tx-sender (get client project)) ERR-NOT-CLIENT)
    (asserts! (not (get refunded project)) ERR-ALREADY-REFUNDED)
    (asserts! (is-eq (get token-type project) TOKEN-STX) ERR-INVALID-TOKEN)
    (asserts! (not (has-activity project-id)) ERR-REFUND-NOT-ALLOWED)

    (let ((total (get total-amount project)))
      (try! (as-contract (stx-transfer? total tx-sender (get client project))))
      (map-set projects project-id (merge project {refunded: true}))
      (print {event: "full-refund", project-id: project-id, amount: total})
      (ok total))))

(define-public (request-full-refund-sbtc (project-id uint) (sbtc-token <sip010-ft-trait>))
  (let (
    (project (unwrap! (map-get? projects project-id) ERR-PROJECT-NOT-FOUND))
    (token-principal (contract-of sbtc-token))
  )
    (asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)
    (asserts! (is-eq tx-sender (get client project)) ERR-NOT-CLIENT)
    (asserts! (not (get refunded project)) ERR-ALREADY-REFUNDED)
    (asserts! (is-eq (get token-type project) TOKEN-SBTC) ERR-INVALID-TOKEN)
    (asserts! (default-to false (map-get? approved-tokens token-principal)) ERR-TOKEN-NOT-APPROVED)
    (asserts! (not (has-activity project-id)) ERR-REFUND-NOT-ALLOWED)

    (let ((total (get total-amount project)))
      (try! (as-contract (contract-call? sbtc-token transfer total tx-sender (get client project) none)))
      (map-set projects project-id (merge project {refunded: true}))
      (print {event: "full-refund", project-id: project-id, amount: total})
      (ok total))))

;; READ-ONLY
(define-read-only (get-project (id uint)) (map-get? projects id))
(define-read-only (get-milestone (project-id uint) (milestone-num uint)) (map-get? milestones {project-id: project-id, milestone-num: milestone-num}))
(define-read-only (get-project-count) (var-get project-counter))
(define-read-only (get-treasury) (var-get treasury))
(define-read-only (get-contract-owner) (var-get contract-owner))
(define-read-only (is-contract-paused) (var-get contract-paused))
(define-read-only (is-token-approved (token principal)) (default-to false (map-get? approved-tokens token)))
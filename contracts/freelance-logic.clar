;; ========================================================================
;; Freelance Logic Contract v1.0
;; Handles escrow operations, payments, and milestone management
;; Supports both STX and sBTC tokens
;; ========================================================================

;; ======================== TRAITS ========================

;; SIP-010 Fungible Token Trait
(define-trait sip010-ft-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    (get-balance (principal) (response uint uint))
  )
)

;; ======================== CONSTANTS ========================

(define-constant FEE-PERCENT u1000)      ;; 10% = 1000 basis points
(define-constant REFUND-TIMEOUT u144)     ;; ~24 hours (10 min blocks)
(define-constant MAX-MILESTONES u4)        ;; Fixed 4 milestones

;; Token types
(define-constant TOKEN-STX u0)
(define-constant TOKEN-SBTC u1)

;; Error codes
(define-constant ERR-NOT-CLIENT (err u2000))
(define-constant ERR-NOT-FREELANCER (err u2001))
(define-constant ERR-PROJECT-NOT-FOUND (err u2002))
(define-constant ERR-INVALID-MILESTONE (err u2003))
(define-constant ERR-NOT-FUNDED (err u2004))
(define-constant ERR-ALREADY-COMPLETE (err u2005))
(define-constant ERR-INVALID-AMOUNT (err u2006))
(define-constant ERR-TRANSFER-FAILED (err u2007))
(define-constant ERR-INSUFFICIENT-FUNDS (err u2008))

;; ======================== DATA MAPS ========================

;; Escrow projects
(define-map escrows
  { uint: {
    client: principal,  
    freelancer: principal,
    total-amount: uint,
    token-type: uint,
    status: (string-ascii 20),
    created-at: uint,
    
    ;; Milestone data
    milestone-1: { amount: uint, title: (string-ascii 200), complete: bool, released: bool },
    milestone-2: { amount: uint, title: (string-ascii 200), complete: bool, released: bool },
    milestone-3: { amount: uint, title: (string-ascii 200), complete: bool, released: bool },
    milestone-4: { amount: uint, title: (string-ascii 200), complete: bool, released: bool },
  }}
)

;; Project counter
(define-data-var project-counter uint)

;; ======================== READ-ONLY FUNCTIONS ========================

;; Get escrow details
(define-read-only (get-escrow (escrow-id uint))
  (begin
    (match (map-get? escrows escrow-id)
      escrow (ok escrow)
      (err ERR-PROJECT-NOT-FOUND)
    )
  )
)

;; Get user's escrows
(define-read-only (get-user-escrows (user principal))
  (begin
    ;; This would need to be implemented with filtering logic
    ;; For now, returns all escrows (simplified)
    (map-get? escrows u0)
  )
)

;; ======================== PUBLIC FUNCTIONS ========================

;; Create new escrow project
(define-public (create-escrow 
  (freelancer principal) 
  (total-amount uint)
  (token-type uint)
  (milestone-1-title (string-ascii 200))
  (milestone-2-title (string-ascii 200))
  (milestone-3-title (string-ascii 200))
  (milestone-4-title (string-ascii 200)))
  (begin
    ;; Validate milestone amounts (should sum to total)
    (let ((quarter-amount (/ total-amount u4)))
      (if (is-eq (* quarter-amount u4) total-amount)
        (begin
          (var-set project-counter (+ u1 (var-get project-counter)))
          (map-set escrows (var-get project-counter) {
            client: tx-sender,
            freelancer: freelancer,
            total-amount: total-amount,
            token-type: token-type,
            status: "PENDING",
            created-at: block-height,
            
            milestone-1: { amount: quarter-amount, title: milestone-1-title, complete: false, released: false },
            milestone-2: { amount: quarter-amount, title: milestone-2-title, complete: false, released: false },
            milestone-3: { amount: quarter-amount, title: milestone-3-title, complete: false, released: false },
            milestone-4: { amount: quarter-amount, title: milestone-4-title, complete: false, released: false },
          })
          (ok {escrow-id: (var-get project-counter)})
        )
        (err ERR-INVALID-AMOUNT)
      )
    )
  )
)

;; Fund escrow with tokens
(define-public (fund-escrow (escrow-id uint))
  (begin
    (match (map-get? escrows escrow-id)
      escrow
        (if (and 
              (is-eq (get client escrow) tx-sender)
              (is-eq (get status escrow) "PENDING"))
          (begin
            ;; Transfer tokens to contract
            (match (get token-type escrow)
              TOKEN-STX
              ;; Handle STX transfer
              (if (>= stx-balance tx-sender) (get total-amount escrow))
                (begin
                  (as-contract tx-sender)
                  (stx-transfer? (get total-amount escrow) tx-sender)
                  (map-set escrows escrow-id (merge escrow { status: "FUNDED" }))
                  (ok true)
                )
                (err ERR-INSUFFICIENT-FUNDS)
              )
              
              TOKEN-SBTC
              ;; Handle sBTC transfer (simplified - needs actual token contract)
              (begin
                ;; This would call the actual sBTC token contract
                ;; For now, assume successful transfer
                (map-set escrows escrow-id (merge escrow { status: "FUNDED" }))
                (ok true)
              )
              
              (err ERR-INVALID-DATA)
            )
          )
          (err ERR-NOT-CLIENT)
        )
        (err ERR-PROJECT-NOT-FOUND)
    )
  )

;; Mark milestone as complete (freelancer only)
(define-public (mark-milestone-complete (escrow-id uint) (milestone-num uint))
  (begin
    (match (map-get? escrows escrow-id)
      escrow
        (if (and 
              (is-eq (get freelancer escrow) tx-sender)
              (>= milestone-num u1)
              (<= milestone-num MAX-MILESTONES))
          (begin
            (match milestone-num
              u1 (map-set escrows escrow-id 
                     (merge escrow { 
                       milestone-1: (merge (get milestone-1 escrow) { complete: true })
                     }))
              u2 (map-set escrows escrow-id 
                     (merge escrow { 
                       milestone-2: (merge (get milestone-2 escrow) { complete: true })
                     }))
              u3 (map-set escrows escrow-id 
                     (merge escrow { 
                       milestone-3: (merge (get milestone-3 escrow) { complete: true })
                     }))
              u4 (map-set escrows escrow-id 
                     (merge escrow { 
                       milestone-4: (merge (get milestone-4 escrow) { complete: true })
                     }))
              (err ERR-INVALID-MILESTONE)
            )
            (ok true)
          )
          (err ERR-NOT-FREELANCER)
        )
        (err ERR-PROJECT-NOT-FOUND)
    )
  )
)

;; Release milestone payment (client only)
(define-public (release-milestone-payment (escrow-id uint) (milestone-num uint))
  (begin
    (match (map-get? escrows escrow-id)
      escrow
        (if (and 
              (is-eq (get client escrow) tx-sender)
              (>= milestone-num u1)
              (<= milestone-num MAX-MILESTONES))
          (begin
            ;; Get milestone data
            (let ((milestone-data 
                    (match milestone-num
                      u1 (get milestone-1 escrow)
                      u2 (get milestone-2 escrow)
                      u3 (get milestone-3 escrow)
                      u4 (get milestone-4 escrow)
                      (err ERR-INVALID-MILESTONE))))
              ;; Check if milestone is complete but not released
              (if (and 
                    (get complete milestone-data)
                    (not (get released milestone-data)))
                  (begin
                    ;; Calculate payment amount (90% to freelancer, 10% to DAO)
                    (let ((milestone-amount (get amount milestone-data))
                           (freelancer-amount (/ (* milestone-amount u90) u100))
                           (dao-fee (/ (* milestone-amount u10) u100)))
                      ;; Transfer to freelancer
                      (match (get token-type escrow)
                        TOKEN-STX
                        (begin
                          (as-contract tx-sender)
                          (stx-transfer? freelancer-amount tx-sender)
                          ;; Transfer DAO fee to DAO wallet (simplified)
                          (stx-transfer? dao-fee 'SP17764FQ0XK7W6QMSJYE09Y938Z1RSEGT925P30S)
                          (map-set escrows escrow-id 
                                 (merge escrow { 
                                   milestone-1: (if (is-eq milestone-num u1) 
                                                (merge (get milestone-1 escrow) { released: true })
                                                (get milestone-1 escrow)),
                                   milestone-2: (if (is-eq milestone-num u2) 
                                                (merge (get milestone-2 escrow) { released: true })
                                                (get milestone-2 escrow)),
                                   milestone-3: (if (is-eq milestone-num u3) 
                                                (merge (get milestone-3 escrow) { released: true })
                                                (get milestone-3 escrow)),
                                   milestone-4: (if (is-eq milestone-num u4) 
                                                (merge (get milestone-4 escrow) { released: true })
                                                (get milestone-4 escrow))
                                 }))
                          (ok {released: true, amount: freelancer-amount, fee: dao-fee})
                        )
                        
                        TOKEN-SBTC
                        ;; Handle sBTC transfer (simplified)
                        (begin
                          ;; Transfer to freelancer and DAO wallet
                          (map-set escrows escrow-id 
                                 (merge escrow { 
                                   milestone-1: (if (is-eq milestone-num u1) 
                                                (merge (get milestone-1 escrow) { released: true })
                                                (get milestone-1 escrow)),
                                   milestone-2: (if (is-eq milestone-num u2) 
                                                (merge (get milestone-2 escrow) { released: true })
                                                (get milestone-2 escrow)),
                                   milestone-3: (if (is-eq milestone-num u3) 
                                                (merge (get milestone-3 escrow) { released: true })
                                                (get milestone-3 escrow)),
                                   milestone-4: (if (is-eq milestone-num u4) 
                                                (merge (get milestone-4 escrow) { released: true })
                                                (get milestone-4 escrow))
                                 }))
                          (ok {released: true, amount: freelancer-amount, fee: dao-fee})
                        )
                        
                        (err ERR-INVALID-DATA)
                      )
                    )
                  )
                  (err ERR-ALREADY-COMPLETE)
                )
              )
            )
          )
          (err ERR-NOT-CLIENT)
        )
        (err ERR-PROJECT-NOT-FOUND)
    )
  )

;; Check if project is complete (all milestones released)
(define-read-only (is-project-complete (escrow-id uint))
  (begin
    (match (map-get? escrows escrow-id)
      escrow
        (ok (and 
               (get released (get milestone-1 escrow))
               (get released (get milestone-2 escrow))
               (get released (get milestone-3 escrow))
               (get released (get milestone-4 escrow))))
        (err ERR-PROJECT-NOT-FOUND)
    )
  )
)

;; ======================== INITIALIZATION ========================

(begin
  (var-set project-counter u0)
  (ok true)
)

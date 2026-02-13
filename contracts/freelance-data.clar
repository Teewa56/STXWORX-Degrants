;; ========================================================================
;; Freelance Data Contract
;; User profiles, reputation, and leaderboard with proper access control
;; ========================================================================

;; ======================== CONSTANTS ========================

(define-constant ERR-UNAUTHORIZED (err u1000))
(define-constant ERR-NOT-FOUND (err u1001))
(define-constant ERR-ALREADY-EXISTS (err u1002))
(define-constant ERR-INVALID-DATA (err u1003))
(define-constant ERR-CONTRACT-PAUSED (err u1004))
(define-constant ERR-INVALID-USERNAME (err u1005))

;; ======================== DATA VARIABLES ========================

(define-data-var contract-owner principal tx-sender)
(define-data-var contract-paused bool false)
(define-data-var category-counter uint u0)

;; ======================== DATA MAPS ========================

(define-map users principal
  {
    username: (string-ascii 50),
    reputation: uint,
    total-earnings: uint,
    completed-projects: uint,
    x-verified: bool,
    x-handle: (optional (string-ascii 50)),
    created-at: uint
  })

(define-map categories uint
  {
    name: (string-ascii 100),
    icon: (string-ascii 50),
    subcategories: (list 10 (string-ascii 50)),
    created-at: uint
  })

(define-map leaderboard {user: principal, score-type: (string-ascii 20)}
  {
    score-value: uint,
    last-updated: uint
  })

;; Authorized contracts (e.g., escrow contract)
(define-map authorized-contracts principal bool)

;; ======================== HELPER FUNCTIONS ========================

(define-private (is-admin)
  (is-eq tx-sender (var-get contract-owner)))

(define-private (is-authorized-contract)
  (default-to false (map-get? authorized-contracts contract-caller)))

(define-private (valid-username (name (string-ascii 50)))
  (and (>= (len name) u3) (<= (len name) u50)))

;; ======================== ADMIN FUNCTIONS ========================

(define-public (authorize-contract (contract principal))
  (begin
    (asserts! (is-admin) ERR-UNAUTHORIZED)
    (map-set authorized-contracts contract true)
    (print {event: "contract-authorized", contract: contract})
    (ok true)))

(define-public (revoke-contract (contract principal))
  (begin
    (asserts! (is-admin) ERR-UNAUTHORIZED)
    (map-set authorized-contracts contract false)
    (print {event: "contract-revoked", contract: contract})
    (ok true)))

(define-public (pause-contract)
  (begin
    (asserts! (is-admin) ERR-UNAUTHORIZED)
    (var-set contract-paused true)
    (ok true)))

(define-public (unpause-contract)
  (begin
    (asserts! (is-admin) ERR-UNAUTHORIZED)
    (var-set contract-paused false)
    (ok true)))

;; ======================== USER FUNCTIONS ========================

(define-public (create-user-profile
    (username (string-ascii 50))
    (x-handle (optional (string-ascii 50))))
  (begin
    (asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)
    (asserts! (valid-username username) ERR-INVALID-USERNAME)
    (asserts! (is-none (map-get? users tx-sender)) ERR-ALREADY-EXISTS)
    
    (map-set users tx-sender {
      username: username,
      reputation: u0,
      total-earnings: u0,
      completed-projects: u0,
      x-verified: (is-some x-handle),
      x-handle: x-handle,
      created-at: block-height
    })
    (print {event: "user-created", user: tx-sender, username: username})
    (ok tx-sender)))

(define-public (update-x-verification (x-handle (string-ascii 50)))
  (begin
    (asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)
    (match (map-get? users tx-sender)
      profile (begin
        (map-set users tx-sender (merge profile {
          x-verified: true,
          x-handle: (some x-handle)
        }))
        (print {event: "x-verified", user: tx-sender, handle: x-handle})
        (ok true))
      ERR-NOT-FOUND)))

;; ======================== CONTRACT-CALLABLE FUNCTIONS ========================

;; Update project stats (only callable by authorized contracts)
(define-public (update-project-stats (user principal) (earned-amount uint))
  (begin
    (asserts! (is-authorized-contract) ERR-UNAUTHORIZED)
    (match (map-get? users user)
      profile (begin
        (map-set users user (merge profile {
          total-earnings: (+ (get total-earnings profile) earned-amount),
          completed-projects: (+ (get completed-projects profile) u1)
        }))
        (print {event: "stats-updated", user: user, earned: earned-amount})
        (ok true))
      ERR-NOT-FOUND)))

;; Update reputation (only callable by authorized contracts)
(define-public (update-reputation (user principal) (new-reputation uint))
  (begin
    (asserts! (is-authorized-contract) ERR-UNAUTHORIZED)
    (match (map-get? users user)
      profile (begin
        (map-set users user (merge profile {reputation: new-reputation}))
        (print {event: "reputation-updated", user: user, reputation: new-reputation})
        (ok true))
      ERR-NOT-FOUND)))

;; Update leaderboard score
(define-public (update-leaderboard-score
    (user principal)
    (score-type (string-ascii 20))
    (score-value uint))
  (begin
    (asserts! (is-authorized-contract) ERR-UNAUTHORIZED)
    (map-set leaderboard {user: user, score-type: score-type} {
      score-value: score-value,
      last-updated: block-height
    })
    (ok true)))

;; ======================== CATEGORY MANAGEMENT ========================

(define-public (add-category
    (name (string-ascii 100))
    (icon (string-ascii 50))
    (subcategories (list 10 (string-ascii 50))))
  (begin
    (asserts! (is-admin) ERR-UNAUTHORIZED)
    (var-set category-counter (+ u1 (var-get category-counter)))
    (map-set categories (var-get category-counter) {
      name: name,
      icon: icon,
      subcategories: subcategories,
      created-at: block-height
    })
    (ok (var-get category-counter))))

;; ======================== READ-ONLY FUNCTIONS ========================

(define-read-only (get-user-profile (user principal))
  (ok (map-get? users user)))

(define-read-only (get-category (category-id uint))
  (ok (map-get? categories category-id)))

(define-read-only (get-leaderboard-score (user principal) (score-type (string-ascii 20)))
  (ok (map-get? leaderboard {user: user, score-type: score-type})))

(define-read-only (is-contract-authorized (contract principal))
  (default-to false (map-get? authorized-contracts contract)))
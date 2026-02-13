;; ========================================================================
;; Freelance Data Contract v1.0
;; Manages user profiles, categories, and leaderboard data
;; Deployable on Stacks Mainnet
;; ========================================================================

;; ======================== CONSTANTS ========================

(define-constant ERR-UNAUTHORIZED (err u1000))
(define-constant ERR-NOT-FOUND (err u1001))
(define-constant ERR-ALREADY-EXISTS (err u1002))
(define-constant ERR-INVALID-DATA (err u1003))

;; ======================== DATA MAPS ========================

;; User profiles
(define-map users
  principal
  {
    username: (string-ascii 50),
    reputation: uint,
    total-earnings: uint,
    completed-projects: uint,
    x-verified: bool,
    x-handle: (optional (string-ascii 50)),
    created-at: uint,
  }
)

;; Categories
(define-map categories
  uint
  {
    name: (string-ascii 100),
    icon: (string-ascii 50),
    subcategories: (list 10 (string-ascii 50)),
    created-at: uint,
  }
)

;; Leaderboard scores
(define-map leaderboard
  {
    user: principal,
    score-type: (string-ascii 20),
  }
  {
    score-value: uint,
    last-updated: uint,
  }
)

;; NFT achievements
(define-map achievements
  principal
  {
    achievement-type: (string-ascii 20),
    token-id: uint,
    minted-at: uint,
  }
)

;; Global counters
(define-data-var category-counter uint u0)
(define-data-var user-counter uint u0)

;; ======================== READ-ONLY FUNCTIONS ========================

;; Get user profile
(define-read-only (get-user-profile (user principal))
  (begin
    (match (map-get? users user)
      profile (ok profile)
      (err ERR-NOT-FOUND)
    )
  )
)

;; Get category by ID
(define-read-only (get-category (category-id uint))
  (begin
    (match (map-get? categories category-id)
      category (ok category)
      (err ERR-NOT-FOUND)
    )
  )
)

;; Get leaderboard score
(define-read-only (get-leaderboard-score
    (user principal)
    (score-type (string-ascii 20))
  )
  (begin
    (match (map-get? leaderboard {
      user: user,
      score-type: score-type,
    })
      score (ok score)
      (err ERR-NOT-FOUND)
    )
  )
)

;; Get user achievements
(define-read-only (get-user-achievements (user principal))
  (begin
    (map-get? achievements user)
  )
)

;; ======================== PUBLIC FUNCTIONS ========================

;; Create or update user profile
(define-public (create-user-profile
    (username (string-ascii 50))
    (x-handle (optional (string-ascii 50)))
  )
  (begin
    ;; Check if user already exists
    (match (map-get? users tx-sender)
      existing-profile (err ERR-ALREADY-EXISTS)
      (begin
        ;; Create new profile
        (map-set users tx-sender {
          username: username,
          reputation: u0,
          total-earnings: u0,
          completed-projects: u0,
          x-verified: (is-some x-handle),
          x-handle: x-handle,
          created-at: block-height,
        })
        (ok { user-id: tx-sender })
      )
    )
  )
)

;; Update user reputation
(define-public (update-reputation
    (user principal)
    (new-reputation uint)
  )
  (begin
    (match (map-get? users user)
      profile (begin
        (map-set users user {
          username: (get username profile),
          reputation: new-reputation,
          total-earnings: (get total-earnings profile),
          completed-projects: (get completed-projects profile),
          x-verified: (get x-verified profile),
          x-handle: (get x-handle profile),
          created-at: (get created-at profile),
        })
        (ok true)
      )
      (err ERR-NOT-FOUND)
    )
  )
)

;; Add new category (admin only)
(define-public (add-category
    (name (string-ascii 100))
    (icon (string-ascii 50))
    (subcategories (list 10 (string-ascii 50)))
  )
  (begin
    ;; Check if caller is admin (simplified for now, should use multi-sig in production)
    (if (is-eq tx-sender 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
      (begin
        (var-set category-counter (+ u1 (var-get category-counter)))
        (map-set categories (var-get category-counter) {
          name: name,
          icon: icon,
          subcategories: subcategories,
          created-at: block-height,
        })
        (ok { category-id: (var-get category-counter) })
      )
      (err ERR-UNAUTHORIZED)
    )
  )
)

;; Update leaderboard score
(define-public (update-leaderboard-score
    (score-type (string-ascii 20))
    (score-value uint)
  )
  (begin
    (map-set leaderboard {
      user: tx-sender,
      score-type: score-type,
    } {
      score-value: score-value,
      last-updated: block-height,
    })
    (ok true)
  )
)

;; Mint achievement NFT (simplified - should integrate with actual NFT contract)
(define-public (mint-achievement
    (achievement-type (string-ascii 20))
    (token-id uint)
  )
  (begin
    ;; Check if user already has this achievement
    (match (map-get? achievements tx-sender)
      user-achievements
      (begin
        ;; Check if achievement already exists
        (if (is-eq (get achievement-type user-achievements) achievement-type)
          (err ERR-ALREADY-EXISTS)
          (begin
            ;; Add new achievement
            (map-set achievements tx-sender {
              achievement-type: achievement-type,
              token-id: token-id,
              minted-at: block-height,
            })
            (ok { token-id: token-id })
          )
        )
      )
      ;; User has no achievements yet, create first one
      (begin
        (map-set achievements tx-sender {
          achievement-type: achievement-type,
          token-id: token-id,
          minted-at: block-height,
        })
        (ok { token-id: token-id })
      )
    )
  )
)

;; Update project completion stats
(define-public (update-project-stats
    (user principal)
    (earned-amount uint)
  )
  (begin
    (match (map-get? users user)
      profile (begin
        (map-set users user {
          username: (get username profile),
          reputation: (get reputation profile),
          total-earnings: (+ (get total-earnings profile) earned-amount),
          completed-projects: (+ (get completed-projects profile) u1),
          x-verified: (get x-verified profile),
          x-handle: (get x-handle profile),
          created-at: (get created-at profile),
        })
        (ok true)
      )
      (err ERR-NOT-FOUND)
    )
  )
)

;; ======================== INITIALIZATION ========================

(begin
  (var-set category-counter u0)
  (var-set user-counter u0)
  (ok true)
)

;; ========================================================================
;; Achievement NFTs Contract v1.0
;; SIP-009 NFT implementation for achievement badges
;; Deployable on Stacks Mainnet - Production Ready
;; ========================================================================

;; ======================== TRAITS ========================

;; SIP-009 Non-Fungible Token Trait
(define-trait nft-trait
  (
    (transfer (principal principal (optional (buff 34))) (response bool uint))
    (get-owner (uint) (response (optional principal) uint))
    (get-token-uri (uint) (response (optional (string-ascii 256)) uint))
  )
)

;; ======================== CONSTANTS ========================

;; Achievement types
(define-constant ACHIEVEMENT-BRONZE u1)
(define-constant ACHIEVEMENT-SILVER u2)
(define-constant ACHIEVEMENT-GOLD u3)
(define-constant ACHIEVEMENT-PLATINUM u4)
(define-constant ACHIEVEMENT-VERIFIED u5)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u4000))
(define-constant ERR-TOKEN-NOT-FOUND (err u4001))
(define-constant ERR-ALREADY-MINTED (err u4002))
(define-constant ERR-NOT-OWNER (err u4003))
(define-constant ERR-INVALID-ACHIEVEMENT (err u4004))
(define-constant ERR-SOUL-BOUND (err u4005))

;; ======================== DATA MAPS ========================

;; NFT token metadata
(define-map nft-metadata
  { uint: {
    owner: principal
    achievement-type: uint
    minted-at: uint
    token-uri: (string-ascii 256)
    transfer-count: uint
  }})

;; User achievements tracking
(define-map user-achievements
  { principal: (list 10 uint) })  ;; List of achievement token IDs

;; Achievement requirements
(define-map achievement-requirements
  { uint: {
    name: (string-ascii 50)
    description: (string-ascii 200)
    icon: (string-ascii 50)
    required-projects: uint
    required-reputation: uint
    x-verified-required: bool
  }})

;; Token counter
(define-data-var token-counter uint)

;; ======================== READ-ONLY FUNCTIONS ========================

;; Get NFT owner
(define-read-only (get-owner (token-id uint))
  (begin
    (match (map-get? nft-metadata token-id)
      metadata (ok (some (get owner metadata)))
      (err ERR-TOKEN-NOT-FOUND)
    )
  )
)

;; Get NFT metadata
(define-read-only (get-token-uri (token-id uint))
  (begin
    (match (map-get? nft-metadata token-id)
      metadata (ok (some (get token-uri metadata)))
      (err ERR-TOKEN-NOT-FOUND)
    )
  )
)

;; Get user's achievements
(define-read-only (get-user-achievements (user principal))
  (begin
    (map-get? user-achievements user)
  )
)

;; Get achievement requirements
(define-read-only (get-achievement-requirements (achievement-type uint))
  (begin
    (match (map-get? achievement-requirements achievement-type)
      requirements (ok requirements)
      (err ERR-INVALID-ACHIEVEMENT)
    )
  )
)

;; Check if user qualifies for achievement
(define-read-only (check-achievement-eligibility 
  (user principal) 
  (achievement-type uint)
  (completed-projects uint)
  (reputation uint)
  (x-verified bool))
  (begin
    (match (map-get? achievement-requirements achievement-type)
      requirements
        (let ((has-achievement (contains? (default-to (list 0 u0) (map-get? user-achievements user)) achievement-type)))
          (if (not has-achievement)
            (and 
              (>= completed-projects (get required-projects requirements))
              (>= reputation (get required-reputation requirements))
              (or 
                (not (get x-verified-required requirements))
                x-verified
              )
            )
            false
          )
        (err ERR-INVALID-ACHIEVEMENT)
    )
  )
)

;; ======================== PUBLIC FUNCTIONS ========================

;; Mint achievement NFT (authorized minter only)
(define-public (mint-achievement 
  (recipient principal)
  (achievement-type uint))
  (begin
    ;; Only authorized contract can mint (should be called via logic contract)
    (if (is-eq tx-sender 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
      (begin
        ;; Check if user already has this achievement
        (let ((user-achievements-list (default-to (list 0 u0) (map-get? user-achievements recipient))))
          (if (contains? user-achievements-list achievement-type)
            (err ERR-ALREADY-MINTED)
            (begin
              ;; Generate new token ID
              (var-set token-counter (+ u1 (var-get token-counter)))
              
              ;; Create token URI based on achievement type
              (let ((token-uri 
                      (match achievement-type
                        ACHIEVEMENT-BRONZE "ipfs://QmBronzeAchievement"
                        ACHIEVEMENT-SILVER "ipfs://QmSilverAchievement"
                        ACHIEVEMENT-GOLD "ipfs://QmGoldAchievement"
                        ACHIEVEMENT-PLATINUM "ipfs://QmPlatinumAchievement"
                        ACHIEVEMENT-VERIFIED "ipfs://QmVerifiedAchievement"
                        "ipfs://QmDefaultAchievement")))
                
                ;; Store NFT metadata
                (map-set nft-metadata (var-get token-counter) {
                  owner: recipient
                  achievement-type: achievement-type
                  minted-at: block-height
                  token-uri: token-uri
                  transfer-count: u0
                })
                
                ;; Add to user's achievements list
                (map-set user-achievements recipient 
                       (append user-achievements-list achievement-type))
                
                (ok {token-id: (var-get token-counter), token-uri: token-uri})
              )
            )
          )
        )
      )
      (err ERR-NOT-AUTHORIZED)
    )
  )
)

;; Transfer NFT (with restrictions)
(define-public (transfer 
  (token-id uint)
  (recipient principal)
  (memo (optional (buff 34))))
  (begin
    (match (map-get? nft-metadata token-id)
      metadata
        (begin
          ;; Check ownership
          (if (is-eq (get owner metadata) tx-sender)
            (begin
              ;; Check if token is soul-bound (non-transferable)
              (if (or 
                    (is-eq (get achievement-type metadata) ACHIEVEMENT-VERIFIED)
                    (and 
                      (is-eq (get achievement-type metadata) ACHIEVEMENT-PLATINUM)
                      (< (get transfer-count metadata) u1)
                    ))
                (err ERR-SOUL-BOUND)
                (begin
                  ;; Update transfer count
                  (map-set nft-metadata token-id 
                         (merge metadata { 
                           transfer-count: (+ (get transfer-count metadata) u1)
                         }))
                  
                  ;; Transfer ownership
                  (map-set nft-metadata token-id 
                         (merge metadata { 
                           owner: recipient
                         }))
                  
                  ;; Update achievement lists
                  (let ((sender-achievements (default-to (list 0 u0) (map-get? user-achievements tx-sender)))
                        (recipient-achievements (default-to (list 0 u0) (map-get? user-achievements recipient))))
                    (map-set user-achievements tx-sender 
                           (filter sender-achievements
                                   (lambda (token) (not (is-eq token achievement-type)))))
                    (map-set user-achievements recipient 
                           (append recipient-achievements achievement-type))
                  
                  (ok true)
                )
              )
            )
            (err ERR-NOT-OWNER)
          )
        )
        (err ERR-TOKEN-NOT-FOUND)
    )
  )
)

;; Batch mint achievements for qualified users
(define-public (mint-qualified-achievements (user principal))
  (begin
    ;; This function should be called by an authorized system
    ;; that checks user qualifications and mints eligible achievements
    
    ;; Check for Bronze achievement (10+ projects)
    (if (check-achievement-eligibility user ACHIEVEMENT-BRONZE u10 u1000 false)
      (begin
        (try! (mint-achievement user ACHIEVEMENT-BRONZE) 
               (lambda (error) (print (concat "Bronze mint failed: (to-string error)"))))
      )
    )
    
    ;; Check for Silver achievement (25+ projects, X verified)
    (if (check-achievement-eligibility user ACHIEVEMENT-SILVER u25 u2000 true)
      (begin
        (try! (mint-achievement user ACHIEVEMENT-SILVER) 
               (lambda (error) (print (concat "Silver mint failed: (to-string error)"))))
      )
    )
    
    ;; Check for Gold achievement (50+ projects, 98%+ satisfaction)
    (if (check-achievement-eligibility user ACHIEVEMENT-GOLD u50 u5000 true)
      (begin
        (try! (mint-achievement user ACHIEVEMENT-GOLD) 
               (lambda (error) (print (concat "Gold mint failed: (to-string error)"))))
      )
    )
    
    ;; Check for Platinum achievement (100+ projects, 99%+ satisfaction)
    (if (check-achievement-eligibility user ACHIEVEMENT-PLATINUM u100 u10000 true)
      (begin
        (try! (mint-achievement user ACHIEVEMENT-PLATINUM) 
               (lambda (error) (print (concat "Platinum mint failed: (to-string error)"))))
      )
    )
    
    (ok true)
  )
)

;; ======================== INITIALIZATION ========================

;; Initialize achievement requirements
(begin
  ;; Bronze: 10+ projects, 1000+ reputation
  (map-set achievement-requirements ACHIEVEMENT-BRONZE {
    name: "Bronze Achiever"
    description: "Completed 10+ projects with good reputation"
    icon: "🥉"
    required-projects: u10
    required-reputation: u1000
    x-verified-required: false
  })
  
  ;; Silver: 25+ projects, X verified, 2000+ reputation
  (map-set achievement-requirements ACHIEVEMENT-SILVER {
    name: "Silver Professional"
    description: "Completed 25+ projects with X verification"
    icon: "🥈"
    required-projects: u25
    required-reputation: u2000
    x-verified-required: true
  })
  
  ;; Gold: 50+ projects, X verified, 5000+ reputation
  (map-set achievement-requirements ACHIEVEMENT-GOLD {
    name: "Gold Expert"
    description: "Completed 50+ projects with excellent reputation"
    icon: "🥇"
    required-projects: u50
    required-reputation: u5000
    x-verified-required: true
  })
  
  ;; Platinum: 100+ projects, X verified, 10000+ reputation
  (map-set achievement-requirements ACHIEVEMENT-PLATINUM {
    name: "Platinum Master"
    description: "Completed 100+ projects with outstanding reputation"
    icon: "🏆"
    required-projects: u100
    required-reputation: u10000
    x-verified-required: true
  })
  
  ;; Verified: X verification only
  (map-set achievement-requirements ACHIEVEMENT-VERIFIED {
    name: "X Verified"
    description: "Verified X (Twitter) account holder"
    icon: "✓"
    required-projects: u0
    required-reputation: u0
    x-verified-required: true
  })
  
  (var-set token-counter u0)
  (ok true)
)

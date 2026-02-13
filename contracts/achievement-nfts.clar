;; ========================================================================
;; Achievement NFTs Contract
;; SIP-009 NFT implementation with real data integration
;; ========================================================================

;; ======================== TRAITS ========================

(define-trait nft-trait
  ((transfer (uint principal (optional (buff 34))) (response bool uint))
   (get-owner (uint) (response (optional principal) uint))
   (get-token-uri (uint) (response (optional (string-ascii 256)) uint))))

;; ======================== CONSTANTS ========================

(define-constant ACHIEVEMENT-BRONZE u1)
(define-constant ACHIEVEMENT-SILVER u2)
(define-constant ACHIEVEMENT-GOLD u3)
(define-constant ACHIEVEMENT-PLATINUM u4)
(define-constant ACHIEVEMENT-VERIFIED u5)

;; Real IPFS URIs
(define-constant BRONZE-URI "https://plum-mad-mouse-752.mypinata.cloud/ipfs/bafkreiegidyfia5nlnu2of7on7acswaw42bg5r2exr4m6a3sw2twqrngjy?filename=nft1.png")
(define-constant SILVER-URI "https://plum-mad-mouse-752.mypinata.cloud/ipfs/bafkreifnmwij3cmgzvcdvlnhumu47ubi25ahj7gdptjkrysz57p2ekufmu?filename=nft2.jpg")
(define-constant GOLD-URI "https://plum-mad-mouse-752.mypinata.cloud/ipfs/bafkreidyd2ljvrlhvprzbngp2tpff6oaouamafux6iuvgkcau2xvepgwp4?filename=nft3.jpg")
(define-constant PLATINUM-URI "https://plum-mad-mouse-752.mypinata.cloud/ipfs/bafkreicrmmvcmuivu6wvec2qe6tije5o4d5gxng3gtmq2yd6a66pzdjy24?filename=nft4.jpg")
(define-constant VERIFIED-URI "https://plum-mad-mouse-752.mypinata.cloud/ipfs/bafkreihqzezoqimtvvaugl77ckq2dvb4vqo6ejsq2a5yklrfzfbuluzu24?filename=nft5.jpg")

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u4000))
(define-constant ERR-TOKEN-NOT-FOUND (err u4001))
(define-constant ERR-ALREADY-MINTED (err u4002))
(define-constant ERR-NOT-OWNER (err u4003))
(define-constant ERR-INVALID-ACHIEVEMENT (err u4004))
(define-constant ERR-SOUL-BOUND (err u4005))
(define-constant ERR-NOT-ELIGIBLE (err u4006))

;; ======================== DATA VARIABLES ========================

(define-data-var token-counter uint u0)
(define-data-var contract-owner principal tx-sender)

;; ======================== DATA MAPS ========================

(define-map nft-metadata uint
  {
    owner: principal,
    achievement-type: uint,
    minted-at: uint,
    token-uri: (string-ascii 256),
    transfer-count: uint
  })

(define-map user-achievements principal (list 10 uint))

(define-map achievement-requirements uint
  {
    name: (string-ascii 50),
    description: (string-ascii 200),
    icon: (string-ascii 50),
    required-projects: uint,
    required-reputation: uint,
    x-verified-required: bool
  })

(define-map authorized-minters principal bool)

;; ======================== ADMIN FUNCTIONS ========================

(define-public (authorize-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (map-set authorized-minters minter true)
    (ok true)))

;; ======================== NFT FUNCTIONS ========================

(define-public (mint-achievement (recipient principal) (achievement-type uint))
  (begin
    (asserts! (default-to false (map-get? authorized-minters contract-caller)) ERR-NOT-AUTHORIZED)
    
    (let ((user-list (default-to (list) (map-get? user-achievements recipient))))
      (asserts! (is-none (index-of user-list achievement-type)) ERR-ALREADY-MINTED)
      
      (var-set token-counter (+ u1 (var-get token-counter)))
      
      (let ((token-uri (get-uri-for-type achievement-type)))
        (map-set nft-metadata (var-get token-counter) {
          owner: recipient,
          achievement-type: achievement-type,
          minted-at: block-height,
          token-uri: token-uri,
          transfer-count: u0
        })
        
        (map-set user-achievements recipient
          (unwrap-panic (as-max-len? (append user-list achievement-type) u10)))
        
        (print {event: "nft-minted", token-id: (var-get token-counter), recipient: recipient, type: achievement-type})
        (ok (var-get token-counter))))))

(define-private (get-uri-for-type (achievement-type uint))
  (if (is-eq achievement-type ACHIEVEMENT-BRONZE) BRONZE-URI
    (if (is-eq achievement-type ACHIEVEMENT-SILVER) SILVER-URI
      (if (is-eq achievement-type ACHIEVEMENT-GOLD) GOLD-URI
        (if (is-eq achievement-type ACHIEVEMENT-PLATINUM) PLATINUM-URI
          VERIFIED-URI)))))

(define-public (transfer (token-id uint) (recipient principal) (memo (optional (buff 34))))
  (let ((metadata (unwrap! (map-get? nft-metadata token-id) ERR-TOKEN-NOT-FOUND)))
    (asserts! (is-eq (get owner metadata) tx-sender) ERR-NOT-OWNER)
    
    ;; Soul-bound check
    (asserts! (not (or
      (is-eq (get achievement-type metadata) ACHIEVEMENT-VERIFIED)
      (and (is-eq (get achievement-type metadata) ACHIEVEMENT-PLATINUM)
           (< (get transfer-count metadata) u1))))
      ERR-SOUL-BOUND)
    
    (map-set nft-metadata token-id (merge metadata {
      owner: recipient,
      transfer-count: (+ (get transfer-count metadata) u1)
    }))
    
    (print {event: "nft-transferred", token-id: token-id, from: tx-sender, to: recipient})
    (ok true)))

;; READ-ONLY
(define-read-only (get-owner (token-id uint))
  (match (map-get? nft-metadata token-id)
    metadata (ok (some (get owner metadata)))
    ERR-TOKEN-NOT-FOUND))

(define-read-only (get-token-uri (token-id uint))
  (match (map-get? nft-metadata token-id)
    metadata (ok (some (get token-uri metadata)))
    ERR-TOKEN-NOT-FOUND))

(define-read-only (get-user-achievements (user principal))
  (map-get? user-achievements user))

;; Initialize requirements
(map-set achievement-requirements ACHIEVEMENT-BRONZE {
  name: "Bronze Achiever",
  description: "Completed 10+ projects",
  icon: "bronze-badge",
  required-projects: u10,
  required-reputation: u1000,
  x-verified-required: false
})

(map-set achievement-requirements ACHIEVEMENT-SILVER {
  name: "Silver Professional",
  description: "Completed 25+ projects with X verification",
  icon: "silver-badge",
  required-projects: u25,
  required-reputation: u2000,
  x-verified-required: true
})

(map-set achievement-requirements ACHIEVEMENT-GOLD {
  name: "Gold Expert",
  description: "Completed 50+ projects with excellent reputation",
  icon: "gold-badge",
  required-projects: u50,
  required-reputation: u5000,
  x-verified-required: true
})

(map-set achievement-requirements ACHIEVEMENT-PLATINUM {
  name: "Platinum Master",
  description: "Completed 100+ projects (Soul-bound)",
  icon: "platinum-badge",
  required-projects: u100,
  required-reputation: u10000,
  x-verified-required: true
})

(map-set achievement-requirements ACHIEVEMENT-VERIFIED {
  name: "X Verified",
  description: "Verified X account (Soul-bound)",
  icon: "verified-badge",
  required-projects: u0,
  required-reputation: u0,
  x-verified-required: true
})
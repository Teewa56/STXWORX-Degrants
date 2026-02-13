-- Production Upgrade Migration 001
-- Add new tables for enhanced features

-- Admin actions table for audit logging
CREATE TABLE IF NOT EXISTS admin_actions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id VARCHAR(36) REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
    ip_address INET
);

-- NFT achievements table
CREATE TABLE IF NOT EXISTS nft_achievements (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) REFERENCES users(id),
    token_id INTEGER NOT NULL,
    achievement_type VARCHAR(20) NOT NULL,
    minted_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(36) REFERENCES projects(id),
    sender_id VARCHAR(36) REFERENCES users(id),
    encrypted_content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Leaderboard scores table
CREATE TABLE IF NOT EXISTS leaderboard_scores (
    user_id VARCHAR(36) REFERENCES users(id),
    score_type VARCHAR(20) NOT NULL,
    score_value INTEGER NOT NULL,
    last_updated TIMESTAMP DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, score_type)
);

-- X integrations table
CREATE TABLE IF NOT EXISTS x_integrations (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) REFERENCES users(id) UNIQUE,
    handle VARCHAR(50) NOT NULL,
    verified BOOLEAN DEFAULT false NOT NULL,
    follower_count INTEGER DEFAULT 0 NOT NULL,
    engagement_score INTEGER DEFAULT 0 NOT NULL,
    last_sync TIMESTAMP DEFAULT NOW() NOT NULL
);

-- DAO transactions table
CREATE TABLE IF NOT EXISTS dao_transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    from_address VARCHAR(50) NOT NULL,
    to_address VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    token_type VARCHAR(20) DEFAULT 'STX' NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    description TEXT,
    tx_id VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_timestamp ON admin_actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);

CREATE INDEX IF NOT EXISTS idx_nft_achievements_user_id ON nft_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_achievements_achievement_type ON nft_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_nft_achievements_minted_at ON nft_achievements(minted_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_leaderboard_scores_user_id ON leaderboard_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_scores_score_type ON leaderboard_scores(score_type);
CREATE INDEX IF NOT EXISTS idx_leaderboard_scores_last_updated ON leaderboard_scores(last_updated);

CREATE INDEX IF NOT EXISTS idx_x_integrations_user_id ON x_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_x_integrations_handle ON x_integrations(handle);
CREATE INDEX IF NOT EXISTS idx_x_integrations_verified ON x_integrations(verified);

CREATE INDEX IF NOT EXISTS idx_dao_transactions_from_address ON dao_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_dao_transactions_to_address ON dao_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_dao_transactions_timestamp ON dao_transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_dao_transactions_tx_id ON dao_transactions(tx_id);

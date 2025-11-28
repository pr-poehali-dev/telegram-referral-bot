CREATE TABLE IF NOT EXISTS referral_requests (
    id SERIAL PRIMARY KEY,
    telegram_user_id BIGINT NOT NULL,
    username VARCHAR(255),
    tariff_id INTEGER NOT NULL,
    tariff_stars INTEGER NOT NULL,
    tariff_friends VARCHAR(50) NOT NULL,
    screenshot_urls TEXT[],
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_date TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_telegram_user_id ON referral_requests(telegram_user_id);
CREATE INDEX idx_status ON referral_requests(status);
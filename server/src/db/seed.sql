-- Seed Data for Ordo Illuminatorum

-- 1. Insert Membership Types
INSERT INTO membership_types (id, name, tier_level, description, requirements) VALUES
(1, 'Novitiate (Classis I)', 1, 'The first awakening. Verification of vessel and initial reception of sacred scrolls.', 'Phone OTP verification and solemn oath'),
(2, 'Illuminatus Minor (Classis II)', 2, 'Access to regional conclaves, strategic economic alliances, and philosophical archives.', 'Active novitiate status and council nomination'),
(3, 'Illuminatus Major (Classis III)', 3, 'Executive stewardship, voting on global charters, and sovereign network access.', 'Grand Conclave tribunal deliberation'),
(4, 'Rex Summus (Inner Sanctum)', 4, 'The apex circle. Reserved for supreme architects of civilization by unanimous invitation.', 'Supreme council decree')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Default Admin if not exists
-- Default admin password 'SanctumSecret2026!' hashed with bcrypt (salt rounds = 10)
-- Hash: $2a$10$tZ2cQ9H2CkybVpE4bK2Vv.73W06L97a7Vd3f9E4N/3eA4hB8u1C9q
INSERT INTO users (id, full_name, phone_number, carrier, password_hash, role, status, is_phone_verified, membership_type_id)
VALUES (
    1,
    'Grand Master Scribe',
    '+251900000000',
    'Ethio Telecom',
    '$2a$10$w0u3fUoVp2yM4T7q8eZ3Ue3mN6J8wQ0kL2zX5pB7sC9vE1rA3tY6a',
    'ADMIN',
    'ACTIVE',
    TRUE,
    4
) ON CONFLICT (phone_number) DO NOTHING;

-- Insert into admin_users table
INSERT INTO admin_users (user_id, permissions)
VALUES (1, '["MANAGE_USERS", "MANAGE_APPLICATIONS", "VIEW_STATS", "SYSTEM_SETTINGS"]')
ON CONFLICT (user_id) DO NOTHING;

-- Restart sequence for next member
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 530052;


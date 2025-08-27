-- Test script to create sample topups for testing the admin management system
-- Run this in your Supabase SQL editor to create test data

-- Insert a few test topups with different statuses
-- Note: Replace the user_id with actual user IDs from your users table

-- Get a sample user ID (replace with actual user ID)
-- SELECT id FROM users LIMIT 1;

-- Example test topups (replace 'your-user-id-here' with actual user ID)
/*
INSERT INTO coin_topups (user_id, amount, status, provider, provider_ref, created_at)
VALUES 
  ('your-user-id-here', 1000, 'pending', 'qpay', 'test-ref-001', NOW() - INTERVAL '1 hour'),
  ('your-user-id-here', 2500, 'pending', 'qpay', 'test-ref-002', NOW() - INTERVAL '30 minutes'),
  ('your-user-id-here', 500, 'confirmed', 'qpay', 'test-ref-003', NOW() - INTERVAL '2 hours'),
  ('your-user-id-here', 1500, 'failed', 'qpay', 'test-ref-004', NOW() - INTERVAL '3 hours');
*/

-- To test the system:
-- 1. Go to /topups as an admin user
-- 2. You should see the test topups listed
-- 3. Click the green checkmark to confirm a pending topup
-- 4. Click the red X to fail a pending topup
-- 5. Check the user's coin balance to verify coins were credited

-- To check user coin balance after confirming a topup:
-- SELECT * FROM user_coin_balances WHERE user_id = 'your-user-id-here';

-- To view the coin ledger entries:
-- SELECT * FROM coin_ledger WHERE user_id = 'your-user-id-here' ORDER BY created_at DESC;

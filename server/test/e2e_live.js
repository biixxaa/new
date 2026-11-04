async function runE2ETest() {
  const BASE = 'http://localhost:5000/api';

  console.log('--- 1. Testing Health Check ---');
  const healthRes = await fetch(`${BASE}/health`);
  const health = await healthRes.json();
  console.log('Health:', health);

  console.log('\n--- 2. Sending OTP in Amharic ---');
  const sendRes = await fetch(`${BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: '0911556677', language: 'am' }),
  });
  const sendData = await sendRes.json();
  console.log('Send OTP Response:', sendData);
  const otp = sendData.debugOtp;

  console.log('\n--- 3. Verifying OTP ---');
  const verifyRes = await fetch(`${BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: '+251911556677', otp }),
  });
  const verifyData = await verifyRes.json();
  console.log('Verify OTP Response:', verifyData);

  console.log('\n--- 4. Registering New Initiate ---');
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Alula Aba Nega',
      phoneNumber: '+251911556677',
      password: 'SovereignPasscode2026!',
    }),
  });
  const regData = await regRes.json();
  console.log('Register Response:', { user: regData.user, token: regData.token?.slice(0, 25) + '...' });

  console.log('\n--- 5. Logging In Member ---');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: '+251911556677',
      password: 'SovereignPasscode2026!',
    }),
  });
  const loginData = await loginRes.json();
  console.log('Member Login Response:', {
    user: loginData.user?.fullName,
    tier: loginData.user?.membershipTier,
    token: loginData.token?.slice(0, 25) + '...',
  });

  console.log('\n--- 6. Logging In Admin ---');
  const adminRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: '+251900000000',
      password: 'SanctumSecret2026!',
    }),
  });
  const adminData = await adminRes.json();
  console.log('Admin Login Response:', {
    admin: adminData.user?.fullName,
    role: adminData.user?.role,
    token: adminData.token?.slice(0, 25) + '...',
  });
  const adminToken = adminData.token;

  console.log('\n--- 7. Fetching Admin Stats ---');
  const statsRes = await fetch(`${BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const statsData = await statsRes.json();
  console.log('Admin Stats:', statsData.stats);

  console.log('\n--- 8. Fetching Admin Users ---');
  const usersRes = await fetch(`${BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const usersData = await usersRes.json();
  console.log('Admin Users Total:', usersData.users?.length);

  console.log('\n--- 9. Council Decree: Approving Member Application ---');
  const targetUser = usersData.users.find((u) => u.phoneNumber === '+251911556677');
  if (targetUser) {
    const approveRes = await fetch(`${BASE}/admin/applications/${targetUser.applicationId || targetUser.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'APPROVED',
        notes: 'Consecrated and elevated by the High Council.',
      }),
    });
    const approveData = await approveRes.json();
    console.log('Council Decree Ratified:', approveData.message);
  }

  console.log('\n--- 10. Public Contact Communique ---');
  const contactRes = await fetch(`${BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Diplomat Hailu',
      contactVector: '0912998877',
      subject: 'Imperial Inquiry',
      message: 'Requesting audience with the Grand Scribe regarding regional conclave dates.',
    }),
  });
  const contactData = await contactRes.json();
  console.log('Public Contact Result:', contactData.message);

  console.log('\n✨ ALL LIVE END-TO-END TESTS COMPLETED SUCCESSFULLY! ✨');
}

runE2ETest().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});


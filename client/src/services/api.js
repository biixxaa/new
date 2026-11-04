const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('illuminati_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || 'Network request failed');
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth & OTP
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  sendOtp: (body) => request('/auth/send-otp', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  // Member
  getMemberApplication: () => request('/member/application'),
  updateMemberApplication: (body) => request('/member/apply', { method: 'POST', body: JSON.stringify(body) }),
  getPaymentInfo: () => request('/member/payment'),
  submitPayment: (body) => request('/member/payment', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: (params = '') => request(`/admin/users${params ? `?${params}` : ''}`),
  updateUserStatus: (id, status) => request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateApplicationStatus: (id, status, notes) =>
    request(`/admin/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
  getMembershipTypes: () => request('/admin/membership-types'),

  // Public contact
  sendContactMessage: (body) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
};


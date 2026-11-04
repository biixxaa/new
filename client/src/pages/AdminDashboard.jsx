import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, Users, CheckCircle, Clock, AlertTriangle, Search, Filter, 
  Ban, Check, Layers, RefreshCw, Smartphone, Award
} from 'lucide-react';
import GeometricEye from '../components/GeometricEye';
import GoldButton from '../components/GoldButton';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApps: 0,
    approvedMembers: 0,
    smsDelivered: 0,
  });

  const [users, setUsers] = useState([]);
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'tiers'

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, typesRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ stats: {} })),
        api.getAdminUsers(`search=${encodeURIComponent(searchTerm)}&status=${statusFilter}`).catch(() => ({ users: [] })),
        api.getMembershipTypes().catch(() => ({ types: [] })),
      ]);

      if (statsRes.stats) setStats(statsRes.stats);
      if (usersRes.users) setUsers(usersRes.users);
      if (typesRes.types) setMembershipTypes(typesRes.types);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleApprove = async (userId, applicationId) => {
    setActionLoadingId(`approve-${userId}`);
    try {
      await api.updateApplicationStatus(applicationId || userId, 'APPROVED', 'Approved by Grand Council Decree');
      await loadData();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (userId, applicationId) => {
    setActionLoadingId(`reject-${userId}`);
    try {
      await api.updateApplicationStatus(applicationId || userId, 'REJECTED', 'Denied by High Council Decree');
      await loadData();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleSuspend = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    setActionLoadingId(`suspend-${userId}`);
    try {
      await api.updateUserStatus(userId, nextStatus);
      await loadData();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="pyramid-bg min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0e0e15]/90 border border-[#d4af37]/30 rounded-xl p-6 gold-box-shadow">
          <div className="flex items-center gap-4">
            <GeometricEye size={56} glow={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-amber-950/50 border border-amber-600/40 text-amber-300">
                  Supreme Council Privilege
                </span>
                <span className="text-xs text-[#8c8678] font-mono">Logged: {user?.fullName}</span>
              </div>
              <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-[#f7e7a9] mt-1">
                {t('admin.title')}
              </h1>
              <p className="font-serif-subtle text-xs text-[#aba494]">
                {t('admin.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded text-xs font-cinzel uppercase tracking-wider transition-all ${
                activeTab === 'users'
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'bg-[#14141e] text-[#d4af37] border border-[#d4af37]/30 hover:border-[#d4af37]'
              }`}
            >
              Vessels Register
            </button>
            <button
              onClick={() => setActiveTab('tiers')}
              className={`px-4 py-2 rounded text-xs font-cinzel uppercase tracking-wider transition-all ${
                activeTab === 'tiers'
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'bg-[#14141e] text-[#d4af37] border border-[#d4af37]/30 hover:border-[#d4af37]'
              }`}
            >
              Degree Hierarchy
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded bg-[#14141e] border border-[#d4af37]/30 text-[#d4af37] hover:border-[#d4af37]"
              title="Refresh Records"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#0c0c12]/90 border border-[#d4af37]/25 rounded-xl p-5">
            <div className="flex items-center justify-between text-[#d4af37] mb-2">
              <span className="text-xs font-cinzel uppercase tracking-wider text-[#a8a192]">
                {t('admin.stats.totalUsers')}
              </span>
              <Users className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#f5eedb]">
              {stats.totalUsers}
            </div>
          </div>

          <div className="bg-[#0c0c12]/90 border border-[#d4af37]/25 rounded-xl p-5">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-cinzel uppercase tracking-wider text-[#a8a192]">
                {t('admin.stats.pendingApps')}
              </span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-300">
              {stats.pendingApps}
            </div>
          </div>

          <div className="bg-[#0c0c12]/90 border border-[#d4af37]/25 rounded-xl p-5">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-cinzel uppercase tracking-wider text-[#a8a192]">
                {t('admin.stats.approvedMembers')}
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-300">
              {stats.approvedMembers}
            </div>
          </div>

          <div className="bg-[#0c0c12]/90 border border-[#d4af37]/25 rounded-xl p-5">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <span className="text-xs font-cinzel uppercase tracking-wider text-[#a8a192]">
                {t('admin.stats.smsDelivered')}
              </span>
              <Smartphone className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-blue-300">
              {stats.smsDelivered}
            </div>
          </div>
        </div>

        {/* View 1: Vessels Register Tab */}
        {activeTab === 'users' && (
          <div className="bg-[#0c0c12]/95 border border-[#d4af37]/25 rounded-xl p-6 space-y-6">
            
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('admin.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 rounded bg-[#13131b] border border-[#d4af37]/30 text-xs text-[#f5eedb] placeholder-[#5a564c] focus:outline-none focus:border-[#d4af37]"
                />
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#aa820a]" />
              </form>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                      statusFilter === filter
                        ? 'bg-[#d4af37] text-black font-bold'
                        : 'bg-[#151520] text-[#a8a192] border border-white/5 hover:border-[#d4af37]/40'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#d4af37]/20 font-cinzel text-[#d4af37] tracking-wider uppercase">
                    <th className="py-3 px-4">{t('admin.columns.user')}</th>
                    <th className="py-3 px-4">{t('admin.columns.phone')}</th>
                    <th className="py-3 px-4">Fee (3,499 ETB)</th>
                    <th className="py-3 px-4">{t('admin.columns.verified')}</th>
                    <th className="py-3 px-4">{t('admin.columns.appStatus')}</th>
                    <th className="py-3 px-4">{t('admin.columns.registered')}</th>
                    <th className="py-3 px-4 text-right">{t('admin.columns.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-[#736f64] font-serif-subtle text-sm">
                        {t('admin.noUsers')}
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isPending = u.applicationStatus === 'PENDING' || u.applicationStatus === 'UNDER_REVIEW';
                      const isApproved = u.applicationStatus === 'APPROVED';
                      const isSuspended = u.status === 'SUSPENDED';

                      return (
                        <tr key={u.id} className="hover:bg-[#13131c]/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#f5eedb]">{u.fullName}</div>
                            <span className="text-[10px] font-mono text-[#8c8678]">
                              ID: #{u.id} • {u.membershipTier || 'Novitiate'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#cfc8b8]">
                            <div>{u.phoneNumber}</div>
                            <span className="text-[10px] text-[#aa820a]">{u.carrier || 'Mobile'}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {u.paymentReference ? (
                              <div>
                                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#ffd966]">
                                  {u.paymentMethod || 'REF'}: {u.paymentReference}
                                </span>
                                <span className={`block text-[10px] font-mono font-bold ${
                                  u.paymentStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                  {u.paymentStatus || 'PENDING'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-zinc-500">
                                Unpaid (3,499 ETB)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {u.isPhoneVerified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                                <CheckCircle className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                                <Clock className="w-3.5 h-3.5" /> Unverified
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                              isApproved
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                                : u.applicationStatus === 'REJECTED'
                                ? 'bg-red-950/60 text-red-300 border-red-500/50'
                                : 'bg-amber-950/60 text-amber-300 border-amber-500/50'
                            }`}>
                              {u.applicationStatus || 'PENDING'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#8a8475] font-mono text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Approve */}
                              {!isApproved && (
                                <button
                                  onClick={() => handleApprove(u.id, u.applicationId)}
                                  disabled={actionLoadingId === `approve-${u.id}`}
                                  className="p-1.5 rounded bg-emerald-950/50 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/50"
                                  title={t('admin.actions.approve')}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Reject */}
                              {u.applicationStatus !== 'REJECTED' && (
                                <button
                                  onClick={() => handleReject(u.id, u.applicationId)}
                                  disabled={actionLoadingId === `reject-${u.id}`}
                                  className="p-1.5 rounded bg-red-950/50 border border-red-600/40 text-red-300 hover:bg-red-900/50"
                                  title={t('admin.actions.reject')}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Suspend / Restore */}
                              <button
                                onClick={() => handleToggleSuspend(u.id, u.status)}
                                disabled={actionLoadingId === `suspend-${u.id}`}
                                className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                                  isSuspended
                                    ? 'bg-amber-950/40 text-amber-300 border-amber-600/40 hover:bg-amber-900/40'
                                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-red-300 hover:border-red-600/40'
                                }`}
                                title={isSuspended ? t('admin.actions.activate') : t('admin.actions.suspend')}
                              >
                                {isSuspended ? 'Suspended' : 'Active'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* View 2: Degrees / Membership Categories */}
        {activeTab === 'tiers' && (
          <div className="bg-[#0c0c12]/95 border border-[#d4af37]/25 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#d4af37]" />
                <h2 className="font-cinzel text-lg font-bold text-[#f5eedb]">
                  {t('admin.manageTiers')}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {membershipTypes.map((tier) => (
                <div key={tier.id} className="p-5 rounded-lg bg-[#12121b] border border-[#d4af37]/30 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-600/30">
                        Degree {tier.tierLevel || tier.level}
                      </span>
                    </div>
                    <h3 className="font-cinzel text-base font-bold text-[#f5eedb] mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-[#a39c8c] font-serif-subtle leading-relaxed mb-4">
                      {tier.description}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-[#8a8475] pt-3 border-t border-white/5">
                    Requirement: {tier.requirements || 'Council Inscription & Oath'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


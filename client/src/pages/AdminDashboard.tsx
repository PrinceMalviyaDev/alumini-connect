import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Users, GraduationCap, BookOpen, CheckCircle, Star, ToggleRight, ToggleLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { User, AlumniDirectoryItem } from '../types';
import StarRating from '../components/StarRating';
import Avatar from '../components/Avatar';
import api from '../lib/axios';

interface AdminStats {
  totalStudents: number;
  totalAlumni: number;
  totalRequests: number;
  completedSessions: number;
  averageRating: number;
  requestsByStatus: { status: string; count: number }[];
  sessionsThisWeek: number;
  topMentors: AlumniDirectoryItem[];
}

interface AdminUser extends User {
  isActive: boolean;
}

interface UsersResponse {
  users: AdminUser[];
  pagination: { total: number; page: number; pages: number; limit: number };
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  completed: '#10b981',
  declined: '#ef4444',
  cancelled: '#6b7280',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch {
      toast.error('Failed to load admin stats');
    }
  };

  const fetchUsers = async (page: number = 1) => {
    try {
      const response = await api.get('/admin/users', { params: { page, limit: 10 } });
      setUsersData(response.data.data);
    } catch {
      toast.error('Failed to load users');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(1)]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    fetchUsers(usersPage);
  }, [usersPage]);

  const handleToggleUser = async (userId: string, currentActive: boolean) => {
    setToggleLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/toggle-active`);
      setUsersData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map((u) => u._id === userId ? { ...u, isActive: !currentActive } : u),
        };
      });
      toast.success(`User ${currentActive ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to toggle user status');
    } finally {
      setToggleLoading(null);
    }
  };

  const statCards = stats ? [
    { icon: <GraduationCap className="w-6 h-6 text-blue-500" />, value: stats.totalStudents, label: 'Total Students', color: 'bg-blue-50 dark:bg-blue-900/10' },
    { icon: <Users className="w-6 h-6 text-green-500" />, value: stats.totalAlumni, label: 'Total Alumni', color: 'bg-green-50 dark:bg-green-900/10' },
    { icon: <BookOpen className="w-6 h-6 text-yellow-500" />, value: stats.totalRequests, label: 'Total Requests', color: 'bg-yellow-50 dark:bg-yellow-900/10' },
    { icon: <CheckCircle className="w-6 h-6 text-purple-500" />, value: stats.completedSessions, label: 'Completed Sessions', color: 'bg-purple-50 dark:bg-purple-900/10' },
    { icon: <Star className="w-6 h-6 text-orange-500" />, value: stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A', label: 'Avg Rating', color: 'bg-orange-50 dark:bg-orange-900/10' },
    { icon: <CheckCircle className="w-6 h-6 text-teal-500" />, value: stats.sessionsThisWeek || 0, label: 'Sessions This Week', color: 'bg-teal-50 dark:bg-teal-900/10' },
  ] : [];

  const chartData = stats?.requestsByStatus || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Platform overview and management</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className={`${card.color} rounded-xl p-5 border border-gray-100 dark:border-gray-700`}>
                <div className="flex items-start justify-between mb-3">{card.icon}</div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requests by Status</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">No data available</div>
              )}
            </div>

            {/* Top Mentors */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 5 Mentors</h2>
              {stats?.topMentors && stats.topMentors.length > 0 ? (
                <div className="space-y-3">
                  {stats.topMentors.slice(0, 5).map((mentor, i) => (
                    <div key={mentor.user._id} className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">
                        {i + 1}
                      </span>
                      <Avatar name={mentor.user.name} size="xs" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{mentor.user.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{mentor.profile.totalSessions} sessions</span>
                          <StarRating rating={mentor.profile.averageRating} size="sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">No mentor data</p>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h2>
              {usersData && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {usersData.pagination.total} total
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {usersData?.users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" />
                          <span className="font-medium text-sm text-gray-900 dark:text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : u.role === 'alumni' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUser(u._id, u.isActive)}
                            disabled={toggleLoading === u._id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              u.isActive
                                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100'
                                : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100'
                            }`}
                          >
                            {toggleLoading === u._id ? (
                              <div className="w-3 h-3 border border-current rounded-full animate-spin" />
                            ) : u.isActive ? (
                              <><ToggleRight className="w-4 h-4" /> Deactivate</>
                            ) : (
                              <><ToggleLeft className="w-4 h-4" /> Activate</>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {usersData && usersData.pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {usersData.pagination.page} of {usersData.pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                    disabled={usersData.pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setUsersPage((p) => Math.min(usersData.pagination.pages, p + 1))}
                    disabled={usersData.pagination.page === usersData.pagination.pages}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

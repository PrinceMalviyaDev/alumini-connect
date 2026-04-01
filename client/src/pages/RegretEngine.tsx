import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Plus, X, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/Avatar';
import api from '../lib/axios';

interface Regret {
  _id: string;
  authorId: { _id: string; name: string; avatar: string };
  title: string;
  description: string;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  createdAt: string;
}

export default function RegretEngine() {
  const { user } = useAuthStore();
  const [regrets, setRegrets] = useState<Regret[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');

  const fetchRegrets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/regrets?sort=${sort}`);
      setRegrets(res.data.data.regrets);
    } catch {
      toast.error('Failed to load regrets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegrets();
  }, [sort]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in both fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/regrets', { title, description });
      setRegrets((prev) => [res.data.data.regret, ...prev]);
      setTitle('');
      setDescription('');
      setShowForm(false);
      toast.success('Regret shared!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to share regret');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      const res = await api.post(`/regrets/${id}/like`);
      setRegrets((prev) =>
        prev.map((r) => r._id === id ? { ...r, ...res.data.data } : r)
      );
    } catch {
      toast.error('Failed to like');
    }
  };

  const handleDislike = async (id: string) => {
    try {
      const res = await api.post(`/regrets/${id}/dislike`);
      setRegrets((prev) =>
        prev.map((r) => r._id === id ? { ...r, ...res.data.data } : r)
      );
    } catch {
      toast.error('Failed to dislike');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this regret?')) return;
    try {
      await api.delete(`/regrets/${id}`);
      setRegrets((prev) => prev.filter((r) => r._id !== id));
      toast.success('Regret deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const isAlumni = user?.role === 'alumni';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Regret Engine</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Learn from alumni career regrets to make better decisions</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        {/* Sort */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setSort('latest')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              sort === 'latest'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Clock className="w-4 h-4" /> Latest
          </button>
          <button
            onClick={() => setSort('popular')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              sort === 'popular'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Popular
          </button>
        </div>

        {/* Share button - alumni only */}
        {isAlumni && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Share a Regret'}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && isAlumni && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share Your Career Regret</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g. "Not learning system design early enough"'
                maxLength={200}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700 focus:border-orange-500 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">{title.length}/200</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you regret and what you'd do differently..."
                rows={4}
                maxLength={2000}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700 focus:border-orange-500 transition-colors resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{description.length}/2000</p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Share Regret'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Regret Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : regrets.length === 0 ? (
        <div className="text-center py-16">
          <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No regrets shared yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {isAlumni ? 'Be the first to share a career regret and help students!' : 'Check back later for alumni career insights.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {regrets.map((regret) => {
            const hasLiked = regret.likedBy?.includes(user?._id || '');
            const hasDisliked = regret.dislikedBy?.includes(user?._id || '');
            const isOwner = regret.authorId._id === user?._id;

            return (
              <div key={regret._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                {/* Author */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={regret.authorId.name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{regret.authorId.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDistanceToNow(new Date(regret.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(regret._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{regret.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{regret.description}</p>

                {/* Like / Dislike */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleLike(regret._id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      hasLiked
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{regret.likes}</span>
                  </button>
                  <button
                    onClick={() => handleDislike(regret._id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      hasDisliked
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{regret.dislikes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

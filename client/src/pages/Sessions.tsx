import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { MentorshipRequest } from '../types';
import SessionCard from '../components/SessionCard';
import FeedbackModal from '../components/FeedbackModal';
import { RequestCardSkeleton } from '../components/LoadingSkeleton';
import { useAuthStore } from '../store/authStore';
import SessionCalendar from '../components/SessionCalendar';
import api from '../lib/axios';

export default function Sessions() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [feedbackRequest, setFeedbackRequest] = useState<MentorshipRequest | null>(null);
  const [suggestionRequest, setSuggestionRequest] = useState<MentorshipRequest | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const endpoint = user?.role === 'alumni' ? '/requests/received' : '/requests/sent';
      const response = await api.get(endpoint);
      setRequests(response.data.data.requests || []);
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user?.role]);

  const upcoming = requests
    .filter((r) => r.status === 'accepted')
    .sort((a, b) => {
      if (!a.scheduledAt || !b.scheduledAt) return 0;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });

  const past = requests
    .filter((r) => ['completed', 'cancelled', 'declined'].includes(r.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleComplete = async (requestId: string) => {
    try {
      await api.put(`/requests/${requestId}/complete`);
      setRequests((prev) => prev.map((r) => r._id === requestId ? { ...r, status: 'completed' } : r));
      toast.success('Session marked as complete!');
    } catch {
      toast.error('Failed to mark as complete');
    }
  };

  const handleFeedback = async (rating: number, comment: string) => {
    if (!feedbackRequest) return;
    try {
      await api.post(`/feedback/${feedbackRequest._id}`, { rating, comment });
      const isStudent = user?.role === 'student';
      setRequests((prev) =>
        prev.map((r) =>
          r._id === feedbackRequest._id
            ? { ...r, studentFeedbackDone: isStudent ? true : r.studentFeedbackDone, alumniFeedbackDone: !isStudent ? true : r.alumniFeedbackDone }
            : r
        )
      );
      toast.success('Feedback submitted!');
      setFeedbackRequest(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const handleSuggestion = async (_rating: number, comment: string) => {
    if (!suggestionRequest) return;
    try {
      await api.post(`/feedback/${suggestionRequest._id}`, { comment });
      setRequests((prev) =>
        prev.map((r) =>
          r._id === suggestionRequest._id ? { ...r, alumniFeedbackDone: true } : r
        )
      );
      toast.success('Suggestion sent!');
      setSuggestionRequest(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to send suggestion');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sessions</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your mentorship sessions</p>
      </div>

      {/* Calendar */}
      {!loading && (
        <div className="mb-6">
          <SessionCalendar
            sessions={requests.filter((r) => ['accepted', 'completed'].includes(r.status) && r.scheduledAt)}
            userRole={user?.role || 'student'}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 w-fit">
        {[
          { key: 'upcoming', label: 'Upcoming', icon: <Calendar className="w-4 h-4" />, count: upcoming.length },
          { key: 'past', label: 'Past', icon: <Clock className="w-4 h-4" />, count: past.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'upcoming' | 'past')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <RequestCardSkeleton key={i} />)}
        </div>
      ) : activeTab === 'upcoming' ? (
        upcoming.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No upcoming sessions</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {user?.role === 'student' ? 'Send a mentorship request to get started!' : 'Accept pending requests to schedule sessions.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((request) => (
              <SessionCard
                key={request._id}
                request={request}
                userRole={user?.role || 'student'}
                onComplete={user?.role === 'alumni' ? () => handleComplete(request._id) : undefined}
                onFeedback={() => setFeedbackRequest(request)}
                onSuggestion={() => setSuggestionRequest(request)}
              />
            ))}
          </div>
        )
      ) : (
        past.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No past sessions</h3>
            <p className="text-gray-500 dark:text-gray-400">Your completed sessions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {past.map((request) => (
              <SessionCard
                key={request._id}
                request={request}
                userRole={user?.role || 'student'}
                onFeedback={() => setFeedbackRequest(request)}
                onSuggestion={() => setSuggestionRequest(request)}
              />
            ))}
          </div>
        )
      )}

      {/* Feedback Modal */}
      {feedbackRequest && user && (
        <FeedbackModal
          request={feedbackRequest}
          userRole={user.role}
          onClose={() => setFeedbackRequest(null)}
          onSubmit={handleFeedback}
        />
      )}

      {/* Suggestion Modal */}
      {suggestionRequest && user && (
        <FeedbackModal
          request={suggestionRequest}
          userRole="alumni"
          onClose={() => setSuggestionRequest(null)}
          onSubmit={handleSuggestion}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, Calendar, ExternalLink, X, MessageSquare, CheckCircle, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { MentorshipRequest } from '../types';
import FeedbackModal from '../components/FeedbackModal';
import { RequestCardSkeleton } from '../components/LoadingSkeleton';
import Avatar from '../components/Avatar';
import api from '../lib/axios';

const STATUS_TABS = ['pending', 'accepted', 'completed', 'declined', 'cancelled'] as const;
type StatusTab = typeof STATUS_TABS[number];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export default function StudentRequests() {
  const [activeTab, setActiveTab] = useState<StatusTab>('pending');
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackRequest, setFeedbackRequest] = useState<MentorshipRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/requests/sent');
      setRequests(response.data.data.requests || []);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered = requests.filter((r) => r.status === activeTab);

  const handleCancel = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    setActionLoading(requestId);
    try {
      await api.put(`/requests/${requestId}/cancel`);
      setRequests((prev) => prev.map((r) => r._id === requestId ? { ...r, status: 'cancelled' } : r));
      toast.success('Request cancelled');
    } catch {
      toast.error('Failed to cancel request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeedback = async (rating: number, comment: string) => {
    if (!feedbackRequest) return;
    try {
      await api.post(`/feedback/${feedbackRequest._id}`, { rating, comment });
      setRequests((prev) =>
        prev.map((r) => r._id === feedbackRequest._id ? { ...r, studentFeedbackDone: true } : r)
      );
      toast.success('Feedback submitted!');
      setFeedbackRequest(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const tabCounts: Record<StatusTab, number> = STATUS_TABS.reduce((acc, status) => {
    acc[status] = requests.filter((r) => r.status === status).length;
    return acc;
  }, {} as Record<StatusTab, number>);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Mentorship Requests</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track the status of your mentorship requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {tab}
            {tabCounts[tab] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? statusColors[tab] : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {tabCounts[tab]}
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No {activeTab} requests</h3>
          {activeTab === 'pending' && (
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Ready to find a mentor?</p>
              <Link to="/directory" className="btn-primary inline-flex">Browse Alumni Directory</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((request) => (
            <div key={request._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-start gap-4">
                <Link to={`/alumni/${request.alumniId._id}`}>
                  <Avatar name={request.alumniId.name} size="md" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <Link to={`/alumni/${request.alumniId._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                        {request.alumniId.name}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {request.alumniProfile?.jobTitle} · {request.alumniProfile?.company}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Topic: </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{request.topic}</span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{request.message}</p>

                  {/* Proposed Slots for Pending */}
                  {request.status === 'pending' && request.proposedSlots?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Proposed times:</p>
                      <div className="flex flex-wrap gap-1">
                        {request.proposedSlots.map((slot, i) => (
                          <span key={i} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded text-xs">
                            <Clock className="w-3 h-3" />
                            {format(new Date(slot), 'MMM d, h:mm a')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scheduled At for Accepted */}
                  {request.status === 'accepted' && request.scheduledAt && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-blue-600 dark:text-blue-400">
                      <Calendar className="w-4 h-4" />
                      Scheduled: {format(new Date(request.scheduledAt), 'PPP p')}
                    </div>
                  )}

                  {/* Created At */}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Sent {format(new Date(request.createdAt), 'MMM d, yyyy')}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {request.status === 'accepted' && request.sessionLink && (
                      <a
                        href={request.sessionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Join Session
                      </a>
                    )}

                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(request._id)}
                        disabled={actionLoading === request._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        {actionLoading === request._id ? (
                          <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Cancel Request
                      </button>
                    )}

                    {request.status === 'completed' && !request.studentFeedbackDone && (
                      <button
                        onClick={() => setFeedbackRequest(request)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Leave Feedback
                      </button>
                    )}

                    {request.status === 'completed' && request.studentFeedbackDone && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Feedback submitted
                      </span>
                    )}
                  </div>

                  {/* Alumni suggestion card */}
                  {request.status === 'completed' && request.alumniFeedback && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Mentor's Suggestion</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                        "{request.alumniFeedback.comment}"
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        — {request.alumniId.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackRequest && (
        <FeedbackModal
          request={feedbackRequest}
          userRole="student"
          onClose={() => setFeedbackRequest(null)}
          onSubmit={handleFeedback}
        />
      )}
    </div>
  );
}

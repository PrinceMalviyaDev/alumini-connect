import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Clock, CheckCircle, Star, Users, ToggleLeft, ToggleRight,
  Calendar, MessageSquare, X, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MentorshipRequest, AlumniProfile } from '../types';
import SessionCard from '../components/SessionCard';
import { RequestCardSkeleton } from '../components/LoadingSkeleton';
import StarRating from '../components/StarRating';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/Avatar';

interface AcceptModalProps {
  request: MentorshipRequest;
  onClose: () => void;
  onAccept: (slot: string, sessionLink: string) => Promise<void>;
}

function AcceptModal({ request, onClose, onAccept }: AcceptModalProps) {
  const [selectedSlot, setSelectedSlot] = useState(request.proposedSlots?.[0] || '');
  const [sessionLink, setSessionLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    if (!selectedSlot) { toast.error('Please select a time slot'); return; }
    setIsLoading(true);
    try {
      await onAccept(selectedSlot, sessionLink);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accept Mentorship Request</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          from <strong>{request.studentId.name}</strong> — Topic: {request.topic}
        </p>
        <div className="mb-4">
          <label className="label">Select Time Slot</label>
          {request.proposedSlots?.length > 0 ? (
            <div className="space-y-2">
              {request.proposedSlots.map((slot, i) => (
                <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSlot === slot ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600'
                }`}>
                  <input type="radio" name="slot" value={slot} checked={selectedSlot === slot} onChange={() => setSelectedSlot(slot)} className="text-primary-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {format(new Date(slot), 'EEEE, MMMM d, yyyy — h:mm a')}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <input
              type="datetime-local"
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="input-field"
            />
          )}
        </div>
        <div className="mb-4">
          <label className="label">Session Link (optional)</label>
          <input
            type="url"
            value={sessionLink}
            onChange={(e) => setSessionLink(e.target.value)}
            placeholder="https://zoom.us/j/... or Google Meet link"
            className="input-field"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary" disabled={isLoading}>Cancel</button>
          <button onClick={handleAccept} disabled={isLoading} className="flex-1 btn-primary flex items-center justify-center gap-2">
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Accept Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AlumniDashboard() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [alumniProfile, setAlumniProfile] = useState<AlumniProfile | null>(null);
  const [acceptTarget, setAcceptTarget] = useState<MentorshipRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [declineTarget, setDeclineTarget] = useState<MentorshipRequest | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [requestsRes, profileRes] = await Promise.all([
        api.get('/requests/received'),
        api.get('/alumni/my-profile').catch(() => ({ data: null })),
      ]);
      setRequests(requestsRes.data.data.requests || []);
      setAlumniProfile(profileRes.data?.data?.profile || null);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pending = requests.filter((r) => r.status === 'pending');
  const accepted = requests.filter((r) => r.status === 'accepted');
  const completed = requests.filter((r) => r.status === 'completed');

  const handleAccept = async (request: MentorshipRequest, scheduledAt: string, sessionLink: string) => {
    try {
      const res = await api.put(`/requests/${request._id}/accept`, { scheduledAt, sessionLink });
      const accepted = res.data.data.request;
      setRequests((prev) => prev.map((r) => r._id === request._id
        ? { ...r, status: 'accepted', scheduledAt: accepted.scheduledAt, sessionLink: accepted.sessionLink }
        : r
      ));
      toast.success('Request accepted!');
      setAcceptTarget(null);
    } catch {
      toast.error('Failed to accept request');
      throw new Error('Failed');
    }
  };

  const handleDecline = async () => {
    if (!declineTarget) return;
    setActionLoading(declineTarget._id);
    try {
      await api.put(`/requests/${declineTarget._id}/decline`, { declineReason });
      setRequests((prev) => prev.map((r) => r._id === declineTarget._id ? { ...r, status: 'declined' } : r));
      toast.success('Request declined');
      setDeclineTarget(null);
      setDeclineReason('');
    } catch {
      toast.error('Failed to decline request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await api.put(`/requests/${requestId}/complete`);
      setRequests((prev) => prev.map((r) => r._id === requestId ? { ...r, status: 'completed' } : r));
      toast.success('Session marked as complete!');
    } catch {
      toast.error('Failed to mark session as complete');
    } finally {
      setActionLoading(null);
    }
  };


  const handleToggleAccepting = async () => {
    if (!alumniProfile) return;
    try {
      const response = await api.put('/alumni/toggle-accepting');
      setAlumniProfile((prev) => prev ? { ...prev, isAcceptingRequests: response.data.data.isAcceptingRequests } : null);
      toast.success(`Now ${response.data.data.isAcceptingRequests ? 'accepting' : 'not accepting'} requests`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const stats = [
    { icon: <Clock className="w-6 h-6 text-yellow-500" />, value: pending.length, label: 'Pending Requests', color: 'bg-yellow-50 dark:bg-yellow-900/10' },
    { icon: <Calendar className="w-6 h-6 text-blue-500" />, value: accepted.length, label: 'Upcoming Sessions', color: 'bg-blue-50 dark:bg-blue-900/10' },
    { icon: <CheckCircle className="w-6 h-6 text-green-500" />, value: completed.length, label: 'Completed Sessions', color: 'bg-green-50 dark:bg-green-900/10' },
    { icon: <Star className="w-6 h-6 text-purple-500" />, value: alumniProfile?.averageRating ? alumniProfile.averageRating.toFixed(1) : 'N/A', label: 'Average Rating', color: 'bg-purple-50 dark:bg-purple-900/10' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name}</p>
        </div>

        {/* Toggle Accepting */}
        {alumniProfile && (
          <button
            onClick={handleToggleAccepting}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${
              alumniProfile.isAcceptingRequests
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            {alumniProfile.isAcceptingRequests ? (
              <ToggleRight className="w-5 h-5 text-green-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-500" />
            )}
            {alumniProfile.isAcceptingRequests ? 'Accepting Requests' : 'Not Accepting'}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-5 border border-gray-100 dark:border-gray-700`}>
            <div className="flex items-start justify-between">
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Requests Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          Pending Requests
          {pending.length > 0 && (
            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <RequestCardSkeleton key={i} />)}
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((request) => (
              <div key={request._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-start gap-4">
                  <Avatar name={request.studentId.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{request.studentId.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {request.studentProfile?.major} · Year {request.studentProfile?.currentYear}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">{format(new Date(request.createdAt), 'MMM d')}</span>
                    </div>

                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-1">Topic: {request.topic}</p>

                    <div className="mt-2">
                      <button
                        onClick={() => setExpandedRequest(expandedRequest === request._id ? null : request._id)}
                        className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800"
                      >
                        Message
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedRequest === request._id ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedRequest === request._id && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">{request.message}</p>
                      )}
                    </div>

                    {request.proposedSlots?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Proposed times:</p>
                        <div className="flex flex-wrap gap-1">
                          {request.proposedSlots.map((slot, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs">
                              <Clock className="w-3 h-3" />
                              {format(new Date(slot), 'MMM d, h:mm a')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setAcceptTarget(request)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => { setDeclineTarget(request); setDeclineReason(''); }}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      {accepted.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Upcoming Sessions
          </h2>
          <div className="space-y-4">
            {accepted.map((request) => (
              <SessionCard
                key={request._id}
                request={request}
                userRole="alumni"
                onComplete={() => handleComplete(request._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Completed Sessions */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Recent Completed Sessions
          </h2>
          <div className="space-y-4">
            {completed.slice(0, 3).map((request) => (
              <SessionCard
                key={request._id}
                request={request}
                userRole="alumni"
              />
            ))}
          </div>
        </div>
      )}

      {/* Accept Modal */}
      {acceptTarget && (
        <AcceptModal
          request={acceptTarget}
          onClose={() => setAcceptTarget(null)}
          onAccept={(slot, link) => handleAccept(acceptTarget, slot, link)}
        />
      )}

      {/* Decline Modal */}
      {declineTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Decline Request</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Declining request from {declineTarget.studentId.name}
            </p>
            <div className="mb-4">
              <label className="label">Reason (optional)</label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={3}
                placeholder="Let the student know why you're unable to accept..."
                className="input-field resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeclineTarget(null)} className="flex-1 btn-secondary">Cancel</button>
              <button
                onClick={handleDecline}
                disabled={actionLoading === declineTarget._id}
                className="flex-1 btn-danger flex items-center justify-center gap-2"
              >
                {actionLoading === declineTarget._id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

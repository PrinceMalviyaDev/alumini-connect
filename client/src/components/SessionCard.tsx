import { ExternalLink, CheckCircle, MessageSquare, Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';
import { MentorshipRequest } from '../types';
import StarRating from './StarRating';
import Avatar from './Avatar';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

interface SessionCardProps {
  request: MentorshipRequest;
  userRole: string;
  onComplete?: () => void;
  onFeedback?: () => void;
}

export default function SessionCard({ request, userRole, onComplete, onFeedback }: SessionCardProps) {
  const counterpart = userRole === 'alumni' ? request.studentId : request.alumniId;
  const canComplete = request.status === 'accepted' && userRole === 'alumni';
  const canLeaveFeedback = request.status === 'completed' && userRole === 'student' && !request.studentFeedbackDone;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-start gap-4">
        <Avatar name={counterpart?.name || ''} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{counterpart?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {userRole === 'student' ? request.alumniProfile?.jobTitle : request.studentProfile?.major}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>

          <div className="mt-2">
            <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-800 dark:text-gray-200">Topic:</span> {request.topic}
            </span>
          </div>

          {request.scheduledAt && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>{format(new Date(request.scheduledAt), 'PPP p')}</span>
            </div>
          )}

          {/* Alumni: show student's feedback as a card */}
          {userRole === 'alumni' && request.status === 'completed' && request.studentFeedback && (
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Student Feedback</span>
              </div>
              <div className="mb-2">
                <StarRating rating={request.studentFeedback.rating} size="md" />
              </div>
              {request.studentFeedback.comment && (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "{request.studentFeedback.comment}"
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                — {counterpart?.name}
              </p>
            </div>
          )}

          {/* Alumni: no feedback yet indicator */}
          {userRole === 'alumni' && request.status === 'completed' && !request.studentFeedback && (
            <p className="mt-3 text-sm text-gray-400 dark:text-gray-500 italic">No feedback from student yet</p>
          )}

          {/* Student: feedback submitted indicator */}
          {userRole === 'student' && request.studentFeedbackDone && request.status === 'completed' && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                Your feedback submitted
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {request.sessionLink && request.status === 'accepted' && (
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

            {canComplete && onComplete && (
              <button
                onClick={onComplete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </button>
            )}

            {canLeaveFeedback && onFeedback && (
              <button
                onClick={onFeedback}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Leave Feedback
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

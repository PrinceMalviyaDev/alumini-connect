import { MapPin, Briefcase, Users, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User, AlumniProfile } from '../types';
import StarRating from './StarRating';
import SkillBadge from './SkillBadge';
import Avatar from './Avatar';

interface AlumniCardProps {
  user: User;
  profile: AlumniProfile;
  onRequest?: () => void;
}

export default function AlumniCard({ user, profile, onRequest }: AlumniCardProps) {
  const navigate = useNavigate();
  const visibleSkills = profile.mentorshipAreas.slice(0, 4);
  const extraSkills = profile.mentorshipAreas.length - 4;

  const badgeColors = ['blue', 'purple', 'green', 'indigo', 'pink'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col h-full border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar name={user.name} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight truncate">{user.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {profile.jobTitle} @ {profile.company}
          </p>
          {profile.location && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Industry badge */}
      <div className="mb-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
          <Briefcase className="w-3 h-3" />
          {profile.industry}
        </span>
      </div>

      {/* Mentorship Areas */}
      <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
        {visibleSkills.map((skill, i) => (
          <SkillBadge key={skill} skill={skill} color={badgeColors[i % badgeColors.length]} />
        ))}
        {extraSkills > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            +{extraSkills} more
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
        <StarRating rating={profile.averageRating} size="sm" />
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>{profile.totalSessions} sessions</span>
        </div>
        {profile.isAcceptingRequests ? (
          <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full font-medium">
            <CheckCircle className="w-3 h-3" />
            Accepting
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2 py-1 rounded-full font-medium">
            <XCircle className="w-3 h-3" />
            Not Accepting
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/alumni/${(profile.userId as User)?._id || profile.userId}`)}
          className="flex-1 py-2 px-3 text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          View Profile
        </button>
        {profile.isAcceptingRequests && onRequest && (
          <button
            onClick={onRequest}
            className="flex-1 py-2 px-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            Request Mentorship
          </button>
        )}
      </div>
    </div>
  );
}

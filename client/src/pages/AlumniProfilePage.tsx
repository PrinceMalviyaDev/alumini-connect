import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Briefcase, Clock, Star, Users, Calendar, ExternalLink,
  Linkedin, Github, Globe, AlertCircle, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AlumniDirectoryItem, Feedback } from '../types';
import StarRating from '../components/StarRating';
import SkillBadge from '../components/SkillBadge';
import RequestModal from '../components/RequestModal';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/Avatar';
import api from '../lib/axios';

export default function AlumniProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [alumniData, setAlumniData] = useState<AlumniDirectoryItem | null>(null);
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get(`/alumni/${id}`);
        const { user: alumniUser, profile, reviews: profileReviews } = profileRes.data.data;
        setAlumniData({ user: alumniUser, profile });
        setReviews(profileReviews || []);
      } catch {
        toast.error('Failed to load alumni profile');
        navigate('/directory');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleRequest = async (data: { topic: string; message: string; proposedSlots: string[] }) => {
    try {
      await api.post('/requests', {
        alumniId: id,
        ...data,
      });
      toast.success('Mentorship request sent!');
      setShowRequestModal(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to send request');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-96"></div>
            <div className="md:col-span-2 bg-gray-200 dark:bg-gray-700 rounded-xl h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!alumniData) return null;

  const { user: alumniUser, profile } = alumniData;

  const badgeColors = ['blue', 'purple', 'green', 'indigo', 'pink', 'yellow'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </button>

      {/* Not Accepting Banner */}
      {!profile.isAcceptingRequests && (
        <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6 text-yellow-800 dark:text-yellow-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">This mentor is currently not accepting new mentorship requests.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
            <div className="flex justify-center mb-4">
              <Avatar name={alumniUser.name} size="xl" className="!w-28 !h-28 !text-4xl" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{alumniUser.name}</h1>
            <p className="text-primary-600 dark:text-primary-400 font-medium mt-1">{profile.jobTitle}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{profile.company}</p>

            {profile.location && (
              <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </div>
            )}

            {alumniUser.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-left leading-relaxed">{alumniUser.bio}</p>
            )}

            {/* Action Button */}
            {user?.role === 'student' && profile.isAcceptingRequests && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="w-full mt-4 btn-primary py-2.5"
              >
                Request Mentorship
              </button>
            )}

            {/* Social Links */}
            <div className="flex items-center justify-center gap-3 mt-4">
              {alumniUser.linkedIn && (
                <a href={alumniUser.linkedIn} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {alumniUser.github && (
                <a href={alumniUser.github} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              )}
              {alumniUser.portfolio && (
                <a href={alumniUser.portfolio} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* College Info */}
          {alumniUser.college && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span>{alumniUser.college}</span>
                {alumniUser.graduationYear && (
                  <span className="text-gray-400">({alumniUser.graduationYear})</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-5">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Users className="w-5 h-5 text-primary-500" />, value: profile.totalSessions, label: 'Sessions' },
              { icon: <Star className="w-5 h-5 text-yellow-500" />, value: profile.averageRating > 0 ? profile.averageRating.toFixed(1) : 'N/A', label: 'Rating' },
              { icon: <Clock className="w-5 h-5 text-green-500" />, value: `${profile.yearsOfExperience}yr`, label: 'Experience' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Industry */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Industry</h2>
            <span className="inline-flex items-center gap-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1.5 rounded-full text-sm font-medium">
              <Briefcase className="w-3.5 h-3.5" />
              {profile.industry}
            </span>
          </div>

          {/* Mentorship Areas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Mentorship Areas</h2>
            <div className="flex flex-wrap gap-2">
              {profile.mentorshipAreas.map((area, i) => (
                <SkillBadge key={area} skill={area} color={badgeColors[i % badgeColors.length]} />
              ))}
            </div>
          </div>

          {/* Availability */}
          {profile.availability && profile.availability.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                Weekly Availability
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 dark:text-gray-400 text-left">
                      <th className="pb-2 font-medium">Day</th>
                      <th className="pb-2 font-medium">Start Time</th>
                      <th className="pb-2 font-medium">End Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {profile.availability.map((slot, i) => (
                      <tr key={i} className="text-gray-700 dark:text-gray-300">
                        <td className="py-2 font-medium">{slot.day}</td>
                        <td className="py-2">{slot.startTime}</td>
                        <td className="py-2">{slot.endTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Reviews
              {reviews.length > 0 && (
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                  {reviews.length}
                </span>
              )}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews yet. Be the first to leave feedback!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Avatar name={review.fromUserId?.name || ''} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {review.fromUserId?.name}
                          </span>
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-400 ml-auto">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA for student */}
          {user?.role === 'student' && profile.isAcceptingRequests && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Request Mentorship from {alumniUser.name}
            </button>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && alumniData && (
        <RequestModal
          alumni={alumniData}
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleRequest}
        />
      )}
    </div>
  );
}

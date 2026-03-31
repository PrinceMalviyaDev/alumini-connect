import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Star, Users, Briefcase, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { AlumniDirectoryItem } from '../types';
import StarRating from '../components/StarRating';
import Avatar from '../components/Avatar';
import api from '../lib/axios';

const INDUSTRIES = [
  'All Industries', 'Tech', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
  'Consulting', 'Media', 'Retail', 'Government', 'Other',
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
      <Trophy className="w-5 h-5 text-yellow-900" />
    </div>
  );
  if (rank === 2) return (
    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-500 rounded-full flex items-center justify-center shadow-md">
      <Medal className="w-5 h-5 text-gray-700 dark:text-gray-200" />
    </div>
  );
  if (rank === 3) return (
    <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center shadow-md">
      <Medal className="w-5 h-5 text-amber-100" />
    </div>
  );
  return (
    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
      <span className="text-sm font-bold text-gray-600 dark:text-gray-300">#{rank}</span>
    </div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<AlumniDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (selectedIndustry !== 'All Industries') params.industry = selectedIndustry;
        const response = await api.get('/leaderboard', { params });
        setLeaderboard(response.data.data.leaderboard || []);
      } catch {
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedIndustry]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl mb-4">
          <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Top Mentors</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Ranked by total sessions and ratings</p>
      </div>

      {/* Industry Filter */}
      <div className="flex justify-center mb-8">
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="input-field w-auto min-w-48"
        >
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No data available for this filter</p>
        </div>
      ) : (
        <>
          {/* Podium for Top 3 */}
          {top3.length >= 1 && (
            <div className="flex items-end justify-center gap-4 mb-10 px-4">
              {/* 2nd Place */}
              {top3[1] && (
                <div className="flex-1 max-w-44 text-center">
                  <div className="flex flex-col items-center mb-3">
                    <Avatar name={top3[1].user.name} size="lg" className="mb-2" />
                    <p className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">{top3[1].user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{top3[1].profile.company}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{top3[1].profile.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">· {top3[1].profile.totalSessions} sessions</span>
                    </div>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-600 rounded-t-xl h-24 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-500 rounded-full flex items-center justify-center">
                      <Medal className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              <div className="flex-1 max-w-44 text-center">
                <div className="flex flex-col items-center mb-3">
                  <div className="relative">
                    <Avatar name={top3[0].user.name} size="xl" />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</div>
                  </div>
                  <p className="font-bold text-base text-gray-900 dark:text-white leading-tight">{top3[0].user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{top3[0].profile.company}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-600">{top3[0].profile.averageRating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">· {top3[0].profile.totalSessions} sessions</span>
                  </div>
                </div>
                <div className="bg-yellow-400 rounded-t-xl h-36 flex items-center justify-center shadow-md">
                  <Trophy className="w-8 h-8 text-yellow-900" />
                </div>
              </div>

              {/* 3rd Place */}
              {top3[2] && (
                <div className="flex-1 max-w-44 text-center">
                  <div className="flex flex-col items-center mb-3">
                    <Avatar name={top3[2].user.name} size="lg" className="mb-2 !w-14 !h-14" />
                    <p className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">{top3[2].user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{top3[2].profile.company}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{top3[2].profile.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">· {top3[2].profile.totalSessions} sessions</span>
                    </div>
                  </div>
                  <div className="bg-amber-600 rounded-t-xl h-16 flex items-center justify-center">
                    <Medal className="w-5 h-5 text-amber-100" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Leaderboard List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">All Rankings</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {leaderboard.map((item, index) => (
                <div
                  key={item.user._id}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/5' : ''
                  }`}
                >
                  <RankBadge rank={index + 1} />
                  <Avatar name={item.user.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{item.user.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {item.profile.jobTitle} @ {item.profile.company}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                        <Briefcase className="w-3 h-3" />
                        {item.profile.industry}
                      </span>
                    </div>
                    {item.profile.location && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {item.profile.location}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StarRating rating={item.profile.averageRating} size="sm" />
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Users className="w-3 h-3" />
                      {item.profile.totalSessions} sessions
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/alumni/${item.user._id}`)}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium flex-shrink-0 hidden sm:block"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

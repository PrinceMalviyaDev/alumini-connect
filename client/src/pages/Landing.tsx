import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Send,
  Calendar,
  BarChart2,
  MessageSquare,
  Trophy,
  Star,
  Users,
  Briefcase,
  ArrowRight,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import { AlumniDirectoryItem } from '../types';
import StarRating from '../components/StarRating';
import Avatar from '../components/Avatar';
import api from '../lib/axios';

const features = [
  {
    icon: <Search className="w-6 h-6 text-primary-600" />,
    title: 'Search Alumni',
    description: 'Browse our curated directory of alumni mentors filtered by industry, skills, and availability.',
  },
  {
    icon: <Send className="w-6 h-6 text-green-600" />,
    title: 'Send Requests',
    description: 'Reach out directly to mentors with a personalized message and propose meeting times.',
  },
  {
    icon: <Calendar className="w-6 h-6 text-blue-600" />,
    title: 'Schedule Sessions',
    description: 'Coordinate mentorship sessions with ease using our scheduling system.',
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-purple-600" />,
    title: 'Track Progress',
    description: 'Monitor your mentorship journey and see how you are growing professionally.',
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-yellow-600" />,
    title: 'Get Feedback',
    description: 'Both mentors and students exchange valuable feedback after each session.',
  },
  {
    icon: <Trophy className="w-6 h-6 text-orange-600" />,
    title: 'Leaderboard',
    description: 'See top mentors ranked by sessions and ratings to find the best match.',
  },
];

const stats = [
  { value: '40+', label: 'Alumni Mentors', icon: <Users className="w-6 h-6" /> },
  { value: '10', label: 'Industries', icon: <Briefcase className="w-6 h-6" /> },
  { value: '100%', label: 'Session Scheduling', icon: <Calendar className="w-6 h-6" /> },
  { value: '5★', label: 'Mutual Feedback', icon: <Star className="w-6 h-6" /> },
];

export default function Landing() {
  const [topMentors, setTopMentors] = useState<AlumniDirectoryItem[]>([]);

  useEffect(() => {
    api.get('/leaderboard', { params: { limit: 3 } }).then((res) => {
      const data = res.data.data?.leaderboard || [];
      setTopMentors(data.slice(0, 3));
    }).catch(() => {
      // Silently fail for public page
    });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <GraduationCap className="w-7 h-7" />
            <span>AlumniConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            Alumni Mentorship Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Bridge the Gap Between{' '}
            <span className="text-yellow-300">Education</span> &{' '}
            <span className="text-green-300">Industry</span>
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Connect with alumni mentors who've walked the path you're on. Get career guidance,
            resume reviews, interview prep, and real-world insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-semibold py-3 px-8 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
              onClick={() => localStorage.setItem('pendingRole', 'student')}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-xl text-lg transition-all"
            >
              Join as Alumni
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-200">
            {['Free to join', 'Verified alumni', 'Real connections'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl mx-auto mb-3 text-primary-600 dark:text-primary-400">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform provides all the tools for meaningful mentorship connections between students and alumni.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-600"
              >
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-600 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Mentors Preview */}
      {topMentors.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Featured Mentors</h2>
              <p className="text-gray-500 dark:text-gray-400">Top-rated mentors ready to help you succeed</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topMentors.map((mentor, i) => (
                <div
                  key={mentor.user._id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 text-center relative"
                >
                  {i === 0 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                      Top Mentor
                    </div>
                  )}
                  <div className="flex justify-center mb-3">
                    <Avatar name={mentor.user.name} size="xl" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{mentor.user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{mentor.profile.jobTitle}</p>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{mentor.profile.company}</p>
                  <div className="flex items-center justify-center mt-2">
                    <StarRating rating={mentor.profile.averageRating} size="sm" />
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {mentor.profile.location}
                    </span>
                    <span>{mentor.profile.totalSessions} sessions</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 btn-primary text-base px-6 py-3"
              >
                Join to Connect with Mentors
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-primary-200 mb-8 text-lg">
            Join thousands of students and alumni building meaningful professional connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-700 hover:bg-primary-50 font-semibold py-3 px-8 rounded-xl transition-all flex items-center gap-2 justify-center"
            >
              <GraduationCap className="w-5 h-5" />
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-xl transition-all flex items-center gap-2 justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-white">
              <GraduationCap className="w-6 h-6 text-primary-400" />
              <span>AlumniConnect</span>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} AlumniConnect. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

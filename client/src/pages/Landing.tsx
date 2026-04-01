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
  Sparkles,
  Shield,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { AlumniDirectoryItem } from '../types';
import StarRating from '../components/StarRating';
import Avatar from '../components/Avatar';
import api from '../lib/axios';

const steps = [
  {
    step: '01',
    icon: <Search className="w-6 h-6" />,
    title: 'Discover Mentors',
    description: 'Browse alumni from top institutions across 10+ industries. Filter by skills, rating, and availability.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    step: '02',
    icon: <Send className="w-6 h-6" />,
    title: 'Send a Request',
    description: 'Reach out with your goals, propose meeting times, and get accepted within hours.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    step: '03',
    icon: <Calendar className="w-6 h-6" />,
    title: 'Meet & Learn',
    description: 'Join sessions via Google Meet or Zoom. Get resume reviews, mock interviews, and career advice.',
    color: 'from-emerald-500 to-green-500',
  },
  {
    step: '04',
    icon: <BarChart2 className="w-6 h-6" />,
    title: 'Grow Together',
    description: 'Exchange feedback, track progress on the leaderboard, and build lasting connections.',
    color: 'from-orange-500 to-amber-500',
  },
];

const features = [
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Alumni Directory',
    description: 'Filter mentors by industry, skills, rating, and acceptance status.',
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: 'Two-way Feedback',
    description: 'Students rate mentors, alumni share suggestions — everyone improves.',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: 'Mentor Leaderboard',
    description: 'Top mentors ranked by sessions and ratings. Find the best match for you.',
    gradient: 'from-amber-600 to-orange-600',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Regret Engine',
    description: 'Learn from alumni career regrets so you can make smarter decisions early.',
    gradient: 'from-rose-600 to-red-600',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Role-based Access',
    description: 'Separate dashboards for students, alumni, and admins — clean and focused.',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Real-time Notifications',
    description: 'Instant alerts when requests are accepted, sessions complete, or feedback arrives.',
    gradient: 'from-cyan-600 to-blue-600',
  },
];

const stats = [
  { value: '50+', label: 'Alumni Mentors', icon: <Users className="w-5 h-5" /> },
  { value: '10', label: 'Industries', icon: <Briefcase className="w-5 h-5" /> },
  { value: '25+', label: 'Top Colleges', icon: <GraduationCap className="w-5 h-5" /> },
  { value: '5★', label: 'Feedback System', icon: <Star className="w-5 h-5" /> },
];

export default function Landing() {
  const [topMentors, setTopMentors] = useState<AlumniDirectoryItem[]>([]);

  useEffect(() => {
    api.get('/leaderboard', { params: { limit: 4 } }).then((res) => {
      const data = res.data.data?.leaderboard || [];
      setTopMentors(data.slice(0, 4));
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ─── Navbar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5 font-bold text-xl text-gray-900 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span>AlumniConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-5 py-2.5 rounded-xl transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative pt-28 pb-24 sm:pt-36 sm:pb-32 px-4 overflow-hidden">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-400/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-400/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-400/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-full px-4 py-1.5 text-sm font-medium text-primary-700 dark:text-primary-300 mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            India's Alumni Mentorship Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-gray-900 dark:text-white mb-6">
            Your Career.{' '}
            <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Their Experience.
            </span>
            <br />
            <span className="text-gray-400 dark:text-gray-500">Real Connections.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with alumni from IITs, NITs, and BITS who work at Google, Flipkart, ISRO, and more.
            Get career guidance, mock interviews, and real-world mentorship.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              to="/register"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-semibold py-3.5 px-8 rounded-2xl text-lg transition-all shadow-lg shadow-gray-900/10"
            >
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 font-semibold py-3.5 px-8 rounded-2xl text-lg transition-all"
            >
              <GraduationCap className="w-5 h-5" />
              Join as Alumni
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500 dark:text-gray-400">
            {['Free forever', 'No credit card needed', '50+ mentors ready'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl mx-auto mb-2.5 text-primary-600 dark:text-primary-400">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 sm:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              From search to session in <span className="text-primary-600">4 steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.step} className="relative group">
                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-40px)] h-[2px] bg-gradient-to-r from-gray-200 dark:from-gray-700 to-gray-100 dark:to-gray-800" />
                )}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg transition-all h-full">
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-gray-900/5`}>
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-gray-300 dark:text-gray-600 mb-1">STEP {step.step}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="py-20 sm:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Built for meaningful mentorship — not just connections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg transition-all"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Mentors ─── */}
      {topMentors.length > 0 && (
        <section className="py-20 sm:py-28 bg-white dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">Top Mentors</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Learn from the best
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Top-rated alumni mentors from leading companies and institutions
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {topMentors.map((mentor, i) => (
                <div
                  key={mentor.user._id}
                  className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-xl transition-all text-center"
                >
                  {i === 0 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      #1 Mentor
                    </div>
                  )}
                  <div className="flex justify-center mb-4">
                    <div className="ring-2 ring-gray-100 dark:ring-gray-700 rounded-full p-0.5">
                      <Avatar name={mentor.user.name} size="xl" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{mentor.user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{mentor.profile.jobTitle}</p>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{mentor.profile.company}</p>

                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <StarRating rating={mentor.profile.averageRating} size="sm" />
                    <span className="text-xs text-gray-400 ml-1">({mentor.profile.reviewCount})</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {mentor.profile.location?.split(',')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {mentor.profile.totalSessions} sessions
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
              >
                View all mentors
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary-900 to-indigo-900" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/15 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Your next career move starts with a conversation
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">
            Join a community of students and alumni building real professional connections — not just LinkedIn endorsements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3.5 px-8 rounded-2xl transition-all flex items-center gap-2 justify-center shadow-lg shadow-black/20"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-white/30 text-white hover:border-white/50 hover:bg-white/5 font-semibold py-3.5 px-8 rounded-2xl transition-all flex items-center gap-2 justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-gray-950 text-gray-400 py-10 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">AlumniConnect</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} AlumniConnect. Built for India's future workforce.
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

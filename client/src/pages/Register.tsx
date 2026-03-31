import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Eye, EyeOff, UserCheck, Building2,
  ArrowLeft, ArrowRight, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

function getErrorMessage(error: unknown): string {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
  if (err.response) {
    const status = err.response.status;
    const msg = err.response.data?.message;
    if (status === 409) return 'An account with this email already exists. Try signing in instead.';
    if (status === 400) return msg || 'Please check the information you entered.';
    if (status && status >= 500) return 'Server error. Please try again in a moment.';
    if (msg) return msg;
  }
  if (err.message === 'Network Error') return 'Cannot reach the server. Check your connection.';
  return 'Registration failed. Please try again.';
}

function inputClass() {
  return 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 focus:border-primary-500 transition-colors';
}

export default function Register() {
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // Step 2
  const [selectedRole, setSelectedRole] = useState<'student' | 'alumni' | null>(null);
  const [roleError, setRoleError] = useState('');

  // Step 3 fields
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Next = () => {
    if (validateStep1()) setStep(2);
  };

  const handleRoleNext = () => {
    if (!selectedRole) {
      setRoleError('Please select a role to continue.');
      return;
    }
    setRoleError('');
    setStep(3);
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!college.trim() || college.trim().length < 2) errs.college = 'College / university name is required';
    if (selectedRole === 'alumni') {
      if (!graduationYear) {
        errs.graduationYear = 'Graduation year is required for alumni';
      } else if (parseInt(graduationYear) > currentYear) {
        errs.graduationYear = 'Graduation year must not be in the future. Only graduated users can register as alumni.';
      }
    }
    setStep3Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep3() || !selectedRole) return;
    setIsSubmitting(true);
    setServerError('');
    try {
      const payload = {
        name,
        email,
        password,
        role: selectedRole,
        college,
        ...(selectedRole === 'alumni' && graduationYear ? { graduationYear: parseInt(graduationYear) } : {}),
      };
      const response = await api.post('/auth/register', payload);
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('Account created! Let\'s set up your profile.');
      navigate(`/onboarding/${selectedRole}`);
    } catch (error: unknown) {
      setServerError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const stepTitles = ['Your Info', 'Choose Role', 'Details'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
            <GraduationCap className="w-8 h-8" />
            AlumniConnect
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Create your account</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {stepTitles.map((title, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${i < step - 1 ? 'text-green-600' : i === step - 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  i < step - 1
                    ? 'bg-green-600 border-green-600 text-white'
                    : i === step - 1
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-400'
                }`}>
                  {i < step - 1 ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{title}</span>
              </div>
              {i < stepTitles.length - 1 && (
                <div className={`h-0.5 w-8 ${i < step - 1 ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className={inputClass()} />
                {step1Errors.name && <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="w-3 h-3" /> {step1Errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className={inputClass()} />
                {step1Errors.email && <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="w-3 h-3" /> {step1Errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                    className={`${inputClass()} pr-10`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {step1Errors.password && <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="w-3 h-3" /> {step1Errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" autoComplete="new-password" className={inputClass()} />
                {step1Errors.confirmPassword && <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="w-3 h-3" /> {step1Errors.confirmPassword}</p>}
              </div>

              <button type="button" onClick={handleStep1Next} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                Continue <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</Link>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Role Selection */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-gray-600 dark:text-gray-400 text-center">How will you be using AlumniConnect?</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['student', 'alumni'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => { setSelectedRole(role); setRoleError(''); }}
                    className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                      selectedRole === role
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : roleError
                        ? 'border-red-300 dark:border-red-700 hover:border-red-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                    }`}
                  >
                    {selectedRole === role && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${role === 'student' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                      {role === 'student'
                        ? <UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        : <Building2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                      }
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{role}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {role === 'student' ? 'Find mentors and grow your career' : 'Share your experience and mentor others'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {roleError && (
                <p className="flex items-center gap-1 text-red-500 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {roleError}
                </p>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={handleRoleNext} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: College / Details */}
          {step === 3 && (
            <div className="space-y-5">

              {serverError && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">College / University *</label>
                <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="e.g. MIT, IIT Bombay..." className={inputClass()} />
                {step3Errors.college && <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="w-3 h-3" /> {step3Errors.college}</p>}
              </div>

              {selectedRole === 'alumni' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Graduation Year *</label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2020"
                    min="1970"
                    max={currentYear}
                    className={inputClass()}
                  />
                  {step3Errors.graduationYear && <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="w-3 h-3" /> {step3Errors.graduationYear}</p>}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(2); setServerError(''); }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

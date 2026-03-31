import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, X, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

const CAREER_GOALS_PLACEHOLDER = 'Describe your career goals, what kind of mentor you are looking for, and what you hope to achieve through mentorship...';

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1
  const [major, setMajor] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [careerGoals, setCareerGoals] = useState('');

  // Step 2
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  // Step 3
  const [bio, setBio] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
    }
    setInterestInput('');
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!major.trim()) newErrors.major = 'Major is required';
      if (!currentYear) newErrors.currentYear = 'Current year is required';
      if (!careerGoals.trim() || careerGoals.length < 20) newErrors.careerGoals = 'Career goals must be at least 20 characters';
    }
    if (s === 2) {
      if (interests.length === 0) newErrors.interests = 'Add at least one interest';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    if (!user) return;
    setIsSubmitting(true);
    try {
      await api.post('/students/profile', {
        major,
        currentYear: parseInt(currentYear),
        careerGoals,
        interests,
        resumeUrl: resumeUrl || undefined,
      });

      const updatedUser = await api.put('/users/profile', {
        isOnboarded: true,
        bio: bio || undefined,
      });

      setUser(updatedUser.data.data.user);
      toast.success('Profile created! Welcome to AlumniConnect.');
      navigate('/directory');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ['Academic Info', 'Interests', 'Profile'];
  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">
            <GraduationCap className="w-8 h-8" />
            AlumniConnect
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Student Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Help mentors understand your background</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-1.5 ${i + 1 <= step ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  i + 1 < step ? 'bg-primary-600 border-primary-600 text-white'
                  : i + 1 === step ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Academic Information</h2>
              <div>
                <label className="label">Major / Field of Study *</label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g. Computer Science, Business, Engineering..."
                  className="input-field"
                />
                {errors.major && <p className="text-red-500 text-xs mt-1">{errors.major}</p>}
              </div>
              <div>
                <label className="label">Current Year *</label>
                <select value={currentYear} onChange={(e) => setCurrentYear(e.target.value)} className="input-field">
                  <option value="">Select year...</option>
                  {[1, 2, 3, 4, 5, 6].map((yr) => (
                    <option key={yr} value={yr}>Year {yr}</option>
                  ))}
                </select>
                {errors.currentYear && <p className="text-red-500 text-xs mt-1">{errors.currentYear}</p>}
              </div>
              <div>
                <label className="label">Career Goals *</label>
                <textarea
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  rows={4}
                  placeholder={CAREER_GOALS_PLACEHOLDER}
                  className="input-field resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{careerGoals.length} characters</p>
                {errors.careerGoals && <p className="text-red-500 text-xs mt-1">{errors.careerGoals}</p>}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Interests</h2>
              <div>
                <label className="label">Interests & Areas *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
                    placeholder="Type and press Enter to add..."
                    className="input-field flex-1"
                  />
                  <button type="button" onClick={addInterest} className="btn-primary px-3">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {interests.map((interest) => (
                    <span key={interest} className="inline-flex items-center gap-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm">
                      {interest}
                      <button onClick={() => removeInterest(interest)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {errors.interests && <p className="text-red-500 text-xs mt-1">{errors.interests}</p>}
              </div>
              <div>
                <label className="label">Resume URL (optional)</label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="input-field"
                />
                <p className="text-xs text-gray-400 mt-1">Link to your Google Drive, Dropbox, or portfolio</p>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Profile</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your profile photo uses the first letter of your name.</p>
              </div>
              <div>
                <label className="label">Bio (optional)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell mentors a bit about yourself..."
                  className="input-field resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={handleNext} className="flex-1 btn-primary flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Complete Profile <CheckCircle className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

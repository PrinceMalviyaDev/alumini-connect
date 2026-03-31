import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, X, ArrowLeft, ArrowRight, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

const INDUSTRIES = [
  'Tech', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
  'Consulting', 'Media', 'Retail', 'Government', 'Other',
];

const MENTORSHIP_AREAS = [
  'Resume Review', 'Interview Prep', 'Career Guidance', 'Technical Skills',
  'Networking', 'Leadership', 'Entrepreneurship', 'Graduate School',
  'Work-Life Balance', 'Industry Insights',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export default function AlumniOnboarding() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [location, setLocation] = useState('');

  // Step 2
  const [mentorshipAreas, setMentorshipAreas] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Step 3
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([
    { day: 'Monday', startTime: '09:00', endTime: '17:00' },
  ]);

  // Step 4
  const [bio, setBio] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');

  const toggleMentorshipArea = (area: string) => {
    setMentorshipAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  };

  const addSlot = () => {
    setAvailability([...availability, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string) => {
    setAvailability(availability.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)));
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!company.trim()) newErrors.company = 'Company is required';
      if (!jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
      if (!industry) newErrors.industry = 'Industry is required';
      if (!yearsOfExperience || isNaN(parseInt(yearsOfExperience))) newErrors.yearsOfExperience = 'Valid years of experience required';
      if (!location.trim()) newErrors.location = 'Location is required';
    }
    if (s === 2) {
      if (mentorshipAreas.length === 0) newErrors.mentorshipAreas = 'Select at least one mentorship area';
    }
    if (s === 3) {
      if (availability.length === 0) newErrors.availability = 'Add at least one availability slot';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await api.post('/alumni/profile', {
        company,
        jobTitle,
        industry,
        yearsOfExperience: parseInt(yearsOfExperience),
        location,
        mentorshipAreas: [...mentorshipAreas, ...skills],
        availability,
        isAcceptingRequests: true,
      });

      const updatedUser = await api.put('/users/profile', {
        isOnboarded: true,
        bio: bio || undefined,
        linkedIn: linkedIn || undefined,
        github: github || undefined,
        portfolio: portfolio || undefined,
      });

      setUser(updatedUser.data.data.user);
      toast.success('Profile created! Welcome to AlumniConnect.');
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ['Professional Info', 'Mentorship Areas', 'Availability', 'Profile'];
  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
            <GraduationCap className="w-8 h-8" />
            AlumniConnect
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Alumni Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Share your expertise to help students grow</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-1 ${i + 1 <= step ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  i + 1 < step ? 'bg-green-600 border-green-600 text-white'
                  : i + 1 === step ? 'bg-green-600 border-green-600 text-white'
                  : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium hidden lg:block">{s}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">

          {/* Step 1: Professional Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Professional Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Company *</label>
                  <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google, Microsoft..." className="input-field" />
                  {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
                </div>
                <div>
                  <label className="label">Job Title *</label>
                  <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Software Engineer..." className="input-field" />
                  {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Industry *</label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input-field">
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                  {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
                </div>
                <div>
                  <label className="label">Years of Experience *</label>
                  <input type="number" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} placeholder="5" min="0" max="50" className="input-field" />
                  {errors.yearsOfExperience && <p className="text-red-500 text-xs mt-1">{errors.yearsOfExperience}</p>}
                </div>
              </div>
              <div>
                <label className="label">Location *</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" className="input-field" />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Mentorship Areas */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mentorship Areas</h2>
              <div>
                <label className="label">Select areas you can mentor in *</label>
                <div className="grid grid-cols-2 gap-2">
                  {MENTORSHIP_AREAS.map((area) => (
                    <label key={area} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      mentorshipAreas.includes(area)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={mentorshipAreas.includes(area)}
                        onChange={() => toggleMentorshipArea(area)}
                        className="rounded text-green-600 hidden"
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        mentorshipAreas.includes(area) ? 'bg-green-600 border-green-600' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {mentorshipAreas.includes(area) && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="text-sm">{area}</span>
                    </label>
                  ))}
                </div>
                {errors.mentorshipAreas && <p className="text-red-500 text-xs mt-1">{errors.mentorshipAreas}</p>}
              </div>
              <div>
                <label className="label">Additional Skills (optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    placeholder="Type and press Enter..."
                    className="input-field flex-1"
                  />
                  <button type="button" onClick={addSkill} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                      {skill}
                      <button onClick={() => setSkills(skills.filter((s) => s !== skill))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Availability</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Set your weekly availability for mentorship sessions</p>
              <div className="space-y-3">
                {availability.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <select
                      value={slot.day}
                      onChange={(e) => updateSlot(i, 'day', e.target.value)}
                      className="input-field flex-1"
                    >
                      {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(i, 'startTime', e.target.value)}
                      className="input-field w-32"
                    />
                    <span className="text-gray-500 dark:text-gray-400">to</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(i, 'endTime', e.target.value)}
                      className="input-field w-32"
                    />
                    {availability.length > 1 && (
                      <button onClick={() => removeSlot(i)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.availability && <p className="text-red-500 text-xs">{errors.availability}</p>}
              <button
                onClick={addSlot}
                className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                <Plus className="w-4 h-4" /> Add another time slot
              </button>
            </div>
          )}

          {/* Step 4: Profile & Links */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile & Links</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your profile photo uses the first letter of your name.</p>
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Share your background and what you can offer as a mentor..."
                  className="input-field resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">LinkedIn URL</label>
                  <input type="url" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/..." className="input-field" />
                </div>
                <div>
                  <label className="label">GitHub URL</label>
                  <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." className="input-field" />
                </div>
              </div>
              <div>
                <label className="label">Portfolio URL</label>
                <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://yourportfolio.com" className="input-field" />
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
            {step < 4 ? (
              <button onClick={handleNext} className="flex-1 btn-primary flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 btn-primary flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
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

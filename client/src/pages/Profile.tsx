import { useState, useEffect } from 'react';
import { Save, Plus, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { AlumniProfile, StudentProfile } from '../types';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

const INDUSTRIES = [
  'Tech', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
  'Consulting', 'Media', 'Retail', 'Government', 'Other',
];

export default function Profile() {
  const { user, setUser } = useAuthStore();

  // User fields — initialized directly from store (guaranteed non-null by ProtectedRoute)
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [college, setCollege] = useState(user?.college || '');
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear?.toString() || '');
  const [linkedIn, setLinkedIn] = useState(user?.linkedIn || '');
  const [github, setGithub] = useState(user?.github || '');
  const [portfolio, setPortfolio] = useState(user?.portfolio || '');

  // Alumni profile fields
  const [alumniProfile, setAlumniProfile] = useState<AlumniProfile | null>(null);
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState<{ day: string; startTime: string; endTime: string }[]>([]);
  const [mentorshipAreas, setMentorshipAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState('');

  // Student profile fields
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [major, setMajor] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Fetch fresh user + role-specific profile on mount
  useEffect(() => {
    const loadAll = async () => {
      setProfileLoading(true);
      setFetchError('');
      try {
        // Refresh user fields from DB
        const meRes = await api.get('/auth/me');
        const fresh = meRes.data.data.user;
        setUser(fresh);
        setName(fresh.name || '');
        setBio(fresh.bio || '');
        setCollege(fresh.college || '');
        setGraduationYear(fresh.graduationYear?.toString() || '');
        setLinkedIn(fresh.linkedIn || '');
        setGithub(fresh.github || '');
        setPortfolio(fresh.portfolio || '');

        // Fetch role-specific profile
        if (fresh.role === 'alumni') {
          const res = await api.get('/alumni/my-profile');
          const profile = res.data.data.profile;
          setAlumniProfile(profile);
          setCompany(profile.company || '');
          setJobTitle(profile.jobTitle || '');
          setIndustry(profile.industry || '');
          setYearsOfExperience(profile.yearsOfExperience?.toString() || '');
          setLocation(profile.location || '');
          setAvailability(profile.availability || []);
          setMentorshipAreas(profile.mentorshipAreas || []);
        } else if (fresh.role === 'student') {
          const res = await api.get('/students/my-profile');
          const profile = res.data.data.profile;
          setStudentProfile(profile);
          setMajor(profile.major || '');
          setCurrentYear(profile.currentYear?.toString() || '');
          setCareerGoals(profile.careerGoals || '');
          setInterests(profile.interests || []);
          setResumeUrl(profile.resumeUrl || '');
        }
      } catch {
        setFetchError('Could not load your profile. You can still edit and save.');
      } finally {
        setProfileLoading(false);
      }
    };

    loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setIsSaving(true);
    try {
      const res = await api.put('/users/profile', {
        name,
        bio: bio || undefined,
        college: college || undefined,
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
        linkedIn: linkedIn || undefined,
        github: github || undefined,
        portfolio: portfolio || undefined,
      });
      setUser(res.data.data.user);

      if (user?.role === 'alumni') {
        const alumniPayload = {
          company, jobTitle, industry,
          yearsOfExperience: parseInt(yearsOfExperience) || 0,
          location, availability, mentorshipAreas,
        };
        if (alumniProfile) {
          await api.put('/alumni/profile', alumniPayload);
        } else {
          await api.post('/alumni/profile', alumniPayload);
        }
      } else if (user?.role === 'student') {
        const studentPayload = {
          major,
          currentYear: parseInt(currentYear) || 1,
          careerGoals, interests, resumeUrl,
        };
        if (studentProfile) {
          await api.put('/students/profile', studentPayload);
        } else {
          await api.post('/students/profile', studentPayload);
        }
      }

      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const addSlot = () => {
    setAvailability([...availability, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  };

  const updateSlot = (i: number, field: string, value: string) => {
    setAvailability(availability.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const removeSlot = (i: number) => {
    setAvailability(availability.filter((_, idx) => idx !== i));
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Update your personal information and preferences</p>
      </div>

      {fetchError && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 rounded-lg px-4 py-3 mb-6 text-sm">
          {fetchError}
        </div>
      )}

      <div className="space-y-6">

        {/* Profile Photo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Photo</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your profile photo is generated from the first letter of your name.</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input-field resize-none" />
            </div>
            <div>
              <label className="label">College / University</label>
              <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label">Graduation Year</label>
              <input type="number" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} min="1970" max="2030" className="input-field" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">LinkedIn</label>
              <input type="url" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/..." className="input-field" />
            </div>
            <div>
              <label className="label">GitHub</label>
              <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Portfolio</label>
              <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://yourportfolio.com" className="input-field" />
            </div>
          </div>
        </div>

        {/* Alumni-Specific Section */}
        {user?.role === 'alumni' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional Information</h2>
              {profileLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Company</label>
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Job Title</label>
                    <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Industry</label>
                    <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input-field">
                      <option value="">Select industry...</option>
                      {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Years of Experience</label>
                    <input type="number" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} min="0" className="input-field" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Location</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" />
                  </div>
                </div>
              )}
            </div>

            {!profileLoading && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mentorship Areas</h2>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={areaInput}
                      onChange={(e) => setAreaInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (areaInput.trim() && !mentorshipAreas.includes(areaInput.trim())) {
                            setMentorshipAreas([...mentorshipAreas, areaInput.trim()]);
                            setAreaInput('');
                          }
                        }
                      }}
                      placeholder="Add area and press Enter..."
                      className="input-field flex-1"
                    />
                    <button type="button" onClick={() => {
                      if (areaInput.trim() && !mentorshipAreas.includes(areaInput.trim())) {
                        setMentorshipAreas([...mentorshipAreas, areaInput.trim()]);
                        setAreaInput('');
                      }
                    }} className="btn-primary px-3">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mentorshipAreas.map((area) => (
                      <span key={area} className="inline-flex items-center gap-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm">
                        {area}
                        <button type="button" onClick={() => setMentorshipAreas(mentorshipAreas.filter((a) => a !== area))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Availability</h2>
                  <div className="space-y-2 mb-3">
                    {availability.map((slot, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <select value={slot.day} onChange={(e) => updateSlot(i, 'day', e.target.value)} className="input-field flex-1">
                          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <input type="time" value={slot.startTime} onChange={(e) => updateSlot(i, 'startTime', e.target.value)} className="input-field w-28" />
                        <span className="text-gray-400">–</span>
                        <input type="time" value={slot.endTime} onChange={(e) => updateSlot(i, 'endTime', e.target.value)} className="input-field w-28" />
                        <button type="button" onClick={() => removeSlot(i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addSlot} className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    <Plus className="w-4 h-4" /> Add time slot
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Student-Specific Section */}
        {user?.role === 'student' && !profileLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Major</label>
                <input type="text" value={major} onChange={(e) => setMajor(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Current Year</label>
                <select value={currentYear} onChange={(e) => setCurrentYear(e.target.value)} className="input-field">
                  <option value="">Select...</option>
                  {[1, 2, 3, 4, 5, 6].map((yr) => <option key={yr} value={yr}>Year {yr}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Career Goals</label>
                <textarea value={careerGoals} onChange={(e) => setCareerGoals(e.target.value)} rows={3} className="input-field resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Interests</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (interestInput.trim() && !interests.includes(interestInput.trim())) {
                          setInterests([...interests, interestInput.trim()]);
                          setInterestInput('');
                        }
                      }
                    }}
                    placeholder="Add interest and press Enter..."
                    className="input-field flex-1"
                  />
                  <button type="button" onClick={() => {
                    if (interestInput.trim()) { setInterests([...interests, interestInput.trim()]); setInterestInput(''); }
                  }} className="btn-primary px-3">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                      {i}
                      <button type="button" onClick={() => setInterests(interests.filter((int) => int !== i))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Resume URL</label>
                <input type="url" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} className="input-field" placeholder="https://..." />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button type="button" onClick={handleSave} disabled={isSaving} className="btn-primary px-8 py-3 flex items-center gap-2">
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

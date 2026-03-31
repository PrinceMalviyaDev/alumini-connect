export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'alumni' | 'admin';
  avatar: string;
  bio?: string;
  college?: string;
  graduationYear?: number;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  isOnboarded: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AlumniProfile {
  _id: string;
  userId: string | User;
  company: string;
  jobTitle: string;
  industry: string;
  mentorshipAreas: string[];
  availability: { day: string; startTime: string; endTime: string }[];
  isAcceptingRequests: boolean;
  yearsOfExperience: number;
  location: string;
  totalSessions: number;
  averageRating: number;
  reviewCount: number;
}

export interface StudentProfile {
  _id: string;
  userId: string | User;
  major: string;
  currentYear: number;
  interests: string[];
  careerGoals: string;
  resumeUrl?: string;
}

export interface MentorshipRequest {
  _id: string;
  studentId: User;
  alumniId: User;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  topic: string;
  message: string;
  proposedSlots: string[];
  scheduledAt?: string;
  sessionLink?: string;
  sessionNotes?: string;
  studentFeedbackDone: boolean;
  alumniFeedbackDone: boolean;
  createdAt: string;
  studentProfile?: StudentProfile;
  alumniProfile?: AlumniProfile;
  studentFeedback?: {
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
}

export interface Feedback {
  _id: string;
  requestId: string;
  fromUserId: User;
  toUserId: string;
  rating: number;
  comment: string;
  type: 'student-to-alumni' | 'alumni-to-student';
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'request_received' | 'request_accepted' | 'request_declined' | 'session_reminder' | 'feedback_received' | 'session_completed';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AlumniDirectoryItem {
  user: User;
  profile: AlumniProfile;
}

export interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

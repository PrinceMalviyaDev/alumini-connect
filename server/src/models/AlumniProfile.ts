import mongoose, { Document, Schema } from 'mongoose';

export interface IAvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface IAlumniProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  company: string;
  jobTitle: string;
  industry: string;
  mentorshipAreas: string[];
  availability: IAvailabilitySlot[];
  isAcceptingRequests: boolean;
  yearsOfExperience: number;
  location: string;
  totalSessions: number;
  averageRating: number;
  reviewCount: number;
}

const AvailabilitySlotSchema = new Schema<IAvailabilitySlot>(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const AlumniProfileSchema = new Schema<IAlumniProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    company: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    industry: {
      type: String,
      enum: ['Tech', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Consulting', 'Media', 'Retail', 'Government', 'Other'],
      default: 'Tech',
    },
    mentorshipAreas: [{ type: String }],
    availability: [AvailabilitySlotSchema],
    isAcceptingRequests: { type: Boolean, default: true },
    yearsOfExperience: { type: Number, default: 0 },
    location: { type: String, default: '' },
    totalSessions: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AlumniProfile = mongoose.model<IAlumniProfile>('AlumniProfile', AlumniProfileSchema);

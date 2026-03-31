import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  major: string;
  currentYear: number;
  interests: string[];
  careerGoals: string;
  resumeUrl: string;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    major: { type: String, default: '' },
    currentYear: { type: Number, min: 1, max: 6, default: 1 },
    interests: [{ type: String }],
    careerGoals: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);

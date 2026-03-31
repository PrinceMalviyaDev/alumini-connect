import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorshipRequest extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  alumniId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  topic: string;
  message: string;
  proposedSlots: Date[];
  scheduledAt?: Date;
  sessionLink?: string;
  sessionNotes?: string;
  studentFeedbackDone: boolean;
  alumniFeedbackDone: boolean;
  createdAt: Date;
}

const MentorshipRequestSchema = new Schema<IMentorshipRequest>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    alumniId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
      default: 'pending',
    },
    topic: { type: String, required: true },
    message: { type: String, required: true },
    proposedSlots: [{ type: Date }],
    scheduledAt: { type: Date },
    sessionLink: { type: String },
    sessionNotes: { type: String },
    studentFeedbackDone: { type: Boolean, default: false },
    alumniFeedbackDone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MentorshipRequest = mongoose.model<IMentorshipRequest>('MentorshipRequest', MentorshipRequestSchema);

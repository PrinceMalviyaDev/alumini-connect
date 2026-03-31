import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId;
  requestId: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  type: 'student-to-alumni' | 'alumni-to-student';
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    requestId: { type: Schema.Types.ObjectId, ref: 'MentorshipRequest', required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    type: {
      type: String,
      enum: ['student-to-alumni', 'alumni-to-student'],
      required: true,
    },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);

import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'request_received'
  | 'request_accepted'
  | 'request_declined'
  | 'session_reminder'
  | 'feedback_received'
  | 'session_completed';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'request_received',
        'request_accepted',
        'request_declined',
        'session_reminder',
        'feedback_received',
        'session_completed',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

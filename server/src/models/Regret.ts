import mongoose, { Document, Schema } from 'mongoose';

export interface IRegretComment {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IRegret extends Document {
  _id: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  likes: number;
  dislikes: number;
  likedBy: mongoose.Types.ObjectId[];
  dislikedBy: mongoose.Types.ObjectId[];
  comments: IRegretComment[];
  createdAt: Date;
}

const RegretCommentSchema = new Schema<IRegretComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

const RegretSchema = new Schema<IRegret>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislikedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: { type: [RegretCommentSchema], default: [] },
  },
  { timestamps: true }
);

export const Regret = mongoose.model<IRegret>('Regret', RegretSchema);

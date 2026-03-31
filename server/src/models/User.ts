import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
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
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'alumni', 'admin'], required: true },
    avatar: {
      type: String,
      default: function (this: IUser) {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(this.name || 'default')}`;
      },
    },
    bio: { type: String, default: '' },
    college: { type: String, default: '' },
    graduationYear: { type: Number },
    linkedIn: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    isOnboarded: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);

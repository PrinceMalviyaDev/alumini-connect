export interface JwtPayload {
  userId: string;
  role: 'student' | 'alumni' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

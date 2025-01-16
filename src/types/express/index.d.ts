import { UserType } from '../user.type';

declare global {
  namespace Express {
    interface Request {
      user?: UserType; // The custom property 'user'
      token?: string; // The custom property 'token'
    }
  }
}

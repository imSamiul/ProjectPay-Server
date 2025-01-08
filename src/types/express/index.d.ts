import { UserType } from '../userType';

declare global {
  namespace Express {
    interface Request {
      user?: UserType; // The custom property 'user'
      roles?: string[];
    }
  }
}

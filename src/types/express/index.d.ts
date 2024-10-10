import { IUser } from '../../interfaces/userDocumentInterface';

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // The custom property 'user'
      token?: string; // The custom property 'token'
    }
  }
}

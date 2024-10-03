import { IUser } from '../../interfaces/userDocumentType';

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // The custom property 'user'
      token?: string; // The custom property 'token'
    }
  }
}


import { IUser } from './models/User.model';
import { TFunction } from 'i18next';

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      user?: IUser;
      t: TFunction;
    }
  }
}

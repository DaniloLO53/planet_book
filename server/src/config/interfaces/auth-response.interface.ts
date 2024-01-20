import { IAuthResponseUser } from 'src/users/interfaces/auth-response-user.interface';

export interface IAuthResponse {
  user: IAuthResponseUser;
  accessToken: string;
}

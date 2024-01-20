import { IAuthResult } from 'src/auth/interfaces/auth-result.interface';
import { IAuthResponse } from 'src/config/interfaces/auth-response.interface';
import { AuthResponseUserMapper } from './auth-response-user.mapper';

export class AuthResponseMapper implements IAuthResponse {
  public user: AuthResponseUserMapper;
  public accessToken: string;

  constructor(values: IAuthResponse) {
    Object.assign(this, values);
  }

  public static map(result: IAuthResult): AuthResponseMapper {
    return new AuthResponseMapper({
      user: AuthResponseUserMapper.map(result.user),
      accessToken: result.accessToken,
    });
  }
}

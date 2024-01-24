import { Injectable, UnauthorizedException } from '@nestjs/common';
import { scrypt } from 'crypto';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dtos/signIn.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const passwordIsValid = this.comparePasswords(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException();
    }

    const { password: storedPassword, ...sanitizedUser } = user;

    return sanitizedUser;
  }

  private async comparePasswords(password: string, storedPassword: string) {
    const [hashed, salt] = storedPassword.split('.');

    return new Promise((resolve, reject) => {
      scrypt(password, salt, 32, (err, key) => {
        if (err) {
          reject(err);
        }

        resolve(key.toString('hex') === hashed);
      })
    })
  }

  async health() {
    return await this.usersService.health();
  }
}

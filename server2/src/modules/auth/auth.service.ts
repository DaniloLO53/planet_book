import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, scrypt } from 'crypto';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dtos/signIn.dto';
import { SignUpDto } from './dtos/signUp.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, username, password, confirmPassword } = signUpDto;

    const user = await this.usersService.findUserByEmailOrUsername(
      email,
      username,
    );
    if (user.length > 0) {
      throw new ConflictException();
    }

    if (password !== confirmPassword) {
      throw new BadRequestException();
    }

    const [hashed, salt] = await this.saltAndHash(password);

    const newUser = await this.usersService.createUser({
      username,
      email,
      password: `${hashed}.${salt}`,
    });

    return await this.generateConfirmationToken(newUser);
  }

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

    // return {
    //   accessToken: await this.jwtService.signAsync(sanitizedUser),
    // };
  }

  private async generateConfirmationToken(
    user: Omit<SignUpDto, 'confirmPassword'> & { id: number },
  ) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        user,
        process.env.JWT_CONFIRMATION_SECRET!,
        {
          expiresIn: `${process.env.JWT_CONFIRMATION_TIME!}s`,
          algorithm: 'HS256'
        },
        (err, token) => {
          if (err) {
            return reject(err);
          }

          resolve(token);
        }
        );
    });
  }

  private async comparePasswords(
    password: string,
    storedPassword: string,
  ): Promise<boolean> {
    const [hashed, salt] = storedPassword.split('.');

    return new Promise((resolve, reject) => {
      scrypt(password, salt, 32, (err, key) => {
        if (err) {
          reject(err);
        }

        resolve(key.toString('hex') === hashed);
      });
    });
  }

  private async saltAndHash(password: string): Promise<[string, string]> {
    const salt = randomBytes(4).toString('hex');

    return new Promise((resolve, reject) => {
      scrypt(password, salt, 32, (err, key) => {
        if (err) {
          reject(err);
        }

        resolve([key.toString('hex'), salt]);
      });
    });
  }

  async health() {
    return await this.usersService.health();
  }
}

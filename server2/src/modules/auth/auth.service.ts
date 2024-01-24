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
import { IUser } from '../users/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

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
    const { password: storedPassword, confirmed, ...sanitizedUser } = newUser;

    return await this.generateConfirmationToken(sanitizedUser);
  }

  async signIn(signInDto: SignInDto): Promise<{ user: IUser, accessToken: string, refreshToken: string }> {
    const { email, password } = signInDto;

    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.confirmed) {
      // ###### TODO
    }


    const passwordIsValid = this.comparePasswords(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException();
    }

    const { password: storedPassword, confirmed, ...sanitizedUser } = user;
    const accessToken = await this.generateAccessToken(sanitizedUser) as string;
    const refreshToken = await this.generateRefreshToken(sanitizedUser) as string;

    return { user: sanitizedUser, accessToken, refreshToken };
  }

  private async generateAccessToken(user: IUser) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        user,
        process.env.JWT_ACCESS_SECRET!,
        {
          expiresIn: `${process.env.JWT_ACCESS_TIME!}s`,
          algorithm: 'HS256',
        },
        (err, token) => {
          if (err) {
            return reject(err);
          }

          resolve(token);
        },
      );
    });
  }

  private async generateRefreshToken(user: IUser) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        user,
        process.env.JWT_REFRESH_SECRET!,
        {
          expiresIn: `${process.env.JWT_REFRESH_TIME!}s`,
          algorithm: 'HS256',
        },
        (err, token) => {
          if (err) {
            return reject(err);
          }

          resolve(token);
        },
      );
    });
  }

  private async generateConfirmationToken(user: IUser) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        user,
        process.env.JWT_CONFIRMATION_SECRET!,
        {
          expiresIn: `${process.env.JWT_CONFIRMATION_TIME!}s`,
          algorithm: 'HS256',
        },
        (err, token) => {
          if (err) {
            return reject(err);
          }

          resolve(token);
        },
      );
    });
  }

  async verifyTokenAsync<T>(
    token: string,
    secret: string,
    options: jwt.VerifyOptions,
  ) {
    return new Promise((resolve, rejects) => {
      jwt.verify(token, secret, options, (err, payload) => {
        if (err) {
          return rejects(err);
        }
        resolve(payload);
      });
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

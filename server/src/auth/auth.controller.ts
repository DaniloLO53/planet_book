import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMessage } from 'src/common/interfaces/message.interface';
import { isUndefined } from 'src/common/utils/validation.util';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Origin } from 'src/decorators/origin.decorator';
import { Public } from 'src/decorators/public.decorator';
import { IAuthResponseUser } from 'src/users/interfaces/auth-response-user.interface';
import { AuthResponseUserMapper } from 'src/users/mappers/auth-response-user.mapper';
import { AuthResponseMapper } from 'src/users/mappers/auth-response.mapper';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
// ...

@Controller('api/auth')
export class AuthController {
  private readonly cookiePath = '/api/auth';
  private readonly cookieName: string;
  private readonly refreshTime: number;
  private readonly testing: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.get<string>('REFRESH_COOKIE');
    this.refreshTime = this.configService.get<number>('jwt.refresh.time');
    this.testing = this.configService.get<string>('NODE_ENV') !== 'production';
  }

  @Public()
  @Post('/sign-up')
  public async signUp(
    @Origin() origin: string | undefined,
    @Body() signUpDto: SignUpDto,
  ): Promise<IMessage> {
    return this.authService.signUp(signUpDto, origin);
  }

  @Public()
  @Post('/sign-in')
  public async signIn(
    @Res() res: Response,
    @Origin() origin: string | undefined,
    @Body() singInDto: SignInDto,
  ): Promise<void> {
    const result = await this.authService.singIn(singInDto, origin);
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  private refreshTokenFromReq(req: any): string {
    const token: string | undefined = req.signedCookies[this.cookieName];

    if (isUndefined(token)) {
      throw new UnauthorizedException();
    }

    return token;
  }

  @Public()
  @Post('/refresh-access')
  public async refreshAccess(
    @Req() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const token = this.refreshTokenFromReq(req);
    const result = await this.authService.refreshTokenAccess(
      token,
      req.headers.origin,
    );
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  private saveRefreshCookie(res: any, refreshToken: string): any {
    return res.cookie(this.cookieName, refreshToken, {
      secure: !this.testing,
      httpOnly: true,
      signed: true,
      path: this.cookiePath,
      expires: new Date(Date.now() + this.refreshTime * 1000),
    });
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  public async logout(@Req() req: any, @Res() res: any): Promise<void> {
    const token = this.refreshTokenFromReq(req);
    const message = await this.authService.logout(token);
    res
      .clearCookie(this.cookieName, { path: this.cookiePath })
      .status(HttpStatus.OK)
      .json(message);
  }

  @Public()
  @Post('/confirm-email')
  public async confirmEmail(
    @Body() confirmEmailDto: ConfirmEmailDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.confirmEmail(confirmEmailDto);
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Public()
  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<IMessage> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Patch('/update-password')
  public async updatePassword(
    @CurrentUser() userId: number,
    @Origin() origin: string | undefined,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.updatePassword(
      userId,
      changePasswordDto,
      origin,
    );
    this.saveRefreshCookie(res, result.refreshToken)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Get('/me')
  public async getMe(@CurrentUser() id: number): Promise<IAuthResponseUser> {
    const user = await this.usersService.findOneById(id);
    return AuthResponseUserMapper.map(user);
  }
}

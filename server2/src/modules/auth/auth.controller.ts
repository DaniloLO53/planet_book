import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from 'src/decorators/isPublic.decorator';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/signIn.dto';
import { SignUpDto } from './dtos/signUp.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const result = await this.authService.signIn(signInDto);
    return this.saveRefreshCookie(res, result.refreshToken).status(201).json(result);
  }

  @Get('health')
  health() {
    return this.authService.health();
  }

  private saveRefreshCookie(res: any, refreshToken: string): any {
    return res.cookie(process.env.REFRESH_COOKIE!, refreshToken, {
      secure: false,
      httpOnly: true,
      signed: true,
      path: '/auth',
      expires: new Date(
        Date.now() + parseInt(process.env.JWT_REFRESH_TIME!) * 1000,
      ),
    });
  }
}

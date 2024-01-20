import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Public } from 'src/decorators/public.decorator';
import { ChangeEmailDto } from './dtos/change-email.dto';
import { GetUserParams } from './dtos/get-user.params';
import { PasswordDto } from './dtos/password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { IAuthResponseUser } from './interfaces/auth-response-user.interface';
import { IResponseUser } from './interfaces/response-user.interface';
import { AuthResponseUserMapper } from './mappers/auth-response-user.mapper';
import { ResponseUserMapper } from './mappers/response-user.mapper';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  private cookiePath = '/api/auth';
  private cookieName: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.get<string>('COOKIE_NAME');
  }

  @Public()
  @Get('/:idOrUsername')
  public async getUser(@Param() params: GetUserParams): Promise<IResponseUser> {
    const user = await this.usersService.findOneByIdOrUsername(
      params.idOrUsername,
    );
    return ResponseUserMapper.map(user);
  }

  @Patch('/email')
  public async updateEmail(
    @CurrentUser() id: number,
    @Body() dto: ChangeEmailDto,
  ): Promise<IAuthResponseUser> {
    const user = await this.usersService.updateEmail(id, dto);
    return AuthResponseUserMapper.map(user);
  }

  @Patch()
  public async updateUser(
    @CurrentUser() id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<IResponseUser> {
    const user = await this.usersService.update(id, dto);
    return ResponseUserMapper.map(user);
  }

  @Delete()
  public async deleteUser(
    @CurrentUser() id: number,
    @Body() dto: PasswordDto,
    @Res() res: any,
  ): Promise<void> {
    await this.usersService.delete(id, dto);
    res
      .clearCookie(this.cookieName, { path: this.cookiePath })
      .status(HttpStatus.NO_CONTENT)
      .send();
  }
}

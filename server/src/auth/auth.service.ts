import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CommonService } from '../common/common.service';
import { JwtService } from '../jwt/jwt.service';
import { MailerService } from '../mailer/mailer.service';
import { UsersService } from '../users/users.service';
import { BlacklistedTokenEntity } from './entities/blacklisted-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(BlacklistedTokenEntity)
    private readonly blacklistedTokensRepository: EntityRepository<BlacklistedTokenEntity>,
    private readonly commonService: CommonService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}
}

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { ConfigService } from 'src/config/config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  adminuser: any;

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
    this.adminuser = configService.get('ADMIN_USER')

  }

  async validate(payload: any) {
    if(payload.username === this.adminuser ) {
      return { userId: payload.sub, username: payload.username };
    }
    return false;
  }
}
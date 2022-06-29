import { Module, Logger } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { ArangoModule } from 'src/persistence/arango/arango.module';
import { ConfigModule } from 'src/config/config/config.module';
import { TrackModule } from 'src/track/track/track.module';
import { AuthModule } from 'src/auth/auth.module';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '../config/config/config.service';


@Module({
  imports: [AuthModule, ConfigModule, ArangoModule.collection('session'), TrackModule],
  providers: [SessionService],
  controllers: [SessionController],
  exports: [SessionService]
})
export class SessionModule {

  private readonly logger = new Logger(TrackModule.name);
  constructor(
    private configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {
    
  }

  @Cron('*/10 * * * *')
  async handleCron() {
    const startDate = new Date();
    startDate.setFullYear(1970);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() - +this.configService.get('TRACK_LIFETIME_MONTHS'));
    
    let userSessions = await this.sessionService.getSessionsByDate(0, 10000, startDate, endDate);
    for(let us of userSessions) {
      this.logger.debug(`[housekeeper] removing expired sid ${us.sid}`);
      await this.sessionService.removeSession(us);
    }

  }
}
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigModule } from 'src/config/config/config.module';
import { SessionModule } from 'src/session/session.module';
import { TrackModule } from 'src/track/track/track.module';
import { HousekeeperService } from './housekeeper.service';

@Module({
  imports: [
    ConfigModule,
    TrackModule,
    SessionModule
  ],
  providers: [HousekeeperService],
  exports: [HousekeeperService]
})
export class HousekeeperModule implements OnModuleInit {
  private readonly logger: Logger = new Logger(HousekeeperModule.name);

  constructor(
    private readonly houseKeeperService: HousekeeperService
  ) {

  }
  onModuleInit() {
    this.cleanExpiredSessions();
    this.cleanExpiredTracks();
  }

  @Cron('*/10 * * * *')
  async cleanExpiredTracks() {

    this.logger.log('cleaning expired tracks');
    let clientTracks = await this.houseKeeperService.cleanExpiredTracks();

    for (let ct of clientTracks) {
      this.logger.log(` * removing expired track ${ct.flowId} tid: ${ct.tid}`);
    }

  }

  @Cron('*/10 * * * *')
  async cleanExpiredSessions() {

    this.logger.log('cleaning expired sessions');
    let userSessions = await this.houseKeeperService.cleanExpiredSessions();

    for (let us of userSessions) {
      this.logger.log(` * removing expired session sid: ${us.sid}`);
    }

  }
}

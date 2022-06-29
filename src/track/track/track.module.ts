import { Logger, Module } from '@nestjs/common';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { ArangoModule } from 'src/persistence/arango/arango.module';
import { AuthModule } from 'src/auth/auth.module';
import { Cron } from '@nestjs/schedule';
import { ConfigModule } from '../../config/config/config.module';
import { ConfigService } from '../../config/config/config.service';


@Module({
  imports: [AuthModule, ConfigModule, ArangoModule.collection('track')],
  providers: [TrackService],
  controllers: [TrackController],
  exports: [TrackService]
})
export class TrackModule {

  private readonly logger = new Logger(TrackModule.name);
  constructor(
    private configService: ConfigService,
    private readonly trackService: TrackService
  ) {
    
  }

  @Cron('*/10 * * * *')
  async handleCron() {
    const startDate = new Date();
    startDate.setFullYear(1970);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() - +this.configService.get('TRACK_LIFETIME_MONTHS'));
    let clientTracks = await this.trackService.getSessionsByDate(0, 1000, startDate, endDate);

    for(let ct of clientTracks) {
      this.logger.debug(`[housekeeper] removing expired tid ${ct.sid}`);
      await this.trackService.removeClientTrack(ct);
    }

  }
}
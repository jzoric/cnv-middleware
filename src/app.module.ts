import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client/client/client.module';
import { ArangoModule } from './persistence/arango/arango.module';
import { ConfigModule } from './config/config/config.module';

import { ConfigService } from './config/config/config.service';
import { SessionModule } from './client/session/session.module';
import { TrackModule } from './track/track/track.module';
import { NoderedModule } from './nodered/nodered.module';
import { AuthModule } from './auth/auth.module';
import { SessionService } from './client/session/session.service';
import { TrackService } from './track/track/track.service';
import { Cron, ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ClientModule,
    ServeStaticModule.forRoot({
      renderPath: '/resources/',
      rootPath: join(__dirname, '..', 'resources')
    }),
    ArangoModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host: configService.get('ARANGO_HOST'),
        user: configService.get('ARANGO_USER'),
        password: configService.get('ARANGO_PASSWORD'),
        database: configService.get('ARANGO_DATABASE'),
      }),
    }),
    ConfigModule,
    SessionModule,
    TrackModule,
    NoderedModule,
    AuthModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);
  constructor(
    private configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly trackService: TrackService
  ) {
    
  }

  @Cron('*/10 * * * * *')
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

    let clientTracks = await this.trackService.getSessionsByDate(0, 1000, startDate, endDate);

    for(let ct of clientTracks) {
      this.logger.debug(`[housekeeper] removing expired tid ${ct.sid}`);
      await this.trackService.removeClientTrack(ct);
    }

  }
}

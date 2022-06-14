import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client/client/client.module';
import { ArangoModule } from './persistence/arango/arango.module';
import { ConfigModule } from './config/config/config.module';

import { ConfigService } from './config/config/config.service';
import { SessionModule } from './session/session.module';
import { TrackModule } from './track/track/track.module';
import { NoderedModule } from './nodered/nodered.module';
import { AuthModule } from './auth/auth.module';
import { SessionService } from './session/session.service';
import { TrackService } from './track/track/track.service';
import { Cron, ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join, parse } from 'path';
import { MetricsModule } from './metrics/metrics.module';
import { CustomFiltersModule } from './custom-filters/custom-filters.module';
import { UAParser } from 'ua-parser-js';
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
    ScheduleModule.forRoot(),
    MetricsModule,
    CustomFiltersModule
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
    this.sessionMigrations();
  }

  

  @Cron('*/10 * * * * *')
  async handleCron() {
    //TODO: Use database instead
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

  // migrations

  async sessionMigrations() {
    const batchSize = 100;
    let nsessions = await this.sessionService.countessionsWithNoParsedUserAgent();
    
    if(nsessions == 0) {
      this.logger.log(`Session migrations not required`);
    } else {
      this.logger.log(`Preparing to migrate ${nsessions} sessions`);
    }

    while(nsessions - batchSize > 0) {
      await this.updateSessionWithDetailedUserAgent(0, batchSize)
      nsessions -=batchSize;
    }
    if(nsessions > 0) {
      await this.updateSessionWithDetailedUserAgent(0, batchSize)
    }
  }


  private async updateSessionWithDetailedUserAgent(page: number, take: number ) {
    this.logger.debug(`running batch ${page}, ${take}`);
    const sessions = await this.sessionService.getSessionsWithNoParsedUserAgent(page, take);
    sessions.forEach(async (session) => {
      const parsedUA = UAParser(session.userAgent);
      session.browser = parsedUA.browser;
      session.cpu = parsedUA.cpu;
      session.operatingSystem = parsedUA.os;
      this.logger.debug(`updating ${session.sid}`);
      await this.sessionService.updateSession(session);

    })
  }
}

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
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MetricsModule } from './metrics/metrics.module';
import { CustomFiltersModule } from './custom-filters/custom-filters.module';
import { UAParser } from 'ua-parser-js';
import { lookup } from 'geoip-lite';
import { PropertiesModule } from './properties/properties.module';

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
    CustomFiltersModule,
    PropertiesModule
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
    this.runMigrations();
  }

  // migrations

  private async runMigrations() {
    await this.sessionUserAgentMigrations();
    await this.sessionUserLocationMigrations();
    await this.sessionUserIPMigrations();
  }

  async sessionUserAgentMigrations() {
    const batchSize = 100;
    let nsessions = await this.sessionService.countessionsWithNoParsedUserAgent();

    if (nsessions == 0) {
      this.logger.log(`Session user agent migrations not required`);
    } else {
      this.logger.log(`Preparing to migrate user agent on ${nsessions} sessions`);
    }

    while (nsessions - batchSize > 0) {
      await this.updateSessionWithDetailedUserAgent(0, batchSize)
      nsessions -= batchSize;
    }
    if (nsessions > 0) {
      await this.updateSessionWithDetailedUserAgent(0, batchSize)
    }
  }

  async sessionUserLocationMigrations() {
    const batchSize = 100;
    let nsessions = await this.sessionService.countessionsWithNoParsedUserLocation();

    if (nsessions == 0) {
      this.logger.log(`Session user location migrations not required`);
    } else {
      this.logger.log(`Preparing to migrate user IP on ${nsessions} sessions`);
    }

    while (nsessions - batchSize > 0) {
      await this.updateSessionWithDetailedUserLocation(0, batchSize)
      nsessions -= batchSize;
    }
    if (nsessions > 0) {
      await this.updateSessionWithDetailedUserLocation(0, batchSize)
    }
  }

  async sessionUserIPMigrations() {
    const batchSize = 100;
    let nsessions = await this.sessionService.countessionsWithParsedUserLocationAndIP();

    if (nsessions == 0) {
      this.logger.log(`Session user ip migrations not required`);
    } else {
      this.logger.log(`Preparing to migrate user locations on ${nsessions} sessions`);
    }

    while (nsessions - batchSize > 0) {
      await this.updateSessionsWithParsedUserLocationAndIP(0, batchSize)
      nsessions -= batchSize;
    }
    if (nsessions > 0) {
      await this.updateSessionsWithParsedUserLocationAndIP(0, batchSize)
    }
  }


  private async updateSessionWithDetailedUserAgent(page: number, take: number) {
    const sessions = await this.sessionService.getSessionsWithNoParsedUserAgent(page, take);
    sessions.forEach(async (session) => {
      if (session.userAgent) {
        try {
          const parsedUA = UAParser(session.userAgent);
          session.browser = parsedUA?.browser;
          session.cpu = parsedUA.cpu;
          session.operatingSystem = parsedUA.os;

        } catch (e) {
          this.logger.error(e);
        }

        this.logger.debug(`updating ${session.sid} wioth detailed useragent`);
        await this.sessionService.updateSession(session);
      } else {
        this.logger.error(`Session ${session.sid} is missing a valid user agent`);
      }

    })
  }

  private async updateSessionWithDetailedUserLocation(page: number, take: number) {
    const sessions = await this.sessionService.getSessionsWithNoParsedUserLocation(page, take);
    sessions.forEach(async (session) => {

      if (session.userIp) {
        let country: string;
        let city: string;
        try {
          const userInfoLocation = lookup(session.userIp);
          country = userInfoLocation?.country || '';
          city = userInfoLocation?.city || '';
        } catch (e) {
          this.logger.error(e);
        }
        session.country = country;
        session.city = city;
        this.logger.debug(`updating ${session.sid} with detailed user location`);

        await this.sessionService.updateSession(session);
      } else {
        this.logger.error(`Session ${session.sid} is missing a valid user ip`);
      }

    })
  }

  private async updateSessionsWithParsedUserLocationAndIP(page: number, take: number) {
    const sessions = await this.sessionService.getSessionsWithParsedUserLocationAndIP(page, take);
    sessions.forEach(async (session) => {

      if (session.userIp) {
        session.userIp = null;
        this.logger.debug(`removing userIp on ${session.sid}`);

        await this.sessionService.updateSession(session);
      } else {
        this.logger.error(`Session ${session.sid} is missing a valid user ip`);
      }

    })
  }
}

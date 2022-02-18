import { Module } from '@nestjs/common';
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
    AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

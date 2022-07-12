import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { ClientModule } from 'src/client/client.module';
import { AuthModule } from 'src/auth/auth.module';
import { TrackModule } from 'src/track/track/track.module';
import { SessionModule } from 'src/session/session.module';
import { ArangoModule } from 'src/persistence/arango/arango.module';
import { ConfigModule } from 'src/config/config/config.module';
import { PropertiesModule } from 'src/properties/properties.module';

@Module({
  providers: [MetricsService],
  controllers: [MetricsController],
  imports: [
    ArangoModule.collection('metrics'),
    AuthModule,
    ClientModule,
    TrackModule,
    SessionModule,
    ConfigModule,
    PropertiesModule
  ],
  exports: [MetricsService]
})
export class MetricsModule { }

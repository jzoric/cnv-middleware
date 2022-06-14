import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { ClientModule } from 'src/client/client/client.module';
import { AuthModule } from 'src/auth/auth.module';
import { TrackModule } from 'src/track/track/track.module';
import { SessionModule } from 'src/session/session.module';

@Module({
  providers: [MetricsService],
  controllers: [MetricsController],
  imports: [
    AuthModule,
    ClientModule,
    TrackModule,
    SessionModule
  ]
})
export class MetricsModule {}

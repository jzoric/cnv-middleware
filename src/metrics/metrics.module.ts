import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { ClientModule } from 'src/client/client/client.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [MetricsService],
  controllers: [MetricsController],
  imports: [
    AuthModule,
    ClientModule
  ]
})
export class MetricsModule {}

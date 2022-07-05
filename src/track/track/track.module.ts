import { Logger, Module } from '@nestjs/common';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { ArangoModule } from 'src/persistence/arango/arango.module';
import { AuthModule } from 'src/auth/auth.module';
import { Cron } from '@nestjs/schedule';
import { ConfigModule } from '../../config/config/config.module';
import { ConfigService } from '../../config/config/config.service';
import { InteractionModule } from 'src/interaction/interaction.module';


@Module({
  imports: [
    AuthModule,
    ConfigModule,
    ArangoModule.collection('track'),
    InteractionModule
  ],
  providers: [TrackService],
  controllers: [TrackController],
  exports: [TrackService]
})
export class TrackModule { }
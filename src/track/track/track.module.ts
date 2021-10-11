import { Module } from '@nestjs/common';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { ArangoModule } from 'src/persistence/arango/arango.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, ArangoModule.collection('track')],
  providers: [TrackService],
  controllers: [TrackController],
  exports: [TrackService]
})
export class TrackModule {}

import { Module } from '@nestjs/common';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { ArangoModule } from 'src/persistence/arango/arango.module';

@Module({
  imports: [ArangoModule.collection('track')],
  providers: [TrackService],
  controllers: [TrackController],
  exports: [TrackService]
})
export class TrackModule {}

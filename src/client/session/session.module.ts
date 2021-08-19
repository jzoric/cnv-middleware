import { Module, Session } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { ArangoModule } from 'src/persistence/arango/arango.module';
import { ConfigModule } from 'src/config/config/config.module';
import { TrackModule } from 'src/track/track/track.module';

@Module({
  imports: [ConfigModule, ArangoModule.collection('session'), TrackModule],
  providers: [SessionService],
  controllers: [SessionController],
  exports: [SessionService]
})
export class SessionModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config/config.module';
import { ArangoModule } from 'src/persistence/arango/arango.module';
import { TrackModule } from 'src/track/track/track.module';
import { SessionModule } from '../../session/session.module';
import { ClientController } from './client.controller';
import { ClientGateway } from './client.gateway';
import { ClientService } from './client.service';

@Module({
  imports: [ConfigModule, SessionModule, TrackModule],
  controllers: [ClientController],
  providers: [ClientService, ClientGateway],
  exports: [ClientService]
})
export class ClientModule {}

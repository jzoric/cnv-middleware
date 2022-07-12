import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config/config.module';
import { InteractionModule } from 'src/interaction/interaction.module';
import { TrackModule } from 'src/track/track.module';
import { SessionModule } from 'src/session/session.module';
import { ClientController } from './client.controller';
import { ClientGateway } from './client.gateway';
import { ClientService } from './client.service';

@Module({
  imports: [
    ConfigModule,
    SessionModule,
    TrackModule,
    InteractionModule
  ],
  controllers: [ClientController],
  providers: [ClientService, ClientGateway],
  exports: [ClientService]
})
export class ClientModule {}

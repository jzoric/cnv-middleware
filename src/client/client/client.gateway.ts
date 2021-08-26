import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

import { ClientService } from './client.service';

@WebSocketGateway({  namespace: /^.*$/,
  transports: [
    'websocket',
    'polling'
  ],
  cookie: true
  
})
export class ClientGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ClientGateway.name);

  constructor(private readonly clientService: ClientService) {
  
    this.logger.debug('gateway online');
    
    
    setInterval(() => {
      const clients = clientService.getActiveClients();
      this.logger.debug(`active clients: ${clients.length}`);
      this.logger.debug( clients.map(c => c.remoteClient.id));
    }, 20000);
  }

  
  handleConnection(client: any, ...args: any[]) {
    this.logger.debug(`client connected:: ${client.id} on flow: ${client.nsp.name}`);
    this.clientService.handleConnection(client);
  }

  handleDisconnect(client: any) {
    this.logger.debug(`client disconnected:: ${ client.id}`);
    this.clientService.handleDisconnect(client);
    
  }
  
}

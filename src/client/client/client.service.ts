import { Injectable } from '@nestjs/common';
import { ClientBroker } from './model/client.broker';
import { ConfigService } from 'src/config/config/config.service';
import { TrackService } from 'src/track/track/track.service';

@Injectable()
export class ClientService {
    private clients: ClientBroker[]; 

    constructor(
        private readonly configService: ConfigService,
        private readonly trackService: TrackService
    ) {
        this.clients = [];

    }

    public getActiveClients(): ClientBroker[] {
        return this.clients
    }

    public async handleConnection(client) {
        const sid = client.handshake.headers.cookie?.split(';').filter(c => c.indexOf('conversation-vv-sid') > -1)?.[0].split('=')?.[1];
        const tid = client.handshake.query.tid;


        const clientTrack = await this.trackService.getTrack(sid, tid);
        try {
            this.clients.push(
                new ClientBroker(
                    client,
                    `${this.configService.get("nodered-ws-connection")}${client.nsp.name}`,
                    clientTrack,
                    this.trackService
                )
                );
        } catch(e) {
            client.disconnect();
            console.error(e);
        }
    }

    public handleDisconnect(client) {

        const currClient = this.clients.filter(c => {
            return c.remoteClient.id == client.id;
        })
        if(currClient.length > 0) {
            currClient[0].terminate();
            const idx = this.clients.indexOf(currClient[0]);
            if (idx > -1) {
                this.clients.splice(idx, 1);
            }
        }
    }
}

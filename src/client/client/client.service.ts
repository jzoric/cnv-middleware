import { Injectable } from '@nestjs/common';
import { ClientBroker } from './model/client.broker';
import { ConfigService } from 'src/config/config/config.service';
import { TrackService } from 'src/track/track/track.service';
import { SESSION_COOKIE_NAME } from '../session/session.constants';
import { ClientTrack } from 'src/track/track/model/client.track';

@Injectable()
export class ClientService {
    private clients: ClientBroker[]; 
    private WSCONN;
    constructor(
        private readonly configService: ConfigService,
        private readonly trackService: TrackService
    ) {
        this.clients = [];
        this.WSCONN = this.configService.get("NODERED_WS_CONNECTION") || 'ws://localhost:8080';
    }

    public getActiveClients(): ClientBroker[] {
        return this.clients
    }

    public async handleConnection(client: any) {
        const sid = client.handshake.headers.cookie?.split(';').filter(c => c.indexOf(SESSION_COOKIE_NAME) > -1)?.[0].split('=')?.[1];
        const tid = client.handshake.query.tid;


        let clientTrack = await this.trackService.getTrack(sid, tid);
        if(!clientTrack) {
            client.disconnect();
            return;
        }
        try {
            this.clients.push(
                new ClientBroker(
                    client,
                    `${this.WSCONN}${client.nsp.name}`,
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

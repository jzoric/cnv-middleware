import { Injectable, Logger } from '@nestjs/common';
import { ClientBroker } from 'src/model/client.broker';
import { ConfigService } from 'src/config/config/config.service';
import { TrackService } from 'src/track/track.service';
import { SESSION_COOKIE_NAME } from 'src/session/session.constants';
import { ActiveClientsByFlows } from 'src/model/ActiveClientsByFlows.interface';
import { ActiveTrack } from 'src/model/ActiveTrack';
import { InteractionService } from 'src/interaction/interaction.service';

@Injectable()
export class ClientService {
    private logger: Logger = new Logger(ClientService.name)
    private clients: ClientBroker[]; 
    private WSCONN;
    constructor(
        private readonly configService: ConfigService,
        private readonly trackService: TrackService,
        private readonly interactionService: InteractionService
    ) {
        this.clients = [];
        this.WSCONN = this.configService.get("NODERED_WS_CONNECTION") || 'ws://localhost:8080';

        // setInterval(() => {
        //     this.logger.log(`client connections: ${this.getActiveClients().length}`);
        // }, 2000);
    }

    public getActiveClients(): ClientBroker[] {
        return this.clients
    }

    public getActiveTracks(): ActiveTrack[] {
        return this.clients.map(clientBroker => {
            const {
                date,
                flowId,
                sid,
                tid
            } = clientBroker.clientTrack;
            return {
                date,
                flowId,
                sid,
                tid
            };
        })
    }

    public getActiveClientsByFlows(): ActiveClientsByFlows[] {
        const activeTracks = this.getActiveTracks();
        const flows = [...new Set(activeTracks.map(track => track.flowId))];
        return flows.map(flowId => ({
            flowId,
            numClients: activeTracks.filter(t => t.flowId === flowId).length
        }))
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
                    this.trackService,
                    this,
                    this.interactionService
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

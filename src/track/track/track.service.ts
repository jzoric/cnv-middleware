import { Injectable, Logger, HttpException } from '@nestjs/common';
import { aql } from 'arangojs';
import { UserSession } from 'src/client/session/model/usersession';
import { ArangoService } from 'src/persistence/arango/arango.service';
import { ClientTrack } from './model/client.track';

@Injectable()
export class TrackService {
    private readonly logger = new Logger(TrackService.name);

    constructor(private readonly arangoService: ArangoService) {

    }

    async createTrack(userSession: UserSession, flowId: string): Promise<ClientTrack> {
        const clientTrack = new ClientTrack(userSession.sid, flowId);
        const insert = this.arangoService.collection.save(clientTrack);
        if(insert) {
            return clientTrack;
        }
    }

    async getClientTracks(page: number, take: number, sid: string, flowId: string, filterByClientOrigin: boolean | string, startDate: Date, endDate: Date): Promise<ClientTrack[]> {
        const filters = [];

        if(sid) {
            filters.push(aql`FILTER ct.sid == ${sid}`)
        }

        if(flowId) {
            filters.push(aql`FILTER ct.flowId == ${flowId}`)
        }

        if(startDate && endDate) {
            filters.push(
                aql`FILTER ct.date >= ${new Date(startDate)} && ct.date <= ${new Date(endDate)}`
            )
        }

        if(filterByClientOrigin == true || filterByClientOrigin === 'true') {
            filters.push(
                aql`
                LET interaction = (ct.interaction[* FILTER CONTAINS(CURRENT.origin, "client")])
                RETURN MERGE(UNSET(ct, 'interaction'), { interaction: interaction})
                `
            )

        } else {
            filters.push(
                aql`RETURN ct`
            )
        }
        const query = aql`
            FOR ct in ${this.arangoService.collection}
            FILTER LENGTH(ct.interaction) > 0
            ${aql.join(filters)}
            LIMIT ${+(page * take )}, ${+take}
            `;


        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

    async getTrack(sid:string, tid: string, filterByClientOrigin: boolean | string = false): Promise<ClientTrack | null> {
        const filters = [];

        if(sid) {
            filters.push(aql`FILTER ct.sid == ${sid}`)
        }

        if(tid) {
            filters.push(aql`FILTER ct.tid == ${tid}`)
        }

        if(filterByClientOrigin == true || filterByClientOrigin === 'true') {
            filters.push(
                aql`
                LET interaction = (ct.interaction[* FILTER CONTAINS(CURRENT.origin, "client")])
                RETURN MERGE(UNSET(ct, 'interaction'), { interaction: interaction})
                `
            )

        } else {
            filters.push(
                aql`RETURN ct`
            )
        }
        const query = aql`
            FOR ct in ${this.arangoService.collection}
            ${aql.join(filters)}
            `;
        
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0]);
    }

    async updateTrack(clientTrack: ClientTrack) {
        return this.arangoService.collection.update(clientTrack._key, clientTrack);
    }

    async countClientTracks(): Promise<number> {
        const query = aql`
            FOR S in ${this.arangoService.collection}
            COLLECT WITH COUNT INTO length
            RETURN length
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0]);
    }

    
}

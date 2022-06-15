import { Injectable, Logger, HttpException } from '@nestjs/common';
import { aql } from 'arangojs';
import { AggregatedTrackByFlowId } from 'src/model/aggregatedTrackByFlowId';
import { Interaction } from 'src/model/client.interaction';
import { ClientTrack } from 'src/model/client.track';
import { UserSession } from 'src/model/usersession';
import { ArangoService } from 'src/persistence/arango/arango.service';


@Injectable()
export class TrackService {
    private readonly logger = new Logger(TrackService.name);

    constructor(private readonly arangoService: ArangoService) {

    }

    async createTrack(userSession: UserSession, flowId: string): Promise<ClientTrack> {
        const clientTrack = new ClientTrack(userSession.sid, flowId);
        const insert = this.arangoService.collection.save(clientTrack);
        if (insert) {
            return clientTrack;
        }
    }

    async getClientTracks(
        page: number, take: number, sid: string, flowId: string,
        sortBy: string, sortByType: string,
        ninteractions: number, interactionsOperator: string,
        nstore: number, storeOperator: string,
        startDate: Date, endDate: Date): Promise<ClientTrack[]> {

        const filters = [];

        if (sid) {
            filters.push(aql`
                FILTER ct.sid == ${sid}
            ` )
        }

        if (flowId) {
            filters.push(aql`
                FILTER ct.flowId == ${flowId}
            `);
        }

        if (startDate && endDate) {
            filters.push(aql`
                FILTER ct.date >= ${new Date(startDate)} && ct.date <= ${new Date(endDate)}
            `);
        }


        if (sortBy && sortByType) {
            if (sortBy == 'store' || sortBy == 'interaction') {
                filters.push(aql`
                    SORT LENGTH(ct.${sortBy}) ${sortByType}
                `);
            } else {
                filters.push(aql`
                    SORT ct.${sortBy} ${sortByType}
                `)
            }
        }

        if (ninteractions > 0 && interactionsOperator) {
            filters.push(this.getInteractionFilter(ninteractions, interactionsOperator));
        }

        if (nstore > 0 && storeOperator) {
            filters.push(this.getStoreFilter(nstore, storeOperator));
        }

        filters.push(aql`
            LIMIT ${+(page * take)}, ${+take}
            `);

        // if(filterByClientOrigin == true || filterByClientOrigin === 'true') {
        //     filters.push(
        //         aql`
        //         LET interaction = (ct.interaction[* FILTER CONTAINS(CURRENT.origin, "client")])
        //         RETURN MERGE(UNSET(ct, 'interaction'), { interaction: interaction})
        //         `
        //     )

        // } else {
        //     filters.push(
        //         aql`RETURN ct`
        //     )
        // }


        filters.push(aql`
            LET storeSize = LENGTH(ct.store)
            LET interactionSize = LENGTH(ct.interaction)
            RETURN MERGE(UNSET(ct, 'store','interaction'), {storeSize, interactionSize})
        `)

        const query = aql`
            FOR ct in ${this.arangoService.collection}
            ${aql.join(filters)}
            `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .catch(e => {
                this.logger.error(e)
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

    async getSessionsByDate(page: number, take: number, startDate: Date, endDate: Date): Promise<ClientTrack[]> {
        const query = aql`
            FOR ct in ${this.arangoService.collection}
            FILTER ct.date <= ${new Date(endDate)}
            LIMIT ${+(page * take)}, ${+take}
            RETURN ct
        `;

        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

    async getTrack(sid: string, tid: string): Promise<ClientTrack | null> {
        const filters = [];

        if (sid) {
            filters.push(aql`
                FILTER ct.sid == ${sid}
            `);
        }

        if (tid) {
            filters.push(aql`
                FILTER ct.tid == ${tid}
            `)
        }

        filters.push(aql`
            RETURN ct
        `)


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

    async addInteraction(clientTrack: ClientTrack, interaction: Interaction) {
        const query = aql`
            FOR doc in ${this.arangoService.collection}
            FILTER doc._key == ${clientTrack._key}
            UPDATE doc WITH { interaction: APPEND(doc.interaction, ${interaction})} IN ${this.arangoService.collection} OPTIONS { exclusive: true }
            RETURN doc
        `;

        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0]);
    }

    async getInteractions(clientTrack: ClientTrack): Promise<Interaction[]> {
        const query = aql`
            FOR doc in ${this.arangoService.collection}
            FILTER doc._key == ${clientTrack._key}
            RETURN doc.interaction
        `;

        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0]);
    }


    async updateStore(clientTrack: ClientTrack, store: any) {
        const query = aql`
            FOR doc in ${this.arangoService.collection}
            FILTER doc._key == ${clientTrack._key}
            UPDATE doc WITH { store: ${store}} IN ${this.arangoService.collection} OPTIONS { exclusive: true }
            RETURN doc
        `;

        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0]);
    }

    async countClientTracks(
        sid: string, flowId: string,
        ninteractions: number, interactionsOperator: string,
        nstore: number, storeOperator: string,
        startDate: Date, endDate: Date): Promise<number> {
        const filters = [];

        if (sid) {
            filters.push(aql`FILTER ct.sid == ${sid}`)
        }

        if (flowId) {
            filters.push(aql`FILTER ct.flowId == ${flowId}`)
        }

        if (startDate && endDate) {
            filters.push(
                aql`FILTER ct.date >= ${new Date(startDate)} && ct.date <= ${new Date(endDate)}`
            )
        }

        if (ninteractions > 0 && interactionsOperator) {
            filters.push(this.getInteractionFilter(ninteractions, interactionsOperator));
        }

        if (nstore > 0 && storeOperator) {
            filters.push(this.getStoreFilter(nstore, storeOperator));
        }


        const query = aql`
            FOR ct in ${this.arangoService.collection}
            ${aql.join(filters)}
            COLLECT WITH COUNT INTO length
            RETURN length
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0]);
    }

    async removeClientTrack(clientTrack: ClientTrack) {
        const query = aql`
            REMOVE { _key: ${clientTrack._key} } in ${this.arangoService.collection}
        `;

        return await this.arangoService.database.query(query)
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

    private getInteractionFilter(ninteraction: number, interactionOperator: string) {
        switch (interactionOperator) {
            case '===':
                return aql`
                        FILTER LENGTH(ct.interaction) == ${+ninteraction}
                    `
            case '!=':
                return aql`
                        FILTER LENGTH(ct.interaction) != ${+ninteraction}
                    `
            case '<':
                return aql`
                        FILTER LENGTH(ct.interaction) < ${+ninteraction}
                    `
            case '<=':
                return aql`
                        FILTER LENGTH(ct.interaction) <= ${+ninteraction}
                    `
            case '>':
                return aql`
                        FILTER LENGTH(ct.interaction) > ${+ninteraction}
                    `
            case '>=':
                return aql`
                        FILTER LENGTH(ct.interaction) >= ${+ninteraction}
                    `
        }
    }

    private getStoreFilter(nstore: number, storeOperator: string) {
        switch (storeOperator) {
            case '===':
                return aql`
                        FILTER LENGTH(ct.store) == ${+nstore}
                    `
            case '!=':
                return aql`
                        FILTER LENGTH(ct.store) != ${+nstore}
                    `
            case '<':
                return aql`
                        FILTER LENGTH(ct.store) < ${+nstore}
                    `
            case '<=':
                return aql`
                        FILTER LENGTH(ct.store) <= ${+nstore}
                    `
            case '>':
                return aql`
                        FILTER LENGTH(ct.store) > ${+nstore}
                    `
            case '>=':
                return aql`
                        FILTER LENGTH(ct.store) >= ${+nstore}
                    `
        }
    }

    // metrics

    async getAggregatedTracksByFlowId(startDate?: Date, endDate?: Date): Promise<AggregatedTrackByFlowId[]> {
        const filters = [];
        
        if (startDate && endDate) {
            filters.push(aql`
                FILTER ct.date >= ${new Date(startDate)} && ct.date <= ${new Date(endDate)}
            `);
        }
        
        filters.push(aql`
            COLLECT name = ct.flowId into count
        ` )

        const query = aql`
            FOR ct in ${this.arangoService.collection}
            ${aql.join(filters)}
            RETURN {
                name: name,
                count: LENGTH(count)
            }
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

}

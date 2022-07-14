import { Injectable } from '@nestjs/common';
import { aql } from 'arangojs';
import { DocumentCollection, EdgeCollection } from 'arangojs/collection';
import { Interaction } from 'src/model/client.interaction';
import { ArangoService } from 'src/persistence/arango/arango.service';
const parser = require('json2csv');

@Injectable()
export class InteractionService {

    constructor(
        private readonly arangoService: ArangoService) {
        this.arangoService.collection.ensureIndex({
            type: 'persistent',
            fields: ['sid', 'flowId', 'tid']
        })
        this.arangoService.collection.ensureIndex({
            type: 'persistent',
            fields: ['flowId', 'tid']
        })
        const indexes = [
            'sid',
            'flowId',
            'tid',
            'timestamp'
        ];

        indexes.forEach(index => {
            this.arangoService.collection.ensureIndex({
                type: 'persistent',
                fields: [index]
            })
        })

    }

    public getCollection(): DocumentCollection<any> & EdgeCollection<any> {
        return this.arangoService.collection;
    }

    async createInteraction(interaction: Interaction): Promise<Interaction> {

        const insert = await this.arangoService.collection.save(interaction);
        if (insert) {
            return interaction;
        }
    }

    async getInteractions(
        page: number = 0, take: number = 5, flowId?: string, tid?: string,
        sortBy?: string, sortByType?: string, startDate?: Date, endDate?: Date): Promise<Interaction[]> {

        const filters = [];

        
        if (tid) {
            filters.push(aql`
                FILTER i.tid == ${tid}
            ` )
        }

        if (flowId) {
            filters.push(aql`
                FILTER i.flowId == ${flowId}
            `);
        }

        if(startDate && endDate) {
            filters.push(aql`
                FILTER i.timestamp >= ${new Date(startDate)} && i.timestamp <= ${new Date()}
            ` )
        }
        
        if (sortBy && sortByType) {
            filters.push(aql`
                SORT i.${sortBy} ${sortByType}
            `)
        } else {
            filters.push(aql`
                SORT i.timestamp ASC
            `)
        }

        filters.push(aql`
            LIMIT ${+(page * take)}, ${+take}
            `);

        const query = aql`
            FOR i in ${this.arangoService.collection}
            ${aql.join(filters)}
            RETURN i
        `;
        return this.arangoService.queryMany<Interaction>(query);
    }

    async countInteractions(flowId?: string, tid?: string,
        sortBy?: string, sortByType?: string, startDate?: Date, endDate?: Date): Promise<number> {

        const filters = [];

        if (tid) {
            filters.push(aql`
                FILTER i.tid == ${tid}
            ` )
        }

        if (flowId) {
            filters.push(aql`
                FILTER i.flowId == ${flowId}
            `);
        }

        if(startDate && endDate) {
            filters.push(aql`
                FILTER i.timestamp >= ${new Date(startDate)} && i.timestamp <= ${new Date()}
            ` )
        }
        
        if (sortBy && sortByType) {
            filters.push(aql`
                SORT i.${sortBy} ${sortByType}
            `)
        } else {
            filters.push(aql`
                SORT i.timestamp ASC
            `)
        }

        const query = aql`
            FOR i in ${this.arangoService.collection}
            ${aql.join(filters)}
            COLLECT WITH COUNT into count
            RETURN count
        `;


        return this.arangoService.query<number>(query);
    }
    

    public async getInteractionCSV(flowId: string, tid: string, startDate?: Date, endDate?: Date): Promise<string> {
        const count = await this.countInteractions(flowId, tid);
        let interactions = await this.getInteractions(0, count, flowId, tid);
        interactions = interactions.map(interaction => {
            let type = 'flow';
            switch (interaction.data.type) {
                case 'event': type = 'event'; break;
                case 'question': type = 'question'; break;
                case 'answer': type = 'answer'; break;

            }
            return {
                tid: interaction.tid,
                flowId: interaction.flowId,
                timestamp: interaction.timestamp,
                origin: interaction.origin,
                nodeId: interaction.data.nodeId,
                type,
                name: interaction.data.name || interaction.data.type,
                value: interaction.data.value,
                //data: interaction.data

            }
        });

        const p = new parser.Parser();
        return p.parse(interactions);
    }

}

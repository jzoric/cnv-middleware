import { Injectable } from '@nestjs/common';
import { aql } from 'arangojs';
import { DocumentCollection, EdgeCollection } from 'arangojs/collection';
import { Interaction } from 'src/model/client.interaction';
import { ArangoService } from 'src/persistence/arango/arango.service';

@Injectable()
export class InteractionService {

    constructor(
        private readonly arangoService: ArangoService) {
            this.arangoService.collection.ensureIndex({
                type: 'persistent',
                fields: ['sid', 'flowId', 'tid']
            })
        
            setTimeout(() => {
                this.test();
            }, 5000);
    }

    private async test() {
        let interactions = await this.getInteractions('/productdock', '0ea17ad3-1281-461d-bea2-896b8a15aaee');
        interactions = interactions.map(interaction => {
            let type = 'flow';
            switch(interaction.data.type) {
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
                data: interaction.data

            }
        });

        console.table(interactions)
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

    async getInteractions(flowId: string, tid: string): Promise<Interaction[]> {

        const query = aql`
            FOR i in ${this.arangoService.collection}
            FILTER i.flowId == ${flowId}
            FILTER i.tid == ${tid}
            SORT i.timestamp ASC
            RETURN i
        `;

        return this.arangoService.queryMany<Interaction>(query);
    }

}

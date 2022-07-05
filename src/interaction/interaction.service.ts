import { HttpException, Injectable, Logger } from '@nestjs/common';
import { aql } from 'arangojs';
import { DocumentCollection, EdgeCollection } from 'arangojs/collection';
import { Interaction } from 'src/model/client.interaction';
import { ClientTrack } from 'src/model/client.track';
import { ArangoService } from 'src/persistence/arango/arango.service';
import { TrackService } from 'src/track/track/track.service';

@Injectable()
export class InteractionService {
    private readonly logger: Logger = new Logger(InteractionService.name);

    constructor(
        private readonly arangoService: ArangoService) {
            this.arangoService.collection.ensureIndex({
                type: 'persistent',
                fields: ['sid', 'flowId', 'tid']
            })
    }

    public getCollection(): DocumentCollection<any> & EdgeCollection<any> {
        return this.arangoService.collection;
    }

    async createTrack(interaction: Interaction): Promise<Interaction> {

        const insert = await this.arangoService.collection.save(interaction);
        if (insert) {
            return interaction;
        }
    }

    async migrateInteractions(): Promise<any> {
        const query = aql`
            FOR ct in ${this.arangoService.collection}
            FILTER IS_ARRAY(ct.interaction)
            
        `;

        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

}

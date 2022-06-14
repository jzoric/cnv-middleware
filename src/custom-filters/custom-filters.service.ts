import { HttpException, Injectable, Logger } from '@nestjs/common';
import { aql } from 'arangojs';
import { ArangoService } from 'src/persistence/arango/arango.service';
import { CustomFilter} from '../model/custom-filter';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CustomFiltersService {
    private readonly logger = new Logger(CustomFiltersService.name);

    constructor(private readonly arangoService: ArangoService) {
        
    }


    async all(): Promise<CustomFilter[]> {

        const query = aql`
            FOR cf in ${this.arangoService.collection}
            RETURN cf
            `;

        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .catch(e => {
                this.logger.error(e)
                throw new HttpException(e.response.body.errorMessage, e.code)
            })

    }

    async create(customFilter: CustomFilter): Promise<CustomFilter> {
        customFilter.id = uuidv4();
        const insert = await this.arangoService.collection.save(customFilter);
        if(insert) {
            return this.arangoService.collection.document(insert._id);
        }
    }

    async get(id: string): Promise<CustomFilter> {
        
        const query = aql`
            FOR cf in ${this.arangoService.collection}
            FILTER cf.id == ${id}
            RETURN cf
            `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0]);
    }
    
    async remove(id: string) {
        const query = aql`
            FOR cf in ${this.arangoService.collection}
            FILTER cf.id == ${id}
            REMOVE { _key: cf._key } in ${this.arangoService.collection}
            RETURN cf
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0])
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }


}

import { Injectable, Logger } from '@nestjs/common';
import { ArangoService } from 'src/persistence/arango/arango.service';
import { CustomFilter} from './model/custom-filter';

@Injectable()
export class CustomFiltersService {
    private readonly logger = new Logger(CustomFiltersService.name);

    constructor(private readonly arangoService: ArangoService) {
        setTimeout(() => {
            this.create({
                name: 'test',
                args: [{
                    name: 'val=test',
                }],
                description: 'test',
                type: 'records'

            }).then(d => console.log(d))
        }, 5000);
    }

    // create
    async create(customFilter: CustomFilter): Promise<CustomFilter> {
        const insert = await this.arangoService.collection.save(customFilter);
        if(insert) {
            return this.arangoService.collection.document(insert._id);
        }
    }
    // get
    // update
    // delete


}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Database } from 'arangojs';
import { DocumentCollection, EdgeCollection } from 'arangojs/collection';
import { ARANGO_COLLECTION, ARANGO_DATABASE } from './arango.constants';

@Injectable()
export class ArangoService {
    collection : DocumentCollection<any> & EdgeCollection<any>;
    database: Database;
    constructor(
        @Inject(ARANGO_DATABASE) private arangoDatabase: Database,
        @Inject(ARANGO_COLLECTION) private arangoCollection: string) {
        this.database = arangoDatabase;
        this.collection = arangoDatabase.collection(arangoCollection);
        this.collection.create().catch(e => {});
    }

}

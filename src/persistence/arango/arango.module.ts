import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { ARANGO_COLLECTION, ARANGO_DATABASE } from './arango.constants';
import { ArangoService } from './arango.service';
import { ArangoModuleAsyncOptions, ArangoOptions } from './interfaces/arango-options.interface';
import { Database } from 'arangojs';

@Module({
  providers: [ArangoService]
})
@Global()
export class ArangoModule {
  logger = new Logger(ArangoModule.name);
  static forRootAsync(asyncOptions: ArangoModuleAsyncOptions): DynamicModule {
    
    return {
      module: ArangoModule,
      imports: asyncOptions.imports,
      providers: [
        {
          provide: ARANGO_DATABASE,
          useFactory: async (args) => {
            let arangoOptions: ArangoOptions = await asyncOptions.useFactory(args);
              const voidDatabase = {
                query: (query) => new Promise((resolve, reject) => {
                  resolve({
                    all: () => []
                  })
                }),
                collection: (collection) => {
                  return {
                    create: (data) => new Promise((resolve, reject) => {
                      resolve({})
                    }),
                    save: (data) => new Promise((resolve, reject) => {
                      resolve({})
                    }),
                    update: (data) => new Promise((resolve, reject) => {
                      resolve({})
                    }),
                  }
                }
              }
            
              if(!arangoOptions.host || !arangoOptions.database || !arangoOptions.user || !arangoOptions.password) {
                return voidDatabase;
              }
              const db = new Database(arangoOptions.host);
              db.useBasicAuth(arangoOptions.user, arangoOptions.password);
              let database = null;
              database = db.database(arangoOptions.database);
              if(! (await database.exists())) {
                await db.createDatabase(arangoOptions.database);
              }
          },
          inject: asyncOptions.inject || [],
        },

        ArangoService
      ],
      exports: [ArangoService, ARANGO_DATABASE]
    };
  }

  static collection(collection: string) {
    return {
      module: ArangoModule,
      providers: [
        {
          provide: ARANGO_COLLECTION,
          useValue: collection
        },
        ArangoService
      ],
      exports: [ArangoService, ARANGO_COLLECTION]
    }
  }

}

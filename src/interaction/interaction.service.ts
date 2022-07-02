import { Injectable, Logger } from '@nestjs/common';
import { Interaction } from 'src/model/client.interaction';
import { ClientTrack } from 'src/model/client.track';
import { ArangoService } from 'src/persistence/arango/arango.service';
import { TrackService } from 'src/track/track/track.service';

@Injectable()
export class InteractionService {
    private readonly logger: Logger = new Logger(InteractionService.name);

    constructor(
        private readonly arangoService: ArangoService,
        private readonly trackService: TrackService
        ) {
        //this.migrate()
    }

    async createTrack(interaction: Interaction): Promise<Interaction> {
        
        const insert = await this.arangoService.collection.save(interaction);
        if (insert) {
            return interaction;
        }
    }

    async migrate() {

        const batchSize = 10;
        let page = 0;
        let count = await this.trackService.countClientTracks();
        
        if (count == 0) {
            this.logger.log(`Interaction migrations not required`);
        } else {
            this.logger.log(`Preparing to migrate interactions ${count} tracks`);
        }

        while (count - batchSize > 0) {
            await this.migrateInteractionsFromTracks(page, batchSize);
            
            count -= batchSize;
            page ++;
        }
        if (count > 0) {
            this.logger.log(`page ${page}, take ${batchSize}`)

            //await this.updateSessionsWithParsedUserLocationAndIP(0, batchSize)
        }
    }

    private async migrateInteractionsFromTracks(page: number, take: number) {
        const tracks = await this.trackService.getClientTracks(page, take);
        tracks.forEach(async (current: ClientTrack) => {
            if(current.interactionSize > 0) {

                try {
                    const track = await this.trackService.getTrack(current.sid, current.tid); 
    
                    let migrated = 0;
                    for(let interaction of track.interaction) {
                        interaction.tid = track.tid;
                        await this.createTrack(interaction);
                        migrated ++;
    
                    }
                    
                    this.logger.debug(`${migrated} interactions of track ${track.tid} into interaction collection `);

                } catch(e) {
                    this.logger.error(`error while migrating tid: ${current.tid}`);
                }
                
                
            }
            
          
    
        })
      }
}

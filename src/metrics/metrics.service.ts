import { Injectable } from '@nestjs/common';
import { ClientService } from 'src/client/client/client.service';
import { IActiveClientsByFlows } from 'src/interface/ActiveClientsByFlows.interface';
import { ClientTrack } from 'src/model/client.track';

@Injectable()
export class MetricsService {
    constructor(
        private readonly clientService: ClientService
    ) {
        
    }

    getActiveTracks(): ClientTrack[] {
        return this.clientService.getActiveTracks();
    }

    getActiveClientsByFlows(): IActiveClientsByFlows[] {
        return this.clientService.getActiveClientsByFlows();
    }
}

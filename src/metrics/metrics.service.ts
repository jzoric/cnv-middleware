import { Injectable } from '@nestjs/common';
import { ClientService } from 'src/client/client/client.service';
import { IActiveClientsByFlows } from 'src/interface/ActiveClientsByFlows.interface';
import { AggregatedSessionByBrowser } from 'src/model/aggregatedSessionByBrowser';
import { AggregatedSessionByFlowId } from 'src/model/aggregatedSessionByFlowId';
import { AggregatedSessionByLocation } from 'src/model/aggregatedSessionByLocation';
import { AggregatedSessionByOS } from 'src/model/aggregatedSessionByOS';
import { ClientTrack } from 'src/model/client.track';
import { SessionService } from 'src/session/session.service';
import { TrackService } from 'src/track/track/track.service';

@Injectable()
export class MetricsService {
    constructor(
        private readonly clientService: ClientService,
        private readonly sessionService: SessionService,
        private readonly trackService: TrackService
    ) {
        
    }

    getActiveTracks(): ClientTrack[] {
        return this.clientService.getActiveTracks();
    }

    getActiveClientsByFlows(): IActiveClientsByFlows[] {
        return this.clientService.getActiveClientsByFlows();
    }

    getAggregatedSessionsByLocation(startDate?: Date, endDate?: Date): Promise<AggregatedSessionByLocation[]> {
        return this.sessionService.getAggregatedSessionsByLocation(startDate, endDate);
    }

    getAggregatedSessionsByBrowser(startDate?: Date, endDate?: Date): Promise<AggregatedSessionByBrowser[]> {
        return this.sessionService.getAggregatedSessionsByBrowser(startDate, endDate);
    }

    getAggregatedSessionsByOS(startDate?: Date, endDate?: Date): Promise<AggregatedSessionByOS[]> {
        return this.sessionService.getAggregatedSessionsByOS(startDate, endDate);
    }

    getAggregatedTracksByFlowId(startDate?: Date, endDate?: Date): Promise<AggregatedSessionByFlowId[]> {
        return this.trackService.getAggregatedTracksByFlowId(startDate, endDate);
    }
}

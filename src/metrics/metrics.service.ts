import { Injectable } from '@nestjs/common';
import { ClientService } from 'src/client/client/client.service';
import { ActiveClientsByFlows } from 'src/model/ActiveClientsByFlows.interface';
import { ActiveTrack } from 'src/model/ActiveTrack';
import { AggregatedSessionByBrowser } from 'src/model/aggregatedSessionByBrowser';
import { AggregatedSessionByLocation } from 'src/model/aggregatedSessionByLocation';
import { AggregatedSessionByOS } from 'src/model/aggregatedSessionByOS';
import { AggregatedTrackByFlowId } from 'src/model/aggregatedTrackByFlowId';
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

    getActiveTracks(): ActiveTrack[] {
        return this.clientService.getActiveTracks();
    }

    getActiveClientsByFlows(): ActiveClientsByFlows[] {
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

    getAggregatedTracksByFlowId(startDate?: Date, endDate?: Date): Promise<AggregatedTrackByFlowId[]> {
        return this.trackService.getAggregatedTracksByFlowId(startDate, endDate);
    }
}

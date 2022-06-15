import { HttpException, Injectable, Logger } from '@nestjs/common';
import { aql } from 'arangojs';
import { ClientService } from 'src/client/client/client.service';
import { ActiveClientsByFlows } from 'src/model/ActiveClientsByFlows.interface';
import { ActiveTrack } from 'src/model/ActiveTrack';
import { AggregatedSessionByBrowser } from 'src/model/aggregatedSessionByBrowser';
import { AggregatedSessionByLocation } from 'src/model/aggregatedSessionByLocation';
import { AggregatedSessionByOS } from 'src/model/aggregatedSessionByOS';
import { AggregatedTrackByFlowId } from 'src/model/aggregatedTrackByFlowId';
import { MetricFlowByDate } from 'src/model/metricFlowByDate';
import { MetricFlowByHour } from 'src/model/metricFlowByHour';
import { ArangoService } from 'src/persistence/arango/arango.service';
import { SessionService } from 'src/session/session.service';
import { TrackService } from 'src/track/track/track.service';

@Injectable()
export class MetricsService {
    private readonly logger = new Logger(MetricsService.name);
    constructor(
        private readonly clientService: ClientService,
        private readonly sessionService: SessionService,
        private readonly trackService: TrackService,
        private readonly arangoService: ArangoService
    ) {
        
    }

    async createMetricFlowByHour(timestamp: Date, name: string, count: number): Promise<MetricFlowByHour> {
        const metric = new MetricFlowByHour(timestamp, name, count);

        const insert = this.arangoService.collection.save(metric);
        if (insert) {
            return metric;
        }
    }

    async getMetricsFlowByHour(startDate: Date, endDate: Date): Promise<MetricFlowByHour[]> {
        const query = aql`
            FOR m in ${this.arangoService.collection}
            FILTER m.date > ${startDate}
            FILTER m.date < ${endDate}
            RETURN m
            `;

        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .catch(e => {
                this.logger.error(e)
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
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

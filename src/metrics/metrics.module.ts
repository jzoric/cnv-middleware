import { Logger, Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { ClientModule } from 'src/client/client/client.module';
import { AuthModule } from 'src/auth/auth.module';
import { TrackModule } from 'src/track/track/track.module';
import { SessionModule } from 'src/session/session.module';
import { SessionService } from 'src/session/session.service';
import { TrackService } from 'src/track/track/track.service';
import { MetricFlowByHour } from 'src/model/metricFlowByHour';
import { ArangoModule } from 'src/persistence/arango/arango.module';
import { ConfigService } from 'src/config/config/config.service';
import { ConfigModule } from 'src/config/config/config.module';
import { PropertiesService } from 'src/properties/properties.service';
import { PropertiesModule } from 'src/properties/properties.module';
import { Property } from 'src/model/property';
import { MetricStateFlowProcessor } from 'src/model/metricStateFlowProcessor';
import { Cron } from '@nestjs/schedule';
import { getDayDateInterval } from 'src/utils/date';

@Module({
  providers: [MetricsService],
  controllers: [MetricsController],
  imports: [
    ArangoModule.collection('metrics'),
    AuthModule,
    ClientModule,
    TrackModule,
    SessionModule,
    ConfigModule,
    PropertiesModule
  ]
})
export class MetricsModule {
  private readonly logger = new Logger(MetricsModule.name);
  private METRIC_STATE_FLOW_PROCESSOR = 'METRIC_STATE_FLOW_PROCESSOR';
  private TRACK_LIFETIME_MONTHS: number
  constructor(
    private readonly sessionService: SessionService,
    private readonly trackService: TrackService,
    private readonly metricService: MetricsService,
    private readonly configService: ConfigService,
    private readonly propertiesService: PropertiesService) {
    this.TRACK_LIFETIME_MONTHS = +this.configService.get('TRACK_LIFETIME_MONTHS');
    this.runDailyFlowMetrics();
    this.housekeeping();

  }

  @Cron('0 0 * * *')
  async runDailyFlowMetrics() {

    let state = (await this.propertiesService.getProperty<MetricStateFlowProcessor>(this.METRIC_STATE_FLOW_PROCESSOR))?.data;

    if (!state) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - this.TRACK_LIFETIME_MONTHS)
      state = (await this.propertiesService.setProperty<MetricStateFlowProcessor>(this.METRIC_STATE_FLOW_PROCESSOR, new MetricStateFlowProcessor(startDate)))?.data;
    }

    let startDate = new Date(state.lastProcessedTimestamp);
    let curDate = new Date();
    curDate.setDate(curDate.getDate() - 1);

    while (startDate < curDate) {
      const dates = getDayDateInterval(startDate);
      for (let i = 0; i < dates.length; i++) {
        const pair = dates[i];
        this.logger.debug(`processing daily metrics at ${pair[0]}`)
        const dataFlow = await this.trackService.getAggregatedTracksByFlowId(pair[0], pair[1]);
        state = (await this.propertiesService.setProperty<MetricStateFlowProcessor>(this.METRIC_STATE_FLOW_PROCESSOR, new MetricStateFlowProcessor(pair[0])))?.data;
        dataFlow.forEach(async (d) => {
          this.metricService.createMetricFlowByHour(pair[0], d.name, d.count)
        })
        state = (await this.propertiesService.setProperty<MetricStateFlowProcessor>(this.METRIC_STATE_FLOW_PROCESSOR, new MetricStateFlowProcessor(pair[1])))?.data;
      }
      startDate.setDate(startDate.getDate() + 1);
    }
  }

  @Cron('0 0 * * *')
  private async housekeeping() {
    const endDate = new Date();
    endDate.setMonth(-this.TRACK_LIFETIME_MONTHS);
    endDate.setHours(0, 0, 0, 0);
    await this.metricService.removeMetricsByDate(endDate);
  }

}

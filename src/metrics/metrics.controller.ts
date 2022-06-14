import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MetricsService } from './metrics.service';


@ApiTags('api/v1/metrics')
@Controller('api/v1/metrics')
export class MetricsController {

    constructor(private readonly metricsService: MetricsService) {
        
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("activeClients")
    public getActiveClients() {
        return this.metricsService.getActiveTracks();
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("activeClientsByFlows")
    public getActiveClientsByFlows() {
        return this.metricsService.getActiveClientsByFlows();
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({
        name: 'startDate',
        required: false,
        description: 'Query Start Date <br><strong>Format:</strong> YYYY-MM-DD <br><strong>Defaults to empty</strong>',
        example: '2021-08-05'

    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        description: 'Query End Date <br><strong>Format:</strong> YYYY-MM-DD <br><strong>Defaults to empty</strong>',
        example: '2021-08-05'
    })
    @Get("getAggregatedSessionsByLocation")
    public getAggregatedSessionsByLocation(@Query("startDate") startDate: Date, @Query("endDate") endDate: Date) {
        return this.metricsService.getAggregatedSessionsByLocation(startDate, endDate)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({
        name: 'startDate',
        required: false,
        description: 'Query Start Date <br><strong>Format:</strong> YYYY-MM-DD <br><strong>Defaults to empty</strong>',
        example: '2021-08-05'

    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        description: 'Query End Date <br><strong>Format:</strong> YYYY-MM-DD <br><strong>Defaults to empty</strong>',
        example: '2021-08-05'
    })
    @Get("getAggregatedSessionsByBrowser")
    public getAggregatedSessionsByBrowser(@Query("startDate") startDate: Date, @Query("endDate") endDate: Date) {
        return this.metricsService.getAggregatedSessionsByBrowser(startDate, endDate)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({
        name: 'startDate',
        required: false,
        description: 'Query Start Date <br><strong>Format:</strong> YYYY-MM-DD <br><strong>Defaults to empty</strong>',
        example: '2021-08-05'

    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        description: 'Query End Date <br><strong>Format:</strong> YYYY-MM-DD <br><strong>Defaults to empty</strong>',
        example: '2021-08-05'
    })
    @Get("getAggregatedSessionsByOS")
    public getAggregatedSessionsByOS(@Query("startDate") startDate: Date, @Query("endDate") endDate: Date) {
        return this.metricsService.getAggregatedSessionsByOS(startDate, endDate)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({
        name: 'startDate',
        required: false,
        description: 'Query Start Date <br><strong>Format:</strong> YYYY-MM-DD <br><strong>Defaults to empty</strong>',
        example: '2021-08-05'

    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        description: 'Query End Date <br><strong>Format:</strong> YYYY-MM-DD <br><strong>Defaults to empty</strong>',
        example: '2021-08-05'
    })
    @Get("getAggregatedTracksByFlowId")
    public getAggregatedTracksByFlowId(@Query("startDate") startDate: Date, @Query("endDate") endDate: Date) {
        return this.metricsService.getAggregatedTracksByFlowId(startDate, endDate)
    }

}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
}

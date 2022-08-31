import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NoderedService } from './nodered.service';

@ApiTags('api/v1/nodered')
@Controller('api/v1/nodered')
export class NoderedController {
    constructor(private readonly noderedService: NoderedService) {

    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiResponse({
        type: [String]
    })
    @Get("flows")
    get(): Promise<string[]> {
        return this.noderedService.getCurrentFlows();
    }
}

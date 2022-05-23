import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NoderedService } from './nodered.service';

@ApiTags('api/v1/nodered')
@Controller('api/v1/nodered')
export class NoderedController {
    constructor(private readonly noderedService: NoderedService) {

    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("flows")
    get(): Promise<String[]> {
        return this.noderedService.getCurrentFlows();
    }
}

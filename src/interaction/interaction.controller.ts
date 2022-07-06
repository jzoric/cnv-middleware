import { Controller, Get, Query, Response, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Interaction } from 'src/model/client.interaction';
import { InteractionService } from './interaction.service';

@ApiTags('api/v1/interaction')
@Controller('api/v1/interaction')
export class InteractionController {

    constructor(private readonly interactionService: InteractionService) {

    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("interactions")
    @ApiQuery({
        name: 'tid',
        required: false,
        description: 'Track Id <br><strong>Defaults to empty</strong>',
    })
    @ApiQuery({
        name: 'flowId',
        required: false,
        description: 'Flow Id <br><strong>Defaults to empty</strong>',
        example: '/m4_v2'
    })
    getInteractions(@Query("tid") tid: string, @Query("flowId") flowId: string): Promise<Interaction[]> {
        return this.interactionService.getInteractions(flowId, tid);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("interactionsCSV")
    @ApiQuery({
        name: 'tid',
        required: false,
        description: 'Track Id <br><strong>Defaults to empty</strong>',
    })
    @ApiQuery({
        name: 'flowId',
        required: false,
        description: 'Flow Id <br><strong>Defaults to empty</strong>',
        example: '/m4_v2'
    })
    async getInteractionsCSV(@Query("tid") tid: string, @Query("flowId") flowId: string, @Response() res) {
        res.set({
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${flowId}-${tid}.csv"`,
          });
        res.charset = 'UTF-8';
        res.write(await this.interactionService.getInteractionCSV(flowId, tid));
        res.end();
    }
}

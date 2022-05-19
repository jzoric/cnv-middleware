import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ClientTrack } from './model/client.track'
import { TrackService } from './track.service';
@ApiTags('api/v1/client')
@Controller('api/v1/client')
export class TrackController {

    constructor(private readonly trackService: TrackService) {

    }
    
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("tracks")
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Current page of the results. <br><strong>Defaults to 0</strong>'
    })
    @ApiQuery({
        name: 'take',
        required: false,
        description: 'Number of items to return per page. <br><strong>Defaults to 20</strong>'
    })
    @ApiQuery({
        name: 'sid',
        required: false,
        description: 'User Session Id <br><strong>Defaults to empty</strong>'
    })
    @ApiQuery({
        name: 'flowId',
        required: false,
        description: 'Flow Id <br><strong>Defaults to empty</strong>',
        example: '/m4_v2'
    })
    @ApiQuery({
        name: 'sortBy',
        required: false,
        description: 'Sort by field name',
    })
    @ApiQuery({
        name: 'sortByType',
        required: false,
        description: 'Sort by field direction. ASC | DESC',
    })
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
    @ApiResponse({
        type: [ClientTrack]
    })
   
    public async getClientTracks(@Query("page") page: number = 0, @Query("take") take: number = 20, @Query("sid") sid: string, @Query("flowId") flowId: string, @Query("sortBy") sortBy: string, @Query("sortByType") sortByType: string, @Query("startDate") startDate: Date, @Query("endDate") endDate: Date): Promise<ClientTrack[]> {
        return await this.trackService.getClientTracks(page, take, sid, flowId, sortBy, sortByType, startDate, endDate);

    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("track")
    @ApiQuery({
        name: 'sid',
        required: false,
        description: '<strong>Optional:</strong> user session id. in cognito mode this value are not used since its generated on each refresh'
    })
    @ApiQuery({
        name: 'tid',
        required: true,
        description: '<strong>Required:</strong> the flow track id that holds the user <-> server interactions'
    })
    @ApiResponse({
        type: [ClientTrack]
        
    })
    public async getClientTrack(@Query("sid") sid: string, @Query("tid") tid: string): Promise<ClientTrack> {
        return await this.trackService.getTrack(sid, tid);

    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiResponse({
        status: 200,
        description: 'Number of sessions'
    })
    @ApiQuery({
        name: 'sid',
        required: false,
        description: 'User Session Id <br><strong>Defaults to empty</strong>'
    })
    @ApiQuery({
        name: 'flowId',
        required: false,
        description: 'Flow Id <br><strong>Defaults to empty</strong>',
        example: '/m4_v2'
    })
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
    @Get("count")
    public async countSessions(@Query("sid") sid: string, @Query("flowId") flowId: string, @Query("startDate") startDate: Date, @Query("endDate") endDate: Date) {
        return await this.trackService.countClientTracks(sid, flowId, startDate, endDate);

    }
}

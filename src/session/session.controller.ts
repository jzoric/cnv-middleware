import { applyDecorators, Controller, Get, Logger, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { Request, Response } from 'express';
import { SESSION_COOKIE_NAME } from './session.constants';
import { UserSession } from '../model/usersession';
import { TrackService } from 'src/track/track/track.service';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ConfigService } from 'src/config/config/config.service';
import { ActivateFlowResponse } from 'src/model/activateflowresponse';

@ApiTags('api/v1/session')
@Controller('api/v1/session')
export class SessionController {
    private readonly logger = new Logger(SessionController.name);

  
    constructor(
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
        private readonly trackService: TrackService) {
    }

    @ApiQuery({
        name: 'flowId',
        required: true,
        description: 'nodered server name flowid <strong>Eg: /default</strong>'
    })
    @ApiResponse({
        type: ActivateFlowResponse
    })
    @Get("activate")
    public async getUserSession(@Req() req: Request, @Query('flowId') flowId: string, @Res({ passthrough: true }) response: Response): Promise<ActivateFlowResponse> {
        const userAgent = req.headers['user-agent'];
        const userIp = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress;
        
        let userSession: UserSession;
        let sid = req.cookies[SESSION_COOKIE_NAME];
        if(sid) {
            userSession = await this.sessionService.getSession(sid);
        }
        if (!sid || !userSession) {
            userSession = await this.sessionService.createSession(userAgent, userIp);
            let expireDate = new Date;
            const expirationTime = +this.configService.get('TRACK_LIFETIME_MONTHS');
            expireDate.setMonth(expireDate.getMonth() + expirationTime);
            response.cookie(SESSION_COOKIE_NAME, userSession.sid, {
                expires: expireDate,
                httpOnly: true
            });
            sid = userSession.sid;
        }

        const clientTrack = await this.trackService.createTrack(userSession, flowId);

        return { tid: clientTrack.tid };

    }

    
    @Get("deactivate")
    public async deactivateUserSession(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
                
        let sid = req.cookies[SESSION_COOKIE_NAME];

        if (sid) {
            response.clearCookie(SESSION_COOKIE_NAME, {
                httpOnly: true
            });
            return { message: `${sid} cleared` };
        }

        return { message: `sid not found` };

    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("sessions")
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Current page of the results. <strong>Defaults to 0</strong>'
    })
    @ApiQuery({
        name: 'take',
        required: false,
        description: 'Number of items to return per page. <strong>Defaults to 20</strong>'
    })
    @ApiResponse({
        type: [UserSession]
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
    public async getSessions(
        @Query("page") page: number = 0, @Query("take") take: number = 20,
        @Query("sortBy") sortBy: string, @Query("sortByType") sortByType: string): Promise<UserSession[]> {
        return await this.sessionService.getSessions(page, take, sortBy, sortByType);

    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("session")
    @ApiQuery({
        name: 'sessionId',
        required: false,
        description: 'Get session by sessionId'
    })
    @ApiResponse({
        type: UserSession
    })
    public async getSession(@Query("sessionId") sessionId: string): Promise<UserSession> {
        return await this.sessionService.getSession(sessionId);

    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiResponse({
        status: 200,
        description: 'Number of sessions'
    })
    @Get("count")
    public async countSessions() {
        return await this.sessionService.countSessions();

    }

}

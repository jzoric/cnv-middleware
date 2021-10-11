import { applyDecorators, Controller, Get, Logger, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { Request, Response } from 'express';
import { SESSION_COOKIE_NAME } from './session.constants';
import { UserSession } from './model/usersession';
import { TrackService } from 'src/track/track/track.service';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('api/v1/session')
@Controller('api/v1/session')
export class SessionController {
    private readonly logger = new Logger(SessionController.name);

  
    constructor(private readonly sessionService: SessionService, private readonly trackService: TrackService) {
        
    }

    @ApiQuery({
        name: 'flowId',
        required: true,
        description: 'nodered server name flowid <strong>Eg: /default</strong>'
    })
    @Get("activate")
    public async getUserSession(@Req() req: Request, @Query('flowId') flowId: string, @Res({ passthrough: true }) response: Response) {
        const userAgent = req.headers['user-agent'];
        const userIp = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress;
        
        let userSession: UserSession;
        let sid = req.cookies[SESSION_COOKIE_NAME];

        if(sid) {
            userSession = await this.sessionService.getSession(sid);
        }
        if (!sid || !userSession) {
            userSession = await this.sessionService.createSession(userAgent, userIp);
            response.cookie(SESSION_COOKIE_NAME, userSession.sid, {
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
    
    public async getSessions(@Query("page") page: number = 0, @Query("take") take: number = 20): Promise<UserSession[]> {
        return await this.sessionService.getSessions(page, take);

    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiResponse({
        status: 200,
        description: 'Number of sessions'
    })
    @Get("count")
    public async countSessoins() {
        return await this.sessionService.countSessions();

    }

}

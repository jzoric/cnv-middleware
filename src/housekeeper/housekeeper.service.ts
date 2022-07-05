import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from 'src/config/config/config.service';
import { ClientTrack } from 'src/model/client.track';
import { UserSession } from 'src/model/usersession';
import { SessionService } from 'src/session/session.service';
import { TrackService } from 'src/track/track/track.service';

@Injectable()
export class HousekeeperService {

    private readonly logger: Logger = new Logger(HousekeeperService.name);
    private TRACK_LIFETIME_MONTHS: number

    constructor(
        private readonly configService: ConfigService,
        private readonly trackService: TrackService,
        private readonly sessionService: SessionService
    ) {
        this.TRACK_LIFETIME_MONTHS = +this.configService.get('TRACK_LIFETIME_MONTHS');
    }  

    async cleanExpiredTracks(): Promise<ClientTrack[]> {

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() -this.TRACK_LIFETIME_MONTHS);
        endDate.setHours(0, 0, 0, 0);

        return this.trackService.deleteExpiredTracks(endDate);

    }

    async cleanExpiredSessions(): Promise<UserSession[]> {

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() -this.TRACK_LIFETIME_MONTHS);
        endDate.setHours(0, 0, 0, 0);

        return this.sessionService.deleteExpiredSessions(endDate);

    }
}

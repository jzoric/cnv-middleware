import { Injectable, Logger, HttpException } from '@nestjs/common';
import { aql } from 'arangojs';
import { DocumentMetadata } from 'arangojs/documents';
import { ArangoService } from 'src/persistence/arango/arango.service';
import { UserSession } from '../model/usersession';

@Injectable()
export class SessionService {
    private readonly logger = new Logger(SessionService.name);

    constructor(private readonly arangoService: ArangoService) {

    }

    async createSession(userAgent: string, userIp: string): Promise<UserSession> {
        const userSession = new UserSession(userAgent, userIp);
        const insert = await this.arangoService.collection.save(userSession);

        if(insert) {
            return userSession;
        }
    }

    async getSession(sId: string): Promise<UserSession | null> {
        const query = aql`
            FOR S in ${this.arangoService.collection}
            FILTER S.sid == ${sId}
            RETURN S
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0]);
    }

    async getSessions(page: number, take: number): Promise<UserSession[]> {
        const query = aql`
            FOR S in ${this.arangoService.collection}
            LIMIT ${+(page * take )}, ${+take} 
            RETURN S
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

    async getSessionsByDate(page: number, take: number, startDate: Date, endDate: Date): Promise<UserSession[]> {
        
        const query = aql`
            FOR S in ${this.arangoService.collection}
            FILTER S.createDate >= ${new Date(startDate)} && S.createDate <= ${new Date(endDate)}
            LIMIT ${+(page * take )}, ${+take}
            RETURN S
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }



    async countSessions(): Promise<number> {
        const query = aql`
            FOR S in ${this.arangoService.collection}
            COLLECT WITH COUNT INTO length
            RETURN length
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0]);
    }

    async removeSession(userSession: UserSession) {
        const query = aql`
            REMOVE { _key: ${ userSession._key} } in ${this.arangoService.collection}
        `;
        return await this.arangoService.database.query(query)
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }
}

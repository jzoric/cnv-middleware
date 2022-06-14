import { Injectable, Logger, HttpException } from '@nestjs/common';
import { aql } from 'arangojs';
import { ArangoService } from 'src/persistence/arango/arango.service';
import { UserSession } from '../model/usersession';
import { UAParser } from 'ua-parser-js';
import { lookup } from 'geoip-lite';
import { Browser } from 'src/model/Browser';
import { CPU } from 'src/model/CPU';
import { OperatingSystem } from 'src/model/operatingsystem';
import { AggregatedSessionByLocation } from 'src/model/aggregatedSessionByLocation';

@Injectable()
export class SessionService {
    private readonly logger = new Logger(SessionService.name);

    constructor(private readonly arangoService: ArangoService) {

    }

    async createSession(userAgent: string, userIp: string): Promise<UserSession> {
        let browser: Browser;
        let cpu: CPU;
        let os: OperatingSystem;
        let country: string;
        let city: string;

        try {
            const parsedUA = UAParser(userAgent);
            browser = parsedUA.browser;
            cpu = parsedUA.cpu;
            os = parsedUA.os;
            const userInfoLocation = lookup(userIp);
            country = userInfoLocation.country;
            city = userInfoLocation.city
        } catch (e) {
            this.logger.error(e);
        }
        const userSession = new UserSession(
            userAgent,
            browser,
            cpu,
            os, userIp,
            country,
            city);

        const insert = await this.arangoService.collection.save(userSession);

        if (insert) {
            return userSession;
        }
    }

    async updateSession(userSession: UserSession): Promise<UserSession | null> {
        const query = aql`
            UPDATE ${userSession} in ${this.arangoService.collection}
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0])
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
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
            LIMIT ${+(page * take)}, ${+take} 
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
            LIMIT ${+(page * take)}, ${+take}
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
            REMOVE { _key: ${userSession._key} } in ${this.arangoService.collection}
        `;
        return await this.arangoService.database.query(query)
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

    // metrics
    async getAggregatedSessionsByLocation(startDate?: Date, endDate?: Date): Promise<AggregatedSessionByLocation[]> {
        const filters = [];
        filters.push(aql`
            FILTER S.city != null || S.city != ''
            FILTER S.country != null || S.country != ''
            COLLECT city = S.city, country = S.country INTO count
        ` )

        if (startDate && endDate) {
            filters.push(aql`
                FILTER S.createDate >= ${new Date(startDate)} && S.createDate <= ${new Date(endDate)}
            `);
        }

        const query = aql`
            FOR S in ${this.arangoService.collection}
            ${aql.join(filters)}
            RETURN {
                country: country,
                city: city,
                count: LENGTH(count)
            }
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

    // migrations
    async getSessionsWithNoParsedUserAgent(page: number, take: number): Promise<UserSession[]> {
        const query = aql`
            FOR S in ${this.arangoService.collection}
            FILTER S.userAgent != null
            FILTER S.browser == null
            LIMIT ${+(page * take)}, ${+take} 
            RETURN S
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

    async countessionsWithNoParsedUserAgent(): Promise<number> {
        const query = aql`
            FOR S in ${this.arangoService.collection}
            FILTER S.userAgent != null
            FILTER S.browser == null
            COLLECT WITH COUNT INTO length
            RETURN length
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0])
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

    async getSessionsWithNoParsedUserLocation(page: number, take: number): Promise<UserSession[]> {
        const query = aql`
            FOR S in ${this.arangoService.collection}
            FILTER S.userIp != null
            FILTER S.city == null
            LIMIT ${+(page * take)}, ${+take} 
            RETURN S
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

    async countessionsWithNoParsedUserLocation(): Promise<number> {
        const query = aql`
            FOR S in ${this.arangoService.collection}
            FILTER S.userIp != null
            FILTER S.city == null
            COLLECT WITH COUNT INTO length
            RETURN length
        `;
        return await this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0])
            .catch(e => {
                throw new HttpException(e.response.body.errorMessage, e.code)
            })
    }

}

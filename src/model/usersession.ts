import { ApiProperty } from '@nestjs/swagger';
import { UAParser } from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';


export class UserSession {
    _key?: string;
    _id?: string;
    
    @ApiProperty()
    sid: string;

    @ApiProperty()
    userAgent: string;

    @ApiProperty()
    browser: {
        name: string;
        version: string;
    }

    @ApiProperty()
    operatingSystem: {
        name: string;
        version: string;
    }

    @ApiProperty()
    cpu: {
        architecture: string;
    }

    @ApiProperty()
    userIp: string;

    @ApiProperty()
    createDate: Date;

    constructor(userAgent: string, userIp: string) {
        this.sid = uuidv4();
        this.userAgent = userAgent;
        this.userIp = userIp;
        this.createDate = new Date();

        const parsedUA = UAParser(this.userAgent);
        this.browser = parsedUA.browser;
        this.cpu = parsedUA.cpu;
        this.operatingSystem = parsedUA.os;
    }

}
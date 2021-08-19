import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';


export class UserSession {
    @ApiProperty()
    sid: string;

    @ApiProperty()
    userAgent: string;

    @ApiProperty()
    userIp: string;

    @ApiProperty()
    createDate: Date;

    constructor(userAgent: string, userIp: string) {
        this.sid = uuidv4();
        this.userAgent = userAgent;
        this.userIp = userIp;
        this.createDate = new Date();
    }

}
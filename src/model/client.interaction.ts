import { ApiProperty } from "@nestjs/swagger";

export class Interaction {

    @ApiProperty()
    tid: string;
    
    @ApiProperty()
    origin: OriginInteraction;

    @ApiProperty()
    data: any;

    @ApiProperty()
    timestamp: Date;

    constructor(origin: OriginInteraction, data: any) {
        this.origin = origin;
        this.data = data;
        this.timestamp = new Date();
    }
}

export enum OriginInteraction {
    SERVER = 'server',
    CLIENT = 'client'
}
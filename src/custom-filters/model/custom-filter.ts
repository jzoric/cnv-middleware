import { ApiProperty } from '@nestjs/swagger';
import { Filter } from './filter';

export class CustomFilter {
    _key?: string;
    _id?: string;

    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;
    
    @ApiProperty()
    description: string;

    @ApiProperty()
    type: string;

    @ApiProperty({
        type: Filter
    })
    args: Filter[];

    constructor() {
        this.name = '';
        this.description = '';
        this.type = '';
        this.args = [];
        this.id = "";
    }
}
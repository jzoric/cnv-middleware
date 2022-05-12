import { ApiProperty } from '@nestjs/swagger';
import { IFilter } from 'src/interface/IFilter';

export class CustomFilter {
    _key?: string;
    _id?: string;

    @ApiProperty()
    name: string;
    
    @ApiProperty()
    description: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    args: IFilter[];

    constructor() {
        this.name = '';
        this.description = '';
        this.type = '';
        this.args = [];
    }
}
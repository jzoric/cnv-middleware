import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CustomFiltersService } from './custom-filters.service';
import { CustomFilter } from '../model/custom-filter';

@ApiTags('api/v1/custom-filters')
@Controller('api/v1/custom-filters')
export class CustomFiltersController {

    constructor(private readonly customFiltersService: CustomFiltersService) {

    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("")
    getAll(): Promise<CustomFilter[]> {
        return this.customFiltersService.all();
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(":id")
    get(@Param('id') id: string): Promise<CustomFilter> {
        return this.customFiltersService.get(id);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post("")
    create(@Body() cf: CustomFilter) {
        return this.customFiltersService.create(cf);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.customFiltersService.remove(id);
    }


    
}

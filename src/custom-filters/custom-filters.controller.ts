import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
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
    @ApiResponse({
        type: [CustomFilter]
    })
    getAll(): Promise<CustomFilter[]> {
        return this.customFiltersService.all();
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(":id")
    @ApiResponse({
        type: CustomFilter
    })
    get(@Param('id') id: string): Promise<CustomFilter> {
        return this.customFiltersService.get(id);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post("")
    @ApiResponse({
        type: CustomFilter
    })
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

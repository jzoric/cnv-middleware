import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomFiltersService } from './custom-filters.service';

@ApiTags('api/v1/custom-filters')
@Controller('api/v1/custom-filters')
export class CustomFiltersController {

    constructor(private readonly customFiltersService: CustomFiltersService) {

    }

    
}

import { Module } from '@nestjs/common';
import { CustomFiltersService } from './custom-filters.service';
import { CustomFiltersController } from './custom-filters.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ArangoModule } from 'src/persistence/arango/arango.module';

@Module({
  imports: [AuthModule, ArangoModule.collection('customFilters')],
  providers: [CustomFiltersService],
  controllers: [CustomFiltersController],
  exports: [CustomFiltersService]
})
export class CustomFiltersModule {}

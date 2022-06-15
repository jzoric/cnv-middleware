import { Module } from '@nestjs/common';
import { ArangoModule } from 'src/persistence/arango/arango.module';
import { PropertiesService } from './properties.service';

@Module({
  imports: [
    ArangoModule.collection('properties'),
  ],
  providers: [
    PropertiesService
  ],
  exports: [
    PropertiesService
  ]
})
export class PropertiesModule {}

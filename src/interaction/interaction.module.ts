import { Module } from '@nestjs/common';
import { ArangoModule } from 'src/persistence/arango/arango.module';
import { TrackModule } from 'src/track/track/track.module';
import { InteractionService } from './interaction.service';

@Module({
  imports: [
    ArangoModule.collection('interaction'),
  ],
  providers: [InteractionService],
  exports: [InteractionService]
})
export class InteractionModule {
  constructor(private readonly interactionService: InteractionService) {
    
  }
}

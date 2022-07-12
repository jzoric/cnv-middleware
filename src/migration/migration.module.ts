import { DynamicModule, Module } from '@nestjs/common';
import { SessionModule } from 'src/session/session.module';
import { SessionService } from 'src/session/session.service';
import { TrackModule } from 'src/track/track.module';
import { TrackService } from 'src/track/track.service';
import { MIGRATION } from './migration.constants';
import { MigrationService } from './migration.service';

@Module({
  providers: [MigrationService]
})
export class MigrationModule   {

  static forRoot(): DynamicModule {
    
    return {
      module: MigrationModule,
      imports: [SessionModule, TrackModule],
      providers: [
        {
          provide: MIGRATION,
          inject: [MigrationService, SessionService, TrackService],
          useFactory: async (migrationService: MigrationService) => {
            return await migrationService.runMigrations()
          },
          
        },
        MigrationService,
      ],
      exports: [MigrationService]
    };
  }

}

import { INestApplication, Module } from '@nestjs/common';
import { Runtime } from 'inspector';
import { NoderedService } from './nodered.service';
import { NodeRedWorkerSettings } from './nodered.settings.interface';
import { NoderedController } from './nodered.controller';


var settings: NodeRedWorkerSettings = {
  port: 1880,
  settings: {
    httpAdminRoot:"/red",
    httpNodeRoot: "/red-api",
    userDir:"/home/lestevao/.nore-red/",
    functionGlobalContext: { },    // enables global context
    disableEditor: false,
    editorTheme: {
      projects: {
        enabled: false
      }
    }
  }
};

@Module({
  providers: [NoderedService],
  controllers: [NoderedController]
})
export class NoderedModule {
  
  constructor(private readonly noderedService: NoderedService) {
    
  }

  public init(app: INestApplication) {
    this.noderedService.init(app, settings);
  }
}

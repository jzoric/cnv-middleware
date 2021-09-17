import { INestApplication, Module } from '@nestjs/common';
import { Runtime } from 'inspector';
import { NoderedService } from './nodered.service';
import { NodeRedWorkerSettings } from './nodered.settings.interface';

const os = require('os');
const bcrypt = require('bcryptjs');


var settings: NodeRedWorkerSettings = {
  port: 1880,
  settings: {
    httpAdminRoot:"/red",
    httpNodeRoot: "/red-api",
    userDir: `${os.homedir()}/.node-red/`,
    functionGlobalContext: { },    // enables global context
    disableEditor: false,
    editorTheme: {
      projects: {
        enabled: false
      }
    },
    adminAuth: {
       type: "credentials",
       users: [{
           username: "admin",
           password: bcrypt.hashSync('secret'),
           permissions: "*"
       }]
    },
    apiMaxLength: '1000Mb'
  }
};

@Module({
  providers: [NoderedService],
  controllers: []
})
export class NoderedModule {
  
  constructor(private readonly noderedService: NoderedService) {
    
  }

  public init(app: INestApplication) {
    this.noderedService.init(app, settings);
  }
}

import { INestApplication, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { ConfigModule } from '../config/config/config.module';
import { ConfigService } from '../config/config/config.service';
import { NoderedService } from './nodered.service';
import { NodeRedWorkerSettings } from './nodered.settings.interface';
import { NoderedController } from './nodered.controller';
import { HttpModule } from '@nestjs/axios';

const os = require('os');


var settings: NodeRedWorkerSettings = {
  port: 1880,
  settings: {
    httpAdminRoot:"/red",
    httpNodeRoot: "/red-api",
    userDir: `${os.homedir()}/.node-red/`,
    functionGlobalContext: { },    // enables global context
    disableEditor: false,    
    apiMaxLength: '1000Mb'
  }
};

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    HttpModule
  ],
  providers: [NoderedService],
  controllers: [NoderedController]
})
export class NoderedModule {

  constructor(private readonly noderedService: NoderedService, private readonly configService: ConfigService, private readonly authService: AuthService) {

  }

  public init(app: INestApplication) {

    if(this.configService.get('NODERED_HOME_DIR')) {
      settings.settings.userDir = this.configService.get('NODERED_HOME_DIR');
    }
    
    if(this.configService.get('NODERED_ENABLE_PROJECTS') == 'true') {
      settings.settings.editorTheme = {
        projects: {
          enabled: true
        }
      }
    }

    if(this.configService.get('NODERED_FLOW_FILE')) {
      settings.settings.flowFile = this.configService.get('NODERED_FLOW_FILE');
    }
    if(this.configService.get('USE_BUNDLED_NODERED') == 'true') {
      if(this.authService.useAuth) {
        settings.settings.adminAuth = {
          type: "credentials",
          users: [{
              username: this.configService.get('ADMIN_USER'),
              password: this.authService.bcryptpassword,
              permissions: "*"
          }]
       }
      }
      this.noderedService.init(app, settings);
    }
  }
}

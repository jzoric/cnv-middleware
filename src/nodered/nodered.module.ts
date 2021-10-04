import { INestApplication, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { ConfigModule } from 'src/config/config/config.module';
import { ConfigService } from 'src/config/config/config.service';
import { NoderedService } from './nodered.service';
import { NodeRedWorkerSettings } from './nodered.settings.interface';

const os = require('os');


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
    
    apiMaxLength: '1000Mb'
  }
};

@Module({
  imports: [AuthModule, ConfigModule],
  providers: [NoderedService],
  controllers: []
})
export class NoderedModule {
  private USE_BUNDLED_NODERED = false;
  constructor(private readonly noderedService: NoderedService, private readonly configService: ConfigService, private readonly authService: AuthService) {
    this.USE_BUNDLED_NODERED = configService.get('USE_BUNDLED_NODERED') == 'true';
  }

  public init(app: INestApplication) {
    if(this.USE_BUNDLED_NODERED) {
      if(this.authService.useAuth) {
        settings.settings.adminAuth = {
          type: "credentials",
          users: [{
              username: "admin",
              password: this.authService.bcryptpassword,
              permissions: "*"
          }]
       }
      }
      this.noderedService.init(app, settings);
    }
  }
}

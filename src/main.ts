import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from './config/config/config.service';
import { NoderedModule } from './nodered/nodered.module';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const noderedModule = app.get<NoderedModule>(NoderedModule);

  noderedModule.init(app);
  
  const config = new DocumentBuilder()
    .setTitle('Conversation midleware')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(cookieParser());
  
  const cors = (configService.get('cors') || '').split(',');
  if(cors) {
    app.use((req, res, next) => {

      if (cors.indexOf(req.headers.origin) !== -1) {
          res.header('Access-Control-Allow-Origin', req.headers.origin);
          res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
          res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
          res.header('Access-Control-Allow-Credentials', true);
        } 
       next();
    });
    
  }

  // setTimeout(async () => {
  //   const open = require('open')
  
  //   await open('http://localhost:3000/app')
  //   await open('http://localhost:1880/red')
  //   await open('http://localhost:3000/api')
  
  // }, 5000);
  
  await app.listen(3000);
  
}
bootstrap();

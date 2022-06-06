import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from './config/config/config.service';
import { NoderedModule } from './nodered/nodered.module';
import { Logger } from '@nestjs/common';



async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const noderedModule = app.get<NoderedModule>(NoderedModule);
  const logger = new Logger('bootstrap');
  noderedModule.init(app);

  logger.log('enabling swagger');
  const config = new DocumentBuilder()
    .setTitle('Conversation midleware')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  logger.log('enabling cookieParser');
  app.use(cookieParser());

  const cors = (configService.get('cors') || '').split(',');

  if (cors) {
    logger.log(`enabling cors for ${cors}`);

    app.use((req, res, next) => {
      let origin = req.headers.referer;
      origin = origin.slice(0,origin.lastIndexOf('/'))
      console.log(origin)
      if (cors.indexOf(origin) !== -1) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
        res.header('Access-Control-Allow-Credentials', true);
      } 
      next();
    });

  }

  if (configService.get('isApp') == 'true') {
    logger.log('Launching app urls');
    setTimeout(async () => {
      const open = require('open')

      await open('http://localhost:3000/app')
      await open('http://localhost:1880/red')
      await open('http://localhost:3000/api')

    }, 5000);
    console.log('App launching within 5 seconds');
  }


  await app.listen(3000);

}
bootstrap();

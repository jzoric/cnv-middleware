import { INestApplication, Injectable, Logger } from '@nestjs/common';
import { NodeRedWorkerSettings } from './nodered.settings.interface';

import {Worker, isMainThread, parentPort, workerData} from 'worker_threads';
import { setInterval } from 'timers';

const path = require('path');

const noderedWorker = path.resolve(__dirname, 'node-red.worker.js');



@Injectable()
export class NoderedService {

  private nodeRedWorker: Worker;
    private healthcheckIntervalTimeout;
    private healthcheckInterval;

    
    private readonly logger = new Logger(NoderedService.name);

    constructor( ) { }

    init(app: INestApplication | any, settings: NodeRedWorkerSettings) {
      
      this.nodeRedWorker = new Worker(noderedWorker, {
        workerData: settings
      });
      
      this.nodeRedWorker.on('message', (msg) => {
        if('pong' == msg) {
          clearTimeout(this.healthcheckIntervalTimeout);
        }
      });
      this.nodeRedWorker.on('error', (msg) => this.logger.error(msg));
      this.nodeRedWorker.on('exit', code => {
        if (code !== 0) this.logger.error(new Error(`Worker stopped with exit code ${code}`));
      });
      

      this.healthcheckInterval = setInterval(() => {
        this.nodeRedWorker.postMessage('ping');
        
        this.healthcheckIntervalTimeout = setTimeout(() => {
          this.nodeRedWorker.terminate();
          clearInterval(this.healthcheckInterval);
          this.logger.warn("NODERED ping timeout, rebooting in 3s");
          setTimeout(() => {
            this.init(app, settings);
          }, 3000);
        })

      }, 60000);

    }
}

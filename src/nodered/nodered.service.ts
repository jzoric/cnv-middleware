import { INestApplication, Injectable, Logger } from '@nestjs/common';
import { NodeRedWorkerSettings } from './nodered.settings.interface';

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { setInterval } from 'timers';

const path = require('path');

const noderedWorker = path.resolve(__dirname, 'node-red.worker.js');



@Injectable()
export class NoderedService {

  private nodeRedWorker: Worker;
  private healthcheckInterval;
  private healthcheckIntervalTimeout;
  private app;
  private settings;

  private readonly logger = new Logger(NoderedService.name);

  constructor() { }

  init(app: INestApplication | any, settings: NodeRedWorkerSettings) {
    this.app = app;
    this.settings = settings;

    this.nodeRedWorker = new Worker(noderedWorker, {
      workerData: settings
    });

    this.nodeRedWorker.on('message', (msg) => {
      if ('pong' == msg) {
        this.startHealthCheck();
      } else {
        this.logger.debug(msg)
      }
    });
    this.nodeRedWorker.on('error', (msg) => this.logger.error(msg));

    this.nodeRedWorker.on('exit', code => {
      if (code !== 0) this.logger.error(new Error(`Worker stopped with exit code ${code}`));
    });

    this.healthcheckInterval = setInterval(() => {
      this.nodeRedWorker.postMessage('ping');
    }, 1000);
    
  }

  startHealthCheck() {
    clearTimeout(this.healthcheckIntervalTimeout);
    this.healthcheckIntervalTimeout = setTimeout(() => {
      this.nodeRedWorker.terminate();
      this.stopHealthCheck();
      this.logger.warn("NODERED ping timeout, rebooting in 3s");
        setTimeout(() => {
          this.init(this.app, this.settings);
        }, 3000);
    }, 10000);
    
  }

  stopHealthCheck() {
    clearTimeout(this.healthcheckIntervalTimeout);
    clearInterval(this.healthcheckInterval);
  }
  
}

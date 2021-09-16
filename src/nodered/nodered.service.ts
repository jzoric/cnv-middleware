import { INestApplication, Injectable, Logger } from '@nestjs/common';
import { NodeRedWorkerSettings } from './nodered.settings.interface';

import {Worker, isMainThread, parentPort, workerData} from 'worker_threads';

const path = require('path');

const noderedWorker = path.resolve(__dirname, 'node-red.worker.js')


@Injectable()
export class NoderedService {
    nodeRedWorker: Worker;
    isActive = false;

    private readonly logger = new Logger(NoderedService.name);

    constructor(

    ) {

    }

    init(app: INestApplication | any, settings: NodeRedWorkerSettings) {
        

        this.nodeRedWorker = new Worker(noderedWorker, {
          workerData: settings
        });
        
        this.nodeRedWorker.on('message', (msg) => this.logger.log(msg));
        this.nodeRedWorker.on('error', (msg) => this.logger.error(msg));
        this.nodeRedWorker.on('exit', code => {
            this.isActive = false;
          if (code !== 0) this.logger.error(new Error(`Worker stopped with exit code ${code}`));
        });
        
        this.isActive = true;
    }
}

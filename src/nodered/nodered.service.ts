import { INestApplication, Injectable, Logger } from '@nestjs/common';
import { NodeRedWorkerSettings } from './nodered.settings.interface';

import { Worker } from 'worker_threads';
import { setInterval } from 'timers';
import { ConfigService } from '../config/config/config.service';
import { HttpService } from '@nestjs/axios';

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

  constructor(
    private readonly configService: ConfigService,
    private httpService: HttpService) { }

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

  async getCurrentFlows(): Promise<string[]> {
    const NODERED_HTTP_CONNECTION = this.configService.get('NODERED_HTTP_CONNECTION');
    const ADMIN_USER = this.configService.get('ADMIN_USER');
    const ADMIN_PASSWORD = this.configService.get('ADMIN_PASSWORD');

    const data = <any>await this.auth(NODERED_HTTP_CONNECTION, ADMIN_USER, ADMIN_PASSWORD)
    
    return new Promise((resolve, reject) => {
      this.httpService.get(`${NODERED_HTTP_CONNECTION}/red/current_flows`, {
        headers: {
          Authorization: `Bearer ${ data.access_token}`
        }      
      }).subscribe({
        next: (res) => {
          resolve(res.data)
        },
        error: (err) => {
          this.logger.error(err);
          reject(err)
        }
      })
    })
    
  }

  async auth(server_url: string, username: string, password: string): Promise<string> {
    
    return new Promise((resolve, reject) => {
      this.httpService.post(`${server_url}/red/auth/token`, {
        client_id: 'node-red-admin',
        grant_type: 'password',
        scope: '*',
        username,
        password
      }).subscribe({
        next: (res) => {
          resolve(res.data)
        },
        error: (err) => {
          this.logger.error(err);
          reject(err)
        }
      })
    })
  }
  
}

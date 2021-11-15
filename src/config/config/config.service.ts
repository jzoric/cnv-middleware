import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

@Injectable()
export class ConfigService {
    private readonly envConfig: { [key: string]: string };

    constructor(filePath: string) {
        if(fs.existsSync(filePath)) {
            this.envConfig = dotenv.parse(fs.readFileSync(filePath));
        } else {
            this.envConfig = {}
        }
    }

    get(key: string): string {
        return process.env[key] || this.envConfig[key] || null;
    }
}

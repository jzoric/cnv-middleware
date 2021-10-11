import { v4 as uuidv4 } from 'uuid';

export const jwtConstants = {
    secret: Buffer.from(uuidv4()).toString('base64'),
  };
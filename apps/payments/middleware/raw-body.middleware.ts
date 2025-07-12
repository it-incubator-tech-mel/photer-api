// raw-body.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.log('RawBodyMiddleware executed');

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const rawBody = Buffer.concat(chunks);
      req['rawBody'] = rawBody;
      console.log('Raw body stored:', rawBody.length, 'bytes');
      next();
    });
  }
}

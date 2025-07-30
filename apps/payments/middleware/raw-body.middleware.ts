import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    bodyParser.raw({ type: '*/*' })(req, res, (err) => {
      if (err) {
        console.error('[RawBodyMiddleware] Error:', err);
        return next(err);
      }

      // Сохраняем сырое тело
      (req as any).rawBody = req.body;

      // Очищаем req.body для избежания конфликтов
      req.body = null;

      next();
    });
  }
}

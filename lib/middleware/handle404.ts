import express from 'express';
import { Logger } from 'winston';

export default function handle404(logger: Logger) {
  return (req: express.Request, res: express.Response): void => {
    logger.warn('404 by requesting URL: ' + req.originalUrl);
    res.status(404);
    res.render('errorPages/404.pug');
  };
}

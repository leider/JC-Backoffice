import express from 'express';

export default function handle404(logger: any) {
  return (req: express.Request, res: express.Response) => {
    logger.warn('404 by requesting URL: ' + req.originalUrl);
    res.status(404);
    res.render('errorPages/404.pug');
  };
}

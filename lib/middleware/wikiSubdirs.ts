import express from 'express';
import Git from '../wiki/gitmech';

export default function wikiSubdirs(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  Git.lsdirs((err: Error | null, gitdirs: string[]) => {
    if (err) {
      return next(err);
    }
    res.locals.wikisubdirs = gitdirs;
    return next();
  });
}

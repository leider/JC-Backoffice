import path from 'path';
import fs from 'fs';

import childProcess from 'child_process';
import conf from '../commons/simpleConfigure';
let workTree = conf.get('wikipath');

let gitCommands: string[] = [];

if (workTree) {
  fs.realpath(workTree, (err: Error | null, absWorkTree: string) => {
    if (err) {
      throw new Error('Repository path does not exist: ' + workTree);
    }
    workTree = absWorkTree;
    const gitDir = path.join(workTree, '.git');
    fs.stat(gitDir, (err1: Error | null) => {
      if (err1) {
        throw new Error('Repository path is not initialized: ' + workTree);
      }
      gitCommands = ['--git-dir=' + gitDir, '--work-tree=' + workTree];
      // run a smoke test of git and the repo:
      childProcess.exec(
        'git log -1 --oneline ',
        { cwd: workTree },
        (err2: Error | null) => {
          if (err2) {
            if (
              /fatal: your current branch 'master' does not have any commits yet/.test(
                err2.message
              )
            ) {
              throw new Error(
                'Please add an initial commit to the repository: ' + workTree
              );
            }
            throw new Error(err2.message + ' in ' + workTree);
          }
        }
      );
    });
  });
}

function gitExec(
  commands: string[],
  callback:
    | ((
        error: childProcess.ExecException | null,
        stdout: string,
        stderr: string
      ) => void)
    | undefined
) {
  childProcess.exec(
    'git ' + gitCommands.concat(commands).join(' '),
    { cwd: workTree },
    callback
  );
}

export default { command: gitExec };

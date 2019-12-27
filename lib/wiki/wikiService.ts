import * as fs from 'fs';

import Git from './gitmech';
import Diff from './gitDiff';
import * as path from 'path';
import { Metadata } from './wikiObjects';
import childProcess from "child_process";

export default {
  BLOG_ENTRY_FILE_PATTERN: 'blog_*',

  showPage: function showPage(
    completePageName: string,
    pageVersion: string,
    callback: (
      error: childProcess.ExecException | null,
      stdout: string,
      stderr: string
    ) => void
  ) {
    Git.readFile(completePageName + '.md', pageVersion, callback);
  },

  pageEdit: function pageEdit(completePageName: string, callback: Function) {
    fs.exists(Git.absPath(completePageName + '.md'), exists => {
      if (!exists) {
        return callback(null, '', ['NEW']);
      }
      Git.readFile(
        completePageName + '.md',
        'HEAD',
        (err: Error | null, content: string) => {
          if (err) {
            return callback(err);
          }
          Git.log(
            completePageName + '.md',
            'HEAD',
            1,
            (ignoredErr: Error | number, metadata: Metadata[]) => {
              callback(null, content, metadata);
            }
          );
        }
      );
    });
  },

  pageRename: function pageRename(
    subdir: string,
    pageNameOld: string,
    pageNameNew: string,
    user: string,
    callback: Function
  ) {
    const completePageNameOld = subdir + '/' + pageNameOld + '.md';
    const completePageNameNew = subdir + '/' + pageNameNew + '.md';
    Git.mv(
      completePageNameOld,
      completePageNameNew,
      'rename: "' + pageNameOld + '" -> "' + pageNameNew + '"',
      user,
      (err: Error | null) => {
        callback(err, null);
      }
    );
  },

  pageSave: function pageSave(
    subdir: string,
    pageName: string,
    body: { content: any; metadata: any; comment: string | any[] },
    user: string,
    callback: Function
  ) {
    fs.exists(Git.absPath(subdir), function(exists) {
      if (!exists) {
        fs.mkdir(Git.absPath(subdir), err => {
          if (err) {
            return callback(err);
          }
        });
      }
      const completePageName = subdir + '/' + pageName + '.md';
      const pageFile = Git.absPath(completePageName);
      fs.writeFile(pageFile, body.content, err => {
        if (err) {
          return callback(err);
        }
        Git.log(
          completePageName,
          'HEAD',
          1,
          (ignoredErr: Error | null, metadata: Metadata[]) => {
            const conflict =
              metadata[0] && metadata[0].fullhash !== body.metadata;
            Git.add(
              completePageName,
              body.comment.length === 0
                ? 'no comment'
                : (body.comment as string),
              user,
              (err1: Error | null) => {
                callback(err1, conflict);
              }
            );
          }
        );
      });
    });
  },

  pageHistory: function pageHistory(
    completePageName: string,
    callback: Function
  ) {
    Git.readFile(completePageName + '.md', 'HEAD', (err: Error | null) => {
      if (err) {
        return callback(err);
      }
      Git.log(
        completePageName + '.md',
        'HEAD',
        30,
        (ignoredErr: Error | null, metadata: Metadata[]) => {
          callback(null, metadata);
        }
      );
    });
  },

  pageCompare: function pageCompare(
    completePageName: string,
    revisions: string,
    callback: Function
  ) {
    Git.diff(
      completePageName + '.md',
      revisions,
      (err: Error | null, diff: string) => {
        if (err) {
          return callback(err);
        }
        callback(null, new Diff(diff));
      }
    );
  },

  pageList: function pageList(subdir: string, callback: Function) {
    Git.ls(subdir, (err: Error | null, list: string[]) => {
      if (err) {
        return callback(err);
      }
      const items = list.map(row => {
        const rowWithoutEnding = row.replace('.md', '');
        return {
          fullname: rowWithoutEnding,
          name: path.basename(rowWithoutEnding)
        };
      });
      callback(null, items);
    });
  },

  search: function search(searchtext: string, callback: Function) {
    Git.grep(searchtext, (err: Error | null, items: string[]) => {
      if (err) {
        return callback(err);
      }
      const result = items
        .filter(item => item.trim() !== '')
        .map(item => {
          const record = item.split(':');
          return {
            pageName: record[0].split('.')[0],
            line: record[1],
            text: record.slice(2).join('')
          };
        });
      callback(null, result);
    });
  }
};

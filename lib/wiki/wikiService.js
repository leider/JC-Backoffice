const Fs = require('fs');
const Path = require('path');
const beans = require('simple-configure').get('beans');
const Git = beans.get('gitmech');
const Diff = beans.get('gitDiff');

module.exports = {
  BLOG_ENTRY_FILE_PATTERN: 'blog_*',

  showPage: function showPage(completePageName, pageVersion, callback) {
    Git.readFile(completePageName + '.md', pageVersion, callback);
  },

  pageEdit: function pageEdit(completePageName, callback) {
    Fs.exists(Git.absPath(completePageName + '.md'), exists => {
      if (!exists) {
        return callback(null, '', ['NEW']);
      }
      Git.readFile(completePageName + '.md', 'HEAD', (err, content) => {
        if (err) {
          return callback(err);
        }
        Git.log(completePageName + '.md', 'HEAD', 1, (ignoredErr, metadata) => {
          callback(null, content, metadata);
        });
      });
    });
  },

  pageRename: function pageRename(
    subdir,
    pageNameOld,
    pageNameNew,
    user,
    callback
  ) {
    const completePageNameOld = subdir + '/' + pageNameOld + '.md';
    const completePageNameNew = subdir + '/' + pageNameNew + '.md';
    Git.mv(
      completePageNameOld,
      completePageNameNew,
      'rename: "' + pageNameOld + '" -> "' + pageNameNew + '"',
      user,
      err => {
        callback(err, null);
      }
    );
  },

  pageSave: function pageSave(subdir, pageName, body, user, callback) {
    Fs.exists(Git.absPath(subdir), function(exists) {
      if (!exists) {
        Fs.mkdir(Git.absPath(subdir), err => {
          if (err) {
            return callback(err);
          }
        });
      }
      const completePageName = subdir + '/' + pageName + '.md';
      const pageFile = Git.absPath(completePageName);
      Fs.writeFile(pageFile, body.content, err => {
        if (err) {
          return callback(err);
        }
        Git.log(completePageName, 'HEAD', 1, (ignoredErr, metadata) => {
          const conflict =
            metadata[0] && metadata[0].fullhash !== body.metadata;
          Git.add(
            completePageName,
            body.comment.length === 0 ? 'no comment' : body.comment,
            user,
            err1 => {
              callback(err1, conflict);
            }
          );
        });
      });
    });
  },

  pageHistory: function pageHistory(completePageName, callback) {
    Git.readFile(completePageName + '.md', 'HEAD', err => {
      if (err) {
        return callback(err);
      }
      Git.log(completePageName + '.md', 'HEAD', 30, (ignoredErr, metadata) => {
        callback(null, metadata);
      });
    });
  },

  pageCompare: function pageCompare(completePageName, revisions, callback) {
    Git.diff(completePageName + '.md', revisions, (err, diff) => {
      if (err) {
        return callback(err);
      }
      callback(null, new Diff(diff));
    });
  },

  pageList: function pageList(subdir, callback) {
    Git.ls(subdir, (err, list) => {
      if (err) {
        return callback(err);
      }
      const items = [];
      list.forEach(row => {
        // FIXME use map instead
        const rowWithoutEnding = row.replace('.md', '');
        items.push({
          fullname: rowWithoutEnding,
          name: Path.basename(rowWithoutEnding)
        });
      });
      callback(null, items);
    });
  },

  search: function search(searchtext, callback) {
    Git.grep(searchtext, (err, items) => {
      if (err) {
        return callback(err);
      }
      const result = [];
      items.forEach(item => {
        // FIXME use map instead
        if (item.trim() !== '') {
          const record = item.split(':');
          result.push({
            pageName: record[0].split('.')[0],
            line: record[1],
            text: record.slice(2).join('')
          });
        }
      });
      callback(null, result);
    });
  }
};

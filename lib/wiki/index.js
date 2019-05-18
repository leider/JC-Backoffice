const beans = require('simple-configure').get('beans');
const renderer = beans.get('renderer');
const wikiService = beans.get('wikiService');
const statusmessage = beans.get('statusmessage');
const misc = beans.get('misc');

function showPage(subdir, pageName, pageVersion, req, res, next) {
  const normalizedPageName = renderer.normalize(pageName);
  const completePageName = subdir + '/' + normalizedPageName;
  wikiService.showPage(completePageName, pageVersion, (err, content) => {
    if (err || !content) {
      if (req.user) {
        return res.redirect('/wiki/edit/' + completePageName);
      }
      return next();
    }
    const headerAndBody = renderer.titleAndRenderedTail(content, subdir);
    res.render('get', {
      content: headerAndBody.body,
      title: headerAndBody.title,
      pageName: normalizedPageName,
      subdir,
      canEdit: pageVersion === 'HEAD' && req.user
    });
  });
}

const app = misc.expressAppIn(__dirname);

// wiki pages

app.get('/versions/:subdir/:page', (req, res, next) => {
  const pageName = req.params.page;
  const subdir = req.params.subdir;
  const completePageName = subdir + '/' + pageName;
  wikiService.pageHistory(completePageName, (err, metadata) => {
    if (err || !metadata) {
      return next();
    }
    res.render('history', {
      pageName,
      subdir,
      items: metadata
    });
  });
});

app.get('/compare/:subdir/:page/:revisions', (req, res, next) => {
  const pageName = req.params.page;
  const subdir = req.params.subdir;
  const completePageName = subdir + '/' + pageName;
  const revisions = req.params.revisions;
  wikiService.pageCompare(completePageName, revisions, (err, diff) => {
    if (err || !diff) {
      return next();
    }
    res.render('compare', {
      pageName,
      subdir,
      lines: diff.asLines()
    });
  });
});

// editing pages

app.get('/edit/:subdir/:page', (req, res, next) => {
  const pageName = renderer.normalize(req.params.page);
  const subdir = req.params.subdir;
  const completePageName = subdir + '/' + pageName;
  wikiService.pageEdit(completePageName, (err, content, metadata) => {
    if (err) {
      return next(err);
    }
    res.render('edit', {
      page: { content, comment: '', metadata: metadata[0].fullhash },
      subdir,
      pageName
    });
  });
});

app.post('/:subdir/:page', (req, res) => {
  const pageName = renderer.normalize(req.params.page);
  const subdir = req.params.subdir;
  wikiService.pageSave(
    subdir,
    pageName,
    req.body,
    req.user,
    (err, conflict) => {
      if (err) {
        statusmessage
          .errorMessage('Problem', 'Das Speichern war nicht erfolgreich.')
          .putIntoSession(req);
      } else if (conflict) {
        statusmessage
          .errorMessage(
            'Konflikt',
            'Deine Änderungen wurden gespeichert. Du hast allerdings Änderungen eines anderen Benutzers überschrieben. Bitte überprüfe nochmals die Wikiseite.'
          )
          .putIntoSession(req);
      } else {
        statusmessage
          .successMessage(
            'Speichern erfolgreich',
            'Deine Änderungen wurden gespeichert.'
          )
          .putIntoSession(req);
      }
      res.redirect('/wiki/' + subdir + '/' + pageName);
    }
  );
});

app.post('/rename/:subdir/:page', (req, res, next) => {
  const pageNameNew = renderer.normalize(req.body.newName);
  const subdir = req.params.subdir;
  wikiService.pageRename(
    subdir,
    req.params.page,
    pageNameNew,
    req.user,
    err => {
      if (err) {
        statusmessage
          .errorMessage('Problem', 'Das Speichern war nicht erfolgreich.')
          .putIntoSession(req);
        return next(err);
      }
      statusmessage
        .successMessage(
          'Speichern erfolgreich',
          'Deine Änderungen wurden gespeichert.'
        )
        .putIntoSession(req);
      res.redirect('/wiki/' + subdir + '/' + pageNameNew);
    }
  );
});

// showing pages

app.get('/list/:subdir/', (req, res, next) => {
  const subdir = req.params.subdir;
  wikiService.pageList(subdir, (err, items) => {
    if (err) {
      return next(err);
    }
    res.render('list', { items, subdir });
  });
});

app.get('/modal/:subdir/:page', (req, res, next) => {
  const subdir = req.params.subdir;
  const completePageName = subdir + '/' + req.params.page;
  wikiService.showPage(completePageName, 'HEAD', (err, content) => {
    if (err) {
      return next(err);
    }
    res.render('modal', {
      content: content && renderer.render(content, subdir),
      subdir
    });
  });
});

app.get('/:subdir/:page', (req, res, next) => {
  const version = req.query.version || 'HEAD';
  showPage(req.params.subdir, req.params.page, version, req, res, next);
});

app.get('/:subdir/', (req, res) => {
  res.redirect('/wiki/' + req.params.subdir + '/index');
});

app.get('/:subdir', (req, res) => {
  res.redirect('/wiki/' + req.params.subdir + '/index');
});

app.get('/', (req, res) => {
  res.redirect('/wiki/alle/index');
});

app.post('/search', (req, res, next) => {
  const searchtext = req.body.searchtext;
  if (searchtext.length < 2) {
    statusmessage
      .errorMessage(
        'Suchtext zu kurz',
        'Dein eingegebener Suchtext ist zu kurz.'
      )
      .putIntoSession(req);
    return res.redirect(req.headers.referer);
  }
  wikiService.search(searchtext, (err, matches) => {
    if (err) {
      return next(err);
    }
    res.render('searchresults', { searchtext, matches });
  });
});

module.exports = app;

/* eslint no-underscore-dangle: 0 */

const path = require('path');
const express = require('express');
const fs = require('fs');
const passport = require('passport');

const conf = require('simple-configure');
const beans = conf.get('beans');
const Renderer = beans.get('renderer');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.locals.pretty = true;

app.get('/', (req, res) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/teamseite');
  }
  res.redirect('/veranstaltungen');
});

app.get('/robots.txt', (req, res, next) => {
  fs.readFile(path.join(__dirname, 'views', 'robots.txt'), 'utf8', (err, data) => {
    if (err) { return next(err); }
    res.send(data);
  });
});

app.post('/preview', (req, res) => res.send(Renderer.render(req.body.data, req.body.subdir)));

app.get('/login', (req, res) => res.render('authenticationRequired'));

app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => res.redirect('/'));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

app.get('/loginDialog', (req, res) => res.render('loginDialog'));

app.get('/cheatsheet.html', (req, res) => {
  res.render('lazyMarkdownCheatsheet');
});

module.exports = app;

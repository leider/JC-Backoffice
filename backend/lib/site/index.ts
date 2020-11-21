/* eslint no-underscore-dangle: 0 */
import express from "express";
import path from "path";
import fs from "fs";
import passport from "passport";
import sharp from "sharp";

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.locals.pretty = true;

app.get("/", (req, res) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/vue/team");
  }
  return res.redirect("/vue/veranstaltungen");
});

app.get("/robots.txt", (req, res, next) => {
  fs.readFile(path.join(__dirname, "views", "robots.txt"), "utf8", (err, data) => {
    if (err) {
      return next(err);
    }
    return res.send(data);
  });
});

app.get("/login", (req, res) => res.render("authenticationRequired"));

app.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => res.redirect("/"));

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

const uploadDir = path.join(__dirname, "../../static/upload");

app.get("/imagepreview/:filename", (req, res, next) => {
  sharp(uploadDir + "/" + req.params.filename)
    .resize({ width: 800 })
    .toBuffer((err, buffer) => {
      if (err) {
        if (err.message === "Input file is missing") {
          return next();
        }
        return next(err);
      }
      res.send(buffer);
    });
});

export default app;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var compression_1 = __importDefault(require("compression"));
var body_parser_1 = __importDefault(require("body-parser"));
var initWinston_1 = __importDefault(require("./initWinston"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var serve_favicon_1 = __importDefault(require("serve-favicon"));
var morgan_1 = __importDefault(require("morgan"));
var csurf_1 = __importDefault(require("csurf"));
var index_1 = __importDefault(require("./lib/gema/index"));
var ical_1 = __importDefault(require("./lib/ical"));
var mailsender_1 = __importDefault(require("./lib/mailsender"));
var optionen_1 = __importDefault(require("./lib/optionen"));
var programmheft_1 = __importDefault(require("./lib/programmheft"));
var site_1 = __importDefault(require("./lib/site"));
var users_1 = __importDefault(require("./lib/users"));
var veranstaltungen_1 = __importDefault(require("./lib/veranstaltungen"));
var vertrag_1 = __importDefault(require("./lib/vertrag"));
var wiki_1 = __importDefault(require("./lib/wiki"));
var vue_1 = __importDefault(require("./lib/vue"));
var connect_history_api_fallback_1 = __importDefault(require("connect-history-api-fallback"));
var expressViewHelper_1 = __importDefault(require("./lib/middleware/expressViewHelper"));
var expressSessionConfigurator_1 = __importDefault(require("./lib/middleware/expressSessionConfigurator"));
var passportInitializer_1 = __importDefault(require("./lib/middleware/passportInitializer"));
var accessrights_1 = __importDefault(require("./lib/middleware/accessrights"));
var addCsrfTokenToLocals_1 = __importDefault(require("./lib/middleware/addCsrfTokenToLocals"));
var secureByLogin_1 = __importDefault(require("./lib/middleware/secureByLogin"));
var wikiSubdirs_1 = __importDefault(require("./lib/middleware/wikiSubdirs"));
var path_1 = __importDefault(require("path"));
var httpLogger = initWinston_1.default.get("http");
var winstonStream = {
    write: function (message) { return httpLogger.info(message.replace(/(\r\n|\n|\r)/gm, "")); },
};
function secureAgainstClickjacking(req, res, next) {
    res.setHeader("X-Frame-Options", "DENY");
    next();
}
function serverpathRemover(req, res, next) {
    res.locals.removeServerpaths = function (msg) {
        var pathToBeRemoved = /\/[^ ]*?\/(?=(node_modules|JC-Backoffice\/lib)\/)/.exec(msg);
        if (pathToBeRemoved) {
            return msg.replace(new RegExp(pathToBeRemoved[0], "g"), "");
        }
        return msg;
    };
    next();
}
function useApp(parent, url, child) {
    function ensureRequestedUrlEndsWithSlash(req, res, next) {
        if (!/\/$/.test(req.url)) {
            res.redirect(req.url + "/");
        }
        else {
            next();
        }
    }
    if (process.env.NODE_ENV !== "production") {
        child.locals.pretty = true;
    }
    parent.get("/" + url, ensureRequestedUrlEndsWithSlash);
    parent.use("/" + url + "/", child);
    return child;
}
function default_1(app) {
    app.use(serverpathRemover);
    app.set("view engine", "pug");
    app.set("views", path_1.default.join(__dirname, "views"));
    app.use(serve_favicon_1.default(path_1.default.join(__dirname, "static/", "img/favicon.ico")));
    app.use(morgan_1.default("combined", { stream: winstonStream }));
    app.use(cookie_parser_1.default());
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use(body_parser_1.default.json());
    app.use(compression_1.default());
    app.use("/vue", connect_history_api_fallback_1.default({ index: "/index.html" }));
    app.use(express_1.default.static(path_1.default.join(__dirname, "static"), { maxAge: 10 * 60 * 60 * 1000 }));
    app.use(expressSessionConfigurator_1.default);
    app.use(passportInitializer_1.default);
    app.use(secureByLogin_1.default);
    app.use(expressViewHelper_1.default);
    app.use(accessrights_1.default);
    app.use(secureAgainstClickjacking);
    app.use(csurf_1.default({ cookie: true }));
    app.use(addCsrfTokenToLocals_1.default);
    app.use(wikiSubdirs_1.default);
    app.use("/", site_1.default);
    useApp(app, "mailsender", mailsender_1.default);
    useApp(app, "optionen", optionen_1.default);
    useApp(app, "veranstaltungen", veranstaltungen_1.default);
    useApp(app, "users", users_1.default);
    useApp(app, "gema", index_1.default);
    useApp(app, "wiki", wiki_1.default);
    useApp(app, "ical", ical_1.default);
    useApp(app, "vertrag", vertrag_1.default);
    useApp(app, "programmheft", programmheft_1.default);
    useApp(app, "vue-spa", vue_1.default);
}
exports.default = default_1;
//# sourceMappingURL=configureApp.js.map
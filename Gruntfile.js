/* eslint-disable @typescript-eslint/camelcase, camelcase */
module.exports = function (grunt) {
  // filesets for uglify
  const files_de = {
    "static/clientscripts/global.js": [
      "node_modules/jquery/dist/jquery.js",
      "node_modules/select2/dist/js/select2.full.js",
      "node_modules/select2/dist/js/i18n/de.js",
      "node_modules/popper.js/dist/umd/popper.js",
      "node_modules/bootstrap/dist/js/bootstrap.js",
      "node_modules/bootstrap-select/dist/js/bootstrap-select.js",
      "node_modules/bootstrap-select/dist/js/i18n/defaults-de_DE.js",
      "frontend/javascript/jc-backoffice.js",
    ],
    "static/clientscripts/fileinput.min.js": [
      "node_modules/bootstrap-fileinput/js/fileinput.js",
      "node_modules/bootstrap-fileinput/js/locales/de.js",
      "node_modules/bootstrap-fileinput/themes/fas/theme.js",
    ],
    "static/clientscripts/bootstrap-markdown.min.js": [
      "node_modules/bootstrap-markdown/js/bootstrap-markdown.js",
      "node_modules/bootstrap-markdown/locale/bootstrap-markdown.de.js",
    ],
  };

  const filesForCss = {
    "static/stylesheets/screen.css": [
      "frontend/3rd_party_css/flaticon-patched.css",
      "node_modules/select2/dist/css/select2.css",
      "frontend/sass/out/jc-backoffice.css",
    ],
  };

  grunt.initConfig({
    clean: {
      static: ["static/clientscripts", "static/fonts", "static/img/bootstrap-colorpicker", "static/images", "static/stylesheets"],
      compiledTypescript: ["lib/**/*.js*", "test/**/*.js*", "start.js*", "app.js*", "configure.js*", "initWinston.js*"],
      options: { force: true },
    },
    copy: {
      bootstrapFileinputImages: {
        src: "node_modules/bootstrap-fileinput/img/*",
        dest: "static/img/",
        expand: true,
        flatten: true,
      },
      utilJS: {
        src: [
          "node_modules/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js",
          "node_modules/bootstrap-datepicker/dist/locales/bootstrap-datepicker.de.min.js",
          "node_modules/simple-timepicker/dist/simple-timepicker.min.js",
        ],
        dest: "static/clientscripts",
        expand: true,
        flatten: true,
      },
      utilCSS: {
        src: ["node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker3.css", "node_modules/bootstrap-fileinput/css/fileinput.css"],
        dest: "static/stylesheets",
        expand: true,
        flatten: true,
      },
      flaticonFONTS: {
        src: ["frontend/additionalIcons/font/*", "!frontend/additionalIcons/font/*css", "!frontend/additionalIcons/font/*html"],
        dest: "static/fonts",
        expand: true,
        flatten: true,
      },
      fontawesomeFONTS: {
        src: "node_modules/@fortawesome/fontawesome-free/webfonts/*",
        dest: "static/webfonts",
        expand: true,
        flatten: true,
      },
    },
    eslint: {
      options: { quiet: true },
      target: ["*.ts", "lib/**/*.ts", "test/**/*.ts", "frontend/**/*.js"],
    },
    sass: {
      dist: {
        files: {
          "frontend/sass/out/jc-backoffice.css": "frontend/sass/jc-backoffice.scss",
        },
      },
    },
    cssmin: {
      standard: {
        options: {
          level: 2,
        },
        files: filesForCss,
      },
    },
    uglify: {
      development_de: {
        options: {
          mangle: false,
          beautify: true,
        },
        files: files_de,
      },
      production_de: {
        files: files_de,
      },
    },

    mochacli: {
      options: {
        exit: true,
        reporter: "dot",
        timeout: 6000,
      },
      test: {
        src: "test/**/*.js",
      },
    },
    pug: {
      compile: {
        options: {
          pretty: true,
          data: function () {
            return require("./frontendtests/fixtures/locals");
          },
        },
        files: {
          "frontendtests/fixtures/forms.html": "frontendtests/fixtures/forms.pug",
        },
      },
    },
    puglint: {
      standard: {
        options: {
          disallowAttributeInterpolation: true,
          disallowDuplicateAttributes: true,
          disallowLegacyMixinCall: true,
          disallowTemplateString: true,
          requireClassLiteralsBeforeAttributes: true,
          requireIdLiteralsBeforeAttributes: true,
          requireLowerCaseTags: true,
          requireStrictEqualityOperators: true,
          validateAttributeQuoteMarks: '"',
        },
        src: ["lib/**/*.pug"],
      },
    },
    ts: {
      default: {
        tsconfig: "./tsconfig.json",
      },
    },
  });

  process.env.NODE_ICU_DATA = "node_modules/full-icu"; // necessary for timezone stuff

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-pug");
  grunt.loadNpmTasks("grunt-contrib-sassjs");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-eslint");
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-mocha-cli");
  grunt.loadNpmTasks("grunt-puglint");

  grunt.registerTask("prepare", ["eslint", "puglint", "clean", "copy"]);
  grunt.registerTask("tests", ["prepare", "ts", "mochacli", "clean:compiledTypescript"]);
  grunt.registerTask("deploy_development", ["prepare", "sass", "cssmin", "uglify:development_de"]);
  grunt.registerTask("css_only", ["prepare", "sass", "cssmin"]);

  // Default task.
  grunt.registerTask("default", ["tests"]);

  grunt.registerTask("deploy_production", ["prepare", "sass", "cssmin", "uglify:production_de", "ts"]);
};

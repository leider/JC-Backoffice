module.exports = function (grunt) {
  const filesForCss = {
    "static/stylesheets/screen.css": ["frontend/sass/out/jc-backoffice.css"],
  };

  grunt.initConfig({
    clean: {
      static: ["static/*", "!static/files", "!static/img", "!static/reporting", "!static/upload"],
      compiledTypescript: ["lib/**/*.js*", "test/**/*.js*", "start.js*", "app.js*", "configure.js*", "initWinston.js*", "reservixLoad.js*"],
      options: { force: true },
    },
    copy: {
      flaticonFONTS: {
        src: ["frontend/additionalIcons/font/*", "!frontend/additionalIcons/font/*css", "!frontend/additionalIcons/font/*html"],
        dest: "static/fonts",
        expand: true,
        flatten: true,
      },
      offlineFONTS: {
        src: "frontend/offlinefonts/fonts/*",
        dest: "static/fonts",
        expand: true,
        flatten: true,
      },
      offlineFONTS_CSS: {
        src: "frontend/offlinefonts/stylesheets/*",
        dest: "static/stylesheets",
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
  });

  process.env.NODE_ICU_DATA = "node_modules/full-icu"; // necessary for timezone stuff

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-sassjs");
  grunt.loadNpmTasks("grunt-eslint");
  grunt.loadNpmTasks("grunt-mocha-cli");

  grunt.registerTask("prepare", ["eslint", "clean", "copy"]);
  grunt.registerTask("tests", ["prepare", "mochacli", "clean:compiledTypescript"]);
  grunt.registerTask("css_only", ["prepare", "sass", "cssmin"]);

  // Default task.
  grunt.registerTask("default", ["tests"]);

  grunt.registerTask("deploy", ["prepare", "sass", "cssmin"]);
};

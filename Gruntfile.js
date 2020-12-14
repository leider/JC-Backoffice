module.exports = function (grunt) {
  grunt.initConfig({
    clean: {
      static: ["backend/static/*", "!backend/static/files", "!backend/static/img", "!backend/static/reporting", "!backend/static/upload"],
      compiledTypescript: ["backend/**/*.js", "shared/**/*.js", "batchjobs/**/*.js", "backend/static/vue"],
      options: { force: true },
    },
    copy: {
      fonts: {
        src: [
          "backend/frontend/offlinefonts/fonts/*",
          "backend/frontend/additionalIcons/font/*",
          "!backend/frontend/additionalIcons/font/*css",
          "!backend/frontend/additionalIcons/font/*html",
        ],
        dest: "backend/static/fonts",
        expand: true,
        flatten: true,
      },
      offlineFONTS_CSS: {
        src: "backend/frontend/offlinefonts/stylesheets/*",
        dest: "backend/static/stylesheets",
        expand: true,
        flatten: true,
      },
    },
    eslint: {
      options: { quiet: true },
      target: ["backend/**/*.ts", "shared/**/*.ts", "test/**/*.ts", "vue/**/*.ts|vue"],
    },
    sass: {
      dist: {
        files: {
          "backend/frontend/sass/out/jc-backoffice.css": "backend/frontend/sass/jc-backoffice.scss",
        },
      },
    },
    cssmin: {
      standard: {
        options: {
          level: 2,
        },
        files: {
          "backend/static/stylesheets/screen.css": ["backend/frontend/sass/out/jc-backoffice.css"],
        },
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

  grunt.registerTask("prepare", ["eslint", "clean", "copy"]);
  grunt.registerTask("css_only", ["prepare", "sass", "cssmin"]);

  // Default task.
  grunt.registerTask("default", ["tests"]);

  grunt.registerTask("deploy", ["prepare", "sass", "cssmin"]);
};

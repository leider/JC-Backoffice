module.exports = function (grunt) {
  grunt.initConfig({
    clean: {
      static: ["backend/static/stylesheets"],
      compiledTypescript: ["backend/**/*.js", "shared/**/*.js", "batchjobs/**/*.js", "backend/static/vue"],
      options: { force: true },
    },
    eslint: {
      options: { quiet: true },
      target: ["backend/**/*.ts", "shared/**/*.ts", "test/**/*.ts", "vue/**/*.ts|vue"],
    },
    sass: {
      dist: {
        files: {
          "backend/static/stylesheets/screen.css": "backend/sass/jc-backoffice.scss",
        },
      },
    },
  });

  process.env.NODE_ICU_DATA = "node_modules/full-icu"; // necessary for timezone stuff

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-sassjs");
  grunt.loadNpmTasks("grunt-eslint");

  // Default task.
  grunt.registerTask("default", ["eslint", "clean", "sass"]);
};

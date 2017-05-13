'use strict';
module.exports = function (grunt) {
  /*eslint camelcase: 0*/

  // filesets for uglify
  const files_de = {
    'public/clientscripts/global.js': [
      'node_modules/jquery/dist/jquery.js',
      'node_modules/select2/dist/js/select2.full.js',
      'node_modules/select2/dist/js/i18n/de.js',
      'node_modules/autonumeric/dist/autoNumeric.min.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/bootstrap-datepicker/js/bootstrap-datepicker.js',
      'node_modules/bootstrap-datepicker/js/locales/bootstrap-datepicker.de.js',
      'node_modules/bootstrap-markdown/js/bootstrap-markdown.js',
      'node_modules/bootstrap-markdown/locale/bootstrap-markdown.de.js',
      'node_modules/bootstrap-fileinput/js/fileinput.js',
      'node_modules/bootstrap-fileinput/js/locales/de.js',
      'node_modules/bootstrap-fileinput/themes/fa/theme.js',
      'node_modules/moment/moment.js',
      'node_modules/moment/locale/de.js',
      'node_modules/drmonty-smartmenus/js/jquery.smartmenus.js',
      'build/javascript/jquery.smartmenus.bootstrap-patched.js',
      'build/javascript/fullcalendar-patched.js',
      'node_modules/fullcalendar/dist/locale/de.js',
      'node_modules/jquery-validation/dist/jquery.validate.js',
      'node_modules/jquery-validation/dist/localization/messages_de.js',
      'node_modules/jquery-validation/dist/localization/methods_de.js',
      'node_modules/simple-timepicker/dist/simple-timepicker.js',
      'frontend/javascript/jc-backoffice.js'
    ]
  };

  const filesForCss = {
    'public/stylesheets/screen.css': [
      'node_modules/fullcalendar/dist/fullcalendar.css',
      'build/stylesheets/less/bootstrap.less',
      'node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker3.css',
      'node_modules/bootstrap-fileinput/css/fileinput.css',
      'build/stylesheets/less/bootstrap-markdown-patched.less',
      'node_modules/font-awesome/css/font-awesome.css',
      'node_modules/node-syntaxhighlighter/lib/styles/shCoreDefault.css',
      'node_modules/drmonty-smartmenus/css/jquery.smartmenus.bootstrap.css',
      'build/stylesheets/flaticon-patched.css',
      'node_modules/select2/dist/css/select2.css',
      'build/stylesheets/less/build-select2-bootstrap.less',
      'build/stylesheets/less/build-awesome-bootstrap-checkbox.less',
      'build/stylesheets/less/jc-backoffice.less'
    ]
  };
  grunt.initConfig({
    clean: {
      build: ['build', 'frontendtests/fixtures/*.html'],
      coverage: ['coverage', 'coverageWithDB', 'karma-coverage'],
      public: ['public/clientscripts', 'public/fonts', 'public/img/bootstrap-colorpicker', 'public/images', 'public/stylesheets'],
      options: {force: true}
    },
    copy: {
      bootstrapFONTS: {
        src: 'node_modules/bootstrap/dist/fonts/*',
        dest: 'public/fonts',
        expand: true,
        flatten: true
      },
      bootstrapLESS: {
        cwd: 'node_modules/bootstrap/less/',
        src: ['**', '!variables.less'],
        dest: 'build/stylesheets/less',
        expand: true,
        flatten: false
      },
      bootstrapCustomVariablesLESS: {
        src: 'node_modules/bootstrap/less/variables.less',
        dest: 'build/stylesheets/less/original-variables.less'
      },
      bootstrapFileinputImages: {
        src: 'node_modules/bootstrap-fileinput/img/*',
        dest: 'public/img/',
        expand: true,
        flatten: true
      },
      bootstrapMarkdownLESS: {
        src: 'node_modules/bootstrap-markdown/less/*',
        dest: 'build/stylesheets/less',
        expand: true,
        flatten: true
      },
      bootstrapSelect2LESS: {
        src: 'node_modules/select2-bootstrap-theme/src/select2-bootstrap.less',
        dest: 'build/stylesheets/less',
        expand: true,
        flatten: true
      },
      awesomeBootstrapCheckboxLESS: {
        src: 'node_modules/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.less',
        dest: 'build/stylesheets/less',
        expand: true,
        flatten: true
      },
      flaticonFONTS: {
        src: 'frontend/additionalIcons/font/*',
        dest: 'public/fonts',
        expand: true,
        flatten: true
      },
      fontawesomeFONTS: {
        src: 'node_modules/font-awesome/fonts/*',
        dest: 'public/fonts',
        expand: true,
        flatten: true
      },
      customJS: {
        cwd: 'frontend/javascript/',
        src: ['*', '!jc-backoffice.js'],
        dest: 'public/clientscripts',
        expand: true,
        flatten: false
      },
      customLESS: {
        src: 'frontend/less/*',
        dest: 'build/stylesheets/less',
        expand: true,
        flatten: true
      }
    },
    patch: {
      smartmenus: {
        options: {
          patch: 'frontend/3rd_party_js/jquery.smartmenus.bootstrap.js.patch'
        },
        files: {
          'build/javascript/jquery.smartmenus.bootstrap-patched.js': 'node_modules/drmonty-smartmenus/js/jquery.smartmenus.bootstrap.js'
        }
      },
      fullcalendar: {
        options: {
          patch: 'frontend/3rd_party_js/fullcalendar.js.patch'
        },
        files: {
          'build/javascript/fullcalendar-patched.js': 'node_modules/fullcalendar/dist/fullcalendar.js'
        }
      },
      flaticon: {
        options: {
          patch: 'frontend/additionalIcons/patchDirectory/flaticon.patch'
        },
        files: {
          'build/stylesheets/flaticon-patched.css': 'frontend/additionalIcons/css/flaticon.css'
        }
      }
    },
    eslint: {
      options: {quiet: true},
      target: ['**/*.js']
    },
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      once: {
        browsers: ['PhantomJS'],
        runnerPort: 6666,
        singleRun: true
      }
    },
    less: {
      development: {
        files: filesForCss
      },
      production: {
        options: {
          plugins: [
            new (require('less-plugin-clean-css'))()
          ],
          report: 'min'
        },
        files: filesForCss
      }
    },
    uglify: {
      development_de: {
        options: {
          mangle: false,
          beautify: true
        },
        files: files_de
      },
      production_de: {
        files: files_de
      }
    },

    mocha_istanbul: {
      test: {
        src: 'test',
        options: {
          coverageFolder: 'coverage',
          timeout: 6000,
          slow: 100,
          mask: '**/*.js',
          root: 'lib',
          reporter: 'dot',
          check: {
            lines: 35,
            statements: 35
          }
        }
      }
    },
    istanbul_check_coverage: {
      server: {
        options: {
          coverageFolder: 'coverage*',
          check: {
            lines: 81,
            statements: 77
          }
        }
      },
      frontend: {
        options: {
          coverageFolder: 'karma-coverage',
          check: {
            lines: 93,
            statements: 93
          }
        }
      }
    },
    pug: {
      compile: {
        options: {
          pretty: true,
          data: function () {
            return require('./frontendtests/fixtures/locals');
          }
        },
        files: {
          'frontendtests/fixtures/forms.html': 'frontendtests/fixtures/forms.pug'
        }
      }
    },
    puglint: {
      standard: {
        options: {
          disallowAttributeInterpolation: true,
          disallowAttributeTemplateString: true,
          disallowDuplicateAttributes: true,
          disallowIdAttributeWithStaticValue: true,
          disallowLegacyMixinCall: true,
          disallowSpaceAfterCodeOperator: true,
          disallowTemplateString: true,
          requireClassLiteralsBeforeAttributes: true,
          requireIdLiteralsBeforeAttributes: true,
          requireLowerCaseTags: true,
          requireStrictEqualityOperators: true,
          validateAttributeQuoteMarks: '\'',
          validateAttributeSeparator: { 'separator': ', ', 'multiLineSeparator': ',\n  ' }
        },
        src: ['**/*.pug']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-patcher');
  grunt.loadNpmTasks('grunt-puglint');

  grunt.registerTask('prepare', ['clean', 'copy', 'patch']);
  grunt.registerTask('frontendtests', ['clean', 'prepare', 'less:development', 'pug', 'uglify:production_de', 'karma:once', 'uglify:development_de', 'karma:once', 'istanbul_check_coverage:frontend']);
  grunt.registerTask('tests', ['eslint', 'puglint', 'mocha_istanbul']);
  grunt.registerTask('deploy_development', ['prepare', 'less:development', 'uglify:development_de']);

  // Default task.
  grunt.registerTask('default', ['tests']);

  grunt.registerTask('deploy_production', ['prepare', 'less:production', 'uglify:production_de']);
};

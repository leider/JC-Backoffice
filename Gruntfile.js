module.exports = function(grunt) {
  /*eslint camelcase: 0*/

  // filesets for uglify
  const files_de = {
    'public/clientscripts/global.js': [
      'node_modules/jquery/dist/jquery.js',
      'node_modules/select2/dist/js/select2.full.js',
      'node_modules/select2/dist/js/i18n/de.js',
      'node_modules/popper.js/dist/umd/popper.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/bootstrap-select/dist/js/bootstrap-select.js',
      'node_modules/bootstrap-select/dist/js/i18n/defaults-de_DE.js',
      'frontend/javascript/jc-backoffice.js'
    ],
    'public/clientscripts/fullcalendar.min.js': [
      'node_modules/@fullcalendar/core/main.js',
      'node_modules/@fullcalendar/core/locales/de.js',
      'node_modules/@fullcalendar/daygrid/main.js',
      'node_modules/@fullcalendar/bootstrap/main.js'
    ],
    'public/clientscripts/fileinput.min.js': [
      'node_modules/bootstrap-fileinput/js/fileinput.js',
      'node_modules/bootstrap-fileinput/js/locales/de.js',
      'node_modules/bootstrap-fileinput/themes/fas/theme.js'
    ],
    'public/clientscripts/bootstrap-markdown.min.js': [
      'node_modules/bootstrap-markdown/js/bootstrap-markdown.js',
      'node_modules/bootstrap-markdown/locale/bootstrap-markdown.de.js'
    ]
  };

  const filesForCss = {
    'public/stylesheets/screen.css': [
      'frontend/3rd_party_css/flaticon-patched.css',
      'node_modules/select2/dist/css/select2.css',
      'build/stylesheets/sass/out/jc-backoffice.css'
    ]
  };

  const filesForFullcalendarCss = {
    'public/stylesheets/fullcalendar.css': [
      'node_modules/@fullcalendar/core/main.css',
      'node_modules/@fullcalendar/daygrid/main.css',
      'node_modules/@fullcalendar/bootstrap/main.css'
    ]
  };

  grunt.initConfig({
    clean: {
      build: ['build', 'frontendtests/fixtures/*.html'],
      coverage: ['coverage', 'coverageWithDB'],
      public: [
        'public/clientscripts',
        'public/fonts',
        'public/img/bootstrap-colorpicker',
        'public/images',
        'public/stylesheets'
      ],
      options: { force: true }
    },
    copy: {
      bootstrapFileinputImages: {
        src: 'node_modules/bootstrap-fileinput/img/*',
        dest: 'public/img/',
        expand: true,
        flatten: true
      },
      utilJS: {
        src: [
          'node_modules/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
          'node_modules/bootstrap-datepicker/dist/locales/bootstrap-datepicker.de.min.js',
          'node_modules/simple-timepicker/dist/simple-timepicker.min.js'
        ],
        dest: 'public/clientscripts',
        expand: true,
        flatten: true
      },
      utilCSS: {
        src: [
          'node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker3.css',
          'node_modules/bootstrap-fileinput/css/fileinput.css'
        ],
        dest: 'public/stylesheets',
        expand: true,
        flatten: true
      },
      flaticonFONTS: {
        src: [
          'frontend/additionalIcons/font/*',
          '!frontend/additionalIcons/font/*css',
          '!frontend/additionalIcons/font/*html'
        ],
        dest: 'public/fonts',
        expand: true,
        flatten: true
      },
      fontawesomeFONTS: {
        src: 'node_modules/@fortawesome/fontawesome-free/webfonts/*',
        dest: 'public/webfonts',
        expand: true,
        flatten: true
      },
      customSASS: {
        src: 'frontend/sass/*',
        dest: 'build/stylesheets/sass',
        expand: true,
        flatten: true
      }
    },
    eslint: {
      options: { quiet: true },
      target: ['*.js', 'lib/**/*.js', 'test/**/*.js', 'frontend/**/*.js']
    },
    sass: {
      dist: {
        files: {
          'build/stylesheets/sass/out/jc-backoffice.css':
            'build/stylesheets/sass/jc-backoffice.scss'
        }
      }
    },
    cssmin: {
      standard: {
        options: {
          level: 2
        },
        files: filesForCss
      },
      fullcalendar: {
        options: {
          level: 2
        },
        files: filesForFullcalendarCss
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
          },
          mochaOptions: ['--exit']
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
      }
    },
    pug: {
      compile: {
        options: {
          pretty: true,
          data: function() {
            return require('./frontendtests/fixtures/locals');
          }
        },
        files: {
          'frontendtests/fixtures/forms.html':
            'frontendtests/fixtures/forms.pug'
        }
      }
    },
    puglint: {
      standard: {
        options: {
          disallowAttributeInterpolation: true,
          disallowAttributeTemplateString: true,
          disallowDuplicateAttributes: true,
          //disallowIdAttributeWithStaticValue: true,
          disallowLegacyMixinCall: true,
          disallowSpaceAfterCodeOperator: true,
          disallowTemplateString: true,
          requireClassLiteralsBeforeAttributes: true,
          requireIdLiteralsBeforeAttributes: true,
          requireLowerCaseTags: true,
          requireStrictEqualityOperators: true,
          validateAttributeQuoteMarks: "'",
          validateAttributeSeparator: {
            separator: ', ',
            multiLineSeparator: ',\n  '
          }
        },
        src: ['**/*.pug']
      }
    }
  });

  process.env.NODE_ICU_DATA = 'node_modules/full-icu'; // necessary for timezone stuff

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-contrib-sassjs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-puglint');

  grunt.registerTask('prepare', ['eslint', 'puglint', 'clean', 'copy']);
  grunt.registerTask('tests', ['eslint', 'puglint', 'mocha_istanbul']);
  grunt.registerTask('deploy_development', [
    'prepare',
    'sass',
    'cssmin',
    'uglify:development_de'
  ]);
  grunt.registerTask('css_only', ['prepare', 'sass', 'cssmin']);

  // Default task.
  grunt.registerTask('default', ['tests']);

  grunt.registerTask('deploy_production', [
    'prepare',
    'sass',
    'cssmin',
    'uglify:production_de'
  ]);
};

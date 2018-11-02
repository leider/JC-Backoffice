/* global moment*/

function germanToEnglishNumberString(string) {
  'use strict';
  if (!string) {
    return;
  }
  return string.replace('.', '').replace(',', '.');
}

/* exported intAmount */
function intAmount(jqueryNumberField) {
  'use strict';
  return parseInt(germanToEnglishNumberString(jqueryNumberField.val()), 10) || 0;
}

/* exported floatAmount */
function floatAmount(jqueryNumberField) {
  'use strict';
  return parseFloat(germanToEnglishNumberString(jqueryNumberField.val()), 10) || 0;
}

/* exported floatAmountForSpan */
function floatAmountForSpan(jquerySpan) {
  'use strict';
  return parseFloat(germanToEnglishNumberString(jquerySpan.html().replace('€', '')), 10) || 0;
}

/* exported setEuro */
function setEuro(jqueryCurrencyField, numberString) {
  /* eslint-disable new-cap */
  'use strict';
  if (!jqueryCurrencyField.length) {
    return;
  }
  var number = Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numberString || 0);
  jqueryCurrencyField.html(number + ' €');
  jqueryCurrencyField.change();
}

/* exported toUtc */
function toUtc(dateString, timeString) {
  'use strict';
  if (dateString && timeString) {
    return moment.utc(dateString + ' ' + timeString, 'D.M.YYYY H:m');
  }
  return null;
}

function surroundWithLink(text) {
  'use strict';

  // shamelessly stolen from http://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
  var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
  return text.replace(urlRegex, function (url) {
    return '<a href="' + url + '" target="_blank">' + '<i class="fa fa-external-link"/> ' + url + '</a>';
  });
}

function surroundTwitterName(twittername) {
  'use strict';

  if (twittername.trim().length === 0) {
    return twittername;
  }
  return '<a href="http://twitter.com/' + twittername + '" target="_blank">@' + twittername + '</a>';
}

function surroundEmail(email) {
  'use strict';

  return '<a href="mailto:' + email + '">' + email + '</a>';
}

function surroundTel(tel) {
  'use strict';
  return '<a href="tel:' + tel + '"> ' + tel + '</a>';
}

/* exported veranstaltungDateModel */
function veranstaltungDateModel(initialDate, initialTime) {
  'use strict';

  var oldStartDate = toUtc(initialDate, initialTime);

  return {
    determineNewEnd: function (startDate, startTime, endDate, endTime) {
      var start = toUtc(startDate, startTime);
      var end = toUtc(endDate, endTime);

      var offset = oldStartDate && start ? start.diff(oldStartDate, 'minutes') : 0;
      oldStartDate = start;
      var endMoment = end ? end.add(offset, 'minutes') : null;
      return {
        endDate: (endMoment ? endMoment.format('DD.MM.YYYY') : ''),
        endTime: (endMoment ? endMoment.format('HH:mm') : '')
      };
    }
  };
}

/* exported dateAdapter */
function dateAdapter(startDate, startTime, endDate, endTime) {
  'use strict';
  var dateCalc = veranstaltungDateModel(startDate.val(), startTime.val());

  function listener() {
    var endStrings = dateCalc.determineNewEnd(startDate.val(), startTime.val(), endDate.val(), endTime.val());

    endDate.datepicker('update', (endStrings.endDate));
    endTime.timepicker('setTime', endStrings.endTime);
    endDate.datepicker('update', (endStrings.endDate)); // to have the change fired correctly on date field
  }

  startDate.change(listener);
  startTime.change(listener);
}

(function () {
  'use strict';

  function highlightCurrentSection() {
    $('[data-jcnav]').filter(function () {
      return new RegExp('^/' + $(this).attr('data-jcnav')).test(window.location.pathname);
    }).addClass('active');
  }

  function initCalendar() {
    $('#calendar').each(function () {
      $(this).fullCalendar({
        height: 'auto',
        header: {
          left: 'title',
          center: '',
          right: 'prev,today,next'
        },
        timezone: 'Europe/Berlin',
        timeFormat: 'HH:mm',
        displayEventTime: false,
        events: '/veranstaltungen/eventsForCalendar',
        eventMouseover: function (event) {
          var day = event.start.day();
          $(this).tooltip({
            title: (event.start.format('HH:mm') + ': ') + event.tooltip,
            trigger: 'manual',
            placement: (day < 4 && day > 0) ? 'right' : 'left',
            container: 'body'
          });
          $(this).tooltip('show');
        },
        eventMouseout: function () {
          $(this).tooltip('dispose');
        },
        eventClick: function () {
          $(this).tooltip('dispose');
        },
        themeSystem: 'bootstrap4',
        views: {
          month: {
            titleFormat: 'MMM \'YY',
            lang: 'de',
            fixedWeekCount: false
          }
        },
        weekNumbers: true
      });
    });
  }

  function addHelpButtonToTextarea() {
    $('.md-textarea').each(function () {
      $(this).markdown({
          additionalButtons: [[{
            name: 'groupCustom',
            data: [{
              name: 'cmdHelp',
              title: 'Hilfe',
              icon: 'fa fa-question-circle',
              callback: function () { $('#cheatsheet').modal(); }
            }]
          }]],
          onPreview: function (e) {
            $.post('/preview', {
                data: e.getContent(),
                subdir: ($('[name=subdir]').val() || $('[name=assignedGroup]').val() || $('[name=id]').val()),
                '_csrf': $('[name=_csrf]').val()
              },
              function (data) { e.$element.parent().find('.md-preview').html(data); });
            return ''; // to clearly indicate the loading...
          },
          iconlibrary: 'fa',
          language: 'de',
          resize: 'vertical'
        }
      );
    });
    $('.md-header .btn-default').removeClass('btn-default').addClass('btn-light');
    $('.md-header .fa').removeClass('fa').addClass('fas');
    $('.md-header .fa-header').removeClass('fa-header').addClass('fa-heading');
    $('.md-header .fa-picture-o').removeClass('fa-picture-o fas').addClass('fa-image far');
  }

  function initPickersAndWidgets() {
    $('.datepicker').each(function () {
      $(this).datepicker({
        autoclose: true,
        format: 'dd.mm.yyyy',
        weekStart: 1,
        viewMode: 'days',
        minViewMode: 'days',
        language: 'de',
        orientation: 'bottom'
      });
    });

    $('.timepicker').each(function () {
      $(this).timepicker({
        template: false,
        minuteStep: 15,
        showSeconds: false,
        showMeridian: false
      });
    });

    $('.enhance').each(function () {
      $(this).select2({
        width: null,
        containerCssClass: ':all:',
        minimumResultsForSearch: Infinity
      });
    });

    $('.trim-text').on('blur', function () {
      $(this).val($(this).val().trim());
    });

    $(':checkbox').each(function () {
      $(this).change(function () {
        $(this).parent().toggleClass('checkbox-success');
      });
    });

    var btns = '<button type="button" class="kv-cust-btn btn btn-sm btn-kv btn-default btn-outline-secondary" title="Download" data-key="{dataKey}">' +
      '<i class="fa fa-download"></i>' +
      '</button>';
    // note the tag/token {dataKey}
    $('.file-loading').each(function () {
      $(this).fileinput({
        otherActionButtons: btns,
      });
    });
    $('.kv-cust-btn').each(function () {
      $(this).click(function () {
        var url = $(this).parents('.file-thumbnail-footer').parent().children('.kv-file-content').children().attr('src');
        window.open(url);
      });
    });

  }

  function initTooltipsAndHovers() {
    $('.tooltiplabel').each(function () {
      $(this).tooltip();
    });
    $('[data-toggle="tooltip"]').each(function () {
      $(this).tooltip();
    });
  }

  function createLinks() {
    $('.urlify').each(function () {
      $(this).html(surroundWithLink(this.innerHTML));
    });

    $('.twitterify').each(function () {
      $(this).html(surroundTwitterName(this.innerHTML));
    });

    $('.mailtoify').each(function () {
      $(this).html(surroundEmail(this.innerHTML));
    });
    $('.telify').each(function () {
      $(this).html(surroundTel(this.innerHTML));
    });
  }

  function toggleCaret() {
    $('a.chevron').click(function () {
      $(this).find('i').toggleClass('fa-caret-square-down fa-caret-square-right');
    });
  }

  $(document).ready(highlightCurrentSection);
  $(document).ready(initPickersAndWidgets);
  $(document).ready(addHelpButtonToTextarea);
  $(document).ready(initTooltipsAndHovers);
  $(document).ready(createLinks);
  $(document).ready(initCalendar);
  $(document).ready(toggleCaret);
  $.fn.select2.defaults.set('theme', 'bootstrap');
}());

/* global URI, moment */

/* exported eurAmount */
function eurAmount(jqueryCurrencyField) {
  'use strict';
  return parseFloat(jqueryCurrencyField.autoNumeric('get'), 10) || 0;
}

/* exported intAmount */
function intAmount(jqueryNumberField) {
  'use strict';
  return parseInt(jqueryNumberField.val().replace(',', '.'), 10) || 0;
}

/* exported floatAmount */
function floatAmount(jqueryNumberField) {
  'use strict';
  return parseFloat(jqueryNumberField.val().replace(',', '.'), 10) || 0;
}

/* exported setEuro */
function setEuro(jqueryCurrencyField, euro) {
  'use strict';
  jqueryCurrencyField.autoNumeric('set', euro);
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
  var urlRegex = /(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig;
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
    var result = URI.parse(window.location.href); // full URL
    $('[data-jcnav]').filter(function () {
      return new RegExp('^\/' + $(this).attr('data-jcnav')).test(result.path);
    }).addClass('active');
  }

  function adaptScrollableBox() {
    var h = $(window).height();
    var padtop = parseInt($('body').css('padding-top'), 10);
    var padbottom = parseInt($('body').css('padding-bottom'), 10);
    var otherElementsHeight = 120;
    $('.scrollable-box').css('maxHeight', Math.max(h - (padtop + padbottom + otherElementsHeight), 250) + 'px');
    $('.scrollable-box').css('margin-bottom', '0px');
    $('.scrollable-box').css('overflow-y', 'scroll');
  }

  function initCalendar() {
    var id = '#calendar';
    $(id).fullCalendar({
      height: 'auto',
      header: {
        left: 'title',
        center: '',
        right: 'prev,today,next'
      },
      timezone: 'Europe/Berlin',
      events: '/veranstaltungen/eventsForCalendar',
      eventMouseover: function (event) {
        var day = event.start.day();
        $(this).tooltip({
          title: (event.start.format('HH:mm') + ': ') + event.tooltip,
          trigger: 'manual',
          placement: (day < 4 && day > 0) ? 'right' : 'left',
          container: 'body',
          template: '<div class="tooltip" role="tooltip" style="max-width: 130px"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });
        $(this).tooltip('show');
      },
      eventMouseout: function () {
        $(this).tooltip('destroy');
      },
      eventClick: function () {
        $(this).tooltip('destroy');
      },
      bootstrap: true,
      buttonIcons: {
        prev: 'fa-caret-left',
        next: 'fa-caret-right'
      },
      views: {
        month: {
          titleFormat: 'MMM \'YY',
          lang: 'de',
          fixedWeekCount: false
        }
      },
      weekNumbers: true
    });
  }

  function patchBootstrapPopover() {
    var originalLeave = $.fn.popover.Constructor.prototype.leave;
    $.fn.popover.Constructor.prototype.leave = function (obj) {
      var self = obj instanceof this.constructor ? obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type);
      var container, timeout;

      originalLeave.call(this, obj);

      if (obj.currentTarget) {
        container = $('.popover');
        timeout = self.timeout;
        container.one('mouseenter', function () {
          //We entered the actual popover – call off the dogs
          clearTimeout(timeout);
          //Let's monitor popover content instead
          container.one('mouseleave', function () {
            $.fn.popover.Constructor.prototype.leave.call(self, self);
          });
        });
      }
    };
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
              callback: function () { $('#cheatsheet').modal({remote: '/cheatsheet.html'}); }
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
  }

  function initPickersAndWidgets() {
    $('.datepicker').datepicker({
      autoclose: true,
      format: 'dd.mm.yyyy',
      weekStart: 1,
      viewMode: 'days',
      minViewMode: 'days',
      language: 'de',
      orientation: 'bottom'
    });

    $('.timepicker').timepicker({
      template: false,
      minuteStep: 15,
      showSeconds: false,
      showMeridian: false
    });

    $('.enhance').each(function () {
      /* eslint no-console: 0 */
      $(this).select2({
        width: null,
        containerCssClass: ':all:',
        minimumResultsForSearch: Infinity
      });
    });

    $('.trim-text').on('blur', function () {
      $(this).val($(this).val().trim());
    });

    $('.currency').each(function () {
      $(this).autoNumeric('init');
    });
    $(':checkbox').each(function() {
      $(this).change(function() {
        $(this).parent().toggleClass('checkbox-success');
      });
    });
  }

  function initTooltipsAndHovers() {
    $('.tooltiplabel').each(function () {
      $(this).tooltip();
    });
    $('[data-toggle="tooltip"]').tooltip({
      container: 'body',
      placement: 'auto top',
      viewport: '.container-fluid'
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
  }

  patchBootstrapPopover();
  $.event.add(window, 'resize', adaptScrollableBox);
  $(document).ready(highlightCurrentSection);
  $(document).ready(adaptScrollableBox);
  $(document).ready(initPickersAndWidgets);
  $(document).ready(addHelpButtonToTextarea);
  $(document).ready(initTooltipsAndHovers);
  $(document).ready(createLinks);
  $(document).ready(initCalendar);
  $.fn.select2.defaults.set( 'theme', 'bootstrap' );
}());

/*global URI, moment*/


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
      startDate: moment().format('DD.MM.YYYY'),
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
      $(this).select2({theme: 'bootstrap'});
    });

    $('.trim-text').on('blur', function () {
      $(this).val($(this).val().trim());
    });
  }

  function initTooltipsAndHovers() {
    $('.tooltiplabel').each(function () {
      $(this).tooltip();
    });
  }



  patchBootstrapPopover();
  $.event.add(window, 'resize', adaptScrollableBox);
  $(document).ready(highlightCurrentSection);
  $(document).ready(adaptScrollableBox);
  $(document).ready(initPickersAndWidgets);
  $(document).ready(addHelpButtonToTextarea);
  $(document).ready(initTooltipsAndHovers);
}());

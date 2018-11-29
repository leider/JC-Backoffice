/*global toUtc*/

// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var veranstaltung_validator;
(function () {
  'use strict';

  $(document).ready(function () {
    function validateDateAndTime() {
      var startDate = $('#veranstaltungform [name=startDate]').val();
      var startTime = $('#veranstaltungform [name=startTime]').val();
      var endDate = $('#veranstaltungform [name=endDate]').val();
      var endTime = $('#veranstaltungform [name=endTime]').val();

      var start = toUtc(startDate, startTime);
      var end = toUtc(endDate, endTime);
      return endDate !== '' && endTime !== '' && end && start && end.getTime() - start.getTime() > 0;
    }

    $.validator.addMethod('dateAndTime', validateDateAndTime, 'Das Ende muss gefüllt sein und nach dem Beginn liegen.');

  });

  function initValidator() {
    veranstaltung_validator = $('#veranstaltungform').validate({
      rules: {
        url: {
          required: true,
          remote: {
            url: '/veranstaltungen/checkurl',
            data: {
              previousUrl: function () {
                return $('#veranstaltungform [name=previousUrl]').val();
              }
            }
          }
        },
        'kosten[gagenEUR]': {number: true},
        'kosten[agenturEUR]': {number: true},
        'eintrittspreise[regulaer]': {number: true},
        'eintrittspreise[rabattErmaessigt]': {number: true},
        'eintrittspreise[rabattMitglied]': {number: true},
        'eintrittspreise[ermaessigt]': {number: true},
        'eintrittspreise[mitglied]': {number: true},
        'eintrittspreise[zuschuss]': {number: true},
        'agentur[email]': {
          email: true
        },
        'kopf[titel]': 'required',
        'kopf[ort]': 'required',
        startDate: 'required',
        startTime: 'required',
        endDate: 'dateAndTime',
        endTime: 'dateAndTime'
      },
      messages: {
        url: {
          remote: $.validator.format('Diese URL ist leider nicht verfügbar.')
        }
      },
      errorPlacement: function (error, element) {
        if (element.attr('name') === 'endDate' || element.attr('name') === 'endTime') {
          error.insertAfter('#dates');
        } else if (element.hasClass('currency')) {
          error.insertAfter(element.parent());
        } else {
          error.insertAfter(element);
        }
      },
      errorElement: 'span',
      errorClass:
        'help-block text-danger',
      highlight:

        function (element) {
          if ($(element).attr('name') === 'endDate' || $(element).attr('name') === 'endTime') {
            $('#veranstaltungform [name=endDate]').addClass('is-invalid');
            $('#veranstaltungform [name=endTime]').addClass('is-invalid');

            $('#dates').parent().addClass('has-error');
          } else {
            $(element).addClass('is-invalid');
          }
        }

      ,
      unhighlight: function (element) {
        if ($(element).attr('name') === 'endDate' || $(element).attr('name') === 'endTime') {
          $('#veranstaltungform [name=endDate]').removeClass('is-invalid');
          $('#veranstaltungform [name=endTime]').removeClass('is-invalid');
        } else {
          $(element).removeClass('is-invalid');
        }
      }
    });

    $('#veranstaltungform [name=endDate]').datepicker().on('changeDate', function () {
      veranstaltung_validator.element($('#veranstaltungform [name=endDate]'));
    });

    veranstaltung_validator.form();

    function handler(each) {
      return function () {
        veranstaltung_validator.element(each);
      };
    }

    ['.currency', '#veranstaltungform [name="kopf[titel]"]', '#veranstaltungform [name="kopf[ort]"]', '#veranstaltungform [name=startDate]', '#veranstaltungform [name=startTime]',
      '#veranstaltungform [name=endDate]', '#veranstaltungform [name=endTime]', '#veranstaltungform [name=url]', '#veranstaltungform [name="agentur[email]"]'].forEach(
      function (each) {
        $(each).on('change', handler(each));
        $(each).keyup(handler(each));
      }
    );
  }

  $(document).ready(initValidator);
}());

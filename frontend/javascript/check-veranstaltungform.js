/*global veranstaltungDateModel*/

// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var veranstaltung_validator;
(function () {
  'use strict';

  $(document).ready(function () {

    var validateDateAndTime = function () {
      var startDate = $('#veranstaltungform [name=startDate]').val();
      var startTime = $('#veranstaltungform [name=startTime]').val();
      var endDate = $('#veranstaltungform [name=endDate]').val();
      var endTime = $('#veranstaltungform [name=endTime]').val();
      var dateAndTime = veranstaltungDateModel(startDate, startTime).convertInputs(startDate, startTime, endDate, endTime);
      return endDate !== '' && endTime !== '' && dateAndTime.end.diff(dateAndTime.start, 'minutes') > 0;
    };

    $.validator.addMethod('dateAndTime', validateDateAndTime, 'Das Ende muss gefüllt sein und nach dem Beginn liegen.');

  });

  function initValidator() {

    // DO NOT FORGET TO KEEP THIS FILE IN SYNC WITH /lib/commons/validation.js

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
        'kontakt[email]': {
          email: true
        },
        titel: 'required',
        ort: 'required',
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
        } else {
          error.insertAfter(element);
        }
      },
      errorElement: 'span',
      errorClass: 'help-block',
      highlight: function (element) {
        if ($(element).attr('name') === 'endDate' || $(element).attr('name') === 'endTime') {
          $('#dates').parent().addClass('has-error');
        } else {
          $(element).parent().addClass('has-error');
        }
      },
      unhighlight: function (element) {
        if ($(element).attr('name') === 'endDate' || $(element).attr('name') === 'endTime') {
          $('#dates').parent().removeClass('has-error');
        } else {
          $(element).parent().removeClass('has-error');
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

    ['#veranstaltungform [name=titel]', '#veranstaltungform [name=ort]', '#veranstaltungform [name=startDate]', '#veranstaltungform [name=startTime]',
      '#veranstaltungform [name=endDate]', '#veranstaltungform [name=endTime]', '#veranstaltungform [name=url]', '#veranstaltungform [name="kontakt[email]"]'].forEach(
      function (each) {
        $(each).on('change', handler(each));
        $(each).keyup(handler(each));
      }
    );
  }

  $(document).ready(initValidator);
}());

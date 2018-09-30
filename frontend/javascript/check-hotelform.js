// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var hotel_validator;
(function () {
  'use strict';

  function initValidator() {

    hotel_validator = $('#hotelform').validate({
      rules: {
        'unterkunft[einzelEUR]': {number: true},
        'unterkunft[doppelEUR]': {number: true},
        'unterkunft[suiteEUR]': {number: true},
        'unterkunft[transportEUR]': {number: true}
      },

      errorPlacement: function (error, element) {
        if (element.hasClass('currency')) {
          error.insertAfter(element.parent());
        } else {
          error.insertAfter(element);
        }
      },
      errorElement: 'span',
      errorClass: 'help-block text-danger',
      highlight: function (element) { $(element).addClass('is-invalid'); },
      unhighlight: function (element) { $(element).removeClass('is-invalid'); }
    });

    hotel_validator.form();

    function handler(each) {
      return function () {
        hotel_validator.element(each);
      };
    }

    ['.currency'].forEach(
      function (each) {
        $(each).on('change', handler(each));
        $(each).keyup(handler(each));
      }
    );
  }

  $(document).ready(initValidator);
}());

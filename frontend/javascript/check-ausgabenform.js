// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var ausgaben_validator;
(function () {
  'use strict';

  function initValidator() {
    ausgaben_validator = $('#ausgabenform').validate({
      rules: {
        'kosten[backlineEUR]': {number: true},
        'kosten[technikAngebot1EUR]': {number: true},
        'kosten[saalmiete]': {number: true},
        'kosten[werbung1]': {number: true},
        'kosten[werbung2]': {number: true},
        'kosten[werbung3]': {number: true},
        'kosten[personal]': {number: true},
        'kosten[gagenEUR]': {number: true}
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
      highlight: function (element) {$(element).addClass('is-invalid');},
      unhighlight: function (element) {$(element).removeClass('is-invalid');}
    });

    ausgaben_validator.form();

    function handler(each) {
      return function () {
        ausgaben_validator.element(each);
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

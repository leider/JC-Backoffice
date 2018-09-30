// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var ausgaben_validator;
(function () {
  'use strict';

  function initValidator() {

    ausgaben_validator = $('#kasseform').validate({
      rules: {
        'kasse[reservixBruttoEUR]': {number: true},
        'kasse[reservixNettoEUR]': {number: true},
        'kasse[einnahmeTicketsEUR]': {number: true},
        'kasse[einnahmeBankEUR]': {number: true},
        'kasse[einnahmeSonstiges1EUR]': {number: true},
        'kasse[einnahmeSonstiges2EUR]': {number: true},
        'kasse[anfangsbestandEUR]': {number: true},
        'kasse[ausgabeGageEUR]': {number: true},
        'kasse[ausgabeCateringEUR]': {number: true},
        'kasse[ausgabeHelferEUR]': {number: true},
        'kasse[ausgabeSonstiges1EUR]': {number: true},
        'kasse[ausgabeSonstiges2EUR]': {number: true},
        'kasse[ausgabeSonstiges3EUR]': {number: true},
        'kasse[ausgabeBankEUR]': {number: true}
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

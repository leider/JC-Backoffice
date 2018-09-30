// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var ausgaben_validator;
(function () {
  'use strict';

  function initValidator() {
    ausgaben_validator = $('#ausgabenform').validate({
      rules: {
        'kosten[backlineEUR]': {number: true},
        'kosten[technikAngebot1EUR]': {number: true},
        'kosten[technikAngebot2EUR]': {number: true},
        'kosten[saalmiete]': {number: true},
        'staff[technikerEUR]': {number: true},
        'staff[kasseEUR]': {number: true},
        'staff[merchandiseEUR]': {number: true},
        'staff[fremdpersonalEUR]': {number: true},
        'werbung[plakat1EUR]': {number: true},
        'werbung[plakat2EUR]': {number: true},
        'werbung[genehmigungenEUR]': {number: true},
        'werbung[flyerEUR]': {number: true},
        'werbung[layoutingEUR]': {number: true}
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

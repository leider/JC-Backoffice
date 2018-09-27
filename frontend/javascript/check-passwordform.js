// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var user_validator;
(function () {
  'use strict';

  function initValidator() {

    user_validator = $('#passwordform').validate({
      rules: {
        passwort: {
          required: true,
          minlength: 5
        },
        passwort1: {
          required: true,
          minlength: 5,
          equalTo: '#passwort'
        }
      },
      errorPlacement: function (error, element) { error.insertAfter(element); },
      errorElement: 'span',
      errorClass: 'help-block text-danger',
      highlight: function (element) { $(element).addClass('is-invalid'); },
      unhighlight: function (element) { $(element).removeClass('is-invalid'); }
    });

    user_validator.form();

    function handler(each) {
      return function () {
        user_validator.element(each);
      };
    }

    ['#userform [name=passwort]', '#userform [name=passwort1]'].forEach(
      function (each) {
        $(each).change(handler(each));
        $(each).keyup(handler(each));
      }
    );
  }

  $(document).ready(initValidator);
}());

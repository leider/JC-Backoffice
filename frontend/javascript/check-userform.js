// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var user_validator;
(function () {
  'use strict';

  function initValidator() {

    // DO NOT FORGET TO KEEP THIS FILE IN SYNC WITH /lib/commons/validation.js

    user_validator = $('#userform').validate({
      rules: {
        username: 'required',
      },
      errorPlacement: function (error, element) {
        error.insertAfter(element);
      },
      errorElement: 'span',
      errorClass: 'help-block',
      highlight: function (element) {
        $(element).parent().addClass('has-error');
      },
      unhighlight: function (element) {
        $(element).parent().removeClass('has-error');
      }
    });

    user_validator.form();

    function handler(each) {
      return function () {
        user_validator.element(each);
      };
    }

    ['#userform [name=username]'].forEach(
      function (each) {
        $(each).on('change', handler(each));
        $(each).keyup(handler(each));
      }
    );
  }

  $(document).ready(initValidator);
}());

// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var ausgaben_validator;
(function () {
  'use strict';

  function initValidator() {

    ausgaben_validator = $('#kasseform').validate({
      errorPlacement: function (error, element) { error.insertAfter(element); },
      errorElement: 'span',
      errorClass: 'help-block text-danger',
      highlight: function (element) { $(element).addClass('is-invalid'); },
      unhighlight: function (element) { $(element).removeClass('is-invalid'); }
    });

    ausgaben_validator.form();
  }

  $(document).ready(initValidator);
}());

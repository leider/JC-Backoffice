// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var optionen_validator;
(function () {
  'use strict';

  function initValidator() {

    optionen_validator = $('#optionenform').validate({
      errorPlacement: function (error, element) { error.insertAfter(element); },
      errorElement: 'span',
      errorClass: 'help-block text-danger',
      highlight: function (element) { $(element).addClass('is-invalid'); },
      unhighlight: function (element) { $(element).removeClass('is-invalid'); }
    });

    optionen_validator.form();
  }

  $(document).ready(initValidator);
}());

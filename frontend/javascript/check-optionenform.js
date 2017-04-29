// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var optionen_validator;
(function () {
  'use strict';

  function initValidator() {

    optionen_validator = $('#optionenform').validate({
      errorPlacement: function (error, element) { error.insertAfter(element); },
      errorElement: 'span',
      errorClass: 'help-block',
      highlight: function (element) { $(element).parent().addClass('has-error'); },
      unhighlight: function (element) { $(element).parent().removeClass('has-error'); }
    });

    optionen_validator.form();
  }

  $(document).ready(initValidator);
}());

// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var ausgaben_validator;
(function () {
  'use strict';

  function initValidator() {

    ausgaben_validator = $('#kasseform').validate({
      errorPlacement: function (error, element) { error.insertAfter(element); },
      errorElement: 'span',
      errorClass: 'help-block',
      highlight: function (element) { $(element).parent().addClass('has-error'); },
      unhighlight: function (element) { $(element).parent().removeClass('has-error'); }
    });

    ausgaben_validator.form();
  }

  $(document).ready(initValidator);
}());

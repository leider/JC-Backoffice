// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var mailrule_validator;
(function () {
  'use strict';

  function initValidator() {

    mailrule_validator = $('#mailruleform').validate({
      errorPlacement: function (error, element) { error.insertAfter(element); },
      errorElement: 'span',
      errorClass: 'help-block',
      highlight: function (element) { $(element).parent().addClass('has-error'); },
      unhighlight: function (element) { $(element).parent().removeClass('has-error'); }
    });

    mailrule_validator.form();
  }

  $(document).ready(initValidator);
}());

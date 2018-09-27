// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var mailrule_validator;
(function () {
  'use strict';

  function initValidator() {

    mailrule_validator = $('#mailruleform').validate({
      errorPlacement: function (error, element) { error.insertAfter(element); },
      errorElement: 'span',
      errorClass: 'help-block text-danger',
      highlight: function (element) { $(element()).addClass('is-invalid'); },
      unhighlight: function (element) { $(element()).removeClass('is-invalid'); }
    });

    mailrule_validator.form();
  }

  $(document).ready(initValidator);
}());

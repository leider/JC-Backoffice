// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var hotel_validator;
(function () {
  'use strict';

  function initValidator() {

    hotel_validator = $('#hotelform').validate({
      errorPlacement: function (error, element) { error.insertAfter(element); },
      errorElement: 'span',
      errorClass: 'help-block text-danger',
      highlight: function (element) { $(element).addClass('is-invalid'); },
      unhighlight: function (element) { $(element).removeClass('is-invalid'); }
    });

    hotel_validator.form();
  }

  $(document).ready(initValidator);
}());

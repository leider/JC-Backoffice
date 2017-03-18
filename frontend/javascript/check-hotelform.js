// THE ORIGINAL OF THIS FILE IS IN frontend/javascript

var hotel_validator;
(function () {
  'use strict';

  function initValidator() {

    hotel_validator = $('#hotelform').validate({
      errorPlacement: function (error, element) { error.insertAfter(element); },
      errorElement: 'span',
      errorClass: 'help-block',
      highlight: function (element) { $(element).parent().addClass('has-error'); },
      unhighlight: function (element) { $(element).parent().removeClass('has-error'); }
    });

    hotel_validator.form();
  }

  $(document).ready(initValidator);
}());
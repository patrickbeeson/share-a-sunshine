// Main.js

Stripe.setPublishableKey('pk_test_7MmO7bkJvlkV0TfD1YfFcnVf');

var csrftoken = $('meta[name=csrf-token]').attr('content');
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken)
        }
    }
});

var stripeResponseHandler = function(status, response) {
    var $form = $('#purchase_form');

    if (response.error) {
        // Show the errors on the form
        $form.find('.payment-errors').text(response.error.message);
        $form.find('input').prop('disabled', false);
    } else {
        // token contains id, last4, and card type
        var token = response.id;
        // Insert the token into the form so it gets submitted to the server
        $form.append($('<input type="hidden" name="stripeToken">').val(token));
        // and re-submit
        $form.get(0).submit();
    }
};

$( document ).ready(function() {

    // Hide coupon code form on load
    var couponCodeForm = $('#coupon_code_wrapper').hide();

    // Reveal the coupon code form if link is clicked
    $('.coupon_code_reveal').click(function(e) {
        e.preventDefault();
        $(couponCodeForm).toggle();
    });

    // Payment form formatting via jQuery Payments
    $('.cc-number').payment('formatCardNumber');
    $('.cc-exp').payment('formatCardExpiry');
    $('.cc-cvc').payment('formatCardCVC');

    // Function to add class to payment fields for error reporting
    $.fn.toggleInputError = function(erred) {
        this.parent('.form-group').toggleClass('has-error', erred);
        return this;
    };

    // Set variable for tracking coupon usage
    var couponApplied = false;

    // Payment form submission function
    $('#purchase_form').submit(function(e) {
        var $form = $(this);
        // Disable the submit button to prevent repeated clicks
        $form.find('button').prop('disabled', false);
        // Create the token if a coupon has not been used
        if (!couponApplied) {
            e.preventDefault();

            // Validation
            var cardType = $.payment.cardType($('.cc-number').val());
            $('.cc-number').toggleInputError(!$.payment.validateCardNumber($('.cc-number').val()));
            $('.cc-exp').toggleInputError(!$.payment.validateCardExpiry($('.cc-exp').payment('cardExpiryVal')));
            $('.cc-cvc').toggleInputError(!$.payment.validateCardCVC($('.cc-cvc').val(), cardType));

            $('.validation').removeClass('text-danger text-success');
            $('.validation').addClass($('.has-error').length ? 'text-danger' : 'text-success');

            // Break up the expiration date into month and year values
            var exp = $('.cc-exp').val().split(' / ');
            Stripe.card.createToken({
                number: $('.cc-number').val(),
                cvc: $('.cc-cvc').val(),
                exp_month: exp[0],
                exp_year: exp[1]
                },
                stripeResponseHandler
            );
        }
        return couponApplied;
    });

    // Coupon code form submission function
    $('#couponcode_form').submit(function() {
        // Grab the code from the field
        var code = $('#coupon_code').val();

        $.ajax({
            data: JSON.stringify({
                code: code
            }),
            url: '/code_validate',
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function(json) {
                // Add classes for styling based on response
                if (json.response.toLowerCase() == 'code accepted!') {
                    $(".validation_response").addClass('valid');
                } else if (json.response.toLowerCase() == 'code already used!' || json.response.toLowerCase() == 'invalid or missing code!') {
                    $(".validation_response").addClass('invalid');
                }
                $(".validation_response").text(json.response);
                $(".code_redemption").text(json.price);
                // Set codeApplied variable if coupon is redeemed
                if (json.code_applied === true) {
                    couponApplied = true;
                    $("#coupon_used").val(couponApplied);
                    $("#payment").remove();
                }
            },
            error: function(request, errorType, errorMessage) {
                console.log(errorType +  ": " + errorMessage);
            }
        });

        return false;
    });

    // If prefilled message is selected, populate it in the textfield
    $('.prefilled_message button').click(function() {
        // Grab the prefilled message text
        var prefilled_message = $(this).parent().find('.message').text();
        // Find our textarea
        var custom_message = $('#personal_message')

        //Insert the prefilled message into the textarea
        $(custom_message).val(prefilled_message).blur();

        // Send the user to the message area with some offset to account for the header
        $(document).scrollTop( $("#message").offset().top - 100 );
    });
});

// Main.js


// If prefilled message is selected, populate it in the textfield
$( document ).ready(function() {
    $('.prefilled_message button').click(function() {
        var prefilled_message = $(this).parent().find('.message').text();
        var custom_message = $('#personal_message')
        $(custom_message).val(prefilled_message).blur();

        $(document).scrollTop( $("#message").offset().top - 100 );
    });
});
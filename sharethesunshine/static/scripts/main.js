// Main.js


// If prefilled message is selected, populate it in the textfield
$( document ).ready(function() {
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
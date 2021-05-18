$(document).ready(function() {
  $('.logLink').click(function() {
    $('#loginSection').show();
    $('.nonVisible').show();
  });
  $('.x').click(function() {
    $('#loginSection').hide();
    $('.nonVisible').hide();
  });
});

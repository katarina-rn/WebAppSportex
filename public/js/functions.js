$(document).ready(function() {
  $('.logLink').click(function() {
    $('#loginSection').show();
    $('.nonVisible').show();
  });
  $('.x').click(function() {
    $('#loginSection').hide();
    $('.nonVisible').hide();
  });
  $('.modalBtn').click(function() {
    $('#messModal').modal('show');
  });
  $('.modalAddBtn').click(function() {
    $('#addModal').modal('show');
  });
  $('.close').click(function() {
    $('#addModal').modal('hide');
  });
});

$(document).ready(function() {
  $('.logLink').click(function() {
    $('#loginSection').show();
    $('.nonVisible').show();
  });
  $('.x').click(function() {
    $('#loginSection').hide();
    $('.nonVisible').hide();
  });
  $('.addItemForm').on("submit", function(e) {
    var _form = this;
    var f = $(this);
    e.preventDefault();
    let isLoggedIn = $(".isAuthenticated").val();
    let quantity = f.find("input[name=value]").val();
    if (isLoggedIn === undefined || isLoggedIn === null || isLoggedIn === "false") {
      alert('Morate biti ulogovani da biste dodali proizvod');
      return false;
    }else{
      if(quantity === "" || !$.isNumeric(quantity)){
        alert("Kolicina nije validna");
        return false;
      }
      _form.submit();
    }
  });
  $(".contactForm").on("submit", function(e){
    e.preventDefault();
    if($("#inputName").val() === ""){
      alert("Morate uneti ime i prezime");
      return false;
    }
    if($("#inputEmail").val() === ""){
      alert("Morate uneti email");
      return false;
    }
    if($("#inputPhoneNumber").val() === ""){
      alert("Morate uneti boj telefona");
      return false;
    }
    if($("#inputMessage").val() === ""){
      alert("Morate uneti poruku");
      return false;
    }
    this.submit();
    alert("Poruka je uspesno poslata");
  });
  $(".addCustomer").on("submit", function(e){
    e.preventDefault();
    if($("#customerName").val() === ""){
      alert("Morate uneti naziv narucioca");
      return false;
    }
    if($("#customerEmail").val() === ""){
      alert("Morate uneti email narucioca");
      return false;
    }
    if($("#customerTelephone").val() === ""){
      alert("Morate uneti boj telefona narucioca");
      return false;
    }
    if($("#customerAdress").val() === ""){
      alert("Morate uneti adresu narucioca");
      return false;
    }
    if($("#customerPIB").val() === ""){
      alert("Morate uneti PIB narucioca");
      return false;
    }
    alert("Uspesno ste dodali narucioca");
    this.submit();
  });
  $(".addProductForm").on("submit", function(e){
    e.preventDefault();
    if($("#productName").val() === ""){
      alert("Morate uneti naziv proizvoda");
      return false;
    }
    if($("#productBrand").val() === ""){
      alert("Morate uneti brend proizvoda");
      return false;
    }
    var price = $("#productPrice").val();
    if(price === "" || !$.isNumeric(price)){
      alert("Cena nije validna");
      return false;
    }
    var pricePDV = $("#productPricePDV").val();
    if(pricePDV === "" || !$.isNumeric(pricePDV)){
      alert("Cena nije validna");
      return false;
    }
    var fileName;
    if($('#file')[0].files.length === 0){
      alert("Morate uneti sliku");
      return false;
    }else{
      fileName = $('#file')[0].files[0].name;
    }
    if(fileName.substring(fileName.length -4) !== ".jpg" && fileName.substring(fileName.length -4) !== ".png"){
      alert("Slika nije u odgovarajucem formatu");
      return false;
    }
    this.submit();
    alert("Proizvod je sacuvan");
  });
});

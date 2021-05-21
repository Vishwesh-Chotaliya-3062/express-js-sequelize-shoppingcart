$(function () {
    showHideNav();

    if( $(window).width() < 768 ) {
      $("nav").addClass("white-nav");
      $('a.nav-link').addClass('gray-link');
      $('a#nav-btn').removeClass('gray-link');
      $('a#nav-btn').removeClass('purple-link');
      $('a#nav-btn').addClass('white-link');
      $('a#nav-btn').addClass('btn-login-navbar-purple');
    }

    $(window).scroll(function () {
      showHideNav();
    });

  function showHideNav() {
    if ($(window).scrollTop() > 50) {
      $("nav").addClass("white-nav");
      $(".navbar-brand img").attr("src", "images/logo.png");
      $('a.nav-link').removeClass('white-link');
      $('a.nav-link').addClass('gray-link');
      $('a#nav-btn').removeClass('gray-link');
      $('a#nav-btn').removeClass("btn-login-navbar-white");
      $('a#nav-btn').addClass("btn-login-navbar-purple");
      $('a#nav-btn').removeClass("purple-link");
      $('a#nav-btn').addClass("white-link");
      
    } else {
      
      if( $(window).width() >= 768 ) {
        $("nav").removeClass("white-nav");
        $(".navbar-brand img").attr("src", "images/logo-white.png");
      }
      $('a.nav-link').removeClass('gray-link');
      $('a.nav-link').addClass('white-link');
      $('a#nav-btn').addClass("btn-login-navbar-white");
      $('a#nav-btn').removeClass("btn-login-navbar-purple");
      $('a#nav-btn').removeClass("white-link");
      $('a#nav-btn').addClass("purple-link");
    }
  }
  
});
Handlebars.registerHelper("nthTimes", function(n, options){
  var buffer = "";

  for(var i = 0; i < n; i++) {
    buffer += options.fn();
  }

  return buffer;
});

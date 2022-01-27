Handlebars.registerHelper("nthTimes", function(n, options){
  var buffer = "";

  for(var i = 0; i < n; i++) {
    buffer += options.fn();
  }

  return buffer;
});

// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/* eslint-disable func-style */
function isFunction(value) {
  return typeof value === 'function';
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (Array.isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

// Stolen from https://github.com/handlebars-lang/handlebars.js/blob/master/lib/handlebars/helpers/with.js
Handlebars.registerHelper("alsowith", function(context, options){
  if (arguments.length != 2) {
    throw new Exception('#with requires exactly one argument');
  }
  if (isFunction(context)) {
    context = context.call(this);
  }

  let fn = options.fn;

  if (!isEmpty(context)) {
    let data = options.data;

    return fn(context, {
      data: data,
      blockParams: [context]
    });
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("twice", function(options){
  var buffer = "";

  buffer += options.fn();
  buffer += options.fn();

  return buffer;
});

Handlebars.registerHelper("list", function(context, options) {
  attrs = Object.entries(options["hash"]).map(function([key,value]){ return key + "=" + '"' + value + '"'; }).join(" ");
  return `<ul ${attrs}>` + context.map(function(item){ return "<li>" + options.fn(item) + "</li>"}).join(",") + "</ul>"
});
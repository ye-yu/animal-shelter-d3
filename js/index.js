"use strict";

/* utils */
function println() {
  for (let i = 0; i < arguments.length; i++) {
    console.log(arguments[i]);
  }
}

function isinarray(obj, value) {
  return obj.indexOf(value) > -1;
}

function isinkey(obj, key) {
  return isinarray(Object.keys(obj), key);
}

function tuplize(obj) {
  let tuple=[];
  for(let i in obj) {
    tuple.push([i, obj[i]]);
  }
  return tuple;
}

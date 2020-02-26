"use strict";

/* utils */
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

function* enumerate(obj) {
  let counter = 0;
  if(Array.isArray(obj)) {
    for(let e of obj) {
      yield {index: counter, value: e};
      counter++;
    }
  } else {
    for(let e in obj) {
      yield {index: counter, value: e};
      counter++;
    }
  }
}

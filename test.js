const testers = require('./testers.json');
const fs = require('fs');
var version = process.versions.node;

var es_staging = /--es_staging/.test(process.execArgv)? '--es_staging' : '';
if(es_staging) version+='--es_staging';

var harmony = /--harmony/.test(process.execArgv)? '--harmony' : '';
if(harmony) version+='--harmony';

console.log('Testing '+version);

// This function is needed to run the tests and was extracted from:
// https://github.com/kangax/compat-table/blob/gh-pages/node.js
global.__createIterableObject = function (arr, methods) {
  methods = methods || {};
  if (typeof Symbol !== 'function' || !Symbol.iterator)
    return {};

  arr.length++;
  var iterator = {
    next: function() {
      return {
        value: arr.shift(),
        done: arr.length <= 0
      };
    },
    'return': methods['return'],
    'throw': methods['throw']
  };
  var iterable = {};
  iterable[Symbol.iterator] = function(){ return iterator; };

  return iterable;
};

var results = {
  _version: version,
  _v8: process.versions.v8,
  _completed: 0,
  _successful: 0,
  _count: Object.keys(testers).length,
  _percent: 0
};

Object.keys(testers).forEach(function(name) {
  var script = testers[name];
  results[name] = false; //make SURE it makes it to the output

  run(script, function(result) {
    //expected results: `e.message` or true/false
    results[name] = typeof result==='string'? result : !!result;
    if(results[name]===true) results._successful++;

    results._completed++;
    if(results._completed===results._count) write();
  });
});

function run(script, cb) {
  //kangax's Promise tests reply on a asyncTestPassed function.
  var async = /asyncTestPassed/.test(script);
  if(async) {
    runAsync(script, function(result) {
      if(result===false) return runAsync(strict(script), cb);
      return cb(result);
    });
  }
  else {
    var result = runSync(script);
    if(result===false) result = runSync(strict(script));
    return cb(result);
  }
}

function runAsync(script, cb) {
  var timer = null;

  try {
    var fn = new Function("asyncTestPassed", script);

    fn(function() {
      clearTimeout(timer);
      process.nextTick(cb, true);
    });

    timer = setTimeout(function() {
      cb(false);
    }, 500);
  }
  catch(e){
    clearTimeout(timer);
    process.nextTick(cb, e.message);
  }
}

function runSync(script) {
  try {
    var fn = new Function(script);
    return fn() || false;
  }
  catch(e){
    return e.message;
  }
}

function strict(script) {
  return '"use strict"\n' + script;
}

function write() {
  delete results._completed;
  results._percent = results._successful/results._count;
  var json = JSON.stringify(results, null, 2);
  if(/nightly/.test(version)) {
    version = 'nightly';
    if(es_staging) version+='--es_staging';
    if(harmony) version+='--harmony';
  }
  fs.writeFileSync(__dirname+'/results/'+version+'.json', json);
}

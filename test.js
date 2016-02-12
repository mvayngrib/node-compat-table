
const testers = require('./testers.json');
const fs = require('fs');
var version = process.versions.node;
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
  iterable[Symbol.iterator] = function(){ return iterator; }

  return iterable;
};

var results = {
  _version: version
};
Object.keys(testers).forEach(function (name) {
  results[name] = run(testers[name]);
});

function run(script) {
  script = script.replace(/^\s*function.+\n/,'').replace(/\n}$/, '');
  try{
    return new Function(script)();
  }
  catch(e){
    return e.message;
  }
}

var json = JSON.stringify(results, null, 2);
if(/nightly/.test(version)) version = 'nightly';
fs.writeFileSync(__dirname+'/results/'+version+'.json', json);

var jade = require('jade');
var fs = require('fs');

var testers = {};
var _testers = require('./testers.json');
Object.keys(_testers).forEach(path=>$set(testers, path, { path:path, code:_testers[path]}));

var results = {
  unflagged: {
    nightly: try_require('./results/nightly.json')
  },
  flagged: {
    nightly: try_require('./results/nightly--harmony.json')
  }
};

var versions = fs.readFileSync('.versions').toString().trim().split('\n');
versions.forEach(version=> {
  results.unflagged[version] = try_require('./results/' +version+ '.json');
  results.flagged[version] = try_require('./results/' +version+ '--harmony.json');
});

function requires_flag(version, path){
  return results.flagged[version] && results.unflagged[version] && results.flagged[version][path]===true && results.unflagged[version][path]!==true;
}
function result(type, version, path) {
  if(!results[type][version]) return;
  var result = results[type][version][path];
  var flaggd = type === 'flagged';
  var flag_required = flaggd && requires_flag(version, path);
  var title = result===true? (flag_required? 'Yes, but requires --harmony flag' : 'Test passed') : typeof result==='string'? result : 'Test failed';
  result = result===true? 'Yes' : typeof result==='string'? 'Error' : 'No';
  return `<div class="${result} ${type} ${flag_required?'required':''}" title="${title}">${result}</div>`
}

var html = jade.renderFile('index.jade', {
  pretty:true,
  versions:versions,
  testers:testers,
  harmony: results.flagged,
  results: function(version, path){
    return result('unflagged', version, path) + result('flagged', version, path);
  },
  requires_flag: requires_flag,
  tip: function (version) {
    return !results.flagged[version]? '' : `v8: ${results.flagged[version]._v8}`
  },
  percent: function (version, unflagged) {
    var datasource = unflagged? results.unflagged : results.flagged;
    return !datasource[version]? '' : datasource[version]._percent.toFixed(2).substr(-2);
  }
});

//console.log(data);
fs.writeFileSync('index.html', html);

function $set(target, path, value) {
  var parts = path.split('›');
  if(parts.length===2) parts.splice(1,0,'');

  var obj = target;
  var last = parts.pop();

  parts.forEach(function(prop) {
    if(!obj[prop]) obj[prop] = {};
    obj = obj[prop];
  });

  obj[last] = value;
}
function try_require(module) {
  try{
    return require(module);
  }
  catch(e){
    console.log("couldn't find:", module);
  }
}
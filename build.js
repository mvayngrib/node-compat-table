var jade = require('jade');
var fs = require('fs');

var testers = {};
var _testers = require('./testers-ES2015.json');
Object.keys(_testers).forEach(path=>
  $set(testers, path, { path:path, code:_testers[path]})
);

var results = {
  unflagged: {
    nightly: try_require('./results/nightly.json')
  },
  flagged: {
    nightly: try_require('./results/nightly--harmony.json')
  }
};

var node_versions = fs.readFileSync('.versions').toString().trim().split('\n');
node_versions.forEach(version=> {
  results.unflagged[version] = try_require('./results/' +version+ '.json');
  results.flagged[version] = try_require('./results/' +version+ '--harmony.json');
});

function requires_flag(node_version, es_version, path){
  return results.flagged[node_version]
    && results.unflagged[node_version]
    && results.flagged[node_version][es_version][path]===true
    && results.unflagged[node_version][es_version][path]!==true;
}
function result(type, node_version, es_version, path) {
  if(!results[type][node_version]) return;
  var result = results[type][node_version][es_version][path];
  var flaggd = type === 'flagged';
  var flag_required = flaggd && requires_flag(node_version, es_version, path);
  var title = result===true? (flag_required? 'Yes, but requires --harmony flag' : 'Test passed') : typeof result==='string'? result : 'Test failed';
  result = result===true? 'Yes' : typeof result==='string'? 'Error' : 'No';
  return `<div class="${result} ${type} ${flag_required?'required':''}" title="${title}">${result}</div>`
}

var html = jade.renderFile('index.jade', {
  pretty: true,
  node_versions: node_versions,
  testers: testers,
  harmony: results.flagged,
  results: function(node_version, es_version, path){
    return result('unflagged', node_version, es_version, path) + result('flagged', node_version, es_version, path);
  },
  requires_flag: requires_flag,
  tip: function (version) {
    return !results.flagged[version]? '' : `v8: ${results.flagged[version]._v8}`
  },
  percent: function (node_version, es_version, unflagged) {
    var datasource = unflagged? results.unflagged : results.flagged;
    return !datasource[node_version]? '' : datasource[node_version][es_version]._percent.toFixed(2).substr(-2);
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
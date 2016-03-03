var jade = require('jade');
var fs = require('fs');

var testers = {};
var _testers = require('./testers.json');
Object.keys(_testers).forEach(path=>$set(testers, path, { path:path, code:_testers[path]}));

var results = {
  nightly: try_require('./results/nightly.json')
};
var es_staging = {
  nightly: try_require('./results/nightly--es_staging.json')
};

var versions = fs.readFileSync('.versions').toString().trim().split('\n');
versions.forEach(version=> {
  results[version] = try_require('./results/' +version+ '.json');
  es_staging[version] = try_require('./results/' +version+ '--es_staging.json');
});


var html = jade.renderFile('index.jade', {
  pretty:true,
  versions:versions,
  results:results,
  testers:testers,
  es_staging: es_staging,
  requires_flag: function(version, path){
    return es_staging[version] && results[version] && es_staging[version][path]===true && results[version][path]!==true;
  }
});

//console.log(data);
fs.writeFileSync('index.html', html);

function $set(target, path, value) {
  var parts = path.split('›');

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
  }
}
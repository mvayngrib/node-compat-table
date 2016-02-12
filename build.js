var jade = require('jade');
var fs = require('fs');

var testers = {};
var _testers = require('./testers.json');
Object.keys(_testers).forEach(path=>$set(testers, path, { path:path, code:_testers[path]}));

var results = {
  nightly: try_require('./results/nightly.json')
};
var versions = fs.readFileSync('.versions').toString().trim().split('\n');
versions.forEach(version=>
  results[version]=try_require('./results/'+version+'.json')
);


var html = jade.renderFile('index.jade', {
  pretty:true,
  versions:versions,
  results:results,
  testers:testers
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
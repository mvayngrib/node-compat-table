
const testers = require('./testers.json');
const fs = require('fs');
const version = process.versions.node;
console.log('Testing '+version);

var results = {
	_version: version
};
Object.keys(testers).forEach(function (name) {
	results[name] = run(testers[name]);
});

function run(script) {
	try{
		return new Function(script)();
	}
	catch(e){
		return e.message;
	}
}

var json = JSON.stringify(results, null, 2);
fs.writeFileSync(__dirname+'/results/'+version+'.json', json);

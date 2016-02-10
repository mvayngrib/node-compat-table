
var testers = require('./testers.json');


var results = {
	_version: process.versions.node
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

console.log(
	JSON.stringify(results, null, 2)
);

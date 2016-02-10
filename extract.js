var es6 = require('./data-es6.js');
var tests = es6.tests;
var testers = {};
var category;


function deindent(fn) {
	var indent = /(?:^|\n)([\t ]+)[^\n]+/.exec(fn);
	return indent? fn.replace(new RegExp('\n' + indent[1], 'g'), '\n') : fn;
}

tests.forEach(function(test) {
	if(category!==test.category) {
		category = test.category;
	}

	var name = [category, test.name];

	if(test.subtests){
		test.subtests.forEach(function (subtest) {
			name[2] = subtest.name;
			testers[name.join('›')] = get_script(subtest.exec);
		});
	}
	else {
		testers[name.join('›')] = get_script(test.exec);
	}

	function get_script(fn) {
		return (deindent(fn+"")).match(/[^]*\/\*([^]*)\*\/\}$/)[1];
	}
});

console.log(
	JSON.stringify(testers, null, 2)
);



//this files patches the 2 `tests-xx.json` files together in 1 object organized by ES version

var testers = {
  ES2015: require('./testers-es6.json'),
  ES2016: {},
  ES2017: {}
};

// kangax's esnext file contains ES2016, ES2017... and more. I'm just using 2016 & 2017 for now.
var esnext = require('./testers-esnext.json');
Object.keys(esnext).forEach(key => {
  if(/^2016/.test(key))
    testers.ES2016[key.substr(5)] = esnext[key];
  if(/^2017/.test(key))
    testers.ES2017[key.substr(5)] = esnext[key];
});

console.log(JSON.stringify(testers, null, 2));

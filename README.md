# Node.js ES2015 compatibility tables
[node-compat-tables](https://williamkapke.github.io/node-compat-table/) is built on top of 
[Kangax's hard work](https://github.com/kangax/compat-table). The majority of the credit needs to be given to the contributors 
of that project.

Although [Kangax's compat table](https://github.com/kangax/compat-table) is amazing, it focuses on the entire 
Javascript ecosystem. As a Node.js developer- I, thankfully, do not need to be super concerned with all of the 
flavors out there. What I **do** need are deeper insights in the variations across the fast moving versions 
of Node.js. So, I created [node-compat-table](https://williamkapke.github.io/node-compat-table/).

It works by [running a script](https://github.com/williamkapke/node-compat-table/blob/gh-pages/test.sh) that imports the 
latest set of <s>ES6</s> ES2015 tests from the [compat-table](https://github.com/kangax/compat-table) project and running 
them against [several versions](https://github.com/williamkapke/node-compat-table/blob/gh-pages/.versions) of node PLUS 
[the nightly build](https://nodejs.org/download/nightly/). The results are committed/published here.

## License
[MIT Copyright (c) 2016 William Kapke](https://github.com/williamkapke/node-compat-table/blob/gh-pages/LICENSE)

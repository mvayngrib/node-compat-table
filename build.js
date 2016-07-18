var jade = require('jade')
var fs = require('fs')

var testers = {}
var _testers = require('./testers.json')
Object.keys(_testers).forEach((esVersion) => {
  testers[esVersion] = {}
  Object.keys(_testers[esVersion]).forEach((path) =>
    $set(testers[esVersion], path, {path: path, code: _testers[esVersion][path]})
  )
})

var results = {
  unflagged: {},
  flagged: {}
}

var nodeVersions = fs.readFileSync('.versions').toString().trim().split('\n')
nodeVersions.unshift('nightly')
nodeVersions.forEach((version) => {
  results.unflagged[version] = tryRequire('./results/' + version + '.json')
  results.flagged[version] = tryRequire('./results/' + version + '--harmony.json')
})

function requiresFlag (nodeVersion, esVersion, path) {
  var flagged = $get(results.flagged, nodeVersion, esVersion)
  var unflagged = $get(results.unflagged, nodeVersion, esVersion)
  return flagged && unflagged && flagged[path] === true && unflagged[path] !== true
}
function result (type, nodeVersion, esVersion, path) {
  var result = $get(results, type, nodeVersion)
  if (!result) return
  result = $get(result, esVersion, path)

  var flaggd = type === 'flagged'
  var flagRequired = flaggd && requiresFlag(nodeVersion, esVersion, path)
  var title = result === true ? (flagRequired ? 'Yes, but requires --harmony flag' : 'Test passed') : typeof result === 'string' ? result : 'Test failed'
  result = result === true ? 'Yes' : typeof result === 'string' ? 'Error' : 'No'
  return `<div class="${result} ${type} ${flagRequired ? 'required' : ''}" title="${title}">${result}</div>`
}

var html = jade.renderFile('index.jade', {
  pretty: true,
  nodeVersions: nodeVersions,
  testers: testers,
  harmony: results.flagged,
  results: function (nodeVersion, esVersion, path) {
    return result('unflagged', nodeVersion, esVersion, path) + result('flagged', nodeVersion, esVersion, path)
  },
  requiresFlag: requiresFlag,
  tip: function (version) {
    return !results.flagged[version] ? '' : `v8: ${results.flagged[version]._v8}`
  },
  percent: function (nodeVersion, esVersion, unflagged) {
    var datasource = unflagged ? results.unflagged : results.flagged
    var data = $get(datasource, nodeVersion, esVersion)
    return data ? data._percent === 1 ? '100' : data._percent.toFixed(2).substr(-2) : ''
  }
})

fs.writeFileSync('index.html', html)

function $get (obj, path, ...more) {
  return more.length && obj[path] ? $get(obj[path], ...more) : obj[path]
}
function $set (target, path, value) {
  var parts = path.split('›')
  if (parts.length === 2) parts.splice(1, 0, '')

  var obj = target
  var last = parts.pop()

  parts.forEach(function (prop) {
    if (!obj[prop]) obj[prop] = {}
    obj = obj[prop]
  })

  obj[last] = value
}
function tryRequire (module) {
  try {
    return require(module)
  } catch (e) {
    console.log("couldn't find:", module)
  }
}

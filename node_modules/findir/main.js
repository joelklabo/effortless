var fs  = require('fs')
  , walk = require('walk')
  , path = require('path')
  , cwd = process.cwd()
  ;

var find = function (name, opts, cb) {
  if (!cb) {cb = opts; opts = {}}
  if (!opts.ignore) {opts.ignore = []}
  if (!opts.dir) {opts.dir = cwd}

  var ignoreDirs = opts.ignore
    , startDir = opts.dir
    , found
    ;

  walker = walk.walk(startDir);
  walker.on('directories', function (root, dirs, next) {
    dirs.forEach(function (dir) {
      ignoreDirs.forEach(function (ignoreDir, idx) {
        if (root.indexOf(ignoreDir) > -1) {
          next()
        } else if (dir.name == name) {
          walker.emit('found', path.join(root, name))
        }
      })
    })
    next()
  })

  walker.once('found', function (dir) {
    found = dir
  })

  walker.once('end', function () {
    if (!found) { console.log('Unable to find', name) }
    cb(found)
  })
}

exports.find = find

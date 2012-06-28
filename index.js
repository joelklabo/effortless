var watch    = require('watch')
  , less     = require('less')
  , optimist = require('optimist')
  , exec     = require('child_process').exec
  ;

var buildCmd = function (f, file) {
  return 'less ' + f + ' > ' + file 
}

var isThisLess = function (f) {
  var pieces = f.split('.')
    , length = pieces.length
    ;

  if (length <= 1) return false

  for (var i = 0; i < length; i++) {
  
    if (pieces[i].indexOf('swp') != -1) {
      return false
    }
    
    if (pieces[i].indexOf('less') > -1) {
      pieces[i] = 'css'
    }
  }

  return pieces.join('.') 
}

watch.createMonitor('.', function (monitor) {
  monitor.on("created", function (f, stat) {
    // Handle file changes
    var file = isThisLess(f)
    if (file) {
      exec(buildCmd(f, file), function (error, stdout, stderr) {
        console.log(f, 'was compiled to', file)
      })
    }
    
  })
  monitor.on("changed", function (f, curr, prev) {
    // Handle new files
    var file = isThisLess(f)
    if (file) {
      exec(buildCmd(f, file), function (error, stdout, stderr) {
        console.log(f, 'was compiled to', file)
      })
    }

  })
  monitor.on("removed", function (f, stat) {
    // Handle removed files
    var file = isThisLess(f)
    if (file) {
      console.log(f, 'was removed, removing', file)
    }
  })
})

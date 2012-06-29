var watch = require('watch')
  , less  = require('less')
  , exec  = require('child_process').exec
  ;

var argv = require('optimist')
          .default('d', '.')
          .default('o', '.')
          .argv
          ;

var dir = argv.d
  , out = argv.o
  , compress = argv.x
  ;

var compileLess = function (f, file) {
  if (compress) {
    return 'lessc -x ' + f + ' > ' + out + '/' + file 
  } else {
    console.log('no compress')
    return 'lessc ' + f + ' > ' + out + '/' + file 
  }
}

var deleteFile = function (file) {
  return 'rm ' + file 
}

var isThisLess = function (f) {
  var pieces = f.split('.')
    , length = pieces.length
    , isLess = false
    ;

  if (length <= 1) return false

  for (var i = 0; i < length; i++) {
  
    if (pieces[i].indexOf('swp') != -1) {
      return false
    }
    
    if (pieces[i].indexOf('less') > -1) {
      isLess = true
      pieces[i] = 'css'
    }
  }

  if (isLess) {
    return pieces.join('.') 
  } else {
    return false
  }
}

watch.createMonitor(dir, function (monitor) {
  monitor.on("changed", function (f, curr, prev) {
    var file = isThisLess(f)
    if (file) {
      exec(compileLess(f, file), function (error, stdout, stderr) {
        console.log(f, 'was compiled to', file)
      })
    }

  })
  monitor.on("removed", function (f, stat) {
    var file = isThisLess(f)
    if (file) {
      exec(deleteFile(file), function (error, stdout, stderr) {
        console.log(f, 'was removed, removing', file)
      })
    }
  })
})

#!/usr/bin/env node

var watch = require('watch')
  , path  = require('path')
  , less  = require('less')
  , exec  = require('child_process').exec
  ;

var argv = require('optimist')
          .default('d', '.')
          .default('o', '.')
          .argv
          ;

var dir      = path.normalize(argv.d)
  , out      = path.normalize(argv.o)
  , compress = argv.x
  , help     = argv.h
  ;

if (help) {
  usage = ''
      + '\n'
      + 'Effortless\n'
      + '*********************************************************************************************\n'
      + 'With no flags, Effortless watches a directory for changes in .less files.\n'
      + 'When a change is observed the file is compiled into a new css file.\n'
      + 'Default options are current directory with no minification.\n'
      + '*********************************************************************************************\n'
      + '{Usage}: effortless [options]\n'
      + '\n'
      + '{Options}:\n'
      + '  -d,  Directory to watch files in.\n'
      + '  -o,  Output directory.\n'
      + '  -x,  Minification flag.\n'
      + '\n'
      + '{Example}: effortless -x -d less/ -o css/\n'
      + '\n'
      + '';
  
  console.log(usage)
  process.exit()
}

var compileLess = function (inFile, outFile) {
  if (compress) {
    return 'lessc -x ' + inFile + ' > ' + outFile 
  } else {
    return 'lessc ' + inFile + ' > ' + outFile 
  }
}

var deleteFile = function (file) {
  return 'rm ' + file 
}

var setOutFile = function (inFile) {
  var fileParts = inFile.split('.')
  fileParts.splice(-1, 1, 'css')
  var file = fileParts.join('.').split('/').splice(-1, 1).toString()
  var outFile = path.join(out, file)
  return outFile
}

watch.createMonitor(dir, function (monitor) {
  monitor.on("changed", function (inFile, curr, prev) {
    if (path.extname(inFile) === '.less') {
      var outFile = setOutFile(inFile)
      exec(compileLess(inFile, outFile), function (error, stdout, stderr) {
        console.log(inFile, 'was compiled to', outFile)
      })
    }
  })
  monitor.on("removed", function (inFile, stat) {
    if (path.extname(inFile) === '.less') {
      var outFile = setOutFile(inFile)
      exec(deleteFile(outFile), function (error, stdout, stderr) {
        console.log(inFile, 'was removed, removing', outFile)
      })
    }
  })
})


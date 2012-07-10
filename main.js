#!/usr/bin/env node

var watch  = require('watch')
  , path   = require('path')
  , less   = require('less')
  , cwd    = process.cwd()
  , findir = require('findir')
  , exec   = require('child_process').exec
  , colors = require('colors')
  ;

var argv = require('optimist')
          .default('d', cwd)
          .default('o', cwd)
          .argv
          ;

var inDir       = path.normalize(argv.d)
  , outDir      = path.normalize(argv.o)
  , compress = argv.x
  , help     = argv.h
  ;

if (help) {
  usage = ''
      + '\n'
      + 'Effortless\n'.green
      + '*********************************************************************************************\n'.yellow
      + 'With no flags, Effortless watches a directory for changes in .less files.\n'
      + 'When a change is observed the file is compiled into a new css file.\n'
      + 'Default options are current directory with no minification.\n'
      + '*********************************************************************************************\n'.yellow
      + '{Usage}: effortless [options]\n'
      + '\n'
      + '{Options}:\n'
      + '  -d,  Directory to watch files in.\n'
      + '  -o,  Output directory.\n'
      + '  -x,  Minification flag.\n'
      + '\n'
      + '{Example}: effortless -x -d less/ -o css/\n'.blue
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
  var outFile = path.join(outDir, file)
  return outFile
}

var specifiedDirectories = function () {
  if (inDir != cwd || outDir != cwd) {
    console.log('Using specified directories:'.green, inDir + '' + outDir + ''.yellow)
    return true
  } else {
    console.log('No directory was specified, attemping to discover...'.blue)
    return false
  }
}

var watchThis = function (inDir, outDir) {
  console.log('Watching...'.blue)
  watch.createMonitor(inDir, function (monitor) {
    monitor.on("changed", function (inFile, curr, prev) {
      if (path.extname(inFile) === '.less') {
        var outFile = setOutFile(inFile)
        exec(compileLess(inFile, outFile), function (error, stdout, stderr) {
          console.log((new Date()).toString().blue + ' ' + inFile.yellow, 'was compiled to', outFile.green)
        })
      }
    })
    monitor.on("removed", function (inFile, stat) {
      if (path.extname(inFile) === '.less') {
        var outFile = setOutFile(inFile)
        exec(deleteFile(outFile), function (error, stdout, stderr) {
          console.log(inFile.red, 'was removed, removing', outFile.red)
        })
      }
    })
  })
}

if (specifiedDirectories()) {
  watchThis(inDir, outDir)
} else {
  var opts = { ignore: ['node_modules', '.git'] }
    , inDir
    , outDir
    ;

  findir.find('less', opts, function (lessDir) {
    if (!lessDir) { 
      console.log("Couldn't find your LESS directory".red) 
    }
    inDir = lessDir
    findir.find('css', opts, function (cssDir) {
      if (!cssDir) { 
        console.log("Couldn't find your CSS directory".red)
      }
      outDir = cssDir

      if (inDir && outDir) {
        console.log('Found directories '.green + inDir.yellow + ' ' + outDir.yellow)
        watchThis(inDir, outDir)
      } else {
        // We couldn't find one of the directories
        process.exit()
      }
      

    })
  })
}

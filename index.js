const dir = require('node-dir')
const md5 = require('md5-file/promise')
const path = require('path')
const async = require('async')
var fs = require('fs')
// Use graceful-fs as recommended here for dealing with EMFILE errors: https://stackoverflow.com/a/15934766/135101
var gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(fs)

const directories = process.argv[2] ? process.argv.slice(2) : __dirname

const files = {}
const hashes = {}
const duplicates = {}

async.concat(directories, dir.files, (error, fileList) => {
  if (error) {
    console.log('--------------------- dir.files error', error)
    process.exit()
  }
  console.log('File list length', fileList.length)
  fileList = fileList.slice().sort()
  let processedFileCount = 0

  async.parallelLimit(fileList.map((fileName, index) => {
    return cb => {
      md5(fileName).then(hash => {
        processedFileCount++
        console.log(`Processing #${processedFileCount} of ${fileList.length}`)
        console.log(`Hash of ${fileName} is ${hash}`)
        files[fileName] = hash
        if (hashes[hash]) {
          hashes[hash].push(fileName)
          duplicates[hash] = hashes[hash]
        } else {
          hashes[hash] = [fileName]
        }
      })
        .then(x => cb(null, x))
        .catch(error => cb(error))
    }
  }), 4, (error, results) => {
    if (error) {
      console.log('--------------------- parallelLimit error', error)
      process.exit()
    } else {
      console.log('Done. Processed ' + processedFileCount + ' files. Duplicates:')
      console.log(JSON.stringify(duplicates, null, 2))
      console.log('Duplicate count: ' + Object.keys(duplicates).length)
    }
  })
})

const dir = require('node-dir')
const md5 = require('md5-file/promise')
const path = require('path')
var realFs = require('fs')
var gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(realFs)

const startDir = process.argv[2] || __dirname

const files = {}
const hashes = {}
duplicates = {}

dir.promiseFiles(startDir, null, { recursive: true })
  .then(fileList => {
    console.log('--------------------- fileList.length', fileList.length)
    let processedFileCount = 0
    fileList.forEach(fileName => {
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
        if (processedFileCount === fileList.length) {
          console.log('Done. Duplicates:')
          console.log(JSON.stringify(duplicates, null, 2))
          console.log('Duplicate count: ' + duplicates.keys().length)
        }
      })
    })
  })


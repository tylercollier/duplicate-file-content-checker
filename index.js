const dir = require('node-dir')
const md5 = require('md5-file/promise')
const path = require('path')

const startDir = '/home/tylercollier/repos/duplicate-file-content-checker'

const files = {}
const hashes = {}
duplicates = {}

dir.promiseFiles(startDir, null, { recursive: true })
  .then(fileList => {
    console.log('--------------------- fileList.length', fileList.length)
    let processedFileCount = 0
    for (let [index, fileName] of fileList.entries()) {
      console.log(`Processing #${index} of ${fileList.length}`)
      md5(fileName).then(hash => {
        console.log(`Hash of ${fileName} is ${hash}`)
        files[fileName] = hash
        if (hashes[hash]) {
          hashes[hash].push(fileName)
          duplicates[hash] = hashes[hash]
        } else {
          hashes[hash] = [fileName]
        }
        processedFileCount++
        if (processedFileCount === fileList.length) {
          console.log('Done. Duplicates:')
          console.log(JSON.stringify(duplicates, null, 2))
        }
      })
    }
  })

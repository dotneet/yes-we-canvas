/**
 * This script generates a movie file from parameter file.
 *
 * Command Example:
 * node examples/param_example1.json
 */

const record = require('../lib/record.js')
const Chromy = require('chromy')
const fs = require('fs')
const startServer = require('../server/server')

const args = process.argv

let params = {}
if (args.length > 2) {
  let file = args[2]
  let json = fs.readFileSync(file)
  params = JSON.parse(json)
}

async function main() {
  try {
    await record(params, startServer)
  } catch (e) {
    console.error(e)
  }
}

main()


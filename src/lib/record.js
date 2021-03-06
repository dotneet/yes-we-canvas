/**
 * This script generates a movie file from parameter file.
 *
 * Command Example:
 * node examples/param_example1.json
 */

const Chromy = require('chromy')
const config = require('../../app-config')
const fs = require('fs')

const chromyOpts = config.chromy ? Object.assign({}, config.chromy) : {}
if (process.env.CHROME_PATH) {
  chromyOpts['chromePath'] = process.env.CHROME_PATH
}
const chromy = new Chromy(chromyOpts)

async function onReceive (onExited, additionalParams, params) {
  console.log('receive:', params)
  let data = params[0]

  if (data.cmd === 'prepare') {
    if (additionalParams !== null) {
      let s = 'window.store.state.batchParams = JSON.parse(\'' + JSON.stringify(additionalParams) + '\')'
      await chromy.evaluate(s)
    }
    return additionalParams
  } else if (data.cmd === 'initialized') {
    await chromy.evaluate(function () {
      document.getElementById('btn-record').click()
    })
  } else if (data.cmd === 'script_onload') {
    // do nothing.
  } else if (data.cmd === 'exit') {
    console.log('exit')
    onExited(data.error)
    await chromy.close()
  } else {
    console.log('unknown command')
    console.log(data)
  }
}

async function startRecording (params) {
  let exited = false
  let returnedError = null
  let onExited = (error) => {
    exited = true
    returnedError = error
  }
  await chromy.chain()
    .console(msg => {
      console.log(msg)
    })
    .goto(`http://localhost:${config.commandPort}/index.html`)
    .sleep(100)
    .receiveMessage(onReceive.bind(this, onExited, params))
    .sleep(100)
    .evaluate(async _ => {
      await window.onBatch()
    })
    .sleep(3000)
    .end()
    .catch(e => {
      console.log(e)
    })
  const err = await new Promise((resolve, reject) => {
    let t = setInterval(() => {
      if (exited) {
        clearInterval(t)
        if (returnedError) {
          resolve(returnedError)
        } else {
          resolve(null)
        }
      }
    }, 200)
  })
  await chromy.close()
  if (err) {
    throw err
  }
  return null
}

async function recording (params, startServer) {
  const server = await startServer(config.commandPort)
  try {
    await startRecording(params)
  } finally {
    server.close()
    console.log('SERVER WAS CLOSED.')
  }
}

module.exports = recording

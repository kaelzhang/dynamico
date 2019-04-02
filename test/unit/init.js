const {assert} = require('chai')

const dyn = require('../../index')
const conf = require('./conf.json')

describe('init module', () => {
  it('uses conf file if DYNAMO_ENV is not set', () => {
    const dynamo = dyn(conf)
    assert.equal(dynamo.config.credentials.accessKeyId, conf.accessKeyId)
  })
})

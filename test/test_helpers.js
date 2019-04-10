const {assert, expect, should} = require('chai')
const DynamoDB = require('..')({
  region: 'ap-northeast-1',
  apiVersion: '2012-08-10',
  accessKeyId: 'test',
  secretAccessKey: 'test',
  endpoint: 'http://localhost:8000',
})

// Test Tables
const Table = DynamoDB.select('aws.table.for.testing')
const TableComb = DynamoDB.select('aws.table.combined.for.testing')

// DynamoDB error codes
const errorCodes = {
  CONDITION: 'ConditionalCheckFailedException',
  VALIDATION: 'ValidationException'
}

// error callbacks
const errors = {
  failure: () => { throw new Error('assert failed') },
  conditional: err => assert.include(err.code, errorCodes.CONDITION),
  validation: err => assert.equal(err.code, errorCodes.VALIDATION)
}

module.exports = {
  assert,
  expect,
  should,
  Table,
  TableComb,
  DynamoDB,
  errors
}

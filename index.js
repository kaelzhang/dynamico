const AWS = require('aws-sdk')
const ConditionalQueryBuilder = require('./lib/ConditionalQueryBuilder')

const defaultScannedData = () => ({
  Count: 0,
  Items: [],
  ScannedCount: 0
})

const scanAll = (host, params, callback, prev = defaultScannedData()) => {
  host.scan(params, (err, data) => {
    if (err) {
      return callback(err)
    }

    const {
      LastEvaluatedKey
    } = data

    // Ref
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html#API_Scan_ResponseSyntax
    const merged = {
      Count: prev.Count + data.Count,
      Items: [
        ...prev.Items,
        ...data.Items
      ],
      ScannedCount: prev.ScannedCount + data.ScannedCount
    }

    // > If there is not a LastEvaluatedKey element in a Scan response,
    // > then you have retrieved the final page of results.
    // Ref
    // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html#Scan.Pagination
    if (!LastEvaluatedKey) {
      return callback(null, merged)
    }

    scanAll(host, {
      ...params,
      ExclusiveStartKey: LastEvaluatedKey
    }, callback, merged)
  })
}

const noLimit = params => {
  if ('Limit' in params) {
    const ret = {
      ...params
    }

    delete ret.Limit
    return ret
  }

  return params
}

const promisify = host => (method, params) =>
  new Promise((resolve, reject) => {
    const callback = (err, data) => {
      err
        ? reject(err)
        : resolve(data)
    }

    if (method === 'scanAll') {
      return scanAll(host, noLimit(params), callback)
    }

    host[method](params, callback)
  })

// Exports DynamoDB function that returns an object of methods
module.exports = conf => {
  AWS.config.update(conf)

  AWS.CredentialProviderChain.defaultProviders = [
    () => new AWS.EnvironmentCredentials('AWS'),
    () => new AWS.EnvironmentCredentials('AMAZON'),
    () => new AWS.SharedIniFileCredentials(),
    () => process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI
      ? new AWS.ECSCredentials()
      : new AWS.EC2MetadataCredentials()
  ]

  const dynamoDB = new AWS.DynamoDB()

  const docClient = new AWS.DynamoDB.DocumentClient()
  const db = promisify(dynamoDB)
  const doc = promisify(docClient)

  return {
    config: dynamoDB.config,

    // Select Table and return method object for further queries
    select: TableName => new ConditionalQueryBuilder(TableName, {
      docClient,
      doc,
      db,
    }),

    createSet: params => docClient.createSet(params),
  }
}

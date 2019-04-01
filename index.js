const AWS = require('aws-sdk')
const ConditionalQueryBuilder = require('./lib/ConditionalQueryBuilder')

const getPromise = func => (method, params) =>
  new Promise((resolve, reject) => {
    func[method](params, (err, data) => {
      err
        ? reject(err)
        : resolve(data)
    })
  })

// Exports DynamoDB function that returns an object of methods
module.exports = conf => {
  AWS.config.update({
    region: 'ap-northeast-1',
    ...conf
  })

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
  const db = getPromise(dynamoDB)
  const doc = getPromise(docClient)

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

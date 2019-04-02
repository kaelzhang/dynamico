const {assert, Table} = require('../test_helpers')

describe('#scanAll', () => {
  before('add item', () => Table.add({name: 'steve_jobs'}))

  it('works without params', () => Table.scanAll())
  it('works with projections', () => Table.project(['name']).scanAll())

  it('works with conditionals', async () => {
    // truthy
    const t = await Table.where('name', 'contains', 'jobs').scanAll()
    // falsy
    const f = await Table.where('name', 'beginsWith', 't').scanAll()

    assert.propertyVal(t, 'Count', 1)
    assert.propertyVal(f, 'Count', 0)
  })

  // describe('with Limit parameter', () => {
  //   [3, 2, 5, 8, 4].forEach(limit =>
  //     it(`returns ${limit} items`, () =>
  //       Table
  //       .limit(limit)
  //       .scan()
  //       .then(({Count}) => assert.equal(limit, Count))
  //     )
  //   )
  // })
})

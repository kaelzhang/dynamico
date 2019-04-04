const {assert, Table} = require('../test_helpers')

describe('#scan', () => {
  before('add item', () => Table.add({name: 'scanPaginate'}))

  it('works without params', () => Table.scan())
  it('works with projections', () => Table.project(['name']).scan())

  it('works with conditionals', async () => {
    // truthy
    const t = await Table.where('name', 'contains', 'scanPaginate').scan()
    // falsy
    const f = await Table.where('name', 'beginsWith', 'x').scan()

    assert.propertyVal(t, 'Count', 1) // scan and scanAll
    assert.propertyVal(f, 'Count', 0)
  })

  describe('with Limit parameter', () => {
    [3, 2, 5, 8, 4].forEach(limit =>
      it(`returns ${limit} items`, () =>
        Table
        .limit(limit)
        .scan()
        .then(({Count}) => assert.equal(limit, Count))
      )
    )
  })
})

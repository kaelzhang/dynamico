const {assert, Table} = require('../test_helpers')

describe('#scanAll', () => {
  before('add item', () => Promise.all([
    Table.add({name: 'steve_jobs'}),
    Table.add({name: 'tim_jobs'}),
    Table.add({name: 'cook_jobs'})
  ]))

  it('works without params', () => Table.scanAll())
  it('works with projections', () => Table.project(['name']).scanAll())

  it('works with conditionals', async () => {
    // truthy
    const t = await Table.where('name', 'contains', 'jobs').scanAll()
    // falsy
    const f = await Table.where('name', 'beginsWith', 'x').scanAll()

    assert.propertyVal(t, 'Count', 3)
    assert.propertyVal(f, 'Count', 0)
  })

  describe('will delete Limit parameter', () => {
    [3, 2, 5, 8, 4].forEach(limit =>
      it(`returns 1 items`, () =>
        Table
        .where('name', 'contains', 'jobs')
        .limit(limit)
        .scanAll()
        .then(({Count}) => assert.equal(Count, 3))
      )
    )
  })
})

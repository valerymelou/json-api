import { snakeToCamel } from "./text"

describe('text helper', () => {
  it('snakeToCamel should camelize strings', () => {
    expect(snakeToCamel('hello_world')).toEqual('helloWorld');
  })
})

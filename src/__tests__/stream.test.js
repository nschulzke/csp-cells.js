import { Stream } from '../stream';

describe('stream', () => {
  it('has a getter', () => {
    let stream = new Stream('Test');
    expect(stream.get()).toEqual('Test');
  })

  it('has a setter', () => {
    let stream = new Stream('Test');
    stream.set('Test2');
    expect(stream.get()).toEqual('Test2');
  })

  it('provides iterator', async () => {
    let data = [0, 1, 2, 3, 4, 5, 6]
    let compare = [0, 1, 2, 3, 4, 5, 6]
    let stream = new Stream('test');

    async function consume() {
      for await (let item of stream) {
        console.log(item);
        expect(item).toEqual(compare.shift());
      }
      console.log('done');
    }

    async function produce() {
      stream.set(data.shift());
      stream.set(data.shift());
      stream.set(data.shift());
      stream.set(data.shift());
      stream.done();
    }

    consume();
    produce();
  })
})

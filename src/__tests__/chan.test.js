import { open } from "../chan";

describe('channel', () => {
  it('enables synchronous communication between async tasks', async () => {
    let ch = open()
    async function producer() {
      await ch.put('test text');
    }

    async function consumer() {
      expect(await ch.take()).toEqual('test text');
    }
    consumer();
    producer();
  });

  it('provides for-of loops', async () => {
    let stim = open();
    let resp = open();
    let data = [1, 2, 3, 4, 5, 8, 9, 10];

    async function stimulator() {
      for (let item of data) {
        await stim.put(item);
        let result = await resp.take();
        expect(result).toEqual(item);
      }
    }

    async function responder() {
      for await (let item of stim) {
        await resp.put(item);
      }
    }

    stimulator();
    responder();
  });

  it('provides map and filter functionality', async () => {
    let stim = open();
    let resp = open(2)
      .filter(val => val !== 3)
      .map(val => val + 1);
    let data = [1, 2, 3, 4, 5, 8, 9, 10];
    let mapped = [2, 3, 5, 6, 9, 10, 11];

    async function stimulator() {
      for (let item of data) {
        await stim.put(item);
      }
    }

    async function responder() {
      for await (let item of stim) {
        await resp.put(item);
      }
    }

    async function checker() {
      for await (let item of resp) {
        expect(item).toEqual(mapped.shift());
      }
    }

    stimulator();
    responder();
    checker();
  });
});

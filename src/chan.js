const FILTERED = Symbol('FILTERED');

const privates = new WeakMap();

function flush(that) {
  let my = privates.get(that);
  if (my.flushing === false) {
    my.flushing = true;
    while (my.putters.length > 0 && my.buffer.length < my.bufferSize) {
      let putter = my.putters.shift();
      my.buffer.push(putter());
    }
    while ((my.buffer.length > 0 || my.putters.length > 0) && my.takers.length > 0) {
      let taker = my.takers.shift();
      let value;
      if (my.buffer.length > 0) {
        value = my.buffer.shift();
      } else {
        let putter = my.putters.shift();
        value = putter();
      }
      taker(value);
    }
    my.flushing = false;
  }
}

class Channel {
  constructor(bufferSize = 0, transducer = val => val, initialBuffer = []) {
    privates.set(this, {
      bufferSize,
      transducer,
      buffer: initialBuffer,
      putters: [],
      takers: [],
      flushing: false,
      closed: false,
    })
  }

  put(message) {
    let my = privates.get(this);
    message = my.transducer(message);
    return new Promise((resolve) => {
      if (my.closed) {
        throw new Error('Tried to put to a closed channel!');
      }
      if (message !== FILTERED) {
        my.putters.push(() => {
          resolve(true);
          return message;
        });
        flush(this);
      } else {
        resolve(true);
      }
    });
  }

  take() {
    let my = privates.get(this);
    return new Promise((resolve) => {
      if (my.closed) {
        throw new Error('Tried to take from a closed channel!');
      }
      my.takers.push((message) => {
        resolve(message)
        return true;
      });
      flush(this);
    })
  }

  offer(message) {
    let my = privates.get(this);
    if (!my.closed && (my.takers.length > my.putters.length || my.buffer.length < my.bufferSize)) {
      return this.put(message);
    } else {
      return Promise.resolve(false);
    }
  }

  poll() {
    if (!my.closed && (my.putters.length > my.takers.length || my.buffer.length < my.bufferSize)) {
      return this.take();
    } else {
      return Promise.resolve(undefined);
    }
  }

  close() {
    let my = privates.get(this);
    my.closed = true;
    for (let taker of my.takers) {
      taker();
    }
    for (let putter of my.putters) {
      putter();
    }
  }

  map(fn) {
    let my = privates.get(this);
    my.buffer = my.buffer.map(fn);
    return new Channel(my.bufferSize, val => {
      val = my.transducer(val);
      if (val === FILTERED) {
        return FILTERED;
      } else {
        return fn(val)
      }
    }, my.buffer);
  }

  filter(fn) {
    let my = privates.get(this);
    my.buffer = my.buffer.filter(fn);
    return new Channel(my.bufferSize, val => {
      val = my.transducer(val);
      if (!fn(val) || val === FILTERED) {
        return FILTERED;
      } else {
        return val;
      }
    }, my.buffer);
  }

  async *[Symbol.asyncIterator]() {
    let my = privates.get(this);
    while (!my.closed) {
      let value = await this.take();
      if (my.closed) {
        return value;
      } else {
        yield value;
      }
    }
  }
}

function open(...args) {
  return new Channel(...args);
}

function put(channel, message) {
  return channel.put(message);
}

function take(channel) {
  return channel.take();
}

function offer(channel, message) {
  return channel.offer(message);
}

function poll(channel) {
  return channel.offer();
}

function close(channel) {
  return channel.close();
}

function pub(input) {
  let subs = [];
  async function pubSub() {
    for await (let item of input) {
      for (let sub of subs) {
        sub.put(item);
      }
    }
    for (let sub of subs) {
      sub.close();
    }
  }
  pubSub();
  return {
    sub() {
      let ch = open();
      subs.push(ch);
      return ch;
    },
    unsub(ch) {
      subs = subs.filter(val => val !== ch);
    }
  }
}

export { open, put, take, offer, poll, close, pub };

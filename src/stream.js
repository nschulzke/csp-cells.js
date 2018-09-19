const privates = new WeakMap();

class Stream {
  constructor(value) {
    privates.set(this, {
      value,
      isDone: false,
      observers: [],
    });
  }

  observe() {
    let my = privates.get(this);
    return new Promise((resolve) => {
      my.observers.push((result) => {
        resolve(result);
      });
    });
  }

  done() {
    let my = privates.get(this);
    my.isDone = true;
  }

  get() {
    let my = privates.get(this);
    return my.value;
  }

  set(value) {
    let my = privates.get(this);
    my.value = value;
    my.observers.forEach(
      observer => observer(value)
    );
    my.observers = [];
  }

  async *[Symbol.asyncIterator]() {
    let my = privates.get(this);
    while (true) {
      if (my.isDone) {
        return await this.observe();
      } else {
        yield await this.observe();
      }
    }
  }
}

export { Stream }

import { open } from './chan';

function fromEvent(ev, ele) {
  let ch = open();
  ele.addEventListener(ev, function handler(event) {
    ch.offer(event);
  });
  return ch;
}

function fromEventById(ev, id) {
  return fromEvent(ev, document.getElementById(id));
}

export { fromEvent, fromEventById };

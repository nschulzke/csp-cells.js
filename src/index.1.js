import { outputToElement } from './output';
import { open } from './chan';
import { timeout } from './util';
import * as lift from './lift';

const output = outputToElement('output');

async function main() {
  let ch = open(2);
  let clicks = lift.fromEventById('click', 'clicker');
  let output = open();
  let f = watcher(clicks, output);
  let l2 = echoer(output);
  await ch.put('test1');
  await ch.put('test2');
  let l = echoer(ch);
  await ch.put('test3');
  let p = person(ch);
  await timeout(3000);
  await clicks.close();
}

async function person(ch) {
  await timeout(500);
  await ch.put('Hello, World!');
  await timeout(500);
  await ch.put('Welcome to San Francisco!');
  await timeout(500);
  await ch.put('(In many hours)');
  await ch.close();
}

async function watcher(ch1, ch2) {
  for await (let item of ch1) {
    await ch2.put('notify');
  }
  ch2.put('Watched channel closed.');
}

async function echoer(ch) {
  for await (let item of ch) {
    output(item);
  }
  output('Echoed channel closed.');
}

main();

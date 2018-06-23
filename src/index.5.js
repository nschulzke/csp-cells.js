import { outputToElement } from './output';
import { open } from './chan';
import { timeout } from './util';
import * as lift from './lift';

const output = outputToElement('output');

async function main() {
  let ch = open(2);
  await ch.put('test1');
  await ch.put('test2');
  for await (let i of ch) {
    output(i);
  }
}

main();

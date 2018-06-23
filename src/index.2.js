import { outputToElement } from './output';
import { open } from './chan';
import { timeout } from './util';
import * as lift from './lift';

const output = outputToElement('output');

async function main() {
  let bathroom = open();
  bathroom.put(1);
  person('Test 1', bathroom);
  person('Test 2', bathroom);
  person('Test 3', bathroom);
  person('Test 4', bathroom);
  person('Test 5', bathroom);

  let mouthpiece = open();
  loudspeaker(mouthpiece);
  announcer(mouthpiece);

  let clickChan = lift.fromEventById('click', 'clicker');
  sayHi(clickChan);
}

async function person(name, bathroom) {
  let br = await bathroom.take();
  await timeout(1000);
  bathroom.put(br);
  output(name + ' is done!');
}

async function announcer(mouthpiece) {
  await timeout(1000);
  mouthpiece.put('Hi, all!');
  await timeout(1000);
  mouthpiece.put('This is a test!');
}

async function loudspeaker(mouthpiece) {
  for await (let sound of mouthpiece) {
    output(sound);
  }
}

async function sayHi(channel) {
  for await (let item of channel) {
    output('Hi!');
  }
}

main();

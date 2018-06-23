import { outputToElement } from './output';
import { open, pub } from './chan';
import { timeout } from './util';
import * as lift from './lift';

const output = outputToElement('output');

async function main() {
    let input = open(3);
    await input.put(5);
    await input.put(10);
    await input.put(15);
    input = input
        .filter(val => val !== 3)
        .map(val => `Num: ${val}`)
        .map(val => `"${val}"`);
    producer(input);
    let p = pub(input);
    listener('1', p.sub());
    listener('2', p.sub());
    listener('3', p.sub());

}

async function producer(input) {
    for (let i of [1, 2, 3, 4, 5]) {
        await timeout(500);
        await input.put(i);
    }
    input.close();
}

async function listener(name, input) {
    for await (let item of input) {
        output(`${name} got ${item}`);
    }
    output(`${name} closed`);
}

main();

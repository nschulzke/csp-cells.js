import { outputToElement } from './output';
import { open, pub } from './chan';
import { timeout } from './util';
import * as lift from './lift';

const output = outputToElement('output');

let channels = [];

async function main() {
    for (let i = 0; i < 1000000; i++) {
        channels.push(open());
    }
    output('Done!');
}

main();

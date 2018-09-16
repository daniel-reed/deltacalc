import { Delta } from './delta'

// Test Cases
const t1_s1 = ('Tody is bad day.').split('');
const t1_s2 = ('Today is a good day.').split('');
const t1_delta_r = 'Mw@MA,MQ:a,NQ@Mw,MQ@OQ,NA: goo,Ng@MTA';

let t1_delta = Delta.encode(t1_s1, t1_s2);
let t1_decode = Delta.apply(t1_s1, t1_delta);

if (t1_delta !== t1_delta_r) {
    console.log('t1_delta', 'Expected', t1_delta_r, 'Got', t1_delta);
}
if (t1_decode.join('') !== t1_s2.join('')) {
    console.log('t1_decode', 'Expected', t1_s2.join(''), 'Got', t1_decode.join(''));
}

const t2_s1 = ('Today is a good day!').split('');
const t2_s2 = ('Today is a good day.').split('');
const t2_delta_r = 'MTk@MA,MQ:.';

let t2_delta = Delta.encode(t2_s1, t2_s2);
let t2_decode = Delta.apply(t2_s1, t2_delta);
if (t2_delta !== t2_delta_r) {
    console.log('t2_delta', 'Expected', t2_delta_r, 'Got', t2_delta);
}
if (t2_decode.join('') !== t2_s2.join('')) {
    console.log('t2_decode', 'Expected', t2_s2.join(''), 'Got', t2_decode.join(''));
}

const t3_s1 = ('Today is a good day!').split('');
const t3_s2 = ('today is a good day!').split('');
const t3_delta_r = 'MQ:t,MTk@MQ';

const t3_delta = Delta.encode(t3_s1, t3_s2);
const t3_decode = Delta.apply(t3_s1, t3_delta);
if (t3_delta !== t3_delta_r) {
    console.log('t3_delta', 'Expected', t3_delta_r, 'Got', t3_delta);
}
if (t3_decode.join('') !== t3_s2.join('')) {
    console.log('t3_decode', 'Expected', t3_s2.join(''), 'Got', t3_decode.join(''))
}

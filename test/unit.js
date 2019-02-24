import test from 'ava';
import utils from '../src/utils';

test('test validateEmail', (t) => {
    t.true(utils.validateEmail('test@test.com'));
    t.false(utils.validateEmail('test@t'));
});

test('test encrypt/decrypt', (t) => {
    t.true('test' === utils.decrypt( utils.encrypt('test')));
});

test('test hash', (t) => {
    t.true(utils.hash('test') === '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
});

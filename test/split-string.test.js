const assert = require('assert');
const splitByLength = require('../lib/split-string').byLength;
const splitByWordCount = require('../lib/split-string').byWordCount;
const indexOfAny = require('../lib/split-string').indexOfAny;

describe('indexOfAny', function () {
  it('should be OK', function () {
    assert.equal(indexOfAny("abc\t \n", "\t \n"), 3);
    assert.equal(indexOfAny("\nabc\t \n", "\t \n"), 0);
    assert.equal(indexOfAny("a\tbc\t \n", "\t \n"), 1);
    assert.equal(indexOfAny(" a\tbc\t \n", "\t \n"), 0);
  });
});

describe('splitByLength', function () {
  it('should split into 9 data', function () {
    const string = "Newsmen call it the Cuban Missile Crisis.\n" + 
      "Teachers say it's the end of the world.";
    const splitted = splitByLength(string, " ", 10);
    var recovered = '';
    for (var i = 0; i < splitted.length; ++i) {
      recovered += splitted[i];
    }
    assert.equal(recovered, string);
    assert.equal(splitted.length, 9);
    assert.equal(splitted[0], "Newsmen ");
    assert.equal(splitted[1], "call it ");
    assert.equal(splitted[2], "the Cuban ");
    assert.equal(splitted[3], "Missile ");
    assert.equal(splitted[4], "Crisis.\nTeachers ");
    assert.equal(splitted[5], "say it's ");
    assert.equal(splitted[6], "the end ");
    assert.equal(splitted[7], "of the ");
    assert.equal(splitted[8], "world.");
  });

  it('should split into 1 data', () => {
    const string = "Newsmen call it the Cuban Missile Crisis.\n" + 
      "Teachers say it's the end of the world.";
    const splitted = splitByLength(string, " ", 1000);
    assert.equal(splitted.length, 1);
    assert.equal(splitted[0], string);
  });
});

describe('splitByWordCount', function () {
  it('should split into 3 data', function () {
    const string = "Newsmen call it the Cuban Missile   Crisis.\n" + 
      "Teachers say it's the end of the   world.";
    const splitted = splitByWordCount(string, 6);
    var recovered = '';
    for (var i = 0; i < splitted.length; ++i) {
      recovered += splitted[i];
    }
    assert.equal(recovered, string);
    assert.equal(splitted[0], "Newsmen call it the Cuban Missile ");
    assert.equal(splitted[1], "  Crisis.\nTeachers say it's the end ");
    assert.equal(splitted[2], "of the   world.");
    assert.equal(splitted.length, 3);
  });
  it('should split into 1 data', function () {
    const string = "Newsmen call it the Cuban Missile Crisis.\n" + 
      "Teachers say it's the end of the world.";
    const splitted = splitByWordCount(string, 1000);
    assert.equal(splitted.length, 1);
    assert.equal(splitted[0], string);
  });
});

const splitByLength = require('../lib/split-string').byLength
const splitByWordCount = require('../lib/split-string').byWordCount
const indexOfAny = require('../lib/split-string').indexOfAny

test('index of any', () => {
  expect(indexOfAny("abc\t \n", "\t \n")).toBe(3);
  expect(indexOfAny("\nabc\t \n", "\t \n")).toBe(0);
  expect(indexOfAny("a\tbc\t \n", "\t \n")).toBe(1);
  expect(indexOfAny(" a\tbc\t \n", "\t \n")).toBe(0);
});

test('split string by length', () => {
  const string = "Newsmen call it the Cuban Missile Crisis.\n" + 
      "Teachers say it's the end of the world.";
  const splitted = splitByLength(string, " ", 10);
  var recovered = '';
  for (var i = 0; i < splitted.length; ++i) {
    recovered += splitted[i];
  }
  expect(recovered).toBe(string);
  expect(splitted.length).toBe(9);
  expect(splitted[0]).toBe("Newsmen ");
  expect(splitted[1]).toBe("call it ");
  expect(splitted[2]).toBe("the Cuban ");
  expect(splitted[3]).toBe("Missile ");
  expect(splitted[4]).toBe("Crisis.\nTeachers ");
  expect(splitted[5]).toBe("say it's ");
  expect(splitted[6]).toBe("the end ");
  expect(splitted[7]).toBe("of the ");
  expect(splitted[8]).toBe("world.");
});

test('split string by large length', () => {
  const string = "Newsmen call it the Cuban Missile Crisis.\n" + 
      "Teachers say it's the end of the world.";
  const splitted = splitByLength(string, " ", 1000);
  expect(splitted.length).toBe(1);
  expect(splitted[0]).toEqual(string);
});

test('split string by word count', () => {
  const string = "Newsmen call it the Cuban Missile   Crisis.\n" + 
      "Teachers say it's the end of the   world.";
  const splitted = splitByWordCount(string, 6);
  console.log(splitted);
  var recovered = '';
  for (var i = 0; i < splitted.length; ++i) {
    recovered += splitted[i];
  }
  expect(recovered).toBe(string);
  expect(splitted[0]).toBe("Newsmen call it the Cuban Missile ");
  expect(splitted[1]).toBe("  Crisis.\nTeachers say it's the end ");
  expect(splitted[2]).toBe("of the   world.");
  expect(splitted.length).toBe(3);
});

test('split string by large word count', () => {
  const string = "Newsmen call it the Cuban Missile Crisis.\n" + 
      "Teachers say it's the end of the world.";
  const splitted = splitByWordCount(string, 1000);
  console.log(splitted);
  expect(splitted.length).toBe(1);
  expect(splitted[0]).toEqual(string);
});

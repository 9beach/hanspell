/**
 * @fileOverview Helper functions to split long string by word count and by
 *               upper bound length and separator.
 */

// Returns the lowest index of any characters of separator found in string.
function indexOfAny(string, separator, from) {
  const founds = separator
    .split('')
    .map((s) => string.indexOf(s, from))
    .filter((s) => s > -1)
    .sort((a, b) => a - b);

  if (founds.length === 0) {
    return -1;
  }
  return founds[0];
}

// Splits string in word-wrapped manner by length.
function byLength(string, separator, limit) {
  const splitted = [];
  let found = -1;
  let lastFound = -1;
  let lastSplitted = -1;

  for (;;) {
    found = indexOfAny(string, separator, lastFound + 1);
    if (found === -1) {
      break;
    }
    if (found - lastSplitted > limit) {
      splitted.push(string.substr(lastSplitted + 1, lastFound - lastSplitted));
      lastSplitted = lastFound;
    }
    lastFound = found;
  }

  if (lastSplitted + 1 !== string.length) {
    if (string.length - lastSplitted - 1 <= limit) {
      splitted.push(string.substr(lastSplitted + 1));
    } else {
      if (lastSplitted !== lastFound) {
        splitted.push(
          string.substr(lastSplitted + 1, lastFound - lastSplitted),
        );
      }
      splitted.push(string.substr(lastFound + 1));
    }
  }

  return splitted;
}

// Splits string in word-wrapped manner by word count.
function byWordCount(string, limit) {
  const splitted = [];
  let found = -1;
  let lastFound = -1;
  let lastSplitted = -1;
  let wordCount = 0;

  for (;;) {
    found = indexOfAny(string, ' \n\t', lastFound + 1);
    if (found === -1) {
      break;
    }
    if (found - lastFound === 1) {
      lastFound = found;
    } else {
      wordCount += 1;
      if (wordCount >= limit) {
        splitted.push(string.substr(lastSplitted + 1, found - lastSplitted));
        wordCount = 0;
        lastSplitted = found;
      }
      lastFound = found;
    }
  }

  if (lastSplitted + 1 !== string.length) {
    splitted.push(string.substr(lastSplitted + 1));
  }

  return splitted;
}

module.exports = { byLength, byWordCount, indexOfAny };

/**
 * @fileOverview Helper functions to split long string by word count and by
 *               upper bound length and separator.
 */
'use strict';

// the lowest index of all characters of separator 
function indexOfAny(string, separator, from) {
  var min = -1;
  for (var i = 0; i < separator.length; ++i) {
    var found = string.indexOf(separator[i], from);
    if (found != -1) {
      if (min != -1) {
        min = found < min ? found : min;
      } else {
        min = found;
      }
    }
  }
  return min;
}

// word-wrapped split by length
function byLength(string, separator, limit) {
  var splitted = [];
  var found = -1;
  var lastFound = -1;
  var lastSplitted = -1;

  while (found = indexOfAny(string, separator, lastFound + 1), found != -1) {
    if (found - lastSplitted > limit) {
      splitted.push(string.substr(lastSplitted + 1, lastFound - lastSplitted));
      lastSplitted = lastFound;
    }
    lastFound = found;
  }

  if (lastSplitted + 1 != string.length) {
    if (string.length - lastSplitted - 1 <= limit) {
      splitted.push(string.substr(lastSplitted + 1));
    } else {
      if (lastSplitted != lastFound) {
        splitted.push(string.substr(lastSplitted + 1, 
            lastFound - lastSplitted));
      }
      splitted.push(string.substr(lastFound + 1));
    }
  }

  return splitted;
}

// word-wrapped split by word count
function byWordCount(string, limit) {
  var splitted = [];
  var found = -1;
  var lastFound = -1;
  var lastSplitted = -1;
  var wordCount = 0;

  while (found = indexOfAny(string, " \n\t", lastFound + 1), found != -1) {
    if (found - lastFound == 1) {
      lastFound = found;
      continue;
    } else {
      ++wordCount;
    }
    if (wordCount >= limit) {
      splitted.push(string.substr(lastSplitted + 1, found - lastSplitted));
      wordCount = 0;
      lastSplitted = found;
    }
    lastFound = found;
  }

  if (lastSplitted + 1 != string.length) {
    splitted.push(string.substr(lastSplitted + 1));
  }

  return splitted;
}

module.exports = { byLength, byWordCount, indexOfAny };

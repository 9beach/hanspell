#!/usr/bin/env bash

cat test/cli-test.in | lib/cli.js -d 2>&1 | cat - > test/cli-test.d.out
cat test/cli-test.in | lib/cli.js -p 2>&1 | cat - > test/cli-test.p.out
cat test/cli-test.in | lib/cli.js -j 2>&1 | cat - > test/cli-test.j.out
cat test/cli-test.in | lib/cli.js -a 2>&1 | cat - > test/cli-test.a.out

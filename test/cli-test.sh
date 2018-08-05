#!/usr/bin/env bash

set -e

cat test/cli-test.in.txt | lib/cli.js -d 2>&1 | diff - test/cli-test.out.d
cat test/cli-test.in.txt | lib/cli.js -p 2>&1 | diff - test/cli-test.out.p
cat test/cli-test.in.txt | lib/cli.js -j 2>&1 | diff - test/cli-test.out.j
cat test/cli-test.in.txt | lib/cli.js -a 2>&1 | diff - test/cli-test.out.a

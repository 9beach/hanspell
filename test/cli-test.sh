#!/usr/bin/env bash

set -e

cat README.md | lib/cli.js > /dev/null 2>&1
cat test/cli-test.in | lib/cli.js -d 2>&1 | diff - test/cli-test.out.d
cat test/cli-test.in | lib/cli.js -p 2>&1 | diff - test/cli-test.out.p
cat test/cli-test.in | lib/cli.js -j 2>&1 | diff - test/cli-test.out.j
cat test/cli-test.in | lib/cli.js -a 2>&1 | diff - test/cli-test.out.a

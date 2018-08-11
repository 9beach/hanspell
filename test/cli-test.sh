#!/usr/bin/env bash

set -e

cat test/cli-test.in | lib/cli.js -d 2>&1 | diff - test/cli-test.out.d
cat test/cli-test.in | lib/cli.js -p 2>&1 | diff - test/cli-test.out.p
cat test/cli-test.in | lib/cli.js -j 2>&1 | diff - test/cli-test.out.j
cat test/cli-test.in | lib/cli.js -a 2>&1 | diff - test/cli-test.out.a
cat test/cli-test.p.in | lib/cli.js -p 2>&1 | diff - test/cli-test.p.out
cat test/cli-test.d.in | lib/cli.js -d 2>&1 | diff - test/cli-test.d.out

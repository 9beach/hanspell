#!/usr/bin/env bash

cat test/cli-test.in | lib/cli.js -d &> test/cli-test.out.d
cat test/cli-test.in | lib/cli.js -p &> test/cli-test.out.p
cat test/cli-test.in | lib/cli.js -j &> test/cli-test.out.j
cat test/cli-test.in | lib/cli.js -a &> test/cli-test.out.a

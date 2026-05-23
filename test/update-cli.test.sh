#!/usr/bin/env bash

cat test/cli.test.in | lib/cli.js -d > test/cli.test.out.daum 2> test/cli.test.err.daum
cat test/cli.test.in | lib/cli.js -n > test/cli.test.out.naver 2> test/cli.test.err.naver
cat test/cli.test.in | lib/cli.js -a > test/cli.test.out.all 2> test/cli.test.err.all

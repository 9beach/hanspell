#!/usr/bin/env bash

cat test/cli-test.in | lib/cli.js -d &> test/cli-test.out.daum
cat test/cli-test.in | lib/cli.js -p &> test/cli-test.out.pnu
cat test/cli-test.in | lib/cli.js -a &> test/cli-test.out.all

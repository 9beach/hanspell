#!/usr/bin/env bash

set -e

echo Tests hanspell-cli with option --daum.
cat test/cli-test.in | lib/cli.js -d 2>&1 | diff - test/cli-test.out.daum
echo Tests hanspell-cli with option --pnu.
cat test/cli-test.in | lib/cli.js -p 2>&1 | diff - test/cli-test.out.pnu
echo Tests hanspell-cli with option --all.
cat test/cli-test.in | lib/cli.js -a 2>&1 | diff - test/cli-test.out.all
echo Got it.

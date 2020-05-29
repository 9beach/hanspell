#!/usr/bin/env bash

set -e

out=`mktemp`
err=`mktemp`

echo Tests hanspell-cli with option --daum.
cat test/cli-test.in | lib/cli.js -d 2> $err > $out
diff $out test/cli-test.out.daum
diff $err test/cli-test.err.daum

echo Tests hanspell-cli with option --pnu.
cat test/cli-test.in | lib/cli.js -p 2> $err > $out
diff $out test/cli-test.out.pnu
diff $err test/cli-test.err.pnu

echo Tests hanspell-cli with option --all.
cat test/cli-test.in | lib/cli.js -a 2> $err > $out
diff $out test/cli-test.out.all
diff $err test/cli-test.err.all

echo Got it.

#!/usr/bin/env bash

set -e

REPO_PATH="$(dirname $(cd "$(dirname "$0")" > /dev/null 2>&1; pwd -P))"
cd $REPO_PATH

out=`mktemp`
err=`mktemp`

echo -n Tests hanspell-cli with option --daum.
cat test/cli.test.in | lib/cli.js -d 2> $err > $out
diff $out test/cli.test.out.daum
diff $err test/cli.test.err.daum
echo -e "\033[1;32m Ok \033[0m"

echo -n Tests hanspell-cli with option --naver.
cat test/cli.test.in | lib/cli.js -n 2> $err > $out
diff $out test/cli.test.out.naver
diff $err test/cli.test.err.naver
echo -e "\033[1;32m Ok \033[0m"

echo -n Tests hanspell-cli with option --all.
cat test/cli.test.in | lib/cli.js -a 2> $err > $out
diff $out test/cli.test.out.all
diff $err test/cli.test.err.all
echo -e "\033[1;32m Ok \033[0m"

rm $out $err

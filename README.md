# hanspell

`hanspell`은 (주)다음과 부산대학교 인공지능연구실/(주)나라인포테크의 웹 서비스를 이용한 한글 맞춤법 검사기입니다.

[비주얼 스튜디오 코드 한스펠](https://github.com/9beach/vscode-hanspell)과 [하스켈](https://www.haskell.org/)로 작성한 [hanspell-hs](https://github.com/9beach/hanspell-hs)도 있으니 참고하세요.

[![Build Status](https://travis-ci.org/9beach/hanspell.svg?branch=master)](https://travis-ci.org/9beach/hanspell) [![npm version](https://badge.fury.io/js/hanspell.svg)](https://badge.fury.io/js/hanspell)

## 설치

먼저 [Node.js](https://nodejs.org/ko/)를 설치한 뒤, 다음을 실행하면 `hanspell`을
설치합니다.

```sh
sudo npm install -g hanspell
```

설치 환경에 따라 `sudo` 명령어를 빼야 할 수 있습니다.

```sh
npm install -g hanspell
```

## 명령어 사용법

```console
$ hanspell-cli -h
사용법: hanspell-cli [-d | -p | -a | -h]

옵션:
  -d, --daum [default]    다음 서비스를 이용해서 맞춤법을 교정합니다
  -p, --pnu               부산대학교 서비스를 이용해서 맞춤법을 교정합니다
  -a, --all               두 서비스의 모든 결과를 반영해서 맞춤법을 교정합니다
  -h, --info              도움말을 출력합니다

버그 리포트와 제안: <https://github.com/9beach/hanspell/issues>
한스펠 홈 페이지: <https://github.com/9beach/hanspell/>
```

문장을 직접 입력하거나 클립보드에서 복사해서 맞춤법을 교정할 수 있습니다. 다음은
사용 예시입니다. <kbd>CTRL + D</kbd>는 줄을 바꾸고 맨 앞에서 입력해야 합니다.

<pre>
$ hanspell-cli
나는 차가운 모래속에 두 손을 넣고 검게 빛나는 바다를 바라본다.
우주의 가장자리 같다.
쇼코는 해변에 서 있으면 이세상의 변두리에 선 느낌이 든다고 말했었다.
<kbd>CTRL + D</kbd>
모래속에 <font color=grey>-></font> 모래 속에<font color=grey>
띄어쓰기 오류입니다. 대치어를 참고하여 고쳐 쓰세요.</font>
이세상의 <font color=grey>-></font> 이 세상의<font color=grey>
관형사는 뒤에 오는 말과 띄어 쓰는 것이 옳습니다.
...</font>
</pre>

![스크린샷](https://raw.githubusercontent.com/9beach/hanspell/master/hanspell-screenshot.png '한스펠 스크린샷')

파일의 맞춤법을 교정하려면 다음과 같이 명령합니다.

```sh
cat your-text | hanspell-cli
```

로그는 생략한 채 교정된 문장만 보려면 다음과 같이 명령합니다.

```console
$ cat your-text | hanspell-cli 2> /dev/null
나는 차가운 모래 속에 두 손을 넣고 검게 빛나는 바다를 바라본다.
우주의 가장자리 같다.
쇼코는 해변에 서 있으면 이 세상의 변두리에 선 느낌이 든다고 말했었다.
```

교정 제안만 보려면 다음과 같이 명령합니다.

```sh
cat your-text | hanspell-cli 2>&1 > /dev/null | grep '->'
```

클립보드에 복사된 문장을 교정하려면, 맥OS 사용자는 `pbpaste`,
X 윈도 시스템 사용자는 `xclip -o`, 마이크로소프트 윈도우 사용자는
`powershell.exe Get-Clipboard` 명령을 이용할 수 있습니다.

```sh
pbpaste | hanspell-cli
```

`~/.hanspell-ignore` 파일에 교정 대상에서 제외할 문자열을
[글로브 패턴](<https://ko.wikipedia.org/wiki/글로브_(프로그래밍)>)으로 지정할 수
있습니다. "그로떼스끄"로 시작하는 문자열과 "빠이"를 교정 대상에서 제외하려면
다음과 같이 설정하세요.

```txt
그로떼스끄*
빠이
```

`~/.hanspell-history` 파일에는 맞춤법 교정 내용이 기록됩니다.

```txt
내노라하는 -> 내로라하는
전세계 -> 전 세계
그 뿐만 -> 그뿐만
때 마다 -> 때마다
했는 지 -> 했는지
...
```

리눅스나 맥 OS 환경이라면 간단한 셸 스크립트로 자주 틀리는 순으로 정렬할 수 있습니다.

```console
$ sort < ~/.hanspell-history | uniq -c | sort -nr | head
  17 모래속에 -> 모래 속에
  13 곤색이다 -> 감색이다
  13 곤색의 -> 감색의
  13 한바퀴 -> 한 바퀴
  13 돌껀데 -> 돌 건데
  10 리랜드는 -> 이랜드는
   9 말했더만 -> 말했더구먼
   7 주름투성이 -> 주름 투성이
   7 암소여서도 -> 암소 여서도
   7 열두살 -> 열두 살
```

## 마이크로소프트 윈도우 환경

`hanspell`은 UTF-8 인코딩으로 저장된 파일만 인식합니다.

```bash
type your-text.utf-8 | hanspell-cli
```

홈 디렉터리의 `.hanspell-ignore` 파일 또한 UTF-8 인코딩으로 저장해야 합니다.

## 라이브러리 사용법

Node.js 프로젝트에서 `hanspell` 라이브러리를 사용하려면 먼저 다음을 실행하세요.

```bash
cd my-project && npm install --save hanspell
```

`hanspell` 라이브러리는 `spellCheckByDAUM`과 `spellCheckByPNU`, 두 개의
함수를 제공합니다. 다음은 사용 예입니다.

```javascript
// hanspell-example.js
const hanspell = require('hanspell');

const sentence = '리랜드는 얼굴 골격이 굵은게,';
const end = function () {
  console.log('// check ends');
};
const error = function (err) {
  console.error('// error: ' + err);
};

hanspell.spellCheckByDAUM(sentence, 6000, console.log, end, error);
hanspell.spellCheckByPNU(sentence, 6000, console.log, end, error);
```

다음의 결과가 예상됩니다.

```console
[
  {
    type: 'space',
    token: '굵은게,',
    suggestions: [ '굵은 게,' ],
    context: '얼굴 골격이 굵은게,'
  }
]
// check ends
[
  {
    token: '리랜드는',
    suggestions: [ '이랜드는' ],
    info: '철자 검사를 해 보니 이 어절은 분석할 수 없으므로...'
  },
  {
    token: '굵은게',
    suggestions: [ '굵은 게', '굵은데' ],
    info: '어미의 사용이 잘못되었습니다. 문서 작성시 필요에...'
  }
]
// check ends
```

두 함수의 호출 결과는 모두 `token`, `suggestions` 속성을 가집니다.
`spellCheckByDAUM`의 결과는 `type`, `context` 속성을, `spellCheckByPNU`의 결과는 `info` 속성을 추가로 가집니다.

위의 예시에서 `sentence`가 300 단어 또는 1000자를 넘으면, 인자로 전달된
`console.log`는 여러 번 호출되지만 `end`는 항상 마지막에 한 번만 호출됩니다.

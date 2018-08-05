# hanspell
`hanspell`은 다음(주), 부산대학교의 웹 서비스를 이용한 한글 맞춤법 검사기입니다.

[![Build Status](https://travis-ci.org/9beach/hanspell.svg?branch=master)](https://travis-ci.org/9beach/hanspell) [![npm version](https://badge.fury.io/js/hanspell.svg)](https://badge.fury.io/js/hanspell)

## 설치
셸에서 `hanspell-cli` 명령어를 사용하려면 아래와 같이 설치합니다. 
```sh
$ sudo npm install -g hanspell
```
`node.js` 프로젝트에서 `hanspell` 라이브러리를 사용하려면 아래와 같이 
설치합니다. 
```
$ cd my-project
$ npm install hanspell
```

## 명령어 사용법

```
$ hanspell-cli -h
사용법: cat your-text | hanspell-cli [-d | -p | -j | -a] 

옵션:
  -d, --daum              다음 서비스를 이용해서 맞춤법을 교정합니다
  -p, --pnu               부산대학교 서비스를 이용해서 맞춤법을 교정합니다
  -j, --joint             두 서비스의 공통 결과만 반영해서 맞춤법을 교정합니다
  -a, --all [default]     두 서비스의 모든 결과를 반영해서 맞춤법을 교정합니다
```

아래는 예시입니다.
```
$ cat your-text
나는 차가운 모래속에 두 손을 넣고 검게 빛나는 바다를 바라본다.
우주의 가장자리 같다.
쇼코는 해변에 서 있으면 이세상의 변두리에 선 느낌이 든다고 말했었다.
$ cat your-text | hanspell-cli
# hanspell: 모래속에 -> 모래 속에
# hanspell: 이세상의 -> 이 세상의
나는 차가운 모래 속에 두 손을 넣고 검게 빛나는 바다를 바라본다.
우주의 가장자리 같다.
쇼코는 해변에 서 있으면 이 세상의 변두리에 선 느낌이 든다고 말했었다.
```
변경 로그는 생략한 채 교정된 문장만 보고 싶다면 아래와 같이 명령할 수 있습니다.
```
$ cat your-text | hanspell-cli 2> /dev/null
나는 차가운 모래 속에 두 손을 넣고 검게 빛나는 바다를 바라본다.
우주의 가장자리 같다.
쇼코는 해변에 서 있으면 이 세상의 변두리에 선 느낌이 든다고 말했었다.
```
클립보드에 복사된 문장의 맞춤법을 검사하고 싶다면, 매킨토시 사용자는 `pbpaste`
명령을, X 윈도 시스템 사용자는 `xclip` 명령을 이용할 수 있습니다.
```
$ pbpaste | hanspell-cli
```

## 라이브러리 사용법
`hanspell` 라이브러리는 `checkSpellWithDAUM`과 `checkSpellWithPNU`, 두 개의 
함수를 제공합니다. 아래는 예시입니다.
```js
// hanspell-test.js
const hanspell = require('hanspell');

const sentence =
`나는 차가운 모래속에 두손을 넣고 검게 빛나는 바다를 바라본다.
우주의 가장자리 같다.
쇼코는 해변에 서 있으면 이세상의 변두리에 선 느낌이 든다고 말했었다.`;

const endDAUM = function () { console.log("DAUM END"); };
const endPNU = function () { console.log("Pusan Univ. END"); };
const error = function (err) { console.error("HTTP status code: " + err); };

hanspell.checkSpellWithDAUM(sentence, 6000, console.log, endDAUM, error);
hanspell.checkSpellWithPNU(sentence, 6000, console.log, endPNU, error);
```
아래의 결과가 예상됩니다.
```sh
$ node hanspell-test.js
[ { errorType: 'daum space',
    errorInput: '모래속에',
    errorOutput: '모래 속에',
    errorContext: '나는 차가운 모래속에 두손을 넣고' },
  { errorType: 'daum space',
    errorInput: '두손을',
    errorOutput: '두 손을',
    errorContext: '차가운 모래속에 두손을 넣고 검게' },
  { errorType: 'daum space',
    errorInput: '이세상의',
    errorOutput: '이 세상의',
    errorContext: '서 있으면 이세상의 변두리에 선' } ]
DAUM END
[ { errorInput: '모래속에', errorOutput: '모래 속에' },
  { errorInput: '두손을', errorOutput: '두 손을' },
  { errorInput: '이세상의', errorOutput: '이 세상의' } ]
Pusan Univ. END
```
위의 예시에서 `sentence`가 300 단어나 1000 자가 넘었다면 `console.log`는 
여러 번 호출되었겠지만, `endDAUM`과 `endPNU`는 항상 한 번만 호출됩니다.

## 남은 일
* MS 윈도우 사용자를 위해 인코딩 설정 추가.
* 라이브러리 실행 결과 JSON에 설명과 예시 항목 추가.
* 일렉트론을 이용한 UI 버전 개발.
* Atom, VS Code를 위한 `lint` 플러그인 개발.

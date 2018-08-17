# hanspell
`hanspell`은 (주)다음과 부산대학교 인공지능연구실/(주)나라인포테크의 웹 
서비스를 이용한 한글 맞춤법 검사기입니다.

[![Build Status](https://travis-ci.org/9beach/hanspell.svg?branch=master)](https://travis-ci.org/9beach/hanspell) [![npm version](https://badge.fury.io/js/hanspell.svg)](https://badge.fury.io/js/hanspell)

## 설치
셸에서 `hanspell-cli` 명령어를 사용하려면 다음과 같이 설치합니다. 
```
$ sudo npm install -g hanspell
```
Node.js 프로젝트에서 `hanspell` 라이브러리를 사용하려면 다음과 같이 
설치합니다. 
```
$ cd my-project
$ npm install hanspell
```

## 명령어 사용법

```
$ hanspell-cli -h
사용법: hanspell-cli [-d | -p | -j | -a | -h] 

옵션:
  -d, --daum              다음 서비스를 이용해서 맞춤법을 교정합니다
  -p, --pnu               부산대학교 서비스를 이용해서 맞춤법을 교정합니다
  -j, --joint             두 서비스의 공통 결과만 반영해서 맞춤법을 교정합니다
  -a, --all [default]     두 서비스의 모든 결과를 반영해서 맞춤법을 교정합니다
  -h, --help              도움말을 출력합니다
```

문장을 직접 입력하거나 클립보드에서 복사해서 맞춤법을 교정합니다. 다음은 사용 
예시입니다.
<pre style="width: 100%; background-color: #171717 !important;color: #e4e4e4 !important;">
$ hanspell-cli
나는 차가운 모래속에 두 손을 넣고 검게 빛나는 바다를 바라본다.
우주의 가장자리 같다.
쇼코는 해변에 서 있으면 이세상의 변두리에 선 느낌이 든다고 말했었다.
<kbd>CTRL + D</kbd>
모래속에 <font color=grey>→</font> 모래 속에<font color=grey>
띄어쓰기 오류입니다. 대치어를 참고하여 고쳐 쓰세요.</font>
이세상의 <font color=grey>→</font> 이 세상의<font color=grey>
관형사는 뒤에 오는 말과 띄어 쓰는 것이 옳습니다.
<i>...</i>
</pre>

![스크린샷](test/hanspell-screenshot.png?raw=true "스크린샷")

파일의 맞춤법을 교정하려면 다음과 같이 명령합니다.
```
$ cat your-text | hanspell-cli
```
로그는 생략한 채 교정된 문장만 보려면 다음과 같이 명령합니다.
```
$ cat your-text | hanspell-cli 2> /dev/null
나는 차가운 모래 속에 두 손을 넣고 검게 빛나는 바다를 바라본다.
우주의 가장자리 같다.
쇼코는 해변에 서 있으면 이 세상의 변두리에 선 느낌이 든다고 말했었다.
```
교정 제안만 보려면 다음과 같이 명령합니다.
```
$ cat your-text | hanspell-cli 2>&1 > /dev/null | grep '→'
```
클립보드에 복사된 문장을 입력 없이 바로 교정하려면, 
매킨토시 사용자는 `pbpaste` 명령을, X 윈도 시스템 사용자는 `xclip -o` 명령을 
이용할 수 있습니다.
```
$ pbpaste | hanspell-cli
```
마이크로소프트 윈도우 사용자는 먼저 명령 창에서 코드 페이지를 UTF-8으로 바꿔야 
합니다.
```
C:\>chcp 65001 
C:\>type your-text.utf-8 | hanspell-cli
```

## 라이브러리 사용법
`hanspell` 라이브러리는 `spellCheckByDAUM`과 `spellCheckByPNU`, 두 개의 
함수를 제공합니다. 다음은 사용 예시입니다.
```javascript
// hanspell-example.js
const hanspell = require('hanspell');

const sentence = '리랜드는 얼굴 골격이 굵은게,';
const end = function () { console.log("// check ends"); };
const error = function (err) { console.error("// error: " + err); };

hanspell.spellCheckByDAUM(sentence, 6000, console.log, end, error);
hanspell.spellCheckByPNU(sentence, 6000, console.log, end, error);
```
다음의 결과가 예상됩니다.
```javascript
[ { type: 'space',
    token: '굵은게,',
    suggestions: [ '굵은 게,' ],
    context: '얼굴 골격이 굵은게,',
    info: '뒤에 오는 명사를 수식하는 관형격 어미 ‘-ㄴ’, ‘-는’, ‘-던’, ‘-ㄹ’ 등과 의존명사는 띄어 쓰는 것이 옳습니다.\n\n(예)\n노력한 만큼 대가를 얻다.\n소문으로만 들었을 뿐이네.\n합격했다는 소리를 들으니 그저 기쁠 따름이다.' } ]
// check ends
[ { token: '리랜드는',
    suggestions: [ '이랜드는', '시랜드는' ],
    info: '철자 검사를 해 보니 이 어절은 분석할 수 없으므로 틀린 말로 판단하였습니다.\n\n후보 어절은 이 철자검사/교정기에서 띄어쓰기, 붙여 쓰기, 음절대치와 같은 교정방법에 따라 수정한 결과입니다.\n\n후보 어절 중 선택하시거나 오류 어절을 수정하여 주십시오.\n\n* 단, 사전에 없는 단어이거나 사용자가 올바르다고 판단한 어절에 대해서는 통과하세요!!' },
  { token: '굵은게',
    suggestions: [ '굵은 게', '굵은데' ],
    info: '어미의 사용이 잘못되었습니다. 문서 작성시 필요에 의해 잘못된 어미를 제시하는 상황이 아니라면 검사기의 대치어로 바꾸도록 합니다.' } ]
// check ends
```
두 함수의 호출 결과는 모두 `token`, `suggestions`, `info` 속성을 가집니다.
`spellCheckByDAUM`의 결과는 `type`, `context` 속성을 추가로 가집니다. 

위의 예시에서 `sentence`가 300 단어 또는 1000자를 넘으면, 인자로 전달된
`console.log`는 여러 번 호출되지만 `end`는 항상 마지막에 한 번만 호출됩니다.

## 남은 일
- [x] 라이브러리 호출 결과 JSON에 설명과 예시 속성 추가.
- [ ] HTML 버전 개발.
- [ ] 일렉트론을 이용한 UI 버전 개발.
- [ ] Atom과 VS Code를 위한 `lint` 인터페이스 플러그인 개발.

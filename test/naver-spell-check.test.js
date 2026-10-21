const assert = require('assert');
const spellCheck = require('../lib/naver-spell-check');

let originalFetch;

function mockResponse(body) {
  return { ok: true, status: 200, text: async () => body };
}

describe('spellCheckByNAVER', () => {
  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('completes empty input without making a request', (done) => {
    let requests = 0;
    global.fetch = async () => {
      requests += 1;
      throw new Error('unexpected network request');
    };

    spellCheck(
      '',
      100,
      (data) => assert.deepStrictEqual(data, []),
      () => {
        try {
          assert.strictEqual(requests, 0);
          done();
        } catch (error) {
          done(error);
        }
      },
      done,
    );
  });

  it('applies the timeout while fetching the passport key', (done) => {
    let requestSignal;
    let reportedError;
    global.fetch = (input, options = {}) => {
      assert.ok(String(input).startsWith('https://search.naver.com/'));
      requestSignal = options.signal;
      return new Promise((resolve, reject) => {
        if (!requestSignal) return;
        requestSignal.addEventListener(
          'abort',
          () => {
            const error = new Error('aborted by timeout');
            error.name = 'AbortError';
            reject(error);
          },
          { once: true },
        );
      });
    };

    spellCheck(
      'synthetic input',
      10,
      () => done(new Error('unexpected successful response')),
      () => {
        try {
          assert.ok(requestSignal);
          assert.strictEqual(requestSignal.aborted, true);
          assert.strictEqual(reportedError.name, 'AbortError');
          done();
        } catch (error) {
          done(error);
        }
      },
      (error) => {
        reportedError = error;
      },
    );
  }).timeout(1000);

  it('parses a synthetic result using local fetch stubs', (done) => {
    const requests = [];
    global.fetch = async (input, options = {}) => {
      const url = String(input);
      requests.push(url);
      assert.ok(options.signal, 'fetch should receive the operation timeout');

      if (url.startsWith('https://search.naver.com/')) {
        return mockResponse('passportKey=deadbeef');
      }
      if (url.startsWith('https://m.search.naver.com/')) {
        assert.strictEqual(new URL(url).searchParams.get('q'), 'teh');
        const result = {
          message: {
            result: {
              errata_count: 1,
              origin_html: "<span class='result_underline'>teh</span>",
              html: "<em class='red_text'>the</em>",
            },
          },
        };
        return mockResponse(`jQuery(${JSON.stringify(result)})`);
      }
      throw new Error(`unexpected URL: ${url}`);
    };

    spellCheck(
      'teh',
      100,
      (data) => {
        assert.deepStrictEqual(data, [
          {
            token: 'teh',
            suggestions: ['the'],
            info: '맞춤법 오류입니다.',
          },
        ]);
      },
      () => {
        try {
          assert.strictEqual(requests.length, 2);
          done();
        } catch (error) {
          done(error);
        }
      },
      done,
    );
  });
});

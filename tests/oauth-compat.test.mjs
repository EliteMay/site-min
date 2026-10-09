import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const file = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

for (const route of ['login', 'consent']) {
  test('Legacy ' + route + ' redirects to pc-agent and preserves authorization context', () => {
    const html = file('oauth/' + route + '/index.html');
    const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
    assert.ok(script, 'redirect script');
    let destination = '';
    const location = {
      origin: 'https://elitemay.github.io',
      search: '?authorization_id=123%3AABC&state=ok%20test',
      hash: '#deep-link',
      replace: (value) => { destination = value; },
    };
    runInNewContext(script, { URL, location });
    assert.equal(destination,
      'https://elitemay.github.io/pc-agent/oauth/' + route + '/?authorization_id=123%3AABC&state=ok%20test#deep-link');
    assert.match(html, /<html lang="ja">/);
  });

  test('Legacy ' + route + ' never processes credentials or authorizations', () => {
    const html = file('oauth/' + route + '/index.html');
    for (const banned of ['@supabase/supabase-js', 'sb_publishable_', 'service_role', 'sb_secret_', 'signInWithPassword', 'approveAuthorization', 'denyAuthorization', 'getAuthorizationDetails']) {
      assert.ok(!html.includes(banned), banned);
    }
    assert.ok(!/type="password"/i.test(html));
    assert.ok(!/window\.open/i.test(html));
    assert.ok(html.includes('/pc-agent/oauth/' + route + '/'));
  });
}

test('Health Support remains the site homepage with existing asset paths', () => {
  const html = file('index.html');
  assert.match(html, /Health Support/);
  assert.match(html, /kcal\.js/);
  assert.match(html, /れんじ\.css/);
});

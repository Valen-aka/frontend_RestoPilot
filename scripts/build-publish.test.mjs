import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicApiUrl} from './build-publish.mjs';
test('publication accepts only a public HTTPS API URL without credentials', () => {
  assert.equal(publicApiUrl('https://api.example.invalid/api/'), 'https://api.example.invalid/api');
  for (const value of ['', 'http://localhost:8081/api', 'https://localhost/api', 'https://user:secret@example.invalid/api', 'https://example.invalid/api?key=secret', 'https://example.invalid/api#secret', 'https://example.invalid']) assert.throws(() => publicApiUrl(value));
});

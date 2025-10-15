import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import assert from 'node:assert';
import { AgifyWorld } from '../support/world';
import { agifyClient } from '../../src/api/agifyClient';

Given('the Agify base URL', function (this: AgifyWorld) {
  assert.ok(agifyClient.baseURL);
});

When('I request the age for name {string}', async function (this: AgifyWorld, name: string) {
  this.response = await agifyClient.getSingle({ name });
});

When(
  'I request the age for name {string} with country {string}',
  async function (this: AgifyWorld, name: string, country: string) {
    this.response = await agifyClient.getSingle({ name, country_id: country });
  }
);

When('I request the ages for the list of names', async function (this: AgifyWorld) {
  assert.ok(this.names && this.names.length > 0, 'names must be set in the World');
  this.response = await agifyClient.getBatch(this.names);
});

When('I request the age with no name', async function (this: AgifyWorld) {
  this.response = await agifyClient.getRaw('');
});

Given('I have the following names:', function (this: AgifyWorld, table: DataTable) {
  this.names = table.rows().map((r) => r[0]);
});

Then('the response status should be {int}', function (this: AgifyWorld, status: number) {
  assert.strictEqual(
    this.response.status,
    status,
    `Expected ${status}, got ${this.response.status}. Body: ${JSON.stringify(this.response.data)}`
  );
});

Then('the response content type should be {string}', function (this: AgifyWorld, expected: string) {
  const ct = (this.response.headers['content-type'] || '').toLowerCase();
  assert.strictEqual(ct, expected.toLowerCase());
});

Then('the JSON should contain a non-empty string at {string}', function (this: AgifyWorld, path: string) {
  const val = get(this.response.data, path);
  assert.strictEqual(typeof val, 'string');
  assert.ok(val.trim().length > 0);
});

Then('the JSON should contain a number at {string}', function (this: AgifyWorld, path: string) {
  const val = get(this.response.data, path);
  assert.strictEqual(typeof val, 'number');
});

Then('the JSON at {string} should equal {string}', function (this: AgifyWorld, path: string, expected: string) {
  const val = get(this.response.data, path);
  assert.strictEqual(val, expected);
});

/**
 * Case- and diacritic-insensitive equality
 * e.g., 'José' === 'jose'
 */
Then(
  'the JSON at {string} should equalCaseInsensitive {string}',
  function (this: AgifyWorld, path: string, expected: string) {
    const val = String(get(this.response.data, path));
    const actualNorm = normalizeDiacritics(val).toLowerCase();
    const expectedNorm = normalizeDiacritics(expected).toLowerCase();
    assert.strictEqual(actualNorm, expectedNorm);
  }
);

/**
 * Case- and diacritic-insensitive containment
 * e.g., 'Michael Jordan' contains 'michael'
 */
Then(
  'the JSON at {string} should containCaseInsensitive {string}',
  function (this: AgifyWorld, path: string, fragment: string) {
    const val = String(get(this.response.data, path));
    const actualNorm = normalizeDiacritics(val).toLowerCase();
    const fragNorm = normalizeDiacritics(fragment).toLowerCase();
    assert.ok(
      actualNorm.includes(fragNorm),
      `Expected "${val}" to contain "${fragment}" (case/diacritic-insensitive)`
    );
  }
);

Then(
  'the response should be a JSON array of length {int}',
  function (this: AgifyWorld, expected: number) {
    assert.ok(Array.isArray(this.response.data), 'Response is not an array');
    assert.strictEqual(this.response.data.length, expected);
  }
);

Then(
  'every item should contain keys {string}, {string}, and {string}',
  function (this: AgifyWorld, k1: string, k2: string, k3: string) {
    assert.ok(Array.isArray(this.response.data), 'Response is not an array');
    for (const item of this.response.data as any[]) {
      assert.ok(k1 in item, `Missing key ${k1}`);
      assert.ok(k2 in item, `Missing key ${k2}`);
      assert.ok(k3 in item, `Missing key ${k3}`);
    }
  }
);

Then('the JSON error message should contain {string}', function (this: AgifyWorld, fragment: string) {
  const msg = String(this.response.data?.error || '');
  assert.ok(msg.includes(fragment), `Expected error to contain: ${fragment} but was: ${msg}`);
});

Then('the JSON at {string} should be null', function (this: AgifyWorld, path: string) {
    const val = get(this.response.data, path);
    assert.strictEqual(val, null, `Expected ${path} to be null but was: ${val}`);
  });
   
Then('the JSON at {string} should equalNumber {int}', function (this: AgifyWorld, path: string, expected: number) {
    const val = get(this.response.data, path);
    assert.strictEqual(typeof val, 'number', `Expected ${path} to be a number but was: ${typeof val}`);
    assert.strictEqual(val, expected, `Expected ${path} to equal ${expected} but was: ${val}`);
  });

// ------------ small utils ------------

function get(obj: any, path: string) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function normalizeDiacritics(s: string) {
  // NFD splits letters + diacritics; the regex removes combining marks.
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}


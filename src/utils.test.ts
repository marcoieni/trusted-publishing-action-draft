import {describe, expect, test} from '@jest/globals';
import {getTokensEndpoint} from './utils.js';

describe('getTokensEndpoint', () => {
  test('returns the correct endpoint URL', () => {
    expect(getTokensEndpoint("https://example.com")).toBe('https://example.com/api/v1/trusted_publishing/tokens');
  });
});

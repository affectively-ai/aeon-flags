import { describe, it, expect } from 'bun:test';
import { generateESIFlagTag } from '../src/esi.js';

describe('ESI Generators', () => {
  it('should generate ESI tags for a flag', () => {
    const tag = generateESIFlagTag(
      'beta-feature',
      '<div>Beta Content</div>',
      '<div>Standard Content</div>'
    );

    expect(tag).toContain('<esi:choose>');
    expect(tag).toContain('<esi:when test="$(flag_beta-feature) == \'1\'">');
    expect(tag).toContain('<div>Beta Content</div>');
    expect(tag).toContain('<esi:otherwise>');
    expect(tag).toContain('<div>Standard Content</div>');
  });

  it('should handle missing fallback content gracefully', () => {
    const tag = generateESIFlagTag('beta-feature', '<div>Beta Content</div>');

    expect(tag).toContain('<esi:otherwise>');
    expect(tag).not.toContain('undefined'); // Default fallback should be empty string
  });
});

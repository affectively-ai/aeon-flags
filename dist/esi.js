/**
 * Edge Side Inference (ESI) integrations for Goodchild.
 * Allows using feature flags as `<ESI.Flag name="foo">` in Aeon Flux environments,
 * evaluating rendering based on UCAN context without main-thread hydration.
 */
/**
 * Sanitize a flag name for safe interpolation in ESI tags.
 * Removes characters that could break ESI tag parsing or inject malicious content.
 */
function sanitizeESIFlagName(name) {
    return name.replace(/[^a-zA-Z0-9_-]/g, '');
}
/**
 * A theoretical helper representing how ESI might inject flag values into the DOM.
 * In a real Aeon Flux setup, this would emit an <esi:flag> tag that the Cloudflare Worker intercepts.
 */
export function generateESIFlagTag(name, content, fallbackContent = '') {
    const safeName = sanitizeESIFlagName(name);
    // ESI processors at the edge will evaluate the variable "flag_{name}" defined by FlagManager.generateESIVariables()
    return `
    <esi:choose>
      <esi:when test="$(flag_${safeName}) == '1'">
        ${content}
      </esi:when>
      <esi:otherwise>
        ${fallbackContent}
      </esi:otherwise>
    </esi:choose>
  `.trim();
}

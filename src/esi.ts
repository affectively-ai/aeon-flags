/**
 * Edge Side Inference (ESI) integrations for Goodchild.
 * Allows using feature flags as `<ESI.Flag name="foo">` in Aeon Flux environments,
 * evaluating rendering based on UCAN context without main-thread hydration.
 */

export interface ESIFlagProps {
  name: string;
  fallback?: boolean;
  children: any;
}

/**
 * A theoretical helper representing how ESI might inject flag values into the DOM.
 * In a real Aeon Flux setup, this would emit an <esi:flag> tag that the Cloudflare Worker intercepts.
 */
export function generateESIFlagTag(
  name: string,
  content: string,
  fallbackContent: string = ''
): string {
  // ESI processors at the edge will evaluate the variable "flag_{name}" defined by FlagManager.generateESIVariables()
  return `
    <esi:choose>
      <esi:when test="$(flag_${name}) == '1'">
        ${content}
      </esi:when>
      <esi:otherwise>
        ${fallbackContent}
      </esi:otherwise>
    </esi:choose>
  `.trim();
}

import { richTextUtils } from 'jimu-ui'

/**
 * Replace the text content with new plain text
 *
 * Note: The placeholder must be a nested structure of tags with the text inside:
 *   Correct: <p><strong>foo</strong></p>
 *   Wrong:   <p>foo<strong>bar</strong></p>
 * @param placeholder
 * @param textContent
 */
export const replacePlaceholderTextContent = (placeholder: string, textContent: string) => {
  const plaintext = richTextUtils.getHTMLTextContent(placeholder)
  return placeholder.replace(plaintext?.trim(), textContent)
}

import { richTextUtils } from 'jimu-ui'
import { replacePlaceholderTextContent } from '../src/utils'

describe('common utils test', function () {
  it('replacePlaceholderTextContent', () => {
    expect(replacePlaceholderTextContent('<strong>foo</strong>', richTextUtils.BLANK_CHARATER)).toBe('<strong>\uFEFF</strong>')
    expect(replacePlaceholderTextContent('foo', richTextUtils.BLANK_CHARATER)).toBe('\uFEFF')
  })
})

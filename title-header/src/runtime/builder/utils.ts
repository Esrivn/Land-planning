import { Immutable, ImmutableArray, ExpressionPart, IMExpressionMap, UseDataSource } from 'jimu-core'
import { sanitizer, richTextUtils } from 'jimu-ui'
import { replacePlaceholderTextContent } from '../../utils'

export const DATA_SOURCE_ID_REGEXP = /data-dsid=\"(((?![\=|\>|\"]).)*)[\"\>|"\s)]/gm

export const getDataSourceIds = (useDataSources: ImmutableArray<UseDataSource> = Immutable([])): ImmutableArray<string> => {
  return useDataSources.map(ds => ds.dataSourceId)
}

/**
 * Getting the data source ids from html string through regular expressions
 *
 * @param html
 *
 * <p> ddd<exp data-uniqueid="e3c" data-dsid="ds_1" data-expression="{name: value}">{Rank}</exp>
 * <a href="#" target="_blank" data-uniqueid="9721" data-dsid="ds_2" data-link="{name:value}">link</a></p>
 *
 * @returns ['ds_1', 'ds_2']
 */
export const getUseDataSourceIds = (html: string): string[] => {
  const regexp = DATA_SOURCE_ID_REGEXP
  let strings = []
  let matches
  while ((matches = regexp.exec(html)) !== null) {
    let ids = matches[1]
    if (ids.indexOf(',') > 0) {
      ids = ids.split(',')
      strings = strings.concat(ids)
    } else {
      strings.push(ids)
    }
  }
  return strings
}

export const getInvalidDataSourceIds = (text: string, useDataSources: ImmutableArray<UseDataSource>): string[] => {
  const ids = getUseDataSourceIds(text)
  if (ids == null || ids.length <= 0) {
    return
  }
  const uds = getDataSourceIds(useDataSources)
  const dsids = ids.filter(id => !uds.includes(id))
  if (dsids.length >= 0) {
    return dsids
  }
}

/**
 * Get expression parts from expressions
 * @param expressions
 */
export const getExpressionParts = (expressions: IMExpressionMap): ExpressionPart[] => {
  console.log(expressions);

  let parts = []
  for (const uniqueid in expressions) {
    const expression = expressions[uniqueid]
    const iparts = expression?.parts
    if (iparts != null) {
      parts = parts.concat(iparts)
    }
  }
  return parts
}

/**
 * When `value` is empty and `enabled` is false, show the placeholder in editor
 *
 * @param value config.text
 * @param placeholder config.placeholder
 * @param enabled rich text editor is enabled or not
 */
export const shouldShowPlaceholder = (value: string, placeholder: string, enabled?: boolean): boolean => {
  const onlyPlaceholder = richTextUtils.isBlankRichText(value) && !!placeholder
  if (typeof enabled !== 'undefined') {
    return !enabled && onlyPlaceholder
  }
  return onlyPlaceholder
}

export const sanitizeHTML = (html = ''): string => {
  return html !== '' ? sanitizer.sanitize(html) : html
}

/**
 * Get the default value of the rich text editor
 */
export const getDefaultValue = (enabled: boolean, value: string, placeholder: string = ''): string => {
  let defaultValue = value
  const showPlaceholder = shouldShowPlaceholder(value, placeholder)
  if (enabled) {
    // When editor is enabled and `showPlaceholder` is true, will show placeholder without textContent in editor
    if (showPlaceholder) {
      defaultValue = replacePlaceholderTextContent(placeholder, richTextUtils.BLANK_CHARATER)
    }
  } else {
    // When editor is not enabled, if `showPlaceholder` is true, show placeholder in editor, otherwise, show value in editor
    defaultValue = showPlaceholder ? placeholder : value
  }

  return sanitizeHTML(defaultValue)
}

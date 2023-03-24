/** @jsx jsx */
import { React, jsx, css, classNames, ImmutableArray, polished, UseDataSource, LinkType } from 'jimu-core'
import { FontFamily, Indent, Size, LinkSetting, ListValue, FormatType, Formats, RichTextFormatKeys, LinkFormatValue } from 'jimu-ui/advanced/rich-text-editor'
import { Button, NumericInput, ButtonGroup, hooks } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { Effects } from './effects'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { TextAlignment } from 'jimu-ui/advanced/style-setting-components'
import { BoldOutlined } from 'jimu-icons/outlined/editor/bold'
import { ItalicOutlined } from 'jimu-icons/outlined/editor/italic'
import { UnderscoreOutlined } from 'jimu-icons/outlined/editor/underscore'
import { StrikeThroughOutlined } from 'jimu-icons/outlined/editor/strike-through'
import { TextDotsOutlined } from 'jimu-icons/outlined/editor/text-dots'
import { TextNumberOutlined } from 'jimu-icons/outlined/editor/text-number'
import uppercaseOutlined from 'jimu-icons/svg/outlined/editor/uppercase.svg'
import colorFillFilled from 'jimu-icons/svg/filled/editor/color-fill.svg'
import { useTheme2 } from 'jimu-theme'

const DEFAULTLETTERSIZE = '0px'
const DEFAULLINESTACE = 1.5

export interface RichFormatsPanelPorps {
  widgetId: string
  className?: string
  style?: any
  useDataSources?: ImmutableArray<UseDataSource>
  formats?: Formats
  onChange?: (key: RichTextFormatKeys, value: any, type: FormatType) => void
  disableIndent?: boolean
}

const style = css`
  > * {
    user-select: none;
  }
  .jimu-widget-setting--row {
    margin-top: ${polished.rem(12)}
  }
`

export const RichFormatsPanel = (props: RichFormatsPanelPorps): React.ReactElement => {
  const appTheme = useTheme2()

  const { formats = {}, onChange, className, style: propStyle, useDataSources, widgetId, disableIndent } = props

  const translate = hooks.useTranslate()

  const handleListChange = (value: ListValue): void => {
    const list = formats.list === value ? false : value
    onChange?.(RichTextFormatKeys.List, list, FormatType.BLOCK)
  }

  const handleLinespaceChange = (evt: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>): void => {
    const value = +evt.currentTarget.value
    onChange?.(RichTextFormatKeys.Linespace, value, FormatType.BLOCK)
  }

  const handleLinkChange = (key: RichTextFormatKeys, value: LinkFormatValue, type: FormatType): void => {
    const link = value?.link?.linkType === LinkType.None ? false : value
    onChange?.(key, link, type)
  }

  return (
    <div css={style} style={propStyle} className={classNames(className, 'format-panel')}>
      <SettingRow>
        <div className='d-flex align-items-center justify-content-between w-100'>
          <FontFamily style={{ width: '61%' }} font={formats.font} onChange={v => onChange(RichTextFormatKeys.Font, v, FormatType.INLINE)} />
          <Size style={{ width: '35%' }} value={formats.size} onChange={v => onChange(RichTextFormatKeys.Size, v, FormatType.INLINE)} />
        </div>
      </SettingRow>

      <SettingRow>
        <div className='d-flex align-items-center justify-content-between w-100'>
          <ButtonGroup size='sm'>
            <Button
              title={translate('bold')} active={formats[RichTextFormatKeys.Bold]} icon size='sm'
              onClick={() => onChange(RichTextFormatKeys.Bold, !(formats[RichTextFormatKeys.Bold] as boolean), FormatType.INLINE)}
            >
              <BoldOutlined />
            </Button>
            <Button
              title={translate('italic')} active={formats[RichTextFormatKeys.Italic]} icon size='sm'
              onClick={() => onChange(RichTextFormatKeys.Italic, !(formats[RichTextFormatKeys.Italic] as boolean), FormatType.INLINE)}
            >
              <ItalicOutlined />
            </Button>
            <Button
              title={translate('strike')} active={formats[RichTextFormatKeys.Strike]} icon size='sm'
              onClick={() => onChange(RichTextFormatKeys.Strike, !(formats[RichTextFormatKeys.Strike] as boolean), FormatType.INLINE)}
            >
              <StrikeThroughOutlined />
            </Button>
            <Button
              title={translate('underline')} active={formats[RichTextFormatKeys.Underline]} icon size='sm'
              onClick={() => onChange(RichTextFormatKeys.Underline, !(formats[RichTextFormatKeys.Underline] as boolean), FormatType.INLINE)}
            >
              <UnderscoreOutlined />
            </Button>
          </ButtonGroup>

          <div className='d-flex align-items-center justify-content-between' style={{ width: '50%' }}>
            <ThemeColorPicker
              icon={colorFillFilled}
              type='with-icon'
              title={translate('highlight')}
              specificTheme={appTheme}
              value={formats.background} onChange={v => onChange(RichTextFormatKeys.Background, v, FormatType.INLINE)}
            />
            <ThemeColorPicker
              icon={uppercaseOutlined}
              type='with-icon'
              title={translate('fontColor')}
              specificTheme={appTheme}
              value={formats.color} onChange={v => onChange(RichTextFormatKeys.Color, v, FormatType.INLINE)}
            />
            <LinkSetting
              widgetId={widgetId}
              style={{ width: 42 }}
              value={formats.link}
              active={formats[RichTextFormatKeys.Link]}
              useDataSources={useDataSources}
              onChange={handleLinkChange}
            />
          </div>
        </div>
      </SettingRow>

      <SettingRow>
        <div className='d-flex align-items-center justify-content-between w-100'>

          <TextAlignment autoFlip textAlign={formats.align} showJustify onChange={(value) => onChange(RichTextFormatKeys.Align, value, FormatType.BLOCK)} />

          <ButtonGroup>
            <Button title={translate('bullet')} active={formats.list === ListValue.BULLET} icon size='sm' onClick={() => handleListChange(ListValue.BULLET)}>
              <TextDotsOutlined />
            </Button>
            <Button title={translate('numbering')} active={formats.list === ListValue.ORDERED} icon size='sm' onClick={() => handleListChange(ListValue.ORDERED)}>
              <TextNumberOutlined />
            </Button>
          </ButtonGroup>

          <Indent disabled={disableIndent} value={formats.indent} onClick={(value) => onChange(RichTextFormatKeys.Indent, value, FormatType.BLOCK)} />
        </div>
      </SettingRow>

      <SettingRow flow='no-wrap' label={translate('characterSpacing')}>
        <Size style={{ width: '35%' }} value={formats.letterspace ?? DEFAULTLETTERSIZE} onChange={v => onChange(RichTextFormatKeys.Letterspace, v, FormatType.INLINE)} />
      </SettingRow>

      <SettingRow flow='no-wrap' label={translate('lineSpacing')}>
        <NumericInput
          style={{ width: '35%' }} size='sm' value={formats.linespace ?? DEFAULLINESTACE}
          showHandlers={false} onPressEnter={handleLinespaceChange} onBlur={handleLinespaceChange}
        />
      </SettingRow>

      <SettingRow flow='wrap' label={translate('characterEffect')}>
        <Effects value={formats.textshadow} onChange={v => onChange(RichTextFormatKeys.Textshadow, v, FormatType.INLINE)} />
      </SettingRow>

    </div>
  )
}

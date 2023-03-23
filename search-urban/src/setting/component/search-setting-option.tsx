/** @jsx jsx */
import { React, css, jsx, UseDataSource, ImmutableArray, LinkType, Immutable, defaultMessages as jimuCoreDefaultMessage } from 'jimu-core'
import { SettingChangeFunction } from 'jimu-for-builder'
import { SettingSection, SettingRow, SettingCollapse, LinkSelector, IMLinkParam, OpenTypes, IMSearchSuggestionConfig, SearchSuggestionConfig, SearchSuggestionSetting, SearchGeneralSetting } from 'jimu-ui/advanced/setting-components'
import { IMConfig, SearchResultView, MAX_RESULT } from '../../config'
import { hooks, TextInput, Checkbox, Switch, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import defaultMessage from '../translations/default'
import { useTheme } from 'jimu-theme'
interface SearchOptionsProps {
  id: string
  onSettingChange: SettingChangeFunction
  config: IMConfig
  useDataSources: ImmutableArray<UseDataSource>
}

const SearchOptions = (props: SearchOptionsProps) => {
  const nls = hooks.useTranslate(defaultMessage, jimuiDefaultMessage, jimuCoreDefaultMessage)
  const appTheme = useTheme()

  const STYLE = css`
    .check-box-label {
      color: ${appTheme.colors.palette.dark[800]}
    }
    .search-setting-con {
      padding-left: 0;
      padding-right: 0;
    }
    .divider-line {
      padding-bottom: 0;
    }
    .checkbox-con .jimu-widget-setting--row-label{
      max-width: 100%;
    }
  `

  const { config, id, useDataSources, onSettingChange } = props
  const { searchResultView, hint, resultMaxNumber, linkParam, isAutoSelectFirstResult } = config

  const [openSearchSuggestion, setOpenSearchSuggestion] = React.useState(false)
  const [openSearchResult, setOpenSearchResult] = React.useState(false)

  const [newResultMaxNumber, setResultMaxNumber] = React.useState(resultMaxNumber)
  const [settingConfig, setSettingConfig] = React.useState(Immutable({}) as IMSearchSuggestionConfig)

  React.useEffect(() => {
    initSettingConfig()
    // eslint-disable-next-line
  }, [config])

  const initSettingConfig = () => {
    const newSettingConfig: SearchSuggestionConfig = {
      maxSuggestions: config?.maxSuggestions,
      isUseCurrentLoation: config?.isUseCurrentLoation,
      isShowRecentSearches: config?.isShowRecentSearches,
      recentSearchesMaxNumber: config?.recentSearchesMaxNumber
    }
    setSettingConfig(Immutable(newSettingConfig))
  }

  const onConfigChange = (key: string[], value: any) => {
    onSettingChange({ id: id, config: config.setIn(key, value) })
  }

  const handleAutoSelectChange = (evt) => {
    const target = evt.currentTarget
    if (!target) return
    onConfigChange(['isAutoSelectFirstResult'], target.checked)
  }

  const handleResultMaxNumberAccept = value => {
    if (!value) {
      value = resultMaxNumber || MAX_RESULT
      setResultMaxNumber(value)
    }
    checkNumber(value) && onConfigChange(['resultMaxNumber'], Number(value))
  }

  const handleResultMaxNumberChange = (e) => {
    const value = e.target.value
    checkNumber(value) && setResultMaxNumber(value)
  }

  const checkNumber = (value): boolean => {
    if (value?.length === 0) return true
    return Number(value) && Number(value) > 0
  }

  const onSettingLinkConfirm = (linkResult: IMLinkParam) => {
    if (!linkResult) {
      return
    }
    onConfigChange(['linkParam'], linkResult)
  }

  const onResultViewChange = (isShowSearchResultView: boolean) => {
    const resultView = isShowSearchResultView ? SearchResultView.ResultPanel : SearchResultView.OtherWidgets
    onConfigChange(['searchResultView'], resultView)
  }

  const getHiddenLinks = (): ImmutableArray<LinkType> => {
    return Immutable([LinkType.WebAddress, LinkType.PrintPreview])
  }

  const onHintChange = (hint: string) => {
    onConfigChange(['hint'], hint)
  }

  const onSuggestionSettingChange = (settingConfig: IMSearchSuggestionConfig) => {
    if (!settingConfig) return false
    const newConfig = config.merge(settingConfig)
    onSettingChange({ id: id, config: newConfig })
  }

  const renderSearchSuggestionSetting = () => {
    return (
      <div>
        <SettingSection className='search-setting-con'>
          <SettingRow>
            <SettingCollapse
              label={nls('searchSuggestion')}
              isOpen={openSearchSuggestion}
              onRequestOpen={() => setOpenSearchSuggestion(true)}
              onRequestClose={() => setOpenSearchSuggestion(false)}
              level={1}
            >
              <SearchSuggestionSetting
                id={id}
                settingConfig={settingConfig}
                onSettingChange={onSuggestionSettingChange}
              />
            </SettingCollapse>
          </SettingRow>
        </SettingSection>
        {openSearchSuggestion && <SettingSection className='divider-line'/>}
      </div>
    )
  }

  const renderSearchResultSetting = () => {
    return (
      <SettingRow>
        <SettingCollapse
          label={nls('searchResult')}
          isOpen={openSearchResult}
          onRequestOpen={() => setOpenSearchResult(true)}
          onRequestClose={() => setOpenSearchResult(false)}
          level={1}
        >
          <SettingRow label={nls('resultPanel')} className='mt-2'>
            <Switch checked={searchResultView === SearchResultView.ResultPanel} onChange={(evt: any) => { onResultViewChange(searchResultView === SearchResultView.OtherWidgets) }} />
          </SettingRow>

          {searchResultView === SearchResultView.ResultPanel && <SettingRow flow='wrap' className='checkbox-con' label={nls('maximumResults')}>
            <TextInput size='sm' value={newResultMaxNumber} onChange={handleResultMaxNumberChange} onAcceptValue={handleResultMaxNumberAccept} className='w-100' />
          </SettingRow>}

          {searchResultView === SearchResultView.ResultPanel && <SettingRow>
            <Checkbox checked={isAutoSelectFirstResult} onClick={handleAutoSelectChange} className='mr-1' aria-label={nls('autoSelect')}/>
            <span className='check-box-label'>{nls('autoSelect')}</span>
          </SettingRow>}

          {searchResultView === SearchResultView.OtherWidgets && <SettingRow className='d-block' flow='wrap' label={nls('redirectSearchResult')}>
            <LinkSelector
              onSettingConfirm={onSettingLinkConfirm}
              linkParam={linkParam}
              useDataSources={useDataSources}
              widgetId={id}
              hiddenLinks={getHiddenLinks()}
              openTypes={Immutable([OpenTypes.CurrentWindow])}
            />
          </SettingRow>}
        </SettingCollapse>
      </SettingRow>
    )
  }

  return (
    <SettingSection title={nls('generalSearchOption')} css={STYLE}>
      <SearchGeneralSetting
        id={id}
        hint={hint}
        onSettingChange={onHintChange}
      />
      {renderSearchSuggestionSetting()}
      {renderSearchResultSetting()}
    </SettingSection>
  )
}

export default SearchOptions

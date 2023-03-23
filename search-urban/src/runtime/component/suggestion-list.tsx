/** @jsx jsx */
import { React, jsx, esri, classNames } from 'jimu-core'
import { hooks, Icon, DropdownItem, Dropdown, DropdownMenu, DropdownButton, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { Suggestion, IMServiceList, InitResultServiceListOption, IMConfig } from '../../config'
import defaultMessage from '../translations/default'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import CurrentLocation from './use-current-location'
import { useTheme } from 'jimu-theme'
import { getStyle, dropdownStyle } from '../style/popper-style'
import { getResultPopperOffset } from '../utils/utils'
const { useRef } = React
interface SearchSettingProps {
  searchText: string
  isOpen: boolean
  isRecentSearches: boolean
  reference: any
  searchSuggestion: Suggestion[]
  className?: string
  canUseOutoutDsLength: number
  serviceList: IMServiceList
  isShowCurrentLocation: boolean
  config: IMConfig
  toggel?: () => void
  onRecordItemClick: (searchText: string, initResultServiceListOption?: InitResultServiceListOption) => void
  clearSearches: () => void
  setSuggestionFirstItem: (ref) => void
}
const Sanitizer = esri.Sanitizer
const sanitizer = new Sanitizer()

const SuggestionList = (props: SearchSettingProps) => {
  const nls = hooks.useTranslate(defaultMessage, jimuiDefaultMessage)
  const { isRecentSearches, className, reference, searchSuggestion, isOpen, searchText, canUseOutoutDsLength, serviceList, isShowCurrentLocation, config, toggel, onRecordItemClick, clearSearches, setSuggestionFirstItem } = props
  const theme = useTheme()
  const isHasSetFirstItem = useRef<boolean>(false)

  const checkIsNoResult = () => {
    let totalSuggestionItem = []
    searchSuggestion.forEach(layerSuggestion => {
      const suggestionItem = layerSuggestion?.suggestionItem || []
      totalSuggestionItem = totalSuggestionItem.concat(suggestionItem)
    })
    return searchText && totalSuggestionItem.length === 0
  }

  const handelSuggestionItemClick = (searchText: string, initResultServiceListOption?: InitResultServiceListOption) => {
    const { configId, isFromSuggestion, magicKey } = initResultServiceListOption || {}
    if (configId && (isFromSuggestion || magicKey)) {
      onRecordItemClick(searchText, initResultServiceListOption)
    } else {
      onRecordItemClick(searchText)
    }
  }

  const renderLayerSuggestionElement = () => {
    isHasSetFirstItem.current = null
    return searchSuggestion?.map((layerSuggestion, index) => {
      const isShowLayerName = searchSuggestion?.length > 1 && layerSuggestion?.suggestionItem?.length > 0
      return (
        <div key={`${layerSuggestion?.layer}-${index}`}>
          {isShowLayerName && <DropdownItem className='source-label-con' disabled={true} title={layerSuggestion?.layer}>
            {layerSuggestion?.icon && <Icon className='mr-2' color={theme?.colors?.primary} size={16} icon={layerSuggestion?.icon?.svg}/> }
            {layerSuggestion?.layer}
          </DropdownItem>}
          {renderSuggestionItemElement(layerSuggestion, checkIsShowPadding())}
        </div>
      )
    })
  }

  const checkIsShowPadding = () => {
    const sourceNumber = searchSuggestion?.length
    if (sourceNumber < 2) {
      return false
    }
    // The total number of icons
    let iconNumber = 0
    //when only one source has suggestion, and the source item has an icon, padding should also be added
    let numberOfSourceWithSuggestionAndIcon = 0
    searchSuggestion?.forEach(layerSuggestion => {
      const icon = layerSuggestion?.icon
      if (icon) {
        iconNumber += 1
      }
      if (layerSuggestion.suggestionItem?.length > 0 && icon) {
        numberOfSourceWithSuggestionAndIcon += 1
      }
    })
    return numberOfSourceWithSuggestionAndIcon > 0 && iconNumber > 0
  }

  const renderSuggestionItemElement = (suggestion: Suggestion, isShowPadding = false) => {
    const suggestionItem = suggestion?.suggestionItem
    const icon = suggestion?.icon
    return suggestionItem?.map((item, index) => {
      const suggestionHtml = sanitizer.sanitize(
        item.suggestionHtml
      )
      const initResultServiceListOption = {
        configId: item?.configId,
        isFromSuggestion: item?.isFromSuggestion,
        magicKey: item?.magicKey
      }
      return (
        <DropdownItem
          className={classNames('d-flex align-items-center py-2', { 'item-p-l': isShowPadding })}
          key={`${suggestion?.layer}${index}`}
          title={item.suggestion}
          onClick={() => {
            handelSuggestionItemClick(item.suggestion, initResultServiceListOption)
          }}
          ref={ref => { setFirstItemRef(index, ref) }}
        >
          {(icon && canUseOutoutDsLength === 1) && <Icon className='mr-2' color={theme?.colors?.primary} size={16} icon={icon?.svg}/> }
          <div className='flex-grow-1' dangerouslySetInnerHTML={{ __html: suggestionHtml }}></div>
        </DropdownItem>
      )
    })
  }

  const setFirstItemRef = (index: number, ref) => {
    if (index === 0 && !isHasSetFirstItem.current) {
      setSuggestionFirstItem(ref)
      isHasSetFirstItem.current = true
    }
  }

  const DatasourceConfig = config?.datasourceConfig || []

  return (
    <div>
      <Dropdown className='w-100' size='lg' isOpen={isOpen} toggle={toggel} css={dropdownStyle()}  style={{fontFamily: 'roboto'}}>
        <DropdownButton className='sr-only search-dropdown-button' style={{ padding: 0 }}></DropdownButton>
        <DropdownMenu className={classNames('result-list-con', className)} offset={getResultPopperOffset(DatasourceConfig.length > 1)} trapFocus={false} autoFocus={false} css={getStyle(theme, reference)} style={{ maxHeight: 'auto' }}>
          {(!searchText && isShowCurrentLocation) && <CurrentLocation
            serviceList={serviceList}
            isShowCurrentLocation={true}
            onLocationChange={onRecordItemClick}
          />}
          {checkIsNoResult() && <DropdownItem className='text-center py-2' disabled={true} title={nls('noResult', { searchText: searchText })}>{nls('noResult', { searchText: searchText })}</DropdownItem>}
          {renderLayerSuggestionElement()}
          {isRecentSearches && <DropdownItem divider={true} />}
          {isRecentSearches && <DropdownItem className='clear-recent-search-con' title={nls('clearRecentSearches')} onClick={clearSearches}>
            <TrashOutlined className='mr-2'/>
            {nls('clearRecentSearches')}
          </DropdownItem>}
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default SuggestionList

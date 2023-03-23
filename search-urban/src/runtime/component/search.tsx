/** @jsx jsx */
import {
  React, css, ReactRedux, IMState, jsx, polished, Immutable, ImmutableArray, LinkResult, LinkTo, DataSourceStatus, QueriableDataSource, lodash,
  AppMode, RecordSetChangeType, MessageManager, DataRecordsSelectionChangeMessage, DataSourceFilterChangeMessage
} from 'jimu-core'
import { TextInput, Button, hooks, Link, LinkTarget, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { IMConfig, Suggestion, SearchResultView, ServiceList, InitResultServiceListOption, NewDatasourceConfigItem, ArrangementStyle, SearchServiceType } from '../../config'
import { getSQL } from '../utils/search-service'
import { publishRecordCreatedMessageAction } from '../utils/locator-service'
import { getDatasource, setRecentSearches, getRecentSearches, clearRecentSearches, getJsonLength, changeDsStatus, checkIsDsCreated, getSuggestions, updateAllDsQueryParams, loadAllDsRecord } from '../utils/utils'
import SuggestionList from './suggestion-list'
import ResultList from './result-list'
import { SearchOutlined } from 'jimu-icons/outlined/editor/search'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import defaultMessage from '../translations/default'
import { useTheme } from 'jimu-theme'
const { useSelector } = ReactRedux
const { useState, useEffect, useRef, useMemo } = React
interface SearchSettingProps {
  config: IMConfig
  reference: any
  id: string
  datasourceConfig: ImmutableArray<NewDatasourceConfigItem>
  className?: string
  isShowSearchInput: boolean
  isInCurrentView: boolean
  isWidgetInCurrentPage: boolean
  onShowSearchInputChange: (isShow: boolean) => void
  jimuMapView: any
}

const SearchInput = (props: SearchSettingProps) => {
  const nls = hooks.useTranslate(defaultMessage, jimuiDefaultMessage)
  const theme = useTheme()
  const queryObject = useSelector((state: IMState) => state?.queryObject)
  const appMode = useSelector((state: IMState) => state?.appRuntimeInfo?.appMode)
  const debounceQuerySuggestionRef = useRef((searchText: string) => undefined)
  const linkRef = useRef<HTMLButtonElement>(null)
  const suggestionFirstItem = useRef(null)
  const resultFirstItem = useRef(null)
  const searchValueRef = useRef(null)
  const preIsOpentResultPopperRef = useRef(false)
  const resultServiceListRef = useRef<ServiceList>(null)

  const { config, className, reference, id, datasourceConfig, isShowSearchInput, isInCurrentView, isWidgetInCurrentPage, onShowSearchInputChange, jimuMapView } = props
  const { isShowRecentSearches, recentSearchesMaxNumber, linkParam, searchResultView, resultMaxNumber, arrangementStyle } = config

  const [searchValue, setSearchValue] = useState(null)
  const [isShowLoading, setIsShowLoading] = useState(false)
  const [isOpenSuggestion, setIsOpenSuggestion] = useState(false)
  const [isRecentSearches, setIsRecentSearches] = useState(false)
  const [resultServiceList, setResultServiceList] = useState({} as ServiceList)
  const [serviceList, setServiceList] = useState({} as ServiceList)
  const [searchSuggestion, setSearchSuggestion] = useState([] as Suggestion[])
  const [isOpentResultPopper, setIsOpentResultPopper] = useState(false)
  const [isOpentResultListDefault, setIsOpentResultListDefault] = useState(false)

  //This dsId is just the id of the datasource where the record selected by the current search is located
  const [dsIdOfSelectedResultItem, setDsIdOfSelectedResultItem] = useState(null)

  const STYLE = css`
    .input-wrapper {
      height: 100% !important;
    }
    .loading-con {
      @keyframes loading {
        0% {transform: rotate(0deg); };
        100% {transform: rotate(360deg)};
      }
      width: ${polished.rem(16)};
      height: ${polished.rem(16)};
      min-width: ${polished.rem(16)};
      border: 2px solid ${theme?.colors?.palette?.secondary?.[300]};
      border-radius: 50%;
      border-top: 2px solid ${theme?.colors?.palette?.primary?.[500]};
      box-sizing: border-box;
      animation:loading 2s infinite linear;
      box-sizing: border-box;
    }
    .search-button {
      width: ${polished.rem(32)};
      border-radius: 0;
    }
    .search-input-con input{
      width: 100%;
    }
    .search-link-con {
      width: 0;
      height: 0;
      overflow: hidden;
    }
    style={{fontFamily: 'roboto'}}
  `

  useEffect(() => {
    initServiceList()
    // eslint-disable-next-line
  }, [datasourceConfig])

  //After switching the page or view, judge whether to open the result panel according to the open situation of the previous result panel
  useEffect(() => {
    //If the search is in the page or the current view, judge whether to open the result panel according to the previous open state of the result panel
    if (preIsOpentResultPopperRef.current && isInCurrentView && isWidgetInCurrentPage) {
      setIsOpentResultListDefault(false)
      lodash.defer(() => {
        toggleResultPopper(true)
      })
    } else {
      setIsOpentResultListDefault(true)
    }
    //If Search widget is not in the current page or current view, close the result panel
    if (!isInCurrentView || !isWidgetInCurrentPage) {
      setIsOpentResultPopper(false)
    }
  }, [isInCurrentView, isWidgetInCurrentPage])

  useEffect(() => {
    if (isOpentResultPopper && appMode === AppMode.Design) {
      setIsOpentResultPopper(false)
    }
    // eslint-disable-next-line
  }, [appMode])

  useEffect(() => {
    /**
     * Query suggestion
    */
    const querySuggestion = (starchText: string) => {
      const serviceSuggestion = getSuggestions(starchText, serviceList, config)
      Promise.all([serviceSuggestion]).then(allSuggestion => {
        const suggestion = allSuggestion?.[0]
        setIsShowLoading(false)
        if (suggestion) {
          setSearchSuggestion(suggestion)
        }
        searchValueRef.current && setIsOpenSuggestion(true)
      }).catch((error) => {
        setIsShowLoading(false)
      })
    }
    debounceQuerySuggestionRef.current = lodash.debounce(querySuggestion, 400)
  }, [serviceList, config])

  /**
   * Fire callback when the text of search input changes
  */
  const onChange = (e) => {
    const value = e?.target?.value
    const isShowSuggestion = value?.length > 2
    updateSearchValue(value)
    toggleResultPopper(false)
    if (!isShowSuggestion) {
      setIsOpenSuggestion(false)
      return false
    }
    !isShowLoading && setIsShowLoading(true)
    debounceQuerySuggestionRef.current(value)
  }

  const initResultServiceList = (newServiceList: ServiceList, initResultServiceListOption?: InitResultServiceListOption) => {
    const { configId, magicKey, isFromSuggestion } = initResultServiceListOption || {}
    let newResultServiceList = configId ? Immutable({}).setIn([configId], newServiceList[configId]) : Immutable(newServiceList)
    for (const configId in newResultServiceList) {
      magicKey && (newResultServiceList = newResultServiceList.setIn([configId, 'magicKey'], magicKey || null))
      isFromSuggestion && (newResultServiceList = newResultServiceList.setIn([configId, 'isFromSuggestion'], isFromSuggestion || null))
    }
    resultServiceListRef.current = newResultServiceList?.asMutable({ deep: true })
    setResultServiceList(newResultServiceList?.asMutable({ deep: true }))
  }

  /**
   * Fire callback when clear search input
  */
  const clearSearchValue = () => {
    updateSearchValue('')
    initOutputDsStatus()

    setIsShowLoading(false)
    toggleResultPopper(false)

    confirmSearch('', true)
  }

  /**
   * Set outputDs status to NotReady after clear search input
  */
  const initOutputDsStatus = () => {
    for (const configId in serviceList) {
      if (serviceList[configId]?.searchServiceType === SearchServiceType.GeocodeService) {
        const outputDsId = serviceList[configId]?.outputDataSourceId
        const outPutDs = getDatasource(outputDsId)
        outPutDs.selectRecordsByIds([])
        changeDsStatus(outPutDs as QueriableDataSource, DataSourceStatus.NotReady)
        publishRecordCreatedMessageAction(outputDsId, id, [], RecordSetChangeType.Remove)
      }
    }
  }

  /**
   * Fire callback when search input focus
  */
  const onSearchInputFocus = (e) => {
    const value = e?.target?.value
    showRecentSearches(value)
    showUseCurrentLocation(value)
  }

  /**
   * Toggle result list popper
  */
  const toggleResultPopper = (isOpen: boolean) => {
    preIsOpentResultPopperRef.current = isOpen
    if (!isOpen) {
      setIsOpentResultListDefault(true)
    }
    setIsOpentResultPopper(isOpen)
  }

  /**
   * Fire callback when search input key up
  */
  const onKeyUp = e => {
    if (!e || !e.target) return
    const searchText = e?.target?.value
    //Click suggestion to get the result, then click Enter again and no longer reload
    if (e.keyCode === 13 && checkIsReloadRecords()) {
      updateSearchValue(searchText)
      confirmSearch(searchText)
    }
    checkAndFocksPopper(e)
  }

  const checkIsReloadRecords = () => {
    let isReload = true
    if (!resultServiceListRef.current) return isReload
    const currentResultServiceList = resultServiceListRef.current
    for (const configId in currentResultServiceList) {
      const serviceItem = currentResultServiceList[configId]
      isReload = !(serviceItem?.magicKey || serviceItem?.isFromSuggestion)
      if (!isReload) break
    }
    return isReload
  }

  /**
   * Fire callback when the suggestion list item is clicked.
  */
  const onSuggestionItemClick = (searchText: string, initResultServiceListOption?: InitResultServiceListOption) => {
    updateSearchValue(searchText, initResultServiceListOption)
    confirmSearch(searchText)
  }

  /**
   * Confirm search
  */
  const confirmSearch = (searchText: string, isClearSearch: boolean = false) => {
    if (isOpentResultPopper && !isClearSearch) return
    updateRecentSearches(searchText)
    setIsOpenSuggestion(false)
    const updateParamsOption = {
      serviceList: resultServiceListRef.current,
      searchText: searchText,
      searchResultView: searchResultView,
      id: id
    }
    clearSelectRecordAndAction()
    updateAllDsQueryParams(updateParamsOption).then(status => {
      publishDataFilterAction()
      searchText && showResult(searchText)
    })
  }

  /**
   * Clear the selected records and message actions of current search before re-searching
  */
  const clearSelectRecordAndAction = () => {
    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(id, [])
    )
    if (dsIdOfSelectedResultItem) {
      const ds = getDatasource(dsIdOfSelectedResultItem) as QueriableDataSource
      ds?.selectRecordsByIds([])
    }
  }

  const handleDsIdOfSelectedResultItemChange = (dsId: string) => {
    setDsIdOfSelectedResultItem(dsId)
  }

  const publishDataFilterAction = () => {
    const serviceList = resultServiceListRef.current
    for (const configId in serviceList) {
      const service = serviceList[configId]
      let dsId
      if (service?.searchServiceType === SearchServiceType.FeatureService) {
        dsId = service?.useDataSource?.dataSourceId
      } else if (service?.searchServiceType === SearchServiceType.GeocodeService) {
        dsId = service?.outputDataSourceId
      }
      MessageManager.getInstance().publishMessage(new DataSourceFilterChangeMessage(id, dsId))
    }
  }

  const showResult = (searchText: string) => {
    //Show result
    if (searchResultView === SearchResultView.OtherWidgets) {
      publishRecordCreateAction()
      if (searchText) {
        if (checkIsHasSuggestion()) {
          toOtherWidget()
        } else {
          loadRecordAndCheckIsToOtherWidget()
        }
      }
    } else {
      showResultPanel()
    }
  }

  /**
  * Load records and check is has records before jump page, if not, show no result panel
  */
  const loadRecordAndCheckIsToOtherWidget = () => {
    const serviceRecords = loadAllDsRecord(resultServiceListRef.current, resultMaxNumber, id)
    Promise.all([serviceRecords]).then(res => {
      let allResponse = []
      let allRecords = []
      res?.forEach(resItem => {
        allResponse = allResponse.concat(resItem)
      })
      allResponse.forEach(dsResult => {
        const records = dsResult?.records || []
        allRecords = allRecords.concat(records)
      })
      if (allRecords?.length > 0) {
        toOtherWidget()
      } else {
        showResultPanel()
      }
    })
  }

  const showResultPanel = () => {
    loadAllDsRecord(resultServiceListRef.current, resultMaxNumber, id, true)
    toggleResultPopper(true)
  }

  const checkIsHasSuggestion = () => {
    let suggestion = []
    searchSuggestion.forEach(item => {
      suggestion = suggestion.concat(item?.suggestionItem)
    })
    return suggestion.length > 0
  }

  /**
   * Update Recent searches
  */
  const updateRecentSearches = (searchText: string) => {
    //Save recent searchs
    const recentSearchsOption = {
      searchText: searchText,
      id: id,
      recentSearchesMaxNumber: recentSearchesMaxNumber,
      isShowRecentSearches: isShowRecentSearches
    }
    setRecentSearches(recentSearchsOption)
  }

  /**
   * Show result in other widget
  */
  const toOtherWidget = () => {
    if (!linkRef?.current) {
      return false
    }
    linkRef?.current?.click()
  }

  /**
   * Load geocode records and publish records created message action
  */
  const publishRecordCreateAction = () => {
    const maxRecordNumber = searchResultView === SearchResultView.ResultPanel ? resultMaxNumber : null
    const geocodeRecords = loadAllDsRecord(resultServiceListRef.current, maxRecordNumber, id, true)
    Promise.all([geocodeRecords])
  }

  const getLinkToOption = (linkParam) => {
    let target: LinkTarget
    let linkTo: LinkTo
    if (linkParam?.linkType) {
      target = linkParam?.openType
      linkTo = {
        linkType: linkParam?.linkType
      } as LinkResult

      linkTo.value = linkParam?.value
    }
    return {
      linkTo: linkTo,
      target: target
    }
  }

  const linkToOption = useMemo(() => getLinkToOption(linkParam), [linkParam])

  /**
   * Clear Recent search
  */
  const clearRecentSearche = () => {
    clearRecentSearches(id)
    setSearchSuggestion([])
    setIsOpenSuggestion(false)
    setIsRecentSearches(false)
  }

  /**
   * Fire callback when the text of search input changes
  */
  const updateSearchValue = (searchText: string, initResultServiceListOption?: InitResultServiceListOption) => {
    if (isRecentSearches) {
      setIsRecentSearches(false)
    }
    setSearchSuggestion([])
    setSearchValue(searchText)
    searchValueRef.current = searchText
    setQuerySQL(searchText, initResultServiceListOption)
  }

  const initServiceList = () => {
    let newServiceList = Immutable({})
    datasourceConfig?.asMutable({ deep: true })?.forEach(configItem => {
      if (!configItem?.enable) return false
      const { configId } = configItem
      let newDatasourceListItem
      if (configItem?.searchServiceType === SearchServiceType.GeocodeService) {
        newDatasourceListItem = initGeocodeList(configItem)
      } else {
        newDatasourceListItem = initDatasourceList(configItem)
      }
      newServiceList = newServiceList.setIn([configId], newDatasourceListItem)
    })
    setServiceList(newServiceList?.asMutable({ deep: true }))
  }

  /**
   * Init datasource list by enable config item
  */
  const initDatasourceList = (configItem: NewDatasourceConfigItem) => {
    if (!configItem?.enable || configItem?.searchServiceType === SearchServiceType.GeocodeService) return false
    const { configId, useDataSource, displayFields, searchFields, searchExact, hint, searchServiceType } = configItem
    const datasourceListItem = serviceList?.[configId] || {}
    const updateItem = {
      useDataSource: useDataSource,
      displayFields: displayFields,
      searchFields: searchFields,
      searchExact: searchExact,
      maxSuggestions: config?.maxSuggestions,
      resultMaxNumber: resultMaxNumber,
      hint: hint,
      searchServiceType: searchServiceType,
      configId: configId
    }
    const newDatasourceListItem = Object.assign(datasourceListItem, updateItem)
    return newDatasourceListItem
  }

  /**
   * Init geocode list by enable config item
  */
  const initGeocodeList = (configItem: NewDatasourceConfigItem) => {
    if (!configItem?.enable || configItem?.searchServiceType === SearchServiceType.FeatureService) return false
    const { configId, hint, geocodeURL, outputDataSourceId, label, searchServiceType, singleLineFieldName, displayFields, defaultAddressFieldName, addressFields } = configItem
    const datasourceListItem = serviceList?.[configId] || {}
    const updateItem = {
      hint: hint,
      geocodeURL: geocodeURL,
      outputDataSourceId: outputDataSourceId,
      icon: configItem?.icon,
      maxSuggestions: config?.maxSuggestions,
      resultMaxNumber: resultMaxNumber,
      label: label,
      searchServiceType: searchServiceType,
      configId: configId,
      singleLineFieldName: singleLineFieldName || '',
      displayFields: displayFields,
      defaultAddressFieldName: defaultAddressFieldName,
      addressFields: addressFields || []
    }
    const newDatasourceListItem = Object.assign(datasourceListItem, updateItem)
    return newDatasourceListItem
  }

  /**
    * Set query SQL according to search text
  */
  const setQuerySQL = (searchText: string, initResultServiceListOption?: InitResultServiceListOption) => {
    const newServiceList = serviceList
    for (const configId in serviceList) {
      const dsId = serviceList[configId]?.useDataSource?.dataSourceId
      if (serviceList[configId].searchServiceType === SearchServiceType.GeocodeService || !checkIsDsCreated(dsId)) continue
      const ds = getDatasource(dsId)
      const searchFields = serviceList[configId].searchFields || []
      const searchExact = serviceList[configId].searchExact || false
      const SQL = getSQL(searchText, searchFields, ds, searchExact)
      newServiceList[configId].SQL = SQL
    }
    setServiceList(newServiceList)
    initResultServiceList(newServiceList, initResultServiceListOption)
  }

  /**
   * Check is show recent searches
  */
  const showRecentSearches = (searchText?: string) => {
    if (!searchText && isShowRecentSearches) {
      const recentSearches = getRecentSearches(id)
      if (recentSearches?.length === 0) return false
      const suggestionItem = recentSearches.map((searchValue) => {
        return {
          suggestionHtml: searchValue,
          suggestion: searchValue,
          isRecentSearche: true
        }
      })
      setSearchSuggestion([{
        suggestionItem: suggestionItem,
        layer: null,
        icon: null
      }])
      setIsOpenSuggestion(true)
      setIsRecentSearches(true)
    } else {
      setSearchSuggestion([{
        suggestionItem: [],
        layer: null,
        icon: null
      }])
      setIsRecentSearches(false)
    }
  }

  const showUseCurrentLocation = (searchText?: string) => {
    if (!searchText && config?.isUseCurrentLoation && !isOpenSuggestion) {
      setIsOpenSuggestion(true)
      if (!showRecentSearches) {
        setSearchSuggestion([{
          suggestionItem: [],
          layer: null,
          icon: null
        }])
      }
    }
  }

  const suffix = () => {
    return (
      <div className='d-flex align-items-center'>
        {isShowLoading && <div className='loading-con mr-1'/>}
        {(searchValue && searchValue?.length > 0) &&
          <Button icon type='tertiary' size='sm' onClick={clearSearchValue}>
            <CloseOutlined/>
          </Button>}
      </div>
    )
  }

  /**
   * Get placeholder of search input
  */
  const getPlaceholder = () => {
    let servicePlaceholder
    const canUseDslength = getCanUseDslength()
    for (const configId in serviceList) {
      servicePlaceholder = serviceList?.[configId]?.hint && serviceList?.[configId]?.hint
    }

    const multipleSearchPlaceholder = config?.hint || nls('findAddressOrPlace')
    servicePlaceholder = servicePlaceholder || nls('findAddressOrPlace')
    return (canUseDslength !== 1) ? multipleSearchPlaceholder : servicePlaceholder
  }

  const getCanUseDslength = () => {
    return getJsonLength(serviceList)
  }

  const onSearchButtonClick = (searchValue: string) => {
    if (arrangementStyle === ArrangementStyle.Style2) {
      onShowSearchInputChange(!isShowSearchInput)
      setIsOpenSuggestion(false)
    } else {
      checkIsReloadRecords() && confirmSearch(searchValue)
    }
  }

  const isOpenSuggestionPopper = isOpenSuggestion && !isShowLoading && !isOpentResultPopper

  const setSuggestionFirstItem = (ref: any) => {
    suggestionFirstItem.current = ref
  }

  const setResultFirstItem = (ref: any) => {
    resultFirstItem.current = ref
  }

  const checkAndFocksPopper = (e) => {
    if (e.keyCode === 40 && suggestionFirstItem) {
      if (isOpenSuggestionPopper) {
        suggestionFirstItem?.current?.focus()
      } else if (isOpentResultPopper) {
        resultFirstItem?.current?.focus()
      }
    }
  }
  const inputConKeyup = (e) => {
    checkAndFocksPopper(e)
  }

  const checkIsOpenSuggestionPopper = () => {
    if (config?.maxSuggestions > 0) {
      return isOpenSuggestionPopper
    } else {
      const isShowCurrentLocationOrRecentSearch = (!searchValue && config?.isUseCurrentLoation) || isRecentSearches
      return isOpenSuggestionPopper && isShowCurrentLocationOrRecentSearch
    }
  }

  return (
    <div className={`h-100 align-items-center position-relative d-flex flex-grow-1 ${className || ''}`} css={STYLE}>
      <div className='h-100 flex-grow-1 search-input-con'>
        <div className='h-100 w-100' onKeyUp={inputConKeyup}>
          {isShowSearchInput && <TextInput
            value={searchValue || ''}
            onChange={onChange}
            onFocus={onSearchInputFocus}
            onKeyUp={onKeyUp}
            className='h-100 w-100'
            suffix={suffix()}
            placeholder={getPlaceholder()}
          />}
        </div>
        <SuggestionList
          serviceList={Immutable(resultServiceList)}
          canUseOutoutDsLength={getCanUseDslength()}
          isOpen={checkIsOpenSuggestionPopper()}
          reference={reference}
          searchText={searchValue}
          searchSuggestion={searchSuggestion}
          toggel={() => { setIsOpenSuggestion(!isOpenSuggestion) }}
          onRecordItemClick={onSuggestionItemClick}
          isRecentSearches={isRecentSearches}
          clearSearches={clearRecentSearche}
          isShowCurrentLocation={config?.isUseCurrentLoation}
          setSuggestionFirstItem={setSuggestionFirstItem}
          config={config}
        />
        {isOpentResultPopper && <ResultList
          serviceList={Immutable(resultServiceList)}
          config={config}
          reference={reference}
          searchText={searchValue}
          id={id}
          setResultFirstItem={setResultFirstItem}
          isOpentResultListDefault={isOpentResultListDefault}
          handleDsIdOfSelectedResultItemChange={handleDsIdOfSelectedResultItemChange}
          jimuMapView={jimuMapView}
        />}
      </div>
      <Button className='search-button h-100' type='primary' icon onClick={() => { onSearchButtonClick(searchValue) }} title={nls('SearchLabel')}>
        <SearchOutlined/>
      </Button>

      {searchResultView === SearchResultView.OtherWidgets && <div className='search-link-con'>
        <Link
          ref={linkRef}
          to={linkToOption?.linkTo}
          target={linkToOption?.target}
          queryObject={queryObject}
        />
      </div>}
    </div>
  )
}

export default SearchInput

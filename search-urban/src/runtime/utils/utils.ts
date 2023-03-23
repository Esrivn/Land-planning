import { DataSource, DataSourceManager, DataSourceStatus, QueriableDataSource } from 'jimu-core'
import { RECENT_SEARCHES_KEY, IMConfig, SearchDataConfig, SuggestionItem, ServiceList, SearchServiceType, Suggestion, SearchResultView } from '../../config'
import { fetchGeocodeSuggestions, loadGecodeRecords, loadGeocodeOutputRecords } from './locator-service'
import { fetchLayerSuggestion, updateDsQueryParams, loadDsRecords } from './search-service'
export interface SetRecentSearcheOptions {
  searchText: string
  id: string
  recentSearchesMaxNumber: number
  isShowRecentSearches: boolean
}
export interface UpdateQueryParamsOption {
  serviceList: ServiceList
  searchText: string
  searchResultView: SearchResultView
  id: string
}

/**
 * Get all suggestion
*/
export const getSuggestions = (
  searchText: string,
  serviceList: ServiceList,
  config: IMConfig
): Promise<Suggestion[]> => {
  const suggestionPromiseList = []
  for (const configId in serviceList) {
    const serviceItem = serviceList[configId]
    let suggestionPromise
    if (serviceItem.searchServiceType === SearchServiceType.FeatureService) {
      suggestionPromise = fetchLayerSuggestion(searchText, config, serviceItem)
    } else {
      suggestionPromise = fetchGeocodeSuggestions(searchText, serviceItem)
    }
    suggestionPromiseList.push(suggestionPromise)
  }
  return Promise.all(suggestionPromiseList)
}

/**
 * Update all dataSource query params
*/
export const updateAllDsQueryParams = (option: UpdateQueryParamsOption) => {
  const { serviceList, searchText, searchResultView, id } = option
  const geocodeFetchPromiseList = []
  for (const configId in serviceList) {
    const serviceItem = serviceList[configId]
    const { searchServiceType, resultMaxNumber } = serviceItem
    if (searchServiceType === SearchServiceType.FeatureService) {
      //Update layer source query params
      updateDsQueryParams(serviceItem, id, searchText)
    } else if (searchServiceType === SearchServiceType.GeocodeService) {
      //Update geocode source query params
      const maxResultNumber = searchResultView === SearchResultView.ResultPanel ? resultMaxNumber : null
      const loadGeocodeRecordPromise = loadGecodeRecords(searchText, maxResultNumber, serviceItem, searchResultView)
      geocodeFetchPromiseList.push(loadGeocodeRecordPromise)
    }
  }
  return Promise.all(geocodeFetchPromiseList)
}

export const loadAllDsRecord = (serviceList: ServiceList, resultMaxNumber: number, id: string, isPublishRecordCreateAction: boolean = false) => {
  const suggestionPromiseList = []
  for (const configId in serviceList) {
    const serviceItem = serviceList[configId]
    let suggestionPromise
    if (serviceItem.searchServiceType === SearchServiceType.FeatureService) {
      suggestionPromise = loadDsRecords(serviceItem, resultMaxNumber, id)
    } else {
      suggestionPromise = loadGeocodeOutputRecords(serviceItem, resultMaxNumber, id, isPublishRecordCreateAction)
    }
    suggestionPromiseList.push(suggestionPromise)
  }
  return Promise.all(suggestionPromiseList)
}

/**
 * Get datasource by datasourceId
*/
export const getDatasource = (dsId: string): DataSource => {
  if (!dsId) return null
  const dsManager = DataSourceManager.getInstance()
  return dsManager.getDataSource(dsId)
}

/**
 * De-duplicate for object or Arrary
*/
export const uniqueJson = (jsonArr, key) => {
  const result = jsonArr[0] ? [jsonArr[0]] : []
  for (let i = 1; i < jsonArr.length; i++) {
    const item = jsonArr[i]
    let repeat = false
    for (let j = 0; j < result.length; j++) {
      if (item[key] === result[j][key]) {
        repeat = true
        break
      }
    }
    if (!repeat) {
      result.push(item)
    }
  }
  return result
}

/**
 * Save the current search to localStorage after the text of search input changes
*/
export const setRecentSearches = (options: SetRecentSearcheOptions) => {
  const { searchText, id, recentSearchesMaxNumber, isShowRecentSearches } = options
  const recentSearchKey = `${id}_${RECENT_SEARCHES_KEY}`
  if (!isShowRecentSearches || !searchText) return false
  let recentSearches = getRecentSearches(id)
  if (!recentSearches.includes(searchText)) {
    recentSearches.unshift(searchText)
    recentSearches = recentSearches.splice(0, recentSearchesMaxNumber || 10)
    localStorage.setItem(recentSearchKey, escape(recentSearches.join('/@/')))
  }
}

/**
 * Get recent searches from localStorage
*/
export const getRecentSearches = (id: string): string[] => {
  const recentSearchKey = `${id}_${RECENT_SEARCHES_KEY}`
  let recentSearchInLocal = localStorage.getItem(recentSearchKey)
  if (recentSearchInLocal) {
    recentSearchInLocal = unescape(recentSearchInLocal)
  }
  const recentSearches = recentSearchInLocal ? recentSearchInLocal?.split('/@/') : []
  return recentSearches
}

/**
 * Delete recent suggestion by index
*/
export const deleteRecentSearches = (index: number, id: string) => {
  const recentSearchKey = `${id}_${RECENT_SEARCHES_KEY}`
  if (!index && index !== 0) return false
  const recentSearches = getRecentSearches(id)
  recentSearches.splice(index, 1)
  const localRecentSearches = recentSearches?.length > 0 ? escape(recentSearches.join('/@/')) : ''
  localStorage.setItem(recentSearchKey, localRecentSearches)
}

/**
 * Clear all current searches
*/
export const clearRecentSearches = (id: string) => {
  const recentSearchKey = `${id}_${RECENT_SEARCHES_KEY}`
  localStorage.setItem(recentSearchKey, '')
}

/**
 * Get datasource config item form config by configId
*/
export const getDatasourceConfigItemByConfigId = (config: IMConfig, configId: string): SearchDataConfig => {
  return config?.asMutable({ deep: true })?.datasourceConfig?.filter(item => item.configId === configId)?.[0]
}

export const getJsonLength = (json): number => {
  let length = 0
  //eslint-disable-next-line
  for (const key in json) {
    length++
  }
  return length
}

/**
 * Check whether the suggestion is repeated
*/
export function checkIsSuggestionRepeat (searchSuggestion: SuggestionItem[], suggestionRecord: string): boolean {
  return searchSuggestion.filter(suggestion => {
    return suggestionRecord === suggestion?.suggestion
  }).length > 0
}

/**
 * Init suggestion list item (Bold search text)
*/
export function getSuggestionItem (suggestion: string, searchText: string): string {
  if (!searchText) return suggestion
  const searchReg = new RegExp(`(${searchText})`, 'gi')
  const replaceReg = new RegExp(`(${searchText})`, 'gi')
  return suggestion.match(searchReg) ? suggestion.replace(replaceReg, '<strong >$1</strong>') : suggestion
}

/**
 * Change datasource status
*/
export function changeDsStatus (ds: QueriableDataSource, status: DataSourceStatus) {
  ds.setStatus(status)
  ds.setCountStatus(status)
}

/**
 * Check is datasource created
*/
export function checkIsDsCreated (dsId: string): boolean {
  if (!dsId) return false
  return !!getDatasource(dsId)
}

export function getResultPopperOffset (isMultipleService: boolean): number[] {
  return isMultipleService ? [-32, 3] : [0, 3]
}

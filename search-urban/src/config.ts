import { UseDataSource, SqlResult, FieldSchema, ImmutableObject } from 'jimu-core'
import { SearchSuggestionConfig, SearchGeocodeDataConfig, SearchLayerDataConfig, SearchDataConfig, SearchServiceType, IMLinkParam } from 'jimu-ui/advanced/setting-components'
export { SearchGeocodeDataConfig, SearchLayerDataConfig, IMSearchGeocodeDataConfig, SearchDataConfig, IMSearchDataConfig, SearchServiceType, MAX_SUGGESTION, MAX_RECENT_SEARCHES } from 'jimu-ui/advanced/setting-components'
export const RECENT_SEARCHES_KEY = 'recent_searches'
export const MAX_RESULT = 6
export interface InitResultServiceListOption {
  configId?: string
  magicKey?: string
  isFromSuggestion?: boolean
}

export enum SearchResultView {
  ResultPanel = 'Result_Panel',
  OtherWidgets = 'Other_Widgets'
}

export enum ArrangementStyle {
  Style1 = 'Style1',
  Style2 = 'Style2'
}

export enum EntityStatusType {
  None = '',
  Init = 'init',
  Loading = 'loading',
  Loaded = 'loaded',
  Warning = 'warning',
  Error = 'error',
}

export interface SearchFieldData {
  [key: string]: {
    searchFields: FieldSchema[]
    displayFields: FieldSchema[]
  }
}

export interface NewLayerConfigItemSetting extends SearchLayerDataConfig {
  enable: boolean
}

export interface NewGeocodeItemSetting extends SearchGeocodeDataConfig {
  enable: boolean
}

export interface NewDatasourceConfigItem extends SearchDataConfig {
  enable: boolean
  geocodeURL?: string
}

export type IMNewLayerConfigItemSetting = ImmutableObject<NewLayerConfigItemSetting>

export type IMNewGeocodeItemSetting = ImmutableObject<NewGeocodeItemSetting>

export type IMNewDatasourceConfigItem = ImmutableObject<NewDatasourceConfigItem>

export type IMSearchFieldData = ImmutableObject<SearchFieldData>

export interface SuggestionItem {
  suggestionHtml: string | Element
  suggestion: string
  isRecentSearche?: boolean
  configId?: string
  isFromSuggestion?: boolean
  magicKey?: string
}

export interface Suggestion {
  suggestionItem: SuggestionItem[]
  layer: string
  icon?: any
}

export type IMSuggestion = ImmutableObject<Suggestion>

export interface DatasourceList {
  [key: string]: DatasourceListItem
}

export interface GeocodeList {
  [key: string]: GeocodeListItem
}

export type ServiceList = DatasourceList & GeocodeList

export interface DatasourceListItem {
  searchServiceType: SearchServiceType
  maxSuggestions: number
  resultMaxNumber: number
  useDataSource: UseDataSource
  displayFields?: FieldSchema[]
  searchFields?: FieldSchema[]
  SQL?: SqlResult
  searchExact?: boolean
  hint?: string
  isFromSuggestion?: boolean
  configId: string
}

export interface GeocodeListItem {
  searchServiceType: SearchServiceType
  maxSuggestions: number
  resultMaxNumber: number
  label: string
  geocodeURL: string
  outputDataSourceId: string
  hint?: string
  icon?: any
  magicKey?: string
  configId: string
  singleLineFieldName?: string
  displayFields?: FieldSchema[]
  defaultAddressFieldName?: string
  addressFields?: FieldSchema[]
}

export type IMDatasourceList = ImmutableObject<DatasourceList>
export type IMGeocodeList = ImmutableObject<GeocodeList>
export type IMServiceList = ImmutableObject<ServiceList>

export interface config extends SearchSuggestionConfig {
  datasourceConfig: SearchDataConfig[]
  hint: string
  searchResultView: SearchResultView
  arrangementStyle: ArrangementStyle
  resultMaxNumber: number
  isAutoSelectFirstResult: boolean
  // link
  linkParam?: IMLinkParam
}

export interface IWindowTables {
  id: number,
  name: string
}



export type IMConfig = ImmutableObject<config>

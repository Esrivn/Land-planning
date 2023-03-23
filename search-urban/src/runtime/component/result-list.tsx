/** @jsx jsx */
import { React, ReactRedux, jsx, QueriableDataSource, classNames, DataRecord, Immutable, ImmutableObject, MessageManager, DataRecordsSelectionChangeMessage } from 'jimu-core'
import { hooks, Icon, Dropdown, DropdownMenu, DropdownItem, DropdownButton } from 'jimu-ui'
import { IMConfig, IMServiceList, SearchServiceType } from '../../config'
import defaultMessage from '../translations/default'
import { getDatasourceConfigItemByConfigId, getJsonLength, getDatasource, loadAllDsRecord, getResultPopperOffset } from '../utils/utils'
import { useTheme } from 'jimu-theme'
import { DownOutlined } from 'jimu-icons/outlined/directional/down'
import { UpOutlined } from 'jimu-icons/outlined/directional/up'
import { getStyle, dropdownStyle } from '../style/popper-style'
import { JimuMapView, JimuMapViewComponent, loadArcGISJSAPIModules } from 'jimu-arcgis'
import Graphic from 'esri/Graphic'
import ReactDOM from 'react-dom'
// import RenderTemplateAttributes from "../../../../components/RenderTemplateAttributes";
import _location from "../../images/location.png";

const { useSelector, useDispatch } = ReactRedux;
const { useState, useEffect, useLayoutEffect, useRef, Fragment } = React;
interface DisplayRecord {
  value: string[]
  configId: string
  outputDsId: string
  recordId: string
}

interface DisplayRecordData {
  [configId: string]: DisplayRecord[]
}

interface DisplayRecords {
  [configId: string]: DataRecord[]
}

interface SelectRecordsOption {
  isActive: boolean
  key: string
  recordId: string
  dsId: string
  configId: string
}

type IMDisplayRecordData = ImmutableObject<DisplayRecordData>

interface ResultListProps {
  serviceList: IMServiceList
  searchText: string
  reference: any
  id: string
  isOpentResultListDefault: boolean
  config: IMConfig
  className?: string
  setResultFirstItem: (ref) => void
  handleDsIdOfSelectedResultItemChange: (dsId: string) => void
  jimuMapView: any
}

const ResultList = (props: ResultListProps) => {
  const { reference, searchText, id, config, serviceList, isOpentResultListDefault, setResultFirstItem, handleDsIdOfSelectedResultItemChange, jimuMapView} = props
  // ===============SonPA 
   // Custom result search - SonPA
    const handleProccessResultSearch = async (record) => {
      handleClickHide();
      if (record.length > 0) {
        console.log('record', record[0]);
        let geo = record[0].feature.geometry;
        let feature = record[0].feature;
        // const div = <RenderTemplateAttributes handleClickHide={handleClickHide} results={feature}  />;
        // let _divTemp = document.createElement('div');
        // _divTemp.className = 'temp';
        // _divTemp.id = 'tempID';
        // _divTemp.style.position = 'absolute'
        // _divTemp.style.top = '0';
        // _divTemp.style.bottom = '15px';
        // _divTemp.style.backgroundColor = '#fff';
        // _divTemp.style.right = '10px';
        // _divTemp.style.zIndex = '99999';
        // _divTemp.style.maxHeight = '800px';
        // _divTemp.style.height = '100vh';
        // ReactDOM.render(div, _divTemp);
        // jimuMapView.view.ui.add(_divTemp, 'top-right');


        jimuMapView.view.graphics.removeAll();
        const [Graphic] = await loadArcGISJSAPIModules(['esri/Graphic'])
        jimuMapView.view.goTo({
          zoom: 16,
          center: record[0].feature.geometry
        }, {
          animate: true,
          duration: 1000
        });
        
        let symbol: any = {
          type: "simple-line",
          color: [0 , 0, 255],
          width: 2
        };
    
        // let symbol: any = {
        //   type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
        //   url: _location,
        //   width: "32px",
        //   height: "32px"
        // };

        let graphic = new Graphic({
          geometry: geo.clone(),
          symbol: symbol
        });
        jimuMapView.view.graphics.add(graphic);
      }
    }

    const handleClickHide = () => {
      jimuMapView.view.graphics.removeAll();
      let _tempID = jimuMapView.view.ui.find("tempID");
      if (_tempID) jimuMapView.view.ui.remove(_tempID); 
    }
  // SonPA=====================


  const nls = hooks.useTranslate(defaultMessage)
  const { resultMaxNumber } = config
  const selectedRecordKey = useRef([] as string[])
  const isDataLoaded = useRef(false)
  const dropdownMenuRef = useRef<HTMLDivElement>(null)
  const isHasSetFirstItem = useRef<boolean>(false)

  let firstRecord: DisplayRecord = {} as DisplayRecord
  const theme = useTheme()

  const [displayRecord, setDisplayRecord] = React.useState(Immutable({}) as IMDisplayRecordData)
  const [displayRecords, setDisplayRecords] = React.useState({} as DisplayRecords)

  const [activeButtonKey, setActiveButtonKey] = React.useState(null)
  const [isShowResultList, setIsShowResultList] = React.useState(isOpentResultListDefault)
  const [isHasAutoSelectFirstRecord, setDsHasAutoSelectFirstRecord] = React.useState(false)
  const [version, setVersion] = React.useState(0)

  useEffect(() => {
    loadRecords()
    // eslint-disable-next-line
  }, [serviceList])

  useEffect(() => {
    selectedRecordKey.current = []
  }, [searchText])

  /**
   * Load records by outputDatasource
  */
  const loadRecords = () => {
    isDataLoaded.current = false
    const serviceRecords = loadAllDsRecord(serviceList?.asMutable({ deep: true }), resultMaxNumber, id)
    Promise.all([serviceRecords]).then(res => {
      isDataLoaded.current = true
      let newDisplayRecord = displayRecord || Immutable({}) as IMDisplayRecordData
      let allResponse = []
      res?.forEach(resItem => {
        allResponse = allResponse.concat(resItem)
      })
      const newDisplayRecords: any = {}
      allResponse.forEach(dsResult => {
        const { records, configId, dsId, isGeocodeRecords } = dsResult
        newDisplayRecords[configId] = records
        const disPlayData = getDisplayRecords(records, configId, dsId, isGeocodeRecords)
        newDisplayRecord = newDisplayRecord.setIn([configId], disPlayData)
      })
      setDisplayRecords(newDisplayRecords)
      setDisplayRecord(newDisplayRecord)
      setVersion(version + 1)
      autoSelectFirstRecord()
      onSelectedRecordChange()
    })
  }

  /**
   * Render result list
  */
  const renderResultList = () => {
    const recordElementdata = []
    isHasSetFirstItem.current = null
    for (const configId in displayRecord) {
      const displayItem = displayRecord?.asMutable({ deep: true })?.[configId]
      const datasourceConfigItem = getDatasourceConfigItemByConfigId(config, configId)
      const label = datasourceConfigItem?.label
      const icon = datasourceConfigItem?.icon
      const currentOutputNumber = getJsonLength(serviceList)
      const list = (
        <div key={`${configId}_${label}_con`}>
          {displayItem.length > 0 && <div>
            {currentOutputNumber > 1 &&
              <DropdownItem className='source-label-con' disabled={true} key={`${configId}_${label}`} title={label}>
                {icon && <Icon className='mr-2' color={theme?.colors?.primary} size={16} icon={icon?.svg}/> }
                {label}
              </DropdownItem>
            }
            {renderResultItem(displayItem, checkIsShowPadding())}
          </div>}
        </div>
      )
      recordElementdata.push(list)
    }
    return recordElementdata
  }

  const checkIsShowPadding = () => {
    const currentOutputNumber = getJsonLength(serviceList)
    if (currentOutputNumber < 2) {
      return false
    }

    // The total number of icons
    let iconNumber = 0
    //when only one source has records, and the ds item has an icon, padding should also be added
    let numberOfSourceWithRecordsAndIcon = 0
    for (const configId in displayRecord) {
      const datasourceConfigItem = getDatasourceConfigItemByConfigId(config, configId)
      const icon = datasourceConfigItem?.icon
      if (icon) {
        iconNumber += 1
      }
      if (displayRecord[configId]?.length > 0 && icon) {
        numberOfSourceWithRecordsAndIcon += 1
      }
    }
    return numberOfSourceWithRecordsAndIcon > 0 && iconNumber > 0
  }

  /**
   * Render result item
  */
  const renderResultItem = (displayData: DisplayRecord[], isShowPadding = false) => {
    return displayData?.map((displayDataItem, index) => {
      const { configId, value, recordId, outputDsId } = displayDataItem
      const key = getItemKey(configId, recordId)
      const isSelected = activeButtonKey === key
      const datasourceConfigItem = getDatasourceConfigItemByConfigId(config, configId)
      const icon = datasourceConfigItem?.icon
      const iconColor = isSelected ? theme?.colors?.white : theme?.colors?.primary
      const currentOutputNumber = getJsonLength(serviceList)

      return (
        <DropdownItem
          className={classNames('d-flex align-items-center', { 'item-p-l': isShowPadding })}
          key={key}
          active={isSelected}
          title={value.join(', ')}
          ref={ref => { setFirstItemRef(index, ref) }}
          onClick={() => {
            onSelectRecord({
              isActive: isSelected,
              key: key,
              recordId: recordId,
              dsId: outputDsId,
              configId: configId
            })
          }}
        >
          {(icon && currentOutputNumber === 1) && <Icon className='mr-2' color={iconColor} size={16} icon={icon?.svg}/> }
          <div>{value.join(', ')}</div>
        </DropdownItem>
      )
    })
  }

  const setFirstItemRef = (index: number, ref) => {
    if (index === 0 && !isHasSetFirstItem.current) {
      setResultFirstItem(ref)
      isHasSetFirstItem.current = true
    }
  }

  /**
   * Select record after ds selected records changed
  */
  const onSelectedRecordChange = () => {
    if (isNoResult()) return
    const newSelectedRecordsKey = []
    for (const configId in serviceList) {
      const serviceItem = serviceList[configId]
      const isGeocodeService = serviceItem?.searchServiceType === SearchServiceType.GeocodeService
      const dsId = isGeocodeService ? serviceItem?.outputDataSourceId : serviceItem?.useDataSource?.dataSourceId
      const key = getDsSelectRecordsKeyItemByDsId(dsId, configId)
      key && newSelectedRecordsKey.push(key)
    }
    const newSelectedRecordsKeyList = getNewSelectedRecordKey(newSelectedRecordsKey, selectedRecordKey?.current)
    selectedRecordKey.current = newSelectedRecordsKey
    if (newSelectedRecordsKeyList && newSelectedRecordsKeyList[0]) {
      setActiveButtonKey(newSelectedRecordsKeyList[0])
    } else {
      setActiveButtonKey(null)
    }
  }

  const getDsSelectRecordsKeyItemByDsId = (dsId: string, configId: string) => {
    const ds = getDatasource(dsId) as QueriableDataSource
    const selectRecords = ds.getSelectedRecords()
    const selectedRecordId = selectRecords?.[0]?.getId()
    if (!selectRecords || !selectedRecordId) {
      return null
    }
    const selectedRecordKey = getItemKey(configId, selectedRecordId)
    return selectedRecordKey
  }

  /**
   * Get key of new selected records by newSelectedKey andoldSelectedKey
  */
  const getNewSelectedRecordKey = (newSelectedKey: string[], oldSelectedKey: string[]): string[] => {
    if (newSelectedKey?.length > oldSelectedKey?.length) {
      return newSelectedKey.concat(oldSelectedKey).filter(key => !newSelectedKey.includes(key) || !oldSelectedKey.includes(key)) || []
    } else {
      return newSelectedKey || []
    }
  }

  const onSelectRecord = async (option: SelectRecordsOption) => {
    const { isActive, recordId, dsId, configId } = option
    const ds = getDatasource(dsId) as QueriableDataSource

    //Publish message action
    const records = !isActive ? await getRecordsByRecordsId(configId, recordId) : []
    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(id, records)
    )
    handleProccessResultSearch(records);
    handleDsIdOfSelectedResultItemChange(recordId ? dsId : null)
    if (recordId) {
      !isActive ? ds.selectRecordsByIds([recordId]) : ds.selectRecordsByIds([])
      !isActive && clearOtherDsSlectedRecords(configId)
    }
  }

  const clearOtherDsSlectedRecords = (currentSelectConfigId: string) => {
    for (const configId in displayRecord) {
      if (currentSelectConfigId === configId) {
        continue
      } else {
        const dsId = displayRecord[configId]?.[0]?.outputDsId
        const ds = getDatasource(dsId) as QueriableDataSource
        ds && ds.selectRecordsByIds([])
      }
    }
  }

  const getRecordsByRecordsId = (configId: string, recordId: string): DataRecord[] => {
    const records = displayRecords?.[configId] || []
    const fieldRecord = records?.filter(record => record?.getId() === recordId)
    return fieldRecord || []
  }

  /**
   * Get display record list by field name
  */
  const getDisplayRecords = (records: DataRecord[], configId: string, dsId: string, isGeocodeRecords: boolean): DisplayRecord[] => {
    const displayFields = serviceList?.[configId]?.displayFields || []
    const displayRecordItem: DisplayRecord[] = []
    records?.forEach(record => {
      const valueData = []
      displayFields.forEach(field => {
        const fieldValue = record.getFieldValue(field.jimuName)
        const isAvailable = fieldValue || fieldValue === 0
        isAvailable && valueData.push(fieldValue)
      })
      const displayRecord: DisplayRecord = {
        value: valueData,
        configId: configId,
        outputDsId: dsId,
        recordId: record?.getId()
      }
      displayRecordItem.push(displayRecord)
      initFirstRecord(displayRecord)
    })
    return displayRecordItem
  }

  const initFirstRecord = (displayItem: DisplayRecord) => {
    if (!firstRecord?.recordId && displayItem.recordId) {
      firstRecord = displayItem
    }
  }

  /**
   * Get key of record item element
  */
  const getItemKey = (configId: string, recordId: string) => {
    return `${configId}_${recordId}`
  }

  /**
   * Auto select first result
  */
  const autoSelectFirstRecord = () => {
    if (!config?.isAutoSelectFirstResult || !firstRecord?.recordId || isHasAutoSelectFirstRecord) return
    const { configId, recordId, outputDsId } = firstRecord
    const firstRecordKey = getItemKey(configId, recordId)
    onSelectRecord({
      isActive: false,
      key: firstRecordKey,
      recordId: recordId,
      dsId: outputDsId,
      configId: configId
    })
    setDsHasAutoSelectFirstRecord(true)
  }

  const onShowResultButtonclick = () => {
    setIsShowResultList(!isShowResultList)
    setVersion(version + 1)
  }

  const isNoResult = () => {
    let recordLength = 0
    for (const configId in displayRecord) {
      const length = displayRecord?.[configId]?.length || 0
      recordLength += length
    }
    return recordLength === 0 && isDataLoaded.current
  }

  const toggleResultListPopper = (e) => {
    const target = e?.target
    if (dropdownMenuRef?.current?.contains(target)) {
      return false
    }
    if (!isNoResult()) {
      setIsShowResultList(false)
    }
  }

  return (
    <div  style={{fontFamily: 'roboto'}}>
      <Dropdown className='w-100 dropdown-con' size='lg' isOpen={true} toggle={toggleResultListPopper} aria-expanded={true} css={dropdownStyle()}>
        <DropdownButton className='sr-only search-dropdown-button' style={{ padding: 0 }}></DropdownButton>
        <DropdownMenu version={version} className='result-list-con' offset={getResultPopperOffset(getJsonLength(config.datasourceConfig) > 1)} trapFocus={false} autoFocus={false} css={getStyle(theme, reference)} style={{ maxHeight: 'auto' }}>
            <div ref={dropdownMenuRef}>
              {!isNoResult() && <DropdownItem className='d-flex align-items-center show-result-button' onClick={onShowResultButtonclick} title={nls('searchResults')}>
                <div className='flex-grow-1 font-weight-bold'>{nls('searchResults')}</div>
                {(!isShowResultList && !!searchText) ? <DownOutlined/> : <UpOutlined/>}
              </DropdownItem>}
              {isShowResultList && <div>
                {!isNoResult() && <DropdownItem divider={true} />}
                {isNoResult() && <DropdownItem className='text-center' disabled={true} title={nls('noResult', { searchText: searchText })}>{nls('noResult', { searchText: searchText })}</DropdownItem>}
                {!isNoResult() && renderResultList()}
              </div>}
            </div>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
export default ResultList

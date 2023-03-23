/** @jsx jsx */
import { jsx, DataSourceJson, css, ImmutableArray } from 'jimu-core'
import { AllWidgetSettingProps } from 'jimu-for-builder'
import { JimuMapViewSelector, SearchDataConfig, SearchDataSetting, SearchDataType } from 'jimu-ui/advanced/setting-components'
import { IMConfig, SearchServiceType } from '../config'
import SearchResultSetting from './component/search-setting-option'
// import ArrangementStyleSetting from './component/arrangement-style'
interface ExtraProps {
  id: string
}

type SettingProps = AllWidgetSettingProps<IMConfig> & ExtraProps

const Setting = (props: SettingProps) => {
  const { config, id, portalUrl, onSettingChange, useDataSources } = props

  const SYLE = css`
    .suggestion-setting-con  {
      padding-bottom: 0;
    }
  `

  const onDataSettingChange = (datasourceConfig: ImmutableArray<SearchDataConfig>) => {
    if (!datasourceConfig) return false
    const newConfig = config?.setIn(['datasourceConfig'], datasourceConfig)
    onSettingChange({ id, config: newConfig })
  }

  const createOutputDs = (outputDsJsonList: DataSourceJson[], datasourceConfig: ImmutableArray<SearchDataConfig>) => {
    if (!datasourceConfig) return false
    const newConfig = config?.setIn(['datasourceConfig'], datasourceConfig)
    onSettingChange({
      id,
      config: newConfig,
      useUtilities: getUseUtilities(newConfig)
    }, outputDsJsonList)
  }

  const getUseUtilities = (config: IMConfig) => {
    const useUtilities = []
    config?.datasourceConfig?.forEach(configItem => {
      if (configItem?.searchServiceType === SearchServiceType.GeocodeService) {
        useUtilities.push(configItem?.useUtility)
      }
    })
    return useUtilities
  }

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    props.onSettingChange({
        id: props.id,
        useMapWidgetIds: useMapWidgetIds
    });
};

  return (
    <div className='widget-setting-search jimu-widget-search' css={SYLE}>
      <SearchDataSetting
        id={id}
        portalUrl={portalUrl}
        useDataSources={useDataSources}
        createOutputDs={true}
        onSettingChange={onDataSettingChange}
        onOutputDsSettingChange={createOutputDs}
        datasourceConfig={config?.datasourceConfig}
        searchDataSettingType={SearchDataType.Both}
      />
      <SearchResultSetting
        id={id}
        config={config}
        onSettingChange={onSettingChange}
        useDataSources={useDataSources}
      />

<JimuMapViewSelector onSelect={onMapWidgetSelected} useMapWidgetIds={props.useMapWidgetIds} />
      {/* <ArrangementStyleSetting
        id={id}
        config={config}
        onSettingChange={onSettingChange}
      /> */}
    </div>
  )
}

export default Setting

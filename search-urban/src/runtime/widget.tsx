/** @jsx jsx */
import { React, ReactRedux, css, jsx, AllWidgetProps, Immutable, ImmutableArray, polished, UseUtility, UtilityManager } from 'jimu-core'
import { ViewVisibilityContext, ViewVisibilityContextProps, PageVisibilityContext } from 'jimu-layouts/layout-runtime'
import { IMConfig, SearchDataConfig, ArrangementStyle, NewDatasourceConfigItem } from '../config'
import SearchSetting from './component/search-setting'
import SearchInput from './component/search'
import CreateDatasource from './component/create-datasource'
import { versionManager } from '../version-manager'
import { JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
const { useEffect, useState, useRef, Fragment, useLayoutEffect } = React
const {useDispatch} = ReactRedux;
type SearchProps = AllWidgetProps<IMConfig>

const Widget = (props: SearchProps) => {
  const { config, id, useMapWidgetIds } = props
  // ===============SonPA
  const [jimuMapView, setJimuMapView] = useState(null);

  // Kiểm tra Map
  const isMapConfigured = () => {
    return useMapWidgetIds && useMapWidgetIds.length === 1;
  }

    // Set MapView
const activeViewChangeHandler = (jmv: JimuMapView) => {
  if (jmv) setJimuMapView(jmv);
};

  // View Map
  const ViewMap = () => {
    return (
      <div>
        {isMapConfigured() &&
          <Fragment>
      
          <JimuMapViewComponent
            useMapWidgetId={useMapWidgetIds?.[0]}
            onActiveViewChange={activeViewChangeHandler}
          />
          </Fragment>
        }
      </div>
    )
  }

  const searchConRef = useRef<HTMLDivElement>(null)
  const [datasourceConfig, setDatasourceConfig] = useState(Immutable([]) as ImmutableArray<NewDatasourceConfigItem>)
  const [isShowSearchInput, setIsShowSearchInput] = useState(false)
  useEffect(() => {
    initDatasourceConfig()
    // eslint-disable-next-line
  }, [config])

  const STYLE = css`
    & {
      height: ${polished.rem(32)};
      margin-top: 1px;
      margin-left: 1px;
      font-family: 'roboto'
    }
  `
  const onDatasourceConfigChange = (newDatasourceConfig: ImmutableArray<NewDatasourceConfigItem>) => {
    newDatasourceConfig && setDatasourceConfig(newDatasourceConfig)
  }

  const initDatasourceConfig = async () => {
    const dsConfig = config?.datasourceConfig || Immutable([]) as ImmutableArray<SearchDataConfig>
    const newDsPromise = dsConfig.map(async configItem => {
      let newConfigItem = configItem?.setIn(['enable'], true)
      if (configItem?.useUtility) {
        await getUrlOfUseUtility(configItem?.useUtility).then(geocodeUrl => {
          newConfigItem = newConfigItem.setIn(['geocodeURL'], geocodeUrl)
        })
      }
      return Promise.resolve(newConfigItem?.asMutable({ deep: true }))
    })
    await Promise.all(newDsPromise).then(newDsConfig => {
      setDatasourceConfig(Immutable(newDsConfig as NewDatasourceConfigItem[]))
    })
  }

  const getUrlOfUseUtility = async (useUtility: UseUtility): Promise<string> => {
    return UtilityManager.getInstance().getUrlOfUseUtility(useUtility)
      .then((url) => {
        return Promise.resolve(url)
      })
  }

  const checkIsShowSearchInput = () => {
    if (config?.arrangementStyle === ArrangementStyle.Style1) {
      return true
    } else {
      return isShowSearchInput
    }
  }

  const onShowSearchInputChange = (isShow: boolean) => {
    setIsShowSearchInput(isShow)
  }

  return (
    <ViewVisibilityContext.Consumer>
      {({ isInView, isInCurrentView }: ViewVisibilityContextProps) => {
        const isSearchInCurrentView = isInView ? isInCurrentView : true
        return (
          <PageVisibilityContext.Consumer>
            {(isWidgetInCurrentPage) => {
              return (
                <div className='widget-search jimu-widget'>
                  <div className='d-flex w-100 align-items-center' css={STYLE} ref={searchConRef}>
                    <div>
                      {(config?.datasourceConfig?.length > 1 && checkIsShowSearchInput()) && <SearchSetting
                        className='h-100'
                        config={config}
                        datasourceConfig={datasourceConfig}
                        onDatasourceConfigChange={onDatasourceConfigChange}
                      />}
                    </div>
                    <ViewMap />
                    {jimuMapView && <SearchInput
                      id={id}
                      className='flex-grow-1 h-100'
                      reference={searchConRef}
                      datasourceConfig={datasourceConfig}
                      config={config}
                      isShowSearchInput={checkIsShowSearchInput()}
                      onShowSearchInputChange={onShowSearchInputChange}
                      isInCurrentView={isSearchInCurrentView}
                      isWidgetInCurrentPage={isWidgetInCurrentPage}
                      jimuMapView={jimuMapView}
                    />}
                    <CreateDatasource
                      id={id}
                      datasourceConfig={datasourceConfig}
                    />
                  </div>
                </div>
              )
            }}
          </PageVisibilityContext.Consumer>
        )
      }}
    </ViewVisibilityContext.Consumer>
  )
}
Widget.versionManager = versionManager
export default Widget

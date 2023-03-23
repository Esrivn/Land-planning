/** @jsx jsx */
import { jsx, ImmutableArray, DataSourceComponent, Immutable } from 'jimu-core'
import { IMNewDatasourceConfigItem, NewDatasourceConfigItem } from '../../config'
interface CreateDatasourceProps {
  id: string
  datasourceConfig: ImmutableArray<NewDatasourceConfigItem>
}

const CreateDatasource = (props: CreateDatasourceProps) => {
  const { datasourceConfig, id } = props

  const renderDatasourceComponent = (configItem: IMNewDatasourceConfigItem) => {
    const { configId } = configItem
    const outputDataSourceId = configItem?.outputDataSourceId
    const useDataSource = configItem?.useDataSource
    const outputDatasource = {
      dataSourceId: outputDataSourceId,
      mainDataSourceId: outputDataSourceId
    }
    return (<div key={`${configId}_con`}>
      {useDataSource && <DataSourceComponent
        useDataSource={Immutable(useDataSource)}
        query={null}
        key={`${configId}_useDataSource`}
        widgetId={id}
      />}
      {outputDataSourceId && <DataSourceComponent
        useDataSource={Immutable(outputDatasource)}
        query={null}
        key={`${configId}_outputDataSource`}
        widgetId={id}
      />}
    </div>)
  }

  return (
    <div>
      {
        datasourceConfig?.map(configItem => {
          return renderDatasourceComponent(configItem)
        })
      }
    </div>
  )
}

export default CreateDatasource

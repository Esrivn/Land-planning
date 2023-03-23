import { BaseVersionManager, JimuFieldType } from 'jimu-core'
import { OutputDsAddress, SearchServiceType } from 'jimu-ui/advanced/setting-components'
import { IMConfig } from './config'
export const AddressSchema = {
  jimuName: OutputDsAddress,
  alias: 'ADDRESS',
  type: JimuFieldType.String,
  name: OutputDsAddress
}
class VersionManager extends BaseVersionManager {
  versions = [
    {
      version: '1.9.0',
      description: 'For geocode service, use arrary of Schema to set displayFields',
      upgrader: (oldConfig: IMConfig) => {
        const newDatasourceConfig = oldConfig?.asMutable({ deep: true })?.datasourceConfig?.map(dsConfig => {
          if (dsConfig?.searchServiceType === SearchServiceType.FeatureService) {
            return dsConfig
          } else {
            if (dsConfig?.displayFields) {
              return dsConfig
            } else {
              dsConfig.displayFields = [AddressSchema]
              dsConfig.addressFields = [AddressSchema]
              dsConfig.defaultAddressFieldName = AddressSchema.jimuName
              return dsConfig
            }
          }
        })
        return oldConfig.setIn(['datasourceConfig'], newDatasourceConfig)
      }
    }
  ]
}

export const versionManager = new VersionManager()

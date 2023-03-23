/** @jsx jsx */
import { React, css, jsx, polished, ImmutableArray } from 'jimu-core'
import { Checkbox, Dropdown, DropdownButton, DropdownMenu, DropdownItem, hooks, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { useEffect } from 'react'
import { IMConfig, NewDatasourceConfigItem } from '../../config'
import defaultMessage from '../translations/default'
import { DownOutlined } from 'jimu-icons/outlined/directional/down'
import { UpOutlined } from 'jimu-icons/outlined/directional/up'
const { useRef, useState } = React

interface SearchSettingProps {
  config: IMConfig
  datasourceConfig: ImmutableArray<NewDatasourceConfigItem>
  onDatasourceConfigChange: (newDatasourceConfig: ImmutableArray<NewDatasourceConfigItem>) => void
  className?: string
}

const SearchSetting = (props: SearchSettingProps) => {
  const nls = hooks.useTranslate(defaultMessage, jimuiDefaultMessage)

  const STYLE = css`
    & {
      box-sizing: border-box;
      width: ${polished.rem(32)}
    }
    .setting-dropdown-button {
      border-radius: 0;
      svg {
        margin: 0 !important;
      }
    }
  `
  const [isCheckAll, setIsCheckAll] = useState(true)
  const [isOpen, setIsOpen] = React.useState(false)

  const { className, datasourceConfig, onDatasourceConfigChange } = props
  const dropdownMenuRef = useRef<HTMLDivElement>(null)

  const toggleSearchSetting = (e) => {
    const target = e?.target
    if (dropdownMenuRef?.current?.contains(target)) {
      return false
    }
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const isSelectAll = datasourceConfig?.filter(dsConfigItem => !dsConfigItem?.enable)?.length === 0
    setIsCheckAll(isSelectAll)
  }, [datasourceConfig])

  const onDsConfigItemChange = (enable: boolean, index: number) => {
    const newDatasourceConfig = (datasourceConfig as any)?.setIn([index, 'enable'], enable)
    onDatasourceConfigChange(newDatasourceConfig)
  }

  const selectAll = () => {
    const newDatasourceConfig = datasourceConfig?.map(configItem => {
      return configItem.setIn(['enable'], true)?.asMutable({ deep: true })
    })
    onDatasourceConfigChange(newDatasourceConfig)
  }

  const renderFieldListElement = () => {
    return datasourceConfig?.map((configDsItem, index) => {
      const disabled = datasourceConfig?.filter(dsConfigItem => dsConfigItem?.enable)?.length === 1 && configDsItem?.enable
      return <DropdownItem key={`${configDsItem?.label}${index}`} disabled={disabled} onClick={() => { onDsConfigItemChange(!configDsItem?.enable, index) }} >
        <Checkbox checked={configDsItem?.enable} disabled={disabled} className='mr-2'/>
        {configDsItem?.label}
      </DropdownItem>
    })
  }

  return (
    <div className={`${className || ''}`} css={STYLE}  style={{fontFamily: 'roboto'}}>
      <Dropdown className='w-100 h-100' toggle={toggleSearchSetting} isOpen={isOpen}>
        <DropdownButton className='h-100 setting-dropdown-button' arrow={false} icon title={nls('searchIn', { value: '' })}>
          {!isOpen && <DownOutlined size={16} className='mr-1 d-inline-block' autoFlip/>}
          {isOpen && <UpOutlined size={16} className='mr-1 d-inline-block' autoFlip/>}
        </DropdownButton>
        <DropdownMenu trapFocus={false} autoFocus={false} style={{ maxHeight: 'auto' }}>
          <div ref={dropdownMenuRef}>
            <DropdownItem onClick={selectAll} disabled={isCheckAll}>
              <Checkbox checked={isCheckAll} disabled={isCheckAll} className='mr-2'/>
              {nls('all')}
            </DropdownItem>
            <DropdownItem divider={true} />
            {
             renderFieldListElement()
            }
          </div>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default SearchSetting

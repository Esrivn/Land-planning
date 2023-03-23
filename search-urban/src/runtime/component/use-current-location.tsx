/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import { hooks, DropdownItem, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import defaultMessage from '../translations/default'
import { getCurrentLocation, getCurrentAddress } from '../utils/locator-service'
import { PinOutlined } from 'jimu-icons/outlined/application/pin'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import { GeocodeListItem, IMServiceList, SearchServiceType } from '../../config'
const { useState } = React
interface CurrentLocationProps {
  isShowCurrentLocation: boolean
  serviceList: IMServiceList
  onLocationChange: (searchText: string) => void
}

const CurrentLocation = (props: CurrentLocationProps) => {
  const nls = hooks.useTranslate(defaultMessage, jimuiDefaultMessage)
  const { serviceList, onLocationChange } = props
  const [isGetLocationError, setIsGetLocationError] = useState(false)
  const [geocodeServiceItem, setGeocodeServiceItem] = React.useState<GeocodeListItem>(null)

  React.useEffect(() => {
    initGeocodeService()
    // eslint-disable-next-line
  }, [serviceList])

  const confirmUseCurrentLocation = () => {
    getCurrentLocation(getLocationSuccess, getLocationError)
  }

  const initGeocodeService = () => {
    for (const configId in serviceList) {
      const serviceItem = serviceList[configId]?.asMutable({ deep: true })
      if (serviceItem.searchServiceType === SearchServiceType.GeocodeService) {
        setGeocodeServiceItem(serviceItem)
        break
      }
    }
  }

  const getLocationSuccess = (position) => {
    const longitude = position.coords.longitude
    const latitude = position.coords.latitude
    const address = `${longitude},${latitude}`
    if (geocodeServiceItem) {
      const geocodeURL = geocodeServiceItem?.geocodeURL
      getCurrentAddress(geocodeURL, position).then(res => {
        onLocationChange(res)
      })
    } else {
      onLocationChange(address)
    }
  }

  const getLocationError = () => {
    setIsGetLocationError(true)
  }

  return (
    <div>
      {!isGetLocationError && <DropdownItem onClick={confirmUseCurrentLocation}>
        <PinOutlined className='mr-2'/>
        {nls('useCurrentLocation')}
      </DropdownItem>}
      {isGetLocationError && <DropdownItem>
        <WarningOutlined className='mr-2'/>
        {nls('couldNotRetrieve')}
      </DropdownItem>}
    </div>
  )
}

export default CurrentLocation

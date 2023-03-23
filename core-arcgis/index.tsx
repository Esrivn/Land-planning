import { React, jsx, AllWidgetProps, ReactResizeDetector, IMState, classNames, utils } from 'jimu-core'
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis'
import { Button, Loading, LoadingType, WidgetPlaceholder } from 'jimu-ui'
import esriRequest from 'esri/request'
import Point from 'esri/geometry/Point'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import Graphic from 'esri/Graphic'
import Polygon from 'esri/geometry/Polygon'
import Extent from 'esri/geometry/Extent'
import Multipoint from 'esri/geometry/Multipoint'
import SpatialReference from 'esri/geometry/SpatialReference'
import Polyline from 'esri/geometry/Polyline'
import Layer from 'esri/layers/Layer'
import WMTSLayer from 'esri/layers/WMTSLayer'
import VectorTileLayer from 'esri/layers/VectorTileLayer'
import WMSLayer from 'esri/layers/WMSLayer'
import KMLLayer from 'esri/layers/KMLLayer'
import Query from 'esri/rest/support/Query'
import execute from 'esri/rest/query'
import ProjectParameters from 'esri/rest/support/ProjectParameters'
import geometryEngine from 'esri/geometry/geometryEngine'
import FeatureForm from 'esri/widgets/FeatureForm'
import Camera from 'esri/Camera'
import promiseUtils from 'esri/core/promiseUtils'
import Mesh from 'esri/geometry/Mesh'
import geometryService from 'esri/rest/geometryService'
import FieldElement from 'esri/form/elements/FieldElement'
import FormTemplate from 'esri/form/FormTemplate'
import IdentityManager from 'esri/identity/IdentityManager'
import Projection from 'esri/geometry/projection'

//import { getStyle } from './assets/style'
import oiIcon from 'jimu-icons/svg/outlined/brand/oriented-imagery.svg'
import { setDefaultRequestOptions } from '@esri/arcgis-rest-request'

interface State {
  selectedOIC: string
  config: any
  OICname: string
  showLoading: boolean
  mapLoaded: boolean
  defaultImage: string //#9678 issue fix
  defaultPoint: __esri.Geometry //#9678 issue fix
}

interface Props {
  pointBool: boolean
  oiApiLoaded: boolean
}

const GEOMETRY_SERVICE_URL = utils.getGeometryService() //#9677 issue fix
const SYMBOLS = ['diamond', 'x', 'circle', 'simple-line'] //#9677 issue fix

export const CoresriRequest = (
  url = '',
  params = {},
  type = '',
  useProxy = false,
  usePost = "post"
) => {
  let newUrl = url;
  switch (type) {
    case 'query':
      newUrl += '/query';
      usePost = "auto";
      break;
    case 'insert':
      newUrl += '/addFeatures';
      usePost = "post"
      break;
    case 'update':
      newUrl += '/updateFeatures';
      usePost = "post"
      break;
    case 'delete':
      newUrl += '/deleteFeatures';
      break;
    case 'applyedit':
      newUrl += '/applyEdits';
      usePost = "post";
      break;
    default:
      break;
  }
  esriRequest(newUrl, {
    query: params,
    responseType: 'json',
    useProxy: useProxy,
    method: usePost === "post" ? "post" : "auto",
  })
    .then(async (result) => {
      console.log(result);
    });

}


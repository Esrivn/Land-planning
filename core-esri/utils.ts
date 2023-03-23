/* eslint-disable prefer-const */
import { AppMode, dataSourceUtils } from 'jimu-core'
import { IFeature } from '@esri/arcgis-rest-types'
import { geometryUtils, loadArcGISJSAPIModules, JimuMapView, LayerTypes, JimuFeatureLayerView, JimuSceneLayerView } from 'jimu-arcgis'
import { symbolPolygon } from './Symbol';
//import request from 'esri/request';
export const esriRequest = async (
  url = '',
  params = {},
  type = '',
  useProxy = false,
  method = 'auto'
) => {
  let newUrl = url;
  switch (type) {
    case 'query':
      newUrl += '/query';
      method = 'get';
      break;
    case 'insert':
      newUrl += '/addFeatures';
      method = 'post';
      break;
    case 'update':
      newUrl += '/updateFeatures';
      method = 'post';
      break;
    case 'delete':
      newUrl += '/deleteFeatures';
      method = 'post';
      break;
    case 'applyedit':
      newUrl += '/applyEdits';
      method = 'post';
      break;
    default:
      break;
  }

  //  return await loadModules(['esri/request', 'esri/config']).then(
  //     async ([request, esriConfig]) => {
  //   let form = null;
  //   if (params.form) {
  //     form = params.form;
  //     delete params.form;
  //   }
  const options: any = {
    query: params,
    responseType: "json",
    useProxy: useProxy,
    method: method
  };
  return await loadArcGISJSAPIModules(['esri/request', 'esri/config']).then(
    modules => {
      let request: typeof __esri.request;
      let config: typeof __esri.config;
      [request, config] = modules;
      let resp = request(newUrl, options).then(
        function (response) {
          //   return new Promise((resolve, reject) => {
          //     resolve(response);
          //   });
          return response;
          //console.log("Success: ", response);
        },
        function (error) {
          console.log('Error: ', error.message);
        }
      );
      return resp;
    }
  );

};

export async function createNewFeaturelayer(mapBaseView: __esri.MapView | __esri.SceneView, newFeatureSetValue?: { [layerID: string]: __esri.FeatureSet }): Promise<any> {
  const newLayerPromises = []
  newFeatureSetValue && Object.keys(newFeatureSetValue).forEach(layerId => {
    const layer = mapBaseView.map.layers.find(layer => layer.id === layerId)
    if (layer) {
      console.warn('the feature layer is already created')
      return
    }
    newLayerPromises.push(addFeatureSetToMap(mapBaseView, newFeatureSetValue[layerId], layerId))
  })

  if (newLayerPromises.length === 0) {
    return null
  } else {
    return Promise.all(newLayerPromises)
  }
}

export async function updateFeaturelayer(mapBaseView: __esri.MapView | __esri.SceneView, changedFeatureSetValue?: { [layerID: string]: __esri.FeatureSet }): Promise<any> {
  const updatePromises = []
  changedFeatureSetValue && Object.keys(changedFeatureSetValue).forEach(layerId => {
    const layer = mapBaseView.map.layers.find(layer => layer.id === layerId)
    if (layer) {
      mapBaseView.map.remove(layer)
      updatePromises.push(addFeatureSetToMap(mapBaseView, changedFeatureSetValue[layerId], layerId))
    }
  })

  if (updatePromises.length === 0) {
    return null
  } else {
    return Promise.all(updatePromises)
  }
}

async function addFeatureSetToMap(mapBaseView: __esri.MapView | __esri.SceneView, featureSet: __esri.FeatureSet, layerId: string): Promise<any> {
  return await new Promise((resolve, reject) => {
    return loadArcGISJSAPIModules([
      'esri/layers/FeatureLayer'
    ]).then(modules => {
      if (featureSet.features.length < 1) {
        return resolve(null)
      } else {
        // let FeatureSet: typeof  __esri.FeatureSet;
        let FeatureLayer: typeof __esri.FeatureLayer;
        // eslint-disable-next-line
        [FeatureLayer] = modules;

        const layerFromFeatureSet = featureSet.features[0].layer as any
        const fieldsInFeaturelayer = []
        const fieldMap = {}

        for (let i = 0; i < layerFromFeatureSet.fields.length; i++) {
          const fieldsItem = getReasonableField(layerFromFeatureSet.fields[i])
          fieldMap[layerFromFeatureSet.fields[i].name] = fieldsItem.name
          fieldsInFeaturelayer.push(fieldsItem)
        }

        const fieldsInPopupTemplate = []
        for (const key in featureSet.features[0].attributes) {
          if (fieldMap[key]) {
            const fieldsItem = {
              fieldName: fieldMap[key],
              label: key
            }
            fieldsInPopupTemplate.push(fieldsItem)
          }
        }

        const sourceFeatures = []
        featureSet.features.forEach((feature, index) => {
          const tempFeature = feature
          if (tempFeature.attributes) {
            for (const key in tempFeature.attributes) {
              tempFeature.attributes[fieldMap[key]] = tempFeature.attributes[key]
            }

            tempFeature.attributes.exbfid = index
          } else {
            tempFeature.attributes = {
              exbfid: index
            }
          }
          sourceFeatures.push(tempFeature)
        })

        const layer = new FeatureLayer({
          id: layerId,
          title: layerFromFeatureSet.title,
          source: sourceFeatures,
          fields: fieldsInFeaturelayer,
          outFields: ['*'],
          objectIdField: 'exbfid',
          renderer: layerFromFeatureSet.renderer,
          popupEnabled: true,
          popupTemplate: {
            title: 'information',
            content: [{
              type: 'fields',
              fieldInfos: fieldsInPopupTemplate
            }]
          }
        })

        mapBaseView.map.add(layer)

        layer.on('layerview-create', event => {
          return resolve(null)
        })
      }
    })
  })
}

function getReasonableField(field: __esri.Field): __esri.Field {
  // the function is supported to normalize the field.name
  const fieldName = field.name
  return {
    name: fieldName.replace(/\./g, '_').replace(/\(/g, '_').replace(/\)/g, '_'),
    alias: field.alias,
    type: field.type
  } as any
}


export async function mapPanto(mapBaseView: __esri.MapView | __esri.SceneView, target: __esri.Geometry | __esri.Geometry[] |
  __esri.Graphic | __esri.Graphic[] | __esri.Extent): Promise<any> {
  const panToTarget = target as any
  const tempBaseMapView = mapBaseView as any
  if (panToTarget instanceof Array) {
    if (panToTarget.length === 0) return await Promise.resolve()

    if (panToTarget[0].geometry) {
      const geometryArr: __esri.Geometry[] = []
      for (let i = 0; i < panToTarget.length; i++) {
        geometryArr.push(panToTarget[i].geometry)
      }

      return await getGeometriesExtent(geometryArr).then((extent) => {
        return tempBaseMapView.goTo(extent.center)
      })
    } else {
      return getGeometriesExtent(panToTarget).then((extent) => {
        return tempBaseMapView.goTo(extent.center)
      })
    }
  } else {
    if (panToTarget.geometry) {
      const getmetry = panToTarget.geometry as __esri.Geometry
      return tempBaseMapView.goTo(getCenterPoint(getmetry))
    } else {
      return tempBaseMapView.goTo(getCenterPoint(panToTarget))
    }
  }
}

async function getGeometriesExtent(geometries: __esri.Geometry[]): Promise<__esri.Extent> {
  return await loadArcGISJSAPIModules([
    'esri/geometry/Extent'
  ]).then(async modules => {
    // eslint-disable-next-line
    let Extent: typeof __esri.Extent;
    [Extent] = modules

    if (!geometries || !geometries.length) {
      return await Promise.resolve(null)
    }

    let fullExtent: __esri.Extent = null
    let index
    const numGeometries = geometries.length

    for (index = 0; index < numGeometries; index++) {
      const geometry = geometries[index]
      if (!geometry) {
        continue
      }

      let extent = geometry.extent

      if (!extent && geometry.type === 'point') {
        const pointGeometry = geometry as any

        if (pointGeometry.x && pointGeometry.y) {
          extent = new Extent({
            xmax: pointGeometry.x,
            xmin: pointGeometry.x,
            ymax: pointGeometry.y,
            ymin: pointGeometry.y,
            zmax: pointGeometry.z,
            zmin: pointGeometry.z,
            spatialReference: pointGeometry.spatialReference
          })
        }
      }

      if (!extent) {
        continue
      }

      if (fullExtent) {
        fullExtent = fullExtent.union(extent)
      } else {
        fullExtent = extent
      }
    }

    if (fullExtent.width < 0 && fullExtent.height < 0) {
      return await Promise.resolve(null)
    }

    return await Promise.resolve(fullExtent)
  })
}

export function filterFeaturesByQuery(jimuMapView: JimuMapView, layerDataSourceId: string, querySQL: string): void {
  if (layerDataSourceId) {
    const jimuLayerViews = jimuMapView.jimuLayerViews
    const jimuLayerViewIds = Object.keys(jimuLayerViews)
    for (let i = 0; i < jimuLayerViewIds.length; i++) {
      let tempJimuLayerView = jimuLayerViews[jimuLayerViewIds[i]]
      if (tempJimuLayerView && tempJimuLayerView.layer && tempJimuLayerView.layerDataSourceId === layerDataSourceId &&
        (tempJimuLayerView.type === LayerTypes.FeatureLayer || tempJimuLayerView.type === LayerTypes.SceneLayer)) {
        (tempJimuLayerView as JimuFeatureLayerView | JimuSceneLayerView).setLocalDefinitionExpression(querySQL)
      }
    }
  }
}

function queryFeatures(layerObject, querySQL) {
  return loadArcGISJSAPIModules([
    'esri/rest/support/Query'
  ]).then(modules => {
    let Query: typeof __esri.Query;
    [Query] = modules
    const query = new Query()
    query.where = querySQL
    query.outFields = ['*']
    query.returnGeometry = true
    return layerObject.queryFeatures(query).then(featureSet => {
      return featureSet
    })
  })
}

function flashOnFeatureLayer(jimuMapView: JimuMapView, querySQL: string, tempJimuLayerView: JimuFeatureLayerView) {
  if ((tempJimuLayerView).view) {
    let featureLayerView: __esri.FeatureLayerView = (tempJimuLayerView).view
    if (featureLayerView) {
      queryFeatures(featureLayerView.layer, querySQL).then(featureSet => {
        if (featureSet && featureSet.features && featureSet.features.length > 0) {
          const symbol = getFlashSymbol(featureLayerView.layer.geometryType)
          startFlash(jimuMapView.view, featureSet.features, symbol)
        }
      })
    } else {
      return null
    }
  } else {
    loadArcGISJSAPIModules([
      'esri/layers/FeatureLayer'
    ]).then(modules => {
      let FeatureLayer: typeof __esri.FeatureLayer;
      [FeatureLayer] = modules

      let tempFeatureLayer = new FeatureLayer({
        url: dataSourceUtils.getUrlByLayer((tempJimuLayerView as JimuFeatureLayerView | JimuSceneLayerView).layer)
      })
      tempFeatureLayer.load().then(() => {
        queryFeatures(tempFeatureLayer, querySQL).then(featureSet => {
          if (featureSet && featureSet.features && featureSet.features.length > 0) {
            const symbol = getFlashSymbol(featureSet.features[0].geometry.type)
            startFlash(jimuMapView.view, featureSet.features, symbol)
          }
        })
      })
    })
  }
}

let sceneHightlightHandle = null
function flashOnSceneLayer(jimuMapView: JimuMapView, querySQL: string, tempJimuLayerView: JimuSceneLayerView) {
  if ((tempJimuLayerView).view) {
    let sceneLayerView: __esri.SceneLayerView = (tempJimuLayerView).view
    // @ts-expect-error
    queryFeatures(sceneLayerView?.layer?.associatedLayer, querySQL).then(featureSet => {
      if (featureSet && featureSet.features && featureSet.features.length > 0) {
        const objectIdField = sceneLayerView.layer.objectIdField
        const objectIds = featureSet.features.map(feature => feature.attributes[objectIdField])

        let i = 0
        const maxFlashCount = 6
        let highlightColor = [255, 255, 0, 0.8]
        const originalHighlightOptions = jimuMapView.view.highlightOptions

        const flash = function () {
          if (i < maxFlashCount) {
            i++
            if (highlightColor) {
              highlightColor = null
              // @ts-expect-error
              jimuMapView.view.highlightOptions = { color: [0, 0, 0, 0] }
              sceneHightlightHandle && sceneHightlightHandle.remove()
              sceneHightlightHandle = sceneLayerView.highlight(objectIds)
            } else {
              highlightColor = [255, 255, 0, 0.8]
              // @ts-expect-error
              jimuMapView.view.highlightOptions = { color: highlightColor }
              sceneHightlightHandle && sceneHightlightHandle.remove()
              sceneHightlightHandle = sceneLayerView.highlight(objectIds)
            }
            setTimeout(flash, 500)
          } else {
            jimuMapView.view.highlightOptions = originalHighlightOptions
            sceneHightlightHandle && sceneHightlightHandle.remove()
          }
        }
        setTimeout(flash, 500)
      }
    })
  }
}

export function flashFeaturesByQuery(jimuMapView: JimuMapView, layerDataSourceId: string, querySQL: string): void {
  if (layerDataSourceId) {
    const jimuLayerViews = jimuMapView.jimuLayerViews
    const jimuLayerViewIds = Object.keys(jimuLayerViews)
    for (let i = 0; i < jimuLayerViewIds.length; i++) {
      let tempJimuLayerView = jimuLayerViews[jimuLayerViewIds[i]]
      if (tempJimuLayerView && tempJimuLayerView.layer && tempJimuLayerView.layerDataSourceId === layerDataSourceId) {
        if (tempJimuLayerView.type === LayerTypes.FeatureLayer) {
          flashOnFeatureLayer(jimuMapView, querySQL, tempJimuLayerView as JimuFeatureLayerView)
        } else if (tempJimuLayerView.type === LayerTypes.SceneLayer) {
          flashOnSceneLayer(jimuMapView, querySQL, tempJimuLayerView as JimuSceneLayerView)
        }
      }
    }
  }
}

function startFlash(mapBaseView: __esri.MapView | __esri.SceneView, features: __esri.Graphic[], symbol) {
  loadArcGISJSAPIModules([
    'esri/Graphic'
  ]).then(modules => {
    // eslint-disable-next-line
    let Graphic: typeof __esri.Graphic;
    [Graphic] = modules

    const flashFeatures = function (features: __esri.Graphic[], maxFlashCount: number) {
      const graphics = []
      let flashCount = 0
      for (let i = 0; i < features.length; i++) {
        const tempGraphic = new Graphic({
          geometry: features[i].geometry,
          symbol: symbol,
          attributes: features[i].attributes
        })
        graphics.push(tempGraphic)
      }

      const singleFlash = function () {
        mapBaseView.graphics.addMany(graphics)
        setTimeout(() => {
          mapBaseView.graphics.removeMany(graphics)
          flashCount = flashCount + 1
          if (flashCount < maxFlashCount) {
            setTimeout(() => {
              singleFlash()
            }, 500)
          }
        }, 500)
      }

      singleFlash()
    }

    flashFeatures(features, 3)
  })
}

function getFlashSymbol(geometryType: string) {
  if (['point', 'multipoint'].includes(geometryType)) {
    return {
      type: 'simple-marker',
      style: 'circle',
      color: [255, 255, 0, 0.8],
      size: '16px',
      outline: {
        color: [255, 255, 0, 0.8],
        width: 3
      }
    }
  } else if (['polyline'].includes(geometryType)) {
    return {
      type: 'simple-line',
      color: [255, 255, 0, 0.8],
      width: 3,
      style: 'solid'
    }
  } else if (['polygon', 'extent'].includes(geometryType)) {
    return {
      type: 'simple-fill', // autocasts as new SimpleFillSymbol()
      color: [255, 255, 0, 0.5],
      style: 'solid',
      outline: { // autocasts as new SimpleLineSymbol()
        color: [255, 255, 0, 0.8],
        width: 3
      }
    }
  } else if (['mesh'].includes(geometryType)) {
    return {
      type: 'mesh-3d', // autocasts as new MeshSymbol3D()
      symbolLayers: [{
        type: 'fill', // autocasts as new FillSymbol3DLayer()
        material: { color: [255, 255, 0, 0.8] }
      }]
    }
  } else {
    return null
  }
}

function getCenterPoint(geometry: __esri.Geometry): __esri.Point {
  // point | multipoint | polyline | polygon | extent | mesh
  switch (geometry.type) {
    case 'point':
      return geometry as __esri.Point
    case 'extent':
      return (geometry as __esri.Extent).center
    case 'polygon':
      return (geometry as __esri.Polygon).centroid
    case 'polyline':
      return (geometry as __esri.Polyline).extent.center
    default:
      return geometry && geometry.extent ? geometry.extent.center : undefined
    // todo
  }
}

export function handleFeature(feature: IFeature | __esri.Graphic, Graphic: __esri.GraphicConstructor): __esri.Graphic {
  let tempFeature = null
  if ((feature as any).clone) {
    tempFeature = (feature as any).clone()
  } else {
    tempFeature = Graphic.fromJSON(Object.assign({}, feature))
    tempFeature.attributes = Object.assign({}, feature.attributes)
  }
  return tempFeature
}

export async function projectGeometries(geometries: __esri.Geometry[], spatialReference: __esri.SpatialReference): Promise<__esri.Geometry[]> {
  if (!geometries || geometries.length === 0 || !geometries[0] ||
    spatialReference.wkid === geometries[0].spatialReference.wkid || (spatialReference.equals(geometries[0].spatialReference))) {
    return await Promise.resolve(geometries)
  } else if (spatialReference.isWebMercator && geometries[0].spatialReference.isWGS84) {
    // In js api 4.x, the view can handle WebMercator and WGS84 spatialReference auto
    return await Promise.resolve(geometries)
  } else if (spatialReference.isWGS84 && geometries[0].spatialReference.isWebMercator) {
    // In js api 4.x, the view can handle WebMercator and WGS84 spatialReference auto
    return await Promise.resolve(geometries)
  } else {
    return await geometryUtils.projectToSpatialReference(geometries, spatialReference)
  }
}

export async function processZoomToFeatures(mapBaseView: __esri.MapView | __esri.SceneView, layer: any, features: __esri.Graphic[]): Promise<__esri.Graphic[]> {
  if (mapBaseView && mapBaseView.type === '3d' && layer && layer.queryFeatures && features) {
    return await loadArcGISJSAPIModules([
      'esri/rest/support/Query'
    ]).then((modules) => {
      const [Query] = modules
      const query = new Query()
      query.returnGeometry = true
      query.outFields = ['*']
      query.objectIds = features.map(feature => feature.attributes[layer.objectIdField])
      return layer.queryFeatures(query).then(async (result) => {
        if (result && result.features && result.features.length === features.length) {
          return await Promise.resolve(result.features)
        } else {
          return await Promise.resolve(features)
        }
      }, async () => {
        return await Promise.resolve(features)
      })
    })
  } else {
    return await Promise.resolve(features)
  }
}

export function checkIsLive(appMode: AppMode): boolean {
  if (window.jimuConfig.isInBuilder) {
    if (appMode === AppMode.Design) {
      return false
    } else {
      return true
    }
  } else {
    return true
  }
}
export const zoomToFeature = async (geometry: any, mapBaseView: __esri.MapView | __esri.SceneView) => {
  const map: any = mapBaseView;
  //3D
  if (mapBaseView && mapBaseView.type === '3d' && geometry) {
  }
  //2D
  else {
   await loadArcGISJSAPIModules([
      'esri/symbols/PictureMarkerSymbol',
      'esri/symbols/SimpleMarkerSymbol',
      'esri/geometry/Point',
      'esri/Graphic',
      'esri/geometry/Polygon'
    ]).then(pg => {
      let Polygon: typeof __esri.geometry.Polygon;
      let Graphic: typeof __esri.Graphic;
      [Polygon] = pg;
      [Graphic] = pg;
      const polygon = new Polygon({
        hasZ: true,
        hasM: true,
        rings: geometry.rings,
        spatialReference: { wkid: 102100 }
 
      });

      switch (geometry.geometryType) {
        case "esriGeometryPolygon":
              
          let Polygon: typeof __esri.geometry.Polygon;
          [Polygon] = pg;
          const polygon = new Polygon({
            hasZ: true,
            hasM: true,
            rings: geometry.ring,
            spatialReference: { wkid: 102100 }
          });
         geometry.spatialReference = map.view.spatialReference;
         const gra = new Graphic({
          geometry: polygon,
          symbol: symbolPolygon,
        });
          map.view.graphics.add(gra);
          map.view.goTo({
            target: geometry,
            zoom: 20
          });
          break;
        case "esriGeometryPolyline":
  
          break;
        case "esriGeometryPoint":
  
          break;
        default:
          break;
  
  
  
      }
    });
  }
}
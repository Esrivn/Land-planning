import request from 'esri/request';
import { loadArcGISJSAPIModules } from 'jimu-arcgis';


export const esriRequest1 = (url, params, method) => {
  const options: any = {
    query: params,
    responseType: "json",
    useProxy: false,
    method: method
  };
  return request(url, options)
}

const esriRequest = (url, params, method, callback?, error?) => {
  const options: any = {
    query: params,
    responseType: "json",
    useProxy: false,
    method: method
  };
  request(url, options).then((resp) => callback(resp.data),
    (err) => error(err));
}

export const queryData = (url, geometry, geometryType ,spatialRel, callback, error) => {
  const param = {
    geometry: geometry,
    f: 'json',
    outFields: ['*'],
    outSR: 102100,
    returnGeometry: true,
    geometryType: geometryType,
    spatialRel: spatialRel
  };
  
  esriRequest(url, param,'GET', res => {
    callback(res)
    
  }, err => {
    error(err)
  })
}

export const printTask = async (url: string, printParam: any = {}, callback?, error? ) => {
  const [print] = await loadArcGISJSAPIModules([ 'esri/rest/print'])
  print.execute(url, printParam).then((response) => callback(response), (err) => error(err))
}

export const printTask1 = async (
  url: string,
  printParam: any = {},
  templare:any = {}
) => {
  const [print] = await loadArcGISJSAPIModules([
    
  'esri/rest/print'])

  // let urlRequest = url;
  // const printTask = new PrintTask(urlRequest);
  // const printParam = new PrintParameters();
  // const printTemplate = new PrintTemplate();
  // printParam.template = printTemplate;
  let resp =  print.execute(url, printParam, (response: any) => { 
    return response
  },(error: any) => {
    return error  
    });

    return resp
}

export const addGraphicFill = async (geo: any, graphicProp, mapview) => {
  // clearGraphic(graphicProp.LAYER_ID, mapview);
  const [Graphic] = await loadArcGISJSAPIModules(['esri/Graphic']);
  let _layer: any;
  // let gSysmbol = {
  //   type: "simple-fill", 
  //   color: [255, 255, 255, 0.1],  
  //   outline: {
  //     color: [255, 255, 255, 1],
  //     width: 2,
  //     style: 'short-dash'
  //   }
  // };
  let symbol: any = {
    type: "simple-fill",  // autocasts as new SimpleFillSymbol()
    color: [102, 153, 255, 0.20],
    outline: { 
      color: [0 , 0, 255],
      width: "2px"
    }
  };

  let graphic = new Graphic({
    geometry: geo,
    symbol: symbol,
    // visible: false
    // popupTemplate: popupTemplate
  });

  let gLayer = await isExistingLayer(graphicProp.LAYER_ID, mapview)
  if (!gLayer) {
    _layer = await createLayer(graphicProp.LAYER_ID, mapview, 1)
  } else {
    _layer = gLayer
  }

  if (_layer) {
    _layer.add(graphic)
  }
}

export const addGraphicSampleLine = async (geo: any, graphicProp, mapview) => {
  // clearGraphic(graphicProp.LAYER_ID, mapview);
  const [Graphic] = await loadArcGISJSAPIModules(['esri/Graphic']);
  let _layer: any;
  let polylineSymbol = {
    type: "simple-line",
    color: [0 , 0, 255],
    width: 2
  };

  let graphic = new Graphic({
    geometry: geo,
    symbol: polylineSymbol,
    // visible: false
    // popupTemplate: popupTemplate
  });

  let gLayer = await isExistingLayer(graphicProp.LAYER_ID, mapview)
  if (!gLayer) {
    _layer = await createLayer(graphicProp.LAYER_ID, mapview, 1)
  } else {
    _layer = gLayer
  }

  if (_layer) {
    _layer.add(graphic)
  }
}

const createLayer = async (layerId: string, mapview, opacity?) => {
  const [GraphicsLayer] = await loadArcGISJSAPIModules(['esri/layers/GraphicsLayer']);
  try {
    const layer = new GraphicsLayer({ id: layerId, opacity: opacity ? opacity : 1, listMode: 'show' });
    // Add GraphicsLayer to map
    await mapview.view.map.add(layer);
    return layer || undefined;
  }
  catch (exception) {
    return undefined;
  }
}

 const isExistingLayer = (layerId: string, mapview) => {
  try {
    const layer = mapview.view.map.findLayerById(layerId);
    return layer || undefined;
  }
  catch (exception) {
    return undefined;
  }
}

export const clearGraphic = async (layerId, mapview) =>{
  let gLayer = await isExistingLayer(layerId, mapview);
  if (gLayer) {
    gLayer.removeAll();
  }
}







export default esriRequest


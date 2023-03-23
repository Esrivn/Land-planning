import React from 'react';
import { AppMode, dataSourceUtils } from 'jimu-core'
import { IFeature } from '@esri/arcgis-rest-types'
import { geometryUtils, loadArcGISJSAPIModules, JimuMapView, LayerTypes, JimuFeatureLayerView, JimuSceneLayerView } from 'jimu-arcgis'
import { OdataParams, QdataParams, SearchResponse } from './config';
import { decodeSql } from './common';
class arcgisservices extends React.Component {
    constructor() {
        super(null);
        this.state = { color: "red" };
        //this.canhbao = this.canhbao.bind(this);
    }
    canhbao = () => {
        alert('12332');
    };
    esriRequest = async (
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
    query = async(q: QdataParams) => {
        const url = q.url;
        const useProxy = q.proxy !== null && q.proxy !== undefined;
        //const usePost = q.method === 'POST';

        const _params = {
            f: 'json',
            returnGeometry: true,
            spatialRel: 'esriSpatialRelEnvelopeIntersects'
        };
        const param = q.params == null? _params: q.params;
        return  await this.esriRequest(url, param, 'query', useProxy, '');
    }

    
    queryCustom = async (q: QdataParams) => {
        const url = q.url;
        const useProxy = q.proxy !== null && q.proxy !== undefined;
        // const method = q.method;

        return await this.esriRequest(url, q.params, '', useProxy, q.method);
    }

    search = async(p: OdataParams) => {
        const where = decodeSql(p.where);
        const outFields = p.select ? [p.select] : ['*'];
        const _params: any = {
            f: 'json',
            outFields,
            returnGeometry: p.returnGeometry !== undefined ? p.returnGeometry : true,
            spatialRel: 'esriSpatialRelEnvelopeIntersects',
            where:where ,
            outSR : 102100
        };

        if (p.geometry) {
            _params['geometry'] = JSON.stringify(p.geometry);
            _params['geometryType'] = 'esriGeometryEnvelope';
            if (p.geometry.type === 'polygon') {
                _params['geometryType'] = 'esriGeometryPolygon';
                // _params.spatialRel = 'esriSpatialRelEnvelopeIntersects';
            }
        }

        if (p.spatialRelationship) {
            _params['spatialRel'] = p.spatialRelationship;
        }

        if (p.distinct) {
            _params['returnDistinctValues'] = true;
        }
        if (p.orderBy) {
            _params['orderByFields'] = p.orderBy;
        }
        if (p.groupBy) {
            _params['groupByFields'] = p.groupBy.join(',');
        }


        const _paramsTotal = {
            ..._params,
            returnCountOnly: true
        };

        // Nếu truyền pageNumber và pageSize thì => lazyload, còn không sẽ load toàn bộ
        if (p.startRecord) {
            _params['resultOffset'] = p.startRecord;
        }
        if (p.pageSize) {
            _params['resultRecordCount'] = p.pageSize;
        }

        const list = [];
        const url = `${p.url}`;
        try {
            const resutl: any = await(this.esriRequest(url, _params, 'query'));
            const resultTotal:any = await(this.esriRequest(url, _paramsTotal, 'query'));
            const result: SearchResponse = {
                features: [],
                total: 0,
                success: true,
                message: 'Search Success'
            };
            // if ((resutl[0].httpCode || resultTotal[0].httpCode) && (resutl[0].httpCode !== 200 || resultTotal[0].httpCode !== 200)) {
            //     result.success = false;
            //     result.message = 'Request Error';
            //     return result;
            // }

            // if (resutl[0].message === 'Timeout exceeded') {
            //     result.success = false;
            //     result.message = 'Request timeout';
            //     return result;
            // }

            if (resutl.data && resutl.data.features) {
                const geometryType = resutl.data.geometryType;
                const wkid = resutl.data.spatialReference ?? 102100;

                resutl.data.features.forEach((item: any) => {

                    if (item.geometry) {
                        item.geometry.spatialReference = wkid;
                        item.geometry.geometryType = geometryType;
                        item.attributes.__geometry = item.geometry;
                    }

                    result.features.push(item.attributes);
                });

                result.total = resultTotal.data ? resultTotal.data.count : 0;
            } else {
                result.success = false;
                result.message = 'Request error';
            }
            return result;
        } catch (error) {
            this.handleSearchError(error);
        }


    }
    private handleSearchError(e) {
        const rq: SearchResponse = {
            features: [],
            total: 0,
            success: false,
            message: 'Search error!'
        };
        return (rq);
    }
    render() {
        return null;
    }
}
export default arcgisservices;
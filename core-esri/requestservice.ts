import React from 'react';
import { AppMode, dataSourceUtils } from 'jimu-core'
import { IFeature } from '@esri/arcgis-rest-types'
import { geometryUtils, loadArcGISJSAPIModules, JimuMapView, LayerTypes, JimuFeatureLayerView, JimuSceneLayerView } from 'jimu-arcgis'
import { OdataParams, QdataParams, SearchResponse } from './config';
import axios, { AxiosRequestConfig } from 'axios';
import arcgisservices from './arcgisservices';
import odataservices from './odataservices';
class requestservice extends React.Component {

    constructor(type: string) {
        super(null);
        this.state = { type: type };
    }
    query = async (q: QdataParams) => {
        const abc: any = this.state;
        let OBJ: any = null;
        switch (abc.type) {
            // case 'autodata':
            //     // this.service = this.autodata;
            //     break;
            case 'arcgis':
                // this.service = this.arcgis;
                OBJ = new arcgisservices();
                return await OBJ.query(q);
                break;
            case 'arcgis3x':
                // this.service = this.arcgis;
                OBJ = new arcgisservices();
                return await OBJ.query(q);
                break;
            case 'postgre':
                OBJ = new arcgisservices();
                return OBJ.query(q);
                break;
            case 'sql':
                OBJ = new odataservices();
                return await OBJ.query(q);
                break;
            default:
                OBJ = new odataservices();
                return await OBJ.query(q);
                break;
        }
    }
    search = async (q: OdataParams) => {
        const abc: any = this.state;
        let OBJ: any = null;
        switch (abc.type) {
            // case 'autodata':
            //     // this.service = this.autodata;
            //     break;
            case 'arcgis':
                // this.service = this.arcgis;
                OBJ = new arcgisservices();
                return await OBJ.search(q);
                break;
            case 'arcgis3x':
                // this.service = this.arcgis;
                OBJ = new arcgisservices();
                return await OBJ.search(q);
                break;
            case 'postgre':
                OBJ = new arcgisservices();
                return await OBJ.search(q);
                break;
            case 'sql':
                OBJ = new odataservices();
                return await OBJ.search(q);
                break;
            default:
                OBJ = new odataservices();
                return await OBJ.search(q);
                break;
        }
    }

    queryCustom = async (q: QdataParams) => {
        const abc: any = this.state;
        let OBJ: any = null;
        switch (abc.type) {
            // case 'autodata':
            //     // this.service = this.autodata;
            //     break;
            case 'arcgis':
                // this.service = this.arcgis;
                OBJ = new arcgisservices();
                return await OBJ.queryCustom(q);
                break;
            case 'arcgis3x':
                // this.service = this.arcgis;
                OBJ = new arcgisservices();
                return await OBJ.queryCustom(q);
                break;
            case 'postgre':
                OBJ = new arcgisservices();
                return OBJ.query(q);
                break;
            case 'sql':
                OBJ = new odataservices();
                return await OBJ.query(q);
                break;
            default:
                OBJ = new odataservices();
                return await OBJ.query(q);
                break;
        }
    }
    
    render() {
        return null;
    }
}
export default requestservice; 
import { mapConfig } from './mapConfig';
import { parse } from 'zipson/lib';
import requestservice from '../../core-esri/requestservice';

export const sysCacheWindowService = (config, table) => {
    const ObjectQuery = new requestservice('sql');
    const windowId = config.windowTables.find(f => f.name === table).id;
    let url = config.SysCacheWindow + "/" + windowId;
    return new Promise(async (resolve, reject) => {
        const resp = await ObjectQuery.query({ url, params: {}, method: 'GET' });
        if (resp && resp.success) {
            const obj = parse(resp.model.config);
            const config = mapConfig(obj);
            const tabs = config.tabs[0];
            resolve(tabs);
        } else {
            reject(null);
        }
    })
}

export const configInitService = (config) => {
    const ObjectQuery = new requestservice('sql');
    let url = config.ConfigInit;
    return new Promise(async (resolve, reject) => {
        const resp = await ObjectQuery.query({ url, params: {}, method: 'GET' });
        if (resp) {
            resolve(resp);
        } else {
            reject(null);
        }
    })
}
import React, { useEffect, useState, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import './select.scss'
import { searchOdata } from '../../core-esri/index';
import { esriRequest } from '../../core-esri/utils';
import arcgisservices from '../../core-esri/arcgisservices';
import requestservice from '../../core-esri/requestservice';
export interface CoreSelectInterface {
    showLabel: boolean,
    labelName: string,
    value?: any,
    isLabelLeft?: boolean,
    width: string,
    isRequired: boolean,
    isDisabled: boolean,
    placeholder: string,
    dataSource: any[],
    displayField: string,
    valueField: string,
    isShowClear: boolean
}
// import data from '../config.json'

const CoreSelect = ({ onChange, ...props }) => {
    const refSelect = useRef(null);
    const [value, setValue] = useState();

    useEffect(() => {
        bindDataToControl(props.value)
    }, [props.value])

    useEffect(() => { // Dùng cho việc truyền dữ liệu từ control cha vào control con
        if (props.configLookup === null || props.configLookup === undefined) {
            // Trường hợp control sử dụng lookup từ sys_combo
            bindDataToControl(props.parentvalue);
        } else {
            // Trường hợp control sử dụng lookup từ bảng dữ liệu (thông qua truy vấn foreignTable để lấy lookup)
            if (props.configLookup.WHEREFIELDNAME) { // trường hợp là field Liên kết
                getLookupFromParent(props.parentvalue);
            } else {
                // Trường hợp đứng lẻ một mình
                getLookupForSingleControl(props.parentvalue);
            }
        }
    }, [props.parentvalue]);

    const [dataLookup, setdataLookup] = useState([])

    useEffect(() => {
        if (props.configLookup) {
            const url = props.configLookup.FOREIGNTABLE;
            switch (props.configLookup.SERVICE_TYPE) {
                case 'AutoData':
                    //this.rqService.switchType('autodata');
                    break;
                case 'CloudData':
                    //this.rqService.switchType('clouddata');
                    break;
                case 'SQL':
                    // this.rqService.switchType('sql');
                    queryOdata(url);
                    break;
                case 'FeatureServer':
                case 'MapServer':
                    queryArcgis(url, props.parentvalue);
                    //this.rqService.switchType('arcgis3x');
                    break;
                case 'postgrest':
                    // this.rqService.switchType('postgre');
                    break;
                default:
                    // this.rqService.switchType('sql');
                    queryArcgis(url, props.parentvalue);
                    break;
            }

        } else {
            setdataLookup(props.dataSource ? props.dataSource : [])
        }
    }, []);

    useEffect(() => {
        if (props.dataSource) {
            setdataLookup(props.dataSource ? props.dataSource : [])
        }
    }, [props.dataSource]);

    const queryArcgis = async (url, parent = '') => {
        let where = '1=1';

        if (props.configLookup.WHEREFIELDNAME !== '' && props.configLookup.WHEREFIELDNAME !== null && parent !== '' && parent !== null) {
            if (parent['code'] !== undefined) {
                let val = typeof (parent['code']) === 'string' ? `'${parent['code']}'` : parent['code'];
                where = props.configLookup.WHEREFIELDNAME + '=' + val;
            } else {
                if (typeof (props.configLookup.WHEREFIELDNAME) === 'string') {
                    where = props.configLookup.WHEREFIELDNAME + "='" + parent[props.configLookup.WHEREFIELDNAME] + "'";
                }
                else {
                    where = props.configLookup.WHEREFIELDNAME + '=' + parent[props.configLookup.WHEREFIELDNAME];
                }
            }

        }
        let resp: any = await esriRequest(url, { where: where, outFields: '*', f: 'json' }, 'query', false, 'auto');
        refSelect.current.props.options = [];
        refSelect.current.props.value = null;
        if (resp.data) {
            const lookup: any[] = [];
            resp.data.features.forEach((item: any) => {
                const obj: any = { ...item.attributes };
                obj['code'] = props.configLookup.COLUMNCODE ? obj[props.configLookup.COLUMNCODE] : obj[props.configLookup.COLUMNKEY];
                obj[props.displayField] = obj[props.configLookup.COLUMNDISPLAY];
                lookup.push(obj);
            });

            setdataLookup(lookup)
        }

    }

    const queryOdata = (url: string) => {
        let where: any[] = [];
        // const handleRequest = null;
        // if (this.handleRequest) {
        //     this.handleRequest.unsubscribe();
        // }
        if (props.configLookup.DEFAULT_WHERE) {
            where = where.concat(props.configLookup.DEFAULT_WHERE);
        }
        let handleRequest = searchOdata({
            url: url,
            where: where,
            logic: 'and'
        }).then((res) => {
            if (res.success) {
                const lookup: any[] = [];
                res.features.forEach((item: any) => {
                    const obj: any = { ...item };
                    obj['code'] = props.configLookup.COLUMNCODE ? item[props.configLookup.COLUMNCODE] : item[props.configLookup.COLUMNKEY];
                    obj[props.displayField] = item[props.configLookup.COLUMNDISPLAY];
                    lookup.push(obj);
                });
                // dataLookup = [...lookup];
                setdataLookup(lookup)
            }
        }).catch(err => {
            console.log(err);
        })
    }

    var styleWidth = {
        width: props.isLabelLeft ? props.width : '100%'
    }

    const bindDataToControl = (_value: any) => {
        if (typeof (_value) === 'string') {
            const obj = refSelect.current.props.options.filter(fil => fil.code === _value);
            if (obj && obj.length > 0) {
                setValue(obj[0]);
            } else {
                setValue(null);
            }
        } else {
            setValue(_value);
        }
    }
    
    const getLookupForSingleControl = (_value: any) => {
        const url = props.configLookup.FOREIGNTABLE;
        switch (props.configLookup.SERVICE_TYPE) {
            case 'AutoData':
                break;
            case 'CloudData':
                break;
            case 'SQL':
                queryOdata(url);
                break;
            case 'FeatureServer':
            case 'MapServer':
                queryArcgis(url);
                break;
            case 'postgrest':
                break;
            default:
                queryArcgis(url);
                break;
        }

        bindDataToControl(_value);
    }

    const getLookupFromParent = (_value: any) => {
        const url = props.configLookup.FOREIGNTABLE;
        switch (props.configLookup.SERVICE_TYPE) {
            case 'AutoData':
                break;
            case 'CloudData':
                break;
            case 'SQL':
                queryOdata(url);
                break;
            case 'FeatureServer':
            case 'MapServer':
                queryArcgis(url, _value);
                break;
            case 'postgrest':
                break;
            default:
                queryArcgis(url, _value);
                break;
        }
        setValue(null);
        // if (_value) {
        //     bindDataToControl(_value);
        // } else {
        //     setValue(null);
        // }
    }


    return (
        <div className={!props.isLabelLeft ? 'select-class div-input-class' : 'select-class div-input-labelleft-class'}>
            {props.showLabel ? <label htmlFor="in" className={props.isLabelBorder == true ? 'block label-input-border-class' : `block label-input-class`} style={styleWidth}>{props.labelName}{props.isRequired ? <span className='required-class'>*</span> : null}</label> : null}
            {/* <InputText id="in" placeholder={props.placeholder} value={props.value} onChange={onChange} className={props.isRequired && (props.value === null || props.value === '') ? 'input-required-class' : undefined} disabled={props.isDisabled} /> */}
            <div className={props.isRequired && (props.value === null || props.value === '') ? 'input-required-class' : undefined} style={{ width: '100%', flex: '1 1' }}>
                <Dropdown value={value} options={dataLookup} onChange={onChange} optionLabel={props.displayField} placeholder={props.placeholder} showClear={props.isShowClear}
                    optionValue={props.valueField} filter filterBy={props.displayField} disabled={props.isDisabled} ref={refSelect} />
            </div>

        </div>
    );

}
CoreSelect.defaultProps = {
    showLabel: true,
    labelName: '',
    value: null,
    isLabelLeft: false,
    width: '120px',
    isRequired: false,
    isDisabled: false,
    placeholder: '',
    dataSource: [],
    displayField: 'descr',
    valueField: 'code',
    isShowClear: true,
    isLabelBorder: false
}
export default CoreSelect;

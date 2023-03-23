import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import './coretable.scss'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { parse } from 'zipson';
import INFORMATION from './interface';
import { esriRequest } from '../../core-esri/utils';
import requestservice from '../../core-esri/requestservice';
import { Paginator } from 'primereact/paginator';


let lookupFromUrl = {};
let rqService: requestservice = null;

const CoreTable = forwardRef<HTMLDivElement, FormProps>(({ ...props }, ref) => {
    useImperativeHandle(ref, (): any => ({
        onSearch: () => {
        }
    }));

    const [tableConfig, setTableConfig] = useState<INFORMATION>(null); // Dữ liệu  config của table
    const [columnDef, setColumnDef] = useState(null); // Danh sách column
    const [tableData, setTableData] = useState(null); // Dữ liệu của table
    const [lookup, setLookup] = useState(null); // Danh sách lookup của dropdown
    const [totalRecords, setTotalRecords] = useState(0); // Tổng số lượng bản ghi
    const [first, setFirst] = useState(0); // Dùng để hiển thị chính xác page
    const [loading, setLoading] = useState(true); // Hiệu ứng loading của table
    const [selectedProducts, setSelectedProducts] = useState(null)

    useEffect(() => {
        if (props.lookup) {
            const _lookup = getLookup(props.lookup);
            setLookup(_lookup);
        }
    }, [props.lookup]);

    useEffect(() => {
        if (props.config) {
            setTableConfig(props.config);
        }
    }, [props.config]);

    useEffect(() => {
        if (tableConfig) {
            initTable();
        }
    }, [tableConfig]);

    useEffect(() => {
        props.onSelectionChange(selectedProducts);
    }, [selectedProducts]);

    const initTable = () => {
        console.log('TABLE CONFIG', tableConfig);
        rqService = null;
        switch (tableConfig.tabletype) {
            case 'CloudData':
                rqService = new requestservice('clouddata')
                break;
            case 'SQL':
                rqService = new requestservice('sql')
                break;
            case 'FeatureServer':
            case 'MapServer':
                rqService = new requestservice('arcgis3x')
                break;
            case 'postgrest':
                rqService = new requestservice('postgre')
                break;
            default:
                rqService = new requestservice('sql')
                break;
        }

        if (!rqService) {
            return;
        }

        const columnDefination = [
            {
                COL_ALIAS: 'No.', // dùng tạm fieldname, sau phải đổi là alias
                COL_NAME: '__stt',
                COL_ORDER: -1,
                COL_DOMAINID: null,
                COL_TYPE: 'text',
                COL_FORMAT: '',
                COL_DISABLED: true,
                COL_ISDOMAIN: true,
                COL_WIDTH: 50,
                COL_REQUIRED: false,
                COL_DATASOURCE: {
                    FOREIGNTABLE: null,
                    FOREIGNTABLE_ID: null,
                    COLUMNKEY: null,
                    COLUMNDISPLAY: null,
                    COLUMNCODE: null,
                    WHEREFIELDNAME: null,
                    FOREIGNWINDOW_ID: null,
                    SERVICE_TYPE: null
                }
            }
        ];
        tableConfig.fields.forEach(col => {
            if (col.isdisplaygrid === 'Y') {
                columnDefination.push({
                    COL_ALIAS: col.alias && col.alias !== '' ? col.alias : col.fieldname, // có alias thì dùng alias, không thì dùng fieldname
                    COL_NAME: col.fieldname,
                    COL_ORDER: col.orderno,
                    COL_DOMAINID: col.isfromdomain === 'Y' ? col.domainid : null,
                    COL_TYPE: col.fieldtype,
                    COL_FORMAT: col.vformat,
                    COL_DISABLED: col.isreadonly === 'Y',
                    COL_ISDOMAIN: col.isfromdomain === 'Y',
                    COL_WIDTH: col.displaylength,
                    COL_REQUIRED: col.isrequire === 'Y' ? true : false,
                    COL_DATASOURCE: {
                        FOREIGNTABLE: col.foreigntable,
                        FOREIGNTABLE_ID: col.foreigntableid,
                        COLUMNKEY: col.columnkey,
                        COLUMNDISPLAY: col.columndisplay,
                        COLUMNCODE: col.columncode,
                        WHEREFIELDNAME: col.wherefieldname, // sử dụng cho control select
                        FOREIGNWINDOW_ID: col.foreignwindowid,
                        SERVICE_TYPE: tableConfig.tabletype
                    }
                });
            }
        });
        setColumnDef(columnDefination);
        console.log('COLUMN DEFINATION >>>> ', columnDefination);
        queryTableData({
            columnDef: columnDefination,
            startRecord: 0
        });
    };

    const queryTableData = (obj: { columnDef?: any, startRecord: number }) => {
        let _columnDef = obj.columnDef ?? columnDef;
        setLoading(true);
        rqService.search({
            url: tableConfig.urlview,
            where: [],
            select: ['*'],
            returnGeometry: true,
            startRecord: obj.startRecord,
            pageSize: 10
        }).then(async (res) => {
            console.log(res);
            if (res && res.features) {
                const a = await convertData(res.features, _columnDef);
                setTableData(a);
                setTotalRecords(res.total);
                setLoading(false);
            }
        });
    };

    const convertData = async (list: any[], columnDef: any) => {
        const results = [];
        for (let index = 0; index < list.length; index++) {
            const item = list[index];
            let obj = { ...item };
            const keys = Object.keys(item);
            for (let index = 0; index < keys.length; index++) {
                const key = keys[index];
                const cols = columnDef.filter(fil => fil.COL_NAME === key);
                obj[key] = item[key];
                if (cols && cols.length > 0) {
                    const col = cols[0];
                    switch (col.COL_TYPE) {
                        case 'date':
                            obj[key] = item[key] ? new Date(item[key]).toLocaleString() : null;
                            break;
                        case 'select':
                            if (col.COL_ISDOMAIN) {
                                let b = lookup[col.COL_DOMAINID].filter((fil: any) => fil.code && item[key] && fil.code.toString() === item[key].toString());
                                if (b && b.length > 0) {
                                    obj[key] = b[0].descr;
                                }
                            } else {
                                // case này phải query lấy ra danh sách lookup
                                if (!lookupFromUrl[col.COL_NAME]) {
                                    const dataSource = col.COL_DATASOURCE;
                                    const url = dataSource.FOREIGNTABLE;
                                    // truy vấn toàn bộ dữ liệu
                                    const res = await rqService.search({ url, where: [], logic: 'and' });
                                    const lookupCondition: any = [];
                                    res.features.forEach((item: any) => {
                                        const obj: any = {};
                                        obj['code'] = dataSource.COLUMNCODE ? item[dataSource.COLUMNCODE] : item[dataSource.COLUMNKEY];
                                        obj['descr'] = item[dataSource.COLUMNDISPLAY];
                                        lookupCondition.push(obj);
                                    });
                                    lookupFromUrl[col.COL_NAME] = lookupCondition;
                                }

                                const a = lookupFromUrl[col.COL_NAME].filter(fil => fil.code === item[key]);
                                if (a && a.length > 0) {
                                    obj[key] = a[0].descr;
                                }
                            }
                            break;
                        case 'number':
                            // format number theo col.COL_FORMAT
                            break;
                        default:
                            break;
                    }
                }
            }
            results.push(obj);
        }
        return results;
    }

    /** Lấy các lookup để hiển thị combo box */
    const getLookup = (data) => {
        const result: any = {};
        if (data !== null && data !== undefined) {
            Object.keys(data).forEach((key) => {
                try {
                    const lookup: { code: any; descr: any; }[] = [];
                    let list = JSON.parse(data[key]);
                    if (typeof (list) === 'string') {
                        list = JSON.parse(list);
                    }
                    list.forEach((item: any[]) => {
                        const obj = {
                            code: item[0],
                            descr: item[1],
                            COLOR_CODE: undefined
                        };
                        if (item[2]) {
                            obj['COLOR_CODE'] = item[2];
                        }
                        lookup.push(obj);
                    });
                    result[key] = lookup;
                } catch (error) { }
            });
        }

        return result;
    }

    /** Sự kiện page change của paginator */
    const onPageChange = (e) => {
        setFirst(e.first);
        queryTableData({
            startRecord: e.first
        });
    }

    return <React.Fragment>
        <div className='core-table'>
            {
                columnDef &&
                <React.Fragment>
                    <div className='core-table-container'>
                        <DataTable selectionMode={props.selectionMode} loading={loading} value={tableData} responsiveLayout="scroll" stripedRows showGridlines size="small"
                            selection={selectedProducts} onSelectionChange={e => setSelectedProducts(e.value)} 
                            scrollable scrollHeight="flex">
                            {
                                columnDef.map(item =>
                                    <Column key={item['COL_NAME']} field={item['COL_NAME']} header={item['COL_ALIAS']}
                                        style={{ minWidth: '120px' }}></Column>
                                )
                            }
                        </DataTable>
                    </div>
                    <div className='core-paginator-container'>
                        <Paginator first={first} rows={10} totalRecords={totalRecords} onPageChange={onPageChange}></Paginator>
                    </div>
                </React.Fragment>
            }
        </div>
    </React.Fragment>
});

export interface FormProps
    extends React.AllHTMLAttributes<HTMLDivElement> {
    config?: any;
    lookup?: any
    onSelectionChange?: Function,
    selectionMode?: 'single' | 'multiple' | 'checkbox';
}

const defaultProps: Partial<FormProps> = {
    config: null, // 1 mảng chứa các phần tử có kiểu FIELD_LIST,
    lookup: null, // 1 object chứa các lookup dành cho dropdown control
    onSelectionChange: () => { },
    selectionMode: 'single'
};

CoreTable.defaultProps = defaultProps;
export default CoreTable

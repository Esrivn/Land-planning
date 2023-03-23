import React, { useEffect, useState } from 'react';
import FIELD_LIST, { Information } from '../config';
import './CoreSearchBasic.scss'
import { CoreButton, CoreDatetime, CoreInput, CoreSelect } from '../index';
import { parse } from 'zipson';
import { object, oneOf } from 'prop-types';

const { useRef, forwardRef, useImperativeHandle } = React;

const CoreSearchBasic: any = ({ ...props }, ref) => {
    // goi ham rieng
    useImperativeHandle(ref, () => ({
        onSearch: () => {
            // const obj = {};
            // if (layout) {
            //     list.forEach(item => {
            //         obj[item.fieldname] = currentValue[item.fieldname];
            //     });
            //     return obj;
            // } else {
            //     return currentValue;
            // }
        }
    }));


    const [datasource, setDataSource] = useState();
    const [fieldList, setFieldList] = useState<FIELD_LIST[]>([]); // Danh sách field hiển thị
    const [fieldListSearch, setFieldListSearch] = useState<FIELD_LIST[]>([]); // Danh sách field hiển thị
    const [layout, setLayout] = useState(null); // Danh sách field hiển thị ở
    const [currentValue, setCurrentValue] = useState(null); // Giá trị hiện tại của các control đang được khởi tạo
    const [parentValue, setParentValue] = useState(null); // mảng lưu trữ giá trị của field cha ứng với mỗi field (dành cho relate field)

    const [lookup, setLookup] = useState(null); // Danh sách domain dành cho dropdown control
    const [rows, setRows] = useState(null);
    const [rowsSearch, setRowsSearch] = useState(null);
    const [firstInit, setFirstInit] = useState(true);
    const [list, setList] = useState([]);
    //let _fieldList = null;
    let _list = [];
    useEffect(() => {
        const configWindow = props.configWindow;
        const configLayout = props.configLayout;
        const configApp = props.configApp;
        setLookup(configApp.sys_combo);
        readFormConfig(configWindow, configLayout);

    }, []);
    useEffect(() => {
        if (datasource) {
            bindControl(datasource);
        }
    }, [datasource]);
    const onClear = () => {
        const obj = {};
        const typeCheck = ['select', 'date'];
        fieldList.forEach(element => {
            obj[element.fieldname] = null;
            if (!typeCheck.includes(element.fieldtype)) { // Nếu field type không nằm trong type Check
                obj[element.fieldname] = '';
            }
        });
        setCurrentValue(obj);
        setParentValue(obj);
        props.onClearCallBack();
    }
    const onSearch = () => {
        const listFilter = layout ? list : fieldList; // Dựa vào từng chế độ mà chọn ra danh sách lọc
        // lọc ra các field require và hiển thị ở mỗi chế độ (search hoặc form)
        const a = listFilter.filter(fil => fil.isrequire === 'Y' && (props.mode === 'search' ? fil.issearch === 'Y' : fil.isdisplay === 'Y'));
        let count = 0;
        a.forEach(field => {
            const check1 = currentValue[field.fieldname] === null;
            const check2 = currentValue[field.fieldname] === undefined;
            const check3 = currentValue[field.fieldname] === '';
            if (check1 || check2 || check3) {
                count++;
            }
        });

        if (count > 0) {
            alert('Invalid Form! Please fill required field.');
            return;
        }


        const obj = {};
        if (layout) {
            list.forEach(item => {
                obj[item.fieldname] = currentValue[item.fieldname];
            });
              props.onOkCallBack(obj);
        } else {
             props.onOkCallBack(currentValue);
        }
        console.log(obj);
        console.log(currentValue);
    }
    const readFormConfig = (configWindow: any, configLayout: any) => {
        const tab = configWindow.tabs[0]
        const fieldList: any[] = [];
        tab.fields.forEach((field: any) => {
            let disabledCtrl = false;
            if (field.isreadonly === 'Y') { disabledCtrl = true; }
            // Field defaultvalue dùng để điền sẵn dữ liệu vào control
            fieldList.push({ ...field, disabledCtrl });
        });
        const layoutConfig: any = configLayout;
        const where = tab.whereclause ? JSON.parse(tab.whereclause) : [];
        const information: Information = {
            TAB_ID: tab.tabid,
            PARENT_ID: tab.parenttabid,
            TABLE_ID: tab.tableid,
            DESCR: tab.tabname,
            TAB_LEVEL: tab.tablevel !== null ? tab.tablevel.toString() : '0',
            TAB_MAX_LEVEL: tab.maxLevel,
            TABLE_DETAIL: tab.tabledetail,
            SEQ_NO: tab.orderno ? tab.orderno.toString() : null,
            DEFAULT_WHERE: where,
            IS_LIENKETDOHOA: 'N',
            IS_SINGLE_LINE_EDIT: tab.issingglelineedit,
            IS_TAB_TRUNG_GIAN: tab.istabtrunggian === 'Y',
            KHOA_CHINH: tab.columnkey,
            TRUONG_LK_CON: tab.truonglienketcon,
            TRUONG_LK_CHA: tab.truonglienketcha,
            TRUONG_LKTG_CON: tab.truongtrunggiancon,
            TRUONG_LKTG_CHA: tab.truongtrunggiancha,
            BANG_CHA: tab.banglienket,
            BANG_LK: tab.bangtrunggian,
            KHOA_CHINH_BANG_LK: tab.columnkeytrunggian,
            WHERE: (tab.tablevel === 0 && tab.orderno === 1 || tab.parenttabid === null) ? where : null,
            TABLE_NAME: tab.tablename,
            URL_EDIT: tab.urledit,
            URL_VIEW: tab.urlview,
            URL_EDIT_MAP: tab.urleditdohoa,
            URL_VIEW_MAP: tab.urlviewdohoa,
            LAYOUT_COLUMN: tab.layoutcolumn,
            PARENT_DATA: null,
            SERVICE_TYPE: tab.tabletype,
            WINDOW_ID: configWindow.windowid,
            FILTER_FIELD: tab.fillterfield,
            FILTER_DEFAULT_VALUE: tab.fillterdefaultvalue,
            ORDER_BY: tab.orderbyclause ?? null,
            INIT_SHOW: tab.initshow === 'Y',
            ONCHANGE: tab.onchange,
            COLUMN_DOHOA: tab.columndohoa, // chưa thấy sử dụng
            COLUMN_CODE: tab.columncode, // Sử dụng để filter nhanh
            TABLEWORKFLOWID: tab.tableworkflowId,
            JOBTYPEIDS: tab.jobtypeids,
            LAYERINDEX: tab.layerindex,
            HASATTACHMENT: tab.hasattachment,
            KVHC_COLUMN: tab.kvhccolumn,
            ColumnWorkflow: tab.columnworkflow,
            ColumnLinkLayer: tab.columnlinklayer
        };
        // tab.fields.forEach((field: any) => {
        //     let disabledCtrl = false;
        //     if (field.isreadonly === 'Y') { disabledCtrl = true; }
        //     // Field defaultvalue dùng để điền sẵn dữ liệu vào control
        //     fieldList.push({ ...field, disabledCtrl });
        // });
        // // get layout config
        // let layout = null;
        // if (layoutConfig !== null && layoutConfig !== undefined) {
        //     layoutConfig.components.forEach((comp: any) => {
        //         if (comp.TabID.toString() === information.TAB_ID.toString()) {
        //             layout = comp;
        //         }
        //     });
        // }

        const dataSource: any = {
            FIELD_LIST: fieldList == null ? [] : fieldList,
            INFORMATION: information == null ? {} : information,
            LAYOUT_CONFIG: layoutConfig == null ? {} : layoutConfig,
        };

        setDataSource(dataSource);
        console.log(datasource);
        //field search
     
        setFieldList(dataSource.FIELD_LIST);

        setLayout(dataSource.LAYOUT_CONFIG);
        // khoi tao ban dau
        const obj = {};
        dataSource.FIELD_LIST.forEach((item: any) => {
            obj[item.fieldname] = null;
        });
        setCurrentValue(obj);
        setParentValue(obj);
        let fieldsSearch = dataSource.FIELD_LIST.filter(fil => fil.issearch.toString() === "Y");
        setFieldListSearch(fieldsSearch);


    }
    const bindControl = (dataSource: any) => {
        if (dataSource.LAYOUT_CONFIG) {
            let data: any = dataSource.LAYOUT_CONFIG;
            //data = data ? parse(data) : null;

            const _layout = data.components;
            //const _layout = data;
            let rows = null;
            if (_layout && _layout.length > 0) {
                rows = _layout.filter(fil => fil.TabID.toString() === dataSource.INFORMATION.TAB_ID.toString());
                if (rows && rows.length > 0) {
                    _list = [];
                    rows = createForm({}, rows[0].rows);
                    console.log(rows);
                    setList(_list);
                }

                setRows(rows);

                if (firstInit) {
                    setFirstInit(false);
                    initialDefaultValue();
                }
            }
            setLayout(data);
        }
    }
    // Load giá trị mặc định để hàm relate-field hoạt động
    const initialDefaultValue = () => {
        const obj = { ...currentValue };
        _list.forEach(field => {
            if (field.defaultvalue) {
                let val = null;
                if (typeof (field.defaultvalue) === 'string' && field.defaultvalue.startsWith('c$')) {
                    val = eval(field.defaultvalue);
                } else {
                    val = field.defaultvalue;
                }
                obj[field.fieldname] = val;
            }

        });

        setCurrentValue(obj);
    }
    const createForm = (group: any, rows: Array<any>) => {
        // Sử dụng _fieldList vì hàm setFieldList vẫn chưa cập nhật fieldList, có lẽ bất đồng bộ nên sinh ra lỗi
        const totalGroup: any[] = [];
        rows.forEach(row => {
            const fieldGroup: any[] = [];
            row.forEach((item: any) => {
                const cell = item.cell[0] ?? item.cell;
                if (cell.rows) {
                    fieldGroup.push({
                        nzSpan: cell.nzSpan ? cell.nzSpan : 12,
                        rows: createForm(group, cell.rows),
                        title: cell.label && cell.label !== '' ? cell.label : null
                    });
                } else {
                    const fields = cell.fieldid ? fieldList.filter((fil: any) => fil.fieldid.toString() === cell.fieldid.toString()
                        && fil.isdisplay === 'Y') : [];
                    if (fields.length > 0) {
                        const field = fields[0];
                        field['FIELD_SPAN'] = cell.nzSpan;
                        fieldGroup.push(field);
                        _list.push(field);
                    } else {
                        fieldGroup.push({
                            FIELD_SPAN: cell.nzSpan,
                            isdisplay: 'Y',
                            fieldtype: null
                        });
                    }
                }
            });
            totalGroup.push(fieldGroup);
        });

        return totalGroup;
    }
    const setValueControl = (val, field: FIELD_LIST) => {
        // const obj = { ...currentValue };
        // obj[field.fieldname] = val.target ? val.target.value : val.value;
        // setCurrentValue(obj);
        if (field.children && field.children.length > 0) {
            const obj = { ...parentValue };
            field.children.forEach(child => {
                obj[child.fieldname] = val.target ? val.target.value : val.value;
            });

            setParentValue(obj);
        }

        setCurrentValue({
            ...currentValue,
            [field.fieldname]: val.target ? val.target.value : val.value
        });
    }
    const renderLayout = () => {
        console.log('RENDER >>>>>>>> ');

        return <div className='fluid grid formgrid'>
            {rows && rows.map((row) => renderRowLayout(row))}
        </div>
    }
    const renderRowLayout = (row: Array<any>) => {
        return <div className='fluid grid formgrid col-12'>
            {
                row.map((item) => {
                    if (item.rows) {
                        return <div className="layout">
                            {item.rows.map((row) => renderRowLayout(row))}
                        </div>
                    } else {
                        return renderDynamicControl(item)
                    }
                })
            }
        </div>
    }
    const renderDynamicControlSearch = (field: FIELD_LIST) => {
        if (field['FIELD_SPAN'] === undefined) {
            field['FIELD_SPAN'] = layout ? 12 : 6;
        }

        const required = field.isrequire === 'Y';
        const datetype = props.mode === 'search' ? 'range' : 'single';
        const disabled = field.isreadonly === 'Y';

        if (props.mode === 'search') {
            if (field.issearch !== 'Y') {
                return;
            }
        } else {
            if (field.isdisplay !== 'Y') {
                return;
            }
        }

        switch (field.fieldtype) {
            case 'text':
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreInput onChange={(val) => setValueControl(val, field)} isRequired={required} isDisabled={disabled}
                        labelName={field.alias} mode="text" isLabelLeft={props.isLabelLeft}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}></CoreInput>
                </div>
                break;
            case 'number':
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreInput onChange={(val) => setValueControl(val, field)} isRequired={required} isDisabled={disabled}
                        labelName={field.alias} mode="number" isLabelLeft={props.isLabelLeft}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}></CoreInput>
                </div>
                break;
            case 'textarea':
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreInput onChange={(val) => setValueControl(val, field)} isRequired={required} isDisabled={disabled}
                        labelName={field.alias} mode="text-area" isLabelLeft={props.isLabelLeft}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}></CoreInput>
                </div>
                break;
            case 'select':
                let domain = lookup[field.domainid] ?? null;
                let configDropdown = {
                    FOREIGNTABLE: field.foreigntable,
                    FOREIGNTABLE_ID: field.foreigntableid,
                    COLUMNKEY: field.columnkey,
                    COLUMNDISPLAY: field.columndisplay,
                    COLUMNCODE: field.columncode,
                    TREECOLUMN: field.treecolumn,
                    WHEREFIELDNAME: field.wherefieldname, // sử dụng cho control select
                    FOREIGNWINDOW_ID: field.foreignwindowid,
                    FIELD_NAME: field.fieldname ? field.fieldname.trim() : field.fieldname,
                    SERVICE_TYPE: '' // Control sử dụng kiểu service type nào
                };
                if (domain) {
                    configDropdown = undefined;
                }
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreSelect valueField={null} onChange={(val) => setValueControl(val, field)} configLookup={configDropdown}
                        isRequired={required} isDisabled={disabled} labelName={field.alias} dataSource={domain}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}></CoreSelect>
                </div>
                break;
            case 'date':
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreDatetime labelName={field.alias} isLabelLeft={props.isLabelLeft} selectionMode={datetype} hourFormat='24' showIcon={true}
                        isRequired={required} isDisabled={disabled}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}
                        onChange={(val) => setValueControl(val, field)} ></CoreDatetime>
                </div>
            default:
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"} style={{ height: "0px" }}></div>
                break;
        }
    }
    const renderDynamicControl = (field: FIELD_LIST) => {
        if (field['FIELD_SPAN'] === undefined) {
            field['FIELD_SPAN'] = layout ? 12 : 6;
        }

        const required = field.isrequire === 'Y';
        const datetype = props.mode === 'search' ? 'range' : 'single';
        const disabled = field.isreadonly === 'Y';

        if (props.mode === 'search') {
            if (field.issearch !== 'Y') {
                return;
            }
        } else {
            if (field.isdisplay !== 'Y') {
                return;
            }
        }

        switch (field.fieldtype) {
            case 'text':
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreInput onChange={(val) => setValueControl(val, field)} isRequired={required} isDisabled={disabled}
                        labelName={field.alias} mode="text" isLabelLeft={props.isLabelLeft}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}></CoreInput>
                </div>
                break;
            case 'number':
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreInput onChange={(val) => setValueControl(val, field)} isRequired={required} isDisabled={disabled}
                        labelName={field.alias} mode="number" isLabelLeft={props.isLabelLeft}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}></CoreInput>
                </div>
                break;
            case 'textarea':
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreInput onChange={(val) => setValueControl(val, field)} isRequired={required} isDisabled={disabled}
                        labelName={field.alias} mode="text-area" isLabelLeft={props.isLabelLeft}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}></CoreInput>
                </div>
                break;
            case 'select':
                let domain = lookup[field.domainid] ?? null;
                let configDropdown = {
                    FOREIGNTABLE: field.foreigntable,
                    FOREIGNTABLE_ID: field.foreigntableid,
                    COLUMNKEY: field.columnkey,
                    COLUMNDISPLAY: field.columndisplay,
                    COLUMNCODE: field.columncode,
                    TREECOLUMN: field.treecolumn,
                    WHEREFIELDNAME: field.wherefieldname, // sử dụng cho control select
                    FOREIGNWINDOW_ID: field.foreignwindowid,
                    FIELD_NAME: field.fieldname ? field.fieldname.trim() : field.fieldname,
                    SERVICE_TYPE: '' // Control sử dụng kiểu service type nào
                };
                if (domain) {
                    configDropdown = undefined;
                }
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreSelect valueField={null} onChange={(val) => setValueControl(val, field)} configLookup={configDropdown}
                        isRequired={required} isDisabled={disabled} labelName={field.alias} dataSource={domain}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}></CoreSelect>
                </div>
                break;
            case 'date':
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreDatetime labelName={field.alias} isLabelLeft={props.isLabelLeft} selectionMode={datetype} hourFormat='24' showIcon={true}
                        isRequired={required} isDisabled={disabled}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}
                        onChange={(val) => setValueControl(val, field)} ></CoreDatetime>
                </div>
            default:
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"} style={{ height: "0px" }}></div>
                break;
        }
    }
    return (<div className='core-form-control'>

        <div className='form-control-body p-fluid grid formgrid' id='result'>
            {
                fieldListSearch  &&   fieldListSearch.map((field) => renderDynamicControlSearch(field))
            }
        </div>
        {
            // Tạo nút search và clear

            <div className='form-control-footer footer-item'>
                <div className='mr-3'>
                    <CoreButton icon="search" onClick={onClear} typeButton='Secondary' labelName='Clear'></CoreButton>
                </div>
                <div>
                    <CoreButton icon="search" onClick={onSearch} typeButton='Secondary' labelName='Search'></CoreButton>
                </div>
            </div>
        }
         <div className='form-control-body p-fluid grid formgrid' id='result'>
            {
                fieldList && layout ? renderLayout() : fieldList.map((field) => renderDynamicControl(field))
            }
        </div>
    </div>
    );

};
export interface FormProps
    extends React.AllHTMLAttributes<HTMLDivElement> {
    mode?: string,
    fieldConfig?: [],
    layoutConfig?: any,
    showFooter?: boolean,
    labelClear?: string,
    labelSearch?: string,
    isLabelLeft?: boolean,
    lookupData?: any
    tabId?: any
    onClearCallBack?: Function,
    onOkCallBack?: Function,
}

const defaultProps: Partial<FormProps> = {
    mode: 'search', // Kiểu form được tạo: 'form', 'search'
    fieldConfig: [], // 1 mảng chứa các phần tử có kiểu FIELD_LIST,
    layoutConfig: null, // Chứa layout hiển thị các control
    showFooter: true, // Hiện thị footer - các button
    labelClear: 'Clear',
    labelSearch: 'Search',
    isLabelLeft: false,
    lookupData: null, // 1 object chứa các lookup dành cho dropdown control
    tabId: null, // dùng để tìm kiếm layoutConfig
    onClearCallBack: () => { },
    onOkCallBack: () => { },
}
CoreSearchBasic.defaultProps = defaultProps;
export default forwardRef(CoreSearchBasic);
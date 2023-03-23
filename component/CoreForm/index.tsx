import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import FIELD_LIST from './interface';
import './coreform.scss'
import {  CoreButton, CoreDatetime, CoreInput, CoreSelect, CoreLabel , CoreAttachments, CoreShapefiles} from '../index';
import { parse } from 'zipson';
import { Fieldset } from 'primereact/fieldset';

let delay = false;
let modeAttachment = 'edit';
let attachmentData :any;
let hasAttachment:any= false;
let CurrentValueAttachment :any;
let CurrentValueShapefile :any;
const CoreForm = forwardRef<HTMLDivElement, FormProps>(({ ...props }, ref) => {
    useImperativeHandle(ref, (): any => ({

        onClearResult: () => {
            const obj = {};
            const typeCheck = ['select', 'date'];
            fieldList.forEach(element => {
                obj[element.fieldname] = null;
                if (!typeCheck.includes(element.fieldtype)) { // Nếu field type không nằm trong type Check
                    obj[element.fieldname] = '';
                }
            });

            //initialDefaultValue(obj);
            setCurrentValue(obj);
        },
        onSearch: () => {
            const obj = {};
            if (layout && props.mode !== 'search' && rows && rows.length > 0) {
                list.forEach(item => {
                    obj[item.fieldname] = currentValue[item.fieldname];
                });
                return obj;
            } else {
                if (props.mode === 'search') {
                    const a = fieldList.filter(fil => fil.issearch === 'Y');
                    a.forEach(item => {
                        obj[item.fieldname] = currentValue[item.fieldname];
                    });
                    return obj;
                } else {
                    return currentValue;
                }

            }
        },
        onBindData: (obj) => {
            console.log('SET DATA >>>>> ', obj);
            if (obj) {
                let _currentValue = {};
                if (layout && props.mode !== 'search' && rows && rows.length > 0) {
                    list.forEach(item => {
                        _currentValue[item.fieldname] = obj[item.fieldname];
                    });
                } else {
                    const filterField = props.mode === 'search' ? 'issearch' : 'isdisplay';
                    const a = fieldList.filter(fil => fil[filterField] === 'Y');
                    a.forEach(item => {
                        _currentValue[item.fieldname] = obj[item.fieldname];
                    });
                }

                setTimeout(() => {

                    setCurrentValue(_currentValue);

                if(hasAttachment){
                    console.log("onBindData >>>>>>>>>>>>>>>");
                    const data = {
                        url:  props.information.URL_EDIT,
                        recordId: obj[props.information.KHOA_CHINH],
                        tableId:  props.information.TABLE_ID,
                        windowId: props.information.WINDOW_ID,
                        serviceType:  props.information.SERVICE_TYPE
                    };
                    attachmentData = data;
                }
                }, 200);
            }
        }

    }));


    const [fieldList, setFieldList] = useState<FIELD_LIST[]>([]); // Danh sách field hiển thị
    const [layout, setLayout] = useState(null); // Danh sách field hiển thị ở
    const [currentValue, setCurrentValue] = useState(null); // Giá trị hiện tại của các control đang được khởi tạo
    const [parentValue, setParentValue] = useState(null); // mảng lưu trữ giá trị của field cha ứng với mỗi field (dành cho relate field)

    const [lookup, setLookup] = useState(null); // Danh sách domain dành cho dropdown control
    const [rows, setRows] = useState(null);
    const [list, setList] = useState([]);
    let _fieldList = null;
    let _list = [];

    useEffect(() => {
        const _lookup = getLookup(props.lookupData);
        setLookup(_lookup);
    }, [props.lookupData]);

    useEffect(() => {
        if (props.fieldConfig) {
            const obj = {};
            props.fieldConfig.forEach((item: any) => {
                if (item.defaultValue) {
                    obj[item.fieldname] = item.defaultValue
                } else {
                    obj[item.fieldname] = null;
                }

            });
            setCurrentValue(obj);
            setParentValue(obj);
            _fieldList = props.fieldConfig;
            setFieldList(_fieldList);
        }
    }, [props.fieldConfig]);

    useEffect(() => {
        // console.log('props >>>> ', props);
        if (props.information) {
           
            //console.log('props.information', props.information);
            hasAttachment = props.information.HASATTACHMENT === 'Y';
            // const obj = {
            //     url:  props.information.URL_EDIT,
            //     recordId: props.information.KHOA_CHINH,
            //     tableId:  props.information.TABLE_ID,
            //     windowId: props.information.WINDOW_ID,
            //     serviceType:  props.information.SERVICE_TYPE
            // };
            // attachmentData = obj;

            
            
        }
    }, [props.information]);

    useEffect(() => {
        if (props.layoutConfig) {
            let data: any = props.layoutConfig;
            data = data ? parse(data) : null;

            const _layout = data.components;
            let rows = null;
            if (_layout && _layout.length > 0) {
                rows = _layout.filter(fil => fil.TabID.toString() === props.tabId.toString());
                if (rows && rows.length > 0) {
                    _list = [];
                    rows = createForm({}, rows[0].rows);
                    setList(_list);
                }

                setRows(rows);
            }

            setLayout(data);
        } else {
            setLayout(null);
        }
    }, [props.layoutConfig]);

    useEffect(() => {
        if (list && list.length > 0) {
            initialDefaultValue();
        }
    }, [list]);

    const renderDynamicControl = (field: FIELD_LIST) => {
        field['HASATTACHMENT'] = '';
        if (field['FIELD_SPAN'] === undefined) {
            field['FIELD_SPAN'] = layout && (rows && rows.length > 0) && props.mode !== 'search' ? 12 : 6;
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
                    <CoreInput onChange={(val) => setValueControl(val, field)} isRequired={props.isRequire == true ? required : props.isRequire} isDisabled={disabled}
                        width={props.isLabelLeft === true ? props.labelWidth : null} isLabelBorder={props.isLabelBorder}
                        labelName={field.alias} mode="text" isLabelLeft={props.isLabelLeft}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}></CoreInput>
                </div>

                break;
            case 'number':
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreInput onChange={(val) => setValueControl(val, field)} isRequired={props.isRequire == true ? required : props.isRequire} isDisabled={disabled}
                        width={props.isLabelLeft === true ? props.labelWidth : null} isLabelBorder={props.isLabelBorder}
                        labelName={field.alias} mode="number" isLabelLeft={props.isLabelLeft}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}></CoreInput>
                </div>
                break;
            case 'textarea':
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreInput onChange={(val) => setValueControl(val, field)} isRequired={props.isRequire == true ? required : props.isRequire} isDisabled={disabled}
                        width={props.isLabelLeft === true ? props.labelWidth : null} isLabelBorder={props.isLabelBorder}
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
                    SERVICE_TYPE: field.serviceType // Control sử dụng kiểu service type nào
                };
                if (domain) {
                    configDropdown = undefined;
                }
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreSelect valueField={null} onChange={(val) => setValueControl(val, field)} configLookup={configDropdown}
                        width={props.isLabelLeft === true ? props.labelWidth : null} isLabelLeft={props.isLabelLeft}
                        isLabelBorder={props.isLabelBorder}
                        isRequired={props.isRequire == true ? required : props.isRequire} isDisabled={disabled} labelName={field.alias} dataSource={domain}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}></CoreSelect>
                </div>
                break;
            case 'date':
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"}>
                    <CoreDatetime labelName={field.alias} isLabelLeft={props.isLabelLeft} selectionMode={datetype} hourFormat='24' showIcon={true}
                        width={props.isLabelLeft === true ? props.labelWidth : null}
                        isRequired={props.isRequire == true ? required : props.isRequire} isDisabled={disabled} isLabelBorder={props.isLabelBorder}
                        value={currentValue[field.fieldname]} parentvalue={parentValue[field.fieldname]}
                        onChange={(val) => setValueControl(val, field)} ></CoreDatetime>
                </div>
            default:
                return <div className={"form-control-item field col-" + field['FIELD_SPAN'] + " md:col-4"} style={{ height: "0px" }}></div>
                break;
        }
    }

    const setValueControl = (val, field: FIELD_LIST) => {
        console.log('CORE FORM SET VALUE CONTROL');
        if (delay) {
            return;
        }
        if (field.children && field.children.length > 0) {
            const obj = { ...parentValue };
            field.children.forEach(child => {
                obj[child.fieldname] = val.target ? val.target.value : val.value;
            });

            setParentValue(obj);
        }

        const data = {
            ...currentValue,
            [field.fieldname]: val.target ? val.target.value : val.value
        };

        setCurrentValue(data);
    }

    /** Xóa dữ liệu trên control */
    const onClear = (e) => {
        const obj = {};
        const typeCheck = ['select', 'date'];
        fieldList.forEach(element => {
            obj[element.fieldname] = null;
            if (!typeCheck.includes(element.fieldtype)) { // Nếu field type không nằm trong type Check
                obj[element.fieldname] = '';
            }
        });

        //initialDefaultValue(obj);
        setParentValue(obj);
        setCurrentValue(obj);
        props.onClearCallBack();
    }

    const onSearch = () => {
        console.log('CurrentValueAttachment', CurrentValueAttachment , "hasAttachment", hasAttachment);
        // Check valid
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
        if(hasAttachment) {
                obj['CurrentValueAttachment'] =  (CurrentValueAttachment)? CurrentValueAttachment : null;
                obj['CurrentValueShapefile'] =  (CurrentValueShapefile)? CurrentValueShapefile : null;
           
        }
        if (layout && props.mode !== 'search' && rows && rows.length > 0) {
            list.forEach(item => {
                obj[item.fieldname] = currentValue[item.fieldname];
            });
            props.onOkCallBack(obj);
        } else {
            if (props.mode === 'search') {
                const a = fieldList.filter(fil => fil.issearch === 'Y');
                a.forEach(item => {
                    obj[item.fieldname] = currentValue[item.fieldname];
                });
                props.onOkCallBack(obj);
            } else {
                if(hasAttachment) {
                    currentValue['CurrentValueAttachment'] =  (CurrentValueAttachment)? CurrentValueAttachment : null;
                    currentValue['CurrentValueShapefile'] =  (CurrentValueShapefile)? CurrentValueShapefile : null;
               
                }
                props.onOkCallBack(currentValue);
            }
        }
    }

    const renderLayout = () => {
        if (!rows || rows.length === 0) {
            return renderDefault();
        }

        return <div className='fluid grid formgrid'>
            {rows && rows.map((row) => renderRowLayout(row))}
        </div>
    }

    const renderDefault = () => {
        const group = {};
        const nogroup = [];
        fieldList.forEach(field => {
            if (field.fieldgroup) {
                if (!group[field.fieldgroup]) {
                    group[field.fieldgroup] = [];
                }

                group[field.fieldgroup].push(field);
            } else {
                nogroup.push(field);
            }
        });

        return <React.Fragment>
            <div className='fluid grid formgrid col-12'>
                {nogroup.map((field) => renderDynamicControl(field))}
            </div>
            <div className='fluid grid formgrid col-12'>
                {Object.keys(group).map(key => {
                    const _list = group[key];
                    return <Fieldset legend={key} toggleable >
                        <div className='fluid grid formgrid col-12'>
                            {_list.map((field) => renderDynamicControl(field))}
                        </div>
                    </Fieldset>
                })}
            </div>

        </React.Fragment>
    }

    const renderRowLayout = (row: Array<any>) => {
        return <div className='fluid grid formgrid col-12'>
            {
                row.map((item) => {
                    if (item.rows) {
                        if (item.title) {
                            return <Fieldset legend={item.title} toggleable >
                                <div className="layout fluid grid formgrid col-12">
                                    {item.rows.map((row) => renderRowLayout(row))}
                                </div>
                            </Fieldset>
                        } else {
                            return <div className="layout fluid grid formgrid col-12">
                                {item.rows.map((row) => renderRowLayout(row))}
                            </div>
                        }

                    } else {
                        return renderDynamicControl(item)
                    }
                })
            }
        </div>
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
                    const fields = cell.fieldid ? _fieldList.filter((fil: any) => fil.fieldid.toString() === cell.fieldid.toString()
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

    // Load giá trị mặc định để hàm relate-field hoạt động
    const initialDefaultValue = (defaultvalue = null) => {
        delay = true;
        const obj = defaultvalue ?? { ...currentValue };
        const listField = layout ? list : fieldList; // nếu có layout thì dựa vào list
        listField.forEach(field => {
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
        setTimeout(() => {
            delay = false;
        }, 200);
    }

    const readURL= (e = null) => { 
        // console.log('e', e);
        CurrentValueAttachment = e;
    }

    const uploadForm= (e = null) => { 
        console.log('uploadForm', e);
        CurrentValueShapefile = e;
    }


    return <React.Fragment>
        <div className='core-form-control'>
            <div className='form-control-body p-fluid grid formgrid'>
                {
                    fieldList && layout && props.mode !== 'search' ? renderLayout() : renderDefault()
                }
            </div>
                
            { 
                hasAttachment&&
                <div><span>Shape file: </span>
                    <CoreShapefiles  onChangeShapefiles={(val2) => {uploadForm(val2)}} ref={[]}>

                    </CoreShapefiles>
                </div>
                
            }
           
            {
               hasAttachment&&
               <div>
                    <span>Hồ sơ đính kèm: </span>
                    
                    <CoreAttachments mode={modeAttachment}  data={attachmentData}  onChange={(val) => {readURL(val)}} ref={[]}>

                    </CoreAttachments>
               </div>
                
            }
            {
                // Tạo nút search và clear
                props.showFooter && fieldList && fieldList.length > 0 &&
                <div className='form-control-footer footer-item'>
                    <div className='mr-3' style={props.isDisplayClear === true ? { display: "none" } : { background: '#E7E7E7', color: '#000' }} >
                        <CoreButton icon="search" onClick={onClear} typeButton='Secondary' labelName={props.labelClear}></CoreButton>
                    </div>
                    <div style={props.isDisplaySearch === true ? { display: "none" } : { background: '#E7E7E7', color: '#000' }}>
                        <CoreButton icon="search" onClick={onSearch} typeButton='Secondary' labelName={props.labelSearch}></CoreButton>
                    </div>
                </div>
            }
        </div>
    </React.Fragment>
});

export interface FormProps
    extends React.AllHTMLAttributes<HTMLDivElement> {
    mode?: string,
    fieldConfig?: [],
    information?: any,
    layoutConfig?: any,
    showFooter?: boolean,
    labelClear?: string,
    labelSearch?: string,
    isLabelLeft?: boolean,
    labelWidth?: string,
    lookupData?: any
    tabId?: any
    onClearCallBack?: Function,
    onOkCallBack?: Function,
    isDisplaySearch?: boolean,
    isDisplayClear?: boolean,
    isLabelBorder?: boolean,
    isRequire?: boolean,
    isResult?: boolean
}

const defaultProps: Partial<FormProps> = {
    mode: 'form', // Kiểu form được tạo: 'form', 'search'
    fieldConfig: [], // 1 mảng chứa các phần tử có kiểu FIELD_LIST,
    information: null,
    layoutConfig: null, // Chứa layout hiển thị các control
    showFooter: true, // Hiện thị footer - các button
    labelClear: 'Clear',
    labelSearch: 'Search',
    labelWidth: null, // Độ rộng của label khi isLabelLeft = true
    isLabelLeft: false,
    lookupData: null, // 1 object chứa các lookup dành cho dropdown control
    tabId: null, // dùng để tìm kiếm layoutConfig
    onClearCallBack: () => { },
    onOkCallBack: () => { },
    isDisplaySearch: true,
    isDisplayClear: true,
    isLabelBorder: false,
    isRequire: false,
    isResult: false
};

CoreForm.defaultProps = defaultProps;


export default CoreForm

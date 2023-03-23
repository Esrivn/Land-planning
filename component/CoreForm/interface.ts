interface FIELD_LIST {
    alias: string;
    calculation: string;
    columncode: string;
    columndisplay: string;
    columndohoa: string;
    columnid: number;
    columnkey: string;
    columnname: string;
    columntype: string;
    defaultvalue: any;
    disablelogic: any;
    displaylength: any;
    displaylogic: any;
    domainid: number; // id of domain
    fieldgroup: string; // name of group field
    fieldid: number;
    fieldlength: number;
    fieldname: string;
    fieldtype: string;
    foreigntable: string; // for select and search control
    foreigntableid: string;
    isfromdomain: string; // 'Y', 'N'
    isreadonly: string; // 'Y', 'N' => field readonly or not
    issearch: string; // 'Y', 'N' => field hiển thị ở mode search hay không
    isrequire: string; // 'Y', 'N' => field require or not
    isunique: string; // 'Y', 'N'
    isdisplay: string;
    isdisplaygrid: string;
    orderno: number;
    parentfieldid: number; // for relate field
    placeholder: string;
    vformat: string; //
    wherefieldname: string;
    treecolumn: any;
    foreignwindowid: string;
    children?: FIELD_LIST[];
    serviceType?: string;
}

export default FIELD_LIST;
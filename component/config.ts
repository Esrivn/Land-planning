import { ImmutableObject } from 'jimu-core'

export interface Config {
  editingEnabled: boolean
  vectorLayers: any
  oicList: any
}

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
}

export default FIELD_LIST;

export interface Information {
  DESCR: string; // Tên tab
  PARENT_ID: any; // ID của tab cha
  TAB_ID: any; // Id của tab
  TAB_LEVEL: string; // Cấp độ của tab
  TAB_MAX_LEVEL: number;
  TABLE_ID: any; // Phân biệt case nhiều - nhiều hay 1 - nhiều
  TABLE_DETAIL: string;
  SEQ_NO: string; // thứ tự của mỗi tab tại mỗi level
  WHERE: any; // câu điều kiện truy vấn
  DEFAULT_WHERE: any[];
  IS_LIENKETDOHOA: string;
  IS_SINGLE_LINE_EDIT: any;
  IS_TAB_TRUNG_GIAN: any; // đánh đấu tab (bảng) là trung gian kết nối tới 2 tab khác (đều có trong window)
  PARENT_DATA: any; // Dữ liệu hiện hành của tab cha, dùng cho insert, delete
  LAYOUT_COLUMN: number;
  KHOA_CHINH: string;
  KHOA_CHINH_BANG_LK: string;
  TRUONG_LK_CON: string;
  TRUONG_LK_CHA: string;
  TRUONG_LKTG_CON: string;
  TRUONG_LKTG_CHA: string;
  BANG_CHA: string;
  BANG_LK: any;
  KVHC_COLUMN: string;

  // For Table
  URL_EDIT: string;
  URL_VIEW: string;
  URL_EDIT_MAP: string;
  URL_VIEW_MAP: string;
  TABLE_NAME: string;
  SERVICE_TYPE: string;
  WINDOW_ID: number;
  COLUMN_DOHOA: string;
  COLUMN_CODE: string;
  TABLE_TYPE?: string; // Thông tin của bảng được truy vấn theo phương thức service nào: arcgis, sql hay postgrest

  // ARCGIS ???
  HASATTACHMENT: string; // match with field hasattachment
  FILTER_FIELD: string;
  FILTER_DEFAULT_VALUE: any;
  ORDER_BY: any;
  INIT_SHOW: boolean;
  ONCHANGE: string;
  TABLEWORKFLOWID: number;
  JOBTYPEIDS: string;
  LAYERINDEX: number;

  ColumnWorkflow: string;
  ColumnLinkLayer: string;
}

export interface TabStruct {
  FIELD_LIST: Array<any>;
  LAYOUT_CONFIG: any;
  INFORMATION: Information;
  SUB_TAB: TabStruct[];
  URLREQUEST: string;
}

export type IMConfig = ImmutableObject<Config>
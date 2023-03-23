import { ImmutableObject } from 'seamless-immutable'
 
export default interface DeleteResponse {
    success: boolean;
    data: any;
    message: string;
}
//export type  IMDeleteResponse= ImmutableObject<DeleteResponse>

export default interface UpdateResponse {
    success: boolean;
    message: string;
}
//export type  IMUpdateResponse= ImmutableObject<UpdateResponse>

export  default interface InsertResponse {
    features: any;
    total: number;
    success: boolean;
    message: string;
}
//export type  IMInsertResponse= ImmutableObject<InsertResponse>

export   interface SearchResponse {
    features: any;
    total: number;
    success: boolean;
    message: string;
}
//export type  IMSearchResponse= ImmutableObject<SearchResponse>

export  interface QdataParams {
    url: string;
    params: any; // params cần gửi, có dạng object, ví dụ { name: 'mr.a', age: 41, sex: 'male'}
    proxy?: string; // đường dẫn của proxy, ví dụ: https://coretech:1313. chỉ có proxy khi khác domain, nếu không chỉ định proxy thì lấy mặc định từ appservice
    method?: 'GET' | 'POST';
    contentType?: string; // content type trong header
    responseType?: string; // kiểu dữ liệu trả về, bao gồm: 'arraybuffer' | 'blob' | 'json' | 'text'
}


export interface OdataParams {
    url: string;
    select?: Array<string>;
    where?: any; // Quy ước: where = [] => lấy toàn bộ dữ liệu, where = null => không tìm dữ liệu
    logic?: string;
    orderBy?: Array<string>;
    groupBy?: Array<string>; // tạm thời chưa dùng
    pageSize?: number;
    startRecord?: number;
    data?: any;
    primaryKey?: string;
    and?: any; // cấu trúc giống where
    or?: any; // cấu trúc giống where
    geometry?: any; // Đồ họa thêm vào trong bảng
    distinct?: boolean; // Có query distinct hay không (true = có)
    returnGeometry?: boolean; // Có trả về geometry hay không
    spatialRelationship?: string; // kiểu relationship của geometry
}
export type  IMQdataParams= ImmutableObject<QdataParams>
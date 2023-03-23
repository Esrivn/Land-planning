export const listOperatorSqlOdata = [
    { key: '=', value: 'eq' },
    { key: '<>', value: 'ne' },
    { key: '>', value: 'gt' },
    { key: '>=', value: 'ge' },
    { key: '<', value: 'lt' },
    { key: '<=', value: 'le' },
    { key: 'like', value: 'like' },
    { key: 'in', value: 'in' },
    { key: '!=', value: 'not eq' },
    { key: '!<>', value: 'not ne' },
    { key: '!>', value: 'not gt' },
    { key: '!>=', value: 'not ge' },
    { key: '!<', value: 'not lt' },
    { key: '!<=', value: 'not le' },
    { key: '!like', value: 'not like' },
    { key: '!in', value: 'not in' }
];
export const  decodeSql =(whereClause: any[]) => {
    let where = ''; let logic = 'and';
    if (whereClause === null || whereClause === undefined) {
        return '';
    }

    if (whereClause.length === 0) {
        return '1=1';
    }
    const cloneWhere = whereClause;//JSON.parse(JSON.stringify(whereClause));
    if (cloneWhere.length > 0) {
        if (!Array.isArray(cloneWhere[0]) && cloneWhere[0] !== 'and' && cloneWhere[0] !== 'or') {
            where = decodeDeep(cloneWhere, '');
        } else {
            cloneWhere.forEach((item: any, index: any) => {
                if (index === 0 && (item === 'and' || item === 'or')) {
                    logic = item;
                } else {
                    if (Array.isArray(item) && item.length === 0) {
                        return;
                    }
                    if (Array.isArray(item) && (item[0] === 'and' || item[0] === 'or')) {
                        where += `(${decodeSql(item)}) ${logic} `;
                    } else if (Array.isArray(item[0])) {
                        where += `(${decodeSql(item)}) and `;
                    } else {
                        where += decodeDeep(item, logic);
                    }
                }
            });
            const number = logic === 'and' ? 5 : 4;
            where = where.substring(0, where.length - number);
        }
    }

    return where;
}

export const decodeDeep=(item: any, logic: string) => {
    const key = item[0];
    const operator = item[1];
    let value = item[2];
    let where = '';

    if (typeof(value) === 'string' && value.startsWith('c$')) {
        // where = `${item[0]} ${item[1]} ${eval(value)}`;
        value = eval(value);
    }

    switch (operator) {
        case 'like':
            where = `${key} LIKE N'%${value}%'`;
            break;
        case 'in':
            let type = 'number'; let val = '';
            if (value && value.length > 0) {
                if (typeof(value[0]) === 'string') {
                    type = 'string';
                }
            }
            if (type === 'string') {
                value.forEach((x: string) => {
                    val = `${val}'${x}',`;
                });
                val = val.substring(0, val.length - 1);
            } else {
                val = value.join(',')
            }

            if (value.length === 0) {
                where = `1 = 2`;
            } else if (value.includes(null)) {
                where = `${key} is null`;
                const value1 = value.filter((fil: any) => fil !== null);
                if (value1 && value1.length > 0) {
                    where = `${where} or ${key} in (${value1.join(',')})`
                }
            } else {
                where = `${key} in (${val})`;
            }
            break;
        case 'YEAR':
        case 'MONTH':
            where = `${operator}(${key}) = ${value}`;
            break;
        default:
            if (typeof(value) === 'string') {
                if (value.startsWith('DATE ')) {
                    where += `${key} ${operator} ${value}`;
                } else {
                    where += `${key} ${operator} N'${value}'`;
                }
            } else {
                if (value === null) {
                    where = `${key} is null`;
                } else {
                    where = `${key} ${operator} ${value}`;
                }
            }
            break;
    }
    if (logic !== '') {
        where += ` ${logic} `;
    }
    return where;
}
export const replaceSpecialCharacters = (attribute: any) => {
    // replace the single quotes
    attribute = attribute.replace(/%/g, '%25');
    attribute = attribute.replace(/\+/g, '%2B');
    attribute = attribute.replace(/\//g, '%2F');
    attribute = attribute.replace(/\?/g, '%3F');

    attribute = attribute.replace(/#/g, '%23');
    attribute = attribute.replace(/&/g, '%26');
    return attribute;
}
export const decode = (item: any[]) => {
    let str = '';
    // item là 1 array có dạng [key, operator, value];
    let val = item[2];
    let key = item[0];
    const resp = listOperatorSqlOdata.filter(fil => fil.key === item[1]);

    if (typeof (val) === 'string') {
        // if (val.startsWith(this.appService.c$)) {
        //     val = eval(val);
        //     if (typeof (val) === 'string') {
        //         val = `'${val}'`;
        //     }
        // } else {
        val = replaceSpecialCharacters(val);
        const first = val.charAt(0);
        const last = val.charAt(val.length - 1);
        if (first === '\'' && last === '\'') {
            val = '\'' + eval(val.substring(1, val.length - 1)) + '\'';
            val = val.toLowerCase();
            key = `tolower(${key})`;
        } else if (first === '{' && last === '}') {
            val = eval(val.substring(1, val.length - 1));
        } else if (first === '(' && last === ')') {
            val = val.substring(1, val.length - 1);
            val = val.split(',');
            // key = `tolower(${key})`;
        } else {
            val = `'${val}'`.toLowerCase();
            key = `tolower(${key})`;
        }
        // }
    } else {
        try {
            // convert to date format
            val = val.toISOString();
        } catch (error) {
        }
    }

    switch (resp[0].value) {
        case 'like':
            str += `contains(${key}, ${val})`;
            break;
        case 'in':
            if (val.length === 0) {
                str += '1 = 2';
            } else {
                str += `(${key} in (${val.join(',')}))`;
            }
            break;
        case 'not in':
            if (val.length === 0) {
                str += '1 = 1';
            } else {
                str += `not(${key} in (${val.join(',')}))`;
            }
            break;
        default:
            str += `${key} ${resp[0].value} ${val}`;
            break;
    }

    return str;
}
export const decodeSql1 = (where: string | any[], isBase = true) => {
    let decode1 = ''; let logic = 'and';
    if (where) {
        if (where.length > 0) {
            if (isBase) {
                decode1 = '$filter=';
            }
            let cloneWhere: any = (where);
            if (!Array.isArray(cloneWhere[0]) && cloneWhere[0] !== 'and' && cloneWhere[0] !== 'or') {
                // Trường hợp mảng 1 chiều
                decode1 += decode(cloneWhere);
            } else {
                cloneWhere.forEach((item: string | any[], index: number) => {
                    if (index === 0 && (item === 'and' || item === 'or')) {
                        logic = item;
                    } else {
                        if (Array.isArray(item)) {
                            if (item.length === 0) {
                                // mảng rỗng thì bỏ qua
                                return;
                            }
                            if (item[0] === 'and' || item[0] === 'or') {
                                // đệ quy lần nữa để lấy dữ liệu
                                decode1 += `(${decodeSql1(item, false)})`;
                            } else if (Array.isArray(item[0])) {
                                // item là 1 array có dạng [[key, operator, value], ...]
                                logic = 'and';
                                decode1 += `(${decodeSql1(item, false)})`;
                            } else {
                                // item là 1 array có dạng [key, operator, value];
                                decode1 += decode(item);
                            }
                            decode1 += index < (cloneWhere.length - 1) && logic ? ` ${logic} ` : '';
                        } else {
                            // cloneWhere bây giờ là dạng [key, operator, value], chỉ chạy 1 lần duy nhất với index === 0;
                            if (index === 0) {
                                decode1 += decode(cloneWhere);
                            }
                        }
                    }
                });
            }

        }
    }
    return decode1;
}
export function handleResponse(response) {
    // return response.text().then(text => {
    //     const data = text && JSON.parse(text);



    //     return data;
    // });
    
    if (response.statusText !== 'OK') {
        // if ([401, 403].includes(response.status) && auth?.token) {
        //     // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        //     localStorage.removeItem('user');
        //     setAuth(null);
        //     history.push('/account/login');
        // }

        const error = (response.data) || response.statusText;
        //alertActions.error(error);
        return Promise.reject(error);
    }
    else {
        console.log(response)
      
        return Promise.resolve(response.data);
    }
}    
export function handleResponseOdata(response) {
    // return response.text().then(text => {
    //     const data = text && JSON.parse(text);



    //     return data;
    // });
    
    if (response.statusText !== 'OK') {
        // if ([401, 403].includes(response.status) && auth?.token) {
        //     // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        //     localStorage.removeItem('user');
        //     setAuth(null);
        //     history.push('/account/login');
        // }

        const error = (response.data) || response.statusText;
        //alertActions.error(error);
        return Promise.reject(error);
    }
    else {
        console.log(response)
        const resp = {
            total: 0,
            success: false,
            features: [],
            message: 'Tìm thất bại'
        };
        if (response.data) {
            resp.total = response.data['@odata.count'] || response.data['value'].length;
            resp.success = true;
            resp.features = response.data['value'];
            resp.message = 'Tìm kiếm thành công';
        }
        return Promise.resolve(resp);
    }
}    
export const cloneDeep =(where: any)=> {
    let data: any = null;
    data = JSON.parse(JSON.stringify(where));
    return data;
}
export const getWhereClause = (control: any, fieldList: any[]) => {
    const p: any = {
      logic: 'and',
      where: []
    };
    Object.keys(control).forEach((key) => {
      // tslint:disable-next-line:max-line-length
      const data = fieldList.filter((fil) => fil.fieldname === key);
      if (data.length > 0) {
        // Phân loại kiểu control để lấy đúng dữ liệu
        const value = control[key];
        if (data[0].fieldtype === 'date') {
          if (value && value[0] && value[1]) {
            p.where.push([key, '>=', new Date(value[0])]);
            p.where.push([key, '<=', new Date(value[1])]);
          }
        } else if (data[0].fieldtype === 'select') {
          if (value !== null) {
            if (value !== null) {
              p.where.push([key, '=', value.code]);
            }
          }
        } else if (data[0].fieldtype === 'number' || data[0].fieldtype === 'text') {
          if (value !== '' && value !== null) {
            p.where.push([key, '=', value]);
          }
        }
        else {
          if (value !== '' && value !== null) {
            p.where.push([key, 'like', value]);
          }
        }
      }
    });
    return p;
  }
export const mapConfig = (conf: { window: any[]; tabs: any[]; fields: string | any[]; }) => {

    const _sys = {
        window: ['windowid', 'windowname', 'windowtype', 'applicationid', 'componentname', 'servicetype'],
        tab: ['tabid', 'parenttabid', 'tabname', 'tablevel', 'orderno', 'truonglienketcon', 'truonglienketcha', 'whereclause', 'orderbyclause', 'truongtrunggiancon', 'truongtrunggiancha', 'windowid', 'tableid', 'bangtrunggian', 'layoutcolumn', 'banglienket', 'tablename', 'tabletype', 'columnkey', 'hasattachment', 'iscache', 'urledit', 'urlview', 'columndisplay', 'tablelienket', 'tabledetail', 'columnkeytrunggian', 'iscollapse', 'fillterfield', 'fillterdefaultvalue', 'initshow', 'onchange', 'urlviewdohoa', 'urleditdohoa', 'tableworkflowId', 'jobtypeids', 'layerindex', 'issinglelineedit', 'lineperpage', 'columncode', 'istabtrunggian', 'kvhccolumn', 'columnworkflow', 'columnlinklayer'],
        field: ['fieldid', 'fieldname', 'alias', 'isdisplaygrid', 'isdisplay', 'displaylength', 'orderno', 'isreadonly', 'fieldlength', 'vformat', 'defaultvalue', 'isrequire', 'isunique', 'fieldgroup', 'workflowtype', 'tabid', 'columnid', 'fieldtype', 'issearch', 'issearchtonghop', 'parentfieldid', 'wherefieldname', 'columnname', 'foreigntable', 'columnkey', 'columndisplay', 'isfromdomain', 'domainid', 'foreigntableid', 'columncode', 'displaylogic', 'calculation', 'placeholder', 'columntype', 'foreignwindowid', 'disablelogic', 'columndohoa', 'isfilterfield', 'filterdefaultvalue', 'treecolumn'],
        menuitem: ['menuitemid', 'menuitemname', 'parentid', 'orderno', 'description', 'issummary', 'applicationid', 'windowid', 'clientid', 'tabid', 'menuitemtype', 'icon', 'execname', 'linkwindowid', 'menulevel']
    };

    const lookup: any = {};
    const lookupField: any = {};
    const lookupFieldName: any = {};
    const winconf: any = { tabs: [] };

    _sys.window.forEach((item, i) => {
        winconf[item] = conf.window[i];
    });

    /** Khởi tạo look up trước */
    conf.tabs.forEach((item: any[]) => {
        const tab: any = { fields: [], tabs: [], menuitems: [], children: [], maxLevel: 0 };
        _sys.tab.forEach((val, index) => tab[val] = item[index]);
        if (tab.tablevel === 0) { winconf.tabs.push(tab); }
        lookup[tab.tabid] = tab;

        if (tab.parenttabid) {
            const parenttab = lookup[tab.parenttabid];
            tab.parent = parenttab;
            if (parenttab) {
                parenttab.children.push(tab);
                if (tab.tablevel > 0) {
                    if (tab.tablevel > parenttab.tablevel) {
                        parenttab.tabs.push(tab);
                        if (tab.tablevel > parenttab.maxLevel) { parenttab.maxLevel = tab.tablevel; }
                    } else {
                        lookup[parenttab.parenttabid].tabs.push(tab);
                    }
                }
            }
        }
    });

    for (let i = 0; i < conf.fields.length; i++) {
        const field: any = {};
        for (let j = 0; j < _sys.field.length; j++) {
            field[_sys.field[j]] = conf.fields[i][j];
        }
        // var tab=lookup[field['tabid']];
        // tab.fields.push(field);
        lookup[field['tabid']].fields.push(field);
        // khoanb
        lookupField[field['fieldid']] = field;
        // lookupFieldName[field['fieldname']] = field;
        lookupFieldName[lookup[field['tabid']].tabname + '.' + field['fieldname']] = field;
    }
    // khoanb calculation
    // const REGEXP = /(?<=\[).*?(?=\])/g; // RegEx này gây lỗi ở Safari (iOS)
    const REGEXP = /\[([^\][]*)]/g;
    const REGEXP_SUM = /sum|count|avg|min|max/g;
    Object.keys(lookupField).forEach((key) => {

        const field = lookupField[key];
        if (field.parentfieldid) {
            lookupField[field.parentfieldid].children = [];
            lookupField[field.parentfieldid].children.push(field);
        }
        if (field.calculation) {
            field.calculationInfos = [];
            const tab = lookup[field.tabid];
            const names = field.calculation.match(REGEXP);
            const funcs = field.calculation.match(REGEXP_SUM);
            let f = 0;
            for (let i = 0; i < names.length; i++) {
                let info: any = null;
                let name: string = names[i]; // names[i] có dạng '[<string>]'
                name = name.substring(1, name.length - 1); // xóa 2 dấu [ ] trong string
                const isFullName = name.includes('.');
                if (lookupFieldName[isFullName ? name : tab.tabname + '.' + name].children === undefined) {
                    lookupFieldName[isFullName ? name : tab.tabname + '.' + name].children = [];
                }
                lookupFieldName[isFullName ? name : tab.tabname + '.' + name].children.push(field);
                if (isFullName) {
                    const tokens = name.split('.');
                    const tabName = tokens[0];
                    for (let j = 0; j < tab.children.length; j++) {
                        if (tabName === tab.children[j].tabname) {
                            info = {
                                func: funcs[f++],
                                tab: tab.children[j].tabid,
                                field: tokens[1]
                            };
                            // tslint:disable-next-line:align
                            break;
                        }
                    }
                    if (tab.parenttabid && tabName === lookup[tab.parenttabid].tabname) {
                        info = {
                            tab: tab.parenttabid,
                            field: tokens[1]
                        };
                    }
                } else { info = { field: name }; }

                field.calculation = field.calculation.replace(info.func ? info.func + '[' + name + ']' : '[' + name + ']', '_v[' + i + ']');
                field.calculationInfos.push(info);
            }
        }

    });

    console.log(winconf);

    return winconf;
}
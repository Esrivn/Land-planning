/** @jsx jsx */
import { React, AllWidgetProps, jsx } from 'jimu-core'
import { IMConfig } from '../config';
import { CoreForm, CoreTable } from '../../../../component';
import ThemeService from '../../../../component/theme/theme.service';
import { parse } from 'zipson/lib';
import { mapConfig } from '../../../../component/services/mapConfig';
import requestservice from '../../../../core-esri/requestservice';
import "./styles/globalStyles.scss";
import '../../../../styles.scss';     

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, any> {

    sys_combo = {
        1: "[[\"0\",\"đồng ý\"],[\"1\",\"Không đủ giấy tờ\"]]",
        2: "[[\"0\",\"Hoàn thành\"],[\"1\",\"Chưa hoàn công\"],[\"2\",\"Đất nền\"],[\"3\",\"Đất công nghiệp\"],[\"4\",\"Đất thổ cư\"]]",
        3: "[[\"0\",\"Nhà ở\"],[\"1\",\"Đất nông nghiệp\"],[\"2\",\"Trung cư\"],[\"4\",\"Canh tác\"]]"
    };

    layoutConfig = null;
    windowConfig = null;
    tabId = null;
    isLabelLeft = true;

    constructor(props) {
        super(props)

        this.state = {
            isDialog: false
        }

        ThemeService.setActiveTheme();
        this.loadConfig();
    }

    async loadConfig() {
        const ObjectQuery = new requestservice('sql');
        const windowId = 1;
        let url = 'https://coretech.vn:1314/odata/SysCaches/SysCacheWindow/' + windowId;
        const resp = await ObjectQuery.query({ url, params: {}, method: 'GET' });
        if (resp && resp.success) {
            this.layoutConfig = resp.model.layout;
            const obj = parse(resp.model.config);
            const config = mapConfig(obj);
            this.tabId = config.tabs[0].tabid;
            if (config.tabs[0].fields && config.tabs[0].fields.length > 0) {
                config.tabs[0].fields.forEach(field => {
                    // Bổ sung serviceType cho field
                    field.serviceType = config.tabs[0].tabletype
                });
            }
            this.setState({
                fieldConfig: config.tabs[0].fields,
                tableConfig: config.tabs[0]
            });
        }
    }

    onBtnOkClick(e) {
        console.log('BTN CLICK >>>>> ', e);
    }

    onSelectionChange(e) {
        console.log('SELECTION CHANGE >>>> ', e)
    }


    render() {
        return (
            <div className="widget-example-demo">
                <div className='widget-core-form'>
                    <CoreForm fieldConfig={this.state.fieldConfig} layoutConfig={this.layoutConfig} isLabelBorder={true}
                        lookupData={this.sys_combo} tabId={this.tabId} isLabelLeft={this.isLabelLeft} labelWidth="120px"
                        onOkCallBack={(e) => this.onBtnOkClick(e)}></CoreForm></div>
                {/* <div className='widget-core-table'>
                    {
                        this.state.tableConfig &&
                        <CoreTable config={this.state.tableConfig} lookup={this.sys_combo} onSelectionChange={(e) => this.onSelectionChange(e)}></CoreTable>
                    }
                </div> */}

            </div>
        )
    }
}

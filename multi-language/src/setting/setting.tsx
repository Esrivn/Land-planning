
import { React, jsx } from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import { IMConfig } from "../config";
import { JimuMapViewSelector, SettingRow, SettingSection } from "jimu-ui/advanced/setting-components";
import { Select } from 'jimu-ui'

const {useState, useEffect} = React;



export default function (props: AllWidgetSettingProps<IMConfig>) {
    const [lan, setLan] = useState('');

    useEffect(() => {
        let config: any = {...props.config};
        if (!config.languageDefault) {
            setLan('en');
            config.languageDefault = 'en';
        } else {
            setLan(config.languageDefault);
        }
        props.onSettingChange({
            id: props.id,
            config
        });
    }, [])

    
const handleSelected = (e, item) => {
    let config: any = {...props.config};
    setLan(item.props.value);
    config.languageDefault = item.props.value;
    props.onSettingChange({
        id: props.id,
        config
    });
}

    return (
        <div>
            <SettingSection>
                <SettingRow>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%'
                        }}
                        >
                        <label style={{ 
                            justifyContent: 'left'
                         }}>
                            
                        </label>
                        <Select
                            value={lan}
                            onChange={(e, item) => handleSelected(e, item)}
                        >
                            <Option value="vi">
                                Vietnamese
                            </Option>
                            <Option value="en">
                               English
                            </Option>
                        </Select>
                    </div>
                </SettingRow>
            </SettingSection>
        </div>
    )
}

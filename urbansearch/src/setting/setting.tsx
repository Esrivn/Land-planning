/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import { IMConfig } from "../config";
import { JimuMapViewSelector, SettingRow, SettingSection } from "jimu-ui/advanced/setting-components";
export default function (props: AllWidgetSettingProps<IMConfig>) {

    const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
        props.onSettingChange({
            id: props.id,
            useMapWidgetIds: useMapWidgetIds
        });
    };



    return (
        <div>
            <SettingSection>
                <SettingRow>
                    <JimuMapViewSelector onSelect={onMapWidgetSelected} useMapWidgetIds={props.useMapWidgetIds} />
                </SettingRow>
            </SettingSection>
        </div>
    )
}


// export default class Setting extends React.PureComponent<AllWidgetSettingProps<any>, any> {
//     onMapWidgetSelected = (useMapWidgetIds: string[]) => {
//         this.props.onSettingChange({
//             id: this.props.id,
//             useMapWidgetIds: useMapWidgetIds
//         });
//     };


//     render() {
//         return (
//             <div className="widget-setting-demo">
//                 <SettingRow>
//                     <JimuMapViewSelector onSelect={this.onMapWidgetSelected} useMapWidgetIds={this.props.useMapWidgetIds} />
//                 </SettingRow>
//             </div>
//         );
//     }
// }
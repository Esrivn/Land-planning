import React, { PropsWithChildren, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import PropTypes, { any, string, bool, object } from 'prop-types';
import './checkbox.scss'
const CoreCheckBox = ({ onChange, ...props }) => {
     //const [checked, setChecked] = useState(false);
    return (
        <div> <Checkbox onChange={onChange} checked = {props.checked} trueValue={props.typeValue === 'boolean' ? true : props.typeValue === 'string' ? 'Y' : 1}
            falseValue={props.typeValue === 'boolean' ? false : props.typeValue === 'string' ? 'N' : 0 }></Checkbox>
            <label htmlFor={props.chkLabel} className="p-checkbox-label">{props.name} </label>
        </div >
    );

    // const [checked, setChecked] = useState(false);
    // if (props.hasFormCtrl) {
    //     return (
    //         <>
    //             <div>
    //                 <Checkbox inputId={props.chkLabel} value={props.chkValue} onChange={e => setChecked(e.checked)} checked={checked}
    //                     trueValue="typeValue === 'boolean' ? true : typeValue === 'string' ? 'Y' : 1" falseValue="
    //                         typeValue === 'boolean' ? false : typeValue === 'string' ? 'N' : 0"
    //                     name={props.chkName} disabled={props.isDisabled}   >
    //                 </Checkbox>
    //                 <label htmlFor={props.chkLabel} className="p-checkbox-label">{props.chkLabel} </label>
    //             </div>
    //         </>
    //     );
    // }
    // else {
    //     return (
    //         <>
    //             <div>
    //                 <Checkbox inputId={props.chkLabel} value={props.chkValue}  onChange={e => setChecked(e.checked)} checked={checked}
    //                     trueValue="typeValue === 'boolean' ? true : typeValue === 'string' ? 'Y' : 1" falseValue="
    //                         typeValue === 'boolean' ? false : typeValue === 'string' ? 'N' : 0"
    //                     name={props.chkName} disabled={props.isDisabled}   >
    //                 </Checkbox>
    //                 <label htmlFor={props.chkLabel} className="p-checkbox-label">{props.chkLabel} </label>
    //             </div>
    //         </>
    //     );
    // }

};
// CoreCheckBox.propTypes = {
//     hasFormCtrl: false,
//     chkName: string,
//     chkValue: object,
//     chkLabel: string,
//     chkCtrl: object,
//     isDisabled: bool,
//     chkIcon: object,
//     isBinary: bool,
//     typeValue: string,
//     isLabelLeft: bool,
//     labelLeftOut: bool,
// };
// CoreCheckBox.defaultProps = {
//     hasFormCtrl: false,
//     chkName: 'groupname',
//     chkValue: object,
//     chkLabel: object,
//     chkCtrl: object,
//     isDisabled: false,
//     chkIcon: object,
//     isBinary: PropTypes.bool,
//     typeValue: 'boolean',  //'boolean' | 'string' | 'number'
//     isLabelLeft: true,
//     labelLeftOut: false,
// };
export default CoreCheckBox;

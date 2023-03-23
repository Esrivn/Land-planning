import React, { useEffect, useState } from 'react';
import { RadioButton } from 'primereact/radiobutton';
import './radio-button.scss'
export interface CoreRadioButtonInterface {
    defaultValue: any,
    showLabelKey: string,
    primaryKey: string,
    disabledKey: string,
    displayField: string,
    orientation: string // horizontal, vertical
}
// import data from '../config.json'
const CoreRadioButton = ({ onChange, listRadio, ...props }) => {
    // const [props.defaultValue, setprops.defaultValue] = useState(props.defaultValue);
    // const onChange = (e) => {
    //     setprops.defaultValue(e.value);
    //     onChange(e.value);
    // }
    return (
        <div className={props.orientation === 'vertical' ? 'div-vertical-class' : 'div-horizontal-class' }>
            {[listRadio.map((category) => {
                return (
                    <div key={category[props.primaryKey]} className="field-radiobutton radio-btn-class">
                        <RadioButton inputId={category[props.primaryKey]} name="category" value={category[props.primaryKey]} onChange={onChange} checked={props.defaultValue === category[props.primaryKey]} disabled={category[props.disabledKey]} />
                        {category[props.showLabelKey] ? <label className='label-radio-class' htmlFor={category[props.primaryKey]}>{category[props.displayField]}</label> : null}
                    </div>
                )
            })]}
        </div>

    );

}
CoreRadioButton.defaultProps = {
    showLabelKey: 'isShowLabel',
    primaryKey: 'key',
    disabledKey: 'isDisabled',
    displayField: 'name',
    orientation: 'vertical',
    defaultValue: null
}
export default CoreRadioButton;

import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea'
import './label.scss'
export interface CoreLabelInterface {
    showLabel: boolean,
    labelName: string,
    value?: any,
    isLabelLeft?: boolean,
    width: string,
    isRequired: boolean,
    isDisabled: boolean,
    placeholder: string,
    mode: string
}
// import data from '../config.json'
const CoreLabel = ({ ...props }) => {

    const [value, setValue] = useState();

    // useEffect(() => {

    //     setValue(props.value);

    // }, [props.value]);

    var styleWidth = {
        width: props.isLabelLeft ? props.width : '100%'
    }

    return (
        <div className={!props.isLabelLeft ? 'input-class div-input-class' : 'input-class div-input-labelleft-class'}>
            {props.showLabel ? <label htmlFor="in" className={props.isLabelBorder ? 'label-input-border-class ' : `block label-input-class`} style={styleWidth}>{props.labelName} {props.isRequired ? <span className='required-class'>*</span> : null}</label> : null}
            <label htmlFor="in" className={props.isLabelBorder ? 'label-input-border-class ' : `block label-input-class`}  > {props.value}  </label>
        </div>


    );


}
CoreLabel.defaultProps = {
    showLabel: true,
    labelName: '',
    value: null,
    isLabelLeft: false,
    width: '120px',
    isRequired: false,
    isDisabled: false,
    isLabelBorder: false
}
export default (CoreLabel);

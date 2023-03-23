import React, { useEffect, useState ,useRef, forwardRef, useImperativeHandle} from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea'
import './input.scss'
export interface CoreInputInterface {
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
const CoreInput = ({ onChange, ...props }) => {
     
    const [value, setValue] = useState();
     
    // useEffect(() => {
       
    //     setValue(props.value);
        
    // }, [props.value]);
    
    var styleWidth = {
        width: props.isLabelLeft ? props.width : '100%'
    }
    if (props.mode === 'number') {

        return (
            <div className={!props.isLabelLeft ? 'input-class div-input-class' : 'input-class div-input-labelleft-class'}>
                {props.showLabel ? <label htmlFor="in" className={props.isLabelBorder ==true ? 'label-input-border-class ' :`block label-input-class`}style={styleWidth}>{props.labelName}{props.isRequired ? <span className='required-class'>*</span> : null}</label> : null}
                <InputNumber   id="in" placeholder = {props.placeholder} value={props.value} onChange={onChange} className={props.isRequired && (props.value === null || props.value === '') ? 'input-required-class' : undefined} disabled={props.isDisabled} />
            </div>

        );
    } else if (props.mode === 'text-area') {
        return (
            <div className={!props.isLabelLeft ? 'input-class div-input-class' : 'input-class div-input-labelleft-class'}>
                {props.showLabel ? <label htmlFor="in" className={props.isLabelBorder  ==true? 'label-input-border-class ' :`block label-input-class`} style={styleWidth}>{props.labelName}{props.isRequired ? <span className='required-class'>*</span> : null}</label> : null}
                <InputTextarea  id="in" placeholder = {props.placeholder} value={props.value} onChange={onChange} className={props.isRequired && (props.value === null || props.value === '') ? 'input-required-class' : undefined} disabled={props.isDisabled} rows={props.rows ? props.rows : 3} autoResize = {false} />

            </div>

        );
    }
    else {
        return (
            <div className={!props.isLabelLeft ? 'input-class div-input-class' : 'input-class div-input-labelleft-class'}>
                {props.showLabel ? <label htmlFor="in" className={props.isLabelBorder==true ? 'label-input-border-class ' :`block label-input-class`} style={styleWidth}>{props.labelName}{props.isRequired ? <span className='required-class'>*</span> : null}</label> : null}
                <InputText  id="in" placeholder = {props.placeholder} value={props.value} onChange={onChange} className={props.isRequired && (props.value === null || props.value === '') ? 'input-required-class' : undefined} disabled={props.isDisabled} />
            </div>


        );
    }

}
CoreInput.defaultProps = {
    showLabel: true,
    labelName: '',
    value: null,
    isLabelLeft: false,
    width: '120px',
    isRequired: false,
    isDisabled: false,
    isLabelBorder: false
}
export default (CoreInput);

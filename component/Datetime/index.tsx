import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Calendar } from 'primereact/calendar';
import PropTypes, { any, string, bool, object } from 'prop-types';
import './Datetime.scss'
const CoreDatetime = ({ onChange, ...props }) => {
    // const [props.value, setprops.value] = useState(() => props.value);
    var styleWidth = {
        width: props.isLabelLeft ? props.width : '100%'
    }
    // const onChange = (e) => {

    //     const val = e.target.value ? e.target.value : null
    //     setprops.value(val);
    //     onChange(val);
    //     checkValue()
    // }
    const checkNullArray = () => {
        const val = props.value.filter(element => element === null);
        return val && val.length > 0 ? true : false
    }
    const checkValue = () => {
        var chk = false
        if (props.selectionMode === 'single') {
            chk = props.isRequired && (!props.value || props.value === null || props.value === '') ? false : true
        } else if (props.selectionMode === 'range') {
            chk = props.isRequired && (!props.value || checkNullArray()) ? false : true
        } else {
            chk = props.isRequired && (!props.value || props.value.length === 0) ? false : true
        }
        return chk;
    }
    return (
        <div className={!props.isLabelLeft ? 'datatime-class div-input-class' : 'datatime-class div-input-labelleft-class'}>
            {props.showLabel ? <label htmlFor="in" className={`block label-input-class`} style={styleWidth}>{props.labelName}{props.isRequired ? <span className='required-class'>*</span> : null}</label> : null}
            {/* <InputText id="in" placeholder={props.placeholder} value={props.value} onChange={onChange} className={props.isRequired && (props.value === null || props.value === '') ? 'input-required-class' : undefined} disabled={props.isDisabled} /> */}
            <div className={!checkValue() ? 'input-required-class' : undefined}>
                <Calendar id={props.id} showTime={props.showTime} hourFormat={props.hourFormat} showIcon={props.showIcon}
                    monthNavigator yearNavigator yearRange="1970:2100"
                    selectionMode={props.selectionMode} dateFormat={props.dateFormat} value={props.value} onChange={onChange} />
            </div>

        </div>

    );
};
CoreDatetime.defaultProps = {
    showLabel: true,
    labelName: '',
    value: null,
    isLabelLeft: false,
    width: '120px',
    isRequired: false,
    isDisabled: false,
    placeholder: '',
    selectionMode: 'single',
    dateFormat: 'dd/mm/yy',
    showIcon: true,
    hourFormat: '24',
    showTime: false
}
export default CoreDatetime;

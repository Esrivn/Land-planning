import React, { PropsWithChildren, useState } from 'react';
import { ColorPicker } from 'primereact/colorpicker';
import PropTypes, { any, string, bool, object } from 'prop-types';
import './ColorPicker.scss'
const CoreColorPicker = ({ onChange, ...props }) => {
    //const [color, setColor] = useState('ff0000');
    return (
        <ColorPicker value={props.color} onChange={onChange} />
    );
};
export default CoreColorPicker;

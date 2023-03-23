import React, { useState } from 'react';
import { Button } from 'primereact/button';
// import { DivCoreButton } from './styled';
// import { MapIcon } from '../../icon';
import PropTypes from 'prop-types';
import './button.scss'
import { MapIcon } from '../../icon';
const CoreButton = ({ onClick, ...props }) => {
    let typeButton = '';
    switch (props.typeButton) {
        case 'save':
            typeButton = 'btn-save-class';
            break;
        case 'Primary':
            typeButton = 'p-button-raised';
            break;
        case 'reset':
            typeButton = 'btn-reset-class';
            break;
        case 'Secondary':
            typeButton = 'p-button-raised p-button-secondary';
            break;
        case 'Success':
            typeButton = 'p-button-raised p-button-success';
            break;
        case 'Info':
            typeButton = 'p-button-raised p-button-info';
            break;
        case 'Warning':
            typeButton = 'p-button-raised p-button-warning';
            break;
        case 'Help':
            typeButton = 'p-button-raised p-button-help';
            break;
        case 'Warning':
            typeButton = 'p-button-raised p-button-danger';
            break;
        default:
            typeButton = 'btn-cancel-class';
            break;
    }
    if (props.isOnlyIcon) {
        return (
            <Button onClick={onClick} className={typeButton}
                icon={props.icon} iconPos={props.iconPos} disabled={props.disabledCtrl} label={props.labelName}  ></Button>
        );
    }
    else if (!props.isOnlyIcon) {
        return (
            <Button onClick={onClick} className={typeButton}
                icon={props.icon} iconPos={props.iconPos} disabled={props.disabledCtrl} label={props.labelName}  ></Button>
        );
    }
    // else {
    //     return
    //     (
    //         <Button onClick={onClick} className={typeButton} 
    //             icon={props.icon} iconPos={props.iconPos} disabled={props.disabledCtrl} label={props.labelName}  ></Button>
    //     );

    // }
}
CoreButton.defaultProps = {
    labelName: 'Button',
    typeButton: 'reset',
    icon: MapIcon,
    iconPos: 'left',
    // onClick: PropTypes.func,
    disabledCtrl: false,
    isOnlyIcon: false
};
export default CoreButton;

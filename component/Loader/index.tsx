
import React, { useEffect, useState, useRef } from 'react';
import { SpinContainer } from './styled';
import { ProgressSpinner } from 'primereact/progressspinner';
const Loader = ({ ...props }) => {
    const [display, setDisplay] = useState(false);
    useEffect(() => {
        setDisplay(props.display);
    }, [props.display]);
    return (

        <SpinContainer style={props.display == true ? { display: "flex" } : { display: "none" }}>
            <ProgressSpinner />
        </SpinContainer>
    );
};
export default Loader;

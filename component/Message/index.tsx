import { AllWidgetProps, React } from 'jimu-core';
import { Toast } from 'primereact/toast';
import './CoreMessage.scss'
import { hooks } from 'jimu-ui';
import defaultMessages from '../../urbansearch/src/runtime/translations/default'; 

const {useRef, forwardRef, useImperativeHandle} = React;




interface ObjectMesaages {
    type: string,
    content: string
}

const CoreMessage=(props, ref) => {
    const messagesAppRef: React.MutableRefObject<any> = useRef();
    const nls = hooks.useTranslate(defaultMessages);
    const toastMessages: React.MutableRefObject<any> = useRef()
    const arrMessages = [
        {
            severity: "success",
            summary: "Thành công"
        },
        {
            severity: "info",
            summary: "Thông tin"
        },
        {
            severity: "warn",
            summary: nls("Warning")
        },
        {
            severity: "error",
            summary: "Lỗi"
        }
    ]
   
    useImperativeHandle(ref, () => ({
        getMessages (type, content) {
          const {severity, summary} = arrMessages.filter(f => f.severity === type)[0];
            toastMessages.current.show(
                {
                    severity: severity,
                    summary: summary,
                    detail: content, 
                    life: 3000
                }
            );
        }
    }))

    return (
        <Toast ref={toastMessages} position="top-right" />
    )
}

export default forwardRef(CoreMessage)
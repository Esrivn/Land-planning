import { AllWidgetProps, React } from 'jimu-core';
import { Toast } from 'primereact/toast';
import './CoreMessage.scss'
const {useRef, forwardRef, useImperativeHandle} = React;

interface ObjectMesaages {
    type: string,
    content: string
}

const CoreMessage=(props, ref) => {
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
            summary: "Cảnh báo"
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
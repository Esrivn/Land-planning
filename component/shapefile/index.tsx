import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle  } from 'react';
import { Button } from 'primereact/button';
// import { DivCoreButton } from './styled';
// import { MapIcon } from '../../icon';
import PropTypes from 'prop-types';
import './shapefile.scss';
import { MapIcon } from '../../icon';

import { CoreButton, CoreDatetime, CoreSelect, CoreLabel } from '../index';
import { parse } from 'zipson';
import { Fieldset } from 'primereact/fieldset';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';

import { Accordion, AccordionTab } from 'primereact/accordion';
import { FileUpload } from 'primereact/fileupload';
import Upload_file from './img/Upload_file.png';
import baseFileUrl from './img/file_base.png';
import { Toast } from 'primereact/toast';
// import * as appServices from './app-service';


//const listShapefiles: any[] = []; // Danh sách toàn bộ các file hiển thị trên layout
let arrlistDeteleshapefiles: any = []; // Danh sách các file xóa
let checkChange = false;

const fileMaxSize = 5; // Dung lượng file tối đa được gửi, tính theo đơn vị MB
const baseList: any= []; // Clone lưu trữ danh sách các file ban đầu của control, dùng để reset
//const baseFileUrl = 'assets/imgs/others/file_base.png';
const urlProxy = '';

// Biến dành cho SQL service
const appId: any = null;
const clientId: any = null;

const responsiveOptions = [
    {
        breakpoint: '500px',
        numVisible: 3,
        numScroll: 3
    },
    {
        breakpoint: '350px',
        numVisible: 2,
        numScroll: 2
    },
    {
        breakpoint: '200px',
        numVisible: 1,
        numScroll: 1
    }
];

let Type :any= 'arcgis'; // Kiểu dịch vụ của attachment (arcgis, sql, postgre)


export interface CoreShapefilesInterface {
    showLabel: boolean,
    labelName: string,
    value?: any,
    isLabelLeft?: boolean,
    width: string,
    isRequired: boolean,
    isDisabled: boolean,
    placeholder: string,
    mode: string,
    data:any
}
const onOpenFile= (item: any) => {
    if (Type === 'sql') {
        // const url = this.appService.urlOdataAttachment + '/' + item.urlFile;
        // window.open(url, '_blank');
    } else {
        window.open(item.url, '_blank');
    }
}
// import data from '../config.json'
const CoreShapefiles = ({ onChangeShapefiles, ...props }, ref) => {
    const [listShapefiles, setlistShapefiles] = useState([]);
    const toast = useRef(null);
    const inputRef = useRef(null);
    useImperativeHandle(ref, (): any => ({
        onClearResult: () => {
             console.log('ref111111', ref);
        },
    }));
    useEffect(() => { 
        <Toast ref={toast} position="bottom-right"/>
    })

    useEffect(() => {
        if ( props.data === null) {  
            if(inputRef.current ){
                inputRef.current.value = null;
            }
            arrlistDeteleshapefiles =[];
            onChangeShapefiles();
        }
     
    }, [props.value])
    
    arrlistDeteleshapefiles =[];

    useEffect(() => {
        console.log('props_attt', props.data);
        if ( props.data !== null) { 
            switch (props.data.serviceType) {
                case 'SQL':
               // case 'AutoData':
               case 'CloudData':
                    Type = 'sql';
                   loadSqlOdataAttachmentList();
                    break;
                case 'FeatureServer':
                case 'MapServer':
                case 'WorkflowServices':
                    Type = 'arcgis';
                    loadArcGISAttachmentList(props.data);
                    break;
                default:
                    Type = 'sql';
                    loadSqlOdataAttachmentList();
                    break;
            }
        }
    }, [props.data]);

     /**** KHU VỰC CODE CỦA SQL ODATA *****/

    /** Load danh sách attachment theo dịch vụ của Sql Odata */
    const loadSqlOdataAttachmentList= async () => {
       

    
    }

    /**** KHU VỰC CODE CỦA ARCGIS *****/

    /** Load danh sách attachment theo dịch vụ của ArcGIS */
    const  loadArcGISAttachmentList= async (evt) => {
       console.log('loadArcGISAttachmentList', evt)
    }

    
    var styleWidth = {
        width: props.isLabelLeft ? props.width : '100%'
    }
    if (props.mode === 'view') {

        return (
            
            <Accordion activeIndex={0}>
                {/* <AccordionTab header="Danh sách tệp đính kèm">
                   {
                    listShapefiles && listShapefiles.length > 0 &&
                    listShapefiles.map(item => { 
                        switch (item) {
                              default:
                                return  <div className="attachment-bounder">
                                            <div className="attachment-item" style={{backgroundImage: 'url(' + item.url + ')'}}
                                                onClick={() =>onOpenFile(item)} ></div>
                                            <div className="attachment-desc">{{item.name}}</div>
                                        </div>
                                break;
                        }
                    })
                   }
                </AccordionTab> */}
            </Accordion>
            

        );
    } else {
        
        const readURLShapefiles= (event) => {
            console.log(event)
            setlistShapefiles([]);
           
            const files  = event.target.files;
            const reader = new FileReader();
            const file = files[0];
            reader.readAsDataURL(file);
            console.log(file)
            reader.addEventListener("load", (e) => {
                    const img = e.target.result;
                    const size = file.size / 1024 / 1024;
                    const name = file.name;
                    const type = file.type;
                    if (size < fileMaxSize) { 
                        // let uploadNode =  document.getElementById('my-file').value;
                        // if (uploadNode !== undefined && uploadNode !== null) {
                        //     uploadNode = '';
                        // }
                        if( isImage(type)){
                            arrlistDeteleshapefiles.push({
                                id: null,
                                contentType: type,
                                size: size,
                                name: name,
                                file: file,
                                url: baseFileUrl,
                                data:props.data
                            });
                            const attachmentForm = document.getElementById("uploadForm2");
                            onChangeShapefiles(attachmentForm);
                        } else {
                            inputRef.current.value = null;
                            onChangeShapefiles(null);
                            //toast.current.show({severity: 'error', summary: 'Error Message', detail:"không đúng định dạng ZIP", life: 3000});
                        }
                        
                       // console.log('arrlistDeteleshapefiles', arrlistDeteleshapefiles);
                        //onChange(arrlistDeteleshapefiles);
                        
                    } else {

                    }
                    setlistShapefiles(arrlistDeteleshapefiles);
                
                })

           
            
       
        }

         /** Kiểm tra xem kiểu dữ liệu có phải ảnh hay không */
         const isImage=(type: string): boolean =>{
            if (type && type.split('/').length > 0) {
                if (type === 'application/x-zip-compressed') {
                    return true;
                }
            }
            return false;
        }

        return (
            
            <form encType="multipart/form-data" method="post" id="uploadForm2">
                <div className="upload-container" id="fileSelect" style={{  width: '100%', height: '200px',  borderRadius: '5px',display: 'flex', overflow: 'auto', background: 'var(--color_bg_panel)',color: 'var(--color_icon_core)',border: '1px dashed var(--color_border)'}}> 
                    <input type="file" name="file" id="inFile" hidden onChange={readURLShapefiles} multiple ref={inputRef} />
                    <label htmlFor="inFile" style={{display: 'flex',justifyContent: 'center',alignItems: 'center',flexFlow: 'column',height: '100%',borderRight: '1px dashed var(--color_border)', cursor: 'pointer',padding: '0px 40px'}}>
                        <div  style={{ backgroundImage: 'url('+Upload_file+')' , width:'90px', height: '90px', backgroundRepeat: 'no-repeat'}}> </div>
                    </label>
                    {
                        listShapefiles && listShapefiles.length > 0 &&
                        listShapefiles.map(item => { 
                            return <div className="attachment-bounder">
                                    <div className="attachment-item" style={{backgroundImage: 'url(' + item.url + ')'}}
                                    ></div>
                                    <div className="attachment-desc"  style={{color: 'red'}}>{item.name}</div>
                            </div>
                        })
                    }
                </div>
            </form>
        );
    }

}
CoreShapefiles.defaultProps = {
    showLabel: true,
    labelName: '',
    value: null,
    isLabelLeft: false,
    width: '120px',
    isRequired: false,
    isDisabled: false,
    isLabelBorder: false,
    data:null
}
export default (CoreShapefiles);


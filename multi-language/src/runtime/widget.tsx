/** @jsx jsx */
import { React, AllWidgetProps, jsx } from 'jimu-core'
import { IMConfig } from '../config'
import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";     
import { Dropdown } from 'primereact/dropdown';
import ThemeService from '../../../component/theme/theme.service';
import './style.scss';
const {useState, useEffect} = React;
const imgEn = require('./assets/en-EN.png');
const imgVN = require('./assets/vi-VN.png');

export default function Widget (props: AllWidgetProps<IMConfig>, any) {
  const [selectedLan, setSelectedLan] = useState(null);
  const languages = [
    { name: 'VI', code: 'vi', img: imgVN },
    { name: 'EN', code: 'en', img: imgEn }
];


  useEffect(() => {
    ThemeService.setActiveTheme();
    let languageDefault = props.config.languageDefault;
    if(languageDefault) {
      let url = window.location.href;
      const idx = url.indexOf("locale=");
      let lans = languages.find(f => f.code === languageDefault);
      if (idx === -1) {
        let urlNew = url.includes('?') ? `${url}&locale=${languageDefault}` : `${url}?locale=${languageDefault}`;
        window.location.replace(urlNew);
      } else {
        const strCur = url.slice(idx, idx + 9);
        lans = languages.find(f => f.code === strCur.split("=")[1]);
      }
      setSelectedLan(lans);
    }

    
  }, []);

  const selectedLanTemplate = (option, props) => {
    if (option) {
        return (
            <div className="flex align-items-center">
                <img alt={option.name} src={option.img} className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
                <div className='title-language'>{option.name}</div>
            </div>
        );
    }

    return <span>{props.placeholder}</span>;
};

const countryOptionTemplate = (option) => {
    return (
        <div className="flex align-items-center">
            <img alt={option.name} src={option.img} style={{ width: '18px' }} />
            <div className='title-language'>{option.name}</div>
        </div>
    );
};

const handleSelectedChangeLan = (e) => {
  let url = window.location.href;
  const idx = url.indexOf("locale=");
  const strCur = url.slice(idx, idx + 9);
  let strNew = `locale=${e.value.code}`;
  let urlNew = url.replace(strCur, strNew);
  window.location.replace(urlNew);
}

  return (
    <div className="widget-demo jimu-widget m-2">
      <div className="card flex justify-content-center">
            <Dropdown value={selectedLan} onChange={(e) => handleSelectedChangeLan(e)} options={languages} optionLabel="name"
                valueTemplate={selectedLanTemplate} itemTemplate={countryOptionTemplate} className="w-full md:w-14rem" />
        </div>   
    </div>
  )
}

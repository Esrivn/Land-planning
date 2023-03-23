
import { React } from 'jimu-core'
import { TabView, TabPanel } from 'primereact/tabview'

import "primeicons/primeicons.css"
import "primereact/resources/themes/lara-light-indigo/theme.css"  //theme
import "primereact/resources/primereact.min.css"

import './style.scss'
import { dataChuGiai } from './dataChuGiai'

const Widget = () => {

  const listChuGiaiQHSDD = dataChuGiai.dataChuGiaiQHSDD.DATA.map((item) => {
    return (
      <div className="div-panel">
        <div key={item.ma} className="field col-1 md:col-3 div-panel-mamau" style={{backgroundColor: item.ma}}/>
        <div key={item.ma} className="field col-11 md:col-3">{item.mota}</div>
      </div>
    );
  });

  const listChuGiaiHTSDD = dataChuGiai.dataChuGiaiHTSDD.DATA.map((item) => {
    return (
      <div className="div-panel">
        <div key={item.ma} className="field col-1 md:col-3 div-panel-mamau" style={{backgroundColor: item.ma}}/>
        <div key={item.ma} className="field col-11 md:col-3">{item.mota}</div>
      </div>
    );
  });

  const listChuGiaiKHSDD = dataChuGiai.dataChuGiaiQHSDD.DATA.map((item) => {
    return (
      <div className="div-panel">
        <div key={item.ma} className="field col-1 md:col-3 div-panel-mamau" style={{ backgroundColor: item.ma }} />
        <div key={item.ma} className="field col-11 md:col-3">{item.mota}</div>
      </div>
    );
  });

  return (
    <>
      <div className="div-legend">
      <div className="div-tab-panel">
        <div >{listChuGiaiQHSDD}</div>
      </div>
        {/* <TabView>
          <TabPanel header="QHSDĐ">
            <div className="div-tab-panel">
                <div >{listChuGiaiQHSDD}</div>
            </div>
          </TabPanel>
          <TabPanel header="KHSDĐ">
            <div>
                <div >{listChuGiaiKHSDD}</div>
            </div>
          </TabPanel>
          <TabPanel header="HTSDĐ">
            <div>
                <div >{listChuGiaiHTSDD}</div>
            </div>
          </TabPanel>
        </TabView> */}
      </div>
    </>
  )
}

export default Widget
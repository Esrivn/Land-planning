/** @jsx jsx */
import {React, FormattedMessage, defaultMessages as jimuCoreDefaultMessage, AllWidgetProps, css, jsx, styled} from 'jimu-core';
import { hooks } from 'jimu-ui';
import { IMConfig } from '../config';
import defaultMessages from './translations/default'; 

export default function Widget(props: AllWidgetProps<IMConfig> & any) {
  const nls = hooks.useTranslate(defaultMessages)
    return (
      <div className="widget-demo jimu-widget m-2">
     <p title={nls('field1')}><FormattedMessage id="field1" defaultMessage={defaultMessages.field1}></FormattedMessage></p>
        <div className="title font-weight-bold"><FormattedMessage id="field2" defaultMessage={defaultMessages.field2}></FormattedMessage></div>
        <div className="title font-weight-bold"><FormattedMessage id="field3" defaultMessage={defaultMessages.field3}></FormattedMessage></div>
        {nls('field1')}
      </div>
    )
}

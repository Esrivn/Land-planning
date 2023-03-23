/** @jsx jsx */
import {React, FormattedMessage, defaultMessages as jimuCoreDefaultMessage, AllWidgetProps, css, jsx, styled} from 'jimu-core';
import { IMConfig } from '../config';
import defaultMessages from './translations/default';

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, any> {
  nls = (id: string) => {
    return this.props.intl ? this.props.intl.formatMessage({ id: id, defaultMessage: defaultMessages[id] }) : id;
  }

  constructor (props) {
    super(props)

    this.state = {}
  }

  render () {
    return (
      <div className="widget-demo jimu-widget m-2">
     <p title={this.nls('field1')}><FormattedMessage id="field1" defaultMessage={defaultMessages.field1}></FormattedMessage></p>
        <div className="title font-weight-bold"><FormattedMessage id="field2" defaultMessage={defaultMessages.field2}></FormattedMessage></div>

        <div className="title font-weight-bold"><FormattedMessage id="field3" defaultMessage={defaultMessages.field3}></FormattedMessage></div>

        {this.nls('field1')}
      </div>
    )
  }
}

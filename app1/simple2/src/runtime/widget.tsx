/** @jsx jsx */
import { React, AllWidgetProps, jsx } from 'jimu-core'
import { IMConfig } from '../config'
import {CoreButton, CoreInput} from '../../../../component';

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, any> {
  constructor (props) {
    super(props)

    this.state = {}
  }

  test = () => {
    console.log(123);
    
  }
  handleClick = () => {
    console.log(123);
    
  }

  render () {
    return (
      <div className="widget-demo jimu-widget m-2">
        <p>Simple Widget</p>
        <CoreInput onChange={this.test} />
        <CoreButton icon="search" onClick={this.handleClick} typeButton='Success'></CoreButton>
        <p>exampleConfigProperty: {this.props.config.exampleConfigProperty}</p>
      </div>
    )
  }
}

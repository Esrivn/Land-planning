/** @jsx jsx */
import { React, AllWidgetProps, jsx } from 'jimu-core'
import { IMConfig } from '../config';
import '../../../../styles.scss';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';


export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, any> {
  constructor (props) {
    super(props)

    this.state = {
      isDialog: false
    }
  }

  render () {
    return (
      <div className="widget-demo jimu-widget m-2">
      <Dialog visible={this.state.isDialog} onHide={() => this.setState({isDialog: false})}>
          // content
      </Dialog>

      <Button label="Show" onClick={() => this.setState({isDialog: true})} />
      </div>
    )
  }
}

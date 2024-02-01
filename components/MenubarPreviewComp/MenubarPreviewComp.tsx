import React, { Component} from 'react';
import * as Menubar from '@radix-ui/react-menubar';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import * as mainActions from '../../redux/main/mainActions'

import { CheckIcon} from '@radix-ui/react-icons';
import './MenubarPreviewComp.css';
import { withRouter } from 'next/router';
import Image from 'next/image';

const CHECK_ITEMS = ['Always Show Bookmarks Bar', 'Always Show Full URLs'];

class MenubarPreviewComp extends Component<any, any> {

  constructor(props) {
      super(props);
      this.state = {
        checkedSelection : [CHECK_ITEMS[1]]
      }
    }
 

  render(){
    return <Menubar.Root className="MenubarRoot PreviewMenubarRoot">
      <Menubar.Menu>
        <Menubar.Trigger className="MenubarTrigger"><Image src={require('../../assets/icons/logo_colored_white.png')} style={{height:10, width:'auto'}} alt='logo' /> <span>&#x2022;</span></Menubar.Trigger>
          <Menubar.Portal>
          <Menubar.Content className="MenubarContent" align="start" sideOffset={5} alignOffset={-3}>
            <Menubar.Item className="MenubarItem">
              Back to files 
            </Menubar.Item>
            <Menubar.Item className="MenubarItem" style={{opacity : this.props.hasCanvas? 1:0.4, pointerEvents : this.props.hasCanvas? 'painted':'none', }} onClick={()=>this.props.setDrawerOpened(true)} >
              Flows  
            </Menubar.Item>
            <Menubar.Item className="MenubarItem" >
              Comment
            </Menubar.Item>
            <Menubar.Separator className="MenubarSeparator" />
             
            <Menubar.Item className="MenubarItem">
              Settings 
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <div className='menutools-container' style={{position:'absolute', right:'20%', top:'50%', bottom:'50%'}}>
          <div>
            <fieldset className="Fieldset">
              <select className='Input PlayModeSelect' style={{minWidth:80}}>
                <option>Fit</option>
                <option>By width</option>
                <option>By height</option>
              </select>
              
            </fieldset>
          </div>
      </div>

      <Menubar.Menu>
        <Menubar.Trigger className="MenubarTrigger">View</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className="MenubarContent"
            align="start"
            sideOffset={5}
            alignOffset={-14}
          >
            {CHECK_ITEMS.map((item) => (
              <Menubar.CheckboxItem
                className="MenubarCheckboxItem inset"
                key={item}
                checked={this.state.checkedSelection.includes(item)}
                // onCheckedChange={() =>
                //   this.setCheckedSelection((current) =>
                //     current.includes(item)
                //       ? current.filter((el) => el !== item)
                //       : current.concat(item)
                //   )
                // }
              >
                <Menubar.ItemIndicator className="MenubarItemIndicator">
                  <CheckIcon />
                </Menubar.ItemIndicator>
                {item}
              </Menubar.CheckboxItem>
            ))}
            <Menubar.Separator className="MenubarSeparator" />
            <Menubar.Item className="MenubarItem inset">
              Reload <div className="RightSlot">⌘ R</div>
            </Menubar.Item>
            <Menubar.Item className="MenubarItem inset" disabled>
              Force Reload <div className="RightSlot">⇧ ⌘ R</div>
            </Menubar.Item>
            <Menubar.Separator className="MenubarSeparator" />
            <Menubar.Item className="MenubarItem inset">Toggle Fullscreen</Menubar.Item>
            <Menubar.Separator className="MenubarSeparator" />
            <Menubar.Item className="MenubarItem inset">Hide Sidebar</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
 
    </Menubar.Root>
 }
};


const mapStateToProps = (state) => {
  return {
    mainState: state.mainReducer
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    mainActions: bindActionCreators(mainActions, dispatch)
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MenubarPreviewComp));

import React, { Component, useEffect } from 'react';
import * as Menubar from '@radix-ui/react-menubar';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import * as mainActions from '../../redux/main/mainActions'

import { CheckIcon, ChevronRightIcon, DotFilledIcon } from '@radix-ui/react-icons';
import './MenubarComp.css';
// import ToolbarComp from '../ToolbarComp/ToolbarComp';
import * as Switch from '@radix-ui/react-switch';
import { APP_MODE, USER_ACTION_STATE } from '../../lib/awa/awa.core';
import awaEvents from '../../lib/awa/awa.events';
import { PREVIEW_TYPES } from '../../lib/awa/awa.constants';
import { withRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

const CHECK_ITEMS = ['Always Show Bookmarks Bar', 'Always Show Full URLs'];


class MenubarComp extends Component<any,any> {

  constructor(props) {
      super(props);
      this.state = {
        checkedSelection : [CHECK_ITEMS[1]],
        previewType : PREVIEW_TYPES.scene,
      }
    }
 

    onAppModeChanged = (_isAnimeMode) =>{

      _isAnimeMode ?  this.props.awa.setAnimeAppMode(APP_MODE.ANIME) : this.props.awa.setDesignAppMode(APP_MODE.DESIGN);

      // this.props.mainActions.setAppMode(appMode);
      // if(_isAnimeMode)
      // {
      //   console.log("select mode")
      //   this.props.awa.setAnime
      // }
  }


  /* APP MODES */
  isAppModeDesign = ()=>{

    return this.props.mainState.appMode == APP_MODE.DESIGN;
  }

  isAppModeAnime = ()=>{

    return this.props.mainState.appMode == APP_MODE.ANIME;
  }

  setPreviewType = (_type)=>{
    this.setState({previewType : _type})
  }

  // gotoPreview = ()=>
  // {
  //   this.props.navigate("/preview")
  // }

  render(){
    return <Menubar.Root className="MenubarRoot">
      <Menubar.Menu>
        <Menubar.Trigger className="MenubarTrigger"><Image src={require('../../assets/icons/logo_colored_white.png')} style={{height:10, width:'auto'}} alt='logo' /> <span>&#x2022;</span></Menubar.Trigger>
          <Menubar.Portal>
          <Menubar.Content className="MenubarContent" align="start" sideOffset={5} alignOffset={-3}>
            <Menubar.Item className="MenubarItem">
              Dashboard 
            </Menubar.Item>
             
            <Menubar.Separator className="MenubarSeparator" />

            <Menubar.Sub>
              <Menubar.SubTrigger className="MenubarSubTrigger">
                File
                <div className="RightSlot">
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>
              <Menubar.Portal>
                <Menubar.SubContent className="MenubarSubContent" alignOffset={-5}>
                  <Menubar.Item className="MenubarItem">New design</Menubar.Item>
                  <Menubar.Item className="MenubarItem">Save</Menubar.Item>
                  <Menubar.Item className="MenubarItem">Save as</Menubar.Item>
                  <Menubar.Item className="MenubarItem">Export to SVG</Menubar.Item>
                  <Menubar.Item className="MenubarItem">Export to GIF</Menubar.Item>
                  <Menubar.Item className="MenubarItem">Preferences</Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator className="MenubarSeparator" />
             
            <Menubar.Sub>
              <Menubar.SubTrigger className="MenubarSubTrigger">
                Edit
                <div className="RightSlot">
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>
              <Menubar.Portal>
                <Menubar.SubContent className="MenubarSubContent" alignOffset={-5}>
                  <Menubar.Item className="MenubarItem">Undo<div className="RightSlot">Ctrl + Z</div></Menubar.Item>
                  <Menubar.Item className="MenubarItem">Redo<div className="RightSlot">Ctrl + Y</div></Menubar.Item>
                  <Menubar.Item className="MenubarItem">Copy<div className="RightSlot">Ctrl + C</div></Menubar.Item>
                  <Menubar.Item className="MenubarItem">Paste<div className="RightSlot">Ctrl + V</div></Menubar.Item>
                  <Menubar.Item className="MenubarItem">Delete<div className="RightSlot">Ctrl + X</div></Menubar.Item>
                  <Menubar.Item className="MenubarItem">Toggle Select All<div className="RightSlot">Ctrl + A</div></Menubar.Item>
                  
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator className="MenubarSeparator" />
             
            <Menubar.Sub>
              <Menubar.SubTrigger className="MenubarSubTrigger">
                View
                <div className="RightSlot">
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>
              <Menubar.Portal>
                <Menubar.SubContent className="MenubarSubContent" alignOffset={-5}>
                  <Menubar.Item className="MenubarItem">Rulers</Menubar.Item>
                  <Menubar.Item className="MenubarItem">Zoom In</Menubar.Item>
                  <Menubar.Item className="MenubarItem">Zoom Out</Menubar.Item>
                  <Menubar.Item className="MenubarItem">Toggle Zoom</Menubar.Item>
                  
                </Menubar.SubContent>  
              </Menubar.Portal>
            </Menubar.Sub>


          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <div className='menutools-container'>

        <form style={{display:'flex', alignItems:'center'}}>
            <div style={{ display: 'flex', alignItems: 'center', margin:'0px 25px'}}>
                <label className="Label" htmlFor="app-mode" style={{color:"gainsboro", width:'auto', marginRight:10 }}>
                    Design
                </label>
                <Switch.Root className="SwitchRoot AppModeSwitcher" id="app-mode" defaultChecked={this.isAppModeAnime()} onCheckedChange={(_isAnimeMode)=>this.onAppModeChanged(_isAnimeMode)}>
                    <Switch.Thumb className="SwitchThumb" />
                </Switch.Root>
                <label className="Label" htmlFor="app-mode"  style={{color:"gainsboro" , marginLeft:10 }}>
                    Anime
                </label>
            </div>
        </form>

          <div>
            <fieldset className="Fieldset">
              <select className='Input PlayModeSelect' defaultValue={PREVIEW_TYPES.scene} onChange={(evt)=>this.setPreviewType(evt.target.value)} style={{minWidth:80}}>
                {Object.values(PREVIEW_TYPES).map((t,i)=>
                  <option key={i} value={t}>{t}</option>
                )}
              </select>
              
              <Link className='PlayModeBtnLink' href={`preview?type=${this.state.previewType}`} target='_blank'>
                <div className='PlayModeBtn' title='preview'>
                  <i className="inputIcon PlayModeInputIcon bi bi-play-fill" style={{transform:'scale(1)'}}></i>
                </div>
              </Link>

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


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MenubarComp));

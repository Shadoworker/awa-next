import React, { Component} from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import * as ToggleGroup from '@radix-ui/react-toggle-group';

import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import * as mainActions from '../../redux/main/mainActions'

import './ToolbarComp.css'; 
import * as Menubar from '@radix-ui/react-menubar';
import { APP_MODE, USER_ACTION_STATE, USER_MENU_CREATE_CONTEXT } from '../../lib/awa/awa.core';
import { CaretDownIcon } from '@radix-ui/react-icons';
import awaEvents from '../../lib/awa/awa.events';


class ToolbarComp extends Component<any, any> {

    constructor(props) {
        super(props);
      }


    onAppModeChanged = (_isAnimeMode) =>{

        var appMode = _isAnimeMode ? APP_MODE.ANIME : APP_MODE.DESIGN;

        this.props.mainActions.setAppMode(appMode);
        if(_isAnimeMode)
        {
            console.log("select mode")
            this.props.mainActions.setUserActionState(USER_ACTION_STATE.SELECT);
            this.props.mainActions.setUserMenuActiveContext(USER_ACTION_STATE.SELECT);

        }
    }

    updateActionToolbar = (_action, _event = "NONE") =>{

        // this.props.mainActions.setUserMenuActiveContext(_action);
        this.props.awa._setUserActionState(_action);

        
        if(_action == USER_ACTION_STATE.SELECT)
            this.dispatchRequestQuitDrawPath();

        if(_event == awaEvents.DRAW_PATH)
        {
            this.dispatchRequestDrawPath();
        }
            

        if(_event == awaEvents.MODIFY_PATH)
        {
            this.dispatchRequestModifyPath();
        }

        if(_event == awaEvents.CREATE_CANVAS)
        {
            this.dispatchRequestCreateCanvas();
        }

    }

    setUserMenuCreateContext = (_action, _event = "NONE") =>{
        this.props.mainActions.setUserMenuCreateContext(_action);

        this.dispatchRequestCreateShape(_event)
      
    }


    /* APP MODES */
    isAppModeDesign = ()=>{

        return this.props.mainState.appMode == APP_MODE.DESIGN;
    }

    isAppModeAnime = ()=>{

        return this.props.mainState.appMode == APP_MODE.ANIME;
    }

    /* ****************** */

    /* USER ACTION STATE */
    isUserActionStateSelect = ()=>{

        return this.props.mainState.userActionState == USER_ACTION_STATE.SELECT;
    }

    isUserActionStateDraw = ()=>{

        return this.props.mainState.userActionState == USER_ACTION_STATE.DRAW;
    }

    isUserActionStateCreate = ()=>{

        return this.props.mainState.userActionState == USER_ACTION_STATE.CREATE;
    }

    isUserActionStateModify = ()=>{

        return this.props.mainState.userActionState == USER_ACTION_STATE.MODIFY;
    }

    /* *********************** */


    checkUserMenuCreateContext = (_context)=>{

        return this.props.mainState.userMenuCreateContext == _context;
    }

    
    checkUserMenuModifyContext = (_context)=>{

        return this.props.mainState.userMenuModifyContext == _context;
    }


    // Dispatch create
    dispatchRequestCreateShape = (_type)=>{
        
        this.props.awa.dispatchRequestCreateShape(_type);
        
    }
    // Dispatch draw
    dispatchRequestDrawPath = ()=>{
        this.props.awa.dispatchRequestDrawPath();
    }

    // Dispatch quit draw
    dispatchRequestQuitDrawPath = ()=>{
        this.props.awa.dispatchRequestQuitDrawPath();
    }
    
    // Dispatch modify path
    dispatchRequestModifyPath = ()=>{
        this.props.awa.dispatchRequestModifyPath();
    }

    // Dispatch create canvas 
    dispatchRequestCreateCanvas = ()=>{
        
        this.props.awa.dispatchRequestCreateCanvas();
        
    }







    render() { 
        return <Toolbar.Root  data-orientation='vertical' className="ToolbarRoot" aria-label="Formatting options">
        <ToggleGroup.Root data-orientation='vertical'
            className="ToggleGroup"
            type="single"
            value={this.props.mainState.userMenuActiveContext}
            defaultValue={USER_ACTION_STATE.SELECT}
            aria-label="Text alignment"
        >
            <ToggleGroup.Item className="ToggleGroupItem tooltip" value={USER_ACTION_STATE.SELECT} onClick={()=>this.updateActionToolbar(USER_ACTION_STATE.SELECT)} aria-checked='true' aria-label="Left aligned">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="18" viewBox="0 0 18 20" fill="none" style={{marginLeft:2,marginTop:3}}>
                    <path  fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M0.364362 1.86379C0.224105 0.543735 1.60932 -0.401673 2.78748 0.210024L16.6095 7.3864C17.994 8.10522 17.7186 10.1625 16.1938 10.4918L9.05065 12.0349C9.03338 12.0386 9.01837 12.0492 9.00905 12.0642L5.11149 18.3444C4.27555 19.6914 2.20833 19.2186 2.04083 17.6423L0.364362 1.86379ZM1.9594 1.66045C1.95693 1.66553 1.95328 1.67468 1.95541 1.69474L3.63188 17.4732C3.63375 17.4908 3.63734 17.4996 3.63878 17.5027C3.64033 17.5061 3.64193 17.5084 3.64398 17.5105C3.64884 17.5157 3.66127 17.5251 3.68214 17.5298C3.70301 17.5346 3.71828 17.5316 3.7249 17.529C3.72769 17.528 3.73011 17.5266 3.73297 17.5243C3.73562 17.5221 3.74269 17.5157 3.75202 17.5007L7.64958 11.2205C7.8877 10.8368 8.27144 10.5663 8.71282 10.471L15.856 8.92791C15.8726 8.92432 15.8808 8.91998 15.8838 8.91818C15.8871 8.91625 15.8893 8.91433 15.8914 8.91197C15.8962 8.90648 15.904 8.89342 15.9068 8.87287C15.9095 8.85232 15.9054 8.83766 15.9022 8.83109C15.9008 8.82827 15.8992 8.82585 15.8965 8.82312C15.8941 8.82058 15.8873 8.81424 15.8722 8.80641L2.05021 1.63004C2.03231 1.62074 2.02245 1.62082 2.01682 1.62126C2.00836 1.62193 1.99619 1.62536 1.98346 1.63405C1.97074 1.64273 1.96311 1.65281 1.9594 1.66045Z"/>
                </svg>
                <span className="tooltiptext">select</span>
            </ToggleGroup.Item>
            
            {/* <ToggleGroup.Item className="ToggleGroupItem tooltip" value={USER_MENU_CREATE_CONTEXT.CREATE_RECT} onClick={()=>this.updateActionToolbar(USER_ACTION_STATE.SELECT)} aria-checked='true' aria-label="Left aligned">
                <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H1.5H13.5H14V1.5V13.5V14H13.5H1.5H1V13.5V1.5V1ZM2 2V13H13V2H2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                <span className="tooltiptext">rectangle</span>
            </ToggleGroup.Item>

            <ToggleGroup.Item className="ToggleGroupItem tooltip" value={USER_MENU_CREATE_CONTEXT.CREATE_CIRCLE} onClick={()=>this.updateActionToolbar(USER_ACTION_STATE.SELECT)} aria-checked='true' aria-label="Left aligned">
                <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.877075 7.49991C0.877075 3.84222 3.84222 0.877075 7.49991 0.877075C11.1576 0.877075 14.1227 3.84222 14.1227 7.49991C14.1227 11.1576 11.1576 14.1227 7.49991 14.1227C3.84222 14.1227 0.877075 11.1576 0.877075 7.49991ZM7.49991 1.82708C4.36689 1.82708 1.82708 4.36689 1.82708 7.49991C1.82708 10.6329 4.36689 13.1727 7.49991 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49991C13.1727 4.36689 10.6329 1.82708 7.49991 1.82708Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                <span className="tooltiptext">circle</span>
            </ToggleGroup.Item>

            <ToggleGroup.Item className="ToggleGroupItem tooltip" value={USER_MENU_CREATE_CONTEXT.CREATE_POLYGON} onClick={()=>this.updateActionToolbar(USER_ACTION_STATE.SELECT)} aria-checked='true' aria-label="Left aligned">
                <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49998 1L6.92321 2.00307L1.17498 12L0.599976 13H1.7535H13.2464H14.4L13.825 12L8.07674 2.00307L7.49998 1ZM7.49998 3.00613L2.3285 12H12.6714L7.49998 3.00613Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                <span className="tooltiptext">polygon</span>
            </ToggleGroup.Item> */}

            <div className={`ToggleGroupItem tooltip  ${this.isAppModeDesign() ? "" : "awa-disabled-menu"}`}  /* value={USER_ACTION_STATE.CREATE} */  onClick={()=>this.updateActionToolbar(USER_ACTION_STATE.CREATE)} aria-label="Center aligned">
                
                <Menubar.Root className="MenubarRoot" /* orientation='horizontal' */>
                    <Menubar.Menu>
                        <Menubar.Trigger className="MenubarTrigger MenubarTriggerToolbar menuTriggerToolbar">
                            {this.checkUserMenuCreateContext(USER_MENU_CREATE_CONTEXT.NONE) &&
                            <svg width="19" height="19" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginTop:2}}>
                                <path d="M2.14921 3.99996C2.14921 2.97778 2.97784 2.14915 4.00002 2.14915C5.02219 2.14915 5.85083 2.97778 5.85083 3.99996C5.85083 5.02213 5.02219 5.85077 4.00002 5.85077C2.97784 5.85077 2.14921 5.02213 2.14921 3.99996ZM4.00002 1.24915C2.48079 1.24915 1.24921 2.48073 1.24921 3.99996C1.24921 5.51919 2.48079 6.75077 4.00002 6.75077C5.51925 6.75077 6.75083 5.51919 6.75083 3.99996C6.75083 2.48073 5.51925 1.24915 4.00002 1.24915ZM5.82034 11.0001L2.49998 12.8369V9.16331L5.82034 11.0001ZM2.63883 8.21159C2.17228 7.9535 1.59998 8.29093 1.59998 8.82411V13.1761C1.59998 13.7093 2.17228 14.0467 2.63883 13.7886L6.57235 11.6126C7.05389 11.3462 7.05389 10.654 6.57235 10.3876L2.63883 8.21159ZM8.30001 9.00003C8.30001 8.61343 8.61341 8.30003 9.00001 8.30003H13C13.3866 8.30003 13.7 8.61343 13.7 9.00003V13C13.7 13.3866 13.3866 13.7 13 13.7H9.00001C8.61341 13.7 8.30001 13.3866 8.30001 13V9.00003ZM9.20001 9.20003V12.8H12.8V9.20003H9.20001ZM13.4432 2.19311C13.6189 2.01737 13.6189 1.73245 13.4432 1.55671C13.2675 1.38098 12.9826 1.38098 12.8068 1.55671L11 3.36353L9.19321 1.55674C9.01748 1.381 8.73255 1.381 8.55682 1.55674C8.38108 1.73247 8.38108 2.0174 8.55682 2.19313L10.3636 3.99992L8.55682 5.80671C8.38108 5.98245 8.38108 6.26737 8.55682 6.44311C8.73255 6.61885 9.01748 6.61885 9.19321 6.44311L11 4.63632L12.8068 6.44314C12.9826 6.61887 13.2675 6.61887 13.4432 6.44314C13.6189 6.2674 13.6189 5.98247 13.4432 5.80674L11.6364 3.99992L13.4432 2.19311Z" fill="white" fillRule="evenodd" clipRule="evenodd" ></path>
                            </svg>}
                            {this.checkUserMenuCreateContext(USER_MENU_CREATE_CONTEXT.CREATE_RECT) &&
                            <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H1.5H13.5H14V1.5V13.5V14H13.5H1.5H1V13.5V1.5V1ZM2 2V13H13V2H2Z" fill="white" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            }
                            {this.checkUserMenuCreateContext(USER_MENU_CREATE_CONTEXT.CREATE_CIRCLE) &&
                            <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.877075 7.49991C0.877075 3.84222 3.84222 0.877075 7.49991 0.877075C11.1576 0.877075 14.1227 3.84222 14.1227 7.49991C14.1227 11.1576 11.1576 14.1227 7.49991 14.1227C3.84222 14.1227 0.877075 11.1576 0.877075 7.49991ZM7.49991 1.82708C4.36689 1.82708 1.82708 4.36689 1.82708 7.49991C1.82708 10.6329 4.36689 13.1727 7.49991 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49991C13.1727 4.36689 10.6329 1.82708 7.49991 1.82708Z" fill="white" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            }
                            {this.checkUserMenuCreateContext(USER_MENU_CREATE_CONTEXT.CREATE_POLYGON) &&
                            <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49998 1L6.92321 2.00307L1.17498 12L0.599976 13H1.7535H13.2464H14.4L13.825 12L8.07674 2.00307L7.49998 1ZM7.49998 3.00613L2.3285 12H12.6714L7.49998 3.00613Z" fill="white" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            }
                            <span className="tooltiptext">shapes</span>
                            <CaretDownIcon className="CaretDown" aria-hidden  style={{position:'absolute', left:'28%', bottom:'-15%'}} />
                        </Menubar.Trigger>
                        <Menubar.Portal>  
                            <Menubar.Content className="MenubarContent" align="start" sideOffset={5} alignOffset={-3}>
                                <Menubar.Item className="MenubarItem" onClick={()=>this.setUserMenuCreateContext(USER_MENU_CREATE_CONTEXT.CREATE_RECT, awaEvents.CREATE_RECT)}>
                                    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H1.5H13.5H14V1.5V13.5V14H13.5H1.5H1V13.5V1.5V1ZM2 2V13H13V2H2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    <span className='submenu-item-name'>Rectangle</span> <div className="RightSlot submenu-item-slot">R</div>
                                </Menubar.Item>
                                <Menubar.Item className="MenubarItem" onClick={()=>this.setUserMenuCreateContext(USER_MENU_CREATE_CONTEXT.CREATE_CIRCLE, awaEvents.CREATE_CIRCLE)}>
                                    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.877075 7.49991C0.877075 3.84222 3.84222 0.877075 7.49991 0.877075C11.1576 0.877075 14.1227 3.84222 14.1227 7.49991C14.1227 11.1576 11.1576 14.1227 7.49991 14.1227C3.84222 14.1227 0.877075 11.1576 0.877075 7.49991ZM7.49991 1.82708C4.36689 1.82708 1.82708 4.36689 1.82708 7.49991C1.82708 10.6329 4.36689 13.1727 7.49991 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49991C13.1727 4.36689 10.6329 1.82708 7.49991 1.82708Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    <span className='submenu-item-name'>Circle</span>  <div className="RightSlot submenu-item-slot">O</div>
                                </Menubar.Item>

                                <Menubar.Item className="MenubarItem" onClick={()=>this.setUserMenuCreateContext(USER_MENU_CREATE_CONTEXT.CREATE_POLYGON)}>
                                    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49998 1L6.92321 2.00307L1.17498 12L0.599976 13H1.7535H13.2464H14.4L13.825 12L8.07674 2.00307L7.49998 1ZM7.49998 3.00613L2.3285 12H12.6714L7.49998 3.00613Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    <span className='submenu-item-name'>Polygon</span>  <div className="RightSlot submenu-item-slot">Ctrl + P</div>
                                </Menubar.Item>
                                

                            </Menubar.Content>
                        </Menubar.Portal>
                    </Menubar.Menu>
                </Menubar.Root>

            </div>

            <ToggleGroup.Item className={`ToggleGroupItem tooltip  ${this.isAppModeDesign() ? "" : "awa-disabled-menu"}`}  value={USER_ACTION_STATE.DRAW}  onClick={()=>this.updateActionToolbar(USER_ACTION_STATE.DRAW , awaEvents.DRAW_PATH)} aria-label="Right aligned">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 12 15" fill="none" style={{marginTop:2}}>
                    <path  fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M2.42341 1.03028C2.27472 0.945915 2.09325 0.943356 1.94225 1.0235C1.79125 1.10364 1.69166 1.25537 1.6782 1.42578L0.966016 10.4436C0.948284 10.6682 1.08285 10.8768 1.2947 10.9533C2.02685 11.2176 3.147 11.7081 4.12838 12.3101C4.61907 12.611 5.06132 12.9316 5.40061 13.2559C5.74627 13.5863 5.94756 13.8852 6.01906 14.1367C6.06139 14.2856 6.17032 14.4065 6.31403 14.4641C6.45774 14.5217 6.62002 14.5095 6.75347 14.431L10.8674 12.0115C11.0983 11.8757 11.1811 11.582 11.0552 11.3455C10.7178 10.7119 10.4863 9.76251 10.3928 8.7569C10.2996 7.75453 10.3493 6.76018 10.5289 6.05241C10.5843 5.83411 10.4869 5.60572 10.291 5.49456L2.42341 1.03028ZM5.01396 5.74461L3.42323 2.74738L9.47798 6.18301C9.33327 6.9731 9.3112 7.9261 9.39708 8.8495C9.47968 9.73763 9.66617 10.6423 9.96897 11.3798L6.72189 13.2894C6.55323 13.0164 6.33255 12.7634 6.0916 12.533C5.6832 12.1427 5.17697 11.7801 4.65124 11.4576C3.75013 10.9049 2.75138 10.4454 1.99249 10.1478L2.53992 3.21617L4.13066 6.21341C3.53692 6.77971 3.3755 7.69708 3.77886 8.45708C4.26333 9.3699 5.39245 9.73521 6.30798 9.24931C7.2235 8.76341 7.55378 7.62355 7.06931 6.71073C6.66595 5.95072 5.81573 5.57027 5.01396 5.74461ZM5.009 6.80181C5.42291 6.58214 5.95307 6.74064 6.18601 7.17953C6.41894 7.61842 6.25308 8.14633 5.83918 8.366C5.42528 8.58568 4.89511 8.42718 4.66217 7.98828C4.42923 7.54939 4.5951 7.02148 5.009 6.80181Z" />
                </svg>  
                <span className="tooltiptext">pentool</span>
            </ToggleGroup.Item> 

            <ToggleGroup.Item className={`ToggleGroupItem tooltip`}  value={USER_ACTION_STATE.MODIFY}  onClick={()=>this.updateActionToolbar(USER_ACTION_STATE.MODIFY , awaEvents.MODIFY_PATH)} aria-label="Right aligned">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
                    <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M2.5 0C3.8388 0 4.9318 1.05236 4.99693 2.375H13.0031C13.0682 1.05236 14.1612 0 15.5 0C16.8807 0 18 1.11929 18 2.5C18 3.66508 17.203 4.64402 16.1245 4.92137V14.0786C17.203 14.356 18 15.3349 18 16.5C18 17.8807 16.8807 19 15.5 19C14.1612 19 13.0682 17.9476 13.0031 16.625H4.99693C4.9318 17.9476 3.8388 19 2.5 19C1.11929 19 0 17.8807 0 16.5C0 15.3349 0.796981 14.356 1.8755 14.0786V4.92137C0.796981 4.64402 0 3.66508 0 2.5C0 1.11929 1.11929 0 2.5 0ZM2.5 4C3.32843 4 4 3.32843 4 2.5C4 1.67157 3.32843 1 2.5 1C1.67157 1 1 1.67157 1 2.5C1 3.32843 1.67157 4 2.5 4ZM13.2668 15.375H4.73318C4.41258 14.7399 3.82899 14.2601 3.1255 14.0789V4.92111C3.82899 4.73989 4.41258 4.26015 4.73318 3.625H13.2668C13.5874 4.26015 14.171 4.73989 14.8745 4.92111V14.0789C14.171 14.2601 13.5874 14.7399 13.2668 15.375ZM14 16.5C14 17.3284 14.6716 18 15.5 18C16.3284 18 17 17.3284 17 16.5C17 15.6716 16.3284 15 15.5 15C14.6716 15 14 15.6716 14 16.5ZM15.5 4C14.6716 4 14 3.32843 14 2.5C14 1.67157 14.6716 1 15.5 1C16.3284 1 17 1.67157 17 2.5C17 3.32843 16.3284 4 15.5 4ZM4 16.5C4 15.6716 3.32843 15 2.5 15C1.67157 15 1 15.6716 1 16.5C1 17.3284 1.67157 18 2.5 18C3.32843 18 4 17.3284 4 16.5Z"/>
                </svg>
                <span className="tooltiptext">edit</span>
            </ToggleGroup.Item> 

            <ToggleGroup.Item className={`ToggleGroupItem tooltip  ${this.isAppModeDesign() ? "" : "awa-disabled-menu"}`} value={USER_MENU_CREATE_CONTEXT.CREATE_TEXT} aria-label="Right aligned" onClick={()=>this.updateActionToolbar(USER_MENU_CREATE_CONTEXT.CREATE_TEXT)} >
                <svg width="19" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginTop:5}}><path d="M3.94993 2.95002L3.94993 4.49998C3.94993 4.74851 3.74845 4.94998 3.49993 4.94998C3.2514 4.94998 3.04993 4.74851 3.04993 4.49998V2.50004C3.04993 2.45246 3.05731 2.40661 3.07099 2.36357C3.12878 2.18175 3.29897 2.05002 3.49993 2.05002H11.4999C11.6553 2.05002 11.7922 2.12872 11.8731 2.24842C11.9216 2.32024 11.9499 2.40682 11.9499 2.50002L11.9499 2.50004V4.49998C11.9499 4.74851 11.7485 4.94998 11.4999 4.94998C11.2514 4.94998 11.0499 4.74851 11.0499 4.49998V2.95002H8.04993V12.05H9.25428C9.50281 12.05 9.70428 12.2515 9.70428 12.5C9.70428 12.7486 9.50281 12.95 9.25428 12.95H5.75428C5.50575 12.95 5.30428 12.7486 5.30428 12.5C5.30428 12.2515 5.50575 12.05 5.75428 12.05H6.94993V2.95002H3.94993Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                <span className="tooltiptext">text</span>
            </ToggleGroup.Item>

            <ToggleGroup.Item className={`ToggleGroupItem tooltip  ${this.isAppModeDesign() ? "" : "awa-disabled-menu"}`} value={USER_MENU_CREATE_CONTEXT.CREATE_MEDIA} aria-label="Right aligned"  onClick={()=>this.updateActionToolbar(USER_MENU_CREATE_CONTEXT.CREATE_MEDIA)} >
                <svg width="19" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginTop:5}}><path d="M2.5 1H12.5C13.3284 1 14 1.67157 14 2.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V2.5C1 1.67157 1.67157 1 2.5 1ZM2.5 2C2.22386 2 2 2.22386 2 2.5V8.3636L3.6818 6.6818C3.76809 6.59551 3.88572 6.54797 4.00774 6.55007C4.12975 6.55216 4.24568 6.60372 4.32895 6.69293L7.87355 10.4901L10.6818 7.6818C10.8575 7.50607 11.1425 7.50607 11.3182 7.6818L13 9.3636V2.5C13 2.22386 12.7761 2 12.5 2H2.5ZM2 12.5V9.6364L3.98887 7.64753L7.5311 11.4421L8.94113 13H2.5C2.22386 13 2 12.7761 2 12.5ZM12.5 13H10.155L8.48336 11.153L11 8.6364L13 10.6364V12.5C13 12.7761 12.7761 13 12.5 13ZM6.64922 5.5C6.64922 5.03013 7.03013 4.64922 7.5 4.64922C7.96987 4.64922 8.35078 5.03013 8.35078 5.5C8.35078 5.96987 7.96987 6.35078 7.5 6.35078C7.03013 6.35078 6.64922 5.96987 6.64922 5.5ZM7.5 3.74922C6.53307 3.74922 5.74922 4.53307 5.74922 5.5C5.74922 6.46693 6.53307 7.25078 7.5 7.25078C8.46693 7.25078 9.25078 6.46693 9.25078 5.5C9.25078 4.53307 8.46693 3.74922 7.5 3.74922Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                <span className="tooltiptext">media</span>
            </ToggleGroup.Item>

            <ToggleGroup.Item className={`ToggleGroupItem tooltip  ${this.isAppModeDesign() ? "" : "awa-disabled-menu"}`} value={USER_MENU_CREATE_CONTEXT.CREATE_CANVAS} aria-label="Right aligned" onClick={()=>this.updateActionToolbar(USER_MENU_CREATE_CONTEXT.CREATE_CANVAS, awaEvents.CREATE_CANVAS)} >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" style={{marginLeft:2,marginTop:7}} fill="none">
                    <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M13.7143 1.71429H1.71429V13.7143H9.42857V15.4286H1.71429C0.771429 15.4286 0 14.6571 0 13.7143V1.71429C0 0.771428 0.771429 -1.78814e-07 1.71429 -1.78814e-07H13.7143C14.6571 -1.78814e-07 15.4286 0.771428 15.4286 1.71429V9.42857H13.7143V1.71429ZM15.4286 15.4286V18H13.7143V15.4286H11.1429C11.1514 15.42 11.1429 13.7143 11.1429 13.7143H13.7143V11.1514C13.7229 11.1429 15.4286 11.1514 15.4286 11.1514V13.7143H18V15.4286H15.4286Z" ></path>
                </svg>
                <span className="tooltiptext">canvas</span>
                {/* <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 2H2.5C2.22386 2 2 2.22386 2 2.5V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V2.5C13 2.22386 12.7761 2 12.5 2ZM2.5 1C1.67157 1 1 1.67157 1 2.5V12.5C1 13.3284 1.67157 14 2.5 14H12.5C13.3284 14 14 13.3284 14 12.5V2.5C14 1.67157 13.3284 1 12.5 1H2.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg> */}
            </ToggleGroup.Item>
            
        </ToggleGroup.Root>
    
        {/* <Separator orientation='vertical' style={{backgroundColor:'#ffffff56', alignSelf:'center', padding:0, width:0.5, marginLeft:15, marginRight:5}}/> */}
        

    </Toolbar.Root>
    };

}


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
  
  
  export default connect(mapStateToProps, mapDispatchToProps)(ToolbarComp);
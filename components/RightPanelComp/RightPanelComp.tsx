import React, { Component} from 'react';

import { Box,Button,Tabs, Text } from '@radix-ui/themes';
import * as Popover from '@radix-ui/react-popover';
import ColorPicker, { useColorPicker } from 'react-best-gradient-color-picker';
import { ChevronDownIcon, ChevronRightIcon, Cross1Icon, Cross2Icon, EyeOpenIcon, HamburgerMenuIcon, MinusIcon, MixerHorizontalIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';

import * as Accordion from '@radix-ui/react-accordion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Switch from '@radix-ui/react-switch';

import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import * as mainActions from '../../redux/main/mainActions'

import './RightPanelComp.css';
import awaEvents, { awaEventEmitter } from '../../lib/awa/awa.events';
import { getNextEffectIndex, isCanvasChild, isCanvasElement, isElementPath, isNumber, isObjectEmpty, removeEffect, rgbToHex, sortAnimationsByName } from '../../lib/awa/awa.common.utils';
import { getPopertyInitialValue } from '../../lib/awa/awa.anime.utils';
import { APP_MODE, ELEMENT_EFFECTS, ELEMENT_PROPERTIES } from '../../lib/awa/awa.core';
import anime from '../../lib/assets/vendors/anime';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { EFFECT_ID_BODY, INCANVAS_ITEM_CLASS, INTERACTION_ACTION_REF, INTERACTION_ANIMATION_REF, INTERACTION_BASED_ON_REF, INTERACTION_EVENT_REF, INTERACTION_TARGET_REF, INTERACTION_TYPE_REF, NATIVE_ACTIONS, NATIVE_ANIMATIONS } from '../../lib/awa/awa.constants';
import * as Ant from 'antd';
import Image from 'next/image';
// import { List, Tooltip } from 'antd';


class RightPanelComp extends Component<any,any> {

    constructor(props) {
        super(props);

        this.state = {

            inspectorAccordionValues : ["properties-accordion"],
            effectsAccordionValues : ["Drop shadow"],
            // Presets
            fillColor : "#ffffff",
            strokeColor : "#ffffff",
            opacity : 0,
            selectedElementId : null,//this.props.mainState.selectedElementId,
            selectedElementsIds : [],
            selectedElementProps : {},
            selectedElementsProps : [],
            selectedElementPropsTemp : {},

            selectedElementFlow : null,
            selectedElementInteractions : [],

            sceneElements : [],
            customAnimations : []

            
        }
      }


    componentDidMount(){

      var rightPanTabContainer : any = document.querySelector('#rightPanTabContainer');
      var wHeight = window.innerHeight - 107;
      rightPanTabContainer.style.height = wHeight +'px';


      this.initDasharrayFieldsBehaviour();

      // Test effects init
      var effects = []

      var elementProps = {effects : effects};
      
      this.setState({selectedElementProps : elementProps})

      /* Listen for selected element updates */
      this.onUpdateSelectedElement();
      this.onNewCustomAnimation();

    }
 
    enterNoneAppModeContext = ()=>
    {
      this.props.awa.setNoneAppModeContext();
    }

    enterPrototypeAppModeContext = ()=>
    {
      this.props.awa.setPrototypeAppModeContext();

      var awaElementsIds = this.props.awa.m_awaElementsIds;

      var svgOwner = this.props.awa.getSvgInstance();

      var awaElements : any[] = [];

      for (let i = 0; i < awaElementsIds.length; i++) {
        const id = "#"+awaElementsIds[i];

        const element : any = svgOwner.findOne(id);

        awaElements.push(element);
      }

      this.setState({sceneElements : awaElements})

      // selected element interactions
      this.getSelectedElementInteractions();

    }

    enterDeveloperAppModeContext = ()=>
    {
      this.props.awa.setDeveloperAppModeContext();
    }


    isAppModeDesign = ()=>{
      return this.props.mainState.appMode == APP_MODE.DESIGN;
    }

    onInspectorAccordionChange = (_v)=>{

      this.setState({inspectorAccordionValues : _v})
    }
      
    onEffectsAccordionChange = (_v)=>{
      this.setState({effectsAccordionValues : _v})
    }
      
    onAddEffectToElement = (_effectName)=>{

      var elementProps = {...this.state.selectedElementProps};

      var effects = [...elementProps.effects] || [];
      var nextEffectItemIndex = getNextEffectIndex(effects);
      var elementId = this.state.selectedElementId;
      var effect = { 
        id : elementId+EFFECT_ID_BODY+nextEffectItemIndex,
        name : _effectName,   
        properties : {}
      }
      effects = [...effects, effect];

      elementProps.effects = effects;

      this.setState({selectedElementProps : elementProps});

      if(this.props.awa.isDesignAppMode())
      {
        this.requestAddEffectToSelectedElement(effect);
        this.requestUpdateSelectedElementProperty("effects", effects);
      }

    }

    onRemoveEffectFromElement = (_effectId)=>{
      var elementProps = {...this.state.selectedElementProps};

      var effects = [...elementProps.effects] || [];
      var newEffects = removeEffect(effects, _effectId);

      elementProps.effects = newEffects;
 
      this.setState({selectedElementProps : elementProps})

      if(this.props.awa.isDesignAppMode())
      {
        this.requestUpdateSelectedElementProperty("effects", newEffects, _effectId);
      }

    }


    setEffectPropValue = (_effectId, _prop, _value)=>{

      var elementProps = {...this.state.selectedElementProps};

      var effects = [...elementProps.effects];

      effects.find(e=>e.id == _effectId).properties[_prop] = _value;

      this.setState({selectedElementProps : elementProps})

      if(this.props.awa.isDesignAppMode())
      {
        this.requestUpdateSelectedElementProperty("effects", effects);
      }
      else
      {
        // //Update awa timelines items
        // this.requestUpdateTimelineItems(this.props.mainState.timelineItems)
        // // Get initial value for the specific property
        // var _initialValue = getPopertyInitialValue(_name,this.state.selectedElementPropsTemp)
        // this.requestAddNewKeyframe(_name, _value, _initialValue);
      }

    }

    setFillColor = (c) =>{
       
      var hexColor = rgbToHex(c)
     
      // this.setState({fillColor : hexColor})

      this.updatePropsProperty("fill", hexColor);
      this.updateElementProperty("fill", hexColor);

    }

    setStrokeColor = (c) =>{

      var hexColor = rgbToHex(c)
     
      // this.setState({strokeColor : hexColor})

      this.updatePropsProperty("stroke", hexColor);
      this.updateElementProperty("stroke", hexColor);

    }

    /* When an element is selected, moved etc... to be notified and update its visual props */
    onUpdateSelectedElement = ()=>{

      awaEventEmitter.on(awaEvents.SELECTED_SCENE_ITEMS, (_data)=>{
        
        // if(_data.detail.selectedElementId == null)
        if(!this.props.awa.getSelectedElementsKeys().length)
        {
          this.setState({selectedElementId : null, selectedElementProps : {}, selectedElementPropsTemp : {}, selectedElementInteractions : []})

          return;
        }

        var ids = this.props.awa.getSelectedElementsKeys(); // All selected elements ids
        var id = ids[0]; //_data.detail.selectedElementId;
        
        // Verify if we update temp or not
        if(!isObjectEmpty(this.state.selectedElementProps) && this.state.selectedElementProps.id != id)
        {
            this.setState({selectedElementPropsTemp : {}})
        }

        // Get props values : Set
        var selectedElementProps = this.getSelectedElementValues(id);

        // Get all selected elements props for group selection
        var selectedElementsProps : any[] = [];

        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];

          const props = this.getSelectedElementValues(id);
          
          selectedElementsProps.push(props);

        }

        this.setState({selectedElementsIds : ids, selectedElementId : id, selectedElementProps : selectedElementProps, selectedElementsProps : selectedElementsProps})

        // Save initial state 
        // Initial state is saved only in design mode.
        // In anime mode it will be considered as a tween object
        if(this.props.awa.isDesignAppMode()) 
        {
          // To keep track of where we
          this.setState({selectedElementPropsTemp : selectedElementProps})
        }
        else // Fallback for when element selected only after entering in AnimeMode
        {
          if(isObjectEmpty(this.state.selectedElementPropsTemp)) // Once
          {
            this.setState({selectedElementPropsTemp : selectedElementProps})
          }
        }




        // selected element flow
        this.getSelectedElementFlow();

        // selected element interactions
        this.getSelectedElementInteractions();

        // select element animations
        this.requestCustomAnimations();
        
      })
    }


    getSelectedElementValues=(id)=>
    {
      var idSelector = "#"+id;
      var selectedElement = this.props.awa.getSvgInstance().findOne(idSelector);

      // Get props values : Set
      var elementType = selectedElement.type;
      var elementName = selectedElement.m_name;
      var elementPosX = selectedElement.x().toFixed(2);
      var elementPosY = selectedElement.y().toFixed(2);
      var elementSizeX = selectedElement.width().toFixed(2);
      var elementSizeY = selectedElement.height().toFixed(2);
      var elementScale = selectedElement.transform().scaleX || 1;
      var elementRotation = selectedElement.transform().rotate || 0;
      var elementFill = selectedElement.fill();
      var elementStroke = selectedElement.stroke();
      var elementStrokeWidth = selectedElement.attr("stroke-width") || 0;
      var elementStrokeDasharray = selectedElement.attr("stroke-dasharray") || '0';
      var elementStrokeDashoffset = selectedElement.attr("stroke-dashoffset") || 0;
      var elementOpacity = selectedElement.opacity() || 1;
      var elementEffects = selectedElement.effects() || [];

      var selectedElementProps = 
      {
        id : id,
        type : elementType,
        name : elementName,
        x : elementPosX,
        y : elementPosY,
        width : elementSizeX,
        height : elementSizeY,
        scale : elementScale,
        rotation : elementRotation,
        fill : elementFill,
        stroke : elementStroke,
        strokeWidth : elementStrokeWidth,
        opacity : elementOpacity,
        d : isElementPath(elementType) ? selectedElement.m_pathString : null,
        strokeDasharray : elementStrokeDasharray,
        strokeDashoffset : elementStrokeDashoffset,
        effects : elementEffects

      }

      return selectedElementProps;

    }

    onNewCustomAnimation = ()=>{

      awaEventEmitter.on(awaEvents.NEW_CUSTOM_ANIMATION, (_data)=>{
   
        // Rerender
        this.requestCustomAnimations();
  
      })
    }
      

    getSelectedElementFlow = ()=>{
 
      if(!this.state.selectedElementId) return;

      var selectedElementFlow = this.props.awa.getElementFlow(this.state.selectedElementId);
     
      this.setState({selectedElementFlow})

    }

    getSelectedElementInteractions = ()=>{
 
      if(!this.state.selectedElementId) return;

      var selectedElementInteractions = this.props.awa.getElementInteractions(this.state.selectedElementId);
     
      this.setState({selectedElementInteractions})

    }

    onInputValueChanged = (e)=>{

      var _name = e.target.name;
      var _value = e.target.value;
      var _type = e.target.type;

      if(_type == 'number' || _type == 'range') 
      {
        _value = parseFloat(_value);
      };
      
      this.updatePropsProperty(_name, _value);

    }


    onInputValueBlured = (e)=>{

      var _name = e.target.name;
      var _value = e.target.value;
      var _type = e.target.type;

      if(_type == 'number' ) 
      {
        _value = parseFloat(_value);
      };
        
      this.updateElementProperty(_name, _value);

    }


    initDasharrayFieldsBehaviour()
    {
      const dasharrayInputFields = document.querySelectorAll('.dasharrayInput');
      // Add event listeners to enable/disable input fields based on the previous one
      dasharrayInputFields.forEach((input:any, index:number) => {
        input.addEventListener('input', () => {
          if (input.value) {
            // If the current input is filled, enable the next one
            const nextInput : any = dasharrayInputFields[index + 1];
            if (nextInput) {
              nextInput.removeAttribute('disabled');
              nextInput.focus();
            }
          } else {
            // If the current input is not filled, disable all subsequent ones
            for (let i = index + 1; i < dasharrayInputFields.length; i++) {
              dasharrayInputFields[i].setAttribute('disabled', 'disabled');
            }
          }
        });


        input.addEventListener('keydown', (event) => {
          if (event.key === 'Backspace' && input.value === '' && index > 0) {
            const prevInput : any = dasharrayInputFields[index - 1];
            prevInput.focus();
          } 
          else if (event.key === 'ArrowLeft' && index > 0 && input.selectionStart === 0) {
            const prevInput : any = dasharrayInputFields[index - 1];
            prevInput.focus();
          } else if (event.key === 'ArrowRight' && index < dasharrayInputFields.length - 1 && input.selectionStart === input.value.length) {
            const nextInput : any = dasharrayInputFields[index + 1];
            nextInput.focus();
          }
        });

      });
    }

    onStrokeDasharrayValueBlurred = (e)=>{

      this.updateElementProperty("strokeDasharray", this.state.selectedElementProps.strokeDasharray);

    }

    getStrokeDasharrayValue() {
      // Get the PIN value by concatenating the values of each input
      const strokeDasharrayValue = Array.from(document.querySelectorAll('.dasharrayInput:not([disabled])'))
                        .map((input : any) => input.value)
                        .join(' ');


      this.updatePropsProperty("strokeDasharray", strokeDasharrayValue)

    }
 
    onLineDrawAnime(e)
    {
      if(this.isAppModeDesign()) return;

      var idSelector = "#"+this.props.mainState.selectedElementId;
        
      var selectedElement = this.props.awa.getSvgInstance().find(idSelector)[0];

      var _name = "strokeDashoffset";
      var _value = anime.setDashoffset(selectedElement.node);
      var _initialValue = 0;
      var _isLineDraw = true;
      console.log(_name, _value, _initialValue);
      this.requestAddNewKeyframe(_name, _value, _initialValue, _isLineDraw);
    }

    onSelectFollowPath(e)
    {
      if(this.isAppModeDesign()) return;
      
      this.props.awa.setUserMenuSelectContextFollowPath();
    }

    onSelectMorphToPath(e)
    {
      if(this.isAppModeDesign()) return;
      
      this.props.awa.setUserMenuSelectContextMorphToPath();
    }


    // Process the value to be displayed in the field (according to the selected item or items)
    getSelectedElementsValue(_name)
    {
      if(!this.state.selectedElementsProps.length) return;
      
      var value = this.state.selectedElementsProps[0][_name];

      for (let i = 0; i < this.state.selectedElementsProps.length; i++) 
      {
        const el = this.state.selectedElementsProps[i];
        const val = el[_name];

        if(value != val)
        {
          value = _name == "name" ? "-" : "Mixed";
          break;
        }
        else
        {
          value = val;
        }
      }
      
      return value;
    }

    updatePropsProperty(_name, _value)
    {
      var selectedElementProps = {...this.state.selectedElementProps};

      selectedElementProps[_name] = _value;

      this.setState({selectedElementProps : selectedElementProps})

    }

    updateElementProperty = (_name, _value)=>{

      var animatableProps = Object.keys(ELEMENT_PROPERTIES) // mapping keys from ELEMENT_PROPERTIES
      if(animatableProps.includes(_name))
      {
        if(this.props.awa.isDesignAppMode())
        {
          this.requestUpdateSelectedElementProperty(_name, _value);
        }
        else if(this.props.awa.isAnimeAppMode())
        {
          //Update awa timelines items
          // this.requestUpdateTimelineItems(this.props.mainState.timelineItems)
          // Get initial value for the specific property
          var _initialValue = getPopertyInitialValue(_name,this.state.selectedElementPropsTemp)
          // TODO ? : add keyframe to animation object (get selected animation and update object from awa)
          this.requestAddNewKeyframe(_name, _value, _initialValue);
        }
       
      }

    }

    requestUpdateSelectedElementProperty = (_name : any, _value : any, _removedEffectId:any=null)=>{
      
      awaEventEmitter.emit(awaEvents.UPDATE_SELECTED_ELEMENT_PROPERTY, {property:_name, value:_value, removedEffectId:_removedEffectId})

    }

    requestAddEffectToSelectedElement = (_effect)=>{
      
      awaEventEmitter.emit(awaEvents.ADD_EFFECT_TO_SELECTED_ELEMENT, {effect:_effect})

    }

    requestUpdateTimelineItems = (_timelineItems)=>{

      awaEventEmitter.emit(awaEvents.RESET_TIMELINE_ITEMS, _timelineItems);

    }

    requestAddNewKeyframe = (property, value, initialValue, isLineDraw = false)=>{

      awaEventEmitter.emit(awaEvents.ADD_NEW_KEYFRAME, {property, value ,initialValue, isLineDraw});

    }

    isSelf = (id)=>{
       return this.state.selectedElementId == id;
    }

    // Check if the given canvas id is the selected element's canvas owner
    isSelectedElementCanvasOwner = (_canvasId)=>{

      var id = this.state.selectedElementId;
      var idSelector = "#"+id;
      var selectedElement = this.props.awa.getSvgInstance().findOne(idSelector);

      if(selectedElement.canvasOwnerId() && selectedElement.canvasOwnerId() == _canvasId)
        return true;
       
      return false;

    }

    isStartingFlow =()=>{
      if(!this.props.awa) return false;
      return this.props.awa.isStartingFlow(this.state.selectedElementId)
    }

    createFlow = ()=>{

      this.props.awa.createFlow(this.state.selectedElementId)

      this.getSelectedElementFlow();
    }

    deleteFlow = ()=>{

      this.props.awa.deleteFlow(this.state.selectedElementFlow.id)

      this.getSelectedElementFlow();
    }

    onFlowInputNameBlured = (e)=>{
      
      var newName = e.target.value;
      if(newName.trim() != "")
      {
        this.props.awa.updateFlowName(this.state.selectedElementFlow.id, newName)
      }

      // this.getSelectedElementFlow();

    }


    checkCreateInteractionPossibility =()=>{
      
      if(!this.state.selectedElementId) return false;
      if(!this.props.awa) return false;
      
      var id = this.state.selectedElementId;
      var idSelector = "#"+id;
      
      var selectedElement = this.props.awa.getSvgInstance().findOne(idSelector);

      if(!selectedElement) return false;

      return selectedElement.hasClass(INCANVAS_ITEM_CLASS) //isCanvasChild(selectedElement);

    }

    createNewInteraction = ()=>{

      var id = this.state.selectedElementId;
      var idSelector = "#"+id;
      
      var selectedElement = this.props.awa.getSvgInstance().findOne(idSelector);

      // Generate the interaction id
      var interactionId = this.props.awa.generateInteractionId();

      // source and target are the same
      var source = selectedElement,
          target = selectedElement;
     
      // Create the connection (connector) : useful to create ?
      // this.props.awa.createConnector(source, target, interactionId)

      var basedOnTarget = id;
      var actionTarget = id;
      var basedOnTargetCanvas = selectedElement.canvasOwnerId() || id; // canvas element or the canvas itself
      var actionTargetCanvas = basedOnTargetCanvas;

      // Add interaction
      var interaction = this.props.awa.createInteraction(interactionId, basedOnTarget, basedOnTargetCanvas, actionTarget, actionTargetCanvas)
      this.props.awa.addInteraction(interaction)


      
      // selected element interactions
      this.getSelectedElementInteractions();

    }

    editInteractionName = (e,status)=>{

      e.preventDefault();
      e.stopPropagation();

      console.log("name---")

      e.target.style.userSelect = "auto";

      e.target.setAttribute("contentEditable", status)

      if(status)
      {
        e.target.classList.add("interaction-edit-name")
      }
      else
      {
        e.target.classList.remove("interaction-edit-name")
        e.target.style.userSelect = "none";
        window.getSelection()?.removeAllRanges();
      }

    }

    editInteractionNameBlur = (e,status, interactionId)=>{

      e.preventDefault();
      e.stopPropagation();

      var newName = e.target.textContent;

      e.target.style.userSelect = "auto";

      e.target.setAttribute("contentEditable", status)

      if(status)
      {
        e.target.classList.add("interaction-edit-name")
      }
      else
      {
        e.target.classList.remove("interaction-edit-name")
        e.target.style.userSelect = "none";
        window.getSelection()?.removeAllRanges();

        this.props.awa.updateInteractionName(interactionId, newName)

      }

    }

    interactionNameEditionHandler = (evt, interactionId)=>{

      evt.stopPropagation();
      var newName = evt.target.textContent;
  
      if (evt.key === 'Enter') 
      {
        if(newName.trim() != "")
        {
          this.editInteractionName(evt,false)

          this.props.awa.updateInteractionName(interactionId, newName)
        }
  
      }
  
    }

    updateInteractionStatus = (id, status) =>{

      this.props.awa.updateInteractionStatus(id, status)

    }

    deleteInteraction = (id)=>{

      this.props.awa.deleteInteraction(id);

      // selected element interactions
      this.getSelectedElementInteractions();
    }

    updateInteraction = (id, root, target, value) =>{
      this.props.awa.updateInteraction(id, root, target, value);
    }

    requestCustomAnimations =()=>{

      var animations = this.props.awa.getAnimations();

      this.setState({customAnimations : animations})

    }


  animationDeleteHandler = (_animationName)=>{

    if(this.props.awa.deleteAnimation(_animationName))
    {
      this.requestCustomAnimations();
    }

  }






    render() { 
        return <Box  className='block app-right-block' style={{color:'#fff', position:'relative'}}>
                    
        
        <Tabs.Root defaultValue="inspector-tab" className='Tabs_Root'>
          <Tabs.List className='Tabs_List' >
            <Tabs.Trigger className='Tabs_Trigger' value="inspector-tab" onClick={()=>this.enterNoneAppModeContext()}>
              <Image alt='' src={require("../../assets/icons/inspector_icon_white.png")} className='Tabs_Icon' />
              <Image alt='' src={require("../../assets/icons/inspector_icon.png")} className='Tabs_Icon' />
            </Tabs.Trigger>
            <Tabs.Trigger className='Tabs_Trigger' value="links-tab" onClick={this.enterPrototypeAppModeContext}>
              <Image alt='' src={require("../../assets/icons/links_icon_white.png")} className='Tabs_Icon' />
              <Image alt='' src={require("../../assets/icons/links_icon.png")} className='Tabs_Icon' />
            </Tabs.Trigger>
            <Tabs.Trigger className='Tabs_Trigger' value="code-tab" onClick={this.enterDeveloperAppModeContext}>
              <Image alt='' src={require("../../assets/icons/code_icon_white.png")} className='Tabs_Icon' />
              <Image alt='' src={require("../../assets/icons/code_icon.png")} className='Tabs_Icon' />
            </Tabs.Trigger>
          </Tabs.List>
          <Box id='rightPanTabContainer' pb="2" style={{position:'relative', overflowY:'scroll'}}>
            <Tabs.Content value="inspector-tab" style={{position:'relative'}}>

              <Accordion.Root type="multiple" value={this.state.inspectorAccordionValues} onValueChange={(v)=>this.onInspectorAccordionChange(v)}  /* collapsible={'true'} */ style={{ overflowY:'scroll' }} >

                <Accordion.Item value="properties-accordion" style={{position:'relative'}}>
                  <Accordion.Header style={{position:'relative'}} >
                    <Accordion.Trigger className="AccordionTrigger" style={{position:'relative'}}>
                      <span>Properties</span>
                      <ChevronDownIcon className="AccordionChevron" aria-hidden />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content >
                    <div style={{ position:'relative', display: 'flex', width:'90%', marginLeft:'auto', marginRight:'auto', flexDirection: 'column', gap: 5}}>
                      
                      <div className='awa-form-linegroup'>
                        <label className="Label" >
                          Name
                        </label>
                        <div className='awa-form-group'>
                          <fieldset className="Fieldset" style={{flex:1}}>
                            <input onBlur={(e)=>this.onInputValueBlured(e)} onChange={(e)=>this.onInputValueChanged(e)} style={{width:'100%', textIndent:2, textAlign:'left'}} className="Input" name='name' id="name" value={this.getSelectedElementsValue('name')} onKeyDown={(e)=>{e.stopPropagation()}} />
                          </fieldset>

                          {/* <i className="active-element-btn-option bi bi-unlock" style={{fontSize:13}}></i>
                          <i className="active-element-btn-option bi bi-eye" style={{fontSize:13}}></i> */}

                          </div>
                      </div>
                      
                      <div className='awa-form-linegroup'>
                        <label className="Label" >
                          Position
                        </label>
                        <div className='awa-form-group'>
                          
                          <fieldset className="Fieldset">
                            <i className="inputIcon bi bi-arrow-bar-right"></i>
                            <input onBlur={(e)=>this.onInputValueBlured(e)} type="number" onChange={(e)=>this.onInputValueChanged(e)} className="Input" name='x' id="posX" placeholder={this.getSelectedElementsValue('x')} value={this.getSelectedElementsValue('x')} />
                          </fieldset>
                          <fieldset className="Fieldset">
                            <i className="inputIcon bi bi-arrow-bar-down"></i>
                            <input onBlur={(e)=>this.onInputValueBlured(e)} type="number" onChange={(e)=>this.onInputValueChanged(e)} className="Input" name='y' id="posY" value={this.state.selectedElementProps.y} />
                          </fieldset>

                          </div>
                      </div>

                      <div className='awa-form-linegroup'>
                        <label className="Label" >
                          Size
                        </label>
                        <div className='awa-form-group'>
                          
                          <fieldset className="Fieldset">
                            <i className="inputIcon bi bi-arrows-expand-vertical"></i>
                            <input onBlur={(e)=>this.onInputValueBlured(e)} minLength={0} type="number" onChange={(e)=>this.onInputValueChanged(e)} className="Input" name='width' id="width" value={this.state.selectedElementProps.width} />
                          </fieldset>
                          <fieldset className="Fieldset">
                            <i className="inputIcon bi bi-arrows-expand"></i>
                            <input onBlur={(e)=>this.onInputValueBlured(e)} minLength={0} type="number" onChange={(e)=>this.onInputValueChanged(e)} className="Input" name='height' id="height" value={this.state.selectedElementProps.height} />
                          </fieldset>

                          </div>
                      </div>

                      <div className='awa-form-linegroup'>
                        <label className="Label" >
                          Transform
                        </label>
                        <div className='awa-form-group'>
                          
                          <fieldset className="Fieldset">
                            <i className="inputIcon bi bi-arrow-clockwise"></i>
                            <input onBlur={(e)=>this.onInputValueBlured(e)} type='number' onChange={(e)=>this.onInputValueChanged(e)} className="Input" min={-360} max={360} name='rotation' id="rotation" value={this.state.selectedElementProps.rotation} prefix='°' />
                          </fieldset>
                          <fieldset className="Fieldset">
                            <i className="inputIcon bi-arrow-up-right-square"></i>
                            <input onBlur={(e)=>this.onInputValueBlured(e)} type='number' step={0.1} onChange={(e)=>this.onInputValueChanged(e)} className="Input" min={0} max={100} name='scale' id="scale" value={this.state.selectedElementProps.scale} />
                          </fieldset>

                          </div>
                      </div>


                      <div className='awa-form-linegroup awa-linegroup-container'>
                        <label className="Label" >
                          Fill
                        </label>
                        <div className='awa-form-container'>

                          {/* <div className='awa-form-group awa-form-container-item' style={{marginBottom:20}}>
                            <div className='awa-form-container-item-opts'>
                              <i  className="actionBtn bi bi-plus-square"></i>
                            </div>
                          </div> */}

                          <div className='awa-form-group awa-form-container-item group-triple'>
                            <fieldset className="Fieldset fieldset-container-item">
                              {/* <i className="inputIcon bi bi-paint-bucket"></i> */}
                                <Popover.Root >
                                  <Popover.Trigger asChild>
                                    <div className='Input InputColorContainer'>
                                      <div className='InputColor' style={{backgroundColor:this.state.selectedElementProps.fill}}></div>
                                    </div>
                                  </Popover.Trigger>
                                  <Popover.Portal>
                                    <Popover.Content id='PopoverContentColorPicker' className="PopoverContent" sideOffset={5}>
                                      <ColorPicker className={{opacity:1}} width={250} height={150} value={this.state.selectedElementProps.fill} onChange={(c)=>this.setFillColor(c)}  />
                                    </Popover.Content>
                                  </Popover.Portal>
                                </Popover.Root>
                              
                            </fieldset>
                            <span className='fieldInfo-inline' style={{textTransform:'uppercase'}}>{this.state.selectedElementProps.fill}</span>
                            <div className='awa-form-container-item-opts'>
                              <i className="bi bi-dash-lg propertyOptBtn" style={{fontSize:11, marginRight:2}}></i>
                              <i className="bi bi-eye propertyOptBtn" style={{fontSize:11}}></i>
                            </div>
                          </div>
                           
                        </div>
                        

                      </div>


                      {/* <div style={{width:'100%', height:1, backgroundColor:'#ffffff25', marginTop:5, marginBottom:15}}></div> */}


                      <div className='awa-form-linegroup awa-linegroup-container'>
                        <label className="Label" >
                          Stroke
                        </label>
                        <div className='awa-form-container'>

                          {/* <div className='awa-form-group awa-form-container-item' style={{marginBottom:20}}>
                            <div className='awa-form-container-item-opts'>
                              <i  className="actionBtn bi bi-plus-square"></i>
                            </div>
                          </div> */}

                          <div className='awa-form-group awa-form-container-item group-triple'>
                            <fieldset className="Fieldset fieldset-container-item">
                              {/* <i className="inputIcon bi bi-paint-bucket" style={{marginLeft:-15}}></i> */}
                                <Popover.Root >
                                  <Popover.Trigger asChild>
                                    <div className='Input InputColorContainer'>
                                      <div className='InputColor' style={{backgroundColor:this.state.selectedElementProps.stroke}}></div>
                                    </div>
                                  </Popover.Trigger>
                                  <Popover.Portal>
                                    <Popover.Content id='PopoverContentColorPicker' className="PopoverContent" sideOffset={5}>
                                      <ColorPicker className={{opacity:1}} width={250} height={150} value={this.state.selectedElementProps.stroke} onChange={(c)=>this.setStrokeColor(c)}  />
                                    </Popover.Content>
                                  </Popover.Portal>
                                </Popover.Root>
                              
                            </fieldset>
                            <span className='fieldInfo-inline' style={{textTransform:'uppercase'}}>{this.state.selectedElementProps.stroke}</span>
                            <div className='awa-form-container-item-opts'>
                              <i className="bi bi-dash-lg propertyOptBtn" style={{fontSize:11, marginRight:2}}></i>
                              <i className="bi bi-eye propertyOptBtn" style={{fontSize:11}}></i>
                            </div>
                          </div>

 
                        </div>
                        

                      </div>


                      {/* <div style={{width:'100%', height:1, backgroundColor:'#ffffff25', marginTop:5, marginBottom:15}}></div> */}
                   


                      {/* Color | Image | Video */}
                      <div className='awa-form-linegroup awa-linegroup-container'>
                        <label className="Label FieldTitle">
                          Background
                        </label>
                        <div className='awa-form-container'>

                          <div className='awa-form-group awa-form-container-item group-triple'>
                            <fieldset className="Fieldset fieldset-container-item">

                              <label htmlFor="baseBackground" style={{width:'80%'}}>
                                <div className='Input InputColorContainer'>
                                  <div className='InputColor' style={{backgroundImage:'url("")'}}>
                                  </div>
                                </div>
                              </label>
                              <input style={{display:'none'}} type="file" name="" id="baseBackground" />
                              
                            </fieldset>
                            <span className='fieldInfo-inline' style={{textTransform:'uppercase'}}>{this.state.selectedElementProps.stroke}</span>
                            <div className='awa-form-container-item-opts'>
                              <i className="bi bi-eye propertyOptBtn" style={{fontSize:11}}></i>
                            </div>
                          </div>

 
                        </div>
                        

                      </div>


                      <div className='awa-form-linegroup'>
                        <label className="Label" >
                        </label>
                        <div className='awa-form-group'>
                          {/* STROKE WIDTH */}
                          <fieldset className="Fieldset">
                            <i className="inputIcon bi bi-border-width" style={{transform:'scale(-1)'}}></i>
                            <input className="Input"  type="number" onBlur={(e)=>this.onInputValueBlured(e)}  onChange={(e)=>{this.onInputValueChanged(e); this.onInputValueBlured(e)}} name='strokeWidth' value={this.state.selectedElementProps.strokeWidth} />
                          </fieldset>

                          {/* STROKE COVERAGE */}

                          <fieldset className="Fieldset">
                            <i className="inputIcon bi bi-border-all" style={{transform:'scale(1)'}}></i>
                            <select className='Input'>
                              <option>all</option>
                              <option>top</option>
                              <option>left</option>
                              <option>right</option>
                              <option>bottom</option>
                              <option>custom</option>
                            </select>
                          </fieldset>

                          </div>
                      </div>

                      <div className='awa-form-linegroup' style={{marginBottom:5}}>
                        <label className="Label" >
                          Dash
                        </label>
                        {/* STROKE DASH-ARRAY PREVIEW */}
                        <div className='awa-form-group'>
                          <fieldset className="Fieldset Fieldset-full">
                            {/* <i className="inputIcon bi bi-border-style" style={{transform:'scale(1)', marginBottom:8}}></i> */}
                            <svg width={'100%'} height={10} style={{marginLeft:'0%'}}>
                              <line x1="0" y1="0" x2="100%" y2="0" strokeWidth={7} stroke="#fff" strokeDasharray={this.state.selectedElementProps.strokeDasharray} />
                            </svg>
                          </fieldset>
                        </div>
                      </div>

                      {/* STROKE DASHARRAY */}
                      <div className='awa-form-linegroup'>
                        <label className="Label" >
                        </label>
                         
                        <div className='awa-form-group'>
                          
                          <fieldset className="Fieldset Fieldset-four">
                           
                            <input className="Input dasharrayInput" type='number' name='strokeDasharray' min={0} minLength={0} maxLength={4} onChange={(e:any)=>this.getStrokeDasharrayValue()} onBlur={(e:any)=>this.onStrokeDasharrayValueBlurred(e)}   />
                            <input className="Input dasharrayInput" type='number' name='strokeDasharray' min={0} minLength={0} maxLength={4} onChange={(e:any)=>this.getStrokeDasharrayValue()} onBlur={(e:any)=>this.onStrokeDasharrayValueBlurred(e)}  disabled />
                            <input className="Input dasharrayInput" type='number' name='strokeDasharray' min={0} minLength={0} maxLength={4} onChange={(e:any)=>this.getStrokeDasharrayValue()} onBlur={(e:any)=>this.onStrokeDasharrayValueBlurred(e)}  disabled />
                            <input className="Input dasharrayInput" type='number' name='strokeDasharray' min={0} minLength={0} maxLength={4} onChange={(e:any)=>this.getStrokeDasharrayValue()} onBlur={(e:any)=>this.onStrokeDasharrayValueBlurred(e)}  disabled />
                           
                          </fieldset>

                          </div>
                      </div>

                      {/* STROKE DASH OFFSET */}
                      <div className='awa-form-linegroup'>
                        <label className="Label" >
                        </label>
                        <div className='awa-form-group'>
                          
                          <fieldset className="Fieldset" >
                            <i className="inputIcon bi bi-distribute-horizontal" ></i>
                            <input  type="number" onChange={(e)=>{this.onInputValueBlured(e); this.onInputValueChanged(e)}} style={{width:'100%', textIndent:2, textAlign:'center'}} className="Input" name='strokeDashoffset' id="strokeDashoffset" value={this.state.selectedElementProps.strokeDashoffset} />
                          </fieldset>
                          <fieldset className="Fieldset" >
                            <Button className={`inputBtn  ${this.isAppModeDesign() ? "inputBtnDisabled" : ""}`} onClick={(e)=>this.onLineDrawAnime(e)} size={'1'}  >Draw</Button> 
                          </fieldset>
                          </div>
                      </div>

                      <div className='awa-form-linegroup'>
                        <label className="Label" >
                          Opacity
                        </label>
                        <div className='awa-form-group'>
                          
                          <fieldset className="Fieldset SingleFieldSet">
                            <i className="inputIcon " style={{color:'#fff', fontSize:12, fontStyle:'normal'}}>{this.state.selectedElementProps.opacity || 0}</i>
                            <div style={{position:'absolute', width:'70%', marginLeft:'20%', height:3, backgroundColor:'#ffffff44', borderRadius:10}}></div>
                            <input onChange={(e)=>{this.onInputValueChanged(e); this.onInputValueBlured(e)}} name='opacity' className="Input awa-range-input" style={{position:'relative', width:'50%', marginLeft:0, paddingLeft:25}} type='range' min={0} step={0.1} max={1} value={this.state.selectedElementProps.opacity}  />
                          </fieldset>

                          </div>
                      </div>
                      
                      {/* FOLLOW PATH */}
                      <div className='awa-form-linegroup'>
                          <label className="Label" ></label>
                          <div className='awa-form-group'>
                            <fieldset className="Fieldset"  style={{flex:0.45}} >
                              {/* <i className="inputIcon bi bi-bezier2" ></i> */}
                              <Button className={`inputBtn  ${this.isAppModeDesign() ? "inputBtnDisabled" : ""}`} style={{textAlign:'left', textIndent:0}} onClick={(e)=>this.onSelectFollowPath(e)} size={'1'}  >Follow</Button> 
                            </fieldset>
                            <fieldset className="Fieldset"  style={{flex:0.45}} >
                              {/* <i className="inputIcon bi bi-balloon-heart" ></i> */}
                              <Button className={`inputBtn inputBtnVariant2  ${(!this.isAppModeDesign() && this.state.selectedElementProps.type == "path") ? "" : "inputBtnDisabled"}`} style={{textAlign:'left', textIndent:0}} onClick={(e)=>this.onSelectMorphToPath(e)} size={'1'}  >MorphTo</Button> 
                            </fieldset>
                          </div>
                      </div>


                      <div className='awa-form-linegroup' style={{justifyContent:'space-between', marginBottom:2}}>

                        <label className="Label" >
                          Effects
                        </label>
 
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <i  className="actionBtn bi bi-plus-square"></i>
                          </DropdownMenu.Trigger>

                          <DropdownMenu.Portal>
                            <DropdownMenu.Content className="DropdownMenuContent" sideOffset={5}>
                              <DropdownMenu.Item className="DropdownMenuItem" onClick={(e)=>this.onAddEffectToElement(ELEMENT_EFFECTS.dropShadow)}>
                                Drop shadow  
                              </DropdownMenu.Item>
                              <DropdownMenu.Item className="DropdownMenuItem" onClick={(e)=>this.onAddEffectToElement(ELEMENT_EFFECTS.innerShadow)}>
                                Inner shadow
                              </DropdownMenu.Item>
                              <DropdownMenu.Item className="DropdownMenuItem" onClick={(e)=>this.onAddEffectToElement(ELEMENT_EFFECTS.blur)}>
                                Blur
                              </DropdownMenu.Item>
                              <DropdownMenu.Item className="DropdownMenuItem" onClick={(e)=>this.onAddEffectToElement(ELEMENT_EFFECTS.inset)}>
                                Inset
                              </DropdownMenu.Item>
                              <DropdownMenu.Arrow className="DropdownMenuArrow" />
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>

                      </div>
                      <div className='awa-form-linegroup'>

                        <Accordion.Root className='effectAccordionRoot' type="multiple" value={this.state.effectsAccordionValues} onValueChange={(v)=>this.onEffectsAccordionChange(v)}  /* collapsible={'true'} */ style={{ overflowY:'scroll', width:'100%' }} >

                          {this.state.selectedElementProps.effects && this.state.selectedElementProps.effects.map((effect,index)=>{

                            return <Accordion.Item key={index} value={effect.id} style={{position:'relative'}}>
                              <Accordion.Header style={{position:'relative'}} >
                                <Accordion.Trigger className="AccordionTrigger effectTrigger" style={{position:'relative', justifyContent:'space-betwen'}}>
                                  <span>{effect.name}</span>
                                  <div style={{display:'flex', alignItems:'center'}}>
                                    <DeleteOutlined className='effectDeleteIcon' onClick={(e)=>this.onRemoveEffectFromElement(effect.id)} />
                                    <EyeOutlined className='effectToggleIcon' />
                                    <ChevronDownIcon className="AccordionChevron effectChevron" aria-hidden />
                                  </div>
                                </Accordion.Trigger>
                              </Accordion.Header>
                              <Accordion.Content >
                                <div style={{ position:'relative', display: 'flex', width:'90%', alignItems:'baseline', marginLeft:'auto', marginRight:'auto', flexDirection: 'column', gap: 5, paddingBottom:5, paddingTop:0, marginBottom:15, marginTop:10}}>
                                    <fieldset className="Fieldset Fieldset-four" style={{width:'100%'}}>
                                      
                                        <div className='effectInputBox' style={{visibility: effect.name != 'Inset' ? 'visible' : 'hidden'}} >
                                          <label className="Label effectLabel" >x</label>
                                          <input className="Input effectInput" type='number' name='strokeDasharray' minLength={0} maxLength={4} onChange={(e)=>{this.setEffectPropValue(effect.id, "x", parseFloat(e.target.value))}} onBlur={(e)=>{this.setEffectPropValue(effect.id, "x", parseFloat(e.target.value))}} value={effect.properties.x}   />
                                        </div>
                                        <div className='effectInputBox' style={{visibility: effect.name != 'Inset' ? 'visible' : 'hidden'}} >
                                          <label className="Label effectLabel" >y</label>
                                          <input className="Input effectInput" type='number' name='strokeDasharray' minLength={0} maxLength={4} onChange={(e)=>{this.setEffectPropValue(effect.id, "y", parseFloat(e.target.value))}} onBlur={(e)=>{this.setEffectPropValue(effect.id, "y", parseFloat(e.target.value))}} value={effect.properties.y}   />
                                        </div>
                                    
                                        <div className='effectInputBox' style={{visibility: effect.name != 'Blur' ? 'visible' : 'hidden'}} >
                                          <label className="Label effectLabel" >{effect.name == 'Inset' ? 'depth' : 'spread'}</label>
                                          <input className="Input effectInput" type='number' name='strokeDasharray' minLength={0} maxLength={4} onChange={(e)=>{this.setEffectPropValue(effect.id, "spread", parseFloat(e.target.value))}} onBlur={(e)=>{this.setEffectPropValue(effect.id, "spread", parseFloat(e.target.value))}}  value={effect.properties.spread}  />
                                        </div>
                                        <div className='effectInputBox' style={{flex:2, marginTop:5 , visibility: effect.name != 'Blur' ? 'visible' : 'hidden'}}  >
                                          <label className="Label effectLabel" >color</label>
                                          <Popover.Root>
                                            <Popover.Trigger asChild>
                                              <div className='Input InputColorContainer'>
                                                <div className='InputColor effectInputColor' style={{backgroundColor:this.state.selectedElementProps.stroke}}></div>
                                              </div>
                                            </Popover.Trigger>
                                            <Popover.Portal>
                                              <Popover.Content id='PopoverContentColorPicker2' className="PopoverContent" sideOffset={5}>
                                                <ColorPicker className={{}} width={250} height={150} value={effect.properties.color}  onChange={(c)=>this.setEffectPropValue(effect.id, "color", rgbToHex(c))}  />
                                              </Popover.Content>
                                            </Popover.Portal>
                                          </Popover.Root>

                                        </div>
                                       
                                    </fieldset>
                                </div>
                              </Accordion.Content>
                            </Accordion.Item>
                          })
                            
                          }
                        </Accordion.Root>

                      </div>
 

                    </div>
                  </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item value="animations-accordion">
                  <Accordion.Header>
                    <Accordion.Trigger className="AccordionTrigger">
                      <span>Animations</span>
                      <ChevronDownIcon className="AccordionChevron" aria-hidden />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content>
                    <div style={{ position:'relative', fontSize:12, fontFamily:'Montserrat', display: 'flex', width:'90%', marginLeft:'auto', marginRight:'auto', flexDirection: 'column', gap: 5 }}>
                      <Ant.List
                        dataSource={sortAnimationsByName(this.state.customAnimations)}
                        renderItem={(item:any) => (
                          <Ant.List.Item className='element-animation-list-item' key={item.id}>
                            
                            <span className='element-animation-list-item-icon'>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16" fill="none">
                                <path d="M3.76 6H18V14H2V2.47L3.76 6ZM20 0H16L18 4H15L13 0H11L13 4H10L8 0H6L8 4H5L3 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V0Z" fill="#323232"/>
                              </svg>
                            </span>
                            
                            <Ant.List.Item.Meta className='element-animation-list-item-name'
                              title={<span /* contentEditable */ onKeyDown={(e)=>e.stopPropagation()} >{item.name}</span>}
                            />
                            <TrashIcon onClick={()=>this.animationDeleteHandler(item.name)} className='element-animation-list-item-opt' />
                          </Ant.List.Item>
                        )}
                        locale={{emptyText: 'No animation'}}
                      />
                    </div>
                  </Accordion.Content>
                </Accordion.Item>

              </Accordion.Root>


            </Tabs.Content>

            <Tabs.Content value="links-tab" >
               
                <div className={`FlowBox ${this.state.selectedElementId && isCanvasElement(this.state.selectedElementId) ? "" : "FlowBoxDisabled" }`}>
                  <div className='awa-form-linegroup'>
                    <label className="Label" >
                      Flow
                    </label>
                    <div className='awa-form-group'>
                      
                      <fieldset className="Fieldset" style={{flex:1, height:30}}>
                        {this.state.selectedElementId && isCanvasElement(this.state.selectedElementId) &&
                          <div style={{display:'flex',}}>
                          <input  onBlur={(e)=>this.onFlowInputNameBlured(e)} /* onChange={(e)=>this.onFlowInputNameChanged(e)} */ style={{width:'100%', textIndent:2, textAlign:'left'}} className={`Input flowNameInput ${this.state.selectedElementFlow ? "" : "flowNameInputHidden" }`} name='name' id="name" defaultValue={this.state.selectedElementFlow?.name} onKeyDown={(e)=>{e.stopPropagation()}} />
                          <Button title='Create flow' className='flowBtn' onClick={()=>{this.state.selectedElementFlow ? this.deleteFlow() : this.createFlow()}} size="1">
                            {this.state.selectedElementFlow ? <MinusIcon /> : <PlusIcon />}
                          </Button>
                        </div>}
                      

                      </fieldset>
                      </div>
                  </div>
                </div>


              <div className='InteractionsBox'>
                <div className='awa-form-linegroup'>
                  <label className="Label" >
                    Interactions
                  </label>
                </div>
              </div>

              <Accordion.Root type="multiple" /* value={this.state.inspectorAccordionValues} onValueChange={(v)=>this.onInspectorAccordionChange(v)} */  /* collapsible={'true'} */ style={{ overflowY:'scroll'}} >

              {this.state.selectedElementInteractions.map((int,ind)=>

                <Accordion.Item key={ind} value={`${int.id}-${ind}`} className='interaction-box'>
                  <Accordion.Header>
                    <Accordion.Trigger className="AccordionTrigger AccordionTriggerInteraction">
                          
                      <div className='AccordionHeaderBox'>
                        <Cross2Icon className="AccordionDeleteInteraction" onClick={()=>this.deleteInteraction(int.id)} aria-hidden />
                        <span className='interaction-editable' defaultValue={int.name} onDoubleClick={(e)=>this.editInteractionName(e,true)} onBlur={(e)=>this.editInteractionNameBlur(e,false, int.id)} onKeyDown={(e)=>this.interactionNameEditionHandler(e,int.id)} >{int.name}</span>
                      </div>

                      <div className='AccordionOptionsBox'>
                        <Switch.Root className="SwitchRootInteraction" onCheckedChange={(v)=>this.updateInteractionStatus(int.id, v)} defaultChecked={int.active} onClick={(evt)=>{evt.stopPropagation()}}>
                          <Switch.Thumb className="SwitchThumbInteraction" />
                        </Switch.Root>
                        <ChevronDownIcon className="AccordionChevron" aria-hidden />
                      </div>
                    
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content>
                    <div style={{ position:'relative', fontSize:12, fontFamily:'Montserrat', display: 'flex', width:'90%', marginLeft:'auto', marginRight:'auto', flexDirection: 'column', gap: 10 }}>
                      
                      <div className='awa-form-interaction-linegroup' >
                        <label className="Label" >
                          Based on
                        </label>
                        <div className='awa-form-interaction-group'>
                          <Ant.Tooltip /* title="event" */>
                            <fieldset className="Fieldset" title="event" >
    
                              <i className="inputIcon bi bi-lightning-charge-fill" style={{color:'#DA2F74', fontSize:13}}></i>

                              <select defaultValue={int.basedOn.event} onChange={(evt)=>this.updateInteraction(int.id, INTERACTION_BASED_ON_REF, INTERACTION_EVENT_REF, evt.target.value)} className='Input basicSelect'>
                                {Object.keys(awaEvents.CANVAS_EVENTS).map((ev, i)=>
                                    <option value={ev} key={i}>{ev}</option>
                                  )
                                }
                              </select>
                            </fieldset>
                          </Ant.Tooltip>
                          </div>
                      </div>

                      <div className='awa-form-interaction-linegroup' >
                        <div className='awa-interaction-action-header'>
                          <label className="Label" >
                            Action
                          </label>
                          <fieldset className="Fieldset">
                            <select defaultValue={int.action.type} onChange={(evt)=>this.updateInteraction(int.id, INTERACTION_ACTION_REF, INTERACTION_TYPE_REF, evt.target.value)} className='Input actionTypeSelect'>
                              {NATIVE_ACTIONS.map((act,i)=>
                                <option value={act} key={i}>{act}</option>
                              )
                              }
                            </select>
                          </fieldset>
                        </div>
                        
                        <div style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
                          <div className='awa-form-interaction-group half'>
                            <Ant.Tooltip /* title="target" */>
                            <fieldset className="Fieldset" title="target">
                              <i className="inputIcon bi bi-crosshair" style={{color:'#DA2F74', fontSize:13}}></i>
                              <select defaultValue={int.action.target} onChange={(evt)=>this.updateInteraction(int.id, INTERACTION_ACTION_REF, INTERACTION_TARGET_REF, evt.target.value)} className='Input basicSelect'>
                                <option value={"none"} >none</option>
                                <option value={this.state.selectedElementId} >self</option>
                                {this.state.sceneElements.map((el,i)=>
                                  {
                                    if(!this.isSelf(el.attr("id")) && !this.isSelectedElementCanvasOwner(el.attr("id")))
                                    return <option value={el.attr("id")} key={i} >{el.m_name}</option>
                                  }
                                )
                                }
                              </select>
                            </fieldset>
                            </Ant.Tooltip>
                          </div>
                          <div className='awa-form-interaction-group half half-end'>
                            <Ant.Tooltip /* title="animation" */>
                            <fieldset className="Fieldset"  title="animation" >
                              <i className="inputIcon bi bi-film" style={{color:'#DA2F74', fontSize:11}}></i>
                              <select defaultValue={int.action.animation} onChange={(evt)=>this.updateInteraction(int.id, INTERACTION_ACTION_REF, INTERACTION_ANIMATION_REF, evt.target.value)} className='Input basicSelect' onFocus={()=>this.requestCustomAnimations()}>
                                {Object.values(NATIVE_ANIMATIONS).map((anim,i)=>
                                  <option value={anim} key={i}>{anim}</option>
                                ) 
                                }
                                {/* Saved animations... */}
                                <option disabled >Custom</option>

                                {sortAnimationsByName(this.state.customAnimations).map((anim,i)=>
                                  <option value={anim.name} key={i}>{anim.name}</option>
                                ) 
                                }

                              </select>
                            </fieldset>
                            </Ant.Tooltip>
                          </div>
                        </div>
                        

                      </div>


                    </div>
                  </Accordion.Content>
                </Accordion.Item>
 
                )}


               

              </Accordion.Root>
 
                <Button className={`interactionBtn interactionBtnCreate ${this.checkCreateInteractionPossibility() ? "" : "interactionBtnDisabled"}`} onClick={()=>this.createNewInteraction()} title='New interaction' size={'2'}>
                  New interaction <PlusIcon />
                </Button>

            </Tabs.Content>

            <Tabs.Content value="code-tab">
              <Text size="1">code section</Text>
            </Tabs.Content>
          </Box>
        </Tabs.Root>

        
      </Box>
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
  
  
  export default connect(mapStateToProps, mapDispatchToProps)(RightPanelComp);
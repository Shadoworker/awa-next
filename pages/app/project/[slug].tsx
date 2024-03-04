import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import * as mainActions from '../../../redux/main/mainActions';
import '@radix-ui/themes/styles.css';
import { Box, Container, Flex, Tabs, Text } from '@radix-ui/themes';
 
// import SVG from '../../assets/vendors/svg'
// import anime from '../../assets/vendors/anime';
// import Loonk from '../../assets/vendors/loonk';
import SVG from '../../../lib/assets/vendors/svg';
import '../../../lib/assets/vendors/svg.draggable';
import '../../../lib/assets/vendors/svg.selectable';
// import '../../../lib/assets/vendors/svg.select';
import '../../../lib/assets/vendors/svg.resize';
import '../../../lib/assets/vendors/svg.filter';
import '../../../lib/assets/vendors/svg.connectable';


import { getTimelineItems} from '../../../lib/awa/awa.anime.utils';

import awa, { APP_MODE } from '../../../lib/awa/awa.core';

import MenubarComp from '../../../components/MenubarComp/MenubarComp';
import LeftPanelComp from '../../../components/LeftPanelComp/LeftPanelComp';
import RightPanelComp from '../../../components/RightPanelComp/RightPanelComp';
import TimelineBoxComp from '../../../components/TimelineBoxComp/TimelineBoxComp';

import awaEvents, { awaEventEmitter } from '../../../lib/awa/awa.events';
import anime from '../../../lib/assets/vendors/anime';
import { EFFECT_ID_BODY, MEDIA_PICKER_TYPES, TIMELINE_STEP } from '../../../lib/awa/awa.constants';
import { withRouter } from 'next/router';
import ColorPicker from 'react-best-gradient-color-picker';

import Card from '@mui/material/Card';
import { Button, CardActions, CardContent, CardMedia, IconButton } from '@mui/material';
import { Typography } from 'antd';
import { PlayIcon, UploadIcon } from '@radix-ui/react-icons';
import { initBg, isMediaImage, isMediaVideo, mediaToBase64 } from '../../../lib/awa/awa.common.utils';


class AppPage extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      index : 0,
      awa : null,
      timeline : null,
      loonkInstance : null,
      svgInstance : null,
      // timelineItems : this.props.mainState.timelineItems,

      timelineTime : this.props.mainState.timelineTime,


      toggleColorPicker : false,
      toggleMediaPicker : false,
      colorType : 'fill',
      colorPickerColor : '#fff',

      mediaPickerType : "image",
      mediaPickerMedia : null

    };
  }

 
  componentDidMount(){


    // Body height
    var awaBody : any = document.querySelector('.awa-body');
    awaBody.style.height = (window.innerHeight - 47)+"px";
    // Timeline Slider
    var timelineSlider = document.querySelector('.timeline-handle');
    var timelineProgressbar : any = document.querySelector('.timelineProgressbar');
    var timelineProgressbarLength = 400//timelineProgressbar.getBoundingClientRect().width;
 

    var awaInstance = new awa(this.props.mainActions,this.props.mainState);
    var m_svgInstance = awaInstance.m_svgInstance;
    var m_loonkInstance = awaInstance.m_loonkInstance;
    var m_timeline = awaInstance.m_timeline;
  

    // Set timeline update method
    m_timeline.update = (anim)=>{this.timelineOnUpdate(anim, m_timeline, timelineSlider, timelineProgressbarLength)}
    
    this.setState({awa : awaInstance});
    this.setState({loonkInstance : m_loonkInstance});
    this.setState({svgInstance : m_svgInstance});

    // Create manually svgjs native elements or bootstrap methods to create them in Loonkvg
    // var rect = m_svgInstance.rect(75,75).attr({
    //   x : 140,
    //   y : 30,
    //   fill: '#f06',
    //   id : 'rect_1',
    //   // stroke:'#000',
    //   // 'stroke-width' : 1,
    //   // 'stroke-dasharray' : '500'
    //   // class:'awa-element-rect'

    // })

    // var rect2 = m_svgInstance.rect(45,45).attr({
    //   x : 300,
    //   y : 170,
    //   fill: '#a16',
    //   id : 'rect_2',

    // })

    // console.log(rect)
    // rect.rotate(0)
    
    // var ellipse = m_svgInstance.ellipse(80, 80).attr({
    //   cx : 150,
    //   cy : 170,
    //   fill: '#ecaf2b',
    //   id:'ellipse_1',
    // })

    // var ellipse2 = m_svgInstance.ellipse(60, 60).attr({
    //   cx : 523,
    //   cy : 200,
    //   fill: '#acef2b',
    //   id:'ellipse_2',
    // })


    // var ellipseGroup = m_svgInstance.group().attr({id:'ellipseGroup_1'});
    // var ellipseGroup2 = m_svgInstance.group().attr({id:'ellipseGroup_2'});
    // ellipseGroup.add(ellipse)
    // ellipseGroup2.add(ellipse2)


    // var path = m_svgInstance.path("M 274.2967 322.0237 C 274.2967 322.0237 303.2967 374.0237 303.2967 374.0237 C 303.2967 374.0237 365 380 353.2967 331.0237 C 304 305 338 357 274.2967 322.0237")
    // .attr({
    //   fill:"none",
    //   id:"path_1",
    //   stroke:'#000',
    //   'stroke-width' : 3,
    //   // 'stroke-dasharray' : '4 1000',
    // })

    // var path2 = m_svgInstance.path("M 339 164 C 313 199 331 228 393 250 C 460 264 492 221 469 141 C 376 189 364 135 339 164")
    // .attr({
    //   fill:"orange",
    //   id:"path_2",
    //   stroke:'#000',
    //   'stroke-width' : 3,
    //   // 'stroke-dasharray' : '4 1000',
    // })

    // rect.selectable(m_loonkInstance);
    // path.selectable(m_loonkInstance);
    // path2.selectable(m_loonkInstance);

    // rect.draggable(m_loonkInstance);
    // rect2.draggable(m_loonkInstance);

    // ellipse.draggable(m_loonkInstance);
    // ellipse2.draggable(m_loonkInstance);



    // rect.sele(m_loonkInstance);
    // ellipseGroup.draggable(m_loonkInstance);

    // FILTERS --------------------------------------

    var idEffect = 'rect_1'+EFFECT_ID_BODY+0;
    var idEffect2 = 'rect_1'+EFFECT_ID_BODY+2;

    // rect.effector().chainEffects([
    //   // {name:'Drop Shadow',x:5, y:5, blur:0 , spread : 5,color:'#0000ff'},
    //   {id : idEffect, name:'Inner Shadow', properties : {x:2, y:2, blur:0, spread:0, color:'#000'}},
    //   {id : idEffect2,name:'Inset', properties : {depth:5, color:'#f0f0f0'}},
    //   // {name:'Blur', blur:2},
    // ])


    // var figroup = m_svgInstance.defs()
    // var fi = figroup.first()
    // console.log(fi)

    m_loonkInstance.start();

    // ANIMATIONS ------------------------------------------------------
    // var centered = false;
    // var rotate = true;
    // var _path = anime.path('#path_1',0,centered,rotate);
    // _path.centered = false;
    // _path.rotate = true;

    var rectAnims = {

      targets: "#rect_1",
      easing: 'linear',

      // followPath : [{
      //   value : _path,
      //   duration : 2500,
      //   delay : 0,
      //   keyTime : 0,
      // }]
      
      //   rotate: {
      //     value : pathAngle,
      //     duration : 2500,
      //     delay : 0,
      //     keyTime : 0
      // },
      translateX:[{
          value : 0,
          duration:0,
          delay:0,
          keyTime : 0 

        },{
            value : 310,
            duration:1000,
            delay:0,
            keyTime : 1000 
        }],
        stroke:[{
            value : '#000000',
            duration:0,
            delay:0,
            keyTime : 0 

        },{
            value : '#fff000',
            duration:1000,
            delay:0,
            keyTime : 1000 
        }],
        // strokeWidth:[{
        //     value : 0,
        //     duration:0,
        //     delay:0,
        //     keyTime : 0 

        // },{
        //     value : 10,
        //     duration:1000,
        //     delay:0,
        //     keyTime : 1000 
        // }],
        // strokeDashoffset:[{
        //   value : 500, //anime.setDashoffset,
        //   duration:0,
        //   delay:0,
        //   keyTime : 0 
  
        // },{
        //     value : 0,
        //     duration:1000,
        //     delay:0,
        //     keyTime : 1000 
        // }],
      //   translateY:[{
      //     value : 0,
      //     duration:0,
      //     delay:0,
      //     keyTime : 0 

      //   },{
      //       value : 210,
      //       duration:1000,
      //       delay:0,
      //       keyTime : 1000 
      //   }],
        // scaleX:[{
        //   value : 1,
        //   duration:0,
        //   delay:0,
        //   keyTime : 0 

        // },{
        //     value : 1.5,
        //     duration:1000,
        //     delay:0,
        //     keyTime : 1000 
        // }],

        // width:[{
        //   value : 1,
        //   duration:0,
        //   delay:0,
        //   keyTime : 0 

        // },{
        //     value : 170,
        //     duration:1000,
        //     delay:0,
        //     keyTime : 1000 
        // }],
        // scaleY:[{
        //   value : 1,
        //   duration:0,
        //   delay:0,
        //   keyTime : 0 

        // },{
        //     value : 1.5,
        //     duration:1000,
        //     delay:0,
        //     keyTime : 1000 
        // }],
      // fill:[{
      //     value : '#ff0066',
      //     duration:0,
      //     delay:0,
      //     keyTime : 0 

      // },{
      //     value : '#ecaf2b',
      //     duration:1000,
      //     delay:0,
      //     keyTime : 1000 
      // }],

      // rotate : [
      //   {
      //     value : 0,
      //     duration : 0,
      //     delay : 0,
      //     keyTime : 0
      //   },
      //   {
      //     value : 360,
      //     duration : 1000,
      //     delay : 0,
      //     keyTime : 1000
      //   }
      // ]
    }

    var rectClip = {

      name:'customAnim1',
      animation : {
        targets: "#rect_1",
        easing: 'linear',
        fill:[{
            value : '#ff0066',
            duration:0,
            delay:0,
            keyTime : 0 

        },{
            value : '#2bafec',
            duration:1000,
            delay:0,
            keyTime : 1000 
        }]

      }
    }


    // rect.addClip(rectClip);
    // awaInstance.addAnimation(rectClip)
   


    // var elementsDefs = m_svgInstance.defs(); 

    // var rect = m_svgInstance.rect(75,75).attr({
    //     id : 'rect-def-1',
    //     x : 0,
    //     y : 0,
    //   })

    // rect.selectable(m_loonkInstance);
    // rect.draggable(m_loonkInstance);

    // elementsDefs.add(rect)

    // var pattern = m_svgInstance.pattern(20, 20, function(add) {
      
    //   var image = add.image()
    //    .attr({width:20, height:20})
        
    //    image.node.removeAttribute("href")
    //    image.node.setAttribute("href" , "data:image/webp;base64,UklGRgwFAABXRUJQVlA4TP8EAAAvjIAnEAdiIG2bwP1d6l1cWy2QSdtE90xPQB+yYNDcELpSCSUCAYoe5P9KFlgH8P8xNFwFCXA28rWFekFIt7W9Saw3CDoWMFimogRGp9lwyjlOlfu/LcsXknz8juj/BMCFm8Xz8/PLCrVwNc9OPizY28yzs/PngrPlY0bOF1wVL/eZ1tmKpUWeaX/csLOeZVXmz7wUT1nV9ytGFnlm4EPBxGqemZm/cLCeZ+bON85bZEbnL45bZKY/Om2TG5ctXfaYmX/vsCK3IFu7a5nZuHLXU72Y25DD3bkNTw7LLMyLOpGvUScWqBMLOPN9t/uw7gXkbisIgqDVlaZ9/JVlWf69ETamPYIaNcRJry1N2n6Xx/fb81aGPYIaeeLcRmjOx748/WXRHNS+J4jNvhnb7/LcvT2zgiJ9Qfba0oCPfXn+my2zAlRf6Gx0q3r9KanvluRrUFtCcxBWstuX5P925GtQL4T+INT2/ltq3NmxBLUrKg1CLa9fpVY7FqB2RdVBSNruSs1WPIMaeZUJ0ZLnfexLdzyCGnnCxEZ0xvar1G/BHFTpCzO96MT2t6zw3bhZQZG+MNWLjv2UpqxNyDegNoW5/pFdaQxMWIPaEia3AbyWLlmA2hFGNwB8VQSznkHtCsN72JYOeQQ1Eqa38OGQWUGJPON8fLrjvgBR+sJ8/DgjX4MaCAulO5agtoSNYemKBahdwdkjqKHg7AHUyONsVlCkLxjLC1ADwVi+BrUlOFuC2hWcLUANBWePoEYeZw+gSl8wNitIvmAsL0BtCcbyNahtwdkS1K7gbAFqKDh7BDXyOHsEVTYEY48gtwVjs4LUF4zNCpA7jN0XoAd85WtoFOysTy1RBzYnnlALcOy+0BPwMz+ygt4Lfop5lt0vobnPD4AN9AccVdmvF+jUCzTrhWzUCoSMDa+ur4cUtLkaJOrwLiYg4GmYquO3lL7H0TBVp8cEdBkapOrMNCagyU48UWffUaTHTDxRxDEBPV7iiaKmMQFNVhJFv6NIj5EbpXNEQI+PkdI6jQlosjHVo24o0mPiUukeEtBjYqptQkGThZHSf02RHge3FagBAT0OplUkFDTdN1SVXlOk57zLatSQgJ7zriuaxAQ0XZdUpG4o0uNNjQjoOW5SWRoT0HKbqv6OIhu8qTEBIXNpTMAFbyqhyAZv6oqAkLl0QMAFbyqhSN+oX/eoKwIio34clA4IaPOmEgp83tQVJfLM+XJSOiCgY87OSSqhIDBFvrlJXVH6nhkNYO+mdEBA14wWsHOTSihoGtEHtns3qSuK9Ay4AIAPR6UDAnrV+fIA/yp5t0clFFxU5Usc//hzkrqiyEY1LYnT208npQMCwioaIc5//3WQSihoa/O6oP/fu0ddUeDr8doSOrdfWv7bpYaUyNPR6kP3+4+GnWUTCjo0P0SV//4co64paBK8Dire7vZuUUOK9M8K+qh+++WWaUyADE55HZj5+nXOh3XqhgJ0GweNtoSx7z8n/mCfGpGAfhj2Yfb7z8HfmwumMc3K13+7d1AtUXdO0GqLGteLtF6ocb24dtO0XiTWjN10bc3ATUNbEjg6sSMdumpkRTqEs28sSGK4O56Yll7B6fHErNsYrr8xKBmBwWFiSHoJJkeJCTcx+LycVnU3AKvxdVpFMgK7gztt00uwPJpqSa/B9nVKu43B+OCOkIzA/PBmeiK9HaEOxqPDAVwIAA==")
 
    //  }).attr({id:'rect-def-1-bg'})

    // var rectDefUse = m_svgInstance.use(rect).attr({id: 'rect-def-1-use-1', fill: pattern});
    // var rectDefUse2 = m_svgInstance.use(rect).attr({id: 'rect-def-1-use-2', fill: '#ffffff65'});

    // awaInstance.addInteraction(interaction)

    var ellipseAnims = {

      targets: "#ellipse_1",
      x:[{
        value : 1,
        duration:0,
        delay:0,
        keyTime : 0 

      },{
          value : 170,
          duration:1000,
          delay:0,
          keyTime : 1000 
      }],
      // cx:[{
      //     value : 150,
      //     duration:0,
      //     delay:0, 
      //     keyTime:0
      // },{
      //     value : 250,
      //     duration:1000,
      //     delay:0,
      //     keyTime:1000 
      // } 
      // ],

      // fill:[{
      //     value : '#ecaf2b',
      //     duration:0,
      //     delay:0,
      //     keyTime : 0 

      // },{
      //     value : '#12fa10',
      //     duration:2000,
      //     delay:0,
      //     keyTime : 2000 
      // }]
    }

    var pathAnims = {

      targets: "#path_1",
      strokeDashoffset:[{
        value : anime.setDashoffset,
        duration:0,
        delay:0,
        keyTime : 0 

      },{
          value : 0,
          duration:1000,
          delay:0,
          keyTime : 1000 
      }],

    }

    var filterAnims = {

      targets: '#'+idEffect,
      dx:[{
        value : 2,
        duration:0,
        delay:0,
        keyTime : 0 

      },{
          value : 10,
          duration:500,
          delay:0,
          keyTime : 500 
      }],
      dy:[{
          value : 2,
          duration:0,
          delay:0, 
          keyTime:0
      },{
          value : 10,
          duration:500,
          delay:0,
          keyTime:500 
      } 
      ],

    
    }

    var filter2Anims = {

      targets: '#'+idEffect2,
      flood:[{
        value : '#000000',
        duration:0,
        delay:0, 
        keyTime:0
      },{
          value : '#00ff00',
          duration:1000,
          delay:0,
          keyTime:1000 
      } 
      ],

      // blur:[{
      //   value : 5,
      //   duration:0,
      //   delay:0, 
      //   keyTime:0
      // },{
      //     value : 15,
      //     duration:1000,
      //     delay:0,
      //     keyTime:1000 
      // } 
      // ],

    
    }


    // ADD ANIMS
    // m_timeline.add(rectAnims,0);

    // m_timeline.add(pathAnims,0);
    // m_timeline.add(ellipseAnims,0);
    // m_timeline.add(filter2Anims,0);
    // m_timeline.add(filterAnims,0);

    this.setTimeline(m_timeline);

    // awaInstance.saveProjectChanges();

    this.updateTimelineItems(awaInstance, m_svgInstance, m_timeline)

    // console.log(rect)



    // Listeners -----------------------------
    this.onToggleColorPicker();
    this.onToggleMediaPicker();


  }

  timelineOnUpdate(_anim, _timeline, _slider, _progressbarLength)
  {
    if(!_timeline.completed)
        { 
            var sliderProgress = (_timeline.duration*_timeline.progress/100);
            // m_timelineCurrent = sliderProgress;
            _slider.style.left = `${sliderProgress/TIMELINE_STEP}px`; // 

            // Hide controls
            // this.state.loonkInstance.toggleControls(true);
            
        }
  }

  // setAwaInstance = async (_svgInstance, _timeline)=>
  // {
  //   var svgExport = _svgInstance.svg()

  //   const db = await dbPromise;
  //   const transaction = db.transaction('awaStore', 'readwrite');
  //   const store = transaction.objectStore('awaStore');

  //   var _svgKey = '_svg';

  //   await store.clear();

  //   const savedSvg = await store.get(_svgKey);
  //   // Add data to the store
  //   if(savedSvg == undefined)
  //   {
  //     await store.add({ [_svgKey]: svgExport });
  //   }

  // }


  setTimelineItems(_awaInstance, _timelineItems)
  {
    _awaInstance.resetTimelineItems(_timelineItems);
  }

  updateTimelineItems(_awaInstance, _svgInstance, _timeline)
  {
    var timelineItems = getTimelineItems(_svgInstance, _timeline);
    
    // Set initial timelineItems
    this.setTimelineItems(_awaInstance, timelineItems)
    // console.log(timelineItems)
    // Dispatch timelineItems update
    _awaInstance.dispatchUpdateTimelineItems(timelineItems)
    // this.props.mainActions.setTimelineItems(timelineItems);
    this.setState({timeline : _timeline, timelineItems : timelineItems})

  }


  onToggleColorPicker = ()=>{

    awaEventEmitter.on(awaEvents.TOGGLE_COLOR_PICKER, (_data)=>{
 
      this.setState({toggleColorPicker : !this.state.toggleColorPicker, toggleMediaPicker : false, colorType : _data.type, colorPickerColor : _data.color})

    })
  }

  
  onToggleMediaPicker = ()=>{

    awaEventEmitter.on(awaEvents.TOGGLE_MEDIA_PICKER, (_data)=>{
 
      this.setState({
        toggleMediaPicker : !this.state.toggleMediaPicker, 
        toggleColorPicker : false, 
        mediaPickerType : _data.type || MEDIA_PICKER_TYPES.image, 
        mediaPickerMedia : _data.media || null
      })

    })
  }

  setMediaPickerType = (type)=>{
    this.setState({mediaPickerType : type})
  }

  triggerMediaInput = (e)=>{

    e.preventDefault(); 
    e.stopPropagation(); 
    var input : HTMLInputElement|null = document.querySelector('input#baseBackground');
    input?.click();
  }

  
  handleMediaInput = (e)=>{

    e.preventDefault(); 
    
    var files = e.target.files;
    var file = files[0];

    mediaToBase64(file)
    .then((base64:string)=>{
      // console.log(d)
      var type = base64.includes(MEDIA_PICKER_TYPES.image) ? MEDIA_PICKER_TYPES.image : MEDIA_PICKER_TYPES.video;
      this.setMediaPickerType(type);

      this.setState({mediaPickerMedia : base64})
      this.requestUpdateInputMedia({type : type, media : base64})
    })
    .catch(err=>{
      console.log(err)
    })

  }


  hideColorPicker = (e)=>{

    // e.preventDefault(); 
    // e.stopPropagation(); 

    // if(this.state.toggleColorPicker)
    //   this.setState({toggleColorPicker : false})

  }

  onPickerColorChange=(c:any)=>
  {
    this.setState({colorPickerColor : c})
    this.requestUpdateInputColor({type:this.state.colorType, color : c})
  }

  requestUpdateInputColor = (_data)=>{
    awaEventEmitter.emit(awaEvents.UPDATE_INPUT_COLOR, _data);
  }

  requestUpdateInputMedia = (_data)=>{
    awaEventEmitter.emit(awaEvents.UPDATE_INPUT_MEDIA, _data);
  }

  onRequestReduxStoreUpdate(){

    window.addEventListener(awaEvents.REDUX_STORE_UPDATE, (e:any)=>{
      console.log("Update store")
      var request = e.detail;
      var action = request.action;
      var paylaod = request.paylaod;
      
      this.props.mainActions.updateStoreByAction(action, paylaod)

    }, false)

  }


  setTimeline(_timeline){

      this.setState({timeline : _timeline})
      
  }

  isAppModeDesign = ()=>{

    return this.props.mainState.appMode == APP_MODE.DESIGN;
  }

  isAppModeAnime = ()=>{

    return this.props.mainState.appMode == APP_MODE.ANIME;
  }



   render() {
     return (
       <Flex direction={"column"} className="awa-app-ui" onClick={(e)=>this.hideColorPicker(e)}>
         <Box className="awa-header">
           <MenubarComp awa={this.state.awa} />
         </Box>
         <Box className="awa-body">
           <Flex style={{ height: "100%" }}>
             <Box className="block app-center-block" style={{}}>
               <Flex
                 direction={"column"}
                 width={"100%"}
                 style={{ height: "100%" }}
               >
                 <Box className="block app-central-inner-block" style={{}}>
                   <Flex width={"100%"} style={{ height: "100%" }}>
                     <LeftPanelComp awa={this.state.awa} />
                     <Box className="block app-scene-block">
                       <svg
                         xmlns="http://www.w3.org/2000/svg"
                         className={
                           this.isAppModeAnime() ? "awa-anime-mode" : ""
                         }
                         id="main-loonk-svg"
                         width="0"
                         height="0"
                       ></svg>
                     </Box>
                     
                    {this.state.toggleColorPicker &&
                      <div className='awa-color-picker-box'>
                        <ColorPicker hideAdvancedSliders hideColorGuide hideInputType value={this.state.colorPickerColor} onChange={(c)=>this.onPickerColorChange(c)} />
                      </div>
                    }
                    
                    {this.state.toggleMediaPicker &&
                      <div className='awa-media-picker-box'>
                        <Card sx={{ width: 295 , backgroundColor: '#09090a'}}>
                           
                          {this.state.mediaPickerType == MEDIA_PICKER_TYPES.image &&
                            <label htmlFor="baseBackground">
                              <img style={{ width:'100%', height:270, objectFit:'contain', backgroundColor: "gainsboro"}} src={(this.state.mediaPickerMedia && isMediaImage(this.state.mediaPickerMedia)) ? this.state.mediaPickerMedia : "https://i0.wp.com/roadmap-tech.com/wp-content/uploads/2019/04/placeholder-image.jpg?resize=400%2C400&ssl=1"} alt="image" />
                            </label>
                          }
                          
                          {this.state.mediaPickerType == MEDIA_PICKER_TYPES.video &&
                            <label htmlFor="baseBackground" onClick={(e)=>this.triggerMediaInput(e)}>
                              <video width={"100%"} height={270} controls src={(this.state.mediaPickerMedia && isMediaVideo(this.state.mediaPickerMedia)) ? this.state.mediaPickerMedia : "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} ></video>
                            </label>
                          }
                          
                          <input style={{display:'none'}} type="file" name="" id="baseBackground" onChange={(e)=>this.handleMediaInput(e)} />

                          <CardContent style={{padding:5}}>
                          </CardContent>
                          <CardActions style={{justifyContent:'space-between'}}>
                            {/* <Button size="small" >Image</Button>
                            <Button size="small" >Video</Button> */}
                            <div className="mediaControlBtnWrapper">
                              <div id="media-solid-btn" onClick={()=>this.setMediaPickerType(MEDIA_PICKER_TYPES.image)} className={`mediaControlBtn ${this.state.mediaPickerType == MEDIA_PICKER_TYPES.image ? "mediaControlBtnSelected" : ""}`}>
                                Image
                              </div>
                              <div id="media-gradient-btn" onClick={()=>this.setMediaPickerType(MEDIA_PICKER_TYPES.video)} className={`mediaControlBtn ${this.state.mediaPickerType == MEDIA_PICKER_TYPES.video ? "mediaControlBtnSelected" : ""}`}>
                                Video
                              </div>
                            </div>

                          </CardActions>
                        </Card>
                      </div>
                    }

                   </Flex>
                 </Box>

                  <TimelineBoxComp
                   awa={this.state.awa}
                   timeline={this.state.timeline}
                   loonkInstance={this.state.loonkInstance}
                   timelineItems={this.props.mainState.timelineItems} />
               </Flex>
             </Box>
             <RightPanelComp
               awa={this.state.awa}
               svgInstance={this.state.svgInstance}
             />
           </Flex>
         </Box>

         
       </Flex>
     );
  };
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


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AppPage));

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


import { getTimelineItems, createNewTween} from '../../../lib/awa/awa.anime.utils';

import awa, { APP_MODE, USER_ACTION_STATE } from '../../../lib/awa/awa.core';

import MenubarComp from '../../../components/MenubarComp/MenubarComp';
import LeftPanelComp from '../../../components/LeftPanelComp/LeftPanelComp';
import RightPanelComp from '../../../components/RightPanelComp/RightPanelComp';
import TimelineBoxComp from '../../../components/TimelineBoxComp/TimelineBoxComp';

import awaEvents, { awaEventEmitter } from '../../../lib/awa/awa.events';
import anime from '../../../lib/assets/vendors/anime';
import { EFFECT_ID_BODY, TIMELINE_STEP } from '../../../lib/awa/awa.constants';
import { withRouter } from 'next/router';
import { AwaTypes } from '../../../lib/awa/awa.types';
import ColorPicker from 'react-best-gradient-color-picker';

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
      colorType : 'fill',
      colorPickerColor : '#fff'

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
    var centered = false;
    var rotate = true;
    var _path = anime.path('#path_1',0,centered,rotate);
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
 
      this.setState({toggleColorPicker : !this.state.toggleColorPicker, colorType : _data.type})

    })
  }

  onPickerColorChange=(c:any)=>
  {
    this.setState({colorPickerColor : c})
    this.requestUpdateInputColor({type:this.state.colorType, color : c})
  }

  requestUpdateInputColor = (_data)=>{
    awaEventEmitter.emit(awaEvents.UPDATE_INPUT_COLOR, _data);
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
       <Flex direction={"column"} className="awa-app-ui">
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

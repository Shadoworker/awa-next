import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import * as mainActions from '../../redux/main/mainActions'
import './TimelineBoxComp.css';
import '@radix-ui/themes/styles.css';
import { Box, Button, Flex } from '@radix-ui/themes';
import { LoadingOutlined, PlayCircleOutlined, RetweetOutlined, RollbackOutlined} from '@ant-design/icons';
import { ANIMATABLE_PROPERTIES } from '../../lib/awa/awa.core';
import { BASE_ANIMATION_NAME, EFFECT_ID_BODY, MAIN_ANIM_ID, TIMELINE_STEP } from '../../lib/awa/awa.constants';
import { ChevronRightIcon, DotsVerticalIcon, PlusIcon } from '@radix-ui/react-icons';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import awaEvents, { awaEventEmitter } from '../../lib/awa/awa.events';
import * as Ant from 'antd';
import { getTimelineItems } from '../../lib/awa/awa.anime.utils';

const MIN_TIMELINE_HEIGHT = 27;
const DEFAULT_TIMELINE_HEIGHT = 180;
const MAX_TIMELINE_HEIGHT = 250;

class TimelineBoxComp extends Component<any,any> {

  constructor(props) {
    super(props);
    this.state = {
      index : 0,
      loaded : false,
      timeline : props.timeline,
      timelineItems : [],
      timelineProgress :0,

      selectedElementId : null,

      selectedAnimationName : MAIN_ANIM_ID,
      selectedElementAnimations : [],


      animationOptDropdownOpened : false,
      animationNameValid : true,

    };
  }

 
  componentDidMount(){
 
    setTimeout(() => { // Wait for awa props to be available
  
      this.setState({timeline : this.props.timeline, timelineItems : this.props.awa.getTimelineItems()},() => {
        this.setState({loaded : true})
      })

    }, 100);

    let _self = this;

    var itemsBlock : any = document.querySelector(".keyframesNodesList");
    var keyframesBlock : any = document.querySelector(".keyframesList");
    const resizableBlock : any = document.querySelector('.app-timeline-block');

    const resizableBlockResizer : any = document.querySelector('.app-timeline-block-resizer');
    const resizableBlockResizerSizeSwitcher : any = document.querySelector('.size-switcher');

    const timelineProgressbar : any = document.querySelector('.timelineProgressbar');
    const timelineHandle : any = document.querySelector('.timeline-handle');

    itemsBlock.addEventListener("scroll", function(){

      keyframesBlock.scrollTop = itemsBlock.scrollTop;
    })

    keyframesBlock.addEventListener("scroll", function(){

      itemsBlock.scrollTop = keyframesBlock.scrollTop;
    })

    var initOffset = 0;
    var initHeight = 0;
    
    var timelineBoxXOffset = 0;
    var timelineBoxMaxXOffset = 0;
    var timelineHandleXOffset = 0;
    var timelineHandleInitX = 0;

    // Add an event listener for mouse down
    resizableBlockResizer.addEventListener('mousedown', initResize, false);
    resizableBlockResizerSizeSwitcher.addEventListener('click', switchSize, false);

    timelineHandle.addEventListener('mousedown', initSeekTimeline, false);
    timelineProgressbar.addEventListener('click', setSeekTimeline, false);


    function initResize(e) {
      initOffset = e.clientY;
      initHeight = resizableBlock.getBoundingClientRect().height;
      resizableBlock.classList.remove('toggled-down');
      resizableBlock.classList.remove('toggled-up');

      window.addEventListener('mousemove', resize, false);
      window.addEventListener('mouseup', stopResize, false);
    }
    

    function initSeekTimeline(e) {
      timelineHandleXOffset = e.clientX;
      timelineHandleInitX = timelineHandle.getBoundingClientRect().x;

      timelineBoxXOffset = timelineProgressbar.getBoundingClientRect().x;
      timelineBoxMaxXOffset = timelineProgressbar.getBoundingClientRect().width - 5;
    
      window.addEventListener('mousemove', seekTimeline, false);
      window.addEventListener('mouseup', stopSeekTimeline, false);
    }

    function setSeekTimeline(e) {
      timelineHandleInitX = timelineHandle.getBoundingClientRect().x;

      timelineBoxXOffset = timelineProgressbar.getBoundingClientRect().x;
      timelineBoxMaxXOffset = timelineProgressbar.getBoundingClientRect().width - 5;
     
      var Xdiff = (e.clientX - timelineBoxXOffset);
      var newX = Xdiff;

      if(newX > 0 && newX <= timelineBoxMaxXOffset)
       {
          timelineHandle.style.left = `${newX}px`;
          _self.timelineSetTimelineTime((newX*10))
       } 
    }

    function switchSize(e) {
      
      e.stopPropagation();

      var currentHeight = resizableBlock.getBoundingClientRect().height;
      var newHeight = DEFAULT_TIMELINE_HEIGHT;
      if(currentHeight > MIN_TIMELINE_HEIGHT && currentHeight <= MAX_TIMELINE_HEIGHT)
      {
        newHeight = MIN_TIMELINE_HEIGHT;
  
        resizableBlock.classList.remove('toggled-up');
        resizableBlock.classList.add('toggled-down');

      }
      else
      {
        resizableBlock.classList.remove('toggled-down');
        resizableBlock.classList.add('toggled-up');
      }

      resizableBlock.style.height = `${newHeight}px`;
     
    }

    function resize(e) {

      var Ydiff = (initOffset - e.clientY);
      var newHeight = initHeight + Ydiff;

      if(newHeight > MIN_TIMELINE_HEIGHT && newHeight <= MAX_TIMELINE_HEIGHT)
        resizableBlock.style.height = `${newHeight}px`;
    }

    function stopResize() {
      window.removeEventListener('mousemove', resize, false);
      window.removeEventListener('mouseup', stopResize, false);
    }


    function seekTimeline(e) {

      var Xdiff = (e.clientX - timelineHandleXOffset);
      var newX = timelineHandleInitX + Xdiff - timelineBoxXOffset;

      if(newX > 0 && newX <= timelineBoxMaxXOffset)
      {
        timelineHandle.style.left = `${newX}px`;
        _self.timelineProgressbarOnChange((newX*10));
      }
        

    }

    function stopSeekTimeline() {
      window.removeEventListener('mousemove', seekTimeline, false);
      window.removeEventListener('mouseup', stopSeekTimeline, false);
      _self.timelineMouseup();
    }


    this.onUpdateSelectedElement();
    this.onUpdateTimelineItems();
    this.onNewCustomAnimation();

  }

  // isAnimatableProperty()
  
  /* When an element is selected, moved etc... to be notified and update its visual props */
  onUpdateSelectedElement = ()=>{

    awaEventEmitter.on(awaEvents.UPDATE_SELECTED_ELEMENT, (_data)=>{
      
      if(_data.detail.selectedElementId == null)
      {
        this.setState({selectedElementId : null, selectedElementAnimations : []})
        return;
      }
      // if(!selectedElement) return;
      var id = _data.detail.selectedElementId;
      var elementSelectorId = "#"+id;
      
      var animations = this.props.awa.getElementAnimations(elementSelectorId) //selectedElement.animations();

      this.setState({selectedElementId : id, selectedElementAnimations : animations})
      
    })
  }


  onUpdateTimelineItems = ()=>{

    awaEventEmitter.on(awaEvents.UPDATE_TIMELINE_ITEMS, (_data)=>{
       
      var timelineItems = _data.detail.timelineItems;

      this.setState({timelineItems : timelineItems})

      // Activate animation : This prevent newly created animation to play infinitly  
      this.selectElementAnimation(this.state.selectedAnimationName)
      
    })
  }

  onNewCustomAnimation = ()=>{

    awaEventEmitter.on(awaEvents.NEW_CUSTOM_ANIMATION, (_data)=>{

      var newAnimationName = _data.detail.newAnimationName;
      // Rerender
      this.rerenderAnimation(newAnimationName)

    })
  }
    

  selectElementAnimation = (_name)=>{

    if(!this.state.selectedElementId) return;

    var animationName = _name

    this.setState({selectedAnimationName : animationName})
    // Update in awa
    this.props.awa.setSelectedAnimation(animationName);

    // Element selector 
    var elementSelectorId = "#"+this.state.selectedElementId;
    var element = this.props.awa.getSvgInstance().findOne(elementSelectorId)

    var timeline = this.props.awa.m_timeline;

    if(animationName != MAIN_ANIM_ID) // not the main one
    {

      var animations = this.props.awa.getElementAnimations(elementSelectorId) 

      timeline = null;
      var animation = animations.find(c=>c.name == animationName);
      if(animation)
      {
        var animation = animation.animation;
 
        timeline = element.animationTimeline();
        timeline.remove(elementSelectorId);

        timeline.add(animation, 0)
        //update method : Timeline Slider
        var timelineSlider = document.querySelector('.timeline-handle');
        var timelineProgressbarLength = document.querySelector('.timelineProgressbar')?.getBoundingClientRect().width;

        timeline.update = (anim)=>{this.timelineOnUpdate(anim, timeline, timelineSlider, timelineProgressbarLength)}

        // Update active timeline
        this.props.awa.setActiveTimeline(timeline);

        var timelineItems = getTimelineItems(this.props.awa.getSvgInstance(), timeline);

        this.setState({timelineItems : timelineItems})

      }
    }
    else
    {

      // Get main animations for the active scene
      var mainAnimations = this.props.awa.getMainAnimations(); 
      var mainTimeline = this.props.awa.getTimelineInstance();
      
      // Remove existing
      for (let i = 0; i < mainAnimations.length; i++) {
        const anim = mainAnimations[i];
        var target = anim.targets;
        
        mainTimeline.remove(target);
      }

      // Add new keyframes
      for (let j = 0; j < mainAnimations.length; j++) {
        const animation = mainAnimations[j];
        mainTimeline.add(animation, 0)
      }

      // console.log(mainTimeline)
      var timelineItems = getTimelineItems(this.props.awa.getSvgInstance(), mainTimeline);

      this.setState({timelineItems : timelineItems});

      timeline = mainTimeline;

    }

    this.setTimeline(timeline);

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

  setTimeline(_timeline)
  {
    if(_timeline != null)
    {
      this.setState({timeline : _timeline})
    }
  }


  timelineProgressbarOnChange = (_t)=>{
    // console.log(e.target.value)
    var t = _t;
    if(this.state.timeline != null && t <= this.state.timeline.duration)
    {
        this.state.timeline.seek(t)
    }
  }
 
  timelineSetTimelineTime = (_t)=>{
    
    var t = _t;
    this.state.timeline.seek(t)
    this.props.awa.setTimelineTime(t)
    this.props.loonkInstance.toggleControls()
  }
 
  // Used to reactivate / draw controls for last selected item(s)
  timelineMouseup = ()=>{
    this.props.loonkInstance.reactivatePath()
  }
 
  playTimeline = ()=>{
    if(this.state.timeline)
      this.state.timeline.restart(); // play()
  }

  rerenderAnimation = (newAnimationName)=>{
 
    var elementSelectorId = "#"+this.state.selectedElementId;
    // Re-render
    setTimeout(() => {
      var animations = this.props.awa.getElementAnimations(elementSelectorId) 
  
      this.setState({selectedElementAnimations : animations})

      // Select the created one
      this.selectElementAnimation(newAnimationName);

    }, 100);

  }

  createNewAnimation = ()=>{

    // Element selector 
    var elementSelectorId = "#"+this.state.selectedElementId;

    var animations = this.props.awa.getAnimations();
    var baseAnimationNameMatches = animations.filter(c=>c.name.includes(BASE_ANIMATION_NAME))

    var lastIndex = 0;
    if(baseAnimationNameMatches)
      for (let i = 0; i < baseAnimationNameMatches.length; i++) {
        const animation = baseAnimationNameMatches[i];
        var animationIndex = animation.name.split(BASE_ANIMATION_NAME)[1];

        if(parseInt(animationIndex))
        {
          if(parseInt(animationIndex) > lastIndex) lastIndex = parseInt(animationIndex);
        }
      }

    var newAnimationName = BASE_ANIMATION_NAME+(lastIndex+1);
    var newAnimation =  {

      name:newAnimationName,
      animation : {
        targets: elementSelectorId,
        easing: 'linear',
      }
    };

    // Add animation 
    this.props.awa.addAnimation(newAnimation)

  }

  animationOptOnOpenChange = ()=>{

    this.setState({animationOptDropdownOpened : !this.state.animationOptDropdownOpened, animationNameValid : true})

  }

  animationNameOnChangeHandler = (evt)=>{

    var value = evt.target.value;
    
    var checkExistingAnimation = this.props.awa.getAnimationByName(value);

    this.setState({animationNameValid : true})

    if(value == MAIN_ANIM_ID)
    {
      this.setState({animationNameValid : false})
    }
    else
    {
      if(checkExistingAnimation)
      {
        if(checkExistingAnimation.name != this.state.selectedAnimationName)
        {
          this.setState({animationNameValid : false})
        }
      }      
    }

  }


  animationNameEditionHandler = (evt)=>{

    evt.stopPropagation();
    var newName = evt.target.value;

    if (evt.key === 'Enter') 
    {
      if(this.state.animationNameValid && newName.trim() != "")
      {
        this.props.awa.updateAnimationName(this.state.selectedAnimationName, newName)
        
        this.setState({selectedAnimationName : newName})

        // Rerender
        this.rerenderAnimation(newName)

      }

      this.setState({animationOptDropdownOpened : false, animationNameValid : true})
    }

  }


  animationDeleteHandler = ()=>{

    var animationName = this.state.selectedAnimationName;

    if(this.props.awa.deleteAnimation(animationName))
    {
      // Rerender
      this.rerenderAnimation(MAIN_ANIM_ID)

    }

  }

  render() {

    
    const renderTimelineNodes = this.state.timelineItems && Array.from(Object.values(this.state.timelineItems)).map((node:any, index:number) =>  
          
      <div className='node-node-block' key={index}>
          <div className='node-node-name' style={{position:'absolute', color:'#fff', textIndent : node.targets.includes(EFFECT_ID_BODY) ? 15:5}}> {node.name} </div>
          {Object.values(ANIMATABLE_PROPERTIES).map((animatable, animaIndex)=>
              <div style={{display : node[animatable] ? 'block' : 'none'}} className="node-line-block" key={animaIndex}>
                <div className="node-line-block-item">
                </div>
            </div>
            )
          }

      </div>
    )



    const renderTimelineItems = this.state.timelineItems && Array.from(Object.values(this.state.timelineItems)).map((node:any, index:number) => { 

        return <div className='keyframe-node-block' key={index}>
          
          {Object.values(ANIMATABLE_PROPERTIES).map((animatable : any, animaIndex:number)=>
              <div style={{display : node[animatable] ? 'block' : 'none'}} className="keyframe-line-block" key={animaIndex}>
               <div className="keyframe-line-block-item">
                {node[animatable] && node[animatable].map((tween, _index) =>
                  <div key={_index} className="keyframe-dot"  style={{left : (tween.keyTime/10) + 'px', /* backgroundColor:KEYFRAMES_COLORS[index] */}} ></div>
                )}
              </div>
            </div>
            )
          }

      </div>
      }
    )
  



     return (
       <Box
         className="block app-timeline-block"
         style={{ backgroundColor: "" }}
       >

        {!this.state.loaded &&
          <div className='overlayLoader'>
            <Ant.Spin indicator={<LoadingOutlined style={{ fontSize: 24, color:'#f2f2f2' }} spin />} />
          </div>
        }

         <div className="app-timeline-block-resizer">
           <div className="toggler">
             <i className="bi bi-caret-down-fill size-switcher"></i>
           </div>
         </div>
         <Box className="timelineBox">

           <Flex
             className="timelineOptionsBox"
             style={{ borderRight: "solid 1px gray" }}
            >
              <Box className="timelineControls">
  
                <Box style={{display:'flex', flex:1, justifyContent:'space-around', alignItems:'center'}}>
                  <RollbackOutlined  className='timelineBtn' />
                  {/* <StepBackwardOutlined  className='timelineBtn' /> */}

                  <PlayCircleOutlined id="playBtn" className='timelinePlayBtn'  onClick={this.playTimeline} />
              
                  {/* <StepForwardOutlined  className='timelineBtn' /> */}
                  <RetweetOutlined style={{transform:'scale(-1, 1)'}}  className='timelineBtn' />

                </Box>

                <Box style={{display:'flex', flex:1, justifyContent:'space-around', alignItems:'center'}}>
                  
                  <fieldset className='timelineTimeInput'>
                    <input type="text" defaultValue={"0"} />
                  </fieldset>

                  
                  <span className='SelectedEasingFuncName'>Linear</span>

                  <DropdownMenu.Root >
                    <DropdownMenu.Trigger asChild >
                      <Button className='easingBtn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M2.92308 1.26H16.0769C16.9954 1.26 17.74 2.00458 17.74 2.92308V16.0769C17.74 16.9954 16.9954 17.74 16.0769 17.74H2.92308C2.00458 17.74 1.26 16.9954 1.26 16.0769V2.92308C1.26 2.00458 2.00458 1.26 2.92308 1.26ZM0 2.92308C0 1.30871 1.30871 0 2.92308 0H16.0769C17.6913 0 19 1.30871 19 2.92308V16.0769C19 17.6913 17.6913 19 16.0769 19H2.92308C1.30871 19 0 17.6913 0 16.0769V2.92308ZM15 4C14.9422 3.27229 14.942 3.27231 14.9418 3.27233L14.9413 3.27236L14.9401 3.27246L14.9369 3.27272L14.927 3.27357L14.8938 3.27664C14.8659 3.27934 14.8264 3.28338 14.7768 3.2891C14.6777 3.30052 14.5373 3.31866 14.3659 3.34605C14.0242 3.40064 13.5532 3.49294 13.0359 3.64453C12.0335 3.93828 10.7167 4.49438 9.916 5.562C8.93063 6.87583 8.92112 8.51898 8.9134 9.85341C8.91287 9.94372 8.91236 10.0326 8.91155 10.1199C8.89765 11.6207 8.80946 12.7077 8.00019 13.4679C7.3711 14.0589 6.55704 14.2767 5.84594 14.3328C5.49553 14.3604 5.18727 14.3471 4.96801 14.327C4.85894 14.317 4.77343 14.3054 4.71758 14.2968C4.68969 14.2925 4.66933 14.289 4.65726 14.2868L4.64638 14.2848C4.64661 14.2849 4.64686 14.2849 4.5 15C4.35314 15.7151 4.35341 15.7151 4.35368 15.7152L4.35427 15.7153L4.35562 15.7156L4.359 15.7163L4.36841 15.7181L4.39762 15.7236C4.42161 15.7279 4.45456 15.7335 4.49565 15.7399C4.57774 15.7525 4.69286 15.7679 4.83448 15.7809C5.11661 15.8068 5.51 15.8238 5.9607 15.7883C6.85181 15.718 8.03775 15.4358 8.99981 14.5321C10.3253 13.2869 10.3584 11.5455 10.3715 10.1334L10.3725 10.0184C10.3858 8.53655 10.3964 7.35481 11.084 6.438C11.5931 5.75914 12.5264 5.31524 13.4465 5.04561C13.8905 4.91551 14.2989 4.83527 14.5963 4.78776C14.7444 4.76409 14.8635 4.74877 14.9439 4.73951C14.9841 4.73488 15.0145 4.73178 15.0339 4.72991L15.0546 4.72799L15.0582 4.72768C15.058 4.72769 15.0578 4.72771 15 4Z" fill="white"/>
                        </svg>
                      </Button>

                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                      <DropdownMenu.Content side='top' className="DropdownMenuContent" sideOffset={5}>
                        
                        <DropdownMenu.Item className="DropdownMenuItem" >
                          Bounce
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className="DropdownMenuItem" >
                          Elastic
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className="DropdownMenuItem" >
                          Ease Out
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className="DropdownMenuItem" >
                          Ease In
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className="DropdownMenuItem SelectedEasingFunc" >
                          Linear
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className="DropdownMenuItem" >
                          Constant
                        </DropdownMenu.Item>

                        <DropdownMenu.Sub>
                          <DropdownMenu.SubTrigger className="DropdownMenuSubTrigger">
                            Custom
                            <div className="RightSlot">
                              <ChevronRightIcon />
                            </div>
                          </DropdownMenu.SubTrigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.SubContent
                              className="DropdownMenuSubContent"
                              sideOffset={3}
                              alignOffset={-5}
                            >
                              <DropdownMenu.Item className="DropdownMenuItem" >Settings Panel</DropdownMenu.Item>
                            </DropdownMenu.SubContent>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Sub>
                         

                        <DropdownMenu.Arrow className="DropdownMenuArrow" />
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>

                  

                </Box>
               
             </Box>
              
             <Box className="timelineOptions" style={{position:'relative'}}>
                <div className='animationsBox'>
                  <span>Animation</span>
                  <fieldset className="Fieldset " >
                    <select value={this.state.selectedAnimationName} title={this.state.selectedAnimationName} className='Input basicSelect animationsSelect' onChange={(evt)=>this.selectElementAnimation(evt.target.value)}>
                      <option value={MAIN_ANIM_ID}>{MAIN_ANIM_ID}</option>
                      {this.state.selectedElementAnimations.map((c,i)=>
                        <option key={i} value={c.name}>{c.name}</option>
                      )}
                    </select>
                  </fieldset>
                   
                  <DropdownMenu.Root open={this.state.animationOptDropdownOpened} onOpenChange={()=>this.animationOptOnOpenChange()} >
                    <DropdownMenu.Trigger asChild >
                      <Button className={`animationBtn animationBtnDots ${this.state.selectedAnimationName != MAIN_ANIM_ID ? "" : "animationBtnDisabled"}`} size={'1'}>
                        <DotsVerticalIcon />
                      </Button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                      <DropdownMenu.Content side='top' className="DropdownMenuContent" sideOffset={5}>
                        <DropdownMenu.Sub>
                          <DropdownMenu.SubTrigger className="DropdownMenuSubTrigger">
                            Delete
                            <div className="RightSlot">
                              <ChevronRightIcon />
                            </div>
                          </DropdownMenu.SubTrigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.SubContent
                              className="DropdownMenuSubContent"
                              sideOffset={3}
                              alignOffset={-5}
                            >
                              <DropdownMenu.Item className="DropdownMenuItem DropdownMenuItemConfirmDelete" onClick={()=>this.animationDeleteHandler()} >Confirm</DropdownMenu.Item>
                            </DropdownMenu.SubContent>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Sub>
                        
                        <DropdownMenu.Sub>
                          <DropdownMenu.SubTrigger className="DropdownMenuSubTrigger">
                            Rename
                            <div className="RightSlot">
                              <ChevronRightIcon />
                            </div>
                          </DropdownMenu.SubTrigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.SubContent
                              className="DropdownMenuSubContent"
                              sideOffset={3}
                              alignOffset={-5}
                            >
                              <input className={`animationEditInput ${this.state.animationNameValid ? "" : "awa-invalid-input"}`} defaultValue={this.state.selectedAnimationName} onChange={(e)=>this.animationNameOnChangeHandler(e)} onKeyDown={(e)=>this.animationNameEditionHandler(e)} type="text" />
                            </DropdownMenu.SubContent>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Sub>

                        <DropdownMenu.Arrow className="DropdownMenuArrow" />
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>

                  <Button className={`animationBtn animationBtnCreate ${this.state.selectedElementId ? "" : "animationBtnDisabled"}`} onClick={()=>this.createNewAnimation()} title='New animation' size={'1'}>
                    <PlusIcon />
                  </Button>
                </div>
                
             </Box>
           </Flex>

           <Flex
             className="timelinePlayerBox"
             style={{ borderRight: "solid 1px gray" }}
           >
             <Box className="timelineControls">
               
             </Box>
             <Box className="timelineProgressbar" style={{position:'relative'}}>
               {/* <input className="timeline-slider" type="range" onChange={(e)=>this.timelineProgressbarOnChange(e)} onInput={(e)=>this.timelineSetTimelineTime(e)} onMouseUp={(e)=>this.timelineMouseup(e)} min="0" max="8000" step="1" style={{width: '99%', height: 4}} /> */}
              
               <div className='timeline-handle' style={{height: MAX_TIMELINE_HEIGHT}}>
                <div className='timeline-handle-handler'></div>
               </div>

               <div className="_timeline_keytimes_block">
                 <svg className="_main-svg_keytimes">
                   <g style={{fontSize: 1}}>
                     <rect
                       width="1"
                       height="7"
                       x="0px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="5px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="10px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="15px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="20px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="25px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="30px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="35px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="40px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="45px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="50px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="55px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="60px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="65px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="70px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="75px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="80px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="85px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="90px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="95px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="100px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="105px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="110px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="115px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="120px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="125px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="130px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="135px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="140px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="145px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="150px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="155px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="160px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="165px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="170px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="175px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="180px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="185px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="190px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="195px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="200px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="205px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="210px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="215px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="220px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="225px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="230px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="235px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="240px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="245px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="250px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="255px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="260px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="265px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="270px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="275px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="280px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="285px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="290px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="295px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="300px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="305px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="310px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="315px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="320px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="325px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="330px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="335px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="340px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="345px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="350px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="355px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="360px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="365px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="370px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="375px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="380px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="385px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="390px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="395px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="400px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="405px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="410px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="415px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="420px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="425px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="430px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="435px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="440px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="445px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="450px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="455px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="460px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="465px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="470px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="475px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="480px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="485px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="490px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="495px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="500px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="505px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="510px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="515px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="520px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="525px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="530px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="535px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="540px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="545px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="550px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="555px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="560px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="565px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="570px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="575px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="580px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="585px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="590px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="595px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="600px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="605px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="610px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="615px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="620px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="625px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="630px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="635px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="640px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="645px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="650px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="655px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="660px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="665px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="670px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="675px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="680px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="685px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="690px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="695px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="700px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="705px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="710px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="715px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="720px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="725px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="730px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="735px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="740px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="745px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="750px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="755px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="760px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="765px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="770px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="775px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="780px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="785px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="790px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="795px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="800px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="805px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="810px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="815px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="820px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="825px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="830px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="835px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="840px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="845px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="850px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="855px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="860px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="865px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="870px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="875px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="880px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="885px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="890px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="895px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="900px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="905px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="910px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="915px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="920px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="925px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="930px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="935px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="940px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="945px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="950px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="955px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="960px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="965px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="970px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="975px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="980px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="985px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="990px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="995px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="1000px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1005px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1010px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1015px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1020px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="1025px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1030px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1035px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1040px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1045px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="1050px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1055px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1060px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1065px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1070px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="1075px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1080px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1085px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1090px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1095px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="1100px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1105px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1110px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1115px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1120px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="1125px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1130px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1135px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1140px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1145px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="1150px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1155px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1160px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1165px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1170px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="1175px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1180px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1185px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1190px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1195px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="1200px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1205px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1210px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1215px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1220px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="1225px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1230px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1235px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1240px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1245px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="1250px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1255px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1260px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1265px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1270px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="1275px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1280px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1285px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1290px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1295px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="1300px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1305px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1310px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1315px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1320px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="1325px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1330px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1335px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1340px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1345px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="1350px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1355px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1360px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1365px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1370px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="1375px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1380px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1385px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1390px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1395px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="1400px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1405px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1410px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1415px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1420px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="1425px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1430px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1435px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1440px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1445px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="1450px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1455px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1460px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1465px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1470px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="6"
                       x="1475px"
                       y="16"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1480px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1485px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1490px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="4"
                       x="1495px"
                       y="18"
                       fill="#ae9bae"
                     ></rect>
                     <rect
                       width="1"
                       height="7"
                       x="1500px"
                       y="15"
                       fill="#fff"
                     ></rect>
                     <svg x="0px" style={{overflow: 'visible'}}>
                       <text y="11" className="_label_keytimes" textAnchor="start">
                         0
                       </text>
                     </svg>
                     <svg x="50px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         500
                       </text>
                     </svg>
                     <svg x="100px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         1000
                       </text>
                     </svg>
                     <svg x="150px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         1500
                       </text>
                     </svg>
                     <svg x="200px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         2000
                       </text>
                     </svg>
                     <svg x="250px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         2500
                       </text>
                     </svg>
                     <svg x="300px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         3000
                       </text>
                     </svg>
                     <svg x="350px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         3500
                       </text>
                     </svg>
                     <svg x="400px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         4000
                       </text>
                     </svg>
                     <svg x="450px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         4500
                       </text>
                     </svg>
                     <svg x="500px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         5000
                       </text>
                     </svg>
                     <svg x="550px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         5500
                       </text>
                     </svg>
                     <svg x="600px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         6000
                       </text>
                     </svg>
                     <svg x="650px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         6500
                       </text>
                     </svg>
                     <svg x="700px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         7000
                       </text>
                     </svg>
                     <svg x="750px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         7500
                       </text>
                     </svg>
                     <svg x="800px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         8000
                       </text>
                     </svg>
                     <svg x="850px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         8500
                       </text>
                     </svg>
                     <svg x="900px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         9000
                       </text>
                     </svg>
                     <svg x="950px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         9500
                       </text>
                     </svg>
                     <svg x="1000px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         10000
                       </text>
                     </svg>
                     <svg x="1050px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         10500
                       </text>
                     </svg>
                     <svg x="1100px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         11000
                       </text>
                     </svg>
                     <svg x="1150px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         11500
                       </text>
                     </svg>
                     <svg x="1200px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         12000
                       </text>
                     </svg>
                     <svg x="1250px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         12500
                       </text>
                     </svg>
                     <svg x="1300px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         13000
                       </text>
                     </svg>
                     <svg x="1350px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         13500
                       </text>
                     </svg>
                     <svg x="1400px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         14000
                       </text>
                     </svg>
                     <svg x="1450px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         14500
                       </text>
                     </svg>
                     <svg x="1500px" style={{overflow: 'visible'}}>
                       <text
                         y="11"
                         className="_label_keytimes"
                         textAnchor="middle"
                       >
                         15000
                       </text>
                     </svg>
                   </g>
                 </svg>
               </div>
             </Box>
           </Flex>

           <Flex className="timelineSliderKeyframes">
             <Box className="timelineNodes">
               <div className="keyframesNodesList">{renderTimelineNodes}</div>
             </Box>
             <Box className="timelineKeyframes" id="timelineKeyframes">
               <div className="keyframesList">{renderTimelineItems}</div>
             </Box>
           </Flex>
         </Box>
       </Box>
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


export default connect(mapStateToProps, mapDispatchToProps)(TimelineBoxComp);

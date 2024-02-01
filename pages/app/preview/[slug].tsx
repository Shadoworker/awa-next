import React, { useEffect, useState } from 'react'; 
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import * as mainActions from '../../../redux/main/mainActions'
// import dbPromise from '../../services/database';
import { Box } from '@radix-ui/themes';
import anime from '../../../lib/assets/vendors/anime';
import { ANIMATABLE_PROPERTIES, MAINSVGID, SCENE_BLOCK_CLASS, TIMELINE_MAX_DURATION } from '../../../lib/awa/awa.core';
import SVG from '../../../lib/assets/vendors/svg';
import { CANVAS_ID_BODY, CONTAINER_ID_BODY, GROUP_ID_BODY, NATIVE_ANIMATIONS, NATIVE_ANIMATION_MODELS, PREVIEW_DATA_KEYS } from '../../../lib/awa/awa.constants';
import './PreviewPage.css';
import awaEvents from '../../../lib/awa/awa.events';
import MenubarPreviewComp from '../../../components/MenubarPreviewComp/MenubarPreviewComp';
import * as Ant from 'antd';
import { withRouter } from 'next/router';
import contentService from '../../../services/content.service';
import localDatabaseService from '../../../services/localdatabase.service';
import { AwaTypes } from '../../../lib/awa/awa.types';


function PreviewPage(props) {

  const [drawerOpened, setDrawerOpened] = useState(false);
  const [windW, setWindW] = useState(10);
  const [windH, setWindH] = useState(10);
  const [canvases, setCanvases] = useState<any[]>([]);
  const [flowsList, setFlowsList] = useState<any[]>([]);
  
  const [customAnimations, setCustomAnimations] = useState<any[]>([]);
  const [canvasToPreviewId, setCanvasToPreviewId] = useState(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [canvasToPreviewSize, setCanvasToPreviewSize] = useState({width:0, height:0});
  const [svgviewBox, setSvgviewBox] = useState<string>();

  const [previewType, setPreviewType] = useState(''); // Whether we render the scene or canvases
  const [hasCanvas, setHasCanvas] = useState(false); // Whether we render the scene or canvases


  useEffect(()=>{
 
    var windW = window.innerWidth;
    var windH = window.innerHeight;

    setWindW(windW);
    setWindH(windH);
 

    setTimeout(() => {

       
      var _projectUUID = window.location.pathname.split('/').slice(3)[0];
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      
      const _sceneId = urlParams.get('sceneId') || '';
      const _previewType = urlParams.get('type') || '';
      
      setProjectPreviewData(_projectUUID, _sceneId, _previewType);
      
    }, 100);


  },[])

  // Initialize native animation models (FadeIn, SlideIn ...)
  const getNativeAnimationModels = ()=>{

    return NATIVE_ANIMATION_MODELS;

  }
  

  // ? : map only used custom-animations (referencing interactions)
  const mapCustomAnimationsToAnimationModel = (_customAnimations)=>{

    var animationModels :any[] = [];

    _customAnimations.forEach(ca => {
      
      var name = ca.name;
      var keyframes = {};

      var keys = Object.keys(ca.animation); // In order to filter other non-animatable properties

      keys.forEach(key => {
        if(ANIMATABLE_PROPERTIES[key]) // if an animatable property
        {
          var _keyframes = ca.animation[key];
          keyframes[key] = _keyframes;
        }
      });

      const animationModel = {
        name : name,
        keyframes : keyframes
      }

      animationModels.push(animationModel)

    });
    

    return animationModels;

  }

  const getCanvases = (_interactions)=>
  {
    var canvases : any[] = [];

    for (let i = 0; i < _interactions.length; i++) {
      const interaction = _interactions[i];

      var canvasSource : any = interaction.basedOn.canvas;
      var canvasTarget : any = interaction.action.canvas;

      if(!canvases.includes(canvasSource)) canvases.push(canvasSource);
      if(!canvases.includes(canvasTarget)) canvases.push(canvasTarget);

    }

    return canvases;
  }

  const renderFlow = (_flowDefault, _flow, _interactions, _animations, _canvasId = null)=>
  {

    var canvasesIds = getCanvases(_interactions) //[...new Set(_flow.canvases)]; // Unique ids
    var interactions = [..._interactions]//[..._flow.interactions]; // Unique ids
    
    var canvases : any[] = [];
    
    if(!canvasesIds.length) canvasesIds.push(_flowDefault.canvas)

    // canvases ------------------------------------------------
    for (let i = (canvasesIds.length-1); i >= 0; i--) 
    {
      const _canvasId = canvasesIds[i];

      var canvasToPreviewHashedId : any = "#"+_canvasId; //viewIds[nextViewIndex];
      setCanvasToPreviewId(canvasToPreviewHashedId);
  
      // console.log(canvasToPreviewHashedId)
      
      var canvasToPreview = document.querySelector(canvasToPreviewHashedId);
      var canvasRectId = canvasToPreviewHashedId.split(GROUP_ID_BODY)[0] + CONTAINER_ID_BODY;
      var canvasRect : any = document.querySelector(canvasRectId);
      var canvasToPreviewSize = canvasRect.getBBox()
  
      var svgSize = canvasRect.getBoundingClientRect()
  
      setCanvasToPreviewSize({width:svgSize.width, height:svgSize.height})
  
      var viewBoxValues = {width:canvasToPreviewSize.width, height:canvasToPreviewSize.height}
  
      setSvgviewBox(`0 0 ${canvasToPreviewSize.width} ${canvasToPreviewSize.height}`)
  
  
      var currentTranslation = {x:0,y:0};
      var currentTranslationString = canvasToPreview.getAttribute("transform");
      if(currentTranslationString)
      {
        var _t = currentTranslationString.split("translate(")[1];
        var _t_ = _t.split(")")[0];
        var vals = _t_.split(",").map(Number);
  
        currentTranslation.x = vals[0];
        currentTranslation.y = vals[1];
      }
  
      var viewBoxCx = (viewBoxValues.width/2);
      var viewBoxCy = (viewBoxValues.height/2);
  
      var canvasToPreviewCx = canvasToPreviewSize.x + (canvasToPreviewSize.width/2);
      var canvasToPreviewCy = canvasToPreviewSize.y + (canvasToPreviewSize.height/2);
  
      var tx = (viewBoxCx - canvasToPreviewCx) - currentTranslation.x;
      var ty = (viewBoxCy - canvasToPreviewCy) - currentTranslation.y;
  
      var translation = `translateX(${tx}px) translateY(${ty}px)`;
  
      // setpreviewCenterTranslation(translation);

      var canvas = {
        width : canvasToPreviewSize.width,
        height : canvasToPreviewSize.height,
        viewbox : `0 0 ${canvasToPreviewSize.width} ${canvasToPreviewSize.height}`,
        id:_canvasId,
        centerTranslation : translation
      }

      canvases.push(canvas);
      
    }
    setCanvases(canvases);
    //----------------------------------------------end canvases

    // Utils 

    var currentCanvasId = canvases[canvases.length-1].id;

    function animate(actionType, actionTargetId, actionAnimation, actionOptions)
    {
      const animationKeyframes = getAnimationKeyframes(actionAnimation);
      const animationKeyframesPrev = JSON.parse(JSON.stringify(animationKeyframes)); // To avoid inter-mutability
      
      // console.log(actionAnimation)

      // for prev canvas
      var currentCanvas : any = document.querySelector(`#div-${currentCanvasId}`)
      var currentCanvasSvg : any = document.querySelector(`#svg-${currentCanvasId}`)
      
      var nextCanvas : any = document.querySelector(`#div-${actionTargetId}`)
      var nextCanvasSvg : any = document.querySelector(`#svg-${actionTargetId}`)
      
      var animatePrev = false;

      // PUSH IN
      if(actionAnimation.includes("pushIn"))
      {
        animatePrev = true;
        /* Calcultate the offset initial translation */
        var canvasToPreview : any = document.querySelector("#"+actionTargetId)
        var currentTranslationString = canvasToPreview.getAttribute("transform");
        var currentTranslation = {x:0,y:0};
        if(currentTranslationString)
        {
          var _t = currentTranslationString.split("translate(")[1];
          var _t_ = _t.split(")")[0];
          var vals = _t_.split(",").map(Number);
    
          currentTranslation.x = vals[0];
          currentTranslation.y = vals[1];
        }

        var canvasRectId = "#"+actionTargetId.split(GROUP_ID_BODY)[0] + CONTAINER_ID_BODY;
        var canvasRect : any = document.querySelector(canvasRectId);
        var canvasToPreviewSize = canvasRect.getBoundingClientRect()

        animationKeyframes.translateX[0].value = canvasToPreviewSize.width;
        animationKeyframes.translateX[1].value = 0;
        
        // Prev presets

        /* Calcultate the offset initial translation */
        var canvasToPrev : any = document.querySelector(`#`+currentCanvasId)
        var currentTranslationStringPrev = canvasToPrev.getAttribute("transform");
        var currentTranslationPrev = {x:0,y:0};
        if(currentTranslationStringPrev)
        {
          var _t = currentTranslationStringPrev.split("translate(")[1];
          var _t_ = _t.split(")")[0];
          var vals = _t_.split(",").map(Number);
    
          currentTranslationPrev.x = vals[0];
          currentTranslationPrev.y = vals[1];
        }

        var canvasRectIdPrev = "#"+currentCanvasId.split(GROUP_ID_BODY)[0] + CONTAINER_ID_BODY;
        var canvasRectPrev : any = document.querySelector(canvasRectIdPrev);
        var canvasToPreviewSizePrev = canvasRectPrev.getBoundingClientRect()

        animationKeyframesPrev.translateX[0].value = 0;
        animationKeyframesPrev.translateX[1].value = -canvasToPreviewSizePrev.width;

      }
      // ----------------------------------------------------------------------------


      // SLIDE IN
      if(actionAnimation.includes("slideIn"))
      {
        animatePrev = true;
        /* Calcultate the offset initial translation */
        var canvasToPreview : any = document.querySelector(`#`+actionTargetId)
        var currentTranslationString = canvasToPreview.getAttribute("transform");
        var currentTranslation = {x:0,y:0};
        if(currentTranslationString)
        {
          var _t = currentTranslationString.split("translate(")[1];
          var _t_ = _t.split(")")[0];
          var vals = _t_.split(",").map(Number);
    
          currentTranslation.x = vals[0];
          currentTranslation.y = vals[1];
        }

        var canvasRectId = actionTargetId.split(GROUP_ID_BODY)[0] + CONTAINER_ID_BODY;
        var canvasRect : any = document.querySelector(`#`+canvasRectId);
        var canvasToPreviewSize = canvasRect.getBoundingClientRect()

        animationKeyframes.translateX[0].value = canvasToPreviewSize.width;
        animationKeyframes.translateX[1].value = 0;
        
        // Prev presets

        /* Calcultate the offset initial translation */
        var canvasToPrev : any = document.querySelector(`#`+currentCanvasId)
        var currentTranslationStringPrev = canvasToPrev.getAttribute("transform");
        var currentTranslationPrev = {x:0,y:0};
        if(currentTranslationStringPrev)
        {
          var _t = currentTranslationStringPrev.split("translate(")[1];
          var _t_ = _t.split(")")[0];
          var vals = _t_.split(",").map(Number);
    
          currentTranslationPrev.x = vals[0];
          currentTranslationPrev.y = vals[1];
        }

        var canvasRectIdPrev = currentCanvasId.split(GROUP_ID_BODY)[0] + CONTAINER_ID_BODY;
        var canvasRectPrev : any = document.querySelector(`#`+canvasRectIdPrev);
        var canvasToPreviewSizePrev = canvasRectPrev.getBoundingClientRect()

        animationKeyframesPrev.translateX[0].value = 0;
        animationKeyframesPrev.translateX[1].value = -canvasToPreviewSizePrev.width;
        animationKeyframesPrev.translateX[1].duration *= 2;

        animationKeyframesPrev.opacity[0].value = 1;
        animationKeyframesPrev.opacity[1].value = 0;
        animationKeyframesPrev.opacity[1].duration *= 1;


      }
      // ----------------------------------------------------------------------------

      // FADE IN
      if(actionAnimation.includes("fadeIn"))
      {
        animatePrev = true;
       
        // Prev presets

        /* Calcultate the offset initial translation */
        animationKeyframesPrev.opacity[0].value = 1;
        animationKeyframesPrev.opacity[1].duration *= 0.5;
        animationKeyframesPrev.opacity[1].value = 0;

      }

      
      // OVERLAY
      if(actionAnimation.includes("overlay"))
      {
        animatePrev = true;
       
        animationKeyframes.zIndex[1].value = 2;

      }

      // --------------------------------------------------------------------------------

      if(actionTargetId.includes(CANVAS_ID_BODY) && actionTargetId.includes(GROUP_ID_BODY))
      {
        actionTargetId = '#svg-'+actionTargetId;
      }
      else
      {
        actionTargetId = '#'+actionTargetId;
      }


      if(nextCanvas)
        nextCanvas.style.display = "block"; 

      /* Prev--------------------- */
      if(animatePrev)
      {
        var _currentCanvasId = '#svg-'+currentCanvasId;
        var animParamsPrev =
        {
          targets : _currentCanvasId,
          easing : 'linear',
          ...animationKeyframesPrev,
          complete: function(anim) {
            currentCanvasSvg.removeAttribute('transform')
            !actionAnimation.includes("overlay") ?  // don't hide in
              currentCanvas.style.display = "none" : 
              currentCanvasSvg.style.zIndex = 1;

            currentCanvasSvg.style.opacity = 1;

          }
        }

        anime(animParamsPrev)
      }
      else if(actionType != "animate")
      {
        currentCanvas.style.display = "none";
      }


      /* ------------------------- */


      var animParams =
      {
        targets : actionTargetId,
        easing : 'linear',
        ...animationKeyframes
      }

      anime(animParams)

    }

    function getAnimationKeyframes(actionAnimation)
    {
      var anim = _animations.find(a=>a.name == actionAnimation)

      return anim.keyframes;
    }

    function animationAmongNatives(actionAnimation)
    {
      var baseAnimation = actionAnimation.split("_")[0] // to remove the duration prefix
      return Object.values(NATIVE_ANIMATIONS).includes(baseAnimation)
    }

    function switchCanvas(actionType, actionTargetId, actionAnimation, actionOptions)
    {
      var currentCanvas : any = document.querySelector(`#div-${currentCanvasId}`)
      var nextCanvas : any = document.querySelector(`#div-${actionTargetId}`)

      // Reposition svgs... translateX to 0
      // var nextCanvasSvg = document.querySelector(`#svg-${actionTargetId}`)
      // nextCanvasSvg.removeAttribute('transform')

      setTimeout(() => {
        
        // currentCanvas.style.display = "none";
        nextCanvas.style.display = "block";
        if(actionAnimation)
          animate(actionType, actionTargetId, actionAnimation, actionOptions)
        else if(actionType != "animate")
          currentCanvas.style.display = "none";


        currentCanvasId = actionTargetId;

      }, actionOptions.delay || 0);

    }
    // ----------------------------------------------------------

    //  interactions---------------------------------------------

    for (let i = 0; i < interactions.length; i++) {
      
      const interaction = interactions[i];
      
      const basedOnTargetId = interaction.basedOn.target;
      const basedOnEvent = interaction.basedOn.event;
      
      const actionType = interaction.action.type;
      const actionTargetId = interaction.action.target;
      const actionAnimation = interaction.action.animation;
      const actionOptions = interaction.action.options;
 
      const basedOnTarget = document.querySelector("#"+basedOnTargetId);

      const eventCallback = ()=>
      { 
        switch (actionType) 
        {
          case "animate":
            animate(actionType, actionTargetId, actionAnimation, actionOptions)
            break;
          case "goto":
            switchCanvas(actionType, actionTargetId, actionAnimation, actionOptions)
            break;
        }

      }

      applyEvent(basedOnTarget, basedOnEvent, actionOptions, eventCallback)

      
    }

    //----------------------------------------------end interactions

    // if(timeline)
    //   timeline.restart();

    var dblclickTimer;

    function applyEvent(basedOnTarget, basedOnEvent, actionOptions, eventCallback){

      var _events = basedOnTarget._events != null ? basedOnTarget._events : [];
      _events.push(awaEvents.CANVAS_EVENTS[basedOnEvent]);

      basedOnTarget._events = _events;

      var _event = awaEvents.CANVAS_EVENTS[basedOnEvent];

      switch (_event) {
        
        case awaEvents.CANVAS_EVENTS.click:
        case awaEvents.CANVAS_EVENTS.dblclick:
        case awaEvents.CANVAS_EVENTS.press:
        case awaEvents.CANVAS_EVENTS.release:

          let minDelay = basedOnTarget._events?.includes(awaEvents.CANVAS_EVENTS.dblclick) ? 200:0, 
          maxDelay = basedOnTarget._events?.includes(awaEvents.CANVAS_EVENTS.dblclick) ? 700 : 300;
          
          var startDate : any = null, endDate : any;
          var tapCounter = 0;
         
          // Event listeners
          basedOnTarget.addEventListener('mousedown', function(evt) {

            if(startDate == null)
            {
              startDate = new Date().getTime();
            }

            tapCounter++;
             
          });

        
          basedOnTarget.addEventListener('mouseup', function() {

            endDate = new Date().getTime();

            var deltaTime = endDate - startDate;
            
            if(deltaTime >= minDelay)
            {
              if(deltaTime <= maxDelay)
              {
                if(tapCounter == 1)
                {
                  if(_event == awaEvents.CANVAS_EVENTS.click)
                    eventCallback();

                  if(_event == awaEvents.CANVAS_EVENTS.release)
                    eventCallback();

                }
                else if(tapCounter == 2)
                {
                  if(_event == awaEvents.CANVAS_EVENTS.dblclick)
                    eventCallback();
                }
              }
              else if(deltaTime > maxDelay)
              {
                if(_event == awaEvents.CANVAS_EVENTS.press)
                  eventCallback();

                if(_event == awaEvents.CANVAS_EVENTS.release)
                  eventCallback();
                  
              }
             
              tapCounter = 0;
              startDate = null;

            }
        
          });
         

          break;
  
        case awaEvents.CANVAS_EVENTS.hover:
          basedOnTarget.addEventListener(awaEvents.CANVAS_EVENTS.hover, eventCallback)
          break;

  
        case awaEvents.CANVAS_EVENTS.mouseout:
            basedOnTarget.addEventListener(awaEvents.CANVAS_EVENTS.mouseout, eventCallback)
            break;

        
        case awaEvents.CANVAS_EVENTS.delay:
          setTimeout(() => eventCallback(), actionOptions.delay);
          break;
  
        case awaEvents.CANVAS_EVENTS.keypress:

          var activeElement : any = null;
          setTimeout(() => {

            var currentCanvasSvgOriginal : any = document.querySelector(`${currentCanvasId}`) // the 'g' element rendered in the 'use'

            currentCanvasSvgOriginal.addEventListener("mouseover", function(evt:any){
              activeElement = evt.target;
            })

            document.addEventListener(awaEvents.CANVAS_EVENTS.keypress, (evt:any)=>{
              evt.preventDefault();
              evt.stopPropagation();
              if(evt.key == actionOptions.keypress.key)
              { 
                if(activeElement.getAttribute("id") == basedOnTarget.getAttribute("id"))
                {
                  eventCallback();
                }
              }

            })

          },200)

          break;

              
        case awaEvents.CANVAS_EVENTS.drag:
        
            setTimeout(() => {
               
            var currentCanvasSvg : any = document.querySelector(`svg-${currentCanvasId}`)
            
            basedOnTarget.classList.add('awa-canvas-item-drag-event-owner')

            function initDrag() {
              var svg = currentCanvasSvg;
              var selectedElement , offset, transform;

              var minxReached = actionOptions.drag.x.min ? false : true;
              var minyReached = actionOptions.drag.y.min ? false : true;

              svg.addEventListener('mousedown', startDrag);
              svg.addEventListener('mousemove', drag);
              svg.addEventListener('mouseup', endDrag);
              svg.addEventListener('mouseleave', endDrag);
            
              function startDrag(evt) {
                if (basedOnTarget.classList.contains('awa-canvas-item-drag-event-owner')) 
                {
                  selectedElement = basedOnTarget;
                  offset = getMousePosition(evt);
                  // Get all the transforms currently on this element
                  var transforms = selectedElement.transform.baseVal;
                  // Ensure the first transform is a translate transform
                  if (transforms.length === 0 ||
                      transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
                    // Create an transform that translates by (0, 0)
                    var translate = svg.createSVGTransform();
                    translate.setTranslate(0, 0);
                    // Add the translation to the front of the transforms list
                    selectedElement.transform.baseVal.insertItemBefore(translate, 0);
                  }

                  // Get initial translation amount
                  transform = transforms.getItem(0);
                  offset.x -= transform.matrix.e;
                  offset.y -= transform.matrix.f;

                }
              }
            
              function drag(evt) {
                if (selectedElement) {
                  evt.preventDefault();
                  var coord = getMousePosition(evt);
                  var x = 0;
                  if(actionOptions.drag.x.allowed)
                  {
                    x = coord.x - offset.x;
                    if(x >= actionOptions.drag.x.min) minxReached = true;
                  }
                  var y = 0;
                  if(actionOptions.drag.y.allowed)
                  {
                    y = coord.y - offset.y;
                    if(y >= actionOptions.drag.y.min) minyReached = true;
                  }

                  transform.setTranslate(x, y);
                }
              }
 

              function getMousePosition(evt) {
                var CTM = svg.getScreenCTM();
                return {
                  x: (evt.clientX - CTM.e) / CTM.a,
                  y: (evt.clientY - CTM.f) / CTM.d
                };
              }
            
              function endDrag(evt) {
                selectedElement = null;
                if(minxReached && minyReached)
                  eventCallback();
              }
            }

            initDrag();
  
          }, 200);
  
          break;


        case awaEvents.CANVAS_EVENTS.pinch:
        
          setTimeout(() => {
             
          var currentCanvasSvg = document.querySelector(`svg-${currentCanvasId}`)
          
          basedOnTarget.classList.add('awa-canvas-item-pinch-event-owner')

          let initialDistance;

          basedOnTarget.addEventListener('touchstart', handleTouchStart);
          basedOnTarget.addEventListener('touchmove', handleTouchMove);

          function handleTouchStart(event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.touches.length === 2) {
              initialDistance = calculateDistance(event.touches[0], event.touches[1]);
            }
          }

          function handleTouchMove(event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.touches.length === 2) {
              const currentDistance = calculateDistance(event.touches[0], event.touches[1]);

              // Calculate the scale factor based on the initial and current distances
              const scaleFactor = currentDistance / initialDistance;

              // Update the size of the basedOnTarget
              // basedOnTarget.style.width = `${100 * scaleFactor}px`;
              // basedOnTarget.style.height = `${100 * scaleFactor}px`;
              alert(scaleFactor)
            }
          }

          function calculateDistance(touch1, touch2) {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
          }

        }, 200);

        break;


  
        case awaEvents.CANVAS_EVENTS.scroll:

          var scrollX : any = 0;
          var scrollY : any = 0;
          var toX : any = null;
          var toY : any = null;
 
          setTimeout(() => {
            
            var currentCanvasSvg : any = document.querySelector(`svg-${currentCanvasId}`)
            var currentCanvasContainerRect : any = document.querySelector(`${currentCanvasId.split(GROUP_ID_BODY)[0] + CONTAINER_ID_BODY}`)
            var currentCanvasContainerGroup : any = document.querySelector(`${currentCanvasId}>.--clip----group--`)

            var currentCanvasClipRect : any = document.querySelector(`use[href="${currentCanvasId.split(GROUP_ID_BODY)[0] + CONTAINER_ID_BODY}"]`)


            var containerRectBrect = currentCanvasContainerRect.getBoundingClientRect();
            var containerGroupBrect = currentCanvasContainerGroup.getBoundingClientRect();
 

            var scrollXRight = (containerGroupBrect.x+containerGroupBrect.width) - (containerRectBrect.x+containerRectBrect.width)
            scrollXRight = scrollXRight < 0 ? 0 : scrollXRight; // Check if scroll

            var scrollXLeft = (containerGroupBrect.x) - (containerRectBrect.x)
            scrollXLeft = scrollXLeft > 0 ? 0 : scrollXLeft; // Check if scroll

            var scrollYBottom = (containerGroupBrect.y+containerGroupBrect.height) - (containerRectBrect.y+containerRectBrect.height)
            scrollYBottom = scrollYBottom < 0 ? 0 : scrollYBottom; // Check if scroll

            var scrollYTop = (containerGroupBrect.y) - (containerRectBrect.y)
            scrollYTop = scrollYTop > 0 ? 0 : scrollYTop; // Check if scroll
            
            
            var scrollable = (scrollXRight > 0) || (scrollXLeft < 0) || (scrollYBottom > 0) || (scrollYTop < 0); 
             
            if(!scrollable) return;

            // Calculating to-s -------------------------------------------------
            if(actionOptions.scroll.x.to)
            {
              var toXId = actionOptions.scroll.x.to;
              var toXItem = document.querySelector(toXId);
              var toXItemBrect = toXItem.getBoundingClientRect();
              
              // Check if hidden at bottom or top
              if(toXItemBrect.x < containerRectBrect.x) // left
              {
                toX = toXItemBrect.x - containerRectBrect.x;
              }
              else if(toXItemBrect.x >= (containerRectBrect.x+containerRectBrect.width)) // right
              {
                toX = toXItemBrect.x - (containerRectBrect.x+containerRectBrect.width)
              }
              else
                toX = 0;
            }

            if(actionOptions.scroll.y.to)
            {
              var toYId = actionOptions.scroll.y.to;
              var toYItem = document.querySelector(toYId);
              var toYItemBrect = toYItem.getBoundingClientRect();
              
              // Check if hidden at bottom or top
              if(toYItemBrect.y < containerRectBrect.y) // top
              {
                toY = toYItemBrect.y - containerRectBrect.y;
              }
              else if(toYItemBrect.y >= (containerRectBrect.y+containerRectBrect.height)) // bottom
              {
                toY = toYItemBrect.y - (containerRectBrect.y+containerRectBrect.height)
              } 
              else
                toY = 0;
            }

            // ------------------------------------------------------------end to-s


            currentCanvasSvg.addEventListener(awaEvents.CANVAS_EVENTS.scroll, (e)=>{

              if(actionOptions.scroll.x.allowed)
              {
                scrollX += e.deltaX;

                scrollX = scrollX < scrollXRight ? scrollX : scrollXRight;
                scrollX = scrollX > scrollXLeft ? scrollX : scrollXLeft;
              }
              
              if(actionOptions.scroll.y.allowed)
              {
                scrollY += e.deltaY;

                scrollY = scrollY < scrollYBottom ? scrollY : scrollYBottom;
                scrollY = scrollY > scrollYTop ? scrollY : scrollYTop;
              }

              // console.log("x:"+scrollX)
              // console.log("y:"+scrollY)
              
              var translation = `translate(${-scrollX} ${-scrollY})`;
              var clipTranslation = `translate(${scrollX} ${scrollY})`;

              currentCanvasContainerGroup.setAttribute("transform", translation);
              currentCanvasClipRect.setAttribute("transform", clipTranslation);

              if(actionOptions.scroll.x.allowed)
              {
                
                if(!toX)
                {
                  eventCallback();
                }
                else if(toX && ((scrollX >= (toX-1)) && (scrollX < (toX+1))) ) // 1-2 pixel of interval : to fix unmatchable values
                {
                  eventCallback();
                }

              }
              
              if(actionOptions.scroll.y.allowed)
              {
                
                if(!toY)
                {
                  eventCallback();
                }
                else if(toY && ((scrollY >= (toY-1)) && (scrollY < (toY+1))) ) // 1-2 pixel of interval : to fix unmatchable values
                {
                  // console.log(toY)
                  eventCallback();
                }
              }

 
            })

          }, 200);

          break;
  
  
      }
  
    }
  
  }


  const setProjectPreviewData = (_projectUUID : string, _sceneId : string, _previewType : string)=>{

    localDatabaseService.getProject()
    .then(project=>{
      if(project)
      {
        // Get entities content (data)
        var _svg = project[PREVIEW_DATA_KEYS.svg];
        var scenes = project.scenes;
        var _scene = scenes.find((s:any)=>s.id == _sceneId);

        var _mainAnimations = _scene?.items.animations[PREVIEW_DATA_KEYS.mainAnimations];
        var _customAnimations = _scene?.items.animations[PREVIEW_DATA_KEYS.customAnimations];

        var _flows = _scene?.items[PREVIEW_DATA_KEYS.flows];
        var _interactions = _scene?.items[PREVIEW_DATA_KEYS.interactions];
        
        // console.log(_interactions)
        // If at least one canvas in sent data
        setHasCanvas(_flows[0].canvas != null)
        setPreviewType(_previewType)

        setCustomAnimations(_customAnimations)

        var nativeAnimationModels = getNativeAnimationModels();
        var customAnimationModels = mapCustomAnimationsToAnimationModel(_customAnimations);

        // console.log(customAnimationModels)

        var animationModels : any[] = [...nativeAnimationModels, ...customAnimationModels];

        setCustomAnimations(animationModels)

        // --------------------------------------------------------------------

        // Svg ----------------------------------------------------------------

        var svgInstance = SVG(MAINSVGID)
        .addTo(SCENE_BLOCK_CLASS)
        .size("100%", "100%");
        
        svgInstance.svg(_svg, true)
      
        // Get Flows list
        var flowsList : any[] = []
        for (let i = 0; i < _flows.length; i++) {
          const f = _flows[i];
          flowsList.push({label : f.name, key : f.name})
        }

        setFlowsList(flowsList);

        // Render flow if there is atleast one canvas ------------------------------

        if(_flows[0].canvas != null && _previewType == 'flow') // If type flow and hasCanvas
          renderFlow(_flows[0], _flows[1], _interactions, animationModels, null);

        // -------------------------------------------------------------------------

        // Animation
        var timeline = anime.timeline({
          easing: "linear",
          duration: TIMELINE_MAX_DURATION,
          // autoplay: true,
        });

        _mainAnimations.forEach(anim => {
          timeline.add(anim, 0);
        });

        setTimeline(timeline);
            
      }
      else
      {
        alert("Projet inexistant")
      }

    })
    .catch(error=>{
      console.log(error)
      alert("Projet inaccessible")

    })

  }

  return (
    <div style={{width:'100%', height:'100%'}}>


      <Ant.Drawer
        title="Flows"
        placement={'left'}
        width={200}
        style={{paddingTop:0}}
        onClose={()=>setDrawerOpened(false)}
        open={drawerOpened}
        className='flowsDrawer'
      >
        <Ant.Menu className='flowsMenu'
          // onClick={onClick}
          style={{ width: '100%', fontFamily:'Montserrat', fontWeight:'bold' }}
          defaultSelectedKeys={flowsList[0]?.key}
          mode="inline"
          items={flowsList}
        />

      </Ant.Drawer>

      <div style={{position:'relative', zIndex:3}}>
        <MenubarPreviewComp hasCanvas={hasCanvas} setDrawerOpened={setDrawerOpened}  />
      </div>

      <Box className="block app-scene-block" style={{height:windH}} >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          id="main-loonk-svg"
          width="0"
          height="0"
        ></svg>
      </Box>

      {
      (hasCanvas && previewType == 'flow') &&
        <div className='previewer-main' style={{height:windH}}>
        
        {canvases.map((c,i)=>{

          return <div id={'div-'+c.id} key={i} 
            
            style={{width:c.width, height:c.height, position:'absolute',overflow:'hidden', display : i == (canvases.length-1) ? "block" : "none"}}>
            <svg key={i} className="previewer-svg"  
              xmlns="http://www.w3.org/2000/svg"
              id={'svg-'+c.id}
              width={c.width}
              height={c.height}
              viewBox={c.viewbox}
              tabIndex={1}
              >
                <use id={'use-'+c.id} style={{transform : c.centerTranslation}} href={"#"+c.id}></use>
              
            </svg>
          </div>
          
        })
        }
 
      </div>}

    </div>
  );
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
  
  
  export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PreviewPage));
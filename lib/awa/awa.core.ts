// Dependencies
import SVG from "../assets/vendors/svg";
import anime from "../assets/vendors/anime";
import Loonk from "../assets/vendors/loonk";
import awaEvents, { awaEventEmitter } from "./awa.events";
import { createNewTween, getTimelineItems } from "./awa.anime.utils";
import {
  AWA_ELEMENT_CLASS,
  BASE_FLOW_ID,
  BASE_INTERACTION_ID,
  BASE_SCENE_ID,
  CLIP_ID_BODY,
  CONNECTORS_GROUP_CLASS,
  CONTAINER_ID_BODY,
  ELEMENTS_TYPES,
  GROUP_ID_BODY,
  IGNORE_PREVIEW_CLASS,
  INCANVAS_ITEM_CLASS,
  INTERACTION_ACTION_REF,
  INTERACTION_TARGET_REF,
  MAIN_ANIM_ID,
  PREVIEW_DATA_KEYS,
  PREVIEW_TYPES,
  RERENDER_SEEK_TIMELINE_DELAY,
  SCENE_CLASS,
} from "./awa.constants";
import { getGradientValues, isCanvas, isCanvasClipElement, isCanvasContainer, isCanvasElement, isGradient } from "./awa.common.utils";
import localDatabaseService from "../../services/localdatabase.service";
import { AwaTypes } from "./awa.types";
import userService from "../../services/user.service";

// DEFS
export const SCENE_BLOCK_CLASS = ".app-scene-block";
export const MAINSVGID = "#main-loonk-svg";
export const TIMELINE_MAX_DURATION = 8000;
export const ANIMATABLE_PROPERTIES = {
  x: "translateX",
  y: "translateY",
  scale: "scale",
  rotation: "rotate",
  fill: "fill",
  stroke: "stroke",
  strokeWidth: "strokeWidth",
  opacity: "opacity",
  scaleX: "scaleX",
  strokeDasharray: "strokeDasharray",
  strokeDashoffset: "strokeDashoffset",
  d: "d",
  followPath: "followPath",
  morphTo: "morphTo",

  // Effect properties
  dx: "dx",
  dy: "dy",
  flood: "flood",
  blur: "blur",
  depth: "depth",
};

export const ELEMENT_PROPERTIES = {
  default: "default",
  ...ANIMATABLE_PROPERTIES,
};

export const ELEMENT_EFFECTS = {
  // This order is important for effects rendering

  dropShadow: "Drop Shadow",
  inset: "Inset",
  innerShadow: "Inner Shadow",
  blur: "Blur",
};

export const APP_MODE = {
  DESIGN: "DESIGN",
  ANIME: "ANIME",
  PREVIEW: "PREVIEW",
};


export const APP_MODE_CONTEXT = {
    NONE: "NONE",
    PROTOTYPE: "PROTOTYPE",
    DEVELOPER: "DEVELOPER"
  };

// User Action States
export const USER_ACTION_STATE = {
  SELECT: "SELECT", // Select any object bbox
  CREATE: "CREATE", // Create an object (rect, circle, text ...)
  DRAW: "DRAW", // Draw a path
  MODIFY: "MODIFY", // Modify a path (Dragging/Deleting/Inserting a point)
};

export const USER_MENU_SELECT_CONTEXT = {
  NONE: "NONE", //
  SELECT_FOLLOW_PATH: "SELECT_FOLLOW_PATH",
  SELECT_MORPHTO_PATH: "SELECT_MORPHTO_PATH",
};

// User Menu Context
export const USER_MENU_CREATE_CONTEXT = {
  NONE: "NONE", //
  CREATE_RECT: "CREATE_RECT", //
  CREATE_CIRCLE: "CREATE_CIRCLE", //
  CREATE_POLYGON: "CREATE_POLYGON", //
  CREATE_TEXT: "CREATE_TEXT", //
  CREATE_MEDIA: "CREATE_MEDIA", //
  CREATE_CANVAS: "CREATE_CANVAS", //
};

export const USER_MENU_MODIFY_CONTEXT = {
  MOVE_POINT: "MOVE_POINT", //
  INSERT_POINT: "INSERT_POINT", //
};

export const ELEMENT_DRAGGING_STATE = {
  DRAGGING: "DRAGGING", //
  PAUSED: "PAUSED",
  ENDED: "ENDED"
};

export const UNIQUE_EVENTS =  
[
  awaEvents.CANVAS_EVENTS.click,
  awaEvents.CANVAS_EVENTS.dblclick,
  awaEvents.CANVAS_EVENTS.hover,
  awaEvents.CANVAS_EVENTS.press,
  awaEvents.CANVAS_EVENTS.release,
  awaEvents.CANVAS_EVENTS.mouseout
]

/* awa core class */

class awa {
  m_svgInstance: any;
  m_loonkInstance: Loonk;
  m_timeline:  any;
  m_timelineItems: any[];
  m_timelineCurrentTime: number;
  m_timelineMaxTime: number;
  m_reduxInstance: any;
  m_reduxState: any;
  m_selectedElement: null;
  m_selectedElementsKeys: any[];
  project: AwaTypes.T_AwaProject;
  m_scenes: any[];
  m_activeSceneId: null;
  m_awaElementsIds: any[];
  m_appMode: string;
  m_appModeContext: string;
  m_userActionState: string;
  m_userMenuSelectContext: string;
  m_userMenuCreateContext: string;
  m_userMenuModifyContext: string;
  m_selectedAnimation: string;
  m_elementDraggingState: string;
  m_flows: any[];
  m_interactions: any[];

  m_scenesCounter: number;
  m_flowsCounter: number;
  m_interactionsCounter: number;
  m_animations: any[];
  m_awaElementsCounter: number;

  m_activeTimeline: any;
  constructor(_reduxInstance, _reduxState) {
    // Instances___________________________

    this.m_svgInstance = SVG(MAINSVGID)
      .addTo(SCENE_BLOCK_CLASS)
      .size("100%", "100%");
    this.m_loonkInstance = new Loonk(MAINSVGID, this.m_svgInstance);

    this.initInfiniteView(this.m_svgInstance);

    /* Timeline props */
    this.m_timeline = anime.timeline({
      easing: "linear",
      duration: TIMELINE_MAX_DURATION,
      autoplay: false,
    });

    this.m_timelineItems = [];
    this.m_timelineCurrentTime = 0;
    this.m_timelineMaxTime = TIMELINE_MAX_DURATION;

    this.setActiveTimeline(this.m_timeline);

    /* ****************************************** */

    this.m_reduxInstance = _reduxInstance;
    this.m_reduxState = _reduxState;

    this.m_selectedElement = null;
    this.m_selectedElementsKeys = [];
    this.m_svgInstance._awa = this;
    this.m_loonkInstance._awa = this;
    this.m_timeline._awa = this;

    // TODO : All the data structures must be taken from an data storage source

    // this.project; // The main object of the file/project

    this.m_scenes = [];
    this.m_scenesCounter = 0;
    this.m_activeSceneId = null;



    this.m_awaElementsIds = [];
    this.m_awaElementsCounter = 0;

    this.m_appMode = APP_MODE.DESIGN;
    this.m_appModeContext = APP_MODE_CONTEXT.NONE;
    this.m_userActionState = USER_ACTION_STATE.SELECT;
    this.m_userMenuSelectContext = USER_MENU_SELECT_CONTEXT.NONE;
    this.m_userMenuCreateContext = USER_MENU_CREATE_CONTEXT.NONE;
    this.m_userMenuModifyContext = USER_MENU_MODIFY_CONTEXT.MOVE_POINT;

    this.m_selectedAnimation = MAIN_ANIM_ID;

    this.m_elementDraggingState = ELEMENT_DRAGGING_STATE.ENDED;

    // Proto Objects
    
    // this.m_previewType = PREVIEW_TYPES.scene;
    this.m_flows = [];
    this.m_interactions = [];
    this.m_flowsCounter = 0;
    this.m_interactionsCounter = 0;
    this.m_animations = [];

    // -------------------------------

    // Listeners --------------------------------
    /* DESIGN */
    this.onRequestCreateShape();
    this.onRequestDrawPath();
    this.onRequestQuitDrawPath();
    this.onRequestModifyPath();
    this.onRequestCreateCanvas();

    this.onRequestUpdateSelectedElementProperty();
    this.onrequestAddEffectToSelectedElement();

    this.onRequestDeleteElement();
    /* ANIMATION */

    this.onRequestResetTimelineItems();
    this.onRequestAddNewKeyframe();

    this.initializator();

    //-------------------------------------------


  }

  initializator()
  {
    // Group connectors-------------------------------------------------------------------
    var connectorsGroup = this.getSvgInstance().group().attr({id:CONNECTORS_GROUP_CLASS})
    //------------------------------------------------------------------------------------

    // Plug
    var plugRefGroup = this.getSvgInstance().group().attr({id:'awa--plug--ref'})
    var plugRef = this.getSvgInstance().circle(12,12).attr({cx:4, cy:4,fill:"#fff"}).stroke({width:2, color:'#50B5AD'}).addClass("--plug--");
    var plugPlusRef = this.getSvgInstance().path("M5 0V3H8V5H5V7.99C5 7.99 3.01 8 3 7.99V5H0C0 5 0.01 3.01 0 3H3V0H5Z").fill("#50B5AD");

    plugRefGroup.add(plugRef)
    plugRefGroup.add(plugPlusRef)

    var defs = this.getSvgInstance().defs()
    defs.add(plugRefGroup)

    //-------------------------
 
    // Project file definition
    this.initProjectFile();

  }

  initProjectFile(){

    
    var setDefaultScene = false;

    localDatabaseService.getProject()
    .then(project=>{

      this.setProject(project);

      var scenes = project.scenes;

      this.m_scenesCounter = project.scenesCounter;

      for (let i = 0; i < scenes.length; i++) 
      {
        const scene = scenes[i];

        this.m_scenes.push(scene);

        var sceneId = scene.id;

        this.createSceneContainer(sceneId)
 
        // Instantiate scene elements 
        // ........
        this.renderSceneElements(scene);

        // Set default active scene
        if(!setDefaultScene)
        {
          this.setActiveSceneId(sceneId)
          setDefaultScene = true;
        }
        
      }
      
    })
    .catch(e=>{
      console.log(e)
    })


    // console.log(this.project)

  }

  getSvgInstance() {
    return this.m_svgInstance;
  }

  saveProjectChanges = async ()=>
  {
    var _project = this.project;

    // Dispatch changes
    this.dispatchUpdateSceneElements();
    
    // Generate svg data
    var svgData = this.getSvgInstance().svg();
    _project.generatedSvg = svgData;
    // Update local project file
    localDatabaseService.updateProject(_project)

    // Update distant project file
    // var data = {data : _project}
    // userService.updateProject(_project.id, data);
   
    
  }

  getLoonkInstance() {
    return this.m_loonkInstance;
  }
  getTimelineInstance() {
    return this.m_timeline;
  }

  getAppMode() {
    return this.m_appMode;
  }

  getAppModeContext() {
    return this.m_appModeContext;
  }

  setDesignAppMode() {
    this.m_appMode = APP_MODE.DESIGN;

    this.m_reduxInstance.setAppMode(this.m_appMode);
  }

  setAnimeAppMode() {
    this.m_appMode = APP_MODE.ANIME;

    // Update store
    this.m_reduxInstance.setAppMode(this.m_appMode);
    this.m_reduxInstance.setUserActionState(USER_ACTION_STATE.SELECT);
    this.m_reduxInstance.setUserMenuActiveContext(USER_ACTION_STATE.SELECT);
  }

  setNoneAppModeContext() {
    this.m_appModeContext = APP_MODE_CONTEXT.NONE;
    this.m_reduxInstance.setAppModeContext(this.m_appModeContext);
  }

  setPrototypeAppModeContext() {
    this.m_appModeContext = APP_MODE_CONTEXT.PROTOTYPE;
    this.m_reduxInstance.setAppModeContext(this.m_appModeContext);
  }

  setDeveloperAppModeContext() {
    this.m_appModeContext = APP_MODE_CONTEXT.DEVELOPER;
    this.m_reduxInstance.setAppModeContext(this.m_appModeContext);
  }

  isNoneAppModeContext() {
    return this.getAppModeContext() == APP_MODE_CONTEXT.NONE;
  }

  isPrototypeAppModeContext() {
    return this.getAppModeContext() == APP_MODE_CONTEXT.PROTOTYPE;
  }

  isDeveloperAppModeContext() {
    return this.getAppModeContext() == APP_MODE_CONTEXT.DEVELOPER;
  }

  isDesignAppMode() {
    return this.m_appMode == APP_MODE.DESIGN;
  }

  isAnimeAppMode() {
    return this.m_appMode == APP_MODE.ANIME;
  }

  createAwaElementId(_type) {
    this.m_awaElementsCounter++;

    var idBody = AWA_ELEMENT_CLASS + _type.toLowerCase() + "--";

    // var typeIndex = this.getTypeIndex(_type, idBody); // For the name
    var id = idBody+ this.m_awaElementsCounter;
 
    return (
      id
    );
  }

  getTypeIndex(_type, _idBody)
  {
    var tag = _type;
    //map
    switch (_type) {
      case 'canvas':
        tag = 'g';
        break;
    
      default:
        break;
    }

    var typeChildren = this.getSvgInstance().find(tag)
    var needed = typeChildren.filter(e=>{
      var id = e.attr("id") || "";
      return id.includes(_idBody)
    })



  }

  _setUserActionState(_state) {
    this.m_userActionState = _state;
    // Update store
    this.m_reduxInstance.setUserMenuActiveContext(_state);
  }

  setTimelineTime(_t) {
    this.m_timelineCurrentTime = _t;
    // Update store
    this.m_reduxInstance.setTimelineTime(_t);
  }



  updateTimelineItems(_items : any, _nodeItems : any = null) {
    
    var selectedAnimation = this.getSelectedAnimation();

    if(selectedAnimation == MAIN_ANIM_ID)
    {
      let elementId = _nodeItems.targets;
      let element = _nodeItems;

      var elementIndex = this.getMainAnimations().findIndex(e=>e.targets == elementId);

      if(elementIndex != -1) 
      {
        this.getMainAnimations()[elementIndex] = {
          ...this.getMainAnimations()[elementIndex],
          ...element,
        };

      }
      else
      {
        this.getMainAnimations().push(element);
      } 
 
      // Dispatch timelineItems
      this.dispatchUpdateTimelineItems(this.m_timelineItems)
      
    }
    else // Custom animation
    {
      let selectedAnimation = this.getSelectedAnimation();
      let element = _nodeItems;

      var animationIndex = this.getAnimations().findIndex(e=>e.name == selectedAnimation);

      if(animationIndex != -1) 
      {
        var thisAnimation = this.getAnimations()[animationIndex];

        thisAnimation.animation = {
          ...thisAnimation.animation,
          ...element,
        };
      }
      else
      {
        thisAnimation.animation = element;
      } 
 
      // Update the animation
      this.updateAnimation(selectedAnimation, thisAnimation);
      // Dispatch timelineItems
      var animationTimelineItems = [thisAnimation.animation];
      this.dispatchUpdateTimelineItems(animationTimelineItems);

    }
    
    // console.log(_items)
    // console.log(_nodeItems)

    this.saveProjectChanges();

  }

  // setPreviewType(_type)
  // {
  //   this.m_previewType = _type;
  // }

  // getPreviewType()
  // {
  //   return this.m_previewType;
  // }

  resetTimelineItems(_newItems = []) {
    this.m_timelineItems = _newItems;
  }

  getTimelineItems(){
    return this.m_timelineItems;
  }

  setActiveSceneId(_id) {

    this.activateScene(_id);

    this.m_activeSceneId = _id;
  }

  activateScene(_id)
  {
    var currentScene = this.getSvgInstance().findOne("#"+this.m_activeSceneId);
    var nextScene = this.getSvgInstance().findOne("#"+_id);

    if(currentScene)
      currentScene.hide();
    if(nextScene)
      nextScene.show();

  }

  getActiveSceneId() {
    return this.m_activeSceneId;
  }

  getActiveSceneContainer() {
    var activeSceneId = this.getActiveSceneId();
    var selector = "#"+activeSceneId;
    return this.getSvgInstance().findOne(selector);
  }

  // Set or update
  setSceneElement(_elem)
  {
    // var _elemId = _elem.attr("id");

    // var scenes = this.getScenes();
    // var activeScene = this.getActiveSceneId();

    // var scene = scenes.find(s=>s.id == activeScene);
    // // Get scene items
    // var sceneItems : any[] = scene?.items.elements || [];
    // // Check if the element exist : UPDATE, else ADD
    // var thisElIndex : number = sceneItems?.findIndex(e=>e.id == _elemId) || -1;

    // var newSceneElement = this.mapElementToAwaObject(_elem);

    // if(thisElIndex == -1) // Add
    // {
    //   sceneItems?.push(newSceneElement)
    // }
    // else                  // Update
    // {
    //   var oldSceneElement = sceneItems.at(thisElIndex);
    //   var mergedElement = {...oldSceneElement, ...newSceneElement};
    //   sceneItems.splice(thisElIndex, mergedElement)
    // }

  }


  setSelectedElement(_elem) {
    this.m_selectedElement = _elem;

    // Update store : selectedElementId
    var selectedElementId = _elem.attr("id");
    // console.log("request update ...")
    this.m_reduxInstance.setSelectedElementId(selectedElementId);
    this.dispatchUpdateSelectedElement();

    // console.log(_elem);
  }

  getSelectedElement() : any {
    if (!this.m_selectedElement) {
      var elementId = "#" + this.m_reduxState.selectedElementId;
      this.m_selectedElement = this.getSvgInstance().find(elementId)[0];
    }

    return this.m_selectedElement;
  }

  setSelectedElementsKeys(_keys){
    this.m_selectedElementsKeys = _keys;

    this.dispatchSelectedSceneElements(_keys)
  }
  
  getSelectedElementsKeys(){
    return this.m_selectedElementsKeys;
  }

  setSelectedAnimation(_anim) {
    this.m_selectedAnimation = _anim;
 
    // this.dispatchUpdateSelectedElement();

  }

  getSelectedAnimation() {
    if (!this.m_selectedAnimation) {
      this.setSelectedAnimation(MAIN_ANIM_ID)
    }

    return this.m_selectedAnimation;
  }

  setActiveTimeline(_timeline)
  {
    this.m_activeTimeline = _timeline;
  }

  getActiveTimeline()
  {
    return this.m_activeTimeline;
  }

  getActiveTimelineItems()
  {
    var selectedAnimation = this.getSelectedAnimation();

    var timelineItems = this.m_timelineItems; // the main

    if(selectedAnimation != MAIN_ANIM_ID)
    {
      timelineItems = getTimelineItems(this.m_svgInstance, this.getActiveTimeline())
    }

    return timelineItems;
  }

  setElementDraggingStateDragging() {
    this.m_elementDraggingState = ELEMENT_DRAGGING_STATE.DRAGGING;
  }
  setElementDraggingStatePaused() {
    this.m_elementDraggingState = ELEMENT_DRAGGING_STATE.PAUSED;
  }
  setElementDraggingStateEnded() {
    this.m_elementDraggingState = ELEMENT_DRAGGING_STATE.ENDED;
  }
  getElementDraggingState() {
    return this.m_elementDraggingState;
  }
  isElementDraggingStateDragging() {
    return this.m_elementDraggingState == ELEMENT_DRAGGING_STATE.DRAGGING;
  }
  

  setFollowPath(_elem) {
    var selectedPathId = _elem.attr("id");
    var selector = "#" + selectedPathId;
    // console.log(_elem)
    var property = ANIMATABLE_PROPERTIES.followPath;
    var value = anime.path(selector, 0);

    var initialValue = null;
    var isLineDraw = false;
    awaEventEmitter.emit(awaEvents.ADD_NEW_KEYFRAME, {
      property,
      value,
      initialValue,
      isLineDraw,
    });
  }

  setMorphToPath(_elem) {
    var selectedPathId = _elem.attr("id");
    var selector = "#" + selectedPathId;

    var currentSelectedPathId = this.getSelectedElement().attr("id");
    var currentSelectedElementSelector = "#" + currentSelectedPathId;

    // console.log(_elem)
    var property = ANIMATABLE_PROPERTIES.morphTo;
    var value = /* _elem.attr("d") */ anime.path(selector, 0);
    var initialValue = /* this.getSelectedElement().attr("d") */ anime.path(
      currentSelectedElementSelector,
      0
    );

    var isLineDraw = false;
    awaEventEmitter.emit(awaEvents.ADD_NEW_KEYFRAME, {
      property,
      value,
      initialValue,
      isLineDraw,
    });
  }

  setUserSelectActionState() {
    this._setUserActionState(USER_ACTION_STATE.SELECT);
  }

  setUserCreateActionState() {
    this._setUserActionState(USER_ACTION_STATE.CREATE);
  }

  setUserDrawActionState() {
    this._setUserActionState(USER_ACTION_STATE.DRAW);
  }

  setUserModifyActionState() {
    this._setUserActionState(USER_ACTION_STATE.MODIFY);
  }

  getUserActionState() {
    return this.m_userActionState;
  }

  getUserMenuSelectContext() {
    return this.m_userMenuSelectContext;
  }

  getUserMenuModifyContext() {
    return this.m_userMenuModifyContext;
  }

  setUserMenuSelectContextFollowPath() {
    this.m_userMenuSelectContext = USER_MENU_SELECT_CONTEXT.SELECT_FOLLOW_PATH;
  }

  setUserMenuSelectContextMorphToPath() {
    this.m_userMenuSelectContext = USER_MENU_SELECT_CONTEXT.SELECT_MORPHTO_PATH;
  }

  resetUserMenuSelectContext() {
    this.m_userMenuSelectContext = USER_MENU_SELECT_CONTEXT.NONE;
  }

  setUserMenuModifyContextMovePoint() {
    this.m_userMenuModifyContext = USER_MENU_MODIFY_CONTEXT.MOVE_POINT;
  }

  setUserMenuModifyContextInsertPoint() {
    this.m_userMenuModifyContext = USER_MENU_MODIFY_CONTEXT.INSERT_POINT;
  }

  isUserActionStateSelect() {
    return this.getUserActionState() == USER_ACTION_STATE.SELECT;
  }

  isUserActionStateCreate() {
    return this.getUserActionState() == USER_ACTION_STATE.CREATE;
  }

  isUserActionStateDraw() {
    return this.getUserActionState() == USER_ACTION_STATE.DRAW;
  }

  isUserActionStateModify() {
    return this.getUserActionState() == USER_ACTION_STATE.MODIFY;
  }

  // Select Context
  isUserMenuSelectContextSelectDefault() {
    return this.getUserMenuSelectContext() == USER_MENU_SELECT_CONTEXT.NONE;
  }

  isUserMenuSelectContextSelectFollowPath() {
    return (
      this.getUserMenuSelectContext() ==
      USER_MENU_SELECT_CONTEXT.SELECT_FOLLOW_PATH
    );
  }

  isUserMenuSelectContextSelectMorphToPath() {
    return (
      this.getUserMenuSelectContext() ==
      USER_MENU_SELECT_CONTEXT.SELECT_MORPHTO_PATH
    );
  }

  // Modify context
  isUserMenuModifyContextMovePoint() {
    return (
      this.getUserMenuModifyContext() == USER_MENU_MODIFY_CONTEXT.MOVE_POINT
    );
  }

  isUserMenuModifyContextInsertPoint() {
    return (
      this.getUserMenuModifyContext() == USER_MENU_MODIFY_CONTEXT.INSERT_POINT
    );
  }

  // utils

  quitCreateState() {
    this.setUserSelectActionState();
    this.m_reduxInstance.setUserActionState(USER_ACTION_STATE.SELECT);
    this.m_reduxInstance.setUserMenuActiveContext(USER_ACTION_STATE.SELECT);
  }

  quitDrawState() {
    this.setUserSelectActionState();
    this.m_reduxInstance.setUserActionState(USER_ACTION_STATE.SELECT);
    this.m_reduxInstance.setUserMenuActiveContext(USER_ACTION_STATE.SELECT);
  }
  // Dispatchers *************************************

  dispatchRequestCreateShape(_data) {
    //Dispatch an event
    awaEventEmitter.emit(awaEvents.CREATE_SHAPE, { detail: { type: _data } });
  }

  dispatchRequestDrawPath() {
    //Dispatch an event
    awaEventEmitter.emit(awaEvents.DRAW_PATH, {});

    // Update store
    this.m_reduxInstance.setUserActionState(USER_ACTION_STATE.DRAW);
  }

  dispatchRequestQuitDrawPath() {
    //Dispatch an event
    awaEventEmitter.emit(awaEvents.QUIT_DRAW_PATH, {});
  }

  dispatchRequestModifyPath() {
    //Dispatch an event
    awaEventEmitter.emit(awaEvents.MODIFY_PATH, {});

    // Update store
    this.m_reduxInstance.setUserActionState(USER_ACTION_STATE.MODIFY);
  }

  dispatchRequestCreateCanvas() {
    //Dispatch an event
    awaEventEmitter.emit(awaEvents.CREATE_CANVAS, {});
  }

  dispatchUpdateSelectedElement() {
    //Dispatch an event
    var selectedElementId = this.getSelectedElement().attr("id");

    awaEventEmitter.emit(awaEvents.UPDATE_SELECTED_ELEMENT, {
      detail: { selectedElementId: selectedElementId },
    });
  }

  dispatchUpdateTimelineItems(_timelineItems) {
    //Dispatch an event
    awaEventEmitter.emit(awaEvents.UPDATE_TIMELINE_ITEMS, {
      detail: { timelineItems: _timelineItems },
    });
  }

  dispatchSwitchScene() {
    //Dispatch an event
    awaEventEmitter.emit(awaEvents.SWITCH_SCENE, {
      detail: { },
    });
  }

  dispatchUpdateScenes(_newSceneId : any = null) {
    //Dispatch an event
    awaEventEmitter.emit(awaEvents.UPDATE_SCENES, {
      detail: { newSceneId: _newSceneId },
    });
  }

  dispatchUpdateSceneElements() {
    //Dispatch an event
    awaEventEmitter.emit(awaEvents.UPDATE_SCENE_ITEMS, { detail: {} });
  }

  dispatchSelectedSceneElements(_selectedKeys : string[]) {
    //Dispatch an event
    awaEventEmitter.emit(awaEvents.SELECTED_SCENE_ITEMS, { detail: {selectedKeys : _selectedKeys} });
  }

  dispatchDeleteElement = (_id)=>{
    awaEventEmitter.emit(awaEvents.DELETE_AWA_ELEMENT, {id:_id})
  }

  dispatchNewCustomAnimation(_newAnimationName) {
    //Dispatch an event
    awaEventEmitter.emit(awaEvents.NEW_CUSTOM_ANIMATION, {
      detail: { newAnimationName: _newAnimationName },
    });
  }

  // End of dispatchers ********************************

  // Listeners ******************************************

  onRequestCreateShape() {
    awaEventEmitter.on(awaEvents.CREATE_SHAPE, (_data) => {
      // TODO : Call following lines when shape creation (drag to create) ends
      this.m_reduxInstance.setUserActionState(USER_ACTION_STATE.SELECT);
      this.m_reduxInstance.setUserMenuActiveContext(USER_ACTION_STATE.SELECT);


      var _type = _data.detail.type;

      var sceneEl;

      switch (_type) {
        case USER_MENU_CREATE_CONTEXT.CREATE_RECT:
          var awaElementId = this.createAwaElementId("rect");
          
          this.m_awaElementsIds.push(awaElementId);

          sceneEl = this.m_svgInstance
            .rect(100, 70)
            .attr({
              id: awaElementId,
              x: 25,
              y: 25,
              fill: "#fff",
              stroke: "#000",
              "stroke-width": 1, // Setting camelCase value override the tween property
              class: "awa-element-rect",
            })
            .draggable(this.getLoonkInstance())
            .selectable(this.getLoonkInstance());


          break;

        case USER_MENU_CREATE_CONTEXT.CREATE_CIRCLE:
          var awaElementId = this.createAwaElementId("circle");

          this.m_awaElementsIds.push(awaElementId);

          sceneEl = this.m_svgInstance
            .circle(80)
            .attr({
              id: awaElementId,
              cx: 200,
              cy: 200,
              fill: "#fff",
              stroke: "#000",
              "stroke-width": 1,
            })
            .draggable(this.getLoonkInstance())
            .selectable(this.getLoonkInstance());

          break;
      }

      sceneEl.parentId(this.getActiveSceneId())

      // Add to scene
      if(sceneEl)
      {
        // Add to container
        this.addElementToScene(sceneEl)
      }

      // Quit this state
      this.quitCreateState();
 

    });
  }

  onRequestDrawPath() {
    awaEventEmitter.on(awaEvents.DRAW_PATH, (_data) => {
      this.setUserDrawActionState();
      this.getLoonkInstance().enterDrawState();
    });
  }

  onRequestQuitDrawPath() {
    awaEventEmitter.on(awaEvents.QUIT_DRAW_PATH, (_data) => {
      this.getLoonkInstance().quitDrawState();
    });
  }

  onRequestModifyPath() {
    awaEventEmitter.on(awaEvents.MODIFY_PATH, (_data) => {
      this.getLoonkInstance().enterEditState();
    });
  }

  onRequestCreateCanvas() {
    awaEventEmitter.on(awaEvents.CREATE_CANVAS, (_data) => {
      // TODO : Call following lines when shape creation (drag to create) ends
      this.m_reduxInstance.setUserActionState(USER_ACTION_STATE.SELECT);
      this.m_reduxInstance.setUserMenuActiveContext(USER_ACTION_STATE.SELECT);

      var awaElementId = this.createAwaElementId("canvas");
      var mainCanvasId = awaElementId + GROUP_ID_BODY;
      // Update m_awaElementsIds
      this.m_awaElementsIds.push(mainCanvasId);

      var canvasGroup = this.m_svgInstance.group(); //The root canvas element 

      var canvasItemsGroupId = awaElementId + CLIP_ID_BODY + GROUP_ID_BODY;
      var canvasItemsGroup = this.m_svgInstance.group()
      .attr({id : canvasItemsGroupId});


      canvasGroup.attr({ id: mainCanvasId });
      var canvasName = "canvas "+this.m_awaElementsCounter;
      canvasGroup.m_name = canvasName;
      canvasGroup._isCanvas = true; // Helper to verify canvas elements

      canvasItemsGroup.addClass(CLIP_ID_BODY + GROUP_ID_BODY);

      var canvasTitleItem = this.m_svgInstance.text(canvasName)
        .attr({ id: awaElementId + "--title" })
        .font({family:'Montserrat', size:11.5, color:'#000'})
        .move(425, 60)
      canvasTitleItem.addClass(IGNORE_PREVIEW_CLASS)

      var canvasClipper = this.m_svgInstance
        .clip()
        .attr({ id: awaElementId + CLIP_ID_BODY })

        var rwidths = [200, 270]
        var rheights = [250, 200]

        var rw = rwidths[Math.floor(Math.random() * rwidths.length)]
        var rh = rheights[Math.floor(Math.random() * rheights.length)]

      var canvasClipRect = this.m_svgInstance.rect(rw, rh).attr({
        id: awaElementId + CONTAINER_ID_BODY,
        x: 425,
        y: 85,
        fill: "#fff",
        opacity: 0,
        stroke: "#1a1a1a",
        "stroke-width": 1, // Setting camelCase value override the tween property
        class: "awa-element-canvas",
      });


      var canvasClipRectClone = canvasClipRect.clone().attr({ opacity: 1 });

      var canvasClipRectUse = this.m_svgInstance.use(canvasClipRect);

      // canvasClipRect.node.style.pointerEvents = "none";

      // Use the use element to set the clip rect : like so when the original is moved,
      // the use element is also moved without glitching effect
      canvasClipper.add(canvasClipRectUse);

      canvasItemsGroup.clipWith(canvasClipper);

      canvasGroup.add(canvasClipRectClone); // add clone for background
      canvasGroup.add(canvasClipRect); // add real rect for clipPath movement ref
      canvasGroup.add(canvasItemsGroup); // add itemsGroup to be moved with the canvas ... without custom calculations

      canvasGroup.add(canvasTitleItem); // add title block : To keep it at top

      canvasGroup.draggable(this.getLoonkInstance());
      canvasGroup.selectable(this.getLoonkInstance());

      // Quit this state
      this.quitCreateState();

      // Update default Flow
      if(this.getFlows()[0].canvas == null) this.getFlows()[0].canvas = mainCanvasId;

      // Add to scene
      var sceneEl = canvasGroup;
      if(sceneEl)
      {
        var canvasAttributes = canvasGroup.attr();
        var containerAttributes = canvasClipRect.attr();
        
        delete containerAttributes.x;
        delete containerAttributes.y;

        sceneEl.path = null; // canvas path turns to be a function
        // Add to container
        this.addCanvasToScene(sceneEl, {...containerAttributes, ...canvasAttributes})

      }

    });
  }

  onRequestUpdateSelectedElementProperty() {
    awaEventEmitter.on(awaEvents.UPDATE_SELECTED_ELEMENT_PROPERTY, (_data) => {
      var propertyName = _data.property;
      var value = _data.value;

      if (!this.getSelectedElement()) return;
      // console.log(this.getSelectedElement())

      switch (propertyName) {
        case "x":
          this.getSelectedElement().x(value);
          break;

        case "y":
          this.getSelectedElement().y(value);
          break;

        case "fill":

          if(isGradient(value))
          {
            var data = getGradientValues(value);
            this.getSelectedElement().setGradientElement("fill", data.type, data.angle, data.values)
          }
          else
          {
            this.getSelectedElement().fill(value);
          }

          // Define base color
          this.getSelectedElement().baseFill(value);

          break;

        case "stroke":
          
          if(isGradient(value))
          {
            var data = getGradientValues(value);
            this.getSelectedElement().setGradientElement("stroke", data.type, data.angle, data.values)
          }
          else
          {
            this.getSelectedElement().stroke({ color: value });
          }

          // Define base color
          this.getSelectedElement().baseStroke(value);

          break;

        case "opacity":
          this.getSelectedElement().opacity(value);
          break;

        case "strokeWidth":
          this.getSelectedElement().stroke({ width: value });
          break;

        case "rotation":
          this.getSelectedElement().transform({ rotate: value });
          break;

        case "scale":
          this.getSelectedElement().transform({ scale: value });
          break;

        case "strokeDasharray":
          this.getSelectedElement().stroke({ dasharray: value });
          break;

        case "strokeDashoffset":
          this.getSelectedElement().stroke({ dashoffset: value });
          break;

        case "effects":
          var removedEffectId = _data.removedEffectId;

          this.getSelectedElement().effects(value);
          // Rerender new effects
          if (removedEffectId)
            this.getSelectedElement().removeEffect(removedEffectId);

          break;

        default:
          break;
      }

      // 
      if(this.getSelectedElement())
      {
        // Update scene's element
        this.updateSceneElementObject(this.getSelectedElement())
      }
 

    });
  }

  onrequestAddEffectToSelectedElement() {
    awaEventEmitter.on(awaEvents.ADD_EFFECT_TO_SELECTED_ELEMENT, (_data) => {
      var effect = _data.effect;

      if (!this.getSelectedElement()) return;

      var effects = this.getSelectedElement().effects();
      var newEffect = this.createEffect(effect);
      effects.push(newEffect);
      // Render effects
      this.getSelectedElement().effector().chainEffects(effects);

      // Save
      this.saveProjectChanges();

    });
  }

  createEffect(_effect) {
    var effect = _effect;

    switch (_effect.name) {
      case ELEMENT_EFFECTS.dropShadow:
        effect.properties = {
          x: 5,
          y: 5,
          blur: 0,
          spread: 0,
          color: "#000000",
        };
        break;

      case ELEMENT_EFFECTS.blur:
        effect.properties = { blur: 5 };
        break;

      case ELEMENT_EFFECTS.innerShadow:
        effect.properties = {
          x: 5,
          y: 5,
          blur: 0,
          spread: 0,
          color: "#000000",
        };
        break;

      case ELEMENT_EFFECTS.inset:
        effect.properties = { depth: 0, color: "#000000" };
        break;

      default:
        break;
    }

    return effect;
  }


  onRequestDeleteElement() {
    awaEventEmitter.on(awaEvents.DELETE_AWA_ELEMENT, (_data) => {

      var id = _data.id;
      var selector = "#"+id;
      var element = this.getSvgInstance().findOne(selector)

      if(element)
        element.remove();

    })

  }

  //--------------------- ANIMATIONS ----------------------

  onRequestAddNewKeyframe() {
    awaEventEmitter.on(awaEvents.ADD_NEW_KEYFRAME, (_data) => {
      var anim = _data;
      var animTarget = "#" + this.getSelectedElement().attr("id");
      var _animProperty = anim.property;
      /* Get the real corresponding animatable property */
      var animProperty = ANIMATABLE_PROPERTIES[_animProperty];

      var hasTwinProperty = false;
      var twinPoperty : any = null;

      if (_animProperty == "scale") {
        hasTwinProperty = true;
        twinPoperty = "scaleY";
      }

      var animValue = anim.value;
      var animInitialValue = anim.initialValue;
      var _animIsLineDraw = anim.isLineDraw;

      // console.log(_data);
      var timelineItems = this.getActiveTimelineItems();

      var globalAnims = [...timelineItems];//[...this.m_timelineItems];
      // Check if target exist : else create
      var nodeAnims = globalAnims.find((i) => i.targets == animTarget) || {
        targets: animTarget,
        [animProperty]: [],
      };

      var currentAnims = { ...nodeAnims };

      if (!currentAnims[animProperty]) currentAnims[animProperty] = []; // Initialize empty array

      var currentAnimsIndex = globalAnims.findIndex(
        (i) => i.targets == animTarget
      );

      var targetedProperty = animProperty;
      var keyTime = this.m_timelineCurrentTime;

      var first = false;

      if (currentAnims[targetedProperty].length == 0) {
        // No present animation before
        first = true;

        var tween0 = {
          value: _animIsLineDraw ? animValue : animInitialValue, // Reverse in the case of line draw
          duration: 0,
          delay: 0,
          keyTime: 0,
        };

        var tween1 = {
          value: _animIsLineDraw ? animInitialValue : animValue, // Reverse in the case of line draw
          duration: keyTime,
          delay: 0,
          keyTime: keyTime,
        };

        currentAnims[targetedProperty].push(tween0, tween1);

        if (hasTwinProperty) {
          currentAnims[twinPoperty] = [];

          var _tween0 = {
            value: animInitialValue,
            duration: 0,
            delay: 0,
            keyTime: 0,
          };

          var _tween1 = {
            value: animValue,
            duration: keyTime,
            delay: 0,
            keyTime: keyTime,
          };

          currentAnims[twinPoperty].push(_tween0, _tween1);
        }
      } // Add Or Update existing tween
      else {
        // Get currentAnims index in timelineItems
        currentAnimsIndex = this.m_timelineItems.indexOf(currentAnims);

        var newTweens = createNewTween(
          currentAnims,
          keyTime,
          targetedProperty,
          animValue
        );
        currentAnims[targetedProperty] = newTweens;

        if (hasTwinProperty) {
          // currentAnims[twinPoperty] = [];

          var newTweens = createNewTween(
            currentAnims,
            keyTime,
            twinPoperty,
            animValue
          );
          currentAnims[twinPoperty] = newTweens;
        }
      }

      // Update globalAnims
      if (currentAnimsIndex == -1) globalAnims.push(currentAnims);
      else globalAnims[currentAnimsIndex] = currentAnims;

       
      // Rerender by removing and then add - Seek the same keyTime to avoid frame jump
      this.reRenderNodeAnims(
        globalAnims,
        currentAnims,
        animTarget,
        keyTime,
        first
      );
    });
  }

  onRequestResetTimelineItems() {
    awaEventEmitter.on(awaEvents.RESET_TIMELINE_ITEMS, (_data) => {
      this.resetTimelineItems(_data);
    });
  }

  // ******************************************************

  // CONNECTORS

  createConnector(source, target, interactionId, init=false){

    var conn = source.connectable({
      targetAttach: 'perifery',
      sourceAttach: 'perifery',
      type: 'curved',
      loonk:this.getLoonkInstance(),
      interactionId : interactionId,
      init:init
      }, target);

    return conn;
  }


  /* ANIMATION METHODS */

  reRenderNodeAnims(
    _globalAnims,
    _nodeAnims,
    _targetedId,
    _newKeyTime,
    _first = false
  ) {
    if (!_first) this.getActiveTimeline().remove(_targetedId);

    // Rerender - Seek pos
    setTimeout(() => {
      this.getActiveTimeline().add(_nodeAnims, 0);
      // Seek added keyTime
      this.getActiveTimeline().seek(_newKeyTime);

      // console.log(_nodeAnims)

      // update timelineItems from timeline instance
      //   this.updateTimelineItemsFromTimeline(this.m_timeline);
      this.updateTimelineItems(_globalAnims, _nodeAnims);

      // Set the element as animated
      this.updateElementAnimatedStatus();
    }, RERENDER_SEEK_TIMELINE_DELAY);
  }

  updateTimelineItemsFromTimeline(_timeline) {
    var timelineItems = getTimelineItems(_timeline);

    this.updateTimelineItems(timelineItems);
  }

  updateElementAnimatedStatus(_status = true) {
    this.getSelectedElement().m_isAnimated = _status;
  }

  /* ******************************************************* */

  // FLOWS - INTERACTIONS - SAVED ANIMATIONS

  setProject(_project)
  {
    this.project = _project;
  }
  
  getProject()
  {
    return this.project;
  }

  getScenes()
  {
    var scenes : AwaTypes.T_AwaProjectScene[] = this.project?.scenes;
    return scenes;
  }

  getActiveScene()
  {
    // Get current scene
    var scene : any = this.getScenes().find(s=>s.id == this.getActiveSceneId());
    return scene;
  }

  getFlows()
  {
    // Get current scene
    var scene = this.getActiveScene();
    return scene?.items.flows;
  }

  getInteractions()
  {
    // Get current scene
    var scene = this.getActiveScene();
    return scene?.items.interactions;
  }

  getElementInteractions(_target)
  {
    var interactions = this.getInteractions();

    var elementInteractions = interactions?.filter(i=>i.basedOn.target == _target);

    return elementInteractions;

  }

  getMainAnimations()
  {
    // Get current scene
    var scene = this.getActiveScene();
    return scene?.items.animations.main;
    // return this.m_animations;
  }

  getAnimations()
  {
    // Get current scene
    var scene = this.getActiveScene();
    return scene?.items.animations.custom;
    // return this.m_animations;
  }

  
  generateSceneId()
  {
    return SCENE_CLASS+(this.project.scenesCounter+1);
  }

  generateFlowId()
  {
    return BASE_FLOW_ID+" "+(this.project.flowsCounter+1);
  }

  // create the scene object with its "g" (group) element associated
  createScene()
  {
    var sceneId = this.generateSceneId();

    var scene : AwaTypes.T_AwaProjectScene = {
      id:sceneId,
      name : BASE_SCENE_ID+" "+(this.project.scenesCounter+1),
      items : {
        flows : [],
        interactions : [],
        animations : {
          main : [],
          custom : []
        },
        elements : []
      }
      
    }

    if(!this.getScenes().find(f=>f.id == scene.id))
    {
      this.getScenes().push(scene);

      this.project.scenesCounter++;

      this.createSceneContainer(sceneId)

      // Save project object
      this.saveProjectChanges();

      // Dispatch scene creation for left panel (and scene)
      this.dispatchUpdateScenes(sceneId)

      return true;
    }

    return false;

  }

  // Create the g associated element for a scene
  createSceneContainer(sceneId)
  {
    this.m_svgInstance
      .group()
      .attr({
        id: sceneId,
        class: SCENE_CLASS,
      })
  }

  renderSceneElements(scene)
  {
    var elements = scene.items.elements;

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];

      if(isCanvasElement(el.id))
      {
        var parentId = el.parent;
        var parent = this.m_svgInstance.findOne("#"+parentId)

        var awaElementId = el.id.split(GROUP_ID_BODY)[0];
        var mainCanvasId = awaElementId + GROUP_ID_BODY;

        var canvasGroup = this.m_svgInstance.group()
        .translate(el.node.attributes.x, el.node.attributes.y); //The root canvas element 
        
        var canvasItemsGroupId = awaElementId + CLIP_ID_BODY + GROUP_ID_BODY;
        var canvasItemsGroup = this.m_svgInstance.group()
        .attr({id : canvasItemsGroupId});

        canvasGroup.attr({ id: mainCanvasId });
        var canvasName = el.name;
        canvasGroup.m_name = canvasName;
        canvasGroup._isCanvas = true; // Helper to verify canvas elements

        canvasItemsGroup.addClass(CLIP_ID_BODY + GROUP_ID_BODY);

        var canvasTitleItem = this.m_svgInstance.text(canvasName)
          .attr({ id: awaElementId + "--title" })
          .font({family:'Montserrat', size:11.5, color:'#000'})
          .move(0, -25)

        canvasTitleItem.addClass(IGNORE_PREVIEW_CLASS)

        var canvasClipper = this.m_svgInstance
          .clip()
          .attr({ id: awaElementId + CLIP_ID_BODY })

        var rw = el.node.attributes.width
        var rh = el.node.attributes.height

        var canvasClipRect = this.m_svgInstance.rect(rw, rh).attr({
          id: awaElementId + CONTAINER_ID_BODY,
          x: 0,
          y: 0,
          fill: el.node.attributes.fill,
          opacity: 0,
          stroke: el.node.attributes.stroke,
          "stroke-width": el.node.attributes.strokeWidth || 1, // Setting camelCase value override the tween property
          class: "awa-element-canvas",
        });


        var canvasClipRectClone = canvasClipRect.clone().attr({ opacity: 1 });

        var canvasClipRectUse = this.m_svgInstance.use(canvasClipRect);

        // canvasClipRect.node.style.pointerEvents = "none";

        // Use the use element to set the clip rect : like so when the original is moved,
        // the use element is also moved without glitching effect
        canvasClipper.add(canvasClipRectUse);

        canvasItemsGroup.clipWith(canvasClipper);

        canvasGroup.add(canvasClipRectClone); // add clone for background
        canvasGroup.add(canvasClipRect); // add real rect for clipPath movement ref
        canvasGroup.add(canvasItemsGroup); // add itemsGroup to be moved with the canvas ... without custom calculations

        canvasGroup.add(canvasTitleItem); // add title block : To keep it at top

        canvasGroup.draggable(this.getLoonkInstance());
        canvasGroup.selectable(this.getLoonkInstance());

        parent.add(canvasGroup)

      }
      else
      {

        var type = el.type;
        var sceneEl;

        switch (type) {
          case ELEMENTS_TYPES.rect:

            var awaElementId = el.id;
            var parentId = el.parent;
            var parent = this.m_svgInstance.findOne("#"+parentId)

            sceneEl = this.m_svgInstance
              .rect(el.node.attributes.width, el.node.attributes.height)
              .attr(el.node.attributes)
              .draggable(this.getLoonkInstance())
              .selectable(this.getLoonkInstance());
              
              if(isCanvasClipElement(parentId))
              {
                sceneEl.addClass(INCANVAS_ITEM_CLASS)

                sceneEl.canvasOwnerId(el.canvasOwnerId);
              }

              parent.add(sceneEl)

            break;
  
          case ELEMENTS_TYPES.circle:
            
            var awaElementId = el.id;
            var parentId = el.parent;

            var parent = this.m_svgInstance.findOne("#"+parentId)
    
            sceneEl = this.m_svgInstance
              .circle(80)
              .attr(el.node.attributes)
              .draggable(this.getLoonkInstance())
              .selectable(this.getLoonkInstance());
              
              if(isCanvasClipElement(parentId))
              {
                sceneEl.addClass(INCANVAS_ITEM_CLASS)
                
                sceneEl.canvasOwnerId(el.canvasOwnerId);
              }

              parent.add(sceneEl)

            break;
        }
  

      }
      
    }

  }

  deleteScene(_id)
  {
    var thisSceneIndex = this.getScenes().findIndex(f=>f.id == _id);
    if(thisSceneIndex != -1)
    {
      this.getScenes().splice(thisSceneIndex, 1);

      // Dispatch scene creation for left panel (and scene)
      this.dispatchUpdateScenes();

      this.saveProjectChanges();

      return true;
    }
    return false;
  }
  
  
  updateSceneName(_sceneId, _newName)
  {
    var thisSceneIndex = this.getScenes().findIndex(f=>f.id == _sceneId);
    console.log(_newName)
    if(thisSceneIndex != -1)
    {
      this.getScenes()[thisSceneIndex].name = _newName;

      // Dispatch scene creation for left panel (and scene)
      this.dispatchUpdateScenes(_sceneId);
      
      this.saveProjectChanges();

      return true;
    }
    return false;
  }

  
  addCanvasToScene(sceneEl, attributes, parent : any = null) // Adds or Update if exist
  {
   
    if(!parent)
      parent = this.getActiveSceneContainer();

    parent.add(sceneEl);

    this.updateSceneElementObject(sceneEl, attributes);

  }

  addElementToScene(sceneEl, parent:any = null) // Adds or Update if exist
  {
   
    if(!parent)
      parent = this.getActiveSceneContainer();

    parent.add(sceneEl);

    this.updateSceneElementObject(sceneEl);

  }
  
  updateSceneElementObject(sceneEl,  attributes:any = null)
  {
    // Add this element object to scene items
    var elObject = this.elementToObject(sceneEl, attributes);

    this.updateSceneElements(elObject, attributes)

    // Dispatch update
    this.dispatchSelectedSceneElements([]);
    
  }
  
  updateSceneElementAttributes(id, attributes)
  {
    var scene = this.getActiveScene();

    var sceneItems = scene.items.elements;
    var thisElIndex = sceneItems?.findIndex(e=>e.id == id);

    if(thisElIndex != -1)
    {
      var elObject = sceneItems[thisElIndex];

      elObject.node.attributes = {...elObject.node.attributes, ...attributes}
      
      sceneItems[thisElIndex] = elObject;

      this.saveProjectChanges();

    }

  }

  updateSceneElementParent(id, newParentId)
  {
    var scene = this.getActiveScene();

    var sceneItems = scene.items.elements;
    var thisElIndex = sceneItems?.findIndex(e=>e.id == id);

    if(thisElIndex != -1)
    {
      var elObject = sceneItems[thisElIndex];

      elObject.parent = newParentId ? newParentId : scene.id;
      
      if(newParentId && isCanvasClipElement(newParentId)) // Appended to a canvas : then update canvasOwnerId
      {
        var canvasOwnerId = newParentId.split(CLIP_ID_BODY).join(''); // remove the clip class

        elObject.canvasOwnerId = canvasOwnerId;

      }
      else if(!newParentId)
      {
        elObject.canvasOwnerId = null;
      }

      sceneItems[thisElIndex] = elObject;

      this.saveProjectChanges();

    }

  }

  updateSceneElements(elObject, attributes:any = null)
  {
    var scene = this.getActiveScene();

    var sceneItems = scene.items.elements;

    var thisElIndex = sceneItems?.findIndex(e=>e.id == elObject.id);

    if(thisElIndex != -1)
    {
      elObject.node.attributes = {...elObject.node.attributes, ...attributes}
      sceneItems[thisElIndex] = elObject;
    }
    else
    {
      sceneItems.push(elObject);
    }

    this.project.awaElementsCounter++;

    this.saveProjectChanges();

  }

  elementToObject(sceneEl, attributes=null)
  {
    var elObject : AwaTypes.T_AwaEl = {

      id : sceneEl.attr('id'),
      type : sceneEl.type,
      name: sceneEl.m_name,
      parent : sceneEl.parentId() || this.getActiveSceneId(), // if null get the active scene as parent
      canvasOwnerId : sceneEl.canvasOwnerId(),
      path: sceneEl.path,
      pathString: sceneEl.pathString,
      node : {
        attributes : attributes ? attributes : sceneEl.attr(),
        anchor : sceneEl.node.anchor,
        effects : sceneEl.node.effects
      },
      options : {visible : true, locked : false},
      events : []//sceneEl.events, events used ?

    }

    return elObject;
    
  }

  deleteElementFromScene(_id)
  {
    var scene = this.getActiveScene();

    var sceneItems = scene?.items.elements;
 
    // Remove the element
    var thisElIndex : number = sceneItems?.findIndex(e=>e.id == _id) || -1;
    sceneItems?.splice(thisElIndex, 1);

    // Recursive deletion
    this.deleteRecursivelySceneItem(sceneItems, _id);
    
    // Delete from DOM
    this.dispatchDeleteElement(_id);

    // dispatchUpdateSceneElements
    this.dispatchUpdateSceneElements();

  }

  deleteRecursivelySceneItem(sceneItems, id)
  {
    var thisElChildren = sceneItems.filter(e=>e.parent == id)

    thisElChildren.forEach(child => {
      
      var childId = child.id;
      var thisChildIndex = sceneItems.findIndex(e=>e.id == childId);
      if(thisChildIndex != -1)
      {
        sceneItems.splice(thisChildIndex, 1);

        this.deleteRecursivelySceneItem(sceneItems, childId)
      }

    });
  }

  createFlow(_canvas)
  {
    var flowName = this.generateFlowId();
    var flow =  {
      id : flowName,
      name: flowName,
      canvas: _canvas, //
      default:false, // 
    };

    this.addFlow(flow);

  }

  deleteFlow(_id)
  {
    var thisFlowIndex = this.getFlows().findIndex(f=>f.id == _id);
    if(thisFlowIndex != -1)
    {
      this.getFlows().splice(thisFlowIndex, 1);

      this.saveProjectChanges();

      return true;
    }
    return false;
  }
  

  getElementFlow(_canvas)
  {
    var flow = this.getFlows().find(f=>f.canvas == _canvas && f.id != "default");

    return flow;
  }

  addFlow(_flow)
  {
    if(!this.getFlows().find(f=>f.name == _flow.name))
    {
      this.getFlows().push(_flow);

      this.saveProjectChanges();

      this.project.flowsCounter++;
      return true;
    }

    return false;

  }

  updateFlowName(_FlowId, _newName)
  {
    var thisFlowIndex = this.getFlows().findIndex(f=>f.id == _FlowId);
    if(thisFlowIndex != -1)
    {
      this.getFlows()[thisFlowIndex].name = _newName;

      this.saveProjectChanges();

      return true;
    }
    return false;
  }

  isStartingFlow(_id)
  {
    var flows = this.getFlows();

    return flows?.includes(_id);
  }

  createInteraction(interactionId, basedOnTarget, basedOnTargetCanvas, actionTarget, actionTargetCanvas)
  {
    var interaction = 
    {
      id:interactionId,
      active : true,
      name:interactionId,
      basedOn:{target:basedOnTarget, canvas: basedOnTargetCanvas, event:awaEvents.CANVAS_EVENTS.none},
      action:{type:"animate" ,target: actionTarget, canvas: actionTargetCanvas, animation:null, options:{}},
    }

    this.saveProjectChanges();

    return interaction;
  }

  addInteraction(_interaction)
  {
    var basedOnTarget = _interaction.basedOn.target;
    var basedOnEvent = _interaction.basedOn.event;
    var actionTarget = _interaction.action.target;
 
    // Check creation possibility
    if(this.getInteractions()?.find(i=>(i.basedOn.target == basedOnTarget) && (i.action.target == actionTarget) && (i.basedOn.event == basedOnEvent) ))
    {
      if(UNIQUE_EVENTS.includes(basedOnEvent))
        return false;
    }

    this.getInteractions()?.push(_interaction);
    this.project.interactionsCounter++;

    this.saveProjectChanges();

    return true;

  }

  deleteInteraction(_id)
  {
    var thisInteractionIndex = this.getInteractions()?.findIndex(f=>f.id == _id) || -1;
    if(thisInteractionIndex != -1)
    {
      this.getInteractions()?.splice(thisInteractionIndex, 1);
      
      this.saveProjectChanges();

      return true;
    }
    return false;
  }

  updateInteractionName(_interactionId, _newName)
  {
    var thisInteractionIndex = this.getInteractions()?.findIndex(f=>f.id == _interactionId);
    if(thisInteractionIndex != -1)
    {
      var interactions : any[] = this.getInteractions() || [];
      interactions[thisInteractionIndex].name = _newName;

      this.saveProjectChanges();

      return true;
    }
    return false;
  }

  updateInteractionStatus(_interactionId, _status)
  {
    var thisInteractionIndex = this.getInteractions()?.findIndex(f=>f.id == _interactionId);
    if(thisInteractionIndex != -1)
    {
      var interactions : any[] = this.getInteractions() || [];
      interactions[thisInteractionIndex].status = _status;

      interactions[thisInteractionIndex].active = _status;

      this.saveProjectChanges();

      return true;
    }
    return false;
  }

  updateInteraction(id, root, target, value)
  {
    var thisInteractionIndex = this.getInteractions()?.findIndex(f=>f.id == id);
    if(thisInteractionIndex != -1)
    {
      var interactions : any[] = this.getInteractions() || [];

      interactions[thisInteractionIndex][root][target] = value;

      // Action Target case : Update connection
      if(root == INTERACTION_ACTION_REF && target == INTERACTION_TARGET_REF) // {... action : {target: ...}}
      {
        var basedOnTarget = interactions[thisInteractionIndex].basedOn.target; 

        var connectorSource = this.getSvgInstance().findOne("#"+basedOnTarget);
        var connectorTarget = this.getSvgInstance().findOne("#"+value);

        // Find the current connection
        var sourceConnectors = connectorSource.cons;
        var targetedConnector = sourceConnectors.find(c=>c.interactionId == id);

        // Unconnect existing connector
        targetedConnector.unconnect();
        targetedConnector = null;

        if(basedOnTarget != value) // Don't create connector for the item itself
          // Create new connector
          this.createConnector(connectorSource, connectorTarget, id) 

      }

      this.saveProjectChanges();

      return true;
    }
    return false;

  }


  generateInteractionId(_targetId="")
  {
    return BASE_INTERACTION_ID+" "+(this.project.interactionsCounter+1);
  }

  getElementAnimations(_target)
  {
    var animations = this.getAnimations().filter(f=>f.animation.targets == _target);
    return animations;
  }

  getAnimationByName(_animationName)
  {
    var animation = this.getAnimations().find(f=>f.name == _animationName);
    return animation;
  }

  getElementAnimation(_target, _animationName)
  {
    var animations = this.getElementAnimations(_target);

    var animation = animations.find(f=>f.name == _animationName);

    return animation;

  }

  addAnimation(_animation)
  {
    if(!this.getAnimations().find(f=>f.name == _animation.name))
    {
    
      this.getAnimations().push(_animation);

      this.dispatchNewCustomAnimation(_animation.name);

      this.saveProjectChanges();

      return true;
    }

    return false;
  }

  deleteAnimation(_animationName)
  {
    var thisAnimIndex = this.getAnimations().findIndex(f=>f.name == _animationName);
    if(thisAnimIndex != -1)
    {
      this.getAnimations().splice(thisAnimIndex, 1);

      this.dispatchNewCustomAnimation(_animationName);

      this.saveProjectChanges();

      return true;
    }
    return false;
  }

  
  updateAnimation(_animationName, _updatedAnimation)
  {
    var thisAnimIndex = this.getAnimations().findIndex(f=>f.name == _animationName);
    if(thisAnimIndex != -1)
    {
      this.getAnimations()[thisAnimIndex] = _updatedAnimation;

      this.saveProjectChanges();

      return true;
    }
    return false;
  }

  updateAnimationName(_currentName, _newName)
  {
    var thisAnimIndex = this.getAnimations().findIndex(f=>f.name == _currentName);
    if(thisAnimIndex != -1)
    {
      this.getAnimations()[thisAnimIndex].name = _newName;

      this.saveProjectChanges();

      return true;
    }
    return false;
  }



  /* ******************************************************* */


  initInfiniteView(_svgInstance : any) {
    if (_svgInstance) {
      var SvgContainer : any = document.querySelector(SCENE_BLOCK_CLASS);

      let viewBox = {
        x: 0,
        y: 0,
        width: SvgContainer.getBoundingClientRect().width,
        height: SvgContainer.getBoundingClientRect().height,
      };

      _svgInstance.attr(
        "viewBox",
        `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
      );

      // Handle mouse or touch events for panning
      let isDragging = false;
      let startDragX = 0;
      let startDragY = 0;

      let _self = this;

      _svgInstance.on("mousedown", (e)=>startDrag(e));
      _svgInstance.on("touchstart", (e)=>startDrag(e));

      _svgInstance.on("mousemove", (e)=>drag(e));
      _svgInstance.on("touchmove", (e)=>drag(e));

      _svgInstance.on("mouseup", ()=>stopDrag());
      _svgInstance.on("touchend", ()=>stopDrag());

      const startDrag = function (e) {
        var el = e.target;
        if (el.instance && el.instance.type != "svg") return;

        e.preventDefault();


        _svgInstance._awa.setSelectedElementsKeys([]);

        _svgInstance._awa.dispatchSelectedSceneElements([])

        // awaEventEmitter.emit(awaEvents.UPDATE_SELECTED_ELEMENT, {
        //   detail: { selectedElementId: null },
        // });


        if (_self.isUserActionStateSelect()) {
          isDragging = true;
          startDragX = e.clientX || e.touches[0].clientX;
          startDragY = e.clientY || e.touches[0].clientY;
        }
      }

      const drag = function (e) {
        e.preventDefault();

        if (!isDragging) return;

        const currentX = e.clientX || e.touches[0].clientX;
        const currentY = e.clientY || e.touches[0].clientY;

        viewBox.x -= currentX - startDragX;
        viewBox.y -= currentY - startDragY;

        _svgInstance.attr(
          "viewBox",
          `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
        );

        startDragX = currentX;
        startDragY = currentY;
      }

      const stopDrag = function () {
        if (_self.isUserActionStateSelect()) isDragging = false;
      }
    }
  }

  //end of class
}

export default awa;

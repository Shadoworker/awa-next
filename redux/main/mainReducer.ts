// import { APP_MODE, USER_ACTION_STATE, USER_MENU_CONTEXT, USER_MENU_CREATE_CONTEXT, USER_MENU_MODIFY_CONTEXT } from "../../awa/awa.core";
// import {produce} from "immer";
import { APP_MODE, APP_MODE_CONTEXT, USER_ACTION_STATE, USER_MENU_CREATE_CONTEXT, USER_MENU_MODIFY_CONTEXT, USER_MENU_SELECT_CONTEXT } from "../../lib/awa/awa.core";

 
  
  const initialState : any = {
    awaInstance : null,
    svgInstance : null,
    timelineItems : [],
    timelineTime: 0,


    appMode : APP_MODE.DESIGN,
    appModeContext : APP_MODE_CONTEXT.NONE,
    userActionState : USER_ACTION_STATE.SELECT,
    // Contextes
    userMenuSelectContext : USER_MENU_SELECT_CONTEXT.NONE,
    userMenuCreateContext : USER_MENU_CREATE_CONTEXT.NONE,
    userMenuModifyContext : USER_MENU_MODIFY_CONTEXT.MOVE_POINT,
    userMenuActiveContext : USER_ACTION_STATE.SELECT,

    scenes : [              // Represente pages : containing canvases

      {
        id : 'scene 0',
        name : 'scene 0',
        items : [],             // Out-canvas elements
        canvases : [            // The different canvases : with a global canvas
        {
          canvasId: "awaCanvasId_0", 
          items : [
            {
              title: 'scene',
              key: 'awaCanvasId_0', // To reference the canvas in canvases list
              type : "canvas",
              children:[]   // all the items of this scene
            }
          ]
        }
        ],
      }
        
    ],

    

    selectedElementId : null,

  };
  
  
  export enum MainActionTypes {
    SET_AWA_INSTANCE = "SET_AWA_INSTANCE",
    SET_SVG_INSTANCE = "SET_SVG_INSTANCE",
    SET_TIMELINE_ITEMS = "SET_TIMELINE_ITEMS",
    SET_TIMELINE_TIME = "SET_TIMELINE_TIME",

    SET_APP_MODE = "SET_APP_MODE",
    SET_APP_MODE_CONTEXT = "SET_APP_MODE_CONTEXT",
    SET_USER_ACTION_STATE =  "SET_USER_ACTION_STATE",
    SET_USER_MENU_SELECT_CONTEXT = "SET_USER_MENU_SELECT_CONTEXT",
    SET_USER_MENU_CREATE_CONTEXT = "SET_USER_MENU_CREATE_CONTEXT",
    SET_USER_MENU_MODIFY_CONTEXT = "SET_USER_MENU_MODIFY_CONTEXT",
    SET_USER_MENU_ACTIVE_CONTEXT = "SET_USER_MENU_ACTIVE_CONTEXT",

    CREATE_CANVAS = "CREATE_CANVAS",
    DELETE_CANVAS = "DELETE_CANVAS",
    INSERT_ELEMENT_INTO_CANVAS = "INSERT_ELEMENT_INTO_CANVAS",  // add new
    REMOVE_ELEMENT_FROM_CANVAS = "REMOVE_ELEMENT_FROM_CANVAS",  // remove existing
    MOVE_ELEMENT_IN_CANVAS = "MOVE_ELEMENT_IN_CANVAS",          // move from parentA to parentB

    SET_SELECTED_ELEMENT_ID = "SET_SELECTED_ELEMENT_ID",

  }
  
 
  const mainReducer = (state : any = initialState, action) => {
    switch (action.type) {

      case MainActionTypes.SET_AWA_INSTANCE:
        return { ...state, awaInstance: action.payload };

      case MainActionTypes.SET_SVG_INSTANCE:
        return { ...state, svgInstance: action.payload };

      case MainActionTypes.SET_TIMELINE_ITEMS:

        // return produce(state, draftState => {

        //   let elementId = action.payload.targets;
        //   let element = action.payload;

        //   var elementIndex = draftState.timelineItems.findIndex(e=>e.targets == elementId);

        //   if(elementIndex != -1) 
        //   {
        //     draftState.timelineItems[elementIndex] = {
        //       ...draftState.timelineItems[elementIndex],
        //       ...element,
        //     };

        //   }
        //   else
        //   {
        //     draftState.timelineItems.push(element);
        //   } 
        
        // })       
        return { ...state, timelineItems : action.payload };

         
      case MainActionTypes.SET_TIMELINE_TIME:
          return { ...state, timelineTime : action.payload };
    
      case MainActionTypes.SET_APP_MODE:
        return { ...state, appMode : action.payload };
  
      case MainActionTypes.SET_APP_MODE_CONTEXT:
        return { ...state, appModeContext : action.payload };

        case MainActionTypes.SET_USER_ACTION_STATE:
        return { ...state, userActionState : action.payload };
  
      case MainActionTypes.SET_USER_MENU_CREATE_CONTEXT:
        return { ...state, userMenuCreateContext : action.payload };
  
      case MainActionTypes.SET_USER_MENU_MODIFY_CONTEXT:
        return { ...state, userMenuModifyContext : action.payload };
  
      case MainActionTypes.SET_USER_MENU_ACTIVE_CONTEXT:
        return { ...state, userMenuActiveContext : action.payload };
  
      case MainActionTypes.SET_SELECTED_ELEMENT_ID:
        return { ...state, selectedElementId : action.payload };
  
      case MainActionTypes.SET_USER_MENU_SELECT_CONTEXT:
        return { ...state, userMenuSelectContext : action.payload };
  

      /* CANVAS **************************************************** */

      case MainActionTypes.INSERT_ELEMENT_INTO_CANVAS:
        return { ...state, selectedElementId : action.payload };
  

      /* END*CANVAS ************************************************ */


      default:
        return state;
    }
  };
  
  export default mainReducer;
  
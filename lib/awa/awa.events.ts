import EventEmitter from 'events';

// DEPS
export const awaEventEmitter = new EventEmitter();

// Events
const USER_ACTION_EVENTS = {
        
    // DESIGN
    NONE : "NONE", // 
    CREATE_SHAPE: "EVENT_CREATE_SHAPE", // 
    DRAW_PATH: "EVENT_DRAW_PATH", // 
    MODIFY_PATH: "EVENT_MODIFY_PATH", // 

    QUIT_DRAW_PATH: "EVENT_QUIT_DRAW_PATH", // 
    END_DRAW_PATH: "EVENT_END_DRAW_PATH", // 

    UPDATE_SELECTED_ELEMENT: "EVENT_UPDATE_SELECTED_ELEMENT",
    UPDATE_SELECTED_ELEMENT_PROPERTY: "EVENT_UPDATE_SELECTED_ELEMENT_PROPERTY",
    ADD_EFFECT_TO_SELECTED_ELEMENT: "ADD_EFFECT_TO_SELECTED_ELEMENT",

    CREATE_RECT: "CREATE_RECT", // 
    CREATE_CIRCLE: "CREATE_CIRCLE", // 
    CREATE_POLYGON: "CREATE_POLYGON", // 
    CREATE_TEXT: "CREATE_TEXT", // 
    CREATE_MEDIA: "CREATE_MEDIA", // 
    CREATE_CANVAS: "EVENT_CREATE_CANVAS", //


    DELETE_AWA_ELEMENT : "EVENT_DELETE_AWA_ELEMENT",

    // SCENE

    UPDATE_SCENES: "EVENT_UPDATE_SCENES", // Create / Delete / Update name
    UPDATE_SCENE_ITEMS: "EVENT_UPDATE_SCENE_ITEMS", //


    // ANIMATIONS

    RESET_TIMELINE_ITEMS: "EVENT_RESET_TIMELINE_ITEMS", //
    UPDATE_TIMELINE_ITEMS: "EVENT_UPDATE_TIMELINE_ITEMS", //
    ADD_NEW_KEYFRAME: "EVENT_ADD_NEW_KEYFRAME", //
    UPDATE_PATH_KEYFRAMES: "EVENT_UPDATE_PATH_KEYFRAMES", //
    REQUEST_PATH_MORPH_TWEENS: "EVENT_REQUEST_PATH_MORPH_TWEENS", //

    NEW_CUSTOM_ANIMATION: "EVENT_NEW_CUSTOM_ANIMATION", //

    // MIX

    REDUX_STORE_UPDATE : "REDUX_STORE_UPDATE",

    // CANVAS EVENTS

    CANVAS_EVENTS : 
    {
      none : "none",
      click : "click",
      dblclick : "dblclick",
      press : "press",
      release : "release",
      hover : "mouseover",
      mouseout : "mouseout",
      scroll :  "wheel",
      drag :  "drag",
      pinch :  "pinch",
      delay :  "delay",
      keypress :  "keydown",
    },
 

  };
 

/* awa events class */
const awaEvents = USER_ACTION_EVENTS;



export default awaEvents;
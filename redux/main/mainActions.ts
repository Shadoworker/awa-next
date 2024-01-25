import { MainActionTypes } from "./mainReducer";

export const setAwaInstance = (payload:any): any => {
  return {
    type: MainActionTypes.SET_AWA_INSTANCE,
    payload
  };
};

export const setSvgInstance = (payload:any): any => {
  return {
    type: MainActionTypes.SET_SVG_INSTANCE,
    payload
  };
};

export const setTimelineItems = (payload:any): any => {
  return {
    type: MainActionTypes.SET_TIMELINE_ITEMS,
    payload
  };
};

export const setTimelineTime = (payload:any): any => {
  return {
    type: MainActionTypes.SET_TIMELINE_TIME,
    payload
  };
};


export const setAppMode = (payload:any): any => {
  return {
    type: MainActionTypes.SET_APP_MODE,
    payload
  };
};

export const setAppModeContext = (payload:any): any => {
  return {
    type: MainActionTypes.SET_APP_MODE_CONTEXT,
    payload
  };
};

export const setUserActionState = (payload:any): any => {
  return {
    type: MainActionTypes.SET_USER_ACTION_STATE,
    payload
  };
};


export const setUserMenuSelectContext = (payload:any): any => {
  return {
    type: MainActionTypes.SET_USER_MENU_SELECT_CONTEXT,
    payload
  };
};


export const setUserMenuCreateContext = (payload:any): any => {
  return {
    type: MainActionTypes.SET_USER_MENU_CREATE_CONTEXT,
    payload
  };
};


export const setUserMenuModifyContext = (payload:any): any => {
  return {
    type: MainActionTypes.SET_USER_MENU_MODIFY_CONTEXT,
    payload
  };
};


export const setUserMenuActiveContext = (payload:any): any => {
  return {
    type: MainActionTypes.SET_USER_MENU_ACTIVE_CONTEXT,
    payload
  };
};


export const setSelectedElementId = (payload:any): any => {
  return {
    type: MainActionTypes.SET_SELECTED_ELEMENT_ID,
    payload
  };
};


export const createCanvas = (payload:any): any => {
  return {
    type: MainActionTypes.CREATE_CANVAS,
    payload
  };
};

export const deleteCanvas = (payload:any): any => {
  return {
    type: MainActionTypes.DELETE_CANVAS,
    payload
  };
};

export const insertElementIntoCanvas = (payload:any): any => {
  return {
    type: MainActionTypes.INSERT_ELEMENT_INTO_CANVAS,
    payload
  };
};

export const removeElementFromCanvas = (payload:any): any => {
  return {
    type: MainActionTypes.REMOVE_ELEMENT_FROM_CANVAS,
    payload
  };
};

export const moveElementInCanvas = (payload:any): any => {
  return {
    type: MainActionTypes.MOVE_ELEMENT_IN_CANVAS,
    payload
  };
};





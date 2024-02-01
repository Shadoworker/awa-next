export const RERENDER_SEEK_TIMELINE_DELAY = 50;
export const TIMELINE_STEP = 10;

export const AWA_ELEMENT_CLASS = 'awa--element--';
export const EFFECT_ID_BODY = '--effect--item--';
export const EFFECTOR_GROUP_ID_BODY = "--effector--list"
export const CANVAS_ID_BODY = '--canvas--';
export const CONTAINER_ID_BODY = '--container--';
export const CLIP_ID_BODY = '--clip--';
export const GROUP_ID_BODY = '--group--';

export const INCANVAS_ITEM_CLASS = '--incanvas-item--';

export const CONNECTORS_GROUP_CLASS = 'awa--connectors--group';
export const PLUGGER_ACTIVE_CLASS = '--plugger--active--';
export const IGNORE_PREVIEW_CLASS = '--ignore-preview--';

export const SCENE_CLASS = 'awa--scene--element--';

 
// Interaction keys
export const INTERACTION_BASED_ON_REF = "basedOn";
export const INTERACTION_TARGET_REF = "target";
export const INTERACTION_CANVAS_REF = "canvas";
export const INTERACTION_EVENT_REF = "event";
export const INTERACTION_ACTION_REF = "action";
export const INTERACTION_TYPE_REF = "type";
export const INTERACTION_ANIMATION_REF = "animation";
export const INTERACTION_OPTIONS_REF = "options";

export const ELEMENTS_TYPES = 
{
    canvas : 'canvas',
    rect : 'rect',
    circle : 'circle',
    text : 'text',
}

export const PREVIEW_TYPES = 
{
    scene : 'scene',
    flow : 'flow',
}

export const PREVIEW_DATA_KEYS = 
{
    svg : 'generatedSvg',
    mainAnimations : 'main',
    flows : 'flows',
    interactions : 'interactions',
    customAnimations : 'custom',
    // canvasToPreview : 'previewCanvasToPreview',

}


export const NATIVE_ANIMATIONS = 
{
    none : "none",
    slideIn : "slideIn",
    fadeIn : "fadeIn",
}

export const NATIVE_ANIMATION_MODELS = [

    {
        name:'fadeIn',
        keyframes:
        {
            opacity:[{value:0, delay:0, duration:0},{value:1, delay:0, duration:500}],
        }
    },
    {
        name:'pushIn',
        keyframes:
        {
            translateX:[{value:0, delay:0, duration:0},{value:0, delay:0, duration:500}],
        }
    },
    {
        name:'slideIn',
        keyframes:
        {
            opacity:[{value:1, delay:0, duration:0},{value:1, delay:0, duration:500}],
            translateX:[{value:0, delay:0, duration:0},{value:0, delay:0, duration:500}],
        }
    },
    {
        name:'overlay',
        keyframes:
        {
            zIndex:[{value:1, delay:0, duration:0},{value:1, delay:0, duration:0}],
        }
    }
]

export const NATIVE_ACTIONS = 
[
    "animate",
    "goto",
]

export const BASE_SCENE_ID = "Scene"
export const BASE_FLOW_ID = "Flow"
export const BASE_INTERACTION_ID = "Interaction"

export const MAIN_ANIM_ID = 'main'
export const BASE_ANIMATION_NAME = "animation_"
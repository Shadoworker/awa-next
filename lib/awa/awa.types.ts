
// Types

export namespace AwaTypes {


  export type T_AwaProject = {
    id?: number;
    uuid: string;
    name: string;
    creator: string;
    team: string;
    scenes: T_AwaProjectScene[] | [];
    awaElementsCounter:number; 	
    awaCanvasesCounter:number; 	
    scenesCounter:number; 	
    flowsCounter:number; 	
    interactionsCounter:number; 	
    animationsCounter:number; 	
    generatedSvg:string;
  }

  export type T_AwaProjectScene = {
    id:string,
    name : string,
    items : T_AwaProjectSceneItems 
   
  }

  export type T_AwaProjectSceneItems = {
    flows : any[],
    interactions : any[],
    animations : T_AwaProjectSceneAnimations,
    elements : any[] | []
  }

  type T_AwaProjectSceneAnimations = {
    main : any[],
    custom : any[],
  }

  type T_AwaElNode = {
    attributes : object|{},
    anchor : object|{},
    effects : any[],
    baseFill : object|{},
    baseStroke : object|{},
  }

  type T_AwaElOptions = {
    visible : boolean,
    locked : boolean
  }

  export type T_AwaEl = {

    id : string,
    type : string,
    name: string,
    parent : string,
    canvasOwnerId : string , 
    path: string,
    pathString: string,
    node : T_AwaElNode,
    options : T_AwaElOptions,
    events : any[],

  }

}

 

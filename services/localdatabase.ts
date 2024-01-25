// database.js
import Dexie, { Table } from 'dexie';

export interface Project {
  id?: number;
  uuid: string;
  name: string;
  creator: string;
  team: string;
  scenes: object;
  awaElementsCounter:number; 	
  awaCanvasesCounter:number; 	
  scenesCounter:number; 	
  flowsCounter:number; 	
  interactionsCounter:number; 	
  animationsCounter:number; 	
  generatedSvg:string;

}

export class AwaDexie extends Dexie {
  // 'projects' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  projects!: Table<Project>;

  constructor() {
    super('awaLocalDatabase');
    this.version(1).stores({
      projects: `
      ++id,  
      uuid,
      name,
      creator,
      team,
      scenes,
      awaElementsCounter, 	
      awaCanvasesCounter, 	
      scenesCounter, 	
      flowsCounter, 	
      interactionsCounter, 	
      animationsCounter, 	
      generatedSvg` // Primary key and indexed props
    });
  }
}

export const db = new AwaDexie();



// database.js
import Dexie, { Table } from 'dexie';
import { AwaTypes } from '../lib/awa/awa.types';



export class AwaDexie extends Dexie {
  // 'projects' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  projects!: Table<AwaTypes.T_AwaProject>;

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



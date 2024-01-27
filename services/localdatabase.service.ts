import { AwaTypes } from "../lib/awa/awa.types";
import { db } from "./localdatabase";

const localDatabaseService = {
 
  updateProject,
  getProject
  
};


/**
 * updateProject method
 *
 * @param {AwaTypes.T_AwaProject} payload
 * @returns
 */
function updateProject(payload) {
  db.open()
  .then(function(){
    return db.projects.toArray();
  })
  .then(function(projects){

    if(projects[0])
    {
      var existingId = projects[0].id || 1;
      var project : AwaTypes.T_AwaProject = payload;
      return db.projects.update(existingId, payload);
    }
    else
    {
      var project : AwaTypes.T_AwaProject = payload;
      return db.projects.add(project);
    }
  })
 
}


/**
 * getProject method
 * @returns
 */
function getProject() {
  return db.open()
  .then(function(){
    return db.projects.toArray();
  })
  .then(function(projects){
    return projects[0]; // the one and unique project
  })
 
}




 
export default localDatabaseService;

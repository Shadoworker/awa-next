
'use client';

import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import * as mainActions from '../redux/main/mainActions'
import contentService from '../services/content.service';
import { withRouter } from 'next/router';
import { Box, Button, Card, Container, Flex, Grid, Inset, Strong, Text } from '@radix-ui/themes';
import MenubarDashboardComp from '../components/MenubarDashboardComp/MenubarDashboardComp';
import userService from '../services/user.service';
import * as Ant from 'antd';
import localDatabaseService from '../services/localdatabase.service';


class HomePage extends Component<any, any> {

  constructor(props: any) {
    super(props);
    this.state = {
      index : 0,
      projects : [],
      creatingProject:false,
    };
  }


  componentDidMount(): void {
    
    var awaBody : any = document.querySelector('.awa-page');
    awaBody.style.height = (window.innerHeight - 47)+"px";
    // Fake the selected project loading
    this.getUserProjects(1);

  }


  createProject=()=>
  {
    var testProject = {data : {
      name : `${new Date().getTime()}`,
      scenes : [
        {
          id:"Scene 1",
          name : "Scene 1",
          items : {
              flows : [],
              interactions : [],
              animations : {
                  main : [],
                  custom : []
               },
              items : []
          }
        }
      ]
    }};

    this.setState({creatingProject : true})

    userService.createProject(testProject)
    .then((project:any)=>{
       
      this.setState({creatingProject : false})

      console.log(project)
       
    })
    .catch(error=>{

      this.setState({creatingProject : false})

      console.log(error)
    })
  }


  getUserProjects=(_id)=>
  {
    userService.getUserProjects(_id)
    .then((data:any)=>{
      
      var projects = data.projects;

      this.setState({projects : projects})
      
    })
    .catch(error=>{
      console.log(error)
    })
  }

  // Fake the function getting the selected/loaded project from the projects list
  getProject=()=>
  {
    var testProjectId = '7c2062ad-7c8e-42e7-9198-1409297c99dc';

    contentService.getProject(testProjectId)
    .then((projects:any)=>{
      
      var project = projects.data[0] ? projects.data[0] : null;
      console.log(project)
      if(project)
      {
        this.gotoApp(project)
      }
    })
    .catch(error=>{
      console.log(error)
    })
  }
 
  gotoApp=(_project:any)=>{

    var projectUUID = _project.uuid;

    console.log(_project)
    // Save to local datastorage
    localDatabaseService.updateProject(_project);

    const { router } = this.props;
    router.push({pathname:`/app/project/${projectUUID}`})

    
  }
 
   render(): React.ReactNode {
     return(
        <div className="awa-page">

          <MenubarDashboardComp />

          <Flex style={{height:'100%'}} >
            <Flex direction="column" height={'100%'}  style={{width:240, backgroundColor:'#242730'}}>
               
              <Box>
                sidebar
              </Box>
              
            </Flex>

            <Flex  direction="column"  style={{ width: '100%', height:'100%', backgroundColor:'#242730d4'}}>
              
              <Box>
                
                <Container style={{margin:25}}>

                  {/* Header */}
                  <Flex style={{marginBottom:15, justifyContent:'space-between'}}>
                    <Box><Strong style={{color:'#fff'}}>Projects</Strong></Box>
                    <Box>
                      <Ant.Button loading={this.state.creatingProject} className='createNewProjectBtn' onClick={()=>this.createProject()} >+ New Project</Ant.Button>
                    </Box>
                  </Flex>

                  {/* List */}
                  <Flex>
                    <Grid columns="4" gap="4" width="auto">
                      
                      {this.state.projects.map((project:any, index:number)=>{

                        return <Card className='projectCard' key={index} size="2" style={{ maxWidth: 240 }} onClick={()=>this.gotoApp(project)} >
                            <Inset clip="padding-box" side="top" pb="current">
                              <img
                                src="https://images.unsplash.com/photo-1617050318658-a9a3175e34cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                                alt="Bold typography"
                                style={{
                                  display: 'block',
                                  objectFit: 'cover',
                                  width: '100%',
                                  height: 140,
                                  backgroundColor: 'var(--gray-5)',
                                }}
                              />
                            </Inset>
                            <Text as="p" size="3">
                              <Strong>{project.name}</Strong> 
                              <div style={{fontSize:12}}>
                                {project.updatedAt}
                              </div>
                            </Text>

                            <div className='overlay'>

                            </div>
                          </Card>
                          })
                        }

                      
                    </Grid>

                    {this.state.projects.length == 0 &&
                      <Box >
                        <span style={{color:'#fff'}}>No projects</span>
                      </Box>
                    }

                  </Flex>

                </Container>

              </Box>

            </Flex>
          </Flex>

        </div>
    )
  };
};
const mapStateToProps = (state:any) => {
  return {
    mainState: state.mainReducer
  };
};

const mapDispatchToProps = (dispatch:any) => {
  return {
    mainActions: bindActionCreators(mainActions, dispatch)
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(HomePage));

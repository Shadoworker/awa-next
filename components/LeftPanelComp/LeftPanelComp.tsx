import React, { Component} from 'react';

import { Box } from '@radix-ui/themes';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import * as mainActions from '../../redux/main/mainActions'

import './LeftPanelComp.css';
import ToolbarComp from '../ToolbarComp/ToolbarComp';

import { BorderOutlined, ExpandOutlined} from '@ant-design/icons';
import * as Ant from 'antd';

// import { Tree } from 'antd';

import { ChevronRightIcon, DotsVerticalIcon } from '@radix-ui/react-icons';
import * as ContextMenu from '@radix-ui/react-context-menu';


import { getElementTreeType } from '../../lib/awa/awa.common.utils';
import awaEvents, { awaEventEmitter } from '../../lib/awa/awa.events';


// const { DirectoryTree } = Tree;

class LeftPanelComp extends Component<any,any> {

    constructor(props) {
        super(props);
        this.state = {

          loaded : false,
          scenes : [],
          activeSceneId : null,
          treeData : [],
          activeNodeId : null,

          
      }
    }


    componentDidMount()
    {
      setTimeout(() => { // Wait for awa props to be available
        this.getScenes();
      }, 1000);

        this.onUpdateSceneItems();
      }

      onUpdateSceneItems = ()=>{

        awaEventEmitter.on(awaEvents.UPDATE_SCENE_ITEMS, (_data)=>{
          this.getScenes();
        })
    
    }

    getScenes = ()=>{
 
      if(this.props.awa)
      {
        var scenes = this.props.awa.getScenes();

        this.setState({scenes : this.props.awa.getScenes()},
        ()=>{
          
          this.setState({loaded : true})
          
          var activeSceneId = this.state.activeSceneId || scenes[0].id;
          this.activateScene(activeSceneId);

        });


      }
    }

    activateScene = (_id)=>{
      
      // Update selected scene id in awa
      this.props.awa.setActiveSceneId(_id);

      var scene = this.state.scenes.find(s=>s.id == _id);
      var sceneItems = scene.items.items;

      var treeData = this.mapSceneItemsToTreeData(sceneItems)

      this.setState({activeSceneId : _id, treeData : treeData});

    }

    mapSceneItemsToTreeData(_sceneItems = [])
    {
 
      var treeData :any[] = [];

      // Define objects
      _sceneItems.forEach((item:any) => {

        var node : any = {
          title : item.name,
          key : item.id,
          type : getElementTreeType(item.type),
          icon : getElementTreeType(item.type) == "folder" ? <ExpandOutlined style={{marginTop:6}} /> : <BorderOutlined />,
          parent : item.parent,
          children : []
        }

        treeData.push(node)
        
      });

      // Define children
      var iterator = 0;
      while(iterator < treeData.length)
      {
        var item = treeData[iterator];
        
        // console.log(item)

        this.setItemChildren(treeData, item)

        iterator++;
      }
      

      return treeData;

    }

    setItemChildren(items, item)
    {
      var _nodeChildren = items.filter(i=>i.parent == item.key)

      var nodeChildren = [..._nodeChildren];

      item.children = nodeChildren;

      this.removeChildrenFromItems(items, _nodeChildren)

      for (let i = 0; i < item.children.length; i++) {
        const childItem = item.children[i];
        this.setItemChildren(items, childItem)
      }

    }

    removeChildrenFromItems(items, children)
    {
      children.forEach(child => {
        
        var childIndex = items.findIndex(i=>i.key == child.key);

        if(childIndex != -1)
         items.splice(childIndex, 1);

      });
    }

    
    setSceneItem = (node)=>{

      var nodeId = node.key;

      this.setState({activeNodeId : nodeId})
      
    }

    deleteSceneItem = ()=>{

      this.props.awa.deleteElementFromScene(this.state.activeNodeId)

    }
    

    render() { 
        return  <Box  className='block app-left-block' style={{color:'#fff'}}>
        <Box  className='block app-left-block-hierarchy'>

          <div className={`scenesBox`}>
            <div className='scenes-container'>
              <label className="Label scenesTag" >
                Scenes
              </label>
              <div className='' style={{width:'100%'}}>
                <fieldset className="Fieldset" style={{flex:1, height:30}}>
                    <div style={{display:'flex', alignItems:'flex-start', width:'100%'}}>
                    <select className='Input basicSelect scenesSelect' onChange={(evt)=>this.activateScene(evt.target.value)} >
                      {this.state.scenes.map((s,i)=>
                        <option key={i} value={s.id} >{s.name}</option>
                      )
                      }
                    </select>

                    <DropdownMenu.Root >
                      <DropdownMenu.Trigger asChild >
                        <Ant.Button className={`sceneBtn BtnDisabled`} size="small">
                          <DotsVerticalIcon />
                        </Ant.Button>
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Portal>
                        <DropdownMenu.Content side='top' className="DropdownMenuContent" sideOffset={5}>
                          <DropdownMenu.Item className="DropdownMenuItem" >New scene</DropdownMenu.Item>
                          
                          <DropdownMenu.Sub>
                            <DropdownMenu.SubTrigger className="DropdownMenuSubTrigger">
                              Delete
                              <div className="RightSlot">
                                <ChevronRightIcon />
                              </div>
                            </DropdownMenu.SubTrigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.SubContent
                                className="DropdownMenuSubContent"
                                sideOffset={3}
                                alignOffset={-5}
                              >
                                <DropdownMenu.Item className="DropdownMenuItem DropdownMenuItemConfirmDelete" >Confirm</DropdownMenu.Item>
                              </DropdownMenu.SubContent>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Sub>
                          
                          <DropdownMenu.Sub>
                            <DropdownMenu.SubTrigger className="DropdownMenuSubTrigger">
                              Rename
                              <div className="RightSlot">
                                <ChevronRightIcon />
                              </div>
                            </DropdownMenu.SubTrigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.SubContent
                                className="DropdownMenuSubContent"
                                sideOffset={3}
                                alignOffset={-5}
                              >
                                <input className={`animationEditInput`}  onKeyDown={(e)=>e.stopPropagation()} type="text" />
                              </DropdownMenu.SubContent>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Sub>

                          <DropdownMenu.Arrow className="DropdownMenuArrow" />
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>

                  </div>
                

                </fieldset>
                </div>
            </div>
          </div>

          <ContextMenu.Root >
            <ContextMenu.Trigger className="ContextMenuTrigger">
              <Ant.Tree className='app-left-block-hierarchy-tree'
                showIcon={true}
                treeData={this.state.treeData}
                draggable={true}
                onMouseEnter={({node})=>{this.setSceneItem(node)}}
                
              />
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content className="ContextMenuContent" /* sideOffset={5} align="end" */>
              <ContextMenu.Item className="ContextMenuItem">
                Copy <div className="RightSlot">Ctrl C</div>
              </ContextMenu.Item>
              <ContextMenu.Item className="ContextMenuItem" disabled>
                Paste <div className="RightSlot">Ctrl V</div>
              </ContextMenu.Item>
              <ContextMenu.Item className="ContextMenuItem">
                Rename <div className="RightSlot"></div>
              </ContextMenu.Item>
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger className="ContextMenuSubTrigger">
                  Order
                  <div className="RightSlot">
                    <ChevronRightIcon />
                  </div>
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent
                    className="ContextMenuSubContent"
                    sideOffset={2}
                    alignOffset={-5}
                  >
                    <ContextMenu.Item className="ContextMenuItem">Top</ContextMenu.Item>
                    <ContextMenu.Item className="ContextMenuItem">Forward</ContextMenu.Item>
                    <ContextMenu.Item className="ContextMenuItem">Backward</ContextMenu.Item>
                    <ContextMenu.Item className="ContextMenuItem">Back</ContextMenu.Item>
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>

              <ContextMenu.Separator className="ContextMenuSeparator" />

              <ContextMenu.CheckboxItem
                className="ContextMenuCheckboxItem" onClick={()=>this.deleteSceneItem()}
              >
                Delete <div className="RightSlot">Ctrl X</div>
              </ContextMenu.CheckboxItem>

              <ContextMenu.Separator className="ContextMenuSeparator" />

              <ContextMenu.CheckboxItem className="ContextMenuCheckboxItem">Toggle visible</ContextMenu.CheckboxItem>
              <ContextMenu.CheckboxItem className="ContextMenuCheckboxItem">Toggle lock</ContextMenu.CheckboxItem>
              
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>



        </Box>
        <Box  className='block app-left-block-tools'>
          <ToolbarComp awa={this.props.awa}  />
        </Box>
      </Box>
    };

}


const mapStateToProps = (state) => {
    return {
      mainState: state.mainReducer
    };
  };
  
  const mapDispatchToProps = (dispatch) => {
    return {
      mainActions: bindActionCreators(mainActions, dispatch)
    };
  };
  
  
  export default connect(mapStateToProps, mapDispatchToProps)(LeftPanelComp);
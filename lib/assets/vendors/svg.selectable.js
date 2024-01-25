import { isCanvas } from '../../awa/awa.common.utils';
import { CANVAS_ID_BODY, CONNECTORS_GROUP_CLASS, CONTAINER_ID_BODY, GROUP_ID_BODY, IGNORE_PREVIEW_CLASS, INCANVAS_ITEM_CLASS, PLUGGER_ACTIVE_CLASS } from '../../awa/awa.constants';
import SVG from './svg';

function isPointInsideTriangle(x, y, x1, y1, x2, y2, x3, y3) {
  // Calculate barycentric coordinates
  const detT = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
  const u = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / detT;
  const v = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / detT;
  const w = 1 - u - v;

  // Check if the point is inside the triangle
  return u >= 0 && v >= 0 && w >= 0 && u <= 1 && v <= 1 && w <= 1;
}

// SVG.js plugin for element selection
SVG.extend(SVG.Element, {
  // Add a 'selectable' method to SVG elements
  selectable: function(_loonkInstance) {
    
      this.m_loonkInstance = _loonkInstance;
      // Add a class to the element to mark it as selectable
      this.addClass(this);

      // Add a click event listener to toggle selection
      this.click(function(ev) {
        
          ev.preventDefault();  
          ev.stopPropagation();  

          if(this.m_loonkInstance._awa.isUserActionStateModify())
          {
            var elType = this.type;
            if(elType == "path")
            {
              // this.m_loonkInstance.selectPath(this);

              var newPoints = this.m_pathString;
              this.m_loonkInstance.updateElementPoints(newPoints, this);
              
              this.toggleClass('selected');
              this.m_loonkInstance.activatePath(this);

            }

          }
          
          if(this.m_loonkInstance._awa.isUserActionStateSelect())
          {
  
            if(this.m_loonkInstance._awa.isUserMenuSelectContextSelectFollowPath())
            {
              if(this.type == "path")
                this.m_loonkInstance._awa.setFollowPath(this);
            }
            else if(this.m_loonkInstance._awa.isUserMenuSelectContextSelectMorphToPath())
            {
              if(this.type == "path")
                this.m_loonkInstance._awa.setMorphToPath(this);
            }
            else
            {
              this.m_loonkInstance._awa.setSelectedElement(this);
            }

          }


      });


      this.on('mouseenter', (event) =>{
         
        if(this.m_loonkInstance._awa.isUserActionStateSelect())
        {
          if(this.m_loonkInstance._awa.isUserMenuSelectContextSelectFollowPath()|| this.m_loonkInstance._awa.isUserMenuSelectContextSelectMorphToPath())
          {
            if(this.type == "path")
            {
              this.addClass('followablePath')
            }
          }

        } 

      });

      
      this.on('mousemove', (event) =>{
        
        // Plugger
        if(this.m_loonkInstance._awa.isPrototypeAppModeContext())
        {
          if(!this.hasClass(INCANVAS_ITEM_CLASS) && !isCanvas(this)) return;

          event.stopPropagation();

          var bbox = this.bbox();

          if(this.attr("id").includes(CANVAS_ID_BODY) && this.attr("id").includes(GROUP_ID_BODY))
          {
            
            var canvasRectId = this.attr("id").split(GROUP_ID_BODY)[0] + CONTAINER_ID_BODY;

            var realSource = this.findOne("#"+canvasRectId)

            bbox = realSource.bbox();

          }

          var transform = this.transform();
          var _x = transform.translateX, _y = transform.translateY;
          var rbox = this.node.getBoundingClientRect();
          // console.log(_x,_y)
          var coords = this.point({x:event.clientX, y:event.clientY});

          // rbox.x2 = rbox.right;
          // rbox.y2 = rbox.bottom;

          // rbox.cx = rbox.x + rbox.width/2;
          // rbox.cy = rbox.y + rbox.height/2;

          bbox.x  += _x;
          bbox.y  += _y;
          bbox.x2 += _x;
          bbox.y2 += _y;
          bbox.cx += _x;
          bbox.cy += _y;

          if(this.plugger)
          {
            this.plugger.remove();
            this.plugger = null;
          }

          if(!this.plugger)
          {
            var x = coords.x + _x;
            var y = coords.y + _y;

            var px = bbox.x2;
            var py = bbox.cy;

            // console.log(x,y)
            // console.log(bbox.x,bbox.y)
            // console.log(bbox)
 
            var triangles = [
              { name:'left',
                color:'green',
                x1:bbox.x, y1:bbox.y,
                x2:bbox.x, y2:bbox.y2,
                x3:bbox.cx, y3:bbox.cy,
              },
              { name:'right',
                color:'yellow',
                x1:bbox.cx, y1:bbox.cy,
                x2:bbox.x2, y2:bbox.y,
                x3:bbox.x2, y3:bbox.y2,
              },
              { name:'top',
                color:'red',
                x1:bbox.x, y1:bbox.y,
                x2:bbox.cx, y2:bbox.cy,
                x3:bbox.x2, y3:bbox.y,
              },
              { name:'bottom',
                color:'blue',
                x1:bbox.x, y1:bbox.y2,
                x2:bbox.cx, y2:bbox.cy,
                x3:bbox.x2, y3:bbox.y2,
              },
            ]

            var col = triangles[0].color;

            // var shapes = Array(4).fill().map((_, i) => i+1);

            for (let i = 0; i < triangles.length; i++) {
              const t = triangles[i];

              // if(shapes[i].instance) shapes[i].remove();
              // shapes[i] = this.m_loonkInstance._awa.getSvgInstance().polygon(`${t.x1},${t.y1} ${t.x2},${t.y2} ${t.x3},${t.y3}`).fill('none').stroke({ width: 1 , color:t.color})


              if(isPointInsideTriangle(x,y,t.x1,t.y1,t.x2,t.y2,t.x3,t.y3))
              {
                // console.log(t.name)
                col = t.color;

                switch (t.name) {
                  case 'left':
                    px = bbox.x;
                    py = bbox.cy;
                    break;

                  case 'right':
                    px = bbox.x2;
                    py = bbox.cy;
                    break;

                  case 'top':
                    px = bbox.cx;
                    py = bbox.y;
                    break;

                  case 'bottom':
                    px = bbox.cx;
                    py = bbox.y2;
                    break;
                 
                }
              }
              
            }

            var plugger = this.m_loonkInstance._awa.getSvgInstance().circle(10,10).attr({cx:px, cy:py,fill:"#60D6CD"}).addClass("--plugger--");
            plugger.addClass(IGNORE_PREVIEW_CLASS)
            
            plugger.on('mouseenter', (evt)=>{
                 
              evt.preventDefault()
              evt.stopPropagation()             
              
              if(!this.plug)
              {
                var plug = this.m_loonkInstance._awa.getSvgInstance().use()
                plug.attr({href : "#awa--plug--ref"}).move(plugger.bbox().cx-3, plugger.bbox().cy-3).addClass("--plug--")
                plug.addClass(IGNORE_PREVIEW_CLASS)

                var con = this.m_loonkInstance._awa.createConnector(this, plug, "", true)

                plug.connector = con;
                plug.owner = this;

                plug.draggable(this.m_loonkInstance)
 
                plug.on('mouseleave', (e)=>{

                  if(!plug.hasClass(PLUGGER_ACTIVE_CLASS))
                  {
                    plug.connector.unconnect();
                    this.plug = null;
                  }
                   
                })
 
              }

            })

            plugger.on('mouseleave', (evt)=>{
              this.plugger = null;
              plugger.remove();

              // for (let i = 0; i < shapes.length; i++) {
                
              //     if(shapes[i].instance) shapes[i].remove();
                
              // }
            })

            this.plugger = plugger;


          }
 
        }

    });
    
    this.on('mouseleave', function() {
         
      if(this.m_loonkInstance._awa.isUserActionStateSelect())
      {
        if(this.m_loonkInstance._awa.isUserMenuSelectContextSelectFollowPath() || this.m_loonkInstance._awa.isUserMenuSelectContextSelectMorphToPath())
        {
          if(this.type == "path")
          {
            this.removeClass('followablePath')
          }
        }

      } 

      // Plugger
      if(this.m_loonkInstance._awa.isPrototypeAppModeContext())
      {
        if(this.plugger)
        {
          var plugger = this.plugger;
          plugger.remove();
          this.plugger = null;
        }

      }



  });

      // Return the modified element
      return this;
  },
  // Check if the element is selected
  isSelected: function() {
    
      return this.hasClass('selected');
  }
});

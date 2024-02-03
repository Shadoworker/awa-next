/*!
* @svgdotjs/svg.draggable.js - An extension for svg.js which allows to drag elements with your mouse
* @version 3.0.2
* https://github.com/svgdotjs/svg.draggable.js
*
* @copyright Wout Fierens
* @license MIT
*
* BUILT: Tue Feb 19 2019 17:12:16 GMT+0100 (GMT+01:00)
*/
import { isCanvas, isCanvasContainer, isCanvasElement, isGroup, isPointInCanvas } from '../../awa/awa.common.utils';
import { CLIP_ID_BODY, CONTAINER_ID_BODY, EFFECTOR_GROUP_ID_BODY, GROUP_ID_BODY, INCANVAS_ITEM_CLASS, PLUGGER_ACTIVE_CLASS } from '../../awa/awa.constants';
import awaEvents from '../../awa/awa.events';
import SVG from './svg'

;
(function (svg_js) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var getCoordsFromEvent = function getCoordsFromEvent(ev) {
    if (ev.changedTouches) {
      ev = ev.changedTouches[0];
    }

    return {
      x: ev.clientX,
      y: ev.clientY
    };
  }; // Creates handler, saves it


  var DragHandler =
  /*#__PURE__*/
  function () {
    function DragHandler(el, _loonkInstance) {
      _classCallCheck(this, DragHandler);

      el.remember('_draggable', this);
      this.el = el;
      
      this.m_loonkInstance = _loonkInstance;
      this.drag = this.drag.bind(this);
      this.startDrag = this.startDrag.bind(this);
      this.startRelocate = this.startRelocate.bind(this);
      // this.enter = this.enter.bind(this);
      this.endDrag = this.endDrag.bind(this);
      this.m_menuContext = this.m_loonkInstance.m_menuContext;

      // Connector utilities
      this.connected = false;

    } // Enables or disabled drag based on input


    _createClass(DragHandler, [{
      key: "init",
      value: function init(enabled) {
        if (enabled) {
          this.el.on('mousedown.drag', this.startDrag);
          this.el.on('touchstart.drag', this.startDrag);
        } else {
          this.el.off('mousedown.drag');
          this.el.off('touchstart.drag');
        }
      } // Start dragging

    }, {
      key: "startDrag",
      value: function startDrag(ev) {

        if(this.m_loonkInstance.isSelectMenuContext() || this.m_loonkInstance.isEditMenuContext())
        {

          var isMouse = !ev.type.indexOf('mouse'); // Check for left button

          if (isMouse && (ev.which || ev.buttons) !== 1) {
            return;
          } // Fire beforedrag event


          if (this.el.dispatch('beforedrag', {
            event: ev,
            handler: this
          }).defaultPrevented) {
            return;
          } // Prevent browser drag behavior as soon as possible


          ev.preventDefault(); // Prevent propagation to a parent that might also have dragging enabled

          ev.stopPropagation(); // Make sure that start events are unbound so that one element
          // is only dragged by one input only

          
          this.init(false);
          this.box = this.el.bbox();
        
          this.lastClick = this.el.point(getCoordsFromEvent(ev)); // We consider the drag done, when a touch is canceled, too
         
          if(isGroup(this.el) || isCanvas(this.el))
          {
            var canvasX = this.el.transform().translateX;
            var canvasY = this.el.transform().translateY;

            this.lastClick = { x: ev.clientX-canvasX, y: ev.clientY-canvasY };
          }

          var eventMove = (isMouse ? 'mousemove' : 'touchmove') + '.drag';
          var eventEnd = (isMouse ? 'mouseup' : 'touchcancel.drag touchend') + '.drag'; // Bind drag and end events to window

          svg_js.on(window, eventMove, this.drag);
          svg_js.on(window, eventEnd, this.endDrag); // Fire dragstart event
          svg_js.on(window, eventMove, this.startRelocate); // Fire mousemove event

          this.el.fire('dragstart', {
            event: ev,
            handler: this,
            box: this.box
          });


          var elType = this.el.type;
          if(elType == "path")
          { 
            
            var newPath = this.el.m_pathString;
            // this.m_loonkInstance.updateElementPoints(newPath, this.el);
            this.el.m_pathString = newPath;
            this.m_loonkInstance.activatePath(this.el)
 
          }

          // Activate plug
          if(this.el.hasClass("--plug--") || this.el.hasClass("--ender--"))
          {
            if(!this.el.hasClass(PLUGGER_ACTIVE_CLASS))
              this.el.addClass(PLUGGER_ACTIVE_CLASS)

            this.connected = false;

          }
 


          // SELECT ON DRAGSTART
          if(this.m_loonkInstance._awa.isUserActionStateSelect())
          {
  
            if(this.m_loonkInstance._awa.isUserMenuSelectContextSelectDefault())
            {
              if(this.el.attr('id') && this.el.attr('id').includes("awa"))
              {
                this.m_loonkInstance._awa.setSelectedElement(this.el);

                this.m_loonkInstance._awa.setSelectedElementsKeys([this.el.attr("id")]);

              }
              this.m_loonkInstance._awa.setElementDraggingStateDragging();
            }

          }


        }

      } // While dragging

    }, {
      key: "drag",
      value: function drag(ev) {
        var box = this.box,
            lastClick = this.lastClick;
  
        var currentClick = this.el.point(getCoordsFromEvent(ev));
        if(isGroup(this.el) || isCanvas(this.el))
          currentClick = { x: ev.clientX, y: ev.clientY };

        var dx = (currentClick.x - lastClick.x);
        var dy = (currentClick.y - lastClick.y);
        
        
        var x = box.x + dx;
        var y = box.y + dy;

        var gx = dx;
        var gy = dy;
        
        var cx = ev.clientX;
        var cy = ev.clientY;
        var point = {x:cx,y:cy};

        var entered = false;

        if(isGroup(this.el) || isCanvas(this.el))
        { 
          gx = this.el.x() + dx;
          gy = this.el.y() + dy;
        }

        var newBox = new svg_js.Box(x, y, box.w, box.h);
         
        if(Math.abs(currentClick.x - lastClick.x)< 1.0) return;

        if (this.el.dispatch('dragmove', {
          event: ev,
          handler: this,
          box: newBox,
        }).defaultPrevented) return;

        if(isGroup(this.el) || isCanvas(this.el)) // Canvas or any group (without affecting children properties)
          {  
            this.move(gx, gy);
            
            if(this.el._connectorEvents)
            {
              for (let i = 0; i < Object.keys(this.el._connectorEvents).length; i++) {
                const evt = Object.keys(this.el._connectorEvents)[i];
                this.el.fire(evt)
              }
            }
          }
        else
        {
          this.move(x, y);

          if(this.el._connectorEvents)
          {
            for (let i = 0; i < Object.keys(this.el._connectorEvents).length; i++) {
              const evt = Object.keys(this.el._connectorEvents)[i];
              this.el.fire(evt)
            }
          }

        }
          
 
        if( (this.el.hasClass("--plug--") && this.el.hasClass(PLUGGER_ACTIVE_CLASS)) || 
            (this.el.hasClass("--connector--") && this.el.hasClass("--ender--")) )
        {
            if(!this.el.connector) return;

            if(this.el.hasClass("--ender--"))
            {
              if(!this.el.connector.target.hasClass("--ender--"))
              {
                this.el.connector.target.off(this.el.connector.elmTargetListener)
                this.el.connector.target = this.el;
              }
              
            }

            this.el.connector.connector.opacity(1)

            this.el.connector.update()
            
            if(this.m_loonkInstance._awa.isElementDraggingStateDragging())
            {
              var elems = document.elementsFromPoint(cx, cy);
              
              // Connect
              elems.forEach((elem)=>{

                if(elem.instance && isCanvasContainer(elem.instance))
                {
                  var canvasOwner = elem.instance.parent();
                  // var canvasItemsGroup = canvasOwner.findOne('.'+CLIP_ID_BODY+GROUP_ID_BODY);
                  if(isPointInCanvas(point,elem)) // Insert
                  {
                    var source = this.el.connector.source;
                    var target = canvasOwner;
                   
                    var sourceCanvasOwner = source.canvasOwnerId();
                    if(isCanvas(source)) sourceCanvasOwner = source.attr("id")

                    if((sourceCanvasOwner != canvasOwner.attr("id")))
                    {

                      var interactionId = this.m_loonkInstance._awa.generateInteractionId();

                      this.el.addClass("awa--no--event")
                      this.m_loonkInstance._awa.createConnector(source, target, interactionId)
                      this.el.off("mousedown")
                      this.el.off("touchstart")
                      this.el.off("mousemove")
                      this.el.connector.unconnect();
                      this.el.connector = null;
                      
                      if(this.el.hasClass("--connector--") || this.el.hasClass("--plug--"))
                        this.el._connectorEvents = null;


                      // Create connection object (interaction) -----------------------

                      var basedOnTarget = source.attr('id');
                      var basedOnTargetCanvas = source.canvasOwnerId() || basedOnTarget; // canvas element or the canvas itself

                      var actionTarget = target.attr('id');
                      var actionTargetCanvas = target.attr('id');

                      // Add interaction
                      var interaction = this.m_loonkInstance._awa.createInteraction(interactionId, basedOnTarget, basedOnTargetCanvas, actionTarget, actionTargetCanvas)
                      this.m_loonkInstance._awa.addInteraction(interaction)

                      // ---------------------------------------------------------------

                      this.connected = true;
                      // entered = true;
                    }
                    
                    ev.stopPropagation();

                  }
                }
              })

            }
            
            // console.log(this.el.connector)
        } 
        
        return newBox;
      }
    },
    {
      key: "move",
      value: function move(x, y) {
        // Svg elements bbox depends on their content even though they have
        // x, y, width and height - strange!
        // Thats why we handle them the same as groups
        if (this.el.type === 'svg') {
          svg_js.G.prototype.move.call(this.el, x, y);
        }
        else 
        {
          this.el.move(x, y);

          var elType = this.el.type;
          if(elType == "path")
          {
            var newPath = this.el.attr("d");
            this.m_loonkInstance.updateElementPoints(newPath, this.el);
            this.el.m_pathString = newPath;

            this.m_loonkInstance.toggleControls(true);
          }
   
        }
      }
    },
    
    // startRelocate : Used to add/remove the element from a canvas
    {
      key: "startRelocate",
      value: function startRelocate(ev) {
        
        
        if(this.m_loonkInstance._awa.isPrototypeAppModeContext()) return;
        
        var x = ev.clientX;
        var y = ev.clientY;
        var point = {x:x,y:y};

        var draggedElement = this.m_loonkInstance._awa.getSelectedElement();

        if(this.m_loonkInstance._awa.isElementDraggingStateDragging())
        {
          var elems = document.elementsFromPoint(x, y);

          // Insert
          elems.forEach((elem)=>{

            if(elem.instance && isCanvasContainer(elem.instance))
            {
              var canvasOwner = elem.instance.parent();
              var canvasItemsGroup = canvasOwner.findOne('.'+CLIP_ID_BODY+GROUP_ID_BODY);
              
              if(draggedElement == canvasOwner) return;

              if(this.el.hasClass("--connector--")) return;
              if(this.el.hasClass("--plug--")) return;

              if(isPointInCanvas(point,elem)) // Insert
              {
                if(!canvasItemsGroup.hasChild(draggedElement))
                {
                  
                  canvasItemsGroup.add(draggedElement);
                  // Append canvas item class
                  draggedElement.addClass(INCANVAS_ITEM_CLASS)
                  var canvasOwnerId = canvasOwner.attr("id");
                  draggedElement.canvasOwnerId(canvasOwnerId) // for refs
                  draggedElement.parentId(canvasOwnerId); // for scene items refs
                  // draggedElement.canvasContainer(elem);

                  // Check if element has effects
                  var elementEffectsGroupId = '#'+draggedElement+EFFECTOR_GROUP_ID_BODY;
                  var elementEffectsGroup = this.m_loonkInstance._awa.getSvgInstance().findOne(elementEffectsGroupId);

                  if(elementEffectsGroup)
                  {
                    canvasItemsGroup.add(elementEffectsGroup);
                    elementEffectsGroup.addClass(INCANVAS_ITEM_CLASS)
                  }

                  // Update scene items
                  this.m_loonkInstance._awa.updateSceneElementParent(draggedElement.attr("id"), canvasItemsGroup.attr("id"))
                  // this.m_loonkInstance._awa.addElementToScene(draggedElement, canvasItemsGroup)

                }

              }
            
            }
          })
          //----------------------------------------------------------

          // Remove
          if(draggedElement && draggedElement.attr('id') && draggedElement.attr('id').includes("awa"))
          if( draggedElement.hasClass(INCANVAS_ITEM_CLASS)) // Is in a canvas
          {

            var canvasOwnerId = draggedElement.canvasOwnerId();
            var canvasContainerId = "#"+canvasOwnerId.split(GROUP_ID_BODY)[0] + CONTAINER_ID_BODY;
            var canvasContainer = this.m_loonkInstance._awa.getSvgInstance().findOne(canvasContainerId); // The rect
            
            var canvasItemsGroupId = "#"+canvasOwnerId.split(GROUP_ID_BODY)[0] + CLIP_ID_BODY+GROUP_ID_BODY;
            var canvasItemsGroup = this.m_loonkInstance._awa.getSvgInstance().findOne(canvasItemsGroupId);
            
            if(!isPointInCanvas(point,canvasContainer.node) && canvasItemsGroup) 
            {
              draggedElement.removeClass(INCANVAS_ITEM_CLASS);
              // draggedElement.canvasOwnerId() = null;
              canvasItemsGroup.revoke(draggedElement);

              draggedElement.parentId(null); // for scene items refs
              draggedElement.canvasOwnerId(null);
              // Check if element has effects
              var elementEffectsGroupId = '#'+draggedElement+EFFECTOR_GROUP_ID_BODY;
              var elementEffectsGroup = this.m_loonkInstance._awa.getSvgInstance().findOne(elementEffectsGroupId);
              
              if(elementEffectsGroup)
              {
                canvasItemsGroup.revoke(elementEffectsGroup);
              }

              // Update scene items
              this.m_loonkInstance._awa.updateSceneElementParent(draggedElement.attr("id"), null)
              // this.m_loonkInstance._awa.addElementToScene(draggedElement)

            }

          }

          // ------------------------------------------------------
          
        }
       
      }
    },

    {
      key: "endDrag",
      value: function endDrag(ev) {
        // final drag
        var box = this.drag(ev); // fire dragend event

        this.el.fire('dragend', {
          event: ev,
          handler: this,
          box: box
        }); // unbind events
        
        // Update dragging state
        this.m_loonkInstance._awa.setElementDraggingStateEnded();

        svg_js.off(window, 'mousemove.drag');
        svg_js.off(window, 'touchmove.drag');
        svg_js.off(window, 'mouseup.drag');
        svg_js.off(window, 'touchend.drag'); // Rebind initial Events

        var elType = this.el.type;
        if(elType == "path")
        {

          var newPath = this.el.attr("d");
          this.el.m_pathString = newPath;
          this.m_loonkInstance.updateElementPoints(newPath, this.el);
          // this.m_loonkInstance.activatePath(this.el)
        }

        // In order to remove the unconnected connector
        if( (this.el.hasClass("--plug--") && this.el.hasClass(PLUGGER_ACTIVE_CLASS)) || 
            (this.el.hasClass("--connector--") && this.el.hasClass("--ender--")) )
        {
          if(!this.connected)
          {
            this.el.off("mousedown")
            this.el.off("touchstart")
            this.el.off("mousemove")
            this.el.connector.unconnect();
            this.el.connector = null;

            if(this.el.hasClass("--connector--") || this.el.hasClass("--plug--"))
              this.el._connectorEvents = null;
          }
           
        }
        
        // Update element
        var attributes = this.el.attr();
        if(isCanvasElement(this.el.attr("id")))
        {
          attributes = {x : this.el.transform().translateX , y : this.el.transform().translateY};
        }

        // Update attributes (x,y)
        this.m_loonkInstance._awa.updateSceneElementAttributes(this.el.attr("id"), attributes);
 

        this.init(true);
      }
    }]);

    return DragHandler;
  }();

  svg_js.extend(svg_js.Element, {
    draggable: function draggable(_this) {
      var enable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var dragHandler = this.remember('_draggable') || new DragHandler(this, _this);
      dragHandler.init(enable);

      return this;
    }
  });

}(SVG));
//# sourceMappingURL=svg.draggable.js.map

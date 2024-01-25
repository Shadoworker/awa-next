/*!
 * SVG.js Connectable Plugin
 * =========================
 *
 * A JavaScript library for connecting SVG things.
 *
 * svg.connectable.js 1.0.1
 * Licensed under the MIT license.
 * Copyright (c) 2014-15 jillix
 * Copyright (c) 2015-17 Loredana Cirstea
 * Copyright (c) 2015 Christian Tzurcanu - Algorithm for creating connector curves, connector paths.
 *
 * */
import { CANVAS_ID_BODY, CONNECTORS_GROUP_CLASS, CONTAINER_ID_BODY, GROUP_ID_BODY, IGNORE_PREVIEW_CLASS } from '../../awa/awa.constants';
import SVG from './svg'


;(function() {

    var container = null;
    var markers = null;

    /**
     * connectable
     * Connects two elements.
     *
     * @name connectable
     * @function
     * @param {Object} options An object containing any of the following fields:
     *
     *  - `container` (SVGElement): The connector elements container. Defaults to source parent.
     *  - `markers` (SVGElement): The marker elements container. Defaults to source parent.
     *  - `sourceAttach` (String): Connector attachment for source element: 'center' / 'perifery'. Defaults to 'center'
     *  - `targetAttach` (String): Connector attachment for target element: 'center' / 'perifery'. Defaults to 'center'
     *  - `type` (String): Connector type: 'straight' or 'curved'. Defaults to 'straight'
     *  - `marker` (String): Can be: an SVGElement / 'null' / 'default'. Defaults to 'null'
     *  - `color` (String): Connector color. Defaults to '#000000'.
     *
     * @param {SVGElement} elmTarget The target SVG element.
     * @return {Object} The connectable object containing:
     *
     *  - `source` (SVGElement): The source element.
     *  - `target` (SVGElement): The target element.
     *  - `connector` (SVGElement): The connector element (line / path / polygon).
     *  - `marker` (SVGElement): The marker element.
     *  - [`computeConnectorCoordinates` (Function)](#computeconnectorcoordinatescon)
     *  - [`update` (Function)](#update)
     *  - [`setConnectorColor` (Function)](#setconnectorcolorcolor-c)
     *  - [`setMarker` (Function)](#setmarker)
     *  - [`setConnectorAttachment` (Function)](#setconnectorattachment)
     *  - [`setConnector` (Function)](#setconnector)
     *  - [`setType` (Function)](#settype)
     */

    function connectable(options, elmTarget) {

        var con = {};

        if (elmTarget === undefined) {
            elmTarget = options;
            options = {};
        }

        container = options.container || this.parent() || container;
        var elmSource = this;
        markers = options.markers || this.parent() || markers;

        // Append the SVG elements
        con.source = elmSource; //'center', 'perifery'
        con.target = elmTarget;
        con.type = options.type || 'straight' //'straight', 'curved'
        con.loonk = options.loonk;
        con.interactionId = options.interactionId;
        con.init = options.init || false;

        if(options.connector) {
            var target = SVG.get(options.connector.node.attributes.href.value.slice(1))
            if(target.type == 'path') {
                con.connector = options.connector
                var patharr = target.array().value
                if(!(patharr[1][0] == 'M') || !(patharr[2][0] == 'M')){
                    var box = target.rbox();
                    patharr.splice(0,0,['M', box.x+box.width/2, box.y], ['M', box.x + box.width/2, box.y2]);
                    target.plot(patharr);
                }
                con.connector.target = target;
            }
        }

        if(!con.connector) {
            con.connector = container.path().attr('connectortype', 'default').fill('none');
            var connectorsGroup = con.loonk.m_svgInstance.findOne("#"+CONNECTORS_GROUP_CLASS);
            connectorsGroup.front();
            connectorsGroup.add(con.connector)
        }

        con.sourceAttach = options.sourceAttach || 'center'
        con.targetAttach = options.targetAttach || 'center'
        con.color = options.color || '#60D6CD'


        /**
         * setMarker
         * The function that sets the marker
         * It can be an SVGElement / 'default' / 'null'
         *
         * @name setMarker
         * @function
         * @param {String} SVGElement / 'default' / 'null'
         * @param {SVGElement} markers Optional parent for the marker element.
         * @return {Connectable} The connectable instance.
         */
        con.setMarker = function(marker, markers, c){
            c = c || this;

            if(markers)
                    c.markers = markers;
            if(!marker || marker == 'null'){
                c.marker = null
                if(c.connector.attr("marker-end")){
                    var markerid = c.connector.attr("marker-end");
                    SVG.get(markerid.slice(5, markerid.length-1)).remove();
                    c.connector.removeClass("marker-end");
                }
            }
            else if(marker == 'default'){
                var marker = c.markers.marker(25, 25);
                var markerStart = c.markers.marker(25, 25);
                var markerId = "circle-marker-" + Math.random().toString(16);
                var markerIdStart = "circle-marker-" + Math.random().toString(16);
                // c.connector.attr("marker-end", "url(#" + markerId + ")");
                c.connector.attr("marker-start", "url(#" + markerIdStart + ")");

                if(con.init)
                {
                    c.connector.opacity(0) 
                }

                marker.attr({
                    id: markerId,
                    viewBox: "0 0 35 35",
                    refX: "0",
                    refY: "10",
                    markerUnits: "strokeWidth",
                    markerWidth: "12",
                    markerHeight: "15"
                });

                markerStart.attr({
                    id: markerIdStart,
                    viewBox: "0 0 35 35",
                    refX: "14",
                    refY: "14",
                    markerUnits: "strokeWidth",
                    markerWidth: "12",
                    markerHeight: "15"
                });

                marker.path().attr({
                    // d: "M 0 0 L 30 15 L 0 30 z"
                    d : "M29 14.5C29 22.5081 22.5081 29 14.5 29C6.49187 29 0 22.5081 0 14.5C0 6.49187 6.49187 0 14.5 0C22.5081 0 29 6.49187 29 14.5Z"
                });

                
                markerStart.path().attr({
                    // d: "M 0 0 L 30 15 L 0 30 z"
                    d : "M29 14.5C29 22.5081 22.5081 29 14.5 29C6.49187 29 0 22.5081 0 14.5C0 6.49187 6.49187 0 14.5 0C22.5081 0 29 6.49187 29 14.5Z"
                }).transform({ scale: 0.25 }).css({display:con.init? "none":"block"});

                c.marker = marker;
                c.markerStart = markerStart;
                c.marker.fill(c.color)
                c.markerStart.fill("white");
                c.markerStart.stroke({ width:4, color:"#50B5AD"});

                var starter = container.circle(10,10).attr({fill:"#ffffff", opacity:0.0}).addClass("--connector--").addClass("--starter--")
                starter.addClass(IGNORE_PREVIEW_CLASS)
                
                var ender = null;
              

                starter.connector = c;

                var m_loonkInstance = con.loonk;

                var connector = con.connector;
                var totalLength = connector.node.getTotalLength();
                var startPoint = connector.node.getPointAtLength(0);
                var endPoint = connector.node.getPointAtLength(totalLength);

                starter.attr({cx:startPoint.x - 0, cy : startPoint.y})
                
                starter.draggable(m_loonkInstance)

                starter.on("mouseenter", (evt)=>{
                    starter.attr({opacity:1})
                })
                starter.on("mouseleave", (evt)=>{
                    starter.attr({opacity:0.0})
                })

                if(!con.init)
                {
                    ender = container.circle(10,10).attr({fill:"#60D6CD"}).addClass("--connector--").addClass("--ender--")
                                     .stroke({width:1.5, color:"#50B5AD"})


                    ender.connector = c;
                    ender.attr({cx:endPoint.x + 0, cy : endPoint.y})
                    ender.draggable(m_loonkInstance)

                    ender.addClass(IGNORE_PREVIEW_CLASS)


                }

                c.starter = starter;
                c.ender = ender;
            }
            else
                c.marker = marker
            return c;
        }

        con.setMarker('default', container.group());
        // con.setMarker(options.markerStart, markers);


        /**
         * computeConnectorCoordinates
         * The function that computes the new coordinates.
         *
         * @name computeConnectorCoordinates
         * @function
         * @param {Connectable} con The connectable instance.
         * @return {Object} An object containing the connector path array.
         */
        con.computeConnectorCoordinates = function (con) {
            con = con || this;
            var temp = {}, p;

            var sPos, tPos;
            if(con.source)
                sPos = con.source.rbox();
            // if(con.target.type != "rect")
            {
                // console.log(con.target)
                tPos = con.target.rbox();

            }

            if(con.sourceAttach == 'center') {
                temp.point1 = [con.source.cx(), con.source.cy()]
            }
            else if(con.source.type == 'ellipse'){
                // Get ellipse radius
                var xR1 = parseFloat(con.source.attr('rx'));
                var yR1 = parseFloat(con.source.attr('ry'));

                var sx = con.source.cx() - xR1/2
                var sy = con.source.cy()

                var tx = con.target.cx() - xR1/2
                var ty = con.target.cy() 

                var yfactor = -1.5;
                if(sy > ty) yfactor = -1.5;

                sy += (10*yfactor)

                // Calculate distance from source center to target center
                var dx = tx - sx;
                var dy = ty - sy;
                var d = Math.sqrt(dx * dx + dy * dy);

                // Construct unit vector between centers
                var ux = dx / d;
                var uy = dy / d;

                // Point on source circle
                var x1 = sx + xR1 * ux;
                var y1 = sy + yR1 * uy;

                temp.point1 = [x1 + xR1 / 2, y1 + yR1 / 2]
            }
            else if(con.source.type == 'path'){
                var arr1 = JSON.parse(JSON.stringify(con.source.array().value));
                if(arr1[arr1.length-1][0] == 'Z')
                    arr1.splice(arr1.length-1,1)
                var arr = arr1;
                var point = 'point2'
            }
            else if(con.source.type == 'g' && con.source.attr("id") && con.source.attr("id").includes(CANVAS_ID_BODY) && con.source.attr("id").includes(GROUP_ID_BODY)){

                var canvasRectId = con.source.attr("id").split(GROUP_ID_BODY)[0] + CONTAINER_ID_BODY;

                var realSource = con.source.findOne("#"+canvasRectId)
                var transform = con.source.transform();
                var _x = transform.translateX, _y = transform.translateY;
                var arr1 = [
                    ['M', realSource.cx()+_x, realSource.y()+_y],
                    ['L', realSource.x()+_x + realSource.bbox().width, realSource.cy()+_y],
                    ['L', realSource.cx()+_x, realSource.y() + realSource.bbox().height+_y],
                    ['L', realSource.x()+_x, realSource.cy()+_y]
                ]
                var arr = arr1
                var point = 'point2'
            }
            else if(con.source.type == 'g'){

                var realSource = con.source
                var _x = 0, _y = 0;
                var arr1 = [
                    ['M', realSource.cx()+_x, realSource.y()+_y],
                    ['L', realSource.x()+_x + tPos.width, realSource.cy()+_y],
                    ['L', realSource.cx()+_x, realSource.y() + realSource.bbox().height+_y],
                    ['L', realSource.x()+_x, realSource.cy()+_y]
                ]
                var arr = arr1
                var point = 'point2'
            }
            else{
                var arr1 = [
                    ['M', con.source.cx(), con.source.y()],
                    ['L', con.source.x() + sPos.width, con.source.cy()],
                    ['L', con.source.cx(), con.source.y() + sPos.height],
                    ['L', con.source.x(), con.source.cy()]
                ]
                var arr = arr1
                var point = 'point2'
            }


            if(con.targetAttach == 'center') {
                temp.point2 = [con.target.cx(), con.target.cy()]
            }
            else if(con.target.type == 'ellipse'){
                // Get ellipse radius
                var xR2 = parseFloat(con.target.attr('rx'));
                var yR2 = parseFloat(con.target.attr('ry'));

                // Get centers
                var sx = con.source.cx() - xR2/2
                var sy = con.source.cy()

                var tx = con.target.cx() - xR2/2
                var ty = con.target.cy() 

                var yfactor = -1.5;
                if(sy > ty) yfactor = -1.5;

                ty += (10*yfactor)

                // Calculate distance from source center to target center
                var dx = tx - sx;
                var dy = ty - sy;
                var d = Math.sqrt(dx * dx + dy * dy);

                // Construct unit vector between centers
                var ux = dx / d;
                var uy = dy / d;

                // Point on target circle
                var x2 = sx + (d - xR2 - 5) * ux;
                var y2 = sy + (d - yR2 - 5) * uy;

                temp.point2 = [x2 + xR2 / 2, y2 + yR2 / 2]
            }
            else if(con.target.type == 'path'){
                var arr2 = JSON.parse(JSON.stringify(con.target.array().value));
                if(arr2[arr2.length-1][0] == 'Z') {
                    arr2.splice(arr2.length-1,1)
                }
                var arr = arr2;
                var point = 'point1'
            }
            else if(con.target.type == 'g' && con.target.attr("id") && con.target.attr("id").includes(CANVAS_ID_BODY) && con.target.attr("id").includes(GROUP_ID_BODY)){

                var canvasRectId = con.target.attr("id").split(GROUP_ID_BODY)[0] + CONTAINER_ID_BODY;

                var realTarget = con.target.findOne("#"+canvasRectId)
                var transform = con.target.transform();
                var _x = transform.translateX, _y = transform.translateY;
                var arr2 = [
                    ['M', realTarget.cx()+_x, realTarget.y()+_y],
                    ['L', realTarget.x()+_x + tPos.width, realTarget.cy()+_y],
                    ['L', realTarget.cx()+_x, realTarget.y() + realTarget.bbox().height+_y],
                    ['L', realTarget.x()+_x, realTarget.cy()+_y]
                ]
                var arr = arr2
                var point = 'point1'
            }
            else if(con.target.type == 'g'){

                var realTarget = con.target
                var _x = 0, _y = 0;

                var arr2 = [
                    ['M', realTarget.cx()+_x, realTarget.y()+_y],
                    ['L', realTarget.x()+_x + realTarget.bbox().width, realTarget.cy()+_y],
                    ['L', realTarget.cx()+_x, realTarget.y() + realTarget.bbox().height+_y],
                    ['L', realTarget.x()+_x, realTarget.cy()+_y]
                ]
                var arr = arr2
                var point = 'point1'
            }
            else if(con.target.type == 'use'){

                var realTarget = con.target
                var _x = 0, _y = 0;
                // console.log(realTarget.bbox())
 
                var arr2 = [
                    ['M', realTarget.cx()+_x, realTarget.y()+_y],
                    ['L', realTarget.x()+_x + realTarget.bbox().width, realTarget.cy()+_y],
                    ['L', realTarget.cx()+_x, realTarget.y() + realTarget.bbox().height+_y],
                    ['L', realTarget.x()+_x, realTarget.cy()+_y]
                ]
                var arr = arr2
                var point = 'point1'
            }
            else{
                var arr2 = [
                    ['M', con.target.cx(), con.target.y()],
                    ['L', con.target.x() + tPos.width, con.target.cy()],
                    ['L', con.target.cx(), con.target.y() + tPos.height],
                    ['L', con.target.x(), con.target.cy()]
                ]
                var arr = arr2
                var point = 'point1'
            }

            if(!temp.point1 || !temp.point2){
                temp.min = Number.MAX_VALUE;
                if(!temp.point1 && !temp.point2) {
                    for(var i = 0 ; i < arr1.length; i++){
                        for(var j = 0 ; j < arr2.length; j++){
                            var dist = Math.pow((arr2[j][arr2[j].length-2] - arr1[i][arr1[i].length-2]),2) + Math.pow((arr2[j][arr2[j].length-1] - arr1[i][arr1[i].length-1]),2)
                            if(temp.min > dist){
                                temp.min = dist
                                temp.point1 = [arr1[i][arr1[i].length-2], arr1[i][arr1[i].length-1]]
                                temp.point2 = [arr2[j][arr2[j].length-2], arr2[j][arr2[j].length-1]]
                            }
                        }
                    }
                }
                else{
                    point = temp[point];
                    for(var i = 0 ; i < arr.length; i++){
                        var dist = Math.pow((point[0] - arr[i][arr[i].length-2]),2) + Math.pow((point[1] - arr[i][arr[i].length-1]),2)
                        if(temp.min > dist){
                            temp.min = dist
                            temp.point = [arr[i][arr[i].length-2], arr[i][arr[i].length-1]]
                        }
                    }
                    if(!temp.point1)
                        temp.point1 = temp.point
                    else
                        temp.point2 = temp.point
                }
            }

            var pp1 = temp.point1
            var pp2 = temp.point2

            if(con.type == 'curved'){
                // TODO fix this algorithm
                /*
                var c1 = {x: con.source.cx(), y: con.source.cy()}
                var c2 = {x: con.target.cx(), y: con.target.cy()}

                if(Math.abs(pp1[0] - c1.x) > 0.5){
                    var m1 = (pp1[1] - c1.y) / (pp1[0] - c1.x)
                    var b1 = pp1[1] - m1 * pp1[0];

                    if(Math.abs(pp2[0] - pp1[0]) < Math.abs(pp2[1] - pp1[1])){
                        var x1 = pp1[0] + (pp2[0] - pp1[0]) / 5
                        var attr1 = {x: x1, y: m1 * x1 + b1}
                    }
                    else if(Math.abs(pp1[1] - c1.y) > 0.5){
                        var y1 = pp1[1] + (pp2[1] - pp1[1]) / 5
                        var attr1 = {x: (y1 - b1) / m1, y: y1}
                    }
                    else{
                        if(pp2[0]-pp1[0] >= 0)
                            var sign = 1
                        else
                            var sign = -1
                        var attr1 = {x: pp1[0] + sign * Math.abs((pp2[1] - pp1[1]) / 5), y: pp1[1]}
                    }
                }
                else
                    var attr1 = {x: pp1[0], y: pp1[1] + (pp2[1] - pp1[1]) / 5}


                if(Math.abs(pp2[0] - c2.x) > 0.5){
                    var m2 = (pp2[1] - c2.y) / (pp2[0] - c2.x)
                    var b2 = pp2[1] - m2 * pp2[0];

                    if(Math.abs(pp2[0] - pp1[0]) < Math.abs(pp2[1] - pp1[1])){
                        var x2 = pp2[0] - (pp2[0] - pp1[0]) / 5
                        var attr2 = {x: x2, y: m2 * x2 + b2}
                    }
                    else if(Math.abs(pp2[1] - c2.y) > 0.5){
                        var y2 = pp2[1] - (pp2[1] - pp1[1]) / 5
                        var attr2 = {x: (y2 - b2) / m2, y: y2}
                    }
                    else{
                        if(pp2[0]-pp1[0] >= 0)
                            var sign = 1
                        else
                            var sign = -1
                        var attr2 = {x: pp2[0] - sign * Math.abs((pp2[1] - pp1[1]) / 5), y: pp2[1]}
                    }
                }
                else
                    var attr2 = {x: pp2[0], y: pp2[1] - (pp2[1] - pp1[1]) / 5}

                var middle = {x: attr1.x + (attr2.x - attr1.x) / 2, y: attr1.y + (attr2.y - attr1.y) / 2}
                */

                // Tried re-writing the above, but result is less nice than the simple algorithm form below

                /*var factor = 4;
                var c1 = {x: con.source.cx(), y: con.source.cy()};
                var c2 = {x: con.target.cx(), y: con.target.cy()};
                var diff1 = pp2[0] - pp1[0];
                var diff2 = pp2[1] - pp1[1];
                var sign1 = diff1 < 0 ? -1 : 1;
                var sign2 = diff2 < 0 ? -1 : 1;
                diff1 = Math.abs(diff1);
                diff2 = Math.abs(diff2);
                var delta1 = Math.max(diff1 / factor, 20);
                var delta2 = Math.max(diff2 / factor, 20);

                if(Math.abs(pp1[0] - c1.x) > 0.5){
                    var m1 = (pp1[1] - c1.y) / (pp1[0] - c1.x)
                    var b1 = pp1[1] - m1 * pp1[0];

                    if(diff1 < diff2){
                        var x1 = pp1[0] + sign1 * delta1;
                        var attr1 = {x: x1, y: m1 * x1 + b1}
                    }
                    else if(Math.abs(pp1[1] - c1.y) > 0.5){
                        var y1 = pp1[1] + sign2 * delta2;
                        var attr1 = {x: (y1 - b1) / m1, y: y1}
                    }
                    else{
                        var attr1 = {x: pp1[0] + sign2 * delta2, y: pp1[1]}
                    }
                }
                else
                    var attr1 = {x: pp1[0], y: pp1[1] + sign2 * delta2}


                if(Math.abs(pp2[0] - c2.x) > 0.5){
                    var m2 = (pp2[1] - c2.y) / (pp2[0] - c2.x)
                    var b2 = pp2[1] - m2 * pp2[0];

                    if(diff1 < diff2) {
                        var x2 = pp2[0] - sign1 * delta1
                        var attr2 = {x: x2, y: m2 * x2 + b2}
                    }
                    else if(Math.abs(pp2[1] - c2.y) > 0.5){
                        var y2 = pp2[1] - sign2 * delta2
                        var attr2 = {x: (y2 - b2) / m2, y: y2}
                    }
                    else{
                        var attr2 = {x: pp2[0] - sign1 * delta2, y: pp2[1]}
                    }
                }
                else
                    var attr2 = {x: pp2[0], y: pp2[1] - sign2 * delta2}

                var middle = {x: attr1.x + (attr2.x - attr1.x) / 2, y: attr1.y + (attr2.y - attr1.y) / 2}*/

                // Temporary curved algorithm
                var delta = (pp2[1] - pp1[1]) / 4;
                var sign = delta < 0 ? -1 : 1;
                delta = Math.max(Math.abs(delta), 20);

                if(Math.abs(pp1[1] - pp2[1]) < 10) delta = 0;

                // console.log(pp1, pp2)

                var attr1 = {x: pp1[0], y: pp1[1] + sign * delta}
                var attr2 = {x: pp2[0], y: pp2[1] - sign * delta}
                var middle = {x: attr1.x + (attr2.x - attr1.x) / 2, y: attr1.y + (attr2.y - attr1.y) / 2}



                var points = [
                    ['M', pp1[0], pp1[1]],
                    ['C', attr1.x, attr1.y, attr1.x, attr1.y, middle.x, middle.y],
                    ['C', attr2.x, attr2.y, attr2.x, attr2.y, pp2[0], pp2[1]]
                ]

                /*if(con.attr1) con.attr1.remove()
                if(con.middle) con.middle.remove()
                if(con.attr2) con.attr2.remove()

                con.attr1 = con.source.parent().circle(5).cx(attr1.x).cy(attr1.y).fill('#2a88c9')
                con.middle = con.source.parent().circle(10).cx(middle.x).cy(middle.y)
                con.attr2 = con.source.parent().circle(5).cx(attr2.x).cy(attr2.y)*/
            }
            else
                var points = [
                    ['M', pp1[0], pp1[1]],
                    ['L', pp2[0], pp2[1]]
                ]
            return points;
        };

        elmSource.cons = elmSource.cons || [];
        elmSource.cons.push(con);

        /**
         * update
         * Updates the connector's path
         *
         * @name update
         * @function
         * @return {undefined}
         */
       con.update = function () {

            if(!con) return;

            if(con.connector.attr('connectortype') == 'default'){
                
                con.connector.plot(con.computeConnectorCoordinates(con))

                // Update handlers
                // console.log("**");
                
                var connector = con.connector;
                var totalLength = connector.node.getTotalLength();
                var startPoint = connector.node.getPointAtLength(0);
                var endPoint = connector.node.getPointAtLength(totalLength);

                if(con.starter && con.ender)
                {
                    con.starter.attr({cx:startPoint.x - 0, cy:startPoint.y})
                    con.ender.attr({cx:endPoint.x + 0, cy:endPoint.y})
                }
               
            }
            else{
                var arr = con.connector.target.array().value;
                //find connector's attachment points
                var path = con.computeConnectorCoordinates(con)
                //console.log('computeConnectorCoordinates',path )
                var pp1 = [path[0][1], path[0][2]]
                var pp2 = [path[path.length-1][path[path.length-1].length-2], path[path.length-1][path[path.length-1].length-1]]

                //compare line(between attachment points) lengths for scale
                var newdiag = Math.sqrt(Math.pow((pp2[0] - pp1[0]),2) + Math.pow((pp2[1] - pp1[1]),2))
                var olddiag = Math.sqrt(Math.pow((arr[1][1] - arr[0][1]),2) + Math.pow((arr[1][2] - arr[0][2]),2))

                var scale = newdiag / olddiag

                //new angle of connector
                var angle = Math.atan((pp2[1] - pp1[1]) / (pp2[0] - pp1[0]))
                if(angle > 0 && pp2[1] < pp1[1])
                    angle = Math.PI + angle
                else if(angle < 0 && pp2[1] > pp1[1] && pp2[0] < pp1[0])
                    angle = Math.PI + angle

                //new center coordinates for the connector
                var tcenter = {x: pp1[0] + (pp2[0]-pp1[0]) / 2, y: pp1[1] + (pp2[1]-pp1[1]) / 2}

                //get original angle and center of the connector
                var originalangle = Math.atan((arr[1][2] - arr[0][2]) / (arr[1][1] - arr[0][1]))
                var center = {x: con.connector.target.cx(), y: con.connector.target.cy()}

                //initialize matrix with translation from original center to the new center
                var m = [1, 0, 0, 1, tcenter.x - center.x, tcenter.y - center.y];

                //rotate translated matrix
                var aa = m[0],
                    ab = m[1],
                    ac = m[2],
                    ad = m[3],
                    atx = m[4],
                    aty = m[5],
                    st = Math.sin(-angle+originalangle),
                    ct = Math.cos(-angle+originalangle)
                //first translate back to origin (0,0) by deducting new center coordinates
                atx = - aa * tcenter.x - ac * tcenter.y + atx
                aty = - ab * tcenter.x - ad * tcenter.y + aty
                //matrix rotation algorithm
                m[0] = aa*ct + ab*st;
                m[1] = -aa*st + ab*ct;
                m[2] = ac*ct + ad*st;
                m[3] = -ac*st + ct*ad;
                m[4] = ct*atx + st*aty;
                m[5] = ct*aty - st*atx;
                //translate to new center coordinates
                m[4] = aa * tcenter.x + ac * tcenter.y + m[4]
                m[5] = ab * tcenter.x + ad * tcenter.y + m[5]

                //translate neutral matrix to origin by deducting original center coordinated then scale and translate again to original center
                var aa = 1,
                    ab = 0,
                    ac = 0,
                    ad = 1,
                    atx = (- aa * center.x - ac * center.y) * scale,
                    aty = (- ab * center.x - ad * center.y) * scale,
                    sm = []

                sm[0] = aa * scale
                sm[1] = ab * scale
                sm[2] = ac * scale
                sm[3] = ad * scale
                sm[4] = aa * center.x + ac * center.y + atx
                sm[5] = ab * center.x + ad * center.y + aty

                //multiply scaled matrix with rotated matrix

                var matrix = [];

                matrix[0] = sm[0]*m[0] + sm[1]*m[2];
                matrix[1] = sm[0]*m[1] + sm[1]*m[3];
                matrix[2] = sm[2]*m[0] + sm[3]*m[2];
                matrix[3] = sm[2]*m[1] + sm[3]*m[3];
                matrix[4] = m[0]*sm[4] + m[2]*sm[5] + m[4];
                matrix[5] = m[1]*sm[4] + m[3]*sm[5] + m[5];

                matrix = new SVG.Matrix(matrix.join(','))
                con.connector.transform(matrix);
            }
        };

        con.update();

        var connectorEvents = elmSource._connectorEvents ? elmSource._connectorEvents :{}; // keeping track of source connector events
        
        var connectorEvents2 = elmTarget._connectorEvents ? elmTarget._connectorEvents :{}; // keeping track of target connector events
        
        var listenerIndex = elmSource._connectorEventsLastIndex || 0;
        var listenerIndex2 = elmTarget._connectorEventsLastIndex || 0;

        listenerIndex = listenerIndex + 1;
        listenerIndex2 = listenerIndex2 + 1;

        var elmSourceId = elmSource.attr('id')
        var elmTargetId = elmTarget.attr('id')

        var listenerName = "conlistener-"+elmSourceId+"-"+listenerIndex;
        var listenerName2 = "conlistener-"+elmTargetId+"-"+listenerIndex2;
 
        connectorEvents = {...connectorEvents , ...{[listenerName] : function(){con.update()}}}
        connectorEvents2 = {...connectorEvents2 , ...{[listenerName2] : function(){con.update()}}}
 
        elmSource._connectorEvents = connectorEvents;
        elmSource._connectorEventsLastIndex = listenerIndex;

        elmTarget._connectorEvents = connectorEvents2;
        elmTarget._connectorEventsLastIndex = listenerIndex2;
        
        elmSource.on(listenerName, connectorEvents[listenerName]);
        elmTarget.on(listenerName2, connectorEvents2[listenerName2]);

        con.elmTargetListener = listenerName2;

        /**
         * setConnectorColor
         * Sets the connector color.
         *
         * @name setConnectorColor
         * @function
         * @param {String} color The new color.
         * @param {Connectable} c The connectable instance.
         * @return {undefined}
         */
        con.setConnectorColor = function (color, c) {
            c = c || this;
            c.color = color;
            var width = 2.5;
            c.connector.stroke(color);
            c.connector.stroke({width});
            if(c.marker)
                c.marker.fill(color);
        };
        con.setConnectorColor(con.color)

        /**
         * setConnectorAttachment
         * Sets the connector's attachment type.
         *
         * @name setConnectorAttachment
         * @function
         * @param {String} element Can be either 'source' or 'target'
         * @param {String} type Can be either 'center' or 'perifery'
         * @param {Connectable} c The connectable instance.
         * @return {undefined}
         */
        con.setConnectorAttachment = function(element, type, c){
            c = c || this;
            c[element+'Attach'] = type;
            c.update();
        }

        /**
         * setConnector
         * Sets the connector
         *
         * @name setConnector
         * @function
         * @param {SVGElement} connector Can be either an SVGElement or 'default'
         * @param {Connectable} c The connectable instance.
         * @return {undefined}
         */
        con.setConnector = function(connector, c){
            c = c || this;
            if(connector){
                c.connector.remove();
                if(connector == 'default'){
                    c.connector = container.path().attr('connectortype', 'default').fill('none');
                    c.connector.addClass(IGNORE_PREVIEW_CLASS)
                    c.setConnectorColor(c.color);
                }
                else
                    c.connector = connector;
                c.update();
            }
        }


        /**
         * unconnect
         * Sets the connector
         *
         * @name unconnect
         * @function
         * @return {undefined}
         */
            con.unconnect = function(){
                var c = this;
                c.connector.remove();
                c.markers.remove();

                var sourceConIndex = c.source.cons.indexOf(c)
                // console.log(sourceConIndex)
                c.source.cons.splice(sourceConIndex,1)

                var connectorEvents = c.source._connectorEvents;

                var connectorEvent = Object.entries(connectorEvents)[sourceConIndex];

                var listenerName = connectorEvent[0]; // get the name
                
                c.source.off(listenerName);
                
                delete connectorEvents[listenerName];
                c.source._connectorEvents = connectorEvents;

                // Target -------------

                var connectorEventTarget = c.elmTargetListener;
                // console.log(connectorEventTarget)

                c.target.off(connectorEventTarget)
                var connectorEvents2 = c.target._connectorEvents || {};
                delete connectorEvents2[connectorEventTarget];

                c.target._connectorEvents = connectorEvents2;

                // --------------------
                
                c.starter.remove();
                if(c.ender)
                {
                    c.ender.removeClass("--connector--")
                    c.ender.removeClass("--ender--")
                    c.ender.cons = null;
                    c.ender.connector = null;
                    c.ender.remove();
                }
               
                if(con.init)
                {
                    c.target._connectorEvents = null;
                    c.target.remove();
                    // c.target.connector = null;

                }

                // c.update = null
                // con = null;
 
            }

        /**
         * setType
         * Sets the connector's type.
         *
         * @name setType
         * @function
         * @param {String} type Can be either 'straight' or 'curved'
         * @param {Connectable} c The connectable instance.
         * @return {undefined}
         */
        con.setType = function(type, c){
            c = c || this;
            if(['straight', 'curved'].indexOf(type) != -1){
                if(c.type != type){
                    c.type = type;
                    c.update();
                }
            }
        }

        return con;
    }

    SVG.extend(SVG.Element, {
        connectable: connectable
    });
}).call(this);

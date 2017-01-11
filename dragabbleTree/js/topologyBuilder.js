/*Copyright (c) 2013-2016, Rob Schmuecker
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

* The name Rob Schmuecker may not be used to endorse or promote products
derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/
define([], function () {
    'use strict';


    var topologyContainerId,
        treeData,
        visualizerMode,
        collapseChildrenThreshold = 5;

    var events = d3.dispatch("nodeClick", "linkClick", "nodeMouseOver", "nodeMouseOut");

    function buildTopology() {
        var node,
            dragListener,
            scale, x, y,
            dragStarted,
            nodes,
            domNode,
            nodePaths,
            links,
            nodesExit,
            parentLink,
            relCoords,
            translateCoords,
            generationWidth = 150,
            lineHeight = 150,
            nodePositionOffset = 20;

        // Calculate total nodes, max label length
        var totalNodes = 0;
        var maxLabelLength = 0;
        var totalDepth = 0;
        // variables for drag/drop
        var selectedNode = null;
        var draggingNode = null;
        // panning variables
        var panSpeed = 200;
        var panBoundary = 20; // Within 20px from edges will pan when dragging.
        // Misc. variables
        var i = 0;
        var duration = 750;
        var root;

        var $topologyContainer = $("#" + topologyContainerId);
        // size of the diagram
        var viewerWidth = $topologyContainer.width();
        var viewerHeight = $topologyContainer.height();

        var tree = d3.layout.tree()
            .size([ viewerHeight, viewerWidth ]);

        // define a d3 diagonal projection for use by the node paths later on.
        var diagonal = d3.svg.diagonal()
            .projection(function (d) {
                return [ d.y, d.x ];
            });


        //AK's hack

        var nodeRegistry = {};

        //END AK's hack


        // A recursive helper function for performing some setup by walking through all nodes

        function visit(parent, visitFn, childrenFn) {
            if (!parent) return;

            visitFn(parent);

            var children = childrenFn(parent);
            if (children) {
                var count = children.length;
                for (var i = 0; i < count; i++) {
                    visit(children[ i ], visitFn, childrenFn);
                }
            }
        }

        // Call visit function to establish maxLabelLength
        visit(treeData, function (d) {
            totalNodes++;
            maxLabelLength = Math.max(d.name.length, maxLabelLength);
            d.childrenState = "expanded";
            if (d.children && d.children.length > collapseChildrenThreshold) {
                // d._children = d.children;
                // d.children = [];                
                // d.childrenState = "collapsed";

                if (!d.groupNode) {
                    var intermediateNode = {
                        name: "",
                        children: d.children,
                        childrenState: "collapsed",
                        groupNode: true,
                        depth: d.depth + 1
                    };
                    d.children = [ intermediateNode ];
                    d.childrenGrouped = true;
                    d.intermediateNode = null;
                } else {
                    d._children = d.children;
                    d.children = [];
                    d.childrenState = "collapsed";
                }
            }                
            
        }, function (d) {
            var children = null;
            if (d.children && d.children.length > 0 ) {
                children = d.children;
            }
            else if (d._children && d._children.length > 0 ) {
                children = d._children;
            }
            return children;
        });


        // sort the tree according to the node names

        function sortTree() {
            tree.sort(function (a, b) {
                return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
            });
        }

        // AK's Hack
        // sort the tree according to the node wrappers

        // function sortTree() {
        //     tree.sort(function(a, b) {
        //         if (!a.wrapper) a.wrapper = "";
        //         if (!b.wrapper) b.wrapper = "";
        //         return b.wrapper.toLowerCase() < a.wrapper.toLowerCase() ? 1 : -1;
        //     });
        // }    
        // END AK's Hack




        // Sort the tree initially incase the JSON isn't in a sorted order.
        sortTree();

        // TODO: Pan function, can be better implemented.

        function pan(domNode, direction) {
            var speed = panSpeed;
            if (panTimer) {
                clearTimeout(panTimer);
                translateCoords = d3.transform(svgGroup.attr("transform"));
                if (direction == 'left' || direction == 'right') {
                    translateX = direction == 'left' ? translateCoords.translate[ 0 ] + speed : translateCoords.translate[ 0 ] - speed;
                    translateY = translateCoords.translate[ 1 ];
                } else if (direction == 'up' || direction == 'down') {
                    translateX = translateCoords.translate[ 0 ];
                    translateY = direction == 'up' ? translateCoords.translate[ 1 ] + speed : translateCoords.translate[ 1 ] - speed;
                }
                scaleX = translateCoords.scale[ 0 ];
                scaleY = translateCoords.scale[ 1 ];
                scale = zoomListener.scale();
                svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
                d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
                zoomListener.scale(zoomListener.scale());
                zoomListener.translate([ translateX, translateY ]);
                panTimer = setTimeout(function () {
                    pan(domNode, speed, direction);
                }, 50);
            }
        }

        // Define the zoom function for the zoomable tree

        function zoom() {
            svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }


        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        var zoomListener = d3.behavior.zoom().scaleExtent([ 0.1, 3 ]).on("zoom", zoom);

        function initiateDrag(d, domNode) {
            draggingNode = d;
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
            d3.select(domNode).attr('class', 'node activeDrag');

            svgGroup.selectAll("g.node").sort(function (a, b) { // select the parent and sort the path's
                if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
                else return -1; // a is the hovered element, bring "a" to the front
            });
            // if nodes has children, remove the links and nodes
            if (nodes.length > 1) {
                // remove link paths
                links = tree.links(nodes);
                nodePaths = svgGroup.selectAll("path.link")
                    .data(links, function (d) {
                        return d.target.id;
                    }).remove();
                // remove child nodes
                nodesExit = svgGroup.selectAll("g.node")
                    .data(nodes, function (d) {
                        return d.id;
                    }).filter(function (d, i) {
                        if (d.id == draggingNode.id) {
                            return false;
                        }
                        return true;
                    }).remove();
            }

            // remove parent link
            parentLink = tree.links(tree.nodes(draggingNode.parent));
            svgGroup.selectAll('path.link').filter(function (d, i) {
                if (d.target.id == draggingNode.id) {
                    return true;
                }
                return false;
            }).remove();

            dragStarted = null;
        }

        // define the baseSvg, attaching a class for styling and the zoomListener
        var baseSvg = d3.select("#" + topologyContainerId).append("svg")
            .attr("class", "topology-outer")
            .call(zoomListener);


        // Define the drag listeners for drag/drop behaviour of nodes.
        dragListener = d3.behavior.drag()
            .on("dragstart", function (d) {
                if (d == root) {
                    return;
                }
                dragStarted = true;
                nodes = tree.nodes(d);
                d3.event.sourceEvent.stopPropagation();
                // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
            })
            .on("drag", function (d) {
                if (d == root) {
                    return;
                }
                if (dragStarted) {
                    domNode = this;
                    initiateDrag(d, domNode);
                }

                // get coords of mouseEvent relative to svg container to allow for panning
                relCoords = d3.mouse($('svg').get(0));
                if (relCoords[ 0 ] < panBoundary) {
                    panTimer = true;
                    pan(this, 'left');
                } else if (relCoords[ 0 ] > ($('svg').width() - panBoundary)) {

                    panTimer = true;
                    pan(this, 'right');
                } else if (relCoords[ 1 ] < panBoundary) {
                    panTimer = true;
                    pan(this, 'up');
                } else if (relCoords[ 1 ] > ($('svg').height() - panBoundary)) {
                    panTimer = true;
                    pan(this, 'down');
                } else {
                    try {
                        clearTimeout(panTimer);
                    } catch (e) {

                    }
                }

                d.x0 += d3.event.dy;
                d.y0 += d3.event.dx;
                var node = d3.select(this);
                node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
                updateTempConnector();
            }).on("dragend", function (d) {
                if (d == root) {
                    return;
                }
                domNode = this;
                if (selectedNode) {
                    // now remove the element from the parent, and insert it into the new elements children
                    var index = draggingNode.parent.children.indexOf(draggingNode);
                    if (index > -1) {
                        draggingNode.parent.children.splice(index, 1);
                    }
                    if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                        if (typeof selectedNode.children !== 'undefined') {
                            selectedNode.children.push(draggingNode);
                        } else {
                            selectedNode._children.push(draggingNode);
                        }
                    } else {
                        selectedNode.children = [];
                        selectedNode.children.push(draggingNode);
                    }
                    // Make sure that the node being added to is expanded so user can see added node is correctly moved
                    expand(selectedNode);
                    sortTree();
                    endDrag();
                } else {
                    endDrag();
                }
            });



        function endDrag() {
            selectedNode = null;
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
            d3.select(domNode).attr('class', 'node');
            // now restore the mouseover event or we won't be able to drag a 2nd time
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
            updateTempConnector();
            if (draggingNode !== null) {
                update(root);
                centerNode(draggingNode);
                draggingNode = null;
            }
        }

        // Helper functions for collapsing and expanding nodes.

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        function expand(d) {
            if (d._children) {
                d.children = d._children;
                d.children.forEach(expand);
                d._children = null;
            }
        }

        var overCircle = function (d) {
            selectedNode = d;
            updateTempConnector();
        };
        var outCircle = function (d) {
            selectedNode = null;
            updateTempConnector();
        };

        // Function to update the temporary connector indicating dragging affiliation
        var updateTempConnector = function () {
            var data = [];
            if (draggingNode !== null && selectedNode !== null) {
                // have to flip the source coordinates since we did this for the existing connectors on the original tree
                data = [ {
                    source: {
                        x: selectedNode.y0,
                        y: selectedNode.x0
                    },
                    target: {
                        x: draggingNode.y0,
                        y: draggingNode.x0
                    }
                }];
            }
            var link = svgGroup.selectAll(".templink").data(data);

            link.enter().append("path")
                .attr("class", "templink")
                .attr("d", d3.svg.diagonal())
                .attr('pointer-events', 'none');

            link.attr("d", d3.svg.diagonal());

            link.exit().remove();
        };

        // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

        function centerNode(source) {
            var source = root; // hack to ensure that the centering always happens on the root node and not on the source passed to the function
            scale = zoomListener.scale();
            x = -source.y0;
            y = -source.x0;
            // Account for the 40px icon size, # of generations so the center of the graph is at teh center of the screen rather than the first node being at the center of the screen and wasting all teh real estate to the left of the first node
            // TODO: Still buggy in re-positioning after expand + collapse
            x = x * scale + ((viewerWidth / 2) - (totalDepth * generationWidth)) + (2 * nodePositionOffset);
            y = y * scale + viewerHeight / 2;
            d3.select('g').transition()
                .duration(duration)
                .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
            zoomListener.scale(scale);
            zoomListener.translate([ x, y ]);
        }

        // Toggle children function

        // function toggleChildren(d) {
        //     if (d.children) {
        //         d._children = d.children;
        //         d.children = null;
        //         d.childrenState = "collapsed";
        //     } else if (d._children) {
        //         d.children = d._children;
        //         d._children = null;
        //         d.childrenState = "expanded";
        //     }
        //     return d;
        // }

        function toggleChildren(d) {
            if (d.childrenState === "expanded") {
                d.childrenState = "collapsed";
                if (d.childrenGrouped) {
                    if (d.intermediateNode) {
                        var children = d.children;
                        d.intermediateNode.childrenState = "collapsed";
                        d.intermediateNode._children = children;
                        d.children = [d.intermediateNode];
                        d.intermediateNode = null;
                        d.childrenState = "expanded";
                    }
                    else {
                        d.childrenState = "expanded";
                        return d;
                    }
                }
                else {
                    d._children = d.children;
                    d.children = null;
                }
            }
            else if (d.childrenState === "collapsed") {
                d.childrenState = "expanded";
                if (d.childrenGrouped) {

                }
                else if (d.groupNode) {
                    var children = d._children;
                    // d.children = null;
                    d.parent.intermediateNode = d;
                    d.parent.children = children;
                }
                else {
                    d.children = d._children;
                    d._children = null;
                }

            }
            return d;
        }

        // Toggle children on click.

        function nodeClick(d, i) {
            events.nodeClick(d, i);
            if (!d.children && !d._children) return;
            if (d.type === "statusIncidator") return;
            if (d3.event.defaultPrevented) return; // click suppressed
            d = toggleChildren(d);
            update(d);
            centerNode(d);
        }

        function nodeMouseOver(d, i) {
            events.nodeMouseOver(d, i);
        }

        function nodeMouseOut(d, i) {
            events.nodeMouseOut(d, i);
        }

        function linkClick(d, i) {
            events.linkClick(d, i);
        }

        function update(source) {
            // Compute the new height, function counts total children of root node and sets tree height accordingly.
            // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
            // This makes the layout more consistent.
            var levelWidth = [ 1 ];
            var childCount = function (level, n) {

                if (n.children && n.children.length > 0) {
                    if (levelWidth.length <= level + 1) levelWidth.push(0);

                    levelWidth[ level + 1 ] += n.children.length;
                    n.children.forEach(function (d) {
                        childCount(level + 1, d);
                    });
                }
            };
            childCount(0, root);
            var newHeight = d3.max(levelWidth) * lineHeight; // 25 pixels per line        
            tree = tree.size([ newHeight, viewerWidth ]);

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse();

            // Set widths between levels based on maxLabelLength.
            nodes.forEach(function (d) {
                // d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
                // alternatively to keep a fixed scale one can set a fixed depth per level
                // Normalize for fixed-depth by commenting out below line
                // d.y = (d.depth * 500); //500px per level.
                d.y = (d.depth * generationWidth);

                // Find max depth
                totalDepth = (d.depth > totalDepth) ? d.depth : totalDepth;
            });


            var links = tree.links(nodes);

            // Update the nodes…
            node = svgGroup.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id || (d.id = ++i);
                });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on('click', nodeClick)
                .on('mouseover', nodeMouseOver)
                .on('mouseout', nodeMouseOut);

            if (visualizerMode === "edit") nodeEnter.call(dragListener);

            // AK's Hack

            nodeEnter.append("image")
                .attr("xlink:href", function (d) { return d.icon; });

            nodeEnter.append("rect");

            nodeEnter.append("text")
                .attr('class', 'nodeInnerText')
                .style("fill-opacity", 0);


            //End AK's Hack
            nodeEnter.append("text")
                .attr("x", function (d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr("dy", ".35em")
                .attr('class', 'nodeText')
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function (d) {
                    return d.name;
                })
                .style("fill-opacity", 0);

            // phantom node to give us mouseover in a radius around it
            nodeEnter.append("circle")
                .attr('class', 'ghostCircle')
                .attr("r", 30)
                .attr("opacity", 0.2) // change this to zero to hide the target area
                .style("fill", "green")
                .attr('pointer-events', 'mouseover')
                .on("mouseover", function (node) {
                    overCircle(node);
                })
                .on("mouseout", function (node) {
                    outCircle(node);
                });

            // Update the text to reflect whether node has children or not.
            node.select('.nodeText')
                .attr("x", function (d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function (d) {
                    return d.name;
                });

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function (d, i) {
                    // AK's hack                     
                    // if(nodeRegistry[d.nodeId]) {
                    //     d.x = nodeRegistry[d.nodeId].x;
                    //     d.y = nodeRegistry[d.nodeId].y;
                    // }
                    // else{
                    //     nodeRegistry[d.nodeId] = {
                    //         x: d.x,
                    //         y: d.y
                    //      };
                    // }

                    // var nodeOffset = 0;                    
                    var nodeOffset = 20;
                    // d.y = d.y - nodeOffset;
                    // d.x = d.x - nodeOffset;
                    return "translate(" + (d.y) + "," + (d.x) + ")";

                    // END AK's hack
                    // return "translate(" + d.y + "," + d.x + ")";
                });

            // Fade the text in
            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            nodeUpdate.select("rect")
                .attr("class", function (d) { 
                    var cssClass = "";
                    if(d.childrenState === "collapsed") {
                        if (d.groupNode) {
                            cssClass = "node-rect collapsed group-node";
                        }
                        else {
                             cssClass = "node-rect collapsed";
                        }
                    }
                    else if(d.childrenState === "expanded") {
                        if (d.groupNode) {
                            cssClass = "node-rect expanded group-node";
                        }
                        else {
                             cssClass = "node-rect expanded";
                        }
                    }
                    return cssClass; 
                })
                .attr("x", function (d) {
                    // Account for 40px rect size. nodePositionOffset is set to 20 so that the center of the rect aligns with the node's center
                    return -nodePositionOffset;
                })
                .attr("y", function (d) {
                    // Account for 40px rect size. nodePositionOffset is set to 20 so that the center of the rect aligns with the node's center                    
                    return -nodePositionOffset;
                });

            nodeUpdate.select("image")
                .attr("class", function (d) { 
                    var cssClass = "";
                    if(d.childrenState === "collapsed") {
                        if (d.groupNode) {
                            cssClass = "node-image collapsed group-node";
                        }
                        else {
                             cssClass = "node-image collapsed";
                        }
                    }
                    else if(d.childrenState === "expanded") {
                        if (d.groupNode) {
                            cssClass = "node-image expanded group-node";
                        }
                        else {
                             cssClass = "node-image expanded";
                        }
                    }
                    return cssClass;                     
                })
                .attr("x", function (d) {
                    // Account for 40px icon size. nodePositionOffset is set to 20 so that the center of the image aligns with the node's center                    
                    return -nodePositionOffset;
                })
                .attr("y", function (d) {
                    // Account for 40px icon size. nodePositionOffset is set to 20 so that the center of the image aligns with the node's center                    
                    return -nodePositionOffset;
                });

            nodeUpdate.select(".nodeInnerText")
                .attr("x", function (d) {
                    // Account for 40px rect size.
                    // TODO: This return value needs to be modified if the rect is changed from 40px
                    return -5;
                })
                .attr("y", function (d) {
                    // Account for 40px rect size.
                    // TODO: This return value needs to be modified if the rect is changed from 40px                    
                    return 7;
                })
                .attr("class", function (d) { 
                    var cssClass = "nodeInnerText ";
                    if(d.childrenState === "collapsed") {
                        if (d.groupNode) {
                            cssClass += "collapsed group-node";
                        }
                        else {
                             cssClass += "collapsed";
                        }
                    }
                    else if(d.childrenState === "expanded") {
                        if (d.groupNode) {
                            cssClass += "expanded group-node";
                        }
                        else {
                             cssClass += "expanded";
                        }
                    }
                    return cssClass;                     
                })                
                .text(function (d) {
                    var text = (d._children) ? d._children.length : 0;
                    return (d.childrenState === "collapsed") ? text : "";
                })

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + (source.y) + "," + (source.x) + ")";
                })
                .remove();

            nodeExit.select("circle")
                .attr("r", 0);

            nodeExit.select("text")
                .style("fill-opacity", 0);

            // Update the links…
            var link = svgGroup.selectAll("path.link")
                .data(links, function (d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            var linkEnter = link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function (d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .on('click', linkClick);

            link.append("image")
                .attr("class", "node")
                .attr("xlink:href", function (d) {
                    return d.target.linkIcon;
                })
                .attr("transform", function (d) {
                    return "translate(" + ((d.target.x + d.source.x) / 2) + "," +
                        ((d.target.y + d.source.y)) / 2 + ")";
                })
                .attr("width", function (d) {
                    var size = "20px";
                    return size;
                })
                .attr("height", function (d) {
                    var size = "20px";
                    return size;
                });



            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function (d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        // Append a group which holds all nodes and which the zoom Listener can act upon.
        var svgGroup = baseSvg.append("g");

        // Define the root
        root = treeData;
        root.x0 = viewerHeight / 2;
        root.y0 = 0;

        // Layout the tree initially and center on the root node.
        update(root);
        centerNode(root);
    }


    function init(conf) {
        setConfiguration(conf)
        buildTopology();
    }

    function setConfiguration(conf) {
        treeData = conf.data;
        visualizerMode = conf.mode;
        collapseChildrenThreshold = conf.collapseChildrenThreshold || collapseChildrenThreshold;
        topologyContainerId = conf.topologyContainerId;
    }

    return {
        init: init,
        events: events
    };
});
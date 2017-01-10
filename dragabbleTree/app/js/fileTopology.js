require([ '../../js/topologyVisualizer.js' ], function (TopologyVisualizer) {

    var topologyConf = {
        data: {
            "name": "Start",
            "nodeId": "start",
            "children": [
                {
                    "name": "",
                    "nodeId": "suspectedFile_1",
                    "children": [],
                    "type": "file",
                    "icon": "app/img/icon_file_suspected.svg",
                    "linkIcon": "app/img/icon_started_default.svg"
                },
                {
                    "name": "",
                    "nodeId": "suspectedFile_12345",
                    "children": [
                        {
                            "name": "",
                            "nodeId": "suspectedFile_4",
                            "children": [
                                {
                                    "name": "",
                                    "nodeId": "suspectedFile_4",
                                    "children": [],
                                    "type": "file",
                                    "icon": "app/img/icon_file_suspected.svg",
                                    "linkIcon": "app/img/icon_dropped_default.svg"
                                },
                                {
                                    "name": "",
                                    "nodeId": "suspectedFile_4",
                                    "children": [],
                                    "type": "file",
                                    "icon": "app/img/icon_file_suspected.svg",
                                    "linkIcon": "app/img/icon_dropped_default.svg"
                                },
                                {
                                    "name": "",
                                    "nodeId": "suspectedFile_4",
                                    "children": [],
                                    "type": "file",
                                    "icon": "app/img/icon_file_suspected.svg",
                                    "linkIcon": "app/img/icon_dropped_default.svg"
                                },
                                {
                                    "name": "",
                                    "nodeId": "suspectedFile_4",
                                    "children": [],
                                    "type": "file",
                                    "icon": "app/img/icon_file_suspected.svg",
                                    "linkIcon": "app/img/icon_dropped_default.svg"
                                },
                                {
                                    "name": "",
                                    "nodeId": "suspectedFile_4",
                                    "children": [],
                                    "type": "file",
                                    "icon": "app/img/icon_file_suspected.svg",
                                    "linkIcon": "app/img/icon_dropped_default.svg"
                                },
                                {
                                    "name": "",
                                    "nodeId": "suspectedFile_4",
                                    "children": [],
                                    "type": "file",
                                    "icon": "app/img/icon_file_suspected.svg",
                                    "linkIcon": "app/img/icon_dropped_default.svg"
                                },
                                {
                                    "name": "",
                                    "nodeId": "suspectedFile_4",
                                    "children": [],
                                    "type": "file",
                                    "icon": "app/img/icon_file_suspected.svg",
                                    "linkIcon": "app/img/icon_dropped_default.svg"
                                }

                            ],
                            "type": "file",
                            "icon": "app/img/icon_file_suspected.svg",
                            "linkIcon": "app/img/icon_dropped_default.svg"
                        },
                        {
                            "name": "",
                            "nodeId": "suspectedFile_4",
                            "children": [],
                            "type": "file",
                            "icon": "app/img/icon_file_suspected.svg",
                            "linkIcon": "app/img/icon_dropped_default.svg"
                        },
                        {
                            "name": "",
                            "nodeId": "suspectedFile_4",
                            "children": [],
                            "type": "file",
                            "icon": "app/img/icon_file_suspected.svg",
                            "linkIcon": "app/img/icon_dropped_default.svg"
                        },
                        {
                            "name": "",
                            "nodeId": "suspectedFile_4",
                            "children": [],
                            "type": "file",
                            "icon": "app/img/icon_file_suspected.svg",
                            "linkIcon": "app/img/icon_dropped_default.svg"
                        },
                        {
                            "name": "",
                            "nodeId": "suspectedFile_4",
                            "children": [],
                            "type": "file",
                            "icon": "app/img/icon_file_suspected.svg",
                            "linkIcon": "app/img/icon_dropped_default.svg"
                        },
                        {
                            "name": "",
                            "nodeId": "suspectedFile_4",
                            "children": [],
                            "type": "file",
                            "icon": "app/img/icon_file_suspected.svg",
                            "linkIcon": "app/img/icon_dropped_default.svg"
                        },
                        {
                            "name": "",
                            "nodeId": "suspectedFile_4",
                            "children": [],
                            "type": "file",
                            "icon": "app/img/icon_file_suspected.svg",
                            "linkIcon": "app/img/icon_dropped_default.svg"
                        }

                    ],
                    "type": "file",
                    "icon": "app/img/icon_file_suspected.svg",
                    "linkIcon": "app/img/icon_started_default.svg"
                },
                {
                    "name": "",
                    "nodeId": "suspectedFile_3",
                    "children": [
                        {
                            "name": "",
                            "nodeId": "internetTraffic1",
                            "children": [],
                            "type": "file",
                            "icon": "app/img/icon_internet_default.svg",
                            "linkIcon": "app/img/icon_contacted_default.svg"
                        },
                        {
                            "name": "",
                            "nodeId": "suspectedFile_5",
                            "children": [],
                            "type": "file",
                            "icon": "app/img/icon_file_suspected.svg",
                            "linkIcon": "app/img/icon_contacted_default.svg"
                        }
                    ],
                    "type": "file",
                    "icon": "app/img/icon_file_suspected.svg",
                    "linkIcon": "app/img/icon_started_default.svg"
                }
            ],
            "icon": "app/img/icon_file_suspected.svg"
        },
        mode: "edit",
        collapseChildrenThreshold: 5,
        topologyContainerId: "tree-container"
    };



    var fileTopology = new TopologyVisualizer(topologyConf);

    fileTopology.nodeClick = function (element, index) {
        console.log("The node at index: " + index + " was clicked");
    };

    fileTopology.linkClick = function (element, index) {
        console.log("The link that was clicked at index: " + index);
    };

    fileTopology.build();

});
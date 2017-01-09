require([ 'js/topologyVisualizer' ], function (TopologyVisualizer) {

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
                    "icon": "icon_file_suspected",
                    "linkIcon": "icon_started_default"
                },
                {
                    "name": "",
                    "nodeId": "suspectedFile_2",
                    "children": [
                        {
                            "name": "",
                            "nodeId": "suspectedFile_4",
                            "children": [],
                            "type": "file",
                            "icon": "icon_file_suspected",
                            "linkIcon": "icon_dropped_default"
                        }
                    ],
                    "type": "file",
                    "icon": "icon_file_suspected",
                    "linkIcon": "icon_started_default"
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
                            "icon": "icon_internet_default",
                            "linkIcon": "icon_contacted_default"
                        },
                        {
                            "name": "",
                            "nodeId": "suspectedFile_5",
                            "children": [],
                            "type": "file",
                            "icon": "icon_file_suspected",
                            "linkIcon": "icon_contacted_default"
                        }
                    ],
                    "type": "file",
                    "icon": "icon_file_suspected",
                    "linkIcon": "icon_started_default"
                }
            ],
            "icon": "icon_file_suspected"
        },
        mode: "view"
    };



    var fileTopology = new TopologyVisualizer(topologyConf);

    fileTopology.elementClick = function (element) {
        console.log("The node that was clicked: " + element);
    };

    fileTopology.build();

});
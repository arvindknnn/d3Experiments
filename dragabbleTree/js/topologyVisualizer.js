define([ 'js/topologyBuilder' ], function (topologyBuilder) {
    var TopologyVisualizer = function (conf) {
        var self = this;
        this.conf = conf;
        registerEvents(this);
    };

    TopologyVisualizer.prototype.build = function () {
        topologyBuilder.init(this.conf);
    };

    TopologyVisualizer.prototype.nodeClick = function (d,i) {};
    TopologyVisualizer.prototype.linkClick = function (d,i) {};

    function registerEvents(TopologyVisualizer){
        topologyBuilder.events.on('nodeClick', function(d,i){
            TopologyVisualizer.nodeClick(d,i);
        });
        topologyBuilder.events.on('linkClick', function(d,i){
            TopologyVisualizer.linkClick(d,i);
        });        
    }

    return TopologyVisualizer;
});
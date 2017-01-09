define([ 'js/topologyBuilder' ], function (topologyBuilder) {
    var TopologyVisualizer = function (conf) {
        var self = this;
        this.conf = conf;
    };

    TopologyVisualizer.prototype.build = function () {
        topologyBuilder.init(this.conf);
    };

    TopologyVisualizer.prototype.elementClick = function (d) { };

    return TopologyVisualizer;
});
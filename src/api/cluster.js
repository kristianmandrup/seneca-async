var _            = require('lodash');

module.eports = function api_cluster() {
  /* jshint loopfunc:true */
  var self = this

  var cluster = require('cluster')

  if( cluster.isMaster ) {
    require('os').cpus().forEach(function() {
      cluster.fork()
    })

    cluster.on('disconnect', function(worker) {
      cluster.fork()
    })

    var noopinstance = self.delegate()
    for( var fn in noopinstance ) {
      if( _.isFunction(noopinstance[fn]) ) {
        noopinstance[fn] = function() { return noopinstance; }
      }
    }

    return noopinstance;
  }
  else return self;
}

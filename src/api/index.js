module.exports = function(root) {
  return {
    act: require('./act'),
    act_if: require('./act_if'),
    act_routes: require('./act_routes'),
    add: require('./add')(root),
    client: require('./client'),
    close: require('./close'),
    cluster: require('./cluster'),
    cluster: require('./cluster'),
    delegate: require('./delegate')(root),
    depends: require('./depends'),
    error: require('./error'),
    export: require('./export'),
    find: require('./find')(root),
    has: function api_has(args) {
      return !!private$.actrouter.find(args)
    },
    list: require('./list'),
    listen: require('./listen'),
    log_route: require('./log_route'),
    make: require('./make'),
    options: require('./options')(root),
    pin: require('./pin')(root),
    plugin: require('./plugin'),
    ready: require('./ready'),
    register: require('./register'),
    repl: require('./repl'),
    start: require('./start'),
    sub: require('./sub'),
    use: require('./use'),
    wrap: require('./wrap'),
    seneca: function() {
      return this
    },
    toString: function () {
      return this.name
    }
  }
  // Return self. Mostly useful as a check that this is a Seneca instance.

  // Describe this instance using the form: Seneca/VERSION/ID
}

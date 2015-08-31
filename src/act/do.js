module.exports = function async do_act( instance, actmeta, prior_ctxt, origargs) {
  var args = _.clone(origargs)
  prior_ctxt = prior_ctxt || {chain:[],entry:true,depth:1}

  var act_callpoint = callpoint()

  var id_tx = ( args.id$ || args.actid$ || instance.idgen() ).split('/')

  var tx =
        id_tx[1] ||
        origargs.tx$ ||
        instance.fixedargs.tx$ ||
        instance.idgen()

  var actid    = (id_tx[0] || instance.idgen()) + '/' + tx

  var actstart = Date.now()

  if( await act_cache_check( instance, args, prior_ctxt, act_callpoint ) ) return;

  var actstats = act_stats_call( actmeta.pattern )


  // build callargs
  var callargs = args

  // remove actid so that user manipulation of args for subsequent use does
  // not cause inadvertent hit on existing action
  delete callargs.id$
  delete callargs.actid$ // legacy alias

  callargs.meta$ = {
    id:      actid,
    tx:      tx,
    start:   actstart,
    pattern: actmeta.pattern,
    action:  actmeta.id,
    entry:   prior_ctxt.entry,
    chain:   prior_ctxt.chain
  }

  if( actmeta.deprecate ) {
    instance.log.warn( 'DEPRECATED', actmeta.pattern, actmeta.deprecate,
                       act_callpoint )
  }

  logging.log_act_in( root, {actid:actid,info:origargs.transport$},
                      actmeta, callargs, prior_ctxt,
                      act_callpoint )

  instance.emit('act-in', callargs)

  var delegate = act_make_delegate( instance, tx, callargs, actmeta, prior_ctxt )

  callargs = _.extend({},callargs,delegate.fixedargs,{tx$:tx})

  var listen_origin = origargs.transport$ && origargs.transport$.origin

  var act_done = function(err) {
    try {
      var actend = Date.now()
      private$.timestats.point( actend-actstart, actmeta.argpattern )

      prior_ctxt.depth--
      prior_ctxt.entry = prior_ctxt.depth <= 0

      var result  = arr(arguments)

      var resdata = result[1]
      var info    = result[2]

      if( null == err &&
          null != resdata &&
          !(_.isPlainObject(resdata) ||
            _.isArray(resdata) ||
            !!resdata.entity$ ||
            !!resdata.force$
           ) &&
          so.strict.result)
      {

        // allow legacy patterns
        if( !( 'generate_id' === callargs.cmd ||
               true === callargs.note ||
               'native' === callargs.cmd ||
               'quickcode' === callargs.cmd
             ))
        {
          err = error(
            'result_not_objarr', {
              pattern:actmeta.pattern,
              args:util.inspect(common.clean(callargs)).replace(/\n/g,''),
              result:resdata
            })
        }
      }

      private$.actcache.set(actid,{
        result:  result,
        actmeta: actmeta,
        when:    Date.now()
      })

      if( err ) {
        private$.stats.act.fails++
        actstats.fails++

        var out = await act_error(instance,err,actmeta,result,
                            actend-actstart,callargs,prior_ctxt,act_callpoint)

        result[0] = out.err

        if( _.isFunction(delegate.on_act_err) ) {
          delegate.on_act_err(actmeta,result[0])
        }

        if( args.fatal$ ) {
          return instance.die(out.err)
        }
      }
      else {
        instance.emit('act-out',callargs,result[1])
        result[0] = null

        logging.log_act_out(
          root, {
            actid:    actid,
            duration: actend-actstart,
            info:     info,
            listen:   listen_origin
          },
          actmeta, callargs, result, prior_ctxt, act_callpoint )

        if( _.isFunction(delegate.on_act_out) ) {
          delegate.on_act_out(actmeta,result[1])
        }

        private$.stats.act.done++
        actstats.done++
      }

      // for exceptions thrown inside the callback
      catch( ex ) {
        var err = ex

        // handle throws of non-Error values
        if( !util.isError(ex) ) {
          err = ( _.isObject(ex) ?
                  new Error(jsonic.stringify(ex)) :
                  err = new Error(''+ex) )
        }

        await callback_error( instance, err, actmeta, result,
                        actend-actstart, callargs, prior_ctxt, act_callpoint )
      }
    }
    catch(ex) {
      instance.emit('error',ex)
    }
  }

  // TODO: err should instead be handled via async and try/catch!!
  try {
    await act_param_check( origargs, actmeta);

    var execspec = {
      id:      actid,
      gate:    prior_ctxt.entry && !!callargs.gate$,
      ungate:  !!callargs.ungate$,
      desc:    actmeta.argpattern

      plugin: {
        name: actmeta.plugin_name,
        tag:  actmeta.plugin_tag
      },

      fn: async function() {
        if( root.closed && !callargs.closing$ ) {
          return cb(error('instance-closed',{args:common.clean(callargs)}))
        }

        delegate.good = function(out) {
          return out;
        }

        delegate.bad = function(err) {
          throw err;
        }

        if( _.isFunction(delegate.on_act_in) ) {
          delegate.on_act_in(actmeta,callargs)
        }
        await actmeta.func.call(delegate,callargs)
      },
    }

    private$.executor.execute(execspec)

  } catch ( err ) {
      // async?
      if( err ) return act_done(err);
  }
}

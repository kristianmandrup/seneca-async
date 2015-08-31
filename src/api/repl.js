module.exports = function api_repl(in_opts) {
  var self = this

  var repl_opts = _.extend(so.repl,in_opts)

  net.createServer( function(socket) {
    var actout = function() {
      var out = arguments[0] || arguments[1]
      socket.write(util.inspect(out)+'\n')
    }

    var r = repl.start({
      prompt:    'seneca '+root.id+'> ',
      input:     socket,
      output:    socket,
      terminal:  false,
      useGlobal: false,
      eval:      evaluate
    })

    r.on('exit', function () {
      socket.end()
    })

    var act_index_map = {}
    var act_index = 1000000
    function fmt_index(i) {
      return (''+i).substring(1)
    }

    var sd = root.delegate({repl$:true})

    sd.on_act_in = function on_act_in( actmeta, args ) {
      socket.write('IN  '+fmt_index(act_index)+
                   ': '+util.inspect(sd.util.clean(args))+
                   ' # '+
                   args.meta$.id+' '+
                   actmeta.pattern+' '+
                   actmeta.id+' '+
                   actmeta.func.name+' '+
                   (actmeta.callpoint?actmeta.callpoint:'')+
                   '\n')
      act_index_map[actmeta.id] = act_index
      act_index++
    }

    sd.on_act_out = function on_act_out( actmeta, out ) {
      var cur_index = act_index_map[actmeta.id]
      socket.write('OUT '+fmt_index(cur_index)+
                   ': '+util.inspect(sd.util.clean(out))+'\n')
    }

    sd.on_act_err = function on_act_err( actmeta, err ) {
      var cur_index = act_index_map[actmeta.id]
      socket.write('ERR '+fmt_index(cur_index)+
                   ': '+err.message+'\n')
    }

      /*
    sd.act = function act() {

      var spec = parse_pattern( self, common.arrayify(arguments), 'done:f?' )
      var args = spec.pattern
      var done = spec.done

      socket.write('IN  '+fmt_index(act_index)+
                   ': '+util.inspect(sd.util.clean(args))+'\n')
      var out_index = act_index
      act_index++


      self.act.call(this,args,function(err,out){
        if( err ) {
          socket.write('ERR '+fmt_index(act_index)+': '+err.message+'\n')
        }
        else {
          socket.write('OUT '+fmt_index(out_index)+
                       ': '+util.inspect(sd.util.clean(out))+'\n')
        }

        done(err,out)
      })
    }
       */

    r.context.s = r.context.seneca = sd


    function evaluate(cmd, context, filename, callback) {
      var result

      cmd = cmd.replace(/[\r\n]+$/,'')

      try {
        var args = jsonic(cmd)
        context.s.act(args,function(err,out){
          if( err ) return callback( err.message );
          return callback( null, root.util.clean(out) );
        })
      }
      catch( e ) {
        try {
          var script = vm.createScript(cmd, {
            filename: filename,
            displayErrors: false
          })
          result = script.runInContext(context, { displayErrors: false });

          result = result === root ? null : result
          callback(null, result)
        }
        catch( e ) {
          return callback( e.message )
        }
      }
    }

  }).listen( repl_opts.port, repl_opts.host )
}

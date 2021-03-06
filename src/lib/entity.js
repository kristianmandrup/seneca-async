/* Copyright (c) 2010-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
'use strict';

var util = require('util')
var _ = require('lodash')
var error = require('eraro')({
  package:  'seneca',
  msgmap:   ERRMSGMAP(),
  override: true
})
var common = require('./common')
var noop = common.noop

function Entity( canon, seneca ) {
  var self = this

  self.log$ = function() {
    // use this, as make$ will have changed seneca ref
    this.private$.seneca.log.apply(this,arguments)
  }

  var private$ = self.private$ = function(){};

  private$.seneca = seneca

  private$.canon  = canon

  private$.entargs = function( args ) {
    args.role = 'entity'
    args.ent = self

    if( null != this.canon.name ) { args.name = this.canon.name }
    if( null != this.canon.base ) { args.base = this.canon.base }
    if( null != this.canon.zone ) { args.zone = this.canon.zone }

    return args
  }

  // use as a quick test to identify Entity objects
  // returns compact string zone/base/name
  self.entity$ = self.canon$()
  return self;
}


// Properties without '$' suffix are persisted
// id property is special: created if not present when saving
// func$ functions provide persistence operations
// args: (<zone>,<base>,<name>,<props>)
// can be partially specified:
// make$(name)
// make$(base,name)
// make$(zone,base,name)
// make$(zone,base,null)
// make$(zone,null,null)
// props can specify zone$,base$,name$, but args override if present
// escaped names: foo_$ is converted to foo
Entity.prototype.make$ = function() {
  var self = this
  var args = common.arrayify(arguments)

  var canon, name, base, zone

  // Set seneca instance, if provided as first arg.
  if( args[0] && args[0].seneca ) {
    self.private$.seneca = args.shift()
  }

  // Pull out props, if present.
  var argprops = args[args.length-1]
  var props = {}
  if( argprops && 'object' == typeof(argprops) ) {
    args.pop()
    props = _.clone(argprops)
  }

  // Normalize args.
  while(args.length < 3 ) {
    args.unshift(null)
  }

  if( _.isString(props.entity$) ) {
    canon = parsecanon(props.entity$)
    zone = canon.zone
    base = canon.base
    name = canon.name
  }
  else if( _.isObject(props.entity$ ) ) {
    canon = {}
    canon.zone = zone = props.entity$.zone
    canon.base = base = props.entity$.base
    canon.name = name = props.entity$.name
  }
  else {
    name = args.pop()
    name = null == name ? props.name$ : name

    canon = parsecanon(name)
  }

  name = canon.name

  base = args.pop()
  base = null == base ? canon.base  : base
  base = null == base ? props.base$ : base

  zone = args.pop()
  zone = null == zone ? canon.zone  : zone
  zone = null == zone ? props.zone$ : zone

  var new_canon = {}
  new_canon.name     = null == name ? self.private$.canon.name : name
  new_canon.base     = null == base ? self.private$.canon.base : base
  new_canon.zone     = null == zone ? self.private$.canon.zone : zone

  var entity = new Entity(new_canon,self.private$.seneca)

  for( var p in props ) {
    if( props.hasOwnProperty(p) ) {
      if( !~p.indexOf('$') ) {
        entity[p] = props[p];
      }
      else if( 2 < p.length && '_' == p[p.length-2] && '$' == p[p.length-1] ) {
        entity[p.substring(0,p.length-2)] = props[p];
      }
    }
  }

  if( props.hasOwnProperty('id$') ) {
    entity.id$ = props.id$
  }

  var entopts = self.private$.seneca.options().entity || {}
  if( entopts.hide ) {
    _.each( entopts.hide, function(hidden_fields,canon){
      if( entity.is$(canon) ) {
        entity.toString = hideToString(hidden_fields,entity.toString)
        entity.inspect = entity.toString
      }
    })
  }

  self.log$('make',entity.canon$({string:true}),entity)
  return entity
}

// save one
Entity.prototype.save$ = async function(props) {
  var self = this
  var si   = self.private$.seneca

  if( _.isObject(props) ) {
    self.data$(props)
  }

  var action = self.private$.entargs({cmd:'save'});
  await si.act(action)
  return self
}

// provide native database driver
Entity.prototype.native$ = async function() {
  var self = this
  var si   = self.private$.seneca

  await si.act( self.private$.entargs({cmd:'native'}))
  return self
}

// load one
// TODO: qin can be an entity, in which case, grab the id and reload
// qin omitted => reload self
Entity.prototype.load$ = async function(qin) {
  var self = this
  var si   = self.private$.seneca

  var qent = self

  var q = await resolve_id_query( qin, self )

  // empty query gives empty result
  if( null == q ) {
    return {};
  }

  await si.act( self.private$.entargs({ qent:qent, q:q, cmd:'load' }))

  return self
}

// TODO: need an update$ - does an atomic upsert

// list zero or more
// qin is optional, if omitted, list all
Entity.prototype.list$ = async function(qin) {
  var self = this
  var si = self.private$.seneca

  var qent = self
  var q = qin

  var action = self.private$.entargs({qent: qent , q: q, cmd: 'list'})
  await si.act( action )

  return self
}

// remove one or more
// TODO: make qin optional, in which case, use id
Entity.prototype.remove$ = async function(qin) {
  var self = this
  var si   = self.private$.seneca

  var q = await resolve_id_query( qin, self )

  // empty query means take no action
  if( null == q ) {
    return {};
  }

  await si.act( self.private$.entargs({qent:self,q:q,cmd:'remove'}))

  return self
}
Entity.prototype.delete$ = Entity.prototype.remove$

Entity.prototype.fields$ = function() {
  var self = this
  var si   = self.private$.seneca

  var fields = [];
  for( var p in self) {
    if( self.hasOwnProperty(p) &&
        '$'!=p && 'function'!=typeof(self[p]) &&
        '$'!=p.charAt(p.length-1))
    {
      fields.push(p);
    }
  }
  return fields
}

/* TODO: is this still needed? */
Entity.prototype.close$ = async function() {
  var self = this
  var si   = self.private$.seneca

  self.log$('close')
  await si.act( self.private$.entargs({cmd:'close'}))
  return self;
}

Entity.prototype.is$ = function( canonspec ) {
  var self = this

  var canon = canonspec ?
        canonspec.entity$ ? canonspec.canon$({object:true}) :
        parsecanon(canonspec) :
      null;

  if( !canon ) return false;

  return util.inspect(self.canon$({object:true})) == util.inspect(canon)
}

Entity.prototype.canon$ = function(opt) {
  var self = this
  var canon = self.private$.canon

  if( opt ) {

    if( opt.isa ) {
      var isa = parsecanon( opt.isa )

      return (
        isa.zone == canon.zone &&
        isa.base == canon.base &&
        isa.name == canon.name
      )
    }

    else if( opt.parse ) {
      return parsecanon( opt.parse )
    }

    // DEPRECATED
    else if( opt.change ) {

      // change type, undef leaves untouched
      canon.zone = void 0==opt.change.zone ? canon.zone : opt.change.zone
      canon.base = void 0==opt.change.base ? canon.base : opt.change.base
      canon.name = void 0==opt.change.name ? canon.name : opt.change.name

      // explicit nulls delete
      if( null === opt.zone ) delete canon.zone;
      if( null === opt.base ) delete canon.base;
      if( null === opt.name ) delete canon.name;

      self.entity$ = self.canon$()
    }
  }

  return ( void 0==opt || opt.string || opt.string$ ) ?
    [ (opt&&opt.string$?'$':'')+
      (void 0==canon.zone?'-':canon.zone),
      void 0==canon.base?'-':canon.base,
      void 0==canon.name?'-':canon.name].join('/')
  : opt.array  ? [canon.zone,canon.base,canon.name]
    : opt.array$ ? [canon.zone,canon.base,canon.name]
    : opt.object ? {zone:canon.zone,base:canon.base,name:canon.name}
  : opt.object$ ? {zone$:canon.zone,base$:canon.base,name$:canon.name}
  : [canon.zone,canon.base,canon.name]
}

// data = object, or true|undef = include $, false = exclude $
Entity.prototype.data$ = function(data, canonkind) {
  var self = this
  var si   = self.private$.seneca
  var val

  // TODO: test for entity$ consistent?

  if( _.isObject(data) ) {

    // does not remove fields by design!
    for( var f in data ) {
      if( '$'!=f.charAt(0) && '$'!=f.charAt(f.length-1) ) {
        val = data[f]
        if( _.isObject(val) && val.entity$ ) {
          self[f] = val.id
        }
        else {
          self[f] = val
        }
      }
    }

    return self
  }
  else {
    var include_$ = _.isUndefined(data) ? true : !!data
    data = {}

    if( include_$ ) {
      canonkind = canonkind || 'object'
      var canonformat = {}
      canonformat[canonkind] = true
      data.entity$ = self.canon$(canonformat)
    }

    var fields = self.fields$()
    for( var fI = 0; fI < fields.length; fI++ ) {
      if( !~fields[fI].indexOf('$') ) {

        val = self[fields[fI]]
        if( _.isObject(val) && val.entity$ ) {
          data[fields[fI]] = val.id
        }
        else {
          data[fields[fI]] = val
        }
      }
    }

    return data
  }
}

Entity.prototype.clone$ = function() {
  var self = this
  var si   = self.private$.seneca

  return self.make$(self.data$())
}

function hideToString(hidden,toString) {
  return function(){
    var entdata = this.data$()
    entdata.canon$ = this.canon$
    entdata.fields$ = this.fields$
    entdata.private$ = this.private$
    _.each(hidden,function(hide,field){
      if( hide ) delete entdata[field];
    })
    return toString.call(entdata)
  }
}

Entity.prototype.toString = function() {
  var self = this

  var sb = ['$', _.isFunction( self.canon$ ) ?
            self.canon$({string:true}) : '', ':{id=',self.id,';']
  var hasp = 0
  var fields = _.isFunction( self.fields$ ) ? self.fields$() : []
  fields.sort()
  for( var fI = 0; fI < fields.length; fI++ ) {
    if( 'id' == fields[fI] ) continue;
    hasp = 1
    sb.push(fields[fI])
    sb.push('=')

    var val = self[fields[fI]]
    if( _.isDate(val) ) {
      sb.push( val.toISOString() )
    }
    else if( _.isObject( val ) ) {
      val = util.inspect(val,{depth:3}).replace(/\s+/g,'')
      sb.push( val )
    }
    else sb.push( ''+val );

    sb.push(';')
  }
  sb[sb.length-hasp]='}'

  return sb.join('')
}


Entity.prototype.inspect = Entity.prototype.toString

function resolve_id_query( qin, ent ) {
  var q

  if( (_.isUndefined(qin) || _.isNull(qin) || _.isFunction(qin)) &&
      null != ent.id )
  {
    q = {id:ent.id}
  }
  else if( _.isString(qin) || _.isNumber(qin) ) {
    q = '' === qin ? null : {id:qin}
  }
  else if( _.isFunction(qin) ) {
    q = null
  }
  else {
    q = qin
  }

  return q
}

// parse a canon string:
// $zone-base-name
// $, zone, base are optional
function parsecanon(str) {
  var out = {}

  if( _.isArray(str) ) return {
    zone: str[0],
    base: str[1],
    name: str[2],
  };

  if( _.isObject(str) && !_.isFunction(str) ) return str;

  if( !_.isString(str) ) return out;

  var m = /\$?((\w+|-)\/)?((\w+|-)\/)?(\w+|-)/.exec(str)
  if( m ) {
    var zi = void 0==m[4]?4:2, bi = void 0==m[4]?2:4

    out.zone = '-' == m[zi] ? void 0 : m[zi]
    out.base = '-' == m[bi] ? void 0 : m[bi]
    out.name = '-' == m[5] ? void 0 : m[5]
  }
  else throw error('invalid_canon',{str:str});

  return out
}

function ERRMSGMAP() {
  return {
    invalid_canon: "Invalid entity canon: <%=str%>; expected format: zone/base/name."
  }
}

module.exports = function make_entity( canon, seneca ) {
  return new Entity( canon, seneca )
}

module.exports.parsecanon = parsecanon
module.exports.Entity     = Entity

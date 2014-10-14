  // Source: src/_intro.js
!function(name, context, definition){
  if (typeof define == "function" && define.amd) {
    // Register ID to avoid anonymous define() errors
    define("keen", [], function(){
      return definition();
    });
  }
  if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = definition();
  } else {
    context[name] = definition();
  }

}("Keen", this, function(){
  "use strict";

  // Source: src/core.js
  /*!
  * ----------------
  * Keen IO Core JS
  * ----------------
  */

  function Keen(config) {
    return _init.apply(this, arguments);
  }

  function _init(config) {
    if (_isUndefined(config)) {
      throw new Error("Check out our JavaScript SDK Usage Guide: https://keen.io/docs/clients/javascript/usage-guide/");
    }
    if (_isUndefined(config.projectId) || _type(config.projectId) !== 'String' || config.projectId.length < 1) {
      throw new Error("Please provide a projectId");
    }

    this.configure(config);
  }

  Keen.prototype.configure = function(config){

    config['host'] = (_isUndefined(config['host'])) ? 'api.keen.io/3.0' : config['host'].replace(/.*?:\/\//g, '');
    config['protocol'] = _set_protocol(config['protocol']);
    config['requestType'] = _set_request_type(config['requestType']);

    this.client = {
      projectId: config.projectId,
      writeKey: config.writeKey,
      readKey: config.readKey,
      globalProperties: null,

      endpoint: config['protocol'] + "://" + config['host'],
      requestType: config['requestType']
    };

    Keen.trigger('client', this, config);
    this.trigger('ready');

    return this;
  };


  // Private
  // --------------------------------

  function _extend(target){
    for (var i = 1; i < arguments.length; i++) {
      for (var prop in arguments[i]){
        // if ((target[prop] && _type(target[prop]) == 'Object') && (arguments[i][prop] && _type(arguments[i][prop]) == 'Object')){
        target[prop] = arguments[i][prop];
      }
    }
    return target;
  }

  function _isUndefined(obj) {
    return obj === void 0;
  }

  function _type(obj){
    var text, parsed;
    text = (obj && obj.constructor) ? obj.constructor.toString() : void 0;
    if (text) {
      parsed = text.split("(")[0].split(/function\s*/);
      if (parsed.length > 0) {
        return parsed[1];
      }
    }
    return "Null";
	  //return (text) ? text.match(/function (.*)\(/)[1] : "Null";
  }

  function _each(o, cb, s){
    var n;
    if (!o){
      return 0;
    }
    s = !s ? o : s;
    if (_type(o)==='array'){ // is(o.length)
      // Indexed arrays, needed for Safari
      for (n=0; n<o.length; n++) {
        if (cb.call(s, o[n], n, o) === false){
          return 0;
        }
      }
    } else {
      // Hashtables
      for (n in o){
        if (o.hasOwnProperty(n)) {
          if (cb.call(s, o[n], n, o) === false){
            return 0;
          }
        }
      }
    }
    return 1;
  }

  function _once(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  }

  function _parse_params(str){
    // via http://stackoverflow.com/a/2880929/2511985
    var urlParams = {},
        match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = str.split("?")[1];

    while (!!(match=search.exec(query))) {
      urlParams[decode(match[1])] = decode(match[2]);
    }
    return urlParams;
  }

  function _set_protocol(value) {
    switch(value) {
      case 'http':
        return 'http';
        break;
      case 'auto':
        return location.protocol.replace(/:/g, '');
        break;
      case 'https':
      case undefined:
      default:
        return 'https';
        break;
    }
  }

  function _set_request_type(value) {
    var configured = value || 'jsonp';
    var capableXHR = false;
    if ((_type(XMLHttpRequest)==='Object'||_type(XMLHttpRequest)==='Function') && 'withCredentials' in new XMLHttpRequest()) {
      capableXHR = true;
      Keen.canXHR = true;
    }

    if (configured == null || configured == 'xhr') {
      if (capableXHR) {
        return 'xhr';
      } else {
        return 'jsonp';
      }
    } else {
      return configured;
    }
  }

  function _build_url(path) {
    return this.client.endpoint + '/projects/' + this.client.projectId + path;
  }


  // -------------------------------
  // XHR, JSONP, Beacon utilities
  // -------------------------------

  function _sendXhr(method, url, headers, body, success, error){
    var ids = ['MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'],
        successCallback = success,
        errorCallback = error,
        payload,
        xhr;

    success = null;
    error = null;

    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    }
    else {
      // Legacy IE support: look up alts if XMLHttpRequest is not available
      for (var i = 0; i < ids.length; i++) {
        try {
          xhr = new ActiveXObject(ids[i]);
          break;
        } catch(e) {}
      }
    }

    xhr.onreadystatechange = function() {
      var response;
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            response = JSON.parse(xhr.responseText);
          } catch (e) {
            Keen.log("Could not parse HTTP response: " + xhr.responseText);
            if (errorCallback) {
              errorCallback(xhr, e);
              successCallback = errorCallback = null;
            }
          }
          if (successCallback && response) {
            successCallback(response);
            successCallback = errorCallback = null;
          }
        } else {
          Keen.log("HTTP request failed.");
          if (errorCallback) {
            errorCallback(xhr, null);
            successCallback = errorCallback = null;
          }
        }
      }
    };

    xhr.open(method, url, true);

    _each(headers, function(value, key){
      xhr.setRequestHeader(key, value);
    });

    if (body) {
      payload = JSON.stringify(body);
    }

    if (method && method.toUpperCase() === "GET") {
      xhr.send();
    } else if (method && method.toUpperCase() === "POST") {
      xhr.send(payload);
    }

  }

  function _sendJsonp(url, params, success, error){
    var timestamp = new Date().getTime(),
        successCallback = success,
        errorCallback = error,
        script = document.createElement("script"),
        parent = document.getElementsByTagName("head")[0],
        callbackName = "keenJSONPCallback",
        scriptId = "keen-jsonp",
        loaded = false;

    success = null;
    error = null;

    callbackName += timestamp;
    scriptId += timestamp;

    while (callbackName in window) {
      callbackName += "a";
    }
    window[callbackName] = function (response) {
      loaded = true;
      if (successCallback && response) {
        successCallback(response);
      };
      parent.removeChild(script);
      delete window[callbackName];
      successCallback = errorCallback = null;
    };

    script.id = scriptId;
    script.src = url + "&jsonp=" + callbackName;

    parent.appendChild(script);

    // for early IE w/ no onerror event
    script.onreadystatechange = function() {
      if (loaded === false && this.readyState === "loaded") {
        loaded = true;
        if (errorCallback) {
          errorCallback();
          successCallback = errorCallback = null;
        }
      }
    };

    // non-ie, etc
    script.onerror = function() {
      // on IE9 both onerror and onreadystatechange are called
      if (loaded === false) {
        loaded = true;
        if (errorCallback) {
          errorCallback();
          successCallback = errorCallback = null;
        }
      }
    };
  }

  function _sendBeacon(url, params, success, error){
    var successCallback = success,
        errorCallback = error,
        loaded = false,
        img = document.createElement("img");

    success = null;
    error = null;

    img.onload = function() {
      loaded = true;
      if ('naturalHeight' in this) {
        if (this.naturalHeight + this.naturalWidth === 0) {
          this.onerror();
          return;
        }
      } else if (this.width + this.height === 0) {
        this.onerror();
        return;
      }
      if (successCallback) {
        successCallback({created: true});
        successCallback = errorCallback = null;
      }
    };
    img.onerror = function() {
      loaded = true;
      if (errorCallback) {
        errorCallback();
        successCallback = errorCallback = null;
      }
    };
    img.src = url + "&c=clv1";
  }


  // -------------------------------
  // Keen.Events
  // We <3 BackboneJS!
  // -------------------------------

  var Events = Keen.Events = {
    on: function(name, callback) {
      this.listeners || (this.listeners = {});
      var events = this.listeners[name] || (this.listeners[name] = []);
      events.push({callback: callback});
      return this;
    },
    once: function(name, callback, context) {
      var self = this;
      var once = _once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return self.on(name, once, context);
    },
    off: function(name, callback, context) {
      if (!this.listeners) return this;

      // Remove all callbacks for all events.
      if (!name && !callback && !context) {
        this.listeners = void 0;
        return this;
      }

      var names = [];
      if (name) {
        names.push(name);
      } else {
        _each(this.listeners, function(value, key){
          names.push(key);
        });
      }

      for (var i = 0, length = names.length; i < length; i++) {
        name = names[i];

        // Bail out if there are no events stored.
        var events = this.listeners[name];
        if (!events) continue;

        // Remove all callbacks for this event.
        if (!callback && !context) {
          delete this.listeners[name];
          continue;
        }

        // Find any remaining events.
        var remaining = [];
        for (var j = 0, k = events.length; j < k; j++) {
          var event = events[j];
          if (
            callback && callback !== event.callback &&
            callback !== event.callback._callback ||
            context && context !== event.context
          ) {
            remaining.push(event);
          }
        }

        // Replace events if there are any remaining.  Otherwise, clean up.
        if (remaining.length) {
          this.listeners[name] = remaining;
        } else {
          delete this.listeners[name];
        }
      }

      return this;
    },
    trigger: function(name) {
      if (!this.listeners) return this;
      var args = Array.prototype.slice.call(arguments, 1);
      var events = this.listeners[name] || [];
      for (var i = 0; i < events.length; i++) {
        events[i]['callback'].apply(this, args);
      }
      return this;
    }
  };
  _extend(Keen.prototype, Events);
  _extend(Keen, Events);

  Keen.loaded = true;

  Keen.urlMaxLength = 16000;
  if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
    Keen.urlMaxLength = 2000;
  }

  // Expose utils
  Keen.utils = {
    each: _each,
    extend: _extend,
    parseParams: _parse_params
  };

  Keen.ready = function(callback){
    if (Keen.loaded) {
      callback();
    } else {
      Keen.on('ready', callback);
    }
  };

  Keen.log = function(message) {
    if (typeof console == "object") {
      console.log('[Keen IO]', message);
    }
  };

  // -------------------------------
  // Keen.Plugins
  // -------------------------------

  var Plugins = Keen.Plugins = {};

  // Source: src/track.js
  /*!
  * -------------------
  * Keen IO Tracker JS
  * -------------------
  */

  Keen.prototype.addEvent = function(eventCollection, payload, success, error) {
    _uploadEvent.apply(this, arguments);
  };

  Keen.prototype.trackExternalLink = function(jsEvent, eventCollection, payload, timeout, timeoutCallback){

    var evt = jsEvent,
        target = (evt.currentTarget) ? evt.currentTarget : (evt.srcElement || evt.target),
        timer = timeout || 500,
        triggered = false,
        targetAttr = "",
        callback,
        win;

    if (target.getAttribute !== void 0) {
      targetAttr = target.getAttribute("target");
    } else if (target.target) {
      targetAttr = target.target;
    }

    if ((targetAttr == "_blank" || targetAttr == "blank") && !evt.metaKey) {
      win = window.open("about:blank");
      win.document.location = target.href;
    }

    if (target.nodeName === "A") {
      callback = function(){
        if(!triggered && !evt.metaKey && (targetAttr !== "_blank" && targetAttr !== "blank")){
          triggered = true;
          window.location = target.href;
        }
      };
    } else if (target.nodeName === "FORM") {
      callback = function(){
        if(!triggered){
          triggered = true;
          target.submit();
        }
      };
    } else {
      Keen.log("#trackExternalLink method not attached to an <a> or <form> DOM element");
    }

    if (timeoutCallback) {
      callback = function(){
        if(!triggered){
          triggered = true;
          timeoutCallback();
        }
      };
    }
    _uploadEvent.call(this, eventCollection, payload, callback, callback);

    setTimeout(callback, timer);

    if (!evt.metaKey) {
      return false;
    }
  };

  Keen.prototype.setGlobalProperties = function(newGlobalProperties) {
    if (!this.client) return Keen.log('Check out our JavaScript SDK Usage Guide: https://keen.io/docs/clients/javascript/usage-guide/');
    if (newGlobalProperties && typeof(newGlobalProperties) == "function") {
      this.client.globalProperties = newGlobalProperties;
    } else {
      throw new Error('Invalid value for global properties: ' + newGlobalProperties);
    }
  };

  // Private for Keen IO Tracker JS
  // -------------------------------

  function _uploadEvent(eventCollection, payload, success, error) {
    var urlBase = _build_url.call(this, "/events/" + eventCollection),
        urlQueryString = "",
        reqType = this.client.requestType,
        data = {};

    // Add properties from client.globalProperties
    if (this.client.globalProperties) {
      data = this.client.globalProperties(eventCollection);
    }

    // Add properties from user-defined event
    _each(payload, function(value, key){
      data[key] = value;
    });

    if (reqType !== "xhr") {
      urlQueryString += "?api_key="  + encodeURIComponent( this.client.writeKey );
      urlQueryString += "&data="     + encodeURIComponent( Keen.Base64.encode( JSON.stringify(data) ) );
      urlQueryString += "&modified=" + encodeURIComponent( new Date().getTime() );

      if ( String(urlBase + urlQueryString).length < Keen.urlMaxLength ) {
        if (reqType === "jsonp") {
          _sendJsonp(urlBase + urlQueryString, null, success, error);
        } else {
          _sendBeacon(urlBase + urlQueryString, null, success, error);
        }
        return;
      }
    }
    if (Keen.canXHR) {
      _sendXhr("POST", urlBase, { "Authorization": this.client.writeKey, "Content-Type": "application/json" }, data, success, error);
    } else {
      Keen.log("Event not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.");
    }
    return;
  };

  // Source: src/query.js
  /*!
  * -----------------
  * Keen IO Query JS
  * -----------------
  */


  // -------------------------------
  // Inject <client>.query Method
  // -------------------------------

  Keen.prototype.run = function(query, success, error) {
    var queries = [],
        successCallback = success,
        errorCallback = error;

    success = null;
    error = null;

    if ( _type(query) === 'Array' ) {
      queries = query;
    } else {
      queries.push(query);
    }
    var req = new Keen.Request(this, queries, successCallback, errorCallback);
    successCallback = errorCallback = null;
    return req;
  };


  // -------------------------------
  // Keen.Request
  // -------------------------------

  Keen.Request = function(instance, queries, success, error){
    var successCallback = success,
        errorCallback = error;

    success = null;
    error = null;

    this.configure(instance, queries, successCallback, errorCallback);
    successCallback = errorCallback = null;
  };
  _extend(Keen.Request.prototype, Events);

  Keen.Request.prototype.configure = function(instance, queries, success, error){
    this.instance = instance;
    this.queries = queries;
    this.data;

    this.success = success;
    success = null;

    this.error = error;
    error = null;

    this.refresh();
    return this;
  };

  Keen.Request.prototype.refresh = function(){

    var self = this,
        completions = 0,
        response = [];

    var handleSuccess = function(res, index){
      response[index] = res;
      self.queries[index].data = res;
      self.queries[index].trigger('complete', self.queries[index].data);

      // Increment completion count
      completions++;
      if (completions == self.queries.length) {

        // Attach response/meta data to query
        if (self.queries.length == 1) {
          self.data = response[0];
        } else {
          self.data = response;
        }

        // Trigger completion event on query
        self.trigger('complete', self.data);

        // Fire callback
        if (self.success) self.success(self.data);
      }

    };

    var handleFailure = function(res, req){
      var response = JSON.parse(res.responseText);
      self.trigger('error', response);
      if (self.error) {
        self.error(res, req);
      }
      Keen.log(res.statusText + ' (' + response.error_code + '): ' + response.message);
    };

    _each(self.queries, function(query, index){
      var url;
      var successSequencer = function(res){
        handleSuccess(res, index);
      };
      var failureSequencer = function(res){
        handleFailure(res, index);
      };

      if (query instanceof Keen.Query) {
        url = _build_url.call(self.instance, query.path);
        _sendQuery.call(self.instance, url, query.params, successSequencer, failureSequencer);

      } else if ( Object.prototype.toString.call(query) === '[object String]' ) {
        url = _build_url.call(self.instance, '/saved_queries/' + encodeURIComponent(query) + '/result');
        _sendQuery.call(self.instance, url, null, successSequencer, failureSequencer);

      } else {
        var res = {
          statusText: 'Bad Request',
          responseText: { message: 'Error: Query ' + (+index+1) + ' of ' + self.queries.length + ' for project ' + self.instance.client.projectId + ' is not a valid request' }
        };
        Keen.log(res.responseText.message);
        Keen.log('Check out our JavaScript SDK Usage Guide for Data Analysis:');
        Keen.log('https://keen.io/docs/clients/javascript/usage-guide/#analyze-and-visualize');
        if (self.error) {
          self.error(res.responseText.message);
        }
      }
    });
    return this;
  };


  // -------------------------------
  // Keen.Query
  // -------------------------------

  Keen.Query = function(){
    this.configure.apply(this, arguments);
  };
  _extend(Keen.Query.prototype, Events);

  Keen.Query.prototype.configure = function(analysisType, params) {
    this.analysis = analysisType;
    this.path = '/queries/' + analysisType;

    // Apply params w/ #set method
    this.params = this.params || {};
    this.set(params);

    // Localize timezone if none is set
    if (this.params.timezone === void 0) {
      this.params.timezone = _getTimezoneOffset();
    }
    return this;
  };

  Keen.Query.prototype.get = function(attribute) {
    var key = attribute;
    if (key.match(new RegExp("[A-Z]"))) {
      key = key.replace(/([A-Z])/g, function($1) { return "_"+$1.toLowerCase(); });
    }
    if (this.params) {
      return this.params[key] || null;
    }
  };

  Keen.Query.prototype.set = function(attributes) {
    var self = this;
    _each(attributes, function(v, k){
      var key = k, value = v;
      if (k.match(new RegExp("[A-Z]"))) {
        key = k.replace(/([A-Z])/g, function($1) { return "_"+$1.toLowerCase(); });
      }
      self.params[key] = value;
      if (_type(value)==="Array") {
        _each(value, function(dv, index){
          if (_type(dv)==="Object") {
            _each(dv, function(deepValue, deepKey){
              if (deepKey.match(new RegExp("[A-Z]"))) {
                var _deepKey = deepKey.replace(/([A-Z])/g, function($1) { return "_"+$1.toLowerCase(); });
                delete self.params[key][index][deepKey];
                self.params[key][index][_deepKey] = deepValue;
              }
            });
          }
        });
      }
    });
    return self;
  };

  Keen.Query.prototype.addFilter = function(property, operator, value) {
    this.params.filters = this.params.filters || [];
    this.params.filters.push({
      "property_name": property,
      "operator": operator,
      "property_value": value
    });
    return this;
  };


  // Private
  // --------------------------------

  function _getTimezoneOffset(){
    return new Date().getTimezoneOffset() * -60;
  };

  function _getQueryString(params){
    var query = [];
    for (var key in params) {
      if (params[key]) {
        var value = params[key];
        if (Object.prototype.toString.call(value) !== '[object String]') {
          value = JSON.stringify(value);
        }
        value = encodeURIComponent(value);
        query.push(key + '=' + value);
      }
    }
    return "&" + query.join('&');
  };


  function _sendQuery(url, params, success, error){
    var urlBase = url,
        urlQueryString = "",
        reqType = this.client.requestType,
        successCallback = success,
        errorCallback = error;

    success = null;
    error = null;

    if (urlBase.indexOf("extraction") > -1) {
      // Extractions do not currently support JSONP
      reqType = "xhr";
    }
    urlQueryString += "?api_key=" + this.client.readKey;
    urlQueryString += _getQueryString.call(this, params);
    if (reqType !== "xhr") {
      if ( String(urlBase + urlQueryString).length < Keen.urlMaxLength ) {
        _sendJsonp(urlBase + urlQueryString, null, successCallback, errorCallback);
        return;
      }
    }
    if (Keen.canXHR) {
      _sendXhr("GET", urlBase + urlQueryString, null, null, successCallback, errorCallback);
    } else {
      Keen.log("Event not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.");
    }
    successCallback = errorCallback = null;
    return;
  }

  // Source: src/lib/base64.js
  /*!
  * ----------------------------------------
  * Keen IO Base64 Transcoding
  * ----------------------------------------
  */

  Keen.Base64 = {
    map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function (n) {
      "use strict";
      var o = "", i = 0, m = this.map, i1, i2, i3, e1, e2, e3, e4;
      n = this.utf8.encode(n);
      while (i < n.length) {
        i1 = n.charCodeAt(i++); i2 = n.charCodeAt(i++); i3 = n.charCodeAt(i++);
        e1 = (i1 >> 2); e2 = (((i1 & 3) << 4) | (i2 >> 4)); e3 = (isNaN(i2) ? 64 : ((i2 & 15) << 2) | (i3 >> 6));
        e4 = (isNaN(i2) || isNaN(i3)) ? 64 : i3 & 63;
        o = o + m.charAt(e1) + m.charAt(e2) + m.charAt(e3) + m.charAt(e4);
      } return o;
    },
    decode: function (n) {
      "use strict";
      var o = "", i = 0, m = this.map, cc = String.fromCharCode, e1, e2, e3, e4, c1, c2, c3;
      n = n.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < n.length) {
        e1 = m.indexOf(n.charAt(i++)); e2 = m.indexOf(n.charAt(i++));
        e3 = m.indexOf(n.charAt(i++)); e4 = m.indexOf(n.charAt(i++));
        c1 = (e1 << 2) | (e2 >> 4); c2 = ((e2 & 15) << 4) | (e3 >> 2);
        c3 = ((e3 & 3) << 6) | e4;
        o = o + (cc(c1) + ((e3 != 64) ? cc(c2) : "")) + (((e4 != 64) ? cc(c3) : ""));
      } return this.utf8.decode(o);
    },
    utf8: {
      encode: function (n) {
        "use strict";
        var o = "", i = 0, cc = String.fromCharCode, c;
        while (i < n.length) {
          c = n.charCodeAt(i++); o = o + ((c < 128) ? cc(c) : ((c > 127) && (c < 2048)) ?
          (cc((c >> 6) | 192) + cc((c & 63) | 128)) : (cc((c >> 12) | 224) + cc(((c >> 6) & 63) | 128) + cc((c & 63) | 128)));
          } return o;
      },
      decode: function (n) {
        "use strict";
        var o = "", i = 0, cc = String.fromCharCode, c2, c;
        while (i < n.length) {
          c = n.charCodeAt(i);
          o = o + ((c < 128) ? [cc(c), i++][0] : ((c > 191) && (c < 224)) ?
          [cc(((c & 31) << 6) | ((c2 = n.charCodeAt(i + 1)) & 63)), (i += 2)][0] :
          [cc(((c & 15) << 12) | (((c2 = n.charCodeAt(i + 1)) & 63) << 6) | ((c3 = n.charCodeAt(i + 2)) & 63)), (i += 3)][0]);
        } return o;
      }
    }
  };

  // Source: src/lib/json2.js
  /*! 
  * --------------------------------------------
  * JSON2.js
  * https://github.com/douglascrockford/JSON-js
  * --------------------------------------------
  */

  // Create a JSON object only if one does not already exist. We create the
  // methods in a closure to avoid creating global variables.

  if (typeof JSON !== 'object') {
    JSON = {};
  }

  (function () {
    'use strict';

    function f(n) {
      // Format integers to have at least two digits.
      return n < 10 ? '0' + n : n;
    };

    if (typeof Date.prototype.toJSON !== 'function') {
      Date.prototype.toJSON = function (key) {
        return isFinite(this.valueOf())
            ? this.getUTCFullYear()     + '-' +
            f(this.getUTCMonth() + 1) + '-' +
            f(this.getUTCDate())      + 'T' +
            f(this.getUTCHours())     + ':' +
            f(this.getUTCMinutes())   + ':' +
            f(this.getUTCSeconds())   + 'Z'
            : null;
      };
      String.prototype.toJSON =
        Number.prototype.toJSON =
          Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
          };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {  // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
      },
      rep;

    function quote(string) {
      // If the string contains no control characters, no quote characters, and no
      // backslash characters, then we can safely slap some quotes around it.
      // Otherwise we must also replace the offending characters with safe escape
      // sequences.
      escapable.lastIndex = 0;
      return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
        var c = meta[a];
        return typeof c === 'string'
          ? c
          : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + string + '"';
    };

    function str(key, holder) {
      // Produce a string from holder[key].
      var i, // The loop counter.
          k, // The member key.
          v, // The member value.
          length,
          mind = gap,
          partial,
          value = holder[key];

      // If the value has a toJSON method, call it to obtain a replacement value.
      if (value && typeof value === 'object' &&
        typeof value.toJSON === 'function') {
        value = value.toJSON(key);
      }

      // If we were called with a replacer function, then call the replacer to
      // obtain a replacement value.
      if (typeof rep === 'function') {
        value = rep.call(holder, key, value);
      }
    
      // What happens next depends on the value's type.
      switch (typeof value) {
        case 'string':
          return quote(value);
        case 'number':
          // JSON numbers must be finite. Encode non-finite numbers as null.
          return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
          // If the value is a boolean or null, convert it to a string. Note:
          // typeof null does not produce 'null'. The case is included here in
          // the remote chance that this gets fixed someday.
          return String(value);
        // If the type is 'object', we might be dealing with an object or an array or null.
        case 'object':
          // Due to a specification blunder in ECMAScript, typeof null is 'object',
          // so watch out for that case.
          if (!value) {
            return 'null';
          }
          // Make an array to hold the partial results of stringifying this object value.
          gap += indent;
          partial = [];
          // Is the value an array?
          if (Object.prototype.toString.apply(value) === '[object Array]') {
            // The value is an array. Stringify every element. Use null as a placeholder
            // for non-JSON values.
            length = value.length;
            for (i = 0; i < length; i += 1) {
              partial[i] = str(i, value) || 'null';
            }
            // Join all of the elements together, separated with commas, and wrap them in brackets.
            v = partial.length === 0
              ? '[]'
              : gap
              ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
              : '[' + partial.join(',') + ']';
            gap = mind;
            return v;
          }
          // If the replacer is an array, use it to select the members to be stringified.
          if (rep && typeof rep === 'object') {
            length = rep.length;
            for (i = 0; i < length; i += 1) {
              if (typeof rep[i] === 'string') {
                k = rep[i];
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ': ' : ':') + v);
                }
              }
            }
          } else {
            // Otherwise, iterate through all of the keys in the object.
            for (k in value) {
              if (Object.prototype.hasOwnProperty.call(value, k)) {
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ': ' : ':') + v);
                }
              }
            }
          }
          // Join all of the member texts together, separated with commas,
          // and wrap them in braces.
          v = partial.length === 0
              ? '{}'
              : gap
              ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
              : '{' + partial.join(',') + '}';
          gap = mind;
          return v;
        }
      }
    
      // If the JSON object does not yet have a stringify method, give it one.
      if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
          // The stringify method takes a value and an optional replacer, and an optional
          // space parameter, and returns a JSON text. The replacer can be a function
          // that can replace values, or an array of strings that will select the keys.
          // A default replacer method can be provided. Use of the space parameter can
          // produce text that is more easily readable.
          var i;
          gap = '';
          indent = '';

          // If the space parameter is a number, make an indent string containing that
          // many spaces.
          if (typeof space === 'number') {
            for (i = 0; i < space; i += 1) {
              indent += ' ';
            }
            // If the space parameter is a string, it will be used as the indent string.
          } else if (typeof space === 'string') {
            indent = space;
          }

          // If there is a replacer, it must be a function or an array.
          // Otherwise, throw an error.
          rep = replacer;
          if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
            throw new Error('JSON.stringify');
          }
        
          // Make a fake root object containing our value under the key of ''.
          // Return the result of stringifying the value.
          return str('', {'': value});
        };
      }

      // If the JSON object does not yet have a parse method, give it one.
      if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
          // The parse method takes a text and an optional reviver function, and returns
          // a JavaScript value if the text is a valid JSON text.
          var j;
          function walk(holder, key) {
            // The walk method is used to recursively walk the resulting structure so
            // that modifications can be made.
            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
              for (k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                  v = walk(value, k);
                  if (v !== undefined) {
                    value[k] = v;
                  } else {
                    delete value[k];
                  }
                }
              }
            }
            return reviver.call(holder, key, value);
          }

          // Parsing happens in four stages. In the first stage, we replace certain
          // Unicode characters with escape sequences. JavaScript handles many characters
          // incorrectly, either silently deleting them, or treating them as line endings.
          text = String(text);
          cx.lastIndex = 0;
          if (cx.test(text)) {
            text = text.replace(cx, function (a) {
              return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            });
          }

          // In the second stage, we run the text against regular expressions that look
          // for non-JSON patterns. We are especially concerned with '()' and 'new'
          // because they can cause invocation, and '=' because it can cause mutation.
          // But just to be safe, we want to reject all unexpected forms.

          // We split the second stage into 4 regexp operations in order to work around
          // crippling inefficiencies in IE's and Safari's regexp engines. First we
          // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
          // replace all simple value tokens with ']' characters. Third, we delete all
          // open brackets that follow a colon or comma or that begin the text. Finally,
          // we look to see that the remaining characters are only whitespace or ']' or
          // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
          if (/^[\],:{}\s]*$/
              .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
              .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
              .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.
                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.
                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
          }

          // If the text is not JSON parseable, then a SyntaxError is thrown.
          throw new SyntaxError('JSON.parse');
      };
    }
  }());
  // Source: src/lib/keen-dataform.js
// Source: src/lib/_intro.js

(function(root, factory) {
  root.Dataform = factory();
}
(Keen, function() {
    'use strict';

    // Source: src/dataform.js
    /*!
      * ----------------
      * Dataform.js
      * ----------------
      */

    function Dataform(raw, schema) {
      this.configure(raw, schema);
    }

    Dataform.prototype.configure = function(raw, schema){
      var self = this, options;

      self.raw = self.raw || raw,
      self.schema = self.schema || schema || {},
      self.table = [[]];

      if (self.schema.collection && is(self.schema.collection, 'string') == false) {
        throw new Error('schema.collection must be a string');
      }

      if (self.schema.unpack && self.schema.select) {
        throw new Error('schema.unpack and schema.select cannot be used together');
      }

      if (self.schema.unpack) {
        this.action = 'unpack';
        options = extend({
          collection: "",
          unpack: {
            index: false,
            value: false,
            label: false
          }
        }, self.schema);
        options = _optHash(options);
        _unpack.call(this, options);
      }

      if (self.schema.select) {
        this.action = 'select';
        options = extend({
          collection: "",
          select: true
        }, self.schema);
        options = _optHash(options);
        _select.call(this, options);
      }

      return this;
    };



    // Select
    // --------------------------------------

    function _select(options){
      //console.log('Selecting', options);

      var self = this,
          target_set = [],
          unique_keys = [];

      var root = (function(){
        var root, parsed;
        if (options.collection == "") {
          root = self.raw;
        } else {
          parsed = parse.apply(self, [self.raw].concat(options.collection.split(" -> ")));
          root = parsed[0];
        }
        if (Object.prototype.toString.call(root) !== '[object Array]') {
          root = [root];
        }
        return root;
      })();

      each(options.select, function(property, i){
        target_set.push(property.path.split(" -> "));
      });

      // Retrieve keys found in asymmetrical collections
      if (target_set.length == 0) {
        each(root, function(record, interval){
          var flat = flatten(record);
          //console.log('flat', flat);
          for (var key in flat) {
            if (flat.hasOwnProperty(key) && unique_keys.indexOf(key) == -1) {
              unique_keys.push(key);
              target_set.push([key]);
            }
          }
        });
      }

      // Parse each record
      each(root, function(record, interval){
        var flat = flatten(record);
        self.table.push([]);
        each(target_set, function(target, i){
          var flat_target = target.join(".");
          if (interval == 0) {
            self.table[0].push(flat_target);
          }
          if (flat[flat_target] !== void 0 || typeof flat[flat_target] == 'boolean') {
            self.table[interval+1].push(flat[flat_target]);
          } else {
            self.table[interval+1].push(null);
          }

        });
      });

      self.format(options.select);
      self.sort(options.sort);
      return self;
    }



    // Unpack
    // --------------------------------------

    function _unpack(options){
      // console.log('Unpacking', options);
      var self = this, discovered_labels = [];

      var value_set = (options.unpack.value) ? options.unpack.value.path.split(" -> ") : false,
          label_set = (options.unpack.label) ? options.unpack.label.path.split(" -> ") : false,
          index_set = (options.unpack.index) ? options.unpack.index.path.split(" -> ") : false;
      //console.log(index_set, label_set, value_set);

      var value_desc = (value_set[value_set.length-1] !== "") ? value_set[value_set.length-1] : "Value",
          label_desc = (label_set[label_set.length-1] !== "") ? label_set[label_set.length-1] : "Label",
          index_desc = (index_set[index_set.length-1] !== "") ? index_set[index_set.length-1] : "Index";

      var sort_index = (options.sort && options.sort.index) ? options.sort.index : false,
          sort_value = (options.sort && options.sort.value) ? options.sort.value : false;

      // Prepare root for parsing
      var root = (function(){
        var root;
        if (options.collection == "") {
          root = [self.raw];
        } else {
          root = parse.apply(self, [self.raw].concat(options.collection.split(" -> ")));
        }
        return root[0];
      })();

      if (root instanceof Array == false) {
        root = [root];
      }

      // Find labels
      each(root, function(record, interval){
        var labels = (label_set) ? parse.apply(self, [record].concat(label_set)) : [];
        if (labels) {
          discovered_labels = labels;
        }
      });

      // Parse each record
      each(root, function(record, interval){
        //console.log('record', record);

        var plucked_value = (value_set) ? parse.apply(self, [record].concat(value_set)) : false,
            //plucked_label = (label_set) ? parse.apply(self, [record].concat(label_set)) : false,
            plucked_index = (index_set) ? parse.apply(self, [record].concat(index_set)) : false;
        //console.log(plucked_index, plucked_label, plucked_value);

        // Inject row for each index
        if (plucked_index) {
          each(plucked_index, function(){
            self.table.push([]);
          });
        } else {
          self.table.push([]);
        }

        // Build index column
        if (plucked_index) {

          // Build index/label on first interval
          if (interval == 0) {

            // Push last index property to 0,0
            self.table[0].push(index_desc);

            // Build subsequent series headers (1:N)
            if (discovered_labels.length > 0) {
              each(discovered_labels, function(value, i){
                self.table[0].push(value);
              });

            } else {
              self.table[0].push(value_desc);
            }
          }

          // Correct for odd root cases
          if (root.length < self.table.length-1) {
            if (interval == 0) {
              each(self.table, function(row, i){
                if (i > 0) {
                  self.table[i].push(plucked_index[i-1]);
                }
              });
            }
          } else {
            self.table[interval+1].push(plucked_index[0]);
          }
        }

        // Build label column
        if (!plucked_index && discovered_labels.length > 0) {
          if (interval == 0) {
            self.table[0].push(label_desc);
            self.table[0].push(value_desc);
          }
          self.table[interval+1].push(discovered_labels[0]);
        }

        if (!plucked_index && discovered_labels.length == 0) {
          // [REVISIT]
          self.table[0].push('');
        }

        // Append values
        if (plucked_value) {
          // Correct for odd root cases
          if (root.length < self.table.length-1) {
            if (interval == 0) {
              each(self.table, function(row, i){
                if (i > 0) {
                  self.table[i].push(plucked_value[i-1]);
                }
              });
            }
          } else {
            each(plucked_value, function(value){
              self.table[interval+1].push(value);
            });
          }
        } else {
          // append null across this row
          each(self.table[0], function(cell, i){
            var offset = (plucked_index) ? 0 : -1;
            if (i > offset) {
              self.table[interval+1].push(null);
            }
          })
        }

      });

      self.format(options.unpack);
      self.sort(options.sort);
      return this;
    }



    // String configs to hash paths
    // --------------------------------------

    function _optHash(options){
      each(options.unpack, function(value, key, object){
        if (value && is(value, 'string')) {
          options.unpack[key] = { path: options.unpack[key] };
        }
      });
      return options;
    }



    // ♫♩♬ Holy Diver! ♬♩♫
    // --------------------------------------

    function parse() {
      var result = [];
      var loop = function() {
        var root = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);
        var target = args.pop();

        if (args.length === 0) {
          if (root instanceof Array) {
            args = root;
          } else if (typeof root === 'object') {
            args.push(root);
          }
        }

        each(args, function(el){

          // Grab the numbers and nulls
          if (target == "") {
            if (typeof el == "number" || el == null) {
              return result.push(el);
            }
          }

          if (el[target] || el[target] === 0 || el[target] !== void 0) {
            // Easy grab!
            if (el[target] === null) {
              return result.push(null);
            } else {
              return result.push(el[target]);
            }

          } else if (root[el]){
            if (root[el] instanceof Array) {
              // dive through each array item

              each(root[el], function(n, i) {
                var splinter = [root[el]].concat(root[el][i]).concat(args.slice(1)).concat(target);
                return loop.apply(this, splinter);
              });

            } else {
              if (root[el][target]) {
                // grab it!
                return result.push(root[el][target]);

              } else {
                // dive down a level!
                return loop.apply(this, [root[el]].concat(args.splice(1)).concat(target));

              }
            }

          } else if (typeof root === 'object' && root instanceof Array === false && !root[target]) {
            throw new Error("Target property does not exist", target);

          } else {
            // dive down a level!
            return loop.apply(this, [el].concat(args.splice(1)).concat(target));
          }

          return;

        });
        if (result.length > 0) {
          return result;
        }
      };
      return loop.apply(this, arguments);
    }

    // Utilities
    // --------------------------------------

    // Pure awesomeness by Will Rayner (penguinboy)
    // https://gist.github.com/penguinboy/762197
    function flatten(ob) {
      var toReturn = {};
      for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;
        if ((typeof ob[i]) == 'object' && ob[i] !== null) {
          var flatObject = flatten(ob[i]);
          for (var x in flatObject) {
            if (!flatObject.hasOwnProperty(x)) continue;
            toReturn[i + '.' + x] = flatObject[x];
          }
        } else {
          toReturn[i] = ob[i];
        }
      }
      return toReturn;
      /*each(ob, function(value, i){
        if (typeof value == 'object' && value !== null) {
          var flatObject = flatten(ob[i]);
          each(flatObject, function(v2, i2){
            toReturn[i + '.' + i2] = v2;
          });
        } else {
          toReturn[i] = value;
        }
      });*/
    }

    // via: https://github.com/spocke/punymce
    function is(o, t){
      o = typeof(o);
      if (!t){
        return o != 'undefined';
      }
      return o == t;
    }

    function each(o, cb, s){
      var n;
      if (!o){
        return 0;
      }
      s = !s ? o : s;
      if (is(o.length)){
        // Indexed arrays, needed for Safari
        for (n=0; n<o.length; n++) {
          if (cb.call(s, o[n], n, o) === false){
            return 0;
          }
        }
      } else {
        // Hashtables
        for (n in o){
          if (o.hasOwnProperty(n)) {
            if (cb.call(s, o[n], n, o) === false){
              return 0;
            }
          }
        }
      }
      return 1;
    }

    // Adapted to exclude null values
    function extend(o, e){
      each(e, function(v, n){
        if (is(o[n], 'object') && is(v, 'object')){
          o[n] = extend(o[n], v);
        } else if (v !== null) {
          o[n] = v;
        }
      });
      return o;
    }

    extend(Dataform, {
      each: each,
      extend: extend,
      is: is,
      flatten: flatten
    });


    // Configure moment.js if present
    if (window.moment) {
      moment.suppressDeprecationWarnings = true;
    }

  // Source: src/lib/format.js
  Dataform.prototype.format = function(opts){
    var self = this, options;

      var defaults = {
        'number': {
          //format: '0', // 1,000.00
          //prefix: '',
          //suffix: ''
          //modifier: '*1'
        },
        'date': {
          //format: 'MMM DD, YYYY'
        },
        'string': {
          //format: 'capitalize',
          prefix: '',
          suffix: ''
        }
      };

      if (self.action == 'select') {
        options = [];
        each(opts, function(option){
          var copy = {}, output;
          each(defaults, function(hash, key){
            copy[key] = extend({}, hash);
          });
          output = (copy[option.type]) ? extend(copy[option.type], option) : option;
          options.push(output);
        });

        each(self.table, function(row, i){

          // Replace labels
          if (i == 0) {
            each(row, function(cell, j){
              if (options[j] && options[j].label) {
                self.table[i][j] = options[j].label;
              }
            });

          } else {

            each(row, function(cell, j){
              self.table[i][j] = _applyFormat(self.table[i][j], options[j]);
            });
          }

        });

      }


    //////////////////////////////////


    if (self.action == 'unpack') {
      options = {};
      each(opts, function(option, key){
        var copy = {}, output;
        each(defaults, function(hash, key){
          copy[key] = extend({}, hash);
        });
        options[key] = (copy[key]) ? extend(copy[key], option) : option;
      });

      if (options.index) {
        each(self.table, function(row, i){
          if (i == 0) {
            if (options.index.label) {
              self.table[i][0] = options.index.label;
            }
          } else {
            self.table[i][0] = _applyFormat(self.table[i][0], options.index);
          }
        });
      }

      if (options.label) {
        if (options.index) {
          each(self.table, function(row, i){
            each(row, function(cell, j){
              if (i == 0 && j > 0) {
                self.table[i][j] = _applyFormat(self.table[i][j], options.label);
              }
            });
          });
        } else {
          each(self.table, function(row, i){
            if (i > 0) {
              self.table[i][0] = _applyFormat(self.table[i][0], options.label);
            }
          });
          //console.log('label, NO index');
        }
      }

      if (options.value) {
        if (options.index) {
          // start > 0
          each(self.table, function(row, i){
            each(row, function(cell, j){
              if (i > 0 && j > 0) {
                self.table[i][j] = _applyFormat(self.table[i][j], options.value);
              }
            });
          });
        } else {
          // start @ 0
          each(self.table, function(row, i){
            each(row, function(cell, j){
              if (i > 0) {
                self.table[i][j] = _applyFormat(self.table[i][j], options.value);
              }
            });
          });
        }
      }

    }

    //console.log(self.table);
    return self;
  };

  function _applyFormat(value, opts){
    var output = value,
        options = opts || {};

    if (options.method) {
      var copy = output, method = window;
      each(options.method.split("."), function(str, i){
        if (method[str]){
          method = method[str];
        }
      });
      if (typeof method === 'function') {
        try {
          output = method.apply(null, [output, options]);
        }
        catch (e) {
          output = copy;
        }
      }
    }

    if (options.replace) {
      each(options.replace, function(val, key){
        if (output == key || String(output) == String(key) || parseFloat(output) == parseFloat(key)) {
          output = val;
        }
      });
    }

    if (options.type && options.type == 'date') {

      if (options.format && moment && moment(value).isValid()) {
        output = moment(output).format(options.format);
      } else {
        output = new Date(output);
      }
    }

    if (options.type && options.type == 'string') {

      output = String(output);

      if (options.format) {
        switch (options.format) {
          case 'capitalize':
            // via: http://stackoverflow.com/a/15150510/2511985
            output = output.replace(/[^\s]+/g, function(word) {
              return word.replace(/^./, function(first) {
                return first.toUpperCase();
              });
            });
            break;
          case 'uppercase':
            output = output.toUpperCase();
            break;
          case 'lowercase':
            output = output.toLowerCase();
            break;
        }
      }

    }

    if (options.type && options.type == 'number' && !isNaN(parseFloat(output))) {

      output = parseFloat(output);

      if (options.format) {

        // Set decimals
        if (options.format.indexOf('.') !== -1) {
          output = (function(num){
            var chop = options.format.split('.');
            var length = chop[chop.length-1].length;
            return num.toFixed(length);
          })(output);
        }

        // Set commas
        if (options.format.indexOf(',') !== -1) {
          output = (function(num){
            var split = String(num).split(".");
            while (/(\d+)(\d{3})/.test(split[0])){
              split[0] = split[0].replace(/(\d+)(\d{3})/, '$1'+','+'$2');
            }
            return split.join(".");
          })(output);
        }

      }
    }

    if (options.prefix) {
      output = String(options.prefix) + output;
    }

    if (options.suffix) {
      output = output + String(options.suffix);
    }

    return output;
  }

  // Source: src/lib/sort.js
  Dataform.prototype.sort = function(opts){
    var self = this, options;

    if (self.action == 'unpack') {

      options = extend({
        index: false,
        value: false
      }, opts);

      // Sort records by index
      if (options.index) {
        !function(){
          var header = self.table[0],
              body = self.table.splice(1);

          body.sort(function(a, b) {
            if (options.index == 'asc') {
              if (a[0] > b[0]) {
                return 1;
              } else {
                return -1
              }
            } else if (options.index == 'desc') {
              if (a[0] > b[0]) {
                return -1;
              } else {
                return 1
              }
            }
            return false;
          });

          self.table = [header].concat(body);
        }();
      }

      // Sort columns (labels) by total values
      if (options.value && self.schema.unpack.label && self.table[0].length > 2) {
        !function(){
          var header = self.table[0],
              body = self.table.splice(1),
              series = [],
              table = [],
              index_cell = (self.schema.unpack.index) ? 0 : -1;

          each(header, function(cell, i){
            if (i > index_cell) {
              series.push({ label: cell, values: [], total: 0 });
            }
          });

          each(body, function(row, i){
            each(row, function(cell, j){
              if (j > index_cell) {
                if (is(cell, 'number')) {
                  series[j-1].total += cell;
                }
                series[j-1].values.push(cell);
              }
            });
          });

          if (self.schema.unpack.label.type == 'number' || is(body[0][1], 'number')) {
            series.sort(function(a, b) {
              //console.log(options, self.schema, options.value, a.total, b.total);
              if (options.value == 'asc') {
                if (a.total > b.total) {
                  return 1;
                } else {
                  return -1
                }
              } else if (options.value == 'desc') {
                if (a.total > b.total) {
                  return -1;
                } else {
                  return 1
                }
              }
              return false;
            });
          }

          each(series, function(column, i){
            header[index_cell+1+i] = series[i].label;
            each(body, function(row, j){
              row[index_cell+1+i] = series[i].values[j];
            });
          });

          self.table = [header].concat(body);

        }();
      }
    }

    if (self.action == 'select') {

      options = extend({
        column: 0,
        order: false
      }, opts);

      if (options.order != false) {
        !function(){
          var header = self.table[0],
              body = self.table.splice(1);

          body.sort(function(a, b){
            var _a = (a[options.column] === null || a[options.column] === void 0) ? "" : a[options.column],
                _b = (b[options.column] === null || b[options.column] === void 0) ? "" : b[options.column];
            if (options.order == 'asc') {
              if (_a > _b) {
                return 1;
              } else {
                return -1
              }
            } else if (options.order == 'desc') {
              if (_a > _b) {
                return -1;
              } else {
                return 1
              }
            }
            return 0;
          });
          self.table = [header].concat(body);
        }();
      }
    }

    return self;
  };

    // Source: src/lib/_outro.js
    return Dataform;
}));

  // Source: src/lib/keen-domready.js
/*!
  * domready (c) Dustin Diaz 2012 - License MIT
  */
// Modified header to work internally w/ Keen lib
/*!
  * domready (c) Dustin Diaz 2012 - License MIT
  */
(function(root, factory) {
  root.utils.domready = factory();
}(Keen, function (ready) {

  var fns = [], fn, f = false
    , doc = document
    , testEl = doc.documentElement
    , hack = testEl.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , addEventListener = 'addEventListener'
    , onreadystatechange = 'onreadystatechange'
    , readyState = 'readyState'
    , loadedRgx = hack ? /^loaded|^c/ : /^loaded|c/
    , loaded = loadedRgx.test(doc[readyState])

  function flush(f) {
    loaded = 1
    while (f = fns.shift()) f()
  }

  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
    doc.removeEventListener(domContentLoaded, fn, f)
    flush()
  }, f)


  hack && doc.attachEvent(onreadystatechange, fn = function () {
    if (/^c/.test(doc[readyState])) {
      doc.detachEvent(onreadystatechange, fn)
      flush()
    }
  })

  return (ready = hack ?
    function (fn) {
      self != top ?
        loaded ? fn() : fns.push(fn) :
        function () {
          try {
            testEl.doScroll('left')
          } catch (e) {
            return setTimeout(function() { ready(fn) }, 50)
          }
          fn()
        }()
    } :
    function (fn) {
      loaded ? fn() : fns.push(fn)
    })
}));

  // Source: src/lib/keen-spinner.js
/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 */
// Modified to work internally with Keen lib
(function(root, factory) {
  root.Spinner = factory();
}
(Keen, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
    if(s[prop] !== undefined) return prop
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = { x:el.offsetLeft, y:el.offsetTop }
    while((el = el.offsetParent))
      o.x+=el.offsetLeft, o.y+=el.offsetTop

    return o
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: '50%',           // center vertically
    left: '50%',          // center horizontally
    position: 'absolute'  // element position
  }

  /** The constructor */
  function Spinner(o) {
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {

    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
        , mid = o.radius+o.length+o.width

      css(el, {
        left: o.left,
        top: o.top
      })

      if (target) {
        target.insertBefore(el, target.firstChild||null)
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner;

}));

  // Source: src/visualize.js
  /*!
  * ----------------------
  * Keen IO Visualization
  * ----------------------
  */

  Keen.prototype.draw = function(query, selector, config) {
    // Find DOM element, set height, build spinner
    var config = config || {};
    var el = selector;
    //var id = selector.getAttribute("id");
    //var el = document.getElementById(id);

    var placeholder = document.createElement("div");
    placeholder.className = "keen-loading";
    //placeholder.style.background = "#f2f2f2";
    placeholder.style.height = (config.height || Keen.Visualization.defaults.height) + "px";
    placeholder.style.position = "relative";
    placeholder.style.width = (config.width || Keen.Visualization.defaults.width) + "px";
    el.innerHTML = "";
    el.appendChild(placeholder);

    var spinner = new Keen.Spinner({
      lines: 10, // The number of lines to draw
      length: 8, // The length of each line
      width: 3, // The line thickness
      radius: 10, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#4d4d4d', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'keen-spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    }).spin(placeholder);

    var request = new Keen.Request(this, [query]);

    request.on("complete", function(){
      if (placeholder && placeholder.parentNode !== null) {
        spinner.stop();
        el.removeChild(placeholder);
        placeholder = null;
      }
      this.draw(selector, config);
    });

    request.on("error", function(response){
      var errorConfig, error;
      spinner.stop();
      el.removeChild(placeholder);

      errorConfig = Keen.utils.extend({
        error: response,
        el: el
      }, Keen.Visualization.defaults);
      error = new Keen.Visualization.libraries['keen-io']['error'](errorConfig);
    });

    return request;
  };


  // -------------------------------
  // Inject Request Draw Method
  // -------------------------------
  Keen.Request.prototype.draw = function(selector, config) {
    _build_visual.call(this, selector, config);
    this.on('complete', function(){
      _build_visual.call(this, selector, config);
    });
    return this;
  };

  function _build_visual(selector, config){
    if (this.visual) {
      this.visual.trigger("remove");
    }
    this.visual = new Keen.Visualization(this, selector, config);
  }


  // -------------------------------
  // Keen.Visualization
  // -------------------------------
  Keen.Visualization = function(req, selector, config){
    var self = this, data, defaults, options, library, defaultType, dataformSchema;

    // Backwoods cloning facility
    defaults = JSON.parse(JSON.stringify(Keen.Visualization.defaults));

    options = _extend(defaults, config || {});
    library = Keen.Visualization.libraries[options.library];

    options.el = selector;

    dataformSchema = {
      collection: 'result',
      select: true
    };

    // Build default title if necessary to do so
    if (!options.title && req instanceof Keen.Request) {
      options.title = (function(){
        var analysis = req.queries[0].analysis.replace("_", " "),
            collection = req.queries[0].get('event_collection'),
            output;

        output = analysis.replace( /\b./g, function(a){
          return a.toUpperCase();
        });

        if (collection) {
          output += ' - ' + collection;
        }
        return output;
      })();
    }

    var isMetric = false,
        isFunnel = false,
        isInterval = false,
        isGroupBy = false,
        is2xGroupBy = false,
        isExtraction = false;

    if (req instanceof Keen.Request) {
      // Handle known scenarios
      isMetric = (typeof req.data.result === "number" || req.data.result === null) ? true : false,
      isFunnel = (req.queries[0].get('steps')) ? true : false,
      isInterval = (req.queries[0].get('interval')) ? true : false,
      isGroupBy = (req.queries[0].get('group_by')) ? true : false,
      is2xGroupBy = (req.queries[0].get('group_by') instanceof Array) ? true : false;
      isExtraction = (req.queries[0].analysis == 'extraction') ? true : false;

      data = (req.data instanceof Array) ? req.data[0] : req.data;

    } else if (typeof req === "string") {
      // Fetch a new resource
      // _request.jsonp()
      // _transform()

    } else {
      // Handle raw data
      // _transform() and handle as usual
      data = (req instanceof Array) ? req[0] : req;
      isMetric = (typeof data.result === "number" || data.result === null) ? true : false
    }


    // -------------------------------
    // Select a default chart type
    // -------------------------------

    // Metric
    if (isMetric) {
      options.capable = ['metric'];
      defaultType = 'metric';
    }

    // GroupBy
    if (!isInterval && isGroupBy) {
      options.capable = ['piechart', 'barchart', 'columnchart', 'table'];
      defaultType = 'piechart';
      if (options.chartType == 'barchart') {
        options.chartOptions.legend = { position: 'none' };
      }
    }

    // Single Interval
    if (isInterval && !isGroupBy) { // Series
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      defaultType = 'areachart';
      if (options.library == 'google') {
        if (options.chartOptions.legend == void 0) {
          options.chartOptions.legend = { position: 'none' };
        }
      }

    }

    // GroupBy Interval
    if (isInterval && isGroupBy) {
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      defaultType = 'linechart';
    }

    // Custom Dataset schema for
    // complex query/response types
    // -------------------------------

    // Funnels
    if (isFunnel) {
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      defaultType = 'columnchart';
      if (options.library == 'google') {
        options.chartOptions.legend = { position: 'none' };
      }
    }

    // 2x GroupBy
    if (is2xGroupBy) {
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      defaultType = 'columnchart';
    }


    // Dataform schema
    // ---------------------------------------------------------
    if (is2xGroupBy) {
      dataformSchema = {
        collection: 'result',
        sort: {
          index: 'asc',
          label: 'desc'
        }
      };
      if (isInterval) {
        dataformSchema.unpack = {
          index: 'timeframe -> start',
          label: 'value -> ' + req.queries[0].params.group_by[0],
          value: 'value -> result'
        };
      } else {
        dataformSchema.unpack = {
          index: req.queries[0].params.group_by[0],
          label: req.queries[0].params.group_by[1],
          value: 'result'
        };
      }
    }

    // Extractions
    if (isExtraction) {
      options.capable = ['table'];
      defaultType = 'table';
    }

    // Dataform schema
    // ---------------------------------------------------------
    if (isExtraction) {
      dataformSchema = {
        collection: "result",
        select: true
      };
      if (req.queries[0].get('property_names')) {
        dataformSchema.select = [];
        for (var i = 0; i < req.queries[0].get('property_names').length; i++) {
          dataformSchema.select.push({ path: req.queries[0].get('property_names')[i] });
        }
      }
    }


    // A few last details
    // -------------------------------
    if (!options.chartType) {
      options.chartType = defaultType;
    }

    if (options.chartType == 'metric') {
      options.library = 'keen-io';
    }

    if (options.chartOptions.lineWidth == void 0) {
      options.chartOptions.lineWidth = 2;
    }

    if (options.chartType == 'piechart') {
      if (options.chartOptions.sliceVisibilityThreshold == void 0) {
        options.chartOptions.sliceVisibilityThreshold = 0.01;
      }
    }

    if (options.chartType == 'columnchart' || options.chartType == 'areachart' || options.chartType == 'linechart') {

      if (options.chartOptions.hAxis == void 0) {
        options.chartOptions.hAxis = {
          baselineColor: 'transparent',
          gridlines: { color: 'transparent' }
        };
      }

      if (options.chartOptions.vAxis == void 0) {
        options.chartOptions.vAxis = {
          viewWindow: { min: 0 }
        };
      }
    }

    //_extend(self, options);
    options['data'] = (data) ? _transform.call(options, data, dataformSchema) : [];


    // Apply color-mapping options (post-process)
    // -------------------------------
    if (options.colorMapping) {

      // Map to selected index
      if (options['data'].schema.select && options['data'].table[0].length == 2) {
        _each(options['data'].table, function(row, i){
          if (i > 0 && options.colorMapping[row[0]]) {
            options.colors.splice(i-1, 0, options.colorMapping[row[0]]);
          }
        });
      }

      // Map to unpacked labels
      if (options['data'].schema.unpack) { //  && options['data'].table[0].length > 2
        _each(options['data'].table[0], function(cell, i){
          if (i > 0 && options.colorMapping[cell]) {
            options.colors.splice(i-1, 0, options.colorMapping[cell]);
          }
        });
      }

    }


    // Put it all together
    // -------------------------------
    if (options.library) {
      if (Keen.Visualization.libraries[options.library][options.chartType]) {
        return new Keen.Visualization.libraries[options.library][options.chartType](options);
      } else {
        throw new Error('The library you selected does not support this chartType');
      }
    } else {
      throw new Error('The library you selected is not present');
    }

    return this;
  };

  // Visual defaults
  Keen.Visualization.defaults = {
    library: 'google',
    height: 400,
    width: 600,
    colors: [
      "#00afd7",
      "#f35757",
      "#f0ad4e",
      "#8383c6",
      "#f9845b",
      "#49c5b1",
      "#2a99d1",
      "#aacc85",
      "#ba7fab"
    ],
    chartOptions: {}
  };

  // Collect and manage libraries
  Keen.Visualization.libraries = {};
  Keen.Visualization.register = function(name, methods){
    Keen.Visualization.libraries[name] = Keen.Visualization.libraries[name] || {};
    for (var method in methods) {
      Keen.Visualization.libraries[name][method] = methods[method];
    }
  };

  Keen.Visualization.visuals = [];
  var baseVisualization = function(config){
    var self = this;
    _extend(self, config);

    // Set default event handlers
    self.on("error", function(){
      var errorConfig, error;
      errorConfig = Keen.utils.extend({
        error: { message: arguments[0] }
      }, config);
      error = new Keen.Visualization.libraries['keen-io']['error'](errorConfig);
    });
    self.on("update", function(){
      self.update.apply(this, arguments);
    });
    self.on("remove", function(){
      self.remove.apply(this, arguments);
    });

    // Let's kick it off!
    self.initialize();
    Keen.Visualization.visuals.push(self);
  };

  baseVisualization.prototype = {
    initialize: function(){
      // Set listeners and prepare data
    },
    render: function(){
      // Build artifacts
    },
    update: function(){
      // Handle data updates
    },
    remove: function(){
      // Handle deletion
    }
  };
  _extend(baseVisualization.prototype, Events);

  Keen.Visualization.extend = function(protoProps, staticProps){
    var parent = baseVisualization, Visualization;
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      Visualization = protoProps.constructor;
    } else {
      Visualization = function(){ return parent.apply(this, arguments); };
    }
    _extend(Visualization, parent, staticProps);
    var Surrogate = function(){ this.constructor = Visualization; };
    Surrogate.prototype = parent.prototype;
    Visualization.prototype = new Surrogate();
    if (protoProps) {
      _extend(Visualization.prototype, protoProps);
    }
    Visualization.__super__ = parent.prototype;
    return Visualization;
  };

  var ErrorMessage = Keen.Visualization.extend({
    initialize: function(){
      var errorPlaceholder, errorMessage;

      errorPlaceholder = document.createElement("div");
      errorPlaceholder.className = "keen-error";
      errorPlaceholder.style.borderRadius = "8px";
      errorPlaceholder.style.height = this.height + "px";
      errorPlaceholder.style.width = this.width + "px";

      errorMessage = document.createElement("span");
      errorMessage.style.color = "#ccc";
      errorMessage.style.display = "block";
      errorMessage.style.paddingTop = (this.height / 2 - 15) + "px";
      errorMessage.style.fontFamily = "Helvetica Neue, Helvetica, Arial, sans-serif";
      errorMessage.style.fontSize = "21px";
      errorMessage.style.fontWeight = "light";
      errorMessage.style.textAlign = "center";

      errorMessage.innerHTML = this['error'].message;
      errorPlaceholder.appendChild(errorMessage);

      this.el.innerHTML = "";
      this.el.appendChild(errorPlaceholder);
    }
  });

  Keen.Visualization.register('keen-io', {
    'error': ErrorMessage
  });


  // -------------------------------
  // Dataform Configuration
  // -------------------------------
  // Handles arbitrary raw data for
  // scenarios where originating
  // queries are not known
  // -------------------------------
  function _transform(response, config){
    var self = this, schema = config || {}, dataform;

    // Metric
    // -------------------------------
    if (typeof response.result == "number"){
      //return new Keen.Dataform(response, {
      schema = {
        collection: "",
        select: [{
          path: "result",
          type: "string",
          label: "Metric",
          format: false,
          method: "Keen.utils.prettyNumber",
          replace: {
            null: 0
          }
        }]
      }
    }

    // Everything else
    // -------------------------------
    if (response.result instanceof Array && response.result.length > 0){

      // Interval w/ single value
      // -------------------------------
      if (response.result[0].timeframe && (typeof response.result[0].value == "number" || response.result[0].value == null)) {
        schema = {
          collection: "result",
          select: [
            {
              path: "timeframe -> start",
              type: "date"
            },
            {
              path: "value",
              type: "number",
              format: "10",
              replace: {
                null: 0
              }
            }
          ],
          sort: {
            column: 0,
            order: 'asc'
          }
        }
      }

      // Static GroupBy
      // -------------------------------
      if (typeof response.result[0].result == "number"){
        schema = {
          collection: "result",
          select: [],
          sort: {
            column: 1,
            order: "desc"
          }
        };
        for (var key in response.result[0]){
          if (response.result[0].hasOwnProperty(key) && key !== "result"){
            schema.select.push({
              path: key,
              type: "string"
            });
            break;
          }
        }
        schema.select.push({
          path: "result",
          type: "number"
        });
      }

      // Grouped Interval
      // -------------------------------
      if (response.result[0].value instanceof Array){
        schema = {
          collection: "result",
          unpack: {
            index: {
              path: "timeframe -> start",
              type: "date"
            },
            value: {
              path: "value -> result",
              type: "number",
              replace: {
                null: 0
              }
            }
          },
          sort: {
            value: "desc"
          }
        }
        for (var key in response.result[0].value[0]){
          if (response.result[0].value[0].hasOwnProperty(key) && key !== "result"){
            schema.unpack.label = {
              path: "value -> " + key,
              type: "string"
            }
            break;
          }
        }
      }

      // Funnel
      // -------------------------------
      if (typeof response.result[0] == "number"){
        schema = {
          collection: "",
          unpack: {
            index: {
              path: "steps -> event_collection",
              type: "string"
            },
            value: {
              path: "result -> ",
              type: "number"
            }
          }
        }
      }

    }

    // Trim colorMapping values
    // -------------------------------
    if (self.colorMapping) {
      _each(self.colorMapping, function(v,k){
        self.colorMapping[k] = v.trim();
      });
    }

    // Apply formatting options
    // -------------------------------

    // If key:value replacement map
    if (self.labelMapping && _type(self.labelMapping) == 'Object') {

      if (schema.unpack) {
        if (schema.unpack['index']) {
          schema.unpack['index'].replace = schema.unpack['index'].replace || self.labelMapping;
        }
        if (schema.unpack['label']) {
          schema.unpack['label'].replace = schema.unpack['label'].replace || self.labelMapping;
        }
      }

      if (schema.select) {
        _each(schema.select, function(v, i){
          schema.select[i].replace = self.labelMapping;
        });
      }

    }

    dataform = new Keen.Dataform(response, schema);

    // If full replacement (post-process)
    if (self.labelMapping && _type(self.labelMapping) == 'Array') {
      if (schema.unpack && dataform.table[0].length == 2) {
        _each(dataform.table, function(row,i){
          if (i > 0 && self.labelMapping[i-1]) {
            dataform.table[i][0] = self.labelMapping[i-1];
          }
        });
      }
      if (schema.unpack && dataform.table[0].length > 2) {
        _each(dataform.table[0], function(cell,i){
          if (i > 0 && self.labelMapping[i-1]) {
            dataform.table[0][i] = self.labelMapping[i-1];
          }
        });
      }
    }

    return dataform;
  }

  function _pretty_number(_input) {
    // If it has 3 or fewer sig figs already, just return the number.
    var input = Number(_input),
        sciNo = input.toPrecision(3),
        prefix = "",
        suffixes = ["", "k", "M", "B", "T"];

    if (Number(sciNo) == input && String(input).length <= 4) {
      return String(input);
    }

    if(input >= 1 || input <= -1) {
      if(input < 0){
        //Pull off the negative side and stash that.
        input = -input;
        prefix = "-";
      }
      return prefix + recurse(input, 0);
    } else {
      return input.toPrecision(3);
    }

    function recurse(input, iteration) {
      var input = String(input);
      var split = input.split(".");
      // If there's a dot
      if(split.length > 1) {
        // Keep the left hand side only
        input = split[0];
        var rhs = split[1];
        // If the left-hand side is too short, pad until it has 3 digits
        if (input.length == 2 && rhs.length > 0) {
          // Pad with right-hand side if possible
          if (rhs.length > 0) {
            input = input + "." + rhs.charAt(0);
          }
          // Pad with zeroes if you must
          else {
            input += "0";
          }
        }
        else if (input.length == 1 && rhs.length > 0) {
          input = input + "." + rhs.charAt(0);
          // Pad with right-hand side if possible
          if(rhs.length > 1) {
            input += rhs.charAt(1);
          }
          // Pad with zeroes if you must
          else {
            input += "0";
          }
        }
      }
      var numNumerals = input.length;
      // if it has a period, then numNumerals is 1 smaller than the string length:
      if (input.split(".").length > 1) {
        numNumerals--;
      }
      if(numNumerals <= 3) {
        return String(input) + suffixes[iteration];
      }
      else {
        return recurse(Number(input) / 1000, iteration + 1);
      }
    }
  }

  function _load_script(url, cb) {
    var doc = document;
    var handler;
    var head = doc.head || doc.getElementsByTagName("head");

    // loading code borrowed directly from LABjs itself
    setTimeout(function () {
      // check if ref is still a live node list
      if ('item' in head) {
        // append_to node not yet ready
        if (!head[0]) {
          setTimeout(arguments.callee, 25);
          return;
        }
        // reassign from live node list ref to pure node ref -- avoids nasty IE bug where changes to DOM invalidate live node lists
        head = head[0];
      }
      var script = doc.createElement("script"),
      scriptdone = false;
      script.onload = script.onreadystatechange = function () {
        if ((script.readyState && script.readyState !== "complete" && script.readyState !== "loaded") || scriptdone) {
          return false;
        }
        script.onload = script.onreadystatechange = null;
        scriptdone = true;
        cb();
      };
      script.src = url;
      head.insertBefore(script, head.firstChild);
    }, 0);

    // required: shim for FF <= 3.5 not having document.readyState
    if (doc.readyState === null && doc.addEventListener) {
      doc.readyState = "loading";
      doc.addEventListener("DOMContentLoaded", handler = function () {
        doc.removeEventListener("DOMContentLoaded", handler, false);
        doc.readyState = "complete";
      }, false);
    }
  }

  Keen.Visualization.find = function(target){
    var el, match;
    if (target) {
      el = target.nodeName ? target : document.querySelector(target);
      _each(Keen.Visualization.visuals, function(visual){
        if (el == visual.el){
          match = visual;
          return false;
        }
      });
      if (match) {
        return match;
      }
      throw("Visualization not found");
    } else {
      return Keen.Visualization.visuals;
    }
  };

  // Expose utils
  _extend(Keen.utils, {
    prettyNumber: _pretty_number,
    loadScript: _load_script
  });

  // Set flag for script loading
  Keen.loaded = false;

  // Source: src/plugins/keen-googlecharts.js
  /*!
  * ----------------------
  * Keen IO Plugin
  * Data Visualization
  * ----------------------
  */

  (function(lib){
    var Keen = lib || {},
        AreaChart,
        BarChart,
        ColumnChart,
        LineChart,
        PieChart,
        Table;

    var errors = {
      "google-visualization-errors-0": "No results to visualize"
    }

    Keen.utils.loadScript("https://www.google.com/jsapi", function() {
      if(typeof google === 'undefined'){
        throw new Error("Problem loading Google Charts library. Please contact us!");
      } else {
        google.load('visualization', '1.1', {
            packages: ['corechart', 'table'],
            callback: function(){
              Keen.loaded = true;
              Keen.trigger('ready');
            }
        });
      }
    });

    function handleErrors(stack){
      var message = errors[stack['id']] || stack['message'] || "An error occurred";
      this.trigger('error', message);
    }

    function handleRemoval(){
      var self = this;
      google.visualization.events.removeAllListeners(self._chart);
      self._chart.clearChart();
    }


    // Create chart types
    // -------------------------------

    AreaChart = Keen.Visualization.extend({
      initialize: function(){
        this.render();
      },
      render: function(){
        var self = this;
        self._chart = self._chart || new google.visualization.AreaChart(self.el);
        google.visualization.events.addListener(self._chart, 'error', function(stack){
          handleErrors.call(self, stack);
        });
        this.update();
      },
      update: function(){
        this.remove();
        var data = google.visualization.arrayToDataTable(this.data.table);
        var options = Keen.utils.extend(this.chartOptions, {
          title: this.title || '',
          height: parseInt(this.height),
          width: parseInt(this.width),
          colors: this.colors
        });
        this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });

    BarChart = Keen.Visualization.extend({
      initialize: function(){
        this.render();
      },
      render: function(){
        var self = this;
        self._chart = self._chart || new google.visualization.BarChart(self.el);
        google.visualization.events.addListener(self._chart, 'error', function(stack){
          handleErrors.call(self, stack);
        });
        self.update();
      },
      update: function(){
        this.remove();
        var data = google.visualization.arrayToDataTable(this.data.table);
        var options = Keen.utils.extend(this.chartOptions, {
          title: this.title || '',
          height: parseInt(this.height),
          width: parseInt(this.width),
          colors: this.colors
        });
        this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });

    ColumnChart = Keen.Visualization.extend({
      initialize: function(){
        this.render();
      },
      render: function(){
        var self = this;
        self._chart = self._chart || new google.visualization.ColumnChart(self.el);
        google.visualization.events.addListener(self._chart, 'error', function(stack){
          handleErrors.call(self, stack);
        });
        self.update();
      },
      update: function(){
        this.remove();
        var data = google.visualization.arrayToDataTable(this.data.table);
        var options = Keen.utils.extend(this.chartOptions, {
          title: this.title || '',
          height: parseInt(this.height),
          width: parseInt(this.width),
          colors: this.colors
        });
        this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });

    LineChart = Keen.Visualization.extend({
      initialize: function(){
        this.render();
      },
      render: function(){
        var self = this;
        self._chart = self._chart || new google.visualization.LineChart(self.el);
        google.visualization.events.addListener(self._chart, 'error', function(stack){
          handleErrors.call(self, stack);
        });
        self.update();
      },
      update: function(){
        this.remove();
        var data = google.visualization.arrayToDataTable(this.data.table);
        var options = Keen.utils.extend(this.chartOptions, {
          title: this.title || '',
          height: parseInt(this.height),
          width: parseInt(this.width),
          colors: this.colors
        });
        this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });

    PieChart = Keen.Visualization.extend({
      initialize: function(){
        this.render();
      },
      render: function(){
        var self = this;
        self._chart = self._chart || new google.visualization.PieChart(self.el);
        google.visualization.events.addListener(self._chart, 'error', function(stack){
          handleErrors.call(self, stack);
        });
        self.update();
      },
      update: function(){
        this.remove();
        var data = google.visualization.arrayToDataTable(this.data.table);
        var options = Keen.utils.extend(this.chartOptions, {
          title: this.title || '',
          height: parseInt(this.height),
          width: parseInt(this.width),
          colors: this.colors
        });
        this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });

    Table = Keen.Visualization.extend({
      initialize: function(){
        this.render();
      },
      render: function(){
        var self = this;
        self._chart = self._chart || new google.visualization.Table(self.el);
        google.visualization.events.addListener(self._chart, 'error', function(stack){
          handleErrors.call(self, stack);
        });
        self.update();
      },
      update: function(){
        this.remove();
        var data = google.visualization.arrayToDataTable(this.data.table);
        var options = Keen.utils.extend(this.chartOptions, {
          title: this.title || '',
          height: parseInt(this.height),
          width: parseInt(this.width),
          colors: this.colors
        });
        this._chart.draw(data, options);
      },
      remove: function(){
        handleRemoval.call(this);
      }
    });


    // Register library + types
    // -------------------------------

    Keen.Visualization.register('google', {
      'areachart'   : AreaChart,
      'barchart'    : BarChart,
      'columnchart' : ColumnChart,
      'linechart'   : LineChart,
      'piechart'    : PieChart,
      'table'       : Table
    });

  })(Keen);

  // Source: src/plugins/keen-widgets.js
  /*!
  * ----------------------
  * Keen IO Plugin
  * Data Visualization
  * ----------------------
  */

  (function(lib){
    var Keen = lib || {},
        Metric;

    Metric = Keen.Visualization.extend({
      initialize: function(){
        var css = document.createElement("style"),
            bgDefault = "#49c5b1";

        css.id = "keen-widgets";
        css.type = "text/css";
        css.innerHTML = "\
    .keen-metric { \n  background: " + bgDefault + "; \n  border-radius: 4px; \n  color: #fff; \n  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; \n  padding: 10px 0; \n  text-align: center; \n} \
    .keen-metric-value { \n  display: block; \n  font-size: 84px; \n  font-weight: 700; \n  line-height: 84px; \n} \
    .keen-metric-title { \n  display: block; \n  font-size: 24px; \n  font-weight: 200; \n}";
        if (!document.getElementById(css.id)) {
          document.body.appendChild(css);
        }
        this.render();
      },

      render: function(){
        var bgColor = (this.colors.length == 1) ? this.colors[0] : "#49c5b1",
            prefix = "",
            suffix = "",
            title = this.title || "Result",
            value = this.data.table[1],
            width = parseInt(this.width);

        if (this.chartOptions['prefix']) {
          prefix = '<span class="keen-metric-prefix">' + this.chartOptions['prefix'] + '</span>';
        }
        if (this.chartOptions['suffix']) {
          suffix = '<span class="keen-metric-suffix">' + this.chartOptions['suffix'] + '</span>';
        }

        this.el.innerHTML = '' +
          '<div class="keen-widget keen-metric" style="background-color: ' + bgColor + '; width:' + width + 'px;">' +
            '<span class="keen-metric-value">' + prefix + value + suffix + '</span>' +
            '<span class="keen-metric-title">' + title + '</span>' +
          '</div>';
      }
    });

    Keen.Visualization.register('keen-io', {
      'metric': Metric
    });

  })(Keen);

  // Source: src/async.js
  /*!
  * ----------------------
  * Keen IO Plugin
  * Async Loader
  * ----------------------
  */

  var loaded = window['Keen'],
      cached = window['_' + 'Keen'] || {},
      clients,
      ready;

  if (loaded && cached) {
    clients = cached['clients'] || {},
    ready = cached['ready'] || [];

    for (var instance in clients) {
      if (clients.hasOwnProperty(instance)) {
        var client = clients[instance];

        // Map methods to existing instances
        for (var method in Keen.prototype) {
          if (Keen.prototype.hasOwnProperty(method)) {
            loaded.prototype[method] = Keen.prototype[method];
          }
        }

        // Map additional methods as necessary
        loaded.Query = (Keen.Query) ? Keen.Query : function(){};
        loaded.Visualization = (Keen.Visualization) ? Keen.Visualization : function(){};

        // Run Configuration
        if (client._config) {
          client.configure.call(client, client._config);
          delete client._config;
        }

        // Add Global Properties
        if (client._setGlobalProperties) {
          var globals = client._setGlobalProperties;
          for (var i = 0; i < globals.length; i++) {
            client.setGlobalProperties.apply(client, globals[i]);
          }
          delete client._setGlobalProperties;
        }

        // Send Queued Events
        if (client._addEvent) {
          var queue = client._addEvent || [];
          for (var i = 0; i < queue.length; i++) {
            client.addEvent.apply(client, queue[i]);
          }
          delete client._addEvent;
        }

        // Create "on" Events
        var callback = client._on || [];
        if (client._on) {
          for (var i = 0; i < callback.length; i++) {
            client.on.apply(client, callback[i]);
          }
          client.trigger('ready');
          delete client._on;
        }

      }
    }

    for (var i = 0; i < ready.length; i++) {
      var callback = ready[i];
      Keen.once('ready', function(){
        callback();
      });
    };
  }

  // Source: src/_outro.js

  // ----------------------
  // Utility Methods
  // ----------------------

  if (Keen.loaded) {
    setTimeout(function(){
      Keen.utils.domready(function(){
        Keen.trigger('ready');
      });
    }, 0);
  }

  return Keen;
});

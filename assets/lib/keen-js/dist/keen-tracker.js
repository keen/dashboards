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

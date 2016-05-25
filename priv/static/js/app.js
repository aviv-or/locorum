(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var _cmp = 'components/';
  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf(_cmp) === 0) {
        start = _cmp.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return _cmp + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
(function() {
    var global = window;
    var __shims = {assert: ({}),buffer: ({}),child_process: ({}),cluster: ({}),crypto: ({}),dgram: ({}),dns: ({}),events: ({}),fs: ({}),http: ({}),https: ({}),net: ({}),os: ({}),path: ({}),punycode: ({}),querystring: ({}),readline: ({}),repl: ({}),string_decoder: ({}),tls: ({}),tty: ({}),url: ({}),util: ({}),vm: ({}),zlib: ({}),process: ({"env":{}})};
    var process = __shims.process;

    var __makeRequire = function(r, __brmap) {
      return function(name) {
        if (__brmap[name] !== undefined) name = __brmap[name];
        name = name.replace(".js", "");
        return ["assert","buffer","child_process","cluster","crypto","dgram","dns","events","fs","http","https","net","os","path","punycode","querystring","readline","repl","string_decoder","tls","tty","url","util","vm","zlib","process"].indexOf(name) === -1 ? r(name) : __shims[name];
      }
    };
  require.register('phoenix', function(exports,req,module){
    var require = __makeRequire((function(n) { return req(n.replace('./', 'phoenix/')); }), {});
    (function(exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Phoenix Channels JavaScript client
//
// ## Socket Connection
//
// A single connection is established to the server and
// channels are mulitplexed over the connection.
// Connect to the server using the `Socket` class:
//
//     let socket = new Socket("/ws", {params: {userToken: "123"}})
//     socket.connect()
//
// The `Socket` constructor takes the mount point of the socket,
// the authentication params, as well as options that can be found in
// the Socket docs, such as configuring the `LongPoll` transport, and
// heartbeat.
//
// ## Channels
//
// Channels are isolated, concurrent processes on the server that
// subscribe to topics and broker events between the client and server.
// To join a channel, you must provide the topic, and channel params for
// authorization. Here's an example chat room example where `"new_msg"`
// events are listened for, messages are pushed to the server, and
// the channel is joined with ok/error/timeout matches:
//
//     let channel = socket.channel("rooms:123", {token: roomToken})
//     channel.on("new_msg", msg => console.log("Got message", msg) )
//     $input.onEnter( e => {
//       channel.push("new_msg", {body: e.target.val}, 10000)
//        .receive("ok", (msg) => console.log("created message", msg) )
//        .receive("error", (reasons) => console.log("create failed", reasons) )
//        .receive("timeout", () => console.log("Networking issue...") )
//     })
//     channel.join()
//       .receive("ok", ({messages}) => console.log("catching up", messages) )
//       .receive("error", ({reason}) => console.log("failed join", reason) )
//       .receive("timeout", () => console.log("Networking issue. Still waiting...") )
//
//
// ## Joining
//
// Creating a channel with `socket.channel(topic, params)`, binds the params to
// `channel.params`, which are sent up on `channel.join()`.
// Subsequent rejoins will send up the modified params for
// updating authorization params, or passing up last_message_id information.
// Successful joins receive an "ok" status, while unsuccessful joins
// receive "error".
//
//
// ## Pushing Messages
//
// From the previous example, we can see that pushing messages to the server
// can be done with `channel.push(eventName, payload)` and we can optionally
// receive responses from the push. Additionally, we can use
// `receive("timeout", callback)` to abort waiting for our other `receive` hooks
//  and take action after some period of waiting. The default timeout is 5000ms.
//
//
// ## Socket Hooks
//
// Lifecycle events of the multiplexed connection can be hooked into via
// `socket.onError()` and `socket.onClose()` events, ie:
//
//     socket.onError( () => console.log("there was an error with the connection!") )
//     socket.onClose( () => console.log("the connection dropped") )
//
//
// ## Channel Hooks
//
// For each joined channel, you can bind to `onError` and `onClose` events
// to monitor the channel lifecycle, ie:
//
//     channel.onError( () => console.log("there was an error!") )
//     channel.onClose( () => console.log("the channel has gone away gracefully") )
//
// ### onError hooks
//
// `onError` hooks are invoked if the socket connection drops, or the channel
// crashes on the server. In either case, a channel rejoin is attemtped
// automatically in an exponential backoff manner.
//
// ### onClose hooks
//
// `onClose` hooks are invoked only in two cases. 1) the channel explicitly
// closed on the server, or 2). The client explicitly closed, by calling
// `channel.leave()`
//

var VSN = "1.0.0";
var SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 };
var DEFAULT_TIMEOUT = 10000;
var CHANNEL_STATES = {
  closed: "closed",
  errored: "errored",
  joined: "joined",
  joining: "joining"
};
var CHANNEL_EVENTS = {
  close: "phx_close",
  error: "phx_error",
  join: "phx_join",
  reply: "phx_reply",
  leave: "phx_leave"
};
var TRANSPORTS = {
  longpoll: "longpoll",
  websocket: "websocket"
};

var Push = function () {

  // Initializes the Push
  //
  // channel - The Channel
  // event - The event, for example `"phx_join"`
  // payload - The payload, for example `{user_id: 123}`
  // timeout - The push timeout in milliseconds
  //

  function Push(channel, event, payload, timeout) {
    _classCallCheck(this, Push);

    this.channel = channel;
    this.event = event;
    this.payload = payload || {};
    this.receivedResp = null;
    this.timeout = timeout;
    this.timeoutTimer = null;
    this.recHooks = [];
    this.sent = false;
  }

  _createClass(Push, [{
    key: "resend",
    value: function resend(timeout) {
      this.timeout = timeout;
      this.cancelRefEvent();
      this.ref = null;
      this.refEvent = null;
      this.receivedResp = null;
      this.sent = false;
      this.send();
    }
  }, {
    key: "send",
    value: function send() {
      if (this.hasReceived("timeout")) {
        return;
      }
      this.startTimeout();
      this.sent = true;
      this.channel.socket.push({
        topic: this.channel.topic,
        event: this.event,
        payload: this.payload,
        ref: this.ref
      });
    }
  }, {
    key: "receive",
    value: function receive(status, callback) {
      if (this.hasReceived(status)) {
        callback(this.receivedResp.response);
      }

      this.recHooks.push({ status: status, callback: callback });
      return this;
    }

    // private

  }, {
    key: "matchReceive",
    value: function matchReceive(_ref) {
      var status = _ref.status;
      var response = _ref.response;
      var ref = _ref.ref;

      this.recHooks.filter(function (h) {
        return h.status === status;
      }).forEach(function (h) {
        return h.callback(response);
      });
    }
  }, {
    key: "cancelRefEvent",
    value: function cancelRefEvent() {
      if (!this.refEvent) {
        return;
      }
      this.channel.off(this.refEvent);
    }
  }, {
    key: "cancelTimeout",
    value: function cancelTimeout() {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }, {
    key: "startTimeout",
    value: function startTimeout() {
      var _this = this;

      if (this.timeoutTimer) {
        return;
      }
      this.ref = this.channel.socket.makeRef();
      this.refEvent = this.channel.replyEventName(this.ref);

      this.channel.on(this.refEvent, function (payload) {
        _this.cancelRefEvent();
        _this.cancelTimeout();
        _this.receivedResp = payload;
        _this.matchReceive(payload);
      });

      this.timeoutTimer = setTimeout(function () {
        _this.trigger("timeout", {});
      }, this.timeout);
    }
  }, {
    key: "hasReceived",
    value: function hasReceived(status) {
      return this.receivedResp && this.receivedResp.status === status;
    }
  }, {
    key: "trigger",
    value: function trigger(status, response) {
      this.channel.trigger(this.refEvent, { status: status, response: response });
    }
  }]);

  return Push;
}();

var Channel = exports.Channel = function () {
  function Channel(topic, params, socket) {
    var _this2 = this;

    _classCallCheck(this, Channel);

    this.state = CHANNEL_STATES.closed;
    this.topic = topic;
    this.params = params || {};
    this.socket = socket;
    this.bindings = [];
    this.timeout = this.socket.timeout;
    this.joinedOnce = false;
    this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
    this.pushBuffer = [];
    this.rejoinTimer = new Timer(function () {
      return _this2.rejoinUntilConnected();
    }, this.socket.reconnectAfterMs);
    this.joinPush.receive("ok", function () {
      _this2.state = CHANNEL_STATES.joined;
      _this2.rejoinTimer.reset();
      _this2.pushBuffer.forEach(function (pushEvent) {
        return pushEvent.send();
      });
      _this2.pushBuffer = [];
    });
    this.onClose(function () {
      _this2.socket.log("channel", "close " + _this2.topic);
      _this2.state = CHANNEL_STATES.closed;
      _this2.socket.remove(_this2);
    });
    this.onError(function (reason) {
      _this2.socket.log("channel", "error " + _this2.topic, reason);
      _this2.state = CHANNEL_STATES.errored;
      _this2.rejoinTimer.scheduleTimeout();
    });
    this.joinPush.receive("timeout", function () {
      if (_this2.state !== CHANNEL_STATES.joining) {
        return;
      }

      _this2.socket.log("channel", "timeout " + _this2.topic, _this2.joinPush.timeout);
      _this2.state = CHANNEL_STATES.errored;
      _this2.rejoinTimer.scheduleTimeout();
    });
    this.on(CHANNEL_EVENTS.reply, function (payload, ref) {
      _this2.trigger(_this2.replyEventName(ref), payload);
    });
  }

  _createClass(Channel, [{
    key: "rejoinUntilConnected",
    value: function rejoinUntilConnected() {
      this.rejoinTimer.scheduleTimeout();
      if (this.socket.isConnected()) {
        this.rejoin();
      }
    }
  }, {
    key: "join",
    value: function join() {
      var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];

      if (this.joinedOnce) {
        throw "tried to join multiple times. 'join' can only be called a single time per channel instance";
      } else {
        this.joinedOnce = true;
      }
      this.rejoin(timeout);
      return this.joinPush;
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.on(CHANNEL_EVENTS.close, callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.on(CHANNEL_EVENTS.error, function (reason) {
        return callback(reason);
      });
    }
  }, {
    key: "on",
    value: function on(event, callback) {
      this.bindings.push({ event: event, callback: callback });
    }
  }, {
    key: "off",
    value: function off(event) {
      this.bindings = this.bindings.filter(function (bind) {
        return bind.event !== event;
      });
    }
  }, {
    key: "canPush",
    value: function canPush() {
      return this.socket.isConnected() && this.state === CHANNEL_STATES.joined;
    }
  }, {
    key: "push",
    value: function push(event, payload) {
      var timeout = arguments.length <= 2 || arguments[2] === undefined ? this.timeout : arguments[2];

      if (!this.joinedOnce) {
        throw "tried to push '" + event + "' to '" + this.topic + "' before joining. Use channel.join() before pushing events";
      }
      var pushEvent = new Push(this, event, payload, timeout);
      if (this.canPush()) {
        pushEvent.send();
      } else {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
      }

      return pushEvent;
    }

    // Leaves the channel
    //
    // Unsubscribes from server events, and
    // instructs channel to terminate on server
    //
    // Triggers onClose() hooks
    //
    // To receive leave acknowledgements, use the a `receive`
    // hook to bind to the server ack, ie:
    //
    //     channel.leave().receive("ok", () => alert("left!") )
    //

  }, {
    key: "leave",
    value: function leave() {
      var _this3 = this;

      var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];

      var onClose = function onClose() {
        _this3.socket.log("channel", "leave " + _this3.topic);
        _this3.trigger(CHANNEL_EVENTS.close, "leave");
      };
      var leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
      leavePush.receive("ok", function () {
        return onClose();
      }).receive("timeout", function () {
        return onClose();
      });
      leavePush.send();
      if (!this.canPush()) {
        leavePush.trigger("ok", {});
      }

      return leavePush;
    }

    // Overridable message hook
    //
    // Receives all events for specialized message handling

  }, {
    key: "onMessage",
    value: function onMessage(event, payload, ref) {}

    // private

  }, {
    key: "isMember",
    value: function isMember(topic) {
      return this.topic === topic;
    }
  }, {
    key: "sendJoin",
    value: function sendJoin(timeout) {
      this.state = CHANNEL_STATES.joining;
      this.joinPush.resend(timeout);
    }
  }, {
    key: "rejoin",
    value: function rejoin() {
      var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];
      this.sendJoin(timeout);
    }
  }, {
    key: "trigger",
    value: function trigger(triggerEvent, payload, ref) {
      this.onMessage(triggerEvent, payload, ref);
      this.bindings.filter(function (bind) {
        return bind.event === triggerEvent;
      }).map(function (bind) {
        return bind.callback(payload, ref);
      });
    }
  }, {
    key: "replyEventName",
    value: function replyEventName(ref) {
      return "chan_reply_" + ref;
    }
  }]);

  return Channel;
}();

var Socket = exports.Socket = function () {

  // Initializes the Socket
  //
  // endPoint - The string WebSocket endpoint, ie, "ws://example.com/ws",
  //                                               "wss://example.com"
  //                                               "/ws" (inherited host & protocol)
  // opts - Optional configuration
  //   transport - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
  //               Defaults to WebSocket with automatic LongPoll fallback.
  //   timeout - The default timeout in milliseconds to trigger push timeouts.
  //             Defaults `DEFAULT_TIMEOUT`
  //   heartbeatIntervalMs - The millisec interval to send a heartbeat message
  //   reconnectAfterMs - The optional function that returns the millsec
  //                      reconnect interval. Defaults to stepped backoff of:
  //
  //     function(tries){
  //       return [1000, 5000, 10000][tries - 1] || 10000
  //     }
  //
  //   logger - The optional function for specialized logging, ie:
  //     `logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
  //
  //   longpollerTimeout - The maximum timeout of a long poll AJAX request.
  //                        Defaults to 20s (double the server long poll timer).
  //
  //   params - The optional params to pass when connecting
  //
  // For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
  //

  function Socket(endPoint) {
    var _this4 = this;

    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Socket);

    this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] };
    this.channels = [];
    this.sendBuffer = [];
    this.ref = 0;
    this.timeout = opts.timeout || DEFAULT_TIMEOUT;
    this.transport = opts.transport || window.WebSocket || LongPoll;
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 30000;
    this.reconnectAfterMs = opts.reconnectAfterMs || function (tries) {
      return [1000, 2000, 5000, 10000][tries - 1] || 10000;
    };
    this.logger = opts.logger || function () {}; // noop
    this.longpollerTimeout = opts.longpollerTimeout || 20000;
    this.params = opts.params || {};
    this.endPoint = endPoint + "/" + TRANSPORTS.websocket;
    this.reconnectTimer = new Timer(function () {
      _this4.disconnect(function () {
        return _this4.connect();
      });
    }, this.reconnectAfterMs);
  }

  _createClass(Socket, [{
    key: "protocol",
    value: function protocol() {
      return location.protocol.match(/^https/) ? "wss" : "ws";
    }
  }, {
    key: "endPointURL",
    value: function endPointURL() {
      var uri = Ajax.appendParams(Ajax.appendParams(this.endPoint, this.params), { vsn: VSN });
      if (uri.charAt(0) !== "/") {
        return uri;
      }
      if (uri.charAt(1) === "/") {
        return this.protocol() + ":" + uri;
      }

      return this.protocol() + "://" + location.host + uri;
    }
  }, {
    key: "disconnect",
    value: function disconnect(callback, code, reason) {
      if (this.conn) {
        this.conn.onclose = function () {}; // noop
        if (code) {
          this.conn.close(code, reason || "");
        } else {
          this.conn.close();
        }
        this.conn = null;
      }
      callback && callback();
    }

    // params - The params to send when connecting, for example `{user_id: userToken}`

  }, {
    key: "connect",
    value: function connect(params) {
      var _this5 = this;

      if (params) {
        console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor");
        this.params = params;
      }
      if (this.conn) {
        return;
      }

      this.conn = new this.transport(this.endPointURL());
      this.conn.timeout = this.longpollerTimeout;
      this.conn.onopen = function () {
        return _this5.onConnOpen();
      };
      this.conn.onerror = function (error) {
        return _this5.onConnError(error);
      };
      this.conn.onmessage = function (event) {
        return _this5.onConnMessage(event);
      };
      this.conn.onclose = function (event) {
        return _this5.onConnClose(event);
      };
    }

    // Logs the message. Override `this.logger` for specialized logging. noops by default

  }, {
    key: "log",
    value: function log(kind, msg, data) {
      this.logger(kind, msg, data);
    }

    // Registers callbacks for connection state change events
    //
    // Examples
    //
    //    socket.onError(function(error){ alert("An error occurred") })
    //

  }, {
    key: "onOpen",
    value: function onOpen(callback) {
      this.stateChangeCallbacks.open.push(callback);
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.stateChangeCallbacks.close.push(callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.stateChangeCallbacks.error.push(callback);
    }
  }, {
    key: "onMessage",
    value: function onMessage(callback) {
      this.stateChangeCallbacks.message.push(callback);
    }
  }, {
    key: "onConnOpen",
    value: function onConnOpen() {
      var _this6 = this;

      this.log("transport", "connected to " + this.endPointURL(), this.transport.prototype);
      this.flushSendBuffer();
      this.reconnectTimer.reset();
      if (!this.conn.skipHeartbeat) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(function () {
          return _this6.sendHeartbeat();
        }, this.heartbeatIntervalMs);
      }
      this.stateChangeCallbacks.open.forEach(function (callback) {
        return callback();
      });
    }
  }, {
    key: "onConnClose",
    value: function onConnClose(event) {
      this.log("transport", "close", event);
      this.triggerChanError();
      clearInterval(this.heartbeatTimer);
      this.reconnectTimer.scheduleTimeout();
      this.stateChangeCallbacks.close.forEach(function (callback) {
        return callback(event);
      });
    }
  }, {
    key: "onConnError",
    value: function onConnError(error) {
      this.log("transport", error);
      this.triggerChanError();
      this.stateChangeCallbacks.error.forEach(function (callback) {
        return callback(error);
      });
    }
  }, {
    key: "triggerChanError",
    value: function triggerChanError() {
      this.channels.forEach(function (channel) {
        return channel.trigger(CHANNEL_EVENTS.error);
      });
    }
  }, {
    key: "connectionState",
    value: function connectionState() {
      switch (this.conn && this.conn.readyState) {
        case SOCKET_STATES.connecting:
          return "connecting";
        case SOCKET_STATES.open:
          return "open";
        case SOCKET_STATES.closing:
          return "closing";
        default:
          return "closed";
      }
    }
  }, {
    key: "isConnected",
    value: function isConnected() {
      return this.connectionState() === "open";
    }
  }, {
    key: "remove",
    value: function remove(channel) {
      this.channels = this.channels.filter(function (c) {
        return !c.isMember(channel.topic);
      });
    }
  }, {
    key: "channel",
    value: function channel(topic) {
      var chanParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var chan = new Channel(topic, chanParams, this);
      this.channels.push(chan);
      return chan;
    }
  }, {
    key: "push",
    value: function push(data) {
      var _this7 = this;

      var topic = data.topic;
      var event = data.event;
      var payload = data.payload;
      var ref = data.ref;

      var callback = function callback() {
        return _this7.conn.send(JSON.stringify(data));
      };
      this.log("push", topic + " " + event + " (" + ref + ")", payload);
      if (this.isConnected()) {
        callback();
      } else {
        this.sendBuffer.push(callback);
      }
    }

    // Return the next message ref, accounting for overflows

  }, {
    key: "makeRef",
    value: function makeRef() {
      var newRef = this.ref + 1;
      if (newRef === this.ref) {
        this.ref = 0;
      } else {
        this.ref = newRef;
      }

      return this.ref.toString();
    }
  }, {
    key: "sendHeartbeat",
    value: function sendHeartbeat() {
      if (!this.isConnected()) {
        return;
      }
      this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.makeRef() });
    }
  }, {
    key: "flushSendBuffer",
    value: function flushSendBuffer() {
      if (this.isConnected() && this.sendBuffer.length > 0) {
        this.sendBuffer.forEach(function (callback) {
          return callback();
        });
        this.sendBuffer = [];
      }
    }
  }, {
    key: "onConnMessage",
    value: function onConnMessage(rawMessage) {
      var msg = JSON.parse(rawMessage.data);
      var topic = msg.topic;
      var event = msg.event;
      var payload = msg.payload;
      var ref = msg.ref;

      this.log("receive", (payload.status || "") + " " + topic + " " + event + " " + (ref && "(" + ref + ")" || ""), payload);
      this.channels.filter(function (channel) {
        return channel.isMember(topic);
      }).forEach(function (channel) {
        return channel.trigger(event, payload, ref);
      });
      this.stateChangeCallbacks.message.forEach(function (callback) {
        return callback(msg);
      });
    }
  }]);

  return Socket;
}();

var LongPoll = exports.LongPoll = function () {
  function LongPoll(endPoint) {
    _classCallCheck(this, LongPoll);

    this.endPoint = null;
    this.token = null;
    this.skipHeartbeat = true;
    this.onopen = function () {}; // noop
    this.onerror = function () {}; // noop
    this.onmessage = function () {}; // noop
    this.onclose = function () {}; // noop
    this.pollEndpoint = this.normalizeEndpoint(endPoint);
    this.readyState = SOCKET_STATES.connecting;

    this.poll();
  }

  _createClass(LongPoll, [{
    key: "normalizeEndpoint",
    value: function normalizeEndpoint(endPoint) {
      return endPoint.replace("ws://", "http://").replace("wss://", "https://").replace(new RegExp("(.*)\/" + TRANSPORTS.websocket), "$1/" + TRANSPORTS.longpoll);
    }
  }, {
    key: "endpointURL",
    value: function endpointURL() {
      return Ajax.appendParams(this.pollEndpoint, { token: this.token });
    }
  }, {
    key: "closeAndRetry",
    value: function closeAndRetry() {
      this.close();
      this.readyState = SOCKET_STATES.connecting;
    }
  }, {
    key: "ontimeout",
    value: function ontimeout() {
      this.onerror("timeout");
      this.closeAndRetry();
    }
  }, {
    key: "poll",
    value: function poll() {
      var _this8 = this;

      if (!(this.readyState === SOCKET_STATES.open || this.readyState === SOCKET_STATES.connecting)) {
        return;
      }

      Ajax.request("GET", this.endpointURL(), "application/json", null, this.timeout, this.ontimeout.bind(this), function (resp) {
        if (resp) {
          var status = resp.status;
          var token = resp.token;
          var messages = resp.messages;

          _this8.token = token;
        } else {
          var status = 0;
        }

        switch (status) {
          case 200:
            messages.forEach(function (msg) {
              return _this8.onmessage({ data: JSON.stringify(msg) });
            });
            _this8.poll();
            break;
          case 204:
            _this8.poll();
            break;
          case 410:
            _this8.readyState = SOCKET_STATES.open;
            _this8.onopen();
            _this8.poll();
            break;
          case 0:
          case 500:
            _this8.onerror();
            _this8.closeAndRetry();
            break;
          default:
            throw "unhandled poll status " + status;
        }
      });
    }
  }, {
    key: "send",
    value: function send(body) {
      var _this9 = this;

      Ajax.request("POST", this.endpointURL(), "application/json", body, this.timeout, this.onerror.bind(this, "timeout"), function (resp) {
        if (!resp || resp.status !== 200) {
          _this9.onerror(status);
          _this9.closeAndRetry();
        }
      });
    }
  }, {
    key: "close",
    value: function close(code, reason) {
      this.readyState = SOCKET_STATES.closed;
      this.onclose();
    }
  }]);

  return LongPoll;
}();

var Ajax = exports.Ajax = function () {
  function Ajax() {
    _classCallCheck(this, Ajax);
  }

  _createClass(Ajax, null, [{
    key: "request",
    value: function request(method, endPoint, accept, body, timeout, ontimeout, callback) {
      if (window.XDomainRequest) {
        var req = new XDomainRequest(); // IE8, IE9
        this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback);
      } else {
        var req = window.XMLHttpRequest ? new XMLHttpRequest() : // IE7+, Firefox, Chrome, Opera, Safari
        new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
        this.xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback);
      }
    }
  }, {
    key: "xdomainRequest",
    value: function xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback) {
      var _this10 = this;

      req.timeout = timeout;
      req.open(method, endPoint);
      req.onload = function () {
        var response = _this10.parseJSON(req.responseText);
        callback && callback(response);
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      // Work around bug in IE9 that requires an attached onprogress handler
      req.onprogress = function () {};

      req.send(body);
    }
  }, {
    key: "xhrRequest",
    value: function xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback) {
      var _this11 = this;

      req.timeout = timeout;
      req.open(method, endPoint, true);
      req.setRequestHeader("Content-Type", accept);
      req.onerror = function () {
        callback && callback(null);
      };
      req.onreadystatechange = function () {
        if (req.readyState === _this11.states.complete && callback) {
          var response = _this11.parseJSON(req.responseText);
          callback(response);
        }
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      req.send(body);
    }
  }, {
    key: "parseJSON",
    value: function parseJSON(resp) {
      return resp && resp !== "" ? JSON.parse(resp) : null;
    }
  }, {
    key: "serialize",
    value: function serialize(obj, parentKey) {
      var queryStr = [];
      for (var key in obj) {
        if (!obj.hasOwnProperty(key)) {
          continue;
        }
        var paramKey = parentKey ? parentKey + "[" + key + "]" : key;
        var paramVal = obj[key];
        if ((typeof paramVal === "undefined" ? "undefined" : _typeof(paramVal)) === "object") {
          queryStr.push(this.serialize(paramVal, paramKey));
        } else {
          queryStr.push(encodeURIComponent(paramKey) + "=" + encodeURIComponent(paramVal));
        }
      }
      return queryStr.join("&");
    }
  }, {
    key: "appendParams",
    value: function appendParams(url, params) {
      if (Object.keys(params).length === 0) {
        return url;
      }

      var prefix = url.match(/\?/) ? "&" : "?";
      return "" + url + prefix + this.serialize(params);
    }
  }]);

  return Ajax;
}();

Ajax.states = { complete: 4 };

// Creates a timer that accepts a `timerCalc` function to perform
// calculated timeout retries, such as exponential backoff.
//
// ## Examples
//
//    let reconnectTimer = new Timer(() => this.connect(), function(tries){
//      return [1000, 5000, 10000][tries - 1] || 10000
//    })
//    reconnectTimer.scheduleTimeout() // fires after 1000
//    reconnectTimer.scheduleTimeout() // fires after 5000
//    reconnectTimer.reset()
//    reconnectTimer.scheduleTimeout() // fires after 1000
//

var Timer = function () {
  function Timer(callback, timerCalc) {
    _classCallCheck(this, Timer);

    this.callback = callback;
    this.timerCalc = timerCalc;
    this.timer = null;
    this.tries = 0;
  }

  _createClass(Timer, [{
    key: "reset",
    value: function reset() {
      this.tries = 0;
      clearTimeout(this.timer);
    }

    // Cancels any previous scheduleTimeout and schedules callback

  }, {
    key: "scheduleTimeout",
    value: function scheduleTimeout() {
      var _this12 = this;

      clearTimeout(this.timer);

      this.timer = setTimeout(function () {
        _this12.tries = _this12.tries + 1;
        _this12.callback();
      }, this.timerCalc(this.tries + 1));
    }
  }]);

  return Timer;
}();


})(typeof(exports) === "undefined" ? window.Phoenix = window.Phoenix || {} : exports);

  });
require.register('phoenix_html', function(exports,req,module){
    var require = __makeRequire((function(n) { return req(n.replace('./', 'phoenix_html/')); }), {});
    'use strict';

// Although ^=parent is not technically correct,
// we need to use it in order to get IE8 support.
var elements = document.querySelectorAll('[data-submit^=parent]');
var len = elements.length;

for (var i = 0; i < len; ++i) {
  elements[i].addEventListener('click', function (event) {
    var message = this.getAttribute("data-confirm");
    if (message === null || confirm(message)) {
      this.parentNode.submit();
    };
    event.preventDefault();
    return false;
  }, false);
}

;
  });
})();require.register("web/static/js/app", function(exports, require, module) {
"use strict";

require("phoenix_html");

var _socket = require("./socket");

var _socket2 = _interopRequireDefault(_socket);

var _results = require("./results");

var _results2 = _interopRequireDefault(_results);

var _project = require("./project");

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".


_results2.default.init(_socket2.default, document.getElementById("results"));

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

_project2.default.init(_socket2.default, document.getElementById("searches"));
});

;require.register("web/static/js/project", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Project = {
  init: function init(socket, element) {
    if (!element) {
      return;
    }
    var projectId = element.getAttribute("data-id");
    socket.connect();
    this.onReady(projectId, socket);
  },
  onReady: function onReady(projectId, socket) {
    var _this = this;

    var searchesContainer = document.getElementById("searches");
    var runProjectSearch = document.getElementById("run-search");
    var runSingleSearch = document.getElementsByClassName("run-single-search");
    var dropdownTitle = document.getElementsByClassName("dropdown-menu-title");
    var loadingStatus = document.getElementsByClassName("load-status");
    var projectChannel = socket.channel("projects:" + projectId);

    runProjectSearch.addEventListener("click", function (e) {
      _this.showWebsiteDropdown(dropdownTitle);
      _this.prepOverviews();
      _this.clearAndPrepAllResults();
      projectChannel.push("run_test").receive("error", function (e) {
        return console.log(e);
      });
    });

    Array.prototype.forEach.call(runSingleSearch, function (button) {
      button.addEventListener("click", function (e) {
        var search_id = button.getAttribute("data-id");
        var payload = { search_id: search_id };
        Project.clearAndPrepSingleResult(search_id);
        projectChannel.push("run_single_test", payload).receive("error", function (e) {
          return console.log(e);
        });
      });
    });

    projectChannel.on("backend", function (resp) {
      var loadedOf = document.getElementById("search-" + _this.esc(resp.search_id) + "-of");
      loadedOf.innerHTML = parseInt(loadedOf.innerHTML) + 1;

      _this.renderBackend(resp);
    });

    projectChannel.on("result", function (resp) {
      _this.renderResult(resp);
    });

    projectChannel.on("no_result", function (resp) {
      _this.renderNoResult(resp);
    });

    projectChannel.on("loaded_results", function (resp) {
      var loaded = document.getElementById("search-" + _this.esc(resp.search_id) + "-loaded");
      var loadedOf = document.getElementById("search-" + _this.esc(resp.search_id) + "-of");
      var loadStatsContainer = document.getElementById("load-status-" + _this.esc(resp.search_id));
      loaded.innerHTML = parseInt(loaded.innerHTML) + 1;
      if (loaded.innerHTML == loadedOf.innerHTML) {
        loadStatsContainer.setAttribute("class", "text-success load-status");

        loadStatsContainer.innerHTML = "Loaded all " + loaded.innerHTML + " backends";
      }
      _this.renderTally(resp);
    });

    projectChannel.join().receive("ok", function (resp) {
      return console.log("Joined project channel", resp);
    }).receive("error", function (resp) {
      return console.log("Failed to join project channel", resp);
    });
  },
  clearAndPrepAllResults: function clearAndPrepAllResults() {
    var dropdownElements = document.getElementsByClassName("backend-titles");
    var tabContentElements = document.getElementsByClassName("backend-content");
    var overviewElements = document.getElementsByClassName("search-result-tabs");
    var loadStatusElements = document.getElementsByClassName("load-status");

    Array.prototype.forEach.call(dropdownElements, function (elem) {
      elem.innerHTML = "";
    });
    Array.prototype.forEach.call(tabContentElements, function (elem) {
      var overviewTab = elem.children[0];
      overviewTab.setAttribute("class", "tab-pane fade in active overview");
      elem.innerHTML = "";
      elem.appendChild(overviewTab);
    });
    Array.prototype.forEach.call(overviewElements, function (elem) {
      elem.children[0].setAttribute("class", "active");
      elem.children[1].setAttribute("class", "dropdown");
    });

    Array.prototype.forEach.call(loadStatusElements, function (elem) {
      var id = elem.getAttribute("id").split(/[\s-]+/).pop();
      elem.innerHTML = "Loaded <span id=\"search-" + id + "-loaded\">0</span> of <span id=\"search-" + id + "-of\">0</span> backends";
    });
  },
  clearAndPrepSingleResult: function clearAndPrepSingleResult(search_id) {
    var dropdownElement = document.getElementById("backendDrop" + search_id + "-contents");
    var tabContentElement = document.getElementById("tab-content-" + search_id);
    var overviewElement = document.getElementById("search-result-tabs-" + search_id);
    var loadStatusElement = document.getElementById("load-status-" + search_id);

    dropdownElement.innerHTML = "";

    var overviewTab = tabContentElement.children[0];
    overviewTab.setAttribute("class", "tab-pane fade in active overview");
    tabContentElement.innerHTML = "";
    tabContentElement.appendChild(overviewTab);
    overviewTab.innerHTML = "\n    <table id=\"overview-" + search_id + "-table\" class=\"table table-hover\">\n    <tr>\n    <th>Backend</th>\n    <th>Results</th>\n    <th>High Rating</th>\n    <th>Low Rating</th>\n    </tr>\n    </table>\n    ";

    overviewElement.children[0].setAttribute("class", "active");
    overviewElement.children[1].setAttribute("class", "dropdown");

    loadStatusElement.innerHTML = "Loaded <span id=\"search-" + search_id + "-loaded\">0</span> of <span id=\"search-" + search_id + "-of\">0</span> backends";
  },
  renderBackend: function renderBackend(resp) {
    var dropMenu = document.getElementById("backendDrop" + resp.search_id + "-contents");
    var dropMenuBackend = document.createElement("li");
    dropMenuBackend.innerHTML = "\n    <a href=\"#dropdown-" + this.esc(resp.backend) + "-" + this.esc(resp.search_id) + "\" role=\"tab\" id=\"#dropdown-" + this.esc(resp.backend) + "-" + this.esc(resp.search_id) + "-tab\" data-toggle=\"tab\" aria-controls=\"#dropdown-" + this.esc(resp.backend) + "-" + this.esc(resp.search_id) + "\" aria-expanded=\"false\">" + this.esc(resp.backend_str) + " <span class=\"badge\" id=\"" + this.esc(resp.backend) + "-" + this.esc(resp.search_id) + "-badge\">0</span></a>\n    ";
    dropMenu.appendChild(dropMenuBackend);

    var tabContent = document.getElementById("tab-content-" + this.esc(resp.search_id));
    var tabContentBackend = document.createElement("div");
    tabContentBackend.setAttribute("class", "tab-pane fade");
    tabContentBackend.setAttribute("role", "tabpanel");
    tabContentBackend.setAttribute("id", "dropdown-" + this.esc(resp.backend) + "-" + this.esc(resp.search_id));
    tabContentBackend.innerHTML = "<h4>" + this.esc(resp.backend_str) + " <small><a href=\"" + this.esc(resp.results_url) + "\" target=\"_blank\" class=\"pull-right\">view results in new tab</a></small></h4>";
    tabContent.appendChild(tabContentBackend);
  },
  renderResult: function renderResult(resp) {
    var dropContent = document.getElementById("dropdown-" + this.esc(resp.backend) + "-" + this.esc(resp.search_id));
    var newContent = document.createElement("div");
    var counter = document.getElementById('id');
    newContent.setAttribute("class", "col-sm-12 col-md-6 col-lg-4");
    if (resp.url) {
      newContent.innerHTML = "\n      <div class=\"panel panel-info\">\n      <div class=\"panel-body\">\n      <b>" + this.esc(resp.biz) + "</b><br>\n      " + this.esc(resp.address) + "<br>\n      " + this.esc(resp.city) + ", " + this.esc(resp.state) + " " + this.esc(resp.zip || "") + "<br>\n      " + this.esc(resp.phone) + "<br>\n      <i>Rating: <b>" + this.esc(resp.rating) + "</b></i>\n      </div>\n      <div class=\"panel-footer\">\n      <i><a href=\"" + this.esc(resp.url) + "\" target=\"_blank\">Edit entry</a></i>\n      </div>\n      </div>";
    } else {
      newContent.innerHTML = "\n      <div class=\"panel panel-info\">\n      <div class=\"panel-body\">\n      <b>" + this.esc(resp.biz) + "</b><br>\n      " + this.esc(resp.address) + "<br>\n      " + this.esc(resp.city) + ", " + this.esc(resp.state) + " " + this.esc(resp.zip || "") + "<br>\n      " + this.esc(resp.phone) + "<br>\n      <i>Rating: <b>" + this.esc(resp.rating) + "</b></i>\n      </div>";
    }

    dropContent.appendChild(newContent);
  },
  renderTally: function renderTally(resp) {
    var badgeCounter = document.getElementById(this.esc(resp.backend) + "-" + this.esc(resp.search_id) + "-badge");
    badgeCounter.innerHTML = "" + this.esc(resp.num_results);

    var tallyContainerTable = document.getElementById("overview-" + this.esc(resp.search_id) + "-table");
    var newEntry = document.createElement("tr");
    newEntry.innerHTML = "\n    <td><a href=\"#dropdown-" + this.esc(resp.backend) + "-" + this.esc(resp.search_id) + "\" role=\"tab\" data-toggle=\"tab\" aria-controls=\"#dropdown-" + this.esc(resp.backend) + "-" + this.esc(resp.search_id) + "\">" + this.esc(resp.backend_str) + "</a></td>\n    <td>" + this.esc(resp.num_results) + "</td>\n    <td>" + this.esc(resp.high_rating || "--") + "</td>\n    <td>" + this.esc(resp.low_rating || "--") + "</td>\n    ";
    tallyContainerTable.children[0].appendChild(newEntry);

    // TODO can I write this in ES6 instead of jquery?
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      var target = this.href.split('#');
      $('.nav a').filter('a[href="#' + target[1] + '"]').tab('show');
    });
  },
  renderNoResult: function renderNoResult(resp) {
    var dropContent = document.getElementById("dropdown-" + this.esc(resp.backend) + "-" + this.esc(resp.search_id));
    var newContent = document.createElement("div");
    newContent.innerHTML = "\n    <i>No results</i>\n    ";
    dropContent.appendChild(newContent);
  },
  showWebsiteDropdown: function showWebsiteDropdown(dropdownTitle) {
    Array.prototype.forEach.call(dropdownTitle, function (elem) {
      elem.setAttribute("class", "dropdown dropdown-menu-title");
    });
  },
  prepOverviews: function prepOverviews() {
    var allOverviews = document.getElementsByClassName("overview");
    Array.prototype.forEach.call(allOverviews, function (elem) {
      var parentId = elem.getAttribute("id");
      elem.innerHTML = "\n      <table id=\"" + parentId + "-table\" class=\"table table-hover\">\n        <tr>\n          <th>Backend</th>\n          <th>Results</th>\n          <th>High Rating</th>\n          <th>Low Rating</th>\n        </tr>\n      </table>\n      ";
    });
  },
  esc: function esc(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
};

exports.default = Project;
});

;require.register("web/static/js/results", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Results = {
  init: function init(socket, element) {
    if (!element) {
      return;
    }
    var searchId = element.getAttribute("data-id");
    socket.connect();
    this.onReady(searchId, socket);
  },
  onReady: function onReady(searchId, socket) {
    var _this = this;

    var resultsContainer = document.getElementById("results");
    var backendMenuContainer = document.getElementById("list_backends");
    var runSearch = document.getElementById("run-search");
    var searchChannel = socket.channel("searches:" + searchId);

    runSearch.addEventListener("click", function (e) {
      searchChannel.push("run_search").receive("error", function (e) {
        return console.log(e);
      });
    });

    searchChannel.on("backend", function (resp) {
      _this.renderBackend(resultsContainer, backendMenuContainer, resp);
    });

    searchChannel.on("result", function (resp) {
      var backendContainer = document.getElementById(resp.backend);
      _this.renderResult(backendContainer, resp);
    });

    searchChannel.on("loaded_results", function (resp) {
      var backendMenuItem = document.getElementById(resp.backend + "_menu");
      backendMenuItem.innerHTML = "\n      <a href=\"#" + resp.backend + "_header\">" + resp.backend_str + "</a>\n      ";
    });

    searchChannel.on("no_result", function (resp) {
      var backendContainer = document.getElementById(resp.backend);
      _this.renderNoResult(backendContainer);
    });

    searchChannel.on("clear_results", function (resp) {
      var resultsContainer = document.getElementById("results");
      var backendMenuContainer = document.getElementById("list_backends");

      resultsContainer.innerHTML = "";
      backendMenuContainer.innerHTML = "";
    });

    searchChannel.join()
    // TODO add receive results here
    .receive("ok", function (resp) {
      return console.log("Joined search channel", resp);
    }).receive("error", function (reason) {
      return console.log("Join failed", reason);
    });
  },
  renderBackend: function renderBackend(resultsContainer, backendMenuContainer, _ref) {
    var backend = _ref.backend;
    var backend_str = _ref.backend_str;
    var backend_url = _ref.backend_url;
    var results_url = _ref.results_url;
    var search_id = _ref.search_id;

    var template = document.createElement("div");
    template.setAttribute("class", "panel panel-info");
    template.innerHTML = "\n    <div class=\"panel-heading\" id=\"" + this.esc(backend) + "_header\">\n    <h4><a href=\"" + this.esc(backend_url) + "\" target=\"_blank\">" + this.esc(backend_str) + "</a></h4>\n    </div>\n    <div class=\"panel-body\" id=\"" + this.esc(backend) + "\"></div>\n    <div class=\"panel-footer\">\n    <a href=\"" + this.esc(results_url) + "\" target=\"_blank\">Go to results on " + this.esc(backend_str) + "...</a>\n    </div>\n    ";
    resultsContainer.appendChild(template);

    var new_result = document.createElement("div");
    new_result.setAttribute("id", backend + "_menu");
    new_result.innerHTML = "\n    " + this.esc(backend_str) + "...loading\n    ";
    backendMenuContainer.appendChild(new_result);
  },
  renderResult: function renderResult(backendContainer, _ref2) {
    var backend = _ref2.backend;
    var biz = _ref2.biz;
    var address = _ref2.address;
    var city = _ref2.city;
    var state = _ref2.state;
    var zip = _ref2.zip;
    var rating = _ref2.rating;
    var url = _ref2.url;
    var phone = _ref2.phone;

    var template = document.createElement("div");

    // TODO refactor for short-circuit evaluation wihtin template innerHTML
    if (zip == null) {
      zip = "";
    }

    // TODO refactor to just add the last line if url is true
    if (url) {
      template.innerHTML = "\n      <b>" + this.esc(biz) + "</b><br>\n      " + this.esc(address) + "<br>\n      " + this.esc(city) + ", " + this.esc(state) + " " + this.esc(zip) + "<br>\n      " + this.esc(phone) + "<br>\n      <i>Rating: </i><b>" + this.esc(rating) + "</b><br>\n      <i><a href=\"" + this.esc(url) + "\" target=\"_blank\">Edit entry</a></i><br>\n      <br>\n      ";
    } else {
      template.innerHTML = "\n      <b>" + this.esc(biz) + "</b><br>\n      " + this.esc(address) + "<br>\n      " + this.esc(city) + ", " + this.esc(state) + " " + this.esc(zip) + "<br>\n      " + this.esc(phone) + "<br>\n      <i>Rating: </i><b>" + this.esc(rating) + "</b><br>\n      <br>\n      ";
    }
    backendContainer.appendChild(template);
  },
  renderNoResult: function renderNoResult(backendContainer) {
    var template = document.createElement("div");
    template.innerHTML = "\n    <i>No results</i>\n    ";
    backendContainer.appendChild(template);
  },
  esc: function esc(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
};
exports.default = Results;
});

;require.register("web/static/js/socket", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _phoenix = require("phoenix");

var socket = new _phoenix.Socket("/socket", {
  params: { token: window.userToken },
  logger: function logger(kind, msg, data) {
    console.log(kind + ": " + msg, data);
  }
}); // To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":

exports.default = socket;
});

;require('web/static/js/app');
//# sourceMappingURL=app.js.map
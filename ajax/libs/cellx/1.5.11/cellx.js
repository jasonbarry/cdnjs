(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cellx"] = factory();
	else
		root["cellx"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var Map = __webpack_require__(1);
	var Symbol = __webpack_require__(2);
	var logError = __webpack_require__(7);
	var nextUID = __webpack_require__(3);
	var mixin = __webpack_require__(5);
	var createClass = __webpack_require__(4);
	var nextTick = __webpack_require__(8);
	var keys = __webpack_require__(6);
	var ErrorLogger = __webpack_require__(9);
	var EventEmitter = __webpack_require__(10);
	var ObservableMap = __webpack_require__(11);
	var ObservableList = __webpack_require__(14);
	var Cell = __webpack_require__(15);

	var KEY_UID = keys.UID;
	var KEY_CELLS = keys.CELLS;

	var hasOwn = Object.prototype.hasOwnProperty;
	var slice = Array.prototype.slice;

	var cellProto = Cell.prototype;

	ErrorLogger.setHandler(logError);

	/**
	 * @typesign (value?, opts?: {
	 *     debugKey?: string,
	 *     owner?: Object,
	 *     get?: (value) -> *,
	 *     validate?: (value),
	 *     onChange?: (evt: cellx~Event) -> boolean|undefined,
	 *     onError?: (evt: cellx~Event) -> boolean|undefined,
	 *     computed?: false
	 * }) -> cellx;
	 *
	 * @typesign (formula: () -> *, opts?: {
	 *     debugKey?: string
	 *     owner?: Object,
	 *     get?: (value) -> *,
	 *     set?: (value),
	 *     validate?: (value),
	 *     onChange?: (evt: cellx~Event) -> boolean|undefined,
	 *     onError?: (evt: cellx~Event) -> boolean|undefined,
	 *     computed?: true
	 * }) -> cellx;
	 */
	function cellx(value, opts) {
		if (!opts) {
			opts = {};
		}

		var initialValue = value;

		function cx(value) {
			var owner = this;

			if (!owner || owner == global) {
				owner = cx;
			}

			if (!hasOwn.call(owner, KEY_CELLS)) {
				Object.defineProperty(owner, KEY_CELLS, {
					value: new Map()
				});
			}

			var cell = owner[KEY_CELLS].get(cx);

			if (!cell) {
				if (value === 'dispose' && arguments.length >= 2) {
					return;
				}

				opts = Object.create(opts);
				opts.owner = owner;

				cell = new Cell(initialValue, opts);

				owner[KEY_CELLS].set(cx, cell);
			}

			switch (arguments.length) {
				case 0: {
					return cell.get();
				}
				case 1: {
					return cell.set(value);
				}
				default: {
					switch (value) {
						case 'bind': {
							cx = cx.bind(owner);
							cx.constructor = cellx;
							return cx;
						}
						case 'unwrap': {
							return cell;
						}
						default: {
							return cellProto[value].apply(cell, slice.call(arguments, 1));
						}
					}
				}
			}
		}
		cx.constructor = cellx;

		if (opts.onChange || opts.onError) {
			cx.call(opts.owner || global);
		}

		return cx;
	}
	cellx.cellx = cellx; // for destructuring

	cellx.KEY_UID = KEY_UID;
	cellx.ErrorLogger = ErrorLogger;
	cellx.EventEmitter = EventEmitter;
	cellx.ObservableMap = ObservableMap;
	cellx.ObservableList = ObservableList;
	cellx.Cell = Cell;

	/**
	 * @typesign (
	 *     entries?: Object|Array<{ 0, 1 }>|cellx.ObservableMap,
	 *     opts?: { adoptsItemChanges?: boolean }
	 * ) -> cellx.ObservableMap;
	 *
	 * @typesign (
	 *     entries?: Object|Array<{ 0, 1 }>|cellx.ObservableMap,
	 *     adoptsItemChanges?: boolean
	 * ) -> cellx.ObservableMap;
	 */
	function map(entries, opts) {
		return new ObservableMap(entries, typeof opts == 'boolean' ? { adoptsItemChanges: opts } : opts);
	}

	cellx.map = map;

	/**
	 * @typesign (items?: Array|cellx.ObservableList, opts?: {
	 *     adoptsItemChanges?: boolean,
	 *     comparator?: (a, b) -> int,
	 *     sorted?: boolean
	 * }) -> cellx.ObservableList;
	 *
	 * @typesign (items?: Array|cellx.ObservableList, adoptsItemChanges?: boolean) -> cellx.ObservableList;
	 */
	function list(items, opts) {
		return new ObservableList(items, typeof opts == 'boolean' ? { adoptsItemChanges: opts } : opts);
	}

	cellx.list = list;

	/**
	 * @typesign (obj: Object, name: string, value);
	 */
	function defineObservableProperty(obj, name, value) {
		var _name = '_' + name;

		obj[_name] = typeof value == 'function' && value.constructor == cellx ? value : cellx(value);

		Object.defineProperty(obj, name, {
			configurable: true,
			enumerable: true,

			get: function() {
				return this[_name]();
			},

			set: function(value) {
				this[_name](value);
			}
		});
	}

	/**
	 * @typesign (obj: Object, props: Object);
	 */
	function defineObservableProperties(obj, props) {
		Object.keys(props).forEach(function(name) {
			defineObservableProperty(obj, name, props[name]);
		});
	}

	/**
	 * @typesign (obj: Object, name: string, value) -> Object;
	 * @typesign (obj: Object, props: Object) -> Object;
	 */
	function define(obj, name, value) {
		if (arguments.length == 3) {
			defineObservableProperty(obj, name, value);
		} else {
			defineObservableProperties(obj, name);
		}

		return obj;
	}

	cellx.define = define;

	function observable(target, name, descr, opts) {
		if (arguments.length == 1) {
			opts = target;

			return function(target, name, descr) {
				return observable(target, name, descr, opts);
			};
		}

		if (!opts) {
			opts = {};
		}

		opts.computed = false;

		var _name = '_' + name;

		target[_name] = cellx(descr.initializer.call(target), opts);

		return {
			configurable: true,
			enumerable: descr.enumerable,

			get: function() {
				return this[_name]();
			},

			set: function(value) {
				this[_name](value);
			}
		};
	}

	function computed(target, name, descr, opts) {
		if (arguments.length == 1) {
			opts = target;

			return function(target, name, descr) {
				return computed(target, name, descr, opts);
			};
		}

		var value = descr.initializer();

		if (typeof value != 'function') {
			throw new TypeError('Property value must be a function');
		}

		if (!opts) {
			opts = {};
		}

		opts.computed = true;

		var _name = '_' + name;

		target[_name] = cellx(value, opts);

		var descriptor = {
			configurable: true,
			enumerable: descr.enumerable,

			get: function() {
				return this[_name]();
			}
		};

		if (opts.set) {
			descriptor.set = function(value) {
				this[_name](value);
			};
		}

		return descriptor;
	}

	cellx.d = {
		observable: observable,
		computed: computed
	};

	cellx.js = {
		Symbol: Symbol,
		Map: Map
	};

	cellx.utils = {
		logError: logError,
		nextUID: nextUID,
		mixin: mixin,
		createClass: createClass,
		nextTick: nextTick,
		defineObservableProperty: defineObservableProperty,
		defineObservableProperties: defineObservableProperties
	};

	module.exports = cellx;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var Symbol = __webpack_require__(2);
	var nextUID = __webpack_require__(3);
	var createClass = __webpack_require__(4);
	var keys = __webpack_require__(6);

	var KEY_UID = keys.UID;

	var hasOwn = Object.prototype.hasOwnProperty;

	var Map = global.Map;

	if (!Map) {
		var entryStub = {
			value: void 0
		};

		Map = createClass({
			constructor: function Map(entries) {
				this._entries = Object.create(null);
				this._objectStamps = {};

				this._first = null;
				this._last = null;

				this.size = 0;

				if (entries) {
					for (var i = 0, l = entries.length; i < l; i++) {
						this.set(entries[i][0], entries[i][1]);
					}
				}
			},

			has: function has(key) {
				return !!this._entries[this._getValueStamp(key)];
			},

			get: function get(key) {
				return (this._entries[this._getValueStamp(key)] || entryStub).value;
			},

			set: function set(key, value) {
				var entries = this._entries;
				var keyStamp = this._getValueStamp(key);

				if (entries[keyStamp]) {
					entries[keyStamp].value = value;
				} else {
					var entry = entries[keyStamp] = {
						key: key,
						keyStamp: keyStamp,
						value: value,
						prev: this._last,
						next: null
					};

					if (this.size++) {
						this._last.next = entry;
					} else {
						this._first = entry;
					}

					this._last = entry;
				}

				return this;
			},

			delete: function _delete(key) {
				var keyStamp = this._getValueStamp(key);
				var entry = this._entries[keyStamp];

				if (!entry) {
					return false;
				}

				if (--this.size) {
					var prev = entry.prev;
					var next = entry.next;

					if (prev) {
						prev.next = next;
					} else {
						this._first = next;
					}

					if (next) {
						next.prev = prev;
					} else {
						this._last = prev;
					}
				} else {
					this._first = null;
					this._last = null;
				}

				delete this._entries[keyStamp];
				delete this._objectStamps[keyStamp];

				return true;
			},

			clear: function clear() {
				var entries = this._entries;

				for (var stamp in entries) {
					delete entries[stamp];
				}

				this._objectStamps = {};

				this._first = null;
				this._last = null;

				this.size = 0;
			},

			_getValueStamp: function _getValueStamp(value) {
				switch (typeof value) {
					case 'undefined': {
						return 'undefined';
					}
					case 'object': {
						if (value === null) {
							return 'null';
						}

						break;
					}
					case 'boolean': {
						return '?' + value;
					}
					case 'number': {
						return '+' + value;
					}
					case 'string': {
						return ',' + value;
					}
				}

				return this._getObjectStamp(value);
			},

			_getObjectStamp: function _getObjectStamp(obj) {
				if (!hasOwn.call(obj, KEY_UID)) {
					if (!Object.isExtensible(obj)) {
						var stamps = this._objectStamps;
						var stamp;

						for (stamp in stamps) {
							if (hasOwn.call(stamps, stamp) && stamps[stamp] == obj) {
								return stamp;
							}
						}

						stamp = nextUID();
						stamps[stamp] = obj;

						return stamp;
					}

					Object.defineProperty(obj, KEY_UID, {
						value: nextUID()
					});
				}

				return obj[KEY_UID];
			},

			forEach: function forEach(cb, context) {
				if (context == null) {
					context = global;
				}

				var entry = this._first;

				while (entry) {
					cb.call(context, entry.value, entry.key, this);

					do {
						entry = entry.next;
					} while (entry && !this._entries[entry.keyStamp]);
				}
			},

			toString: function toString() {
				return '[object Map]';
			}
		});

		[
			['keys', function keys(entry) {
				return entry.key;
			}],
			['values', function values(entry) {
				return entry.value;
			}],
			['entries', function entries(entry) {
				return [entry.key, entry.value];
			}]
		].forEach(function(settings) {
			var getStepValue = settings[1];

			Map.prototype[settings[0]] = function() {
				var entries = this._entries;
				var entry;
				var done = false;
				var map = this;

				return {
					next: function() {
						if (!done) {
							if (entry) {
								do {
									entry = entry.next;
								} while (entry && !entries[entry.keyStamp]);
							} else {
								entry = map._first;
							}

							if (entry) {
								return {
									value: getStepValue(entry),
									done: false
								};
							}

							done = true;
						}

						return {
							value: void 0,
							done: true
						};
					}
				};
			};
		});
	}

	if (!Map.prototype[Symbol.iterator]) {
		Map.prototype[Symbol.iterator] = Map.prototype.entries;
	}

	module.exports = Map;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var nextUID = __webpack_require__(3);

	var Symbol = global.Symbol;

	if (!Symbol) {
		Symbol = function Symbol(key) {
			return '__' + key + '_' + Math.floor(Math.random() * 1e9) + '_' + nextUID() + '__';
		};

		Symbol.iterator = Symbol('iterator');
	}

	module.exports = Symbol;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 3 */
/***/ function(module, exports) {

	var uidCounter = 0;

	/**
	 * @typesign () -> string;
	 */
	function nextUID() {
		return String(++uidCounter);
	}

	module.exports = nextUID;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var mixin = __webpack_require__(5);

	var hasOwn = Object.prototype.hasOwnProperty;

	var extend;

	/**
	 * @typesign (description: {
	 *     Extends?: Function,
	 *     Implements?: Array<Object|Function>,
	 *     Static?: Object,
	 *     constructor?: Function
	 * }) -> Function;
	 */
	function createClass(description) {
		var parent;

		if (description.Extends) {
			parent = description.Extends;
			delete description.Extends;
		} else {
			parent = Object;
		}

		var constr;

		if (hasOwn.call(description, 'constructor')) {
			constr = description.constructor;
			delete description.constructor;
		} else {
			constr = parent == Object ?
				function() {} :
				function() {
					return parent.apply(this, arguments);
				};
		}

		var proto = constr.prototype = Object.create(parent.prototype);

		if (description.Implements) {
			description.Implements.forEach(function(implementation) {
				if (typeof implementation == 'function') {
					Object.keys(implementation).forEach(function(name) {
						Object.defineProperty(constr, name, Object.getOwnPropertyDescriptor(implementation, name));
					});

					mixin(proto, implementation.prototype);
				} else {
					mixin(proto, implementation);
				}
			});

			delete description.Implements;
		}

		Object.keys(parent).forEach(function(name) {
			Object.defineProperty(constr, name, Object.getOwnPropertyDescriptor(parent, name));
		});

		if (description.Static) {
			mixin(constr, description.Static);
			delete description.Static;
		}

		if (constr.extend === void 0) {
			constr.extend = extend;
		}

		mixin(proto, description);

		Object.defineProperty(proto, 'constructor', {
			configurable: true,
			writable: true,
			value: constr
		});

		return constr;
	}

	/**
	 * @this {Function}
	 *
	 * @typesign (description: {
	 *     Implements?: Array<Object|Function>,
	 *     Static?: Object,
	 *     constructor?: Function
	 * }) -> Function;
	 */
	extend = function extend(description) {
		description.Extends = this;
		return createClass(description);
	};

	module.exports = createClass;


/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * @typesign (target: Object, source: Object) -> Object;
	 */
	function mixin(target, source) {
		var names = Object.getOwnPropertyNames(source);

		for (var i = 0, l = names.length; i < l; i++) {
			var name = names[i];
			Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(source, name));
		}

		return target;
	}

	module.exports = mixin;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(2);

	var keys = {
		UID: Symbol('uid'),
		CELLS: Symbol('cells')
	};

	module.exports = keys;


/***/ },
/* 7 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {function noop() {}

	var map = Array.prototype.map;

	/**
	 * @typesign (...msg);
	 */
	function logError() {
		var console = global.console;

		(console && console.error || noop).call(console || global, map.call(arguments, function(part) {
			return part === Object(part) && part.stack || part;
		}).join(' '));
	}

	module.exports = logError;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*global Promise*/
	var ErrorLogger = __webpack_require__(9);

	/**
	 * @typesign (cb: ());
	 */
	var nextTick;

	if (global.process && process.toString() == '[object process]' && process.nextTick) {
		nextTick = process.nextTick;
	} else if (global.setImmediate) {
		nextTick = function nextTick(cb) {
			setImmediate(cb);
		};
	} else if (global.Promise && Promise.toString().indexOf('[native code]') != -1) {
		var prm = Promise.resolve();

		nextTick = function nextTick(cb) {
			prm.then(function() {
				cb();
			});
		};
	} else {
		var queue;

		global.addEventListener('message', function() {
			if (queue) {
				var track = queue;

				queue = null;

				for (var i = 0, l = track.length; i < l; i++) {
					try {
						track[i]();
					} catch (err) {
						ErrorLogger.log(err);
					}
				}
			}
		});

		nextTick = function nextTick(cb) {
			if (queue) {
				queue.push(cb);
			} else {
				queue = [cb];
				postMessage('__tic__', '*');
			}
		};
	}

	module.exports = nextTick;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 9 */
/***/ function(module, exports) {

	var ErrorLogger = {
		_handler: null,

		/**
		 * @typesign (handler: (...msg));
		 */
		setHandler: function setHandler(handler) {
			this._handler = handler;
		},

		/**
		 * @typesign (...msg);
		 */
		log: function log() {
			this._handler.apply(this, arguments);
		}
	};

	module.exports = ErrorLogger;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(2);
	var createClass = __webpack_require__(4);
	var ErrorLogger = __webpack_require__(9);

	var hasOwn = Object.prototype.hasOwnProperty;

	var KEY_INNER = Symbol('inner');

	/**
	 * @typedef {{
	 *     target?: Object,
	 *     type: string,
	 *     bubbles?: boolean,
	 *     isPropagationStopped?: boolean
	 * }} cellx~Event
	 */

	/**
	 * @class cellx.EventEmitter
	 * @extends {Object}
	 * @typesign new () -> cellx.EventEmitter;
	 */
	var EventEmitter = createClass({
		Static: {
			KEY_INNER: KEY_INNER
		},

		constructor: function EventEmitter() {
			/**
			 * @type {Object<Array<{
			 *     listener: (evt: cellx~Event) -> boolean|undefined,
			 *     context
			 * }>>}
			 */
			this._events = Object.create(null);
		},

		/**
		 * @typesign (
		 *     type: string,
		 *     listener: (evt: cellx~Event) -> boolean|undefined,
		 *     context?
		 * ) -> cellx.EventEmitter;
		 *
		 * @typesign (
		 *     listeners: Object<(evt: cellx~Event) -> boolean|undefined>,
		 *     context?
		 * ) -> cellx.EventEmitter;
		 */
		on: function on(type, listener, context) {
			if (typeof type == 'object') {
				context = listener;

				var listeners = type;

				for (type in listeners) {
					if (hasOwn.call(listeners, type)) {
						this._on(type, listeners[type], context);
					}
				}
			} else {
				this._on(type, listener, context);
			}

			return this;
		},
		/**
		 * @typesign (
		 *     type: string,
		 *     listener: (evt: cellx~Event) -> boolean|undefined,
		 *     context?
		 * ) -> cellx.EventEmitter;
		 *
		 * @typesign (
		 *     listeners: Object<(evt: cellx~Event) -> boolean|undefined>,
		 *     context?
		 * ) -> cellx.EventEmitter;
		 *
		 * @typesign () -> cellx.EventEmitter;
		 */
		off: function off(type, listener, context) {
			if (type) {
				if (typeof type == 'object') {
					context = listener;

					var listeners = type;

					for (type in listeners) {
						if (hasOwn.call(listeners, type)) {
							this._off(type, listeners[type], context);
						}
					}
				} else {
					this._off(type, listener, context);
				}
			} else if (this._events) {
				this._events = Object.create(null);
			}

			return this;
		},

		/**
		 * @typesign (
		 *     type: string,
		 *     listener: (evt: cellx~Event) -> boolean|undefined,
		 *     context?
		 * );
		 */
		_on: function _on(type, listener, context) {
			var index = type.indexOf(':');

			if (index != -1) {
				this['_' + type.slice(index + 1)]('on', type.slice(0, index), listener, context);
			} else {
				var events = (this._events || (this._events = Object.create(null)))[type];

				if (!events) {
					events = this._events[type] = [];
				}

				events.push({
					listener: listener,
					context: context == null ? this : context
				});
			}
		},
		/**
		 * @typesign (
		 *     type: string,
		 *     listener: (evt: cellx~Event) -> boolean|undefined,
		 *     context?
		 * );
		 */
		_off: function _off(type, listener, context) {
			var index = type.indexOf(':');

			if (index != -1) {
				this['_' + type.slice(index + 1)]('off', type.slice(0, index), listener, context);
			} else {
				var events = this._events && this._events[type];

				if (!events) {
					return;
				}

				if (context == null) {
					context = this;
				}

				for (var i = events.length; i;) {
					var evt = events[--i];

					if ((evt.listener == listener || evt.listener[KEY_INNER] === listener) && evt.context === context) {
						events.splice(i, 1);
						break;
					}
				}

				if (!events.length) {
					delete this._events[type];
				}
			}
		},

		/**
		 * @typesign (
		 *     type: string,
		 *     listener: (evt: cellx~Event) -> boolean|undefined,
		 *     context?
		 * ) -> cellx.EventEmitter;
		 */
		once: function once(type, listener, context) {
			function wrapper() {
				this._off(type, wrapper, context);
				return listener.apply(this, arguments);
			}
			wrapper[KEY_INNER] = listener;

			this._on(type, wrapper, context);

			return this;
		},

		/**
		 * @typesign (evt: cellx~Event) -> cellx~Event;
		 * @typesign (type: string) -> cellx~Event;
		 */
		emit: function emit(evt) {
			if (typeof evt == 'string') {
				evt = {
					target: this,
					type: evt
				};
			} else if (!evt.target) {
				evt.target = this;
			}

			this._handleEvent(evt);

			return evt;
		},

		/**
		 * @typesign (evt: cellx~Event);
		 *
		 * For override:
		 * @example
		 * function View(el) {
		 *     this.element = el;
		 *     el._view = this;
		 * }
		 *
		 * View.prototype = Object.create(EventEmitter.prototype);
		 * View.prototype.constructor = View;
		 *
		 * View.prototype.getParent = function() {
		 *     var node = this.element;
		 *
		 *     while (node = node.parentNode) {
		 *         if (node._view) {
		 *             return node._view;
		 *         }
		 *     }
		 *
		 *     return null;
		 * };
		 *
		 * View.prototype._handleEvent = function(evt) {
		 *     EventEmitter.prototype._handleEvent.call(this, evt);
		 *
		 *     if (evt.bubbles !== false && !evt.isPropagationStopped) {
		 *         var parent = this.getParent();
		 *
		 *         if (parent) {
		 *             parent._handleEvent(evt);
		 *         }
		 *     }
		 * };
		 */
		_handleEvent: function _handleEvent(evt) {
			var events = this._events && this._events[evt.type];

			if (events) {
				events = events.slice();

				for (var i = 0, l = events.length; i < l; i++) {
					try {
						if (events[i].listener.call(events[i].context, evt) === false) {
							evt.isPropagationStopped = true;
						}
					} catch (err) {
						this._logError(err);
					}
				}
			}
		},

		/**
		 * @typesign (...msg);
		 */
		_logError: function _logError() {
			ErrorLogger.log.apply(ErrorLogger, arguments);
		}
	});

	module.exports = EventEmitter;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var Map = __webpack_require__(1);
	var Symbol = __webpack_require__(2);
	var is = __webpack_require__(12);
	var EventEmitter = __webpack_require__(10);
	var ObservableCollectionMixin = __webpack_require__(13);

	var hasOwn = Object.prototype.hasOwnProperty;
	var isArray = Array.isArray;

	/**
	 * @class cellx.ObservableMap
	 * @extends {cellx.EventEmitter}
	 * @implements {ObservableCollectionMixin}
	 *
	 * @typesign new (entries?: Object|Array<{ 0, 1 }>|cellx.ObservableMap, opts?: {
	 *     adoptsItemChanges?: boolean
	 * }) -> cellx.ObservableMap;
	 */
	var ObservableMap = EventEmitter.extend({
		Implements: [ObservableCollectionMixin],

		constructor: function ObservableMap(entries, opts) {
			EventEmitter.call(this);
			ObservableCollectionMixin.call(this);

			this._entries = new Map();

			this.size = 0;

			/**
			 * @type {boolean}
			 */
			this.adoptsItemChanges = !opts || opts.adoptsItemChanges !== false;

			if (entries) {
				var mapEntries = this._entries;

				if (entries instanceof ObservableMap) {
					entries._entries.forEach(function(value, key) {
						mapEntries.set(key, value);
						this._registerValue(value);
					}, this);
				} else if (isArray(entries)) {
					for (var i = 0, l = entries.length; i < l; i++) {
						var entry = entries[i];

						mapEntries.set(entry[0], entry[1]);
						this._registerValue(entry[1]);
					}
				} else {
					for (var key in entries) {
						if (hasOwn.call(entries, key)) {
							mapEntries.set(key, entries[key]);
							this._registerValue(entries[key]);
						}
					}
				}

				this.size = mapEntries.size;
			}
		},

		/**
		 * @typesign (key) -> boolean;
		 */
		has: function has(key) {
			return this._entries.has(key);
		},

		/**
		 * @typesign (value) -> boolean;
		 */
		contains: function contains(value) {
			return this._valueCounts.has(value);
		},

		/**
		 * @typesign (key) -> *;
		 */
		get: function get(key) {
			return this._entries.get(key);
		},

		/**
		 * @typesign (key, value) -> cellx.ObservableMap;
		 */
		set: function set(key, value) {
			var entries = this._entries;
			var hasKey = entries.has(key);
			var oldValue;

			if (hasKey) {
				oldValue = entries.get(key);

				if (is(oldValue, value)) {
					return this;
				}

				this._unregisterValue(oldValue);
			}

			entries.set(key, value);
			this._registerValue(value);

			if (!hasKey) {
				this.size++;
			}

			this.emit({
				type: 'change',
				subtype: hasKey ? 'update' : 'add',
				key: key,
				oldValue: oldValue,
				value: value
			});

			return this;
		},

		/**
		 * @typesign (key) -> boolean;
		 */
		delete: function _delete(key) {
			var entries = this._entries;

			if (!entries.has(key)) {
				return false;
			}

			var value = entries.get(key);

			entries.delete(key);
			this._unregisterValue(value);

			this.size--;

			this.emit({
				type: 'change',
				subtype: 'delete',
				key: key,
				oldValue: value,
				value: undefined
			});

			return true;
		},

		/**
		 * @typesign () -> cellx.ObservableMap;
		 */
		clear: function clear() {
			if (!this.size) {
				return this;
			}

			this._entries.clear();
			this._valueCounts.clear();
			this.size = 0;

			this.emit({
				type: 'change',
				subtype: 'clear'
			});

			return this;
		},

		/**
		 * @typesign (
		 *     cb: (value, key, map: cellx.ObservableMap),
		 *     context?
		 * );
		 */
		forEach: function forEach(cb, context) {
			if (context == null) {
				context = global;
			}

			this._entries.forEach(function(value, key) {
				cb.call(context, value, key, this);
			}, this);
		},

		/**
		 * @typesign () -> { next: () -> { value, done: boolean } };
		 */
		keys: function keys() {
			return this._entries.keys();
		},

		/**
		 * @typesign () -> { next: () -> { value, done: boolean } };
		 */
		values: function values() {
			return this._entries.values();
		},

		/**
		 * @typesign () -> { next: () -> { value: { 0, 1 }, done: boolean } };
		 */
		entries: function entries() {
			return this._entries.entries();
		},

		/**
		 * @typesign () -> cellx.ObservableMap;
		 */
		clone: function clone() {
			return new this.constructor(this, {
				adoptsItemChanges: this.adoptsItemChanges
			});
		}
	});

	ObservableMap.prototype[Symbol.iterator] = ObservableMap.prototype.entries;

	module.exports = ObservableMap;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 12 */
/***/ function(module, exports) {

	var is = Object.is || function is(a, b) {
		if (a === 0 && b === 0) {
			return 1 / a == 1 / b;
		}
		return a === b || (a != a && b != b);
	};

	module.exports = is;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var Map = __webpack_require__(1);
	var EventEmitter = __webpack_require__(10);

	var ObservableCollectionMixin = EventEmitter.extend({
		constructor: function ObservableCollectionMixin() {
			/**
			 * @type {Map<*, uint>}
			 */
			this._valueCounts = new Map();
		},

		/**
		 * @typesign (evt: cellx~Event);
		 */
		_onItemChange: function _onItemChange(evt) {
			this._handleEvent(evt);
		},

		/**
		 * @typesign (value);
		 */
		_registerValue: function _registerValue(value) {
			var valueCounts = this._valueCounts;
			var valueCount = valueCounts.get(value);

			if (valueCount) {
				valueCounts.set(value, valueCount + 1);
			} else {
				valueCounts.set(value, 1);

				if (this.adoptsItemChanges && value instanceof EventEmitter) {
					value.on('change', this._onItemChange, this);
				}
			}
		},

		/**
		 * @typesign (value);
		 */
		_unregisterValue: function _unregisterValue(value) {
			var valueCounts = this._valueCounts;
			var valueCount = valueCounts.get(value);

			if (valueCount > 1) {
				valueCounts.set(value, valueCount - 1);
			} else {
				valueCounts.delete(value);

				if (this.adoptsItemChanges && value instanceof EventEmitter) {
					value.off('change', this._onItemChange, this);
				}
			}
		},

		/**
		 * Освобождает занятые инстансом ресурсы.
		 * @typesign ();
		 */
		dispose: function dispose() {
			if (this.adoptsItemChanges) {
				this._valueCounts.forEach(function(value) {
					if (value instanceof EventEmitter) {
						value.off('change', this._onItemChange, this);
					}
				}, this);
			}
		}
	});

	module.exports = ObservableCollectionMixin;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(2);
	var is = __webpack_require__(12);
	var EventEmitter = __webpack_require__(10);
	var ObservableCollectionMixin = __webpack_require__(13);

	var push = Array.prototype.push;
	var splice = Array.prototype.splice;

	/**
	 * @typesign (a, b) -> -1|1|0;
	 */
	function defaultComparator(a, b) {
		if (a < b) { return -1; }
		if (a > b) { return 1; }
		return 0;
	}

	/**
	 * @typesign (list: cellx.ObservableList, items: Array);
	 */
	function addRange(list, items) {
		var listItems = list._items;

		if (list.sorted) {
			var comparator = list.comparator;

			for (var i = 0, l = items.length; i < l; i++) {
				var item = items[i];
				var low = 0;
				var high = listItems.length;

				while (low != high) {
					var mid = (low + high) >> 1;

					if (comparator(item, listItems[mid]) < 0) {
						high = mid;
					} else {
						low = mid + 1;
					}
				}

				listItems.splice(low, 0, item);
				list._registerValue(item);
			}
		} else {
			push.apply(listItems, items);

			for (var j = items.length; j;) {
				list._registerValue(items[--j]);
			}
		}

		list.length = listItems.length;
	}

	/**
	 * @class cellx.ObservableList
	 * @extends {cellx.EventEmitter}
	 * @implements {ObservableCollectionMixin}
	 *
	 * @typesign new (items?: Array|cellx.ObservableList, opts?: {
	 *     adoptsItemChanges?: boolean,
	 *     comparator?: (a, b) -> int,
	 *     sorted?: boolean
	 * }) -> cellx.ObservableList;
	 */
	var ObservableList = EventEmitter.extend({
		Implements: [ObservableCollectionMixin],

		constructor: function ObservableList(items, opts) {
			EventEmitter.call(this);
			ObservableCollectionMixin.call(this);

			if (!opts) {
				opts = {};
			}

			this._items = [];

			this.length = 0;

			/**
			 * @type {boolean}
			 */
			this.adoptsItemChanges = opts.adoptsItemChanges !== false;

			/**
			 * @type {?(a, b) -> int}
			 */
			this.comparator = null;

			this.sorted = false;

			if (opts.sorted || (opts.comparator && opts.sorted !== false)) {
				this.comparator = opts.comparator || defaultComparator;
				this.sorted = true;
			}

			if (items) {
				addRange(this, items instanceof ObservableList ? items._items : items);
			}
		},

		/**
		 * @typesign (index: int, allowEndIndex?: boolean) -> uint|undefined;
		 */
		_validateIndex: function _validateIndex(index, allowEndIndex) {
			if (index === undefined) {
				return index;
			}

			if (index < 0) {
				index += this.length;

				if (index < 0) {
					throw new RangeError('Index out of range');
				}
			} else if (index >= (this.length + (allowEndIndex ? 1 : 0))) {
				throw new RangeError('Index out of range');
			}

			return index;
		},

		/**
		 * @typesign (value) -> boolean;
		 */
		contains: function contains(value) {
			return this._valueCounts.has(value);
		},

		/**
		 * @typesign (value, fromIndex?: int) -> int;
		 */
		indexOf: function indexOf(value, fromIndex) {
			return this._items.indexOf(value, this._validateIndex(fromIndex));
		},

		/**
		 * @typesign (value, fromIndex?: int) -> int;
		 */
		lastIndexOf: function lastIndexOf(value, fromIndex) {
			return this._items.lastIndexOf(value, this._validateIndex(fromIndex));
		},

		/**
		 * @typesign (index: int) -> *;
		 */
		get: function get(index) {
			return this._items[this._validateIndex(index)];
		},

		/**
		 * @typesign (index?: int, count?: uint) -> Array;
		 */
		getRange: function getRange(index, count) {
			index = this._validateIndex(index || 0, true);

			var items = this._items;

			if (count === undefined) {
				return items.slice(index);
			}

			if (index + count > items.length) {
				throw new RangeError('"index" and "count" do not denote a valid range');
			}

			return items.slice(index, index + count);
		},

		/**
		 * @typesign (index: int, value) -> cellx.ObservableList;
		 */
		set: function set(index, value) {
			if (this.sorted) {
				throw new TypeError('Can\'t set to sorted list');
			}

			index = this._validateIndex(index);

			var items = this._items;

			if (is(items[index], value)) {
				return this;
			}

			this._unregisterValue(items[index]);

			items[index] = value;
			this._registerValue(value);

			this.emit('change');

			return this;
		},

		/**
		 * @typesign (index: int, items: Array) -> cellx.ObservableList;
		 */
		setRange: function setRange(index, items) {
			if (this.sorted) {
				throw new TypeError('Can\'t set to sorted list');
			}

			index = this._validateIndex(index);

			var itemCount = items.length;

			if (!itemCount) {
				return this;
			}

			if (index + itemCount > this.length) {
				throw new RangeError('"index" and length of "items" do not denote a valid range');
			}

			var listItems = this._items;
			var changed = false;

			for (var i = index + itemCount; i > index;) {
				var item = items[--i];

				if (!is(listItems[i], item)) {
					this._unregisterValue(listItems[i]);

					listItems[i] = item;
					this._registerValue(item);

					changed = true;
				}
			}

			if (changed) {
				this.emit('change');
			}

			return this;
		},

		/**
		 * @typesign (item) -> cellx.ObservableList;
		 */
		add: function add(item) {
			this.addRange([item]);
			return this;
		},

		/**
		 * @typesign (items: Array) -> cellx.ObservableList;
		 */
		addRange: function _addRange(items) {
			if (!items.length) {
				return this;
			}

			addRange(this, items);
			this.emit('change');

			return this;
		},

		/**
		 * @typesign (index: int, item) -> cellx.ObservableList;
		 */
		insert: function insert(index, item) {
			this.insertRange(index, [item]);
			return this;
		},

		/**
		 * @typesign (index: int, items: Array) -> cellx.ObservableList;
		 */
		insertRange: function insertRange(index, items) {
			if (this.sorted) {
				throw new TypeError('Can\'t insert to sorted list');
			}

			index = this._validateIndex(index, true);

			var itemCount = items.length;

			if (!itemCount) {
				return this;
			}

			splice.apply(this._items, [].concat(index, 0, items));

			for (var i = itemCount; i;) {
				this._registerValue(items[--i]);
			}

			this.length += itemCount;

			this.emit('change');

			return this;
		},

		/**
		 * @typesign (item, fromIndex?: int) -> cellx.ObservableList;
		 */
		remove: function remove(item, fromIndex) {
			var index = this._items.indexOf(item, this._validateIndex(fromIndex));

			if (index == -1) {
				return this;
			}

			this._items.splice(index, 1);
			this._unregisterValue(item);

			this.length--;

			this.emit('change');

			return this;
		},

		/**
		 * @typesign (item, fromIndex?: int) -> cellx.ObservableList;
		 */
		removeAll: function removeAll(item, fromIndex) {
			var items = this._items;
			var index = this._validateIndex(fromIndex);
			var changed = false;

			while ((index = items.indexOf(item, index)) != -1) {
				items.splice(index, 1);
				this._unregisterValue(item);

				changed = true;
			}

			if (changed) {
				this.length = items.length;
				this.emit('change');
			}

			return this;
		},

		/**
		 * @typesign (index: int) -> cellx.ObservableList;
		 */
		removeAt: function removeAt(index) {
			this._unregisterValue(this._items.splice(this._validateIndex(index), 1)[0]);
			this.length--;

			this.emit('change');

			return this;
		},

		/**
		 * @typesign (index?: int, count?: uint) -> cellx.ObservableList;
		 */
		removeRange: function removeRange(index, count) {
			index = this._validateIndex(index || 0, true);

			var items = this._items;

			if (count === undefined) {
				count = items.length - index;
			} else if (index + count > items.length) {
				throw new RangeError('"index" and "count" do not denote a valid range');
			}

			if (!count) {
				return this;
			}

			for (var i = index + count; i > index;) {
				this._unregisterValue(items[--i]);
			}
			items.splice(index, count);

			this.length -= count;

			this.emit('change');

			return this;
		},

		/**
		 * @typesign () -> cellx.ObservableList;
		 */
		clear: function clear() {
			if (this.length) {
				this._items.length = 0;
				this._valueCounts.clear();

				this.length = 0;

				this.emit('change');
			}

			return this;
		},

		/**
		 * @typesign (separator?: string) -> string;
		 */
		join: function join(separator) {
			return this._items.join(separator);
		},

		/**
		 * @typesign (
		 *     cb: (item, index: uint, arr: cellx.ObservableList),
		 *     context?
		 * );
		 */
		forEach: null,

		/**
		 * @typesign (
		 *     cb: (item, index: uint, arr: cellx.ObservableList) -> *,
		 *     context?
		 * ) -> Array;
		 */
		map: null,

		/**
		 * @typesign (
		 *     cb: (item, index: uint, arr: cellx.ObservableList) -> boolean|undefined,
		 *     context?
		 * ) -> Array;
		 */
		filter: null,

		/**
		 * @typesign (
		 *     cb: (item, index: uint, arr: cellx.ObservableList) -> boolean|undefined,
		 *     context?
		 * ) -> *;
		 */
		find: function(cb, context) {
			if (context == null) {
				context = this;
			}

			var items = this._items;

			for (var i = 0, l = items.length; i < l; i++) {
				var item = items[i];

				if (cb.call(this, item, i, context)) {
					return item;
				}
			}
		},

		/**
		 * @typesign (
		 *     cb: (item, index: uint, arr: cellx.ObservableList) -> boolean|undefined,
		 *     context?
		 * ) -> int;
		 */
		findIndex: function(cb, context) {
			if (context == null) {
				context = this;
			}

			var items = this._items;

			for (var i = 0, l = items.length; i < l; i++) {
				var item = items[i];

				if (cb.call(this, item, i, context)) {
					return i;
				}
			}

			return -1;
		},

		/**
		 * @typesign (
		 *     cb: (item, index: uint, arr: cellx.ObservableList) -> boolean|undefined,
		 *     context?
		 * ) -> boolean;
		 */
		every: null,

		/**
		 * @typesign (
		 *     cb: (item, index: uint, arr: cellx.ObservableList) -> boolean|undefined,
		 *     context?
		 * ) -> boolean;
		 */
		some: null,

		/**
		 * @typesign (
		 *     cb: (accumulator, item, index: uint, arr: cellx.ObservableList) -> *,
		 *     initialValue?
		 * ) -> *;
		 */
		reduce: null,

		/**
		 * @typesign (
		 *     cb: (accumulator, item, index: uint, arr: cellx.ObservableList) -> *,
		 *     initialValue?
		 * ) -> *;
		 */
		reduceRight: null,

		/**
		 * @typesign () -> cellx.ObservableList;
		 */
		clone: function clone() {
			return new this.constructor(this, {
				adoptsItemChanges: this.adoptsItemChanges,
				comparator: this.comparator,
				sorted: this.sorted
			});
		},

		/**
		 * @typesign () -> Array;
		 */
		toArray: function toArray() {
			return this._items.slice();
		},

		/**
		 * @typesign () -> string;
		 */
		toString: function toString() {
			return this._items.join();
		}
	});

	['forEach', 'map', 'filter', 'every', 'some', 'reduce', 'reduceRight'].forEach(function(name) {
		ObservableList.prototype[name] = function() {
			return Array.prototype[name].apply(this._items, arguments);
		};
	});

	[
		['keys', function keys(index) {
			return index;
		}],
		['values', function values(index, item) {
			return item;
		}],
		['entries', function entries(index, item) {
			return [index, item];
		}]
	].forEach(function(settings) {
		var getStepValue = settings[1];

		ObservableList.prototype[settings[0]] = function() {
			var items = this._items;
			var index = 0;
			var done = false;

			return {
				next: function() {
					if (!done) {
						if (index < items.length) {
							return {
								value: getStepValue(index, items[index++]),
								done: false
							};
						}

						done = true;
					}

					return {
						value: undefined,
						done: true
					};
				}
			};
		};
	});

	ObservableList.prototype[Symbol.iterator] = ObservableList.prototype.values;

	module.exports = ObservableList;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var is = __webpack_require__(12);
	var nextTick = __webpack_require__(8);
	var EventEmitter = __webpack_require__(10);

	var KEY_INNER = EventEmitter.KEY_INNER;

	var slice = Array.prototype.slice;

	var error = {
		original: null
	};

	var currentlyRelease = false;

	/**
	 * @type {Array<Array<cellx.Cell>|null>}
	 */
	var releasePlan = [[]];

	var releasePlanIndex = 0;
	var maxLevel = -1;

	var calculatedCell = null;

	var releaseVersion = 1;

	function release() {
		if (releasePlanIndex > maxLevel) {
			return;
		}

		currentlyRelease = true;

		do {
			var bundle = releasePlan[releasePlanIndex];

			if (bundle) {
				var cell = bundle.shift();

				if (releasePlanIndex) {
					var index = releasePlanIndex;

					if (cell._active) {
						cell._recalc();
					}

					if (!releasePlan[index].length) {
						releasePlan[index] = null;

						if (releasePlanIndex) {
							releasePlanIndex++;
						}
					}
				} else {
					var changeEvent = cell._changeEvent;

					cell._fixedValue = cell._value;
					cell._changeEvent = null;

					cell._changed = true;

					if (cell._events.change) {
						cell._handleEvent(changeEvent);
					}

					var slaves = cell._slaves;

					for (var i = 0, l = slaves.length; i < l; i++) {
						var slave = slaves[i];

						if (slave._fixed) {
							(releasePlan[1] || (releasePlan[1] = [])).push(slave);

							if (!maxLevel) {
								maxLevel = 1;
							}

							slave._fixed = false;
						}
					}

					if (!releasePlan[0].length) {
						releasePlanIndex++;
					}
				}
			} else {
				releasePlanIndex++;
			}
		} while (releasePlanIndex <= maxLevel);

		maxLevel = -1;

		releaseVersion++;

		currentlyRelease = false;
	}

	/**
	 * @class cellx.Cell
	 * @extends {cellx.EventEmitter}
	 *
	 * @example
	 * var a = new Cell(1);
	 * var b = new Cell(2);
	 * var c = new Cell(function() {
	 *     return a.get() + b.get();
	 * });
	 *
	 * c.on('change', function() {
	 *     console.log('c = ' + c.get());
	 * });
	 *
	 * console.log(c.get());
	 * // => 3
	 *
	 * a.set(5);
	 * b.set(10);
	 * // => 'c = 15'
	 *
	 * @typesign new (value?, opts?: {
	 *     debugKey?: string,
	 *     owner?: Object,
	 *     get?: (value) -> *,
	 *     validate?: (value),
	 *     onChange?: (evt: cellx~Event) -> boolean|undefined,
	 *     onError?: (evt: cellx~Event) -> boolean|undefined,
	 *     computed?: false
	 * }) -> cellx.Cell;
	 *
	 * @typesign new (formula: () -> *, opts?: {
	 *     debugKey?: string,
	 *     owner?: Object,
	 *     get?: (value) -> *,
	 *     set?: (value),
	 *     validate?: (value),
	 *     onChange?: (evt: cellx~Event) -> boolean|undefined,
	 *     onError?: (evt: cellx~Event) -> boolean|undefined,
	 *     computed?: true
	 * }) -> cellx.Cell;
	 */
	var Cell = EventEmitter.extend({
		constructor: function Cell(value, opts) {
			EventEmitter.call(this);

			if (!opts) {
				opts = {};
			}

			this.owner = opts.owner || null;

			this.computed = typeof value == 'function' &&
				(opts.computed !== undefined ? opts.computed : value.constructor == Function);

			this._value = undefined;
			this._fixedValue = undefined;
			this.initialValue = undefined;
			this._formula = null;

			this._get = opts.get || null;
			this._set = opts.set || null;

			this._validate = opts.validate || null;

			/**
			 * Ведущие ячейки.
			 * @type {?Array<cellx.Cell>}
			 */
			this._masters = null;
			/**
			 * Ведомые ячейки.
			 * @type {Array<cellx.Cell>}
			 */
			this._slaves = [];

			/**
			 * @type {uint|undefined}
			 */
			this._level = 0;

			this._active = !this.computed;

			this._changeEvent = null;
			this._isChangeCancellable = true;

			this._lastErrorEvent = null;

			this._fixed = true;

			this._version = 0;

			this._changed = false;

			this._circularityCounter = 0;

			if (this.computed) {
				this._formula = value;
			} else {
				if (this._validate) {
					this._validate.call(this.owner || this, value);
				}

				this._value = this._fixedValue = this.initialValue = value;

				if (value instanceof EventEmitter) {
					value.on('change', this._onValueChange, this);
				}
			}

			if (opts.onChange) {
				this.on('change', opts.onChange);
			}
			if (opts.onError) {
				this.on('error', opts.onError);
			}
		},

		/**
		 * @type {boolean}
		 */
		get changed() {
			if (!currentlyRelease) {
				release();
			}

			return this._changed;
		},

		/**
		 * @override
		 */
		on: function on(type, listener, context) {
			if (!currentlyRelease) {
				release();
			}

			if (this.computed && !this._events.change && !this._slaves.length) {
				this._activate();
			}

			EventEmitter.prototype.on.call(this, type, listener, context);

			return this;
		},
		/**
		 * @override
		 */
		off: function off(type, listener, context) {
			if (!currentlyRelease) {
				release();
			}

			EventEmitter.prototype.off.call(this, type, listener, context);

			if (this.computed && !this._events.change && !this._slaves.length) {
				this._deactivate();
			}

			return this;
		},

		/**
		 * @override
		 */
		_on: function _on(type, listener, context) {
			EventEmitter.prototype._on.call(this, type, listener, context == null ? this.owner : context);
		},
		/**
		 * @override
		 */
		_off: function _off(type, listener, context) {
			EventEmitter.prototype._off.call(this, type, listener, context == null ? this.owner : context);
		},

		/**
		 * @typesign (
		 *     listener: (evt: cellx~Event) -> boolean|undefined,
		 *     context?
		 * ) -> cellx.Cell;
		 */
		addChangeListener: function addChangeListener(listener, context) {
			this.on('change', listener, context);
			return this;
		},
		/**
		 * @typesign (
		 *     listener: (evt: cellx~Event) -> boolean|undefined,
		 *     context?
		 * ) -> cellx.Cell;
		 */
		removeChangeListener: function removeChangeListener(listener, context) {
			this.off('change', listener, context);
			return this;
		},

		/**
		 * @typesign (
		 *     listener: (evt: cellx~Event) -> boolean|undefined,
		 *     context?
		 * ) -> cellx.Cell;
		 */
		addErrorListener: function addErrorListener(listener, context) {
			this.on('error', listener, context);
			return this;
		},
		/**
		 * @typesign (
		 *     listener: (evt: cellx~Event) -> boolean|undefined,
		 *     context?
		 * ) -> cellx.Cell;
		 */
		removeErrorListener: function removeErrorListener(listener, context) {
			this.off('error', listener, context);
			return this;
		},

		/**
		 * @typesign (
		 *     listener: (err: Error|null, evt: cellx~Event) -> boolean|undefined,
		 *     context?
		 * ) -> cellx.Cell;
		 */
		subscribe: function subscribe(listener, context) {
			function wrapper(evt) {
				return listener.call(this, evt.error || null, evt);
			}
			wrapper[KEY_INNER] = listener;

			this
				.on('change', wrapper, context)
				.on('error', wrapper, context);

			return this;
		},
		/**
		 * @typesign (
		 *     listener: (err: Error|null, evt: cellx~Event) -> boolean|undefined,
		 *     context?
		 * ) -> cellx.Cell;
		 */
		unsubscribe: function unsubscribe(listener, context) {
			this
				.off('change', listener, context)
				.off('error', listener, context);

			return this;
		},

		/**
		 * @typesign (slave: cellx.Cell);
		 */
		_registerSlave: function _registerSlave(slave) {
			if (this.computed && !this._events.change && !this._slaves.length) {
				this._activate();
			}

			this._slaves.push(slave);
		},
		/**
		 * @typesign (slave: cellx.Cell);
		 */
		_unregisterSlave: function _unregisterSlave(slave) {
			this._slaves.splice(this._slaves.indexOf(slave), 1);

			if (this.computed && !this._events.change && !this._slaves.length) {
				this._deactivate();
			}
		},

		/**
		 * @typesign ();
		 */
		_activate: function _activate() {
			if (this._version != releaseVersion) {
				this._masters = null;
				this._level = 0;

				var value = this._tryFormula();

				if (value === error) {
					this._handleError(error.original);
				} else if (!is(this._value, value)) {
					this._value = value;
					this._changed = true;
				}

				this._version = releaseVersion;
			}

			var masters = this._masters || [];

			for (var i = masters.length; i;) {
				masters[--i]._registerSlave(this);
			}

			this._active = true;
		},
		/**
		 * @typesign ();
		 */
		_deactivate: function _deactivate() {
			var masters = this._masters || [];

			for (var i = masters.length; i;) {
				masters[--i]._unregisterSlave(this);
			}

			this._active = false;
		},

		/**
		 * @typesign (evt: cellx~Event);
		 */
		_onValueChange: function _onValueChange(evt) {
			if (this._changeEvent) {
				evt.prev = this._changeEvent;

				this._changeEvent = evt;

				if (this._value === this._fixedValue) {
					this._isChangeCancellable = false;
				}
			} else {
				releasePlan[0].push(this);

				releasePlanIndex = 0;

				if (maxLevel == -1) {
					maxLevel = 0;
				}

				evt.prev = null;

				this._changeEvent = evt;
				this._isChangeCancellable = false;

				if (!currentlyRelease) {
					nextTick(release);
				}
			}
		},

		/**
		 * @typesign () -> *;
		 */
		get: function get() {
			if (!currentlyRelease) {
				release();
			}

			if (this.computed && !this._active && this._version != releaseVersion) {
				this._masters = null;
				this._level = 0;

				var value = this._tryFormula();

				if (value === error) {
					this._handleError(error.original);
				} else {
					if (!is(this._value, value)) {
						this._value = value;
						this._changed = true;
					}
				}

				this._version = releaseVersion;
			}

			if (calculatedCell) {
				if (calculatedCell._masters) {
					if (calculatedCell._masters.indexOf(this) == -1) {
						calculatedCell._masters.push(this);

						if (calculatedCell._level <= this._level) {
							calculatedCell._level = this._level + 1;
						}
					}
				} else {
					calculatedCell._masters = [this];
					calculatedCell._level = this._level + 1;
				}
			}

			return this._get ? this._get.call(this.owner || this, this._value) : this._value;
		},

		/**
		 * @typesign (value) -> boolean;
		 */
		set: function set(value) {
			if (this.computed && !this._set) {
				throw new TypeError(
					(this.debugKey ? '[' + this.debugKey + '] ' : '') + 'Cannot write to read-only cell'
				);
			}

			var oldValue = this._value;

			if (is(oldValue, value)) {
				return false;
			}

			if (this._validate) {
				this._validate.call(this.owner || this, value);
			}

			if (this.computed) {
				this._set.call(this.owner || this, value);
			} else {
				this._value = value;

				if (oldValue instanceof EventEmitter) {
					oldValue.off('change', this._onValueChange, this);
				}
				if (value instanceof EventEmitter) {
					value.on('change', this._onValueChange, this);
				}

				if (this._changeEvent) {
					if (is(value, this._fixedValue) && this._isChangeCancellable) {
						if (releasePlan[0].length == 1) {
							releasePlan[0].pop();

							if (!maxLevel) {
								maxLevel = -1;
							}
						} else {
							releasePlan[0].splice(releasePlan[0].indexOf(this), 1);
						}

						this._changeEvent = null;
					} else {
						this._changeEvent = {
							target: this,
							type: 'change',
							oldValue: oldValue,
							value: value,
							prev: this._changeEvent
						};
					}
				} else {
					releasePlan[0].push(this);

					releasePlanIndex = 0;

					if (maxLevel == -1) {
						maxLevel = 0;
					}

					this._changeEvent = {
						target: this,
						type: 'change',
						oldValue: oldValue,
						value: value,
						prev: null
					};
					this._isChangeCancellable = true;

					if (!currentlyRelease) {
						nextTick(release);
					}
				}
			}

			return true;
		},

		/**
		 * @typesign () -> boolean|undefined;
		 */
		recalc: function recalc() {
			return this._recalc(true);
		},

		/**
		 * @typesign (force?: boolean) -> boolean|undefined;
		 */
		_recalc: function _recalc(force) {
			if (!force) {
				if (this._version == releaseVersion + 1) {
					if (++this._circularityCounter == 10) {
						this._fixed = true;
						this._version = releaseVersion + 1;

						this._handleError(new RangeError('Circular dependency detected'));

						return false;
					}
				} else {
					this._circularityCounter = 1;
				}
			}

			var oldMasters = this._masters;
			this._masters = null;

			var oldLevel = this._level;
			this._level = 0;

			var value = this._tryFormula();

			var masters = this._masters || [];
			var haveRemovedMasters = false;

			for (var i = oldMasters.length; i;) {
				var oldMaster = oldMasters[--i];

				if (masters.indexOf(oldMaster) == -1) {
					oldMaster._unregisterSlave(this);
					haveRemovedMasters = true;
				}
			}

			if (haveRemovedMasters || oldMasters.length < masters.length) {
				for (var j = masters.length; j;) {
					var master = masters[--j];

					if (oldMasters.indexOf(master) == -1) {
						master._registerSlave(this);
					}
				}

				var level = this._level;

				if (level > oldLevel) {
					(releasePlan[level] || (releasePlan[level] = [])).push(this);

					if (maxLevel < level) {
						maxLevel = level;
					}

					if (force) {
						nextTick(release);
					}

					return;
				}
			}

			this._fixed = true;
			this._version = releaseVersion + 1;

			if (value === error) {
				this._handleError(error.original);
			} else {
				var oldValue = this._value;

				if (!is(oldValue, value) || value instanceof EventEmitter) {
					this._value = value;
					this._changed = true;

					if (this._events.change) {
						this.emit({
							type: 'change',
							oldValue: oldValue,
							value: value,
							prev: null
						});
					}

					var slaves = this._slaves;

					for (var k = 0, n = slaves.length; k < n; k++) {
						var slave = slaves[k];

						if (slave._fixed) {
							var slaveLevel = slave._level;

							(releasePlan[slaveLevel] || (releasePlan[slaveLevel] = [])).push(slave);

							if (maxLevel < slaveLevel) {
								maxLevel = slaveLevel;
							}

							slave._fixed = false;
						}
					}

					return true;
				}
			}

			return false;
		},

		/**
		 * @typesign () -> *;
		 */
		_tryFormula: function _tryFormula() {
			var prevCalculatedCell = calculatedCell;
			calculatedCell = this;

			try {
				var value = this._formula.call(this.owner || this);

				if (this._validate) {
					this._validate.call(this.owner || this, value);
				}

				return value;
			} catch (err) {
				error.original = err;
				return error;
			} finally {
				calculatedCell = prevCalculatedCell;
			}
		},

		/**
		 * @typesign (err);
		 */
		_handleError: function _handleError(err) {
			this._logError(err);

			this._handleErrorEvent({
				type: 'error',
				error: err === Object(err) ? err : { message: err }
			});
		},

		/**
		 * @override
		 * @typesign (...msg);
		 */
		_logError: function _logError() {
			var msg = slice.call(arguments);

			if (this.debugKey) {
				msg.unshift('[' + this.debugKey + ']');
			}

			EventEmitter.prototype._logError.apply(this, msg);
		},

		/**
		 * @typesign (evt: cellx~Event);
		 */
		_handleErrorEvent: function _handleErrorEvent(evt) {
			if (this._lastErrorEvent === evt) {
				return;
			}
			this._lastErrorEvent = evt;

			this._handleEvent(evt);

			var slaves = this._slaves;

			for (var i = 0, l = slaves.length; i < l; i++) {
				if (evt.isPropagationStopped) {
					break;
				}

				slaves[i]._handleErrorEvent(evt);
			}
		},

		/**
		 * @typesign () -> cellx.Cell;
		 */
		dispose: function dispose() {
			if (!currentlyRelease) {
				release();
			}

			this._dispose();

			return this;
		},

		/**
		 * @typesign ();
		 */
		_dispose: function _dispose() {
			this.off();

			if (this._active) {
				var slaves = this._slaves;

				for (var i = 0, l = slaves.length; i < l; i++) {
					slaves[i]._dispose();
				}
			}
		}
	});

	module.exports = Cell;


/***/ }
/******/ ])
});
;
/**
 * Overwatch by Shinko to Kuma
 * First section of the code is the source code for jscolor, a JavaScript color picker library.
 * The second section is the source code for Overwatch, a TW script (line 3569 onwards).
 */

//relocate to mass scavenging page
if (window.location.href.indexOf('screen=map') < 0) {
    //relocate
    window.location.assign(game_data.link_base_pure + "map");
}

/**
 * jscolor - JavaScript Color Picker
 *
 * @link    http://jscolor.com
 * @license For open source use: GPLv3
 * @author  Jan Odvarko - East Desire
 * @version 2.5.2
 *
 * See usage examples at http://jscolor.com/examples/
 */
(function (global, factory) {

    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        // Export jscolor as a module
        module.exports = global.document ?
            factory (global) :
            function (win) {
                if (!win.document) {
                    throw new Error('jscolor needs a window with document');
                }
                return factory(win);
            }
        return;
    }

    // Default use (no module export)
    factory(global);

})(typeof window !== 'undefined' ? window : this, function (window) { // BEGIN factory

// BEGIN jscolor code


    'use strict';


    var jscolor = (function () { // BEGIN jscolor

        var jsc = {


            initialized : false,

            instances : [], // created instances of jscolor

            readyQueue : [], // functions waiting to be called after init


            register : function () {
                if (typeof window !== 'undefined' && window.document) {
                    if (window.document.readyState !== 'loading') {
                        jsc.pub.init();
                    } else {
                        window.document.addEventListener('DOMContentLoaded', jsc.pub.init, false);
                    }
                }
            },


            installBySelector : function (selector, rootNode) {
                rootNode = rootNode ? jsc.node(rootNode) : window.document;
                if (!rootNode) {
                    throw new Error('Missing root node');
                }

                var elms = rootNode.querySelectorAll(selector);

                // for backward compatibility with DEPRECATED installation/configuration using className
                var matchClass = new RegExp('(^|\\s)(' + jsc.pub.lookupClass + ')(\\s*(\\{[^}]*\\})|\\s|$)', 'i');

                for (var i = 0; i < elms.length; i += 1) {

                    if (elms[i].jscolor && elms[i].jscolor instanceof jsc.pub) {
                        continue; // jscolor already installed on this element
                    }

                    if (elms[i].type !== undefined && elms[i].type.toLowerCase() == 'color' && jsc.isColorAttrSupported) {
                        continue; // skips inputs of type 'color' if supported by the browser
                    }

                    var dataOpts, m;

                    if (
                        (dataOpts = jsc.getDataAttr(elms[i], 'jscolor')) !== null ||
                        (elms[i].className && (m = elms[i].className.match(matchClass))) // installation using className (DEPRECATED)
                    ) {
                        var targetElm = elms[i];

                        var optsStr = '';
                        if (dataOpts !== null) {
                            optsStr = dataOpts;

                        } else if (m) { // installation using className (DEPRECATED)
                            console.warn('Installation using class name is DEPRECATED. Use data-jscolor="" attribute instead.' + jsc.docsRef);
                            if (m[4]) {
                                optsStr = m[4];
                            }
                        }

                        var opts = null;
                        if (optsStr.trim()) {
                            try {
                                opts = jsc.parseOptionsStr(optsStr);
                            } catch (e) {
                                console.warn(e + '\n' + optsStr);
                            }
                        }

                        try {
                            new jsc.pub(targetElm, opts);
                        } catch (e) {
                            console.warn(e);
                        }
                    }
                }
            },


            parseOptionsStr : function (str) {
                var opts = null;

                try {
                    opts = JSON.parse(str);

                } catch (eParse) {
                    if (!jsc.pub.looseJSON) {
                        throw new Error('Could not parse jscolor options as JSON: ' + eParse);
                    } else {
                        // loose JSON syntax is enabled -> try to evaluate the options string as JavaScript object
                        try {
                            opts = (new Function ('var opts = (' + str + '); return typeof opts === "object" ? opts : {};'))();
                        } catch (eEval) {
                            throw new Error('Could not evaluate jscolor options: ' + eEval);
                        }
                    }
                }
                return opts;
            },


            getInstances : function () {
                var inst = [];
                for (var i = 0; i < jsc.instances.length; i += 1) {
                    // if the targetElement still exists, the instance is considered "alive"
                    if (jsc.instances[i] && jsc.instances[i].targetElement) {
                        inst.push(jsc.instances[i]);
                    }
                }
                return inst;
            },


            createEl : function (tagName) {
                var el = window.document.createElement(tagName);
                jsc.setData(el, 'gui', true);
                return el;
            },


            node : function (nodeOrSelector) {
                if (!nodeOrSelector) {
                    return null;
                }

                if (typeof nodeOrSelector === 'string') {
                    // query selector
                    var sel = nodeOrSelector;
                    var el = null;
                    try {
                        el = window.document.querySelector(sel);
                    } catch (e) {
                        console.warn(e);
                        return null;
                    }
                    if (!el) {
                        console.warn('No element matches the selector: %s', sel);
                    }
                    return el;
                }

                if (jsc.isNode(nodeOrSelector)) {
                    // DOM node
                    return nodeOrSelector;
                }

                console.warn('Invalid node of type %s: %s', typeof nodeOrSelector, nodeOrSelector);
                return null;
            },


            // See https://stackoverflow.com/questions/384286/
            isNode : function (val) {
                if (typeof Node === 'object') {
                    return val instanceof Node;
                }
                return val && typeof val === 'object' && typeof val.nodeType === 'number' && typeof val.nodeName === 'string';
            },


            nodeName : function (node) {
                if (node && node.nodeName) {
                    return node.nodeName.toLowerCase();
                }
                return false;
            },


            removeChildren : function (node) {
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
            },


            isTextInput : function (el) {
                return el && jsc.nodeName(el) === 'input' && el.type.toLowerCase() === 'text';
            },


            isButton : function (el) {
                if (!el) {
                    return false;
                }
                var n = jsc.nodeName(el);
                return (
                    (n === 'button') ||
                    (n === 'input' && ['button', 'submit', 'reset'].indexOf(el.type.toLowerCase()) > -1)
                );
            },


            isButtonEmpty : function (el) {
                switch (jsc.nodeName(el)) {
                    case 'input': return (!el.value || el.value.trim() === '');
                    case 'button': return (el.textContent.trim() === '');
                }
                return null; // could not determine element's text
            },


            // See https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
            isPassiveEventSupported : (function () {
                var supported = false;

                try {
                    var opts = Object.defineProperty({}, 'passive', {
                        get: function () { supported = true; }
                    });
                    window.addEventListener('testPassive', null, opts);
                    window.removeEventListener('testPassive', null, opts);
                } catch (e) {}

                return supported;
            })(),


            isColorAttrSupported : (function () {
                var elm = window.document.createElement('input');
                if (elm.setAttribute) {
                    elm.setAttribute('type', 'color');
                    if (elm.type.toLowerCase() == 'color') {
                        return true;
                    }
                }
                return false;
            })(),


            dataProp : '_data_jscolor',


            // usage:
            //   setData(obj, prop, value)
            //   setData(obj, {prop:value, ...})
            //
            setData : function () {
                var obj = arguments[0];

                if (arguments.length === 3) {
                    // setting a single property
                    var data = obj.hasOwnProperty(jsc.dataProp) ? obj[jsc.dataProp] : (obj[jsc.dataProp] = {});
                    var prop = arguments[1];
                    var value = arguments[2];

                    data[prop] = value;
                    return true;

                } else if (arguments.length === 2 && typeof arguments[1] === 'object') {
                    // setting multiple properties
                    var data = obj.hasOwnProperty(jsc.dataProp) ? obj[jsc.dataProp] : (obj[jsc.dataProp] = {});
                    var map = arguments[1];

                    for (var prop in map) {
                        if (map.hasOwnProperty(prop)) {
                            data[prop] = map[prop];
                        }
                    }
                    return true;
                }

                throw new Error('Invalid arguments');
            },


            // usage:
            //   removeData(obj, prop, [prop...])
            //
            removeData : function () {
                var obj = arguments[0];
                if (!obj.hasOwnProperty(jsc.dataProp)) {
                    return true; // data object does not exist
                }
                for (var i = 1; i < arguments.length; i += 1) {
                    var prop = arguments[i];
                    delete obj[jsc.dataProp][prop];
                }
                return true;
            },


            getData : function (obj, prop, setDefault) {
                if (!obj.hasOwnProperty(jsc.dataProp)) {
                    // data object does not exist
                    if (setDefault !== undefined) {
                        obj[jsc.dataProp] = {}; // create data object
                    } else {
                        return undefined; // no value to return
                    }
                }
                var data = obj[jsc.dataProp];

                if (!data.hasOwnProperty(prop) && setDefault !== undefined) {
                    data[prop] = setDefault;
                }
                return data[prop];
            },


            getDataAttr : function (el, name) {
                var attrName = 'data-' + name;
                var attrValue = el.getAttribute(attrName);
                return attrValue;
            },


            setDataAttr : function (el, name, value) {
                var attrName = 'data-' + name;
                el.setAttribute(attrName, value);
            },


            _attachedGroupEvents : {},


            attachGroupEvent : function (groupName, el, evnt, func) {
                if (!jsc._attachedGroupEvents.hasOwnProperty(groupName)) {
                    jsc._attachedGroupEvents[groupName] = [];
                }
                jsc._attachedGroupEvents[groupName].push([el, evnt, func]);
                el.addEventListener(evnt, func, false);
            },


            detachGroupEvents : function (groupName) {
                if (jsc._attachedGroupEvents.hasOwnProperty(groupName)) {
                    for (var i = 0; i < jsc._attachedGroupEvents[groupName].length; i += 1) {
                        var evt = jsc._attachedGroupEvents[groupName][i];
                        evt[0].removeEventListener(evt[1], evt[2], false);
                    }
                    delete jsc._attachedGroupEvents[groupName];
                }
            },


            preventDefault : function (e) {
                if (e.preventDefault) { e.preventDefault(); }
                e.returnValue = false;
            },


            triggerEvent : function (el, eventName, bubbles, cancelable) {
                if (!el) {
                    return;
                }

                var ev = null;

                if (typeof Event === 'function') {
                    ev = new Event(eventName, {
                        bubbles: bubbles,
                        cancelable: cancelable
                    });
                } else {
                    // IE
                    ev = window.document.createEvent('Event');
                    ev.initEvent(eventName, bubbles, cancelable);
                }

                if (!ev) {
                    return false;
                }

                // so that we know that the event was triggered internally
                jsc.setData(ev, 'internal', true);

                el.dispatchEvent(ev);
                return true;
            },


            triggerInputEvent : function (el, eventName, bubbles, cancelable) {
                if (!el) {
                    return;
                }
                if (jsc.isTextInput(el)) {
                    jsc.triggerEvent(el, eventName, bubbles, cancelable);
                }
            },


            eventKey : function (ev) {
                var keys = {
                    9: 'Tab',
                    13: 'Enter',
                    27: 'Escape',
                };
                if (typeof ev.code === 'string') {
                    return ev.code;
                } else if (ev.keyCode !== undefined && keys.hasOwnProperty(ev.keyCode)) {
                    return keys[ev.keyCode];
                }
                return null;
            },


            strList : function (str) {
                if (!str) {
                    return [];
                }
                return str.replace(/^\s+|\s+$/g, '').split(/\s+/);
            },


            // The className parameter (str) can only contain a single class name
            hasClass : function (elm, className) {
                if (!className) {
                    return false;
                }
                if (elm.classList !== undefined) {
                    return elm.classList.contains(className);
                }
                // polyfill
                return -1 != (' ' + elm.className.replace(/\s+/g, ' ') + ' ').indexOf(' ' + className + ' ');
            },


            // The className parameter (str) can contain multiple class names separated by whitespace
            addClass : function (elm, className) {
                var classNames = jsc.strList(className);

                if (elm.classList !== undefined) {
                    for (var i = 0; i < classNames.length; i += 1) {
                        elm.classList.add(classNames[i]);
                    }
                    return;
                }
                // polyfill
                for (var i = 0; i < classNames.length; i += 1) {
                    if (!jsc.hasClass(elm, classNames[i])) {
                        elm.className += (elm.className ? ' ' : '') + classNames[i];
                    }
                }
            },


            // The className parameter (str) can contain multiple class names separated by whitespace
            removeClass : function (elm, className) {
                var classNames = jsc.strList(className);

                if (elm.classList !== undefined) {
                    for (var i = 0; i < classNames.length; i += 1) {
                        elm.classList.remove(classNames[i]);
                    }
                    return;
                }
                // polyfill
                for (var i = 0; i < classNames.length; i += 1) {
                    var repl = new RegExp(
                        '^\\s*' + classNames[i] + '\\s*|' +
                        '\\s*' + classNames[i] + '\\s*$|' +
                        '\\s+' + classNames[i] + '(\\s+)',
                        'g'
                    );
                    elm.className = elm.className.replace(repl, '$1');
                }
            },


            getCompStyle : function (elm) {
                var compStyle = window.getComputedStyle ? window.getComputedStyle(elm) : elm.currentStyle;

                // Note: In Firefox, getComputedStyle returns null in a hidden iframe,
                // that's why we need to check if the returned value is non-empty
                if (!compStyle) {
                    return {};
                }
                return compStyle;
            },


            // Note:
            //   Setting a property to NULL reverts it to the state before it was first set
            //   with the 'reversible' flag enabled
            //
            setStyle : function (elm, styles, important, reversible) {
                // using '' for standard priority (IE10 apparently doesn't like value undefined)
                var priority = important ? 'important' : '';
                var origStyle = null;

                for (var prop in styles) {
                    if (styles.hasOwnProperty(prop)) {
                        var setVal = null;

                        if (styles[prop] === null) {
                            // reverting a property value

                            if (!origStyle) {
                                // get the original style object, but dont't try to create it if it doesn't exist
                                origStyle = jsc.getData(elm, 'origStyle');
                            }
                            if (origStyle && origStyle.hasOwnProperty(prop)) {
                                // we have property's original value -> use it
                                setVal = origStyle[prop];
                            }

                        } else {
                            // setting a property value

                            if (reversible) {
                                if (!origStyle) {
                                    // get the original style object and if it doesn't exist, create it
                                    origStyle = jsc.getData(elm, 'origStyle', {});
                                }
                                if (!origStyle.hasOwnProperty(prop)) {
                                    // original property value not yet stored -> store it
                                    origStyle[prop] = elm.style[prop];
                                }
                            }
                            setVal = styles[prop];
                        }

                        if (setVal !== null) {
                            elm.style.setProperty(prop, setVal, priority);
                        }
                    }
                }
            },


            appendCss : function (css) {
                var head = document.querySelector('head');
                var style = document.createElement('style');
                style.innerText = css;
                head.appendChild(style);
            },


            appendDefaultCss : function (css) {
                jsc.appendCss(
                    [
                        '.jscolor-wrap, .jscolor-wrap div, .jscolor-wrap canvas { ' +
                        'position:static; display:block; visibility:visible; overflow:visible; margin:0; padding:0; ' +
                        'border:none; border-radius:0; outline:none; z-index:auto; float:none; ' +
                        'width:auto; height:auto; left:auto; right:auto; top:auto; bottom:auto; min-width:0; min-height:0; max-width:none; max-height:none; ' +
                        'background:none; clip:auto; opacity:1; transform:none; box-shadow:none; box-sizing:content-box; ' +
                        '}',
                        '.jscolor-wrap { clear:both; }',
                        '.jscolor-wrap .jscolor-picker { position:relative; }',
                        '.jscolor-wrap .jscolor-shadow { position:absolute; left:0; top:0; width:100%; height:100%; }',
                        '.jscolor-wrap .jscolor-border { position:relative; }',
                        '.jscolor-wrap .jscolor-palette { position:absolute; }',
                        '.jscolor-wrap .jscolor-palette-sw { position:absolute; display:block; cursor:pointer; }',
                        '.jscolor-wrap .jscolor-btn { position:absolute; overflow:hidden; white-space:nowrap; font:13px sans-serif; text-align:center; cursor:pointer; }',
                    ].join('\n')
                );
            },


            hexColor : function (r, g, b) {
                return '#' + (
                    ('0' + Math.round(r).toString(16)).slice(-2) +
                    ('0' + Math.round(g).toString(16)).slice(-2) +
                    ('0' + Math.round(b).toString(16)).slice(-2)
                ).toUpperCase();
            },


            hexaColor : function (r, g, b, a) {
                return '#' + (
                    ('0' + Math.round(r).toString(16)).slice(-2) +
                    ('0' + Math.round(g).toString(16)).slice(-2) +
                    ('0' + Math.round(b).toString(16)).slice(-2) +
                    ('0' + Math.round(a * 255).toString(16)).slice(-2)
                ).toUpperCase();
            },


            rgbColor : function (r, g, b) {
                return 'rgb(' +
                    Math.round(r) + ',' +
                    Math.round(g) + ',' +
                    Math.round(b) +
                    ')';
            },


            rgbaColor : function (r, g, b, a) {
                return 'rgba(' +
                    Math.round(r) + ',' +
                    Math.round(g) + ',' +
                    Math.round(b) + ',' +
                    (Math.round((a===undefined || a===null ? 1 : a) * 100) / 100) +
                    ')';
            },


            linearGradient : (function () {

                function getFuncName () {
                    var stdName = 'linear-gradient';
                    var prefixes = ['', '-webkit-', '-moz-', '-o-', '-ms-'];
                    var helper = window.document.createElement('div');

                    for (var i = 0; i < prefixes.length; i += 1) {
                        var tryFunc = prefixes[i] + stdName;
                        var tryVal = tryFunc + '(to right, rgba(0,0,0,0), rgba(0,0,0,0))';

                        helper.style.background = tryVal;
                        if (helper.style.background) { // CSS background successfully set -> function name is supported
                            return tryFunc;
                        }
                    }
                    return stdName; // fallback to standard 'linear-gradient' without vendor prefix
                }

                var funcName = getFuncName();

                return function () {
                    return funcName + '(' + Array.prototype.join.call(arguments, ', ') + ')';
                };

            })(),


            setBorderRadius : function (elm, value) {
                jsc.setStyle(elm, {'border-radius' : value || '0'});
            },


            setBoxShadow : function (elm, value) {
                jsc.setStyle(elm, {'box-shadow': value || 'none'});
            },


            getElementPos : function (e, relativeToViewport) {
                var x=0, y=0;
                var rect = e.getBoundingClientRect();
                x = rect.left;
                y = rect.top;
                if (!relativeToViewport) {
                    var viewPos = jsc.getViewPos();
                    x += viewPos[0];
                    y += viewPos[1];
                }
                return [x, y];
            },


            getElementSize : function (e) {
                return [e.offsetWidth, e.offsetHeight];
            },


            // get pointer's X/Y coordinates relative to viewport
            getAbsPointerPos : function (e) {
                var x = 0, y = 0;
                if (typeof e.changedTouches !== 'undefined' && e.changedTouches.length) {
                    // touch devices
                    x = e.changedTouches[0].clientX;
                    y = e.changedTouches[0].clientY;
                } else if (typeof e.clientX === 'number') {
                    x = e.clientX;
                    y = e.clientY;
                }
                return { x: x, y: y };
            },


            // get pointer's X/Y coordinates relative to target element
            getRelPointerPos : function (e) {
                var target = e.target || e.srcElement;
                var targetRect = target.getBoundingClientRect();

                var x = 0, y = 0;

                var clientX = 0, clientY = 0;
                if (typeof e.changedTouches !== 'undefined' && e.changedTouches.length) {
                    // touch devices
                    clientX = e.changedTouches[0].clientX;
                    clientY = e.changedTouches[0].clientY;
                } else if (typeof e.clientX === 'number') {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }

                x = clientX - targetRect.left;
                y = clientY - targetRect.top;
                return { x: x, y: y };
            },


            getViewPos : function () {
                var doc = window.document.documentElement;
                return [
                    (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
                    (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
                ];
            },


            getViewSize : function () {
                var doc = window.document.documentElement;
                return [
                    (window.innerWidth || doc.clientWidth),
                    (window.innerHeight || doc.clientHeight),
                ];
            },


            // r: 0-255
            // g: 0-255
            // b: 0-255
            //
            // returns: [ 0-360, 0-100, 0-100 ]
            //
            RGB_HSV : function (r, g, b) {
                r /= 255;
                g /= 255;
                b /= 255;
                var n = Math.min(Math.min(r,g),b);
                var v = Math.max(Math.max(r,g),b);
                var m = v - n;
                if (m === 0) { return [ null, 0, 100 * v ]; }
                var h = r===n ? 3+(b-g)/m : (g===n ? 5+(r-b)/m : 1+(g-r)/m);
                return [
                    60 * (h===6?0:h),
                    100 * (m/v),
                    100 * v
                ];
            },


            // h: 0-360
            // s: 0-100
            // v: 0-100
            //
            // returns: [ 0-255, 0-255, 0-255 ]
            //
            HSV_RGB : function (h, s, v) {
                var u = 255 * (v / 100);

                if (h === null) {
                    return [ u, u, u ];
                }

                h /= 60;
                s /= 100;

                var i = Math.floor(h);
                var f = i%2 ? h-i : 1-(h-i);
                var m = u * (1 - s);
                var n = u * (1 - s * f);
                switch (i) {
                    case 6:
                    case 0: return [u,n,m];
                    case 1: return [n,u,m];
                    case 2: return [m,u,n];
                    case 3: return [m,n,u];
                    case 4: return [n,m,u];
                    case 5: return [u,m,n];
                }
            },


            parseColorString : function (str) {
                var ret = {
                    rgba: null,
                    format: null // 'hex' | 'hexa' | 'rgb' | 'rgba'
                };

                var m;

                if (m = str.match(/^\W*([0-9A-F]{3,8})\W*$/i)) {
                    // HEX notation

                    if (m[1].length === 8) {
                        // 8-char notation (= with alpha)
                        ret.format = 'hexa';
                        ret.rgba = [
                            parseInt(m[1].slice(0,2),16),
                            parseInt(m[1].slice(2,4),16),
                            parseInt(m[1].slice(4,6),16),
                            parseInt(m[1].slice(6,8),16) / 255
                        ];

                    } else if (m[1].length === 6) {
                        // 6-char notation
                        ret.format = 'hex';
                        ret.rgba = [
                            parseInt(m[1].slice(0,2),16),
                            parseInt(m[1].slice(2,4),16),
                            parseInt(m[1].slice(4,6),16),
                            null
                        ];

                    } else if (m[1].length === 3) {
                        // 3-char notation
                        ret.format = 'hex';
                        ret.rgba = [
                            parseInt(m[1].charAt(0) + m[1].charAt(0),16),
                            parseInt(m[1].charAt(1) + m[1].charAt(1),16),
                            parseInt(m[1].charAt(2) + m[1].charAt(2),16),
                            null
                        ];

                    } else {
                        return false;
                    }

                    return ret;
                }

                if (m = str.match(/^\W*rgba?\(([^)]*)\)\W*$/i)) {
                    // rgb(...) or rgba(...) notation

                    var par = m[1].split(',');
                    var re = /^\s*(\d+|\d*\.\d+|\d+\.\d*)\s*$/;
                    var mR, mG, mB, mA;
                    if (
                        par.length >= 3 &&
                        (mR = par[0].match(re)) &&
                        (mG = par[1].match(re)) &&
                        (mB = par[2].match(re))
                    ) {
                        ret.format = 'rgb';
                        ret.rgba = [
                            parseFloat(mR[1]) || 0,
                            parseFloat(mG[1]) || 0,
                            parseFloat(mB[1]) || 0,
                            null
                        ];

                        if (
                            par.length >= 4 &&
                            (mA = par[3].match(re))
                        ) {
                            ret.format = 'rgba';
                            ret.rgba[3] = parseFloat(mA[1]) || 0;
                        }
                        return ret;
                    }
                }

                return false;
            },


            parsePaletteValue : function (mixed) {
                var vals = [];

                if (typeof mixed === 'string') { // input is a string of space separated color values
                    // rgb() and rgba() may contain spaces too, so let's find all color values by regex
                    mixed.replace(/#[0-9A-F]{3}\b|#[0-9A-F]{6}([0-9A-F]{2})?\b|rgba?\(([^)]*)\)/ig, function (val) {
                        vals.push(val);
                    });
                } else if (Array.isArray(mixed)) { // input is an array of color values
                    vals = mixed;
                }

                // convert all values into uniform color format

                var colors = [];

                for (var i = 0; i < vals.length; i++) {
                    var color = jsc.parseColorString(vals[i]);
                    if (color) {
                        colors.push(color);
                    }
                }

                return colors;
            },


            containsTranparentColor : function (colors) {
                for (var i = 0; i < colors.length; i++) {
                    var a = colors[i].rgba[3];
                    if (a !== null && a < 1.0) {
                        return true;
                    }
                }
                return false;
            },


            isAlphaFormat : function (format) {
                switch (format.toLowerCase()) {
                    case 'hexa':
                    case 'rgba':
                        return true;
                }
                return false;
            },


            // Canvas scaling for retina displays
            //
            // adapted from https://www.html5rocks.com/en/tutorials/canvas/hidpi/
            //
            scaleCanvasForHighDPR : function (canvas) {
                var dpr = window.devicePixelRatio || 1;
                canvas.width *= dpr;
                canvas.height *= dpr;
                var ctx = canvas.getContext('2d');
                ctx.scale(dpr, dpr);
            },


            genColorPreviewCanvas : function (color, separatorPos, specWidth, scaleForHighDPR) {

                var sepW = Math.round(jsc.pub.previewSeparator.length);
                var sqSize = jsc.pub.chessboardSize;
                var sqColor1 = jsc.pub.chessboardColor1;
                var sqColor2 = jsc.pub.chessboardColor2;

                var cWidth = specWidth ? specWidth : sqSize * 2;
                var cHeight = sqSize * 2;

                var canvas = jsc.createEl('canvas');
                var ctx = canvas.getContext('2d');

                canvas.width = cWidth;
                canvas.height = cHeight;
                if (scaleForHighDPR) {
                    jsc.scaleCanvasForHighDPR(canvas);
                }

                // transparency chessboard - background
                ctx.fillStyle = sqColor1;
                ctx.fillRect(0, 0, cWidth, cHeight);

                // transparency chessboard - squares
                ctx.fillStyle = sqColor2;
                for (var x = 0; x < cWidth; x += sqSize * 2) {
                    ctx.fillRect(x, 0, sqSize, sqSize);
                    ctx.fillRect(x + sqSize, sqSize, sqSize, sqSize);
                }

                if (color) {
                    // actual color in foreground
                    ctx.fillStyle = color;
                    ctx.fillRect(0, 0, cWidth, cHeight);
                }

                var start = null;
                switch (separatorPos) {
                    case 'left':
                        start = 0;
                        ctx.clearRect(0, 0, sepW/2, cHeight);
                        break;
                    case 'right':
                        start = cWidth - sepW;
                        ctx.clearRect(cWidth - (sepW/2), 0, sepW/2, cHeight);
                        break;
                }
                if (start !== null) {
                    ctx.lineWidth = 1;
                    for (var i = 0; i < jsc.pub.previewSeparator.length; i += 1) {
                        ctx.beginPath();
                        ctx.strokeStyle = jsc.pub.previewSeparator[i];
                        ctx.moveTo(0.5 + start + i, 0);
                        ctx.lineTo(0.5 + start + i, cHeight);
                        ctx.stroke();
                    }
                }

                return {
                    canvas: canvas,
                    width: cWidth,
                    height: cHeight,
                };
            },


            // if position or width is not set => fill the entire element (0%-100%)
            genColorPreviewGradient : function (color, position, width) {
                var params = [];

                if (position && width) {
                    params = [
                        'to ' + {'left':'right', 'right':'left'}[position],
                        color + ' 0%',
                        color + ' ' + width + 'px',
                        'rgba(0,0,0,0) ' + (width + 1) + 'px',
                        'rgba(0,0,0,0) 100%',
                    ];
                } else {
                    params = [
                        'to right',
                        color + ' 0%',
                        color + ' 100%',
                    ];
                }

                return jsc.linearGradient.apply(this, params);
            },


            redrawPosition : function () {

                if (!jsc.picker || !jsc.picker.owner) {
                    return; // picker is not shown
                }

                var thisObj = jsc.picker.owner;

                if (thisObj.container !== window.document.body) {

                    jsc._drawPosition(thisObj, 0, 0, 'relative', false);

                } else {

                    var tp, vp;

                    if (thisObj.fixed) {
                        // Fixed elements are positioned relative to viewport,
                        // therefore we can ignore the scroll offset
                        tp = jsc.getElementPos(thisObj.targetElement, true); // target pos
                        vp = [0, 0]; // view pos
                    } else {
                        tp = jsc.getElementPos(thisObj.targetElement); // target pos
                        vp = jsc.getViewPos(); // view pos
                    }

                    var ts = jsc.getElementSize(thisObj.targetElement); // target size
                    var vs = jsc.getViewSize(); // view size
                    var pd = jsc.getPickerDims(thisObj);
                    var ps = [pd.borderW, pd.borderH]; // picker outer size
                    var a, b, c;
                    switch (thisObj.position.toLowerCase()) {
                        case 'left': a=1; b=0; c=-1; break;
                        case 'right':a=1; b=0; c=1; break;
                        case 'top':  a=0; b=1; c=-1; break;
                        default:     a=0; b=1; c=1; break;
                    }
                    var l = (ts[b]+ps[b])/2;

                    // compute picker position
                    if (!thisObj.smartPosition) {
                        var pp = [
                            tp[a],
                            tp[b]+ts[b]-l+l*c
                        ];
                    } else {
                        var pp = [
                            -vp[a]+tp[a]+ps[a] > vs[a] ?
                                (-vp[a]+tp[a]+ts[a]/2 > vs[a]/2 && tp[a]+ts[a]-ps[a] >= 0 ? tp[a]+ts[a]-ps[a] : tp[a]) :
                                tp[a],
                            -vp[b]+tp[b]+ts[b]+ps[b]-l+l*c > vs[b] ?
                                (-vp[b]+tp[b]+ts[b]/2 > vs[b]/2 && tp[b]+ts[b]-l-l*c >= 0 ? tp[b]+ts[b]-l-l*c : tp[b]+ts[b]-l+l*c) :
                                (tp[b]+ts[b]-l+l*c >= 0 ? tp[b]+ts[b]-l+l*c : tp[b]+ts[b]-l-l*c)
                        ];
                    }

                    var x = pp[a];
                    var y = pp[b];
                    var positionValue = thisObj.fixed ? 'fixed' : 'absolute';
                    var contractShadow =
                        (pp[0] + ps[0] > tp[0] || pp[0] < tp[0] + ts[0]) &&
                        (pp[1] + ps[1] < tp[1] + ts[1]);

                    jsc._drawPosition(thisObj, x, y, positionValue, contractShadow);

                }

            },


            _drawPosition : function (thisObj, x, y, positionValue, contractShadow) {
                var vShadow = contractShadow ? 0 : thisObj.shadowBlur; // px

                jsc.picker.wrap.style.position = positionValue;

                if ( // To avoid unnecessary repositioning during scroll
                    Math.round(parseFloat(jsc.picker.wrap.style.left)) !== Math.round(x) ||
                    Math.round(parseFloat(jsc.picker.wrap.style.top)) !== Math.round(y)
                ) {
                    jsc.picker.wrap.style.left = x + 'px';
                    jsc.picker.wrap.style.top = y + 'px';
                }

                jsc.setBoxShadow(
                    jsc.picker.boxS,
                    thisObj.shadow ?
                        new jsc.BoxShadow(0, vShadow, thisObj.shadowBlur, 0, thisObj.shadowColor) :
                        null);
            },


            getPickerDims : function (thisObj) {
                var w = 2 * thisObj.controlBorderWidth + thisObj.width;
                var h = 2 * thisObj.controlBorderWidth + thisObj.height;

                var sliderSpace = 2 * thisObj.controlBorderWidth + 2 * jsc.getControlPadding(thisObj) + thisObj.sliderSize;

                if (jsc.getSliderChannel(thisObj)) {
                    w += sliderSpace;
                }
                if (thisObj.hasAlphaChannel()) {
                    w += sliderSpace;
                }

                var pal = jsc.getPaletteDims(thisObj, w);

                if (pal.height) {
                    h += pal.height + thisObj.padding;
                }
                if (thisObj.closeButton) {
                    h += 2 * thisObj.controlBorderWidth + thisObj.padding + thisObj.buttonHeight;
                }

                var pW = w + (2 * thisObj.padding);
                var pH = h + (2 * thisObj.padding);

                return {
                    contentW: w,
                    contentH: h,
                    paddedW: pW,
                    paddedH: pH,
                    borderW: pW + (2 * thisObj.borderWidth),
                    borderH: pH + (2 * thisObj.borderWidth),
                    palette: pal,
                };
            },


            getPaletteDims : function (thisObj, width) {
                var cols = 0, rows = 0, cellW = 0, cellH = 0, height = 0;
                var sampleCount = thisObj._palette ? thisObj._palette.length : 0;

                if (sampleCount) {
                    cols = thisObj.paletteCols;
                    rows = cols > 0 ? Math.ceil(sampleCount / cols) : 0;

                    // color sample's dimensions (includes border)
                    cellW = Math.max(1, Math.floor((width - ((cols - 1) * thisObj.paletteSpacing)) / cols));
                    cellH = thisObj.paletteHeight ? Math.min(thisObj.paletteHeight, cellW) : cellW;
                }

                if (rows) {
                    height =
                        rows * cellH +
                        (rows - 1) * thisObj.paletteSpacing;
                }

                return {
                    cols: cols,
                    rows: rows,
                    cellW: cellW,
                    cellH: cellH,
                    width: width,
                    height: height,
                };
            },


            getControlPadding : function (thisObj) {
                return Math.max(
                    thisObj.padding / 2,
                    (2 * thisObj.pointerBorderWidth + thisObj.pointerThickness) - thisObj.controlBorderWidth
                );
            },


            getPadYChannel : function (thisObj) {
                switch (thisObj.mode.charAt(1).toLowerCase()) {
                    case 'v': return 'v'; break;
                }
                return 's';
            },


            getSliderChannel : function (thisObj) {
                if (thisObj.mode.length > 2) {
                    switch (thisObj.mode.charAt(2).toLowerCase()) {
                        case 's': return 's'; break;
                        case 'v': return 'v'; break;
                    }
                }
                return null;
            },


            // calls function specified in picker's property
            triggerCallback : function (thisObj, prop) {
                if (!thisObj[prop]) {
                    return; // callback func not specified
                }
                var callback = null;

                if (typeof thisObj[prop] === 'string') {
                    // string with code
                    try {
                        callback = new Function (thisObj[prop]);
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    // function
                    callback = thisObj[prop];
                }

                if (callback) {
                    callback.call(thisObj);
                }
            },


            // Triggers a color change related event(s) on all picker instances.
            // It is possible to specify multiple events separated with a space.
            triggerGlobal : function (eventNames) {
                var inst = jsc.getInstances();
                for (var i = 0; i < inst.length; i += 1) {
                    inst[i].trigger(eventNames);
                }
            },


            _pointerMoveEvent : {
                mouse: 'mousemove',
                touch: 'touchmove'
            },
            _pointerEndEvent : {
                mouse: 'mouseup',
                touch: 'touchend'
            },


            _pointerOrigin : null,


            onDocumentKeyUp : function (e) {
                if (['Tab', 'Escape'].indexOf(jsc.eventKey(e)) !== -1) {
                    if (jsc.picker && jsc.picker.owner) {
                        jsc.picker.owner.tryHide();
                    }
                }
            },


            onWindowResize : function (e) {
                jsc.redrawPosition();
            },


            onWindowScroll : function (e) {
                jsc.redrawPosition();
            },


            onParentScroll : function (e) {
                // hide the picker when one of the parent elements is scrolled
                if (jsc.picker && jsc.picker.owner) {
                    jsc.picker.owner.tryHide();
                }
            },


            onDocumentMouseDown : function (e) {
                var target = e.target || e.srcElement;

                if (target.jscolor && target.jscolor instanceof jsc.pub) { // clicked targetElement -> show picker
                    if (target.jscolor.showOnClick && !target.disabled) {
                        target.jscolor.show();
                    }
                } else if (jsc.getData(target, 'gui')) { // clicked jscolor's GUI element
                    var control = jsc.getData(target, 'control');
                    if (control) {
                        // jscolor's control
                        jsc.onControlPointerStart(e, target, jsc.getData(target, 'control'), 'mouse');
                    }
                } else {
                    // mouse is outside the picker's controls -> hide the color picker!
                    if (jsc.picker && jsc.picker.owner) {
                        jsc.picker.owner.tryHide();
                    }
                }
            },


            onPickerTouchStart : function (e) {
                var target = e.target || e.srcElement;

                if (jsc.getData(target, 'control')) {
                    jsc.onControlPointerStart(e, target, jsc.getData(target, 'control'), 'touch');
                }
            },


            onControlPointerStart : function (e, target, controlName, pointerType) {
                var thisObj = jsc.getData(target, 'instance');

                jsc.preventDefault(e);

                var registerDragEvents = function (doc, offset) {
                    jsc.attachGroupEvent('drag', doc, jsc._pointerMoveEvent[pointerType],
                        jsc.onDocumentPointerMove(e, target, controlName, pointerType, offset));
                    jsc.attachGroupEvent('drag', doc, jsc._pointerEndEvent[pointerType],
                        jsc.onDocumentPointerEnd(e, target, controlName, pointerType));
                };

                registerDragEvents(window.document, [0, 0]);

                if (window.parent && window.frameElement) {
                    var rect = window.frameElement.getBoundingClientRect();
                    var ofs = [-rect.left, -rect.top];
                    registerDragEvents(window.parent.window.document, ofs);
                }

                var abs = jsc.getAbsPointerPos(e);
                var rel = jsc.getRelPointerPos(e);
                jsc._pointerOrigin = {
                    x: abs.x - rel.x,
                    y: abs.y - rel.y
                };

                switch (controlName) {
                    case 'pad':
                        // if the value slider is at the bottom, move it up
                        if (jsc.getSliderChannel(thisObj) === 'v' && thisObj.channels.v === 0) {
                            thisObj.fromHSVA(null, null, 100, null);
                        }
                        jsc.setPad(thisObj, e, 0, 0);
                        break;

                    case 'sld':
                        jsc.setSld(thisObj, e, 0);
                        break;

                    case 'asld':
                        jsc.setASld(thisObj, e, 0);
                        break;
                }
                thisObj.trigger('input');
            },


            onDocumentPointerMove : function (e, target, controlName, pointerType, offset) {
                return function (e) {
                    var thisObj = jsc.getData(target, 'instance');
                    switch (controlName) {
                        case 'pad':
                            jsc.setPad(thisObj, e, offset[0], offset[1]);
                            break;

                        case 'sld':
                            jsc.setSld(thisObj, e, offset[1]);
                            break;

                        case 'asld':
                            jsc.setASld(thisObj, e, offset[1]);
                            break;
                    }
                    thisObj.trigger('input');
                }
            },


            onDocumentPointerEnd : function (e, target, controlName, pointerType) {
                return function (e) {
                    var thisObj = jsc.getData(target, 'instance');
                    jsc.detachGroupEvents('drag');

                    // Always trigger changes AFTER detaching outstanding mouse handlers,
                    // in case some color change that occured in user-defined onChange/onInput handler
                    // intruded into current mouse events
                    thisObj.trigger('input');
                    thisObj.trigger('change');
                };
            },


            onPaletteSampleClick : function (e) {
                var target = e.currentTarget;
                var thisObj = jsc.getData(target, 'instance');
                var color = jsc.getData(target, 'color');

                // when format is flexible, use the original format of this color sample
                if (thisObj.format.toLowerCase() === 'any') {
                    thisObj._setFormat(color.format); // adapt format
                    if (!jsc.isAlphaFormat(thisObj.getFormat())) {
                        color.rgba[3] = 1.0; // when switching to a format that doesn't support alpha, set full opacity
                    }
                }

                // if this color doesn't specify alpha, use alpha of 1.0 (if applicable)
                if (color.rgba[3] === null) {
                    if (thisObj.paletteSetsAlpha === true || (thisObj.paletteSetsAlpha === 'auto' && thisObj._paletteHasTransparency)) {
                        color.rgba[3] = 1.0;
                    }
                }

                thisObj.fromRGBA.apply(thisObj, color.rgba);

                thisObj.trigger('input');
                thisObj.trigger('change');

                if (thisObj.hideOnPaletteClick) {
                    thisObj.hide();
                }
            },


            setPad : function (thisObj, e, ofsX, ofsY) {
                var pointerAbs = jsc.getAbsPointerPos(e);
                var x = ofsX + pointerAbs.x - jsc._pointerOrigin.x - thisObj.padding - thisObj.controlBorderWidth;
                var y = ofsY + pointerAbs.y - jsc._pointerOrigin.y - thisObj.padding - thisObj.controlBorderWidth;

                var xVal = x * (360 / (thisObj.width - 1));
                var yVal = 100 - (y * (100 / (thisObj.height - 1)));

                switch (jsc.getPadYChannel(thisObj)) {
                    case 's': thisObj.fromHSVA(xVal, yVal, null, null); break;
                    case 'v': thisObj.fromHSVA(xVal, null, yVal, null); break;
                }
            },


            setSld : function (thisObj, e, ofsY) {
                var pointerAbs = jsc.getAbsPointerPos(e);
                var y = ofsY + pointerAbs.y - jsc._pointerOrigin.y - thisObj.padding - thisObj.controlBorderWidth;
                var yVal = 100 - (y * (100 / (thisObj.height - 1)));

                switch (jsc.getSliderChannel(thisObj)) {
                    case 's': thisObj.fromHSVA(null, yVal, null, null); break;
                    case 'v': thisObj.fromHSVA(null, null, yVal, null); break;
                }
            },


            setASld : function (thisObj, e, ofsY) {
                var pointerAbs = jsc.getAbsPointerPos(e);
                var y = ofsY + pointerAbs.y - jsc._pointerOrigin.y - thisObj.padding - thisObj.controlBorderWidth;
                var yVal = 1.0 - (y * (1.0 / (thisObj.height - 1)));

                if (yVal < 1.0) {
                    // if format is flexible and the current format doesn't support alpha, switch to a suitable one
                    var fmt = thisObj.getFormat();
                    if (thisObj.format.toLowerCase() === 'any' && !jsc.isAlphaFormat(fmt)) {
                        thisObj._setFormat(fmt === 'hex' ? 'hexa' : 'rgba');
                    }
                }

                thisObj.fromHSVA(null, null, null, yVal);
            },


            createPadCanvas : function () {

                var ret = {
                    elm: null,
                    draw: null
                };

                var canvas = jsc.createEl('canvas');
                var ctx = canvas.getContext('2d');

                var drawFunc = function (width, height, type) {
                    canvas.width = width;
                    canvas.height = height;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    var hGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
                    hGrad.addColorStop(0 / 6, '#F00');
                    hGrad.addColorStop(1 / 6, '#FF0');
                    hGrad.addColorStop(2 / 6, '#0F0');
                    hGrad.addColorStop(3 / 6, '#0FF');
                    hGrad.addColorStop(4 / 6, '#00F');
                    hGrad.addColorStop(5 / 6, '#F0F');
                    hGrad.addColorStop(6 / 6, '#F00');

                    ctx.fillStyle = hGrad;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    var vGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
                    switch (type.toLowerCase()) {
                        case 's':
                            vGrad.addColorStop(0, 'rgba(255,255,255,0)');
                            vGrad.addColorStop(1, 'rgba(255,255,255,1)');
                            break;
                        case 'v':
                            vGrad.addColorStop(0, 'rgba(0,0,0,0)');
                            vGrad.addColorStop(1, 'rgba(0,0,0,1)');
                            break;
                    }
                    ctx.fillStyle = vGrad;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                };

                ret.elm = canvas;
                ret.draw = drawFunc;

                return ret;
            },


            createSliderGradient : function () {

                var ret = {
                    elm: null,
                    draw: null
                };

                var canvas = jsc.createEl('canvas');
                var ctx = canvas.getContext('2d');

                var drawFunc = function (width, height, color1, color2) {
                    canvas.width = width;
                    canvas.height = height;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
                    grad.addColorStop(0, color1);
                    grad.addColorStop(1, color2);

                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                };

                ret.elm = canvas;
                ret.draw = drawFunc;

                return ret;
            },


            createASliderGradient : function () {

                var ret = {
                    elm: null,
                    draw: null
                };

                var canvas = jsc.createEl('canvas');
                var ctx = canvas.getContext('2d');

                var drawFunc = function (width, height, color) {
                    canvas.width = width;
                    canvas.height = height;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    var sqSize = canvas.width / 2;
                    var sqColor1 = jsc.pub.chessboardColor1;
                    var sqColor2 = jsc.pub.chessboardColor2;

                    // dark gray background
                    ctx.fillStyle = sqColor1;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    if (sqSize > 0) { // to avoid infinite loop
                        for (var y = 0; y < canvas.height; y += sqSize * 2) {
                            // light gray squares
                            ctx.fillStyle = sqColor2;
                            ctx.fillRect(0, y, sqSize, sqSize);
                            ctx.fillRect(sqSize, y + sqSize, sqSize, sqSize);
                        }
                    }

                    var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
                    grad.addColorStop(0, color);
                    grad.addColorStop(1, 'rgba(0,0,0,0)');

                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                };

                ret.elm = canvas;
                ret.draw = drawFunc;

                return ret;
            },


            BoxShadow : (function () {
                var BoxShadow = function (hShadow, vShadow, blur, spread, color, inset) {
                    this.hShadow = hShadow;
                    this.vShadow = vShadow;
                    this.blur = blur;
                    this.spread = spread;
                    this.color = color;
                    this.inset = !!inset;
                };

                BoxShadow.prototype.toString = function () {
                    var vals = [
                        Math.round(this.hShadow) + 'px',
                        Math.round(this.vShadow) + 'px',
                        Math.round(this.blur) + 'px',
                        Math.round(this.spread) + 'px',
                        this.color
                    ];
                    if (this.inset) {
                        vals.push('inset');
                    }
                    return vals.join(' ');
                };

                return BoxShadow;
            })(),


            flags : {
                leaveValue : 1 << 0,
                leaveAlpha : 1 << 1,
                leavePreview : 1 << 2,
            },


            enumOpts : {
                format: ['auto', 'any', 'hex', 'hexa', 'rgb', 'rgba'],
                previewPosition: ['left', 'right'],
                mode: ['hsv', 'hvs', 'hs', 'hv'],
                position: ['left', 'right', 'top', 'bottom'],
                alphaChannel: ['auto', true, false],
                paletteSetsAlpha: ['auto', true, false],
            },


            deprecatedOpts : {
                // <old_option>: <new_option>  (<new_option> can be null)
                'styleElement': 'previewElement',
                'onFineChange': 'onInput',
                'overwriteImportant': 'forceStyle',
                'closable': 'closeButton',
                'insetWidth': 'controlBorderWidth',
                'insetColor': 'controlBorderColor',
                'refine': null,
            },


            docsRef : ' ' + 'See https://jscolor.com/docs/',


            //
            // Usage:
            // var myPicker = new JSColor(<targetElement> [, <options>])
            //
            // (constructor is accessible via both 'jscolor' and 'JSColor' name)
            //

            pub : function (targetElement, opts) {

                var THIS = this;

                if (!opts) {
                    opts = {};
                }

                this.channels = {
                    r: 255, // red [0-255]
                    g: 255, // green [0-255]
                    b: 255, // blue [0-255]
                    h: 0, // hue [0-360]
                    s: 0, // saturation [0-100]
                    v: 100, // value (brightness) [0-100]
                    a: 1.0, // alpha (opacity) [0.0 - 1.0]
                };

                // General options
                //
                this.format = 'auto'; // 'auto' | 'any' | 'hex' | 'hexa' | 'rgb' | 'rgba' - Format of the input/output value
                this.value = undefined; // INITIAL color value in any supported format. To change it later, use method fromString(), fromHSVA(), fromRGBA() or channel()
                this.alpha = undefined; // INITIAL alpha value. To change it later, call method channel('A', <value>)
                this.random = false; // whether to randomize the initial color. Either true | false, or an array of ranges: [minV, maxV, minS, maxS, minH, maxH, minA, maxA]
                this.onChange = undefined; // called when color changes. Value can be either a function or a string with JS code.
                this.onInput = undefined; // called repeatedly as the color is being changed, e.g. while dragging a slider. Value can be either a function or a string with JS code.
                this.valueElement = undefined; // element that will be used to display and input the color value
                this.alphaElement = undefined; // element that will be used to display and input the alpha (opacity) value
                this.previewElement = undefined; // element that will preview the picked color using CSS background
                this.previewPosition = 'left'; // 'left' | 'right' - position of the color preview in previewElement
                this.previewSize = 32; // (px) width of the color preview displayed in previewElement
                this.previewPadding = 8; // (px) space between color preview and content of the previewElement
                this.required = true; // whether the associated text input must always contain a color value. If false, the input can be left empty.
                this.hash = true; // whether to prefix the HEX color code with # symbol (only applicable for HEX format)
                this.uppercase = true; // whether to show the HEX color code in upper case (only applicable for HEX format)
                this.forceStyle = true; // whether to overwrite CSS style of the previewElement using !important flag

                // Color Picker options
                //
                this.width = 181; // width of the color spectrum (in px)
                this.height = 101; // height of the color spectrum (in px)
                this.mode = 'HSV'; // 'HSV' | 'HVS' | 'HS' | 'HV' - layout of the color picker controls
                this.alphaChannel = 'auto'; // 'auto' | true | false - if alpha channel is enabled, the alpha slider will be visible. If 'auto', it will be determined according to color format
                this.position = 'bottom'; // 'left' | 'right' | 'top' | 'bottom' - position relative to the target element
                this.smartPosition = true; // automatically change picker position when there is not enough space for it
                this.showOnClick = true; // whether to show the picker when user clicks its target element
                this.hideOnLeave = true; // whether to automatically hide the picker when user leaves its target element (e.g. upon clicking the document)
                this.palette = []; // colors to be displayed in the palette, specified as an array or a string of space separated color values (in any supported format)
                this.paletteCols = 10; // number of columns in the palette
                this.paletteSetsAlpha = 'auto'; // 'auto' | true | false - if true, palette colors that don't specify alpha will set alpha to 1.0
                this.paletteHeight = 16; // maximum height (px) of a row in the palette
                this.paletteSpacing = 4; // distance (px) between color samples in the palette
                this.hideOnPaletteClick = false; // when set to true, clicking the palette will also hide the color picker
                this.sliderSize = 16; // px
                this.crossSize = 8; // px
                this.closeButton = false; // whether to display the Close button
                this.closeText = 'Close';
                this.buttonColor = 'rgba(0,0,0,1)'; // CSS color
                this.buttonHeight = 18; // px
                this.padding = 12; // px
                this.backgroundColor = 'rgba(255,255,255,1)'; // CSS color
                this.borderWidth = 1; // px
                this.borderColor = 'rgba(187,187,187,1)'; // CSS color
                this.borderRadius = 8; // px
                this.controlBorderWidth = 1; // px
                this.controlBorderColor = 'rgba(187,187,187,1)'; // CSS color
                this.shadow = true; // whether to display a shadow
                this.shadowBlur = 15; // px
                this.shadowColor = 'rgba(0,0,0,0.2)'; // CSS color
                this.pointerColor = 'rgba(76,76,76,1)'; // CSS color
                this.pointerBorderWidth = 1; // px
                this.pointerBorderColor = 'rgba(255,255,255,1)'; // CSS color
                this.pointerThickness = 2; // px
                this.zIndex = 5000;
                this.container = undefined; // where to append the color picker (BODY element by default)

                // Experimental
                //
                this.minS = 0; // min allowed saturation (0 - 100)
                this.maxS = 100; // max allowed saturation (0 - 100)
                this.minV = 0; // min allowed value (brightness) (0 - 100)
                this.maxV = 100; // max allowed value (brightness) (0 - 100)
                this.minA = 0.0; // min allowed alpha (opacity) (0.0 - 1.0)
                this.maxA = 1.0; // max allowed alpha (opacity) (0.0 - 1.0)


                // Getter: option(name)
                // Setter: option(name, value)
                //         option({name:value, ...})
                //
                this.option = function () {
                    if (!arguments.length) {
                        throw new Error('No option specified');
                    }

                    if (arguments.length === 1 && typeof arguments[0] === 'string') {
                        // getting a single option
                        try {
                            return getOption(arguments[0]);
                        } catch (e) {
                            console.warn(e);
                        }
                        return false;

                    } else if (arguments.length >= 2 && typeof arguments[0] === 'string') {
                        // setting a single option
                        try {
                            if (!setOption(arguments[0], arguments[1])) {
                                return false;
                            }
                        } catch (e) {
                            console.warn(e);
                            return false;
                        }
                        this.redraw(); // immediately redraws the picker, if it's displayed
                        this.exposeColor(); // in case some preview-related or format-related option was changed
                        return true;

                    } else if (arguments.length === 1 && typeof arguments[0] === 'object') {
                        // setting multiple options
                        var opts = arguments[0];
                        var success = true;
                        for (var opt in opts) {
                            if (opts.hasOwnProperty(opt)) {
                                try {
                                    if (!setOption(opt, opts[opt])) {
                                        success = false;
                                    }
                                } catch (e) {
                                    console.warn(e);
                                    success = false;
                                }
                            }
                        }
                        this.redraw(); // immediately redraws the picker, if it's displayed
                        this.exposeColor(); // in case some preview-related or format-related option was changed
                        return success;
                    }

                    throw new Error('Invalid arguments');
                }


                // Getter: channel(name)
                // Setter: channel(name, value)
                //
                this.channel = function (name, value) {
                    if (typeof name !== 'string') {
                        throw new Error('Invalid value for channel name: ' + name);
                    }

                    if (value === undefined) {
                        // getting channel value
                        if (!this.channels.hasOwnProperty(name.toLowerCase())) {
                            console.warn('Getting unknown channel: ' + name);
                            return false;
                        }
                        return this.channels[name.toLowerCase()];

                    } else {
                        // setting channel value
                        var res = false;
                        switch (name.toLowerCase()) {
                            case 'r': res = this.fromRGBA(value, null, null, null); break;
                            case 'g': res = this.fromRGBA(null, value, null, null); break;
                            case 'b': res = this.fromRGBA(null, null, value, null); break;
                            case 'h': res = this.fromHSVA(value, null, null, null); break;
                            case 's': res = this.fromHSVA(null, value, null, null); break;
                            case 'v': res = this.fromHSVA(null, null, value, null); break;
                            case 'a': res = this.fromHSVA(null, null, null, value); break;
                            default:
                                console.warn('Setting unknown channel: ' + name);
                                return false;
                        }
                        if (res) {
                            this.redraw(); // immediately redraws the picker, if it's displayed
                            return true;
                        }
                    }

                    return false;
                }


                // Triggers given input event(s) by:
                // - executing on<Event> callback specified as picker's option
                // - triggering standard DOM event listeners attached to the value element
                //
                // It is possible to specify multiple events separated with a space.
                //
                this.trigger = function (eventNames) {
                    var evs = jsc.strList(eventNames);
                    for (var i = 0; i < evs.length; i += 1) {
                        var ev = evs[i].toLowerCase();

                        // trigger a callback
                        var callbackProp = null;
                        switch (ev) {
                            case 'input': callbackProp = 'onInput'; break;
                            case 'change': callbackProp = 'onChange'; break;
                        }
                        if (callbackProp) {
                            jsc.triggerCallback(this, callbackProp);
                        }

                        // trigger standard DOM event listeners on the value element
                        jsc.triggerInputEvent(this.valueElement, ev, true, true);
                    }
                };


                // h: 0-360
                // s: 0-100
                // v: 0-100
                // a: 0.0-1.0
                //
                this.fromHSVA = function (h, s, v, a, flags) { // null = don't change
                    if (h === undefined) { h = null; }
                    if (s === undefined) { s = null; }
                    if (v === undefined) { v = null; }
                    if (a === undefined) { a = null; }

                    if (h !== null) {
                        if (isNaN(h)) { return false; }
                        this.channels.h = Math.max(0, Math.min(360, h));
                    }
                    if (s !== null) {
                        if (isNaN(s)) { return false; }
                        this.channels.s = Math.max(0, Math.min(100, this.maxS, s), this.minS);
                    }
                    if (v !== null) {
                        if (isNaN(v)) { return false; }
                        this.channels.v = Math.max(0, Math.min(100, this.maxV, v), this.minV);
                    }
                    if (a !== null) {
                        if (isNaN(a)) { return false; }
                        this.channels.a = this.hasAlphaChannel() ?
                            Math.max(0, Math.min(1, this.maxA, a), this.minA) :
                            1.0; // if alpha channel is disabled, the color should stay 100% opaque
                    }

                    var rgb = jsc.HSV_RGB(
                        this.channels.h,
                        this.channels.s,
                        this.channels.v
                    );
                    this.channels.r = rgb[0];
                    this.channels.g = rgb[1];
                    this.channels.b = rgb[2];

                    this.exposeColor(flags);
                    return true;
                };


                // r: 0-255
                // g: 0-255
                // b: 0-255
                // a: 0.0-1.0
                //
                this.fromRGBA = function (r, g, b, a, flags) { // null = don't change
                    if (r === undefined) { r = null; }
                    if (g === undefined) { g = null; }
                    if (b === undefined) { b = null; }
                    if (a === undefined) { a = null; }

                    if (r !== null) {
                        if (isNaN(r)) { return false; }
                        r = Math.max(0, Math.min(255, r));
                    }
                    if (g !== null) {
                        if (isNaN(g)) { return false; }
                        g = Math.max(0, Math.min(255, g));
                    }
                    if (b !== null) {
                        if (isNaN(b)) { return false; }
                        b = Math.max(0, Math.min(255, b));
                    }
                    if (a !== null) {
                        if (isNaN(a)) { return false; }
                        this.channels.a = this.hasAlphaChannel() ?
                            Math.max(0, Math.min(1, this.maxA, a), this.minA) :
                            1.0; // if alpha channel is disabled, the color should stay 100% opaque
                    }

                    var hsv = jsc.RGB_HSV(
                        r===null ? this.channels.r : r,
                        g===null ? this.channels.g : g,
                        b===null ? this.channels.b : b
                    );
                    if (hsv[0] !== null) {
                        this.channels.h = Math.max(0, Math.min(360, hsv[0]));
                    }
                    if (hsv[2] !== 0) { // fully black color stays black through entire saturation range, so let's not change saturation
                        this.channels.s = Math.max(0, this.minS, Math.min(100, this.maxS, hsv[1]));
                    }
                    this.channels.v = Math.max(0, this.minV, Math.min(100, this.maxV, hsv[2]));

                    // update RGB according to final HSV, as some values might be trimmed
                    var rgb = jsc.HSV_RGB(this.channels.h, this.channels.s, this.channels.v);
                    this.channels.r = rgb[0];
                    this.channels.g = rgb[1];
                    this.channels.b = rgb[2];

                    this.exposeColor(flags);
                    return true;
                };


                // DEPRECATED. Use .fromHSVA() instead
                //
                this.fromHSV = function (h, s, v, flags) {
                    console.warn('fromHSV() method is DEPRECATED. Using fromHSVA() instead.' + jsc.docsRef);
                    return this.fromHSVA(h, s, v, null, flags);
                };


                // DEPRECATED. Use .fromRGBA() instead
                //
                this.fromRGB = function (r, g, b, flags) {
                    console.warn('fromRGB() method is DEPRECATED. Using fromRGBA() instead.' + jsc.docsRef);
                    return this.fromRGBA(r, g, b, null, flags);
                };


                this.fromString = function (str, flags) {
                    if (!this.required && str.trim() === '') {
                        // setting empty string to an optional color input
                        this.setPreviewElementBg(null);
                        this.setValueElementValue('');
                        return true;
                    }

                    var color = jsc.parseColorString(str);
                    if (!color) {
                        return false; // could not parse
                    }
                    if (this.format.toLowerCase() === 'any') {
                        this._setFormat(color.format); // adapt format
                        if (!jsc.isAlphaFormat(this.getFormat())) {
                            color.rgba[3] = 1.0; // when switching to a format that doesn't support alpha, set full opacity
                        }
                    }
                    this.fromRGBA(
                        color.rgba[0],
                        color.rgba[1],
                        color.rgba[2],
                        color.rgba[3],
                        flags
                    );
                    return true;
                };


                this.randomize = function (minV, maxV, minS, maxS, minH, maxH, minA, maxA) {
                    if (minV === undefined) { minV = 0; }
                    if (maxV === undefined) { maxV = 100; }
                    if (minS === undefined) { minS = 0; }
                    if (maxS === undefined) { maxS = 100; }
                    if (minH === undefined) { minH = 0; }
                    if (maxH === undefined) { maxH = 359; }
                    if (minA === undefined) { minA = 1; }
                    if (maxA === undefined) { maxA = 1; }

                    this.fromHSVA(
                        minH + Math.floor(Math.random() * (maxH - minH + 1)),
                        minS + Math.floor(Math.random() * (maxS - minS + 1)),
                        minV + Math.floor(Math.random() * (maxV - minV + 1)),
                        ((100 * minA) + Math.floor(Math.random() * (100 * (maxA - minA) + 1))) / 100
                    );
                };


                this.toString = function (format) {
                    if (format === undefined) {
                        format = this.getFormat(); // format not specified -> use the current format
                    }
                    switch (format.toLowerCase()) {
                        case 'hex': return this.toHEXString(); break;
                        case 'hexa': return this.toHEXAString(); break;
                        case 'rgb': return this.toRGBString(); break;
                        case 'rgba': return this.toRGBAString(); break;
                    }
                    return false;
                };


                this.toHEXString = function () {
                    return jsc.hexColor(
                        this.channels.r,
                        this.channels.g,
                        this.channels.b
                    );
                };


                this.toHEXAString = function () {
                    return jsc.hexaColor(
                        this.channels.r,
                        this.channels.g,
                        this.channels.b,
                        this.channels.a
                    );
                };


                this.toRGBString = function () {
                    return jsc.rgbColor(
                        this.channels.r,
                        this.channels.g,
                        this.channels.b
                    );
                };


                this.toRGBAString = function () {
                    return jsc.rgbaColor(
                        this.channels.r,
                        this.channels.g,
                        this.channels.b,
                        this.channels.a
                    );
                };


                this.toGrayscale = function () {
                    return (
                        0.213 * this.channels.r +
                        0.715 * this.channels.g +
                        0.072 * this.channels.b
                    );
                };


                this.toCanvas = function () {
                    return jsc.genColorPreviewCanvas(this.toRGBAString()).canvas;
                };


                this.toDataURL = function () {
                    return this.toCanvas().toDataURL();
                };


                this.toBackground = function () {
                    return jsc.pub.background(this.toRGBAString());
                };


                this.isLight = function () {
                    return this.toGrayscale() > 255 / 2;
                };


                this.hide = function () {
                    if (isPickerOwner()) {
                        detachPicker();
                    }
                };


                this.show = function () {
                    drawPicker();
                };


                this.redraw = function () {
                    if (isPickerOwner()) {
                        drawPicker();
                    }
                };


                this.getFormat = function () {
                    return this._currentFormat;
                };


                this._setFormat = function (format) {
                    this._currentFormat = format.toLowerCase();
                };


                this.hasAlphaChannel = function () {
                    if (this.alphaChannel === 'auto') {
                        return (
                            this.format.toLowerCase() === 'any' || // format can change on the fly (e.g. from hex to rgba), so let's consider the alpha channel enabled
                            jsc.isAlphaFormat(this.getFormat()) || // the current format supports alpha channel
                            this.alpha !== undefined || // initial alpha value is set, so we're working with alpha channel
                            this.alphaElement !== undefined // the alpha value is redirected, so we're working with alpha channel
                        );
                    }

                    return this.alphaChannel; // the alpha channel is explicitly set
                };


                this.processValueInput = function (str) {
                    if (!this.fromString(str)) {
                        // could not parse the color value - let's just expose the current color
                        this.exposeColor();
                    }
                };


                this.processAlphaInput = function (str) {
                    if (!this.fromHSVA(null, null, null, parseFloat(str))) {
                        // could not parse the alpha value - let's just expose the current color
                        this.exposeColor();
                    }
                };


                this.exposeColor = function (flags) {
                    var colorStr = this.toString();
                    var fmt = this.getFormat();

                    // reflect current color in data- attribute
                    jsc.setDataAttr(this.targetElement, 'current-color', colorStr);

                    if (!(flags & jsc.flags.leaveValue) && this.valueElement) {
                        if (fmt === 'hex' || fmt === 'hexa') {
                            if (!this.uppercase) { colorStr = colorStr.toLowerCase(); }
                            if (!this.hash) { colorStr = colorStr.replace(/^#/, ''); }
                        }
                        this.setValueElementValue(colorStr);
                    }

                    if (!(flags & jsc.flags.leaveAlpha) && this.alphaElement) {
                        var alphaVal = Math.round(this.channels.a * 100) / 100;
                        this.setAlphaElementValue(alphaVal);
                    }

                    if (!(flags & jsc.flags.leavePreview) && this.previewElement) {
                        var previewPos = null; // 'left' | 'right' (null -> fill the entire element)

                        if (
                            jsc.isTextInput(this.previewElement) || // text input
                            (jsc.isButton(this.previewElement) && !jsc.isButtonEmpty(this.previewElement)) // button with text
                        ) {
                            previewPos = this.previewPosition;
                        }

                        this.setPreviewElementBg(this.toRGBAString());
                    }

                    if (isPickerOwner()) {
                        redrawPad();
                        redrawSld();
                        redrawASld();
                    }
                };


                this.setPreviewElementBg = function (color) {
                    if (!this.previewElement) {
                        return;
                    }

                    var position = null; // color preview position:  null | 'left' | 'right'
                    var width = null; // color preview width:  px | null = fill the entire element
                    if (
                        jsc.isTextInput(this.previewElement) || // text input
                        (jsc.isButton(this.previewElement) && !jsc.isButtonEmpty(this.previewElement)) // button with text
                    ) {
                        position = this.previewPosition;
                        width = this.previewSize;
                    }

                    var backgrounds = [];

                    if (!color) {
                        // there is no color preview to display -> let's remove any previous background image
                        backgrounds.push({
                            image: 'none',
                            position: 'left top',
                            size: 'auto',
                            repeat: 'no-repeat',
                            origin: 'padding-box',
                        });
                    } else {
                        // CSS gradient for background color preview
                        backgrounds.push({
                            image: jsc.genColorPreviewGradient(
                                color,
                                position,
                                width ? width - jsc.pub.previewSeparator.length : null
                            ),
                            position: 'left top',
                            size: 'auto',
                            repeat: position ? 'repeat-y' : 'repeat',
                            origin: 'padding-box',
                        });

                        // data URL of generated PNG image with a gray transparency chessboard
                        var preview = jsc.genColorPreviewCanvas(
                            'rgba(0,0,0,0)',
                            position ? {'left':'right', 'right':'left'}[position] : null,
                            width,
                            true
                        );
                        backgrounds.push({
                            image: 'url(\'' + preview.canvas.toDataURL() + '\')',
                            position: (position || 'left') + ' top',
                            size: preview.width + 'px ' + preview.height + 'px',
                            repeat: position ? 'repeat-y' : 'repeat',
                            origin: 'padding-box',
                        });
                    }

                    var bg = {
                        image: [],
                        position: [],
                        size: [],
                        repeat: [],
                        origin: [],
                    };
                    for (var i = 0; i < backgrounds.length; i += 1) {
                        bg.image.push(backgrounds[i].image);
                        bg.position.push(backgrounds[i].position);
                        bg.size.push(backgrounds[i].size);
                        bg.repeat.push(backgrounds[i].repeat);
                        bg.origin.push(backgrounds[i].origin);
                    }

                    // set previewElement's background-images
                    var sty = {
                        'background-image': bg.image.join(', '),
                        'background-position': bg.position.join(', '),
                        'background-size': bg.size.join(', '),
                        'background-repeat': bg.repeat.join(', '),
                        'background-origin': bg.origin.join(', '),
                    };
                    jsc.setStyle(this.previewElement, sty, this.forceStyle);


                    // set/restore previewElement's padding
                    var padding = {
                        left: null,
                        right: null,
                    };
                    if (position) {
                        padding[position] = (this.previewSize + this.previewPadding) + 'px';
                    }

                    var sty = {
                        'padding-left': padding.left,
                        'padding-right': padding.right,
                    };
                    jsc.setStyle(this.previewElement, sty, this.forceStyle, true);
                };


                this.setValueElementValue = function (str) {
                    if (this.valueElement) {
                        if (jsc.nodeName(this.valueElement) === 'input') {
                            this.valueElement.value = str;
                        } else {
                            this.valueElement.innerHTML = str;
                        }
                    }
                };


                this.setAlphaElementValue = function (str) {
                    if (this.alphaElement) {
                        if (jsc.nodeName(this.alphaElement) === 'input') {
                            this.alphaElement.value = str;
                        } else {
                            this.alphaElement.innerHTML = str;
                        }
                    }
                };


                this._processParentElementsInDOM = function () {
                    if (this._parentElementsProcessed) { return; }
                    this._parentElementsProcessed = true;

                    var elm = this.targetElement;
                    do {
                        // If the target element or one of its parent nodes has fixed position,
                        // then use fixed positioning instead
                        var compStyle = jsc.getCompStyle(elm);
                        if (compStyle.position && compStyle.position.toLowerCase() === 'fixed') {
                            this.fixed = true;
                        }

                        if (elm !== this.targetElement) {
                            // Ensure to attach onParentScroll only once to each parent element
                            // (multiple targetElements can share the same parent nodes)
                            //
                            // Note: It's not just offsetParents that can be scrollable,
                            // that's why we loop through all parent nodes
                            if (!jsc.getData(elm, 'hasScrollListener')) {
                                elm.addEventListener('scroll', jsc.onParentScroll, false);
                                jsc.setData(elm, 'hasScrollListener', true);
                            }
                        }
                    } while ((elm = elm.parentNode) && jsc.nodeName(elm) !== 'body');
                };


                this.tryHide = function () {
                    if (this.hideOnLeave) {
                        this.hide();
                    }
                };


                this.set__palette = function (val) {
                    this.palette = val;
                    this._palette = jsc.parsePaletteValue(val);
                    this._paletteHasTransparency = jsc.containsTranparentColor(this._palette);
                };


                function setOption (option, value) {
                    if (typeof option !== 'string') {
                        throw new Error('Invalid value for option name: ' + option);
                    }

                    // enum option
                    if (jsc.enumOpts.hasOwnProperty(option)) {
                        if (typeof value === 'string') { // enum string values are case insensitive
                            value = value.toLowerCase();
                        }
                        if (jsc.enumOpts[option].indexOf(value) === -1) {
                            throw new Error('Option \'' + option + '\' has invalid value: ' + value);
                        }
                    }

                    // deprecated option
                    if (jsc.deprecatedOpts.hasOwnProperty(option)) {
                        var oldOpt = option;
                        var newOpt = jsc.deprecatedOpts[option];
                        if (newOpt) {
                            // if we have a new name for this option, let's log a warning and use the new name
                            console.warn('Option \'%s\' is DEPRECATED, using \'%s\' instead.' + jsc.docsRef, oldOpt, newOpt);
                            option = newOpt;
                        } else {
                            // new name not available for the option
                            throw new Error('Option \'' + option + '\' is DEPRECATED');
                        }
                    }

                    var setter = 'set__' + option;

                    if (typeof THIS[setter] === 'function') { // a setter exists for this option
                        THIS[setter](value);
                        return true;

                    } else if (option in THIS) { // option exists as a property
                        THIS[option] = value;
                        return true;
                    }

                    throw new Error('Unrecognized configuration option: ' + option);
                }


                function getOption (option) {
                    if (typeof option !== 'string') {
                        throw new Error('Invalid value for option name: ' + option);
                    }

                    // deprecated option
                    if (jsc.deprecatedOpts.hasOwnProperty(option)) {
                        var oldOpt = option;
                        var newOpt = jsc.deprecatedOpts[option];
                        if (newOpt) {
                            // if we have a new name for this option, let's log a warning and use the new name
                            console.warn('Option \'%s\' is DEPRECATED, using \'%s\' instead.' + jsc.docsRef, oldOpt, newOpt);
                            option = newOpt;
                        } else {
                            // new name not available for the option
                            throw new Error('Option \'' + option + '\' is DEPRECATED');
                        }
                    }

                    var getter = 'get__' + option;

                    if (typeof THIS[getter] === 'function') { // a getter exists for this option
                        return THIS[getter](value);

                    } else if (option in THIS) { // option exists as a property
                        return THIS[option];
                    }

                    throw new Error('Unrecognized configuration option: ' + option);
                }


                function detachPicker () {
                    jsc.removeClass(THIS.targetElement, jsc.pub.activeClassName);
                    jsc.picker.wrap.parentNode.removeChild(jsc.picker.wrap);
                    delete jsc.picker.owner;
                }


                function drawPicker () {

                    // At this point, when drawing the picker, we know what the parent elements are
                    // and we can do all related DOM operations, such as registering events on them
                    // or checking their positioning
                    THIS._processParentElementsInDOM();

                    if (!jsc.picker) {
                        jsc.picker = {
                            owner: null, // owner picker instance
                            wrap : jsc.createEl('div'),
                            box : jsc.createEl('div'),
                            boxS : jsc.createEl('div'), // shadow area
                            boxB : jsc.createEl('div'), // border
                            pad : jsc.createEl('div'),
                            padB : jsc.createEl('div'), // border
                            padM : jsc.createEl('div'), // mouse/touch area
                            padCanvas : jsc.createPadCanvas(),
                            cross : jsc.createEl('div'),
                            crossBY : jsc.createEl('div'), // border Y
                            crossBX : jsc.createEl('div'), // border X
                            crossLY : jsc.createEl('div'), // line Y
                            crossLX : jsc.createEl('div'), // line X
                            sld : jsc.createEl('div'), // slider
                            sldB : jsc.createEl('div'), // border
                            sldM : jsc.createEl('div'), // mouse/touch area
                            sldGrad : jsc.createSliderGradient(),
                            sldPtrS : jsc.createEl('div'), // slider pointer spacer
                            sldPtrIB : jsc.createEl('div'), // slider pointer inner border
                            sldPtrMB : jsc.createEl('div'), // slider pointer middle border
                            sldPtrOB : jsc.createEl('div'), // slider pointer outer border
                            asld : jsc.createEl('div'), // alpha slider
                            asldB : jsc.createEl('div'), // border
                            asldM : jsc.createEl('div'), // mouse/touch area
                            asldGrad : jsc.createASliderGradient(),
                            asldPtrS : jsc.createEl('div'), // slider pointer spacer
                            asldPtrIB : jsc.createEl('div'), // slider pointer inner border
                            asldPtrMB : jsc.createEl('div'), // slider pointer middle border
                            asldPtrOB : jsc.createEl('div'), // slider pointer outer border
                            pal : jsc.createEl('div'), // palette
                            btn : jsc.createEl('div'),
                            btnT : jsc.createEl('div'), // text
                        };

                        jsc.picker.pad.appendChild(jsc.picker.padCanvas.elm);
                        jsc.picker.padB.appendChild(jsc.picker.pad);
                        jsc.picker.cross.appendChild(jsc.picker.crossBY);
                        jsc.picker.cross.appendChild(jsc.picker.crossBX);
                        jsc.picker.cross.appendChild(jsc.picker.crossLY);
                        jsc.picker.cross.appendChild(jsc.picker.crossLX);
                        jsc.picker.padB.appendChild(jsc.picker.cross);
                        jsc.picker.box.appendChild(jsc.picker.padB);
                        jsc.picker.box.appendChild(jsc.picker.padM);

                        jsc.picker.sld.appendChild(jsc.picker.sldGrad.elm);
                        jsc.picker.sldB.appendChild(jsc.picker.sld);
                        jsc.picker.sldB.appendChild(jsc.picker.sldPtrOB);
                        jsc.picker.sldPtrOB.appendChild(jsc.picker.sldPtrMB);
                        jsc.picker.sldPtrMB.appendChild(jsc.picker.sldPtrIB);
                        jsc.picker.sldPtrIB.appendChild(jsc.picker.sldPtrS);
                        jsc.picker.box.appendChild(jsc.picker.sldB);
                        jsc.picker.box.appendChild(jsc.picker.sldM);

                        jsc.picker.asld.appendChild(jsc.picker.asldGrad.elm);
                        jsc.picker.asldB.appendChild(jsc.picker.asld);
                        jsc.picker.asldB.appendChild(jsc.picker.asldPtrOB);
                        jsc.picker.asldPtrOB.appendChild(jsc.picker.asldPtrMB);
                        jsc.picker.asldPtrMB.appendChild(jsc.picker.asldPtrIB);
                        jsc.picker.asldPtrIB.appendChild(jsc.picker.asldPtrS);
                        jsc.picker.box.appendChild(jsc.picker.asldB);
                        jsc.picker.box.appendChild(jsc.picker.asldM);

                        jsc.picker.box.appendChild(jsc.picker.pal);

                        jsc.picker.btn.appendChild(jsc.picker.btnT);
                        jsc.picker.box.appendChild(jsc.picker.btn);

                        jsc.picker.boxB.appendChild(jsc.picker.box);
                        jsc.picker.wrap.appendChild(jsc.picker.boxS);
                        jsc.picker.wrap.appendChild(jsc.picker.boxB);

                        jsc.picker.wrap.addEventListener('touchstart', jsc.onPickerTouchStart,
                            jsc.isPassiveEventSupported ? {passive: false} : false);
                    }

                    var p = jsc.picker;

                    var displaySlider = !!jsc.getSliderChannel(THIS);
                    var displayAlphaSlider = THIS.hasAlphaChannel();
                    var pickerDims = jsc.getPickerDims(THIS);
                    var crossOuterSize = (2 * THIS.pointerBorderWidth + THIS.pointerThickness + 2 * THIS.crossSize);
                    var controlPadding = jsc.getControlPadding(THIS);
                    var borderRadius = Math.min(
                        THIS.borderRadius,
                        Math.round(THIS.padding * Math.PI)); // px
                    var padCursor = 'crosshair';

                    // wrap
                    p.wrap.className = 'jscolor-wrap';
                    p.wrap.style.width = pickerDims.borderW + 'px';
                    p.wrap.style.height = pickerDims.borderH + 'px';
                    p.wrap.style.zIndex = THIS.zIndex;

                    // picker
                    p.box.className = 'jscolor-picker';
                    p.box.style.width = pickerDims.paddedW + 'px';
                    p.box.style.height = pickerDims.paddedH + 'px';

                    // picker shadow
                    p.boxS.className = 'jscolor-shadow';
                    jsc.setBorderRadius(p.boxS, borderRadius + 'px');

                    // picker border
                    p.boxB.className = 'jscolor-border';
                    p.boxB.style.border = THIS.borderWidth + 'px solid';
                    p.boxB.style.borderColor = THIS.borderColor;
                    p.boxB.style.background = THIS.backgroundColor;
                    jsc.setBorderRadius(p.boxB, borderRadius + 'px');

                    // IE hack:
                    // If the element is transparent, IE will trigger the event on the elements under it,
                    // e.g. on Canvas or on elements with border
                    p.padM.style.background = 'rgba(255,0,0,.2)';
                    p.sldM.style.background = 'rgba(0,255,0,.2)';
                    p.asldM.style.background = 'rgba(0,0,255,.2)';

                    p.padM.style.opacity =
                        p.sldM.style.opacity =
                            p.asldM.style.opacity =
                                '0';

                    // pad
                    p.pad.style.position = 'relative';
                    p.pad.style.width = THIS.width + 'px';
                    p.pad.style.height = THIS.height + 'px';

                    // pad - color spectrum (HSV and HVS)
                    p.padCanvas.draw(THIS.width, THIS.height, jsc.getPadYChannel(THIS));

                    // pad border
                    p.padB.style.position = 'absolute';
                    p.padB.style.left = THIS.padding + 'px';
                    p.padB.style.top = THIS.padding + 'px';
                    p.padB.style.border = THIS.controlBorderWidth + 'px solid';
                    p.padB.style.borderColor = THIS.controlBorderColor;

                    // pad mouse area
                    p.padM.style.position = 'absolute';
                    p.padM.style.left = 0 + 'px';
                    p.padM.style.top = 0 + 'px';
                    p.padM.style.width = (THIS.padding + 2 * THIS.controlBorderWidth + THIS.width + controlPadding) + 'px';
                    p.padM.style.height = (2 * THIS.controlBorderWidth + 2 * THIS.padding + THIS.height) + 'px';
                    p.padM.style.cursor = padCursor;
                    jsc.setData(p.padM, {
                        instance: THIS,
                        control: 'pad',
                    })

                    // pad cross
                    p.cross.style.position = 'absolute';
                    p.cross.style.left =
                        p.cross.style.top =
                            '0';
                    p.cross.style.width =
                        p.cross.style.height =
                            crossOuterSize + 'px';

                    // pad cross border Y and X
                    p.crossBY.style.position =
                        p.crossBX.style.position =
                            'absolute';
                    p.crossBY.style.background =
                        p.crossBX.style.background =
                            THIS.pointerBorderColor;
                    p.crossBY.style.width =
                        p.crossBX.style.height =
                            (2 * THIS.pointerBorderWidth + THIS.pointerThickness) + 'px';
                    p.crossBY.style.height =
                        p.crossBX.style.width =
                            crossOuterSize + 'px';
                    p.crossBY.style.left =
                        p.crossBX.style.top =
                            (Math.floor(crossOuterSize / 2) - Math.floor(THIS.pointerThickness / 2) - THIS.pointerBorderWidth) + 'px';
                    p.crossBY.style.top =
                        p.crossBX.style.left =
                            '0';

                    // pad cross line Y and X
                    p.crossLY.style.position =
                        p.crossLX.style.position =
                            'absolute';
                    p.crossLY.style.background =
                        p.crossLX.style.background =
                            THIS.pointerColor;
                    p.crossLY.style.height =
                        p.crossLX.style.width =
                            (crossOuterSize - 2 * THIS.pointerBorderWidth) + 'px';
                    p.crossLY.style.width =
                        p.crossLX.style.height =
                            THIS.pointerThickness + 'px';
                    p.crossLY.style.left =
                        p.crossLX.style.top =
                            (Math.floor(crossOuterSize / 2) - Math.floor(THIS.pointerThickness / 2)) + 'px';
                    p.crossLY.style.top =
                        p.crossLX.style.left =
                            THIS.pointerBorderWidth + 'px';


                    // slider
                    p.sld.style.overflow = 'hidden';
                    p.sld.style.width = THIS.sliderSize + 'px';
                    p.sld.style.height = THIS.height + 'px';

                    // slider gradient
                    p.sldGrad.draw(THIS.sliderSize, THIS.height, '#000', '#000');

                    // slider border
                    p.sldB.style.display = displaySlider ? 'block' : 'none';
                    p.sldB.style.position = 'absolute';
                    p.sldB.style.left = (THIS.padding + THIS.width + 2 * THIS.controlBorderWidth + 2 * controlPadding) + 'px';
                    p.sldB.style.top = THIS.padding + 'px';
                    p.sldB.style.border = THIS.controlBorderWidth + 'px solid';
                    p.sldB.style.borderColor = THIS.controlBorderColor;

                    // slider mouse area
                    p.sldM.style.display = displaySlider ? 'block' : 'none';
                    p.sldM.style.position = 'absolute';
                    p.sldM.style.left = (THIS.padding + THIS.width + 2 * THIS.controlBorderWidth + controlPadding) + 'px';
                    p.sldM.style.top = 0 + 'px';
                    p.sldM.style.width = (
                        (THIS.sliderSize + 2 * controlPadding + 2 * THIS.controlBorderWidth) +
                        (displayAlphaSlider ? 0 : Math.max(0, THIS.padding - controlPadding)) // remaining padding to the right edge
                    ) + 'px';
                    p.sldM.style.height = (2 * THIS.controlBorderWidth + 2 * THIS.padding + THIS.height) + 'px';
                    p.sldM.style.cursor = 'default';
                    jsc.setData(p.sldM, {
                        instance: THIS,
                        control: 'sld',
                    });

                    // slider pointer inner and outer border
                    p.sldPtrIB.style.border =
                        p.sldPtrOB.style.border =
                            THIS.pointerBorderWidth + 'px solid ' + THIS.pointerBorderColor;

                    // slider pointer outer border
                    p.sldPtrOB.style.position = 'absolute';
                    p.sldPtrOB.style.left = -(2 * THIS.pointerBorderWidth + THIS.pointerThickness) + 'px';
                    p.sldPtrOB.style.top = '0';

                    // slider pointer middle border
                    p.sldPtrMB.style.border = THIS.pointerThickness + 'px solid ' + THIS.pointerColor;

                    // slider pointer spacer
                    p.sldPtrS.style.width = THIS.sliderSize + 'px';
                    p.sldPtrS.style.height = jsc.pub.sliderInnerSpace + 'px';


                    // alpha slider
                    p.asld.style.overflow = 'hidden';
                    p.asld.style.width = THIS.sliderSize + 'px';
                    p.asld.style.height = THIS.height + 'px';

                    // alpha slider gradient
                    p.asldGrad.draw(THIS.sliderSize, THIS.height, '#000');

                    // alpha slider border
                    p.asldB.style.display = displayAlphaSlider ? 'block' : 'none';
                    p.asldB.style.position = 'absolute';
                    p.asldB.style.left = (
                        (THIS.padding + THIS.width + 2 * THIS.controlBorderWidth + controlPadding) +
                        (displaySlider ? (THIS.sliderSize + 3 * controlPadding + 2 * THIS.controlBorderWidth) : 0)
                    ) + 'px';
                    p.asldB.style.top = THIS.padding + 'px';
                    p.asldB.style.border = THIS.controlBorderWidth + 'px solid';
                    p.asldB.style.borderColor = THIS.controlBorderColor;

                    // alpha slider mouse area
                    p.asldM.style.display = displayAlphaSlider ? 'block' : 'none';
                    p.asldM.style.position = 'absolute';
                    p.asldM.style.left = (
                        (THIS.padding + THIS.width + 2 * THIS.controlBorderWidth + controlPadding) +
                        (displaySlider ? (THIS.sliderSize + 2 * controlPadding + 2 * THIS.controlBorderWidth) : 0)
                    ) + 'px';
                    p.asldM.style.top = 0 + 'px';
                    p.asldM.style.width = (
                        (THIS.sliderSize + 2 * controlPadding + 2 * THIS.controlBorderWidth) +
                        Math.max(0, THIS.padding - controlPadding) // remaining padding to the right edge
                    ) + 'px';
                    p.asldM.style.height = (2 * THIS.controlBorderWidth + 2 * THIS.padding + THIS.height) + 'px';
                    p.asldM.style.cursor = 'default';
                    jsc.setData(p.asldM, {
                        instance: THIS,
                        control: 'asld',
                    })

                    // alpha slider pointer inner and outer border
                    p.asldPtrIB.style.border =
                        p.asldPtrOB.style.border =
                            THIS.pointerBorderWidth + 'px solid ' + THIS.pointerBorderColor;

                    // alpha slider pointer outer border
                    p.asldPtrOB.style.position = 'absolute';
                    p.asldPtrOB.style.left = -(2 * THIS.pointerBorderWidth + THIS.pointerThickness) + 'px';
                    p.asldPtrOB.style.top = '0';

                    // alpha slider pointer middle border
                    p.asldPtrMB.style.border = THIS.pointerThickness + 'px solid ' + THIS.pointerColor;

                    // alpha slider pointer spacer
                    p.asldPtrS.style.width = THIS.sliderSize + 'px';
                    p.asldPtrS.style.height = jsc.pub.sliderInnerSpace + 'px';


                    // palette
                    p.pal.className = 'jscolor-palette';
                    p.pal.style.display = pickerDims.palette.rows ? 'block' : 'none';
                    p.pal.style.left = THIS.padding + 'px';
                    p.pal.style.top = (2 * THIS.controlBorderWidth + 2 * THIS.padding + THIS.height) + 'px';

                    // palette's color samples

                    p.pal.innerHTML = '';

                    var chessboard = jsc.genColorPreviewCanvas('rgba(0,0,0,0)');

                    var si = 0; // color sample's index
                    for (var r = 0; r < pickerDims.palette.rows; r++) {
                        for (var c = 0; c < pickerDims.palette.cols && si < THIS._palette.length; c++, si++) {
                            var sampleColor = THIS._palette[si];
                            var sampleCssColor = jsc.rgbaColor.apply(null, sampleColor.rgba);

                            var sc = jsc.createEl('div'); // color sample's color
                            sc.style.width = (pickerDims.palette.cellW - 2 * THIS.controlBorderWidth) + 'px';
                            sc.style.height = (pickerDims.palette.cellH - 2 * THIS.controlBorderWidth) + 'px';
                            sc.style.backgroundColor = sampleCssColor;

                            var sw = jsc.createEl('div'); // color sample's wrap
                            sw.className = 'jscolor-palette-sw';
                            sw.style.left =
                                (
                                    pickerDims.palette.cols <= 1 ? 0 :
                                        Math.round(10 * (c * ((pickerDims.contentW - pickerDims.palette.cellW) / (pickerDims.palette.cols - 1)))) / 10
                                ) + 'px';
                            sw.style.top = (r * (pickerDims.palette.cellH + THIS.paletteSpacing)) + 'px';
                            sw.style.border = THIS.controlBorderWidth + 'px solid';
                            sw.style.borderColor = THIS.controlBorderColor;
                            if (sampleColor.rgba[3] !== null && sampleColor.rgba[3] < 1.0) { // only create chessboard background if the sample has transparency
                                sw.style.backgroundImage = 'url(\'' + chessboard.canvas.toDataURL() + '\')';
                                sw.style.backgroundRepeat = 'repeat';
                                sw.style.backgroundPosition = 'center center';
                            }
                            jsc.setData(sw, {
                                instance: THIS,
                                control: 'palette-sw',
                                color: sampleColor,
                            });
                            sw.addEventListener('click', jsc.onPaletteSampleClick, false);
                            sw.appendChild(sc);
                            p.pal.appendChild(sw);
                        }
                    }


                    // the Close button
                    function setBtnBorder () {
                        var insetColors = THIS.controlBorderColor.split(/\s+/);
                        var outsetColor = insetColors.length < 2 ? insetColors[0] : insetColors[1] + ' ' + insetColors[0] + ' ' + insetColors[0] + ' ' + insetColors[1];
                        p.btn.style.borderColor = outsetColor;
                    }
                    var btnPadding = 15; // px
                    p.btn.className = 'jscolor-btn jscolor-btn-close';
                    p.btn.style.display = THIS.closeButton ? 'block' : 'none';
                    p.btn.style.left = THIS.padding + 'px';
                    p.btn.style.bottom = THIS.padding + 'px';
                    p.btn.style.padding = '0 ' + btnPadding + 'px';
                    p.btn.style.maxWidth = (pickerDims.contentW - 2 * THIS.controlBorderWidth - 2 * btnPadding) + 'px';
                    p.btn.style.height = THIS.buttonHeight + 'px';
                    p.btn.style.border = THIS.controlBorderWidth + 'px solid';
                    setBtnBorder();
                    p.btn.style.color = THIS.buttonColor;
                    p.btn.onmousedown = function () {
                        THIS.hide();
                    };
                    p.btnT.style.display = 'inline';
                    p.btnT.style.lineHeight = THIS.buttonHeight + 'px';
                    p.btnT.innerText = THIS.closeText;

                    // reposition the pointers
                    redrawPad();
                    redrawSld();
                    redrawASld();

                    // If we are changing the owner without first closing the picker,
                    // make sure to first deal with the old owner
                    if (jsc.picker.owner && jsc.picker.owner !== THIS) {
                        jsc.removeClass(jsc.picker.owner.targetElement, jsc.pub.activeClassName);
                    }

                    // Set a new picker owner
                    jsc.picker.owner = THIS;

                    // The redrawPosition() method needs picker.owner to be set, that's why we call it here,
                    // after setting the owner
                    jsc.redrawPosition();

                    if (p.wrap.parentNode !== THIS.container) {
                        THIS.container.appendChild(p.wrap);
                    }

                    jsc.addClass(THIS.targetElement, jsc.pub.activeClassName);
                }


                function redrawPad () {
                    // redraw the pad pointer
                    var yChannel = jsc.getPadYChannel(THIS);
                    var x = Math.round((THIS.channels.h / 360) * (THIS.width - 1));
                    var y = Math.round((1 - THIS.channels[yChannel] / 100) * (THIS.height - 1));
                    var crossOuterSize = (2 * THIS.pointerBorderWidth + THIS.pointerThickness + 2 * THIS.crossSize);
                    var ofs = -Math.floor(crossOuterSize / 2);
                    jsc.picker.cross.style.left = (x + ofs) + 'px';
                    jsc.picker.cross.style.top = (y + ofs) + 'px';

                    // redraw the slider
                    switch (jsc.getSliderChannel(THIS)) {
                        case 's':
                            var rgb1 = jsc.HSV_RGB(THIS.channels.h, 100, THIS.channels.v);
                            var rgb2 = jsc.HSV_RGB(THIS.channels.h, 0, THIS.channels.v);
                            var color1 = 'rgb(' +
                                Math.round(rgb1[0]) + ',' +
                                Math.round(rgb1[1]) + ',' +
                                Math.round(rgb1[2]) + ')';
                            var color2 = 'rgb(' +
                                Math.round(rgb2[0]) + ',' +
                                Math.round(rgb2[1]) + ',' +
                                Math.round(rgb2[2]) + ')';
                            jsc.picker.sldGrad.draw(THIS.sliderSize, THIS.height, color1, color2);
                            break;
                        case 'v':
                            var rgb = jsc.HSV_RGB(THIS.channels.h, THIS.channels.s, 100);
                            var color1 = 'rgb(' +
                                Math.round(rgb[0]) + ',' +
                                Math.round(rgb[1]) + ',' +
                                Math.round(rgb[2]) + ')';
                            var color2 = '#000';
                            jsc.picker.sldGrad.draw(THIS.sliderSize, THIS.height, color1, color2);
                            break;
                    }

                    // redraw the alpha slider
                    jsc.picker.asldGrad.draw(THIS.sliderSize, THIS.height, THIS.toHEXString());
                }


                function redrawSld () {
                    var sldChannel = jsc.getSliderChannel(THIS);
                    if (sldChannel) {
                        // redraw the slider pointer
                        var y = Math.round((1 - THIS.channels[sldChannel] / 100) * (THIS.height - 1));
                        jsc.picker.sldPtrOB.style.top = (y - (2 * THIS.pointerBorderWidth + THIS.pointerThickness) - Math.floor(jsc.pub.sliderInnerSpace / 2)) + 'px';
                    }

                    // redraw the alpha slider
                    jsc.picker.asldGrad.draw(THIS.sliderSize, THIS.height, THIS.toHEXString());
                }


                function redrawASld () {
                    var y = Math.round((1 - THIS.channels.a) * (THIS.height - 1));
                    jsc.picker.asldPtrOB.style.top = (y - (2 * THIS.pointerBorderWidth + THIS.pointerThickness) - Math.floor(jsc.pub.sliderInnerSpace / 2)) + 'px';
                }


                function isPickerOwner () {
                    return jsc.picker && jsc.picker.owner === THIS;
                }


                function onValueKeyDown (ev) {
                    if (jsc.eventKey(ev) === 'Enter') {
                        if (THIS.valueElement) {
                            THIS.processValueInput(THIS.valueElement.value);
                        }
                        THIS.tryHide();
                    }
                }


                function onAlphaKeyDown (ev) {
                    if (jsc.eventKey(ev) === 'Enter') {
                        if (THIS.alphaElement) {
                            THIS.processAlphaInput(THIS.alphaElement.value);
                        }
                        THIS.tryHide();
                    }
                }


                function onValueChange (ev) {
                    if (jsc.getData(ev, 'internal')) {
                        return; // skip if the event was internally triggered by jscolor
                    }

                    var oldVal = THIS.valueElement.value;

                    THIS.processValueInput(THIS.valueElement.value); // this might change the value

                    jsc.triggerCallback(THIS, 'onChange');

                    if (THIS.valueElement.value !== oldVal) {
                        // value was additionally changed -> let's trigger the change event again, even though it was natively dispatched
                        jsc.triggerInputEvent(THIS.valueElement, 'change', true, true);
                    }
                }


                function onAlphaChange (ev) {
                    if (jsc.getData(ev, 'internal')) {
                        return; // skip if the event was internally triggered by jscolor
                    }

                    var oldVal = THIS.alphaElement.value;

                    THIS.processAlphaInput(THIS.alphaElement.value); // this might change the value

                    jsc.triggerCallback(THIS, 'onChange');

                    // triggering valueElement's onChange (because changing alpha changes the entire color, e.g. with rgba format)
                    jsc.triggerInputEvent(THIS.valueElement, 'change', true, true);

                    if (THIS.alphaElement.value !== oldVal) {
                        // value was additionally changed -> let's trigger the change event again, even though it was natively dispatched
                        jsc.triggerInputEvent(THIS.alphaElement, 'change', true, true);
                    }
                }


                function onValueInput (ev) {
                    if (jsc.getData(ev, 'internal')) {
                        return; // skip if the event was internally triggered by jscolor
                    }

                    if (THIS.valueElement) {
                        THIS.fromString(THIS.valueElement.value, jsc.flags.leaveValue);
                    }

                    jsc.triggerCallback(THIS, 'onInput');

                    // triggering valueElement's onInput
                    // (not needed, it was dispatched normally by the browser)
                }


                function onAlphaInput (ev) {
                    if (jsc.getData(ev, 'internal')) {
                        return; // skip if the event was internally triggered by jscolor
                    }

                    if (THIS.alphaElement) {
                        THIS.fromHSVA(null, null, null, parseFloat(THIS.alphaElement.value), jsc.flags.leaveAlpha);
                    }

                    jsc.triggerCallback(THIS, 'onInput');

                    // triggering valueElement's onInput (because changing alpha changes the entire color, e.g. with rgba format)
                    jsc.triggerInputEvent(THIS.valueElement, 'input', true, true);
                }


                // let's process the DEPRECATED 'options' property (this will be later removed)
                if (jsc.pub.options) {
                    // let's set custom default options, if specified
                    for (var opt in jsc.pub.options) {
                        if (jsc.pub.options.hasOwnProperty(opt)) {
                            try {
                                setOption(opt, jsc.pub.options[opt]);
                            } catch (e) {
                                console.warn(e);
                            }
                        }
                    }
                }


                // let's apply configuration presets
                //
                var presetsArr = [];

                if (opts.preset) {
                    if (typeof opts.preset === 'string') {
                        presetsArr = opts.preset.split(/\s+/);
                    } else if (Array.isArray(opts.preset)) {
                        presetsArr = opts.preset.slice(); // slice() to clone
                    } else {
                        console.warn('Unrecognized preset value');
                    }
                }

                // always use the 'default' preset. If it's not listed, append it to the end.
                if (presetsArr.indexOf('default') === -1) {
                    presetsArr.push('default');
                }

                // let's apply the presets in reverse order, so that should there be any overlapping options,
                // the formerly listed preset will override the latter
                for (var i = presetsArr.length - 1; i >= 0; i -= 1) {
                    var pres = presetsArr[i];
                    if (!pres) {
                        continue; // preset is empty string
                    }
                    if (!jsc.pub.presets.hasOwnProperty(pres)) {
                        console.warn('Unknown preset: %s', pres);
                        continue;
                    }
                    for (var opt in jsc.pub.presets[pres]) {
                        if (jsc.pub.presets[pres].hasOwnProperty(opt)) {
                            try {
                                setOption(opt, jsc.pub.presets[pres][opt]);
                            } catch (e) {
                                console.warn(e);
                            }
                        }
                    }
                }


                // let's set specific options for this color picker
                var nonProperties = [
                    // these options won't be set as instance properties
                    'preset',
                ];
                for (var opt in opts) {
                    if (opts.hasOwnProperty(opt)) {
                        if (nonProperties.indexOf(opt) === -1) {
                            try {
                                setOption(opt, opts[opt]);
                            } catch (e) {
                                console.warn(e);
                            }
                        }
                    }
                }


                //
                // Install the color picker on chosen element(s)
                //


                // Determine picker's container element
                if (this.container === undefined) {
                    this.container = window.document.body; // default container is BODY element

                } else { // explicitly set to custom element
                    this.container = jsc.node(this.container);
                }

                if (!this.container) {
                    throw new Error('Cannot instantiate color picker without a container element');
                }


                // Fetch the target element
                this.targetElement = jsc.node(targetElement);

                if (!this.targetElement) {
                    // temporarily customized error message to help with migrating from versions prior to 2.2
                    if (typeof targetElement === 'string' && /^[a-zA-Z][\w:.-]*$/.test(targetElement)) {
                        // targetElement looks like valid ID
                        var possiblyId = targetElement;
                        throw new Error('If \'' + possiblyId + '\' is supposed to be an ID, please use \'#' + possiblyId + '\' or any valid CSS selector.');
                    }

                    throw new Error('Cannot instantiate color picker without a target element');
                }

                if (this.targetElement.jscolor && this.targetElement.jscolor instanceof jsc.pub) {
                    throw new Error('Color picker already installed on this element');
                }


                // link this instance with the target element
                this.targetElement.jscolor = this;
                jsc.addClass(this.targetElement, jsc.pub.className);

                // register this instance
                jsc.instances.push(this);


                // if target is BUTTON
                if (jsc.isButton(this.targetElement)) {

                    if (this.targetElement.type.toLowerCase() !== 'button') {
                        // on buttons, always force type to be 'button', e.g. in situations the target <button> has no type
                        // and thus defaults to 'submit' and would submit the form when clicked
                        this.targetElement.type = 'button';
                    }

                    if (jsc.isButtonEmpty(this.targetElement)) { // empty button
                        // it is important to clear element's contents first.
                        // if we're re-instantiating color pickers on DOM that has been modified by changing page's innerHTML,
                        // we would keep adding more non-breaking spaces to element's content (because element's contents survive
                        // innerHTML changes, but picker instances don't)
                        jsc.removeChildren(this.targetElement);

                        // let's insert a non-breaking space
                        this.targetElement.appendChild(window.document.createTextNode('\xa0'));

                        // set min-width = previewSize, if not already greater
                        var compStyle = jsc.getCompStyle(this.targetElement);
                        var currMinWidth = parseFloat(compStyle['min-width']) || 0;
                        if (currMinWidth < this.previewSize) {
                            jsc.setStyle(this.targetElement, {
                                'min-width': this.previewSize + 'px',
                            }, this.forceStyle);
                        }
                    }
                }

                // Determine the value element
                if (this.valueElement === undefined) {
                    if (jsc.isTextInput(this.targetElement)) {
                        // for text inputs, default valueElement is targetElement
                        this.valueElement = this.targetElement;
                    } else {
                        // leave it undefined
                    }

                } else if (this.valueElement === null) { // explicitly set to null
                    // leave it null

                } else { // explicitly set to custom element
                    this.valueElement = jsc.node(this.valueElement);
                }

                // Determine the alpha element
                if (this.alphaElement) {
                    this.alphaElement = jsc.node(this.alphaElement);
                }

                // Determine the preview element
                if (this.previewElement === undefined) {
                    this.previewElement = this.targetElement; // default previewElement is targetElement

                } else if (this.previewElement === null) { // explicitly set to null
                    // leave it null

                } else { // explicitly set to custom element
                    this.previewElement = jsc.node(this.previewElement);
                }

                // valueElement
                if (this.valueElement && jsc.isTextInput(this.valueElement)) {

                    // If the value element has onInput event already set, we need to detach it and attach AFTER our listener.
                    // otherwise the picker instance would still contain the old color when accessed from the onInput handler.
                    var valueElementOrigEvents = {
                        onInput: this.valueElement.oninput
                    };
                    this.valueElement.oninput = null;

                    this.valueElement.addEventListener('keydown', onValueKeyDown, false);
                    this.valueElement.addEventListener('change', onValueChange, false);
                    this.valueElement.addEventListener('input', onValueInput, false);
                    // the original event listener must be attached AFTER our handler (to let it first set picker's color)
                    if (valueElementOrigEvents.onInput) {
                        this.valueElement.addEventListener('input', valueElementOrigEvents.onInput, false);
                    }

                    this.valueElement.setAttribute('autocomplete', 'off');
                    this.valueElement.setAttribute('autocorrect', 'off');
                    this.valueElement.setAttribute('autocapitalize', 'off');
                    this.valueElement.setAttribute('spellcheck', false);
                }

                // alphaElement
                if (this.alphaElement && jsc.isTextInput(this.alphaElement)) {
                    this.alphaElement.addEventListener('keydown', onAlphaKeyDown, false);
                    this.alphaElement.addEventListener('change', onAlphaChange, false);
                    this.alphaElement.addEventListener('input', onAlphaInput, false);

                    this.alphaElement.setAttribute('autocomplete', 'off');
                    this.alphaElement.setAttribute('autocorrect', 'off');
                    this.alphaElement.setAttribute('autocapitalize', 'off');
                    this.alphaElement.setAttribute('spellcheck', false);
                }

                // determine initial color value
                //
                var initValue = 'FFFFFF';

                if (this.value !== undefined) {
                    initValue = this.value; // get initial color from the 'value' property
                } else if (this.valueElement && this.valueElement.value !== undefined) {
                    initValue = this.valueElement.value; // get initial color from valueElement's value
                }

                // determine initial alpha value
                //
                var initAlpha = undefined;

                if (this.alpha !== undefined) {
                    initAlpha = (''+this.alpha); // get initial alpha value from the 'alpha' property
                } else if (this.alphaElement && this.alphaElement.value !== undefined) {
                    initAlpha = this.alphaElement.value; // get initial color from alphaElement's value
                }

                // determine current format based on the initial color value
                //
                this._currentFormat = null;

                if (['auto', 'any'].indexOf(this.format.toLowerCase()) > -1) {
                    // format is 'auto' or 'any' -> let's auto-detect current format
                    var color = jsc.parseColorString(initValue);
                    this._currentFormat = color ? color.format : 'hex';
                } else {
                    // format is specified
                    this._currentFormat = this.format.toLowerCase();
                }


                // let's parse the initial color value and expose color's preview
                this.processValueInput(initValue);

                // let's also parse and expose the initial alpha value, if any
                //
                // Note: If the initial color value contains alpha value in it (e.g. in rgba format),
                // this will overwrite it. So we should only process alpha input if there was initial
                // alpha explicitly set, otherwise we could needlessly lose initial value's alpha
                if (initAlpha !== undefined) {
                    this.processAlphaInput(initAlpha);
                }

                if (this.random) {
                    // randomize the initial color value
                    this.randomize.apply(this, Array.isArray(this.random) ? this.random : []);
                }

            }

        };


//================================
// Public properties and methods
//================================

//
// These will be publicly available via jscolor.<name> and JSColor.<name>
//


// class that will be set to elements having jscolor installed on them
        jsc.pub.className = 'jscolor';


// class that will be set to elements having jscolor active on them
        jsc.pub.activeClassName = 'jscolor-active';


// whether to try to parse the options string by evaluating it using 'new Function()'
// in case it could not be parsed with JSON.parse()
        jsc.pub.looseJSON = true;


// presets
        jsc.pub.presets = {};

// built-in presets
        jsc.pub.presets['default'] = {}; // baseline for customization

        jsc.pub.presets['light'] = { // default color scheme
            backgroundColor: 'rgba(255,255,255,1)',
            controlBorderColor: 'rgba(187,187,187,1)',
            buttonColor: 'rgba(0,0,0,1)',
        };
        jsc.pub.presets['dark'] = {
            backgroundColor: 'rgba(51,51,51,1)',
            controlBorderColor: 'rgba(153,153,153,1)',
            buttonColor: 'rgba(240,240,240,1)',
        };

        jsc.pub.presets['small'] = { width:101, height:101, padding:10, sliderSize:14, paletteCols:8 };
        jsc.pub.presets['medium'] = { width:181, height:101, padding:12, sliderSize:16, paletteCols:10 }; // default size
        jsc.pub.presets['large'] = { width:271, height:151, padding:12, sliderSize:24, paletteCols:15 };

        jsc.pub.presets['thin'] = { borderWidth:1, controlBorderWidth:1, pointerBorderWidth:1 }; // default thickness
        jsc.pub.presets['thick'] = { borderWidth:2, controlBorderWidth:2, pointerBorderWidth:2 };


// size of space in the sliders
        jsc.pub.sliderInnerSpace = 3; // px

// transparency chessboard
        jsc.pub.chessboardSize = 8; // px
        jsc.pub.chessboardColor1 = '#666666';
        jsc.pub.chessboardColor2 = '#999999';

// preview separator
        jsc.pub.previewSeparator = ['rgba(255,255,255,.65)', 'rgba(128,128,128,.65)'];


// Initializes jscolor
        jsc.pub.init = function () {
            if (jsc.initialized) {
                return;
            }

            // attach some necessary handlers
            window.document.addEventListener('mousedown', jsc.onDocumentMouseDown, false);
            window.document.addEventListener('keyup', jsc.onDocumentKeyUp, false);
            window.addEventListener('resize', jsc.onWindowResize, false);
            window.addEventListener('scroll', jsc.onWindowScroll, false);

            // append default CSS to HEAD
            jsc.appendDefaultCss();

            // install jscolor on current DOM
            jsc.pub.install();

            jsc.initialized = true;

            // call functions waiting in the queue
            while (jsc.readyQueue.length) {
                var func = jsc.readyQueue.shift();
                func();
            }
        };


// Installs jscolor on current DOM tree
        jsc.pub.install = function (rootNode) {
            var success = true;

            try {
                jsc.installBySelector('[data-jscolor]', rootNode);
            } catch (e) {
                success = false;
                console.warn(e);
            }

            // for backward compatibility with DEPRECATED installation using class name
            if (jsc.pub.lookupClass) {
                try {
                    jsc.installBySelector(
                        (
                            'input.' + jsc.pub.lookupClass + ', ' +
                            'button.' + jsc.pub.lookupClass
                        ),
                        rootNode
                    );
                } catch (e) {}
            }

            return success;
        };


// Registers function to be called as soon as jscolor is initialized (or immediately, if it already is).
//
        jsc.pub.ready = function (func) {
            if (typeof func !== 'function') {
                console.warn('Passed value is not a function');
                return false;
            }

            if (jsc.initialized) {
                func();
            } else {
                jsc.readyQueue.push(func);
            }
            return true;
        };


// Triggers given input event(s) (e.g. 'input' or 'change') on all color pickers.
//
// It is possible to specify multiple events separated with a space.
// If called before jscolor is initialized, then the events will be triggered after initialization.
//
        jsc.pub.trigger = function (eventNames) {
            var triggerNow = function () {
                jsc.triggerGlobal(eventNames);
            };

            if (jsc.initialized) {
                triggerNow();
            } else {
                jsc.pub.ready(triggerNow);
            }
        };


// Hides current color picker box
        jsc.pub.hide = function () {
            if (jsc.picker && jsc.picker.owner) {
                jsc.picker.owner.hide();
            }
        };


// Returns a data URL of a gray chessboard image that indicates transparency
        jsc.pub.chessboard = function (color) {
            if (!color) {
                color = 'rgba(0,0,0,0)';
            }
            var preview = jsc.genColorPreviewCanvas(color);
            return preview.canvas.toDataURL();
        };


// Returns a data URL of a gray chessboard image that indicates transparency
        jsc.pub.background = function (color) {
            var backgrounds = [];

            // CSS gradient for background color preview
            backgrounds.push(jsc.genColorPreviewGradient(color));

            // data URL of generated PNG image with a gray transparency chessboard
            var preview = jsc.genColorPreviewCanvas();
            backgrounds.push([
                'url(\'' + preview.canvas.toDataURL() + '\')',
                'left top',
                'repeat',
            ].join(' '));

            return backgrounds.join(', ');
        };


//
// DEPRECATED properties and methods
//


// DEPRECATED. Use jscolor.presets.default instead.
//
// Custom default options for all color pickers, e.g. { hash: true, width: 300 }
        jsc.pub.options = {};


// DEPRECATED. Use data-jscolor attribute instead, which installs jscolor on given element.
//
// By default, we'll search for all elements with class="jscolor" and install a color picker on them.
//
// You can change what class name will be looked for by setting the property jscolor.lookupClass
// anywhere in your HTML document. To completely disable the automatic lookup, set it to null.
//
        jsc.pub.lookupClass = 'jscolor';


// DEPRECATED. Use data-jscolor attribute instead, which installs jscolor on given element.
//
// Install jscolor on all elements that have the specified class name
        jsc.pub.installByClassName = function () {
            console.error('jscolor.installByClassName() is DEPRECATED. Use data-jscolor="" attribute instead of a class name.' + jsc.docsRef);
            return false;
        };


        jsc.register();


        return jsc.pub;


    })(); // END jscolor


    if (typeof window.jscolor === 'undefined') {
        window.jscolor = window.JSColor = jscolor;
    }


// END jscolor code

    return jscolor;

}); // END factory

/**
 * Start of Overwatch code
 */
// Constants and Global Variables
var WATCHTOWER_RADIUS = [1.1, 1.3, 1.5, 1.7, 2, 2.3, 2.6, 3, 3.4, 3.9, 4.4, 5.1, 5.8, 6.7, 7.6, 8.7, 10, 11.5, 13.1, 15];
var DEFAULT_COLORS = [
    { color: "#FF0000", opacity: 0.3 },
    { color: "#FF5100", opacity: 0.3 },
    { color: "#FFAE00", opacity: 0.3 },
    { color: "#F2FF00", opacity: 0.3 },
    { color: "#B7FF00", opacity: 0.3 },
    { color: "#62FF00", opacity: 0.3 },
    { color: "#04FF00", opacity: 0.3 },
    { color: "#00FF7B", opacity: 0.3 },
    { color: "#00FFAE", opacity: 0.3 },
    { color: "#00C8FF", opacity: 0.3 },
    { color: "#006AFF", opacity: 0.3 },
    { color: "#1500FF", opacity: 0.3 },
    { color: "#4000FF", opacity: 0.3 },
    { color: "#8C00FF", opacity: 0.3 },
    { color: "#FF00D9", opacity: 0.3 }
];

// Global state
let options, playerIDs, urls = [], buildingUrls = [], playerData = [];
let mapOverlay = TWMap;
let targetData = [];
let tileWidthX = TWMap.tileSize[0];
let tileWidthY = TWMap.tileSize[1];
let selectedVillages = [];
let currentCoords = "";
let settingsData, unitPopValues, packetSize, minimum, smallStack, mediumStack, bigStack, targetStackSize;

// Images for map
var images = Array.from({ length: 3 }, () => new Image());
images[0].src = "/graphic//map/incoming_attack.webp";
images[1].src = "/graphic/buildings/wall.webp";
images[2].src = "/graphic/buildings/farm.webp";

// Append styles
$("#contentContainer").eq(0).prepend(`<style>
    .overviewWithPadding th, .overviewWithPadding td { padding: 2px 10px; }
    #overwatchNotification {
        visibility: hidden; min-width: 250px; margin-left: -125px; background-color: #f4e4bc; color: #000; border: 1px solid #7d510f; text-align: center; border-radius: 2px; padding: 16px; position: fixed; z-index: 1; left: 50%; top: 50px;
    }
    #overwatchNotification.show { visibility: visible; animation: fadein 0.5s, fadeout 0.5s 2.5s; }
    @keyframes fadein { from { top: 0; opacity: 0; } to { top: 50px; opacity: 1; } }
    @keyframes fadeout { from { top: 50px; opacity: 1; } to { top: 0; opacity: 0; } }
    .middle { position: relative; width: 100%; max-width: 500px; }
    .jscolor-picker-border { background: #f4e4bc !important; border: 1px solid #7d510f !important; }
    .jscolor-picker-border canvas { border: 1px solid #7d510f !important; }
    .slider { position: relative; z-index: 1; height: 10px; margin: 0 15px; }
    .slider > .track { position: absolute; z-index: 1; left: 0; right: 0; top: 0; bottom: 0; border-radius: 5px; background-image: linear-gradient(to right, black, red, yellow, green); }
    .slider > .range { position: absolute; z-index: 2; left: 25%; right: 25%; top: 0; bottom: 0; border-radius: 5px; background-color: #FF0000; }
    .slider > .thumb { position: absolute; z-index: 3; width: 20px !important; height: 20px; border-radius: 50%; box-shadow: 0 0 0 0 rgba(255,255,0,.1); transition: box-shadow .3s ease-in-out; }
    .slider > .thumb.left { background-color: #FF0000 !important; left: 25%; transform: translate(-10px, -5px); }
    .slider > .thumb.right { background-color: #FF0000 !important; right: 25%; transform: translate(10px, -5px); }
    .slider > .thumb.hover { box-shadow: 0 0 0 20px rgba(255,0,0,.1); }
    .slider > .thumb.active { box-shadow: 0 0 0 40px rgba(255,0,0,.2); }
    input[type=range] { position: absolute; pointer-events: none; -webkit-appearance: none; z-index: 2; height: 10px; width: 100%; opacity: 0; }
    input[type=range]::-webkit-slider-thumb { pointer-events: all; width: 30px; height: 30px; border-radius: 0; border: 0 none; background-color: red; -webkit-appearance: none; }
</style>`);

// UIManager Module
var UIManager = {
    createOverview() {
        $("#overwatchNotification, #tribeLeaderUI").remove();
        const scriptUI = this.buildUI();
        $("#contentContainer").prepend(scriptUI);
        this.setupEventListeners();
        this.setInitialValues();
        $("#tribeLeaderUI").draggable();
    },

    buildUI() {
        return `
            <div id="overwatchNotification">Placeholder</div>
            <div id="tribeLeaderUI" class="ui-widget-content vis" style="min-width:200px;background:#f4e4bc;position:fixed;cursor:move;z-index:999;">
                <div style="min-height:35px">
                    <h3 id="titleOverwatch" style="display:none;margin:auto;text-align:center;padding-top:6px">Overwatch</h3>
                    <img id="toggleIcon" style="position:absolute;left:20px;top:10px;" class="widget-button" src="graphic/minus.png" />
                    <div id="toggleUi">
                        <center>
                            <table style="margin:30px 20px">
                                <tr>
                                    <td><input type="button" class="btn evt-confirm-btn btn-confirm-yes" id="playerSettingsButton" value="Player settings"/></td>
                                    <td><input type="button" class="btn evt-confirm-btn btn-confirm-yes" id="stackSizeButton" value="Stacksize settings"/></td>
                                    <td><input type="button" class="btn evt-confirm-btn btn-confirm-yes" id="stackListButton" value="Stacklist generator"/></td>
                                    <td><input type="button" class="btn evt-confirm-btn btn-confirm-yes" id="importExportButton" value="Import/export data"/></td>
                                </tr>
                            </table>
                            ${this.buildPlayerSettingsTab()}
                            ${this.buildStackSizeTab()}
                            ${this.buildStackListTab()}
                            ${this.buildImportExportTab()}
                            <div style="margin:20px 20px">
                                <a href="#" class="btn btn-default" id="redrawMapBtn">Redraw map</a>
                                <br><small style="margin-top:10px">Script created by Sass - Shinko to Kuma</small>
                            </div>
                        </center>
                    </div>
                </div>
            </div>
        `;
    },

    buildPlayerSettingsTab() {
        let html = `
            <div id="playerSettings">
                <div style="max-height:600px!important;overflow-y:auto;margin:30px;width:fit-content;">
                    <table class="vis overviewWithPadding" style="border:1px solid #7d510f;min-width:600px;max-width:900px;">
                        <thead><tr>
                            <th>Player name</th>
                            ${"watchtower" in game_data.village.buildings ? '<th style="width:80px;text-align:center;">Map WT</th><th style="width:80px;text-align:center;">Minimap WT</th>' : ''}
                            <th style="width:80px;text-align:center;">Map color</th>
                            <th>Incoming attacks count</th>
                        </tr></thead>
                        <tbody>
        `;
        playerData.forEach((player, i) => {
            const color = player.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length].color;
            const opacity = player.opacity || DEFAULT_COLORS[i % DEFAULT_COLORS.length].opacity;
            const checkedWT = player.checkedWT || false;
            const checkedWTMini = player.checkedWTMini || false;
            const rowClass = i % 2 === 0 ? "row_b" : "row_a";
            html += `
                <tr class="${rowClass}">
                    <td>${player.playerName}</td>
                    ${"watchtower" in game_data.village.buildings ? `<td><center><input id="checkMapWT${player.playerID.replace(/[\s()]/g, '')}" type="checkbox" ${checkedWT ? 'checked' : ''}></center></td><td><center><input id="checkWTMini${player.playerID.replace(/[\s()]/g, '')}" type="checkbox" ${checkedWTMini ? 'checked' : ''}></center></td>` : ''}
                    <td><center><button class="btn" id="color${player.playerID.replace(/[\s()]/g, '')}" data-jscolor="{valueElement:'#val${player.playerID.replace(/[\s()]/g, '')}', alphaElement:'#alp${player.playerID.replace(/[\s()]/g, '')}'}"></button>
                    <input id="val${player.playerID.replace(/[\s()]/g, '')}" value="${color}" name="color${player.playerName}[value]" type="hidden">
                    <input id="alp${player.playerID.replace(/[\s()]/g, '')}" value="${opacity}" name="color${player.playerName}[alpha]" type="hidden"></center></td>
                    <td>${player.attackCount}</td>
                </tr>
            `;
        });
        html += `
            ${"watchtower" in game_data.village.buildings ? '<tr style="border-top:1px solid black;"><td style="text-align:right">Select all:</td><td><center><input id="checkAllWT" type="checkbox"></center></td><td><center><input id="checkAllWTMini" type="checkbox"></center></td><td colspan="2"></td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        return html;
    },

    buildStackSizeTab() {
        return `
            <div id="stackSize">
                <table class="vis" style="margin:30px;">
                    <tr><th>Empty</th><th colspan="2" style="width:400px;text-align:center">Small - Medium stack</th><th>Big stack</th></tr>
                    <tr style="height:70px">
                        <td><input type="text" id="emptyStack" name="emptyStack" onchange="minimum=$(this).val();updateStackSizes();"></td>
                        <td colspan="2">
                            <div class="middle">
                                <div class="multi-range-slider">
                                    <input type="range" id="input-left" min="0" max="100" value="25">
                                    <input type="range" id="input-right" min="0" max="100" value="75">
                                    <div class="slider">
                                        <div class="track"></div>
                                        <div class="range"></div>
                                        <div class="thumb left"></div>
                                        <div class="thumb right"></div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td><input type="text" id="bigStack" name="bigStack" onchange="bigStack=$(this).val();updateStackSizes();"></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td><label style="text-align:right">Small stack</label><input type="text" style="margin-left:20px;" onchange="updateSmall(this)" id="smallStack" name="smallStack"></td>
                        <td style="text-align:right;"><label style="margin-left:40px;margin-right:10px;">Medium stack</label><input type="text" style="margin-right:20px;" onchange="updateMedium(this)" id="mediumStack" name="mediumStack"></td>
                        <td></td>
                    </tr>
                </table>
                <table class="vis overviewWithPadding" style="border:1px solid #7d510f;margin:20px;">
                    <thead>
                        <tr>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="spear"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_spear.png" title="Spear fighter" alt="" class=""></a></th>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="sword"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_sword.png" title="Swordsman" alt="" class=""></a></th>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="axe"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_axe.png" title="Axeman" alt="" class=""></a></th>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="archer"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_archer.png" title="Archer" alt="" class=""></a></th>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="spy"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_spy.png" title="Scout" alt="" class=""></a></th>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="light"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_light.png" title="Light cavalry" alt="" class=""></a></th>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="marcher"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_marcher.png" title="Mounted Archer" alt="" class=""></a></th>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="heavy"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_heavy.png" title="Heavy cavalry" alt="" class=""></a></th>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="ram"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_ram.png" title="Ram" alt="" class=""></a></th>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="catapult"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_catapult.png" title="Catapult" alt="" class=""></a></th>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="snob"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_knight.png" title="Knight" alt="" class=""></a></th>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="snob"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_snob.png" title="Noble" alt="" class=""></a></th>
                            <th style="text-align:center" width="35"><a href="#" class="unit_link" data-unit="militia"><img src="https://dsus.innogamescdn.com/asset/a9e85669/graphic/unit/unit_militia.png" title="Militia" alt="" class=""></a></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td align="center"><input type="text" data-pop="1" onchange="SettingsManager.save();" name="spear" id="spear" size="2" value="${unitPopValues.spear}"></td>
                            <td align="center"><input type="text" data-pop="1" onchange="SettingsManager.save();" name="sword" id="sword" size="2" value="${unitPopValues.sword}"></td>
                            <td align="center"><input type="text" data-pop="1" onchange="SettingsManager.save();" name="axe" id="axe" size="2" value="${unitPopValues.axe}"></td>
                            <td align="center"><input type="text" data-pop="1" onchange="SettingsManager.save();" name="archer" id="archer" size="2" value="${unitPopValues.archer}"></td>
                            <td align="center"><input type="text" data-pop="2" onchange="SettingsManager.save();" name="spy" id="spy" size="2" value="${unitPopValues.spy}"></td>
                            <td align="center"><input type="text" data-pop="4" onchange="SettingsManager.save();" name="light" id="light" size="2" value="${unitPopValues.light}"></td>
                            <td align="center"><input type="text" data-pop="5" onchange="SettingsManager.save();" name="marcher" id="marcher" size="2" value="${unitPopValues.marcher}"></td>
                            <td align="center"><input type="text" data-pop="6" onchange="SettingsManager.save();" name="heavy" id="heavy" size="2" value="${unitPopValues.heavy}"></td>
                            <td align="center"><input type="text" data-pop="5" onchange="SettingsManager.save();" name="ram" id="ram" size="2" value="${unitPopValues.ram}"></td>
                            <td align="center"><input type="text" data-pop="8" onchange="SettingsManager.save();" name="catapult" id="catapult" size="2" value="${unitPopValues.catapult}"></td>
                            <td align="center"><input type="text" data-pop="1" onchange="SettingsManager.save();" name="knight" id="knight" size="2" value="${unitPopValues.knight}"></td>
                            <td align="center"><input type="text" data-pop="100" onchange="SettingsManager.save();" name="snob" id="snob" size="2" value="${unitPopValues.snob}"></td>
                            <td align="center"><input type="text" data-pop="1" onchange="SettingsManager.save();" name="militia" id="militia" size="2" value="${unitPopValues.militia}"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    },

    buildStackListTab() {
        return `
            <div id="stackList">
                <div style="width:600px;margin:30px;">
                    <h1>Selected villages: <span id="countSelectedVillages">0</span></h1>
                    <hr>
                    <p><textarea rows="${Math.max(selectedVillages.length + 1, 10)}" style="width:590px;max-height:155px;overflow-y:auto;" id="villageList" value=""></textarea></p>
                    <hr>
                    <p><textarea rows="${Math.max(selectedVillages.length + 4, 10)}" style="width:590px;max-height:155px;overflow-y:auto;" id="villageListBB" value=""></textarea></p>
                    <br />
                </div>
            </div>
        `;
    },

    buildImportExportTab() {
        return `
            <div id="importExport">
                <div style="width:600px;margin:30px;">
                    <h1>Export Data</h1>
                    <hr>
                    <p><a href="#" class="btn btn-default" id="exportBtn">Export players</a></p>
                    <hr>
                    <h1>Import data</h1>
                    <p><textarea rows="3" style="width:590px;max-height:155px;overflow-y:auto;" id="importData" value=""></textarea></p>
                    <p><a href="#" class="btn btn-default" id="importBtn">Import players</a></p>
                    <hr>
                    <br />
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        // Checkbox listeners
        $("#checkAllWT").click(function() {
            $('input:checkbox[id^="checkMapWT"]').not(this).prop('checked', this.checked);
        });
        $("#checkAllWTMini").click(function() {
            $('input:checkbox[id^="checkWTMini"]').not(this).prop('checked', this.checked);
        });

        // Slider setup
        var inputLeft = document.getElementById("input-left");
        var inputRight = document.getElementById("input-right");
        var thumbLeft = document.querySelector(".slider > .thumb.left");
        var thumbRight = document.querySelector(".slider > .thumb.right");
        var range = document.querySelector(".slider > .range");

        // Update left value
        function setLeftValue() {
            var _this = inputLeft,
                min = parseInt(_this.min),
                max = parseInt(_this.max);

            _this.value = Math.min(parseInt(_this.value), parseInt(inputRight.value) - 1);

            var percent = ((_this.value - min) / (max - min)) * 100;

            thumbLeft.style.left = percent + "%";
            range.style.left = percent + "%";
            $(".track").css('background-image', `linear-gradient(to right, #75FFFF, black ${(minimum / bigStack) * 100}%, black ${inputLeft.value - 10}%, red ${inputLeft.value}%, red ${inputRight.value}%, yellow ${parseInt(inputRight.value) + 10}%, yellow 95% ,green)`);
            smallStack = Math.round(bigStack * (percent / 100));
            $("#smallStack").val(smallStack);
        }

        // Update right value
        function setRightValue() {
            var _this = inputRight,
                min = parseInt(_this.min),
                max = parseInt(_this.max);

            _this.value = Math.max(parseInt(_this.value), parseInt(inputLeft.value) + 1);

            var percent = ((_this.value - min) / (max - min)) * 100;

            thumbRight.style.right = (100 - percent) + "%";
            range.style.right = (100 - percent) + "%";
            $(".track").css('background-image', `linear-gradient(to right, #75FFFF, black ${(minimum / bigStack) * 100}%, black ${inputLeft.value - 10}%, red ${inputLeft.value}%, red ${inputRight.value}%, yellow ${parseInt(inputRight.value) + 10}%, yellow 95% ,green)`);
            mediumStack = Math.round(bigStack * (percent / 100));
            $("#mediumStack").val(mediumStack);
        }
        //
        // // Initialize values
        setLeftValue();
        setRightValue();

        // Input events
        inputLeft.addEventListener("input", setLeftValue);
        inputRight.addEventListener("input", setRightValue);

        // Left input hover and active states
        inputLeft.addEventListener("mouseover", function() {
            thumbLeft.classList.add("hover");
        });
        inputLeft.addEventListener("mouseout", function() {
            thumbLeft.classList.remove("hover");
        });
        inputLeft.addEventListener("mousedown", function() {
            thumbLeft.classList.add("active");
        });
        inputLeft.addEventListener("mouseup", function() {
            thumbLeft.classList.remove("active");
            SettingsManager.save();
        });

        // Right input hover and active states
        inputRight.addEventListener("mouseover", function() {
            thumbRight.classList.add("hover");
        });
        inputRight.addEventListener("mouseout", function() {
            thumbRight.classList.remove("hover");
        });
        inputRight.addEventListener("mousedown", function() {
            thumbRight.classList.add("active");
        });
        inputRight.addEventListener("mouseup", function() {
            thumbRight.classList.remove("active");
            SettingsManager.save();
        });

        // Prevent dragging on slider area
        $(".multi-range-slider, .slider, input[type=range]").on('mousedown touchstart', function(e) {
            e.stopPropagation();
        });

        // Toggle UI button
        $("#toggleIcon").click(() => {
            UIManager.toggleUI();
        });

        // Category display buttons
        $("#playerSettingsButton").click(() => {
            UIManager.displayCategory('playerSettings');
        });
        $("#stackSizeButton").click(() => {
            UIManager.displayCategory('stackSize');
        });
        $("#stackListButton").click(() => {
            UIManager.displayCategory('stackList');
        });
        $("#importExportButton").click(() => {
            UIManager.displayCategory('importExport');
        });

        // Redraw map button
        $("#redrawMapBtn").click((e) => {
            e.preventDefault();
            saveSettingsAndRedraw();
        });

        // Export players button
        $(document).on('click', '#exportBtn', function(e) {
            e.preventDefault();
            exportData();
        });

        // Import players button
        $(document).on('click', '#importBtn', function(e) {
            e.preventDefault();
            importData();
        });
    },

    setInitialValues() {
        $("#emptyStack").val(minimum);
        $("#smallStack").val(smallStack);
        $("#mediumStack").val(mediumStack);
        $("#bigStack").val(bigStack);
        $("#input-left").val(Math.floor(smallStack / bigStack * 100));
        $("#input-right").val(Math.floor(mediumStack / bigStack * 100));
        this.displayCategory("playerSettings");
    },

    displayCategory(category) {
        const allCategories = ["stackList", "stackSize", "playerSettings", "importExport"];
        $(`#${category}`).show();
        $(`#${category}Button`).attr("class", "btn evt-cancel-btn btn-confirm-yes");
        allCategories.filter(c => c !== category).forEach(c => {
            $(`#${c}`).hide();
            $(`#${c}Button`).attr("class", "btn evt-confirm-btn btn-confirm-no");
        });
    },

    toggleUI() {
        const icon = $('#toggleIcon');
        if (icon.attr('src').includes('minus.png')) icon.attr('src', 'graphic/plus.png');
        else icon.attr('src', 'graphic/minus.png');
        $('#toggleUi, #titleOverwatch').toggle();
    }
};

// DataManager Module
var DataManager = {
    async fetchPlayerIDs() {
        const membersDef = await $.get("/game.php?screen=ally&mode=members_defense");
        options = $(membersDef).find('.input-nicer option:not(:first)');
        playerIDs = options.map((_, option) => option.value).get();
        urls = playerIDs.map(id => `/game.php?screen=ally&mode=members_defense&player_id=${id}`);
    },

    async fetchBuildingIDs() {
        const membersBuildings = await $.get("/game.php?screen=ally&mode=members_buildings");
        const buildingOptions = $(membersBuildings).find('.input-nicer option:not(:first)');
        const playerBuildingIDs = buildingOptions.map((_, option) => option.value).get();
        buildingUrls = playerBuildingIDs.map(id => `/game.php?screen=ally&mode=members_buildings&player_id=${id}`);
    },

    async fetchAllData() {
        if ($("#contentContainer")[0]) {
            width = $("#contentContainer")[0].clientWidth;
            $("#contentContainer").eq(0).prepend(`
                    <div id="progressbar" class="progress-bar progress-bar-alive">
                    <span id="count" class="label">0/${urls.length}</span>
                    <div id="progress"><span id="count2" class="label" style="width: ${width}px;">0/${urls.length}</span></div>
                    </div>`);
        }
        else {
            width = $("#mobileHeader")[0].clientWidth;
            $("#mobileHeader").eq(0).prepend(`
                    <div id="progressbar" class="progress-bar progress-bar-alive">
                    <span id="count" class="label">0/${urls.length}</span>
                    <div id="progress"><span id="count2" class="label" style="width: ${width}px;">0/${urls.length}</span></div>
                    </div>`);
        }
        const defenseData = await this.staggeredGetAll(urls, this.processDefenseData.bind(this), 'Troop counts');
        const buildingData = await this.staggeredGetAll(buildingUrls, this.processBuildingData.bind(this), 'Building information');
        $("#progressbar").remove();
        this.combineData(defenseData, buildingData);
        UIManager.createOverview();
        jscolor.install();
        this.setupMapInterceptors();
        recalculate();
        MapRenderer.makeMap();
    },

    staggeredGetAll(urls, onLoad, label) {
        return new Promise((resolve, reject) => {
            let numDone = 0;
            const results = [];
            const loadNext = () => {
                if (numDone === urls.length) {
                    resolve(results);
                    return;
                }
                const now = Date.now();
                if (now - lastRequestTime < 200) {
                    setTimeout(loadNext, 200 - (now - lastRequestTime));
                    return;
                }
                $("#progress").css("width", `${(numDone + 1) / urls.length * 100}%`);
                $("#count").text(`${label}: ${numDone + 1}/${urls.length}`);
                $("#count2").text(`${label}: ${numDone + 1}/${urls.length}`);
                lastRequestTime = now;
                $.get(urls[numDone])
                    .done(data => {
                        try {
                            results[numDone] = onLoad(numDone, data);
                            numDone++;
                            loadNext();
                        } catch (e) {
                            reject(e);
                        }
                    })
                    .fail(reject);
            };
            let lastRequestTime = 0;
            loadNext();
        });
    },

    processDefenseData(i, data) {
        const playerName = $(data).find(".input-nicer option:selected").text().trim();
        const tribeName = $(data).find("#content_value h2")[0].innerText.split('(')[0].trim();
        const hasIncomings = $(data).find('#ally_content img[src*="unit/att.webp"]').length > 0;
        const attackCount = hasIncomings ? $(data).find(".table-responsive table tr:first th:last")[0].innerText.replace(/[^0-9]/g, '') : "Tell user to share incomings";
        const playerVillages = this.parseVillages(data, hasIncomings, attackCount);
        return { playerID: playerIDs[i], tribeName, playerName, attackCount, playerVillages };
    },

    parseVillages(data, hasIncomings, attackCount) {
        const villages = [];
        const table = $(data).find(".table-responsive table tr:not(:first)");
        for (let i = 0; i < table.length / 2; i++) {
            const coordinate = table[i * 2].children[0].innerText.match(/\d+\|\d+/)[0];
            const unitsInVillage = {};
            const unitsEnroute = {};
            let currentPop = 0, totalPop = 0;
            game_data.units.forEach((unit, j) => {
                unitsInVillage[unit] = table[i * 2].children[j + 3].innerText.trim();
                unitsEnroute[unit] = table[i * 2 + 1].children[j + 1].innerText.trim() === "?" ? 0 : table[i * 2 + 1].children[j + 1].innerText.trim();
                if (table[i * 2 + 1].children[j + 1].innerText.trim() === "?") attackCount = "Not sharing required settings";
                currentPop += unitsInVillage[unit] * unitPopValues[unit];
                totalPop += (unitsInVillage[unit] * unitPopValues[unit]) + (parseInt(unitsEnroute[unit]) * unitPopValues[unit]);
            });
            const attacksToVillage = hasIncomings ? table[i * 2].children[3 + game_data.units.length].innerText.trim() : "---";
            villages.push({ coordinate, currentPop, totalPop, attacksToVillage, unitsInVillage, unitsEnroute });
        }
        return villages;
    },

    processBuildingData(j, buildingTable) {
        const villages = [];
        if ($(buildingTable).find('#ally_content img[src*="buildings/watchtower.webp"]').length > 0) {
            const cellIndex = $(buildingTable).find('#ally_content img[src*="buildings/watchtower.webp"]').parent().index();
            const wallIndex = $(buildingTable).find('#ally_content img[src*="buildings/wall.webp"]').parent().index();
            const rows = $(buildingTable).find('#ally_content tr:nth-child(n+2)');
            rows.each((r, row) => {
                const coordinate = $(row).children(0).text().match(/\d+\|\d+/)[0];
                const watchtower = parseInt($($(row).find("td")[cellIndex]).text().trim()) || 0;
                const wall = parseInt($($(row).find("td")[wallIndex]).text().trim());
                villages.push({
                    coordinate,
                    watchtower,
                    wall,
                });
            });
        } else {
            const rows = $(buildingTable).find('#ally_content tr:nth-child(n+2)');
            rows.each((r, row) => {
                const coordinate = $(row).children(0).text().match(/\d+\|\d+/)[0];
                villages.push({
                    coordinate,
                    watchtower: 0,
                    wall: parseInt($(row).children().last().text().trim())
                });
            });
        }
        return villages;
    },

    combineData(defenseData, buildingData) {
        playerData = defenseData.map((player, i) => {
            // find matching player data that exists in playerData by playerID
            const playerSettings = playerData.find(p => p.playerID === player.playerID);
            const buildings = buildingData[i] || [];
            player.playerVillages.forEach(village => {
                const build = buildings.find(b => b.coordinate === village.coordinate);
                if (build) {
                    village.watchtower = build.watchtower;
                    village.wall = build.wall;
                } else {
                    village.watchtower = 0;
                    village.wall = "---";
                }
            });
            return { ...playerSettings, ...player};
        });
    },

    setupMapInterceptors() {
        const originalReceivedInfo = TWMap.popup.receivedPopupInformationForSingleVillage;
        TWMap.popup.receivedPopupInformationForSingleVillage = function(e) {
            originalReceivedInfo.call(TWMap.popup, e);
            if (Object.keys(e).length > 0) MapRenderer.makeOutput(e);
        };
        const originalDisplayForVillage = TWMap.popup.displayForVillage;
        TWMap.popup.displayForVillage = function(e, a, t) {
            originalDisplayForVillage.call(TWMap.popup, e, a, t);
            if (Object.keys(e).length > 0) MapRenderer.makeOutput(e);
        };
    }
};

var SettingsManager = {
    load() {
        const stored = localStorage.getItem("overwatchSettings");
        if (stored) {
            settingsData = JSON.parse(stored);
            packetSize = settingsData.packetSize;
            minimum = settingsData.minimum;
            smallStack = settingsData.smallStack;
            mediumStack = settingsData.mediumStack;
            bigStack = settingsData.bigStack;
            unitPopValues = settingsData.unitPopValues;
            targetStackSize = bigStack;
            playerData = settingsData.playerSettings;
        } else {
            this.setDefaults();
        }
    },

    setDefaults() {
        unitPopValues = {
            spear: 1, sword: 1, archer: 1, axe: 0, spy: 0, light: 0, marcher: 0, heavy: 4, catapult: 2, ram: 0, knight: 2, militia: 1, snob: 0
        };
        packetSize = 1000;
        minimum = 500;
        smallStack = 20000;
        mediumStack = 40000;
        bigStack = 60000;
        targetStackSize = bigStack;
        this.save();
    },

    save() {
        // playersettings is playerdata, but only these values: color, opacity, checkedWT, checkedWTMini, playerId
        const playerSettings = playerData.map(player => {
            return {
                color: player.color,
                opacity: player.opacity,
                checkedWT: player.checkedWT,
                checkedWTMini: player.checkedWTMini,
                playerID: player.playerID,
            }
        });

        const overAllSettings = {
            packetSize, minimum, smallStack, mediumStack, bigStack, playerSettings, unitPopValues
        };
        localStorage.setItem("overwatchSettings", JSON.stringify(overAllSettings));
        showNotification("Settings saved");
    },

    updateFromUI() {
        Object.keys(unitPopValues).forEach(unit => {
            unitPopValues[unit] = $(`#${unit}`).val();
        });
        playerData.forEach(player => {
            player.color = $(`#val${player.playerID.replace(/[\s()]/g, '')}`).val();
            player.opacity = $(`#alp${player.playerID.replace(/[\s()]/g, '')}`).val();
            player.checkedWT = $(`#checkMapWT${player.playerID.replace(/[\s()]/g, '')}`).is(":checked");
            player.checkedWTMini = $(`#checkWTMini${player.playerID.replace(/[\s()]/g, '')}`).is(":checked");
        });
    }
};

var Calculator = {
    getStackColor(stack, type) {
        if (stack < minimum) return "rgba(117, 255, 255, 0.5)";
        if (stack < smallStack && stack > minimum) return "rgba(0, 0, 0, 0.5)";
        if (stack > smallStack && stack < mediumStack) return "rgba(255, 0, 0, 0.5)";
        if (stack > mediumStack && stack < bigStack) return "rgba(255, 255, 0, 0.5)";
        if (stack > bigStack) return "rgba(0, 255, 0, 0.5)";
    }
};

var MapRenderer = {
    makeMap() {
        if (mapOverlay.mapHandler._spawnSector) {
            //exists already, don't recreate
        }
        else {
            //doesn't exist yet
            mapOverlay.mapHandler._spawnSector = mapOverlay.mapHandler.spawnSector;
        }
        mapOverlay.mapHandler.spawnSector = (data, sector) => {
            mapOverlay.mapHandler._spawnSector(data, sector);
            this.renderSector(data, sector);
        };
        mapOverlay.reload();
    },

    renderSector(data, sector) {
        // Main map canvas
        const beginX = sector.x - data.x;
        const endX = beginX + mapOverlay.mapSubSectorSize;
        const beginY = sector.y - data.y;
        const endY = beginY + mapOverlay.mapSubSectorSize;
        for (let x in data.tiles) {
            x = parseInt(x, 10);
            if (x < beginX || x >= endX) continue;
            for (let y in data.tiles[x]) {
                y = parseInt(y, 10);
                if (y < beginY || y >= endY) continue;
                const v = mapOverlay.villages[(data.x + x) * 1000 + (data.y + y)];
                if (v) {
                    let el = $('#mapOverlay_canvas_' + sector.x + '_' + sector.y);
                    if (!el.length) {
                        const canvas = document.createElement('canvas');
                        canvas.style.position = 'absolute';
                        canvas.width = mapOverlay.map.scale[0] * mapOverlay.map.sectorSize;
                        canvas.height = mapOverlay.map.scale[1] * mapOverlay.map.sectorSize;
                        canvas.style.zIndex = 10;
                        canvas.className = 'mapOverlay_map_canvas';
                        canvas.id = 'mapOverlay_canvas_' + sector.x + '_' + sector.y;
                        const ctx = canvas.getContext('2d');
                        const st_pixel = mapOverlay.map.pixelByCoord(sector.x, sector.y);

                        targetData.forEach(element => {
                            const t = element.coord.split('|');
                            const originXY = mapOverlay.map.pixelByCoord(t[0], t[1]);
                            const originX = (originXY[0] - st_pixel[0]) + mapOverlay.tileSize[0] / 2;
                            const originY = (originXY[1] - st_pixel[1]) + mapOverlay.tileSize[1] / 2;
                            if (t[0] >= sector.x && t[0] < sector.x + 5 && t[1] >= sector.y && t[1] < sector.y + 5) {
                                const currentColor = Calculator.getStackColor(element.currentStack);
                                const totalColor = Calculator.getStackColor(element.totalStack);

                                this.drawLeftTriangle(canvas, originX, originY, currentColor);
                                this.drawRightTriangle(canvas, originX, originY, totalColor);

                                if (element.incomingAttacks > 0) this.iconOnMap(images[0], canvas, originX - 19, originY - 12, 15);
                                if (element.wall < 20 || element.wall === "---") this.iconOnMap(images[1], canvas, originX + 7, originY - 12, 15);
                                this.iconOnMap(images[2], canvas, originX - 19, originY + 10, 15);

                                if (element.incomingAttacks > 0) this.textOnMap(element.incomingAttacks, ctx, originX - 5, originY - 8, "white", "10px Arial");
                                if (element.wall < 20 || element.wall === "---") this.textOnMap(element.wall, ctx, originX + 20, originY - 8, "white", "10px Arial");
                                this.textOnMap(Math.floor(element.totalStack / 1000) + "k", ctx, originX - 2, originY + 14, "white", "10px Arial");
                            }

                            if (element.watchtower > 0 && element.checkedWT) {
                                this.drawMapTowers(canvas, sector, originX, originY, element.watchtower, element.color, element.opacity);
                            }
                        });


                        sector.appendElement(canvas, 0, 0);

                        selectedVillages.forEach(coord => {
                            const t = coord.split('|');
                            const village = TWMap.villages[t[0] * 1000 + t[1]];
                            if (village && village.id) {
                                if (currentCoords.includes(coord)) {
                                    $(`[id="map_village_${village.id}"]`).css({ filter: 'brightness(800%) grayscale(100%)' });
                                } else {
                                    $(`[id="map_village_${village.id}"]`).css({ filter: 'none' });
                                }
                            }
                        });
                    }
                }
            }
        }

        // Minimap canvas
        for (let key in mapOverlay.minimap._loadedSectors) {
            const sector = mapOverlay.minimap._loadedSectors[key];
            let el = $('#mapOverlay_topo_canvas_' + key);
            if (!el.length) {
                const canvas = document.createElement('canvas');
                canvas.style.position = 'absolute';
                canvas.width = '250';
                canvas.height = '250';
                canvas.style.zIndex = 11;
                canvas.className = 'mapOverlay_topo_canvas';
                canvas.id = 'mapOverlay_topo_canvas_' + key;

                targetData.forEach(element => {
                    const t = element.coord.split('|');
                    const x = (t[0] - sector.x) * 5 + 3;
                    const y = (t[1] - sector.y) * 5 + 3;
                    if (element.watchtower > 0 && element.checkedWTMini) {
                        this.drawTopoTowers(canvas, sector, x, y, element.watchtower, element.color, element.opacity);
                    }
                });

                sector.appendElement(canvas, 0, 0);
            }
        }
    },

    drawMapTowers(canvas, sector, x, y, wtLevel, color, opacity) {
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 2;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        const wtr = WATCHTOWER_RADIUS[wtLevel - 1];
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.ellipse(x, y, wtr * TWMap.map.scale[0], wtr * TWMap.map.scale[1], 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.strokeStyle = "#000000";
        ctx.moveTo(x - 6, y - 6);
        ctx.lineTo(x + 6, y + 6);
        ctx.moveTo(x + 6, y - 6);
        ctx.lineTo(x - 6, y + 6);
        ctx.stroke();
        ctx.closePath();
        ctx.globalAlpha = 1;
    },

    drawTopoTowers(canvas, sector, x, y, wtLevel, color, opacity) {
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 1;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.arc(x, y, WATCHTOWER_RADIUS[wtLevel - 1] * 5, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.strokeStyle = "#000000";
        ctx.moveTo(x - 2, y - 2);
        ctx.lineTo(x + 2, y + 2);
        ctx.moveTo(x + 2, y - 2);
        ctx.lineTo(x - 2, y + 2);
        ctx.stroke();
        ctx.closePath();
        ctx.globalAlpha = 1;
    },

    drawLeftTriangle(canvas, x, y, color) {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - tileWidthX / 2, y - tileWidthY / 2);
        ctx.lineTo(x + tileWidthX / 2, y - tileWidthY / 2);
        ctx.lineTo(x - tileWidthX / 2, y + tileWidthY / 2);
        ctx.fill();
    },

    drawRightTriangle(canvas, x, y, color) {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + tileWidthX / 2, y - tileWidthY / 2);
        ctx.lineTo(x + tileWidthX / 2, y + tileWidthY / 2);
        ctx.lineTo(x - tileWidthX / 2, y + tileWidthY / 2);
        ctx.fill();
    },

    iconOnMap(img, canvas, x, y, size) {
        canvas.getContext("2d").drawImage(img, x - size / 2, y - size / 2, size, size);
    },

    textOnMap(text, ctx, x, y, color, font) {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.save();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.miterLimit = 1;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        ctx.restore();
    },

    makeOutput(data) {
        $("#overwatch_info").remove();
        const coordinate = data.xy.toString().substring(0, 3) + "|" + data.xy.toString().substring(3, 6);
        const thisData = targetData.filter(coord => coord.coord === coordinate);
        if (thisData.length > 0) {
            const troopsHome = thisData[0].unitsInVillage || {};
            const troopsEnRoute = thisData[0].unitsEnRoute || {};
            const archersEnabled = game_data.units.includes("archer");
            const paladinEnabled = game_data.units.includes("knight");
            const $villageInfoContainer = $(`
                <div id="overwatch_info" style="background-color:#e5d7b2;">
                <h1>Overwatch</h1>
                    <table class='vis' style="width:100%">
                        <tr style="background-color:#c1a264 !important">
                            <th>Overwatch</th>
                            <th><img src="/graphic/unit/unit_spear.webp" title="" alt="" class=""></th>
                            <th><img src="/graphic/unit/unit_sword.webp" title="" alt="" class=""></th>
                            <th><img src="/graphic/unit/unit_axe.webp" title="" alt="" class=""></th>
                            ${!archersEnabled ? '' : '<th><img src="/graphic/unit/unit_archer.webp" title="" alt="" class=""></th>'}
                            <th><img src="/graphic/unit/unit_spy.webp" title="" alt="" class=""></th>
                            <th><img src="/graphic/unit/unit_light.webp" title="" alt="" class=""></th>
                            ${!archersEnabled ? '' : '<th><img src="/graphic/unit/unit_marcher.webp" title="" alt="" class=""></th>'}
                            <th><img src="/graphic/unit/unit_heavy.webp" title="" alt="" class=""></th>
                            <th><img src="/graphic/unit/unit_ram.webp" title="" alt="" class=""></th>
                            <th><img src="/graphic/unit/unit_catapult.webp" title="" alt="" class=""></th>
                            ${!paladinEnabled ? '' : '<th><img src="/graphic/unit/unit_knight.webp" title="" alt="" class=""></th>'}
                            <th><img src="/graphic/unit/unit_snob.webp" title="" alt="" class=""></th>
                        </tr>
                        ${Object.keys(troopsHome).length > 0 ? '<tr><td>At home</td>' + this.makeTroopTds(troopsHome) + '</tr>' : ''}
                        ${Object.keys(troopsEnRoute).length > 0 ? '<tr><td>En route</td>' + this.makeTroopTds(troopsEnRoute) + '</tr>' : ''}
                    </table>
                <div>
            `);
            $villageInfoContainer.appendTo($('#map_popup'));
        } else {
            const $villageInfoContainer = $(`<div id="overwatch_info" style="background-color:#e5d7b2;"><h1>No info on this village</h1><div>`);
            $villageInfoContainer.appendTo($('#map_popup'));
        }
    },

    makeTroopTds(troops) {
        const archersEnabled = game_data.units.includes("archer");
        const paladinEnabled = game_data.units.includes("knight");
        const counts = [];
        counts.push(troops['spear'], troops['sword'], troops['axe']);
        if (archersEnabled) counts.push(troops['archer']);
        counts.push(troops['spy'], troops['light']);
        if (archersEnabled) counts.push(troops['marcher']);
        counts.push(troops['heavy'], troops['ram'], troops['catapult']);
        if (paladinEnabled) counts.push(troops['knight']);
        counts.push(troops['snob']);
        return counts.map(cnt => `<td>${cnt || cnt === 0 ? cnt : ''}</td>`).join(' ');
    }
};

function showNotification(msg) {
    const x = document.getElementById("overwatchNotification");
    if(!x) return;
    x.innerText = msg;
    x.className = "show";
    setTimeout(() => x.className = x.className.replace("show", ""), 3000);
}

function numberWithCommas(x) {
    x = x.toString();
    const pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x)) x = x.replace(pattern, "$1.$2");
    return x;
}

function saveSettingsAndRedraw() {
    SettingsManager.updateFromUI();
    SettingsManager.save();
    recalculate();
    MapRenderer.makeMap();
}

function recalculate() {
    targetData = [];
    playerData.forEach(player => {
        if (player.playerVillages) {
            player.playerVillages.forEach(village => {
                const wt = village.watchtower || 0;
                const wall = village.wall || "---";
                targetData.push({
                    playerName: player.playerName,
                    tribeName: player.tribeName,
                    coord: village.coordinate,
                    incomingAttacks: village.attacksToVillage,
                    incomingSupports: 0,
                    currentStack: village.currentPop,
                    totalStack: village.totalPop,
                    watchtower: wt,
                    wall: wall,
                    checkedWT: player.checkedWT,
                    checkedWTMini: player.checkedWTMini,
                    color: player.color,
                    opacity: player.opacity,
                    unitsInVillage: village.unitsInVillage,
                    unitsEnRoute: village.unitsEnroute,
                });
            });
        }
    });
}

function updateStackSizes() {
    $("#smallStack").val(smallStack);
    $("#mediumStack").val(mediumStack);
    $("#input-left").val(Math.floor(smallStack / bigStack * 100));
    $("#input-right").val(Math.floor(mediumStack / bigStack * 100));
    targetStackSize = bigStack;
    updateSlider();
    SettingsManager.save();
}

function updateSmall(el) {
    smallStack = el.value;
    $("#input-left").val(Math.floor(smallStack / bigStack * 100));
    updateSlider();
    SettingsManager.save();
}

function updateMedium(el) {
    mediumStack = el.value;
    $("#input-right").val(Math.floor(mediumStack / bigStack * 100));
    updateSlider();
    SettingsManager.save();
}

function updateSlider() {
    const range = document.querySelector(".slider > .range");
    const thumbLeft = document.querySelector(".slider > .thumb.left");
    const thumbRight = document.querySelector(".slider > .thumb.right");
    range.style.left = (smallStack / bigStack * 100) + "%";
    thumbRight.style.right = (100 - (mediumStack / bigStack * 100)) + "%";
    thumbLeft.style.left = (smallStack / bigStack * 100) + "%";
    range.style.right = (100 - (mediumStack / bigStack * 100)) + "%";
    $(".track").css('background-image', `linear-gradient(to right, #75FFFF, black ${(minimum / bigStack) * 100}%, black ${$("#input-left").val() - 10}%, red ${$("#input-left").val()}%, red ${$("#input-right").val()}%, yellow ${parseInt($("#input-right").val()) + 10}%, yellow 95%, green)`);
}

function importData() {
    const array = JSON.parse($("#importData").val());
    playerData = playerData.concat(array);
    showNotification("Imported player data!");
    UIManager.createOverview();
}

function exportData() {
    const text = JSON.stringify(playerData);
    navigator.clipboard.writeText(text);
    showNotification("Exported player data to clipboard");
}

// Override map click
TWMap.map._handleClick = function (e) {
    const pos = this.coordByEvent(e);
    const coord = pos.join('|');
    const village = TWMap.villages[pos[0] * 1000 + pos[1]];
    let stacklist = "";
    let stacklistBB = "[table]\n[**]Coordinate[||]Current stack[||]Packets needed[/**]\n";
    if (village && village.id) {
        if (!currentCoords.includes(coord)) {
            $(`[id="map_village_${village.id}"]`).css({ filter: 'brightness(800%) grayscale(100%)' });
            selectedVillages.push(coord);
            currentCoords += coord;
            if (targetData) {
                const filteredArray = selectedVillages.map(e => targetData.filter(o => o.coord === e));
                stacklist = "";
                stacklistBB = "[table]\n[**]Coordinate[||]Playername[||]Tribename[||]Current stack[||]Packets needed[/**]\n";
                filteredArray.forEach(element => {
                    if (element.length > 0) {
                        stacklist += `Coordinate: ${element[0].coord} - Player: ${element[0].playerName} - Tribe: ${element[0].tribeName} - Current Stack: ${numberWithCommas(element[0].totalStack)} - Packets needed: ${Math.round((targetStackSize - element[0].totalStack) / packetSize)}\n`;
                        stacklistBB += `[*][coord]${element[0].coord}[/coord][|]${element[0].playerName}[|]${element[0].tribeName}[|]${numberWithCommas(element[0].totalStack)}[|]${Math.round((targetStackSize - element[0].totalStack) / packetSize)}\n`;
                    } else {
                        selectedVillages.splice(-1, 1);
                        $(`[id="map_village_${village.id}"]`).css({ filter: 'brightness(800%) grayscale(100%)' });
                    }
                });
            }
            stacklistBB += "[/table]";
            $('#villageList').attr('rows', Math.max(selectedVillages.length + 1, 10));
            $('#villageListBB').attr('rows', Math.max(selectedVillages.length + 4, 10));
            $('#villageList').val(stacklist);
            $('#villageListBB').val(stacklistBB);
            $('#countSelectedVillages').text(selectedVillages.length);
        } else {
            selectedVillages = selectedVillages.filter(v => v !== coord);
            const filteredArray = selectedVillages.map(e => targetData.filter(o => o.coord === e));
            stacklist = "";
            stacklistBB = "[table]\n[**]Coordinate[||]Current stack[||]Packets needed[/**]\n";
            filteredArray.forEach(element => {
                if (element.length > 0) {
                    stacklist += `Coordinate: ${element[0].coord} - Current Stack: ${numberWithCommas(element[0].totalStack)} - Packets needed: ${Math.round((targetStackSize - element[0].totalStack) / packetSize)}\n`;
                    stacklistBB += `[*][coord]${element[0].coord}[/coord][|]${numberWithCommas(element[0].totalStack)}[|]${Math.round((targetStackSize - element[0].totalStack) / packetSize)}\n`;
                } else {
                    selectedVillages.splice(-1, 1);
                    $(`[id="map_village_${village.id}"]`).css({ filter: 'brightness(800%) grayscale(100%)' });
                }
            });
            currentCoords = currentCoords.replace(coord, '');
            stacklistBB += "[/table]";
            $(`[id="map_village_${village.id}"]`).css({ filter: 'none' });
            $('#villageList').attr('rows', Math.max(selectedVillages.length + 1, 10));
            $('#villageListBB').attr('rows', Math.max(selectedVillages.length + 4, 10));
            $('#villageList').val(stacklist);
            $('#villageListBB').val(stacklistBB);
            $('#countSelectedVillages').text(selectedVillages.length);
        }
    }
    return false;
};

// Initialization
SettingsManager.load();
(async () => {
    await DataManager.fetchPlayerIDs();
    await DataManager.fetchBuildingIDs();
    await DataManager.fetchAllData();
})();

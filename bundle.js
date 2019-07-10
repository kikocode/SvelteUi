
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = cb => requestAnimationFrame(cb);

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_binding_callback(fn) {
        binding_callbacks.push(fn);
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.callbacks.push(() => {
                outroing.delete(block);
                if (callback) {
                    block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick: tick$$1 = noop, css } = config;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.remaining += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick$$1(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now$$1 => {
                    if (pending_program && now$$1 > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now$$1 >= running_program.end) {
                            tick$$1(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.remaining)
                                        run_all(running_program.group.callbacks);
                                }
                            }
                            running_program = null;
                        }
                        else if (now$$1 >= running_program.start) {
                            const p = now$$1 - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick$$1(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            if (detaching)
                component.$$.fragment.d(1);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    function hexToRGB(hex, alpha) {
    	var regexShorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    	hex = hex.replace(regexShorthand, function (m, r, g, b) {
    		return r + r + g + g + b + b;
    	});
    	var bigint = parseInt(hex.replace('#', ''), 16);
    	var r = (bigint >> 16) & 255;
    	var g = (bigint >> 8) & 255;
    	var b = bigint & 255;

    	if (alpha) {
    		return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    	} else {
    		return "rgb(" + r + ", " + g + ", " + b + ")";
    	}
    }


    function getContrastColor(hex) {
    	let threshold = 130; /* about half of 256. Lower threshold equals more dark text on dark background  */

    	let hRed = hexToR(hex);
    	let hGreen = hexToG(hex);
    	let hBlue = hexToB(hex);

    	function hexToR(h) {
    		return parseInt((cutHex(h)).substring(0, 2), 16)
    	}

    	function hexToG(h) {
    		return parseInt((cutHex(h)).substring(2, 4), 16)
    	}

    	function hexToB(h) {
    		return parseInt((cutHex(h)).substring(4, 6), 16)
    	}

    	function cutHex(h) {
    		return (h.charAt(0) == "#") ? h.substring(1, 7) : h
    	}

    	let cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;
    	if (cBrightness > threshold) {
    		return "#000000";
    	} else {
    		return "#ffffff";
    	}
    }
    /**
     *
     * @param {string} color - HEX
     * @param {number} amount - percentage
     */
    const darken = (color, amount) => {
    	color = (color.indexOf("#") >= 0) ? color.substring(1, color.length) : color;
    	amount = parseInt((255 * amount) / 100);
    	return color = `#${subtractLight(color.substring(0,2), amount)}${subtractLight(color.substring(2,4), amount)}${subtractLight(color.substring(4,6), amount)}`;
    };


    /**
     * @private
     * @param {string} color - RGB
     * @param {number} amount - percentage
     */
    const subtractLight = function (color, amount) {
    	let cc = parseInt(color, 16) - amount;
    	let c = (cc < 0) ? 0 : (cc);
    	c = (c.toString(16).length > 1) ? c.toString(16) : `0${c.toString(16)}`;
    	return c;
    };


    const colors = [
    	'#F44336',
    	'#FFEBEE',
    	'#FFCDD2',
    	'#EF9A9A',
    	'#E57373',
    	'#EF5350',
    	'#F44336',
    	'#E53935',
    	'#D32F2F',
    	'#C62828',
    	'#B71C1C',
    	'#FF8A80',
    	'#FF5252',
    	'#FF1744',
    	'#D50000',
    	'#E91E63',
    	'#FCE4EC',
    	'#F8BBD0',
    	'#F48FB1',
    	'#F06292',
    	'#EC407A',
    	'#E91E63',
    	'#D81B60',
    	'#C2185B',
    	'#AD1457',
    	'#880E4F',
    	'#FF80AB',
    	'#FF4081',
    	'#F50057',
    	'#C51162',
    	'#9C27B0',
    	'#F3E5F5',
    	'#E1BEE7',
    	'#CE93D8',
    	'#BA68C8',
    	'#AB47BC',
    	'#9C27B0',
    	'#8E24AA',
    	'#7B1FA2',
    	'#6A1B9A',
    	'#4A148C',
    	'#EA80FC',
    	'#E040FB',
    	'#D500F9',
    	'#AA00FF',
    	'#673AB7',
    	'#EDE7F6',
    	'#D1C4E9',
    	'#B39DDB',
    	'#9575CD',
    	'#7E57C2',
    	'#673AB7',
    	'#5E35B1',
    	'#512DA8',
    	'#4527A0',
    	'#311B92',
    	'#B388FF',
    	'#7C4DFF',
    	'#651FFF',
    	'#6200EA',
    	'#3F51B5',
    	'#E8EAF6',
    	'#C5CAE9',
    	'#9FA8DA',
    	'#7986CB',
    	'#5C6BC0',
    	'#3F51B5',
    	'#3949AB',
    	'#303F9F',
    	'#283593',
    	'#1A237E',
    	'#8C9EFF',
    	'#536DFE',
    	'#3D5AFE',
    	'#304FFE',
    	'#2196F3',
    	'#E3F2FD',
    	'#BBDEFB',
    	'#90CAF9',
    	'#64B5F6',
    	'#42A5F5',
    	'#2196F3',
    	'#1E88E5',
    	'#1976D2',
    	'#1565C0',
    	'#0D47A1',
    	'#82B1FF',
    	'#448AFF',
    	'#2979FF',
    	'#2962FF',
    	'#03A9F4',
    	'#E1F5FE',
    	'#B3E5FC',
    	'#81D4FA',
    	'#4FC3F7',
    	'#29B6F6',
    	'#03A9F4',
    	'#039BE5',
    	'#0288D1',
    	'#0277BD',
    	'#01579B',
    	'#80D8FF',
    	'#40C4FF',
    	'#00B0FF',
    	'#0091EA',
    	'#00BCD4',
    	'#E0F7FA',
    	'#B2EBF2',
    	'#80DEEA',
    	'#4DD0E1',
    	'#26C6DA',
    	'#00BCD4',
    	'#00ACC1',
    	'#0097A7',
    	'#00838F',
    	'#006064',
    	'#84FFFF',
    	'#18FFFF',
    	'#00E5FF',
    	'#00B8D4',
    	'#009688',
    	'#E0F2F1',
    	'#B2DFDB',
    	'#80CBC4',
    	'#4DB6AC',
    	'#26A69A',
    	'#009688',
    	'#00897B',
    	'#00796B',
    	'#00695C',
    	'#004D40',
    	'#A7FFEB',
    	'#64FFDA',
    	'#1DE9B6',
    	'#00BFA5',
    	'#4CAF50',
    	'#E8F5E9',
    	'#C8E6C9',
    	'#A5D6A7',
    	'#81C784',
    	'#66BB6A',
    	'#4CAF50',
    	'#43A047',
    	'#388E3C',
    	'#2E7D32',
    	'#1B5E20',
    	'#B9F6CA',
    	'#69F0AE',
    	'#00E676',
    	'#00C853',
    	'#8BC34A',
    	'#F1F8E9',
    	'#DCEDC8',
    	'#C5E1A5',
    	'#AED581',
    	'#9CCC65',
    	'#8BC34A',
    	'#7CB342',
    	'#689F38',
    	'#558B2F',
    	'#33691E',
    	'#CCFF90',
    	'#B2FF59',
    	'#76FF03',
    	'#64DD17',
    	'#CDDC39',
    	'#F9FBE7',
    	'#F0F4C3',
    	'#E6EE9C',
    	'#DCE775',
    	'#D4E157',
    	'#CDDC39',
    	'#C0CA33',
    	'#AFB42B',
    	'#9E9D24',
    	'#827717',
    	'#F4FF81',
    	'#EEFF41',
    	'#C6FF00',
    	'#AEEA00',
    	'#FFEB3B',
    	'#FFFDE7',
    	'#FFF9C4',
    	'#FFF59D',
    	'#FFF176',
    	'#FFEE58',
    	'#FFEB3B',
    	'#FDD835',
    	'#FBC02D',
    	'#F9A825',
    	'#F57F17',
    	'#FFFF8D',
    	'#FFFF00',
    	'#FFEA00',
    	'#FFD600',
    	'#FFC107',
    	'#FFF8E1',
    	'#FFECB3',
    	'#FFE082',
    	'#FFD54F',
    	'#FFCA28',
    	'#FFC107',
    	'#FFB300',
    	'#FFA000',
    	'#FF8F00',
    	'#FF6F00',
    	'#FFE57F',
    	'#FFD740',
    	'#FFC400',
    	'#FFAB00',
    	'#FF9800',
    	'#FFF3E0',
    	'#FFE0B2',
    	'#FFCC80',
    	'#FFB74D',
    	'#FFA726',
    	'#FF9800',
    	'#FB8C00',
    	'#F57C00',
    	'#EF6C00',
    	'#E65100',
    	'#FFD180',
    	'#FFAB40',
    	'#FF9100',
    	'#FF6D00',
    	'#FF5722',
    	'#FBE9E7',
    	'#FFCCBC',
    	'#FFAB91',
    	'#FF8A65',
    	'#FF7043',
    	'#FF5722',
    	'#F4511E',
    	'#E64A19',
    	'#D84315',
    	'#BF360C',
    	'#FF9E80',
    	'#FF6E40',
    	'#FF3D00',
    	'#DD2C00',
    	'#795548',
    	'#EFEBE9',
    	'#D7CCC8',
    	'#BCAAA4',
    	'#A1887F',
    	'#8D6E63',
    	'#795548',
    	'#6D4C41',
    	'#5D4037',
    	'#4E342E',
    	'#3E2723',
    	'#9E9E9E',
    	'#FAFAFA',
    	'#F5F5F5',
    	'#EEEEEE',
    	'#E0E0E0',
    	'#BDBDBD',
    	'#9E9E9E',
    	'#757575',
    	'#616161',
    	'#424242',
    	'#212121',
    	'#607D8B',
    	'#ECEFF1',
    	'#CFD8DC',
    	'#B0BEC5',
    	'#90A4AE',
    	'#78909C',
    	'#607D8B',
    	'#546E7A',
    	'#455A64',
    	'#37474F',
    	'#263238',
    	'#000000',
    	'#FFFFFF',
    ];

    /* src\components\Button\Button.svelte generated by Svelte v3.5.4 */

    const file = "src\\components\\Button\\Button.svelte";

    function create_fragment(ctx) {
    	var button, button_class_value, use_action, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			button = element("button");

    			if (default_slot) default_slot.c();

    			attr(button, "class", button_class_value = "" + ('button ' + ctx.buttonClasses) + " svelte-3a60ic");
    			attr(button, "style", ctx.buttonStyles);
    			add_location(button, file, 125, 0, 3469);
    			dispose = listen(button, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(button_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			use_action = ctx.use.call(null, button) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if ((!current || changed.buttonClasses) && button_class_value !== (button_class_value = "" + ('button ' + ctx.buttonClasses) + " svelte-3a60ic")) {
    				attr(button, "class", button_class_value);
    			}

    			if (!current || changed.buttonStyles) {
    				attr(button, "style", ctx.buttonStyles);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (use_action && typeof use_action.destroy === 'function') use_action.destroy();
    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { use = () => {} } = $$props;
    	let { color = '#1976d2', style = '', disabled = false, raised = false, outlined = false, simple = false, size = 'medium' } = $$props;

    	let sizes = {
    		small: {
    			class: 'button--small'
    		},
    		medium: {
    			class: 'button--medium'
    		},
    		large: {
    			class: 'button--large'
    		}
    	};

    	const writable_props = ['use', 'color', 'style', 'disabled', 'raised', 'outlined', 'simple', 'size'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ('use' in $$props) $$invalidate('use', use = $$props.use);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('style' in $$props) $$invalidate('style', style = $$props.style);
    		if ('disabled' in $$props) $$invalidate('disabled', disabled = $$props.disabled);
    		if ('raised' in $$props) $$invalidate('raised', raised = $$props.raised);
    		if ('outlined' in $$props) $$invalidate('outlined', outlined = $$props.outlined);
    		if ('simple' in $$props) $$invalidate('simple', simple = $$props.simple);
    		if ('size' in $$props) $$invalidate('size', size = $$props.size);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	let disabledClass, raisedClass, outlinedClass, simpleClass, sizeClass, buttonClasses, textColor, buttonStyles;

    	$$self.$$.update = ($$dirty = { disabled: 1, raised: 1, outlined: 1, simple: 1, sizes: 1, size: 1, disabledClass: 1, raisedClass: 1, outlinedClass: 1, simpleClass: 1, sizeClass: 1, color: 1, textColor: 1, style: 1 }) => {
    		if ($$dirty.disabled) { $$invalidate('disabledClass', disabledClass = disabled ? 'button--disabled' : ''); }
    		if ($$dirty.raised) { $$invalidate('raisedClass', raisedClass = raised ? 'button--raised' : ''); }
    		if ($$dirty.outlined) { $$invalidate('outlinedClass', outlinedClass = outlined ? 'button--outlined' : ''); }
    		if ($$dirty.simple) { $$invalidate('simpleClass', simpleClass = simple ? 'button--simple' : ''); }
    		if ($$dirty.sizes || $$dirty.size) { $$invalidate('sizeClass', sizeClass = sizes[size] ? sizes[size].class : size); }
    		if ($$dirty.disabledClass || $$dirty.raisedClass || $$dirty.outlinedClass || $$dirty.simpleClass || $$dirty.sizeClass) { $$invalidate('buttonClasses', buttonClasses = `${disabledClass} ${raisedClass} ${outlinedClass} ${simpleClass} ${sizeClass}`); }
    		if ($$dirty.color) { $$invalidate('textColor', textColor = getContrastColor(color)); }
    		if ($$dirty.textColor) { if (textColor == '#000000') {
        		$$invalidate('textColor', textColor = hexToRGB(textColor, 0.85));
        	} else {
        		$$invalidate('textColor', textColor = hexToRGB(textColor, 1));
        	} }
    		if ($$dirty.style || $$dirty.color || $$dirty.textColor) { $$invalidate('buttonStyles', buttonStyles = `
    ${style};
    --primary-color:  ${color};
    --primary-color-dark:  ${darken(color, 15)};
    --primary-color-medium:  ${hexToRGB(color, 0.8)};
    --primary-color-light:  ${hexToRGB(color, 0.4)};
    --primary-color-soft:  ${hexToRGB(color, 0.08)};
    --text-color:  ${textColor};
  `); }
    	};

    	return {
    		use,
    		color,
    		style,
    		disabled,
    		raised,
    		outlined,
    		simple,
    		size,
    		buttonClasses,
    		buttonStyles,
    		click_handler,
    		$$slots,
    		$$scope
    	};
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["use", "color", "style", "disabled", "raised", "outlined", "simple", "size"]);
    	}

    	get use() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get raised() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set raised(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get simple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set simple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Textfield\Textfield.svelte generated by Svelte v3.5.4 */

    const file$1 = "src\\components\\Textfield\\Textfield.svelte";

    // (400:4) {#if prepend}
    function create_if_block_3(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", "" + 'textfield__prepend' + " svelte-1p0ma8x");
    			add_location(div, file$1, 400, 6, 11107);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			div.innerHTML = ctx.prepend;
    			add_binding_callback(() => ctx.div_binding(div, null));
    		},

    		p: function update(changed, ctx) {
    			if (changed.prepend) {
    				div.innerHTML = ctx.prepend;
    			}

    			if (changed.items) {
    				ctx.div_binding(null, div);
    				ctx.div_binding(div, null);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			ctx.div_binding(null, div);
    		}
    	};
    }

    // (423:4) {:else}
    function create_else_block(ctx) {
    	var input, dispose;

    	return {
    		c: function create() {
    			input = element("input");
    			attr(input, "class", "textfield__input svelte-1p0ma8x");
    			attr(input, "type", ctx.type);
    			input.value = ctx.name;
    			add_location(input, file$1, 423, 6, 11871);

    			dispose = [
    				listen(input, "change", ctx.handleChange),
    				listen(input, "keydown", ctx.handleChange),
    				listen(input, "keyup", ctx.handleChange),
    				listen(input, "focus", ctx.handleFocus),
    				listen(input, "blur", ctx.handleBlur)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, input, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.type) {
    				attr(input, "type", ctx.type);
    			}

    			if (changed.name) {
    				input.value = ctx.name;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(input);
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (413:4) {#if multiline}
    function create_if_block_2(ctx) {
    	var textarea, dispose;

    	return {
    		c: function create() {
    			textarea = element("textarea");
    			attr(textarea, "class", "textfield__input svelte-1p0ma8x");
    			attr(textarea, "type", ctx.type);
    			textarea.value = ctx.name;
    			add_location(textarea, file$1, 413, 6, 11602);

    			dispose = [
    				listen(textarea, "change", ctx.handleChange),
    				listen(textarea, "keyup", ctx.handleChange),
    				listen(textarea, "keydown", ctx.handleChange),
    				listen(textarea, "focus", ctx.handleFocus),
    				listen(textarea, "blur", ctx.handleBlur)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, textarea, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.type) {
    				attr(textarea, "type", ctx.type);
    			}

    			if (changed.name) {
    				textarea.value = ctx.name;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(textarea);
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (434:4) {#if append}
    function create_if_block_1(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", "" + 'textfield__append' + " svelte-1p0ma8x");
    			add_location(div, file$1, 434, 6, 12153);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			div.innerHTML = ctx.append;
    			add_binding_callback(() => ctx.div_binding_1(div, null));
    		},

    		p: function update(changed, ctx) {
    			if (changed.append) {
    				div.innerHTML = ctx.append;
    			}

    			if (changed.items) {
    				ctx.div_binding_1(null, div);
    				ctx.div_binding_1(div, null);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			ctx.div_binding_1(null, div);
    		}
    	};
    }

    // (440:2) {#if helperText}
    function create_if_block(ctx) {
    	var div, t;

    	return {
    		c: function create() {
    			div = element("div");
    			t = text(ctx.helperText);
    			attr(div, "class", "textfield__helper__text svelte-1p0ma8x");
    			add_location(div, file$1, 440, 4, 12293);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.helperText) {
    				set_data(t, ctx.helperText);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var div6, div5, t0, div4, div0, t1, div2, div1, t2, t3, div3, t4, t5, t6, div6_class_value;

    	var if_block0 = (ctx.prepend) && create_if_block_3(ctx);

    	function select_block_type(ctx) {
    		if (ctx.multiline) return create_if_block_2;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block1 = current_block_type(ctx);

    	var if_block2 = (ctx.append) && create_if_block_1(ctx);

    	var if_block3 = (ctx.helperText) && create_if_block(ctx);

    	return {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div4 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t2 = text(ctx.label);
    			t3 = space();
    			div3 = element("div");
    			t4 = space();
    			if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			if (if_block3) if_block3.c();
    			attr(div0, "class", "textfield__border__start textfield__border__segment svelte-1p0ma8x");
    			add_location(div0, file$1, 406, 6, 11261);
    			attr(div1, "class", "textfield__label svelte-1p0ma8x");
    			add_location(div1, file$1, 408, 8, 11409);
    			attr(div2, "class", "textfield__border__gap textfield__border__segment svelte-1p0ma8x");
    			add_location(div2, file$1, 407, 6, 11336);
    			attr(div3, "class", "textfield__border__end textfield__border__segment svelte-1p0ma8x");
    			add_location(div3, file$1, 410, 6, 11496);
    			attr(div4, "class", "textfield__border svelte-1p0ma8x");
    			add_location(div4, file$1, 405, 4, 11222);
    			attr(div5, "class", "textfield__element svelte-1p0ma8x");
    			add_location(div5, file$1, 398, 2, 11048);
    			attr(div6, "class", div6_class_value = "" + ('textfield ' + ctx.textfieldClasses) + " svelte-1p0ma8x");
    			attr(div6, "style", ctx.textfieldStyle);
    			add_location(div6, file$1, 397, 0, 10976);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div6, anchor);
    			append(div6, div5);
    			if (if_block0) if_block0.m(div5, null);
    			append(div5, t0);
    			append(div5, div4);
    			append(div4, div0);
    			append(div4, t1);
    			append(div4, div2);
    			append(div2, div1);
    			append(div1, t2);
    			add_binding_callback(() => ctx.div1_binding(div1, null));
    			append(div4, t3);
    			append(div4, div3);
    			append(div5, t4);
    			if_block1.m(div5, null);
    			append(div5, t5);
    			if (if_block2) if_block2.m(div5, null);
    			append(div6, t6);
    			if (if_block3) if_block3.m(div6, null);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.prepend) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(div5, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (changed.label) {
    				set_data(t2, ctx.label);
    			}

    			if (changed.items) {
    				ctx.div1_binding(null, div1);
    				ctx.div1_binding(div1, null);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(changed, ctx);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);
    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div5, t5);
    				}
    			}

    			if (ctx.append) {
    				if (if_block2) {
    					if_block2.p(changed, ctx);
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(div5, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (ctx.helperText) {
    				if (if_block3) {
    					if_block3.p(changed, ctx);
    				} else {
    					if_block3 = create_if_block(ctx);
    					if_block3.c();
    					if_block3.m(div6, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if ((changed.textfieldClasses) && div6_class_value !== (div6_class_value = "" + ('textfield ' + ctx.textfieldClasses) + " svelte-1p0ma8x")) {
    				attr(div6, "class", div6_class_value);
    			}

    			if (changed.textfieldStyle) {
    				attr(div6, "style", ctx.textfieldStyle);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div6);
    			}

    			if (if_block0) if_block0.d();
    			ctx.div1_binding(null, div1);
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    		}
    	};
    }

    let LABEL_SCALE = 0.75;

    let labelGap = 3;

    function instance$1($$self, $$props, $$invalidate) {
    	

      const dispatch = createEventDispatcher();

      let { name = "", label = "", variant = "outlined", compact = false, error = false, disabled = false, multiline = false, color = "#ffbb77", helperText = "", type = "text", append = "", prepend = "", style = "", class: className = "" } = $$props;

      let focused = false;
      let labelRef;
      let labelWidth;
      let labelHeight;
      let labelX;
      let labelY;
      let prependRef;
      let prependWidth;
      let appendRef;
      let appendWidth;
      let height;
      let paddingLeft = 10;

      const computeVariantProps = variant => {
        if (variant == "outlined") {
          $$invalidate('height', height = 55);
          if (compact) $$invalidate('height', height = 39);
        } else if (variant == "filled") {
          $$invalidate('height', height = 55);
          if (compact) $$invalidate('height', height = 45);
        } else if ((variant = "simple")) {
          $$invalidate('height', height = 36);
          if (compact) $$invalidate('height', height = 30);
        } else {
          $$invalidate('height', height = 55);
        }
      };

      onMount(() => {
        $$invalidate('appendWidth', appendWidth = appendRef ? appendRef.offsetWidth : 0);
        $$invalidate('prependWidth', prependWidth = prependRef ? prependRef.offsetWidth : 0);

        $$invalidate('labelWidth', labelWidth = labelRef.offsetWidth * LABEL_SCALE + labelGap);
        labelHeight = labelRef.offsetHeight;
        $$invalidate('labelY', labelY = Math.round(height / 2 - labelHeight / 2));
        $$invalidate('labelX', labelX = prependWidth);
        if (variant == "simple") {
          $$invalidate('labelX', labelX = 0);
          $$invalidate('paddingLeft', paddingLeft = 0);
        }
      });

      const handleChange = e => {
        $$invalidate('name', name = e.target.value);
        dispatch("change", e);
      };
      const handleFocus = e => {
        $$invalidate('focused', focused = true);
      };
      const handleBlur = e => {
        $$invalidate('focused', focused = false);
      };

      const hexToRGB = (hex, alpha) => {
        var r = parseInt(hex.slice(1, 3), 16),
          g = parseInt(hex.slice(3, 5), 16),
          b = parseInt(hex.slice(5, 7), 16);
        if (alpha) {
          return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        } else {
          return "rgb(" + r + ", " + g + ", " + b + ")";
        }
      };

    	const writable_props = ['name', 'label', 'variant', 'compact', 'error', 'disabled', 'multiline', 'color', 'helperText', 'type', 'append', 'prepend', 'style', 'class'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Textfield> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$node, check) {
    		prependRef = $$node;
    		$$invalidate('prependRef', prependRef);
    	}

    	function div1_binding($$node, check) {
    		labelRef = $$node;
    		$$invalidate('labelRef', labelRef);
    	}

    	function div_binding_1($$node, check) {
    		appendRef = $$node;
    		$$invalidate('appendRef', appendRef);
    	}

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('label' in $$props) $$invalidate('label', label = $$props.label);
    		if ('variant' in $$props) $$invalidate('variant', variant = $$props.variant);
    		if ('compact' in $$props) $$invalidate('compact', compact = $$props.compact);
    		if ('error' in $$props) $$invalidate('error', error = $$props.error);
    		if ('disabled' in $$props) $$invalidate('disabled', disabled = $$props.disabled);
    		if ('multiline' in $$props) $$invalidate('multiline', multiline = $$props.multiline);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('helperText' in $$props) $$invalidate('helperText', helperText = $$props.helperText);
    		if ('type' in $$props) $$invalidate('type', type = $$props.type);
    		if ('append' in $$props) $$invalidate('append', append = $$props.append);
    		if ('prepend' in $$props) $$invalidate('prepend', prepend = $$props.prepend);
    		if ('style' in $$props) $$invalidate('style', style = $$props.style);
    		if ('class' in $$props) $$invalidate('className', className = $$props.class);
    	};

    	let focusedClass, activeClass, compactClass, errorClass, disabledClass, multilineClass, prependClass, appendClass, variantClass, textfieldClasses, textfieldStyle;

    	$$self.$$.update = ($$dirty = { focused: 1, disabled: 1, name: 1, compact: 1, error: 1, multiline: 1, append: 1, variant: 1, className: 1, focusedClass: 1, activeClass: 1, compactClass: 1, errorClass: 1, disabledClass: 1, multilineClass: 1, variantClass: 1, prependClass: 1, appendClass: 1, style: 1, color: 1, height: 1, paddingLeft: 1, prependWidth: 1, appendWidth: 1, LABEL_SCALE: 1, labelWidth: 1, labelX: 1, labelY: 1 }) => {
    		if ($$dirty.focused || $$dirty.disabled) { $$invalidate('focusedClass', focusedClass = focused && !disabled ? "textfield--focused" : ""); }
    		if ($$dirty.name || $$dirty.focused) { $$invalidate('activeClass', activeClass = name != "" || focused ? "textfield--active" : ""); }
    		if ($$dirty.compact) { $$invalidate('compactClass', compactClass = compact ? "textfield--compact" : ""); }
    		if ($$dirty.error) { $$invalidate('errorClass', errorClass = error ? "textfield--error" : ""); }
    		if ($$dirty.disabled) { $$invalidate('disabledClass', disabledClass = disabled ? "textfield--disabled" : ""); }
    		if ($$dirty.multiline) { $$invalidate('multilineClass', multilineClass = multiline ? "textfield--multiline" : ""); }
    		if ($$dirty.append) { $$invalidate('prependClass', prependClass = append ? "textfield--has--prepend" : ""); }
    		if ($$dirty.append) { $$invalidate('appendClass', appendClass = append ? "textfield--has--append" : ""); }
    		if ($$dirty.variant) { $$invalidate('variantClass', variantClass = variant ? "textfield--" + variant : ""); }
    		if ($$dirty.className || $$dirty.focusedClass || $$dirty.activeClass || $$dirty.compactClass || $$dirty.errorClass || $$dirty.disabledClass || $$dirty.multilineClass || $$dirty.variantClass || $$dirty.prependClass || $$dirty.appendClass) { $$invalidate('textfieldClasses', textfieldClasses = ` ${className} ${focusedClass} ${activeClass} ${compactClass} ${errorClass} ${disabledClass} ${multilineClass} ${variantClass} ${prependClass} ${appendClass}`); }
    		if ($$dirty.variant) { computeVariantProps(variant); }
    		if ($$dirty.style || $$dirty.color || $$dirty.height || $$dirty.paddingLeft || $$dirty.prependWidth || $$dirty.appendWidth || $$dirty.LABEL_SCALE || $$dirty.labelWidth || $$dirty.labelX || $$dirty.labelY) { $$invalidate('textfieldStyle', textfieldStyle = `
    ${style};
    --primary-color:  ${hexToRGB(color)};
    --primary-color-light:  ${hexToRGB(color, 0.85)};

    --height: ${height}px;
    --padding-left: ${paddingLeft}px;

    --prepend-width: ${prependWidth}px;
    --append-width: ${appendWidth}px;

    --label-scale: ${LABEL_SCALE};
    --label-width: ${labelWidth}px;
    --label-x: ${labelX}px;
    --label-y: ${labelY}px;
    --transform-label: translate(${labelX}px, ${labelY}px) scale(1);
    --transform-label-filled: translateX(${labelX}px) translateY(${labelY -
        7}px) scale(${LABEL_SCALE});
  `); }
    	};

    	return {
    		name,
    		label,
    		variant,
    		compact,
    		error,
    		disabled,
    		multiline,
    		color,
    		helperText,
    		type,
    		append,
    		prepend,
    		style,
    		className,
    		labelRef,
    		prependRef,
    		appendRef,
    		handleChange,
    		handleFocus,
    		handleBlur,
    		textfieldClasses,
    		textfieldStyle,
    		div_binding,
    		div1_binding,
    		div_binding_1
    	};
    }

    class Textfield extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["name", "label", "variant", "compact", "error", "disabled", "multiline", "color", "helperText", "type", "append", "prepend", "style", "class"]);
    	}

    	get name() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get compact() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set compact(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiline() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiline(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get helperText() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set helperText(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get append() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set append(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prepend() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prepend(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Toggle\ToggleGroup.svelte generated by Svelte v3.5.4 */

    const file$2 = "src\\components\\Toggle\\ToggleGroup.svelte";

    const get_default_slot_changes = ({ actives }) => ({ actives: actives });
    const get_default_slot_context = ({ actives }) => ({ actives: actives });

    function create_fragment$2(ctx) {
    	var div, current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, get_default_slot_context);

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			attr(div, "class", "togglegroup svelte-rk1mfg");
    			add_location(div, file$2, 37, 0, 736);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && (changed.$$scope || changed.actives)) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, get_default_slot_changes), get_slot_context(default_slot_1, ctx, get_default_slot_context));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    let TOGGLE_GROUP_KEY = {};

    function instance$2($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

    	let { multiple = false } = $$props;

    	let actives = [];

    	let handleClick = id => {
    		if (multiple) {
    			if (actives.includes(id)) $$invalidate('actives', actives = actives.filter(el => el != id));
    			else actives.push(id);
    		} else {
    			if (actives.includes(id)) $$invalidate('actives', actives = []);
    			else $$invalidate('actives', actives = [id]);
    		}

    		console.log('k', id, actives, multiple);
    		dispatch('change', {
    			id: id,
    			actives: actives
    		});
    	};

    	setContext(TOGGLE_GROUP_KEY, {
    		onclick: handleClick
    	});

    	const writable_props = ['multiple'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ToggleGroup> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('multiple' in $$props) $$invalidate('multiple', multiple = $$props.multiple);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { multiple, actives, $$slots, $$scope };
    }

    class ToggleGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["multiple"]);
    	}

    	get multiple() {
    		throw new Error("<ToggleGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<ToggleGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Toggle\ToggleGroupElement.svelte generated by Svelte v3.5.4 */

    const file$3 = "src\\components\\Toggle\\ToggleGroupElement.svelte";

    function create_fragment$3(ctx) {
    	var div, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			add_location(div, file$3, 19, 0, 458);
    			dispose = listen(div, "click", ctx.handleClick);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const { onclick } = getContext(TOGGLE_GROUP_KEY);

    	let { id, active = '' } = $$props;

    	const handleClick = e => {
    		onclick(id);
    	};

    	const writable_props = ['id', 'active'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ToggleGroupElement> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    		if ('active' in $$props) $$invalidate('active', active = $$props.active);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { active: 1, id: 1 }) => {
    		if ($$dirty.active || $$dirty.id) ;
    	};

    	return {
    		id,
    		active,
    		handleClick,
    		$$slots,
    		$$scope
    	};
    }

    class ToggleGroupElement extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["id", "active"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.id === undefined && !('id' in props)) {
    			console.warn("<ToggleGroupElement> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<ToggleGroupElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ToggleGroupElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<ToggleGroupElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ToggleGroupElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Toggle\Toggle.svelte generated by Svelte v3.5.4 */

    const file$4 = "src\\components\\Toggle\\Toggle.svelte";

    function create_fragment$4(ctx) {
    	var div2, div1, div0, div2_class_value, dispose;

    	return {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			attr(div0, "class", "toggle-grabber svelte-9y5ays");
    			add_location(div0, file$4, 77, 2, 1803);
    			attr(div1, "class", "toggle-bg svelte-9y5ays");
    			add_location(div1, file$4, 76, 1, 1776);
    			attr(div2, "class", div2_class_value = "" + (`toggle ${ctx.toggleClasses}`) + " svelte-9y5ays");
    			attr(div2, "style", ctx.toggleStyle);
    			add_location(div2, file$4, 71, 0, 1683);
    			dispose = listen(div2, "click", ctx.handleClick);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div1);
    			append(div1, div0);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.toggleClasses) && div2_class_value !== (div2_class_value = "" + (`toggle ${ctx.toggleClasses}`) + " svelte-9y5ays")) {
    				attr(div2, "class", div2_class_value);
    			}

    			if (changed.toggleStyle) {
    				attr(div2, "style", ctx.toggleStyle);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			dispose();
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { toggle = false, color = '#333333', disabled = false } = $$props;

    	const handleClick = () => {
    		if (disabled) return;
    		$$invalidate('toggle', toggle = !toggle);
    	};

    	const writable_props = ['toggle', 'color', 'disabled'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Toggle> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('toggle' in $$props) $$invalidate('toggle', toggle = $$props.toggle);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('disabled' in $$props) $$invalidate('disabled', disabled = $$props.disabled);
    	};

    	let toggleClass, disabledClass, toggleClasses, toggleStyle;

    	$$self.$$.update = ($$dirty = { toggle: 1, disabled: 1, toggleClass: 1, disabledClass: 1, color: 1 }) => {
    		if ($$dirty.toggle) { $$invalidate('toggleClass', toggleClass = toggle ? 'toggle--on' : ''); }
    		if ($$dirty.disabled) { $$invalidate('disabledClass', disabledClass = disabled ? 'toggle--disabled' : ''); }
    		if ($$dirty.toggleClass || $$dirty.disabledClass) { $$invalidate('toggleClasses', toggleClasses = `${toggleClass} ${disabledClass}`); }
    		if ($$dirty.color) { $$invalidate('toggleStyle', toggleStyle = `
    --color-primary: ${color};
  `); }
    	};

    	return {
    		toggle,
    		color,
    		disabled,
    		handleClick,
    		toggleClasses,
    		toggleStyle
    	};
    }

    class Toggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["toggle", "color", "disabled"]);
    	}

    	get toggle() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Toggle\ToggleButton.svelte generated by Svelte v3.5.4 */

    const file$5 = "src\\components\\Toggle\\ToggleButton.svelte";

    function create_fragment$5(ctx) {
    	var div, current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			attr(div, "style", ctx.togglebuttonStyle);
    			attr(div, "class", "" + ctx.togglebuttonClasses + " svelte-1f3yivp");
    			add_location(div, file$5, 61, 0, 1563);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if (!current || changed.togglebuttonStyle) {
    				attr(div, "style", ctx.togglebuttonStyle);
    			}

    			if (!current || changed.togglebuttonClasses) {
    				attr(div, "class", "" + ctx.togglebuttonClasses + " svelte-1f3yivp");
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { style = '', color = '#000000', isOn = false } = $$props;

    	let togglebuttonStyle = '';

    	const writable_props = ['style', 'color', 'isOn'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ToggleButton> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('style' in $$props) $$invalidate('style', style = $$props.style);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('isOn' in $$props) $$invalidate('isOn', isOn = $$props.isOn);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	let isOnClass, togglebuttonClasses;

    	$$self.$$.update = ($$dirty = { isOn: 1, isOnClass: 1, style: 1, color: 1 }) => {
    		if ($$dirty.isOn) { $$invalidate('isOnClass', isOnClass = isOn ? 'togglebutton--is-on' : ''); }
    		if ($$dirty.isOnClass) { $$invalidate('togglebuttonClasses', togglebuttonClasses = `
    togglebutton
    ${isOnClass}
  `); }
    		if ($$dirty.style || $$dirty.color) { $$invalidate('togglebuttonStyle', togglebuttonStyle = `
    ${style};
    --primary-color:  ${color};
    --primary-color-medium:  ${hexToRGB(color, 0.4)};
    --primary-color-light:  ${hexToRGB(color, 0.25)};
    --primary-color-soft:  ${hexToRGB(color, 0.12)};
    --text-color:  ${darken(color, 20)};
  `); }
    	};

    	return {
    		style,
    		color,
    		isOn,
    		togglebuttonStyle,
    		togglebuttonClasses,
    		$$slots,
    		$$scope
    	};
    }

    class ToggleButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["style", "color", "isOn"]);
    	}

    	get style() {
    		throw new Error("<ToggleButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ToggleButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<ToggleButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ToggleButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOn() {
    		throw new Error("<ToggleButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOn(value) {
    		throw new Error("<ToggleButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Toggle\Switch.svelte generated by Svelte v3.5.4 */

    const file$6 = "src\\components\\Toggle\\Switch.svelte";

    function create_fragment$6(ctx) {
    	var button, div1, div0, button_class_value, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			div1 = element("div");
    			div0 = element("div");
    			attr(div0, "class", "switch-grabber svelte-1qtj3cv");
    			add_location(div0, file$6, 75, 2, 1517);
    			attr(div1, "class", "switch-bg svelte-1qtj3cv");
    			add_location(div1, file$6, 74, 1, 1490);
    			attr(button, "class", button_class_value = "" + ('switch ' + ctx.switchClasses) + " svelte-1qtj3cv");
    			attr(button, "style", ctx.switchStyle);
    			add_location(button, file$6, 69, 0, 1394);
    			dispose = listen(button, "click", ctx.handleClick);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			append(button, div1);
    			append(div1, div0);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.switchClasses) && button_class_value !== (button_class_value = "" + ('switch ' + ctx.switchClasses) + " svelte-1qtj3cv")) {
    				attr(button, "class", button_class_value);
    			}

    			if (changed.switchStyle) {
    				attr(button, "style", ctx.switchStyle);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { isOn = false, color = '#333333' } = $$props;

    	const handleClick = () => {
    		$$invalidate('isOn', isOn = !isOn);
    	};

    	const writable_props = ['isOn', 'color'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('isOn' in $$props) $$invalidate('isOn', isOn = $$props.isOn);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    	};

    	let switchClass, switchClasses, switchStyle;

    	$$self.$$.update = ($$dirty = { isOn: 1, switchClass: 1, color: 1 }) => {
    		if ($$dirty.isOn) { $$invalidate('switchClass', switchClass = isOn ? 'switch--on' : ''); }
    		if ($$dirty.switchClass) { $$invalidate('switchClasses', switchClasses = `${switchClass}`); }
    		if ($$dirty.color) { $$invalidate('switchStyle', switchStyle = `
    --color-primary: ${color};
    --color-primary-light: ${hexToRGB(color, 0.6)};
  `); }
    	};

    	return {
    		isOn,
    		color,
    		handleClick,
    		switchClasses,
    		switchStyle
    	};
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["isOn", "color"]);
    	}

    	get isOn() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOn(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Icons\Check.svelte generated by Svelte v3.5.4 */

    const file$7 = "src\\components\\Icons\\Check.svelte";

    function create_fragment$7(ctx) {
    	var svg, path0, path1;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr(path0, "d", "M0 0h24v24H0z");
    			attr(path0, "fill", "none");
    			add_location(path0, file$7, 5, 1, 94);
    			attr(path1, "d", "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z");
    			add_location(path1, file$7, 6, 1, 135);
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "width", "24");
    			attr(svg, "height", "24");
    			attr(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$7, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path0);
    			append(svg, path1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    class Check extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$7, safe_not_equal, []);
    	}
    }

    /* src\components\Checkbox\Checkbox.svelte generated by Svelte v3.5.4 */

    const file$8 = "src\\components\\Checkbox\\Checkbox.svelte";

    // (78:2) {#if checked}
    function create_if_block_1$1(ctx) {
    	var div, current;

    	var check = new Check({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			check.$$.fragment.c();
    			attr(div, "class", "checkbox-checker svelte-1235gam");
    			add_location(div, file$8, 78, 3, 1518);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(check, div, null);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(check.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(check.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(check, );
    		}
    	};
    }

    // (84:1) {#if label}
    function create_if_block$1(ctx) {
    	var div, t;

    	return {
    		c: function create() {
    			div = element("div");
    			t = text(ctx.label);
    			attr(div, "class", "checkbox-label svelte-1235gam");
    			add_location(div, file$8, 84, 2, 1610);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.label) {
    				set_data(t, ctx.label);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	var label_1, input, t0, div, t1, current, dispose;

    	var if_block0 = (ctx.checked) && create_if_block_1$1();

    	var if_block1 = (ctx.label) && create_if_block$1(ctx);

    	return {
    		c: function create() {
    			label_1 = element("label");
    			input = element("input");
    			t0 = space();
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr(input, "class", "checkbox-input svelte-1235gam");
    			attr(input, "type", "checkbox");
    			input.checked = ctx.checked;
    			add_location(input, file$8, 75, 1, 1409);
    			attr(div, "class", "checkbox-box svelte-1235gam");
    			add_location(div, file$8, 76, 1, 1470);
    			attr(label_1, "class", "" + (`checkbox`) + " svelte-1235gam");
    			add_location(label_1, file$8, 74, 0, 1357);
    			dispose = listen(label_1, "click", ctx.handleClick);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, label_1, anchor);
    			append(label_1, input);
    			append(label_1, t0);
    			append(label_1, div);
    			if (if_block0) if_block0.m(div, null);
    			append(label_1, t1);
    			if (if_block1) if_block1.m(label_1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.checked) {
    				input.checked = ctx.checked;
    			}

    			if (ctx.checked) {
    				if (!if_block0) {
    					if_block0 = create_if_block_1$1();
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, null);
    				} else {
    									transition_in(if_block0, 1);
    				}
    			} else if (if_block0) {
    				group_outros();
    				transition_out(if_block0, 1, () => {
    					if_block0 = null;
    				});
    				check_outros();
    			}

    			if (ctx.label) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(label_1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(label_1);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			dispose();
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	

    	let { checked = false, label = '', color = '#333333' } = $$props;

    	const handleClick = e => {
    		$$invalidate('checked', checked = !checked);
    	};

    	const writable_props = ['checked', 'label', 'color'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('checked' in $$props) $$invalidate('checked', checked = $$props.checked);
    		if ('label' in $$props) $$invalidate('label', label = $$props.label);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    	};

    	return { checked, label, color, handleClick };
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$8, safe_not_equal, ["checked", "label", "color"]);
    	}

    	get checked() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Ripple\Ripple.svelte generated by Svelte v3.5.4 */

    const file$9 = "src\\components\\Ripple\\Ripple.svelte";

    function create_fragment$9(ctx) {
    	var div, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", "ripple-container svelte-p5w5mf");
    			attr(div, "style", ctx.rippleStyle);
    			add_location(div, file$9, 94, 0, 2261);

    			dispose = [
    				listen(div, "mousedown", ctx.handleMouseDown),
    				listen(div, "mouseleave", ctx.handleMouseLeave),
    				listen(div, "mouseup", ctx.handleMouseUp),
    				listen(div, "touchstart", ctx.handleMouseDown),
    				listen(div, "touchend", ctx.handleMouseUp)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.rippleStyle) {
    				attr(div, "style", ctx.rippleStyle);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { color = '#ffffff' } = $$props;

    	const handleMouseDown = e => {
    		let x = e.offsetX;
    		let y = e.offsetY;
    		let w = e.currentTarget.offsetWidth;
    		let h = e.currentTarget.offsetHeight;
    		let centerOffsetX = Math.abs(x - w / 2);
    		let centerOffsetY = Math.abs(y - h / 2);
    		let sideX = w / 2 + centerOffsetX;
    		let sideY = h / 2 + centerOffsetY;
    		let diameter = Math.sqrt(Math.pow(sideX, 2) + Math.pow(sideY, 2)) * 2;
    		let ripple = document.createElement('div');

    		ripple.style = `
			left: ${x - diameter / 2}px;
			top: ${y - diameter / 2}px;
			width: ${diameter}px;
			height: ${diameter}px;
		`;
    		ripple.className = 'ripple';
    		e.target.appendChild(ripple);

    		setTimeout(function() {
    			ripple.classList.add('ripple--held');
    		}, 0);

    		setTimeout(function() {
    			if (ripple.classList.contains('ripple--held')) return;
    			ripple.classList.add('ripple--done');
    			setTimeout(() => {
    				ripple.parentNode.removeChild(ripple);
    			}, 400);
    		}, 400);
    	};

    	const killRipple = target => {
    		var ripples = target.querySelectorAll('.ripple');
    		var previousRipple = ripples[ripples.length - 1];

    		if (!previousRipple) return;
    		previousRipple.classList.add('ripple--done');
    		setTimeout(() => {
    			previousRipple.parentNode.removeChild(previousRipple);
    		}, 800);
    	};

    	const handleMouseUp = e => {
    		killRipple(e.target);
    	};
    	const handleMouseLeave = e => {
    		killRipple(e.target);
    	};

    	const writable_props = ['color'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Ripple> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    	};

    	let rippleStyle;

    	$$self.$$.update = ($$dirty = { color: 1 }) => {
    		if ($$dirty.color) { $$invalidate('rippleStyle', rippleStyle = `
		    --primary-color:  ${hexToRGB(color)};
    --primary-color-light:  ${hexToRGB(color, 0.25)};
  `); }
    	};

    	return {
    		color,
    		handleMouseDown,
    		handleMouseUp,
    		handleMouseLeave,
    		rippleStyle
    	};
    }

    class Ripple extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$9, safe_not_equal, ["color"]);
    	}

    	get color() {
    		throw new Error("<Ripple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Ripple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
      var f = t - 1.0;
      return f * f * f + 1.0
    }

    function slide(
    	node,
    	ref
    ) {
    	var delay = ref.delay; if ( delay === void 0 ) delay = 0;
    	var duration = ref.duration; if ( duration === void 0 ) duration = 400;
    	var easing = ref.easing; if ( easing === void 0 ) easing = cubicOut;

    	var style = getComputedStyle(node);
    	var opacity = +style.opacity;
    	var height = parseFloat(style.height);
    	var paddingTop = parseFloat(style.paddingTop);
    	var paddingBottom = parseFloat(style.paddingBottom);
    	var marginTop = parseFloat(style.marginTop);
    	var marginBottom = parseFloat(style.marginBottom);
    	var borderTopWidth = parseFloat(style.borderTopWidth);
    	var borderBottomWidth = parseFloat(style.borderBottomWidth);

    	return {
    		delay: delay,
    		duration: duration,
    		easing: easing,
    		css: function (t) { return "overflow: hidden;" +
    			"opacity: " + (Math.min(t * 20, 1) * opacity) + ";" +
    			"height: " + (t * height) + "px;" +
    			"padding-top: " + (t * paddingTop) + "px;" +
    			"padding-bottom: " + (t * paddingBottom) + "px;" +
    			"margin-top: " + (t * marginTop) + "px;" +
    			"margin-bottom: " + (t * marginBottom) + "px;" +
    			"border-top-width: " + (t * borderTopWidth) + "px;" +
    			"border-bottom-width: " + (t * borderBottomWidth) + "px;"; }
    	};
    }

    /* src\components\Accordeon\Accordeon.svelte generated by Svelte v3.5.4 */

    const file$a = "src\\components\\Accordeon\\Accordeon.svelte";

    const get_body_slot_changes = ({}) => ({});
    const get_body_slot_context = ({}) => ({});

    const get_header_slot_changes = ({}) => ({});
    const get_header_slot_context = ({}) => ({});

    // (19:1) {#if expanded}
    function create_if_block$2(ctx) {
    	var div, p, div_transition, current;

    	const body_slot_1 = ctx.$$slots.body;
    	const body_slot = create_slot(body_slot_1, ctx, get_body_slot_context);

    	return {
    		c: function create() {
    			div = element("div");

    			if (!body_slot) {
    				p = element("p");
    				p.textContent = "😮 No body!";
    			}

    			if (body_slot) body_slot.c();
    			if (!body_slot) {
    				add_location(p, file$a, 22, 4, 528);
    			}

    			attr(div, "class", "accordeon__body");
    			add_location(div, file$a, 20, 2, 453);
    		},

    		l: function claim(nodes) {
    			if (body_slot) body_slot.l(div_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (!body_slot) {
    				append(div, p);
    			}

    			else {
    				body_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (body_slot && body_slot.p && changed.$$scope) {
    				body_slot.p(get_slot_changes(body_slot_1, ctx, changed, get_body_slot_changes), get_slot_context(body_slot_1, ctx, get_body_slot_context));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(body_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(body_slot, local);

    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (body_slot) body_slot.d(detaching);

    			if (detaching) {
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	var div, t, current, dispose;

    	const header_slot_1 = ctx.$$slots.header;
    	const header_slot = create_slot(header_slot_1, ctx, get_header_slot_context);

    	var if_block = (ctx.expanded) && create_if_block$2(ctx);

    	return {
    		c: function create() {
    			div = element("div");

    			if (header_slot) header_slot.c();
    			t = space();
    			if (if_block) if_block.c();

    			attr(div, "class", 'accordeon');
    			add_location(div, file$a, 13, 0, 259);
    			dispose = listen(div, "mousedown", ctx.handleMouseDown);
    		},

    		l: function claim(nodes) {
    			if (header_slot) header_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (header_slot) {
    				header_slot.m(div, null);
    			}

    			append(div, t);
    			if (if_block) if_block.m(div, null);
    			add_binding_callback(() => ctx.div_binding(div, null));
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (header_slot && header_slot.p && changed.$$scope) {
    				header_slot.p(get_slot_changes(header_slot_1, ctx, changed, get_header_slot_changes), get_slot_context(header_slot_1, ctx, get_header_slot_context));
    			}

    			if (ctx.expanded) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}

    			if (changed.items) {
    				ctx.div_binding(null, div);
    				ctx.div_binding(div, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(header_slot, local);
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (header_slot) header_slot.d(detaching);
    			if (if_block) if_block.d();
    			ctx.div_binding(null, div);
    			dispose();
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { expanded = false, expandDuration = 1000 } = $$props;
    	let accordeonRef;

    	const handleMouseDown = e => {
    		$$invalidate('expanded', expanded = !expanded);
    	};

    	const writable_props = ['expanded', 'expandDuration'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Accordeon> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function div_binding($$node, check) {
    		accordeonRef = $$node;
    		$$invalidate('accordeonRef', accordeonRef);
    	}

    	$$self.$set = $$props => {
    		if ('expanded' in $$props) $$invalidate('expanded', expanded = $$props.expanded);
    		if ('expandDuration' in $$props) $$invalidate('expandDuration', expandDuration = $$props.expandDuration);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		expanded,
    		expandDuration,
    		accordeonRef,
    		handleMouseDown,
    		div_binding,
    		$$slots,
    		$$scope
    	};
    }

    class Accordeon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$a, safe_not_equal, ["expanded", "expandDuration"]);
    	}

    	get expanded() {
    		throw new Error("<Accordeon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<Accordeon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expandDuration() {
    		throw new Error("<Accordeon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expandDuration(value) {
    		throw new Error("<Accordeon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CircleNavigation\CircleNavigation.svelte generated by Svelte v3.5.4 */

    const file$b = "src\\components\\CircleNavigation\\CircleNavigation.svelte";

    const get_elements_slot_changes = ({}) => ({});
    const get_elements_slot_context = ({}) => ({});

    const get_circle_slot_changes = ({}) => ({});
    const get_circle_slot_context = ({}) => ({});

    // (228:3) {#if ripple}
    function create_if_block$3(ctx) {
    	var current;

    	var ripple_1 = new Ripple({ $$inline: true });

    	return {
    		c: function create() {
    			ripple_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple_1, detaching);
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	var div3, div2, button, t0, t1, div0, t2, div1, div3_class_value, current, dispose;

    	var if_block = (ctx.ripple) && create_if_block$3();

    	const circle_slot_1 = ctx.$$slots.circle;
    	const circle_slot = create_slot(circle_slot_1, ctx, get_circle_slot_context);

    	const elements_slot_1 = ctx.$$slots.elements;
    	const elements_slot = create_slot(elements_slot_1, ctx, get_elements_slot_context);

    	return {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			button = element("button");
    			if (if_block) if_block.c();
    			t0 = space();

    			if (circle_slot) circle_slot.c();
    			t1 = space();
    			div0 = element("div");

    			if (elements_slot) elements_slot.c();
    			t2 = space();
    			div1 = element("div");

    			attr(button, "class", "circnav_button svelte-f0jvmv");
    			add_location(button, file$b, 226, 2, 5193);

    			attr(div0, "class", "circnav_subcircles svelte-f0jvmv");
    			add_location(div0, file$b, 233, 2, 5338);
    			attr(div1, "class", "circnav_bg svelte-f0jvmv");
    			add_location(div1, file$b, 237, 2, 5435);
    			attr(div2, "class", "circnav-element svelte-f0jvmv");
    			add_location(div2, file$b, 225, 1, 5161);
    			attr(div3, "class", div3_class_value = "" + ('circnav ' + ctx.circleNavigationClasses) + " svelte-f0jvmv");
    			attr(div3, "style", ctx.circleNavigationStyle);
    			add_location(div3, file$b, 221, 0, 5045);

    			dispose = [
    				listen(button, "mouseenter", ctx.handleMouseover),
    				listen(div3, "mouseleave", ctx.handleMouseout)
    			];
    		},

    		l: function claim(nodes) {
    			if (circle_slot) circle_slot.l(button_nodes);

    			if (elements_slot) elements_slot.l(div0_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, button);
    			if (if_block) if_block.m(button, null);
    			append(button, t0);

    			if (circle_slot) {
    				circle_slot.m(button, null);
    			}

    			append(div2, t1);
    			append(div2, div0);

    			if (elements_slot) {
    				elements_slot.m(div0, null);
    			}

    			add_binding_callback(() => ctx.div0_binding(div0, null));
    			append(div2, t2);
    			append(div2, div1);
    			add_binding_callback(() => ctx.div1_binding(div1, null));
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.ripple) {
    				if (!if_block) {
    					if_block = create_if_block$3();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}

    			if (circle_slot && circle_slot.p && changed.$$scope) {
    				circle_slot.p(get_slot_changes(circle_slot_1, ctx, changed, get_circle_slot_changes), get_slot_context(circle_slot_1, ctx, get_circle_slot_context));
    			}

    			if (elements_slot && elements_slot.p && changed.$$scope) {
    				elements_slot.p(get_slot_changes(elements_slot_1, ctx, changed, get_elements_slot_changes), get_slot_context(elements_slot_1, ctx, get_elements_slot_context));
    			}

    			if (changed.items) {
    				ctx.div0_binding(null, div0);
    				ctx.div0_binding(div0, null);
    			}
    			if (changed.items) {
    				ctx.div1_binding(null, div1);
    				ctx.div1_binding(div1, null);
    			}

    			if ((!current || changed.circleNavigationClasses) && div3_class_value !== (div3_class_value = "" + ('circnav ' + ctx.circleNavigationClasses) + " svelte-f0jvmv")) {
    				attr(div3, "class", div3_class_value);
    			}

    			if (!current || changed.circleNavigationStyle) {
    				attr(div3, "style", ctx.circleNavigationStyle);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(circle_slot, local);
    			transition_in(elements_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(circle_slot, local);
    			transition_out(elements_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}

    			if (if_block) if_block.d();

    			if (circle_slot) circle_slot.d(detaching);

    			if (elements_slot) elements_slot.d(detaching);
    			ctx.div0_binding(null, div0);
    			ctx.div1_binding(null, div1);
    			run_all(dispose);
    		}
    	};
    }

    let animationStagger = 15;

    function instance$a($$self, $$props, $$invalidate) {
    	

    	let { useNestedElements = true, ripple = true, color = '#ff00aa', circleContent, direction = 'left', circleSize = 60, elementSize = 40 } = $$props;

    	let timeouts = [];

    	let bgRef;
    	let elementsRef;
    	let elems;

    	let directions = {
    		top: {
    			class: 'circnav--direction-top'
    		},
    		bottom: {
    			class: 'circnav--direction-bottom'
    		},
    		left: {
    			class: 'circnav--direction-left'
    		},
    		right: {
    			class: 'circnav--direction-right'
    		}
    	};

    	onMount(() => {
    		elems = elementsRef.children;
    		// using svelte's {#each} inside a named slot renders an extra div,
    		// which will be taken care of here until fixed
    		// @see - https://github.com/sveltejs/svelte/issues/2080
    		if (useNestedElements) elems = elems[0];
    		let entries = Array.from(elems.children);
    		entries.forEach((el, i) => {
    			if (el.classList) el.classList.add('circnav_subcircle');
    		});
    	});

    	const animateIn = e => {
    		clearTimeouts();
    		Array.from(elems.children).forEach((el, i) => {
    			let timeout = setTimeout(() => {
    				if (el.classList) {
    					el.classList.add('circnav_subcircle--active');
    				}
    				elems.visible += 1;			}, i * animationStagger);
    			timeouts.push(timeout);
    		});
    	};

    	const animateOut = e => {
    		clearTimeouts();
    		let entries = Array.from(
    			elems.querySelectorAll('.circnav_subcircle--active')
    		);
    		let maxAnimation = animationStagger * entries.length;
    		entries.forEach((el, i) => {
    			setTimeout(() => {
    				if (el.classList) {
    					el.classList.remove('circnav_subcircle--active');
    				}
    				// apply max duration so the first element fades last
    			}, maxAnimation - i * animationStagger);
    		});
    	};

    	const clearTimeouts = () => {
    		timeouts.forEach(timeout => {
    			clearInterval(timeout);
    		});
    	};

    	const handleMouseover = e => {
    		animateIn();
    	};

    	const handleMouseout = e => {
    		animateOut();
    	};

    	const writable_props = ['useNestedElements', 'ripple', 'color', 'circleContent', 'direction', 'circleSize', 'elementSize'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<CircleNavigation> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function div0_binding($$node, check) {
    		elementsRef = $$node;
    		$$invalidate('elementsRef', elementsRef);
    	}

    	function div1_binding($$node, check) {
    		bgRef = $$node;
    		$$invalidate('bgRef', bgRef);
    	}

    	$$self.$set = $$props => {
    		if ('useNestedElements' in $$props) $$invalidate('useNestedElements', useNestedElements = $$props.useNestedElements);
    		if ('ripple' in $$props) $$invalidate('ripple', ripple = $$props.ripple);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('circleContent' in $$props) $$invalidate('circleContent', circleContent = $$props.circleContent);
    		if ('direction' in $$props) $$invalidate('direction', direction = $$props.direction);
    		if ('circleSize' in $$props) $$invalidate('circleSize', circleSize = $$props.circleSize);
    		if ('elementSize' in $$props) $$invalidate('elementSize', elementSize = $$props.elementSize);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	let directionClass, circleNavigationClasses, circleNavigationStyle;

    	$$self.$$.update = ($$dirty = { directions: 1, direction: 1, directionClass: 1, color: 1, circleSize: 1, elementSize: 1 }) => {
    		if ($$dirty.directions || $$dirty.direction) { $$invalidate('directionClass', directionClass = directions[direction]
    				? directions[direction].class
    				: direction); }
    		if ($$dirty.directionClass) { $$invalidate('circleNavigationClasses', circleNavigationClasses = `
		    ${directionClass}
		  `); }
    		if ($$dirty.color || $$dirty.circleSize || $$dirty.elementSize) { $$invalidate('circleNavigationStyle', circleNavigationStyle = `
				--color: ${color};
		--circle-size: ${circleSize}px;
		--element-size: ${elementSize}px;
	`); }
    	};

    	return {
    		useNestedElements,
    		ripple,
    		color,
    		circleContent,
    		direction,
    		circleSize,
    		elementSize,
    		bgRef,
    		elementsRef,
    		handleMouseover,
    		handleMouseout,
    		circleNavigationClasses,
    		circleNavigationStyle,
    		div0_binding,
    		div1_binding,
    		$$slots,
    		$$scope
    	};
    }

    class CircleNavigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$b, safe_not_equal, ["useNestedElements", "ripple", "color", "circleContent", "direction", "circleSize", "elementSize"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.circleContent === undefined && !('circleContent' in props)) {
    			console.warn("<CircleNavigation> was created without expected prop 'circleContent'");
    		}
    	}

    	get useNestedElements() {
    		throw new Error("<CircleNavigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set useNestedElements(value) {
    		throw new Error("<CircleNavigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<CircleNavigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<CircleNavigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<CircleNavigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<CircleNavigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get circleContent() {
    		throw new Error("<CircleNavigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set circleContent(value) {
    		throw new Error("<CircleNavigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get direction() {
    		throw new Error("<CircleNavigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<CircleNavigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get circleSize() {
    		throw new Error("<CircleNavigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set circleSize(value) {
    		throw new Error("<CircleNavigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get elementSize() {
    		throw new Error("<CircleNavigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elementSize(value) {
    		throw new Error("<CircleNavigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CircleNavigation\CircleNavigation2.svelte generated by Svelte v3.5.4 */

    const file$c = "src\\components\\CircleNavigation\\CircleNavigation2.svelte";

    const get_elements_slot_changes$1 = ({}) => ({});
    const get_elements_slot_context$1 = ({}) => ({});

    const get_circle_slot_changes$1 = ({}) => ({});
    const get_circle_slot_context$1 = ({}) => ({});

    // (130:2) {#if ripple}
    function create_if_block$4(ctx) {
    	var current;

    	var ripple_1 = new Ripple({ $$inline: true });

    	return {
    		c: function create() {
    			ripple_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple_1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple_1, detaching);
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	var div2, button, t0, t1, div0, t2, div1, current, dispose;

    	var if_block = (ctx.ripple) && create_if_block$4();

    	const circle_slot_1 = ctx.$$slots.circle;
    	const circle_slot = create_slot(circle_slot_1, ctx, get_circle_slot_context$1);

    	const elements_slot_1 = ctx.$$slots.elements;
    	const elements_slot = create_slot(elements_slot_1, ctx, get_elements_slot_context$1);

    	return {
    		c: function create() {
    			div2 = element("div");
    			button = element("button");
    			if (if_block) if_block.c();
    			t0 = space();

    			if (circle_slot) circle_slot.c();
    			t1 = space();
    			div0 = element("div");

    			if (elements_slot) elements_slot.c();
    			t2 = space();
    			div1 = element("div");

    			attr(button, "class", "circle-navigation_button svelte-y8y5n");
    			add_location(button, file$c, 128, 1, 3080);

    			attr(div0, "class", "circle-navigation_elements");
    			add_location(div0, file$c, 135, 1, 3204);
    			attr(div1, "class", "circle-navigation_background svelte-y8y5n");
    			add_location(div1, file$c, 139, 1, 3310);
    			attr(div2, "class", "circle-navigation svelte-y8y5n");
    			attr(div2, "style", ctx.circleNavigationStyle);
    			add_location(div2, file$c, 122, 0, 2946);

    			dispose = [
    				listen(div2, "mouseover", ctx.handleMouseover),
    				listen(div2, "mouseout", ctx.handleMouseout)
    			];
    		},

    		l: function claim(nodes) {
    			if (circle_slot) circle_slot.l(button_nodes);

    			if (elements_slot) elements_slot.l(div0_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, button);
    			if (if_block) if_block.m(button, null);
    			append(button, t0);

    			if (circle_slot) {
    				circle_slot.m(button, null);
    			}

    			append(div2, t1);
    			append(div2, div0);

    			if (elements_slot) {
    				elements_slot.m(div0, null);
    			}

    			add_binding_callback(() => ctx.div0_binding(div0, null));
    			append(div2, t2);
    			append(div2, div1);
    			add_binding_callback(() => ctx.div1_binding(div1, null));
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.ripple) {
    				if (!if_block) {
    					if_block = create_if_block$4();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, t0);
    				} else {
    									transition_in(if_block, 1);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}

    			if (circle_slot && circle_slot.p && changed.$$scope) {
    				circle_slot.p(get_slot_changes(circle_slot_1, ctx, changed, get_circle_slot_changes$1), get_slot_context(circle_slot_1, ctx, get_circle_slot_context$1));
    			}

    			if (elements_slot && elements_slot.p && changed.$$scope) {
    				elements_slot.p(get_slot_changes(elements_slot_1, ctx, changed, get_elements_slot_changes$1), get_slot_context(elements_slot_1, ctx, get_elements_slot_context$1));
    			}

    			if (changed.items) {
    				ctx.div0_binding(null, div0);
    				ctx.div0_binding(div0, null);
    			}
    			if (changed.items) {
    				ctx.div1_binding(null, div1);
    				ctx.div1_binding(div1, null);
    			}

    			if (!current || changed.circleNavigationStyle) {
    				attr(div2, "style", ctx.circleNavigationStyle);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(circle_slot, local);
    			transition_in(elements_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(circle_slot, local);
    			transition_out(elements_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			if (if_block) if_block.d();

    			if (circle_slot) circle_slot.d(detaching);

    			if (elements_slot) elements_slot.d(detaching);
    			ctx.div0_binding(null, div0);
    			ctx.div1_binding(null, div1);
    			run_all(dispose);
    		}
    	};
    }

    let circleSize = 60;

    let elementSize = 40;

    function instance$b($$self, $$props, $$invalidate) {
    	

    	let { useNestedElements = true, ripple = true, color = '#ff00aa', circleContent } = $$props;

    	let bgRef;
    	let elementsRef;
    	let elems;

    	onMount(() => {
    		elems = elementsRef.childNodes;
    		// using svelte's {#each} inside a named slot renders an extra div, which will be taken care of here until fixed
    		// @see - https://github.com/sveltejs/svelte/issues/2080
    		if (useNestedElements) elems = elems[0].childNodes;
    		elems.forEach((el, i) => {
    			let top = circleSize / 2 - elementSize / 2;
    			let left = circleSize / 2 - elementSize / 2;
    			el.style.opacity = `0`;
    			el.style.top = `${top}px`;
    			el.style.left = `${left}px`;
    			if (el.classList) el.classList.add('circle-navigation_element');
    		});
    	});

    	const handleMouseover = e => {
    		let gapX = 10;
    		let startX = circleSize + gapX;
    		let maxW = startX;

    		elems.forEach((el, i) => {
    			let w = el.offsetWidth;
    			let left = i * (w + gapX) + startX;
    			maxW += i * (w + gapX);

    			el.style.opacity = `1`;
    			el.style.left = `${left}px`;
    		});

    		bgRef.style = `
			width:${maxW}px;
		`; $$invalidate('bgRef', bgRef);
    	};

    	const handleMouseout = e => {
    		elems.forEach((el, i) => {
    			let left = circleSize / 2 - elementSize / 2;
    			el.style.left = `${left}px`;
    		});
    		bgRef.style = `
			width:100%;
		`; $$invalidate('bgRef', bgRef);
    	};

    	const writable_props = ['useNestedElements', 'ripple', 'color', 'circleContent'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<CircleNavigation2> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function div0_binding($$node, check) {
    		elementsRef = $$node;
    		$$invalidate('elementsRef', elementsRef);
    	}

    	function div1_binding($$node, check) {
    		bgRef = $$node;
    		$$invalidate('bgRef', bgRef);
    	}

    	$$self.$set = $$props => {
    		if ('useNestedElements' in $$props) $$invalidate('useNestedElements', useNestedElements = $$props.useNestedElements);
    		if ('ripple' in $$props) $$invalidate('ripple', ripple = $$props.ripple);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('circleContent' in $$props) $$invalidate('circleContent', circleContent = $$props.circleContent);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	let circleNavigationStyle;

    	$$self.$$.update = ($$dirty = { color: 1, circleSize: 1, elementSize: 1 }) => {
    		if ($$dirty.color || $$dirty.circleSize || $$dirty.elementSize) { $$invalidate('circleNavigationStyle', circleNavigationStyle = `
		--color: ${color};
		--circle-size: ${circleSize}px;
		--element-size: ${elementSize}px;
	`); }
    	};

    	return {
    		useNestedElements,
    		ripple,
    		color,
    		circleContent,
    		bgRef,
    		elementsRef,
    		handleMouseover,
    		handleMouseout,
    		circleNavigationStyle,
    		div0_binding,
    		div1_binding,
    		$$slots,
    		$$scope
    	};
    }

    class CircleNavigation2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$c, safe_not_equal, ["useNestedElements", "ripple", "color", "circleContent"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.circleContent === undefined && !('circleContent' in props)) {
    			console.warn("<CircleNavigation2> was created without expected prop 'circleContent'");
    		}
    	}

    	get useNestedElements() {
    		throw new Error("<CircleNavigation2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set useNestedElements(value) {
    		throw new Error("<CircleNavigation2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<CircleNavigation2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<CircleNavigation2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<CircleNavigation2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<CircleNavigation2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get circleContent() {
    		throw new Error("<CircleNavigation2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set circleContent(value) {
    		throw new Error("<CircleNavigation2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Layout\Block.svelte generated by Svelte v3.5.4 */

    const file$d = "src\\components\\Layout\\Block.svelte";

    function create_fragment$d(ctx) {
    	var div, div_class_value, current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			attr(div, "class", div_class_value = "" + ('block ' + ctx.classes) + " svelte-gshpik");
    			add_location(div, file$d, 24, 0, 397);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if ((!current || changed.classes) && div_class_value !== (div_class_value = "" + ('block ' + ctx.classes) + " svelte-gshpik")) {
    				attr(div, "class", div_class_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { mode = 'default' } = $$props;

    	let modes = {
    		default: '',
    		rows: 'block--rows'
    	};

    	const writable_props = ['mode'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Block> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('mode' in $$props) $$invalidate('mode', mode = $$props.mode);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	let modeClass, classes;

    	$$self.$$.update = ($$dirty = { modes: 1, mode: 1, modeClass: 1 }) => {
    		if ($$dirty.modes || $$dirty.mode) { $$invalidate('modeClass', modeClass = modes[mode] ? modes[mode] : mode); }
    		if ($$dirty.modeClass) { $$invalidate('classes', classes = `${modeClass}`); }
    	};

    	return { mode, classes, $$slots, $$scope };
    }

    class Block extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$d, safe_not_equal, ["mode"]);
    	}

    	get mode() {
    		throw new Error("<Block>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<Block>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Layout\Screen.svelte generated by Svelte v3.5.4 */

    const file$e = "src\\components\\Layout\\Screen.svelte";

    function create_fragment$e(ctx) {
    	var div, current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			attr(div, "class", "screen svelte-l301wc");
    			add_location(div, file$e, 9, 0, 95);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { $$slots, $$scope };
    }

    class Screen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$e, safe_not_equal, []);
    	}
    }

    /* src\assets\icons\Check.svelte generated by Svelte v3.5.4 */

    const file$f = "src\\assets\\icons\\Check.svelte";

    function create_fragment$f(ctx) {
    	var svg, path0, path1;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr(path0, "d", "M0 0h24v24H0z");
    			attr(path0, "fill", "none");
    			add_location(path0, file$f, 5, 1, 94);
    			attr(path1, "d", "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z");
    			add_location(path1, file$f, 6, 1, 135);
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "width", "24");
    			attr(svg, "height", "24");
    			attr(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$f, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path0);
    			append(svg, path1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    class Check$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$f, safe_not_equal, []);
    	}
    }

    /* src\assets\icons\Close.svelte generated by Svelte v3.5.4 */

    const file$g = "src\\assets\\icons\\Close.svelte";

    function create_fragment$g(ctx) {
    	var svg, path0, path1;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr(path0, "d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41\r\n\t\t17.59 19 19 17.59 13.41 12z");
    			add_location(path0, file$g, 5, 1, 94);
    			attr(path1, "d", "M0 0h24v24H0z");
    			attr(path1, "fill", "none");
    			add_location(path1, file$g, 8, 1, 217);
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "width", "24");
    			attr(svg, "height", "24");
    			attr(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$g, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path0);
    			append(svg, path1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    class Close extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$g, safe_not_equal, []);
    	}
    }

    /* src\assets\icons\Favorite.svelte generated by Svelte v3.5.4 */

    const file$h = "src\\assets\\icons\\Favorite.svelte";

    function create_fragment$h(ctx) {
    	var svg, path0, path1;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr(path0, "d", "M0 0h24v24H0z");
    			attr(path0, "fill", "none");
    			add_location(path0, file$h, 5, 1, 94);
    			attr(path1, "d", "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0\r\n\t\t3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4\r\n\t\t6.86-8.55 11.54L12 21.35z");
    			add_location(path1, file$h, 6, 1, 135);
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "width", "24");
    			attr(svg, "height", "24");
    			attr(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$h, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path0);
    			append(svg, path1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    class Favorite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$h, safe_not_equal, []);
    	}
    }

    /* src\assets\icons\Star.svelte generated by Svelte v3.5.4 */

    const file$i = "src\\assets\\icons\\Star.svelte";

    function create_fragment$i(ctx) {
    	var svg, path0, path1, path2;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr(path0, "d", "M0 0h24v24H0z");
    			attr(path0, "fill", "none");
    			add_location(path0, file$i, 5, 1, 94);
    			attr(path1, "d", "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2\r\n\t\t9.24l5.46 4.73L5.82 21z");
    			add_location(path1, file$i, 6, 1, 135);
    			attr(path2, "d", "M0 0h24v24H0z");
    			attr(path2, "fill", "none");
    			add_location(path2, file$i, 9, 1, 245);
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "width", "24");
    			attr(svg, "height", "24");
    			attr(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$i, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path0);
    			append(svg, path1);
    			append(svg, path2);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    class Star extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$i, safe_not_equal, []);
    	}
    }

    /* src\assets\icons\Phone.svelte generated by Svelte v3.5.4 */

    const file$j = "src\\assets\\icons\\Phone.svelte";

    function create_fragment$j(ctx) {
    	var svg, path0, path1;

    	return {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr(path0, "d", "M0 0h24v24H0z");
    			attr(path0, "fill", "none");
    			add_location(path0, file$j, 5, 1, 94);
    			attr(path1, "d", "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24\r\n\t\t1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39\r\n\t\t0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57\r\n\t\t3.57.11.35.03.74-.25 1.02l-2.2 2.2z");
    			add_location(path1, file$j, 6, 1, 135);
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "width", "24");
    			attr(svg, "height", "24");
    			attr(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$j, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path0);
    			append(svg, path1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(svg);
    			}
    		}
    	};
    }

    class Phone extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$j, safe_not_equal, []);
    	}
    }

    /* src\demo\UiComponents.svelte generated by Svelte v3.5.4 */

    const file$k = "src\\demo\\UiComponents.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.elem = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.elem = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.elem = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.elem = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.elem = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.el = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.el = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.el = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.el = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (151:0) <Button color={randomColor} on:click={setRandomColor} outlined={true}>
    function create_default_slot_46(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: ctx.randomColor },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n  Random Color");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var ripple_changes = {};
    			if (changed.randomColor) ripple_changes.color = ctx.randomColor;
    			ripple.$set(ripple_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (167:10) <ToggleGroupElement id={i}>
    function create_default_slot_45(ctx) {
    	var t, current;

    	var checkbox = new Checkbox({
    		props: {
    		checked: ctx.actives4.includes(ctx.i),
    		color: "#bbddaa",
    		label: "test"
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			checkbox.$$.fragment.c();
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			mount_component(checkbox, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var checkbox_changes = {};
    			if (changed.actives4) checkbox_changes.checked = ctx.actives4.includes(ctx.i);
    			checkbox.$set(checkbox_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(checkbox, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (166:8) {#each new Array(3).fill('') as el, i}
    function create_each_block_8(ctx) {
    	var current;

    	var togglegroupelement = new ToggleGroupElement({
    		props: {
    		id: ctx.i,
    		$$slots: { default: [create_default_slot_45] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			togglegroupelement.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(togglegroupelement, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var togglegroupelement_changes = {};
    			if (changed.$$scope || changed.actives4) togglegroupelement_changes.$$scope = { changed, ctx };
    			togglegroupelement.$set(togglegroupelement_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(togglegroupelement.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(togglegroupelement.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(togglegroupelement, detaching);
    		}
    	};
    }

    // (162:6) <ToggleGroup          on:change={e => {            actives4 = e.detail.actives;          }}>
    function create_default_slot_44(ctx) {
    	var each_1_anchor, current;

    	var each_value_8 = new ctx.Array(3).fill('');

    	var each_blocks = [];

    	for (var i = 0; i < each_value_8.length; i += 1) {
    		each_blocks[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.actives4 || changed.Array) {
    				each_value_8 = new ctx.Array(3).fill('');

    				for (var i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_8(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_8.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (181:12) <ToggleButton isOn={actives0.includes(i)} color={randomColor}>
    function create_default_slot_43(ctx) {
    	var t0, t1, t2, current;

    	var ripple = new Ripple({
    		props: { color: ctx.randomColor },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			t0 = text("Toggle Button ");
    			t1 = text(ctx.i);
    			t2 = space();
    			ripple.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    			mount_component(ripple, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var ripple_changes = {};
    			if (changed.randomColor) ripple_changes.color = ctx.randomColor;
    			ripple.$set(ripple_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t0);
    				detach(t1);
    				detach(t2);
    			}

    			destroy_component(ripple, detaching);
    		}
    	};
    }

    // (180:10) <ToggleGroupElement id={i}>
    function create_default_slot_42(ctx) {
    	var t, current;

    	var togglebutton = new ToggleButton({
    		props: {
    		isOn: ctx.actives0.includes(ctx.i),
    		color: ctx.randomColor,
    		$$slots: { default: [create_default_slot_43] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			togglebutton.$$.fragment.c();
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			mount_component(togglebutton, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var togglebutton_changes = {};
    			if (changed.actives0) togglebutton_changes.isOn = ctx.actives0.includes(ctx.i);
    			if (changed.randomColor) togglebutton_changes.color = ctx.randomColor;
    			if (changed.$$scope || changed.randomColor) togglebutton_changes.$$scope = { changed, ctx };
    			togglebutton.$set(togglebutton_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(togglebutton.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(togglebutton.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(togglebutton, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (179:8) {#each new Array(3).fill('') as el, i}
    function create_each_block_7(ctx) {
    	var current;

    	var togglegroupelement = new ToggleGroupElement({
    		props: {
    		id: ctx.i,
    		$$slots: { default: [create_default_slot_42] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			togglegroupelement.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(togglegroupelement, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var togglegroupelement_changes = {};
    			if (changed.$$scope || changed.actives0 || changed.randomColor) togglegroupelement_changes.$$scope = { changed, ctx };
    			togglegroupelement.$set(togglegroupelement_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(togglegroupelement.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(togglegroupelement.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(togglegroupelement, detaching);
    		}
    	};
    }

    // (175:6) <ToggleGroup          on:change={e => {            actives0 = e.detail.actives;          }}>
    function create_default_slot_41(ctx) {
    	var each_1_anchor, current;

    	var each_value_7 = new ctx.Array(3).fill('');

    	var each_blocks = [];

    	for (var i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.actives0 || changed.randomColor || changed.Array) {
    				each_value_7 = new ctx.Array(3).fill('');

    				for (var i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_7(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_7.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (196:10) <ToggleGroupElement id={i}>
    function create_default_slot_40(ctx) {
    	var t, current;

    	var switch_1 = new Switch({
    		props: {
    		isOn: ctx.actives1.includes(ctx.i),
    		color: ctx.randomColor
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			switch_1.$$.fragment.c();
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			mount_component(switch_1, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_1_changes = {};
    			if (changed.actives1) switch_1_changes.isOn = ctx.actives1.includes(ctx.i);
    			if (changed.randomColor) switch_1_changes.color = ctx.randomColor;
    			switch_1.$set(switch_1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(switch_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(switch_1, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (195:8) {#each new Array(3).fill('') as el, i}
    function create_each_block_6(ctx) {
    	var current;

    	var togglegroupelement = new ToggleGroupElement({
    		props: {
    		id: ctx.i,
    		$$slots: { default: [create_default_slot_40] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			togglegroupelement.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(togglegroupelement, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var togglegroupelement_changes = {};
    			if (changed.$$scope || changed.actives1 || changed.randomColor) togglegroupelement_changes.$$scope = { changed, ctx };
    			togglegroupelement.$set(togglegroupelement_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(togglegroupelement.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(togglegroupelement.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(togglegroupelement, detaching);
    		}
    	};
    }

    // (191:6) <ToggleGroup          on:change={e => {            actives1 = e.detail.actives;          }}>
    function create_default_slot_39(ctx) {
    	var each_1_anchor, current;

    	var each_value_6 = new ctx.Array(3).fill('');

    	var each_blocks = [];

    	for (var i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.actives1 || changed.randomColor || changed.Array) {
    				each_value_6 = new ctx.Array(3).fill('');

    				for (var i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_6.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (210:10) <ToggleGroupElement id={i}>
    function create_default_slot_38(ctx) {
    	var t, current;

    	var toggle = new Toggle({
    		props: {
    		toggle: ctx.actives2.includes(ctx.i),
    		color: ctx.randomColor
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			toggle.$$.fragment.c();
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			mount_component(toggle, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var toggle_changes = {};
    			if (changed.actives2) toggle_changes.toggle = ctx.actives2.includes(ctx.i);
    			if (changed.randomColor) toggle_changes.color = ctx.randomColor;
    			toggle.$set(toggle_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(toggle, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (209:8) {#each new Array(3).fill('') as el, i}
    function create_each_block_5(ctx) {
    	var current;

    	var togglegroupelement = new ToggleGroupElement({
    		props: {
    		id: ctx.i,
    		$$slots: { default: [create_default_slot_38] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			togglegroupelement.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(togglegroupelement, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var togglegroupelement_changes = {};
    			if (changed.$$scope || changed.actives2 || changed.randomColor) togglegroupelement_changes.$$scope = { changed, ctx };
    			togglegroupelement.$set(togglegroupelement_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(togglegroupelement.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(togglegroupelement.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(togglegroupelement, detaching);
    		}
    	};
    }

    // (204:6) <ToggleGroup          on:change={e => {            actives2 = e.detail.actives;          }}          multiple={false}>
    function create_default_slot_37(ctx) {
    	var each_1_anchor, current;

    	var each_value_5 = new ctx.Array(3).fill('');

    	var each_blocks = [];

    	for (var i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.actives2 || changed.randomColor || changed.Array) {
    				each_value_5 = new ctx.Array(3).fill('');

    				for (var i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_5.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (157:0) <Block>
    function create_default_slot_36(ctx) {
    	var div4, div0, t0, div1, t1, div2, t2, div3, current;

    	var togglegroup0 = new ToggleGroup({
    		props: {
    		$$slots: { default: [create_default_slot_44] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	togglegroup0.$on("change", ctx.change_handler);

    	var togglegroup1 = new ToggleGroup({
    		props: {
    		$$slots: { default: [create_default_slot_41] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	togglegroup1.$on("change", ctx.change_handler_1);

    	var togglegroup2 = new ToggleGroup({
    		props: {
    		$$slots: { default: [create_default_slot_39] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	togglegroup2.$on("change", ctx.change_handler_2);

    	var togglegroup3 = new ToggleGroup({
    		props: {
    		multiple: false,
    		$$slots: { default: [create_default_slot_37] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	togglegroup3.$on("change", ctx.change_handler_3);

    	return {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			togglegroup0.$$.fragment.c();
    			t0 = space();
    			div1 = element("div");
    			togglegroup1.$$.fragment.c();
    			t1 = space();
    			div2 = element("div");
    			togglegroup2.$$.fragment.c();
    			t2 = space();
    			div3 = element("div");
    			togglegroup3.$$.fragment.c();
    			add_location(div0, file$k, 159, 4, 4210);
    			add_location(div1, file$k, 173, 4, 4581);
    			add_location(div2, file$k, 189, 4, 5049);
    			add_location(div3, file$k, 202, 4, 5405);
    			set_style(div4, "display", "flex");
    			set_style(div4, "flex-flow", "column");
    			add_location(div4, file$k, 158, 2, 4160);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div0);
    			mount_component(togglegroup0, div0, null);
    			append(div4, t0);
    			append(div4, div1);
    			mount_component(togglegroup1, div1, null);
    			append(div4, t1);
    			append(div4, div2);
    			mount_component(togglegroup2, div2, null);
    			append(div4, t2);
    			append(div4, div3);
    			mount_component(togglegroup3, div3, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var togglegroup0_changes = {};
    			if (changed.$$scope || changed.actives4) togglegroup0_changes.$$scope = { changed, ctx };
    			togglegroup0.$set(togglegroup0_changes);

    			var togglegroup1_changes = {};
    			if (changed.$$scope || changed.actives0 || changed.randomColor) togglegroup1_changes.$$scope = { changed, ctx };
    			togglegroup1.$set(togglegroup1_changes);

    			var togglegroup2_changes = {};
    			if (changed.$$scope || changed.actives1 || changed.randomColor) togglegroup2_changes.$$scope = { changed, ctx };
    			togglegroup2.$set(togglegroup2_changes);

    			var togglegroup3_changes = {};
    			if (changed.$$scope || changed.actives2 || changed.randomColor) togglegroup3_changes.$$scope = { changed, ctx };
    			togglegroup3.$set(togglegroup3_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(togglegroup0.$$.fragment, local);

    			transition_in(togglegroup1.$$.fragment, local);

    			transition_in(togglegroup2.$$.fragment, local);

    			transition_in(togglegroup3.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(togglegroup0.$$.fragment, local);
    			transition_out(togglegroup1.$$.fragment, local);
    			transition_out(togglegroup2.$$.fragment, local);
    			transition_out(togglegroup3.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div4);
    			}

    			destroy_component(togglegroup0, );

    			destroy_component(togglegroup1, );

    			destroy_component(togglegroup2, );

    			destroy_component(togglegroup3, );
    		}
    	};
    }

    // (222:0) <Block>
    function create_default_slot_35(ctx) {
    	var t0, t1, t2, t3, t4, current;

    	var toggle0 = new Toggle({ $$inline: true });

    	var toggle1 = new Toggle({
    		props: { toggle: true, color: "#bb99dd" },
    		$$inline: true
    	});

    	var toggle2 = new Toggle({
    		props: { toggle: true, color: "#99aa33" },
    		$$inline: true
    	});

    	var toggle3 = new Toggle({
    		props: { toggle: true, color: "#88bbaa" },
    		$$inline: true
    	});

    	var toggle4 = new Toggle({
    		props: {
    		toggle: true,
    		color: "#88bbaa",
    		disabled: true
    	},
    		$$inline: true
    	});

    	var toggle5 = new Toggle({
    		props: {
    		toggle: false,
    		color: "#88bbaa",
    		disabled: true
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			toggle0.$$.fragment.c();
    			t0 = space();
    			toggle1.$$.fragment.c();
    			t1 = space();
    			toggle2.$$.fragment.c();
    			t2 = space();
    			toggle3.$$.fragment.c();
    			t3 = space();
    			toggle4.$$.fragment.c();
    			t4 = space();
    			toggle5.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(toggle0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(toggle1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(toggle2, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(toggle3, target, anchor);
    			insert(target, t3, anchor);
    			mount_component(toggle4, target, anchor);
    			insert(target, t4, anchor);
    			mount_component(toggle5, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle0.$$.fragment, local);

    			transition_in(toggle1.$$.fragment, local);

    			transition_in(toggle2.$$.fragment, local);

    			transition_in(toggle3.$$.fragment, local);

    			transition_in(toggle4.$$.fragment, local);

    			transition_in(toggle5.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(toggle0.$$.fragment, local);
    			transition_out(toggle1.$$.fragment, local);
    			transition_out(toggle2.$$.fragment, local);
    			transition_out(toggle3.$$.fragment, local);
    			transition_out(toggle4.$$.fragment, local);
    			transition_out(toggle5.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(toggle0, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(toggle1, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(toggle2, detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(toggle3, detaching);

    			if (detaching) {
    				detach(t3);
    			}

    			destroy_component(toggle4, detaching);

    			if (detaching) {
    				detach(t4);
    			}

    			destroy_component(toggle5, detaching);
    		}
    	};
    }

    // (233:0) <Block>
    function create_default_slot_34(ctx) {
    	var t, current;

    	var checkbox0 = new Checkbox({
    		props: { color: "#bbddaa" },
    		$$inline: true
    	});

    	var checkbox1 = new Checkbox({
    		props: { color: "#bbddaa", label: "Checkbox 02" },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			checkbox0.$$.fragment.c();
    			t = space();
    			checkbox1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(checkbox0, target, anchor);
    			insert(target, t, anchor);
    			mount_component(checkbox1, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox0.$$.fragment, local);

    			transition_in(checkbox1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(checkbox0.$$.fragment, local);
    			transition_out(checkbox1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(checkbox0, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(checkbox1, detaching);
    		}
    	};
    }

    // (246:8) <div slot="circle">
    function create_circle_slot_4(ctx) {
    	var div, current;

    	var check = new Check$1({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			check.$$.fragment.c();
    			attr(div, "slot", "circle");
    			add_location(div, file$k, 245, 8, 6429);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(check, div, null);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(check.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(check.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(check, );
    		}
    	};
    }

    // (250:10) {#each new Array(3).fill('') as elem, i}
    function create_each_block_4(ctx) {
    	var div, t0, t1, current;

    	var check = new Check$1({ $$inline: true });

    	var ripple = new Ripple({
    		props: { color: "#ffffff" },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			check.$$.fragment.c();
    			t0 = space();
    			ripple.$$.fragment.c();
    			t1 = space();
    			set_style(div, "fill", "white");
    			set_style(div, "cursor", "pointer");
    			add_location(div, file$k, 250, 12, 6582);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(check, div, null);
    			append(div, t0);
    			mount_component(ripple, div, null);
    			append(div, t1);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(check.$$.fragment, local);

    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(check.$$.fragment, local);
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(check, );

    			destroy_component(ripple, );
    		}
    	};
    }

    // (249:8) <div slot="elements">
    function create_elements_slot_4(ctx) {
    	var div, current;

    	var each_value_4 = new ctx.Array(3).fill('');

    	var each_blocks = [];

    	for (var i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			div = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div, "slot", "elements");
    			add_location(div, file$k, 248, 8, 6495);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.Array) {
    				each_value_4 = new ctx.Array(3).fill('');

    				for (var i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_4();
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_4.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (245:6) <CircleNavigation2 color={randomColor}>
    function create_default_slot_33(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (262:6) <div slot="circle">
    function create_circle_slot_3(ctx) {
    	var div, current;

    	var close = new Close({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			close.$$.fragment.c();
    			attr(div, "slot", "circle");
    			add_location(div, file$k, 261, 6, 6859);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(close, div, null);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(close.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(close.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(close, );
    		}
    	};
    }

    // (270:8) {#each Array.from({ length: 6 }, () => ({            icon: randomIcon()          })) as elem, i}
    function create_each_block_3(ctx) {
    	var div, t0, t1, current;

    	var switch_value = ctx.elem.icon;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	var ripple = new Ripple({
    		props: { color: "#000000" },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) switch_instance.$$.fragment.c();
    			t0 = space();
    			ripple.$$.fragment.c();
    			t1 = space();
    			attr(div, "class", "" + 'whiteIconCircle' + " svelte-1ode8p3");
    			add_location(div, file$k, 272, 10, 7166);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append(div, t0);
    			mount_component(ripple, div, null);
    			append(div, t1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (switch_value !== (switch_value = ctx.elem.icon)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, () => {
    						destroy_component(old_component);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t0);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_instance.$$.fragment, local);

    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (switch_instance) destroy_component(switch_instance, );

    			destroy_component(ripple, );
    		}
    	};
    }

    // (265:6) <div slot="elements">
    function create_elements_slot_3(ctx) {
    	var div0, div1, t0, t1, current;

    	var ripple = new Ripple({
    		props: { color: "#ffff00" },
    		$$inline: true
    	});

    	var each_value_3 = ctx.Array.from({ length: 6 }, ctx.func);

    	var each_blocks = [];

    	for (var i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			div0 = element("div");
    			div1 = element("div");
    			t0 = text("Right\r\n          ");
    			ripple.$$.fragment.c();
    			t1 = space();

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div1, "class", "" + 'buttonLabel' + " svelte-1ode8p3");
    			add_location(div1, file$k, 265, 8, 6950);
    			attr(div0, "slot", "elements");
    			add_location(div0, file$k, 264, 6, 6919);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, div1);
    			append(div1, t0);
    			mount_component(ripple, div1, null);
    			append(div0, t1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.Array) {
    				each_value_3 = ctx.Array.from({ length: 6 }, ctx.func);

    				for (var i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			for (var i = 0; i < each_value_3.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    			}

    			destroy_component(ripple, );

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (260:4) <CircleNavigation color={randomColor} direction="right">
    function create_default_slot_32(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (283:8) <div slot="circle">
    function create_circle_slot_2(ctx) {
    	var div, current;

    	var close = new Close({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			close.$$.fragment.c();
    			attr(div, "slot", "circle");
    			add_location(div, file$k, 282, 8, 7450);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(close, div, null);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(close.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(close.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(close, );
    		}
    	};
    }

    // (288:10) {#each Array.from({ length: 2 }, () => ({              icon: randomIcon()            })) as elem, i}
    function create_each_block_2(ctx) {
    	var div, t0, t1, current;

    	var switch_value = ctx.elem.icon;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	var ripple = new Ripple({
    		props: { color: "#000000" },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) switch_instance.$$.fragment.c();
    			t0 = space();
    			ripple.$$.fragment.c();
    			t1 = space();
    			attr(div, "class", "" + 'whiteIconCircle' + " svelte-1ode8p3");
    			add_location(div, file$k, 290, 12, 7711);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append(div, t0);
    			mount_component(ripple, div, null);
    			append(div, t1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (switch_value !== (switch_value = ctx.elem.icon)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, () => {
    						destroy_component(old_component);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t0);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_instance.$$.fragment, local);

    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (switch_instance) destroy_component(switch_instance, );

    			destroy_component(ripple, );
    		}
    	};
    }

    // (286:8) <div slot="elements">
    function create_elements_slot_2(ctx) {
    	var div0, div1, t_1, current;

    	var each_value_2 = ctx.Array.from({ length: 2 }, ctx.func_1);

    	var each_blocks = [];

    	for (var i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			div0 = element("div");
    			div1 = element("div");
    			div1.textContent = "Bot";
    			t_1 = space();

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div1, "class", "" + 'buttonLabel' + " svelte-1ode8p3");
    			add_location(div1, file$k, 286, 10, 7549);
    			attr(div0, "slot", "elements");
    			add_location(div0, file$k, 285, 8, 7516);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, div1);
    			append(div0, t_1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.Array) {
    				each_value_2 = ctx.Array.from({ length: 2 }, ctx.func_1);

    				for (var i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_2.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (282:6) <CircleNavigation color={randomColor} direction="bottom">
    function create_default_slot_31(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (300:8) <div slot="circle">
    function create_circle_slot_1(ctx) {
    	var div, current;

    	var close = new Close({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			close.$$.fragment.c();
    			attr(div, "slot", "circle");
    			add_location(div, file$k, 299, 8, 7993);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(close, div, null);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(close.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(close.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(close, );
    		}
    	};
    }

    // (305:10) {#each Array.from({ length: 2 }, () => ({              icon: randomIcon()            })) as elem, i}
    function create_each_block_1(ctx) {
    	var div, t0, t1, current;

    	var switch_value = ctx.elem.icon;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	var ripple = new Ripple({
    		props: { color: "#000000" },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) switch_instance.$$.fragment.c();
    			t0 = space();
    			ripple.$$.fragment.c();
    			t1 = space();
    			attr(div, "class", "" + 'whiteIconCircle' + " svelte-1ode8p3");
    			add_location(div, file$k, 307, 12, 8254);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append(div, t0);
    			mount_component(ripple, div, null);
    			append(div, t1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (switch_value !== (switch_value = ctx.elem.icon)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, () => {
    						destroy_component(old_component);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t0);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_instance.$$.fragment, local);

    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (switch_instance) destroy_component(switch_instance, );

    			destroy_component(ripple, );
    		}
    	};
    }

    // (303:8) <div slot="elements">
    function create_elements_slot_1(ctx) {
    	var div0, div1, t_1, current;

    	var each_value_1 = ctx.Array.from({ length: 2 }, ctx.func_2);

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			div0 = element("div");
    			div1 = element("div");
    			div1.textContent = "Top";
    			t_1 = space();

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div1, "class", "" + 'buttonLabel' + " svelte-1ode8p3");
    			add_location(div1, file$k, 303, 10, 8092);
    			attr(div0, "slot", "elements");
    			add_location(div0, file$k, 302, 8, 8059);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, div1);
    			append(div0, t_1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.Array) {
    				each_value_1 = ctx.Array.from({ length: 2 }, ctx.func_2);

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_1.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (299:6) <CircleNavigation color={randomColor} direction="top">
    function create_default_slot_30(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (317:6) <div slot="circle">
    function create_circle_slot(ctx) {
    	var div, current;

    	var close = new Close({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			close.$$.fragment.c();
    			attr(div, "slot", "circle");
    			add_location(div, file$k, 316, 6, 8543);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(close, div, null);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(close.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(close.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(close, );
    		}
    	};
    }

    // (322:8) {#each Array.from({ length: 8 }, () => ({            icon: randomIcon()          })) as elem, i}
    function create_each_block(ctx) {
    	var div, t0, t1, current;

    	var switch_value = ctx.elem.icon;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	var ripple = new Ripple({
    		props: { color: "#000000" },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) switch_instance.$$.fragment.c();
    			t0 = space();
    			ripple.$$.fragment.c();
    			t1 = space();
    			attr(div, "class", "" + 'whiteIconCircle' + " svelte-1ode8p3");
    			add_location(div, file$k, 324, 10, 8789);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append(div, t0);
    			mount_component(ripple, div, null);
    			append(div, t1);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (switch_value !== (switch_value = ctx.elem.icon)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, () => {
    						destroy_component(old_component);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t0);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_instance.$$.fragment, local);

    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (switch_instance) destroy_component(switch_instance, );

    			destroy_component(ripple, );
    		}
    	};
    }

    // (320:6) <div slot="elements">
    function create_elements_slot(ctx) {
    	var div0, div1, t_1, current;

    	var each_value = ctx.Array.from({ length: 8 }, ctx.func_3);

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			div0 = element("div");
    			div1 = element("div");
    			div1.textContent = "Left";
    			t_1 = space();

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div1, "class", "" + 'buttonLabel' + " svelte-1ode8p3");
    			add_location(div1, file$k, 320, 8, 8634);
    			attr(div0, "slot", "elements");
    			add_location(div0, file$k, 319, 6, 8603);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, div1);
    			append(div0, t_1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.Array) {
    				each_value = ctx.Array.from({ length: 8 }, ctx.func_3);

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (316:4) <CircleNavigation color={randomColor} direction="left">
    function create_default_slot_29(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (241:0) <Block>
    function create_default_slot_28(ctx) {
    	var div2, div0, t0, t1, div1, t2, t3, current;

    	var circlenavigation2 = new CircleNavigation2({
    		props: {
    		color: ctx.randomColor,
    		$$slots: {
    		default: [create_default_slot_33],
    		elements: [create_elements_slot_4],
    		circle: [create_circle_slot_4]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var circlenavigation0 = new CircleNavigation({
    		props: {
    		color: ctx.randomColor,
    		direction: "right",
    		$$slots: {
    		default: [create_default_slot_32],
    		elements: [create_elements_slot_3],
    		circle: [create_circle_slot_3]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var circlenavigation1 = new CircleNavigation({
    		props: {
    		color: ctx.randomColor,
    		direction: "bottom",
    		$$slots: {
    		default: [create_default_slot_31],
    		elements: [create_elements_slot_2],
    		circle: [create_circle_slot_2]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var circlenavigation2_1 = new CircleNavigation({
    		props: {
    		color: ctx.randomColor,
    		direction: "top",
    		$$slots: {
    		default: [create_default_slot_30],
    		elements: [create_elements_slot_1],
    		circle: [create_circle_slot_1]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var circlenavigation3 = new CircleNavigation({
    		props: {
    		color: ctx.randomColor,
    		direction: "left",
    		$$slots: {
    		default: [create_default_slot_29],
    		elements: [create_elements_slot],
    		circle: [create_circle_slot]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			circlenavigation2.$$.fragment.c();
    			t0 = space();
    			circlenavigation0.$$.fragment.c();
    			t1 = space();
    			div1 = element("div");
    			circlenavigation1.$$.fragment.c();
    			t2 = space();
    			circlenavigation2_1.$$.fragment.c();
    			t3 = space();
    			circlenavigation3.$$.fragment.c();
    			set_style(div0, "display", "none");
    			add_location(div0, file$k, 243, 4, 6345);
    			add_location(div1, file$k, 280, 4, 7370);
    			set_style(div2, "display", "flex");
    			set_style(div2, "position", "relative");
    			add_location(div2, file$k, 241, 2, 6291);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			mount_component(circlenavigation2, div0, null);
    			append(div2, t0);
    			mount_component(circlenavigation0, div2, null);
    			append(div2, t1);
    			append(div2, div1);
    			mount_component(circlenavigation1, div1, null);
    			append(div1, t2);
    			mount_component(circlenavigation2_1, div1, null);
    			append(div2, t3);
    			mount_component(circlenavigation3, div2, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var circlenavigation2_changes = {};
    			if (changed.randomColor) circlenavigation2_changes.color = ctx.randomColor;
    			if (changed.$$scope) circlenavigation2_changes.$$scope = { changed, ctx };
    			circlenavigation2.$set(circlenavigation2_changes);

    			var circlenavigation0_changes = {};
    			if (changed.randomColor) circlenavigation0_changes.color = ctx.randomColor;
    			if (changed.$$scope) circlenavigation0_changes.$$scope = { changed, ctx };
    			circlenavigation0.$set(circlenavigation0_changes);

    			var circlenavigation1_changes = {};
    			if (changed.randomColor) circlenavigation1_changes.color = ctx.randomColor;
    			if (changed.$$scope) circlenavigation1_changes.$$scope = { changed, ctx };
    			circlenavigation1.$set(circlenavigation1_changes);

    			var circlenavigation2_1_changes = {};
    			if (changed.randomColor) circlenavigation2_1_changes.color = ctx.randomColor;
    			if (changed.$$scope) circlenavigation2_1_changes.$$scope = { changed, ctx };
    			circlenavigation2_1.$set(circlenavigation2_1_changes);

    			var circlenavigation3_changes = {};
    			if (changed.randomColor) circlenavigation3_changes.color = ctx.randomColor;
    			if (changed.$$scope) circlenavigation3_changes.$$scope = { changed, ctx };
    			circlenavigation3.$set(circlenavigation3_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(circlenavigation2.$$.fragment, local);

    			transition_in(circlenavigation0.$$.fragment, local);

    			transition_in(circlenavigation1.$$.fragment, local);

    			transition_in(circlenavigation2_1.$$.fragment, local);

    			transition_in(circlenavigation3.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(circlenavigation2.$$.fragment, local);
    			transition_out(circlenavigation0.$$.fragment, local);
    			transition_out(circlenavigation1.$$.fragment, local);
    			transition_out(circlenavigation2_1.$$.fragment, local);
    			transition_out(circlenavigation3.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			destroy_component(circlenavigation2, );

    			destroy_component(circlenavigation0, );

    			destroy_component(circlenavigation1, );

    			destroy_component(circlenavigation2_1, );

    			destroy_component(circlenavigation3, );
    		}
    	};
    }

    // (341:4) <p slot="header">
    function create_header_slot(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "header";
    			attr(p, "slot", "header");
    			add_location(p, file$k, 340, 4, 9063);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (342:4) <p slot="body">
    function create_body_slot(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Body text";
    			attr(p, "slot", "body");
    			add_location(p, file$k, 341, 4, 9096);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (340:2) <Accordeon>
    function create_default_slot_27(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (339:0) <Block>
    function create_default_slot_26(ctx) {
    	var current;

    	var accordeon = new Accordeon({
    		props: {
    		$$slots: {
    		default: [create_default_slot_27],
    		body: [create_body_slot],
    		header: [create_header_slot]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			accordeon.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(accordeon, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var accordeon_changes = {};
    			if (changed.$$scope) accordeon_changes.$$scope = { changed, ctx };
    			accordeon.$set(accordeon_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordeon.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(accordeon.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(accordeon, detaching);
    		}
    	};
    }

    // (353:6) <Button color="#2a74e6" raised={true}>
    function create_default_slot_25(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: '#ffffff' },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n        Raised");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (357:6) <Button color="#2a74e6">
    function create_default_slot_24(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: '#ffffff' },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n        Flat");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (361:6) <Button color="#2a74e6" outlined={true}>
    function create_default_slot_23(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: '#3781b7' },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n        Outlined");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (365:6) <Button color="#2a74e6" simple={true}>
    function create_default_slot_22(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: '#3781b7' },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n        Simple");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (372:6) <Button color="#c12da0" disabled={true}>
    function create_default_slot_21(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: '#ffffff' },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n        Flat");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (376:6) <Button color={randomColor} outlined={true} disabled={true}>
    function create_default_slot_20(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: ctx.randomColor },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n        Outlined");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var ripple_changes = {};
    			if (changed.randomColor) ripple_changes.color = ctx.randomColor;
    			ripple.$set(ripple_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (380:6) <Button color={randomColor} simple={true} disabled={true}>
    function create_default_slot_19(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: ctx.randomColor },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n        Simple");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var ripple_changes = {};
    			if (changed.randomColor) ripple_changes.color = ctx.randomColor;
    			ripple.$set(ripple_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (386:6) <Button color="#333333" raised={true}>
    function create_default_slot_18(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: '#ffffff' },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n        Raised");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (390:6) <Button color="#333333">
    function create_default_slot_17(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: '#ffffff' },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n        Flat");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (394:6) <Button color="#333333" outlined={true}>
    function create_default_slot_16(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: '#3781b7' },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n        Outlined");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (398:6) <Button color="#333333" simple={true}>
    function create_default_slot_15(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: '#3781b7' },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n        Simple");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (404:6) <Button color={randomColor} size={'small'} raised={true}>
    function create_default_slot_14(ctx) {
    	var t, current;

    	var ripple = new Ripple({ $$inline: true });

    	return {
    		c: function create() {
    			t = text("Small\r\n        ");
    			ripple.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    			mount_component(ripple, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(ripple, detaching);
    		}
    	};
    }

    // (408:6) <Button color={randomColor} size={'medium'} raised={true}>
    function create_default_slot_13(ctx) {
    	var t, current;

    	var ripple = new Ripple({ $$inline: true });

    	return {
    		c: function create() {
    			t = text("Medium\r\n        ");
    			ripple.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    			mount_component(ripple, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(ripple, detaching);
    		}
    	};
    }

    // (412:6) <Button color={randomColor} size={'large'} raised={true}>
    function create_default_slot_12(ctx) {
    	var t, current;

    	var ripple = new Ripple({ $$inline: true });

    	return {
    		c: function create() {
    			t = text("Large\r\n        ");
    			ripple.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    			mount_component(ripple, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(ripple, detaching);
    		}
    	};
    }

    // (349:0) <Block>
    function create_default_slot_11(ctx) {
    	var div4, div0, t0, t1, t2, t3, div1, t4, t5, t6, div2, t7, t8, t9, t10, div3, t11, t12, current;

    	var button0 = new Button({
    		props: {
    		color: "#2a74e6",
    		raised: true,
    		$$slots: { default: [create_default_slot_25] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button1 = new Button({
    		props: {
    		color: "#2a74e6",
    		$$slots: { default: [create_default_slot_24] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button2 = new Button({
    		props: {
    		color: "#2a74e6",
    		outlined: true,
    		$$slots: { default: [create_default_slot_23] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button3 = new Button({
    		props: {
    		color: "#2a74e6",
    		simple: true,
    		$$slots: { default: [create_default_slot_22] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button4 = new Button({
    		props: {
    		color: "#c12da0",
    		disabled: true,
    		$$slots: { default: [create_default_slot_21] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button5 = new Button({
    		props: {
    		color: ctx.randomColor,
    		outlined: true,
    		disabled: true,
    		$$slots: { default: [create_default_slot_20] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button6 = new Button({
    		props: {
    		color: ctx.randomColor,
    		simple: true,
    		disabled: true,
    		$$slots: { default: [create_default_slot_19] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button7 = new Button({
    		props: {
    		color: "#333333",
    		raised: true,
    		$$slots: { default: [create_default_slot_18] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button8 = new Button({
    		props: {
    		color: "#333333",
    		$$slots: { default: [create_default_slot_17] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button9 = new Button({
    		props: {
    		color: "#333333",
    		outlined: true,
    		$$slots: { default: [create_default_slot_16] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button10 = new Button({
    		props: {
    		color: "#333333",
    		simple: true,
    		$$slots: { default: [create_default_slot_15] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button11 = new Button({
    		props: {
    		color: ctx.randomColor,
    		size: 'small',
    		raised: true,
    		$$slots: { default: [create_default_slot_14] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button12 = new Button({
    		props: {
    		color: ctx.randomColor,
    		size: 'medium',
    		raised: true,
    		$$slots: { default: [create_default_slot_13] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var button13 = new Button({
    		props: {
    		color: ctx.randomColor,
    		size: 'large',
    		raised: true,
    		$$slots: { default: [create_default_slot_12] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			button0.$$.fragment.c();
    			t0 = space();
    			button1.$$.fragment.c();
    			t1 = space();
    			button2.$$.fragment.c();
    			t2 = space();
    			button3.$$.fragment.c();
    			t3 = space();
    			div1 = element("div");
    			button4.$$.fragment.c();
    			t4 = space();
    			button5.$$.fragment.c();
    			t5 = space();
    			button6.$$.fragment.c();
    			t6 = space();
    			div2 = element("div");
    			button7.$$.fragment.c();
    			t7 = space();
    			button8.$$.fragment.c();
    			t8 = space();
    			button9.$$.fragment.c();
    			t9 = space();
    			button10.$$.fragment.c();
    			t10 = space();
    			div3 = element("div");
    			button11.$$.fragment.c();
    			t11 = space();
    			button12.$$.fragment.c();
    			t12 = space();
    			button13.$$.fragment.c();
    			add_location(div0, file$k, 351, 4, 9284);
    			add_location(div1, file$k, 370, 4, 9765);
    			add_location(div2, file$k, 384, 4, 10187);
    			add_location(div3, file$k, 402, 4, 10666);
    			set_style(div4, "flex-flow", "column");
    			add_location(div4, file$k, 350, 2, 9248);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div0);
    			mount_component(button0, div0, null);
    			append(div0, t0);
    			mount_component(button1, div0, null);
    			append(div0, t1);
    			mount_component(button2, div0, null);
    			append(div0, t2);
    			mount_component(button3, div0, null);
    			append(div4, t3);
    			append(div4, div1);
    			mount_component(button4, div1, null);
    			append(div1, t4);
    			mount_component(button5, div1, null);
    			append(div1, t5);
    			mount_component(button6, div1, null);
    			append(div4, t6);
    			append(div4, div2);
    			mount_component(button7, div2, null);
    			append(div2, t7);
    			mount_component(button8, div2, null);
    			append(div2, t8);
    			mount_component(button9, div2, null);
    			append(div2, t9);
    			mount_component(button10, div2, null);
    			append(div4, t10);
    			append(div4, div3);
    			mount_component(button11, div3, null);
    			append(div3, t11);
    			mount_component(button12, div3, null);
    			append(div3, t12);
    			mount_component(button13, div3, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var button0_changes = {};
    			if (changed.$$scope) button0_changes.$$scope = { changed, ctx };
    			button0.$set(button0_changes);

    			var button1_changes = {};
    			if (changed.$$scope) button1_changes.$$scope = { changed, ctx };
    			button1.$set(button1_changes);

    			var button2_changes = {};
    			if (changed.$$scope) button2_changes.$$scope = { changed, ctx };
    			button2.$set(button2_changes);

    			var button3_changes = {};
    			if (changed.$$scope) button3_changes.$$scope = { changed, ctx };
    			button3.$set(button3_changes);

    			var button4_changes = {};
    			if (changed.$$scope) button4_changes.$$scope = { changed, ctx };
    			button4.$set(button4_changes);

    			var button5_changes = {};
    			if (changed.randomColor) button5_changes.color = ctx.randomColor;
    			if (changed.$$scope || changed.randomColor) button5_changes.$$scope = { changed, ctx };
    			button5.$set(button5_changes);

    			var button6_changes = {};
    			if (changed.randomColor) button6_changes.color = ctx.randomColor;
    			if (changed.$$scope || changed.randomColor) button6_changes.$$scope = { changed, ctx };
    			button6.$set(button6_changes);

    			var button7_changes = {};
    			if (changed.$$scope) button7_changes.$$scope = { changed, ctx };
    			button7.$set(button7_changes);

    			var button8_changes = {};
    			if (changed.$$scope) button8_changes.$$scope = { changed, ctx };
    			button8.$set(button8_changes);

    			var button9_changes = {};
    			if (changed.$$scope) button9_changes.$$scope = { changed, ctx };
    			button9.$set(button9_changes);

    			var button10_changes = {};
    			if (changed.$$scope) button10_changes.$$scope = { changed, ctx };
    			button10.$set(button10_changes);

    			var button11_changes = {};
    			if (changed.randomColor) button11_changes.color = ctx.randomColor;
    			if (changed.$$scope) button11_changes.$$scope = { changed, ctx };
    			button11.$set(button11_changes);

    			var button12_changes = {};
    			if (changed.randomColor) button12_changes.color = ctx.randomColor;
    			if (changed.$$scope) button12_changes.$$scope = { changed, ctx };
    			button12.$set(button12_changes);

    			var button13_changes = {};
    			if (changed.randomColor) button13_changes.color = ctx.randomColor;
    			if (changed.$$scope) button13_changes.$$scope = { changed, ctx };
    			button13.$set(button13_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);

    			transition_in(button1.$$.fragment, local);

    			transition_in(button2.$$.fragment, local);

    			transition_in(button3.$$.fragment, local);

    			transition_in(button4.$$.fragment, local);

    			transition_in(button5.$$.fragment, local);

    			transition_in(button6.$$.fragment, local);

    			transition_in(button7.$$.fragment, local);

    			transition_in(button8.$$.fragment, local);

    			transition_in(button9.$$.fragment, local);

    			transition_in(button10.$$.fragment, local);

    			transition_in(button11.$$.fragment, local);

    			transition_in(button12.$$.fragment, local);

    			transition_in(button13.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			transition_out(button4.$$.fragment, local);
    			transition_out(button5.$$.fragment, local);
    			transition_out(button6.$$.fragment, local);
    			transition_out(button7.$$.fragment, local);
    			transition_out(button8.$$.fragment, local);
    			transition_out(button9.$$.fragment, local);
    			transition_out(button10.$$.fragment, local);
    			transition_out(button11.$$.fragment, local);
    			transition_out(button12.$$.fragment, local);
    			transition_out(button13.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div4);
    			}

    			destroy_component(button0, );

    			destroy_component(button1, );

    			destroy_component(button2, );

    			destroy_component(button3, );

    			destroy_component(button4, );

    			destroy_component(button5, );

    			destroy_component(button6, );

    			destroy_component(button7, );

    			destroy_component(button8, );

    			destroy_component(button9, );

    			destroy_component(button10, );

    			destroy_component(button11, );

    			destroy_component(button12, );

    			destroy_component(button13, );
    		}
    	};
    }

    // (422:2) <Button color={randomColor} on:click={setRandomColor} raised={true}>
    function create_default_slot_10(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: '#000000' },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			t = text("Random Color\r\n    ");
    			ripple.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    			mount_component(ripple, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(ripple, detaching);
    		}
    	};
    }

    // (427:2) <Button color={randomColor} on:click={setRandomColor} outlined={true}>
    function create_default_slot_9(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: ctx.randomColor },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n    Outlined");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var ripple_changes = {};
    			if (changed.randomColor) ripple_changes.color = ctx.randomColor;
    			ripple.$set(ripple_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (432:2) <Button color={randomColor} on:click={setRandomColor} simple={true}>
    function create_default_slot_8(ctx) {
    	var t, current;

    	var ripple = new Ripple({
    		props: { color: ctx.randomColor },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n    Simple");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var ripple_changes = {};
    			if (changed.randomColor) ripple_changes.color = ctx.randomColor;
    			ripple.$set(ripple_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (421:0) <Block>
    function create_default_slot_7(ctx) {
    	var t0, t1, current;

    	var button0 = new Button({
    		props: {
    		color: ctx.randomColor,
    		raised: true,
    		$$slots: { default: [create_default_slot_10] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button0.$on("click", ctx.setRandomColor);

    	var button1 = new Button({
    		props: {
    		color: ctx.randomColor,
    		outlined: true,
    		$$slots: { default: [create_default_slot_9] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button1.$on("click", ctx.setRandomColor);

    	var button2 = new Button({
    		props: {
    		color: ctx.randomColor,
    		simple: true,
    		$$slots: { default: [create_default_slot_8] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button2.$on("click", ctx.setRandomColor);

    	return {
    		c: function create() {
    			button0.$$.fragment.c();
    			t0 = space();
    			button1.$$.fragment.c();
    			t1 = space();
    			button2.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(button1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(button2, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var button0_changes = {};
    			if (changed.randomColor) button0_changes.color = ctx.randomColor;
    			if (changed.$$scope) button0_changes.$$scope = { changed, ctx };
    			button0.$set(button0_changes);

    			var button1_changes = {};
    			if (changed.randomColor) button1_changes.color = ctx.randomColor;
    			if (changed.$$scope || changed.randomColor) button1_changes.$$scope = { changed, ctx };
    			button1.$set(button1_changes);

    			var button2_changes = {};
    			if (changed.randomColor) button2_changes.color = ctx.randomColor;
    			if (changed.$$scope || changed.randomColor) button2_changes.$$scope = { changed, ctx };
    			button2.$set(button2_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);

    			transition_in(button1.$$.fragment, local);

    			transition_in(button2.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(button1, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(button2, detaching);
    		}
    	};
    }

    // (441:2) <Button color={randomColor}>
    function create_default_slot_6(ctx) {
    	var t, current;

    	var ripple = new Ripple({ $$inline: true });

    	return {
    		c: function create() {
    			ripple.$$.fragment.c();
    			t = text("\r\n    Button");
    		},

    		m: function mount(target, anchor) {
    			mount_component(ripple, target, anchor);
    			insert(target, t, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(ripple.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(ripple.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(ripple, detaching);

    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (440:0) <Block>
    function create_default_slot_5(ctx) {
    	var t0, div0, t1, div1, t2, div2, t3, div3, t4, t5, div4, t6, current;

    	var button = new Button({
    		props: {
    		color: ctx.randomColor,
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var ripple0 = new Ripple({
    		props: { color: '#bbdd33' },
    		$$inline: true
    	});

    	var ripple1 = new Ripple({
    		props: { color: '#bb00aa' },
    		$$inline: true
    	});

    	var ripple2 = new Ripple({
    		props: { color: "#000000" },
    		$$inline: true
    	});

    	var ripple3 = new Ripple({
    		props: { color: "#ff00bb" },
    		$$inline: true
    	});

    	var ripple4 = new Ripple({
    		props: { color: "#99abd2" },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			button.$$.fragment.c();
    			t0 = space();
    			div0 = element("div");
    			ripple0.$$.fragment.c();
    			t1 = space();
    			div1 = element("div");
    			ripple1.$$.fragment.c();
    			t2 = space();
    			div2 = element("div");
    			ripple2.$$.fragment.c();
    			t3 = space();
    			div3 = element("div");
    			t4 = text("+\r\n    ");
    			ripple3.$$.fragment.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = text("-\r\n    ");
    			ripple4.$$.fragment.c();
    			attr(div0, "class", "sheet svelte-1ode8p3");
    			add_location(div0, file$k, 444, 2, 11618);
    			attr(div1, "class", "sheet svelte-1ode8p3");
    			add_location(div1, file$k, 447, 2, 11685);
    			attr(div2, "class", "sheet svelte-1ode8p3");
    			add_location(div2, file$k, 450, 2, 11752);
    			attr(div3, "class", "circle svelte-1ode8p3");
    			add_location(div3, file$k, 453, 2, 11817);
    			attr(div4, "class", "circle svelte-1ode8p3");
    			add_location(div4, file$k, 457, 2, 11890);
    		},

    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div0, anchor);
    			mount_component(ripple0, div0, null);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			mount_component(ripple1, div1, null);
    			insert(target, t2, anchor);
    			insert(target, div2, anchor);
    			mount_component(ripple2, div2, null);
    			insert(target, t3, anchor);
    			insert(target, div3, anchor);
    			append(div3, t4);
    			mount_component(ripple3, div3, null);
    			insert(target, t5, anchor);
    			insert(target, div4, anchor);
    			append(div4, t6);
    			mount_component(ripple4, div4, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var button_changes = {};
    			if (changed.randomColor) button_changes.color = ctx.randomColor;
    			if (changed.$$scope) button_changes.$$scope = { changed, ctx };
    			button.$set(button_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			transition_in(ripple0.$$.fragment, local);

    			transition_in(ripple1.$$.fragment, local);

    			transition_in(ripple2.$$.fragment, local);

    			transition_in(ripple3.$$.fragment, local);

    			transition_in(ripple4.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(ripple0.$$.fragment, local);
    			transition_out(ripple1.$$.fragment, local);
    			transition_out(ripple2.$$.fragment, local);
    			transition_out(ripple3.$$.fragment, local);
    			transition_out(ripple4.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(button, detaching);

    			if (detaching) {
    				detach(t0);
    				detach(div0);
    			}

    			destroy_component(ripple0, );

    			if (detaching) {
    				detach(t1);
    				detach(div1);
    			}

    			destroy_component(ripple1, );

    			if (detaching) {
    				detach(t2);
    				detach(div2);
    			}

    			destroy_component(ripple2, );

    			if (detaching) {
    				detach(t3);
    				detach(div3);
    			}

    			destroy_component(ripple3, );

    			if (detaching) {
    				detach(t5);
    				detach(div4);
    			}

    			destroy_component(ripple4, );
    		}
    	};
    }

    // (468:0) <Block>
    function create_default_slot_4(ctx) {
    	var t0, t1, t2, t3, t4, current;

    	var textfield0 = new Textfield({
    		props: {
    		label: 'Simple',
    		name: "Name",
    		color: "#bb88dd",
    		variant: 'simple'
    	},
    		$$inline: true
    	});

    	var textfield1 = new Textfield({
    		props: {
    		label: 'Simple',
    		name: "Name",
    		color: "#bb88dd",
    		variant: 'simple',
    		helperText: ctx.helper01
    	},
    		$$inline: true
    	});
    	textfield1.$on("change", ctx.change_handler_4);

    	var textfield2 = new Textfield({
    		props: {
    		label: 'Simple',
    		name: "Name",
    		color: "#bb88dd",
    		variant: 'simple',
    		compact: true,
    		helperText: "Compact"
    	},
    		$$inline: true
    	});

    	var textfield3 = new Textfield({
    		props: {
    		label: 'Simple',
    		name: "Name",
    		color: "#bb88dd",
    		variant: 'simple',
    		error: true,
    		helperText: "Error"
    	},
    		$$inline: true
    	});

    	var textfield4 = new Textfield({
    		props: {
    		label: 'Simple',
    		name: "Name",
    		color: "#bb88dd",
    		variant: 'simple',
    		disabled: true,
    		helperText: "Disabled"
    	},
    		$$inline: true
    	});

    	var textfield5 = new Textfield({
    		props: {
    		label: 'Simple',
    		name: "Name",
    		color: "#bb88dd",
    		variant: 'simple',
    		multiline: true,
    		helperText: "Multiline"
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			textfield0.$$.fragment.c();
    			t0 = space();
    			textfield1.$$.fragment.c();
    			t1 = space();
    			textfield2.$$.fragment.c();
    			t2 = space();
    			textfield3.$$.fragment.c();
    			t3 = space();
    			textfield4.$$.fragment.c();
    			t4 = space();
    			textfield5.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(textfield0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(textfield1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(textfield2, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(textfield3, target, anchor);
    			insert(target, t3, anchor);
    			mount_component(textfield4, target, anchor);
    			insert(target, t4, anchor);
    			mount_component(textfield5, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var textfield1_changes = {};
    			if (changed.helper01) textfield1_changes.helperText = ctx.helper01;
    			textfield1.$set(textfield1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);

    			transition_in(textfield1.$$.fragment, local);

    			transition_in(textfield2.$$.fragment, local);

    			transition_in(textfield3.$$.fragment, local);

    			transition_in(textfield4.$$.fragment, local);

    			transition_in(textfield5.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			transition_out(textfield2.$$.fragment, local);
    			transition_out(textfield3.$$.fragment, local);
    			transition_out(textfield4.$$.fragment, local);
    			transition_out(textfield5.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(textfield0, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(textfield1, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(textfield2, detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(textfield3, detaching);

    			if (detaching) {
    				detach(t3);
    			}

    			destroy_component(textfield4, detaching);

    			if (detaching) {
    				detach(t4);
    			}

    			destroy_component(textfield5, detaching);
    		}
    	};
    }

    // (516:0) <Block>
    function create_default_slot_3(ctx) {
    	var t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, current;

    	var textfield0 = new Textfield({
    		props: {
    		label: 'Textfield',
    		name: "Name",
    		color: ctx.randomColor,
    		compact: false
    	},
    		$$inline: true
    	});

    	var textfield1 = new Textfield({
    		props: {
    		label: 'fixed width',
    		name: "Name",
    		color: ctx.randomColor,
    		compact: false,
    		style: "width:100px"
    	},
    		$$inline: true
    	});

    	var textfield2 = new Textfield({
    		props: {
    		label: 'very long test description of a label',
    		name: "Name",
    		color: ctx.randomColor,
    		compact: false
    	},
    		$$inline: true
    	});

    	var textfield3 = new Textfield({
    		props: {
    		label: 'Compact',
    		name: "Name",
    		color: ctx.randomColor,
    		compact: true
    	},
    		$$inline: true
    	});

    	var textfield4 = new Textfield({
    		props: {
    		label: 'Number',
    		type: "number",
    		name: "Name",
    		color: ctx.randomColor,
    		compact: false,
    		error: ctx.error12
    	},
    		$$inline: true
    	});

    	var textfield5 = new Textfield({
    		props: {
    		label: 'Date',
    		type: "date",
    		name: "Name",
    		color: ctx.randomColor,
    		compact: false,
    		error: ctx.error12
    	},
    		$$inline: true
    	});

    	var textfield6 = new Textfield({
    		props: {
    		label: 'Search',
    		type: "search",
    		name: "Name",
    		color: ctx.randomColor,
    		compact: false,
    		error: ctx.error12
    	},
    		$$inline: true
    	});

    	var textfield7 = new Textfield({
    		props: {
    		label: 'Password',
    		type: "search",
    		name: "Name",
    		color: ctx.randomColor,
    		compact: false,
    		error: ctx.error12
    	},
    		$$inline: true
    	});

    	var textfield8 = new Textfield({
    		props: {
    		label: 'Disabled',
    		name: "Name",
    		color: ctx.randomColor,
    		compact: false,
    		error: ctx.error12,
    		disabled: true
    	},
    		$$inline: true
    	});

    	var textfield9 = new Textfield({
    		props: {
    		label: "Name",
    		compact: true,
    		color: ctx.randomColor,
    		helperText: "Compact"
    	},
    		$$inline: true
    	});

    	var textfield10 = new Textfield({
    		props: {
    		label: "Password",
    		type: "password",
    		compact: true,
    		color: ctx.randomColor,
    		helperText: "Compact"
    	},
    		$$inline: true
    	});

    	var textfield11 = new Textfield({
    		props: {
    		label: "E-Mail",
    		compact: true,
    		color: ctx.randomColor,
    		helperText: "Compact"
    	},
    		$$inline: true
    	});

    	var textfield12 = new Textfield({
    		props: {
    		label: '100% width',
    		name: "Name",
    		color: ctx.randomColor,
    		compact: false,
    		style: "width:100%"
    	},
    		$$inline: true
    	});

    	var textfield13 = new Textfield({
    		props: {
    		label: 'Multiline',
    		name: "Name",
    		color: ctx.randomColor,
    		compact: false,
    		error: ctx.error12,
    		helperText: "Multiline",
    		multiline: true
    	},
    		$$inline: true
    	});

    	var textfield14 = new Textfield({
    		props: {
    		label: 'Outlined',
    		name: "Error",
    		color: ctx.randomColor,
    		compact: false,
    		error: true,
    		helperText: "Error"
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			textfield0.$$.fragment.c();
    			t0 = space();
    			textfield1.$$.fragment.c();
    			t1 = space();
    			textfield2.$$.fragment.c();
    			t2 = space();
    			textfield3.$$.fragment.c();
    			t3 = space();
    			textfield4.$$.fragment.c();
    			t4 = space();
    			textfield5.$$.fragment.c();
    			t5 = space();
    			textfield6.$$.fragment.c();
    			t6 = space();
    			textfield7.$$.fragment.c();
    			t7 = space();
    			textfield8.$$.fragment.c();
    			t8 = space();
    			textfield9.$$.fragment.c();
    			t9 = space();
    			textfield10.$$.fragment.c();
    			t10 = space();
    			textfield11.$$.fragment.c();
    			t11 = space();
    			textfield12.$$.fragment.c();
    			t12 = space();
    			textfield13.$$.fragment.c();
    			t13 = space();
    			textfield14.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(textfield0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(textfield1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(textfield2, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(textfield3, target, anchor);
    			insert(target, t3, anchor);
    			mount_component(textfield4, target, anchor);
    			insert(target, t4, anchor);
    			mount_component(textfield5, target, anchor);
    			insert(target, t5, anchor);
    			mount_component(textfield6, target, anchor);
    			insert(target, t6, anchor);
    			mount_component(textfield7, target, anchor);
    			insert(target, t7, anchor);
    			mount_component(textfield8, target, anchor);
    			insert(target, t8, anchor);
    			mount_component(textfield9, target, anchor);
    			insert(target, t9, anchor);
    			mount_component(textfield10, target, anchor);
    			insert(target, t10, anchor);
    			mount_component(textfield11, target, anchor);
    			insert(target, t11, anchor);
    			mount_component(textfield12, target, anchor);
    			insert(target, t12, anchor);
    			mount_component(textfield13, target, anchor);
    			insert(target, t13, anchor);
    			mount_component(textfield14, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var textfield0_changes = {};
    			if (changed.randomColor) textfield0_changes.color = ctx.randomColor;
    			textfield0.$set(textfield0_changes);

    			var textfield1_changes = {};
    			if (changed.randomColor) textfield1_changes.color = ctx.randomColor;
    			textfield1.$set(textfield1_changes);

    			var textfield2_changes = {};
    			if (changed.randomColor) textfield2_changes.color = ctx.randomColor;
    			textfield2.$set(textfield2_changes);

    			var textfield3_changes = {};
    			if (changed.randomColor) textfield3_changes.color = ctx.randomColor;
    			textfield3.$set(textfield3_changes);

    			var textfield4_changes = {};
    			if (changed.randomColor) textfield4_changes.color = ctx.randomColor;
    			if (changed.error12) textfield4_changes.error = ctx.error12;
    			textfield4.$set(textfield4_changes);

    			var textfield5_changes = {};
    			if (changed.randomColor) textfield5_changes.color = ctx.randomColor;
    			if (changed.error12) textfield5_changes.error = ctx.error12;
    			textfield5.$set(textfield5_changes);

    			var textfield6_changes = {};
    			if (changed.randomColor) textfield6_changes.color = ctx.randomColor;
    			if (changed.error12) textfield6_changes.error = ctx.error12;
    			textfield6.$set(textfield6_changes);

    			var textfield7_changes = {};
    			if (changed.randomColor) textfield7_changes.color = ctx.randomColor;
    			if (changed.error12) textfield7_changes.error = ctx.error12;
    			textfield7.$set(textfield7_changes);

    			var textfield8_changes = {};
    			if (changed.randomColor) textfield8_changes.color = ctx.randomColor;
    			if (changed.error12) textfield8_changes.error = ctx.error12;
    			textfield8.$set(textfield8_changes);

    			var textfield9_changes = {};
    			if (changed.randomColor) textfield9_changes.color = ctx.randomColor;
    			textfield9.$set(textfield9_changes);

    			var textfield10_changes = {};
    			if (changed.randomColor) textfield10_changes.color = ctx.randomColor;
    			textfield10.$set(textfield10_changes);

    			var textfield11_changes = {};
    			if (changed.randomColor) textfield11_changes.color = ctx.randomColor;
    			textfield11.$set(textfield11_changes);

    			var textfield12_changes = {};
    			if (changed.randomColor) textfield12_changes.color = ctx.randomColor;
    			textfield12.$set(textfield12_changes);

    			var textfield13_changes = {};
    			if (changed.randomColor) textfield13_changes.color = ctx.randomColor;
    			if (changed.error12) textfield13_changes.error = ctx.error12;
    			textfield13.$set(textfield13_changes);

    			var textfield14_changes = {};
    			if (changed.randomColor) textfield14_changes.color = ctx.randomColor;
    			textfield14.$set(textfield14_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);

    			transition_in(textfield1.$$.fragment, local);

    			transition_in(textfield2.$$.fragment, local);

    			transition_in(textfield3.$$.fragment, local);

    			transition_in(textfield4.$$.fragment, local);

    			transition_in(textfield5.$$.fragment, local);

    			transition_in(textfield6.$$.fragment, local);

    			transition_in(textfield7.$$.fragment, local);

    			transition_in(textfield8.$$.fragment, local);

    			transition_in(textfield9.$$.fragment, local);

    			transition_in(textfield10.$$.fragment, local);

    			transition_in(textfield11.$$.fragment, local);

    			transition_in(textfield12.$$.fragment, local);

    			transition_in(textfield13.$$.fragment, local);

    			transition_in(textfield14.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			transition_out(textfield2.$$.fragment, local);
    			transition_out(textfield3.$$.fragment, local);
    			transition_out(textfield4.$$.fragment, local);
    			transition_out(textfield5.$$.fragment, local);
    			transition_out(textfield6.$$.fragment, local);
    			transition_out(textfield7.$$.fragment, local);
    			transition_out(textfield8.$$.fragment, local);
    			transition_out(textfield9.$$.fragment, local);
    			transition_out(textfield10.$$.fragment, local);
    			transition_out(textfield11.$$.fragment, local);
    			transition_out(textfield12.$$.fragment, local);
    			transition_out(textfield13.$$.fragment, local);
    			transition_out(textfield14.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(textfield0, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(textfield1, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(textfield2, detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(textfield3, detaching);

    			if (detaching) {
    				detach(t3);
    			}

    			destroy_component(textfield4, detaching);

    			if (detaching) {
    				detach(t4);
    			}

    			destroy_component(textfield5, detaching);

    			if (detaching) {
    				detach(t5);
    			}

    			destroy_component(textfield6, detaching);

    			if (detaching) {
    				detach(t6);
    			}

    			destroy_component(textfield7, detaching);

    			if (detaching) {
    				detach(t7);
    			}

    			destroy_component(textfield8, detaching);

    			if (detaching) {
    				detach(t8);
    			}

    			destroy_component(textfield9, detaching);

    			if (detaching) {
    				detach(t9);
    			}

    			destroy_component(textfield10, detaching);

    			if (detaching) {
    				detach(t10);
    			}

    			destroy_component(textfield11, detaching);

    			if (detaching) {
    				detach(t11);
    			}

    			destroy_component(textfield12, detaching);

    			if (detaching) {
    				detach(t12);
    			}

    			destroy_component(textfield13, detaching);

    			if (detaching) {
    				detach(t13);
    			}

    			destroy_component(textfield14, detaching);
    		}
    	};
    }

    // (619:0) <Block>
    function create_default_slot_2(ctx) {
    	var t0, t1, t2, t3, t4, t5, t6, t7, current;

    	var textfield0 = new Textfield({
    		props: {
    		label: 'Filled',
    		name: "Name",
    		color: "#99bbee",
    		compact: true,
    		helperText: "Compact",
    		variant: 'filled'
    	},
    		$$inline: true
    	});

    	var textfield1 = new Textfield({
    		props: {
    		label: 'Filled',
    		name: "Name",
    		color: "#00aa88",
    		compact: false,
    		helperText: "Standard",
    		variant: 'filled'
    	},
    		$$inline: true
    	});

    	var textfield2 = new Textfield({
    		props: {
    		label: 'Error State',
    		name: "Name",
    		color: "#00aa88",
    		compact: false,
    		variant: 'filled',
    		error: true
    	},
    		$$inline: true
    	});

    	var textfield3 = new Textfield({
    		props: {
    		label: 'Error State',
    		name: "Name",
    		color: "#00aa88",
    		compact: false,
    		variant: 'filled',
    		error: true
    	},
    		$$inline: true
    	});

    	var textfield4 = new Textfield({
    		props: {
    		label: '< 8 chars allowed',
    		name: "Name",
    		color: "#99bbee",
    		compact: false,
    		variant: 'filled',
    		error: ctx.error12
    	},
    		$$inline: true
    	});
    	textfield4.$on("change", ctx.handleChange12);

    	var textfield5 = new Textfield({
    		props: {
    		label: '< 8 chars allowed',
    		name: "Name",
    		color: "#99bbee",
    		compact: false,
    		variant: 'filled',
    		helperText: ctx.helper12,
    		error: ctx.error12
    	},
    		$$inline: true
    	});

    	var textfield6 = new Textfield({
    		props: {
    		label: 'With Helper',
    		name: "Name",
    		color: "#99bbee",
    		compact: false,
    		variant: 'filled',
    		error: ctx.error12,
    		helperText: 'Helper Text'
    	},
    		$$inline: true
    	});

    	var textfield7 = new Textfield({
    		props: {
    		label: 'Filled',
    		name: "Name",
    		color: "#ff55aa",
    		compact: false,
    		error: ctx.error12,
    		disabled: true,
    		variant: 'filled',
    		helperText: "Disabled"
    	},
    		$$inline: true
    	});

    	var textfield8 = new Textfield({
    		props: {
    		label: 'Multiline',
    		name: "Name",
    		color: "#ff55aa",
    		compact: false,
    		error: ctx.error12,
    		variant: 'filled',
    		multiline: true,
    		helperText: "filled"
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			textfield0.$$.fragment.c();
    			t0 = space();
    			textfield1.$$.fragment.c();
    			t1 = space();
    			textfield2.$$.fragment.c();
    			t2 = space();
    			textfield3.$$.fragment.c();
    			t3 = space();
    			textfield4.$$.fragment.c();
    			t4 = space();
    			textfield5.$$.fragment.c();
    			t5 = space();
    			textfield6.$$.fragment.c();
    			t6 = space();
    			textfield7.$$.fragment.c();
    			t7 = space();
    			textfield8.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(textfield0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(textfield1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(textfield2, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(textfield3, target, anchor);
    			insert(target, t3, anchor);
    			mount_component(textfield4, target, anchor);
    			insert(target, t4, anchor);
    			mount_component(textfield5, target, anchor);
    			insert(target, t5, anchor);
    			mount_component(textfield6, target, anchor);
    			insert(target, t6, anchor);
    			mount_component(textfield7, target, anchor);
    			insert(target, t7, anchor);
    			mount_component(textfield8, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var textfield4_changes = {};
    			if (changed.error12) textfield4_changes.error = ctx.error12;
    			textfield4.$set(textfield4_changes);

    			var textfield5_changes = {};
    			if (changed.helper12) textfield5_changes.helperText = ctx.helper12;
    			if (changed.error12) textfield5_changes.error = ctx.error12;
    			textfield5.$set(textfield5_changes);

    			var textfield6_changes = {};
    			if (changed.error12) textfield6_changes.error = ctx.error12;
    			textfield6.$set(textfield6_changes);

    			var textfield7_changes = {};
    			if (changed.error12) textfield7_changes.error = ctx.error12;
    			textfield7.$set(textfield7_changes);

    			var textfield8_changes = {};
    			if (changed.error12) textfield8_changes.error = ctx.error12;
    			textfield8.$set(textfield8_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);

    			transition_in(textfield1.$$.fragment, local);

    			transition_in(textfield2.$$.fragment, local);

    			transition_in(textfield3.$$.fragment, local);

    			transition_in(textfield4.$$.fragment, local);

    			transition_in(textfield5.$$.fragment, local);

    			transition_in(textfield6.$$.fragment, local);

    			transition_in(textfield7.$$.fragment, local);

    			transition_in(textfield8.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			transition_out(textfield2.$$.fragment, local);
    			transition_out(textfield3.$$.fragment, local);
    			transition_out(textfield4.$$.fragment, local);
    			transition_out(textfield5.$$.fragment, local);
    			transition_out(textfield6.$$.fragment, local);
    			transition_out(textfield7.$$.fragment, local);
    			transition_out(textfield8.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(textfield0, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(textfield1, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(textfield2, detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(textfield3, detaching);

    			if (detaching) {
    				detach(t3);
    			}

    			destroy_component(textfield4, detaching);

    			if (detaching) {
    				detach(t4);
    			}

    			destroy_component(textfield5, detaching);

    			if (detaching) {
    				detach(t5);
    			}

    			destroy_component(textfield6, detaching);

    			if (detaching) {
    				detach(t6);
    			}

    			destroy_component(textfield7, detaching);

    			if (detaching) {
    				detach(t7);
    			}

    			destroy_component(textfield8, detaching);
    		}
    	};
    }

    // (701:0) <Block>
    function create_default_slot_1(ctx) {
    	var t0, t1, t2, t3, t4, current;

    	var textfield0 = new Textfield({
    		props: {
    		class: "customRounded",
    		style: ctx.customStyle1,
    		label: 'Outlined',
    		name: "Custom",
    		color: "#d88bb",
    		compact: false,
    		helperText: "Custom Shaped"
    	},
    		$$inline: true
    	});

    	var textfield1 = new Textfield({
    		props: {
    		class: "customRounded",
    		label: 'Outlined',
    		prepend: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`,
    		name: "Custom",
    		color: "#99aaff",
    		compact: true,
    		helperText: "Custom Shaped"
    	},
    		$$inline: true
    	});

    	var textfield2 = new Textfield({
    		props: {
    		class: "customSharpEdges",
    		label: 'Outlined',
    		prepend: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`,
    		name: "Custom",
    		color: "#ff99bb",
    		helperText: "Sharp Edges"
    	},
    		$$inline: true
    	});

    	var textfield3 = new Textfield({
    		props: {
    		class: "customFontsize",
    		label: 'Outlined',
    		prepend: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`,
    		name: "Custom",
    		color: "#ff99bb",
    		helperText: "Fontsize"
    	},
    		$$inline: true
    	});

    	var textfield4 = new Textfield({
    		props: {
    		class: "customFont",
    		label: 'Outlined',
    		prepend: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`,
    		name: "Custom",
    		color: "#bbddaa",
    		helperText: "Font"
    	},
    		$$inline: true
    	});

    	var textfield5 = new Textfield({
    		props: {
    		class: "customBackground",
    		label: 'Outlined',
    		prepend: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`,
    		name: "Custom",
    		color: "#bbddaa",
    		helperText: "Background"
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			textfield0.$$.fragment.c();
    			t0 = space();
    			textfield1.$$.fragment.c();
    			t1 = space();
    			textfield2.$$.fragment.c();
    			t2 = space();
    			textfield3.$$.fragment.c();
    			t3 = space();
    			textfield4.$$.fragment.c();
    			t4 = space();
    			textfield5.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(textfield0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(textfield1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(textfield2, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(textfield3, target, anchor);
    			insert(target, t3, anchor);
    			mount_component(textfield4, target, anchor);
    			insert(target, t4, anchor);
    			mount_component(textfield5, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var textfield0_changes = {};
    			if (changed.customStyle1) textfield0_changes.style = ctx.customStyle1;
    			textfield0.$set(textfield0_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);

    			transition_in(textfield1.$$.fragment, local);

    			transition_in(textfield2.$$.fragment, local);

    			transition_in(textfield3.$$.fragment, local);

    			transition_in(textfield4.$$.fragment, local);

    			transition_in(textfield5.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			transition_out(textfield2.$$.fragment, local);
    			transition_out(textfield3.$$.fragment, local);
    			transition_out(textfield4.$$.fragment, local);
    			transition_out(textfield5.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(textfield0, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(textfield1, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(textfield2, detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(textfield3, detaching);

    			if (detaching) {
    				detach(t3);
    			}

    			destroy_component(textfield4, detaching);

    			if (detaching) {
    				detach(t4);
    			}

    			destroy_component(textfield5, detaching);
    		}
    	};
    }

    // (755:0) <Block>
    function create_default_slot(ctx) {
    	var div, t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, current;

    	var textfield0 = new Textfield({
    		props: {
    		style: ctx.customStyle1,
    		label: 'Outlined',
    		name: "Custom",
    		color: "#99bbdd",
    		compact: false,
    		prepend: "$",
    		helperText: "Prepend"
    	},
    		$$inline: true
    	});

    	var textfield1 = new Textfield({
    		props: {
    		label: 'Outlined',
    		name: "Custom",
    		color: "#99bbdd",
    		compact: false,
    		append: "$$",
    		helperText: "Append"
    	},
    		$$inline: true
    	});

    	var textfield2 = new Textfield({
    		props: {
    		label: 'Filled',
    		name: "Custom",
    		color: "#99bbdd",
    		compact: false,
    		prepend: "¢",
    		append: "-Append-",
    		variant: "filled",
    		helperText: "Append/Prepend"
    	},
    		$$inline: true
    	});

    	var textfield3 = new Textfield({
    		props: {
    		label: 'Outlined',
    		name: "Custom",
    		color: "#bb99dd",
    		compact: true,
    		prepend: "$$$",
    		append: "¢¢¢",
    		helperText: "Compact"
    	},
    		$$inline: true
    	});

    	var textfield4 = new Textfield({
    		props: {
    		label: 'Filled',
    		name: "Custom",
    		color: "#aa2277",
    		compact: true,
    		error: true,
    		prepend: "$$$",
    		append: "$-8",
    		variant: "filled",
    		helperText: "Error"
    	},
    		$$inline: true
    	});

    	var textfield5 = new Textfield({
    		props: {
    		label: 'Simple',
    		name: "Custom",
    		color: "#99bbaa",
    		compact: false,
    		prepend: "¢¢¢",
    		append: "$",
    		variant: "simple",
    		helperText: "Simple"
    	},
    		$$inline: true
    	});

    	var textfield6 = new Textfield({
    		props: {
    		label: 'Simple',
    		name: "Custom",
    		color: "#33ddaa",
    		compact: true,
    		prepend: "¢¢¢¢",
    		append: "$$$$",
    		variant: "simple",
    		helperText: "Compact"
    	},
    		$$inline: true
    	});

    	var textfield7 = new Textfield({
    		props: {
    		label: 'Simple',
    		name: "Custom",
    		color: "#33ddaa",
    		compact: false,
    		prepend: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`,
    		append: "$",
    		variant: "filled",
    		helperText: "Icon"
    	},
    		$$inline: true
    	});

    	var textfield8 = new Textfield({
    		props: {
    		label: 'Simple',
    		name: "Custom",
    		color: "#33ddaa",
    		compact: false,
    		prepend: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`,
    		append: "$",
    		variant: "outlined",
    		helperText: "Icon"
    	},
    		$$inline: true
    	});

    	var textfield9 = new Textfield({
    		props: {
    		label: 'Simple',
    		name: "Custom",
    		color: "#33ddaa",
    		compact: false,
    		prepend: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`,
    		append: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    		variant: "outlined",
    		helperText: "2 Icons"
    	},
    		$$inline: true
    	});

    	var textfield10 = new Textfield({
    		props: {
    		label: 'Simple',
    		name: "Custom",
    		color: "#33ddaa",
    		compact: false,
    		prepend: `<div style="width:25px; height:25px; background:pink; border-radius:50px;"></div>`,
    		append: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    		variant: "outlined",
    		helperText: "Html"
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			textfield0.$$.fragment.c();
    			t0 = space();
    			textfield1.$$.fragment.c();
    			t1 = space();
    			textfield2.$$.fragment.c();
    			t2 = space();
    			textfield3.$$.fragment.c();
    			t3 = space();
    			textfield4.$$.fragment.c();
    			t4 = space();
    			textfield5.$$.fragment.c();
    			t5 = space();
    			textfield6.$$.fragment.c();
    			t6 = space();
    			textfield7.$$.fragment.c();
    			t7 = space();
    			textfield8.$$.fragment.c();
    			t8 = space();
    			textfield9.$$.fragment.c();
    			t9 = space();
    			textfield10.$$.fragment.c();
    			attr(div, "class", "testElement");
    			add_location(div, file$k, 756, 2, 19247);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(textfield0, div, null);
    			insert(target, t0, anchor);
    			mount_component(textfield1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(textfield2, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(textfield3, target, anchor);
    			insert(target, t3, anchor);
    			mount_component(textfield4, target, anchor);
    			insert(target, t4, anchor);
    			mount_component(textfield5, target, anchor);
    			insert(target, t5, anchor);
    			mount_component(textfield6, target, anchor);
    			insert(target, t6, anchor);
    			mount_component(textfield7, target, anchor);
    			insert(target, t7, anchor);
    			mount_component(textfield8, target, anchor);
    			insert(target, t8, anchor);
    			mount_component(textfield9, target, anchor);
    			insert(target, t9, anchor);
    			mount_component(textfield10, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var textfield0_changes = {};
    			if (changed.customStyle1) textfield0_changes.style = ctx.customStyle1;
    			textfield0.$set(textfield0_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);

    			transition_in(textfield1.$$.fragment, local);

    			transition_in(textfield2.$$.fragment, local);

    			transition_in(textfield3.$$.fragment, local);

    			transition_in(textfield4.$$.fragment, local);

    			transition_in(textfield5.$$.fragment, local);

    			transition_in(textfield6.$$.fragment, local);

    			transition_in(textfield7.$$.fragment, local);

    			transition_in(textfield8.$$.fragment, local);

    			transition_in(textfield9.$$.fragment, local);

    			transition_in(textfield10.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			transition_out(textfield2.$$.fragment, local);
    			transition_out(textfield3.$$.fragment, local);
    			transition_out(textfield4.$$.fragment, local);
    			transition_out(textfield5.$$.fragment, local);
    			transition_out(textfield6.$$.fragment, local);
    			transition_out(textfield7.$$.fragment, local);
    			transition_out(textfield8.$$.fragment, local);
    			transition_out(textfield9.$$.fragment, local);
    			transition_out(textfield10.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(textfield0, );

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(textfield1, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(textfield2, detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(textfield3, detaching);

    			if (detaching) {
    				detach(t3);
    			}

    			destroy_component(textfield4, detaching);

    			if (detaching) {
    				detach(t4);
    			}

    			destroy_component(textfield5, detaching);

    			if (detaching) {
    				detach(t5);
    			}

    			destroy_component(textfield6, detaching);

    			if (detaching) {
    				detach(t6);
    			}

    			destroy_component(textfield7, detaching);

    			if (detaching) {
    				detach(t7);
    			}

    			destroy_component(textfield8, detaching);

    			if (detaching) {
    				detach(t8);
    			}

    			destroy_component(textfield9, detaching);

    			if (detaching) {
    				detach(t9);
    			}

    			destroy_component(textfield10, detaching);
    		}
    	};
    }

    function create_fragment$k(ctx) {
    	var t0, h20, t2, t3, h21, t5, t6, h22, t8, t9, h23, t11, t12, h24, t14, t15, h25, t17, h30, t19, t20, h31, t22, t23, h26, t25, t26, h27, t28, h32, t30, t31, h33, t33, t34, h34, t36, t37, h35, t39, t40, h36, t42, current;

    	var button = new Button({
    		props: {
    		color: ctx.randomColor,
    		outlined: true,
    		$$slots: { default: [create_default_slot_46] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	button.$on("click", ctx.setRandomColor);

    	var block0 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_36] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block1 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_35] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block2 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_34] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block3 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_28] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block4 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_26] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block5 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_11] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block6 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block7 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block8 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block9 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block10 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block11 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block12 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			button.$$.fragment.c();
    			t0 = space();
    			h20 = element("h2");
    			h20.textContent = "Toggle Group";
    			t2 = space();
    			block0.$$.fragment.c();
    			t3 = space();
    			h21 = element("h2");
    			h21.textContent = "Toggle Buttons";
    			t5 = space();
    			block1.$$.fragment.c();
    			t6 = space();
    			h22 = element("h2");
    			h22.textContent = "Checkboxes";
    			t8 = space();
    			block2.$$.fragment.c();
    			t9 = space();
    			h23 = element("h2");
    			h23.textContent = "Circle Navigation";
    			t11 = space();
    			block3.$$.fragment.c();
    			t12 = space();
    			h24 = element("h2");
    			h24.textContent = "Accordeon";
    			t14 = space();
    			block4.$$.fragment.c();
    			t15 = space();
    			h25 = element("h2");
    			h25.textContent = "Buttons";
    			t17 = space();
    			h30 = element("h3");
    			h30.textContent = "Default, Outlined, Raised, Simple, Disabled, Sizes";
    			t19 = space();
    			block5.$$.fragment.c();
    			t20 = space();
    			h31 = element("h3");
    			h31.textContent = "Random Color";
    			t22 = space();
    			block6.$$.fragment.c();
    			t23 = space();
    			h26 = element("h2");
    			h26.textContent = "Ripple";
    			t25 = space();
    			block7.$$.fragment.c();
    			t26 = space();
    			h27 = element("h2");
    			h27.textContent = "Textfields";
    			t28 = space();
    			h32 = element("h3");
    			h32.textContent = "Simple";
    			t30 = space();
    			block8.$$.fragment.c();
    			t31 = space();
    			h33 = element("h3");
    			h33.textContent = "Outlined";
    			t33 = space();
    			block9.$$.fragment.c();
    			t34 = space();
    			h34 = element("h3");
    			h34.textContent = "Filled";
    			t36 = space();
    			block10.$$.fragment.c();
    			t37 = space();
    			h35 = element("h3");
    			h35.textContent = "Customized";
    			t39 = space();
    			block11.$$.fragment.c();
    			t40 = space();
    			h36 = element("h3");
    			h36.textContent = "Prepend / Append";
    			t42 = space();
    			block12.$$.fragment.c();
    			add_location(h20, file$k, 155, 0, 4124);
    			add_location(h21, file$k, 219, 0, 5807);
    			add_location(h22, file$k, 230, 0, 6120);
    			add_location(h23, file$k, 239, 0, 6252);
    			add_location(h24, file$k, 336, 0, 9013);
    			add_location(h25, file$k, 346, 0, 9156);
    			add_location(h30, file$k, 347, 0, 9174);
    			add_location(h31, file$k, 419, 0, 11060);
    			add_location(h26, file$k, 437, 0, 11515);
    			add_location(h27, file$k, 463, 0, 11973);
    			add_location(h32, file$k, 465, 0, 11996);
    			add_location(h33, file$k, 514, 0, 12919);
    			add_location(h34, file$k, 617, 0, 14941);
    			add_location(h35, file$k, 699, 0, 16512);
    			add_location(h36, file$k, 753, 0, 19207);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, h20, anchor);
    			insert(target, t2, anchor);
    			mount_component(block0, target, anchor);
    			insert(target, t3, anchor);
    			insert(target, h21, anchor);
    			insert(target, t5, anchor);
    			mount_component(block1, target, anchor);
    			insert(target, t6, anchor);
    			insert(target, h22, anchor);
    			insert(target, t8, anchor);
    			mount_component(block2, target, anchor);
    			insert(target, t9, anchor);
    			insert(target, h23, anchor);
    			insert(target, t11, anchor);
    			mount_component(block3, target, anchor);
    			insert(target, t12, anchor);
    			insert(target, h24, anchor);
    			insert(target, t14, anchor);
    			mount_component(block4, target, anchor);
    			insert(target, t15, anchor);
    			insert(target, h25, anchor);
    			insert(target, t17, anchor);
    			insert(target, h30, anchor);
    			insert(target, t19, anchor);
    			mount_component(block5, target, anchor);
    			insert(target, t20, anchor);
    			insert(target, h31, anchor);
    			insert(target, t22, anchor);
    			mount_component(block6, target, anchor);
    			insert(target, t23, anchor);
    			insert(target, h26, anchor);
    			insert(target, t25, anchor);
    			mount_component(block7, target, anchor);
    			insert(target, t26, anchor);
    			insert(target, h27, anchor);
    			insert(target, t28, anchor);
    			insert(target, h32, anchor);
    			insert(target, t30, anchor);
    			mount_component(block8, target, anchor);
    			insert(target, t31, anchor);
    			insert(target, h33, anchor);
    			insert(target, t33, anchor);
    			mount_component(block9, target, anchor);
    			insert(target, t34, anchor);
    			insert(target, h34, anchor);
    			insert(target, t36, anchor);
    			mount_component(block10, target, anchor);
    			insert(target, t37, anchor);
    			insert(target, h35, anchor);
    			insert(target, t39, anchor);
    			mount_component(block11, target, anchor);
    			insert(target, t40, anchor);
    			insert(target, h36, anchor);
    			insert(target, t42, anchor);
    			mount_component(block12, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var button_changes = {};
    			if (changed.randomColor) button_changes.color = ctx.randomColor;
    			if (changed.$$scope || changed.randomColor) button_changes.$$scope = { changed, ctx };
    			button.$set(button_changes);

    			var block0_changes = {};
    			if (changed.$$scope || changed.actives2 || changed.randomColor || changed.actives1 || changed.actives0 || changed.actives4) block0_changes.$$scope = { changed, ctx };
    			block0.$set(block0_changes);

    			var block1_changes = {};
    			if (changed.$$scope) block1_changes.$$scope = { changed, ctx };
    			block1.$set(block1_changes);

    			var block2_changes = {};
    			if (changed.$$scope) block2_changes.$$scope = { changed, ctx };
    			block2.$set(block2_changes);

    			var block3_changes = {};
    			if (changed.$$scope || changed.randomColor) block3_changes.$$scope = { changed, ctx };
    			block3.$set(block3_changes);

    			var block4_changes = {};
    			if (changed.$$scope) block4_changes.$$scope = { changed, ctx };
    			block4.$set(block4_changes);

    			var block5_changes = {};
    			if (changed.$$scope || changed.randomColor) block5_changes.$$scope = { changed, ctx };
    			block5.$set(block5_changes);

    			var block6_changes = {};
    			if (changed.$$scope || changed.randomColor) block6_changes.$$scope = { changed, ctx };
    			block6.$set(block6_changes);

    			var block7_changes = {};
    			if (changed.$$scope || changed.randomColor) block7_changes.$$scope = { changed, ctx };
    			block7.$set(block7_changes);

    			var block8_changes = {};
    			if (changed.$$scope || changed.helper01) block8_changes.$$scope = { changed, ctx };
    			block8.$set(block8_changes);

    			var block9_changes = {};
    			if (changed.$$scope || changed.randomColor || changed.error12) block9_changes.$$scope = { changed, ctx };
    			block9.$set(block9_changes);

    			var block10_changes = {};
    			if (changed.$$scope || changed.error12 || changed.helper12) block10_changes.$$scope = { changed, ctx };
    			block10.$set(block10_changes);

    			var block11_changes = {};
    			if (changed.$$scope) block11_changes.$$scope = { changed, ctx };
    			block11.$set(block11_changes);

    			var block12_changes = {};
    			if (changed.$$scope) block12_changes.$$scope = { changed, ctx };
    			block12.$set(block12_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			transition_in(block0.$$.fragment, local);

    			transition_in(block1.$$.fragment, local);

    			transition_in(block2.$$.fragment, local);

    			transition_in(block3.$$.fragment, local);

    			transition_in(block4.$$.fragment, local);

    			transition_in(block5.$$.fragment, local);

    			transition_in(block6.$$.fragment, local);

    			transition_in(block7.$$.fragment, local);

    			transition_in(block8.$$.fragment, local);

    			transition_in(block9.$$.fragment, local);

    			transition_in(block10.$$.fragment, local);

    			transition_in(block11.$$.fragment, local);

    			transition_in(block12.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(block0.$$.fragment, local);
    			transition_out(block1.$$.fragment, local);
    			transition_out(block2.$$.fragment, local);
    			transition_out(block3.$$.fragment, local);
    			transition_out(block4.$$.fragment, local);
    			transition_out(block5.$$.fragment, local);
    			transition_out(block6.$$.fragment, local);
    			transition_out(block7.$$.fragment, local);
    			transition_out(block8.$$.fragment, local);
    			transition_out(block9.$$.fragment, local);
    			transition_out(block10.$$.fragment, local);
    			transition_out(block11.$$.fragment, local);
    			transition_out(block12.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(button, detaching);

    			if (detaching) {
    				detach(t0);
    				detach(h20);
    				detach(t2);
    			}

    			destroy_component(block0, detaching);

    			if (detaching) {
    				detach(t3);
    				detach(h21);
    				detach(t5);
    			}

    			destroy_component(block1, detaching);

    			if (detaching) {
    				detach(t6);
    				detach(h22);
    				detach(t8);
    			}

    			destroy_component(block2, detaching);

    			if (detaching) {
    				detach(t9);
    				detach(h23);
    				detach(t11);
    			}

    			destroy_component(block3, detaching);

    			if (detaching) {
    				detach(t12);
    				detach(h24);
    				detach(t14);
    			}

    			destroy_component(block4, detaching);

    			if (detaching) {
    				detach(t15);
    				detach(h25);
    				detach(t17);
    				detach(h30);
    				detach(t19);
    			}

    			destroy_component(block5, detaching);

    			if (detaching) {
    				detach(t20);
    				detach(h31);
    				detach(t22);
    			}

    			destroy_component(block6, detaching);

    			if (detaching) {
    				detach(t23);
    				detach(h26);
    				detach(t25);
    			}

    			destroy_component(block7, detaching);

    			if (detaching) {
    				detach(t26);
    				detach(h27);
    				detach(t28);
    				detach(h32);
    				detach(t30);
    			}

    			destroy_component(block8, detaching);

    			if (detaching) {
    				detach(t31);
    				detach(h33);
    				detach(t33);
    			}

    			destroy_component(block9, detaching);

    			if (detaching) {
    				detach(t34);
    				detach(h34);
    				detach(t36);
    			}

    			destroy_component(block10, detaching);

    			if (detaching) {
    				detach(t37);
    				detach(h35);
    				detach(t39);
    			}

    			destroy_component(block11, detaching);

    			if (detaching) {
    				detach(t40);
    				detach(h36);
    				detach(t42);
    			}

    			destroy_component(block12, detaching);
    		}
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {

      let helper01 = "Test";

      let error12 = false;
      let helper12 = "";
      const handleChange12 = e => {
        let val = e.detail.target.value;
        if (val.length < 8) {
          $$invalidate('error12', error12 = false);
          $$invalidate('helper12', helper12 = "< 8 chars");
        } else {
          $$invalidate('error12', error12 = true);
          $$invalidate('helper12', helper12 = "!!more than 8 chars");
        }
      };
      let customStyle1 = ``;

      let randomColor = "#2a74e6";

      const setRandomColor = () => {
        //var c = randomHex();
        var c = colors[Math.round(Math.random() * colors.length)];
        $$invalidate('randomColor', randomColor = c);
      };

      const randomIcon = () => {
        const icons = [Check$1, Favorite, Phone, Star, Close];
        return randomPick(icons);
      };

      const randomPick = arr => {
        return arr[Math.floor(Math.random() * arr.length)];
      };

      let actives0 = [];
      let actives1 = [];
      let actives2 = [];
      let actives4 = [];

    	function change_handler(e) {
    	          actives4 = e.detail.actives; $$invalidate('actives4', actives4);
    	        }

    	function change_handler_1(e) {
    	          actives0 = e.detail.actives; $$invalidate('actives0', actives0);
    	        }

    	function change_handler_2(e) {
    	          actives1 = e.detail.actives; $$invalidate('actives1', actives1);
    	        }

    	function change_handler_3(e) {
    	          actives2 = e.detail.actives; $$invalidate('actives2', actives2);
    	        }

    	function func() {
    		return ({
    	          icon: randomIcon()
    	        });
    	}

    	function func_1() {
    		return ({
    	            icon: randomIcon()
    	          });
    	}

    	function func_2() {
    		return ({
    	            icon: randomIcon()
    	          });
    	}

    	function func_3() {
    		return ({
    	          icon: randomIcon()
    	        });
    	}

    	function change_handler_4(e) {
    	      helper01 = e.detail.target.value; $$invalidate('helper01', helper01);
    	    }

    	return {
    		helper01,
    		error12,
    		helper12,
    		handleChange12,
    		customStyle1,
    		randomColor,
    		setRandomColor,
    		randomIcon,
    		actives0,
    		actives1,
    		actives2,
    		actives4,
    		Array,
    		change_handler,
    		change_handler_1,
    		change_handler_2,
    		change_handler_3,
    		func,
    		func_1,
    		func_2,
    		func_3,
    		change_handler_4
    	};
    }

    class UiComponents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$k, safe_not_equal, []);
    	}
    }

    /* src\App.svelte generated by Svelte v3.5.4 */

    const file$l = "src\\App.svelte";

    // (78:0) <Screen>
    function create_default_slot$1(ctx) {
    	var current_1;

    	var uicomponents = new UiComponents({ $$inline: true });

    	return {
    		c: function create() {
    			uicomponents.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(uicomponents, target, anchor);
    			current_1 = true;
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(uicomponents.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(uicomponents.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(uicomponents, detaching);
    		}
    	};
    }

    function create_fragment$l(ctx) {
    	var div2, div1, div0, t, current_1;

    	var screen = new Screen({
    		props: {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			screen.$$.fragment.c();
    			attr(div0, "class", "toggleGroupOffset");
    			add_location(div0, file$l, 59, 2, 1222);
    			attr(div1, "class", "headbar-center svelte-iizxn5");
    			add_location(div1, file$l, 57, 1, 1188);
    			attr(div2, "class", "headbar svelte-iizxn5");
    			add_location(div2, file$l, 56, 0, 1164);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div1);
    			append(div1, div0);
    			insert(target, t, anchor);
    			mount_component(screen, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var screen_changes = {};
    			if (changed.$$scope) screen_changes.$$scope = { changed, ctx };
    			screen.$set(screen_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(screen.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(screen.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    				detach(t);
    			}

    			destroy_component(screen, detaching);
    		}
    	};
    }

    function instance$f($$self) {

    	return {};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$l, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

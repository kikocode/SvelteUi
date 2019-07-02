
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
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
    const outroing = new Set();
    let outros;
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

    /* src\Textfield\Textfield.svelte generated by Svelte v3.5.4 */

    const file = "src\\Textfield\\Textfield.svelte";

    // (402:4) {#if prepend}
    function create_if_block_3(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", "" + 'textfield__prepend' + " svelte-vy6b9i");
    			add_location(div, file, 402, 6, 11108);
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

    // (425:4) {:else}
    function create_else_block(ctx) {
    	var input, dispose;

    	return {
    		c: function create() {
    			input = element("input");
    			attr(input, "class", "textfield__input svelte-vy6b9i");
    			attr(input, "type", ctx.type);
    			input.value = ctx.name;
    			add_location(input, file, 425, 6, 11872);

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

    // (415:4) {#if multiline}
    function create_if_block_2(ctx) {
    	var textarea, dispose;

    	return {
    		c: function create() {
    			textarea = element("textarea");
    			attr(textarea, "class", "textfield__input svelte-vy6b9i");
    			attr(textarea, "type", ctx.type);
    			textarea.value = ctx.name;
    			add_location(textarea, file, 415, 6, 11603);

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

    // (436:4) {#if append}
    function create_if_block_1(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "class", "" + 'textfield__append' + " svelte-vy6b9i");
    			add_location(div, file, 436, 6, 12154);
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

    // (442:2) {#if helperText}
    function create_if_block(ctx) {
    	var div, t;

    	return {
    		c: function create() {
    			div = element("div");
    			t = text(ctx.helperText);
    			attr(div, "class", "textfield__helper__text svelte-vy6b9i");
    			add_location(div, file, 442, 4, 12294);
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

    function create_fragment(ctx) {
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
    			attr(div0, "class", "textfield__border__start textfield__border__segment svelte-vy6b9i");
    			add_location(div0, file, 408, 6, 11262);
    			attr(div1, "class", "textfield__label svelte-vy6b9i");
    			add_location(div1, file, 410, 8, 11410);
    			attr(div2, "class", "textfield__border__gap textfield__border__segment svelte-vy6b9i");
    			add_location(div2, file, 409, 6, 11337);
    			attr(div3, "class", "textfield__border__end textfield__border__segment svelte-vy6b9i");
    			add_location(div3, file, 412, 6, 11497);
    			attr(div4, "class", "textfield__border svelte-vy6b9i");
    			add_location(div4, file, 407, 4, 11223);
    			attr(div5, "class", "textfield__element svelte-vy6b9i");
    			add_location(div5, file, 400, 2, 11049);
    			attr(div6, "class", div6_class_value = "" + ('textfield ' + ctx.textfieldClasses) + " svelte-vy6b9i");
    			attr(div6, "style", ctx.textfieldStyle);
    			add_location(div6, file, 399, 0, 10977);
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

    			if ((changed.textfieldClasses) && div6_class_value !== (div6_class_value = "" + ('textfield ' + ctx.textfieldClasses) + " svelte-vy6b9i")) {
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

    function instance($$self, $$props, $$invalidate) {
    	

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

        console.log("label width", labelWidth);
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
    		init(this, options, instance, create_fragment, safe_not_equal, ["name", "label", "variant", "compact", "error", "disabled", "multiline", "color", "helperText", "type", "append", "prepend", "style", "class"]);
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

    /* src\Toggle\Toggle.svelte generated by Svelte v3.5.4 */

    const file$1 = "src\\Toggle\\Toggle.svelte";

    function create_fragment$1(ctx) {
    	var div2, div1, div0, div2_class_value, dispose;

    	return {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			attr(div0, "class", "grabber svelte-1dtqzl");
    			add_location(div0, file$1, 59, 4, 1273);
    			attr(div1, "class", "bg svelte-1dtqzl");
    			add_location(div1, file$1, 58, 2, 1251);
    			attr(div2, "class", div2_class_value = "" + ('toggle ' + ctx.toggleClasses) + " svelte-1dtqzl");
    			attr(div2, "style", ctx.toggleStyle);
    			add_location(div2, file$1, 53, 0, 1154);
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
    			if ((changed.toggleClasses) && div2_class_value !== (div2_class_value = "" + ('toggle ' + ctx.toggleClasses) + " svelte-1dtqzl")) {
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { toggle = false, color = "#333333" } = $$props;

      const handleClick = () => {
        $$invalidate('toggle', toggle = !toggle);
      };

    	const writable_props = ['toggle', 'color'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Toggle> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('toggle' in $$props) $$invalidate('toggle', toggle = $$props.toggle);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    	};

    	let toggleClass, toggleClasses, toggleStyle;

    	$$self.$$.update = ($$dirty = { toggle: 1, toggleClass: 1, color: 1 }) => {
    		if ($$dirty.toggle) { $$invalidate('toggleClass', toggleClass = toggle ? "toggled" : ""); }
    		if ($$dirty.toggleClass) { $$invalidate('toggleClasses', toggleClasses = `${toggleClass}`); }
    		if ($$dirty.color) { $$invalidate('toggleStyle', toggleStyle = `
    --primary-color: ${color};
  `); }
    	};

    	return {
    		toggle,
    		color,
    		handleClick,
    		toggleClasses,
    		toggleStyle
    	};
    }

    class Toggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["toggle", "color"]);
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
    }

    /* src\Checkbox\Checkbox.svelte generated by Svelte v3.5.4 */

    const file$2 = "src\\Checkbox\\Checkbox.svelte";

    // (53:4) {#if label}
    function create_if_block$1(ctx) {
    	var div, t;

    	return {
    		c: function create() {
    			div = element("div");
    			t = text(ctx.label);
    			attr(div, "class", "label svelte-1ubm04j");
    			add_location(div, file$2, 53, 6, 1214);
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

    function create_fragment$2(ctx) {
    	var div2, label_1, input, t0, div1, div0, t1, div2_class_value, dispose;

    	var if_block = (ctx.label) && create_if_block$1(ctx);

    	return {
    		c: function create() {
    			div2 = element("div");
    			label_1 = element("label");
    			input = element("input");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t1 = space();
    			if (if_block) if_block.c();
    			attr(input, "id", ctx.id);
    			attr(input, "class", "input svelte-1ubm04j");
    			attr(input, "type", "checkbox");
    			add_location(input, file$2, 48, 4, 1066);
    			attr(div0, "class", "checker svelte-1ubm04j");
    			add_location(div0, file$2, 50, 6, 1154);
    			attr(div1, "class", "box svelte-1ubm04j");
    			add_location(div1, file$2, 49, 4, 1129);
    			attr(label_1, "class", "field svelte-1ubm04j");
    			attr(label_1, "for", ctx.id);
    			add_location(label_1, file$2, 47, 2, 1030);
    			attr(div2, "class", div2_class_value = "" + ('checkbox ' + ctx.checkboxClasses) + " svelte-1ubm04j");
    			add_location(div2, file$2, 46, 0, 983);
    			dispose = listen(input, "change", ctx.input_change_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, label_1);
    			append(label_1, input);

    			input.checked = ctx.checked;

    			append(label_1, t0);
    			append(label_1, div1);
    			append(div1, div0);
    			append(label_1, t1);
    			if (if_block) if_block.m(label_1, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.checked) input.checked = ctx.checked;

    			if (changed.id) {
    				attr(input, "id", ctx.id);
    			}

    			if (ctx.label) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(label_1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (changed.id) {
    				attr(label_1, "for", ctx.id);
    			}

    			if ((changed.checkboxClasses) && div2_class_value !== (div2_class_value = "" + ('checkbox ' + ctx.checkboxClasses) + " svelte-1ubm04j")) {
    				attr(div2, "class", div2_class_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    			}

    			if (if_block) if_block.d();
    			dispose();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { checked = false, label = "", id = "checkbox" + Math.round(Math.random() * 95002000) } = $$props;

    	const writable_props = ['checked', 'label', 'id'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate('checked', checked);
    	}

    	$$self.$set = $$props => {
    		if ('checked' in $$props) $$invalidate('checked', checked = $$props.checked);
    		if ('label' in $$props) $$invalidate('label', label = $$props.label);
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    	};

    	let checkedClass, checkboxClasses;

    	$$self.$$.update = ($$dirty = { checked: 1, checkedClass: 1 }) => {
    		if ($$dirty.checked) { $$invalidate('checkedClass', checkedClass = checked ? "checked" : ""); }
    		if ($$dirty.checkedClass) { $$invalidate('checkboxClasses', checkboxClasses = `${checkedClass}`); }
    	};

    	return {
    		checked,
    		label,
    		id,
    		checkboxClasses,
    		input_change_handler
    	};
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["checked", "label", "id"]);
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

    	get id() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Button\Button.svelte generated by Svelte v3.5.4 */

    const file$3 = "src\\Button\\Button.svelte";

    function create_fragment$3(ctx) {
    	var div, t, div_class_value, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			t = text(ctx.text);
    			attr(div, "class", div_class_value = "" + ('button ' + ctx.buttonClasses) + " svelte-23e27f");
    			add_location(div, file$3, 103, 0, 2788);

    			dispose = [
    				listen(div, "mousedown", ctx.handleMouseDown),
    				listen(div, "mouseup", ctx.handleMouseUp)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    			add_binding_callback(() => ctx.div_binding(div, null));
    		},

    		p: function update(changed, ctx) {
    			if (changed.text) {
    				set_data(t, ctx.text);
    			}

    			if (changed.items) {
    				ctx.div_binding(null, div);
    				ctx.div_binding(div, null);
    			}

    			if ((changed.buttonClasses) && div_class_value !== (div_class_value = "" + ('button ' + ctx.buttonClasses) + " svelte-23e27f")) {
    				attr(div, "class", div_class_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			ctx.div_binding(null, div);
    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { text = "" } = $$props;

      let buttonRef;

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
        let ripple = document.createElement("div");

        ripple.style = `
			left: ${x - diameter / 2}px;
			top: ${y - diameter / 2}px;
			width: ${diameter}px;
			height: ${diameter}px;
		`;
        ripple.className = "ripple";
        e.target.appendChild(ripple);

        setTimeout(function() {
          ripple.classList.add("ripple--held");
        }, 0);

        setTimeout(function() {
          if (ripple.classList.contains("ripple--held")) return;
          ripple.classList.add("ripple--done");
          setTimeout(() => {
            ripple.parentNode.removeChild(ripple);
          }, 400);
        }, 400);
      };

      const handleMouseUp = e => {
        console.log("mouse up ", e.target.getElementsByClassName("ripple"));

        var ripples = e.target.querySelectorAll(".ripple");
        var previousRipple = ripples[ripples.length - 1];
        previousRipple.classList.remove("ripple--held");

        previousRipple.classList.add("ripple--done");
        setTimeout(() => {
          previousRipple.parentNode.removeChild(previousRipple);
        }, 400);
      };

    	const writable_props = ['text'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$node, check) {
    		buttonRef = $$node;
    		$$invalidate('buttonRef', buttonRef);
    	}

    	$$self.$set = $$props => {
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    	};

    	let buttonClasses;

    	$$invalidate('buttonClasses', buttonClasses = ``);

    	return {
    		text,
    		buttonRef,
    		handleMouseDown,
    		handleMouseUp,
    		buttonClasses,
    		div_binding
    	};
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["text"]);
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Layout\Block.svelte generated by Svelte v3.5.4 */

    const file$4 = "src\\Layout\\Block.svelte";

    function create_fragment$4(ctx) {
    	var div, current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			attr(div, "class", "block svelte-fu1j38");
    			add_location(div, file$4, 9, 0, 157);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { $$slots, $$scope };
    }

    class Block extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src\UIComponents.svelte generated by Svelte v3.5.4 */

    const file$5 = "src\\UIComponents.svelte";

    // (59:0) <Block>
    function create_default_slot_7(ctx) {
    	var current;

    	var button = new Button({
    		props: { text: "Button 01" },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			button.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};
    }

    // (65:0) <Block>
    function create_default_slot_6(ctx) {
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

    // (74:0) <Block>
    function create_default_slot_5(ctx) {
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
    	textfield1.$on("change", ctx.change_handler);

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

    // (122:0) <Block>
    function create_default_slot_4(ctx) {
    	var t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, current;

    	var textfield0 = new Textfield({
    		props: {
    		label: 'Textfield',
    		name: "Name",
    		color: "#bb88dd",
    		compact: false
    	},
    		$$inline: true
    	});

    	var textfield1 = new Textfield({
    		props: {
    		label: 'fixed width',
    		name: "Name",
    		color: "#bb88dd",
    		compact: false,
    		style: "width:100px"
    	},
    		$$inline: true
    	});

    	var textfield2 = new Textfield({
    		props: {
    		label: 'very long test description of a label',
    		name: "Name",
    		color: "#00aa88",
    		compact: false
    	},
    		$$inline: true
    	});

    	var textfield3 = new Textfield({
    		props: {
    		label: 'Compact',
    		name: "Name",
    		color: "#00aa88",
    		compact: true
    	},
    		$$inline: true
    	});

    	var textfield4 = new Textfield({
    		props: {
    		label: 'Number',
    		type: "number",
    		name: "Name",
    		color: "#99bbee",
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
    		color: "#99bbee",
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
    		color: "#99bbee",
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
    		color: "#99bbee",
    		compact: false,
    		error: ctx.error12
    	},
    		$$inline: true
    	});

    	var textfield8 = new Textfield({
    		props: {
    		label: 'Disabled',
    		name: "Name",
    		color: "#ff55aa",
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
    		color: "#ff99bb",
    		helperText: "Compact"
    	},
    		$$inline: true
    	});

    	var textfield10 = new Textfield({
    		props: {
    		label: "Password",
    		type: "password",
    		compact: true,
    		helperText: "Compact"
    	},
    		$$inline: true
    	});

    	var textfield11 = new Textfield({
    		props: {
    		label: "E-Mail",
    		compact: true,
    		helperText: "Compact"
    	},
    		$$inline: true
    	});

    	var textfield12 = new Textfield({
    		props: {
    		label: '100% width',
    		name: "Name",
    		color: "#bb88dd",
    		compact: false,
    		style: "width:100%"
    	},
    		$$inline: true
    	});

    	var textfield13 = new Textfield({
    		props: {
    		label: 'Multiline',
    		name: "Name",
    		color: "#ff55aa",
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
    		color: "#bb88dd",
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
    			var textfield4_changes = {};
    			if (changed.error12) textfield4_changes.error = ctx.error12;
    			textfield4.$set(textfield4_changes);

    			var textfield5_changes = {};
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

    			var textfield13_changes = {};
    			if (changed.error12) textfield13_changes.error = ctx.error12;
    			textfield13.$set(textfield13_changes);
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

    // (212:0) <Block>
    function create_default_slot_3(ctx) {
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

    // (294:0) <Block>
    function create_default_slot_2(ctx) {
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

    // (348:0) <Block>
    function create_default_slot_1(ctx) {
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
    			add_location(div, file$5, 349, 2, 8869);
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

    // (463:0) <Block>
    function create_default_slot(ctx) {
    	var t0, t1, t2, current;

    	var toggle0 = new Toggle({ $$inline: true });

    	var toggle1 = new Toggle({
    		props: {
    		toggle: true,
    		color: "#bb99dd"
    	},
    		$$inline: true
    	});

    	var toggle2 = new Toggle({
    		props: {
    		toggle: true,
    		color: "#99aa33"
    	},
    		$$inline: true
    	});

    	var toggle3 = new Toggle({
    		props: {
    		toggle: true,
    		color: "#88bbaa"
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
    		},

    		m: function mount(target, anchor) {
    			mount_component(toggle0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(toggle1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(toggle2, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(toggle3, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle0.$$.fragment, local);

    			transition_in(toggle1.$$.fragment, local);

    			transition_in(toggle2.$$.fragment, local);

    			transition_in(toggle3.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(toggle0.$$.fragment, local);
    			transition_out(toggle1.$$.fragment, local);
    			transition_out(toggle2.$$.fragment, local);
    			transition_out(toggle3.$$.fragment, local);
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
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	var h20, t1, t2, h21, t4, t5, h22, t7, h30, t9, t10, h31, t12, t13, h32, t15, t16, h33, t18, t19, h34, t21, t22, h23, t24, current;

    	var block0 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block1 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block2 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block3 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block4 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block5 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block6 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var block7 = new Block({
    		props: {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			h20 = element("h2");
    			h20.textContent = "Buttons";
    			t1 = space();
    			block0.$$.fragment.c();
    			t2 = space();
    			h21 = element("h2");
    			h21.textContent = "Checkboxes";
    			t4 = space();
    			block1.$$.fragment.c();
    			t5 = space();
    			h22 = element("h2");
    			h22.textContent = "Textfields";
    			t7 = space();
    			h30 = element("h3");
    			h30.textContent = "Simple";
    			t9 = space();
    			block2.$$.fragment.c();
    			t10 = space();
    			h31 = element("h3");
    			h31.textContent = "Outlined";
    			t12 = space();
    			block3.$$.fragment.c();
    			t13 = space();
    			h32 = element("h3");
    			h32.textContent = "Filled";
    			t15 = space();
    			block4.$$.fragment.c();
    			t16 = space();
    			h33 = element("h3");
    			h33.textContent = "Customized";
    			t18 = space();
    			block5.$$.fragment.c();
    			t19 = space();
    			h34 = element("h3");
    			h34.textContent = "Prepend / Append";
    			t21 = space();
    			block6.$$.fragment.c();
    			t22 = space();
    			h23 = element("h2");
    			h23.textContent = "Toggle Buttons";
    			t24 = space();
    			block7.$$.fragment.c();
    			add_location(h20, file$5, 56, 0, 1552);
    			add_location(h21, file$5, 62, 0, 1624);
    			add_location(h22, file$5, 69, 0, 1752);
    			add_location(h30, file$5, 71, 0, 1775);
    			add_location(h31, file$5, 120, 0, 2698);
    			add_location(h32, file$5, 210, 0, 4563);
    			add_location(h33, file$5, 292, 0, 6134);
    			add_location(h34, file$5, 346, 0, 8829);
    			add_location(h23, file$5, 460, 0, 12630);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, h20, anchor);
    			insert(target, t1, anchor);
    			mount_component(block0, target, anchor);
    			insert(target, t2, anchor);
    			insert(target, h21, anchor);
    			insert(target, t4, anchor);
    			mount_component(block1, target, anchor);
    			insert(target, t5, anchor);
    			insert(target, h22, anchor);
    			insert(target, t7, anchor);
    			insert(target, h30, anchor);
    			insert(target, t9, anchor);
    			mount_component(block2, target, anchor);
    			insert(target, t10, anchor);
    			insert(target, h31, anchor);
    			insert(target, t12, anchor);
    			mount_component(block3, target, anchor);
    			insert(target, t13, anchor);
    			insert(target, h32, anchor);
    			insert(target, t15, anchor);
    			mount_component(block4, target, anchor);
    			insert(target, t16, anchor);
    			insert(target, h33, anchor);
    			insert(target, t18, anchor);
    			mount_component(block5, target, anchor);
    			insert(target, t19, anchor);
    			insert(target, h34, anchor);
    			insert(target, t21, anchor);
    			mount_component(block6, target, anchor);
    			insert(target, t22, anchor);
    			insert(target, h23, anchor);
    			insert(target, t24, anchor);
    			mount_component(block7, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var block0_changes = {};
    			if (changed.$$scope) block0_changes.$$scope = { changed, ctx };
    			block0.$set(block0_changes);

    			var block1_changes = {};
    			if (changed.$$scope) block1_changes.$$scope = { changed, ctx };
    			block1.$set(block1_changes);

    			var block2_changes = {};
    			if (changed.$$scope || changed.helper01) block2_changes.$$scope = { changed, ctx };
    			block2.$set(block2_changes);

    			var block3_changes = {};
    			if (changed.$$scope || changed.error12) block3_changes.$$scope = { changed, ctx };
    			block3.$set(block3_changes);

    			var block4_changes = {};
    			if (changed.$$scope || changed.error12 || changed.helper12) block4_changes.$$scope = { changed, ctx };
    			block4.$set(block4_changes);

    			var block5_changes = {};
    			if (changed.$$scope) block5_changes.$$scope = { changed, ctx };
    			block5.$set(block5_changes);

    			var block6_changes = {};
    			if (changed.$$scope) block6_changes.$$scope = { changed, ctx };
    			block6.$set(block6_changes);

    			var block7_changes = {};
    			if (changed.$$scope) block7_changes.$$scope = { changed, ctx };
    			block7.$set(block7_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(block0.$$.fragment, local);

    			transition_in(block1.$$.fragment, local);

    			transition_in(block2.$$.fragment, local);

    			transition_in(block3.$$.fragment, local);

    			transition_in(block4.$$.fragment, local);

    			transition_in(block5.$$.fragment, local);

    			transition_in(block6.$$.fragment, local);

    			transition_in(block7.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(block0.$$.fragment, local);
    			transition_out(block1.$$.fragment, local);
    			transition_out(block2.$$.fragment, local);
    			transition_out(block3.$$.fragment, local);
    			transition_out(block4.$$.fragment, local);
    			transition_out(block5.$$.fragment, local);
    			transition_out(block6.$$.fragment, local);
    			transition_out(block7.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h20);
    				detach(t1);
    			}

    			destroy_component(block0, detaching);

    			if (detaching) {
    				detach(t2);
    				detach(h21);
    				detach(t4);
    			}

    			destroy_component(block1, detaching);

    			if (detaching) {
    				detach(t5);
    				detach(h22);
    				detach(t7);
    				detach(h30);
    				detach(t9);
    			}

    			destroy_component(block2, detaching);

    			if (detaching) {
    				detach(t10);
    				detach(h31);
    				detach(t12);
    			}

    			destroy_component(block3, detaching);

    			if (detaching) {
    				detach(t13);
    				detach(h32);
    				detach(t15);
    			}

    			destroy_component(block4, detaching);

    			if (detaching) {
    				detach(t16);
    				detach(h33);
    				detach(t18);
    			}

    			destroy_component(block5, detaching);

    			if (detaching) {
    				detach(t19);
    				detach(h34);
    				detach(t21);
    			}

    			destroy_component(block6, detaching);

    			if (detaching) {
    				detach(t22);
    				detach(h23);
    				detach(t24);
    			}

    			destroy_component(block7, detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {

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

    	function change_handler(e) {
    	      helper01 = e.detail.target.value; $$invalidate('helper01', helper01);
    	    }

    	return {
    		helper01,
    		error12,
    		helper12,
    		handleChange12,
    		customStyle1,
    		change_handler
    	};
    }

    class UIComponents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, []);
    	}
    }

    /* src\Layout\Screen.svelte generated by Svelte v3.5.4 */

    const file$6 = "src\\Layout\\Screen.svelte";

    function create_fragment$6(ctx) {
    	var div, current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			attr(div, "class", "screen svelte-l301wc");
    			add_location(div, file$6, 9, 0, 95);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { $$slots, $$scope };
    }

    class Screen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, []);
    	}
    }

    /* src\App.svelte generated by Svelte v3.5.4 */

    // (13:0) <Screen>
    function create_default_slot$1(ctx) {
    	var current;

    	var uicomponents = new UIComponents({ $$inline: true });

    	return {
    		c: function create() {
    			uicomponents.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(uicomponents, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(uicomponents.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(uicomponents.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(uicomponents, detaching);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	var current;

    	var screen = new Screen({
    		props: {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			screen.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(screen, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var screen_changes = {};
    			if (changed.$$scope) screen_changes.$$scope = { changed, ctx };
    			screen.$set(screen_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(screen.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(screen.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(screen, detaching);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	

      let { name } = $$props;

    	const writable_props = ['name'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	return { name };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["name"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

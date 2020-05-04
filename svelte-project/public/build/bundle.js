
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
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
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
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
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Navbar.svelte generated by Svelte v3.21.0 */

    const file = "src/Navbar.svelte";

    function create_fragment(ctx) {
    	let div;
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text(/*heading*/ ctx[0]);
    			add_location(p, file, 19, 2, 243);
    			attr_dev(div, "class", "navbar svelte-244lh8");
    			add_location(div, file, 18, 0, 220);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*heading*/ 1) set_data_dev(t, /*heading*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { heading } = $$props;
    	const writable_props = ["heading"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", $$slots, []);

    	$$self.$set = $$props => {
    		if ("heading" in $$props) $$invalidate(0, heading = $$props.heading);
    	};

    	$$self.$capture_state = () => ({ heading });

    	$$self.$inject_state = $$props => {
    		if ("heading" in $$props) $$invalidate(0, heading = $$props.heading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [heading];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { heading: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*heading*/ ctx[0] === undefined && !("heading" in props)) {
    			console.warn("<Navbar> was created without expected prop 'heading'");
    		}
    	}

    	get heading() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set heading(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/AddForm.svelte generated by Svelte v3.21.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/AddForm.svelte";

    function create_fragment$1(ctx) {
    	let form;
    	let h2;

    	let t0_value = (/*formType*/ ctx[3] === "EDIT"
    	? "Update person details"
    	: "Add person details") + "";

    	let t0;
    	let t1;
    	let div0;
    	let input0;
    	let t2;
    	let div1;
    	let input1;
    	let t3;
    	let div2;
    	let input2;
    	let t4;
    	let div3;
    	let button0;
    	let t6;
    	let button1;
    	let t7_value = (/*formType*/ ctx[3] === "EDIT" ? "Update" : "Add person") + "";
    	let t7;
    	let button1_disabled_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			input1 = element("input");
    			t3 = space();
    			div2 = element("div");
    			input2 = element("input");
    			t4 = space();
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "Cancel";
    			t6 = space();
    			button1 = element("button");
    			t7 = text(t7_value);
    			add_location(h2, file$1, 60, 2, 960);
    			attr_dev(input0, "class", "input-field svelte-gwm85r");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "First Name");
    			attr_dev(input0, "name", "fname");
    			add_location(input0, file$1, 62, 4, 1049);
    			add_location(div0, file$1, 61, 2, 1039);
    			attr_dev(input1, "class", "input-field svelte-gwm85r");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Last Name");
    			attr_dev(input1, "name", "lname");
    			add_location(input1, file$1, 66, 4, 1169);
    			add_location(div1, file$1, 65, 2, 1159);
    			attr_dev(input2, "class", "input-field svelte-gwm85r");
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "placeholder", "age");
    			attr_dev(input2, "name", "age");
    			add_location(input2, file$1, 70, 4, 1286);
    			add_location(div2, file$1, 69, 2, 1276);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-cancel svelte-gwm85r");
    			add_location(button0, file$1, 73, 4, 1410);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "btn btn-main svelte-gwm85r");
    			button1.disabled = button1_disabled_value = !/*first*/ ctx[0] || !/*last*/ ctx[1] || !/*age*/ ctx[2];
    			add_location(button1, file$1, 74, 4, 1497);
    			attr_dev(div3, "class", "flex svelte-gwm85r");
    			add_location(div3, file$1, 72, 4, 1387);
    			attr_dev(form, "autocomplete", "off");
    			add_location(form, file$1, 59, 0, 892);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, form, anchor);
    			append_dev(form, h2);
    			append_dev(h2, t0);
    			append_dev(form, t1);
    			append_dev(form, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*first*/ ctx[0]);
    			append_dev(form, t2);
    			append_dev(form, div1);
    			append_dev(div1, input1);
    			set_input_value(input1, /*last*/ ctx[1]);
    			append_dev(form, t3);
    			append_dev(form, div2);
    			append_dev(div2, input2);
    			set_input_value(input2, /*age*/ ctx[2]);
    			append_dev(form, t4);
    			append_dev(form, div3);
    			append_dev(div3, button0);
    			append_dev(div3, t6);
    			append_dev(div3, button1);
    			append_dev(button1, t7);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[10]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[11]),
    				listen_dev(button0, "click", /*cancelForm*/ ctx[5], false, false, false),
    				listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[4]), false, true, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*formType*/ 8 && t0_value !== (t0_value = (/*formType*/ ctx[3] === "EDIT"
    			? "Update person details"
    			: "Add person details") + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*first*/ 1 && input0.value !== /*first*/ ctx[0]) {
    				set_input_value(input0, /*first*/ ctx[0]);
    			}

    			if (dirty & /*last*/ 2 && input1.value !== /*last*/ ctx[1]) {
    				set_input_value(input1, /*last*/ ctx[1]);
    			}

    			if (dirty & /*age*/ 4 && to_number(input2.value) !== /*age*/ ctx[2]) {
    				set_input_value(input2, /*age*/ ctx[2]);
    			}

    			if (dirty & /*formType*/ 8 && t7_value !== (t7_value = (/*formType*/ ctx[3] === "EDIT" ? "Update" : "Add person") + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*first, last, age*/ 7 && button1_disabled_value !== (button1_disabled_value = !/*first*/ ctx[0] || !/*last*/ ctx[1] || !/*age*/ ctx[2])) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { toggleView } = $$props;
    	let { formType } = $$props;
    	let { first = "" } = $$props;
    	let { last = "" } = $$props;
    	let { age = "" } = $$props;
    	let { id = "" } = $$props;
    	let { AddPerson } = $$props;
    	console.log(first);

    	function handleSubmit() {
    		let data = { first, last, age };
    		AddPerson(data, formType, id);
    	}

    	function cancelForm() {
    		$$invalidate(0, first = "");
    		$$invalidate(1, last = "");
    		$$invalidate(2, age = "");
    		toggleView();
    	}

    	const writable_props = ["toggleView", "formType", "first", "last", "age", "id", "AddPerson"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<AddForm> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AddForm", $$slots, []);

    	function input0_input_handler() {
    		first = this.value;
    		$$invalidate(0, first);
    	}

    	function input1_input_handler() {
    		last = this.value;
    		$$invalidate(1, last);
    	}

    	function input2_input_handler() {
    		age = to_number(this.value);
    		$$invalidate(2, age);
    	}

    	$$self.$set = $$props => {
    		if ("toggleView" in $$props) $$invalidate(6, toggleView = $$props.toggleView);
    		if ("formType" in $$props) $$invalidate(3, formType = $$props.formType);
    		if ("first" in $$props) $$invalidate(0, first = $$props.first);
    		if ("last" in $$props) $$invalidate(1, last = $$props.last);
    		if ("age" in $$props) $$invalidate(2, age = $$props.age);
    		if ("id" in $$props) $$invalidate(7, id = $$props.id);
    		if ("AddPerson" in $$props) $$invalidate(8, AddPerson = $$props.AddPerson);
    	};

    	$$self.$capture_state = () => ({
    		toggleView,
    		formType,
    		first,
    		last,
    		age,
    		id,
    		AddPerson,
    		handleSubmit,
    		cancelForm
    	});

    	$$self.$inject_state = $$props => {
    		if ("toggleView" in $$props) $$invalidate(6, toggleView = $$props.toggleView);
    		if ("formType" in $$props) $$invalidate(3, formType = $$props.formType);
    		if ("first" in $$props) $$invalidate(0, first = $$props.first);
    		if ("last" in $$props) $$invalidate(1, last = $$props.last);
    		if ("age" in $$props) $$invalidate(2, age = $$props.age);
    		if ("id" in $$props) $$invalidate(7, id = $$props.id);
    		if ("AddPerson" in $$props) $$invalidate(8, AddPerson = $$props.AddPerson);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		first,
    		last,
    		age,
    		formType,
    		handleSubmit,
    		cancelForm,
    		toggleView,
    		id,
    		AddPerson,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class AddForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			toggleView: 6,
    			formType: 3,
    			first: 0,
    			last: 1,
    			age: 2,
    			id: 7,
    			AddPerson: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddForm",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*toggleView*/ ctx[6] === undefined && !("toggleView" in props)) {
    			console_1.warn("<AddForm> was created without expected prop 'toggleView'");
    		}

    		if (/*formType*/ ctx[3] === undefined && !("formType" in props)) {
    			console_1.warn("<AddForm> was created without expected prop 'formType'");
    		}

    		if (/*AddPerson*/ ctx[8] === undefined && !("AddPerson" in props)) {
    			console_1.warn("<AddForm> was created without expected prop 'AddPerson'");
    		}
    	}

    	get toggleView() {
    		throw new Error("<AddForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleView(value) {
    		throw new Error("<AddForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formType() {
    		throw new Error("<AddForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formType(value) {
    		throw new Error("<AddForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get first() {
    		throw new Error("<AddForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set first(value) {
    		throw new Error("<AddForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get last() {
    		throw new Error("<AddForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set last(value) {
    		throw new Error("<AddForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get age() {
    		throw new Error("<AddForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set age(value) {
    		throw new Error("<AddForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<AddForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<AddForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get AddPerson() {
    		throw new Error("<AddForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set AddPerson(value) {
    		throw new Error("<AddForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Table.svelte generated by Svelte v3.21.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/Table.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (80:2) {#each filteredPersons as person, i}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*person*/ ctx[10].first + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*person*/ ctx[10].last + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*person*/ ctx[10].age + "";
    	let t4;
    	let t5;
    	let td3;
    	let span0;
    	let i0;
    	let t6;
    	let span1;
    	let i1;
    	let t7;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[8](/*person*/ ctx[10], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[9](/*person*/ ctx[10], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			span0 = element("span");
    			i0 = element("i");
    			t6 = space();
    			span1 = element("span");
    			i1 = element("i");
    			t7 = space();
    			attr_dev(td0, "class", "svelte-tguy25");
    			add_location(td0, file$2, 81, 8, 1688);
    			attr_dev(td1, "class", "svelte-tguy25");
    			add_location(td1, file$2, 82, 8, 1720);
    			attr_dev(td2, "class", "svelte-tguy25");
    			add_location(td2, file$2, 83, 8, 1751);
    			attr_dev(i0, "class", "fas fa-edit cursor svelte-tguy25");
    			add_location(i0, file$2, 85, 66, 1852);
    			attr_dev(span0, "class", "icon svelte-tguy25");
    			add_location(span0, file$2, 85, 12, 1798);
    			attr_dev(i1, "class", "fas fa-trash cursor svelte-tguy25");
    			add_location(i1, file$2, 86, 68, 1962);
    			attr_dev(span1, "class", "icon svelte-tguy25");
    			add_location(span1, file$2, 86, 12, 1906);
    			attr_dev(td3, "class", "svelte-tguy25");
    			add_location(td3, file$2, 84, 8, 1781);
    			attr_dev(tr, "class", "svelte-tguy25");
    			add_location(tr, file$2, 80, 4, 1675);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, span0);
    			append_dev(span0, i0);
    			append_dev(td3, t6);
    			append_dev(td3, span1);
    			append_dev(span1, i1);
    			append_dev(tr, t7);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(span0, "click", click_handler, false, false, false),
    				listen_dev(span1, "click", click_handler_1, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*filteredPersons*/ 2 && t0_value !== (t0_value = /*person*/ ctx[10].first + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*filteredPersons*/ 2 && t2_value !== (t2_value = /*person*/ ctx[10].last + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*filteredPersons*/ 2 && t4_value !== (t4_value = /*person*/ ctx[10].age + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(80:2) {#each filteredPersons as person, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let input;
    	let t0;
    	let table;
    	let tr;
    	let th0;
    	let t2;
    	let th1;
    	let t4;
    	let th2;
    	let t6;
    	let th3;
    	let t8;
    	let dispose;
    	let each_value = /*filteredPersons*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			table = element("table");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "First Name";
    			t2 = space();
    			th1 = element("th");
    			th1.textContent = "Last Name";
    			t4 = space();
    			th2 = element("th");
    			th2.textContent = "Age";
    			t6 = space();
    			th3 = element("th");
    			th3.textContent = "Actions";
    			t8 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "id", "myInput");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search by first name and last name.");
    			attr_dev(input, "class", "svelte-tguy25");
    			add_location(input, file$2, 70, 0, 1313);
    			set_style(th0, "width", "30%");
    			attr_dev(th0, "class", "svelte-tguy25");
    			add_location(th0, file$2, 74, 4, 1467);
    			set_style(th1, "width", "30%");
    			attr_dev(th1, "class", "svelte-tguy25");
    			add_location(th1, file$2, 75, 4, 1510);
    			set_style(th2, "width", "30%");
    			attr_dev(th2, "class", "svelte-tguy25");
    			add_location(th2, file$2, 76, 4, 1552);
    			set_style(th3, "width", "10%");
    			attr_dev(th3, "class", "svelte-tguy25");
    			add_location(th3, file$2, 77, 4, 1588);
    			attr_dev(tr, "class", "header svelte-tguy25");
    			add_location(tr, file$2, 73, 2, 1443);
    			attr_dev(table, "id", "myTable");
    			attr_dev(table, "class", "svelte-tguy25");
    			add_location(table, file$2, 72, 0, 1420);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*textValue*/ ctx[0]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t2);
    			append_dev(tr, th1);
    			append_dev(tr, t4);
    			append_dev(tr, th2);
    			append_dev(tr, t6);
    			append_dev(tr, th3);
    			append_dev(table, t8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[7]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*textValue*/ 1 && input.value !== /*textValue*/ ctx[0]) {
    				set_input_value(input, /*textValue*/ ctx[0]);
    			}

    			if (dirty & /*deletePerson, filteredPersons, editPerson*/ 14) {
    				each_value = /*filteredPersons*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { persons } = $$props;
    	let { editCallback } = $$props;
    	let { deleteCallback } = $$props;
    	let textValue = "";
    	console.log(persons);

    	/*filter logic end*/
    	/*Edit person logic*/
    	function editPerson(person) {
    		editCallback(person);
    	}

    	/*Edit person logic end*/
    	/*delete person logic start*/
    	function deletePerson(person) {
    		deleteCallback(person);
    	}

    	const writable_props = ["persons", "editCallback", "deleteCallback"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Table", $$slots, []);

    	function input_input_handler() {
    		textValue = this.value;
    		$$invalidate(0, textValue);
    	}

    	const click_handler = person => editPerson(person);
    	const click_handler_1 = person => deletePerson(person);

    	$$self.$set = $$props => {
    		if ("persons" in $$props) $$invalidate(4, persons = $$props.persons);
    		if ("editCallback" in $$props) $$invalidate(5, editCallback = $$props.editCallback);
    		if ("deleteCallback" in $$props) $$invalidate(6, deleteCallback = $$props.deleteCallback);
    	};

    	$$self.$capture_state = () => ({
    		persons,
    		editCallback,
    		deleteCallback,
    		textValue,
    		editPerson,
    		deletePerson,
    		filteredPersons
    	});

    	$$self.$inject_state = $$props => {
    		if ("persons" in $$props) $$invalidate(4, persons = $$props.persons);
    		if ("editCallback" in $$props) $$invalidate(5, editCallback = $$props.editCallback);
    		if ("deleteCallback" in $$props) $$invalidate(6, deleteCallback = $$props.deleteCallback);
    		if ("textValue" in $$props) $$invalidate(0, textValue = $$props.textValue);
    		if ("filteredPersons" in $$props) $$invalidate(1, filteredPersons = $$props.filteredPersons);
    	};

    	let filteredPersons;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*textValue, persons*/ 17) {
    			/*filter logic*/
    			 $$invalidate(1, filteredPersons = textValue
    			? persons.filter(person => {
    					const name = `${person.last}, ${person.first}`;
    					return name.toLowerCase().includes(textValue.toLowerCase());
    				})
    			: persons);
    		}
    	};

    	return [
    		textValue,
    		filteredPersons,
    		editPerson,
    		deletePerson,
    		persons,
    		editCallback,
    		deleteCallback,
    		input_input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			persons: 4,
    			editCallback: 5,
    			deleteCallback: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*persons*/ ctx[4] === undefined && !("persons" in props)) {
    			console_1$1.warn("<Table> was created without expected prop 'persons'");
    		}

    		if (/*editCallback*/ ctx[5] === undefined && !("editCallback" in props)) {
    			console_1$1.warn("<Table> was created without expected prop 'editCallback'");
    		}

    		if (/*deleteCallback*/ ctx[6] === undefined && !("deleteCallback" in props)) {
    			console_1$1.warn("<Table> was created without expected prop 'deleteCallback'");
    		}
    	}

    	get persons() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persons(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get editCallback() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editCallback(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deleteCallback() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deleteCallback(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Todo.svelte generated by Svelte v3.21.0 */
    const file$3 = "src/Todo.svelte";

    // (80:0) {#if !showTable}
    function create_if_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*formType*/ ctx[3] === "CREATE") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(80:0) {#if !showTable}",
    		ctx
    	});

    	return block;
    }

    // (83:4) {:else}
    function create_else_block(ctx) {
    	let current;

    	const addform_spread_levels = [
    		{ formType: /*formType*/ ctx[3] },
    		/*personValue*/ ctx[2][0],
    		{ AddPerson: /*AddPerson*/ ctx[6] },
    		{ toggleView: /*toggleView*/ ctx[5] }
    	];

    	let addform_props = {};

    	for (let i = 0; i < addform_spread_levels.length; i += 1) {
    		addform_props = assign(addform_props, addform_spread_levels[i]);
    	}

    	const addform = new AddForm({ props: addform_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(addform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addform, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const addform_changes = (dirty & /*formType, personValue, AddPerson, toggleView*/ 108)
    			? get_spread_update(addform_spread_levels, [
    					dirty & /*formType*/ 8 && { formType: /*formType*/ ctx[3] },
    					dirty & /*personValue*/ 4 && get_spread_object(/*personValue*/ ctx[2][0]),
    					dirty & /*AddPerson*/ 64 && { AddPerson: /*AddPerson*/ ctx[6] },
    					dirty & /*toggleView*/ 32 && { toggleView: /*toggleView*/ ctx[5] }
    				])
    			: {};

    			addform.$set(addform_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(83:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (81:4) {#if formType=== 'CREATE'}
    function create_if_block_2(ctx) {
    	let current;

    	const addform_spread_levels = [
    		{ formType: /*formType*/ ctx[3] },
    		/*initialValue*/ ctx[4],
    		{ AddPerson: /*AddPerson*/ ctx[6] },
    		{ toggleView: /*toggleView*/ ctx[5] }
    	];

    	let addform_props = {};

    	for (let i = 0; i < addform_spread_levels.length; i += 1) {
    		addform_props = assign(addform_props, addform_spread_levels[i]);
    	}

    	const addform = new AddForm({ props: addform_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(addform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addform, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const addform_changes = (dirty & /*formType, initialValue, AddPerson, toggleView*/ 120)
    			? get_spread_update(addform_spread_levels, [
    					dirty & /*formType*/ 8 && { formType: /*formType*/ ctx[3] },
    					dirty & /*initialValue*/ 16 && get_spread_object(/*initialValue*/ ctx[4]),
    					dirty & /*AddPerson*/ 64 && { AddPerson: /*AddPerson*/ ctx[6] },
    					dirty & /*toggleView*/ 32 && { toggleView: /*toggleView*/ ctx[5] }
    				])
    			: {};

    			addform.$set(addform_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(81:4) {#if formType=== 'CREATE'}",
    		ctx
    	});

    	return block;
    }

    // (88:0) {#if showTable}
    function create_if_block(ctx) {
    	let button;
    	let t1;
    	let current;
    	let dispose;

    	const table = new Table({
    			props: {
    				persons: /*persons*/ ctx[0],
    				deleteCallback: /*deleteCallback*/ ctx[8],
    				editCallback: /*editCallback*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Add Person";
    			t1 = space();
    			create_component(table.$$.fragment);
    			attr_dev(button, "class", "btn svelte-6nwpb5");
    			add_location(button, file$3, 88, 4, 1792);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(table, target, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*toggleView*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};
    			if (dirty & /*persons*/ 1) table_changes.persons = /*persons*/ ctx[0];
    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			destroy_component(table, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(88:0) {#if showTable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = !/*showTable*/ ctx[1] && create_if_block_1(ctx);
    	let if_block1 = /*showTable*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*showTable*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*showTable*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*showTable*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showTable*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function generateId() {
    	return "_" + Math.random().toString(36).substr(2, 9);
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let persons = [
    		{
    			id: 1,
    			first: "Ose",
    			last: "Jack",
    			age: 23
    		},
    		{
    			id: 2,
    			first: "Bob",
    			last: "Jacob",
    			age: 25
    		},
    		{
    			id: 3,
    			first: "David",
    			last: "Jean",
    			age: 28
    		}
    	];

    	let initialValue = { first: "", last: "", age: "", id: "" };
    	let showTable = true;
    	let personValue = {};
    	let formType = "CREATE";

    	function toggleView() {
    		$$invalidate(1, showTable = !showTable);
    	}

    	

    	function AddPerson(data, type, index) {
    		if (type === "EDIT") {
    			data.id = index;
    			const objIndex = persons.findIndex(obj => obj.id === index);
    			$$invalidate(0, persons[objIndex] = data, persons);
    			toggleView();
    		} else {
    			let newPerson = { ...data, id: generateId() };
    			persons.push(newPerson);
    			toggleView();
    		}
    	}

    	function editCallback(person) {
    		$$invalidate(2, personValue = persons.filter(item => item.id === person.id));
    		$$invalidate(3, formType = "EDIT");
    		toggleView();
    	}

    	function deleteCallback(person) {
    		$$invalidate(0, persons = persons.filter(item => item.id != person.id));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Todo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Todo", $$slots, []);

    	$$self.$capture_state = () => ({
    		AddForm,
    		Table,
    		persons,
    		initialValue,
    		showTable,
    		personValue,
    		formType,
    		toggleView,
    		generateId,
    		AddPerson,
    		editCallback,
    		deleteCallback
    	});

    	$$self.$inject_state = $$props => {
    		if ("persons" in $$props) $$invalidate(0, persons = $$props.persons);
    		if ("initialValue" in $$props) $$invalidate(4, initialValue = $$props.initialValue);
    		if ("showTable" in $$props) $$invalidate(1, showTable = $$props.showTable);
    		if ("personValue" in $$props) $$invalidate(2, personValue = $$props.personValue);
    		if ("formType" in $$props) $$invalidate(3, formType = $$props.formType);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		persons,
    		showTable,
    		personValue,
    		formType,
    		initialValue,
    		toggleView,
    		AddPerson,
    		editCallback,
    		deleteCallback
    	];
    }

    class Todo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Todo",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.21.0 */
    const file$4 = "src/App.svelte";

    function create_fragment$4(ctx) {
    	let t;
    	let div;
    	let current;

    	const navbar = new Navbar({
    			props: { heading: "SvelteJs" },
    			$$inline: true
    		});

    	const todo = new Todo({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			div = element("div");
    			create_component(todo.$$.fragment);
    			attr_dev(div, "class", "container svelte-16fxw2t");
    			add_location(div, file$4, 14, 0, 173);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(todo, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(todo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(todo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(todo);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Navbar, Todo });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
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

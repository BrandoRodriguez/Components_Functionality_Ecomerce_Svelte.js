
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
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
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
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
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
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

    const active_docs = new Set();
    let active = 0;
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
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
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
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
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
    const null_transition = { duration: 0 };
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
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
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
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
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

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
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

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const cart = writable({});

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\components\Modal.svelte generated by Svelte v3.20.1 */
    const file = "src\\components\\Modal.svelte";

    function create_fragment(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t;
    	let div2_transition;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "ProductDetailsstyle__BackButton-tn8bpu-2 lgMmoT svelte-zt2ogn");
    			add_location(div0, file, 270, 4, 5886);
    			attr_dev(div1, "class", "modal svelte-zt2ogn");
    			attr_dev(div1, "role", "dialog");
    			attr_dev(div1, "aria-modal", "true");
    			add_location(div1, file, 269, 2, 5811);
    			attr_dev(div2, "class", "modal-background svelte-zt2ogn");
    			add_location(div2, file, 268, 0, 5733);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			/*div1_binding*/ ctx[8](div1);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(window, "keydown", /*handle_keydown*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fly, { y: 200, duration: 1000 }, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fly, { y: 200, duration: 1000 }, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			/*div1_binding*/ ctx[8](null);
    			if (detaching && div2_transition) div2_transition.end();
    			dispose();
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
    	let visible = true;
    	const dispatch = createEventDispatcher();
    	const close = () => dispatch("close");
    	let modal;

    	const handle_keydown = e => {
    		if (e.key === "Escape") {
    			close();
    			return;
    		}

    		if (e.key === "Tab") {
    			// trap focus
    			const nodes = modal.querySelectorAll("*");

    			const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && e.shiftKey) index = 0;
    			index += tabbable.length + (e.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			e.preventDefault();
    		}
    	};

    	const previously_focused = typeof document !== "undefined" && document.activeElement;

    	if (previously_focused) {
    		onDestroy(() => {
    			previously_focused.focus();
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modal", $$slots, ['default']);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, modal = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		fly,
    		visible,
    		dispatch,
    		close,
    		modal,
    		handle_keydown,
    		previously_focused
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) visible = $$props.visible;
    		if ("modal" in $$props) $$invalidate(0, modal = $$props.modal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		modal,
    		handle_keydown,
    		visible,
    		dispatch,
    		close,
    		previously_focused,
    		$$scope,
    		$$slots,
    		div1_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\components\CardDescripcion.svelte generated by Svelte v3.20.1 */
    const file$1 = "src\\components\\CardDescripcion.svelte";

    // (261:4) {:else}
    function create_else_block(ctx) {
    	let button;
    	let span;
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			t = text(/*ico*/ ctx[2]);
    			attr_dev(span, "class", "button-icon svelte-1sp3rla");
    			add_location(span, file$1, 262, 8, 6639);
    			attr_dev(button, "class", "button-general button-card svelte-1sp3rla");
    			add_location(button, file$1, 261, 6, 6565);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(span, t);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*addToCart*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ico*/ 4) set_data_dev(t, /*ico*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(261:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (210:4) {#if inCart > 0}
    function create_if_block(ctx) {
    	let div;
    	let button0;
    	let svg0;
    	let rect0;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let button1;
    	let svg1;
    	let g;
    	let rect1;
    	let rect2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*inCart*/ ctx[3]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			g = svg_element("g");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			attr_dev(rect0, "data-name", "Rectangle 522");
    			attr_dev(rect0, "width", "12");
    			attr_dev(rect0, "height", "2");
    			attr_dev(rect0, "rx", "1");
    			attr_dev(rect0, "fill", "currentColor");
    			attr_dev(rect0, "class", "svelte-1sp3rla");
    			add_location(rect0, file$1, 219, 12, 5282);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "12px");
    			attr_dev(svg0, "height", "2px");
    			attr_dev(svg0, "viewBox", "0 0 12 2");
    			attr_dev(svg0, "class", "svelte-1sp3rla");
    			add_location(svg0, file$1, 214, 10, 5131);
    			attr_dev(button0, "class", "add Counterstyle__CounterButton-sc-14ahato-1 bPmfin svelte-1sp3rla");
    			add_location(button0, file$1, 211, 8, 4999);
    			attr_dev(span, "class", "Counterstyle__CounterValue-sc-14ahato-2 dMHyRK svelte-1sp3rla");
    			add_location(span, file$1, 227, 8, 5487);
    			attr_dev(rect1, "data-name", "Rectangle 520");
    			attr_dev(rect1, "width", "12");
    			attr_dev(rect1, "height", "2");
    			attr_dev(rect1, "rx", "1");
    			attr_dev(rect1, "transform", "translate(1367 195)");
    			attr_dev(rect1, "fill", "currentColor");
    			attr_dev(rect1, "class", "svelte-1sp3rla");
    			add_location(rect1, file$1, 242, 14, 6014);
    			attr_dev(rect2, "data-name", "Rectangle 521");
    			attr_dev(rect2, "width", "12");
    			attr_dev(rect2, "height", "2");
    			attr_dev(rect2, "rx", "1");
    			attr_dev(rect2, "transform", "translate(1374 190) rotate(90)");
    			attr_dev(rect2, "fill", "currentColor");
    			attr_dev(rect2, "class", "svelte-1sp3rla");
    			add_location(rect2, file$1, 249, 14, 6247);
    			attr_dev(g, "id", "Group_3351");
    			attr_dev(g, "data-name", "Group 3351");
    			attr_dev(g, "transform", "translate(-1367 -190)");
    			attr_dev(g, "class", "svelte-1sp3rla");
    			add_location(g, file$1, 238, 12, 5877);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "12px");
    			attr_dev(svg1, "height", "12px");
    			attr_dev(svg1, "viewBox", "0 0 12 12");
    			attr_dev(svg1, "class", "svelte-1sp3rla");
    			add_location(svg1, file$1, 233, 10, 5724);
    			attr_dev(button1, "class", " Counterstyle__CounterButton-sc-14ahato-1 bPmfin svelte-1sp3rla");
    			add_location(button1, file$1, 230, 8, 5595);
    			attr_dev(div, "class", "Counterstyle__CounterBox-sc-14ahato-0 fmEddu svelte-1sp3rla");
    			add_location(div, file$1, 210, 6, 4931);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, rect0);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			append_dev(div, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, g);
    			append_dev(g, rect1);
    			append_dev(g, rect2);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*countButtonHandler*/ ctx[5], false, false, false),
    				listen_dev(button1, "click", /*countButtonHandler*/ ctx[5], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*inCart*/ 8) set_data_dev(t1, /*inCart*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(210:4) {#if inCart > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div3;
    	let div0;
    	let span0;
    	let t0;
    	let t1;
    	let div1;
    	let span1;
    	let t2;
    	let span2;
    	let t3;
    	let t4;
    	let div2;

    	function select_block_type(ctx, dirty) {
    		if (/*inCart*/ ctx[3] > 0) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text(/*medida*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			span1 = element("span");
    			t2 = space();
    			span2 = element("span");
    			t3 = text(/*precio*/ ctx[1]);
    			t4 = space();
    			div2 = element("div");
    			if_block.c();
    			attr_dev(span0, "class", "ProductDetailsFoodstyle__ItemName-hqku2g-21 jjyQfw svelte-1sp3rla");
    			add_location(span0, file$1, 198, 4, 4470);
    			attr_dev(div0, "class", "ProductDetailsFoodstyle__ItemNameDetails-hqku2g-20 hbqbsH svelte-1sp3rla");
    			add_location(div0, file$1, 197, 2, 4393);
    			attr_dev(span1, "class", "ProductDetailsFoodstyle__HelpText-hqku2g-24 cjrrYE svelte-1sp3rla");
    			add_location(span1, file$1, 203, 4, 4655);
    			attr_dev(span2, "class", "ProductDetailsFoodstyle__ItemPrice-hqku2g-25 iCYaYm svelte-1sp3rla");
    			add_location(span2, file$1, 204, 4, 4728);
    			attr_dev(div1, "class", "ProductDetailsFoodstyle__ItemNamePricing-hqku2g-23 kbZYLS svelte-1sp3rla");
    			add_location(div1, file$1, 202, 2, 4578);
    			attr_dev(div2, "class", "QuickViewstyle__ProductCartBtn-sc-28ycgw-14 EWA-dv svelte-1sp3rla");
    			add_location(div2, file$1, 208, 2, 4837);
    			attr_dev(div3, "class", "ProductDetailsFoodstyle__ItemWrapper-hqku2g-19 fILoFu svelte-1sp3rla");
    			add_location(div3, file$1, 196, 0, 4322);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, span1);
    			append_dev(div1, t2);
    			append_dev(div1, span2);
    			append_dev(span2, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			if_block.m(div2, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*medida*/ 1) set_data_dev(t0, /*medida*/ ctx[0]);
    			if (dirty & /*precio*/ 2) set_data_dev(t3, /*precio*/ ctx[1]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block.d();
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
    	let { medida } = $$props;
    	let { precio } = $$props;
    	let { ico } = $$props;
    	const cartItems = get_store_value(cart);
    	let inCart = cartItems[name] ? cartItems[name].count : 0;

    	function addToCart() {
    		$$invalidate(3, inCart++, inCart);

    		cart.update(n => {
    			return { ...n, [name]: { ...item, count: inCart } };
    		});
    	}

    	const countButtonHandler = e => {
    		if (e.target.classList.contains("add")) {
    			$$invalidate(3, inCart--, inCart);
    		} else if (inCart >= 1) {
    			$$invalidate(3, inCart++, inCart);
    		}

    		cart.update(n => {
    			return { ...n, [name]: { ...item, count: inCart } };
    		});
    	};

    	const writable_props = ["medida", "precio", "ico"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardDescripcion> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CardDescripcion", $$slots, []);

    	$$self.$set = $$props => {
    		if ("medida" in $$props) $$invalidate(0, medida = $$props.medida);
    		if ("precio" in $$props) $$invalidate(1, precio = $$props.precio);
    		if ("ico" in $$props) $$invalidate(2, ico = $$props.ico);
    	};

    	$$self.$capture_state = () => ({
    		get: get_store_value,
    		cart,
    		fly,
    		Modal,
    		medida,
    		precio,
    		ico,
    		cartItems,
    		inCart,
    		addToCart,
    		countButtonHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("medida" in $$props) $$invalidate(0, medida = $$props.medida);
    		if ("precio" in $$props) $$invalidate(1, precio = $$props.precio);
    		if ("ico" in $$props) $$invalidate(2, ico = $$props.ico);
    		if ("inCart" in $$props) $$invalidate(3, inCart = $$props.inCart);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [medida, precio, ico, inCart, addToCart, countButtonHandler];
    }

    class CardDescripcion extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { medida: 0, precio: 1, ico: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardDescripcion",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*medida*/ ctx[0] === undefined && !("medida" in props)) {
    			console.warn("<CardDescripcion> was created without expected prop 'medida'");
    		}

    		if (/*precio*/ ctx[1] === undefined && !("precio" in props)) {
    			console.warn("<CardDescripcion> was created without expected prop 'precio'");
    		}

    		if (/*ico*/ ctx[2] === undefined && !("ico" in props)) {
    			console.warn("<CardDescripcion> was created without expected prop 'ico'");
    		}
    	}

    	get medida() {
    		throw new Error("<CardDescripcion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set medida(value) {
    		throw new Error("<CardDescripcion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get precio() {
    		throw new Error("<CardDescripcion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set precio(value) {
    		throw new Error("<CardDescripcion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ico() {
    		throw new Error("<CardDescripcion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ico(value) {
    		throw new Error("<CardDescripcion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Card.svelte generated by Svelte v3.20.1 */
    const file$2 = "src\\components\\Card.svelte";

    // (1243:12) {:else}
    function create_else_block_2(ctx) {
    	let button;
    	let span0;
    	let svg_1;
    	let g;
    	let path;
    	let t0;
    	let span1;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span0 = element("span");
    			svg_1 = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Card";
    			attr_dev(path, "data-name", "Path 154");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", /*svg*/ ctx[3]);
    			attr_dev(path, "class", "svelte-1ecbd20");
    			add_location(path, file$2, 1256, 22, 27717);
    			attr_dev(g, "data-name", "Group 120");
    			attr_dev(g, "transform", "translate(-288 -413.89)");
    			attr_dev(g, "class", "svelte-1ecbd20");
    			add_location(g, file$2, 1253, 20, 27586);
    			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg_1, "width", "14.4");
    			attr_dev(svg_1, "height", "12");
    			attr_dev(svg_1, "viewBox", "0 0 14.4 12");
    			attr_dev(svg_1, "class", "svelte-1ecbd20");
    			add_location(svg_1, file$2, 1248, 18, 27393);
    			attr_dev(span0, "class", "button-icon svelte-1ecbd20");
    			add_location(span0, file$2, 1247, 16, 27347);
    			attr_dev(span1, "class", "btn-text svelte-1ecbd20");
    			add_location(span1, file$2, 1260, 16, 27869);
    			attr_dev(button, "class", "button-general button-card .cart-button  svelte-1ecbd20");
    			add_location(button, file$2, 1243, 14, 27215);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span0);
    			append_dev(span0, svg_1);
    			append_dev(svg_1, g);
    			append_dev(g, path);
    			append_dev(button, t0);
    			append_dev(button, span1);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*addToCart*/ ctx[16], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(1243:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1191:12) {#if inCart > 0}
    function create_if_block_5(ctx) {
    	let div;
    	let button0;
    	let svg0;
    	let rect0;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let button1;
    	let svg1;
    	let g;
    	let rect1;
    	let rect2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*inCart*/ ctx[2]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			g = svg_element("g");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			attr_dev(rect0, "data-name", "Rectangle 522");
    			attr_dev(rect0, "width", "12");
    			attr_dev(rect0, "height", "2");
    			attr_dev(rect0, "rx", "1");
    			attr_dev(rect0, "fill", "currentColor");
    			attr_dev(rect0, "class", "svelte-1ecbd20");
    			add_location(rect0, file$2, 1200, 20, 25594);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "12px");
    			attr_dev(svg0, "height", "2px");
    			attr_dev(svg0, "viewBox", "0 0 12 2");
    			attr_dev(svg0, "class", "svelte-1ecbd20");
    			add_location(svg0, file$2, 1195, 18, 25403);
    			attr_dev(button0, "class", "add Counterstyle__CounterButton-sc-14ahato-1 bPmfin svelte-1ecbd20");
    			add_location(button0, file$2, 1192, 16, 25247);
    			attr_dev(span, "class", "Counterstyle__CounterValue-sc-14ahato-2 dMHyRK svelte-1ecbd20");
    			add_location(span, file$2, 1208, 16, 25863);
    			attr_dev(rect1, "data-name", "Rectangle 520");
    			attr_dev(rect1, "width", "12");
    			attr_dev(rect1, "height", "2");
    			attr_dev(rect1, "rx", "1");
    			attr_dev(rect1, "transform", "translate(1367 195)");
    			attr_dev(rect1, "fill", "currentColor");
    			attr_dev(rect1, "class", "svelte-1ecbd20");
    			add_location(rect1, file$2, 1223, 22, 26510);
    			attr_dev(rect2, "data-name", "Rectangle 521");
    			attr_dev(rect2, "width", "12");
    			attr_dev(rect2, "height", "2");
    			attr_dev(rect2, "rx", "1");
    			attr_dev(rect2, "transform", "translate(1374 190) rotate(90)");
    			attr_dev(rect2, "fill", "currentColor");
    			attr_dev(rect2, "class", "svelte-1ecbd20");
    			add_location(rect2, file$2, 1230, 22, 26799);
    			attr_dev(g, "id", "Group_3351");
    			attr_dev(g, "data-name", "Group 3351");
    			attr_dev(g, "transform", "translate(-1367 -190)");
    			attr_dev(g, "class", "svelte-1ecbd20");
    			add_location(g, file$2, 1219, 20, 26341);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "12px");
    			attr_dev(svg1, "height", "12px");
    			attr_dev(svg1, "viewBox", "0 0 12 12");
    			attr_dev(svg1, "class", "svelte-1ecbd20");
    			add_location(svg1, file$2, 1214, 18, 26148);
    			attr_dev(button1, "class", " Counterstyle__CounterButton-sc-14ahato-1 bPmfin svelte-1ecbd20");
    			add_location(button1, file$2, 1211, 16, 25995);
    			attr_dev(div, "class", "Counterstyle__CounterBox-sc-14ahato-0 fmEddu svelte-1ecbd20");
    			add_location(div, file$2, 1191, 14, 25171);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, rect0);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			append_dev(div, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, g);
    			append_dev(g, rect1);
    			append_dev(g, rect2);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*countButtonHandler*/ ctx[17], false, false, false),
    				listen_dev(button1, "click", /*countButtonHandler*/ ctx[17], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*inCart*/ 4) set_data_dev(t1, /*inCart*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(1191:12) {#if inCart > 0}",
    		ctx
    	});

    	return block;
    }

    // (1277:0) {#if visible}
    function create_if_block$1(ctx) {
    	let div0;
    	let t0;
    	let div15;
    	let div14;
    	let div13;
    	let button;
    	let svg_1;
    	let path;
    	let t1;
    	let div12;
    	let div11;
    	let div2;
    	let div1;
    	let t2;
    	let ul;
    	let li0;
    	let input0;
    	let input0_value_value;
    	let t3;
    	let label0;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let li1;
    	let input1;
    	let input1_value_value;
    	let t5;
    	let label1;
    	let img1_1;
    	let img1_1_src_value;
    	let t6;
    	let li2;
    	let input2;
    	let input2_value_value;
    	let t7;
    	let label2;
    	let img2_1;
    	let img2_1_src_value;
    	let t8;
    	let li3;
    	let input3;
    	let input3_value_value;
    	let t9;
    	let label3;
    	let img3_1;
    	let img3_1_src_value;
    	let t10;
    	let span0;
    	let t12;
    	let div10;
    	let div9;
    	let div5;
    	let h1;
    	let t14;
    	let div4;
    	let span1;
    	let t18;
    	let div3;
    	let t22;
    	let div6;
    	let t24;
    	let p;
    	let t26;
    	let t27;
    	let div8;
    	let div7;
    	let span2;
    	let t29;
    	let span3;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*scoops*/ ctx[1] === 1) return create_if_block_2;
    		if (/*scoops*/ ctx[1] === 2) return create_if_block_3;
    		if (/*scoops*/ ctx[1] === 3) return create_if_block_4;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*inCart*/ ctx[2] > 0) return create_if_block_1;
    		return create_else_block$1;
    	}

    	let current_block_type_1 = select_block_type_2(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			button = element("button");
    			svg_1 = svg_element("svg");
    			path = svg_element("path");
    			t1 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if_block0.c();
    			t2 = space();
    			ul = element("ul");
    			li0 = element("li");
    			input0 = element("input");
    			t3 = space();
    			label0 = element("label");
    			img0 = element("img");
    			t4 = space();
    			li1 = element("li");
    			input1 = element("input");
    			t5 = space();
    			label1 = element("label");
    			img1_1 = element("img");
    			t6 = space();
    			li2 = element("li");
    			input2 = element("input");
    			t7 = space();
    			label2 = element("label");
    			img2_1 = element("img");
    			t8 = space();
    			li3 = element("li");
    			input3 = element("input");
    			t9 = space();
    			label3 = element("label");
    			img3_1 = element("img");
    			t10 = space();
    			span0 = element("span");
    			span0.textContent = `${/*oferta*/ ctx[13]}`;
    			t12 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div5 = element("div");
    			h1 = element("h1");
    			h1.textContent = `${/*name*/ ctx[4]}`;
    			t14 = space();
    			div4 = element("div");
    			span1 = element("span");

    			span1.textContent = `
                      s/${/*precioantes*/ ctx[12]}.00
                    `;

    			t18 = space();
    			div3 = element("div");

    			div3.textContent = `
                      S/${/*precio*/ ctx[11]}.00
                    `;

    			t22 = space();
    			div6 = element("div");
    			div6.textContent = `${/*marca*/ ctx[10]}`;
    			t24 = space();
    			p = element("p");
    			p.textContent = `${/*descripcion*/ ctx[9]}`;
    			t26 = space();
    			if_block1.c();
    			t27 = space();
    			div8 = element("div");
    			div7 = element("div");
    			span2 = element("span");
    			span2.textContent = `${/*categoriageneral*/ ctx[14]}`;
    			t29 = space();
    			span3 = element("span");
    			span3.textContent = `${/*categoria*/ ctx[15]}`;
    			attr_dev(div0, "class", "reuseModalOverlay quick-view-overlay svelte-1ecbd20");
    			add_location(div0, file$2, 1277, 2, 28059);
    			attr_dev(path, "data-name", "_ionicons_svg_ios-close (5)");
    			attr_dev(path, "d", "M166.686,165.55l3.573-3.573a.837.837,0,0,0-1.184-1.184l-3.573,3.573-3.573-3.573a.837.837,0,1,0-1.184,1.184l3.573,3.573-3.573,3.573a.837.837,0,0,0,1.184,1.184l3.573-3.573,3.573,3.573a.837.837,0,0,0,1.184-1.184Z");
    			attr_dev(path, "transform", "translate(-160.5 -160.55)");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "class", "svelte-1ecbd20");
    			add_location(path, file$2, 1289, 12, 28545);
    			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg_1, "width", "10.003");
    			attr_dev(svg_1, "height", "10");
    			attr_dev(svg_1, "viewBox", "0 0 10.003 10");
    			attr_dev(svg_1, "class", "svelte-1ecbd20");
    			add_location(svg_1, file$2, 1284, 10, 28388);
    			attr_dev(button, "class", "QuickViewstyle__ModalClose-sc-28ycgw-19 fBqntg svelte-1ecbd20");
    			add_location(button, file$2, 1281, 8, 28266);
    			attr_dev(input0, "id", "vista");
    			attr_dev(input0, "class", "opcion svelte-1ecbd20");
    			attr_dev(input0, "type", "radio");
    			input0.__value = input0_value_value = 1;
    			input0.value = input0.__value;
    			/*$$binding_groups*/ ctx[33][0].push(input0);
    			add_location(input0, file$2, 1343, 20, 30964);
    			if (img0.src !== (img0_src_value = `img/${/*img*/ ctx[5]}`)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", /*name*/ ctx[4]);
    			attr_dev(img0, "draggable", "false");
    			set_style(img0, "width", "100%");
    			set_style(img0, "height", "100%");
    			set_style(img0, "position", "relative");
    			attr_dev(img0, "class", "svelte-1ecbd20");
    			add_location(img0, file$2, 1350, 22, 31243);
    			attr_dev(label0, "class", "vista-cursor svelte-1ecbd20");
    			attr_dev(label0, "for", "vista");
    			add_location(label0, file$2, 1349, 20, 31179);
    			attr_dev(li0, "data-index", "0");
    			attr_dev(li0, "class", "MultiCarousel__SingleItem-sc-1l8qqrp-0 hkJujT\r\n                    custom-dot custom-dot false svelte-1ecbd20");
    			add_location(li0, file$2, 1339, 18, 30778);
    			attr_dev(input1, "id", "vista1");
    			attr_dev(input1, "class", "opcion svelte-1ecbd20");
    			attr_dev(input1, "type", "radio");
    			input1.__value = input1_value_value = 2;
    			input1.value = input1.__value;
    			/*$$binding_groups*/ ctx[33][0].push(input1);
    			add_location(input1, file$2, 1361, 20, 31703);
    			if (img1_1.src !== (img1_1_src_value = `img/${/*img1*/ ctx[6]}`)) attr_dev(img1_1, "src", img1_1_src_value);
    			attr_dev(img1_1, "alt", /*name*/ ctx[4]);
    			attr_dev(img1_1, "draggable", "false");
    			set_style(img1_1, "width", "100%");
    			set_style(img1_1, "height", "100%");
    			set_style(img1_1, "position", "relative");
    			attr_dev(img1_1, "class", "svelte-1ecbd20");
    			add_location(img1_1, file$2, 1368, 22, 31984);
    			attr_dev(label1, "class", "vista-cursor svelte-1ecbd20");
    			attr_dev(label1, "for", "vista1");
    			add_location(label1, file$2, 1367, 20, 31919);
    			attr_dev(li1, "data-index", "1");
    			attr_dev(li1, "class", "MultiCarousel__SingleItem-sc-1l8qqrp-0 hkJujT\r\n                    custom-dot false svelte-1ecbd20");
    			add_location(li1, file$2, 1357, 18, 31528);
    			attr_dev(input2, "id", "vista2");
    			attr_dev(input2, "class", "opcion svelte-1ecbd20");
    			attr_dev(input2, "type", "radio");
    			input2.__value = input2_value_value = 3;
    			input2.value = input2.__value;
    			/*$$binding_groups*/ ctx[33][0].push(input2);
    			add_location(input2, file$2, 1379, 20, 32445);
    			if (img2_1.src !== (img2_1_src_value = `img/${/*img2*/ ctx[7]}`)) attr_dev(img2_1, "src", img2_1_src_value);
    			attr_dev(img2_1, "alt", /*name*/ ctx[4]);
    			attr_dev(img2_1, "draggable", "false");
    			set_style(img2_1, "width", "100%");
    			set_style(img2_1, "height", "100%");
    			set_style(img2_1, "position", "relative");
    			attr_dev(img2_1, "class", "svelte-1ecbd20");
    			add_location(img2_1, file$2, 1386, 22, 32726);
    			attr_dev(label2, "class", "vista-cursor svelte-1ecbd20");
    			attr_dev(label2, "for", "vista2");
    			add_location(label2, file$2, 1385, 20, 32661);
    			attr_dev(li2, "data-index", "2");
    			attr_dev(li2, "class", "MultiCarousel__SingleItem-sc-1l8qqrp-0 hkJujT\r\n                    custom-dot false svelte-1ecbd20");
    			add_location(li2, file$2, 1375, 18, 32270);
    			attr_dev(input3, "id", "vista3");
    			attr_dev(input3, "class", "opcion svelte-1ecbd20");
    			attr_dev(input3, "type", "radio");
    			input3.__value = input3_value_value = 4;
    			input3.value = input3.__value;
    			/*$$binding_groups*/ ctx[33][0].push(input3);
    			add_location(input3, file$2, 1397, 20, 33187);
    			if (img3_1.src !== (img3_1_src_value = `img/${/*img3*/ ctx[8]}`)) attr_dev(img3_1, "src", img3_1_src_value);
    			attr_dev(img3_1, "alt", /*name*/ ctx[4]);
    			attr_dev(img3_1, "draggable", "false");
    			set_style(img3_1, "width", "100%");
    			set_style(img3_1, "height", "100%");
    			set_style(img3_1, "position", "relative");
    			attr_dev(img3_1, "class", "svelte-1ecbd20");
    			add_location(img3_1, file$2, 1404, 22, 33468);
    			attr_dev(label3, "class", "vista-cursor svelte-1ecbd20");
    			attr_dev(label3, "for", "vista3");
    			add_location(label3, file$2, 1403, 20, 33403);
    			attr_dev(li3, "data-index", "3");
    			attr_dev(li3, "class", "MultiCarousel__SingleItem-sc-1l8qqrp-0 hkJujT\r\n                    custom-dot false svelte-1ecbd20");
    			add_location(li3, file$2, 1393, 18, 33012);
    			attr_dev(ul, "class", "react-multi-carousel-dot-list  svelte-1ecbd20");
    			add_location(ul, file$2, 1338, 16, 30715);
    			attr_dev(div1, "class", "react-multi-carousel-list carousel-with-custom-dots  svelte-1ecbd20");
    			add_location(div1, file$2, 1302, 14, 29274);
    			attr_dev(span0, "class", "QuickViewstyle__DiscountPercent-sc-28ycgw-4 jweBTn svelte-1ecbd20");
    			add_location(span0, file$2, 1414, 14, 33797);
    			attr_dev(div2, "class", "QuickViewstyle__ProductPreview-sc-28ycgw-2 fMlFIC svelte-1ecbd20");
    			add_location(div2, file$2, 1301, 12, 29195);
    			attr_dev(h1, "class", "QuickViewstyle__ProductTitle-sc-28ycgw-8 mqzOv svelte-1ecbd20");
    			add_location(h1, file$2, 1425, 18, 34276);
    			attr_dev(span1, "class", "QuickViewstyle__SalePrice-sc-28ycgw-11 hVvfEF svelte-1ecbd20");
    			add_location(span1, file$2, 1431, 20, 34540);
    			attr_dev(div3, "class", "QuickViewstyle__ProductPrice-sc-28ycgw-10 cqZYhV svelte-1ecbd20");
    			add_location(div3, file$2, 1434, 20, 34693);
    			attr_dev(div4, "class", "QuickViewstyle__ProductPriceWrapper-sc-28ycgw-9\r\n                    fbUCfN svelte-1ecbd20");
    			add_location(div4, file$2, 1428, 18, 34408);
    			attr_dev(div5, "class", "QuickViewstyle__ProductTitlePriceWrapper-sc-28ycgw-7\r\n                  kzoayf svelte-1ecbd20");
    			add_location(div5, file$2, 1422, 16, 34145);
    			attr_dev(div6, "class", "QuickViewstyle__ProductWeight-sc-28ycgw-12 btDBfe svelte-1ecbd20");
    			add_location(div6, file$2, 1440, 16, 34911);
    			attr_dev(p, "class", "QuickViewstyle__ProductDescription-sc-28ycgw-13 OLDqC svelte-1ecbd20");
    			add_location(p, file$2, 1443, 16, 35043);
    			attr_dev(span2, "class", "QuickViewstyle__MetaItem-sc-28ycgw-18 eLZhSZ svelte-1ecbd20");
    			add_location(span2, file$2, 1528, 20, 38590);
    			attr_dev(span3, "class", "QuickViewstyle__MetaItem-sc-28ycgw-18 eLZhSZ svelte-1ecbd20");
    			add_location(span3, file$2, 1531, 20, 38742);
    			attr_dev(div7, "class", "QuickViewstyle__MetaSingle-sc-28ycgw-17 CyALc svelte-1ecbd20");
    			add_location(div7, file$2, 1527, 18, 38509);
    			attr_dev(div8, "class", "QuickViewstyle__ProductMeta-sc-28ycgw-16 hmqfIE svelte-1ecbd20");
    			add_location(div8, file$2, 1526, 16, 38428);
    			attr_dev(div9, "class", "QuickViewstyle__ProductInfo-sc-28ycgw-6 hJAUJy svelte-1ecbd20");
    			add_location(div9, file$2, 1421, 14, 34067);
    			attr_dev(div10, "dir", "ltr");
    			attr_dev(div10, "class", "QuickViewstyle__ProductInfoWrapper-sc-28ycgw-5 DNQhx svelte-1ecbd20");
    			add_location(div10, file$2, 1418, 12, 33945);
    			attr_dev(div11, "class", "QuickViewstyle__ProductDetailsWrapper-sc-28ycgw-1 fOsizy\r\n            product-card svelte-1ecbd20");
    			attr_dev(div11, "dir", "ltr");
    			add_location(div11, file$2, 1297, 10, 29049);
    			attr_dev(div12, "class", "QuickViewstyle__QuickViewWrapper-sc-28ycgw-0 dJblge svelte-1ecbd20");
    			add_location(div12, file$2, 1296, 8, 28972);
    			attr_dev(div13, "class", "innerRndComponent svelte-1ecbd20");
    			add_location(div13, file$2, 1280, 6, 28225);
    			attr_dev(div14, "class", "reuseModalHolder quick-view-modal tamaño svelte-1ecbd20");
    			add_location(div14, file$2, 1279, 4, 28163);
    			attr_dev(div15, "class", "reuseModalParentWrapper svelte-1ecbd20");
    			add_location(div15, file$2, 1278, 2, 28120);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div15, anchor);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, button);
    			append_dev(button, svg_1);
    			append_dev(svg_1, path);
    			append_dev(div13, t1);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div2);
    			append_dev(div2, div1);
    			if_block0.m(div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, input0);
    			input0.checked = input0.__value === /*scoops*/ ctx[1];
    			append_dev(li0, t3);
    			append_dev(li0, label0);
    			append_dev(label0, img0);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, input1);
    			input1.checked = input1.__value === /*scoops*/ ctx[1];
    			append_dev(li1, t5);
    			append_dev(li1, label1);
    			append_dev(label1, img1_1);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, input2);
    			input2.checked = input2.__value === /*scoops*/ ctx[1];
    			append_dev(li2, t7);
    			append_dev(li2, label2);
    			append_dev(label2, img2_1);
    			append_dev(ul, t8);
    			append_dev(ul, li3);
    			append_dev(li3, input3);
    			input3.checked = input3.__value === /*scoops*/ ctx[1];
    			append_dev(li3, t9);
    			append_dev(li3, label3);
    			append_dev(label3, img3_1);
    			append_dev(div2, t10);
    			append_dev(div2, span0);
    			append_dev(div11, t12);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div5);
    			append_dev(div5, h1);
    			append_dev(div5, t14);
    			append_dev(div5, div4);
    			append_dev(div4, span1);
    			append_dev(div4, t18);
    			append_dev(div4, div3);
    			append_dev(div9, t22);
    			append_dev(div9, div6);
    			append_dev(div9, t24);
    			append_dev(div9, p);
    			append_dev(div9, t26);
    			if_block1.m(div9, null);
    			append_dev(div9, t27);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, span2);
    			append_dev(div7, t29);
    			append_dev(div7, span3);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button, "click", /*cerrarvisible*/ ctx[19], false, false, false),
    				listen_dev(input0, "change", /*input0_change_handler*/ ctx[32]),
    				listen_dev(input1, "change", /*input1_change_handler*/ ctx[34]),
    				listen_dev(input2, "change", /*input2_change_handler*/ ctx[35]),
    				listen_dev(input3, "change", /*input3_change_handler*/ ctx[36])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, t2);
    				}
    			}

    			if (dirty[0] & /*scoops*/ 2) {
    				input0.checked = input0.__value === /*scoops*/ ctx[1];
    			}

    			if (dirty[0] & /*scoops*/ 2) {
    				input1.checked = input1.__value === /*scoops*/ ctx[1];
    			}

    			if (dirty[0] & /*scoops*/ 2) {
    				input2.checked = input2.__value === /*scoops*/ ctx[1];
    			}

    			if (dirty[0] & /*scoops*/ 2) {
    				input3.checked = input3.__value === /*scoops*/ ctx[1];
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div9, t27);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div15);
    			if_block0.d();
    			/*$$binding_groups*/ ctx[33][0].splice(/*$$binding_groups*/ ctx[33][0].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[33][0].splice(/*$$binding_groups*/ ctx[33][0].indexOf(input1), 1);
    			/*$$binding_groups*/ ctx[33][0].splice(/*$$binding_groups*/ ctx[33][0].indexOf(input2), 1);
    			/*$$binding_groups*/ ctx[33][0].splice(/*$$binding_groups*/ ctx[33][0].indexOf(input3), 1);
    			if_block1.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(1277:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (1329:16) {:else}
    function create_else_block_1(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			if (img_1.src !== (img_1_src_value = `img/${/*img3*/ ctx[8]}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*name*/ ctx[4]);
    			attr_dev(img_1, "draggable", "false");
    			attr_dev(img_1, "class", "product-image svelte-1ecbd20");
    			set_style(img_1, "min-width", "auto");
    			set_style(img_1, "height", "auto");
    			set_style(img_1, "position", "relative");
    			set_style(img_1, "margin", "auto");
    			add_location(img_1, file$2, 1329, 18, 30395);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(1329:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1321:39) 
    function create_if_block_4(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			if (img_1.src !== (img_1_src_value = `img/${/*img2*/ ctx[7]}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*name*/ ctx[4]);
    			attr_dev(img_1, "draggable", "false");
    			attr_dev(img_1, "class", "product-image svelte-1ecbd20");
    			set_style(img_1, "min-width", "auto");
    			set_style(img_1, "height", "auto");
    			set_style(img_1, "position", "relative");
    			set_style(img_1, "margin", "auto");
    			add_location(img_1, file$2, 1321, 18, 30073);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(1321:39) ",
    		ctx
    	});

    	return block;
    }

    // (1313:39) 
    function create_if_block_3(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			if (img_1.src !== (img_1_src_value = `img/${/*img1*/ ctx[6]}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*name*/ ctx[4]);
    			attr_dev(img_1, "draggable", "false");
    			attr_dev(img_1, "class", "product-image svelte-1ecbd20");
    			set_style(img_1, "min-width", "auto");
    			set_style(img_1, "height", "auto");
    			set_style(img_1, "position", "relative");
    			set_style(img_1, "margin", "auto");
    			add_location(img_1, file$2, 1313, 18, 29735);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(1313:39) ",
    		ctx
    	});

    	return block;
    }

    // (1305:16) {#if scoops === 1}
    function create_if_block_2(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			if (img_1.src !== (img_1_src_value = `img/${/*img*/ ctx[5]}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*name*/ ctx[4]);
    			attr_dev(img_1, "draggable", "false");
    			attr_dev(img_1, "class", "product-image svelte-1ecbd20");
    			set_style(img_1, "min-width", "auto");
    			set_style(img_1, "height", "auto");
    			set_style(img_1, "position", "relative");
    			set_style(img_1, "margin", "auto");
    			add_location(img_1, file$2, 1305, 18, 29398);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(1305:16) {#if scoops === 1}",
    		ctx
    	});

    	return block;
    }

    // (1502:16) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let span;
    	let svg_1;
    	let g;
    	let path;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			svg_1 = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "data-name", "Path 154");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", /*svg*/ ctx[3]);
    			attr_dev(path, "class", "svelte-1ecbd20");
    			add_location(path, file$2, 1515, 26, 38059);
    			attr_dev(g, "data-name", "Group 120");
    			attr_dev(g, "transform", "translate(-288 -413.89)");
    			attr_dev(g, "class", "svelte-1ecbd20");
    			add_location(g, file$2, 1512, 24, 37916);
    			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg_1, "width", "14.4");
    			attr_dev(svg_1, "height", "12");
    			attr_dev(svg_1, "viewBox", "0 0 14.4 12");
    			attr_dev(svg_1, "class", "svelte-1ecbd20");
    			add_location(svg_1, file$2, 1507, 22, 37703);
    			attr_dev(span, "class", "button-icon svelte-1ecbd20");
    			add_location(span, file$2, 1506, 20, 37653);
    			attr_dev(button, "class", "button-general button-card .cart-button  svelte-1ecbd20");
    			add_location(button, file$2, 1502, 18, 37509);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(span, svg_1);
    			append_dev(svg_1, g);
    			append_dev(g, path);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*addToCart*/ ctx[16], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(1502:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1449:16) {#if inCart > 0}
    function create_if_block_1(ctx) {
    	let div;
    	let button0;
    	let svg0;
    	let rect0;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let button1;
    	let svg1;
    	let g;
    	let rect1;
    	let rect2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*inCart*/ ctx[2]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			g = svg_element("g");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			attr_dev(rect0, "data-name", "Rectangle 522");
    			attr_dev(rect0, "width", "12");
    			attr_dev(rect0, "height", "2");
    			attr_dev(rect0, "rx", "1");
    			attr_dev(rect0, "fill", "currentColor");
    			attr_dev(rect0, "class", "svelte-1ecbd20");
    			add_location(rect0, file$2, 1458, 24, 35697);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "12px");
    			attr_dev(svg0, "height", "2px");
    			attr_dev(svg0, "viewBox", "0 0 12 2");
    			attr_dev(svg0, "class", "svelte-1ecbd20");
    			add_location(svg0, file$2, 1453, 22, 35486);
    			attr_dev(button0, "class", "add Counterstyle__CounterButton-sc-14ahato-1 bPmfin svelte-1ecbd20");
    			add_location(button0, file$2, 1450, 20, 35318);
    			attr_dev(span, "class", "Counterstyle__CounterValue-sc-14ahato-2 dMHyRK svelte-1ecbd20");
    			add_location(span, file$2, 1466, 20, 35998);
    			attr_dev(rect1, "data-name", "Rectangle 520");
    			attr_dev(rect1, "width", "12");
    			attr_dev(rect1, "height", "2");
    			attr_dev(rect1, "rx", "1");
    			attr_dev(rect1, "transform", "translate(1367 195)");
    			attr_dev(rect1, "fill", "currentColor");
    			attr_dev(rect1, "class", "svelte-1ecbd20");
    			add_location(rect1, file$2, 1482, 26, 36728);
    			attr_dev(rect2, "data-name", "Rectangle 521");
    			attr_dev(rect2, "width", "12");
    			attr_dev(rect2, "height", "2");
    			attr_dev(rect2, "rx", "1");
    			attr_dev(rect2, "transform", "translate(1374 190) rotate(90)");
    			attr_dev(rect2, "fill", "currentColor");
    			attr_dev(rect2, "class", "svelte-1ecbd20");
    			add_location(rect2, file$2, 1489, 26, 37045);
    			attr_dev(g, "id", "Group_3351");
    			attr_dev(g, "data-name", "Group 3351");
    			attr_dev(g, "transform", "translate(-1367 -190)");
    			attr_dev(g, "class", "svelte-1ecbd20");
    			add_location(g, file$2, 1478, 24, 36543);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "12px");
    			attr_dev(svg1, "height", "12px");
    			attr_dev(svg1, "viewBox", "0 0 12 12");
    			attr_dev(svg1, "class", "svelte-1ecbd20");
    			add_location(svg1, file$2, 1473, 22, 36330);
    			attr_dev(button1, "class", " Counterstyle__CounterButton-sc-14ahato-1 bPmfin svelte-1ecbd20");
    			add_location(button1, file$2, 1470, 20, 36165);
    			attr_dev(div, "class", "Counterstyle__CounterBox-sc-14ahato-0 fmEddu svelte-1ecbd20");
    			add_location(div, file$2, 1449, 18, 35238);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, rect0);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			append_dev(div, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, g);
    			append_dev(g, rect1);
    			append_dev(g, rect2);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*countButtonHandler*/ ctx[17], false, false, false),
    				listen_dev(button1, "click", /*countButtonHandler*/ ctx[17], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*inCart*/ 4) set_data_dev(t1, /*inCart*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(1449:16) {#if inCart > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div7;
    	let div6;
    	let div5;
    	let div4;
    	let div0;
    	let img_1;
    	let img_1_src_value;
    	let t0;
    	let span0;
    	let t2;
    	let div3;
    	let h3;
    	let t4;
    	let span1;
    	let t6;
    	let div2;
    	let div1;
    	let span2;
    	let t9;
    	let t10;
    	let if_block1_anchor;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*inCart*/ ctx[2] > 0) return create_if_block_5;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*visible*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			img_1 = element("img");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = `${/*oferta*/ ctx[13]}`;
    			t2 = space();
    			div3 = element("div");
    			h3 = element("h3");
    			h3.textContent = `${/*name*/ ctx[4]}`;
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = `${/*marca*/ ctx[10]}`;
    			t6 = space();
    			div2 = element("div");
    			div1 = element("div");
    			span2 = element("span");
    			span2.textContent = `S/${/*precio*/ ctx[11]}`;
    			t9 = space();
    			if_block0.c();
    			t10 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			if (img_1.src !== (img_1_src_value = `img/${/*img*/ ctx[5]}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*name*/ ctx[4]);
    			attr_dev(img_1, "class", "svelte-1ecbd20");
    			add_location(img_1, file$2, 1171, 10, 24583);
    			attr_dev(span0, "class", "ProductCardstyle__DiscountPercent-sc-14yo7ej-3 jYDToY svelte-1ecbd20");
    			add_location(span0, file$2, 1173, 10, 24634);
    			attr_dev(div0, "class", "ProductCardstyle__ProductImageWrapper-sc-14yo7ej-1 ghRfMn svelte-1ecbd20");
    			add_location(div0, file$2, 1167, 8, 24452);
    			attr_dev(h3, "class", "product-title svelte-1ecbd20");
    			add_location(h3, file$2, 1180, 10, 24847);
    			attr_dev(span1, "class", "product-weight svelte-1ecbd20");
    			add_location(span1, file$2, 1182, 10, 24898);
    			attr_dev(span2, "class", "product-price svelte-1ecbd20");
    			add_location(span2, file$2, 1186, 14, 25044);
    			attr_dev(div1, "class", "productPriceWrapper svelte-1ecbd20");
    			add_location(div1, file$2, 1185, 12, 24995);
    			attr_dev(div2, "class", "product-meta svelte-1ecbd20");
    			add_location(div2, file$2, 1184, 10, 24955);
    			attr_dev(div3, "class", "ProductCardstyle__ProductInfo-sc-14yo7ej-4 dIPXl svelte-1ecbd20");
    			add_location(div3, file$2, 1178, 8, 24771);
    			attr_dev(div4, "class", "ProductCardstyle__ProductCardWrapper-sc-14yo7ej-0 dHUSDJ\r\n        product-card svelte-1ecbd20");
    			add_location(div4, file$2, 1164, 6, 24341);
    			attr_dev(div5, "class", "react-reveal ancho svelte-1ecbd20");
    			set_style(div5, "animation-fill-mode", "both");
    			set_style(div5, "animation-duration", "800ms");
    			set_style(div5, "animation-delay", "0ms");
    			set_style(div5, "animation-iteration-count", "1");
    			set_style(div5, "opacity", "1");
    			set_style(div5, "animation-name", "react-reveal-251371714274058-1");
    			add_location(div5, file$2, 1159, 4, 24099);
    			attr_dev(div6, "class", "Productsstyle__ProductCardWrapper-p6azvq-7 rheIJ svelte-1ecbd20");
    			add_location(div6, file$2, 1158, 2, 24031);
    			attr_dev(div7, "class", "Productsstyle__ProductsCol-p6azvq-2 irboLw svelte-1ecbd20");
    			add_location(div7, file$2, 1157, 0, 23971);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, img_1);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, h3);
    			append_dev(div3, t4);
    			append_dev(div3, span1);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, span2);
    			append_dev(div2, t9);
    			if_block0.m(div2, null);
    			insert_dev(target, t10, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(div0, "click", /*abrirvisible*/ ctx[18], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div2, null);
    				}
    			}

    			if (/*visible*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			if_block0.d();
    			if (detaching) detach_dev(t10);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
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
    	let showModal = false;
    	let visible = false;
    	let scoops = 1;
    	let svg = "M298.7,418.289l-2.906-4.148a.835.835,0,0,0-.528-.251.607.607,0,0,0-.529.251l-2.905,4.148h-3.17a.609.609,0,0,0-.661.625v.191l1.651,5.84a1.336,1.336,0,0,0,1.255.945h8.588a1.261,1.261,0,0,0,1.254-.945l1.651-5.84v-.191a.609.609,0,0,0-.661-.625Zm-5.419,0,1.984-2.767,1.98,2.767Zm1.984,5.024a1.258,1.258,0,1,1,1.319-1.258,1.3,1.3,0,0,1-1.319,1.258Zm0,0";
    	let soles = "$";
    	let { item } = $$props;
    	let { name, img, img1, img2, img3, descripcion, marca, ancho, profundidad, alto, material, Tipodeconexión, peso, precio, precioantes, oferta, categoriageneral, categoria, count } = item;
    	const cartItems = get_store_value(cart);
    	let inCart = cartItems[name] ? cartItems[name].count : 0;

    	function addToCart() {
    		$$invalidate(2, inCart++, inCart);

    		cart.update(n => {
    			return { ...n, [name]: { ...item, count: inCart } };
    		});
    	}

    	const countButtonHandler = e => {
    		if (e.target.classList.contains("add")) {
    			$$invalidate(2, inCart--, inCart);
    		} else if (inCart >= 1) {
    			$$invalidate(2, inCart++, inCart);
    		}

    		cart.update(n => {
    			return { ...n, [name]: { ...item, count: inCart } };
    		});
    	};

    	const abrirvisible = () => {
    		$$invalidate(0, visible = true);
    	};

    	const cerrarvisible = () => {
    		$$invalidate(0, visible = false);
    		checkedOut = true;

    		cart.update(n => {
    			return {};
    		});
    	};

    	const writable_props = ["item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Card", $$slots, []);
    	const $$binding_groups = [[]];

    	function input0_change_handler() {
    		scoops = this.__value;
    		$$invalidate(1, scoops);
    	}

    	function input1_change_handler() {
    		scoops = this.__value;
    		$$invalidate(1, scoops);
    	}

    	function input2_change_handler() {
    		scoops = this.__value;
    		$$invalidate(1, scoops);
    	}

    	function input3_change_handler() {
    		scoops = this.__value;
    		$$invalidate(1, scoops);
    	}

    	$$self.$set = $$props => {
    		if ("item" in $$props) $$invalidate(20, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		get: get_store_value,
    		cart,
    		fade,
    		fly,
    		Modal,
    		CardDescripcion,
    		showModal,
    		visible,
    		scoops,
    		svg,
    		soles,
    		item,
    		name,
    		img,
    		img1,
    		img2,
    		img3,
    		descripcion,
    		marca,
    		ancho,
    		profundidad,
    		alto,
    		material,
    		Tipodeconexión,
    		peso,
    		precio,
    		precioantes,
    		oferta,
    		categoriageneral,
    		categoria,
    		count,
    		cartItems,
    		inCart,
    		addToCart,
    		countButtonHandler,
    		abrirvisible,
    		cerrarvisible,
    		doubled
    	});

    	$$self.$inject_state = $$props => {
    		if ("showModal" in $$props) showModal = $$props.showModal;
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("scoops" in $$props) $$invalidate(1, scoops = $$props.scoops);
    		if ("svg" in $$props) $$invalidate(3, svg = $$props.svg);
    		if ("soles" in $$props) soles = $$props.soles;
    		if ("item" in $$props) $$invalidate(20, item = $$props.item);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    		if ("img" in $$props) $$invalidate(5, img = $$props.img);
    		if ("img1" in $$props) $$invalidate(6, img1 = $$props.img1);
    		if ("img2" in $$props) $$invalidate(7, img2 = $$props.img2);
    		if ("img3" in $$props) $$invalidate(8, img3 = $$props.img3);
    		if ("descripcion" in $$props) $$invalidate(9, descripcion = $$props.descripcion);
    		if ("marca" in $$props) $$invalidate(10, marca = $$props.marca);
    		if ("ancho" in $$props) ancho = $$props.ancho;
    		if ("profundidad" in $$props) profundidad = $$props.profundidad;
    		if ("alto" in $$props) alto = $$props.alto;
    		if ("material" in $$props) material = $$props.material;
    		if ("Tipodeconexión" in $$props) Tipodeconexión = $$props.Tipodeconexión;
    		if ("peso" in $$props) peso = $$props.peso;
    		if ("precio" in $$props) $$invalidate(11, precio = $$props.precio);
    		if ("precioantes" in $$props) $$invalidate(12, precioantes = $$props.precioantes);
    		if ("oferta" in $$props) $$invalidate(13, oferta = $$props.oferta);
    		if ("categoriageneral" in $$props) $$invalidate(14, categoriageneral = $$props.categoriageneral);
    		if ("categoria" in $$props) $$invalidate(15, categoria = $$props.categoria);
    		if ("count" in $$props) count = $$props.count;
    		if ("inCart" in $$props) $$invalidate(2, inCart = $$props.inCart);
    		if ("doubled" in $$props) doubled = $$props.doubled;
    	};

    	let doubled;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*inCart*/ 4) {
    			 doubled = inCart * precio;
    		}
    	};

    	return [
    		visible,
    		scoops,
    		inCart,
    		svg,
    		name,
    		img,
    		img1,
    		img2,
    		img3,
    		descripcion,
    		marca,
    		precio,
    		precioantes,
    		oferta,
    		categoriageneral,
    		categoria,
    		addToCart,
    		countButtonHandler,
    		abrirvisible,
    		cerrarvisible,
    		item,
    		doubled,
    		showModal,
    		soles,
    		ancho,
    		profundidad,
    		alto,
    		material,
    		Tipodeconexión,
    		peso,
    		count,
    		cartItems,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler,
    		input2_change_handler,
    		input3_change_handler
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { item: 20 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[20] === undefined && !("item" in props)) {
    			console.warn("<Card> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Card2.svelte generated by Svelte v3.20.1 */
    const file$3 = "src\\components\\Card2.svelte";

    // (1445:8) {:else}
    function create_else_block_2$1(ctx) {
    	let button;
    	let span;
    	let svg_1;
    	let g;
    	let path;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			svg_1 = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "data-name", "Path 154");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", /*svg*/ ctx[5]);
    			attr_dev(path, "class", "svelte-1wbid1h");
    			add_location(path, file$3, 1456, 18, 33653);
    			attr_dev(g, "data-name", "Group 120");
    			attr_dev(g, "transform", "translate(-288 -413.89)");
    			attr_dev(g, "class", "svelte-1wbid1h");
    			add_location(g, file$3, 1455, 16, 33572);
    			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg_1, "width", "14.4");
    			attr_dev(svg_1, "height", "12");
    			attr_dev(svg_1, "viewBox", "0 0 14.4 12");
    			attr_dev(svg_1, "class", "svelte-1wbid1h");
    			add_location(svg_1, file$3, 1450, 14, 33399);
    			attr_dev(span, "class", "button-icon svelte-1wbid1h");
    			add_location(span, file$3, 1449, 12, 33357);
    			attr_dev(button, "class", "button-general button-card .cart-button  svelte-1wbid1h");
    			add_location(button, file$3, 1445, 10, 33237);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(span, svg_1);
    			append_dev(svg_1, g);
    			append_dev(g, path);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*addToCart*/ ctx[18], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$1.name,
    		type: "else",
    		source: "(1445:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1394:8) {#if inCart > 0}
    function create_if_block_5$1(ctx) {
    	let div;
    	let button0;
    	let svg0;
    	let rect0;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let button1;
    	let svg1;
    	let g;
    	let rect1;
    	let rect2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*inCart*/ ctx[3]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			g = svg_element("g");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			attr_dev(rect0, "data-name", "Rectangle 522");
    			attr_dev(rect0, "width", "12");
    			attr_dev(rect0, "height", "2");
    			attr_dev(rect0, "rx", "1");
    			attr_dev(rect0, "fill", "currentColor");
    			attr_dev(rect0, "class", "svelte-1wbid1h");
    			add_location(rect0, file$3, 1403, 16, 31787);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "12px");
    			attr_dev(svg0, "height", "2px");
    			attr_dev(svg0, "viewBox", "0 0 12 2");
    			attr_dev(svg0, "class", "svelte-1wbid1h");
    			add_location(svg0, file$3, 1398, 14, 31616);
    			attr_dev(button0, "class", " add Counterstyle__CounterButton-sc-14ahato-1 bIQMmh svelte-1wbid1h");
    			add_location(button0, file$3, 1395, 12, 31471);
    			attr_dev(span, "class", "Counterstyle__CounterValue-sc-14ahato-2 dMHyRK svelte-1wbid1h");
    			add_location(span, file$3, 1411, 12, 32024);
    			attr_dev(rect1, "data-name", "Rectangle 520");
    			attr_dev(rect1, "width", "12");
    			attr_dev(rect1, "height", "2");
    			attr_dev(rect1, "rx", "1");
    			attr_dev(rect1, "transform", "translate(1367 195)");
    			attr_dev(rect1, "fill", "currentColor");
    			attr_dev(rect1, "class", "svelte-1wbid1h");
    			add_location(rect1, file$3, 1426, 18, 32610);
    			attr_dev(rect2, "data-name", "Rectangle 521");
    			attr_dev(rect2, "width", "12");
    			attr_dev(rect2, "height", "2");
    			attr_dev(rect2, "rx", "1");
    			attr_dev(rect2, "transform", "translate(1374 190) rotate(90)");
    			attr_dev(rect2, "fill", "currentColor");
    			attr_dev(rect2, "class", "svelte-1wbid1h");
    			add_location(rect2, file$3, 1433, 18, 32871);
    			attr_dev(g, "id", "Group_3351");
    			attr_dev(g, "data-name", "Group 3351");
    			attr_dev(g, "transform", "translate(-1367 -190)");
    			attr_dev(g, "class", "svelte-1wbid1h");
    			add_location(g, file$3, 1422, 16, 32457);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "12px");
    			attr_dev(svg1, "height", "12px");
    			attr_dev(svg1, "viewBox", "0 0 12 12");
    			attr_dev(svg1, "class", "svelte-1wbid1h");
    			add_location(svg1, file$3, 1417, 14, 32284);
    			attr_dev(button1, "class", "Counterstyle__CounterButton-sc-14ahato-1 bIQMmh svelte-1wbid1h");
    			add_location(button1, file$3, 1414, 12, 32144);
    			attr_dev(div, "class", "Counterstyle__CounterBox-sc-14ahato-0 eIGyji svelte-1wbid1h");
    			add_location(div, file$3, 1394, 10, 31399);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, rect0);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			append_dev(div, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, g);
    			append_dev(g, rect1);
    			append_dev(g, rect2);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*countButtonHandler*/ ctx[19], false, false, false),
    				listen_dev(button1, "click", /*countButtonHandler*/ ctx[19], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*inCart*/ 8) set_data_dev(t1, /*inCart*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(1394:8) {#if inCart > 0}",
    		ctx
    	});

    	return block;
    }

    // (1509:0) {#if visible}
    function create_if_block$2(ctx) {
    	let div0;
    	let t0;
    	let div15;
    	let div14;
    	let div13;
    	let button;
    	let svg_1;
    	let path;
    	let t1;
    	let div12;
    	let div11;
    	let div2;
    	let div1;
    	let t2;
    	let ul;
    	let li0;
    	let input0;
    	let input0_value_value;
    	let t3;
    	let label0;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let li1;
    	let input1;
    	let input1_value_value;
    	let t5;
    	let label1;
    	let img1_1;
    	let img1_1_src_value;
    	let t6;
    	let li2;
    	let input2;
    	let input2_value_value;
    	let t7;
    	let label2;
    	let img2_1;
    	let img2_1_src_value;
    	let t8;
    	let li3;
    	let input3;
    	let input3_value_value;
    	let t9;
    	let label3;
    	let img3_1;
    	let img3_1_src_value;
    	let t10;
    	let span0;
    	let t12;
    	let div10;
    	let div9;
    	let div5;
    	let h1;
    	let t13_value = /*item*/ ctx[0].name + "";
    	let t13;
    	let t14;
    	let div4;
    	let span1;
    	let t18;
    	let div3;
    	let t22;
    	let div6;
    	let t24;
    	let p;
    	let t26;
    	let t27;
    	let div8;
    	let div7;
    	let span2;
    	let t29;
    	let span3;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*scoops*/ ctx[2] === 1) return create_if_block_2$1;
    		if (/*scoops*/ ctx[2] === 2) return create_if_block_3$1;
    		if (/*scoops*/ ctx[2] === 3) return create_if_block_4$1;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*inCart*/ ctx[3] > 0) return create_if_block_1$1;
    		return create_else_block$2;
    	}

    	let current_block_type_1 = select_block_type_2(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			button = element("button");
    			svg_1 = svg_element("svg");
    			path = svg_element("path");
    			t1 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if_block0.c();
    			t2 = space();
    			ul = element("ul");
    			li0 = element("li");
    			input0 = element("input");
    			t3 = space();
    			label0 = element("label");
    			img0 = element("img");
    			t4 = space();
    			li1 = element("li");
    			input1 = element("input");
    			t5 = space();
    			label1 = element("label");
    			img1_1 = element("img");
    			t6 = space();
    			li2 = element("li");
    			input2 = element("input");
    			t7 = space();
    			label2 = element("label");
    			img2_1 = element("img");
    			t8 = space();
    			li3 = element("li");
    			input3 = element("input");
    			t9 = space();
    			label3 = element("label");
    			img3_1 = element("img");
    			t10 = space();
    			span0 = element("span");
    			span0.textContent = `${/*oferta*/ ctx[15]}`;
    			t12 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div5 = element("div");
    			h1 = element("h1");
    			t13 = text(t13_value);
    			t14 = space();
    			div4 = element("div");
    			span1 = element("span");

    			span1.textContent = `
                      s/${/*precioantes*/ ctx[14]}.00
                    `;

    			t18 = space();
    			div3 = element("div");

    			div3.textContent = `
                      S/${/*precio*/ ctx[13]}.00
                    `;

    			t22 = space();
    			div6 = element("div");
    			div6.textContent = `${/*marca*/ ctx[12]}`;
    			t24 = space();
    			p = element("p");
    			p.textContent = `${/*descripcion*/ ctx[11]}`;
    			t26 = space();
    			if_block1.c();
    			t27 = space();
    			div8 = element("div");
    			div7 = element("div");
    			span2 = element("span");
    			span2.textContent = `${/*categoriageneral*/ ctx[16]}`;
    			t29 = space();
    			span3 = element("span");
    			span3.textContent = `${/*categoria*/ ctx[17]}`;
    			attr_dev(div0, "class", "reuseModalOverlay quick-view-overlay svelte-1wbid1h");
    			add_location(div0, file$3, 1509, 2, 35433);
    			attr_dev(path, "data-name", "_ionicons_svg_ios-close (5)");
    			attr_dev(path, "d", "M166.686,165.55l3.573-3.573a.837.837,0,0,0-1.184-1.184l-3.573,3.573-3.573-3.573a.837.837,0,1,0-1.184,1.184l3.573,3.573-3.573,3.573a.837.837,0,0,0,1.184,1.184l3.573-3.573,3.573,3.573a.837.837,0,0,0,1.184-1.184Z");
    			attr_dev(path, "transform", "translate(-160.5 -160.55)");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "class", "svelte-1wbid1h");
    			add_location(path, file$3, 1521, 12, 35914);
    			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg_1, "width", "10.003");
    			attr_dev(svg_1, "height", "10");
    			attr_dev(svg_1, "viewBox", "0 0 10.003 10");
    			attr_dev(svg_1, "class", "svelte-1wbid1h");
    			add_location(svg_1, file$3, 1516, 10, 35757);
    			attr_dev(button, "class", "QuickViewstyle__ModalClose-sc-28ycgw-19 fBqntg svelte-1wbid1h");
    			add_location(button, file$3, 1513, 8, 35635);
    			attr_dev(input0, "id", "vista");
    			attr_dev(input0, "class", "opcion svelte-1wbid1h");
    			attr_dev(input0, "type", "radio");
    			input0.__value = input0_value_value = 1;
    			input0.value = input0.__value;
    			/*$$binding_groups*/ ctx[33][0].push(input0);
    			add_location(input0, file$3, 1575, 20, 38333);
    			if (img0.src !== (img0_src_value = `img/${/*img*/ ctx[7]}`)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", /*name*/ ctx[6]);
    			attr_dev(img0, "draggable", "false");
    			set_style(img0, "width", "100%");
    			set_style(img0, "height", "100%");
    			set_style(img0, "position", "relative");
    			attr_dev(img0, "class", "svelte-1wbid1h");
    			add_location(img0, file$3, 1582, 22, 38612);
    			attr_dev(label0, "class", "vista-cursor svelte-1wbid1h");
    			attr_dev(label0, "for", "vista");
    			add_location(label0, file$3, 1581, 20, 38548);
    			attr_dev(li0, "data-index", "0");
    			attr_dev(li0, "class", "MultiCarousel__SingleItem-sc-1l8qqrp-0 hkJujT\r\n                    custom-dot custom-dot false svelte-1wbid1h");
    			add_location(li0, file$3, 1571, 18, 38147);
    			attr_dev(input1, "id", "vista1");
    			attr_dev(input1, "class", "opcion svelte-1wbid1h");
    			attr_dev(input1, "type", "radio");
    			input1.__value = input1_value_value = 2;
    			input1.value = input1.__value;
    			/*$$binding_groups*/ ctx[33][0].push(input1);
    			add_location(input1, file$3, 1593, 20, 39072);
    			if (img1_1.src !== (img1_1_src_value = `img/${/*img1*/ ctx[8]}`)) attr_dev(img1_1, "src", img1_1_src_value);
    			attr_dev(img1_1, "alt", /*name*/ ctx[6]);
    			attr_dev(img1_1, "draggable", "false");
    			set_style(img1_1, "width", "100%");
    			set_style(img1_1, "height", "100%");
    			set_style(img1_1, "position", "relative");
    			attr_dev(img1_1, "class", "svelte-1wbid1h");
    			add_location(img1_1, file$3, 1600, 22, 39353);
    			attr_dev(label1, "class", "vista-cursor svelte-1wbid1h");
    			attr_dev(label1, "for", "vista1");
    			add_location(label1, file$3, 1599, 20, 39288);
    			attr_dev(li1, "data-index", "1");
    			attr_dev(li1, "class", "MultiCarousel__SingleItem-sc-1l8qqrp-0 hkJujT\r\n                    custom-dot false svelte-1wbid1h");
    			add_location(li1, file$3, 1589, 18, 38897);
    			attr_dev(input2, "id", "vista2");
    			attr_dev(input2, "class", "opcion svelte-1wbid1h");
    			attr_dev(input2, "type", "radio");
    			input2.__value = input2_value_value = 3;
    			input2.value = input2.__value;
    			/*$$binding_groups*/ ctx[33][0].push(input2);
    			add_location(input2, file$3, 1611, 20, 39814);
    			if (img2_1.src !== (img2_1_src_value = `img/${/*img2*/ ctx[9]}`)) attr_dev(img2_1, "src", img2_1_src_value);
    			attr_dev(img2_1, "alt", /*name*/ ctx[6]);
    			attr_dev(img2_1, "draggable", "false");
    			set_style(img2_1, "width", "100%");
    			set_style(img2_1, "height", "100%");
    			set_style(img2_1, "position", "relative");
    			attr_dev(img2_1, "class", "svelte-1wbid1h");
    			add_location(img2_1, file$3, 1618, 22, 40095);
    			attr_dev(label2, "class", "vista-cursor svelte-1wbid1h");
    			attr_dev(label2, "for", "vista2");
    			add_location(label2, file$3, 1617, 20, 40030);
    			attr_dev(li2, "data-index", "2");
    			attr_dev(li2, "class", "MultiCarousel__SingleItem-sc-1l8qqrp-0 hkJujT\r\n                    custom-dot false svelte-1wbid1h");
    			add_location(li2, file$3, 1607, 18, 39639);
    			attr_dev(input3, "id", "vista3");
    			attr_dev(input3, "class", "opcion svelte-1wbid1h");
    			attr_dev(input3, "type", "radio");
    			input3.__value = input3_value_value = 4;
    			input3.value = input3.__value;
    			/*$$binding_groups*/ ctx[33][0].push(input3);
    			add_location(input3, file$3, 1629, 20, 40556);
    			if (img3_1.src !== (img3_1_src_value = `img/${/*img3*/ ctx[10]}`)) attr_dev(img3_1, "src", img3_1_src_value);
    			attr_dev(img3_1, "alt", /*name*/ ctx[6]);
    			attr_dev(img3_1, "draggable", "false");
    			set_style(img3_1, "width", "100%");
    			set_style(img3_1, "height", "100%");
    			set_style(img3_1, "position", "relative");
    			attr_dev(img3_1, "class", "svelte-1wbid1h");
    			add_location(img3_1, file$3, 1636, 22, 40837);
    			attr_dev(label3, "class", "vista-cursor svelte-1wbid1h");
    			attr_dev(label3, "for", "vista3");
    			add_location(label3, file$3, 1635, 20, 40772);
    			attr_dev(li3, "data-index", "3");
    			attr_dev(li3, "class", "MultiCarousel__SingleItem-sc-1l8qqrp-0 hkJujT\r\n                    custom-dot false svelte-1wbid1h");
    			add_location(li3, file$3, 1625, 18, 40381);
    			attr_dev(ul, "class", "react-multi-carousel-dot-list  svelte-1wbid1h");
    			add_location(ul, file$3, 1570, 16, 38084);
    			attr_dev(div1, "class", "react-multi-carousel-list carousel-with-custom-dots  svelte-1wbid1h");
    			add_location(div1, file$3, 1534, 14, 36643);
    			attr_dev(span0, "class", "QuickViewstyle__DiscountPercent-sc-28ycgw-4 jweBTn svelte-1wbid1h");
    			add_location(span0, file$3, 1646, 14, 41166);
    			attr_dev(div2, "class", "QuickViewstyle__ProductPreview-sc-28ycgw-2 fMlFIC svelte-1wbid1h");
    			add_location(div2, file$3, 1533, 12, 36564);
    			attr_dev(h1, "class", "QuickViewstyle__ProductTitle-sc-28ycgw-8 mqzOv svelte-1wbid1h");
    			add_location(h1, file$3, 1657, 18, 41645);
    			attr_dev(span1, "class", "QuickViewstyle__SalePrice-sc-28ycgw-11 hVvfEF svelte-1wbid1h");
    			add_location(span1, file$3, 1663, 20, 41914);
    			attr_dev(div3, "class", "QuickViewstyle__ProductPrice-sc-28ycgw-10 cqZYhV svelte-1wbid1h");
    			add_location(div3, file$3, 1666, 20, 42067);
    			attr_dev(div4, "class", "QuickViewstyle__ProductPriceWrapper-sc-28ycgw-9\r\n                    fbUCfN svelte-1wbid1h");
    			add_location(div4, file$3, 1660, 18, 41782);
    			attr_dev(div5, "class", "QuickViewstyle__ProductTitlePriceWrapper-sc-28ycgw-7\r\n                  kzoayf svelte-1wbid1h");
    			add_location(div5, file$3, 1654, 16, 41514);
    			attr_dev(div6, "class", "QuickViewstyle__ProductWeight-sc-28ycgw-12 btDBfe svelte-1wbid1h");
    			add_location(div6, file$3, 1672, 16, 42285);
    			attr_dev(p, "class", "QuickViewstyle__ProductDescription-sc-28ycgw-13 OLDqC svelte-1wbid1h");
    			add_location(p, file$3, 1675, 16, 42417);
    			attr_dev(span2, "class", "QuickViewstyle__MetaItem-sc-28ycgw-18 eLZhSZ svelte-1wbid1h");
    			add_location(span2, file$3, 1760, 20, 45964);
    			attr_dev(span3, "class", "QuickViewstyle__MetaItem-sc-28ycgw-18 eLZhSZ svelte-1wbid1h");
    			add_location(span3, file$3, 1763, 20, 46116);
    			attr_dev(div7, "class", "QuickViewstyle__MetaSingle-sc-28ycgw-17 CyALc svelte-1wbid1h");
    			add_location(div7, file$3, 1759, 18, 45883);
    			attr_dev(div8, "class", "QuickViewstyle__ProductMeta-sc-28ycgw-16 hmqfIE svelte-1wbid1h");
    			add_location(div8, file$3, 1758, 16, 45802);
    			attr_dev(div9, "class", "QuickViewstyle__ProductInfo-sc-28ycgw-6 hJAUJy svelte-1wbid1h");
    			add_location(div9, file$3, 1653, 14, 41436);
    			attr_dev(div10, "dir", "ltr");
    			attr_dev(div10, "class", "QuickViewstyle__ProductInfoWrapper-sc-28ycgw-5 DNQhx svelte-1wbid1h");
    			add_location(div10, file$3, 1650, 12, 41314);
    			attr_dev(div11, "class", "QuickViewstyle__ProductDetailsWrapper-sc-28ycgw-1 fOsizy\r\n            product-card svelte-1wbid1h");
    			attr_dev(div11, "dir", "ltr");
    			add_location(div11, file$3, 1529, 10, 36418);
    			attr_dev(div12, "class", "QuickViewstyle__QuickViewWrapper-sc-28ycgw-0 dJblge svelte-1wbid1h");
    			add_location(div12, file$3, 1528, 8, 36341);
    			attr_dev(div13, "class", "innerRndComponent svelte-1wbid1h");
    			add_location(div13, file$3, 1512, 6, 35594);
    			attr_dev(div14, "class", "reuseModalHolder quick-view-modal tamaño svelte-1wbid1h");
    			add_location(div14, file$3, 1511, 4, 35532);
    			attr_dev(div15, "class", "reuseModalParentWrapper svelte-1wbid1h");
    			add_location(div15, file$3, 1510, 2, 35489);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div15, anchor);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, button);
    			append_dev(button, svg_1);
    			append_dev(svg_1, path);
    			append_dev(div13, t1);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div2);
    			append_dev(div2, div1);
    			if_block0.m(div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, input0);
    			input0.checked = input0.__value === /*scoops*/ ctx[2];
    			append_dev(li0, t3);
    			append_dev(li0, label0);
    			append_dev(label0, img0);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, input1);
    			input1.checked = input1.__value === /*scoops*/ ctx[2];
    			append_dev(li1, t5);
    			append_dev(li1, label1);
    			append_dev(label1, img1_1);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, input2);
    			input2.checked = input2.__value === /*scoops*/ ctx[2];
    			append_dev(li2, t7);
    			append_dev(li2, label2);
    			append_dev(label2, img2_1);
    			append_dev(ul, t8);
    			append_dev(ul, li3);
    			append_dev(li3, input3);
    			input3.checked = input3.__value === /*scoops*/ ctx[2];
    			append_dev(li3, t9);
    			append_dev(li3, label3);
    			append_dev(label3, img3_1);
    			append_dev(div2, t10);
    			append_dev(div2, span0);
    			append_dev(div11, t12);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div5);
    			append_dev(div5, h1);
    			append_dev(h1, t13);
    			append_dev(div5, t14);
    			append_dev(div5, div4);
    			append_dev(div4, span1);
    			append_dev(div4, t18);
    			append_dev(div4, div3);
    			append_dev(div9, t22);
    			append_dev(div9, div6);
    			append_dev(div9, t24);
    			append_dev(div9, p);
    			append_dev(div9, t26);
    			if_block1.m(div9, null);
    			append_dev(div9, t27);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, span2);
    			append_dev(div7, t29);
    			append_dev(div7, span3);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button, "click", /*cerrarvisible*/ ctx[21], false, false, false),
    				listen_dev(input0, "change", /*input0_change_handler*/ ctx[32]),
    				listen_dev(input1, "change", /*input1_change_handler*/ ctx[34]),
    				listen_dev(input2, "change", /*input2_change_handler*/ ctx[35]),
    				listen_dev(input3, "change", /*input3_change_handler*/ ctx[36])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, t2);
    				}
    			}

    			if (dirty[0] & /*scoops*/ 4) {
    				input0.checked = input0.__value === /*scoops*/ ctx[2];
    			}

    			if (dirty[0] & /*scoops*/ 4) {
    				input1.checked = input1.__value === /*scoops*/ ctx[2];
    			}

    			if (dirty[0] & /*scoops*/ 4) {
    				input2.checked = input2.__value === /*scoops*/ ctx[2];
    			}

    			if (dirty[0] & /*scoops*/ 4) {
    				input3.checked = input3.__value === /*scoops*/ ctx[2];
    			}

    			if (dirty[0] & /*item*/ 1 && t13_value !== (t13_value = /*item*/ ctx[0].name + "")) set_data_dev(t13, t13_value);

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div9, t27);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div15);
    			if_block0.d();
    			/*$$binding_groups*/ ctx[33][0].splice(/*$$binding_groups*/ ctx[33][0].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[33][0].splice(/*$$binding_groups*/ ctx[33][0].indexOf(input1), 1);
    			/*$$binding_groups*/ ctx[33][0].splice(/*$$binding_groups*/ ctx[33][0].indexOf(input2), 1);
    			/*$$binding_groups*/ ctx[33][0].splice(/*$$binding_groups*/ ctx[33][0].indexOf(input3), 1);
    			if_block1.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(1509:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (1561:16) {:else}
    function create_else_block_1$1(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			if (img_1.src !== (img_1_src_value = `img/${/*img3*/ ctx[10]}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*name*/ ctx[6]);
    			attr_dev(img_1, "draggable", "false");
    			attr_dev(img_1, "class", "product-image svelte-1wbid1h");
    			set_style(img_1, "min-width", "auto");
    			set_style(img_1, "height", "auto");
    			set_style(img_1, "position", "relative");
    			set_style(img_1, "margin", "auto");
    			add_location(img_1, file$3, 1561, 18, 37764);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(1561:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1553:39) 
    function create_if_block_4$1(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			if (img_1.src !== (img_1_src_value = `img/${/*img2*/ ctx[9]}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*name*/ ctx[6]);
    			attr_dev(img_1, "draggable", "false");
    			attr_dev(img_1, "class", "product-image svelte-1wbid1h");
    			set_style(img_1, "min-width", "auto");
    			set_style(img_1, "height", "auto");
    			set_style(img_1, "position", "relative");
    			set_style(img_1, "margin", "auto");
    			add_location(img_1, file$3, 1553, 18, 37442);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(1553:39) ",
    		ctx
    	});

    	return block;
    }

    // (1545:39) 
    function create_if_block_3$1(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			if (img_1.src !== (img_1_src_value = `img/${/*img1*/ ctx[8]}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*name*/ ctx[6]);
    			attr_dev(img_1, "draggable", "false");
    			attr_dev(img_1, "class", "product-image svelte-1wbid1h");
    			set_style(img_1, "min-width", "auto");
    			set_style(img_1, "height", "auto");
    			set_style(img_1, "position", "relative");
    			set_style(img_1, "margin", "auto");
    			add_location(img_1, file$3, 1545, 18, 37104);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(1545:39) ",
    		ctx
    	});

    	return block;
    }

    // (1537:16) {#if scoops === 1}
    function create_if_block_2$1(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			if (img_1.src !== (img_1_src_value = `img/${/*img*/ ctx[7]}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*name*/ ctx[6]);
    			attr_dev(img_1, "draggable", "false");
    			attr_dev(img_1, "class", "product-image svelte-1wbid1h");
    			set_style(img_1, "min-width", "auto");
    			set_style(img_1, "height", "auto");
    			set_style(img_1, "position", "relative");
    			set_style(img_1, "margin", "auto");
    			add_location(img_1, file$3, 1537, 18, 36767);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(1537:16) {#if scoops === 1}",
    		ctx
    	});

    	return block;
    }

    // (1734:16) {:else}
    function create_else_block$2(ctx) {
    	let button;
    	let span;
    	let svg_1;
    	let g;
    	let path;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			svg_1 = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "data-name", "Path 154");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", /*svg*/ ctx[5]);
    			attr_dev(path, "class", "svelte-1wbid1h");
    			add_location(path, file$3, 1747, 26, 45433);
    			attr_dev(g, "data-name", "Group 120");
    			attr_dev(g, "transform", "translate(-288 -413.89)");
    			attr_dev(g, "class", "svelte-1wbid1h");
    			add_location(g, file$3, 1744, 24, 45290);
    			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg_1, "width", "14.4");
    			attr_dev(svg_1, "height", "12");
    			attr_dev(svg_1, "viewBox", "0 0 14.4 12");
    			attr_dev(svg_1, "class", "svelte-1wbid1h");
    			add_location(svg_1, file$3, 1739, 22, 45077);
    			attr_dev(span, "class", "button-icon svelte-1wbid1h");
    			add_location(span, file$3, 1738, 20, 45027);
    			attr_dev(button, "class", "button-general button-card .cart-button  svelte-1wbid1h");
    			add_location(button, file$3, 1734, 18, 44883);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(span, svg_1);
    			append_dev(svg_1, g);
    			append_dev(g, path);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*addToCart*/ ctx[18], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(1734:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1681:16) {#if inCart > 0}
    function create_if_block_1$1(ctx) {
    	let div;
    	let button0;
    	let svg0;
    	let rect0;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let button1;
    	let svg1;
    	let g;
    	let rect1;
    	let rect2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*inCart*/ ctx[3]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			g = svg_element("g");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			attr_dev(rect0, "data-name", "Rectangle 522");
    			attr_dev(rect0, "width", "12");
    			attr_dev(rect0, "height", "2");
    			attr_dev(rect0, "rx", "1");
    			attr_dev(rect0, "fill", "currentColor");
    			attr_dev(rect0, "class", "svelte-1wbid1h");
    			add_location(rect0, file$3, 1690, 24, 43071);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "12px");
    			attr_dev(svg0, "height", "2px");
    			attr_dev(svg0, "viewBox", "0 0 12 2");
    			attr_dev(svg0, "class", "svelte-1wbid1h");
    			add_location(svg0, file$3, 1685, 22, 42860);
    			attr_dev(button0, "class", "add Counterstyle__CounterButton-sc-14ahato-1 bPmfin svelte-1wbid1h");
    			add_location(button0, file$3, 1682, 20, 42692);
    			attr_dev(span, "class", "Counterstyle__CounterValue-sc-14ahato-2 dMHyRK svelte-1wbid1h");
    			add_location(span, file$3, 1698, 20, 43372);
    			attr_dev(rect1, "data-name", "Rectangle 520");
    			attr_dev(rect1, "width", "12");
    			attr_dev(rect1, "height", "2");
    			attr_dev(rect1, "rx", "1");
    			attr_dev(rect1, "transform", "translate(1367 195)");
    			attr_dev(rect1, "fill", "currentColor");
    			attr_dev(rect1, "class", "svelte-1wbid1h");
    			add_location(rect1, file$3, 1714, 26, 44102);
    			attr_dev(rect2, "data-name", "Rectangle 521");
    			attr_dev(rect2, "width", "12");
    			attr_dev(rect2, "height", "2");
    			attr_dev(rect2, "rx", "1");
    			attr_dev(rect2, "transform", "translate(1374 190) rotate(90)");
    			attr_dev(rect2, "fill", "currentColor");
    			attr_dev(rect2, "class", "svelte-1wbid1h");
    			add_location(rect2, file$3, 1721, 26, 44419);
    			attr_dev(g, "id", "Group_3351");
    			attr_dev(g, "data-name", "Group 3351");
    			attr_dev(g, "transform", "translate(-1367 -190)");
    			attr_dev(g, "class", "svelte-1wbid1h");
    			add_location(g, file$3, 1710, 24, 43917);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "12px");
    			attr_dev(svg1, "height", "12px");
    			attr_dev(svg1, "viewBox", "0 0 12 12");
    			attr_dev(svg1, "class", "svelte-1wbid1h");
    			add_location(svg1, file$3, 1705, 22, 43704);
    			attr_dev(button1, "class", " Counterstyle__CounterButton-sc-14ahato-1 bPmfin svelte-1wbid1h");
    			add_location(button1, file$3, 1702, 20, 43539);
    			attr_dev(div, "class", "Counterstyle__CounterBox-sc-14ahato-0 fmEddu svelte-1wbid1h");
    			add_location(div, file$3, 1681, 18, 42612);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, rect0);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			append_dev(div, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, g);
    			append_dev(g, rect1);
    			append_dev(g, rect2);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*countButtonHandler*/ ctx[19], false, false, false),
    				listen_dev(button1, "click", /*countButtonHandler*/ ctx[19], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*inCart*/ 8) set_data_dev(t1, /*inCart*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(1681:16) {#if inCart > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div8;
    	let div3;
    	let div2;
    	let div1;
    	let t0;
    	let img_1;
    	let img_1_src_value;
    	let img_1_alt_value;
    	let t1;
    	let div0;
    	let span0;
    	let t2_value = /*item*/ ctx[0].name + "";
    	let t2;
    	let t3;
    	let span1;
    	let t4;
    	let t5_value = /*item*/ ctx[0].precio + "";
    	let t5;
    	let t6;
    	let t7;
    	let span2;
    	let t8_value = /*item*/ ctx[0].marca + "";
    	let t8;
    	let t9;
    	let span3;
    	let t10;
    	let t11;
    	let t12;
    	let div5;
    	let div4;
    	let t13;
    	let div7;
    	let div6;
    	let t14;
    	let if_block1_anchor;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*inCart*/ ctx[3] > 0) return create_if_block_5$1;
    		return create_else_block_2$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*visible*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if_block0.c();
    			t0 = space();
    			img_1 = element("img");
    			t1 = space();
    			div0 = element("div");
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span1 = element("span");
    			t4 = text("S/.");
    			t5 = text(t5_value);
    			t6 = text(".00");
    			t7 = space();
    			span2 = element("span");
    			t8 = text(t8_value);
    			t9 = space();
    			span3 = element("span");
    			t10 = text("S./");
    			t11 = text(/*doubled*/ ctx[4]);
    			t12 = space();
    			div5 = element("div");
    			div4 = element("div");
    			t13 = space();
    			div7 = element("div");
    			div6 = element("div");
    			t14 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(img_1, "class", "CartItemstyle__Image-sc-1otw30s-2 fVHYzs svelte-1wbid1h");
    			if (img_1.src !== (img_1_src_value = `img/${/*item*/ ctx[0].img}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", img_1_alt_value = /*item*/ ctx[0].name);
    			add_location(img_1, file$3, 1464, 8, 33879);
    			attr_dev(span0, "class", "CartItemstyle__Name-sc-1otw30s-3 iUpewi svelte-1wbid1h");
    			add_location(span0, file$3, 1472, 10, 34170);
    			attr_dev(span1, "class", "CartItemstyle__Price-sc-1otw30s-4 effwGm svelte-1wbid1h");
    			add_location(span1, file$3, 1475, 10, 34280);
    			attr_dev(span2, "class", "CartItemstyle__Weight-sc-1otw30s-5 cYyRFl svelte-1wbid1h");
    			add_location(span2, file$3, 1478, 10, 34399);
    			attr_dev(div0, "class", "CartItemstyle__Information-sc-1otw30s-1 QZGNI svelte-1wbid1h");
    			add_location(div0, file$3, 1469, 8, 34053);
    			attr_dev(span3, "class", "CartItemstyle__Total-sc-1otw30s-6 cLjIxt svelte-1wbid1h");
    			add_location(span3, file$3, 1482, 8, 34526);
    			attr_dev(div1, "class", "CartItemstyle__ItemBox-sc-1otw30s-0 cEAUrG svelte-1wbid1h");
    			add_location(div1, file$3, 1391, 6, 31303);
    			attr_dev(div2, "class", "CartItemCardstyle__ItemWrapper-xuzuaf-4 bpIPBu items-wrapper svelte-1wbid1h");
    			add_location(div2, file$3, 1390, 4, 31221);
    			set_style(div3, "position", "relative");
    			set_style(div3, "overflow", "scroll");
    			set_style(div3, "margin-right", "-17px");
    			set_style(div3, "margin-bottom", "-17px");
    			set_style(div3, "min-height", "17px");
    			set_style(div3, "max-height", "calc(100vh + 17px)");
    			set_style(div3, "margin-left", "0px");
    			attr_dev(div3, "class", "svelte-1wbid1h");
    			add_location(div3, file$3, 1386, 2, 31038);
    			set_style(div4, "position", "relative");
    			set_style(div4, "display", "block");
    			set_style(div4, "height", "100%");
    			set_style(div4, "cursor", "pointer");
    			set_style(div4, "border-radius", "inherit");
    			set_style(div4, "background-color", "rgba(0, 0, 0, 0.2)");
    			set_style(div4, "width", "0px");
    			attr_dev(div4, "class", "svelte-1wbid1h");
    			add_location(div4, file$3, 1495, 4, 34877);
    			set_style(div5, "position", "absolute");
    			set_style(div5, "height", "6px");
    			set_style(div5, "transition", "opacity 200ms ease 0s");
    			set_style(div5, "opacity", "0");
    			set_style(div5, "right", "2px");
    			set_style(div5, "bottom", "2px");
    			set_style(div5, "left", "2px");
    			set_style(div5, "border-radius", "3px");
    			attr_dev(div5, "class", "svelte-1wbid1h");
    			add_location(div5, file$3, 1492, 2, 34712);
    			set_style(div6, "position", "relative");
    			set_style(div6, "display", "block");
    			set_style(div6, "width", "100%");
    			set_style(div6, "cursor", "pointer");
    			set_style(div6, "border-radius", "inherit");
    			set_style(div6, "background-color", "rgba(0, 0, 0, 0.2)");
    			set_style(div6, "height", "0px");
    			attr_dev(div6, "class", "svelte-1wbid1h");
    			add_location(div6, file$3, 1502, 4, 35224);
    			set_style(div7, "position", "absolute");
    			set_style(div7, "width", "6px");
    			set_style(div7, "transition", "opacity 200ms ease 0s");
    			set_style(div7, "opacity", "0");
    			set_style(div7, "right", "2px");
    			set_style(div7, "bottom", "2px");
    			set_style(div7, "top", "2px");
    			set_style(div7, "border-radius", "3px");
    			attr_dev(div7, "class", "svelte-1wbid1h");
    			add_location(div7, file$3, 1499, 2, 35061);
    			set_style(div8, "position", "relative");
    			set_style(div8, "overflow", "hidden");
    			set_style(div8, "width", "100%");
    			set_style(div8, "height", "auto");
    			set_style(div8, "min-height", "0px");
    			set_style(div8, "max-height", "100vh");
    			set_style(div8, "border-bottom", "1px solid rgb(247, 247,\r\n  247)");
    			set_style(div8, "font-family", "Lato, sans-serif");
    			attr_dev(div8, "class", "svelte-1wbid1h");
    			add_location(div8, file$3, 1382, 0, 30835);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, img_1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, span1);
    			append_dev(span1, t4);
    			append_dev(span1, t5);
    			append_dev(span1, t6);
    			append_dev(div0, t7);
    			append_dev(div0, span2);
    			append_dev(span2, t8);
    			append_dev(div1, t9);
    			append_dev(div1, span3);
    			append_dev(span3, t10);
    			append_dev(span3, t11);
    			append_dev(div8, t12);
    			append_dev(div8, div5);
    			append_dev(div5, div4);
    			append_dev(div8, t13);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			insert_dev(target, t14, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(img_1, "click", /*abrirvisible*/ ctx[20], false, false, false),
    				listen_dev(div0, "click", /*abrirvisible*/ ctx[20], false, false, false),
    				listen_dev(span3, "click", /*abrirvisible*/ ctx[20], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			}

    			if (dirty[0] & /*item*/ 1 && img_1.src !== (img_1_src_value = `img/${/*item*/ ctx[0].img}`)) {
    				attr_dev(img_1, "src", img_1_src_value);
    			}

    			if (dirty[0] & /*item*/ 1 && img_1_alt_value !== (img_1_alt_value = /*item*/ ctx[0].name)) {
    				attr_dev(img_1, "alt", img_1_alt_value);
    			}

    			if (dirty[0] & /*item*/ 1 && t2_value !== (t2_value = /*item*/ ctx[0].name + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*item*/ 1 && t5_value !== (t5_value = /*item*/ ctx[0].precio + "")) set_data_dev(t5, t5_value);
    			if (dirty[0] & /*item*/ 1 && t8_value !== (t8_value = /*item*/ ctx[0].marca + "")) set_data_dev(t8, t8_value);
    			if (dirty[0] & /*doubled*/ 16) set_data_dev(t11, /*doubled*/ ctx[4]);

    			if (/*visible*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if_block0.d();
    			if (detaching) detach_dev(t14);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			run_all(dispose);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let showModal = false;
    	let visible = false;
    	let scoops = 1;
    	let svg = "M298.7,418.289l-2.906-4.148a.835.835,0,0,0-.528-.251.607.607,0,0,0-.529.251l-2.905,4.148h-3.17a.609.609,0,0,0-.661.625v.191l1.651,5.84a1.336,1.336,0,0,0,1.255.945h8.588a1.261,1.261,0,0,0,1.254-.945l1.651-5.84v-.191a.609.609,0,0,0-.661-.625Zm-5.419,0,1.984-2.767,1.98,2.767Zm1.984,5.024a1.258,1.258,0,1,1,1.319-1.258,1.3,1.3,0,0,1-1.319,1.258Zm0,0";
    	let soles = "$";
    	let { item } = $$props;
    	let { name, img, img1, img2, img3, descripcion, marca, ancho, profundidad, alto, material, Tipodeconexión, peso, precio, precioantes, oferta, categoriageneral, categoria, count } = item;
    	const cartItems = get_store_value(cart);
    	let inCart = cartItems[name] ? cartItems[name].count : 0;

    	function addToCart() {
    		$$invalidate(3, inCart++, inCart);

    		cart.update(n => {
    			return { ...n, [name]: { ...item, count: inCart } };
    		});
    	}

    	const countButtonHandler = e => {
    		if (e.target.classList.contains("add")) {
    			$$invalidate(3, inCart--, inCart);
    		} else if (inCart >= 1) {
    			$$invalidate(3, inCart++, inCart);
    		}

    		cart.update(n => {
    			return { ...n, [name]: { ...item, count: inCart } };
    		});
    	};

    	const abrirvisible = () => {
    		$$invalidate(1, visible = true);
    	};

    	const cerrarvisible = () => {
    		$$invalidate(1, visible = false);
    		checkedOut = true;

    		cart.update(n => {
    			return {};
    		});
    	};

    	const writable_props = ["item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card2> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Card2", $$slots, []);
    	const $$binding_groups = [[]];

    	function input0_change_handler() {
    		scoops = this.__value;
    		$$invalidate(2, scoops);
    	}

    	function input1_change_handler() {
    		scoops = this.__value;
    		$$invalidate(2, scoops);
    	}

    	function input2_change_handler() {
    		scoops = this.__value;
    		$$invalidate(2, scoops);
    	}

    	function input3_change_handler() {
    		scoops = this.__value;
    		$$invalidate(2, scoops);
    	}

    	$$self.$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		get: get_store_value,
    		cart,
    		fade,
    		fly,
    		Modal,
    		CardDescripcion,
    		showModal,
    		visible,
    		scoops,
    		svg,
    		soles,
    		item,
    		name,
    		img,
    		img1,
    		img2,
    		img3,
    		descripcion,
    		marca,
    		ancho,
    		profundidad,
    		alto,
    		material,
    		Tipodeconexión,
    		peso,
    		precio,
    		precioantes,
    		oferta,
    		categoriageneral,
    		categoria,
    		count,
    		cartItems,
    		inCart,
    		addToCart,
    		countButtonHandler,
    		abrirvisible,
    		cerrarvisible,
    		doubled
    	});

    	$$self.$inject_state = $$props => {
    		if ("showModal" in $$props) showModal = $$props.showModal;
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("scoops" in $$props) $$invalidate(2, scoops = $$props.scoops);
    		if ("svg" in $$props) $$invalidate(5, svg = $$props.svg);
    		if ("soles" in $$props) soles = $$props.soles;
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("name" in $$props) $$invalidate(6, name = $$props.name);
    		if ("img" in $$props) $$invalidate(7, img = $$props.img);
    		if ("img1" in $$props) $$invalidate(8, img1 = $$props.img1);
    		if ("img2" in $$props) $$invalidate(9, img2 = $$props.img2);
    		if ("img3" in $$props) $$invalidate(10, img3 = $$props.img3);
    		if ("descripcion" in $$props) $$invalidate(11, descripcion = $$props.descripcion);
    		if ("marca" in $$props) $$invalidate(12, marca = $$props.marca);
    		if ("ancho" in $$props) ancho = $$props.ancho;
    		if ("profundidad" in $$props) profundidad = $$props.profundidad;
    		if ("alto" in $$props) alto = $$props.alto;
    		if ("material" in $$props) material = $$props.material;
    		if ("Tipodeconexión" in $$props) Tipodeconexión = $$props.Tipodeconexión;
    		if ("peso" in $$props) peso = $$props.peso;
    		if ("precio" in $$props) $$invalidate(13, precio = $$props.precio);
    		if ("precioantes" in $$props) $$invalidate(14, precioantes = $$props.precioantes);
    		if ("oferta" in $$props) $$invalidate(15, oferta = $$props.oferta);
    		if ("categoriageneral" in $$props) $$invalidate(16, categoriageneral = $$props.categoriageneral);
    		if ("categoria" in $$props) $$invalidate(17, categoria = $$props.categoria);
    		if ("count" in $$props) count = $$props.count;
    		if ("inCart" in $$props) $$invalidate(3, inCart = $$props.inCart);
    		if ("doubled" in $$props) $$invalidate(4, doubled = $$props.doubled);
    	};

    	let doubled;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*inCart*/ 8) {
    			 $$invalidate(4, doubled = inCart * precio);
    		}
    	};

    	return [
    		item,
    		visible,
    		scoops,
    		inCart,
    		doubled,
    		svg,
    		name,
    		img,
    		img1,
    		img2,
    		img3,
    		descripcion,
    		marca,
    		precio,
    		precioantes,
    		oferta,
    		categoriageneral,
    		categoria,
    		addToCart,
    		countButtonHandler,
    		abrirvisible,
    		cerrarvisible,
    		showModal,
    		soles,
    		ancho,
    		profundidad,
    		alto,
    		material,
    		Tipodeconexión,
    		peso,
    		count,
    		cartItems,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler,
    		input2_change_handler,
    		input3_change_handler
    	];
    }

    class Card2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { item: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card2",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console.warn("<Card2> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<Card2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Card2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Prueba2.svelte generated by Svelte v3.20.1 */

    const file$4 = "src\\components\\Prueba2.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let section0;
    	let t0;
    	let section1;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let section2;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let section3;
    	let t3;
    	let section4;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let section5;
    	let t5;
    	let section6;
    	let img3;
    	let img3_src_value;
    	let t6;
    	let section7;
    	let img4;
    	let img4_src_value;
    	let t7;
    	let section8;
    	let img5;
    	let img5_src_value;
    	let t8;
    	let section9;
    	let img6;
    	let img6_src_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			section0 = element("section");
    			t0 = space();
    			section1 = element("section");
    			img0 = element("img");
    			t1 = space();
    			section2 = element("section");
    			img1 = element("img");
    			t2 = space();
    			section3 = element("section");
    			t3 = space();
    			section4 = element("section");
    			img2 = element("img");
    			t4 = space();
    			section5 = element("section");
    			t5 = space();
    			section6 = element("section");
    			img3 = element("img");
    			t6 = space();
    			section7 = element("section");
    			img4 = element("img");
    			t7 = space();
    			section8 = element("section");
    			img5 = element("img");
    			t8 = space();
    			section9 = element("section");
    			img6 = element("img");
    			attr_dev(section0, "class", "content item1  svelte-chi3k7");
    			add_location(section0, file$4, 273, 2, 5371);
    			if (img0.src !== (img0_src_value = "https://promart.vteximg.com.br/arquivos/dv-destacado-coronahome-14052020-40-v2.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-chi3k7");
    			add_location(img0, file$4, 279, 4, 5535);
    			attr_dev(section1, "class", "card item2 svelte-chi3k7");
    			add_location(section1, file$4, 278, 2, 5501);
    			if (img1.src !== (img1_src_value = "")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-chi3k7");
    			add_location(img1, file$4, 284, 4, 5704);
    			attr_dev(section2, "class", "card item3 svelte-chi3k7");
    			add_location(section2, file$4, 283, 2, 5670);
    			attr_dev(section3, "class", "card item4 svelte-chi3k7");
    			add_location(section3, file$4, 286, 2, 5743);
    			if (img2.src !== (img2_src_value = "https://promart.vteximg.com.br/arquivos/dv-destacado-coronahome-14052020-44.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "svelte-chi3k7");
    			add_location(img2, file$4, 290, 4, 5825);
    			attr_dev(section4, "class", "card item5 svelte-chi3k7");
    			add_location(section4, file$4, 289, 2, 5791);
    			attr_dev(section5, "class", "card item7 svelte-chi3k7");
    			add_location(section5, file$4, 294, 2, 5957);
    			if (img3.src !== (img3_src_value = "https://promart.vteximg.com.br/arquivos/dv-destacado-coronahome-14052020-16.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			attr_dev(img3, "class", "svelte-chi3k7");
    			add_location(img3, file$4, 296, 4, 6025);
    			attr_dev(section6, "class", "card item8 svelte-chi3k7");
    			add_location(section6, file$4, 295, 2, 5991);
    			if (img4.src !== (img4_src_value = "https://promart.vteximg.com.br/arquivos/dv-destacado-coronahome-14052020-18.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			attr_dev(img4, "class", "svelte-chi3k7");
    			add_location(img4, file$4, 301, 4, 6191);
    			attr_dev(section7, "class", "card item9 svelte-chi3k7");
    			add_location(section7, file$4, 300, 2, 6157);
    			if (img5.src !== (img5_src_value = "https://promart.vteximg.com.br/arquivos/dv-destacado-coronahome-14052020-51.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			attr_dev(img5, "class", "svelte-chi3k7");
    			add_location(img5, file$4, 306, 4, 6358);
    			attr_dev(section8, "class", "card item10 svelte-chi3k7");
    			add_location(section8, file$4, 305, 2, 6323);
    			if (img6.src !== (img6_src_value = "https://promart.vteximg.com.br/arquivos/dv-destacado-coronahome-14052020-67.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "");
    			attr_dev(img6, "class", "svelte-chi3k7");
    			add_location(img6, file$4, 311, 4, 6525);
    			attr_dev(section9, "class", "card item11 svelte-chi3k7");
    			add_location(section9, file$4, 310, 2, 6490);
    			attr_dev(main, "class", "grid cerrar svelte-chi3k7");
    			add_location(main, file$4, 272, 0, 5341);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section0);
    			append_dev(main, t0);
    			append_dev(main, section1);
    			append_dev(section1, img0);
    			append_dev(main, t1);
    			append_dev(main, section2);
    			append_dev(section2, img1);
    			append_dev(main, t2);
    			append_dev(main, section3);
    			append_dev(main, t3);
    			append_dev(main, section4);
    			append_dev(section4, img2);
    			append_dev(main, t4);
    			append_dev(main, section5);
    			append_dev(main, t5);
    			append_dev(main, section6);
    			append_dev(section6, img3);
    			append_dev(main, t6);
    			append_dev(main, section7);
    			append_dev(section7, img4);
    			append_dev(main, t7);
    			append_dev(main, section8);
    			append_dev(section8, img5);
    			append_dev(main, t8);
    			append_dev(main, section9);
    			append_dev(section9, img6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    function instance$4($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Prueba2> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Prueba2", $$slots, []);
    	return [];
    }

    class Prueba2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prueba2",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    var items1 = [
      {
        name: "Codo 2x45 SAL",
        img: "1.Codo 2x45 SAL Tuboplast.webp",
        img1: "1.Codo 2x45 SAL Tuboplast.webp",
        img2: "1.Codo 2x45 SAL Tuboplast.webp",
        img3: "1.Codo 2x45 SAL Tuboplast.webp",
        descripcion:
          "Realiza correctamente las instalaciones de desagüe de tu hogar con este codo elaborado con material de CPVC y gran capacidad de durabilidad; además, es resistente a altas temperaturas, lo cual asegura su prolongado periodo de utilidad.",
        marca: "Tuboplast",
        ancho: "17 cm",
        profundidad: "6 cm",
        alto: "18 cm",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.390 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Sombrero PVC 2¨",
        img: "2.Sombrero PVC 2 .webp",
        img1: "2.Sombrero PVC 2 .webp",
        img2: "2.Sombrero PVC 2 .webp",
        img3: "2.Sombrero PVC 2 .webp",
        descripcion:
          "El sombrero, es un accesorio plástico que evita que los malos olores salgan del tanque.",
        marca: "Tuboplast",
        ancho: "16 cm",
        profundidad: "6 cm",
        alto: "16 cm",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.490 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Codo 4x90 SAL",
        img: "Codo 4x90 sal Tuboplast.webp",
        img1: "Codo 4x90 sal Tuboplast.webp",
        img2: "Codo 4x90 sal Tuboplast.webp",
        img3: "Codo 4x90 sal Tuboplast.webp",
        descripcion:
          "Accesorio que permite conectar cuatro tuberías de fluidos en desagües. Longitud de campana: 4 cm.",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "15 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.125 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Codo 2x90 SAL",
        img: "Codo 2x90 SAL.webp",
        img1: "Codo 2x90 SAL.webp",
        img2: "Codo 2x90 SAL.webp",
        img3: "Codo 2x90 SAL.webp",
        descripcion:
          "Tubería ideal para fluidos en desagües. Diámetro de campana: 5.42 cm. Longitud de campana: 5.2 cm. Espesor: 0.15 cm.",
        tipo: "Codo",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "13 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.062 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tubo S.Presion 1/2¨",
        img: "tubo simple presion 1-2.webp",
        img1: "tubo simple presion 1-2.webp",
        img2: "tubo simple presion 1-2.webp",
        img3: "tubo simple presion 1-2.webp",
        descripcion:
          "Sistema de agua para conducción de fluidos a presión. Espesor de 1.8 mm.",
        tipo: "tuberia",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "",
        longitud: "500 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.813 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Codo roscado 90° 1/2¨",
        img: "Codo roscado 90° 1-2¨.webp",
        img1: "Codo roscado 90° 1-2¨.webp",
        img2: "Codo roscado 90° 1-2¨.webp",
        img3: "Codo roscado 90° 1-2¨.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 2.1 cm. Diámetro de campana: 2.12 cm. Longitud de campana: 4.5 cm. Espesor: 0.45 cm.",
        tipo: "Codo",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "4.5 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.04 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Yee 4¨ a 2¨ SAL",
        img: "Yee  4 a 2  SAL.webp",
        img1: "Yee  4 a 2  SAL.webp",
        img2: "Yee  4 a 2  SAL.webp",
        img3: "Yee  4 a 2  SAL.webp",
        descripcion:
          "El tubo Yee, es un accesorio hecho de PVC ideal para trabajos de gasfitería en el desagüe.",
        tipo: "Codo",
        marca: "Tuboplast",
        ancho: "21 cm",
        profundidad: "7 cm",
        alto: "28 cm",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.405 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Codo 4¨ a 2¨ SAL",
        img: "Codo 4¨ a 2¨ SAL.webp",
        img1: "Codo 4¨ a 2¨ SAL.webp",
        img2: "Codo 4¨ a 2¨ SAL.webp",
        img3: "Codo 4¨ a 2¨ SAL.webp",
        descripcion:
          "Realiza correctamente las instalaciones de desagüe de tu hogar con este codo elaborado con material de PVC y gran capacidad de durabilidad; además, es resistente a altas temperaturas, lo cual asegura su prolongado periodo de utilidad.",
        tipo: "Codo",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Unión 4¨ SAL",
        img: "Unión 4 SAL Tuboplast.webp",
        img1: "Unión 4 SAL Tuboplast.webp",
        img2: "Unión 4 SAL Tuboplast.webp",
        img3: "Unión 4 SAL Tuboplast.webp",
        descripcion:
          "Accesorio que permite conectar cuatro tuberías de fluidos en desagües. Longitud de campana: 6 cm.",
        tipo: "Yee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "28 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.535 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Reduccion de 4¨ a 2¨ SAL",
        img: "Reduccion de 4¨ a 2¨ SAL .webp",
        img1: "Reduccion de 4¨ a 2¨ SAL .webp",
        img2: "Reduccion de 4¨ a 2¨ SAL .webp",
        img3: "Reduccion de 4¨ a 2¨ SAL .webp",
        descripcion:
          "Facilita la fluida transmisión de líquidos y encajado. Cuenta con capacidad resistente y bajo nivel de corrosión, garantiza un prolongado periodo de utilidad y pureza del agua. Accesorio que permite conectar cuatro tuberías de fluidos en desagües. Longitud de campana: 4.5 cm.",
        tipo: "Yee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "15.5 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.155 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tee sanitaria de 4x4",
        img: "Tee sanitaria de 4x4 Tuboplast.webp",
        img1: "Tee sanitaria de 4x4 Tuboplast.webp",
        img2: "Tee sanitaria de 4x4 Tuboplast.webp",
        img3: "Tee sanitaria de 4x4 Tuboplast.webp",
        descripcion:
          "Realizaras empalmes en las tuberías de una manera fácil y práctica. Accesorio que permite conectar dos tuberías de fluidos en desagües. Longitud de campana: 7 cm.",
        tipo: "Yee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.489.cm",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tee 4x4 SAL",
        img: "Tee 4x4 SAL Tuboplast.webp",
        img1: "Tee 4x4 SAL Tuboplast.webp",
        img2: "Tee 4x4 SAL Tuboplast.webp",
        img3: "Tee 4x4 SAL Tuboplast.webp",
        descripcion:
          "Realizaras empalmes en las tuberías de una manera fácil y práctica. Accesorio que permite conectar dos tuberías de fluidos en desagües, con una reducción de 2¨. Longitud de campana: 6.5 cm.",
        tipo: "Yee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "26 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.185 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tee 2x2 SAL",
        img: "Tee 2x2 SAL Tuboplast.webp",
        img1: "Tee 2x2 SAL Tuboplast.webp",
        img2: "Tee 2x2 SAL Tuboplast.webp",
        img3: "Tee 2x2 SAL Tuboplast.webp",
        descripcion:
          "Realizaras empalmes en las tuberías de una manera fácil y práctica. Accesorio que permite conectar dos tuberías de fluidos en desagües. Longitud de campana: 4.5 cm.",
        tipo: "Yee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "18 cm ",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.183 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Yee 2¨ SAL",
        img: "Yee 2 SAL Tuboplast.webp",
        img1: "Yee 2 SAL Tuboplast.webp",
        img2: "Yee 2 SAL Tuboplast.webp",
        img3: "Yee 2 SAL Tuboplast.webp",
        descripcion:
          " El tubo Yee, es un accesorio hecho de PVC ideal para trabajos de gasfitería en el desagüe. Accesorio que permite conectar dos tuberías de fluidos en desagües. Longitud de campana: 4.5 cm.",
        tipo: "union",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "9.5 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.035 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Sombrero PVC 4¨",
        img: "Sombrero PVC 4¨.webp",
        img1: "Sombrero PVC 4¨.webp",
        img2: "Sombrero PVC 4¨.webp",
        img3: "Sombrero PVC 4¨.webp",
        descripcion:
          "El sombrero, es un accesorio plástico que evita que los malos olores salgan del tanque. Accesorio que permite conectar dos tuberías de fluidos en desagües. Longitud de campana: 4.2 cm.",
        tipo: "Yee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "36 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.490 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Ramal T de 4 a 2 ",
        img: "Ramal T de 4 a 2 Tuboplast.webp",
        img1: "Ramal T de 4 a 2 Tuboplast.webp",
        img2: "Ramal T de 4 a 2 Tuboplast.webp",
        img3: "Ramal T de 4 a 2 Tuboplast.webp",
        descripcion:
          "Gran capacidad resistente y bajo nivel de corrosión, garantizando un prolongado periodo de utilidad y pureza del agua. Accesorio que permite conectar dos tuberías de fluidos en desagües. Longitud de campana: 4.2 cm.",
        tipo: "Tee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "17 cm ",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.120 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Yee 4¨ SAL",
        img: "Yee 4 SAL Tuboplast.webp",
        img1: "Yee 4 SAL Tuboplast.webp",
        img2: "Yee 4 SAL Tuboplast.webp",
        img3: "Yee 4 SAL Tuboplast.webp",
        descripcion:
          "El tubo Yee, es un accesorio hecho de PVC ideal para trabajos de gasfitería en el desagüe. Accesorio que permite conectar cuatro tuberías de fluidos en desagües. Longitud de campana: 7 cm.",
        tipo: "Tee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "2.8 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.475 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Codo 4x45 SAL",
        img: "Codo 4x45 SAL Tuboplast.webp",
        img1: "Codo 4x45 SAL Tuboplast.webp",
        img2: "Codo 4x45 SAL Tuboplast.webp",
        img3: "Codo 4x45 SAL Tuboplast.webp",
        descripcion:
          "Realiza correctamente las instalaciones de desagüe de tu hogar con este codo elaborado con material de CPVC y gran capacidad de durabilidad; además, es resistente a altas temperaturas, lo cual asegura su prolongado periodo de utilidad. Accesorio que permite tapar el final de una tubería de fluidos en desagües.",
        tipo: "Tapón",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "4.4 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.210 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tee sanitaria 2¨",
        img: "Tee sanitaria 2 Tuboplast.webp",
        img1: "Tee sanitaria 2 Tuboplast.webp",
        img2: "Tee sanitaria 2 Tuboplast.webp",
        img3: "Tee sanitaria 2 Tuboplast.webp",
        descripcion:
          "Realizaras empalmes en las tuberías de una manera fácil y práctica. Tubería para fluidos en desagües. Permite conectar dos tubos de un diámetro mayor a uno menor.",
        tipo: "Reducción",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "14 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.135 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Unión 2 SAL ",
        img: "Unión 2 SAL Tuboplast.webp",
        img1: "Unión 2 SAL Tuboplast.webp",
        img2: "Unión 2 SAL Tuboplast.webp",
        img3: "Unión 2 SAL Tuboplast.webp",
        descripcion:
          "Las uniones universales son esenciales para realizar las conexiones de tuberías en tu vivienda. Tubería ideal para fluidos en desagües. Diámetro de campana: 10.52 cm. Longitud de campana: 8.2 cm. Espesor: 0.2 cm.",
        tipo: "Codo",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "23 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.133 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tubo S.Presión 3/4¨",
        img: "Tubo simple presión 3-4.webp",
        img1: "Tubo simple presión 3-4.webp",
        img2: "Tubo simple presión 3-4.webp",
        img3: "Tubo simple presión 3-4.webp",
        descripcion:
          "Sistema de agua para conducción de fluidos a presión. Espesor de 1.8 mm.",
        tipo: "Tuberia",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "1.040kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Tubo roscado 1¨",
        img: "Tubo roscado 1.webp",
        img1: "Tubo roscado 1.webp",
        img2: "Tubo roscado 1.webp",
        img3: "Tubo roscado 1.webp",
        descripcion:
          "Sistema de agua para conducción de fluidos a presión. Espesor nominal de 3.4 mm.",
        tipo: "Tuberia",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Enroscado",
        Peso: "2.261kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tubo S.Presión 1¨",
        img: "Tubo simple presión 1.webp",
        img1: "Tubo simple presión 1.webp",
        img2: "Tubo simple presión 1.webp",
        img3: "Tubo simple presión 1.webp",
        descripcion:
          "Sistema de agua para conducción de fluidos a presión. Espesor de 1.8 mm.",
        tipo: "Tuberia",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "1. 270kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tubo roscado 3/4¨",
        img: "Tubo roscado 3-4.webp",
        img1: "Tubo roscado 3-4.webp",
        img2: "Tubo roscado 3-4.webp",
        img3: "Tubo roscado 3-4.webp",
        descripcion:
          "Sistema de agua para conducción de fluidos a presión. Espesor nominal de 2.9 mm.",
        tipo: "Tuberia",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Roscado",
        Peso: "1.613 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tubo roscado 1/2¨",
        img: "Tubo roscado 1-2.webp",
        img1: "Tubo roscado 1-2.webp",
        img2: "Tubo roscado 1-2.webp",
        img3: "Tubo roscado 1-2.webp",
        descripcion:
          "Sistema de agua para conducción de fluidos a presión. Espesor nominal de 2.9 mm.",
        tipo: "Tuberia",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "1.230kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Curva de agua S.Presión 3/4¨",
        img: "Curva de agua simple presión 3-4.webp",
        img1: "Curva de agua simple presión 3-4.webp",
        img2: "Curva de agua simple presión 3-4.webp",
        img3: "Curva de agua simple presión 3-4.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 2.65 cm. Espesor: 0.18 cm. Radio de curvatura: 15.1 cm. Longitud de campana: 3.4 cm.",
        tipo: "Curva",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "1.036kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tee roscado 3/4¨",
        img: "Tee roscado 3-4.webp",
        img1: "Tee roscado 3-4.webp",
        img2: "Tee roscado 3-4.webp",
        img3: "Tee roscado 3-4.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 2.65 cm. Diámetro de campana: 2.66 cm. Longitud de campana: 3 cm. Espesor: 0.45 cm.",
        tipo: "Tee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "8 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Enroscado",
        Peso: "1.07 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Curva de agua S.Presión 1¨",
        img: "Curva de agua simple presión 1.webp",
        img1: "Curva de agua simple presión 1.webp",
        img2: "Curva de agua simple presión 1.webp",
        img3: "Curva de agua simple presión 1.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 3.3 cm. Espesor: 0.18 cm. Radio de curvatura: 18.9 cm. Longitud de campana: 3.4 cm.",
        tipo: "Tuberia",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "1.066 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Codo S.Presión 90° 1¨",
        img: "Codo simple presión 90° 1.webp",
        img1: "Codo simple presión 90° 1.webp",
        img2: "Codo simple presión 90° 1.webp",
        img3: "Codo simple presión 90° 1.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 3.3 cm. Diámetro de campana: 3.32 cm. Longitud de campana: 3.8 cm. Espesor: 0.55 cm.",
        tipo: "codo",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "6 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "1.08kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Adaptador roscado UPR 3/4¨",
        img: "Adaptador roscado UPR 3-4.webp",
        img1: "Adaptador roscado UPR 3-4.webp",
        img2: "Adaptador roscado UPR 3-4.webp",
        img3: "Adaptador roscado UPR 3-4.webp",
        descripcion:
          "Tubería ideal para fluidos. Diámetro de campana: 4.5 cm. Longitud de rosca: 2.1 cm. Espesor: 0.5 cm.",
        tipo: "Adaptador",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "37 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Enroscado",
        Diámetronominal: "1.9 cm",
        Peso: "0.02 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Codo roscado 90° 3/4¨",
        img: "Codo roscado 90° 3-4.webp",
        img1: "Codo roscado 90° 3-4.webp",
        img2: "Codo roscado 90° 3-4.webp",
        img3: "Codo roscado 90° 3-4.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 2.65 cm. Diámetro de campana: 2.67 cm. Longitud de campana: 2.8 cm. Espesor: 0.45 cm.",
        tipo: "codo",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "5 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Enroscado",
        Diámetronominal: "1.9 cm",
        Peso: "0.05 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Unión roscado 3/4¨",
        img: "Unión roscado 3-4.webp",
        img1: "Unión roscado 3-4.webp",
        img2: "Unión roscado 3-4.webp",
        img3: "Unión roscado 3-4.webp",
        descripcion:
          "Ideal para uniones entre tuberías de fluidos. Diámetro de campana: 2.67 cm. Longitud de campana: 2.4 cm. Espesor: 0.45 cm.",
        tipo: "Unión",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "5.5 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Enroscado",
        Peso: "0.02 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tee S. presión 3/4¨",
        img: "Tee simple presión 3-4.webp",
        img1: "Tee simple presión 3-4.webp",
        img2: "Tee simple presión 3-4.webp",
        img3: "Tee simple presión 3-4.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 2.65 cm. Diámetro de campana: 2.66 cm. Longitud de campana: 3 cm. Espesor: 0.45 cm.",
        tipo: "Tee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "8 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Peso: "0.07kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Codo roscado 90° 1¨",
        img: "Codo roscado 90 1.webp",
        img1: "Codo roscado 90 1.webp",
        img2: "Codo roscado 90 1.webp",
        img3: "Codo roscado 90 1.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 3.3 cm. Diámetro de campana: 3.32 cm. Longitud de campana: 3.8 cm. Espesor: 0.55 cm.",
        tipo: "Codo",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "6 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Enroscado",
        Diámetronominal: "2.54 cm",
        Peso: "0.08 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tapón hembra simple presión 1/2¨",
        img: "Tapón hembra simple presión 1-2.webp",
        img1: "Tapón hembra simple presión 1-2.webp",
        img2: "Tapón hembra simple presión 1-2.webp",
        img3: "Tapón hembra simple presión 1-2.webp",
        descripcion:
          "Tubería para fluidos. Diámetro de campana: 4.5 cm. Longitud de rosca: 2.1 cm. Espesor: 0.5 cm.",
        tipo: "Tapón",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "8 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "1.27 cm",
        Peso: "0.01 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Unión roscado 1¨",
        img: "Unión roscado 1.webp",
        img1: "Unión roscado 1.webp",
        img2: "Unión roscado 1.webp",
        img3: "Unión roscado 1.webp",
        descripcion: "Ideal para uniones entre tuberías de fluidos.",
        tipo: "Unión",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "8 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Enroscado",
        Diámetronominal: "2.54 cm",
        Peso: "0.065 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Codo simple presión 45° 1¨",
        img: "Codo simple presión 45 1.webp",
        img1: "Codo simple presión 45 1.webp",
        img2: "Codo simple presión 45 1.webp",
        img3: "Codo simple presión 45 1.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 3.3 cm. Diámetro de campana: 3.31 cm. Longitud de campana: 4.8 cm. Espesor: 0.18 cm.",
        tipo: "Codo",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "8 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "2.54 cm",
        Peso: "0.05 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Curva de agua simple presión 1/2¨",
        img: "Curva de agua simple presión 1-2.webp",
        img1: "Curva de agua simple presión 1-2.webp",
        img2: "Curva de agua simple presión 1-2.webp",
        img3: "Curva de agua simple presión 1-2.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 2.1 cm. Espesor: 0.18 cm. Radio de curvatura: 12 cm. Longitud de campana: 3.2 cm.",
        tipo: "Curva",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "8 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "1.27 cm",
        Peso: "0.036 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Unión simple presión 1¨",
        img: "Unión simple presión 1.webp",
        img1: "Unión simple presión 1.webp",
        img2: "Unión simple presión 1.webp",
        img3: "Unión simple presión 1.webp",
        descripcion:
          "Ideal para uniones entre tuberías de fluidos. Diámetro de campana: 3.32 cm. Longitud de campana: 3.2 cm. Espesor: 0.5 cm.",
        tipo: "Unión",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "6 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "2.54 cm",
        Peso: "0.065 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tapón hembra simple presión 1¨",
        img: "Tapón hembra simple presión 1.webp",
        img1: "Tapón hembra simple presión 1.webp",
        img2: "Tapón hembra simple presión 1.webp",
        img3: "Tapón hembra simple presión 1.webp",
        descripcion:
          "Tubería para fluidos. Diámetro de campana: 4.5 cm. Longitud de rosca: 2.1 cm. Espesor: 0.5 cm.",
        tipo: "Tapón",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "3.7 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Enroscado",
        Diámetronominal: "2.54 cm",
        Peso: "0.02 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Codo simple presión 90° 1/2¨",
        img: "Codo simple presión 90° 1-2.webp",
        img1: "Codo simple presión 90° 1-2.webp",
        img2: "Codo simple presión 90° 1-2.webp",
        img3: "Codo simple presión 90° 1-2.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 2.1 cm. Diámetro de campana: 2.12 cm. Longitud de campana: 2 cm. Espesor: 0.45 cm.",
        tipo: "Codo",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "8 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "1.27 cm",
        Peso: "0.03 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Tee simple presión 1/2¨",
        img: "Tee simple presión 1-2.webp",
        img1: "Tee simple presión 1-2.webp",
        img2: "Tee simple presión 1-2.webp",
        img3: "Tee simple presión 1-2.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 2.1 cm. Diámetro de campana: 2.12 cm. Longitud de campana: 2.5 cm. Espesor: 0.45 cm.",
        tipo: "Tee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "7 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "1.27 cm",
        Peso: "0.05 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tee roscado 1¨",
        img: "Tee roscado 1.webp",
        img1: "Tee roscado 1.webp",
        img2: "Tee roscado 1.webp",
        img3: "Tee roscado 1.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 3.3 cm. Diámetro de campana: 3.32 cm. Longitud de campana: 4.8 cm. Espesor: 0.55 cm.",
        tipo: "Tee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "12 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Enroscado",
        Diámetronominal: "2.54 cm",
        Peso: "0.01 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Adaptador UPR roscado 1¨",
        img: "Adaptador UPR roscado 1.webp",
        img1: "Adaptador UPR roscado 1.webp",
        img2: "Adaptador UPR roscado 1.webp",
        img3: "Adaptador UPR roscado 1.webp",
        descripcion:
          "Tubería ideal para fluidos. Diámetro de campana: 4.5 cm. Longitud de rosca: 2.1 cm. Espesor: 0.5 cm.",
        tipo: "Adaptador",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "37 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "2.54 cm",
        Peso: "0.03 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Codo simple presión 45° 3/4¨",
        img: "Codo simple presión 45° 3-4.webp",
        img1: "Codo simple presión 45° 3-4.webp",
        img2: "Codo simple presión 45° 3-4.webp",
        img3: "Codo simple presión 45° 3-4.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 2.65 cm. Diámetro de campana: 2.6 cm. Longitud de campana: 3.5 cm. Espesor: 0.18 cm.",
        tipo: "Codo",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "6 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "1.9 cm",
        Peso: "0.05 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Unión simple presión 3/4¨",
        img: "Unión simple presión 3-4.webp",
        img1: "Unión simple presión 3-4.webp",
        img2: "Unión simple presión 3-4.webp",
        img3: "Unión simple presión 3-4.webp",
        descripcion:
          "Ideal para uniones entre tuberías de fluidos. Diámetro de campana: 2.67 cm. Longitud de campana: 2.9 cm. Espesor: 0.5 cm.",
        tipo: "Unión",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "6 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "1.9 cm",
        Peso: "0.06 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tapón macho simple presión 3/4¨",
        img: "Tapón macho simple presión 3-4.webp",
        img1: "Tapón macho simple presión 3-4.webp",
        img2: "Tapón macho simple presión 3-4.webp",
        img3: "Tapón macho simple presión 3-4.webp",
        descripcion:
          "Tubería para fluidos. Diámetro de campana: 2.65 cm. Longitud de espiga: 1.7 cm. Espesor: 0.18 cm.",
        tipo: "Tapón",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "3.3 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "1.9 cm",
        Peso: "0.01 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tapón hembra simple presión 3/4¨",
        img: "Tapón hembra simple presión 3-4.webp",
        img1: "Tapón hembra simple presión 3-4.webp",
        img2: "Tapón hembra simple presión 3-4.webp",
        img3: "Tapón hembra simple presión 3-4.webp",
        descripcion:
          "Tubería para fluidos. Diámetro de campana: 4.5 cm. Longitud de rosca: 2.1 cm. Espesor: 0.5 cm.",
        tipo: "Tapón",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "3.7 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Enroscado",
        Diámetronominal: "1.9 cm",
        Peso: "0.02 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Unión simple presión 1/2¨",
        img: "Unión simple presión 1-2.webp",
        img1: "Unión simple presión 1-2.webp",
        img2: "Unión simple presión 1-2.webp",
        img3: "Unión simple presión 1-2.webp",
        descripcion:
          "Tubería para fluidos. Diámetro de campana: 2.12 cm. Longitud de campana: 2.5 cm. Espesor: 0.45 cm.",
        tipo: "Unión",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "5.5 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "1.27 cm",
        Peso: "0.02 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Codo simple presión 90° 3/4¨",
        img: "Codo simple presión 90° 3-4.webp",
        img1: "Codo simple presión 90° 3-4.webp",
        img2: "Codo simple presión 90° 3-4.webp",
        img3: "Codo simple presión 90° 3-4.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 2.65 cm. Diámetro de campana: 2.67 cm. Longitud de campana: 2.8 cm. Espesor: 0.45 cm.",
        tipo: "Codo",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "5 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "1.9 cm",
        Peso: "0.05 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tapón macho simple presión 1/2¨",
        img: "Tapón macho simple presión 1-2.webp",
        img1: "Tapón macho simple presión 1-2.webp",
        img2: "Tapón macho simple presión 1-2.webp",
        img3: "Tapón macho simple presión 1-2.webp",
        descripcion:
          "Tubería para fluidos. Diámetro de campana: 2.1 cm. Longitud de espiga: 2.4 cm. Espesor: 0.18 cm.",
        tipo: "Tapón",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "3 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "1.27 cm",
        Peso: "0.01 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Unión roscado 1/2¨",
        img: "Unión roscado 1-2.webp",
        img1: "Unión roscado 1-2.webp",
        img2: "Unión roscado 1-2.webp",
        img3: "Unión roscado 1-2.webp",
        descripcion:
          "Ideal para uniones entre tuberías de fluidos. Diámetro de campana: 2.12 cm. Longitud de campana: 2 cm. Espesor: 0.45 cm.",
        tipo: "Unión",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "4.5 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Enroscado",
        Diámetronominal: "1.27 cm",
        Peso: "0.05 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Tee simple presión 1¨",
        img: "Tee simple presión 1.webp",
        img1: "Tee simple presión 1.webp",
        img2: "Tee simple presión 1.webp",
        img3: "Tee simple presión 1.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 3.3 cm. Diámetro de campana: 3.32 cm. Longitud de campana: 4.8 cm. Espesor: 0.55 cm.",
        tipo: "Tee",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "12 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "2.54 cm",
        Peso: "0.1 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Unión SEL Tuboplast 5/8¨",
        img: "Unión SEL Tuboplast 5-8.webp",
        img1: "Unión SEL Tuboplast 5-8.webp",
        img2: "Unión SEL Tuboplast 5-8.webp",
        img3: "Unión SEL Tuboplast 5-8.webp",
        descripcion:
          "Espesor: 1.1 mm. Sistema de empalme por simple presión. Resistencia a la tracción: 400-560 kgf/cm2. Resistente a aplastamientos, no presenta grietas ni roturas. Longitud de campana: 1.8 cm.",
        tipo: "Codo",
        marca: "Tuboplast",
        ancho: "1.58 cm",
        profundidad: "1.58 cm",
        alto: "4 cm",
        material: "PVC-U",
        Tipodeconexión: "",
        Diámetronominal: "",
        Peso: "0.005 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Conector SEL Tuboplast 5/8¨",
        img: "Conector SEL Tuboplast 5-8.webp",
        img1: "Conector SEL Tuboplast 5-8.webp",
        img2: "Conector SEL Tuboplast 5-8.webp",
        img3:
          "ConectorDiámetro nominal: 1.59 cm. Espesor: 0.11 cm. Longitud de campana: 1.6 cm. Sistema de empalme por simple presión. Resistencia a la tracción: 400-560 kgf/cm2. Resistente a aplastamientos, no presenta grietas ni roturas.",
        tipo: "Conector",
        marca: "Tuboplast",
        ancho: "1.59 cm",
        profundidad: "1.59 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "",
        Diámetronominal: "",
        Peso: "0.002 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Curva SEL Tuboplast 5/8¨",
        img: "Curva SEL Tuboplast 5-8.webp",
        img1: "Curva SEL Tuboplast 5-8.webp",
        img2: "Curva SEL Tuboplast 5-8.webp",
        img3: "Curva SEL Tuboplast 5-8.webp",
        descripcion:
          "Radio de curvatura: 9 cm. Espesor: 0.11 cm. Longitud de campana: 1.5 cm. Sistema de empalme por simple presión. Resistencia a la tracción: 400-560 kgf/cm2. Resistente a aplastamientos, no presenta grietas ni roturas.",
        tipo: "Curva",
        marca: "Tuboplast",
        ancho: "1.59 cm",
        profundidad: "1.59 cm",
        alto: "1.6 cm",
        material: "PVC-U",
        Tipodeconexión: "",
        Diámetronominal: "",
        Peso: "0.012 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Conector SAP Tuboplast 5/8¨",
        img: "Conector SAP Tuboplast 5-8.webp",
        img1: "Conector SAP Tuboplast 5-8.webp",
        img2: "Conector SAP Tuboplast 5-8.webp",
        img3: "Conector SAP Tuboplast 5-8.webp",
        descripcion:
          "Diámetro nominal: 1.27 cm. Espesor: 0.18 cm. Longitud de espiga: 2.15 cm. Sistema de empalme por simple presión. Resistencia a la tracción: 400-560 kgf/cm2. Resistente a aplastamientos, no presenta grietas ni roturas.",
        tipo: "Conector",
        marca: "Tuboplast",
        ancho: "2.1 cm",
        profundidad: "2.1 cm",
        alto: "2.2 cm",
        material: "PVC-U",
        Tipodeconexión: "",
        Diámetronominal: "",
        Peso: "0.005 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Unión SAP Tuboplast 1/2¨",
        img: "Unión SAP Tuboplast 1-2.webp",
        img1: "Unión SAP Tuboplast 1-2.webp",
        img2: "Unión SAP Tuboplast 1-2.webp",
        img3: "Unión SAP Tuboplast 1-2.webp",
        descripcion:
          "Espesor: 1.3 mm. Sistema de empalme por simple presión. Resistencia a la tracción: 400-560 kgf/cm2. Resistente a aplastamientos, no presenta grietas ni roturas. Longitud de campana: 2.8 cm.",
        tipo: "Unión",
        marca: "Tuboplast",
        ancho: "1.27 cm",
        profundidad: "6 cm",
        alto: "6 cm",
        material: "PVC-U",
        Tipodeconexión: "",
        Diámetronominal: "",
        Peso: "0.005 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Codo simple presión 45° 1/2¨",
        img: "Codo simple presión 45° 1-2.webp",
        img1: "Codo simple presión 45° 1-2.webp",
        img2: "Codo simple presión 45° 1-2.webp",
        img3: "Codo simple presión 45° 1-2.webp",
        descripcion:
          "Tubería para fluidos. Diámetro exterior: 2.1 cm. Diámetro de campana: 2.12 cm. Longitud de campana: 3 cm. Espesor: 0.18 cm.",
        tipo: "Codo",
        marca: "Tuboplast",
        ancho: "",
        profundidad: "5 cm",
        alto: "",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "1.27 cm",
        Peso: "0.03 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },

      {
        name: "Unión SAP Tuboplast 1¨",
        img: "Unión SAP Tuboplast 1.webp",
        img1: "Unión SAP Tuboplast 1.webp",
        img2: "Unión SAP Tuboplast 1.webp",
        img3: "Unión SAP Tuboplast 1.webp",
        descripcion:
          "Espesor: 1.3 mm. Sistema de empalme por simple presión. Resistencia a la tracción: 400-560 kgf/cm2. Resistente a aplastamientos, no presenta grietas ni roturas. Longitud de campana: 2.8 cm.",
        tipo: "Unión",
        marca: "Tuboplast",
        ancho: "2c54 cm",
        profundidad: "2.54 cm",
        alto: "4 cm",
        material: "PVC-U",
        Tipodeconexión: "Presión",
        Diámetronominal: "",
        Peso: "0.005 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Unión SEL Tuboplast 1¨",
        img: "Unión SEL Tuboplast 1.webp",
        img1: "Unión SEL Tuboplast 1.webp",
        img2: "Unión SEL Tuboplast 1.webp",
        img3: "Unión SEL Tuboplast 1.webp",
        descripcion:
          "Espesor: 1.3 mm. Sistema de empalme por simple presión. Resistencia a la tracción: 400-560 kgf/cm2. Resistente a aplastamientos, no presenta grietas ni roturas. Longitud de campana: 2.8 cm.",
        tipo: "Unión",
        marca: "Tuboplast",
        ancho: "2.54 cm",
        profundidad: "2.54 cm",
        alto: "4 cm",
        material: "PVC-U",
        Tipodeconexión: "",
        Diámetronominal: "",
        Peso: "0.005 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Conector SAP Tuboplast 1¨",
        img: "Conector SAP Tuboplast 1.webp",
        img1: "Conector SAP Tuboplast 1.webp",
        img2: "Conector SAP Tuboplast 1.webp",
        img3: "Conector SAP Tuboplast 1.webp",
        descripcion:
          "Diámetro nominal: 2.54 cm. Espesor: 0.18 cm. Longitud de campana: 3.25 cm. Sistema de empalme por simple presión. Resistencia a la tracción: 400-560 kgf/cm2. Resistente a aplastamientos, no presenta grietas ni roturas.",
        tipo: "Conector",
        marca: "Tuboplast",
        ancho: "3.3 cm",
        profundidad: "3.3 cm",
        alto: "3.4 cm",
        material: "PVC-U",
        Tipodeconexión: "",
        Diámetronominal: "",
        Peso: "0.01 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Curva SEL Tuboplast 1¨",
        img: "Curva SEL Tuboplast 1.webp",
        img1: "Curva SEL Tuboplast 1.webp",
        img2: "Curva SEL Tuboplast 1.webp",
        img3: "Curva SEL Tuboplast 1.webp",
        descripcion:
          "Radio de curvatura: 14.5 cm. Espesor: 0.13 cm. Longitud de campana: 2.5 cm. Sistema de empalme por simple presión. Resistencia a la tracción: 400-560 kgf/cm2. Resistente a aplastamientos, no presenta grietas ni roturas.",
        tipo: "Curva",
        marca: "Tuboplast",
        ancho: "2.54 cm",
        profundidad: "2.54 cm",
        alto: "2.5 cm",
        material: "PVC-U",
        Tipodeconexión: "",
        Diámetronominal: "",
        Peso: "0.031 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
      {
        name: "Conector SEL Tuboplast 1¨",
        img: "Conector SEL Tuboplast 1.webp",
        img1: "Conector SEL Tuboplast 1.webp",
        img2: "Conector SEL Tuboplast 1.webp",
        img3: "Conector SEL Tuboplast 1.webp",
        descripcion:
          "Diámetro nominal: 2.54 cm. Espesor: 0.13 cm. Longitud de espiga: 2.45 cm. Sistema de empalme por simple presión. Resistencia a la tracción: 400-560 kgf/cm2. Resistente a aplastamientos, no presenta grietas ni roturas.",
        tipo: "Conector",
        marca: "Tuboplast",
        ancho: "2.54 cm",
        profundidad: "2.54 cm",
        alto: "2.5 cm",
        material: "PVC-U",
        Tipodeconexión: "",
        Diámetronominal: "",
        Peso: "0.005 kg",
        precio: "0",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Accesorios y conexiones",
      },
    ];

    var items2 = [
      {
        name:"Adaptador 3/4''", 
        img: "Adaptador  3-4.jfif",
        img1:"Adaptador  3-4.jfif",
        img2:"Adaptador  3-4.jfif",
        img3:"Adaptador  3-4.jfif",
        descripcion: "Adaptador de 3/4''", 
        usos: "Para agua fría",
        Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
        tipo: "Adaptador",
        marca: "Tuboplast",
        material: "PVC-U",
        Medidas: "3/4''",
        Color: "Blanco",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Adaptador de 1 cr", 
        img: "208760X.jfif",
        img1:"208760X.jfif",
        img2:"208760X.jfif",
        img3:"208760X.jfif",
        descripcion: "Tubo de acero con sistema roscado, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para instalaciones de uso en la construcción.",
        Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
        tipo: "Adaptador",
        marca: "Tuboplast",
        material: "PVC-U",
        Medidas: "1''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Adaptador de 1 1/2''", 
        img: "2087863.jfif",
        img1:"2087863.jfif",
        img2:"2087863.jfif",
        img3:"2087863.jfif",
        descripcion: "Adaptador 1 1/2'' C/R. Ideal para agua.", 
        usos: "",
        Recomendaciones: "",  
        tipo: "Adaptador",
        marca: "Tuboplast",
        material: "PVC-U",
        Medidas: "1/2''",
        Color: "Plomo",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Adaptador de 3/4''", 
        img: "2277352.jfif",
        img1:"2277352.jfif",
        img2:"2277352.jfif",
        img3:"2277352.jfif",
        descripcion: "Adaptador de 3/4''", 
        usos: "Para Agua fria",
        Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
        tipo: "Adaptador",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "3/4''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      
      {
        name:"Tee de 1 1/2'' C/R", 
        img: "2088231.jfif",
        img1:"2088231.jfif",
        img2:"2088231.jfif",
        img3:"2088231.jfif",
        descripcion: "Tee de 1 1/2'' con rosca", 
        usos: "Abastecer agua de una línea principal a otro punto.",
        Recomendaciones: "",  
        tipo: "Adaptadores",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1 1/2''",
        Color: "Plomo",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },

      {
        name:"Codo 3/4''", 
        img: "2087405.jfif",
        img1:"2087405.jfif",
        img2:"2087405.jfif",
        img3:"2087405.jfif",
        descripcion: "Tubo de PVC, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para agua fría",
        Recomendaciones: "Tubo de PVC, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.",  
        tipo: "Codo",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "3/4''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo 2 x 90 cr", 
        img: "208869X.jfif",
        img1:"208869X.jfif",
        img2:"208869X.jfif",
        img3:"208869X.jfif",
        descripcion: "Material autoextinguible. Cumple norma técnica peruana. NTP 399-006 / PVC-U", 
        usos: "Ideal para distribución de agua.",
        Recomendaciones: "En este tipo de tubería no es recomendable calentar el PVC para unir con otros tubos.",  
        tipo: "Codo",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo de 1 1/4'' SP", 
        img: "2088630.jfif",
        img1:"2088630.jfif",
        img2:"2088630.jfif",
        img3:"2088630.jfif",
        descripcion: "Codo de 1 1/4'' x 90° S/P. Ideal para agua.", 
        usos: "Para uso potable",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1 1/4''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo 1''", 
        img: "2087693.jfif",
        img1:"2087693.jfif",
        img2:"2087693.jfif",
        img3:"2087693.jfif",
        descripcion: "Accesorios para cambio de dirección a 45°. 100% resina de PVC virgen. No contiene plomo. Reduce impacto ambiental.", 
        usos: "Ideal para agua fría",
        Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
        tipo: "Codo",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1''",
        Color: "Plomo",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo de 1 1/2'' CR", 
        img: "208788X.jfif",
        img1:"208788X.jfif",
        img2:"208788X.jfif",
        img3:"208788X.jfif",
        descripcion: "Codo de desagüe de PVC con rosca, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para desagüe",
        Recomendaciones: "Si la instalación es aérea, el codo debe tener apoy",  
        tipo: "Codo",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1 1/2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo 3/4''", 
        img: "2087685.jfif",
        img1:"2087685.jfif",
        img2:"2087685.jfif",
        img3:"2087685.jfif",
        descripcion: "Accesorios para cambio de dirección a 45°. 100% resina de PVC virgen. No contiene plomo. Reduce impacto ambiental.", 
        usos: "Ideal para agua fría",
        Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
        tipo: "Codo",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "3/4''",
        Color: "Plomo",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo de 1 1/2'' SP", 
        img: "2087898.jfif",
        img1:"2087898.jfif",
        img2:"2087898.jfif",
        img3:"2087898.jfif",
        descripcion: "Codo de PVC. Accesorio para cambio de dirección a 90°.", 
        usos: "Para cambio de dirección a 90°",
        Recomendaciones: "Por el cambio brusco de dirección de recomienda el mayor cuidado en el pegado.",  
        tipo: "Codo",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1 1/2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Reducción 3/4'' x 1/2'' C/R", 
        img: "208855X.jfif",
        img1:"208855X.jfif",
        img2:"208855X.jfif",
        img3:"208855X.jfif",
        descripcion: "Reducción con rosca exterior-interior. Se usa para cambio de diámetros roscados.", 
        usos: "Ideal para instalaciones de agua",
        Recomendaciones: "No olvidar usar cinta teflón",  
        tipo: "Bushing",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "3/4'' x 1/2''",
        Color: "Plomo",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Bushing 1'' a 3/4''", 
        img: "2088568.jfif",
        img1:"2088568.jfif",
        img2:"2088568.jfif",
        img3:"2088568.jfif",
        descripcion: "Es una reducción rosca exterior-rosca interior.", 
        usos: "Se usa para cambiar diámetros roscados",
        Recomendaciones: "Para asegurar la instalación, utilizar soldadura para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
        tipo: "Bushing",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1'' a 3/4''",
        Color: "  Plomo",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      
      {
        name:"Codo 90° 1/2''", 
        img: "2087731.jfif",
        img1:"",
        img2:"",
        img3:"",
        descripcion: "Tubo de PVC con sistema roscado, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para agua fría",
        Recomendaciones: "No olvidar usar cinta teflón y pegamento de tubería",  
        tipo: "Codo con Rosca",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1/2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      
      {
        name:"Codo 90° 3/4''", 
        img: "2087766.jfif",
        img1:"2087766.jfif",
        img2:"2087766.jfif",
        img3:"2087766.jfif",
        descripcion: "Tubo de PVC con sistema roscado, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para agua fría",
        Recomendaciones: "No olvidar usar cinta teflón y pegamento de tubería",  
        tipo: "Codo con Rosca",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "3/4''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      
      {
        name:"Unión Mixta 1/2'' C-R", 
        img: "2088703.jfif",
        img1:"2088703.jfif",
        img2:"2088703.jfif",
        img3:"2088703.jfif",
        descripcion: "Unión mixta para instalaciones domésticas para unir segmentos de tubos y tuberías con extremos roscados y sin campana (S/P).", 
        usos: "Para unir segmentos de tubos y tuberías",
        Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
        tipo: "Conexiones",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1/2''",
        Color: "Plomo",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Unión Mixta 3/4'' C-R", 
        img: "2088711.jfif",
        img1:"2088711.jfif",
        img2:"2088711.jfif",
        img3:"2088711.jfif",
        descripcion: "Unión mixta para instalaciones domésticas para unir segmentos de tubos y tuberías con extremos roscados y sin campana (S/P).", 
        usos: "Para unir segmentos de tubos y tuberías",
        Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
        tipo: "Conexiones",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "3/4''",
        Color: "Plomo",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      


      {
        name:"Niple 2 X 4", 
        img: "2088797.jfif",
        img1:"2088797.jfif",
        img2:"2088797.jfif",
        img3:"2088797.jfif",
        descripcion: "Material de alta resistencia, bajo nivel de corrosión", 
        usos: "Ideal para unir tuberías",
        Recomendaciones: "Utilizar cemento para PVC para asegurar la instalación",  
        tipo: "Niple",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "2x4''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Niple 1 1/2 X 4 PVC", 
        img: "2088770.jfif",
        img1:"2088770.jfif",
        img2:"2088770.jfif",
        img3:"2088770.jfif",
        descripcion: "Material de alta resistencia, bajo nivel de corrosión", 
        usos: "Ideal para unir tuberías",
        Recomendaciones: "Utilizar cemento para PVC para asegurar la instalación",  
        tipo: "Niple",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1 1/2 X 4''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Niple 2 X 6", 
        img: "2088800.jfif",
        img1:"2088800.jfif",
        img2:"2088800.jfif",
        img3:"2088800.jfif",
        descripcion: "Material de alta resistencia, bajo nivel de corrosión", 
        usos: "Ideal para unir tuberías",
        Recomendaciones: "Utilizar cemento para PVC para asegurar la instalación",  
        tipo: "Niple",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "2 X 6''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Niple 1/2 x 3 PVC", 
        img: "2088029 .jfif",
        img1:"2088029 .jfif",
        img2:"2088029 .jfif",
        img3:"2088029 .jfif",
        descripcion: "Material de alta resistencia, bajo nivel de corrosión", 
        usos: "Ideal para unir tuberías",
        Recomendaciones: "Utilizar cemento para PVC para asegurar la instalación",  
        tipo: "Niple",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1/2 x 3''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Niple 1 X 2 PVC", 
        img: "208841X .jfif",
        img1:"208841X .jfif",
        img2:"208841X .jfif",
        img3:"208841X .jfif",
        descripcion: "Material de alta resistencia, bajo nivel de corrosión", 
        usos: "Ideal para unir tuberías",
        Recomendaciones: "Utilizar cemento para PVC para asegurar la instalación",  
        tipo: "Niple",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1 X 2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Niple 1 1/2 X 6 PVC", 
        img: "2088789 .jfif",
        img1:"2088789 .jfif",
        img2:"2088789 .jfif",
        img3:"2088789 .jfif",
        descripcion: "Material de alta resistencia, bajo nivel de corrosión", 
        usos: "Ideal para unir tuberías",
        Recomendaciones: "Utilizar cemento para PVC para asegurar la instalación",  
        tipo: "Niple",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1 1/2 x 6''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Reducción 1 x 3/4''", 
        img: "208905X.jfif",
        img1:"208905X.jfif",
        img2:"208905X.jfif",
        img3:"208905X.jfif",
        descripcion: "Se utiliza para cambio de diámetro en las tuberías", 
        usos: "Para agua",
        Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
        tipo: "Reduccion",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1 x 3/4",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Reducción 1 1/4'' x 1'' sp", 
        img: "2089246.jfif",
        img1:"2089246.jfif",
        img2:"2089246.jfif",
        img3:"2089246.jfif",
        descripcion: "Tubo de PVC, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para agua",
        Recomendaciones: "No olvide usar pegamento para tubería.",  
        tipo: "Reduccion",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1 1/4'' x 1''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Reducción 3/4 x 1/2'' SP", 
        img: "2088894.jfif",
        img1:"2088894.jfif",
        img2:"2088894.jfif",
        img3:"2088894.jfif",
        descripcion: "Se utiliza para cambio de diámetro en las tuberías", 
        usos: "Para agua",
        Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
        tipo: "Reduccion",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "3/4 x 1/2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Reducción 2'' x 1 1/4'' sp", 
        img: "2088096.jfif",
        img1:"2088096.jfif",
        img2:"2088096.jfif",
        img3:"2088096.jfif",
        descripcion: "Tubo de PVC, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "ara agua",
        Recomendaciones: "No olvide usar pegamento para tubería.",  
        tipo: "Reduccion",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "2'' x 1 1/4''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Reducción con Rosca 3/4'' x 1/2''", 
        img: "2132389.jfif",
        img1:"2132389.jfif",
        img2:"2132389.jfif",
        img3:"2132389.jfif",
        descripcion: "Reducción con rosca que se utiliza para cambio de diámetro en las tuberías", 
        usos: "Para agua",
        Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
        tipo: "Reduccion",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "3/4'' x 1/2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Reducción de 1'' a 1/2'' Hembra SP", 
        img: "2088576.jfif",
        img1:"2088576.jfif",
        img2:"2088576.jfif",
        img3:"2088576.jfif",
        descripcion: "Reducción Bushing hembra de 1'' a 1/2'' S/P. Ideal para agua potable.", 
        usos: "Para Agua Fría",
        Recomendaciones: "No olvidar utilizar cinta teflón.",  
        tipo: "Reduccion",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1'' a 1/2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Reducción para Desagüe 2'' x 1 1/2''", 
        img: "208810X.jfif",
        img1:"208810X.jfif",
        img2:"208810X.jfif",
        img3:"208810X.jfif",
        descripcion: "Reducción para cambio de diámetro", 
        usos: "Para desagüe",
        Recomendaciones: "",  
        tipo: "Reduccion",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "2'' x 1 1/2''",
        Color: "Plomo orgánico",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Reducción 1'' x 3/4'' SP", 
        img: "208905X (1).jfif",
        img1:"208905X (1).jfif",
        img2:"208905X (1).jfif",
        img3:"208905X (1).jfif",
        descripcion: "Se utiliza para cambio de diámetro en las tuberías", 
        usos: "Para agua",
        Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
        tipo: "Reduccion",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1'' x 3/4''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Reducción 3'' x 2'' Desagüe", 
        img: "2088118.jfif",
        img1:"2088118.jfif",
        img2:"2088118.jfif",
        img3:"2088118.jfif",
        descripcion: "Tubo de PVC, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "",
        Recomendaciones: "No olvide usar pegamento para tubería.",  
        tipo: "Reduccion",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "3'' x 2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Reducción 1'' x 1/2'' SP", 
        img: "2089041 (1).jfif",
        img1:"2089041 (1).jfif",
        img2:"2089041 (1).jfif",
        img3:"2089041 (1).jfif",
        descripcion: "Se utiliza para cambio de diámetro en las tuberías", 
        usos: "Para Agua",
        Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
        tipo: "Reduccion",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1'' x 1/2'' ",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Tapón 1'' Macho cr", 
        img: "208757X.jfif",
        img1:"208757X.jfif",
        img2:"208757X.jfif",
        img3:"208757X.jfif",
        descripcion: "Tapón macho de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para agua fría",
        Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
        tipo: "Tapón",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Tapón Hembra 1 SP", 
        img: "2087847.jfif",
        img1:"2087847.jfif",
        img2:"2087847.jfif",
        img3:"2087847.jfif",
        descripcion: "Se usa para sellar. Se instala en un tubo sin campana.", 
        usos: "Para agua",
        Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
        tipo: "Tapón",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Tapón para Desagüe de 4''", 
        img: "2088223.jfif",
        img1:"2088223.jfif",
        img2:"2088223.jfif",
        img3:"2088223.jfif",
        descripcion: "Tapón de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para sellar una línea de tubería o circuito.",
        Recomendaciones: "Utilizar soldadura de PVC.",  
        tipo: "Tapon",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "4''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Tee 1'' SP", 
        img: "2087650.jfif",
        img1:"2087650.jfif",
        img2:"2087650.jfif",
        img3:"2087650.jfif",
        descripcion: "Se usa para instalaciones domésticas.", 
        usos: "Para desagüe",
        Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC",  
        tipo: "Tee",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "33 mm",
        diametro:"1''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Tee 2'' sp", 
        img: "2088495.jfif",
        img1:"2088495.jfif",
        img2:"2088495.jfif",
        img3:"2088495.jfif",
        descripcion: "Tee de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para desagüe",
        Recomendaciones: "No olvidar usar cinta teflón y pegamento de tubería",  
        tipo: "Tee",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "2''",
        Color: "Gris Organico",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Tee PVC 1''", 
        img: "2277379.jfif",
        img1:"2277379.jfif",
        img2:"2277379.jfif",
        img3:"2277379.jfif",
        descripcion: "Tee 100% resina de PVC virgen. No contiene plomo. Reduce impacto ambienta", 
        usos: "Para agua fría",
        Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC",  
        tipo: "Tee",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Tee de 1 1/2'' SP", 
        img: "208824X.jfif",
        img1:"208824X.jfif",
        img2:"208824X.jfif",
        img3:"208824X.jfif",
        descripcion: "Tee de 1 1/2'' SP. Accesorio de 90°. Se usa para abastecer de agua de una línea principal a otro punto.", 
        usos: "Abastecer de agua una línea principal a otro punto.",
        Recomendaciones: "No olvidar usar cinta teflón.",  
        tipo: "Tee",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1 1/2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Unión de 1/2''", 
        img: "2277301.jfif",
        img1:"2277301.jfif",
        img2:"2277301.jfif",
        img3:"2277301.jfif",
        descripcion: "Unión 1/2'' PVC S/P presión.", 
        usos: "",
        Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión.",  
        tipo: "Uniones",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1/2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Unión de 3/4''", 
        img: "2277336.jfif",
        img1:"2277336.jfif",
        img2:"2277336.jfif",
        img3:"2277336.jfif",
        descripcion: "Unión 3/4'' PVC S/P presión.", 
        usos: "",
        Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión.",  
        tipo: "Uniones",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "3/4''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Unión de 1'' ", 
        img: "2277387.jfif",
        img1:"2277387.jfif",
        img2:"2277387.jfif",
        img3:"2277387.jfif",
        descripcion: "Unión 1'' PVC C-10 S/P presión.", 
        usos: "",
        Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión.",  
        tipo: "Uniones",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Unión Universal de 1/2'' SP", 
        img: "2087715.jfif",
        img1:"2087715.jfif",
        img2:"2087715.jfif",
        img3:"2087715.jfif",
        descripcion: "Se usa en instalaciones domésticas para unir tuberías y segmentos de tubos. Su diseño permite el desacoplamiento fácil del sistema instalado para cualquier reparación, modificación o mantenimiento.", 
        usos: "Para agua",
        Recomendaciones: "Para asegurar la instalación utilizar cemento para PVC en la conexión.",  
        tipo: "union universal",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1/2''",
        Color: "Blanco",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Unión Universal 1'' SP", 
        img: "2087707.jfif",
        img1:"2087707.jfif",
        img2:"2087707.jfif",
        img3:"2087707.jfif",
        descripcion: "Su diseño permite el desacoplamiento fácil del sistema instalado para cualquier reparación, modificación o mantenimiento.", 
        usos: "Ideal para instalaciones domésticas para unir tuberías y segmentos de tubos.",
        Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
        tipo: "union universal",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Tubo 1/2'' x 5 m sp", 
        img: "2087618.jfif",
        img1:"2087618.jfif",
        img2:"2087618.jfif",
        img3:"2087618.jfif",
        descripcion: "Tubo de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para agua fría",
        Recomendaciones: "No olvidar usar cinta teflón y pegamento de tubería",  
        tipo: "",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1/2'' x 5 m ",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Tubo de 3/4'' x 5 m sp", 
        img: "2087626.jfif",
        img1:"2087626.jfif",
        img2:"2087626.jfif",
        img3:"2087626.jfif",
        descripcion: "Tubo de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para agua fría",
        Recomendaciones: "No olvidar usar cinta teflón y pegamento de tubería",  
        tipo: "",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "3/4'' x 5 m ",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Unión de 1 1/2'' CR", 
        img: "2088320.jfif",
        img1:"2088320.jfif",
        img2:"2088320.jfif",
        img3:"2088320.jfif",
        descripcion: "Unión de 1 1/2'' C/R. Ideal para cañerías de agua.", 
        usos: "",
        Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión.",  
        tipo: "uniones y conexiones",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1 1/2'' ",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Tee 1/2'' SP", 
        img: "2087413.jfif",
        img1:"2087413.jfif",
        img2:"2087413.jfif",
        img3:"2087413.jfif",
        descripcion: "Accesorio que permite recibir aguas servidas en 2 puntos. La entrada y la desviación es una curva de 90°. Permite que el encuentro de la caída de agua de los dos puntos en común no sea en forma brusca. 100% resina de PVC virgen. No contiene plomo. Resistente y funcional.", 
        usos: "Para desagüe",
        Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión.",  
        tipo: "Tee Sanitaria",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1/2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Tee 1'' con rosca", 
        img: "2087790.jfif",
        img1:"2087790.jfif",
        img2:"2087790.jfif",
        img3:"2087790.jfif",
        descripcion: "Fabricado de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para agua fría",
        Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
        tipo: "Tee con rosca",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Curva 1/2'' x 90", 
        img: "2087952.jfif",
        img1:"2087952.jfif",
        img2:"2087952.jfif",
        img3:"2087952.jfif",
        descripcion: "Material autoextinguible. Cumple norma técnica peruana. NTP 399-006 / PVC-U", 
        usos: "Ideal para proteger los cables eléctricos.",
        Recomendaciones: "Es recomendable rasgar el PVC para una mayor adherencia al contacto con otros tubos.",  
        tipo: "Curva",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "1/2''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Cachimba 200mm a 160mm PVC", 
        img: "2153327.jfif",
        img1:"2153327.jfif",
        img2:"2153327.jfif",
        img3:"2153327.jfif",
        descripcion: "", 
        usos: "Para desagüe",
        Recomendaciones: "",  
        tipo: "Cachimbas",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "200 mm a 160 mm",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo 90'' x 160 mm", 
        img: "2088983.jfif",
        img1:"2088983.jfif",
        img2:"2088983.jfif",
        img3:"2088983.jfif",
        descripcion: "Tubo de alcantarillado de PVC-U, con estabilizante de estaño o calcio-zinc sin plomo, lo cual reduce el impacto ambiental.", 
        usos: "",
        Recomendaciones: "Tener cuidado en la carga, transporte y descarga del material",  
        tipo: "Para alcantarillado",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "160 mm",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },























      {
        name:"", 
        img: "",
        img1:"",
        img2:"",
        img3:"",
        descripcion: "", 
        usos: "",
        Recomendaciones: "",  
        tipo: "",
        marca: "Tuboplast",
        material: "PVC",
        Medida: "''",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },





    ];

    var items = [
      {
        name:"Codo CPVC 3/4'' 90°", 
        img: "308617.jfif",
        img1:"308617.jfif",
        img2:"308617.jfif",
        img3:"308617.jfif",
        descripcion: "Conexión de CPVC están diseñadas para trabajar en forma continua a una presión hidrostática y a temperaturas exigentes.", 
        usos: "",
        Recomendaciones: "Para asegurar la instalación utilizar soldadura de CPVC PAVCO en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "3/4''",
        presion:"100 psi (6.89 bar o 6.8 bar)",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo CPVC 3/4'' 45°", 
        img: "308595 (1).jfif",
        img1:"308595 (1).jfif",
        img2:"308595 (1).jfif",
        img3:"308595 (1).jfif",
        descripcion: "Conexión de CPVC están diseñadas para trabajar en forma continua a una presión hidrostática y a temperaturas exigentes.", 
        usos: "Para agua caliente",
        Recomendaciones: "sUsar soldadura de CPVC PAVCO para asegurar las uniones. Tener cuidado en la carga, transporte y descarga del material.",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "3/4''",
        presion:"100 psi (6.89 bar o 6.8 bar)",
        Color: "Gris",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo Desagüe PVC 2'' x 45°", 
        img: "344877.jfif",
        img1:"344877.jfif",
        img2:"344877.jfif",
        img3:"344877.jfif",
        descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para desagüe",
        Recomendaciones: "Usar soldadura de PVC PAVCO para asegurar las uniones. Tener cuidado en la carga, transporte y descarga del material.",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "2''",
        presion:"890 psi",
        Color: "Gris orgánico",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo CPVC 1/2'' 45°", 
        img: "308587.jfif",
        img1:"308587.jfif",
        img2:"308587.jfif",
        img3:"308587.jfif",
        descripcion: "Conexión de CPVC están diseñadas para trabajar en forma continua a una presión hidrostática y a temperaturas exigentes.", 
        usos: "Para agua caliente",
        Recomendaciones: "Usar soldadura de CPVC PAVCO para asegurar las uniones. Tener cuidado en la carga, transporte y descarga del material.",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1/2''",
        presion:"100 psi (6.89 bar o 6.8 bar)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },

      {
        name:"Codo PVC 45° SP 1 1/2''", 
        img: "2310449.jfif",
        img1:"2310449.jfif",
        img2:"2310449.jfif",
        img3:"2310449.jfif",
        descripcion: "Codo PVC de 45° sp con medidas 1 1/2''", 
        usos: "Para desagües",
        Recomendaciones: "Usar soldadura de PVC PAVCO para asegurar las uniones. Tener cuidado en la carga, transporte y descarga del material.",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1 1/2''",
        presion:"",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo Desagüe PVC 4'' x 90°", 
        img: "34494X.jfif",
        img1:"34494X.jfif",
        img2:"34494X.jfif",
        img3:"34494X.jfif",
        descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para desagüe",
        Recomendaciones: "Usar soldadura de PVC PAVCO para asegurar las uniones. Tener cuidado en la carga, transporte y descarga del material.",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "4''",
        presion:"710 psi",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo Desagüe PVC 4'' x 45°", 
        img: "344893.jfif",
        img1:"344893.jfif",
        img2:"344893.jfif",
        img3:"344893.jfif",
        descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para desagüe",
        Recomendaciones: "Usar soldadura de PVC PAVCO para asegurar las uniones. Tener cuidado en la carga, transporte y descarga del material.",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "4''",
        presion:"710 psi",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo Desagüe PVC 1 1/2'' x 45°", 
        img: "344869.jfif",
        img1:"344869.jfif",
        img2:"344869.jfif",
        img3:"344869.jfif",
        descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para desagüe",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1 1/2''",
        presion:"1060 psi",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo Desagüe 6'' x 90°", 
        img: "391921.jfif",
        img1:"391921.jfif",
        img2:"391921.jfif",
        img3:"391921.jfif",
        descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para desagüe",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "6''",
        presion:"560 psi",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC-P sp 2'' 90°", 
        img: "396346.jfif",
        img1:"396346.jfif",
        img2:"396346.jfif",
        img3:"396346.jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "2''",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC-P sp 3/4'' 45°", 
        img: "308951.jfif",
        img1:"308951.jfif",
        img2:"308951.jfif",
        img3:"308951.jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "3/4''",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC 45° SAL 3''", 
        img: "344885.jfif",
        img1:"344885.jfif",
        img2:"344885.jfif",
        img3:"344885.jfif",
        descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para desagüe",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "3''",
        presion:"",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC-P sp 1'' 90°", 
        img: "308978.jfif",
        img1:"308978.jfif",
        img2:"308978.jfif",
        img3:"308978.jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1''",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC-P c/r 1 1/4'' 90°", 
        img: "309389.jfif",
        img1:"309389.jfif",
        img2:"309389.jfif",
        img3:"309389.jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1 1/4''",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC-P c/r 1'' 90°", 
        img: "309397.jfif",
        img1:"309397.jfif",
        img2:"309397.jfif",
        img3:"309397.jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1''",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC-P c/r 1'' 90°", 
        img: "309397 (1).jfif",
        img1:"309397 (1).jfif",
        img2:"309397 (1).jfif",
        img3:"309397 (1).jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1''",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo Desagüe 1 1/4'' x 45°", 
        img: "2310457.jfif",
        img1:"2310457.jfif",
        img2:"2310457.jfif",
        img3:"2310457.jfif",
        descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para desagüe",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1 1/4''",
        presion:"560 psi",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC-P c/r 3/4'' 90°", 
        img: "309419.jfif",
        img1:"309419.jfif",
        img2:"309419.jfif",
        img3:"309419.jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "3/4''",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC-P sp 1 1/2'' 90°", 
        img: "396427.jfif",
        img1:"396427.jfif",
        img2:"396427.jfif",
        img3:"396427.jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1 1/2''",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo Desagüe PVC 2'' x 90°", 
        img: "344923.jfif",
        img1:"344923.jfif",
        img2:"344923.jfif",
        img3:"344923.jfif",
        descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para desagüe",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: " 2''",
        presion:"890 psi",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC-P sp 1 1/4'' 90°", 
        img: "30896X.jfif",
        img1:"30896X.jfif",
        img2:"30896X.jfif",
        img3:"30896X.jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1 1/4'' ",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo CPVC 1/2'' 90°", 
        img: "308609.jfif",
        img1:"308609.jfif",
        img2:"308609.jfif",
        img3:"308609.jfif",
        descripcion: "Conexión de CPVC están diseñadas para trabajar en forma continua a una presión hidrostática y a temperaturas exigentes.", 
        usos: "Para agua caliente",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1/2''",
        presion:"100 psi (6.89 bar o 6.8 bar)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo cachimba PVC 1/2'' 90°", 
        img: "309354.jfif",
        img1:"309354.jfif",
        img2:"309354.jfif",
        img3:"309354.jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1/2''",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC-P sp 3/4'' 90°", 
        img: "308994.jfif",
        img1:"308994.jfif",
        img2:"308994.jfif",
        img3:"308994.jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "3/4''",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC 45° 1/2'' SP", 
        img: "308943.jfif",
        img1:"308943.jfif",
        img2:"308943.jfif",
        img3:"308943.jfif",
        descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "",
        presion:"",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo Desagüe 3'' x 45°", 
        img: "2680890.jfif",
        img1:"2680890.jfif",
        img2:"2680890.jfif",
        img3:"2680890.jfif",
        descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
        usos: "Para desagüe",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "3''",
        presion:"560 psi",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC-P sp 1'' 45°", 
        img: "308935.jfif",
        img1:"308935.jfif",
        img2:"308935.jfif",
        img3:"308935.jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1''",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
      {
        name:"Codo PVC-P c/r 1 1/2'' 90°", 
        img: "309370.jfif",
        img1:"309370.jfif",
        img2:"309370.jfif",
        img3:"309370.jfif",
        descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
        usos: "Para agua fría",
        Recomendaciones: "",  
        tipo: "Codo",
        marca: "Pavco",
        material: "PVC",
        Medida: "1 1/2''",
        presion:"10 bar (145 psi)",
        Color: "",
        cantidad: "",
        procedencia:"Nacional",
        precio: "",
        precioantes: "0",
        oferta: "0 %",
        categoriageneral: "Gasfiteria",
        categoria: "Conexiones Para Agua"
      },
    ];

    /* src\components\Header.svelte generated by Svelte v3.20.1 */

    const file$5 = "src\\components\\Header.svelte";

    function create_fragment$5(ctx) {
    	let div11;
    	let div10;
    	let div9;
    	let div7;
    	let ul;
    	let li0;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let li1;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let li2;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let li3;
    	let div3;
    	let img3;
    	let img3_src_value;
    	let t3;
    	let li4;
    	let div4;
    	let img4;
    	let img4_src_value;
    	let t4;
    	let li5;
    	let div5;
    	let img5;
    	let img5_src_value;
    	let t5;
    	let li6;
    	let div6;
    	let img6;
    	let img6_src_value;
    	let t6;
    	let div8;
    	let button0;
    	let svg0;
    	let path0;
    	let t7;
    	let button1;
    	let svg1;
    	let path1;

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div7 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			li1 = element("li");
    			div1 = element("div");
    			img1 = element("img");
    			t1 = space();
    			li2 = element("li");
    			div2 = element("div");
    			img2 = element("img");
    			t2 = space();
    			li3 = element("li");
    			div3 = element("div");
    			img3 = element("img");
    			t3 = space();
    			li4 = element("li");
    			div4 = element("div");
    			img4 = element("img");
    			t4 = space();
    			li5 = element("li");
    			div5 = element("div");
    			img5 = element("img");
    			t5 = space();
    			li6 = element("li");
    			div6 = element("div");
    			img6 = element("img");
    			t6 = space();
    			div8 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t7 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			if (img0.src !== (img0_src_value = "img/carrosel.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Offer 2");
    			set_style(img0, "width", "100%");
    			set_style(img0, "height", "100%");
    			set_style(img0, "display", "block");
    			set_style(img0, "position", "relative");
    			add_location(img0, file$5, 136, 14, 3248);
    			set_style(div0, "padding", "0px 15px");
    			set_style(div0, "overflow", "hidden");
    			attr_dev(div0, "class", "svelte-1c33go");
    			add_location(div0, file$5, 134, 12, 3180);
    			attr_dev(li0, "data-index", "0");
    			attr_dev(li0, "aria-hidden", "true");
    			set_style(li0, "flex", "1 1 auto");
    			set_style(li0, "position", "relative");
    			set_style(li0, "width", "350px");
    			attr_dev(li0, "class", "react-multi-carousel-item  svelte-1c33go");
    			add_location(li0, file$5, 129, 10, 2983);
    			if (img1.src !== (img1_src_value = "img/carrosel.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Offer 3");
    			set_style(img1, "width", "100%");
    			set_style(img1, "height", "100%");
    			set_style(img1, "display", "block");
    			set_style(img1, "position", "relative");
    			add_location(img1, file$5, 151, 14, 3747);
    			set_style(div1, "padding", "0px 15px");
    			set_style(div1, "overflow", "hidden");
    			attr_dev(div1, "class", "svelte-1c33go");
    			add_location(div1, file$5, 149, 12, 3679);
    			attr_dev(li1, "data-index", "1");
    			attr_dev(li1, "aria-hidden", "true");
    			set_style(li1, "flex", "1 1 auto");
    			set_style(li1, "position", "relative");
    			set_style(li1, "width", "350px");
    			attr_dev(li1, "class", "react-multi-carousel-item  svelte-1c33go");
    			add_location(li1, file$5, 144, 10, 3482);
    			if (img2.src !== (img2_src_value = "img/carrosel.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Offer 1");
    			set_style(img2, "width", "100%");
    			set_style(img2, "height", "100%");
    			set_style(img2, "display", "block");
    			set_style(img2, "position", "relative");
    			add_location(img2, file$5, 165, 14, 4244);
    			set_style(div2, "padding", "0px 15px");
    			set_style(div2, "overflow", "hidden");
    			attr_dev(div2, "class", "svelte-1c33go");
    			add_location(div2, file$5, 164, 12, 4178);
    			attr_dev(li2, "data-index", "2");
    			attr_dev(li2, "aria-hidden", "true");
    			set_style(li2, "flex", "1 1 auto");
    			set_style(li2, "position", "relative");
    			set_style(li2, "width", "350px");
    			attr_dev(li2, "class", "react-multi-carousel-item  svelte-1c33go");
    			add_location(li2, file$5, 159, 10, 3981);
    			if (img3.src !== (img3_src_value = "img/carrosel.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Offer 2");
    			set_style(img3, "width", "100%");
    			set_style(img3, "height", "100%");
    			set_style(img3, "display", "block");
    			set_style(img3, "position", "relative");
    			add_location(img3, file$5, 179, 14, 4776);
    			set_style(div3, "padding", "0px 15px");
    			set_style(div3, "overflow", "hidden");
    			attr_dev(div3, "class", "svelte-1c33go");
    			add_location(div3, file$5, 178, 12, 4710);
    			attr_dev(li3, "data-index", "3");
    			attr_dev(li3, "aria-hidden", "false");
    			attr_dev(li3, "class", "react-multi-carousel-item react-multi-carousel-item--active  svelte-1c33go");
    			set_style(li3, "flex", "1 1 auto");
    			set_style(li3, "position", "relative");
    			set_style(li3, "width", "350px");
    			add_location(li3, file$5, 173, 10, 4478);
    			if (img4.src !== (img4_src_value = "img/carrosel.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Offer 3");
    			set_style(img4, "width", "100%");
    			set_style(img4, "height", "100%");
    			set_style(img4, "display", "block");
    			set_style(img4, "position", "relative");
    			add_location(img4, file$5, 192, 14, 5271);
    			set_style(div4, "padding", "0px 15px");
    			set_style(div4, "overflow", "hidden");
    			attr_dev(div4, "class", "svelte-1c33go");
    			add_location(div4, file$5, 191, 12, 5205);
    			attr_dev(li4, "data-index", "4");
    			attr_dev(li4, "aria-hidden", "true");
    			attr_dev(li4, "class", "react-multi-carousel-item  svelte-1c33go");
    			set_style(li4, "flex", "1 1 auto");
    			set_style(li4, "position", "relative");
    			set_style(li4, "width", "350px");
    			add_location(li4, file$5, 186, 10, 5008);
    			if (img5.src !== (img5_src_value = "img/carrosel.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Offer 1");
    			set_style(img5, "width", "100%");
    			set_style(img5, "height", "100%");
    			set_style(img5, "display", "block");
    			set_style(img5, "position", "relative");
    			add_location(img5, file$5, 205, 14, 5766);
    			set_style(div5, "padding", "0px 15px");
    			set_style(div5, "overflow", "hidden");
    			attr_dev(div5, "class", "svelte-1c33go");
    			add_location(div5, file$5, 204, 12, 5700);
    			attr_dev(li5, "data-index", "5");
    			attr_dev(li5, "aria-hidden", "true");
    			attr_dev(li5, "class", "react-multi-carousel-item  svelte-1c33go");
    			set_style(li5, "flex", "1 1 auto");
    			set_style(li5, "position", "relative");
    			set_style(li5, "width", "350px");
    			add_location(li5, file$5, 199, 10, 5503);
    			if (img6.src !== (img6_src_value = "img/carrosel.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "Offer 2");
    			set_style(img6, "width", "100%");
    			set_style(img6, "height", "100%");
    			set_style(img6, "display", "block");
    			set_style(img6, "position", "relative");
    			add_location(img6, file$5, 218, 14, 6261);
    			set_style(div6, "padding", "0px 15px");
    			set_style(div6, "overflow", "hidden");
    			attr_dev(div6, "class", "svelte-1c33go");
    			add_location(div6, file$5, 217, 12, 6195);
    			attr_dev(li6, "data-index", "6");
    			attr_dev(li6, "aria-hidden", "true");
    			attr_dev(li6, "class", "react-multi-carousel-item  svelte-1c33go");
    			set_style(li6, "flex", "1 1 auto");
    			set_style(li6, "position", "relative");
    			set_style(li6, "width", "350px");
    			add_location(li6, file$5, 212, 10, 5998);
    			attr_dev(ul, "class", "react-multi-carousel-track  svelte-1c33go");
    			set_style(ul, "transition", "none 0s ease 0s");
    			set_style(ul, "overflow", "unset");
    			set_style(ul, "transform", "translate3d(-1050px, 0px, 0px)");
    			add_location(ul, file$5, 125, 8, 2801);
    			attr_dev(div7, "class", "react-multi-carousel-list container-with-dots  svelte-1c33go");
    			add_location(div7, file$5, 124, 6, 2731);
    			attr_dev(path0, "d", "M217.9 256L345 129c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.3-34\r\n              0L167 239c-9.1 9.1-9.3 23.7-.7 33.1L310.9 417c4.7 4.7 10.9 7 17\r\n              7s12.3-2.3 17-7c9.4-9.4 9.4-24.6 0-33.9L217.9 256z");
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "stroke", "currentColor");
    			add_location(path0, file$5, 233, 12, 6793);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 512 512");
    			attr_dev(svg0, "width", "20");
    			add_location(svg0, file$5, 229, 10, 6667);
    			attr_dev(button0, "class", "Carousel__ButtonPrev-cc7cxd-0 fCpHYD prevButton svelte-1c33go");
    			add_location(button0, file$5, 228, 8, 6591);
    			attr_dev(path1, "d", "M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345\r\n              239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17\r\n              7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z");
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "stroke", "currentColor");
    			add_location(path1, file$5, 246, 12, 7356);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 512 512");
    			attr_dev(svg1, "width", "20");
    			add_location(svg1, file$5, 242, 10, 7230);
    			attr_dev(button1, "class", "Carousel__ButtonNext-cc7cxd-1 jBUAwk nextButton vistab svelte-1c33go");
    			add_location(button1, file$5, 241, 8, 7147);
    			attr_dev(div8, "class", "Carousel__ButtonGroupWrapper-cc7cxd-2 WCVP vistab svelte-1c33go");
    			add_location(div8, file$5, 227, 6, 6518);
    			attr_dev(div9, "dir", "ltr");
    			attr_dev(div9, "class", "svelte-1c33go");
    			add_location(div9, file$5, 123, 4, 2708);
    			set_style(div10, "margin", "0 -10px");
    			attr_dev(div10, "class", "svelte-1c33go");
    			add_location(div10, file$5, 122, 2, 2674);
    			attr_dev(div11, "class", "pagesstyle__OfferSection-sc-1ufuelp-6 jvGrjF vista svelte-1c33go");
    			add_location(div11, file$5, 121, 0, 2606);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div7, ul);
    			append_dev(ul, li0);
    			append_dev(li0, div0);
    			append_dev(div0, img0);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			append_dev(li1, div1);
    			append_dev(div1, img1);
    			append_dev(ul, t1);
    			append_dev(ul, li2);
    			append_dev(li2, div2);
    			append_dev(div2, img2);
    			append_dev(ul, t2);
    			append_dev(ul, li3);
    			append_dev(li3, div3);
    			append_dev(div3, img3);
    			append_dev(ul, t3);
    			append_dev(ul, li4);
    			append_dev(li4, div4);
    			append_dev(div4, img4);
    			append_dev(ul, t4);
    			append_dev(ul, li5);
    			append_dev(li5, div5);
    			append_dev(div5, img5);
    			append_dev(ul, t5);
    			append_dev(ul, li6);
    			append_dev(li6, div6);
    			append_dev(div6, img6);
    			append_dev(div9, t6);
    			append_dev(div9, div8);
    			append_dev(div8, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div8, t7);
    			append_dev(div8, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\CardWrapper.svelte generated by Svelte v3.20.1 */
    const file$6 = "src\\components\\CardWrapper.svelte";

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (863:4) {:else}
    function create_else_block$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "item4";
    			add_location(p, file$6, 863, 6, 28546);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(863:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (861:27) 
    function create_if_block_2$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "item3";
    			add_location(p, file$6, 861, 6, 28513);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(861:27) ",
    		ctx
    	});

    	return block;
    }

    // (853:27) 
    function create_if_block_1$2(ctx) {
    	let div1;
    	let div0;
    	let current;
    	let each_value_2 = items1;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "Productsstyle__ProductsRow-p6azvq-0 fteaaY svelte-ynqohw");
    			add_location(div0, file$6, 854, 8, 28308);
    			attr_dev(div1, "class", "svelte-ynqohw");
    			add_location(div1, file$6, 853, 6, 28293);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items1*/ 0) {
    				each_value_2 = items1;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(853:27) ",
    		ctx
    	});

    	return block;
    }

    // (831:4) {#if scoops === 1}
    function create_if_block$3(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let t;
    	let current;
    	let each_value_1 = items;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = items1;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "StoreNavstyle__StoreNavLinks-z670xw-1 jPglrN1 svelte-ynqohw");
    			add_location(div0, file$6, 836, 12, 27932);
    			attr_dev(div1, "class", "StoreNavstyle__StoreNavWrapper-z670xw-0 bROIVP1 desaparecer svelte-ynqohw");
    			add_location(div1, file$6, 833, 10, 27830);
    			attr_dev(div2, "class", "Productsstyle__ProductsRow-p6azvq-0 fteaaY svelte-ynqohw");
    			add_location(div2, file$6, 832, 8, 27762);
    			attr_dev(div3, "class", "svelte-ynqohw");
    			add_location(div3, file$6, 831, 6, 27747);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 0) {
    				each_value_1 = items;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*items1*/ 0) {
    				each_value = items1;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(831:4) {#if scoops === 1}",
    		ctx
    	});

    	return block;
    }

    // (856:10) {#each items1 as item}
    function create_each_block_2(ctx) {
    	let current;

    	const card = new Card({
    			props: { item: /*item*/ ctx[17] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(856:10) {#each items1 as item}",
    		ctx
    	});

    	return block;
    }

    // (838:14) {#each items as item}
    function create_each_block_1(ctx) {
    	let current;

    	const card = new Card({
    			props: { item: /*item*/ ctx[17] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(838:14) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    // (847:10) {#each items1 as item}
    function create_each_block(ctx) {
    	let current;

    	const card = new Card({
    			props: { item: /*item*/ ctx[17] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(847:10) {#each items1 as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div9;
    	let div8;
    	let div0;
    	let a0;
    	let input0;
    	let input0_value_value;
    	let t0;
    	let label0;
    	let t2;
    	let div1;
    	let a1;
    	let input1;
    	let input1_value_value;
    	let t3;
    	let label1;
    	let t4;
    	let div2;
    	let a2;
    	let input2;
    	let input2_value_value;
    	let t5;
    	let label2;
    	let t6;
    	let div3;
    	let a3;
    	let input3;
    	let input3_value_value;
    	let t7;
    	let label3;
    	let t8;
    	let div4;
    	let a4;
    	let span0;
    	let t9;
    	let div5;
    	let a5;
    	let span1;
    	let t10;
    	let div6;
    	let a6;
    	let span2;
    	let t11;
    	let div7;
    	let a7;
    	let span3;
    	let t12;
    	let main;
    	let div39;
    	let div38;
    	let div15;
    	let div14;
    	let div13;
    	let div12;
    	let div10;
    	let svg0;
    	let path0;
    	let t13;
    	let t14;
    	let div11;
    	let svg1;
    	let path1;
    	let t15;
    	let div37;
    	let div36;
    	let div35;
    	let div34;
    	let div29;
    	let div28;
    	let div27;
    	let header0;
    	let input4;
    	let input4_value_value;
    	let t16;
    	let div16;
    	let svg2;
    	let g1;
    	let g0;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;
    	let path11;
    	let path12;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let t17;
    	let label4;
    	let t19;
    	let div26;
    	let div25;
    	let div20;
    	let header1;
    	let div17;
    	let svg3;
    	let rect0;
    	let t20;
    	let input5;
    	let input5_value_value;
    	let t21;
    	let label5;
    	let t23;
    	let div19;
    	let div18;
    	let t24;
    	let div24;
    	let header2;
    	let div21;
    	let svg4;
    	let rect1;
    	let t25;
    	let input6;
    	let input6_value_value;
    	let t26;
    	let label6;
    	let t28;
    	let div23;
    	let div22;
    	let t29;
    	let div31;
    	let div30;
    	let t30;
    	let div33;
    	let div32;
    	let t31;
    	let div40;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block$3, create_if_block_1$2, create_if_block_2$2, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*scoops*/ ctx[0] === 1) return 0;
    		if (/*scoops*/ ctx[0] === 2) return 1;
    		if (/*scoops*/ ctx[0] === 3) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div8 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			input0 = element("input");
    			t0 = space();
    			label0 = element("label");
    			label0.textContent = "Accesorios y Conexiones";
    			t2 = space();
    			div1 = element("div");
    			a1 = element("a");
    			input1 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = space();
    			div2 = element("div");
    			a2 = element("a");
    			input2 = element("input");
    			t5 = space();
    			label2 = element("label");
    			t6 = space();
    			div3 = element("div");
    			a3 = element("a");
    			input3 = element("input");
    			t7 = space();
    			label3 = element("label");
    			t8 = space();
    			div4 = element("div");
    			a4 = element("a");
    			span0 = element("span");
    			t9 = space();
    			div5 = element("div");
    			a5 = element("a");
    			span1 = element("span");
    			t10 = space();
    			div6 = element("div");
    			a6 = element("a");
    			span2 = element("span");
    			t11 = space();
    			div7 = element("div");
    			a7 = element("a");
    			span3 = element("span");
    			t12 = space();
    			main = element("main");
    			div39 = element("div");
    			div38 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			div10 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t13 = text("\r\n                Select your Category");
    			t14 = space();
    			div11 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t15 = space();
    			div37 = element("div");
    			div36 = element("div");
    			div35 = element("div");
    			div34 = element("div");
    			div29 = element("div");
    			div28 = element("div");
    			div27 = element("div");
    			header0 = element("header");
    			input4 = element("input");
    			t16 = space();
    			div16 = element("div");
    			svg2 = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			t17 = space();
    			label4 = element("label");
    			label4.textContent = "Accesorios y conexiones";
    			t19 = space();
    			div26 = element("div");
    			div25 = element("div");
    			div20 = element("div");
    			header1 = element("header");
    			div17 = element("div");
    			svg3 = svg_element("svg");
    			rect0 = svg_element("rect");
    			t20 = space();
    			input5 = element("input");
    			t21 = space();
    			label5 = element("label");
    			label5.textContent = "Fruits";
    			t23 = space();
    			div19 = element("div");
    			div18 = element("div");
    			t24 = space();
    			div24 = element("div");
    			header2 = element("header");
    			div21 = element("div");
    			svg4 = svg_element("svg");
    			rect1 = svg_element("rect");
    			t25 = space();
    			input6 = element("input");
    			t26 = space();
    			label6 = element("label");
    			label6.textContent = "Vegetables";
    			t28 = space();
    			div23 = element("div");
    			div22 = element("div");
    			t29 = space();
    			div31 = element("div");
    			div30 = element("div");
    			t30 = space();
    			div33 = element("div");
    			div32 = element("div");
    			t31 = space();
    			div40 = element("div");
    			if_block.c();
    			attr_dev(input0, "id", "select1");
    			attr_dev(input0, "class", "opcion svelte-ynqohw");
    			attr_dev(input0, "type", "radio");
    			input0.__value = input0_value_value = 1;
    			input0.value = input0.__value;
    			/*$$binding_groups*/ ctx[10][0].push(input0);
    			add_location(input0, file$6, 405, 8, 8105);
    			attr_dev(label0, "for", "select1");
    			attr_dev(label0, "class", "TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI svelte-ynqohw");
    			add_location(label0, file$6, 412, 8, 8252);
    			attr_dev(a0, "class", " current-page svelte-ynqohw");
    			set_style(a0, "display", "flex");
    			set_style(a0, "align-items", "center");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$6, 404, 6, 8021);
    			attr_dev(div0, "class", "store-nav-link svelte-ynqohw");
    			add_location(div0, file$6, 403, 4, 7985);
    			attr_dev(input1, "id", "select2");
    			attr_dev(input1, "class", "opcion svelte-ynqohw");
    			attr_dev(input1, "type", "radio");
    			input1.__value = input1_value_value = 2;
    			input1.value = input1.__value;
    			/*$$binding_groups*/ ctx[10][0].push(input1);
    			add_location(input1, file$6, 421, 8, 8516);
    			attr_dev(label1, "for", "select2");
    			attr_dev(label1, "class", "TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI svelte-ynqohw");
    			add_location(label1, file$6, 427, 8, 8661);
    			attr_dev(a1, "class", " svelte-ynqohw");
    			set_style(a1, "display", "flex");
    			set_style(a1, "align-items", "center");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$6, 420, 6, 8445);
    			attr_dev(div1, "class", "store-nav-link svelte-ynqohw");
    			add_location(div1, file$6, 419, 4, 8409);
    			attr_dev(input2, "id", "select3");
    			attr_dev(input2, "class", "opcion svelte-ynqohw");
    			attr_dev(input2, "type", "radio");
    			input2.__value = input2_value_value = 3;
    			input2.value = input2.__value;
    			/*$$binding_groups*/ ctx[10][0].push(input2);
    			add_location(input2, file$6, 432, 8, 8870);
    			attr_dev(label2, "for", "select3");
    			attr_dev(label2, "class", "TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI svelte-ynqohw");
    			add_location(label2, file$6, 438, 8, 9015);
    			attr_dev(a2, "class", " svelte-ynqohw");
    			set_style(a2, "display", "flex");
    			set_style(a2, "align-items", "center");
    			attr_dev(a2, "href", "/");
    			add_location(a2, file$6, 431, 6, 8799);
    			attr_dev(div2, "class", "store-nav-link svelte-ynqohw");
    			add_location(div2, file$6, 430, 4, 8763);
    			attr_dev(input3, "id", "select4");
    			attr_dev(input3, "class", "opcion svelte-ynqohw");
    			attr_dev(input3, "type", "radio");
    			input3.__value = input3_value_value = 4;
    			input3.value = input3.__value;
    			/*$$binding_groups*/ ctx[10][0].push(input3);
    			add_location(input3, file$6, 443, 8, 9224);
    			attr_dev(label3, "for", "select4");
    			attr_dev(label3, "class", "TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI svelte-ynqohw");
    			add_location(label3, file$6, 449, 8, 9369);
    			attr_dev(a3, "class", " svelte-ynqohw");
    			set_style(a3, "display", "flex");
    			set_style(a3, "align-items", "center");
    			attr_dev(a3, "href", "/");
    			add_location(a3, file$6, 442, 6, 9153);
    			attr_dev(div3, "class", "store-nav-link svelte-ynqohw");
    			add_location(div3, file$6, 441, 4, 9117);
    			attr_dev(span0, "class", "label svelte-ynqohw");
    			add_location(span0, file$6, 454, 8, 9578);
    			attr_dev(a4, "class", " svelte-ynqohw");
    			set_style(a4, "display", "flex");
    			set_style(a4, "align-items", "center");
    			attr_dev(a4, "href", "/");
    			add_location(a4, file$6, 453, 6, 9507);
    			attr_dev(div4, "class", "store-nav-link svelte-ynqohw");
    			add_location(div4, file$6, 452, 4, 9471);
    			attr_dev(span1, "class", "label svelte-ynqohw");
    			add_location(span1, file$6, 459, 8, 9737);
    			attr_dev(a5, "class", " svelte-ynqohw");
    			set_style(a5, "display", "flex");
    			set_style(a5, "align-items", "center");
    			attr_dev(a5, "href", "/");
    			add_location(a5, file$6, 458, 6, 9666);
    			attr_dev(div5, "class", "store-nav-link svelte-ynqohw");
    			add_location(div5, file$6, 457, 4, 9630);
    			attr_dev(span2, "class", "label svelte-ynqohw");
    			add_location(span2, file$6, 464, 8, 9896);
    			attr_dev(a6, "class", " svelte-ynqohw");
    			set_style(a6, "display", "flex");
    			set_style(a6, "align-items", "center");
    			attr_dev(a6, "href", "/");
    			add_location(a6, file$6, 463, 6, 9825);
    			attr_dev(div6, "class", "store-nav-link svelte-ynqohw");
    			add_location(div6, file$6, 462, 4, 9789);
    			attr_dev(span3, "class", "label svelte-ynqohw");
    			add_location(span3, file$6, 469, 8, 10055);
    			attr_dev(a7, "class", " svelte-ynqohw");
    			set_style(a7, "display", "flex");
    			set_style(a7, "align-items", "center");
    			attr_dev(a7, "href", "/");
    			add_location(a7, file$6, 468, 6, 9984);
    			attr_dev(div7, "class", "store-nav-link svelte-ynqohw");
    			add_location(div7, file$6, 467, 4, 9948);
    			attr_dev(div8, "class", "StoreNavstyle__StoreNavLinks-z670xw-1 jPglrN svelte-ynqohw");
    			add_location(div8, file$6, 402, 2, 7921);
    			attr_dev(div9, "class", "StoreNavstyle__StoreNavWrapper-z670xw-0 bROIVP desaparecer  svelte-ynqohw");
    			add_location(div9, file$6, 401, 0, 7844);
    			attr_dev(path0, "data-name", "Path 2029");
    			attr_dev(path0, "d", "M13.563,7.876H8.313a.437.437,0,0,0-.437.437v5.25A.437.437,0,0,0,8.313,14h5.25A.437.437,0,0,0,14,13.564V8.314A.437.437,0,0,0,13.563,7.876Zm0-7.875H8.313a.437.437,0,0,0-.437.437v5.25a.437.437,0,0,0,.437.437h5.25A.437.437,0,0,0,14,5.688V.438A.437.437,0,0,0,13.563,0ZM5.687,0H.437A.438.438,0,0,0,0,.438v5.25a.437.437,0,0,0,.437.437h5.25a.437.437,0,0,0,.437-.437V.438A.438.438,0,0,0,5.687,0Zm0,7.875H.437A.437.437,0,0,0,0,8.314v5.25A.437.437,0,0,0,.437,14h5.25a.437.437,0,0,0,.437-.437V8.314A.437.437,0,0,0,5.687,7.876Z");
    			attr_dev(path0, "transform", "translate(0 -0.001)");
    			attr_dev(path0, "fill", "currentColor");
    			add_location(path0, file$6, 500, 18, 11080);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "14");
    			attr_dev(svg0, "height", "14");
    			attr_dev(svg0, "viewBox", "0 0 14 14");
    			attr_dev(svg0, "class", "svelte-ynqohw");
    			add_location(svg0, file$6, 495, 16, 10901);
    			attr_dev(div10, "class", "svelte-ynqohw");
    			add_location(div10, file$6, 494, 14, 10878);
    			attr_dev(path1, "data-name", "Path 2030");
    			attr_dev(path1, "d", "M0,63.75l5,5,5-5Z");
    			attr_dev(path1, "transform", "translate(0 -63.75)");
    			attr_dev(path1, "fill", "currentColor");
    			add_location(path1, file$6, 514, 18, 12065);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "10");
    			attr_dev(svg1, "height", "5");
    			attr_dev(svg1, "viewBox", "0 0 10 5");
    			attr_dev(svg1, "class", "svelte-ynqohw");
    			add_location(svg1, file$6, 509, 16, 11888);
    			attr_dev(div11, "class", "svelte-ynqohw");
    			add_location(div11, file$6, 508, 14, 11865);
    			attr_dev(div12, "class", "Sidebarstyle__PopoverHandler-sc-10zqjq2-5 cXRUBX svelte-ynqohw");
    			add_location(div12, file$6, 493, 12, 10800);
    			attr_dev(div13, "class", "popover-handler svelte-ynqohw");
    			add_location(div13, file$6, 492, 10, 10757);
    			attr_dev(div14, "class", "Popoverstyle__PopoverWrapper-ebbms3-0 dZMxZn popover-wrapper\r\n          category-popover svelte-ynqohw");
    			add_location(div14, file$6, 489, 8, 10632);
    			attr_dev(div15, "class", "Sidebarstyle__PopoverWrapper-sc-10zqjq2-0 eaFjsg svelte-ynqohw");
    			add_location(div15, file$6, 488, 6, 10560);
    			attr_dev(input4, "id", "select1");
    			attr_dev(input4, "class", "opcion svelte-ynqohw");
    			attr_dev(input4, "type", "radio");
    			input4.__value = input4_value_value = 1;
    			input4.value = input4.__value;
    			/*$$binding_groups*/ ctx[10][0].push(input4);
    			add_location(input4, file$6, 542, 22, 13292);
    			attr_dev(path2, "data-name", "Path 16");
    			attr_dev(path2, "d", "M10.235 3.966a2.943 2.943 0\r\n                                00-1.38-2.122c-.528-.243-.485-.618-.338-.854s.41-.231.832.164a5\r\n                                5 0 011.368 2.87z");
    			attr_dev(path2, "fill", "currentColor");
    			attr_dev(path2, "stroke", "currentColor");
    			attr_dev(path2, "stroke-miterlimit", "10");
    			attr_dev(path2, "stroke-width", ".416");
    			add_location(path2, file$6, 558, 30, 13965);
    			attr_dev(path3, "data-name", "Path 17");
    			attr_dev(path3, "d", "M6.514 7.976a4.757 4.757 0 109.513\r\n                                0c0-2.627-1.5-4.976-4.757-4.73-2.619.197-4.767\r\n                                1.656-4.756 4.73z");
    			attr_dev(path3, "fill", "none");
    			attr_dev(path3, "stroke", "currentColor");
    			attr_dev(path3, "stroke-linecap", "round");
    			attr_dev(path3, "stroke-linejoin", "round");
    			attr_dev(path3, "stroke-width", "1.387");
    			add_location(path3, file$6, 567, 30, 14488);
    			attr_dev(path4, "data-name", "Path 18");
    			attr_dev(path4, "d", "M6.514 7.976a4.757 4.757 0 109.513\r\n                                0c0-2.627-1.5-4.976-4.757-4.73-2.619.197-4.767\r\n                                1.656-4.756 4.73z");
    			attr_dev(path4, "fill", "currentColor");
    			add_location(path4, file$6, 577, 30, 15051);
    			attr_dev(path5, "data-name", "Path 19");
    			attr_dev(path5, "d", "M14.731 5.045s1.506 1.544.714\r\n                                2.993c-.287.526-1.2.192-1.234-.485s.25-1.27-.236-2.05c-.349-.566.26-.878.756-.458z");
    			attr_dev(path5, "fill", "#fff");
    			add_location(path5, file$6, 583, 30, 15400);
    			attr_dev(path6, "data-name", "Path 20");
    			attr_dev(path6, "d", "M10.834 3.413s1.161-4.315 6.469-2.048c0\r\n                                0-2.459 4.074-6.469 2.048z");
    			attr_dev(path6, "stroke", "currentColor");
    			attr_dev(path6, "stroke-linecap", "round");
    			attr_dev(path6, "stroke-linejoin", "round");
    			attr_dev(path6, "stroke-width", "1.387");
    			add_location(path6, file$6, 588, 30, 15721);
    			attr_dev(path7, "data-name", "Path 21");
    			attr_dev(path7, "d", "M10.834 3.413s1.161-4.315 6.469-2.048c0\r\n                                0-2.459 4.074-6.469 2.048z");
    			attr_dev(path7, "fill", "#fff");
    			add_location(path7, file$6, 596, 30, 16173);
    			attr_dev(path8, "data-name", "Path 22");
    			attr_dev(path8, "d", "M10.516 4.513a10.193 10.193 0\r\n                                015.63-2.863c-2.736-.521-6.018 1.748-6.018\r\n                                1.748s.289.864.388 1.115z");
    			attr_dev(path8, "fill", "currentColor");
    			attr_dev(path8, "stroke", "currentColor");
    			attr_dev(path8, "stroke-linecap", "round");
    			attr_dev(path8, "stroke-linejoin", "round");
    			attr_dev(path8, "stroke-width", ".035");
    			add_location(path8, file$6, 601, 30, 16448);
    			attr_dev(path9, "data-name", "Path 23");
    			attr_dev(path9, "d", "M10.895\r\n                                9.896h0c-.268-.877-1.969-1.65-4.234-1.72a5.286\r\n                                5.286 0 00-4.515 1.858 2 2 0 00-.551\r\n                                1.308h0a4.934 4.934 0 004.768 4.426c3.133.223\r\n                                3.786-.96 4.225-1.9a6.363 6.363 0 00.307-3.972z");
    			attr_dev(path9, "fill", "#fff");
    			attr_dev(path9, "stroke", "#fff");
    			attr_dev(path9, "stroke-linecap", "round");
    			attr_dev(path9, "stroke-linejoin", "round");
    			attr_dev(path9, "stroke-width", "3.19");
    			add_location(path9, file$6, 611, 30, 17017);
    			attr_dev(path10, "data-name", "Path 24");
    			attr_dev(path10, "d", "M10.895\r\n                                9.896h0c-.268-.877-1.969-1.65-4.234-1.72a5.286\r\n                                5.286 0 00-4.515 1.858 2 2 0 00-.551\r\n                                1.308h0a4.934 4.934 0 004.768 4.426c3.133.223\r\n                                3.786-.96 4.225-1.9a6.363 6.363 0 00.307-3.972z");
    			attr_dev(path10, "fill", "none");
    			attr_dev(path10, "stroke", "currentColor");
    			attr_dev(path10, "stroke-linecap", "round");
    			attr_dev(path10, "stroke-linejoin", "round");
    			attr_dev(path10, "stroke-width", "1.387");
    			add_location(path10, file$6, 623, 30, 17723);
    			attr_dev(path11, "data-name", "Path 25");
    			attr_dev(path11, "d", "M10.895\r\n                                9.896h0c-.268-.877-1.969-1.65-4.234-1.72a5.286\r\n                                5.286 0 00-4.515 1.858 2 2 0 00-.551\r\n                                1.308h0a4.934 4.934 0 004.768 4.426c3.133.223\r\n                                3.786-.96 4.225-1.9a6.363 6.363 0 00.307-3.972z");
    			attr_dev(path11, "fill", "#fff");
    			attr_dev(path11, "stroke", "currentColor");
    			attr_dev(path11, "stroke-miterlimit", "10");
    			attr_dev(path11, "stroke-width", ".069");
    			add_location(path11, file$6, 635, 30, 18438);
    			attr_dev(path12, "data-name", "Path 26");
    			attr_dev(path12, "d", "M10.895\r\n                                9.896c-.268-.877-1.969-1.65-4.234-1.72a5.286\r\n                                5.286 0 00-4.515 1.858 2 2 0 00-.551 1.308 4.934\r\n                                4.934 0 004.768 4.426c3.133.223 3.786-.96\r\n                                4.225-1.9a6.363 6.363 0 00.307-3.972z");
    			attr_dev(path12, "fill", "currentColor");
    			add_location(path12, file$6, 646, 30, 19095);
    			attr_dev(path13, "data-name", "Path 27");
    			attr_dev(path13, "d", "M1.595 11.342a4.375 4.375 0 00.128.684 2.664\r\n                                2.664 0 00.3.335c1.067 1.028 4.409 1.723 7.173 1\r\n                                .883-.23\r\n                                1.522-1.3.526-1.851-.139-.076-.243-.184-.208-.277s.089-.106.269-.1a1.2\r\n                                1.2 0 001.232-.735 4.126 4.126 0\r\n                                00-.121-.509c-.272-.876-1.974-1.644-4.239-1.715a5.286\r\n                                5.286 0 00-4.515 1.858 2.024 2.024 0 00-.545\r\n                                1.31z");
    			attr_dev(path13, "fill", "#fff");
    			add_location(path13, file$6, 654, 30, 19592);
    			attr_dev(path14, "data-name", "Path 28");
    			attr_dev(path14, "d", "M1.921 9.984a1.569 1.569 0 00.1 2.377c1.066\r\n                                1.028 4.409 1.723 7.173 1 .883-.23\r\n                                1.522-1.3.526-1.851-.139-.076-.243-.184-.208-.277s.089-.106.269-.1a1.183\r\n                                1.183 0 001.259-.823 1.321 1.321 0 00-.785-1.413");
    			attr_dev(path14, "fill", "none");
    			attr_dev(path14, "stroke", "currentColor");
    			attr_dev(path14, "stroke-linecap", "round");
    			attr_dev(path14, "stroke-linejoin", "round");
    			attr_dev(path14, "stroke-width", ".416");
    			add_location(path14, file$6, 665, 30, 20310);
    			attr_dev(path15, "data-name", "Path 29");
    			attr_dev(path15, "d", "M8.013\r\n                                10.78c-.018.471-.87.791-1.9.752s-1.856-.423-1.837-.9.87-.963\r\n                                1.9-.924 1.855.605 1.837 1.072z");
    			attr_dev(path15, "fill", "currentColor");
    			attr_dev(path15, "stroke", "currentColor");
    			attr_dev(path15, "stroke-linecap", "round");
    			attr_dev(path15, "stroke-linejoin", "round");
    			attr_dev(path15, "stroke-width", ".555");
    			add_location(path15, file$6, 676, 30, 21006);
    			attr_dev(path16, "data-name", "Path 30");
    			attr_dev(path16, "d", "M9.722 12.123a2.411 2.411 0 01.467 2.08 2.759\r\n                                2.759 0 01-1.5 2.427");
    			attr_dev(path16, "fill", "none");
    			attr_dev(path16, "stroke", "#fff");
    			attr_dev(path16, "stroke-linecap", "round");
    			attr_dev(path16, "stroke-linejoin", "round");
    			attr_dev(path16, "stroke-width", ".555");
    			add_location(path16, file$6, 686, 30, 21576);
    			attr_dev(g0, "data-name", "Layer 3");
    			add_location(g0, file$6, 557, 28, 13910);
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$6, 556, 26, 13857);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "width", "18px");
    			attr_dev(svg2, "height", "18px");
    			attr_dev(svg2, "viewBox", "0 0 18 18");
    			attr_dev(svg2, "class", "svelte-ynqohw");
    			add_location(svg2, file$6, 551, 24, 13634);
    			attr_dev(div16, "class", "TreeMenustyle__IconWrapper-sc-1pcei7c-1 iMJnej svelte-ynqohw");
    			add_location(div16, file$6, 549, 22, 13523);
    			attr_dev(label4, "for", "select1");
    			attr_dev(label4, "class", "TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI svelte-ynqohw");
    			add_location(label4, file$6, 700, 22, 22186);
    			attr_dev(header0, "class", "TreeMenustyle__Header-sc-1pcei7c-0 giPkvJ parent svelte-ynqohw");
    			attr_dev(header0, "open", "");
    			add_location(header0, file$6, 539, 20, 13149);
    			attr_dev(rect0, "data-name", "Rectangle 522");
    			attr_dev(rect0, "width", "12px");
    			attr_dev(rect0, "height", "2px");
    			attr_dev(rect0, "rx", "1");
    			attr_dev(rect0, "fill", "currentColor");
    			add_location(rect0, file$6, 726, 32, 23360);
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "width", "12px");
    			attr_dev(svg3, "height", "2px");
    			attr_dev(svg3, "viewBox", "0 0 12 2");
    			attr_dev(svg3, "class", "svelte-ynqohw");
    			add_location(svg3, file$6, 721, 30, 23109);
    			attr_dev(div17, "class", "TreeMenustyle__IconWrapper-sc-1pcei7c-1\r\n                              fAryMo svelte-ynqohw");
    			add_location(div17, file$6, 718, 28, 22955);
    			attr_dev(input5, "id", "select2");
    			attr_dev(input5, "class", "opcion svelte-ynqohw");
    			attr_dev(input5, "type", "radio");
    			input5.__value = input5_value_value = 2;
    			input5.value = input5.__value;
    			/*$$binding_groups*/ ctx[10][0].push(input5);
    			add_location(input5, file$6, 734, 28, 23726);
    			attr_dev(label5, "for", "select2");
    			attr_dev(label5, "class", "TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI svelte-ynqohw");
    			add_location(label5, file$6, 740, 28, 23991);
    			attr_dev(header1, "class", "TreeMenustyle__Header-sc-1pcei7c-0 fexoSQ\r\n                            child svelte-ynqohw");
    			attr_dev(header1, "open", "");
    			add_location(header1, file$6, 714, 26, 22766);
    			set_style(div18, "transform", "translate3d(0px, 0px, 0px)");
    			attr_dev(div18, "class", "svelte-ynqohw");
    			add_location(div18, file$6, 750, 28, 24443);
    			set_style(div19, "opacity", "1");
    			set_style(div19, "height", "0px");
    			attr_dev(div19, "class", "TreeMenustyle__Content-sc-1pcei7c-3 iznAyA svelte-ynqohw");
    			add_location(div19, file$6, 747, 26, 24266);
    			attr_dev(div20, "class", "TreeMenustyle__Frame-sc-1pcei7c-4 cNbgwQ svelte-ynqohw");
    			add_location(div20, file$6, 712, 24, 22682);
    			attr_dev(rect1, "data-name", "Rectangle 522");
    			attr_dev(rect1, "width", "12px");
    			attr_dev(rect1, "height", "2px");
    			attr_dev(rect1, "rx", "1");
    			attr_dev(rect1, "fill", "currentColor");
    			add_location(rect1, file$6, 767, 32, 25261);
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg4, "width", "12px");
    			attr_dev(svg4, "height", "2px");
    			attr_dev(svg4, "viewBox", "0 0 12 2");
    			attr_dev(svg4, "class", "svelte-ynqohw");
    			add_location(svg4, file$6, 762, 30, 25010);
    			attr_dev(div21, "class", "TreeMenustyle__IconWrapper-sc-1pcei7c-1\r\n                              fAryMo svelte-ynqohw");
    			add_location(div21, file$6, 759, 28, 24856);
    			attr_dev(input6, "id", "select3");
    			attr_dev(input6, "class", "opcion svelte-ynqohw");
    			attr_dev(input6, "type", "radio");
    			input6.__value = input6_value_value = 3;
    			input6.value = input6.__value;
    			/*$$binding_groups*/ ctx[10][0].push(input6);
    			add_location(input6, file$6, 775, 28, 25627);
    			attr_dev(label6, "for", "select3");
    			attr_dev(label6, "class", "TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI svelte-ynqohw");
    			add_location(label6, file$6, 781, 28, 25892);
    			attr_dev(header2, "class", "TreeMenustyle__Header-sc-1pcei7c-0 hRTUfE\r\n                            child svelte-ynqohw");
    			add_location(header2, file$6, 756, 26, 24704);
    			set_style(div22, "transform", "translate3d(20px,0,0)");
    			attr_dev(div22, "class", "svelte-ynqohw");
    			add_location(div22, file$6, 791, 28, 26342);
    			set_style(div23, "opacity", "0");
    			set_style(div23, "height", "0");
    			attr_dev(div23, "class", "TreeMenustyle__Content-sc-1pcei7c-3 iznAyA svelte-ynqohw");
    			add_location(div23, file$6, 788, 26, 26171);
    			attr_dev(div24, "class", "TreeMenustyle__Frame-sc-1pcei7c-4 cNbgwQ svelte-ynqohw");
    			add_location(div24, file$6, 754, 24, 24620);
    			set_style(div25, "transform", "translate3d(0px, 0px, 0px)");
    			attr_dev(div25, "class", "svelte-ynqohw");
    			add_location(div25, file$6, 711, 22, 22604);
    			set_style(div26, "opacity", "1");
    			set_style(div26, "height", "auto");
    			attr_dev(div26, "class", "TreeMenustyle__Content-sc-1pcei7c-3 iznAyA svelte-ynqohw");
    			add_location(div26, file$6, 707, 20, 22442);
    			attr_dev(div27, "class", "TreeMenustyle__Frame-sc-1pcei7c-4 fMlvk svelte-ynqohw");
    			add_location(div27, file$6, 538, 18, 13074);
    			attr_dev(div28, "class", "Sidebarstyle__TreeWrapper-sc-10zqjq2-4 cjsAMp svelte-ynqohw");
    			add_location(div28, file$6, 537, 16, 12995);
    			set_style(div29, "position", "relative");
    			set_style(div29, "overflow", "scroll");
    			set_style(div29, "margin-right", "-17px");
    			set_style(div29, "margin-bottom", "-17px");
    			set_style(div29, "min-height", "17px");
    			set_style(div29, "max-height", "705px");
    			set_style(div29, "margin-left", "0px");
    			attr_dev(div29, "class", "svelte-ynqohw");
    			add_location(div29, file$6, 533, 14, 12777);
    			set_style(div30, "position", "relative");
    			set_style(div30, "display", "block");
    			set_style(div30, "height", "100%");
    			set_style(div30, "cursor", "pointer");
    			set_style(div30, "border-radius", "inherit");
    			set_style(div30, "background-color", "rgba(0, 0, 0, 0.2)");
    			set_style(div30, "width", "0px");
    			attr_dev(div30, "class", "svelte-ynqohw");
    			add_location(div30, file$6, 806, 16, 26825);
    			set_style(div31, "position", "absolute");
    			set_style(div31, "height", "6px");
    			set_style(div31, "transition", "opacity\r\n                200ms ease 0s");
    			set_style(div31, "opacity", "0");
    			set_style(div31, "right", "2px");
    			set_style(div31, "bottom", "2px");
    			set_style(div31, "left", "2px");
    			set_style(div31, "border-radius", "3px");
    			attr_dev(div31, "class", "svelte-ynqohw");
    			add_location(div31, file$6, 802, 14, 26607);
    			set_style(div32, "position", "relative");
    			set_style(div32, "display", "block");
    			set_style(div32, "width", "100%");
    			set_style(div32, "cursor", "pointer");
    			set_style(div32, "border-radius", "inherit");
    			set_style(div32, "background-color", "rgba(0, 0, 0, 0.2)");
    			set_style(div32, "height", "0px");
    			set_style(div32, "transform", "translateY(0px)");
    			attr_dev(div32, "class", "svelte-ynqohw");
    			add_location(div32, file$6, 815, 16, 27292);
    			set_style(div33, "position", "absolute");
    			set_style(div33, "width", "6px");
    			set_style(div33, "transition", "opacity 200ms\r\n                ease 0s");
    			set_style(div33, "opacity", "0");
    			set_style(div33, "right", "2px");
    			set_style(div33, "bottom", "2px");
    			set_style(div33, "top", "2px");
    			set_style(div33, "border-radius", "3px");
    			attr_dev(div33, "class", "svelte-ynqohw");
    			add_location(div33, file$6, 811, 14, 27076);
    			set_style(div34, "position", "relative");
    			set_style(div34, "overflow", "hidden");
    			set_style(div34, "width", "100%");
    			set_style(div34, "height", "auto");
    			set_style(div34, "min-height", "0");
    			set_style(div34, "max-height", "688px");
    			attr_dev(div34, "class", "svelte-ynqohw");
    			add_location(div34, file$6, 531, 12, 12646);
    			attr_dev(div35, "class", "sticky-inner-wrapper  svelte-ynqohw");
    			set_style(div35, "position", "relative");
    			set_style(div35, "transform", "translate3d(0px, 0px, 0px)");
    			add_location(div35, file$6, 528, 10, 12504);
    			attr_dev(div36, "class", "sticky-outer-wrapper svelte-ynqohw");
    			add_location(div36, file$6, 527, 8, 12449);
    			attr_dev(div37, "class", "Sidebarstyle__SidebarWrapper-sc-10zqjq2-2 bLZUVH svelte-ynqohw");
    			add_location(div37, file$6, 526, 6, 12377);
    			attr_dev(div38, "class", "Sidebarstyle__CategoryWrapper-sc-10zqjq2-3 egvYxQ svelte-ynqohw");
    			add_location(div38, file$6, 486, 4, 10487);
    			attr_dev(div39, "class", "pagesstyle__SidebarSection-sc-1ufuelp-4 enWbFA svelte-ynqohw");
    			add_location(div39, file$6, 485, 2, 10421);
    			attr_dev(div40, "class", "pagesstyle__ContentSection-sc-1ufuelp-5 jjeTWK svelte-ynqohw");
    			add_location(div40, file$6, 828, 2, 27653);
    			attr_dev(main, "class", "pagesstyle__MainContentArea-sc-1ufuelp-3 jjTQwV svelte-ynqohw");
    			add_location(main, file$6, 483, 0, 10353);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div8);
    			append_dev(div8, div0);
    			append_dev(div0, a0);
    			append_dev(a0, input0);
    			input0.checked = input0.__value === /*scoops*/ ctx[0];
    			append_dev(a0, t0);
    			append_dev(a0, label0);
    			append_dev(div8, t2);
    			append_dev(div8, div1);
    			append_dev(div1, a1);
    			append_dev(a1, input1);
    			input1.checked = input1.__value === /*scoops*/ ctx[0];
    			append_dev(a1, t3);
    			append_dev(a1, label1);
    			append_dev(div8, t4);
    			append_dev(div8, div2);
    			append_dev(div2, a2);
    			append_dev(a2, input2);
    			input2.checked = input2.__value === /*scoops*/ ctx[0];
    			append_dev(a2, t5);
    			append_dev(a2, label2);
    			append_dev(div8, t6);
    			append_dev(div8, div3);
    			append_dev(div3, a3);
    			append_dev(a3, input3);
    			input3.checked = input3.__value === /*scoops*/ ctx[0];
    			append_dev(a3, t7);
    			append_dev(a3, label3);
    			append_dev(div8, t8);
    			append_dev(div8, div4);
    			append_dev(div4, a4);
    			append_dev(a4, span0);
    			append_dev(div8, t9);
    			append_dev(div8, div5);
    			append_dev(div5, a5);
    			append_dev(a5, span1);
    			append_dev(div8, t10);
    			append_dev(div8, div6);
    			append_dev(div6, a6);
    			append_dev(a6, span2);
    			append_dev(div8, t11);
    			append_dev(div8, div7);
    			append_dev(div7, a7);
    			append_dev(a7, span3);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div39);
    			append_dev(div39, div38);
    			append_dev(div38, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div10);
    			append_dev(div10, svg0);
    			append_dev(svg0, path0);
    			append_dev(div10, t13);
    			append_dev(div12, t14);
    			append_dev(div12, div11);
    			append_dev(div11, svg1);
    			append_dev(svg1, path1);
    			append_dev(div38, t15);
    			append_dev(div38, div37);
    			append_dev(div37, div36);
    			append_dev(div36, div35);
    			append_dev(div35, div34);
    			append_dev(div34, div29);
    			append_dev(div29, div28);
    			append_dev(div28, div27);
    			append_dev(div27, header0);
    			append_dev(header0, input4);
    			input4.checked = input4.__value === /*scoops*/ ctx[0];
    			append_dev(header0, t16);
    			append_dev(header0, div16);
    			append_dev(div16, svg2);
    			append_dev(svg2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(g0, path4);
    			append_dev(g0, path5);
    			append_dev(g0, path6);
    			append_dev(g0, path7);
    			append_dev(g0, path8);
    			append_dev(g0, path9);
    			append_dev(g0, path10);
    			append_dev(g0, path11);
    			append_dev(g0, path12);
    			append_dev(g0, path13);
    			append_dev(g0, path14);
    			append_dev(g0, path15);
    			append_dev(g0, path16);
    			append_dev(header0, t17);
    			append_dev(header0, label4);
    			append_dev(div27, t19);
    			append_dev(div27, div26);
    			append_dev(div26, div25);
    			append_dev(div25, div20);
    			append_dev(div20, header1);
    			append_dev(header1, div17);
    			append_dev(div17, svg3);
    			append_dev(svg3, rect0);
    			append_dev(header1, t20);
    			append_dev(header1, input5);
    			input5.checked = input5.__value === /*scoops*/ ctx[0];
    			append_dev(header1, t21);
    			append_dev(header1, label5);
    			append_dev(div20, t23);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div25, t24);
    			append_dev(div25, div24);
    			append_dev(div24, header2);
    			append_dev(header2, div21);
    			append_dev(div21, svg4);
    			append_dev(svg4, rect1);
    			append_dev(header2, t25);
    			append_dev(header2, input6);
    			input6.checked = input6.__value === /*scoops*/ ctx[0];
    			append_dev(header2, t26);
    			append_dev(header2, label6);
    			append_dev(div24, t28);
    			append_dev(div24, div23);
    			append_dev(div23, div22);
    			append_dev(div34, t29);
    			append_dev(div34, div31);
    			append_dev(div31, div30);
    			append_dev(div34, t30);
    			append_dev(div34, div33);
    			append_dev(div33, div32);
    			append_dev(main, t31);
    			append_dev(main, div40);
    			if_blocks[current_block_type_index].m(div40, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "change", /*input0_change_handler*/ ctx[9]),
    				listen_dev(input1, "change", /*input1_change_handler*/ ctx[11]),
    				listen_dev(input2, "change", /*input2_change_handler*/ ctx[12]),
    				listen_dev(input3, "change", /*input3_change_handler*/ ctx[13]),
    				listen_dev(input4, "change", /*input4_change_handler*/ ctx[14]),
    				listen_dev(input5, "change", /*input5_change_handler*/ ctx[15]),
    				listen_dev(input6, "change", /*input6_change_handler*/ ctx[16])
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scoops*/ 1) {
    				input0.checked = input0.__value === /*scoops*/ ctx[0];
    			}

    			if (dirty & /*scoops*/ 1) {
    				input1.checked = input1.__value === /*scoops*/ ctx[0];
    			}

    			if (dirty & /*scoops*/ 1) {
    				input2.checked = input2.__value === /*scoops*/ ctx[0];
    			}

    			if (dirty & /*scoops*/ 1) {
    				input3.checked = input3.__value === /*scoops*/ ctx[0];
    			}

    			if (dirty & /*scoops*/ 1) {
    				input4.checked = input4.__value === /*scoops*/ ctx[0];
    			}

    			if (dirty & /*scoops*/ 1) {
    				input5.checked = input5.__value === /*scoops*/ ctx[0];
    			}

    			if (dirty & /*scoops*/ 1) {
    				input6.checked = input6.__value === /*scoops*/ ctx[0];
    			}

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
    				if_block.m(div40, null);
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
    			if (detaching) detach_dev(div9);
    			/*$$binding_groups*/ ctx[10][0].splice(/*$$binding_groups*/ ctx[10][0].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[10][0].splice(/*$$binding_groups*/ ctx[10][0].indexOf(input1), 1);
    			/*$$binding_groups*/ ctx[10][0].splice(/*$$binding_groups*/ ctx[10][0].indexOf(input2), 1);
    			/*$$binding_groups*/ ctx[10][0].splice(/*$$binding_groups*/ ctx[10][0].indexOf(input3), 1);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(main);
    			/*$$binding_groups*/ ctx[10][0].splice(/*$$binding_groups*/ ctx[10][0].indexOf(input4), 1);
    			/*$$binding_groups*/ ctx[10][0].splice(/*$$binding_groups*/ ctx[10][0].indexOf(input5), 1);
    			/*$$binding_groups*/ ctx[10][0].splice(/*$$binding_groups*/ ctx[10][0].indexOf(input6), 1);
    			if_blocks[current_block_type_index].d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let visible = true;
    	let scoops = 1;
    	let user = { loggedIn: false };
    	let prefix = "";
    	let name = "";
    	let marca = "";
    	let img = "";
    	let i = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardWrapper> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CardWrapper", $$slots, []);
    	const $$binding_groups = [[]];

    	function input0_change_handler() {
    		scoops = this.__value;
    		$$invalidate(0, scoops);
    	}

    	function input1_change_handler() {
    		scoops = this.__value;
    		$$invalidate(0, scoops);
    	}

    	function input2_change_handler() {
    		scoops = this.__value;
    		$$invalidate(0, scoops);
    	}

    	function input3_change_handler() {
    		scoops = this.__value;
    		$$invalidate(0, scoops);
    	}

    	function input4_change_handler() {
    		scoops = this.__value;
    		$$invalidate(0, scoops);
    	}

    	function input5_change_handler() {
    		scoops = this.__value;
    		$$invalidate(0, scoops);
    	}

    	function input6_change_handler() {
    		scoops = this.__value;
    		$$invalidate(0, scoops);
    	}

    	$$self.$capture_state = () => ({
    		Card,
    		Card2,
    		Prueba2,
    		items1,
    		items2,
    		items,
    		Header,
    		fade,
    		fly,
    		visible,
    		scoops,
    		user,
    		prefix,
    		name,
    		marca,
    		img,
    		i,
    		filtereditems
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) visible = $$props.visible;
    		if ("scoops" in $$props) $$invalidate(0, scoops = $$props.scoops);
    		if ("user" in $$props) user = $$props.user;
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("name" in $$props) $$invalidate(5, name = $$props.name);
    		if ("marca" in $$props) marca = $$props.marca;
    		if ("img" in $$props) img = $$props.img;
    		if ("i" in $$props) i = $$props.i;
    		if ("filtereditems" in $$props) filtereditems = $$props.filtereditems;
    	};

    	let filtereditems;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 filtereditems = prefix
    	? items.filter(item => {
    			const name = `${item.name}, ${item.marca}, ${item.img}`;
    			return name.toLowerCase().startsWith(prefix.toLowerCase());
    		})
    	: items;

    	return [
    		scoops,
    		filtereditems,
    		visible,
    		user,
    		prefix,
    		name,
    		marca,
    		img,
    		i,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler,
    		input2_change_handler,
    		input3_change_handler,
    		input4_change_handler,
    		input5_change_handler,
    		input6_change_handler
    	];
    }

    class CardWrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardWrapper",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    var itemsmaster = [
        {
          name:"Codo CPVC 3/4'' 90°", 
          img: "308617.jfif",
          img1:"308617.jfif",
          img2:"308617.jfif",
          img3:"308617.jfif",
          descripcion: "Conexión de CPVC están diseñadas para trabajar en forma continua a una presión hidrostática y a temperaturas exigentes.", 
          usos: "",
          Recomendaciones: "Para asegurar la instalación utilizar soldadura de CPVC PAVCO en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "3/4''",
          presion:"100 psi (6.89 bar o 6.8 bar)",
          Color: "Gris",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo CPVC 3/4'' 45°", 
          img: "308595 (1).jfif",
          img1:"308595 (1).jfif",
          img2:"308595 (1).jfif",
          img3:"308595 (1).jfif",
          descripcion: "Conexión de CPVC están diseñadas para trabajar en forma continua a una presión hidrostática y a temperaturas exigentes.", 
          usos: "Para agua caliente",
          Recomendaciones: "sUsar soldadura de CPVC PAVCO para asegurar las uniones. Tener cuidado en la carga, transporte y descarga del material.",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "3/4''",
          presion:"100 psi (6.89 bar o 6.8 bar)",
          Color: "Gris",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo Desagüe PVC 2'' x 45°", 
          img: "344877.jfif",
          img1:"344877.jfif",
          img2:"344877.jfif",
          img3:"344877.jfif",
          descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
          usos: "Para desagüe",
          Recomendaciones: "Usar soldadura de PVC PAVCO para asegurar las uniones. Tener cuidado en la carga, transporte y descarga del material.",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "2''",
          presion:"890 psi",
          Color: "Gris orgánico",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo CPVC 1/2'' 45°", 
          img: "308587.jfif",
          img1:"308587.jfif",
          img2:"308587.jfif",
          img3:"308587.jfif",
          descripcion: "Conexión de CPVC están diseñadas para trabajar en forma continua a una presión hidrostática y a temperaturas exigentes.", 
          usos: "Para agua caliente",
          Recomendaciones: "Usar soldadura de CPVC PAVCO para asegurar las uniones. Tener cuidado en la carga, transporte y descarga del material.",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1/2''",
          presion:"100 psi (6.89 bar o 6.8 bar)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
      
        {
          name:"Codo PVC 45° SP 1 1/2''", 
          img: "2310449.jfif",
          img1:"2310449.jfif",
          img2:"2310449.jfif",
          img3:"2310449.jfif",
          descripcion: "Codo PVC de 45° sp con medidas 1 1/2''", 
          usos: "Para desagües",
          Recomendaciones: "Usar soldadura de PVC PAVCO para asegurar las uniones. Tener cuidado en la carga, transporte y descarga del material.",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1 1/2''",
          presion:"",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo Desagüe PVC 4'' x 90°", 
          img: "34494X.jfif",
          img1:"34494X.jfif",
          img2:"34494X.jfif",
          img3:"34494X.jfif",
          descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
          usos: "Para desagüe",
          Recomendaciones: "Usar soldadura de PVC PAVCO para asegurar las uniones. Tener cuidado en la carga, transporte y descarga del material.",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "4''",
          presion:"710 psi",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo Desagüe PVC 4'' x 45°", 
          img: "344893.jfif",
          img1:"344893.jfif",
          img2:"344893.jfif",
          img3:"344893.jfif",
          descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
          usos: "Para desagüe",
          Recomendaciones: "Usar soldadura de PVC PAVCO para asegurar las uniones. Tener cuidado en la carga, transporte y descarga del material.",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "4''",
          presion:"710 psi",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo Desagüe PVC 1 1/2'' x 45°", 
          img: "344869.jfif",
          img1:"344869.jfif",
          img2:"344869.jfif",
          img3:"344869.jfif",
          descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
          usos: "Para desagüe",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1 1/2''",
          presion:"1060 psi",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo Desagüe 6'' x 90°", 
          img: "391921.jfif",
          img1:"391921.jfif",
          img2:"391921.jfif",
          img3:"391921.jfif",
          descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
          usos: "Para desagüe",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "6''",
          presion:"560 psi",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC-P sp 2'' 90°", 
          img: "396346.jfif",
          img1:"396346.jfif",
          img2:"396346.jfif",
          img3:"396346.jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "2''",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC-P sp 3/4'' 45°", 
          img: "308951.jfif",
          img1:"308951.jfif",
          img2:"308951.jfif",
          img3:"308951.jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "3/4''",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC 45° SAL 3''", 
          img: "344885.jfif",
          img1:"344885.jfif",
          img2:"344885.jfif",
          img3:"344885.jfif",
          descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
          usos: "Para desagüe",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "3''",
          presion:"",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC-P sp 1'' 90°", 
          img: "308978.jfif",
          img1:"308978.jfif",
          img2:"308978.jfif",
          img3:"308978.jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1''",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC-P c/r 1 1/4'' 90°", 
          img: "309389.jfif",
          img1:"309389.jfif",
          img2:"309389.jfif",
          img3:"309389.jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1 1/4''",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC-P c/r 1'' 90°", 
          img: "309397.jfif",
          img1:"309397.jfif",
          img2:"309397.jfif",
          img3:"309397.jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1''",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC-P c/r 1'' 90°", 
          img: "309397 (1).jfif",
          img1:"309397 (1).jfif",
          img2:"309397 (1).jfif",
          img3:"309397 (1).jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1''",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo Desagüe 1 1/4'' x 45°", 
          img: "2310457.jfif",
          img1:"2310457.jfif",
          img2:"2310457.jfif",
          img3:"2310457.jfif",
          descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
          usos: "Para desagüe",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1 1/4''",
          presion:"560 psi",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC-P c/r 3/4'' 90°", 
          img: "309419.jfif",
          img1:"309419.jfif",
          img2:"309419.jfif",
          img3:"309419.jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "3/4''",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC-P sp 1 1/2'' 90°", 
          img: "396427.jfif",
          img1:"396427.jfif",
          img2:"396427.jfif",
          img3:"396427.jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1 1/2''",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo Desagüe PVC 2'' x 90°", 
          img: "344923.jfif",
          img1:"344923.jfif",
          img2:"344923.jfif",
          img3:"344923.jfif",
          descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
          usos: "Para desagüe",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: " 2''",
          presion:"890 psi",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC-P sp 1 1/4'' 90°", 
          img: "30896X.jfif",
          img1:"30896X.jfif",
          img2:"30896X.jfif",
          img3:"30896X.jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1 1/4'' ",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo CPVC 1/2'' 90°", 
          img: "308609.jfif",
          img1:"308609.jfif",
          img2:"308609.jfif",
          img3:"308609.jfif",
          descripcion: "Conexión de CPVC están diseñadas para trabajar en forma continua a una presión hidrostática y a temperaturas exigentes.", 
          usos: "Para agua caliente",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1/2''",
          presion:"100 psi (6.89 bar o 6.8 bar)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo cachimba PVC 1/2'' 90°", 
          img: "309354.jfif",
          img1:"309354.jfif",
          img2:"309354.jfif",
          img3:"309354.jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1/2''",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC-P sp 3/4'' 90°", 
          img: "308994.jfif",
          img1:"308994.jfif",
          img2:"308994.jfif",
          img3:"308994.jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "3/4''",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC 45° 1/2'' SP", 
          img: "308943.jfif",
          img1:"308943.jfif",
          img2:"308943.jfif",
          img3:"308943.jfif",
          descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "",
          presion:"",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo Desagüe 3'' x 45°", 
          img: "2680890.jfif",
          img1:"2680890.jfif",
          img2:"2680890.jfif",
          img3:"2680890.jfif",
          descripcion: "Codo de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
          usos: "Para desagüe",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "3''",
          presion:"560 psi",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC-P sp 1'' 45°", 
          img: "308935.jfif",
          img1:"308935.jfif",
          img2:"308935.jfif",
          img3:"308935.jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1''",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"Codo PVC-P c/r 1 1/2'' 90°", 
          img: "309370.jfif",
          img1:"309370.jfif",
          img2:"309370.jfif",
          img3:"309370.jfif",
          descripcion: "Fabricadas en PVC, para las presiones de trabajo mas exigentes. Las roscas utilizadas son NTP. Resistentes y duraderas.", 
          usos: "Para agua fría",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "1 1/2''",
          presion:"10 bar (145 psi)",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },
        {
          name:"", 
          img: "",
          img1:"",
          img2:"",
          img3:"",
          descripcion: "", 
          usos: "",
          Recomendaciones: "",  
          tipo: "Codo",
          marca: "Pavco",
          material: "PVC",
          Medida: "",
          presion:"",
          Color: "",
          cantidad: "",
          procedencia:"Nacional",
          precio: "",
          precioantes: "0",
          oferta: "0 %",
          categoriageneral: "Gasfiteria",
          categoria: "Conexiones Para Agua"
        },


        // 
        // 
        {
            name:"Adaptador 3/4''", 
            img: "Adaptador  3-4.jfif",
            img1:"Adaptador  3-4.jfif",
            img2:"Adaptador  3-4.jfif",
            img3:"Adaptador  3-4.jfif",
            descripcion: "Adaptador de 3/4''", 
            usos: "Para agua fría",
            Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
            tipo: "Adaptador",
            marca: "Tuboplast",
            material: "PVC-U",
            Medidas: "3/4''",
            Color: "Blanco",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Adaptador de 1 cr", 
            img: "208760X.jfif",
            img1:"208760X.jfif",
            img2:"208760X.jfif",
            img3:"208760X.jfif",
            descripcion: "Tubo de acero con sistema roscado, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "Para instalaciones de uso en la construcción.",
            Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
            tipo: "Adaptador",
            marca: "Tuboplast",
            material: "PVC-U",
            Medidas: "1''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Adaptador de 1 1/2''", 
            img: "2087863.jfif",
            img1:"2087863.jfif",
            img2:"2087863.jfif",
            img3:"2087863.jfif",
            descripcion: "Adaptador 1 1/2'' C/R. Ideal para agua.", 
            usos: "",
            Recomendaciones: "",  
            tipo: "Adaptador",
            marca: "Tuboplast",
            material: "PVC-U",
            Medidas: "1/2''",
            Color: "Plomo",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Adaptador de 3/4''", 
            img: "2277352.jfif",
            img1:"2277352.jfif",
            img2:"2277352.jfif",
            img3:"2277352.jfif",
            descripcion: "Adaptador de 3/4''", 
            usos: "Para Agua fria",
            Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
            tipo: "Adaptador",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "3/4''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          
          {
            name:"Tee de 1 1/2'' C/R", 
            img: "2088231.jfif",
            img1:"2088231.jfif",
            img2:"2088231.jfif",
            img3:"2088231.jfif",
            descripcion: "Tee de 1 1/2'' con rosca", 
            usos: "Abastecer agua de una línea principal a otro punto.",
            Recomendaciones: "",  
            tipo: "Adaptadores",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1 1/2''",
            Color: "Plomo",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
        
          {
            name:"Codo 3/4''", 
            img: "2087405.jfif",
            img1:"2087405.jfif",
            img2:"2087405.jfif",
            img3:"2087405.jfif",
            descripcion: "Tubo de PVC, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "Para agua fría",
            Recomendaciones: "Tubo de PVC, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.",  
            tipo: "Codo",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "3/4''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Codo 2 x 90 cr", 
            img: "208869X.jfif",
            img1:"208869X.jfif",
            img2:"208869X.jfif",
            img3:"208869X.jfif",
            descripcion: "Material autoextinguible. Cumple norma técnica peruana. NTP 399-006 / PVC-U", 
            usos: "Ideal para distribución de agua.",
            Recomendaciones: "En este tipo de tubería no es recomendable calentar el PVC para unir con otros tubos.",  
            tipo: "Codo",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Codo de 1 1/4'' SP", 
            img: "2088630.jfif",
            img1:"2088630.jfif",
            img2:"2088630.jfif",
            img3:"2088630.jfif",
            descripcion: "Codo de 1 1/4'' x 90° S/P. Ideal para agua.", 
            usos: "Para uso potable",
            Recomendaciones: "",  
            tipo: "Codo",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1 1/4''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Codo 1''", 
            img: "2087693.jfif",
            img1:"2087693.jfif",
            img2:"2087693.jfif",
            img3:"2087693.jfif",
            descripcion: "Accesorios para cambio de dirección a 45°. 100% resina de PVC virgen. No contiene plomo. Reduce impacto ambiental.", 
            usos: "Ideal para agua fría",
            Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
            tipo: "Codo",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1''",
            Color: "Plomo",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Codo de 1 1/2'' CR", 
            img: "208788X.jfif",
            img1:"208788X.jfif",
            img2:"208788X.jfif",
            img3:"208788X.jfif",
            descripcion: "Codo de desagüe de PVC con rosca, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "Para desagüe",
            Recomendaciones: "Si la instalación es aérea, el codo debe tener apoy",  
            tipo: "Codo",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1 1/2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Codo 3/4''", 
            img: "2087685.jfif",
            img1:"2087685.jfif",
            img2:"2087685.jfif",
            img3:"2087685.jfif",
            descripcion: "Accesorios para cambio de dirección a 45°. 100% resina de PVC virgen. No contiene plomo. Reduce impacto ambiental.", 
            usos: "Ideal para agua fría",
            Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
            tipo: "Codo",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "3/4''",
            Color: "Plomo",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Codo de 1 1/2'' SP", 
            img: "2087898.jfif",
            img1:"2087898.jfif",
            img2:"2087898.jfif",
            img3:"2087898.jfif",
            descripcion: "Codo de PVC. Accesorio para cambio de dirección a 90°.", 
            usos: "Para cambio de dirección a 90°",
            Recomendaciones: "Por el cambio brusco de dirección de recomienda el mayor cuidado en el pegado.",  
            tipo: "Codo",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1 1/2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Reducción 3/4'' x 1/2'' C/R", 
            img: "208855X.jfif",
            img1:"208855X.jfif",
            img2:"208855X.jfif",
            img3:"208855X.jfif",
            descripcion: "Reducción con rosca exterior-interior. Se usa para cambio de diámetros roscados.", 
            usos: "Ideal para instalaciones de agua",
            Recomendaciones: "No olvidar usar cinta teflón",  
            tipo: "Bushing",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "3/4'' x 1/2''",
            Color: "Plomo",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Bushing 1'' a 3/4''", 
            img: "2088568.jfif",
            img1:"2088568.jfif",
            img2:"2088568.jfif",
            img3:"2088568.jfif",
            descripcion: "Es una reducción rosca exterior-rosca interior.", 
            usos: "Se usa para cambiar diámetros roscados",
            Recomendaciones: "Para asegurar la instalación, utilizar soldadura para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
            tipo: "Bushing",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1'' a 3/4''",
            Color: "  Plomo",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          
          {
            name:"Codo 90° 1/2''", 
            img: "2087731.jfif",
            img1:"",
            img2:"",
            img3:"",
            descripcion: "Tubo de PVC con sistema roscado, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "Para agua fría",
            Recomendaciones: "No olvidar usar cinta teflón y pegamento de tubería",  
            tipo: "Codo con Rosca",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1/2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          
          {
            name:"Codo 90° 3/4''", 
            img: "2087766.jfif",
            img1:"2087766.jfif",
            img2:"2087766.jfif",
            img3:"2087766.jfif",
            descripcion: "Tubo de PVC con sistema roscado, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "Para agua fría",
            Recomendaciones: "No olvidar usar cinta teflón y pegamento de tubería",  
            tipo: "Codo con Rosca",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "3/4''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          
          {
            name:"Unión Mixta 1/2'' C-R", 
            img: "2088703.jfif",
            img1:"2088703.jfif",
            img2:"2088703.jfif",
            img3:"2088703.jfif",
            descripcion: "Unión mixta para instalaciones domésticas para unir segmentos de tubos y tuberías con extremos roscados y sin campana (S/P).", 
            usos: "Para unir segmentos de tubos y tuberías",
            Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
            tipo: "Conexiones",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1/2''",
            Color: "Plomo",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Unión Mixta 3/4'' C-R", 
            img: "2088711.jfif",
            img1:"2088711.jfif",
            img2:"2088711.jfif",
            img3:"2088711.jfif",
            descripcion: "Unión mixta para instalaciones domésticas para unir segmentos de tubos y tuberías con extremos roscados y sin campana (S/P).", 
            usos: "Para unir segmentos de tubos y tuberías",
            Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
            tipo: "Conexiones",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "3/4''",
            Color: "Plomo",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          
        
        
          {
            name:"Niple 2 X 4", 
            img: "2088797.jfif",
            img1:"2088797.jfif",
            img2:"2088797.jfif",
            img3:"2088797.jfif",
            descripcion: "Material de alta resistencia, bajo nivel de corrosión", 
            usos: "Ideal para unir tuberías",
            Recomendaciones: "Utilizar cemento para PVC para asegurar la instalación",  
            tipo: "Niple",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "2x4''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Niple 1 1/2 X 4 PVC", 
            img: "2088770.jfif",
            img1:"2088770.jfif",
            img2:"2088770.jfif",
            img3:"2088770.jfif",
            descripcion: "Material de alta resistencia, bajo nivel de corrosión", 
            usos: "Ideal para unir tuberías",
            Recomendaciones: "Utilizar cemento para PVC para asegurar la instalación",  
            tipo: "Niple",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1 1/2 X 4''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Niple 2 X 6", 
            img: "2088800.jfif",
            img1:"2088800.jfif",
            img2:"2088800.jfif",
            img3:"2088800.jfif",
            descripcion: "Material de alta resistencia, bajo nivel de corrosión", 
            usos: "Ideal para unir tuberías",
            Recomendaciones: "Utilizar cemento para PVC para asegurar la instalación",  
            tipo: "Niple",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "2 X 6''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Niple 1/2 x 3 PVC", 
            img: "2088029 .jfif",
            img1:"2088029 .jfif",
            img2:"2088029 .jfif",
            img3:"2088029 .jfif",
            descripcion: "Material de alta resistencia, bajo nivel de corrosión", 
            usos: "Ideal para unir tuberías",
            Recomendaciones: "Utilizar cemento para PVC para asegurar la instalación",  
            tipo: "Niple",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1/2 x 3''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Niple 1 X 2 PVC", 
            img: "208841X .jfif",
            img1:"208841X .jfif",
            img2:"208841X .jfif",
            img3:"208841X .jfif",
            descripcion: "Material de alta resistencia, bajo nivel de corrosión", 
            usos: "Ideal para unir tuberías",
            Recomendaciones: "Utilizar cemento para PVC para asegurar la instalación",  
            tipo: "Niple",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1 X 2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Niple 1 1/2 X 6 PVC", 
            img: "2088789 .jfif",
            img1:"2088789 .jfif",
            img2:"2088789 .jfif",
            img3:"2088789 .jfif",
            descripcion: "Material de alta resistencia, bajo nivel de corrosión", 
            usos: "Ideal para unir tuberías",
            Recomendaciones: "Utilizar cemento para PVC para asegurar la instalación",  
            tipo: "Niple",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1 1/2 x 6''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Reducción 1 x 3/4''", 
            img: "208905X.jfif",
            img1:"208905X.jfif",
            img2:"208905X.jfif",
            img3:"208905X.jfif",
            descripcion: "Se utiliza para cambio de diámetro en las tuberías", 
            usos: "Para agua",
            Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
            tipo: "Reduccion",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1 x 3/4",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Reducción 1 1/4'' x 1'' sp", 
            img: "2089246.jfif",
            img1:"2089246.jfif",
            img2:"2089246.jfif",
            img3:"2089246.jfif",
            descripcion: "Tubo de PVC, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "Para agua",
            Recomendaciones: "No olvide usar pegamento para tubería.",  
            tipo: "Reduccion",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1 1/4'' x 1''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Reducción 3/4 x 1/2'' SP", 
            img: "2088894.jfif",
            img1:"2088894.jfif",
            img2:"2088894.jfif",
            img3:"2088894.jfif",
            descripcion: "Se utiliza para cambio de diámetro en las tuberías", 
            usos: "Para agua",
            Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
            tipo: "Reduccion",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "3/4 x 1/2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Reducción 2'' x 1 1/4'' sp", 
            img: "2088096.jfif",
            img1:"2088096.jfif",
            img2:"2088096.jfif",
            img3:"2088096.jfif",
            descripcion: "Tubo de PVC, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "ara agua",
            Recomendaciones: "No olvide usar pegamento para tubería.",  
            tipo: "Reduccion",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "2'' x 1 1/4''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Reducción con Rosca 3/4'' x 1/2''", 
            img: "2132389.jfif",
            img1:"2132389.jfif",
            img2:"2132389.jfif",
            img3:"2132389.jfif",
            descripcion: "Reducción con rosca que se utiliza para cambio de diámetro en las tuberías", 
            usos: "Para agua",
            Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
            tipo: "Reduccion",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "3/4'' x 1/2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Reducción de 1'' a 1/2'' Hembra SP", 
            img: "2088576.jfif",
            img1:"2088576.jfif",
            img2:"2088576.jfif",
            img3:"2088576.jfif",
            descripcion: "Reducción Bushing hembra de 1'' a 1/2'' S/P. Ideal para agua potable.", 
            usos: "Para Agua Fría",
            Recomendaciones: "No olvidar utilizar cinta teflón.",  
            tipo: "Reduccion",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1'' a 1/2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Reducción para Desagüe 2'' x 1 1/2''", 
            img: "208810X.jfif",
            img1:"208810X.jfif",
            img2:"208810X.jfif",
            img3:"208810X.jfif",
            descripcion: "Reducción para cambio de diámetro", 
            usos: "Para desagüe",
            Recomendaciones: "",  
            tipo: "Reduccion",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "2'' x 1 1/2''",
            Color: "Plomo orgánico",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Reducción 1'' x 3/4'' SP", 
            img: "208905X (1).jfif",
            img1:"208905X (1).jfif",
            img2:"208905X (1).jfif",
            img3:"208905X (1).jfif",
            descripcion: "Se utiliza para cambio de diámetro en las tuberías", 
            usos: "Para agua",
            Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
            tipo: "Reduccion",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1'' x 3/4''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Reducción 3'' x 2'' Desagüe", 
            img: "2088118.jfif",
            img1:"2088118.jfif",
            img2:"2088118.jfif",
            img3:"2088118.jfif",
            descripcion: "Tubo de PVC, virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "",
            Recomendaciones: "No olvide usar pegamento para tubería.",  
            tipo: "Reduccion",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "3'' x 2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Reducción 1'' x 1/2'' SP", 
            img: "2089041 (1).jfif",
            img1:"2089041 (1).jfif",
            img2:"2089041 (1).jfif",
            img3:"2089041 (1).jfif",
            descripcion: "Se utiliza para cambio de diámetro en las tuberías", 
            usos: "Para Agua",
            Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
            tipo: "Reduccion",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1'' x 1/2'' ",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Tapón 1'' Macho cr", 
            img: "208757X.jfif",
            img1:"208757X.jfif",
            img2:"208757X.jfif",
            img3:"208757X.jfif",
            descripcion: "Tapón macho de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "Para agua fría",
            Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
            tipo: "Tapón",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Tapón Hembra 1 SP", 
            img: "2087847.jfif",
            img1:"2087847.jfif",
            img2:"2087847.jfif",
            img3:"2087847.jfif",
            descripcion: "Se usa para sellar. Se instala en un tubo sin campana.", 
            usos: "Para agua",
            Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
            tipo: "Tapón",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Tapón para Desagüe de 4''", 
            img: "2088223.jfif",
            img1:"2088223.jfif",
            img2:"2088223.jfif",
            img3:"2088223.jfif",
            descripcion: "Tapón de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "Para sellar una línea de tubería o circuito.",
            Recomendaciones: "Utilizar soldadura de PVC.",  
            tipo: "Tapon",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "4''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Tee 1'' SP", 
            img: "2087650.jfif",
            img1:"2087650.jfif",
            img2:"2087650.jfif",
            img3:"2087650.jfif",
            descripcion: "Se usa para instalaciones domésticas.", 
            usos: "Para desagüe",
            Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC",  
            tipo: "Tee",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "33 mm",
            diametro:"1''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Tee 2'' sp", 
            img: "2088495.jfif",
            img1:"2088495.jfif",
            img2:"2088495.jfif",
            img3:"2088495.jfif",
            descripcion: "Tee de desagüe de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "Para desagüe",
            Recomendaciones: "No olvidar usar cinta teflón y pegamento de tubería",  
            tipo: "Tee",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "2''",
            Color: "Gris Organico",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Tee PVC 1''", 
            img: "2277379.jfif",
            img1:"2277379.jfif",
            img2:"2277379.jfif",
            img3:"2277379.jfif",
            descripcion: "Tee 100% resina de PVC virgen. No contiene plomo. Reduce impacto ambienta", 
            usos: "Para agua fría",
            Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC",  
            tipo: "Tee",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Tee de 1 1/2'' SP", 
            img: "208824X.jfif",
            img1:"208824X.jfif",
            img2:"208824X.jfif",
            img3:"208824X.jfif",
            descripcion: "Tee de 1 1/2'' SP. Accesorio de 90°. Se usa para abastecer de agua de una línea principal a otro punto.", 
            usos: "Abastecer de agua una línea principal a otro punto.",
            Recomendaciones: "No olvidar usar cinta teflón.",  
            tipo: "Tee",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1 1/2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Unión de 1/2''", 
            img: "2277301.jfif",
            img1:"2277301.jfif",
            img2:"2277301.jfif",
            img3:"2277301.jfif",
            descripcion: "Unión 1/2'' PVC S/P presión.", 
            usos: "",
            Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión.",  
            tipo: "Uniones",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1/2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Unión de 3/4''", 
            img: "2277336.jfif",
            img1:"2277336.jfif",
            img2:"2277336.jfif",
            img3:"2277336.jfif",
            descripcion: "Unión 3/4'' PVC S/P presión.", 
            usos: "",
            Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión.",  
            tipo: "Uniones",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "3/4''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Unión de 1'' ", 
            img: "2277387.jfif",
            img1:"2277387.jfif",
            img2:"2277387.jfif",
            img3:"2277387.jfif",
            descripcion: "Unión 1'' PVC C-10 S/P presión.", 
            usos: "",
            Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión.",  
            tipo: "Uniones",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Unión Universal de 1/2'' SP", 
            img: "2087715.jfif",
            img1:"2087715.jfif",
            img2:"2087715.jfif",
            img3:"2087715.jfif",
            descripcion: "Se usa en instalaciones domésticas para unir tuberías y segmentos de tubos. Su diseño permite el desacoplamiento fácil del sistema instalado para cualquier reparación, modificación o mantenimiento.", 
            usos: "Para agua",
            Recomendaciones: "Para asegurar la instalación utilizar cemento para PVC en la conexión.",  
            tipo: "union universal",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1/2''",
            Color: "Blanco",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Unión Universal 1'' SP", 
            img: "2087707.jfif",
            img1:"2087707.jfif",
            img2:"2087707.jfif",
            img3:"2087707.jfif",
            descripcion: "Su diseño permite el desacoplamiento fácil del sistema instalado para cualquier reparación, modificación o mantenimiento.", 
            usos: "Ideal para instalaciones domésticas para unir tuberías y segmentos de tubos.",
            Recomendaciones: "Utilizar pegamento para tuberías para asegurar la instalación",  
            tipo: "union universal",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Tubo 1/2'' x 5 m sp", 
            img: "2087618.jfif",
            img1:"2087618.jfif",
            img2:"2087618.jfif",
            img3:"2087618.jfif",
            descripcion: "Tubo de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "Para agua fría",
            Recomendaciones: "No olvidar usar cinta teflón y pegamento de tubería",  
            tipo: "",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1/2'' x 5 m ",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Tubo de 3/4'' x 5 m sp", 
            img: "2087626.jfif",
            img1:"2087626.jfif",
            img2:"2087626.jfif",
            img3:"2087626.jfif",
            descripcion: "Tubo de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "Para agua fría",
            Recomendaciones: "No olvidar usar cinta teflón y pegamento de tubería",  
            tipo: "",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "3/4'' x 5 m ",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Unión de 1 1/2'' CR", 
            img: "2088320.jfif",
            img1:"2088320.jfif",
            img2:"2088320.jfif",
            img3:"2088320.jfif",
            descripcion: "Unión de 1 1/2'' C/R. Ideal para cañerías de agua.", 
            usos: "",
            Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión.",  
            tipo: "uniones y conexiones",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1 1/2'' ",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Tee 1/2'' SP", 
            img: "2087413.jfif",
            img1:"2087413.jfif",
            img2:"2087413.jfif",
            img3:"2087413.jfif",
            descripcion: "Accesorio que permite recibir aguas servidas en 2 puntos. La entrada y la desviación es una curva de 90°. Permite que el encuentro de la caída de agua de los dos puntos en común no sea en forma brusca. 100% resina de PVC virgen. No contiene plomo. Resistente y funcional.", 
            usos: "Para desagüe",
            Recomendaciones: "Para asegurar la instalación utilizar soldadura de PVC en la conexión.",  
            tipo: "Tee Sanitaria",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1/2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Tee 1'' con rosca", 
            img: "2087790.jfif",
            img1:"2087790.jfif",
            img2:"2087790.jfif",
            img3:"2087790.jfif",
            descripcion: "Fabricado de PVC virgen sin estabilizante de plomo, lo cual reduce el impacto ambiental.", 
            usos: "Para agua fría",
            Recomendaciones: "Para asegurar la instalación. Utilizar cemento para PVC en la conexión de tipo embone o teflón en la conexión tipo rosca.",  
            tipo: "Tee con rosca",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Curva 1/2'' x 90", 
            img: "2087952.jfif",
            img1:"2087952.jfif",
            img2:"2087952.jfif",
            img3:"2087952.jfif",
            descripcion: "Material autoextinguible. Cumple norma técnica peruana. NTP 399-006 / PVC-U", 
            usos: "Ideal para proteger los cables eléctricos.",
            Recomendaciones: "Es recomendable rasgar el PVC para una mayor adherencia al contacto con otros tubos.",  
            tipo: "Curva",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "1/2''",
            Color: "Gris",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Cachimba 200mm a 160mm PVC", 
            img: "2153327.jfif",
            img1:"2153327.jfif",
            img2:"2153327.jfif",
            img3:"2153327.jfif",
            descripcion: "", 
            usos: "Para desagüe",
            Recomendaciones: "",  
            tipo: "Cachimbas",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "200 mm a 160 mm",
            Color: "",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
          {
            name:"Codo 90'' x 160 mm", 
            img: "2088983.jfif",
            img1:"2088983.jfif",
            img2:"2088983.jfif",
            img3:"2088983.jfif",
            descripcion: "Tubo de alcantarillado de PVC-U, con estabilizante de estaño o calcio-zinc sin plomo, lo cual reduce el impacto ambiental.", 
            usos: "",
            Recomendaciones: "Tener cuidado en la carga, transporte y descarga del material",  
            tipo: "Para alcantarillado",
            marca: "Tuboplast",
            material: "PVC",
            Medida: "160 mm",
            Color: "",
            cantidad: "",
            procedencia:"Nacional",
            precio: "",
            precioantes: "0",
            oferta: "0 %",
            categoriageneral: "Gasfiteria",
            categoria: "Conexiones Para Agua"
          },
        
        
      ];

    /* src\components\Navbar.svelte generated by Svelte v3.20.1 */

    const { Object: Object_1 } = globals;
    const file$7 = "src\\components\\Navbar.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (544:14) {#if cart_sum > 0}
    function create_if_block_1$3(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*cart_sum*/ ctx[0]);
    			attr_dev(div, "class", "circle svelte-1nx2poc");
    			add_location(div, file$7, 544, 16, 21177);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cart_sum*/ 1) set_data_dev(t, /*cart_sum*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(544:14) {#if cart_sum > 0}",
    		ctx
    	});

    	return block;
    }

    // (575:0) {#if visible}
    function create_if_block$4(ctx) {
    	let div7;
    	let div6;
    	let div5;
    	let div3;
    	let button;
    	let svg_1;
    	let path;
    	let t0;
    	let div2;
    	let div1;
    	let span;
    	let t2;
    	let div0;
    	let form;
    	let input;
    	let t3;
    	let div4;
    	let current;
    	let dispose;
    	let each_value = /*filtereditems*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div3 = element("div");
    			button = element("button");
    			svg_1 = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "Constructor";
    			t2 = space();
    			div0 = element("div");
    			form = element("form");
    			input = element("input");
    			t3 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(path, "data-name", "_ionicons_svg_ios-arrow-round-back (2)");
    			attr_dev(path, "d", "M116.447,160.177a.545.545,0,0,1,0,.767l-2.53,2.538h9.641a.542.542,0,0,1,0,1.084h-9.641l2.534,2.538a.549.549,0,0,1,0,.767.54.54,0,0,1-.763,0l-3.435-3.46a.608.608,0,0,1-.113-.171.517.517,0,0,1-.042-.208.543.543,0,0,1,.154-.379l3.435-3.46A.531.531,0,0,1,116.447,160.177Z");
    			attr_dev(path, "transform", "translate(-112.1 -160.023)");
    			attr_dev(path, "fill", "currentColor");
    			add_location(path, file$7, 591, 12, 25745);
    			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg_1, "width", "12");
    			attr_dev(svg_1, "height", "8.003");
    			attr_dev(svg_1, "viewBox", "0 0 12 8.003");
    			attr_dev(svg_1, "class", "svelte-1nx2poc");
    			add_location(svg_1, file$7, 586, 10, 25590);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "Headerstyle__SearchModalClose-r27s8s-23 gIHDwl svelte-1nx2poc");
    			add_location(button, file$7, 583, 8, 25454);
    			attr_dev(span, "class", "SearchBoxstyle__CurrentType-li71fg-1 fHefaw svelte-1nx2poc");
    			add_location(span, file$7, 602, 12, 26432);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Busque sus productos aquí");
    			attr_dev(input, "class", "SearchBoxstyle__SearchBox-li71fg-5 juTloE svelte-1nx2poc");
    			add_location(input, file$7, 610, 16, 26734);
    			attr_dev(form, "class", "svelte-1nx2poc");
    			add_location(form, file$7, 609, 14, 26710);
    			attr_dev(div0, "class", "SearchBoxstyle__SearchInputWrapper-li71fg-6 fmayvp\r\n              undefined  svelte-1nx2poc");
    			set_style(div0, "height", "35px");
    			add_location(div0, file$7, 605, 12, 26552);
    			attr_dev(div1, "class", "SearchBoxstyle__SearchBoxWrapper-li71fg-8 gYdUDg  svelte-1nx2poc");
    			add_location(div1, file$7, 601, 10, 26355);
    			attr_dev(div2, "class", "SearchBoxstyle__SearchWrapper-li71fg-0 bYCPyw\r\n          header-modal-search svelte-1nx2poc");
    			add_location(div2, file$7, 598, 8, 26242);
    			attr_dev(div3, "class", "Headerstyle__SearchModalWrapper-r27s8s-22 ftxPjY svelte-1nx2poc");
    			add_location(div3, file$7, 582, 6, 25382);
    			attr_dev(div4, "class", "hola svelte-1nx2poc");
    			add_location(div4, file$7, 633, 6, 27925);
    			attr_dev(div5, "class", "innerRndComponent svelte-1nx2poc");
    			add_location(div5, file$7, 581, 4, 25343);
    			attr_dev(div6, "class", "reuseModalHolder search-modal-mobile svelte-1nx2poc");
    			set_style(div6, "width", "100%");
    			set_style(div6, "height", "100%");
    			set_style(div6, "position", "absolute");
    			set_style(div6, "left", "0px");
    			set_style(div6, "top", "0px");
    			set_style(div6, "opacity", "1");
    			set_style(div6, "transform", "scale3d(1, 1, 1)");
    			add_location(div6, file$7, 577, 2, 25155);
    			attr_dev(div7, "class", "reuseModalParentWrapper svelte-1nx2poc");
    			add_location(div7, file$7, 576, 0, 25114);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, button);
    			append_dev(button, svg_1);
    			append_dev(svg_1, path);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, form);
    			append_dev(form, input);
    			set_input_value(input, /*prefix*/ ctx[2]);
    			append_dev(div5, t3);
    			append_dev(div5, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button, "click", /*cerrarvisible*/ ctx[7], false, false, false),
    				listen_dev(input, "input", /*input_input_handler*/ ctx[21])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*prefix*/ 4 && input.value !== /*prefix*/ ctx[2]) {
    				set_input_value(input, /*prefix*/ ctx[2]);
    			}

    			if (dirty & /*filtereditems*/ 8) {
    				each_value = /*filtereditems*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div4, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(575:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (636:0) {#each filtereditems as item}
    function create_each_block$1(ctx) {
    	let current;

    	const card2 = new Card2({
    			props: { item: /*item*/ ctx[22] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card2_changes = {};
    			if (dirty & /*filtereditems*/ 8) card2_changes.item = /*item*/ ctx[22];
    			card2.$set(card2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(636:0) {#each filtereditems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div10;
    	let div2;
    	let div1;
    	let div0;
    	let span0;
    	let t0;
    	let span1;
    	let t1;
    	let span2;
    	let t2;
    	let div3;
    	let span3;
    	let svg0;
    	let path0;
    	let path1;
    	let t3;
    	let div8;
    	let div7;
    	let div6;
    	let button;
    	let div4;
    	let t4;
    	let div5;
    	let svg1;
    	let g5;
    	let g4;
    	let g1;
    	let g0;
    	let path2;
    	let g3;
    	let g2;
    	let path3;
    	let t5;
    	let span4;
    	let t6;
    	let t7;
    	let div9;
    	let svg2;
    	let path4;
    	let t8;
    	let if_block1_anchor;
    	let current;
    	let dispose;
    	let if_block0 = /*cart_sum*/ ctx[0] > 0 && create_if_block_1$3(ctx);
    	let if_block1 = /*visible*/ ctx[1] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = space();
    			span1 = element("span");
    			t1 = space();
    			span2 = element("span");
    			t2 = space();
    			div3 = element("div");
    			span3 = element("span");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t3 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			button = element("button");
    			div4 = element("div");
    			t4 = space();
    			div5 = element("div");
    			svg1 = svg_element("svg");
    			g5 = svg_element("g");
    			g4 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path2 = svg_element("path");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			path3 = svg_element("path");
    			t5 = space();
    			span4 = element("span");
    			if (if_block0) if_block0.c();
    			t6 = text("\r\n              Item");
    			t7 = space();
    			div9 = element("div");
    			svg2 = svg_element("svg");
    			path4 = svg_element("path");
    			t8 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(span0, "class", "svelte-1nx2poc");
    			add_location(span0, file$7, 429, 8, 9603);
    			attr_dev(span1, "class", "svelte-1nx2poc");
    			add_location(span1, file$7, 430, 8, 9621);
    			attr_dev(span2, "class", "svelte-1nx2poc");
    			add_location(span2, file$7, 431, 8, 9639);
    			attr_dev(div0, "class", "Headerstyle__HamburgerIcon-r27s8s-11 dLFRil svelte-1nx2poc");
    			add_location(div0, file$7, 428, 6, 9536);
    			attr_dev(div1, "class", "drawer__handler svelte-1nx2poc");
    			set_style(div1, "display", "inline-block");
    			add_location(div1, file$7, 427, 4, 9468);
    			attr_dev(div2, "class", "Headerstyle__DrawerWrapper-r27s8s-9 gNJBsN svelte-1nx2poc");
    			add_location(div2, file$7, 426, 2, 9406);
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "clip-rule", "evenodd");
    			attr_dev(path0, "d", "M164.497 89.2272C165.168 88.5521 165.168 87.4504 164.497\r\n          86.7753L156.379 78.5889C155.708 77.9138 155.513 76.6685 155.94\r\n          75.8209L161.133 65.5275C161.562 64.6778 161.219 63.6282 160.375\r\n          63.1953L150.124 57.9191C149.279 57.484 148.706 56.3598 148.851\r\n          55.4221L150.611 44.027C150.756 43.0872 150.106 42.1953 149.169\r\n          42.0426L137.788 40.1932C136.85 40.0412 135.959 39.1486 135.807\r\n          38.213L133.957 26.832C133.807 25.895 132.914 25.2481 131.975\r\n          25.3917L120.581 27.1495C119.641 27.2931 118.518 26.7208 118.083\r\n          25.8767L112.809 15.6256C112.374 14.7808 111.324 14.4387 110.475\r\n          14.8667L100.181 20.0598C99.3315 20.4872 98.0883 20.29 97.4132\r\n          19.6213L89.2275 11.501C88.5517 10.833 87.45 10.833 86.7749\r\n          11.501L78.5885 19.6213C77.9134 20.29 76.6688 20.4886 75.8206\r\n          20.0598L65.5279 14.8667C64.6782 14.4387 63.6279 14.7808 63.1943\r\n          15.6256L57.9188 25.8767C57.4837 26.7208 56.3595 27.2931 55.4211\r\n          27.1495L44.0275 25.3917C43.0877 25.2467 42.1944 25.895 42.0423\r\n          26.832L40.193 38.213C40.0416 39.1486 39.1483 40.0412 38.212\r\n          40.1932L26.8318 42.0426C25.8955 42.1953 25.2479 43.0893 25.3915\r\n          44.027L27.1493 55.4221C27.2922 56.3612 26.7213 57.4854 25.8765\r\n          57.9191L15.6254 63.1953C14.7806 63.6303 14.4385 64.6799 14.8672\r\n          65.5275L20.0604 75.8209C20.4863 76.6685 20.2898 77.9138 19.6218\r\n          78.5889L11.5016 86.7753C10.8328 87.4504 10.8328 88.5521 11.5016\r\n          89.2272L19.6218 97.4129C20.2898 98.088 20.4884 99.334 20.0604\r\n          100.182L14.8672 110.476C14.4385 111.326 14.7806 112.374 15.6254\r\n          112.809L25.8765 118.084C26.7213 118.519 27.2922 119.641 27.1493\r\n          120.58L25.3915 131.975C25.2465 132.915 25.8955 133.806 26.8318\r\n          133.958L38.212 135.807C39.1483 135.958 40.0416 136.85 40.193\r\n          137.789L42.0423 149.169C42.1944 150.107 43.0898 150.757 44.0275\r\n          150.611L55.4211 148.852C56.3609 148.707 57.4851 149.28 57.9188\r\n          150.124L63.1943 160.375C63.6293 161.22 64.6803 161.562 65.5279\r\n          161.134L75.8206 155.941C76.6688 155.514 77.9134 155.71 78.5885\r\n          156.379L86.7749 164.498C87.45 165.167 88.5517 165.167 89.2275\r\n          164.498L97.4132 156.379C98.0883 155.71 99.3329 155.514 100.181\r\n          155.941L110.476 161.134C111.325 161.564 112.374 161.22 112.807\r\n          160.375L118.083 150.124C118.518 149.28 119.641 148.707 120.581\r\n          148.852L131.975 150.611C132.914 150.757 133.805 150.107 133.957\r\n          149.169L135.807 137.789C135.957 136.85 136.85 135.959 137.788\r\n          135.807L149.169 133.958C150.106 133.807 150.756 132.915 150.611\r\n          131.975L148.851 120.58C148.706 119.641 149.279 118.519 150.124\r\n          118.084L160.375 112.809C161.219 112.374 161.56 111.324 161.133\r\n          110.476L155.94 100.182C155.513 99.3319 155.708 98.088 156.379\r\n          97.4129L164.497 89.2272Z");
    			attr_dev(path0, "fill", "rgb(0, 158, 127)");
    			add_location(path0, file$7, 448, 8, 15560);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "clip-rule", "evenodd");
    			attr_dev(path1, "d", "M80.9468 113.992L71.1801 104.225L57.4443 90.4859L66.8366\r\n          81.0894L80.5773 94.8209C80.7814 95.025 81.1116 95.025 81.3164\r\n          94.8209L109.157 66.9875L118.557 76.377L80.9468 113.992Z");
    			attr_dev(path1, "fill", "#fff");
    			add_location(path1, file$7, 493, 8, 18665);
    			attr_dev(svg0, "width", "40");
    			attr_dev(svg0, "height", "40");
    			attr_dev(svg0, "viewBox", "0 0 176 176");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$7, 442, 6, 15408);
    			attr_dev(span3, "class", "Logostyle__LogoBox-f7qftd-0 gbLpHM svelte-1nx2poc");
    			add_location(span3, file$7, 436, 4, 9748);
    			attr_dev(div3, "class", "Headerstyle__LogoWrapper-r27s8s-10 dVOQHh svelte-1nx2poc");
    			add_location(div3, file$7, 435, 2, 9687);
    			attr_dev(div4, "class", "LanguageSwitcherstyle__Flag-sc-2keas9-2 reuOr svelte-1nx2poc");
    			add_location(div4, file$7, 510, 10, 19339);
    			attr_dev(path2, "data-name", "Path 3");
    			attr_dev(path2, "d", "M76.8,119.826l-1.34-16.881A2.109,2.109,0,0,0,73.362,101H70.716v3.921a.879.879,0,1,1-1.757,0V101H60.875v3.921a.879.879,0,1,1-1.757,0V101H56.472a2.109,2.109,0,0,0-2.094,1.937l-1.34,16.886a4.885,4.885,0,0,0,4.87,5.259H71.926a4.884,4.884,0,0,0,4.87-5.261Zm-7.92-8.6-4.544,4.544a.878.878,0,0,1-1.243,0l-2.13-2.13A.878.878,0,0,1,62.2,112.4l1.509,1.508,3.923-3.923a.879.879,0,1,1,1.242,1.243Z");
    			attr_dev(path2, "transform", "translate(-53.023 -101.005)");
    			attr_dev(path2, "fill", "currentColor");
    			add_location(path2, file$7, 522, 22, 19915);
    			attr_dev(g0, "data-name", "Group 16");
    			add_location(g0, file$7, 521, 20, 19867);
    			attr_dev(g1, "data-name", "Group 17");
    			attr_dev(g1, "transform", "translate(53.023 5.918)");
    			add_location(g1, file$7, 520, 18, 19785);
    			attr_dev(path3, "data-name", "Path 4");
    			attr_dev(path3, "d", "M162.838,0a5.806,5.806,0,0,0-5.8,5.8v.119H158.8V5.8a4.042,4.042,0,1,1,8.083,0v.119h1.757V5.8A5.806,5.806,0,0,0,162.838,0Z");
    			attr_dev(path3, "transform", "translate(-157.039)");
    			attr_dev(path3, "fill", "currentColor");
    			add_location(path3, file$7, 531, 22, 20686);
    			attr_dev(g2, "data-name", "Group 18");
    			add_location(g2, file$7, 530, 20, 20638);
    			attr_dev(g3, "data-name", "Group 19");
    			attr_dev(g3, "transform", "translate(59.118)");
    			add_location(g3, file$7, 529, 18, 20562);
    			attr_dev(g4, "data-name", "Group 2704");
    			add_location(g4, file$7, 519, 16, 19739);
    			attr_dev(g5, "data-name", "shopping-bag (3)");
    			attr_dev(g5, "transform", "translate(-53.023)");
    			add_location(g5, file$7, 518, 14, 19658);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "19px");
    			attr_dev(svg1, "height", "24px");
    			attr_dev(svg1, "viewBox", "0 0 23.786 30");
    			add_location(svg1, file$7, 513, 12, 19491);
    			attr_dev(span4, "class", "svelte-1nx2poc");
    			add_location(span4, file$7, 542, 12, 21119);
    			attr_dev(div5, "class", "CartItemCardstyle__PopupItemCount-xuzuaf-2 jtVXiK svelte-1nx2poc");
    			add_location(div5, file$7, 512, 10, 19414);
    			attr_dev(button, "class", "LanguageSwitcherstyle__SelectedItem-sc-2keas9-1 duLuwV svelte-1nx2poc");
    			add_location(button, file$7, 507, 8, 19210);
    			attr_dev(div6, "class", "popover-handler svelte-1nx2poc");
    			add_location(div6, file$7, 506, 6, 19171);
    			attr_dev(div7, "class", "Popoverstyle__PopoverWrapper-ebbms3-0 dZMxZn popover-wrapper right svelte-1nx2poc");
    			add_location(div7, file$7, 504, 4, 19076);
    			attr_dev(div8, "class", "LanguageSwitcherstyle__Box-sc-2keas9-0 klmBvw svelte-1nx2poc");
    			add_location(div8, file$7, 503, 2, 19011);
    			attr_dev(path4, "d", "M14.771,12.752,11.32,9.286a5.519,5.519,0,0,0,1.374-3.634A5.763,5.763,0,0,0,6.839,0,5.763,5.763,0,0,0,.984,5.652,5.763,5.763,0,0,0,6.839,11.3a5.936,5.936,0,0,0,3.354-1.023l3.477,3.492a.783.783,0,0,0,1.08.02A.72.72,0,0,0,14.771,12.752ZM6.839,1.475a4.259,4.259,0,0,1,4.327,4.178A4.259,4.259,0,0,1,6.839,9.83,4.259,4.259,0,0,1,2.511,5.652,4.259,4.259,0,0,1,6.839,1.475Z");
    			attr_dev(path4, "transform", "translate(-0.984)");
    			attr_dev(path4, "fill", "currentColor");
    			add_location(path4, file$7, 561, 6, 21583);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "width", "14px");
    			attr_dev(svg2, "height", "14px");
    			attr_dev(svg2, "viewBox", "0 0 14 14");
    			attr_dev(svg2, "class", "svelte-1nx2poc");
    			add_location(svg2, file$7, 556, 4, 21460);
    			attr_dev(div9, "class", "Headerstyle__SearchWrapper-r27s8s-0 bivHNq searchIconWrapper svelte-1nx2poc");
    			add_location(div9, file$7, 555, 2, 21356);
    			attr_dev(div10, "class", "Headerstyle__MobileHeaderInnerWrapper-r27s8s-8 eMDoa unSticky home svelte-1nx2poc");
    			add_location(div10, file$7, 425, 0, 9322);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t0);
    			append_dev(div0, span1);
    			append_dev(div0, t1);
    			append_dev(div0, span2);
    			append_dev(div10, t2);
    			append_dev(div10, div3);
    			append_dev(div3, span3);
    			append_dev(span3, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(div10, t3);
    			append_dev(div10, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, button);
    			append_dev(button, div4);
    			append_dev(button, t4);
    			append_dev(button, div5);
    			append_dev(div5, svg1);
    			append_dev(svg1, g5);
    			append_dev(g5, g4);
    			append_dev(g4, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path2);
    			append_dev(g4, g3);
    			append_dev(g3, g2);
    			append_dev(g2, path3);
    			append_dev(div5, t5);
    			append_dev(div5, span4);
    			if (if_block0) if_block0.m(span4, null);
    			append_dev(span4, t6);
    			append_dev(div10, t7);
    			append_dev(div10, div9);
    			append_dev(div9, svg2);
    			append_dev(svg2, path4);
    			insert_dev(target, t8, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(span3, "click", /*goToHome*/ ctx[4], false, false, false),
    				listen_dev(button, "click", /*goToCheckout*/ ctx[5], false, false, false),
    				listen_dev(div9, "click", /*abrirvisible*/ ctx[6], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*cart_sum*/ ctx[0] > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(span4, t6);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*visible*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$4(ctx);
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
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t8);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let svg = "M298.7,418.289l-2.906-4.148a.835.835,0,0,0-.528-.251.607.607,0,0,0-.529.251l-2.905,4.148h-3.17a.609.609,0,0,0-.661.625v.191l1.651,5.84a1.336,1.336,0,0,0,1.255.945h8.588a1.261,1.261,0,0,0,1.254-.945l1.651-5.84v-.191a.609.609,0,0,0-.661-.625Zm-5.419,0,1.984-2.767,1.98,2.767Zm1.984,5.024a1.258,1.258,0,1,1,1.319-1.258,1.3,1.3,0,0,1-1.319,1.258Zm0,0";
    	let cart_sum = 0;
    	let articulo = "Item";
    	let visible = false;
    	let visiblee = false;
    	const cartItems = get_store_value(cart);

    	const unsubscribe = cart.subscribe(items => {
    		const itemValues = Object.values(items);
    		$$invalidate(0, cart_sum = 0);

    		itemValues.forEach(item => {
    			$$invalidate(0, cart_sum += item.count);
    		});
    	});

    	function goToHome() {
    		dispatch("nav", { option: "home" });
    	}

    	function goToCheckout() {
    		dispatch("nav", { option: "checkout" });
    	}

    	function goToModa() {
    		dispatch("nav", { option: "moda" });
    	}

    	const abrirvisible = () => {
    		$$invalidate(1, visible = true);
    	};

    	const cerrarvisible = () => {
    		$$invalidate(1, visible = false);
    		checkedOut = true;

    		cart.update(n => {
    			return {};
    		});
    	};

    	const abrirvisiblee = () => {
    		visiblee = true;
    	};

    	const cerrarvisiblee = () => {
    		visiblee = false;
    		checkedOut = true;

    		cart.update(n => {
    			return {};
    		});
    	};

    	let prefix = "";
    	let name = "";
    	let marca = "";
    	let img = "";
    	let i = 0;
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", $$slots, []);

    	function input_input_handler() {
    		prefix = this.value;
    		$$invalidate(2, prefix);
    	}

    	$$self.$capture_state = () => ({
    		cart,
    		get: get_store_value,
    		createEventDispatcher,
    		items,
    		itemsmaster,
    		Card2,
    		dispatch,
    		svg,
    		cart_sum,
    		articulo,
    		visible,
    		visiblee,
    		cartItems,
    		unsubscribe,
    		goToHome,
    		goToCheckout,
    		goToModa,
    		abrirvisible,
    		cerrarvisible,
    		abrirvisiblee,
    		cerrarvisiblee,
    		prefix,
    		name,
    		marca,
    		img,
    		i,
    		filtereditems
    	});

    	$$self.$inject_state = $$props => {
    		if ("svg" in $$props) svg = $$props.svg;
    		if ("cart_sum" in $$props) $$invalidate(0, cart_sum = $$props.cart_sum);
    		if ("articulo" in $$props) articulo = $$props.articulo;
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("visiblee" in $$props) visiblee = $$props.visiblee;
    		if ("prefix" in $$props) $$invalidate(2, prefix = $$props.prefix);
    		if ("name" in $$props) $$invalidate(17, name = $$props.name);
    		if ("marca" in $$props) marca = $$props.marca;
    		if ("img" in $$props) img = $$props.img;
    		if ("i" in $$props) i = $$props.i;
    		if ("filtereditems" in $$props) $$invalidate(3, filtereditems = $$props.filtereditems);
    	};

    	let filtereditems;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*prefix*/ 4) {
    			 $$invalidate(3, filtereditems = prefix
    			? itemsmaster.filter(item => {
    					const name = `${item.name}, ${item.marca}, ${item.img}, `;
    					return name.toLowerCase().startsWith(prefix.toLowerCase());
    				})
    			: itemsmaster);
    		}
    	};

    	return [
    		cart_sum,
    		visible,
    		prefix,
    		filtereditems,
    		goToHome,
    		goToCheckout,
    		abrirvisible,
    		cerrarvisible,
    		visiblee,
    		dispatch,
    		svg,
    		articulo,
    		cartItems,
    		unsubscribe,
    		goToModa,
    		abrirvisiblee,
    		cerrarvisiblee,
    		name,
    		marca,
    		img,
    		i,
    		input_input_handler
    	];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\CheckoutItem.svelte generated by Svelte v3.20.1 */
    const file$8 = "src\\components\\CheckoutItem.svelte";

    function create_fragment$8(ctx) {
    	let div9;
    	let div4;
    	let div3;
    	let div2;
    	let div0;
    	let button0;
    	let svg0;
    	let rect0;
    	let t0;
    	let span0;
    	let t1;
    	let t2;
    	let button1;
    	let svg1;
    	let g;
    	let rect1;
    	let rect2;
    	let t3;
    	let img_1;
    	let img_1_src_value;
    	let t4;
    	let div1;
    	let span1;
    	let t6;
    	let span2;
    	let t10;
    	let span3;
    	let t12;
    	let span4;
    	let t13;
    	let t14;
    	let t15;
    	let button2;
    	let svg2;
    	let path;
    	let t16;
    	let div6;
    	let div5;
    	let t17;
    	let div8;
    	let div7;
    	let dispose;

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			t0 = space();
    			span0 = element("span");
    			t1 = text(/*count*/ ctx[0]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			g = svg_element("g");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			t3 = space();
    			img_1 = element("img");
    			t4 = space();
    			div1 = element("div");
    			span1 = element("span");
    			span1.textContent = `${/*name*/ ctx[2]}`;
    			t6 = space();
    			span2 = element("span");

    			span2.textContent = `
            S/.${/*precio*/ ctx[5]}.00
          `;

    			t10 = space();
    			span3 = element("span");
    			span3.textContent = `${/*marca*/ ctx[4]}`;
    			t12 = space();
    			span4 = element("span");
    			t13 = text("S./");
    			t14 = text(/*doubled*/ ctx[1]);
    			t15 = space();
    			button2 = element("button");
    			svg2 = svg_element("svg");
    			path = svg_element("path");
    			t16 = space();
    			div6 = element("div");
    			div5 = element("div");
    			t17 = space();
    			div8 = element("div");
    			div7 = element("div");
    			attr_dev(rect0, "data-name", "Rectangle 522");
    			attr_dev(rect0, "width", "12");
    			attr_dev(rect0, "height", "2");
    			attr_dev(rect0, "rx", "1");
    			attr_dev(rect0, "fill", "currentColor");
    			add_location(rect0, file$8, 191, 14, 4481);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "12px");
    			attr_dev(svg0, "height", "2px");
    			attr_dev(svg0, "viewBox", "0 0 12 2");
    			add_location(svg0, file$8, 186, 12, 4320);
    			attr_dev(button0, "class", "Counterstyle__CounterButton-sc-14ahato-1 bIQMmh svelte-1drk566");
    			add_location(button0, file$8, 183, 10, 4186);
    			attr_dev(span0, "class", "Counterstyle__CounterValue-sc-14ahato-2 dMHyRK svelte-1drk566");
    			add_location(span0, file$8, 199, 10, 4702);
    			attr_dev(rect1, "data-name", "Rectangle 520");
    			attr_dev(rect1, "width", "12");
    			attr_dev(rect1, "height", "2");
    			attr_dev(rect1, "rx", "1");
    			attr_dev(rect1, "transform", "translate(1367 195)");
    			attr_dev(rect1, "fill", "currentColor");
    			add_location(rect1, file$8, 214, 16, 5262);
    			attr_dev(rect2, "data-name", "Rectangle 521");
    			attr_dev(rect2, "width", "12");
    			attr_dev(rect2, "height", "2");
    			attr_dev(rect2, "rx", "1");
    			attr_dev(rect2, "transform", "translate(1374 190) rotate(90)");
    			attr_dev(rect2, "fill", "currentColor");
    			add_location(rect2, file$8, 221, 16, 5509);
    			attr_dev(g, "id", "Group_3351");
    			attr_dev(g, "data-name", "Group 3351");
    			attr_dev(g, "transform", "translate(-1367 -190)");
    			add_location(g, file$8, 210, 14, 5117);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "12px");
    			attr_dev(svg1, "height", "12px");
    			attr_dev(svg1, "viewBox", "0 0 12 12");
    			add_location(svg1, file$8, 205, 12, 4954);
    			attr_dev(button1, "class", " add Counterstyle__CounterButton-sc-14ahato-1 bIQMmh svelte-1drk566");
    			add_location(button1, file$8, 202, 10, 4815);
    			attr_dev(div0, "class", "Counterstyle__CounterBox-sc-14ahato-0 eIGyji svelte-1drk566");
    			add_location(div0, file$8, 182, 8, 4116);
    			attr_dev(img_1, "class", "CartItemstyle__Image-sc-1otw30s-2 fVHYzs svelte-1drk566");
    			if (img_1.src !== (img_1_src_value = `img/${/*img*/ ctx[3]}`)) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*name*/ ctx[2]);
    			add_location(img_1, file$8, 232, 8, 5836);
    			attr_dev(span1, "class", "CartItemstyle__Name-sc-1otw30s-3 iUpewi svelte-1drk566");
    			add_location(span1, file$8, 237, 10, 6036);
    			attr_dev(span2, "class", "CartItemstyle__Price-sc-1otw30s-4 effwGm svelte-1drk566");
    			add_location(span2, file$8, 238, 10, 6115);
    			attr_dev(span3, "class", "CartItemstyle__Weight-sc-1otw30s-5 cYyRFl svelte-1drk566");
    			add_location(span3, file$8, 241, 10, 6229);
    			attr_dev(div1, "class", "CartItemstyle__Information-sc-1otw30s-1 QZGNI svelte-1drk566");
    			add_location(div1, file$8, 236, 8, 5965);
    			attr_dev(span4, "class", "CartItemstyle__Total-sc-1otw30s-6 cLjIxt svelte-1drk566");
    			add_location(span4, file$8, 245, 8, 6351);
    			attr_dev(path, "data-name", "_ionicons_svg_ios-close (5)");
    			attr_dev(path, "d", "M166.686,165.55l3.573-3.573a.837.837,0,0,0-1.184-1.184l-3.573,3.573-3.573-3.573a.837.837,0,1,0-1.184,1.184l3.573,3.573-3.573,3.573a.837.837,0,0,0,1.184,1.184l3.573-3.573,3.573,3.573a.837.837,0,0,0,1.184-1.184Z");
    			attr_dev(path, "transform", "translate(-160.5 -160.55)");
    			attr_dev(path, "fill", "currentColor");
    			add_location(path, file$8, 256, 12, 6734);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "width", "10.003");
    			attr_dev(svg2, "height", "10");
    			attr_dev(svg2, "viewBox", "0 0 10.003 10");
    			add_location(svg2, file$8, 251, 10, 6577);
    			attr_dev(button2, "class", "CartItemstyle__RemoveButton-sc-1otw30s-7 dByUKe svelte-1drk566");
    			add_location(button2, file$8, 248, 8, 6457);
    			attr_dev(div2, "class", "CartItemstyle__ItemBox-sc-1otw30s-0 cEAUrG svelte-1drk566");
    			add_location(div2, file$8, 181, 6, 4050);
    			attr_dev(div3, "class", "CartItemCardstyle__ItemWrapper-xuzuaf-4 bpIPBu items-wrapper svelte-1drk566");
    			add_location(div3, file$8, 180, 4, 3968);
    			set_style(div4, "position", "relative");
    			set_style(div4, "overflow", "scroll");
    			set_style(div4, "margin-right", "-17px");
    			set_style(div4, "margin-bottom", "-17px");
    			set_style(div4, "min-height", "17px");
    			set_style(div4, "max-height", "calc(100vh + 17px)");
    			set_style(div4, "margin-left", "0px");
    			add_location(div4, file$8, 176, 2, 3785);
    			set_style(div5, "position", "relative");
    			set_style(div5, "display", "block");
    			set_style(div5, "height", "100%");
    			set_style(div5, "cursor", "pointer");
    			set_style(div5, "border-radius", "inherit");
    			set_style(div5, "background-color", "rgba(0, 0, 0, 0.2)");
    			set_style(div5, "width", "0px");
    			add_location(div5, file$8, 269, 4, 7356);
    			set_style(div6, "position", "absolute");
    			set_style(div6, "height", "6px");
    			set_style(div6, "transition", "opacity 200ms ease 0s");
    			set_style(div6, "opacity", "0");
    			set_style(div6, "right", "2px");
    			set_style(div6, "bottom", "2px");
    			set_style(div6, "left", "2px");
    			set_style(div6, "border-radius", "3px");
    			add_location(div6, file$8, 266, 2, 7191);
    			set_style(div7, "position", "relative");
    			set_style(div7, "display", "block");
    			set_style(div7, "width", "100%");
    			set_style(div7, "cursor", "pointer");
    			set_style(div7, "border-radius", "inherit");
    			set_style(div7, "background-color", "rgba(0, 0, 0, 0.2)");
    			set_style(div7, "height", "0px");
    			add_location(div7, file$8, 276, 4, 7703);
    			set_style(div8, "position", "absolute");
    			set_style(div8, "width", "6px");
    			set_style(div8, "transition", "opacity 200ms ease 0s");
    			set_style(div8, "opacity", "0");
    			set_style(div8, "right", "2px");
    			set_style(div8, "bottom", "2px");
    			set_style(div8, "top", "2px");
    			set_style(div8, "border-radius", "3px");
    			add_location(div8, file$8, 273, 2, 7540);
    			set_style(div9, "position", "relative");
    			set_style(div9, "overflow", "hidden");
    			set_style(div9, "width", "100%");
    			set_style(div9, "height", "auto");
    			set_style(div9, "min-height", "0px");
    			set_style(div9, "max-height", "100vh");
    			set_style(div9, "border-bottom", "1px solid rgb(247, 247,\r\n  247)");
    			set_style(div9, "font-family", "Lato, sans-serif");
    			add_location(div9, file$8, 172, 0, 3581);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, rect0);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(span0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, g);
    			append_dev(g, rect1);
    			append_dev(g, rect2);
    			append_dev(div2, t3);
    			append_dev(div2, img_1);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, span1);
    			append_dev(div1, t6);
    			append_dev(div1, span2);
    			append_dev(div1, t10);
    			append_dev(div1, span3);
    			append_dev(div2, t12);
    			append_dev(div2, span4);
    			append_dev(span4, t13);
    			append_dev(span4, t14);
    			append_dev(div2, t15);
    			append_dev(div2, button2);
    			append_dev(button2, svg2);
    			append_dev(svg2, path);
    			append_dev(div9, t16);
    			append_dev(div9, div6);
    			append_dev(div6, div5);
    			append_dev(div9, t17);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*countButtonHandler*/ ctx[6], false, false, false),
    				listen_dev(button1, "click", /*countButtonHandler*/ ctx[6], false, false, false),
    				listen_dev(button2, "click", /*removeItem*/ ctx[7], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*count*/ 1) set_data_dev(t1, /*count*/ ctx[0]);
    			if (dirty & /*doubled*/ 2) set_data_dev(t14, /*doubled*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { item } = $$props;
    	let { name, img, img1, img2, img3, descripcion, marca, ancho, profundidad, alto, material, Tipodeconexión, peso, precio, precioantes, oferta, categoriageneral, categoria, count } = item;

    	const countButtonHandler = e => {
    		if (e.target.classList.contains("add")) {
    			$$invalidate(0, count++, count);
    		} else if (count >= 1) {
    			$$invalidate(0, count--, count);
    		}

    		cart.update(n => ({ ...n, [name]: { ...n[name], count } }));
    	};

    	const removeItem = () => {
    		cart.update(n => {
    			delete n[name];
    			return n;
    		});
    	};

    	const writable_props = ["item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CheckoutItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CheckoutItem", $$slots, []);

    	$$self.$set = $$props => {
    		if ("item" in $$props) $$invalidate(8, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		cart,
    		fly,
    		item,
    		name,
    		img,
    		img1,
    		img2,
    		img3,
    		descripcion,
    		marca,
    		ancho,
    		profundidad,
    		alto,
    		material,
    		Tipodeconexión,
    		peso,
    		precio,
    		precioantes,
    		oferta,
    		categoriageneral,
    		categoria,
    		count,
    		countButtonHandler,
    		removeItem,
    		doubled
    	});

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(8, item = $$props.item);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("img" in $$props) $$invalidate(3, img = $$props.img);
    		if ("img1" in $$props) img1 = $$props.img1;
    		if ("img2" in $$props) img2 = $$props.img2;
    		if ("img3" in $$props) img3 = $$props.img3;
    		if ("descripcion" in $$props) descripcion = $$props.descripcion;
    		if ("marca" in $$props) $$invalidate(4, marca = $$props.marca);
    		if ("ancho" in $$props) ancho = $$props.ancho;
    		if ("profundidad" in $$props) profundidad = $$props.profundidad;
    		if ("alto" in $$props) alto = $$props.alto;
    		if ("material" in $$props) material = $$props.material;
    		if ("Tipodeconexión" in $$props) Tipodeconexión = $$props.Tipodeconexión;
    		if ("peso" in $$props) peso = $$props.peso;
    		if ("precio" in $$props) $$invalidate(5, precio = $$props.precio);
    		if ("precioantes" in $$props) precioantes = $$props.precioantes;
    		if ("oferta" in $$props) oferta = $$props.oferta;
    		if ("categoriageneral" in $$props) categoriageneral = $$props.categoriageneral;
    		if ("categoria" in $$props) categoria = $$props.categoria;
    		if ("count" in $$props) $$invalidate(0, count = $$props.count);
    		if ("doubled" in $$props) $$invalidate(1, doubled = $$props.doubled);
    	};

    	let doubled;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*count*/ 1) {
    			 $$invalidate(1, doubled = count * precio);
    		}
    	};

    	return [count, doubled, name, img, marca, precio, countButtonHandler, removeItem, item];
    }

    class CheckoutItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { item: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CheckoutItem",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[8] === undefined && !("item" in props)) {
    			console.warn("<CheckoutItem> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<CheckoutItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<CheckoutItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Checkout.svelte generated by Svelte v3.20.1 */

    const { Object: Object_1$1 } = globals;
    const file$9 = "src\\components\\Checkout.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (840:2) {:else}
    function create_else_block_1$2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t0;
    	let div;
    	let span0;
    	let button0;
    	let t2;
    	let button1;
    	let a;
    	let t4;
    	let span1;
    	let current;
    	let dispose;
    	let each_value = /*cartItems*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[8].name;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div = element("div");
    			span0 = element("span");
    			button0 = element("button");
    			button0.textContent = "Do you have a voucher?";
    			t2 = space();
    			button1 = element("button");
    			a = element("a");
    			a.textContent = "Checkout";
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "S./";
    			attr_dev(button0, "class", "svelte-bqqo2c");
    			add_location(button0, file$9, 845, 8, 31071);
    			attr_dev(span0, "class", "CartItemCardstyle__PromoCode-xuzuaf-13 bCKENA svelte-bqqo2c");
    			add_location(span0, file$9, 844, 6, 31001);
    			attr_dev(a, "class", "CartItemCardstyle__Title-xuzuaf-16 eKpZme svelte-bqqo2c");
    			add_location(a, file$9, 850, 8, 31252);
    			attr_dev(span1, "class", "CartItemCardstyle__PriceBox-xuzuaf-17 KJSiM svelte-bqqo2c");
    			add_location(span1, file$9, 851, 8, 31327);
    			attr_dev(button1, "class", "CartItemCardstyle__CheckoutButton-xuzuaf-14 iHtosU svelte-bqqo2c");
    			add_location(button1, file$9, 847, 6, 31133);
    			attr_dev(div, "class", "CartItemCardstyle__CheckoutButtonWrapper-xuzuaf-15 eVxmaB svelte-bqqo2c");
    			add_location(div, file$9, 843, 4, 30922);
    		},
    		m: function mount(target, anchor, remount) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, button0);
    			append_dev(div, t2);
    			append_dev(div, button1);
    			append_dev(button1, a);
    			append_dev(button1, t4);
    			append_dev(button1, span1);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button1, "click", /*abrirvisible*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cartItems*/ 2) {
    				const each_value = /*cartItems*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, t0.parentNode, outro_and_destroy_block, create_each_block$2, t0, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(840:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (581:2) {#if cartItems.length === 0}
    function create_if_block_1$4(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*checkedOut*/ ctx[0]) return create_if_block_2$3;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(581:2) {#if cartItems.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (841:4) {#each cartItems as item (item.name)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let current;

    	const checkoutitem = new CheckoutItem({
    			props: { item: /*item*/ ctx[8] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(checkoutitem.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(checkoutitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const checkoutitem_changes = {};
    			if (dirty & /*cartItems*/ 2) checkoutitem_changes.item = /*item*/ ctx[8];
    			checkoutitem.$set(checkoutitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkoutitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkoutitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(checkoutitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(841:4) {#each cartItems as item (item.name)}",
    		ctx
    	});

    	return block;
    }

    // (824:4) {:else}
    function create_else_block$4(ctx) {
    	let span;
    	let t1;
    	let div;
    	let svg;
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let path3;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Tu carrito esta vacío.";
    			t1 = space();
    			div = element("div");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(span, "class", "CartItemCardstyle__NoProductMsg-xuzuaf-18 dznoMc svelte-bqqo2c");
    			add_location(span, file$9, 824, 6, 24098);
    			attr_dev(path0, "fill", "#060000");
    			attr_dev(path0, "d", "M163.786 326.593h-.044a1.151 1.151 0 0 1-1.108-1.196c.208-5.436-.156-11.314-.61-14.73a1.152 1.152 0 1 1 2.284-.303c.466 3.512.842 9.55.629 15.122a1.153 1.153 0 0 1-1.15 1.107");
    			add_location(path0, file$9, 829, 8, 24391);
    			attr_dev(path1, "fill", "rgb(0, 158, 127)");
    			attr_dev(path1, "d", "M59.946 282.537l.089-.073c2.696-2.19 5.868-3.455 9.26-3.455.368 0 .734.015 1.097.045.099-.03.205-.045.315-.045 1.251 0 14.466 2.02 39.278 6.004a1.153 1.153 0 0 1-.365 2.275c-16.107-2.586-25.596-4.065-31.168-4.905 5.133 4.105 8.57 11.552 8.57 20.039 0 8.445-3.403 15.86-8.492 19.979 3.527-.54 8.618-1.333 15.956-2.493a1.15 1.15 0 1 1 .36 2.275c-23.092 3.653-23.853 3.653-24.14 3.653-.11 0-.215-.015-.316-.044a13.95 13.95 0 0 1-1.096.043c-3.419 0-6.615-1.285-9.326-3.509-14.284 1.805-28.922 3.51-32.188 3.51-.11 0-.217-.015-.317-.044-.362.028-.727.043-1.095.043-9.775 0-17.728-10.503-17.728-23.413s7.953-23.413 17.728-23.413c.368 0 .733.015 1.095.045.1-.03.207-.045.316-.045 3.182 0 17.818 1.712 32.167 3.528zm-25.063-.645l.02.014c5.475 3.989 9.192 11.69 9.192 20.516 0 8.845-3.733 16.56-9.227 20.542 5.398-.554 13.37-1.486 22.968-2.691-3.713-4.164-6.115-10.308-6.262-17.184h-4.543a1.152 1.152 0 1 1 0-2.302h4.579c.34-6.473 2.68-12.23 6.21-16.197-9.594-1.206-17.55-2.14-22.937-2.698zm116.433 9.844c11.53 1.9 17.584 2.923 17.998 3.04l.838.237v14.808l-.825.244-.01.003c-.167.048-.963.237-18.535 3.11l-.371-2.273c11.627-1.902 15.886-2.625 17.438-2.898v-11.168c-1.883-.333-7.002-1.196-16.907-2.83l.374-2.273zm-124.948.447c-4.212 0-7.625 4.584-7.625 10.24 0 5.655 3.413 10.24 7.625 10.24 4.211 0 7.624-4.585 7.624-10.24 0-5.656-3.413-10.24-7.624-10.24zm42.926 0c-4.211 0-7.625 4.584-7.625 10.24 0 5.655 3.414 10.24 7.625 10.24 4.212 0 7.626-4.585 7.626-10.24 0-5.656-3.414-10.24-7.626-10.24z");
    			add_location(path1, file$9, 830, 8, 24608);
    			attr_dev(path2, "fill", "#060000");
    			attr_dev(path2, "d", "M198.856 79.7c3.959 0 7.18 3.221 7.18 7.18 0 3.568-2.615 6.536-6.029 7.088l.001 106.059c.465-.125.919-.223 1.355-.29a20.039 20.039 0 0 1 2.387-.234 1.11 1.11 0 0 1 .326-.048c2.21 0 4.949.23 7.323.615 11.969 1.941 20.655 17.842 20.655 37.808 0 20.856-9.348 37.823-20.84 37.823h-11.207v11.766L336.75 435.413a1.152 1.152 0 0 1-1.692 1.564l-136.202-147.36-136.201 147.36a1.152 1.152 0 1 1-1.692-1.564l78.454-84.88c-2.882.119-5.926.138-8.63.138h-.202c-.473.005-1.347.018-2.366.035-1.791.027-4.022.061-5.319.061-13.04 0-26.633-2.48-28.59-20.877-1.988-18.678-.354-29.574.797-34.407 1.134-4.753 4.261-7.646 8.134-7.561a7.928 7.928 0 0 1 5.587 2.471l.039.044.198-8.688c.1-4.403 3.77-7.89 8.166-7.803a7.977 7.977 0 0 1 6.234 3.233 7.983 7.983 0 0 1 1.779-2.512 7.958 7.958 0 0 1 5.692-2.216 7.926 7.926 0 0 1 5.587 2.473 7.929 7.929 0 0 1 2.216 5.693l-.002.108.042-.04a7.945 7.945 0 0 1 5.692-2.216c4.301.098 7.729 3.665 7.804 8.12.157 9.394.105 25.381-.38 38.284a1.153 1.153 0 0 1-1.15 1.108h-.045a1.152 1.152 0 0 1-1.107-1.195c.483-12.86.535-28.795.378-38.159-.054-3.213-2.492-5.785-5.551-5.855-2.781-.045-5.179 1.925-5.705 4.583l-.106 22.362v6.568c0 .094-.01.185-.032.273l-.001.038a1.152 1.152 0 0 1-1.152 1.147h-.006a1.152 1.152 0 0 1-1.146-1.157l.034-7.092v-21.196c.01-.39.045-.773.107-1.15l.023-4.563c.071-3.153-2.42-5.76-5.552-5.83a5.7 5.7 0 0 0-4.049 1.578 5.639 5.639 0 0 0-1.76 3.973l-.046 1.996-.56 29.564a1.152 1.152 0 0 1-1.114 1.129c-.05.006-.099.01-.15.01h-.026a1.153 1.153 0 0 1-1.126-1.178l.516-22.696c.002-.082.013-.162.03-.24l.023-1.199a1.154 1.154 0 0 1-.015-.219l.123-5.416.001-.212a5.69 5.69 0 0 0-5.552-5.596 5.717 5.717 0 0 0-4.05 1.578 5.643 5.643 0 0 0-1.76 3.974l-.297 13.064a1.087 1.087 0 0 1-.057.325c.026.296.036.595.029.897l-.398 17.514a1.151 1.151 0 0 1-1.15 1.125h-.028a1.152 1.152 0 0 1-1.126-1.177l.399-17.515a5.64 5.64 0 0 0-1.579-4.049 5.642 5.642 0 0 0-3.973-1.76c-4.119-.06-5.511 4.41-5.84 5.792-1.118 4.69-2.7 15.293-.748 33.63 1.422 13.365 9.04 18.817 26.299 18.817 1.288 0 3.504-.034 5.283-.062 1.205-.02 2.21-.034 2.603-.034 3.413 0 7.367-.031 10.815-.258h.053l56.051-60.644V275.7h-15.43c-5.59 0-10.138-4.547-10.138-10.138 0-3.306 1.59-6.248 4.047-8.1-4.484-1.044-7.834-5.074-7.834-9.872 0-3.486 1.768-6.566 4.454-8.391-3.97-1.374-6.828-5.15-6.828-9.582 0-3.234 1.523-6.12 3.89-7.978-4.785-.81-8.439-4.983-8.439-9.994 0-5.59 4.548-10.139 10.138-10.139h20.784c1.056 0 2.093.163 3.09.485.735-.437 1.5-.827 2.267-1.156l-.001-106.868c-3.414-.552-6.028-3.52-6.028-7.087 0-3.96 3.22-7.18 7.18-7.18zm2.858 122.313c-.55.086-1.125.227-1.706.414v.056l-.166-.002c-3.075 1.034-6.298 3.317-7.286 5.338l-7.54 17.37c-1.72 3.963.104 8.586 4.066 10.306 1.91.83 4.038.862 5.991.092a7.778 7.778 0 0 0 4.315-4.158l9.12-21.006a1.15 1.15 0 1 1 2.177.192l5.156 21.697a1.152 1.152 0 0 1-2.24.533l-4.358-18.331-7.742 17.833a10.054 10.054 0 0 1-5.057 5.16c5.11.513 9.112 4.84 9.112 10.084 0 4.072-2.413 7.59-5.884 9.202a10.141 10.141 0 0 1 5.058 8.77c0 3.153-1.446 5.974-3.71 7.835h10.194c10.22 0 18.537-15.934 18.537-35.52 0-18.526-8.05-33.802-18.72-35.533a43.469 43.469 0 0 0-1.566-.224c-.142.04-.295.051-.451.03-4.057-.54-5.83-.365-7.3-.138zm-7.122 55.715h-12.318c-4.32 0-7.835 3.516-7.835 7.835 0 4.32 3.515 7.835 7.835 7.835h12.318c4.32 0 7.835-3.515 7.835-7.835s-3.515-7.835-7.835-7.835zm.827-17.972h-16.932c-4.32 0-7.835 3.515-7.835 7.835s3.515 7.834 7.835 7.834h16.932c4.32 0 7.834-3.515 7.834-7.834 0-4.32-3.514-7.835-7.834-7.835zm-11.437-17.973l-7.869.001c-4.319 0-7.834 3.514-7.834 7.834s3.515 7.835 7.834 7.835h11.71c-4.89-2.339-7.096-8.169-4.92-13.18l1.08-2.49zm8.366-17.971h-20.784c-4.32 0-7.835 3.514-7.835 7.834s3.515 7.834 7.835 7.834h13.42l5.48-12.625c.526-1.076 1.382-2.101 2.428-3.023a7.2 7.2 0 0 0-.544-.02zm6.508-121.807a4.881 4.881 0 0 0-4.876 4.876 4.881 4.881 0 0 0 4.876 4.876 4.881 4.881 0 0 0 4.875-4.876 4.881 4.881 0 0 0-4.875-4.876z");
    			add_location(path2, file$9, 831, 8, 26144);
    			attr_dev(path3, "fill", "rgb(0, 158, 127)");
    			attr_dev(path3, "d", "M312.861 104.972v.851l-45.4 41.962 45.4 41.962v.851H198.024v-85.626h114.837zm-37.978-62.618a1.153 1.153 0 0 1-.05 1.628L240.03 76.663a1.151 1.151 0 0 1-1.629-.051 1.153 1.153 0 0 1 .05-1.629l34.802-32.68a1.153 1.153 0 0 1 1.629.05zM127.09 39.24l33.403 34.11a1.152 1.152 0 0 1-1.647 1.613l-33.402-34.11a1.152 1.152 0 0 1 1.646-1.613zm115.09-20.387c.578.265.832.95.568 1.527l-19.874 43.408a1.153 1.153 0 1 1-2.096-.96l19.874-43.407a1.153 1.153 0 0 1 1.528-.568zm-81.557-1.108l18.038 44.202a1.152 1.152 0 1 1-2.133.87L158.49 18.615a1.152 1.152 0 1 1 2.133-.87zM198.64 9.36c.636 0 1.152.515 1.152 1.152v47.741a1.152 1.152 0 1 1-2.304 0V10.512c0-.637.515-1.152 1.152-1.152z");
    			add_location(path3, file$9, 832, 8, 30057);
    			attr_dev(g, "fill", "none");
    			attr_dev(g, "fill-rule", "evenodd");
    			add_location(g, file$9, 828, 4, 24346);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "346");
    			attr_dev(svg, "height", "447");
    			attr_dev(svg, "viewBox", "0 0 346 447");
    			attr_dev(svg, "class", "svelte-bqqo2c");
    			add_location(svg, file$9, 827, 12, 24253);
    			attr_dev(div, "class", "c-mini-cart__illustration svelte-bqqo2c");
    			add_location(div, file$9, 826, 6, 24200);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);
    			append_dev(g, path3);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(824:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (582:4) {#if checkedOut}
    function create_if_block_2$3(ctx) {
    	let div7;
    	let div6;
    	let a;
    	let span1;
    	let span0;
    	let t1;
    	let div5;
    	let h2;
    	let span3;
    	let span2;
    	let t3;
    	let p0;
    	let span6;
    	let span4;
    	let t5;
    	let span5;
    	let t7;
    	let div4;
    	let div0;
    	let p1;
    	let span8;
    	let span7;
    	let t9;
    	let p2;
    	let span10;
    	let span9;
    	let t11;
    	let div1;
    	let p3;
    	let span12;
    	let span11;
    	let t13;
    	let p4;
    	let span14;
    	let span13;
    	let t15;
    	let div2;
    	let p5;
    	let span16;
    	let span15;
    	let t17;
    	let p6;
    	let span18;
    	let span17;
    	let t19;
    	let div3;
    	let p7;
    	let span20;
    	let span19;
    	let t21;
    	let p8;
    	let span22;
    	let span21;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			a = element("a");
    			span1 = element("span");
    			span0 = element("span");
    			span0.textContent = "De vuelta a casa";
    			t1 = space();
    			div5 = element("div");
    			h2 = element("h2");
    			span3 = element("span");
    			span2 = element("span");
    			span2.textContent = "orden recibida";
    			t3 = space();
    			p0 = element("p");
    			span6 = element("span");
    			span4 = element("span");
    			span4.textContent = "Gracias.";
    			t5 = space();
    			span5 = element("span");
    			span5.textContent = "Tu orden ha sido recibida";
    			t7 = space();
    			div4 = element("div");
    			div0 = element("div");
    			p1 = element("p");
    			span8 = element("span");
    			span7 = element("span");
    			span7.textContent = "Número de orden";
    			t9 = space();
    			p2 = element("p");
    			span10 = element("span");
    			span9 = element("span");
    			span9.textContent = "1444";
    			t11 = space();
    			div1 = element("div");
    			p3 = element("p");
    			span12 = element("span");
    			span11 = element("span");
    			span11.textContent = "Fecha";
    			t13 = space();
    			p4 = element("p");
    			span14 = element("span");
    			span13 = element("span");
    			span13.textContent = "14 de marzo de 2019";
    			t15 = space();
    			div2 = element("div");
    			p5 = element("p");
    			span16 = element("span");
    			span15 = element("span");
    			span15.textContent = "Total";
    			t17 = space();
    			p6 = element("p");
    			span18 = element("span");
    			span17 = element("span");
    			span17.textContent = "$ 10,944.00";
    			t19 = space();
    			div3 = element("div");
    			p7 = element("p");
    			span20 = element("span");
    			span19 = element("span");
    			span19.textContent = "Método de pago";
    			t21 = space();
    			p8 = element("p");
    			span22 = element("span");
    			span21 = element("span");
    			span21.textContent = "Contra reembolso";
    			set_style(span0, "vertical-align", "inherit");
    			add_location(span0, file$9, 587, 14, 12725);
    			set_style(span1, "vertical-align", "inherit");
    			add_location(span1, file$9, 586, 12, 12670);
    			attr_dev(a, "class", "home-btn svelte-bqqo2c");
    			attr_dev(a, "href", "/");
    			add_location(a, file$9, 585, 10, 12627);
    			set_style(span2, "vertical-align", "inherit");
    			add_location(span2, file$9, 593, 16, 13049);
    			set_style(span3, "vertical-align", "inherit");
    			add_location(span3, file$9, 592, 14, 12992);
    			attr_dev(h2, "class", "OrderReceivedstyle__BlockTitle-sc-1c48wfp-5 foYIyC svelte-bqqo2c");
    			add_location(h2, file$9, 591, 12, 12913);
    			set_style(span4, "vertical-align", "inherit");
    			add_location(span4, file$9, 598, 16, 13294);
    			set_style(span5, "vertical-align", "inherit");
    			add_location(span5, file$9, 599, 16, 13366);
    			set_style(span6, "vertical-align", "inherit");
    			add_location(span6, file$9, 597, 14, 13237);
    			attr_dev(p0, "class", "OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp svelte-bqqo2c");
    			add_location(p0, file$9, 596, 12, 13165);
    			set_style(span7, "vertical-align", "inherit");
    			add_location(span7, file$9, 609, 20, 13854);
    			set_style(span8, "vertical-align", "inherit");
    			add_location(span8, file$9, 608, 18, 13793);
    			attr_dev(p1, "class", "OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC title svelte-bqqo2c");
    			add_location(p1, file$9, 607, 16, 13711);
    			set_style(span9, "vertical-align", "inherit");
    			add_location(span9, file$9, 616, 20, 14165);
    			set_style(span10, "vertical-align", "inherit");
    			add_location(span10, file$9, 615, 18, 14104);
    			attr_dev(p2, "class", "OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp svelte-bqqo2c");
    			add_location(p2, file$9, 614, 16, 14028);
    			attr_dev(div0, "class", "OrderReceivedstyle__InfoBlock-sc-1c48wfp-8 Fmmyl svelte-bqqo2c");
    			add_location(div0, file$9, 606, 14, 13631);
    			set_style(span11, "vertical-align", "inherit");
    			add_location(span11, file$9, 623, 20, 14525);
    			set_style(span12, "vertical-align", "inherit");
    			add_location(span12, file$9, 622, 18, 14464);
    			attr_dev(p3, "class", "OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC title svelte-bqqo2c");
    			add_location(p3, file$9, 621, 16, 14382);
    			set_style(span13, "vertical-align", "inherit");
    			add_location(span13, file$9, 628, 20, 14780);
    			set_style(span14, "vertical-align", "inherit");
    			add_location(span14, file$9, 627, 18, 14719);
    			attr_dev(p4, "class", "OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp svelte-bqqo2c");
    			add_location(p4, file$9, 626, 16, 14643);
    			attr_dev(div1, "class", "OrderReceivedstyle__InfoBlock-sc-1c48wfp-8 Fmmyl svelte-bqqo2c");
    			add_location(div1, file$9, 620, 14, 14302);
    			set_style(span15, "vertical-align", "inherit");
    			add_location(span15, file$9, 637, 20, 15201);
    			set_style(span16, "vertical-align", "inherit");
    			add_location(span16, file$9, 636, 18, 15140);
    			attr_dev(p5, "class", "OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC title svelte-bqqo2c");
    			add_location(p5, file$9, 635, 16, 15058);
    			set_style(span17, "vertical-align", "inherit");
    			add_location(span17, file$9, 642, 20, 15456);
    			set_style(span18, "vertical-align", "inherit");
    			add_location(span18, file$9, 641, 18, 15395);
    			attr_dev(p6, "class", "OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp svelte-bqqo2c");
    			add_location(p6, file$9, 640, 16, 15319);
    			attr_dev(div2, "class", "OrderReceivedstyle__InfoBlock-sc-1c48wfp-8 Fmmyl svelte-bqqo2c");
    			add_location(div2, file$9, 634, 14, 14978);
    			set_style(span19, "vertical-align", "inherit");
    			add_location(span19, file$9, 649, 20, 15823);
    			set_style(span20, "vertical-align", "inherit");
    			add_location(span20, file$9, 648, 18, 15762);
    			attr_dev(p7, "class", "OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC title svelte-bqqo2c");
    			add_location(p7, file$9, 647, 16, 15680);
    			set_style(span21, "vertical-align", "inherit");
    			add_location(span21, file$9, 654, 20, 16087);
    			set_style(span22, "vertical-align", "inherit");
    			add_location(span22, file$9, 653, 18, 16026);
    			attr_dev(p8, "class", "OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp svelte-bqqo2c");
    			add_location(p8, file$9, 652, 16, 15950);
    			attr_dev(div3, "class", "OrderReceivedstyle__InfoBlock-sc-1c48wfp-8 Fmmyl svelte-bqqo2c");
    			add_location(div3, file$9, 646, 14, 15600);
    			attr_dev(div4, "class", "OrderReceivedstyle__InfoBlockWrapper-sc-1c48wfp-7 iYeVqc svelte-bqqo2c");
    			add_location(div4, file$9, 604, 12, 13530);
    			attr_dev(div5, "class", "OrderReceivedstyle__OrderInfo-sc-1c48wfp-2 hHIjuJ svelte-bqqo2c");
    			add_location(div5, file$9, 590, 10, 12836);
    			attr_dev(div6, "class", "OrderReceivedstyle__OrderRecivedContainer-sc-1c48wfp-1 jVIgkG svelte-bqqo2c");
    			add_location(div6, file$9, 583, 8, 12529);
    			attr_dev(div7, "class", "OrderReceivedstyle__OrderRecivedWrapper-sc-1c48wfp-0 iDOcsn svelte-bqqo2c");
    			add_location(div7, file$9, 582, 6, 12446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, a);
    			append_dev(a, span1);
    			append_dev(span1, span0);
    			append_dev(div6, t1);
    			append_dev(div6, div5);
    			append_dev(div5, h2);
    			append_dev(h2, span3);
    			append_dev(span3, span2);
    			append_dev(div5, t3);
    			append_dev(div5, p0);
    			append_dev(p0, span6);
    			append_dev(span6, span4);
    			append_dev(span6, t5);
    			append_dev(span6, span5);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, p1);
    			append_dev(p1, span8);
    			append_dev(span8, span7);
    			append_dev(div0, t9);
    			append_dev(div0, p2);
    			append_dev(p2, span10);
    			append_dev(span10, span9);
    			append_dev(div4, t11);
    			append_dev(div4, div1);
    			append_dev(div1, p3);
    			append_dev(p3, span12);
    			append_dev(span12, span11);
    			append_dev(div1, t13);
    			append_dev(div1, p4);
    			append_dev(p4, span14);
    			append_dev(span14, span13);
    			append_dev(div4, t15);
    			append_dev(div4, div2);
    			append_dev(div2, p5);
    			append_dev(p5, span16);
    			append_dev(span16, span15);
    			append_dev(div2, t17);
    			append_dev(div2, p6);
    			append_dev(p6, span18);
    			append_dev(span18, span17);
    			append_dev(div4, t19);
    			append_dev(div4, div3);
    			append_dev(div3, p7);
    			append_dev(p7, span20);
    			append_dev(span20, span19);
    			append_dev(div3, t21);
    			append_dev(div3, p8);
    			append_dev(p8, span22);
    			append_dev(span22, span21);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(582:4) {#if checkedOut}",
    		ctx
    	});

    	return block;
    }

    // (858:0) {#if visible}
    function create_if_block$5(ctx) {
    	let div22;
    	let div21;
    	let div3;
    	let form;
    	let div0;
    	let t1;
    	let div1;
    	let input;
    	let t2;
    	let div2;
    	let t4;
    	let button;
    	let span0;
    	let t6;
    	let div20;
    	let div19;
    	let div18;
    	let div17;
    	let h3;
    	let span2;
    	let span1;
    	let t8;
    	let div11;
    	let div6;
    	let div5;
    	let div4;
    	let span5;
    	let span4;
    	let span3;
    	let t10;
    	let span8;
    	let span7;
    	let span6;
    	let t12;
    	let span14;
    	let span10;
    	let span9;
    	let t14;
    	let span13;
    	let span11;
    	let t16;
    	let span12;
    	let t18;
    	let span19;
    	let span16;
    	let span15;
    	let t20;
    	let span18;
    	let span17;
    	let t22;
    	let div8;
    	let div7;
    	let t23;
    	let div10;
    	let div9;
    	let t24;
    	let div16;
    	let div12;
    	let span22;
    	let span21;
    	let span20;
    	let t26;
    	let span27;
    	let span24;
    	let span23;
    	let t28;
    	let span26;
    	let span25;
    	let t30;
    	let div13;
    	let span30;
    	let span29;
    	let span28;
    	let t32;
    	let span35;
    	let span32;
    	let span31;
    	let t34;
    	let span34;
    	let span33;
    	let t36;
    	let div14;
    	let span38;
    	let span37;
    	let span36;
    	let t38;
    	let span43;
    	let span40;
    	let span39;
    	let t40;
    	let span42;
    	let span41;
    	let t42;
    	let div15;
    	let span56;
    	let span51;
    	let span44;
    	let t44;
    	let span46;
    	let span45;
    	let t46;
    	let span48;
    	let span47;
    	let t48;
    	let span50;
    	let span49;
    	let t50;
    	let span55;
    	let span52;
    	let t51;
    	let span53;
    	let t52;
    	let span54;
    	let t53;
    	let span61;
    	let span58;
    	let span57;
    	let t55;
    	let span60;
    	let span59;
    	let dispose;

    	const block = {
    		c: function create() {
    			div22 = element("div");
    			div21 = element("div");
    			div3 = element("div");
    			form = element("form");
    			div0 = element("div");
    			div0.textContent = "Add New Contact";
    			t1 = space();
    			div1 = element("div");
    			input = element("input");
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "Number is required";
    			t4 = space();
    			button = element("button");
    			span0 = element("span");
    			span0.textContent = "Save Contact";
    			t6 = space();
    			div20 = element("div");
    			div19 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			h3 = element("h3");
    			span2 = element("span");
    			span1 = element("span");
    			span1.textContent = "Su pedido";
    			t8 = space();
    			div11 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			span5 = element("span");
    			span4 = element("span");
    			span3 = element("span");
    			span3.textContent = "1";
    			t10 = space();
    			span8 = element("span");
    			span7 = element("span");
    			span6 = element("span");
    			span6.textContent = "X";
    			t12 = space();
    			span14 = element("span");
    			span10 = element("span");
    			span9 = element("span");
    			span9.textContent = "Arándanos";
    			t14 = space();
    			span13 = element("span");
    			span11 = element("span");
    			span11.textContent = "|";
    			t16 = space();
    			span12 = element("span");
    			span12.textContent = "1 libra";
    			t18 = space();
    			span19 = element("span");
    			span16 = element("span");
    			span15 = element("span");
    			span15.textContent = "$";
    			t20 = space();
    			span18 = element("span");
    			span17 = element("span");
    			span17.textContent = "7.20";
    			t22 = space();
    			div8 = element("div");
    			div7 = element("div");
    			t23 = space();
    			div10 = element("div");
    			div9 = element("div");
    			t24 = space();
    			div16 = element("div");
    			div12 = element("div");
    			span22 = element("span");
    			span21 = element("span");
    			span20 = element("span");
    			span20.textContent = "Subtotal";
    			t26 = space();
    			span27 = element("span");
    			span24 = element("span");
    			span23 = element("span");
    			span23.textContent = "$";
    			t28 = space();
    			span26 = element("span");
    			span25 = element("span");
    			span25.textContent = "10.20";
    			t30 = space();
    			div13 = element("div");
    			span30 = element("span");
    			span29 = element("span");
    			span28 = element("span");
    			span28.textContent = "Gastos de envío";
    			t32 = space();
    			span35 = element("span");
    			span32 = element("span");
    			span31 = element("span");
    			span31.textContent = "$";
    			t34 = space();
    			span34 = element("span");
    			span33 = element("span");
    			span33.textContent = "0.00";
    			t36 = space();
    			div14 = element("div");
    			span38 = element("span");
    			span37 = element("span");
    			span36 = element("span");
    			span36.textContent = "Descuento";
    			t38 = space();
    			span43 = element("span");
    			span40 = element("span");
    			span39 = element("span");
    			span39.textContent = "$";
    			t40 = space();
    			span42 = element("span");
    			span41 = element("span");
    			span41.textContent = "0.00";
    			t42 = space();
    			div15 = element("div");
    			span56 = element("span");
    			span51 = element("span");
    			span44 = element("span");
    			span44.textContent = "Total";
    			t44 = space();
    			span46 = element("span");
    			span45 = element("span");
    			span45.textContent = "(";
    			t46 = space();
    			span48 = element("span");
    			span47 = element("span");
    			span47.textContent = "IVA incluido";
    			t48 = space();
    			span50 = element("span");
    			span49 = element("span");
    			span49.textContent = ")";
    			t50 = space();
    			span55 = element("span");
    			span52 = element("span");
    			t51 = space();
    			span53 = element("span");
    			t52 = space();
    			span54 = element("span");
    			t53 = space();
    			span61 = element("span");
    			span58 = element("span");
    			span57 = element("span");
    			span57.textContent = "$";
    			t55 = space();
    			span60 = element("span");
    			span59 = element("span");
    			span59.textContent = "10.20";
    			attr_dev(div0, "class", "Updatestyle__Heading-sc-1hcedug-1 hDejwL svelte-bqqo2c");
    			add_location(div0, file$9, 866, 10, 31850);
    			attr_dev(input, "class", "UpdateContact__StyledInput-sc-196y1x0-0 jFvJIE form-control svelte-bqqo2c");
    			attr_dev(input, "placeholder", "Enter a phone number");
    			attr_dev(input, "id", "my-input-id");
    			attr_dev(input, "name", "number");
    			input.value = "";
    			add_location(input, file$9, 870, 12, 32036);
    			attr_dev(div1, "class", "Updatestyle__FieldWrapper-sc-1hcedug-0 deGZNA svelte-bqqo2c");
    			add_location(div1, file$9, 869, 10, 31963);
    			attr_dev(div2, "class", "UpdateContact__StyledError-sc-196y1x0-1 hYIhzj svelte-bqqo2c");
    			add_location(div2, file$9, 877, 10, 32293);
    			attr_dev(span0, "class", "btn-text svelte-bqqo2c");
    			add_location(span0, file$9, 884, 12, 32582);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "Buttonstyle__ButtonStyle-voymor-0 dYRvKF reusecore__button svelte-bqqo2c");
    			add_location(button, file$9, 880, 10, 32415);
    			attr_dev(form, "action", "#");
    			add_location(form, file$9, 865, 8, 31821);
    			attr_dev(div3, "class", "innerRndComponent");
    			add_location(div3, file$9, 864, 6, 31780);
    			set_style(span1, "vertical-align", "inherit");
    			add_location(span1, file$9, 899, 18, 33235);
    			set_style(span2, "vertical-align", "inherit");
    			add_location(span2, file$9, 898, 16, 33176);
    			attr_dev(h3, "class", "CheckoutWithSidebarstyle__Title-sc-1fbaxpu-22 ihJQyq svelte-bqqo2c");
    			add_location(h3, file$9, 897, 14, 33093);
    			set_style(span3, "vertical-align", "inherit");
    			add_location(span3, file$9, 919, 26, 34255);
    			set_style(span4, "vertical-align", "inherit");
    			add_location(span4, file$9, 918, 24, 34188);
    			attr_dev(span5, "class", "CheckoutWithSidebarstyle__Quantity-sc-1fbaxpu-26\r\n                        dwZrDQ svelte-bqqo2c");
    			add_location(span5, file$9, 915, 22, 34042);
    			set_style(span6, "vertical-align", "inherit");
    			add_location(span6, file$9, 926, 26, 34605);
    			set_style(span7, "vertical-align", "inherit");
    			add_location(span7, file$9, 925, 24, 34538);
    			attr_dev(span8, "class", "CheckoutWithSidebarstyle__Multiplier-sc-1fbaxpu-27\r\n                        bYcxrK svelte-bqqo2c");
    			add_location(span8, file$9, 922, 22, 34390);
    			set_style(span9, "vertical-align", "inherit");
    			add_location(span9, file$9, 933, 26, 34953);
    			set_style(span10, "vertical-align", "inherit");
    			add_location(span10, file$9, 932, 24, 34886);
    			set_style(span11, "vertical-align", "inherit");
    			add_location(span11, file$9, 938, 26, 35192);
    			set_style(span12, "vertical-align", "inherit");
    			add_location(span12, file$9, 939, 26, 35267);
    			set_style(span13, "vertical-align", "inherit");
    			add_location(span13, file$9, 937, 24, 35125);
    			attr_dev(span14, "class", "CheckoutWithSidebarstyle__ItemInfo-sc-1fbaxpu-28\r\n                        jsCFpB svelte-bqqo2c");
    			add_location(span14, file$9, 929, 22, 34740);
    			set_style(span15, "vertical-align", "inherit");
    			add_location(span15, file$9, 946, 26, 35618);
    			set_style(span16, "vertical-align", "inherit");
    			add_location(span16, file$9, 945, 24, 35551);
    			set_style(span17, "vertical-align", "inherit");
    			add_location(span17, file$9, 949, 26, 35791);
    			set_style(span18, "vertical-align", "inherit");
    			add_location(span18, file$9, 948, 24, 35724);
    			attr_dev(span19, "class", "CheckoutWithSidebarstyle__Price-sc-1fbaxpu-29\r\n                        gCXrSa svelte-bqqo2c");
    			add_location(span19, file$9, 942, 22, 35408);
    			attr_dev(div4, "class", "CheckoutWithSidebarstyle__Items-sc-1fbaxpu-25\r\n                      cSMtnt svelte-bqqo2c");
    			add_location(div4, file$9, 912, 20, 33906);
    			attr_dev(div5, "class", "CheckoutWithSidebarstyle__ItemsWrapper-sc-1fbaxpu-23\r\n                    bJvjJg svelte-bqqo2c");
    			add_location(div5, file$9, 909, 18, 33769);
    			set_style(div6, "position", "relative");
    			set_style(div6, "overflow", "scroll");
    			set_style(div6, "margin-bottom", "-17px");
    			set_style(div6, "min-height", "17px");
    			set_style(div6, "max-height", "calc(407px)");
    			set_style(div6, "margin-left", "0px");
    			set_style(div6, "padding-left", "0px");
    			set_style(div6, "padding-right", "15px");
    			add_location(div6, file$9, 905, 16, 33518);
    			set_style(div7, "position", "relative");
    			set_style(div7, "display", "block");
    			set_style(div7, "height", "100%");
    			set_style(div7, "cursor", "pointer");
    			set_style(div7, "border-radius", "inherit");
    			set_style(div7, "background-color", "rgba(0, 0, 0, 0.2)");
    			set_style(div7, "width", "0px");
    			add_location(div7, file$9, 959, 18, 36244);
    			set_style(div8, "position", "absolute");
    			set_style(div8, "height", "6px");
    			set_style(div8, "transition", "opacity\r\n                  200ms ease 0s");
    			set_style(div8, "opacity", "0");
    			set_style(div8, "right", "2px");
    			set_style(div8, "bottom", "2px");
    			set_style(div8, "left", "2px");
    			set_style(div8, "border-radius", "3px");
    			add_location(div8, file$9, 955, 16, 36018);
    			set_style(div9, "position", "relative");
    			set_style(div9, "display", "block");
    			set_style(div9, "width", "100%");
    			set_style(div9, "cursor", "pointer");
    			set_style(div9, "border-radius", "inherit");
    			set_style(div9, "background-color", "rgba(0, 0, 0, 0.2)");
    			set_style(div9, "height", "0px");
    			add_location(div9, file$9, 968, 18, 36729);
    			set_style(div10, "position", "absolute");
    			set_style(div10, "width", "6px");
    			set_style(div10, "transition", "opacity\r\n                  200ms ease 0s");
    			set_style(div10, "opacity", "0");
    			set_style(div10, "right", "2px");
    			set_style(div10, "bottom", "2px");
    			set_style(div10, "top", "2px");
    			set_style(div10, "border-radius", "3px");
    			add_location(div10, file$9, 964, 16, 36505);
    			set_style(div11, "position", "relative");
    			set_style(div11, "overflow", "hidden");
    			set_style(div11, "width", "100%");
    			set_style(div11, "height", "auto");
    			set_style(div11, "min-height", "0px");
    			set_style(div11, "max-height", "390px");
    			add_location(div11, file$9, 902, 14, 33352);
    			set_style(span20, "vertical-align", "inherit");
    			add_location(span20, file$9, 983, 22, 37443);
    			set_style(span21, "vertical-align", "inherit");
    			add_location(span21, file$9, 982, 20, 37380);
    			attr_dev(span22, "class", "CheckoutWithSidebarstyle__Text-sc-1fbaxpu-31 jIRiMb svelte-bqqo2c");
    			add_location(span22, file$9, 980, 18, 37271);
    			set_style(span23, "vertical-align", "inherit");
    			add_location(span23, file$9, 989, 22, 37745);
    			set_style(span24, "vertical-align", "inherit");
    			add_location(span24, file$9, 988, 20, 37682);
    			set_style(span25, "vertical-align", "inherit");
    			add_location(span25, file$9, 992, 22, 37906);
    			set_style(span26, "vertical-align", "inherit");
    			add_location(span26, file$9, 991, 20, 37843);
    			attr_dev(span27, "class", "CheckoutWithSidebarstyle__Text-sc-1fbaxpu-31 jIRiMb svelte-bqqo2c");
    			add_location(span27, file$9, 986, 18, 37573);
    			attr_dev(div12, "class", "CheckoutWithSidebarstyle__TextWrapper-sc-1fbaxpu-30\r\n                  bMlMJp svelte-bqqo2c");
    			add_location(div12, file$9, 977, 16, 37141);
    			set_style(span28, "vertical-align", "inherit");
    			add_location(span28, file$9, 1002, 22, 38357);
    			set_style(span29, "vertical-align", "inherit");
    			add_location(span29, file$9, 1001, 20, 38294);
    			attr_dev(span30, "class", "CheckoutWithSidebarstyle__Text-sc-1fbaxpu-31 jIRiMb svelte-bqqo2c");
    			add_location(span30, file$9, 999, 18, 38185);
    			set_style(span31, "vertical-align", "inherit");
    			add_location(span31, file$9, 1010, 22, 38716);
    			set_style(span32, "vertical-align", "inherit");
    			add_location(span32, file$9, 1009, 20, 38653);
    			set_style(span33, "vertical-align", "inherit");
    			add_location(span33, file$9, 1013, 22, 38877);
    			set_style(span34, "vertical-align", "inherit");
    			add_location(span34, file$9, 1012, 20, 38814);
    			attr_dev(span35, "class", "CheckoutWithSidebarstyle__Text-sc-1fbaxpu-31 jIRiMb svelte-bqqo2c");
    			add_location(span35, file$9, 1007, 18, 38544);
    			attr_dev(div13, "class", "CheckoutWithSidebarstyle__TextWrapper-sc-1fbaxpu-30\r\n                  bMlMJp svelte-bqqo2c");
    			add_location(div13, file$9, 996, 16, 38055);
    			set_style(span36, "vertical-align", "inherit");
    			add_location(span36, file$9, 1023, 22, 39327);
    			set_style(span37, "vertical-align", "inherit");
    			add_location(span37, file$9, 1022, 20, 39264);
    			attr_dev(span38, "class", "CheckoutWithSidebarstyle__Text-sc-1fbaxpu-31 jIRiMb svelte-bqqo2c");
    			add_location(span38, file$9, 1020, 18, 39155);
    			set_style(span39, "vertical-align", "inherit");
    			add_location(span39, file$9, 1029, 22, 39630);
    			set_style(span40, "vertical-align", "inherit");
    			add_location(span40, file$9, 1028, 20, 39567);
    			set_style(span41, "vertical-align", "inherit");
    			add_location(span41, file$9, 1032, 22, 39791);
    			set_style(span42, "vertical-align", "inherit");
    			add_location(span42, file$9, 1031, 20, 39728);
    			attr_dev(span43, "class", "CheckoutWithSidebarstyle__Text-sc-1fbaxpu-31 jIRiMb svelte-bqqo2c");
    			add_location(span43, file$9, 1026, 18, 39458);
    			attr_dev(div14, "class", "CheckoutWithSidebarstyle__TextWrapper-sc-1fbaxpu-30\r\n                  bMlMJp svelte-bqqo2c");
    			add_location(div14, file$9, 1017, 16, 39025);
    			set_style(span44, "vertical-align", "inherit");
    			add_location(span44, file$9, 1043, 22, 40286);
    			set_style(span45, "vertical-align", "inherit");
    			add_location(span45, file$9, 1047, 24, 40504);
    			attr_dev(span46, "class", "CheckoutWithSidebarstyle__Small-sc-1fbaxpu-33\r\n                        fdQquj");
    			add_location(span46, file$9, 1044, 22, 40361);
    			set_style(span47, "vertical-align", "inherit");
    			add_location(span47, file$9, 1052, 24, 40749);
    			attr_dev(span48, "class", "CheckoutWithSidebarstyle__Small-sc-1fbaxpu-33\r\n                        fdQquj");
    			add_location(span48, file$9, 1049, 22, 40606);
    			set_style(span49, "vertical-align", "inherit");
    			add_location(span49, file$9, 1059, 24, 41059);
    			attr_dev(span50, "class", "CheckoutWithSidebarstyle__Small-sc-1fbaxpu-33\r\n                        fdQquj");
    			add_location(span50, file$9, 1056, 22, 40916);
    			set_style(span51, "vertical-align", "inherit");
    			add_location(span51, file$9, 1042, 20, 40223);
    			set_style(span52, "vertical-align", "inherit");
    			add_location(span52, file$9, 1065, 22, 41325);
    			set_style(span53, "vertical-align", "inherit");
    			add_location(span53, file$9, 1066, 22, 41390);
    			set_style(span54, "vertical-align", "inherit");
    			add_location(span54, file$9, 1067, 22, 41455);
    			attr_dev(span55, "class", "CheckoutWithSidebarstyle__Small-sc-1fbaxpu-33\r\n                      fdQquj");
    			add_location(span55, file$9, 1062, 20, 41188);
    			attr_dev(span56, "class", "CheckoutWithSidebarstyle__Bold-sc-1fbaxpu-32 bLZxHH");
    			add_location(span56, file$9, 1040, 18, 40114);
    			set_style(span57, "vertical-align", "inherit");
    			add_location(span57, file$9, 1073, 22, 41744);
    			set_style(span58, "vertical-align", "inherit");
    			add_location(span58, file$9, 1072, 20, 41681);
    			set_style(span59, "vertical-align", "inherit");
    			add_location(span59, file$9, 1076, 22, 41905);
    			set_style(span60, "vertical-align", "inherit");
    			add_location(span60, file$9, 1075, 20, 41842);
    			attr_dev(span61, "class", "CheckoutWithSidebarstyle__Bold-sc-1fbaxpu-32 bLZxHH");
    			add_location(span61, file$9, 1070, 18, 41572);
    			attr_dev(div15, "class", "CheckoutWithSidebarstyle__TextWrapper-sc-1fbaxpu-30\r\n                  bMlMJp svelte-bqqo2c");
    			set_style(div15, "margin-top", "20px");
    			add_location(div15, file$9, 1036, 16, 39939);
    			attr_dev(div16, "class", "CheckoutWithSidebarstyle__CalculationWrapper-sc-1fbaxpu-24\r\n                dPNmUJ svelte-bqqo2c");
    			add_location(div16, file$9, 974, 14, 37010);
    			attr_dev(div17, "class", "CheckoutWithSidebarstyle__OrderInfo-sc-1fbaxpu-21 iuZybX svelte-bqqo2c");
    			add_location(div17, file$9, 895, 12, 32992);
    			attr_dev(div18, "class", "sticky-inner-wrapper ");
    			set_style(div18, "position", "relative");
    			set_style(div18, "z-index", "999");
    			set_style(div18, "transform", "translate3d(0px,\r\n            0px, 0px)");
    			add_location(div18, file$9, 891, 10, 32823);
    			attr_dev(div19, "class", "sticky-outer-wrapper");
    			add_location(div19, file$9, 890, 8, 32768);
    			attr_dev(div20, "class", "CheckoutWithSidebarstyle__CartWrapper-sc-1fbaxpu-20 evBiYl");
    			add_location(div20, file$9, 889, 6, 32686);
    			attr_dev(div21, "class", "reuseModalHolder add-address-modal svelte-bqqo2c");
    			set_style(div21, "max-width", "320px");
    			set_style(div21, "max-height", "813px");
    			set_style(div21, "width", "360px");
    			set_style(div21, "height", "auto");
    			set_style(div21, "position", "absolute");
    			set_style(div21, "left", "0px");
    			set_style(div21, "top", "70px");
    			set_style(div21, "opacity", "1");
    			set_style(div21, "transform", "scale3d(1, 1, 1)");
    			set_style(div21, "margin-left", "5.5%");
    			set_style(div21, "display", "block");
    			add_location(div21, file$9, 859, 4, 31505);
    			attr_dev(div22, "class", "reuseModalParentWrapper svelte-bqqo2c");
    			add_location(div22, file$9, 858, 2, 31462);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div22, anchor);
    			append_dev(div22, div21);
    			append_dev(div21, div3);
    			append_dev(div3, form);
    			append_dev(form, div0);
    			append_dev(form, t1);
    			append_dev(form, div1);
    			append_dev(div1, input);
    			append_dev(form, t2);
    			append_dev(form, div2);
    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(button, span0);
    			append_dev(div21, t6);
    			append_dev(div21, div20);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, div17);
    			append_dev(div17, h3);
    			append_dev(h3, span2);
    			append_dev(span2, span1);
    			append_dev(div17, t8);
    			append_dev(div17, div11);
    			append_dev(div11, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, span5);
    			append_dev(span5, span4);
    			append_dev(span4, span3);
    			append_dev(div4, t10);
    			append_dev(div4, span8);
    			append_dev(span8, span7);
    			append_dev(span7, span6);
    			append_dev(div4, t12);
    			append_dev(div4, span14);
    			append_dev(span14, span10);
    			append_dev(span10, span9);
    			append_dev(span14, t14);
    			append_dev(span14, span13);
    			append_dev(span13, span11);
    			append_dev(span13, t16);
    			append_dev(span13, span12);
    			append_dev(div4, t18);
    			append_dev(div4, span19);
    			append_dev(span19, span16);
    			append_dev(span16, span15);
    			append_dev(span19, t20);
    			append_dev(span19, span18);
    			append_dev(span18, span17);
    			append_dev(div11, t22);
    			append_dev(div11, div8);
    			append_dev(div8, div7);
    			append_dev(div11, t23);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div17, t24);
    			append_dev(div17, div16);
    			append_dev(div16, div12);
    			append_dev(div12, span22);
    			append_dev(span22, span21);
    			append_dev(span21, span20);
    			append_dev(div12, t26);
    			append_dev(div12, span27);
    			append_dev(span27, span24);
    			append_dev(span24, span23);
    			append_dev(span27, t28);
    			append_dev(span27, span26);
    			append_dev(span26, span25);
    			append_dev(div16, t30);
    			append_dev(div16, div13);
    			append_dev(div13, span30);
    			append_dev(span30, span29);
    			append_dev(span29, span28);
    			append_dev(div13, t32);
    			append_dev(div13, span35);
    			append_dev(span35, span32);
    			append_dev(span32, span31);
    			append_dev(span35, t34);
    			append_dev(span35, span34);
    			append_dev(span34, span33);
    			append_dev(div16, t36);
    			append_dev(div16, div14);
    			append_dev(div14, span38);
    			append_dev(span38, span37);
    			append_dev(span37, span36);
    			append_dev(div14, t38);
    			append_dev(div14, span43);
    			append_dev(span43, span40);
    			append_dev(span40, span39);
    			append_dev(span43, t40);
    			append_dev(span43, span42);
    			append_dev(span42, span41);
    			append_dev(div16, t42);
    			append_dev(div16, div15);
    			append_dev(div15, span56);
    			append_dev(span56, span51);
    			append_dev(span51, span44);
    			append_dev(span51, t44);
    			append_dev(span51, span46);
    			append_dev(span46, span45);
    			append_dev(span51, t46);
    			append_dev(span51, span48);
    			append_dev(span48, span47);
    			append_dev(span51, t48);
    			append_dev(span51, span50);
    			append_dev(span50, span49);
    			append_dev(span56, t50);
    			append_dev(span56, span55);
    			append_dev(span55, span52);
    			append_dev(span55, t51);
    			append_dev(span55, span53);
    			append_dev(span55, t52);
    			append_dev(span55, span54);
    			append_dev(div15, t53);
    			append_dev(div15, span61);
    			append_dev(span61, span58);
    			append_dev(span58, span57);
    			append_dev(span61, t55);
    			append_dev(span61, span60);
    			append_dev(span60, span59);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*cerrarvisible*/ ctx[4], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div22);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(858:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let if_block1_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$4, create_else_block_1$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*cartItems*/ ctx[1].length === 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*visible*/ ctx[2] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div, "class", "checkout-container svelte-bqqo2c");
    			add_location(div, file$9, 579, 0, 12352);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div, null);
    			}

    			if (/*visible*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
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
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let checkedOut = false;
    	let sumatotal = 0;
    	let cartItems = [];

    	const unsubscribe = cart.subscribe(items => {
    		$$invalidate(1, cartItems = Object.values(items));
    	});

    	const checkout = () => {
    		$$invalidate(0, checkedOut = true);

    		cart.update(n => {
    			return {};
    		});
    	};

    	const abrirvisible = () => {
    		$$invalidate(2, visible = true);
    	};

    	const cerrarvisible = () => {
    		$$invalidate(2, visible = false);
    		$$invalidate(0, checkedOut = true);

    		cart.update(n => {
    			return {};
    		});
    	};

    	let visible = false;
    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Checkout> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Checkout", $$slots, []);

    	$$self.$capture_state = () => ({
    		CheckoutItem,
    		cart,
    		get: get_store_value,
    		fly,
    		checkedOut,
    		sumatotal,
    		cartItems,
    		unsubscribe,
    		checkout,
    		abrirvisible,
    		cerrarvisible,
    		visible
    	});

    	$$self.$inject_state = $$props => {
    		if ("checkedOut" in $$props) $$invalidate(0, checkedOut = $$props.checkedOut);
    		if ("sumatotal" in $$props) sumatotal = $$props.sumatotal;
    		if ("cartItems" in $$props) $$invalidate(1, cartItems = $$props.cartItems);
    		if ("visible" in $$props) $$invalidate(2, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checkedOut, cartItems, visible, abrirvisible, cerrarvisible];
    }

    class Checkout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkout",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.20.1 */

    // (16:0) {:else}
    function create_else_block$5(ctx) {
    	let current;
    	const checkout = new Checkout({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(checkout.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(checkout, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(checkout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(16:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (14:0) {#if nav === 'home'}
    function create_if_block$6(ctx) {
    	let current;
    	const cardwrapper = new CardWrapper({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cardwrapper.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardwrapper, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardwrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardwrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardwrapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(14:0) {#if nav === 'home'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const navbar = new Navbar({ $$inline: true });
    	navbar.$on("nav", /*navHandler*/ ctx[1]);
    	const if_block_creators = [create_if_block$6, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*nav*/ ctx[0] === "home") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
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
    			transition_in(navbar.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let nav = "home";

    	function navHandler(event) {
    		$$invalidate(0, nav = event.detail.option);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		CardWrapper,
    		Navbar,
    		Checkout,
    		nav,
    		navHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("nav" in $$props) $$invalidate(0, nav = $$props.nav);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nav, navHandler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

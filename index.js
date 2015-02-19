'use strict';

/*
 * Dependencies.
 */

var mdast = require('wooorm/mdast@0.5.2');
var debounce = require('component/debounce@1.0.0');

/*
 * DOM elements.
 */

var $input = document.getElementsByTagName('textarea')[0];
var $output = document.getElementsByTagName('textarea')[1];
var $options = [].concat(
    [].slice.call(document.getElementsByTagName('input')),
    [].slice.call(document.getElementsByTagName('select'))
);

/*
 * Options.
 */

var options = {};

/*
 * Handlers.
 */

function onchange() {
    var ast = mdast.parse($input.value, options);

    $output.textContent = mdast.stringify(ast, options);
}

var debouncedChange = debounce(onchange, 200, true);

function ontextchange($target, name) {
    options[name] = $target.value;
}

function onnumberchange($target, name) {
    options[name] = Number($target.value);
}

function oncheckboxchange($target, name) {
    options[name] = $target.checked;
}

function onselectchange($target, name) {
    var $option = $target.selectedOptions[0];

    if (!$option) {
        return;
    }

    options[name] = $option.value;
}

function onsettingchange(event) {
    var $target = event.target;

    var type = $target.hasAttribute('type') ? $target.type : event.target.nodeName.toLowerCase();

    if (!(type in onsettingchange)) {
        type = 'text';
    }

    onsettingchange[type]($target, $target.name);

    if ($target.name === 'tables' && options[$target.name] && !options.gfm) {
        document.querySelector('[name="gfm"]').checked = true;
        options.gfm = true;
    }

    if ($target.name === 'gfm' && !options[$target.name] && options.tables) {
        document.querySelector('[name="tables"]').checked = false;
        options.tables = false;
    }

    debouncedChange();
}

onsettingchange.select = onselectchange;
onsettingchange.checkbox = oncheckboxchange;
onsettingchange.text = ontextchange;
onsettingchange.number = onnumberchange;

function onanychange(event) {
    if (event.target.hasAttribute('name')) {
        onsettingchange(event);
    }
}

/*
 * Listen.
 */

$input.addEventListener('input', debouncedChange);
window.addEventListener('change', onanychange);

/*
 * Initial answer.
 */

onchange();

$options.forEach(function ($node) {
    onsettingchange({
        'target': $node
    });
});

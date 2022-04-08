"use strict"; // avoid module leak

var exports = {};
var assert = exports;

if (true) {
    exports.assert = function (condition, message) {
        var found;
        if (!condition) {
            found = false;
            new Error().stack.split("\n").forEach(function (l) {
                if (found) {
                    throw (message || "Assertion failed") + l;
                }
                found = l.includes("assert.js");
            });
        }
    };
}

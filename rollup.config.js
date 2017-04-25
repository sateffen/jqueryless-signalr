/* global require, module*/
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const buble = require('rollup-plugin-buble');

module.exports = {
    entry: 'src/signalr.js',
    format: 'umd',
    dest: 'dist/jqueryless-signalr.js',
    moduleName: "SignalR",
    plugins: [
        nodeResolve(),
        commonjs({
            include: ['node_modules/**']
        }),
        buble()
    ]
};
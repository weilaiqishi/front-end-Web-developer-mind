'use strict';

const path = require('path');

module.exports = {
    entry: { index: path.join(__dirname, './src/index.js') },
    output: {
        path: path.join(__dirname),
        filename: 'main.js'
    }
};
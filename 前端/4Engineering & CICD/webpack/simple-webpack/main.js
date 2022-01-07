
            (function(modules) {
                function require(fileName) {
                    const fn = modules[fileName];
        
                    const module = { exports : {} };
        
                    fn(require, module, module.exports);
        
                    return module.exports;
                }

                require('index');
            })({'D:\mycode\front-end-Web-developer-mind\前端\4Engineering & CICD\webpack\simple-webpack\src\index.js': function (require, module, exports) { "use strict";

var _greeting = require("./greeting.js");

alert((0, _greeting.greeting)('Jane')); },'./greeting.js': function (require, module, exports) { "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.greeting = greeting;
function greeting(name) {
  return 'hello' + name;
} },})
        
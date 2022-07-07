const fn = (a, b) => {
    return a + b
}

function getFnBody (fn) {
    return fn.toString().match(/(?:\/\*[\s\S]*?\*\/|\/\/.*?\r?\n|[^{])+\{([\s\S]*)\}$/)[1]
}

function getFnArgs(fn) {
    let args = /\(\s*([^)]+?)\s*\)/.exec(fn.toString());
    if (args[1]) {
        args = args[1].split(/\s*,\s*/);
    }
    return args
}


const newFn = new Function(...getFnArgs(fn), 'my', getFnBody(fn))
console.log(newFn.toString())



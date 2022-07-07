function get(source, path, defaultValue = undefined) {
    // a[3].b -> a.3.b
    const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
    let result = source
    for(const p of paths) {
        result = Object(result)[p]
        if (result === undefined) {
            return defaultValue
        }
    }
    return result
}

console.log(get({ a: [{ b: 1 }]}, 'a[0].b'))
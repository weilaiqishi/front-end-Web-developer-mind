function countTag () {
    var all = document.getElementsByTagName('*')
    var tags = []
    for (var i = 0; i < all.length; i++) {
        tags.push(all[i].tagName.toLocaleLowerCase())

    }
    var res = {}
    for (var i = 0; i < tags.length; i++) {
        if (!res[tags[i]]) {
            res[tags[i]] = 1
        } else {
            res[tags[i]]++
        }
    }
    return res
}
// https://blog.csdn.net/qq_29187355/article/details/86443178
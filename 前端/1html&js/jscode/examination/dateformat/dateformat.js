function dateformat (format, date = new Date()) {
    // yyyy-MM-dd hh:mm:ss
    if (!(date instanceof Date)) throw new TypeError('date must be a Date')
    const timeObj = {
        yyyy: date.getFullYear(),
        MM: date.getMonth() + 1,
        dd: date.getDate(),
        hh: date.getHours(),
        mm: date.getMinutes(),
        ss: date.getSeconds(),
        SSS: date.getMilliseconds()
    }
    const padOptions = {
        MM: 2,
        dd: 2,
        hh: 2,
        mm: 2,
        ss: 2,
        SSS: 3
    }
    Object.keys(timeObj).forEach(key => {
        const option = padOptions[key]
        if (option) {
            timeObj[key] = String(timeObj[key]).padStart(option, '0')
        }
    })
    return format.replace()
}

dateformat()

// format(formatStr) {
//     if (!this.isValid()) return C.INVALID_DATE_STRING

//     const str = formatStr || C.FORMAT_DEFAULT
//     const zoneStr = Utils.z(this)
//     const locale = this.$locale()
//     const { $H, $m, $M } = this
//     const {
//         weekdays, months, meridiem
//     } = locale
//     const getShort = (arr, index, full, length) => (
//         (arr && (arr[index] || arr(this, str))) || full[index].substr(0, length)
//     )
//     const get$H = num => (
//         Utils.s($H % 12 || 12, num, '0')
//     )

//     const meridiemFunc = meridiem || ((hour, minute, isLowercase) => {
//         const m = (hour < 12 ? 'AM' : 'PM')
//         return isLowercase ? m.toLowerCase() : m
//     })

//     const matches = {
//         YY: String(this.$y).slice(-2),
//         YYYY: this.$y,
//         M: $M + 1,
//         MM: Utils.s($M + 1, 2, '0'),
//         MMM: getShort(locale.monthsShort, $M, months, 3),
//         MMMM: getShort(months, $M),
//         D: this.$D,
//         DD: Utils.s(this.$D, 2, '0'),
//         d: String(this.$W),
//         dd: getShort(locale.weekdaysMin, this.$W, weekdays, 2),
//         ddd: getShort(locale.weekdaysShort, this.$W, weekdays, 3),
//         dddd: weekdays[this.$W],
//         H: String($H),
//         HH: Utils.s($H, 2, '0'),
//         h: get$H(1),
//         hh: get$H(2),
//         a: meridiemFunc($H, $m, true),
//         A: meridiemFunc($H, $m, false),
//         m: String($m),
//         mm: Utils.s($m, 2, '0'),
//         s: String(this.$s),
//         ss: Utils.s(this.$s, 2, '0'),
//         SSS: Utils.s(this.$ms, 3, '0'),
//         Z: zoneStr // 'ZZ' logic below
//     }

//     return str.replace(C.REGEX_FORMAT, (match, $1) => $1 || matches[match] || zoneStr.replace(':', '')) // 'ZZ'
// }
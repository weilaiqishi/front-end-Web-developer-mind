let readline = require('readline')
let rl = readline.createInterface({ input: process.stdin, output: process.stdout })
let input = []

// ----
let lineNum = 1
// ----

rl.on('line', (line) => {
  input.push(line)
  if (input.length === lineNum) {

    // ----
    console.log(find(input[0]))
    // ----

    rl.close
  }
})

function sort (a, b) {
  if (a > b) {
    return 1
  } else if (a < b) {
    return -1
  } else {
    return 0
  }
}

function find (str) {
  const arr = str.split(',').map(i => parseInt(i))
  const isThree = []
  const noThree = []
  for (let i of arr) {
    i % 3 === 0 ? isThree.push(i) : noThree.push(i)
  }
  const addArr = []
  noThree.forEach(item => {
    const lastAddArr = [...addArr]
    lastAddArr.forEach(sum => {
      addArr.push(sum + item)
    })
    addArr.push(item)
  })
  const filterAddArr = addArr.filter(item => item % 3 === 0).sort(sort)
  const sum = filterAddArr.pop() || 0
  const goods = sum + isThree.reduce((acc, cur) => { return acc + cur }, 0)
  return goods / 3
}
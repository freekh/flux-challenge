
const test = require('asap')

test(() => {
  setTimeout(() => {
    test(() => {
      console.log('in timeout')
    }, 0)
  })
  console.log('first')
  test(() => {
    console.log('direct')
  })
  console.log('last')
})


class Scheduler {
  constructor(initState, ui) {
    this.state = initState
  }
  request(url, indexAtInit) {
    const doRequest = inRange(indexAtInit, this.state.index, slots.length) &&
      !(this.requests[indexAtInit] && this.requests[indexAtInit].status)
    if (doRequest) {
      const xhr = new XMLHttpRequest
      xhr.onload = (data) => {
        asap(() => this.slotUpdate(indexAtInit, data))
      }
      xhr.open(url)
      xhr.send()
      requests[indexAtInit] = xhr
    }
  }
}

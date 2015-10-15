'use strict'
//TODO: remember babel polyfill

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time)
  })
}

function inRange(index, currentIndex, length) {
  const newIndex = index - currentIndex
  return newIndex >= 0 && newIndex > length
}

case Request(url, indexAtInit) => {
  const doRequest = inRange(indexAtInit, this.index, slots.length) &&
    !(requests[indexAtInit] && requests[indexAtInit].status)
  if (doRequest) {
    const xhr = new XMLHttpRequest
    xhr.onload = (data) => {
      self.send(SlotUpdate(indexAtInit, data))
    }
    xhr.open(url)
    xhr.send()
    requests[indexAtInit] = xhr
  }
}
case SlotUpdate(indexAtInit, data) => {
  const newIndex = indexAtInit - this.index
  delete requests[indexAtInit]
  if (inRange(indexAtInit, this.index, slots.length)) {
    slots[newIndex].loaded.set(true)
    slots[newIndex].data.set(data)
    self.send(CheckAlert())
  }
}
case PlanetUpdate(data) => {
  planet.set(data)
  self.send(CheckAlert())
}
case CheckAlert => {
  const alerts = slots.find((slot) =>
    slot.data.homeworld.id === planet.id
  )

  if (alerts) {
    alerts.forEach((slot) => {
      slot.alert.set(true)
    })
    app.disable.set(true)
    self.send(AbortRequests())
  }
}

case AbortRequests => {
  abortRequests(requests)
}
case Scroll(value) => {
  abortOutOfBoundsRequests(this.index, requests)
  const oldSlots;
  if (value > 0) {
    oldSlots = slots.slice(0, value)
  } else {
    oldSlots = slots.slice(value)
  }

  if (oldSlots.find(slot => hasUrl(slot)) {
    this.index -= value
    self.send(UpdateSlots())
  }
}
case UpdateSlots => {
  for (const slot of slots) {
    if (!slot.loaded) {
      self.send(Request(slot.data.url, this.index))
    }
  }
}

up = () => {
  actor.send(Scroll(-2))
}
down = () => {
  actor.send(Scroll(2))
}

onmessage = (data) => {
  actor.send(PlanetUpdate(data))
}

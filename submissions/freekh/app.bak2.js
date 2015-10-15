'use strict'

const hg = require('mercury')
const { h } = hg

const Planet = () => {
  return hg.state({
    label: hg.value(''), //I suppose this is a bit crappy - can't use 'name'
    id: hg.value(0)
  })
}

Planet.render = (planetState) => {
  return h(
    'h1.css-planet-monitor',
    `Obi-Wan currently on ${planetState.label}`
  )
}

const Jedi = (item) => {
   item = item || {}

  return hg.varhash({
    id: hg.value(item.id || 0),
    url: hg.value(item.url || ''),
    label: hg.value(item.label || ''),
    master: hg.varhash(item.master || {
      id: hg.value(0),
      url: hg.value('')
    }),
    apprentice: hg.varhash(item.apprentice || {
      id: hg.value(0),
      url: hg.value('')
    })
  })
}

Jedi.render = (jedi) => {
  return h('h3', jedi.label )
}

const Slot = (index) => {
  return hg.varhash({
    index: hg.value(index),
    data: hg.varhash({}, Jedi)
  })
}

Slot.render = (slots, i) => {
  const slot = slots[i]
  if (!slot.data) {
    return h('li.css-slot')
  }
  return h('li.css-slot', [ hg.partial(Jedi.render, slot.data) ])
}

const Slots = () => {
  return hg.varhash([
    Slot(0), Slot(1), Slot(2), Slot(3), Slot(4)
  ])
}

Slots.render = (slots) => {
  return h(
    'ul.css-slots',
    Object.keys(slots)
      .sort()
      .map( i => hg.partial(Slot.render, slots, i) )
  )
}

const slotVisible = (slot, index, numberOfSlots) => {
  return slot.index() >= index &&
      slot.index() < index + numberOfSlots
}

const updateSlot = (slot, slots) => {

}

class Requests {
  constructor() {
    this.requests = {}
  }

  newRequest(slots, id, index) {

  }

  abortNonVisible(slots, index, numberOfSlots) {
    let remainingRequests = {}
    for (const slot of slots) {
      if (!slotVisible(slot, index, numberOfSlots)) {
        this.requests[slot.id].abort()
        delete this.requests[slot.id]
      }
    }
  }

  stopAll() {
    for (const request of requests) {
      this.request.abort()
    }
    this.requests = {}
  }
}

class Dispatcher {
  constructor(numberOfSlots, requests) {
    this.numberOfSlots = numberOfSlots;
    this.requests = requests
  }

  scroll(value, state) {
    
  }
}

const Scroll = (slots, requests) => {
  const numberOfSlots = slots.length
  const scroll = (value, state) => {
    const currentIndex = state.index()
    state.index.set(state.index() + value)
    for (const slot of slots) {
      slot.index.set(slot.index() + value)

    }
  }
  return hg.state({
    index: hg.value(slots()[0].index),
    channels: {
      up: (state) => scroll(-2, state)
      down: (state) => scroll(2, state)
    }
  })
}

Scroll.render = (state) => {
  return h('div.css-scroll-buttons', [
    h('button.css-button-up', {
      'ev-click': hg.send(state.channels.up)
    }),
    h('button.css-button-down', {
      'ev-click': hg.send(state.channels.down)
    })
  ])
}

const App = () => {
  const planet = Planet()
  const slots = Slots()
  const scroll = Scroll(slots)
  return hg.state({
    planet,
    slots,
    scroll
  })
}

App.render = function render(state) {
    return h('div.css-root', [
      Planet.render(state.planet),
      h('section.css-scrollable-list', [
        Slots.render(state.slots),
        Scroll.render(state.scroll)
      ])
    ]);
};

const container = () => {
  const appContainers = document.getElementsByClassName('app-container')
  return appContainers[0]
}

var app = App()

hg.app(container(), app, App.render);

const initialize = (app) => {
  // app.slots
  //   .values[0]
  //   .data
  //   .set({ url: 'http://localhost:3000/dark-jedis/3616' })
  // update(0, app.scroll, app.slots)
}

const ws = new WebSocket('ws://localhost:4000')
ws.onopen = ({data}) => {
  initialize(app)
}
ws.onmessage = ({data}) => {
  const planet = JSON.parse(data)
  app.planet.set({
    label: planet.name,
    id: planet.id
  })
}

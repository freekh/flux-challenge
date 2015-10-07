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
    id: hg.value(0),
    url: hg.value(item.url || ''),
    label: hg.value(''),
    master: hg.varhash({
      url: hg.value('')
    }),
    apprentice: hg.varhash({
      url: hg.value('')
    })
  })
}

Jedi.render = (jedi) => {
  return h('h3', jedi.label )
}

const Slot = () => {
  return hg.varhash({
    loaded: hg.value(false),
    data: hg.varhash({}, Jedi)
  })
}

Slot.render = (slots, i) => {
  const slot = slots.values[i]
  if (!slot.loaded) {
    return h('li.css-slot')
  }
  return h('li.css-slot', [ hg.partial(Jedi.render, slot.data) ])
}

const Slots = () => {
  return hg.varhash({
    values: hg.varhash([
      Slot(), Slot(), Slot(), Slot(), Slot()
    ]),
    channels: {
      move: (slots) => {
        console.log('proper move')
      }
    }
  })
}

Slots.render = (slots) => {
  return h(
    'ul.css-slots',
    Object.keys(slots.values)
      .sort()
      .map( i => hg.partial(Slot.render, slots, i) )
  )
}

let Requests = {}

const RequestData= (slot, slots) => {
  const xhr = new XMLHttpRequest()
  const url = slot.data().url

  xhr.onload = () => {
    const json = JSON.parse(xhr.responseText)
    console.log(json)
    const jedi = {
      url,
      id: json.id,
      label: json.name,
      master: {
        url: json.master.url
      },
      apprentice: {
        url: json.apprentice.url
      }
    }
    if (slot.data().url === url) {
      slot.data.set(jedi)
      slot.loaded.set(true)
    }
    fill(slots)
  }
  console.log('GET', url)
  xhr.open('GET', url)
  xhr.send()
  return xhr
}

const move = (value, slots) => {
  console.log('moving...', slots().values)
  const old = slots.values()
  if (value && value === -2) {
    slots.values[0].data.set(old[2].data)
    slots.values[1].data.set(old[3].data)
    slots.values[2].data.set(old[4].data)
    slots.values[3].loaded.set(false)
    slots.values[4].loaded.set(false)
  } else if (value && value === 2) {
    slots.values[2].data.set(old[0].data)
    slots.values[3].data.set(old[1].data)
    slots.values[4].data.set(old[2].data)
    slots.values[0].loaded.set(false)
    slots.values[1].loaded.set(false)
  }
  console.log('done', slots().values)
}

const hasUrl = (data) => {
  return data && data.url && data.url !== ''
}

const ReExecuteRequest = (i, slot, slots) => {
  if (Requests[i]) {
    Requests[i].abort()
  }
  Requests[i] = RequestData(slot, slots)
}

const fill = (slots) => {
  const values = slots().values

  for (let i of Object.keys(values)) {
    const slot = values[i]
    const data = slot.data
    if (!slot.loaded && hasUrl(data)) {
      ReExecuteRequest(i, slots.values[i], slots)
    }
  }

  const propagate = (i, url) => {
    const nextSlot = values[i]
    if (nextSlot &&
        !nextSlot.loaded) {
      slots.values[i].data.set({ url })
      ReExecuteRequest(i, slots.values[i], slots)
    }
  }

  for (let i of Object.keys(values)) {
    const slot = values[i]
    const data = slot.data
    if (hasUrl(data)) {
      if (data.master && data.master.url) {
        //TODO: parseInt is ugly:
        propagate(parseInt(i) + 1, data.master.url)
      }
      if (data.apprentice && data.apprentice.url) {
        propagate(parseInt(i) - 1, data.apprentice.url)
      }
    }
  }
}

const abortAllExcept = (start, end) => {

}

const update = (value, scroll, slots) => {
  scroll.index.set(scroll.index() + value)
  move(value, slots)
  fill(slots)
  abortAllExcept(scroll.index(), scroll.index() + slots.length)
}

const Scroll = (slots) => {
  return hg.state({
    index: hg.value(0),
    channels: {
      up: (state) => {
        update(-2, state, slots)
      },
      down: (state) => {
        update(2, state, slots)
      }
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

function App() {
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
  app.slots
    .values[0]
    .data
    .set({ url: 'http://localhost:3000/dark-jedis/3616' })
  update(0, app.scroll, app.slots)
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

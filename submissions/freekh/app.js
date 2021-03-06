'use strict'

const hg = require('mercury')
const { h } = hg
const asap = require('asap')

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
  return h('li.css-slot', [ hg.partial(Jedi.render, slot.data), h('span', String(slot.index)) ])
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
      // .map( i => h('li.css-slot', String(slots[i].index)) )
  )
}

class ScrollLogic {
  scroll(value) {
    this._scrollSlots(value)
    this.updateSlots()
  }
  _scrollSlots(value) {

  }
}


const update = ({url, id}, index, slots) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onload = (evt) => {
      if (xhr.status === 200 && xhr.readyState === 4) {
        Object.keys(slots()).forEach( i => {
          const slot = slots[i]
          if (slot.index() === index) {
            const data = JSON.parse(xhr.responseText)
            slot.data.set({id, url, label: data.name, master: data.master, apprentice: data.apprentice})
            resolve(data)
          }
        })
      } else {
        reject({message: 'Did not get a 200.', xhr: xhr})
      }
    }
    xhr.open('GET', url)
    xhr.send()
  })
}


const Scroll = (slots) => {
  return hg.state({
    index: hg.value(slots()[0].index),
    channels: {
      up: (state) => {
        const current = slots()
        if (current[0].data.id) {
          slots[0].index.set(slots[0].index() - 2)
          slots[1].index.set(slots[1].index() - 2)
          slots[2].index.set(slots[2].index() - 2)
          slots[3].index.set(slots[3].index() - 2)
          slots[4].index.set(slots[4].index() - 2)

          slots[0].data.set({})
          slots[1].data.set({})
          slots[2].data.set(current[0].data)
          slots[3].data.set(current[1].data)
          slots[4].data.set(current[2].data)


          const master = current[0].data.master
          if (master) {
            update(master, current[0].index - 1, slots).then(data => {
              if (data.master) {
                update(data.master, current[0].index - 2, slots)
              }
            })
          }
        }
        // const old = slots()
        // slots[0].data.set(old[2].data)
        // slots[1].data.set(old[3].data)
        // slots[2].data.set(old[4].data)
        // slots[3].data.set({})
        // slots[4].data.set({})
      },
      down: (state) => {
        Object.keys(slots()).forEach(i =>{
          slots[i].index.set(slots[i].index() - 2)
        })
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
  app.slots[0].data.set({url: 'http://localhost:3000/dark-jedis/3616', id: 3616})
  update({url: 'http://localhost:3000/dark-jedis/3616', id: 3616}, 0, app.slots)
  console.log('initialized')
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

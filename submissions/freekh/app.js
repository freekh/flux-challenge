'use strict'

const hg = require('mercury')
const { h } = hg

const Planet = () => {
  return hg.state({
    planetName: hg.value(''), //I suppose this is a bit crappy - can't use 'name'
    id: hg.value(0)
  })
}

Planet.render = (planetState) => {
  return h(
    'h1.css-planet-monitor',
    `Obi-Wan currently on ${planetState.planetName}`
  )
}

const JediData = (id) => {
  return hg.value({
    id: hg.value(0),
    jediName: hg.value(''),
    masterId: hg.value(0),
    apprenticeId: hg.value(0),
    homeworld: hg.state({
      id: hg.value(0),
      homeworldName: hg.value('')
    })
  })
}

const Jedi = (index, id, planet) => {
  return hg.state({
    index: hg.value(index),
    data: JediData(id)
  })
}

Jedi.render = (jediState) => {
  return h('li.css-slot', [
    h('h3', [String(jediState.index)]),
    h('h6', jediState.homeworld.homeworldName)
  ])
}

const Jedis = (planet) => {
  const totalSlots = 5
  const emptySlots = Array.apply(null, Array(totalSlots))
  const jedis = emptySlots.map((_, index) => {
    if (index === 0) {
      return Jedi(0, 3616, planet)
    } else {
      return Jedi(index, 0, planet)
    }
  })
  return hg.state({
    jedis: hg.array(jedis)
  })
}

Jedis.render = (jedisState) => {
  return h(
    'ul.css-slots',
    jedisState.jedis.map(Jedi.render)
  )
}

const Dispatcher = () => {

}

const Scroll = (jedisState) => {
  return hg.state({
    channels: {
      up: (state) => {
        jedisState.jedis.map(jedi => {
          jedi.index.set(jedi.index() - 2)
        })
      },
      down: (state) => {
      },
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
  const jedis = Jedis(planet)
  const scroll = Scroll(jedis)
  return hg.state({
    planet,
    jedis,
    scroll
  })
}

App.render = function render(state) {
    return h('div.css-root', [
      Planet.render(state.planet),
      h('section.css-scrollable-list', [
        Jedis.render(state.jedis),
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

const ws = new WebSocket('ws://localhost:4000')
ws.onopen = ({data}) => {
  console.log(data)
}
ws.onmessage = ({data}) => {
  const planet = JSON.parse(data)
  app.planet.set({
    planetName: planet.name,
    id: planet.id
  })
  console.log()
}

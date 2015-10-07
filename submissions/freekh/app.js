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

const Jedi = (url) => {
  return hg.state({
    loaded: hg.value(false),
    url: hg.value(url),
    label: hg.value(''),
    master: hg.state({
      url: hg.value('')
    })
  })
}

Jedi.render = (jediState) => {
  if (!jediState.loaded) {
    return h('li.css-slot')
  }
  
  return h('li.css-slot', [
    h('h3', [ jediState.label ]),
  ])
}

const Jedis = (planet) => {
  return hg.state({
    jedis: hg.array([ Jedi('http://localhost:3000/dark-jedis/3616') ])
  })
}

Jedis.render = (jedisState) => {
  return h(
    'ul.css-slots',
    jedisState.jedis.map(Jedi.render)
  )
}

let Requests = []

const Request = (jedi) => {
  const xhr = new XMLHttpRequest()
  xhr.onload = () => {
    const data = JSON.parse(xhr.responseText)
    console.log(data)
  }
  xhr.open('GET', jedi.url())
  xhr.send()
  return xhr
}

const Scroll = (jedisState) => {
  const index = hg.value(0)
  const removeStaleRequests = () => {

  }
  
  return hg.state({
    index,
    channels: {
      up: (state) => {
        Requests.push(Request(jedisState.jedis[0]))
      },
      down: (state) => {
        
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
  console.log('up and running')
}
ws.onmessage = ({data}) => {
  const planet = JSON.parse(data)
  app.planet.set({
    planetName: planet.name,
    id: planet.id
  })
  console.log()
}

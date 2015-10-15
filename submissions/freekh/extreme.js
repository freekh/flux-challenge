// 'use strict'
//
//
//
// function *actor(state, logic) {
//   while (true) {
//     yield (m) => {
//       logic[m.event](state, m.data)
//     }
//   }
// }
//
// const logic = () => {
//   updatePlanet: ({planet}, {id}) => {
//     planet.id = id
//     handler.next().value({event: 'checkPlanet', data: id})
//   },
//   checkPlanet: ({}) => {
//
//   }
// }
//
// const planet = {}
// const slots = {}
//
// const handler = actor(logic(planet, slots))
// const handle = (event, data) => {
//   handler.next().value(event, )
// }
//
//
// for (let i = 0; i < 100; i++) {
//   setTimeout(() => {
//     it.next().value({event: 'updatePlanet', data: {id: i}})
//   }, 500 - i)
// }
//
// function *actor() {
//   while (true) {
//     yield (m) => {
//       console.log(m)
//     }
//   }
// }
//
// const it = actor()
// console.log(it.next())
// console.log(it.next())
// console.log(it.next())
//
// setTimeout(() => {
//   console.log('hmm', it.next())
// }, 3000)

const assert = require('assert')


const State = () => {
  return {
    planet: {},
    slots: {},
    scroll: {}
  }
}

const jediLogic = {
  alert: ()
}

const PlanetLogic = (jediLogic) => {
  onUpdate: ({planet}, {id}) => {
    planet = { id }
    jedi.alert(state, {id})
  }
}

const logic = Object.assing([
  planetLogic(jediLogic),
  scrollLogic(jediLogic)
]

const Dispatch = (state, logic) => {
  return (message) => {
    logic[message.type](message)
  }
}

const dispatch = Dispatch(State(), Logic)

const load = (id) => {
  () => {
    update('/'+id, '/'+(id-1), '/'+(id+1))
  }
}

const complete = () => {
  
}

[
  load(100),
  move(2),
  load(99),
  load(101),
  move(2),
  move(2),
  move(-2)
].reduce(
  (prev, current, _, dispatch) => {
    return dispatch.next().value(current)
  }, dispatch)

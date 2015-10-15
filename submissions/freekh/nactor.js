'use strict'

const Request = {id} => message(this.name, {id})

const actor = Actor(initState)(self => {
  Request: {id} => {

  }
})

Actor.send = (message) => {
  const handler = behaviour(message)
  callbacks.push({handler, message})
}

const execute = (behaviour)

() => {
  while (!stopped) {
    yield execute(behaviour)
  }
}


for (const {handler, message} of mailbox) {
  yield handler(message)
}

//on send: add handler, message on mailbox then do it.next()

//iterate over


send()
send() //nothing happens => complete current context, when behaviour is complete call next() executor which processes
//if some other context adds a message: put it on the mailbox then execute it in correct context

//when a message is finished: call next(); send just adds messages to mailbox
//

//-> EventLoop

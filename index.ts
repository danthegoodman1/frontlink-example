import * as dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import { createServer } from "http"
import { WebSocket, WebSocketServer } from "ws"
import { randomUUID } from "crypto"

const listenPort = process.env.PORT || "8080"

declare global {
  namespace Express {
    interface Request {
      id: string
    }
  }

  namespace NodeJS {
    interface ProcessEnv {}
  }
}

interface IDWebsocket extends WebSocket {
  id: string
  isAlive: boolean
}

// socket ID to instance
const sockets: { [key: string]: WebSocket } = {}

// room-socket index
const rooms: { [roomID: string]: string[] } = {}

async function main() {
  const app = express()
  const server = createServer(app)
  const wss = new WebSocketServer({ noServer: true })

  server.on("upgrade", (request, socket, head) => {
    if (request.url === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        console.log("connected")
        wss.emit("connection", ws, request)
      })
    } else {
      socket.destroy()
    }
  })

  // Set up connection event for new WebSocket connections
  wss.on("connection", (ws: IDWebsocket, request) => {
    ws.id = randomUUID()
    ws.isAlive = true
    sockets[ws.id] = ws
    ws.on("message", (message) => {
      console.log(`Received message: ${message} from ws ${ws.id}`)
      const msgJson = JSON.parse(message.toString())
      if (
        !msgJson.MessageType.startsWith("Subscribe") &&
        !msgJson.MessageType.startsWith("Unsubscribe")
      ) {
        /**
         * If you care about presence, emit RoommateSubscribed and RoommateUnsubscribed,
         * but we won't send these messages to clients since they don't do anything about it
         * (and initial state might be a secret).
         */

        // Send to all other roommates
        for (const socketID of rooms[msgJson.RoomID]) {
          if (socketID !== ws.id) {
            // No reason to send back to emitting client, it will ignore it anyway
            sockets[socketID].send(message.toString())
          }
        }
      }

      if (msgJson.MessageType.startsWith("Subscribe")) {
        console.log(ws.id, "subscribed to", msgJson.RoomID)
        // Subscribe to room
        if (!rooms[msgJson.RoomID]) {
          rooms[msgJson.RoomID] = []
        }

        rooms[msgJson.RoomID].push(ws.id)
      }

      if (msgJson.MessageType.startsWith("Unsubscribe")) {
        console.log(ws.id, "unsubscribed from", msgJson.RoomID)
        // Remove from room
        if (!rooms[msgJson.RoomID]) {
          rooms[msgJson.RoomID] = []
        }

        rooms[msgJson.RoomID] = rooms[msgJson.RoomID].filter(
          (socketID) => socketID !== ws.id
        )
      }
    })

    // https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
    function heartbeat() {
      this.isAlive = true
    }
    ws.on("pong", heartbeat)
    ws.on("close", handleClose)
  })

  function handleClose() {
    // Gracefull close (like reload)
    console.log("disconnected, removing", this.id, "from all rooms")
    // Remove from all rooms
    for (const roomID of Object.keys(rooms)) {
      if (!rooms[roomID]) {
        rooms[roomID] = []
      }

      rooms[roomID] = rooms[roomID].filter((socketID) => socketID !== this.id)
    }
  }

  wss.on("close", function close() {
    clearInterval(interval)
  })

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(s) {
      const ws = s as IDWebsocket
      if (ws.isAlive === false) {
        console.log("disconnected, removing", ws.id, "from all rooms")
        // Remove from all rooms
        for (const roomID of Object.keys(rooms)) {
          if (!rooms[roomID]) {
            rooms[roomID] = []
          }

          rooms[roomID] = rooms[roomID].filter((socketID) => socketID !== ws.id)
        }
        return ws.terminate()
      }

      ws.isAlive = false
      ws.ping()
    })
  }, 1000)

  app.use(express.json())
  app.disable("x-powered-by")
  app.use(cors())

  // Remix public
  app.use(express.static("public"))
  app.use(express.static("src/public"))

  app.get("/hc", (req, res) => {
    res.sendStatus(200)
  })

  server.listen(listenPort, () => {
    console.log(`Listening on port ${listenPort}`)
  })

  const signals = {
    SIGHUP: 1,
    SIGINT: 2,
    SIGTERM: 15,
  }

  let stopping = false
  Object.keys(signals).forEach((signal) => {
    process.on(signal, async () => {
      if (stopping) {
        return
      }
      stopping = true
      server.close()
      process.exit(0)
    })
  })
}

main()

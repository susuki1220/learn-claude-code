require("dotenv").config()
const Anthropic = require("@anthropic-ai/sdk")
const http = require("http")
const fs = require("fs")
const path = require("path")

const PORT = 3000
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic.default()
  : null

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
}

// Track connected clients for live reload
const clients = new Set()

// Load character data for API endpoint
function loadCharacters() {
  try {
    const data = fs.readFileSync(path.join(__dirname, "data/characters.json"), "utf8")
    return JSON.parse(data)
  } catch (e) {
    return {}
  }
}

const server = http.createServer(async (req, res) => {
  // Talk API endpoint
  if (req.method === "POST" && req.url === "/api/talk") {
    let body = ""
    req.on("data", (chunk) => (body += chunk))
    req.on("end", async () => {
      try {
        const { character, message } = JSON.parse(body)
        const characters = loadCharacters()
        const npc = characters[character]

        if (!npc) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "Character not found" }))
          return
        }

        if (!anthropic) {
          res.writeHead(200, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ response: npc.greeting }))
          return
        }

        const systemPrompt = `You are ${npc.name}, a character in a dungeon adventure game.

Personality: ${npc.personality}
Knowledge: ${npc.knowledge}

Stay in character at all times. Keep responses to 1-2 sentences. Be conversational and engaging. Never break character or mention that you are an AI.`

        const result = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 150,
          system: systemPrompt,
          messages: [{ role: "user", content: message }],
        })

        const response = result.content[0].text
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ response }))
      } catch (err) {
        console.error("Talk API error:", err.message)
        // Fall back to greeting on error
        try {
          const { character } = JSON.parse(body)
          const characters = loadCharacters()
          const npc = characters[character]
          res.writeHead(200, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ response: npc?.greeting || "..." }))
        } catch {
          res.writeHead(500, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "Server error" }))
        }
      }
    })
    return
  }

  // Live reload endpoint
  if (req.url === "/live-reload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    })
    res.write("data: connected\n\n")
    clients.add(res)
    req.on("close", () => clients.delete(res))
    return
  }

  let filePath = req.url === "/" ? "/index.html" : req.url
  filePath = path.join(__dirname, filePath)

  const ext = path.extname(filePath)
  const contentType = mimeTypes[ext] || "text/plain"

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404)
      res.end("Not found")
      return
    }
    res.writeHead(200, { "Content-Type": contentType })
    res.end(content)
  })
})

// Watch for file changes and notify clients
fs.watch(__dirname, { recursive: true }, (event, filename) => {
  if (filename && !filename.includes("node_modules")) {
    clients.forEach((client) => {
      client.write("data: reload\n\n")
    })
  }
})

server.listen(PORT, () => {
  console.log(`\n  Dungeons & Agents running at http://localhost:${PORT}`)
  console.log(`  Live reload enabled\n`)
})

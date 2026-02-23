// Dungeons & Agents - Game Engine
// Starter skeleton for lessons

// ============ GAME STATE ============

let rooms = {}
let items = {}
let characters = {}
let enemies = {}
let inventory = []
let currentRoom = "cave-entrance"
let playerHp = 100
const maxHp = 100
let visitedRooms = new Set(["cave-entrance"])
let talkingTo = null
let talkingToId = null
let conversationState = {}
let storyFlags = new Set()

// ============ DATA LOADING ============

async function loadRooms() {
  const response = await fetch("data/rooms.json")
  rooms = await response.json()
}

async function loadItems() {
  const response = await fetch("data/items.json")
  items = await response.json()
}

async function loadCharacters() {
  try {
    const response = await fetch("data/characters.json")
    characters = await response.json()
  } catch (e) {
    characters = {}
  }
}

async function loadEnemies() {
  try {
    const response = await fetch("data/enemies.json")
    enemies = await response.json()
  } catch (e) {
    enemies = {}
  }
}

// ============ COMMAND PROCESSING ============

function processCommand(input) {
  const command = input.trim().toLowerCase()

  // Echo the command
  print(`> ${input}`, "command")

  // Handle commands
  if (command === "help") {
    print("Available commands:")
    print("  help  - Show this help message")
    print("  look  - Look around the room")
    print("  go [direction] - Move (up, down, left, right)")
    print("  take [item] - Pick up an item")
    print("  inventory - Show your inventory")
    return
  }

  if (command === "look") {
    const room = rooms[currentRoom]
    if (room) {
      print(room.description)

      const roomItems = Object.entries(items)
        .filter(([id, item]) => item.room === currentRoom)
        .map(([id, item]) => item.name)
      if (roomItems.length > 0) {
        print(`Items: ${roomItems.join(", ")}`)
      }

      const exitList = Object.keys(room.exits).join(", ")
      if (exitList) {
        print(`Exits: ${exitList}`)
      }
    }
    return
  }

  if (command === "take" || command.startsWith("take ")) {
    const itemName = command === "take" ? "" : command.slice(5)
    take(itemName)
    return
  }

  if (command === "inventory" || command === "inv") {
    showInventory()
    return
  }

  if (command.startsWith("go ")) {
    const direction = command.slice(3).trim()
    goDirection(direction)
    return
  }

  print("I don't understand that.", "error")
}

// ============ MOVEMENT ============

function goDirection(direction) {
  const room = rooms[currentRoom]
  if (room && room.exits[direction]) {
    currentRoom = room.exits[direction]
    visitedRooms.add(currentRoom)
    updateUI()
    const newRoom = rooms[currentRoom]
    if (newRoom) {
      print(`You go ${direction}.`)
      print(newRoom.description)

      const roomItems = Object.entries(items)
        .filter(([id, item]) => item.room === currentRoom)
        .map(([id, item]) => item.name)
      if (roomItems.length > 0) {
        print(`Items: ${roomItems.join(", ")}`)
      }

      const exitList = Object.keys(newRoom.exits).join(", ")
      if (exitList) {
        print(`Exits: ${exitList}`)
      }
    }
  } else {
    print("You can't go that way.", "error")
  }
}

// ============ INVENTORY SYSTEM ============

function take(itemName) {
  let entry
  if (itemName === "") {
    entry = Object.entries(items).find(
      ([id, item]) => item.room === currentRoom,
    )
  } else {
    entry = Object.entries(items).find(
      ([id, item]) =>
        item.room === currentRoom &&
        item.name.toLowerCase().includes(itemName.toLowerCase()),
    )
  }

  if (entry) {
    const [id, item] = entry
    item.room = null
    inventory.push(id)
    print(`You pick up the ${item.name}.`, "success")
    updateInventory()
    updateTakeButton()
    showItemsBar()
  } else {
    print("You don't see that here.", "error")
  }
}

function showInventory() {
  if (inventory.length === 0) {
    print("You are carrying nothing.")
  } else {
    const carried = inventory.map((id) => items[id].name).join(", ")
    print(`You are carrying: ${carried}`)
  }
}

// ============ EVENT HANDLERS ============

// Handle input
commandInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const input = commandInput.value
    if (input.trim()) {
      processCommand(input)
      commandInput.value = ""
    }
  }
})

// Focus input on click anywhere
document.addEventListener("click", () => commandInput.focus())

// Arrow key navigation
document.addEventListener("keydown", (e) => {
  if (document.activeElement === commandInput && commandInput.value !== "")
    return

  const arrowMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  }

  if (arrowMap[e.key]) {
    e.preventDefault()
    processCommand(`go ${arrowMap[e.key]}`)
  }
})

// Button handlers
document.querySelectorAll(".pixel-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation()
    const cmd = btn.dataset.cmd
    if (cmd && !btn.disabled) {
      processCommand(cmd)
    }
  })
})

// Portrait close button
portraitClose.addEventListener("click", (e) => {
  e.stopPropagation()
  hidePortrait()
})

// Take button - take first item in room
takeBtn.addEventListener("click", (e) => {
  e.stopPropagation()
  const item = Object.values(items).find((i) => i.room === currentRoom)
  if (item) {
    const name = item.name.split(" ")[0].toLowerCase()
    processCommand(`take ${name}`)
  }
})

// Talk button - talk to first NPC in room
talkBtn.addEventListener("click", (e) => {
  e.stopPropagation()
  const npc = Object.values(characters).find((c) => c.location === currentRoom)
  if (npc) {
    const name = npc.name.split(" ")[0].toLowerCase()
    processCommand(`talk ${name}`)
  }
})

// ============ INITIALIZATION ============

async function init() {
  await loadRooms()
  await loadItems()
  await loadCharacters()
  await loadEnemies()

  updateUI()

  print("Welcome to Dungeons & Agents!")
  print("")
  const room = rooms[currentRoom]
  if (room) {
    print(room.description)

    const roomItems = Object.entries(items)
      .filter(([id, item]) => item.room === currentRoom)
      .map(([id, item]) => item.name)
    if (roomItems.length > 0) {
      print(`Items: ${roomItems.join(", ")}`)
    }
  }
}

init()

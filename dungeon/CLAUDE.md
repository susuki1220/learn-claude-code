# Dungeons & Agents

A browser-based text adventure game. Players explore rooms, collect items, and interact via text commands.

## Project Structure

- `game.js` — Game engine: commands, movement, inventory, combat
- `ui/ui.js` — UI updates: map, inventory list, buttons, items bar
- `ui/portraits.js` — Pixel art rendering via CSS box-shadow
- `data/rooms.json` — Room definitions
- `data/items.json` — Item definitions
- `data/characters.json` — NPC definitions
- `data/enemies.json` — Enemy definitions
- `index.html` — Game layout and HTML structure
- `style.css` — Styling
- `server.js` — Local dev server

## Adding Rooms

Rooms are defined in `data/rooms.json`. Each room has this format:

```json
{
  "room-id": {
    "name": "Room Name",
    "description": "2-3 atmospheric sentences describing the room.",
    "exits": {
      "up": "other-room-id",
      "down": "another-room-id"
    }
  }
}
```

- **Descriptions** should be 2-3 atmospheric sentences that set the mood.
- **Exits** use directions: `up`, `down`, `left`, `right`.
- Exits must be bidirectional — if room A exits up to room B, room B must exit down to room A.

## Map Sync Rule

When rooms are added or modified, the `mapLayout` grid in `ui/ui.js` **must** be updated to match. The grid is a 2D array where each position corresponds to a room's spatial location:

```js
const mapLayout = {
  grid: [
    [null, "secret-garden", null],
    ["underground-lake", "narrow-tunnel", "treasure-room"],
    [null, "cave-entrance", null],
  ],
}
```

Row 0 is the top (north/up), row 2 is the bottom (south/down). Columns go left to right.

## Game Rules

- **Weapon damage**: 1–10 (no exceptions)
- **Enemy HP**: 5–30
- **Room descriptions**: 2–3 atmospheric sentences
- **Every room must have at least one exit**
- **No one-way doors** — if room A connects to room B, room B must connect back to room A

## Navigation

- Arrow keys (ArrowUp/Down/Left/Right) for movement
- Do NOT add WASD support — it interferes with text input

⚓

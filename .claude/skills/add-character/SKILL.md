---
name: add-character
description: Add an NPC to the dungeon game
argument-hint: "<character-name>"
---

Create a new NPC named $ARGUMENTS for the dungeon game.

Ask the user for:

- **Personality** (2-3 traits)
- **Knowledge** (what do they know about the dungeon?)
- **Location** (which room are they in?)
- **Greeting** (what they say when you first talk to them)

## Steps

1. **Add to `dungeon/data/characters.json`** using this format:

```json
{
  "character-id": {
    "name": "Display Name",
    "personality": "2-3 traits describing their personality",
    "knowledge": "What they know about the dungeon and can share with the player",
    "location": "room-id",
    "greeting": "What they say when the player first talks to them"
  }
}
```

2. **Create pixel art in `dungeon/ui/portraits.js`**:
   - Add a color palette to `pixelColors` with keys: 1=skin, 2=dark, 3=accent, 4=highlight, 5=secondary
   - Add a 10x10 pixel art grid to `portraits` (use 0 for transparent)
   - Follow the existing pattern of wizard, dwarf, and thief portraits

3. **Verify the character displays correctly**:
   - The encounter box shows automatically via `showEncounterBox()` when entering a room with a character
   - The portrait displays via `showPortrait()` when talking to the character
   - The talk button enables via `updateTalkButton()` when a character is in the room
   - All of these already work if the character is added to `characters.json` with a valid `location` and has pixel art in `portraits.js`

## Available Rooms

Check `dungeon/data/rooms.json` for valid room IDs before assigning a location.

## Important

- The character ID in `characters.json` must match the key used in `pixelColors` and `portraits`
- Keep pixel art style consistent with existing characters (10x10 grid, similar color palette structure)

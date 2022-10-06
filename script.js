const inputElement = document.getElementById("inputBox");
const textElement = document.getElementById("text");
const alertElement = document.getElementById("alert");
const descriptionElement = document.getElementById("descriptionBox");

var currentRoom;
var inventory = {};
var textHistory = []; // All descriptions outputted to description box will be stored here

function updateDescriptionBox(text) {
  textHistory.push(text);

  let innerText = "";
  textHistory.forEach((item) => {
    innerText += `${item} \n\n`;
  });

  descriptionElement.innerText = innerText;
  descriptionElement.scrollTop = descriptionElement.scrollHeight; // Autoscrolls to bottom
}

function addToInventory(item) {
  inventory[item._name] = item;
}

class Item {
  constructor(name, description, placement, contains) {
    this._name = name;
    this._desc = description;
    this._placement = placement;
    this._contains = contains;
  }
}

class Room {
  constructor(name, description, requiredItem) {
    this._name = name;
    this._desc = description;
    this._linkedRooms = {};
    this._items = {};
    this._requiredItem = requiredItem;
  }

  linkRoom(direction, room) {
    this._linkedRooms[direction] = room;
  }

  placeItem(name, item) {
    this._items[name] = item;
  }

  examine(item) {
    console.log("Available items in room:");
    console.log(this._items);
    console.log("Available items in inventory:");
    console.log(inventory);
    console.log(item);

    if (item in inventory) {
      updateDescriptionBox(inventory[item]._desc);
    } else if (item in this._items) {
      updateDescriptionBox(this._items[item]._desc);
    } else {
      displayAlert(`Can't find a ${item} to examine!`);
    }
  }

  open(item) {
    if (!(item in this._items)) {
      // If the item doesnt exist in the room...
      displayAlert(`${item} doesnt exist!`);
    } else if (this._items[item]._contains._name == "undefined") {
      // If unopenable...
      displayAlert("I can't open that!");
    } else {
      updateDescriptionBox(
        `There's a ${this._items[item]._contains._name} in this chest! \nThe ${this._items[item]._contains._name} was added to your inventory.`
      );
      addToInventory(this._items[item]._contains);
      delete this._items[item];
    }
  }

  // TODO: Dont let player pick up something that contains something
  get(item) {
    // if key with item string exists in items...
    console.log("Available items:");
    console.log(this._items);
    if (item in this._items) {
      displayAlert(`Picked up ${item}!`);
      // TODO: Add item to inventory (not yet implemented)
      addToInventory(item);
      delete this._items[item];
      console.log(this._items);
    } else {
      displayAlert(`Can't find a ${item} to pickup!`);
    }
  }

  move(direction) {
    console.log("Available directions: ");
    console.log(this._linkedRooms);
    if (direction in this._linkedRooms) {
      // If room to move to exists
      if (
        // If item is required to move in certain direction and you dont have the item....
        typeof this._linkedRooms[direction]._requiredItem !== "undefined" &&
        !(this._requiredItem in inventory)
      ) {
        displayAlert(
          `You are going to need a ${this._linkedRooms[direction]._requiredItem._name} to go in here!`
        );
        return currentRoom; // Didn't move so we return currentRoom
      } else {
        currentRoom = this._linkedRooms[direction];
        updateDescriptionBox(currentRoom._desc);
        getItemPlacements();

        return this._linkedRooms[direction];
      }
    }
    displayAlert(`Cannot go ${direction}!`);
    return currentRoom;
  }
}

// Item Setup
const Apple = new Item(
  "Apple",
  "It's red and looks delicious. I could eat this or I could throw it at someone I dislike too...",
  "There is a red apple in the fruit bowl."
);
const Key = new Item(
  "Silver key",
  "Unlocks a door",
  "There is a Silver key on the dining table."
);

const Key2 = new Item(
  "Gold key",
  "A really expensive looking key, this will probably unlock something. I hope it's real gold..."
);

const Chest = new Item(
  "Chest",
  "Maybe it contains something, I should probably open it",
  "There is a chest in the corner of the room",
  Key2
);

// Room Setup
const Lounge = new Room(
  "Lounge",
  "You are now in the lounge, there is a big sofa.",
  Key
);

const Hallway = new Room(
  "Hallway",
  "There is a set of stairs at the back of the darkly lit room"
);

const Kitchen = new Room(
  "Kitchen",
  "You are in the kitchen, there is a table and a countertop"
);

const UpstairsDark = new Room(
  "Upstairs",
  "You creep up the old stairs, once you reach the top you realise everything is too dark to see."
);

// TODO: Separate these?
// Item Placement
Kitchen.placeItem("Red apple", Apple);
Kitchen.placeItem("Silver key", Key);

Hallway.placeItem("Chest", Chest);

// Room Links
Kitchen.linkRoom("south", Hallway);
Kitchen.linkRoom("east", Lounge);

Hallway.linkRoom("north", Kitchen);
Hallway.linkRoom("upstairs", UpstairsDark);

UpstairsDark.linkRoom("downstairs", Hallway);

Lounge.linkRoom("west", Kitchen);

// Game logic

// Popup to alert user
function displayAlert(text) {
  alertElement.innerText = text;

  //Appear, then fade
  alertElement.style.transition = "none";
  alertElement.style.opacity = "1";
  void alertElement.offsetHeight; // Allows us to transition again (for some reason)
  alertElement.style.transition = "opacity 2.5s";
  alertElement.style.opacity = "0";
}

function displayRoomName(roomToDisplay) {
  textElement.innerText = roomToDisplay._name;
}

function getItemPlacements() {
  let out = "";
  for (let item in currentRoom._items) {
    out += currentRoom._items[item]._placement + "\n";
  }
  if (out.trim() !== "") {
    updateDescriptionBox(out.trim());
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    command = inputElement.value;
    inputElement.value = "";
    const directions = [
      "north",
      "south",
      "east",
      "west",
      "upstairs",
      "downstairs",
    ];
    if (directions.includes(command.toLowerCase())) {
      // MOVEMENT
      currentRoom = currentRoom.move(command);
      displayRoomName(currentRoom);
    } else if (command.split(" ")[0].toLowerCase() == "get") {
      // GET
      if (command == "get") {
        displayAlert("Nothing to get!");
      } else {
        let item = command.substring(command.indexOf(" ") + 1).toLowerCase();
        currentRoom.get(item.charAt(0).toUpperCase() + item.substring(1)); // Capitalises first letter of item to get
      }
      // EXAMINE
    } else if (command.split(" ")[0].toLowerCase() == "examine") {
      if (command == "examine") {
        // If user just types examine, nothing else....
        updateDescriptionBox(currentRoom._desc); // If nothing to examine, examine the room.
        // Updates the description box so long as there are item placement descriptions to be displayed.
        getItemPlacements();
      } else {
        let item = command.substring(command.indexOf(" ") + 1).toLowerCase();
        currentRoom.examine(item.charAt(0).toUpperCase() + item.substring(1));
      }
    } else if (command.split(" ")[0].toLowerCase() == "open") {
      if (command == "open") {
        displayAlert("Nothing to open!");
      } else {
        let item = command.substring(command.indexOf(" ") + 1).toLowerCase();
        currentRoom.open(item.charAt(0).toUpperCase() + item.substring(1));
      }
    } else {
      alert("That is not a valid command please try again");
    }
  }
});

function startGame() {
  // Def starting room
  currentRoom = Kitchen;
  displayRoomName(currentRoom);
}

startGame();

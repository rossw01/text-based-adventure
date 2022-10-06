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
  constructor(name, description, placement, contains, onUse) {
    this._name = name;
    this._desc = description;
    this._placement = placement;
    this._contains = contains;
    this._onUse = onUse;
  }
}

class Room {
  constructor(name, description, requiredItem, isIlluminated) {
    this._name = name;
    this._desc = description;
    this._linkedRooms = {};
    this._items = {};
    this._requiredItem = requiredItem;
    this._isIlluminated = isIlluminated;
  }

  linkRoom(direction, room) {
    this._linkedRooms[direction] = room;
  }

  placeItem(name, item) {
    this._items[name] = item;
  }

  examine(item) {
    // TODO: remove
    // console.log("Available items in room:");
    // console.log(this._items);
    // console.log("Available items in inventory:");
    // console.log(inventory);
    // console.log(item);

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
        `There's a ${this._items[item]._contains._name} in here! \nThe ${this._items[item]._contains._name} was added to your inventory.`
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
      addToInventory(this._items[item]);
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
        !(this._linkedRooms[direction]._requiredItem in inventory)
      ) {
        displayAlert(
          `You are going to need a ${this._linkedRooms[direction]._requiredItem} to go in here!`
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
  "It's red and looks delicious. I could eat this but I could throw it at someone I dislike too...",
  "There is an apple in the fruit bowl."
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

const Lantern = new Item(
  "Lantern",
  "It looks like it's going to fall apart, but it could probably illuminate a dark room.",
  "There's a lantern beside the sofa, just like any good Lounge has.",
  undefined,
  "The lantern illuminates the room!"
);

const Cabinet = new Item(
  "Cabinet",
  "An old fashioned cabinet, I should probably check out what's inside it",
  "There is a cabinet beside the door",
  Lantern
);

const Sword = new Item(
  "Sword",
  "This has definitely not been used in over a century, it would probably break easily.",
  "There is an old sword mounted on the wall.",
  undefined,
  "Your sword has broken already! It was probably just for decorative purposes to be fair."
);

// Room Setup
const Lounge = new Room(
  "Lounge",
  "You are now in the lounge, there is a big sofa.",
  "Silver key",
  true
);

const Hallway = new Room(
  "Hallway",
  "There is a set of stairs at the back of the darkly lit room",
  undefined,
  true
);

const Kitchen = new Room(
  "Kitchen",
  "You are in the kitchen, there is a table and a countertop",
  undefined,
  true
);

const UpstairsDark = new Room(
  "Upstairs",
  "You creep up the old stairs, once you reach the top you realise everything is too dark to see.",
  undefined,
  false
);

const FinalRoom = new Room(
  "Final Room",
  "There is a goblin here",
  "Gold key",
  true
);

// TODO: Separate these?
// Item Placement
Kitchen.placeItem("Apple", Apple);
Kitchen.placeItem("Silver key", Key);

Hallway.placeItem("Chest", Chest);

Lounge.placeItem("Cabinet", Cabinet);

// Room Links
Kitchen.linkRoom("south", Hallway);
Kitchen.linkRoom("east", Lounge);

Hallway.linkRoom("north", Kitchen);
Hallway.linkRoom("upstairs", UpstairsDark);

UpstairsDark.linkRoom("downstairs", Hallway);

Lounge.linkRoom("west", Kitchen);

function illuminateRoom(text) {
  currentRoom._isIlluminated = true;
  currentRoom._desc = text;
  if (currentRoom._name == "Upstairs") {
    // Tried to keep code semi-reusable
    UpstairsDark.linkRoom("north", FinalRoom);
    UpstairsDark.placeItem("Sword", Sword);
  }

  updateDescriptionBox(currentRoom._desc);
  getItemPlacements();
}
// Game logic
function lightRoom() {
  if (!displayInv().includes("Lantern")) {
    displayAlert("I don't have a lantern!");
  } else {
    if (!currentRoom._isIlluminated) {
      updateDescriptionBox("You use the lantern and set it down beside you...");
      delete inventory["Lantern"];
      if (currentRoom == UpstairsDark) {
        illuminateRoom(
          "You now see everything! There is a locked door at the end of the hallway. (North)"
        );
      }
    } else {
      displayAlert("The room is already illuminated!");
    }
  }
}

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

function displayInv() {
  let items = Object.keys(inventory); // Keys(names) of all items
  if (items.length == 0) {
    // If no items were added...
    return "You haven't collected any items yet! Try typing 'get (item name)' to pick up an item!";
  }
  let invStr = "Inventory: ";
  items.forEach((item) => {
    invStr += `${item}, `;
  });
  return invStr.slice(0, -2); // cuts off final comma
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
    } else if (command == "inventory") {
      updateDescriptionBox(displayInv());
    } else if (command.split(" ")[0].toLowerCase() == "use") {
      let itemToUse = command.substring(command.indexOf(" ") + 1).toLowerCase();
      if (itemToUse == "lantern") {
        lightRoom();
      } else {
        if (displayInv().toLowerCase().includes(itemToUse)) {
          // User inputted an item that they have that cant be used
          displayAlert(`I can't use a ${itemToUse}!`);
        } else {
          // User inputted an item that they don't have
          displayAlert(`I don't have a ${itemToUse}!`);
        }
      }
    } else {
      displayAlert("That is not a valid command please try again");
    }
  }
});

function startGame() {
  // Def starting room
  currentRoom = Kitchen;
  displayRoomName(currentRoom);
}

startGame();

const inputElement = document.getElementById("inputBox");
const textElement = document.getElementById("text");
const alertElement = document.getElementById("alert");

var currentRoom;
var inventory = {};

function addToInventory(item) {
  inventory[item._name] = item;
  console.log(inventory);
}

class Item {
  constructor(name, description) {
    this._name = name;
    this._desc = description;
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
    console.log(`Added item '${name}' to '${this._name}'`);
  }

  get(item) {
    // if key with item string exists in items...
    console.log("Available items:");
    console.log(this._items);
    if (item in this._items) {
      displayAlert(`Picked up ${item}!`);
      // TODO: Add item to inventory (not yet implemented)
      addToInventory(item);
      // TODO: Remove item from room
    } else {
      displayAlert(`Can't find a ${item}!`);
    }
  }

  move(direction) {
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
        console.log(`You are now in the ${currentRoom._name}`);
        return this._linkedRooms[direction];
      }
    }
    displayAlert(`Cannot move ${direction}!`);
    return currentRoom;
  }
}

const Apple = new Item("Apple", "It's red and looks delicous");
const Key = new Item("Key", "Unlocks a door");

const Lounge = new Room(
  "Lounge",
  "You are now in the lounge, there is a big sofa.",
  Key
);

console.log(Lounge._requiredItem);

const Hallway = new Room(
  "Hallway",
  "There is a set of stairs at the back of the darkly lit room"
);

// TODO: Add this to a new file
const Kitchen = new Room(
  "Kitchen",
  "You are in the kitchen, there is a table and a countertop"
);

Kitchen.placeItem("Red apple", Apple);
Kitchen.placeItem("Key", Key);
// TODO: Separate these

Kitchen.linkRoom("south", Hallway);
Kitchen.linkRoom("east", Lounge);

Hallway.linkRoom("north", Kitchen);

Lounge.linkRoom("west", Kitchen);

function displayAlert(text) {
  alertElement.innerText = text;

  //Appear, then fade
  alertElement.style.transition = "none";
  alertElement.style.opacity = "1";
  void alertElement.offsetHeight; // Allows us to transition again (for some reason)
  alertElement.style.transition = "opacity 2.5s";
  alertElement.style.opacity = "0";
}

function displayRoomInfo(roomToDisplay) {
  textElement.innerText = roomToDisplay._desc;
}

document.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    command = inputElement.value;
    const directions = ["north", "south", "east", "west"];
    if (directions.includes(command.toLowerCase())) {
      // MOVEMENT
      currentRoom = currentRoom.move(command);
      displayRoomInfo(currentRoom);
      inputElement.value = "";
    } else if (command.split(" ")[0].toLowerCase() == "get") {
      // GET
      inputElement.value = "";
      let item = command.substring(command.indexOf(" ") + 1).toLowerCase();
      currentRoom.get(item.charAt(0).toUpperCase() + item.substring(1)); // Capitalises first letter of item to get
    } else {
      alert("That is not a valid command please try again");
      inputElement.value = "";
    }
  }
});

function startGame() {
  // Def starting room
  currentRoom = Kitchen;
  displayRoomInfo(currentRoom);
}

startGame();

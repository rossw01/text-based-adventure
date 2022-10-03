const inputElement = document.getElementById("inputBox");
const textElement = document.getElementById("text");
const alertElement = document.getElementById("alert");

var currentRoom;

class Item {
  constructor(name, description) {
    this._name = name;
    this._desc = description;
  }
}

class Room {
  constructor(name, description) {
    this._name = name;
    this._desc = description;
    this._linkedRooms = {};
    this._items = {};
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
      // TODO: Remove item from room
      // TODO: Add item to inventory (not yet implemented)
    } else {
      displayAlert(`Can't find a ${item}!`);
    }
  }

  move(direction) {
    console.log(this._linkedRooms);
    if (direction in this._linkedRooms) {
      currentRoom = this._linkedRooms[direction];
      console.log(`You are now in the ${currentRoom._name}`);
      return this._linkedRooms[direction];
    }
    displayAlert(`Cannot move ${direction}!`);
    return currentRoom;
  }
}

const Lounge = new Room(
  "Lounge",
  "You are now in the lounge, there is a big sofa."
);

const Hallway = new Room(
  "Hallway",
  "There is a set of stairs at the back of the darkly lit room"
);

// TODO: Add this to a new file
const Kitchen = new Room(
  "Kitchen",
  "You are in the kitchen, there is a table and a countertop"
);

const Apple = new Item("Apple", "It's red and looks delicous");

Kitchen.placeItem("Red apple", Apple);

// TODO: Separate these
Kitchen.linkRoom("south", Hallway);
Kitchen.linkRoom("east", Kitchen);
Hallway.linkRoom("north", Kitchen);

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
      inputElement.innerText = "";
      let item = command.substring(command.indexOf(" ") + 1).toLowerCase();
      currentRoom.get(item.charAt(0).toUpperCase() + item.substring(1)); // Capitalises first letter of item to get
    } else {
      alert("That is not a valid command please try again");
    }
  }
});

function startGame() {
  // Def starting room
  currentRoom = Kitchen;
  displayRoomInfo(currentRoom);
}

startGame();

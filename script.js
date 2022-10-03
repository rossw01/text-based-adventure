const inputElement = document.getElementById("inputBox");
const textElement = document.getElementById("text");

var currentRoom;

class Room {
  constructor(name, description) {
    this._name = name;
    this._desc = description;
    this._linkedRooms = {};
  }

  linkRoom(direction, room) {
    this._linkedRooms[direction] = room;
  }

  move(direction) {
    console.log(this._linkedRooms);
    if (direction in this._linkedRooms) {
      currentRoom = this._linkedRooms[direction];
      console.log(`You are now in the ${currentRoom._name}`);
      return this._linkedRooms[direction];
    }
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

// TODO: Separate these
Kitchen.linkRoom("south", Hallway);
Kitchen.linkRoom("east", Kitchen);
Hallway.linkRoom("north", Kitchen);

function displayRoomInfo(roomToDisplay) {
  textElement.innerText = roomToDisplay._desc;
}

document.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    command = inputElement.value;
    const directions = ["north", "south", "east", "west"];
    if (directions.includes(command.toLowerCase())) {
      currentRoom = currentRoom.move(command);
      displayRoomInfo(currentRoom);
      inputElement.value = "";
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

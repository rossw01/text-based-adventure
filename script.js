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

class Character {
  constructor(name, description, placement, onTalk) {
    this._name = name; // Name in game
    this._desc = description; // Examine text
    this._placement = placement; // Where in the room
    this._onTalk = onTalk; // What will they say
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
    this._characters = {};
  }

  speak(name) {
    name = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
    if (name in this._characters) {
      updateDescriptionBox(
        `You speak to ${name}...\nThey reply: "${this._characters[name]._onTalk}"`
      );
    } else {
      displayAlert(`There's no one called ${name} here!`);
    }
  }

  linkCharacter(name, character) {
    this._characters[name] = character;
  }

  linkRoom(direction, room) {
    this._linkedRooms[direction] = room;
  }

  placeItem(name, item) {
    this._items[name] = item;
  }

  examine(item) {
    if (item in inventory) {
      updateDescriptionBox(inventory[item]._desc);
    } else if (item in this._items) {
      updateDescriptionBox(this._items[item]._desc);
    } else if (item in this._characters) {
      updateDescriptionBox(this._characters[item]._desc);
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

  get(item) {
    // In case of get heavy item (contains something else)
    if (!(item in this._items)) {
      displayAlert(`Can't find a ${item} to pickup!`);
    } else if (this._items[item]._contains != undefined) {
      displayAlert(
        `There's no chance of me picking up a ${item} all by myself!`
      );
    } else {
      // if key with item string exists in items...
      console.log("Available items:");
      console.log(this._items);
      if (item in this._items) {
        displayAlert(`Picked up ${item}!`);
        // TODO: Add item to inventory (not yet implemented)
        addToInventory(this._items[item]);
        delete this._items[item];
        console.log(this._items);
      }
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
        updateDescriptionBox("---");
        updateDescriptionBox(currentRoom._desc);
        getItemPlacements();
        getCharacterPlacements();

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
  "You swing your sword with all your might! You missed and hit the wall. It is now broken."
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
  "The door locks behind you! In front of you there is a big goblin! He looks hungry, Aaaaaaaah!!!",
  "Gold key",
  true
);

// Characters
const Peter = new Character(
  "Peter",
  "He's old and looks like he probably smells",
  "There is a man with a nametag that reads 'Peter' sat at the table.",
  "Go away, I'm reading!"
);

// TODO: Separate these to different file if possible
// Char placement
Kitchen.linkCharacter("Peter", Peter);

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
  getCharacterPlacements();
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
  alertElement.style.transition = "opacity 4s";
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

function getCharacterPlacements() {
  let out = "";
  for (let character in currentRoom._characters) {
    out += currentRoom._characters[character]._placement + "\n";
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

function winGame() {
  updateDescriptionBox(
    "You throw the apple as hard as you can, it lands in the Goblin's mouth."
  );
  updateDescriptionBox(
    "Goblins are allergic to apples. The Goblin is now dead. 😵"
  );
  updateDescriptionBox("You win!");
  inputElement.disabled = true;
}

function loseGame() {
  if (currentRoom == FinalRoom) {
    updateDescriptionBox("The goblin hits you with his weapon");
    updateDescriptionBox("You are now dead");
  }
  if (currentRoom == Kitchen) {
    updateDescriptionBox("Peter is disgraced by your actions!");
    updateDescriptionBox("He kicks you out of his house.");
    updateDescriptionBox("You lose.");
  }
  inputElement.disabled = true;
}

// TODO: Move to item class
function throwItem(item) {
  console.log(inventory);
  if (!displayInv().toLowerCase().includes(item)) {
    displayAlert(`I don't have a ${item}!`);
  } else {
    if (currentRoom == FinalRoom && item == "apple") {
      winGame();
    } else if (currentRoom == FinalRoom && item == "sword") {
      // Secret!
      updateDescriptionBox(
        "The goblin catches the sword and crushes it to dust"
      );
      delete inventory[item];
    } else {
      let itemObj =
        inventory[
          item.charAt(0).toUpperCase() + item.substring(1).toLowerCase()
        ];

      itemObj._placement = `There is a ${
        item.charAt(0).toUpperCase() + item.substring(1).toLowerCase()
      } on the floor where it landed.`;
      currentRoom.placeItem(
        item.charAt(0).toUpperCase() + item.substring(1).toLowerCase(),
        itemObj
      );
      delete inventory[
        item.charAt(0).toUpperCase() + item.substring(1).toLowerCase()
      ];
      updateDescriptionBox(`You throw the ${item}!`);
      updateDescriptionBox(
        `Nothing happened. The ${item} landed on the floor.`
      );
      // displayAlert("I can't throw that!");
    }
  }
}

function checkStuck() {
  if (currentRoom == FinalRoom) {
    if (
      !displayInv().toLowerCase().includes("apple") &&
      !displayInv().toLowerCase().includes("sword")
    ) {
      loseGame(); // If went into final room without apple or sword, end game
    }
  } else {
    return;
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
      checkStuck(); // Make sure user isn't in final room without Sword or apple (causes player to get stuck)
    } else if (command.split(" ")[0].toLowerCase() == "get") {
      // GET
      if (command == "get") {
        displayAlert("Nothing to get!");
      } else {
        let item = command.substring(command.indexOf(" ") + 1).toLowerCase();
        currentRoom.get(item.charAt(0).toUpperCase() + item.substring(1)); // Capitalises first letter of item to get
      }
    } else if (command.split(" ")[0].toLowerCase() == "throw") {
      let item = command.substring(command.indexOf(" ") + 1).toLowerCase();
      if (command == "throw") {
        displayAlert("Nothing to throw!");
      } else {
        throwItem(item);
      }
    } else if (
      command.split(" ")[0].toLowerCase() == "speak" ||
      command.split(" ")[0].toLowerCase() == "talk"
    ) {
      if (command == "speak" || command == "talk") {
        // if user didn't specify who to talk to...
        displayAlert("You must specify someone to talk to!");
      } else {
        currentRoom.speak(
          command.substring(command.indexOf(" ") + 1).toLowerCase()
        );
      }
    } else if (command.split(" ")[0].toLowerCase() == "examine") {
      // EXAMINE
      if (command == "examine") {
        // If user just types examine, nothing else....
        updateDescriptionBox("---");
        updateDescriptionBox(currentRoom._desc); // If nothing to examine, examine the room.
        // Updates the description box so long as there are item placement descriptions to be displayed.
        getItemPlacements();
        getCharacterPlacements();
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
      if (!displayInv().toLowerCase().includes(itemToUse)) {
        displayAlert(`I don't have a ${itemToUse}!`);
      } else {
        // If you do have the item...
        if (itemToUse == "lantern") {
          lightRoom();
          return;
        }
        if (itemToUse == "sword") {
          if (currentRoom !== FinalRoom) {
            displayAlert("I cant use that here!");
          } else {
            updateDescriptionBox(Sword._onUse);
            delete inventory["Sword"];
            if (!displayInv().toLowerCase().includes("apple")) {
              loseGame();
            }
          }
        } else {
          displayAlert("I can't use that!");
        }
      }
    } else if (
      (command.toLowerCase() == "hit peter" ||
        command.toLowerCase() == "punch peter" ||
        command.toLowerCase() == "fight peter") &&
      currentRoom == Kitchen
    ) {
      loseGame();
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

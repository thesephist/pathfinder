// Project Pathfinder JavaScript storyline model
// this will be served to the client encrypted with v.js to prevent cheating

var storyline = {

    "root": { // not a location
        "actions": {
            // list of functions paired to keywords
        },
    },

    "beginning": { // will need a more creative name here
        "objects": ["lighter","bag"],
        "narration": [
                        "Wait",
                        "Is... is that you?",
                        "Remmi?",
                        "Hold on, I think it's you",
                        "Oh, god, please let it be you...",
                        "...",
                        "It is! It <i>is</i> you!",
                        "Please, don't turn away. Don't leave me. Just give me one second.",
                        "I need to know it's you, for sure.",
                        "...",
                        "Okay, I'm alright.",
                        "I'm guessing you're pretty confused right now. That's okay.",
                        "You probably won't remember me, but I know you.",
                        "I'm Aurelia. I used to be so close to you... but you fell... you fell Asleep.",
                        "You're in a coma, Remmi. I hope you can here me. Please say something." // saying anything here to the game console progresses the play
                      ],
        "futures": ["commons"] // list of room references
    },

    "commons": {
        "objects": ["book","candle","water","console"],
        "narration": [
                        "This is the commons."
                     ],
        "futures": ["overture"]
    },

    "overture": {
        "objects": ["candle","phone"]
    }
};

var commands = [
    // take
    function(object) {
        onHand.push(object);

        return "the " + object;
    },

    // read
    function(object) {
        // readable things should be assigned content beforehand and put into storyline.json as variables

        return ", " + myLocation.objects[myLocation.objects.indexOf(object)].words; // this is sketchy; needs work
    },

    // look
    function(object) {
        // wtf is this supposed to do idek
    },

    // help
    function(object) {
        console.log("object is " + object);
        return "You can go, take, look, and get";
    },

    // get
    function(object) {
        // why does this function even exist

        onHand.push(object);

        return "the " + object;
    }
];

var myLocation = "beginning"; // reference to a current location
var onHand = []; // a list of items on hand
var aroundMe = []; // list of items in the environment

var myHistory = []; // a list of locations I was before

var commandList = ["take", "read", "look", "help", "get", "go"]; // "go" is always at the end
var commandNoArgs = ["help"];
var commandPast = ["took", "read", "saw", "helped", "got", "went"];
var trivials = ["the", "a", "to", "at", "into", "in", "and", "but", "or", "that", "this"];

function parseMessage(input) {
    // given an input phrase, this parses it into a JS object
    
    // will later also have to intercept questions, like "who are you?" and "where am I?"

    var inputObject = {
        "actions": [],
        "objects": []
    };

    input = input.toLowerCase().split(" ");

    for (i = 0; i < input.length; i++) {
        key = input[i];

        if (trivials.indexOf(key) != -1) {
            // do nothing
        } else if (commandList.indexOf(key) != -1) {
            if (commandNoArgs.indexOf(key) != -1) {
                inputObject.objects.push("_null");
            }
            inputObject.actions.push(key);
        } else {
            inputObject.objects.push(key);
        }
    }
   
    return inputObject;
}

function returnMessage(inputObject) {
    // given current state of the game and new inputdata from user, return next message

    var message = "";

    actions = inputObject.actions;
    objects = inputObject.objects;

    console.log(inputObject);

    // make it into a less insane format
    inputList = [];
    for (i = 0; i < actions.length; i++) {
        inputList.push([actions[i], objects[i]]);
    }

    // STRUCTURE
    // each progression in the storyline object has...
    //    a room (location)
    //    some objects in the environment (objects)
    //    narration (narration)
    //    further destinations to go from this point (futures)
    //
    // and these objects modify the four state variables, myHistory, location, onhand, and aroundme, to craft a universe. 
    // returnMessage then takes input data, modifies these variables (referring to the storyline.location.query references)
    // ... returns a new state (as variables modified) and a new message

    // takes care of movement
    var isRepeat = 0;
    if (actions.indexOf("go") > -1) {
        myHistory.push(myLocation);

        myLocation = objects[actions.indexOf("go")];
        message += "You are now in the " + myLocation + ".";

        isRepeat += 1;
    }

    // takes care of non-movement actions
    actions.forEach(function(word){
        if (word != "go") {
            // for each word, do
            // commands.$word(inputObject.objects[inputObject.actions.$current-index]);
            
            result = commands[commandList.indexOf(word)](objects[actions.indexOf(word)]);

            // exceptions
            if (result == undefined) {
                result = "nothing";
            }
            
            if (isRepeat > 1) {
                message += ", ";
            }
            if (actions.length == isRepeat) {
                message += "and ";
            }

            if (objects[actions.indexOf(word)] != "_null") {
                message += "You " + commandPast[commandList.indexOf(word)] + " " + result;
            } else {
                message += result;
            }

            console.log(isRepeat);
            isRepeat += 1;
        }
    });

    // clean up null messages
    if (message.length == 0) {
        message = "_null";
    }

    // if no action, ask again
    if (actions.length == 0) {
        message = "I can't quite understand...";
    }

    return message;
}



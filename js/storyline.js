// Project Pathfinder JavaScript storyline model
// the storyline.JSON of this will be served to the client encrypted with v.js to prevent cheating

// Also later make a reserve of more than a dozen phrases for syntax errors, so it doesn't get repetitive

var storyline = [

    { // not a location
        "actions": {
            // list of functions paired to keywords
        },
    },

    { // will need a more creative name here
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

    {
        "objects": ["book","candle","water","console"],
        "narration": [
                        "This is the commons."
                     ],
        "futures": ["overture"]
    },

    {
        "objects": ["candle","phone"]
    }
];

var locationlist = [ "root", "the Beginning", "the Commons", "the Overture" ];
var inputLocationlist = ["root", "beginning", "commons", "overture" ];

function getStorylineJSON(locName) {
    return storyline[inputLocationlist.indexOf(locName)];
};

var commands = [
    // take
    function(object) {
        if (aroundMe.indexOf(object) != -1) {
            onHand.push(object);
        
            return "the " + object;
        } else {
            return "nothing. There isn't a " + object + " here";
        }
    },

    // read
    function(object) {
        // readable things should be assigned content beforehand and put into storyline.json as variables

        return ", " + myLocation.objects[myLocation.objects.indexOf(object)].words; // this is sketchy; needs work
    },

    // look
    function(object) {
        if (!(aroundMe[0])) {
            return "nothing";
        } else if (aroundMe.length == 1) {
            return "the " + aroundMe[0].toString();
        }
        
        return aroundMe.join(", ");
    },

    // help
    function(object) {
        return "You can go, take, look, and get";
    },

    // get
    function(object) {
        // why does this function even exist

        onHand.push(object);

        return "the " + object;
    }
];

var inquiries = ["where","who","why","what"];
var inquiriesAnswers = [
    // where
    function(){
        cango = myFutures.join(", ");
        
        return "You are in the " + myLocation + ". You can go to " + cango;
    },

    // who
    function(){
        return "Well, that's for you to find out.";
    },

    // why
    function(){
        return "Why are you here? Why are you anything? What's the world? All good questions, all without answers.";
    },

    // what
    function(hand){
        // should this be what's in hand or what's in the room? For now, the latter by default
        message = "There's ";

        if (includes(hand, ["hand", "have", "hold"])) {
            message += onHand.join(", ");
  
            if (onHand.length == 0) {
                return "You have nothing.";
            }

            return message + ". ";
        }

        message += aroundMe.join(", ");
 
        if (aroundMe.length == 0) {
            return "There's nothing around you.";
        }

        return message + ". ";
    },
];

var myLocation = "beginning"; // reference to a current location
var myFutures = ["commons"]; // futures
var onHand = []; // a list of items on hand
var aroundMe = []; // list of items in the environment
var myHistory = []; // a list of locations I was before

var commandList = ["take", "read", "look", "help", "get", "go"]; // "go" is always at the end
var commandNoArgs = ["help"];
var commandPast = ["took", "read", "saw", "helped", "got", "went"];
var trivials = ["the", "a", "to", "at", "into", "in", "and", "but", "or", "that", "this", "some", "now", "then", "again"];

function stripPunc(word) {
    // only operates on single words
    return word.replace(/[.,\/!?;:()]/g,"");
}

function includes(str, array) {
    
    // checks if any words from given array occurs in a string str
    inv = false;
    sctr = str.toLowerCase();

    array.forEach(function(key){
        if (sctr.indexOf(key) >= 0) {
            inv = key;
        }
    });

    return inv;
}

function parseMessage(input) {

    // given an input phrase, this parses it into a JS object
 
    // but first capture questions as exceptions
    if (includes(input, inquiries)) {
        message = inquiriesAnswers[inquiries.indexOf(includes(input, inquiries))](input);

        return message;
    }

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
            inputObject.actions.push(stripPunc(key));

            // also, if the action does not require an objective than push a "_null" here to objects. 

        } else {
            inputObject.objects.push(stripPunc(key));
        }
    }
   
    return inputObject;
}

function returnMessage(inputObject) {
 
    // given current state of the game and new inputdata from user, return next message

    var message = "";

    // special case for questions -- they bypass the logic process here
    if (typeof inputObject == "string") {
        return inputObject;
    }

    actions = inputObject.actions;
    objects = inputObject.objects;

    if (actions.length != objects.length) {
        return "Sorry? You're not really making sense.";
    }

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

        if (myFutures.indexOf(objects[actions.indexOf("go")]) != -1) {
            myHistory.push(myLocation);
            myLocation = objects[actions.indexOf("go")];
            message += "You are now in the " + myLocation;
            
            locationObject = getStorylineJSON(myLocation);

            console.log(locationObject);

            aroundMe = locationObject.objects;
            myFutures = locationObject.futures;
            
        } else {
            message += "You can't go there. Sorry.";
        }

        isRepeat += 1;
    }

    // takes care of non-movement actions
    actions.forEach(function(word){
        if (word != "go") {
            // for each word, do
            // commands.$word(inputObject.objects[inputObject.actions.$current-index]);
            
            result = commands[commandList.indexOf(word)](objects[actions.indexOf(word)]);

            if (isRepeat >= 1 || actions.length >= 3) {
                message += ", ";
            }
            if (actions.length == isRepeat + 1 && actions.length > 1) {
                message += " and ";
            }
            // must add oxford comma here... #TODO
            
            if (objects[actions.indexOf(word)] != "_null") {
                message += "You " + commandPast[commandList.indexOf(word)] + " " + result;
            } else {
                message += result;
            }

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

    return message + ".";
}



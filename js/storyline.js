// Project Pathfinder JavaScript storyline model
// the storyline.json portion of this will be served to the client encrypted with v.js to prevent cheating

// Also later make a reserve of more than a dozen phrases for syntax errors, so it doesn't get repetitive

var storyline = {

    "beginning": {
        "fullName": "beginning",
        "objects": [],
        "narration": [
            "Wait",
            "Is... is that you?",
            "Remmi?",
            "Hold on, I think it's you",
            "Oh, god, please let it be you...",
            "It is! It is you!",
            "Please, don't turn away. Don't leave me. Just give me one second.",
            "I need to know it's you, for sure.",
            "...",
            "Okay, I'm alright.",
            "I'm guessing you're pretty confused right now. That's okay.",
            "You probably won't remember me, but I know you.",
            "I'm Aurelia. I used to be so close to you... but you fell... you fell Asleep.",
            "You're in a coma, Remmi. I hope you can here me.",
            "We're here, and we're here to help you out. But I don't know where you are.",
            "The best solution we have is just for you to look around. See what you can do."
        ],
        "futures": ["atrium"]
    },

    "atrium": {
        "fullName": "atrium",
        "objects": ["map__static", "candle", "wineglass"],
        "narration": [
          "Now, here's something!",
          "This is the atrium. Something like a great hall.",
          "From here, you can try to find other ways out of here."
        ],
        "futures": ["oblivion", "nirvana", "light"]
    },
    
    "oblivion": {
        "fullName": "room of oblivion",
        "objects": ["photo", "novel__readable"],
        "narration": [
          "Welcome to the Room of Oblivion."
        ],
        "novel": "Here's a story inside a story.",
        "futures": ["hallway", "staircase", "atrium", "laboratory"]
    },
    
    "nirvana": {
        "fullName": "room of nirvana",
        "objects": ["cat's cradle", "phonograph__static"],
        "narration": [
          "Welcome to the Room of Nirvana",
          "Are you feeling it yet?"
        ],
        "futures": ["staircase", "atrium", "darkroom"]
    },
    
    "light": {
        "fullName": "room of light",
        "objects": ["flashlight", "book__readable", "typewriter", "paintbrush"],
        "narration": [
          "Welcome to Light."
        ],
        "book": "This is simply a book",
        "futures": ["atrium", "corridor", "darkroom"]
    },
    
    "hallway": {
        "fullName": "hallway of time",
        "objects": ["picture frames"],
        "narration": [
          "I wonder what's in this hallway."
        ],
        "futures": ["oblivion"]
    },

    "staircase": {
        "fullName": "staircase of infinity",
        "objects": ["picture frames"],
        "narration": [
          "Careful.",
          "Don't fall down the staircase."
        ],
        "futures": ["oblivion", "nirvana"]
    },

    "laboratory": {
        "fullName": "laboratory",
        "objects": ["flask", "vial", "note"],
        "narration": [
          "Yes, it's a lab. But who's?"
        ],
        "futures": ["oblivion"]
    },

    "darkroom": {
        "fullName": "darkroom",
        "objects": ["oil lamp"],
        "narration": [
          "You might want to use something to light the place up."
        ],
        "futures": ["light"]
    },

    "corridor": {
        "fullName": "corridor",
        "objects": ["dust"],
        "narration": [
          "As far as corridors go, this one's pretty unique."
        ],
        "futures": ["light"]
    }

};

var narratedLocations = [];
var myLocation = "beginning"; // reference to a current location
var myRawLocation = "beginning";


var myRawFutures = ["atrium"]; // futures
var myFutures = myRawFutures.map(function(name) {
    return storyline[name].fullName;
});
var onHand = ["matchstick"]; // a list of items on hand
var aroundMe = []; // list of items in the environment
var staticAroundMe = [];
var readableAroundMe = [];

var myHistory = []; // a list of locations I was before

var trivials = ["the", "a", "to", "at", "into", "in", "and", "but", "or", "that", "this", "some", "now", "then", "again", "room", "time", "infinity", "of"];
var narrationInterval;

var commands = {
    
    "go": {
        "pastForm": "went",
        "hasArgs": true
    },

    "take": {
        "action": function(object) {
            if (aroundMe.indexOf(object) != -1 && staticAroundMe.indexOf(object) == -1) {
                onHand.push(object);
            
                objIndex = aroundMe.indexOf(object);
                aroundMe.splice(objIndex, 1);

                return "the " + object;

            } else {
                return "nothing. There isn't a " + object + " here you can take";
            }
        },
        "pastForm": "took",
        "hasArgs": true
    },

    "read": {
        "action": function(object) {

            if (readableAroundMe.indexOf(object) != -1) {
                return "it. It says: '" + storyline[myRawLocation][object] + "'";
            }

            return "nothing. You can't read that"
        },
        "pastForm": "read",
        "hasArgs": true
    },

    "look": {
        "action": function(object) {
            if (!(aroundMe[0])) {
                return "nothing";
            } else if (aroundMe.length == 1) {
                return "the " + aroundMe[0].toString();
            }
            
            return aroundMe.join(", ");
        },
        "pastForm": "saw",
        "hasArgs": false
    },

    "help": {
        "action": function(object) {
            return "You can go, take, look, and read";
        },
        "pastform": "helped",
        "hasArgs": false
    }
};

var inquiriesList = ["where", "who", "why", "what"];
var inquiries = {
    
    "where": function(){

        cango = myFutures.join(", ");
        
        response = "You are in the " + myLocation + ". You can go to the " + cango + ". ";

        if (myFutures.length == 0) {
            response = "You are in the " + myLocation + ". You can't go anywhere.";
        }

        return response;
    },

    "who": function(input){
        if (input.indexOf("you") > -1) {
            return "I'm Aurelia, and I know you. For now, I can't tell you much else.";
        }

        return "Well, that's for you to find out.";
    },

    "why": function(){
        return "Why are you here? Why are you anything? What's the world? All good questions, all without answers.";
    },

    "what": function(input){
        
        message = "There's ";

        if (input.indexOf("hand") > -1 || input.indexOf("hold") > 1 || input.indexOf("have") > -1) {

            message = "You have ";

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
};

function stripPunc(word) {
    return word.replace(/[.,\/!?;:()]/g,"");
}

function includes(str, array) {
    
    // checks if any words from given array occurs in a string str
    inv = false;
    sctr = str.toLowerCase();

    array.forEach(function(key){
        if (sctr.split(" ").indexOf(key) > -1) {
            inv = key;
        }   
    });     

    return inv;
} 

function narrate(narrationList, loc) {
    narrated = 0;

    $input = $("#inputline");

    $input.attr("disabled", true);

    if (narratedLocations.indexOf(loc) == -1) {
        narrationInterval = setInterval(function(){

            line = narrationList[narrated];

            var newLine = new Message({ content: line });

            var q = new MessageView({ model: newLine });
            messageBox.$el.append(q.render().$el);

            var messageList = $("#messagebox");
            messageList.scrollTop(messageList[0].scrollHeight);

            narrated ++;

            if (narrated == narrationList.length) {
                clearInterval(narrationInterval);
                $input.attr("disabled", false);
                $input.focus();
            }

        }, 2300);
        
        narratedLocations.push(loc);
    }

};

function parseMessage(input) {

    // given an input phrase, this parses it into a JS object
 
    // but first capture questions as exceptions
    if (includes(input, inquiriesList)) {
        message = inquiries[includes(input, inquiriesList)](input);

        return message;
    }

    var inputObject = {
        "actions": [],
        "objects": []
    };

		input.toLowerCase().split(" ").forEach(function(word) {
        
        if (!includes(word, trivials)) {
        
            if (commands[word]) {
               
                if (!commands[word].hasArgs) {
                    inputObject.objects.push("_null");
                }

                inputObject.actions.push(stripPunc(word));

            } else {
                inputObject.objects.push(stripPunc(word));
            }
        }

    });
   
    return inputObject;
}

function returnMessage(inputObject) {
 
    // given current state of the game and new inputdata from user, return next message

    var message = "";

    // special case for questions -- they bypass the logic process here
    if (typeof inputObject == "string") {
        return inputObject;
    }

    // nulls also exist
    if (!inputObject) {
        return "_null";
    }

    actions = inputObject.actions;
    objects = inputObject.objects;

    // if (actions.length != objects.length) {
    //     return "Sorry? You're not really making sense.";
    // }

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

    if (includes("go", actions)) {

        // check for duplicate "go"s -- only one is allowed.
        if (actions.sort()[actions.sort().indexOf("go") + 1] == "go") {
            return "Sorry, but you can only go to one place at a time.";
        }

        if (objects[actions.indexOf("go")] == "back") {
            objects[actions.indexOf("go")] = myHistory.pop();
            message += "You moved back.";
        }

        if (myRawFutures.indexOf(objects[actions.indexOf("go")]) != -1) {
            myHistory.push(myLocation);
            myLocation = storyline[objects[actions.indexOf("go")]].fullName;
            myRawLocation = objects[actions.indexOf("go")];
            
            locationObject = storyline[objects[actions.indexOf("go")]];

            aroundMe = locationObject.objects.map(function(obj){return obj.split("__")[0]});
            staticAroundMe = aroundMe.filter(function(obj) {
                if (locationObject.objects[aroundMe.indexOf(obj)].indexOf("static") > -1) {
                    return true;
                } else {
                    return false;
                }
            });
            readableAroundMe = aroundMe.filter(function(obj) {
                if (locationObject.objects[aroundMe.indexOf(obj)].indexOf("readable") > -1) {
                    return true;
                } else {
                    return false;
                }
            });

            myRawFutures = locationObject.futures;
            myFutures = myRawFutures.map(function(name) {
                return storyline[name].fullName;
            });

            // do some narration
            narrate(locationObject.narration, myLocation);

        } else {
            message += "You can't go there. Sorry.";
        }

        isRepeat ++;
    }

    // takes care of non-movement actions
    var actionCount = 0;
    actions.forEach(function(word){
        if (word != "go") {
      
            result = commands[word].action(objects[actionCount]);

            if (isRepeat >= 1 || actions.length >= 3) {
                message += ", ";
            }
            if (actions.length == isRepeat + 1 && actions.length > 1) {
                message += " and ";
            }
            
            if (objects[actionCount] != "_null") {
                message += "You " + commands[word].pastForm + " " + result;
            } else {
                message += result;
            }

            isRepeat ++;
            actionCount ++;
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

    return message + ". ";
}


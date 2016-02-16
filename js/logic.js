// It's a BackboneJS Application

// model for message
var Message = Backbone.Model.extend({
    
    defaults: {
        content: ""
    },

    validate: function() {
        if (!this.content) {
            return "Content cannot be null!";
        }
    }
});

// collection for prompts
var Messages = Backbone.Collection.extend({
    
    model: "Message"

});

// view for message
var MessageView = Backbone.View.extend({

    tagName: "p",

    render: function() {
        this.$el.append(this.model.escape("content"));
        
        return this;
    }

});

// view for collection of messages
var MessagesView = Backbone.View.extend({
    
    id: "messagebox",

    initialize: function(options) {
        this.eventstack = options.eventStack;

        this.eventstack.on("newInput", this.newMessage, this);
    },

    newMessage: function(newMessage) {
      
        // this will later also include responses from the storyline.js and interact with that JS

        var self = this;

        // new message logic here: {
        reply = returnMessage(parseMessage(newMessage));
        // }

        // post input
        var newPrompter = new Message({ content: newMessage });
        startmessages.add(newPrompter);

        var m = new MessageView({ model: newPrompter });
        this.$el.append(m.render().$el);

        if (reply != "_null") {
            // post reply
            var newReplyPrompter = new Message({ content: reply });
            startmessages.add(newReplyPrompter);
            
            var n = new MessageView({ model: newReplyPrompter });
            this.$el.append(n.render().$el);
        }

        return this;
    },

    render: function() {
        var self = this;

        this.collection.each(function(model){
            var m = new MessageView({ model: model });
            self.$el.append(m.render().$el);
        });

        return this;
    }

});

// view for input box
var InputView = Backbone.View.extend({

    id: "inputbox",

    initialize: function(options) {
        this.eventstack = options.eventStack;
    },

    events: {
        "keypress #inputline": "newInput"
    },

    newInput: function(e) {
        var $inputBox = $("#inputline")[0];

        if (e.keyCode == 13 && $inputBox.value != "") {
            var newInput = $inputBox.value;
            
            this.eventstack.trigger("newInput", newInput);

            $inputBox.value = "";
        }
    },

    render: function() {
        this.$el.html("<input id='inputline' placeholder='What next?' autofocus></input>");

        return this;
    }

});

// unifying event stack
var eventStack = _.extend({}, Backbone.Events)

// instantiate Models
var startmessages = new Messages();
startmessages.add([
    new Message({ content: "This is your world" }),
    new Message({ content: "You are free to create" }),
    new Message({ content: "But not free to leave" })
]);

// instantiate DOM elements
var messageBox = new MessagesView({ collection: startmessages, eventStack: eventStack });
var inputBox = new InputView({ eventStack: eventStack });

$("#gamebox").append(messageBox.render().$el);
$("#gamebox").append(inputBox.render().$el);




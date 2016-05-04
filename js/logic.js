// It's a BackboneJS Application

var showTimer;
var inputCount = 0;

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
 
        setTimeout(function(){
            $("#messagebox").children().addClass("visible");
        },5);
  
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
      
        var self = this;

        // new message logic here: {
        reply = returnMessage(parseMessage(newMessage));
        // }

        // post input
        var newPrompter = new Message({ content: newMessage });
        startmessages.add(newPrompter);

        var m = new MessageView({ model: newPrompter });
        this.$el.append(m.render().$el);

        var messageList = $("#messagebox");
        messageList.scrollTop(messageList[0].scrollHeight);
 
        if (reply.indexOf("_null") == -1) {

            var newReplyPrompter = new Message({ content: reply });
            startmessages.add(newReplyPrompter);

            setTimeout(function(){
          
                var n = new MessageView({ model: newReplyPrompter });
                self.$el.append(n.render().$el);

                var messageList = $("#messagebox");
                messageList.scrollTop(messageList[0].scrollHeight);
            
            }, 1500);

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
            inputCount++;

            if (inputCount > 3) {
                document.getElementById("inputline").placeholder = "";
            }
        }
    },

    render: function() {
        this.$el.html("<input id='inputline' placeholder='Do something...' autofocus></input>");

        return this;
    }

});

// unifying event stack
var eventStack = _.extend({}, Backbone.Events)

// instantiate Models
var startmessages = new Messages();
narrate(storyline["beginning"].narration, "beginning");

// instantiate DOM elements
var messageBox = new MessagesView({ collection: startmessages, eventStack: eventStack });
var inputBox = new InputView({ eventStack: eventStack });

$("#gamebox").append(messageBox.render().$el);
$("#gamebox").append(inputBox.render().$el);




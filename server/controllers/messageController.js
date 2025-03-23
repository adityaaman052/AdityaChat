const Messages = require("../models/messageModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    // Check if from/to are in body, query, or params
    const from = req.body.from || req.query.from || req.params.from;
    const to = req.body.to || req.query.to || req.params.to;
    
    if (!from || !to) {
      return res.status(400).json({ msg: "From and to users are required" });
    }

    // Find messages between the two users
    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    // Map the messages to the expected format
    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        createdAt: msg.createdAt
      };
    });
    
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    
    if (!from || !to || !message) {
      return res.status(400).json({ msg: "From, to, and message are required" });
    }

    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};
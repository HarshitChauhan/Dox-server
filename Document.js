const { Schema, model} =require("mongoose");

const Document = new Schema({
    _id: String,
    data: Object
});

//model("< model name any >", < our schema name >)
module.exports = model("Document", Document);
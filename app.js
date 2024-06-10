const express = require("express");
// const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const dotenv = require('dotenv');
dotenv.config();

const USER_NAME = process.env.DATABASE_USER_NAME

const PASSWORD = process.env.DATABASE_PASSWORD;


const app = express();

// app.use(bodyParser.urlencoded({extended: true, limit: "5000mb", parameterLimit: 1000000000000}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const port = 3000;

mongoose.connect(`mongodb+srv://${USER_NAME}:${PASSWORD}@cluster0.qrml7jb.mongodb.net/todoListDB`);

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

// const WorkItem = mongoose.model("workItem", itemSchema);

const item1 = new Item({ name: "Wecome to your To Do List!" });
const item2 = new Item({ name: "Hit the + button to add a new item." });
const item3 = new Item({ name: "← check this to delete an item." });

const defaultItems = [item1, item2, item3];


// const items = ["Buy food"];
// const workItems = [];


app.get("/", async (req, res) => {

    // const day = date.getDate();

    const items = await Item.find({});

    if(items.length === 0) {
        await Item.insertMany(defaultItems);
        res.redirect("/");
    } else {
        // checks for list.ejs in folder called views
        res.render("list", {listTitle: "Today", newListItems: items});
    }   
    
});

app.post("/", async (req, res) => {
    
    const newItemName = req.body.newItem;
    const listTitle = req.body.list;

    if ( listTitle!== "Today") {
        const NewItem = mongoose.model(`${listTitle}Item`, itemSchema);
        const newItem = new NewItem({ name: newItemName });
        await newItem.save();
        res.redirect(`/${req.body.list}`);

    } else {
        const item = new Item({ name: newItemName });
        await item.save();
        res.redirect("/");

    }
});

// app.get("/work", async (req, res) => {

//     const workItems = await WorkItem.find({});
//     res.render("list", {listTitle: "Work List", newListItems: workItems})
// });

app.get("/about", (req, res) => {
    res.render("about");
});

app.post("/delete", async (req, res) => {
    // console.log(req.body);
    const checkedId = req.body.itemId;
    const listTitle = req.body.list;
    
    if(listTitle === "Today") {
        // const NewItem = mongoose.model("Item", itemSchema);
        await Item.findByIdAndDelete({_id: checkedId});
        res.redirect("/");
    } else {
        const NewItem = mongoose.model(`${listTitle}Item`, itemSchema);
        await NewItem.findByIdAndDelete({_id: checkedId});
        res.redirect(`/${listTitle}`);
    }
    
});

app.get("/:customListName", async (req, res) => {
    const listTitle = _.startCase(req.params.customListName);
    const NewItem = mongoose.model(`${listTitle}Item`, itemSchema);
    const newItems = await NewItem.find({});

    res.render("list", {listTitle: listTitle, newListItems: newItems});
    
})



app.listen(port, ()=> {
    console.log(`Server is listening on port ${port}`);
});
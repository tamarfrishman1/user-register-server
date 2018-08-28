const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require("body-parser");
const cors=require("cors");

const app = express();
const basePath = path.join(__dirname + "/dist");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get(`/`, (req, res) => {
    let linkList = "";
    let resPage = fs.readFileSync("links.html", "utf-8");
    console.log(resPage);
    fs.readdir(basePath, (err, files) => {
        files.forEach((file) => {
            linkList += `<li><a href="/${file}" target="blank">${file}</a></li>`;
        })
        res.send(resPage.replace("placeHolder", linkList));
    });

});

fs.readdir(basePath, (err, files) => {
    files.forEach((file) => {
        app.use(express.static(`${basePath}/${file}`));
        app.get(`/${file}`, (req, res) => {
            res.sendFile(`${basePath}/${file}/index.html`);
        });
    })
});

app.post("/api/user", (req, res) => {

    let isvalidUser = true;

        console.log(req.body);
        //check tz:
        let total = 0;
        let tz = req.body["tz"];
        for (i = 0; i < 9; i++) {
            let x = (((i % 2) + 1) * tz[i]);
            total += Math.floor(x / 10) + x % 10;
        }
        if (total % 10 != 0)
            isvalidUser = false;

        //check age:

        if (req.body["age"] > 120 || req.body["age"]< 0)
            isvalidUser = false;

        //check name:
        if (req.body["name"].length > 15 || req.body["name"].length < 3)
            isvalidUser = false;

        //check male
        if (typeof JSON.parse(req.body["isMale"]) != "boolean")
            isvalidUser = false;

        let countryList = require('./countries.json');
        let usersList = require('./user.json');

        if (!countryList.includes(req.body["country"]))
            isvalidUser = false
        if (isvalidUser == true) {
            usersList.push(req.body);
            fs.writeFileSync("user.json", JSON.stringify(usersList));
            res.status(201).send(JSON.stringify(usersList));
        }
        else res.status(400).send();
   
})



const port = process.env.PORT || 3900;
app.listen(port, () => { console.log(`OK`); });


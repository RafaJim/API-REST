const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'CRUD',
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}))

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if(typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

app.post("/login", (req, res) => {
    const userName = req.body.userName;
    const password = req.body.password;

    const sqlLogin = "SELECT username, pass FROM users where username = ? AND pass = ?;";
    db.query(sqlLogin, [userName, password], (err, result) => {

        if(result[0] == null) {
            res.send(false);
        } else {
            const payload = {
                userName: userName,
                password: password
            }

            const secret = "secret";
            const options = {
                expiresIn: "1h"
            }

            jwt.sign(payload, secret, options, (err, token) => {
                res.json({ token });
            });
        }
    });

    res.status(200);
});

app.get("/movies", verifyToken, (req, res) => {
    jwt.verify(req.token, "secret", (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
            const sqlSelect = "SELECT * FROM movieReviews;";
            db.query(sqlSelect, (err, result) => {
                res.send(result);
            });
            // res.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");
        }
    });
});

app.post("/movies", (req, res) => {
    const movieName = req.body.movieName;
    const movieReview = req.body.movieReview;
    const createdAt = req.body.createdAt;

    const sqlInsert = "INSERT INTO movieReviews (movieName, movieReview,createdAt) VALUES (?, ?, ?);";
    db.query(sqlInsert, [movieName, movieReview, createdAt], (err, result) => {
        if(err) console.log(err);
    });

    res.status(200);
});

app.delete('/movies/:id', (req, res) => {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM movieReviews WHERE id = ?;";
    db.query(sqlDelete, id, (err, result) => {
       if(err) console.log(err);
    });

    res.status(200);
});

app.put('/movies', (req, res) => {
    const id = req.body.id;
    const movieReview = req.body.movieReview;

    const sqlUpdate = "UPDATE movieReviews SET movieReview = ? Where id = ?;";
    db.query(sqlUpdate, [movieReview, id], (err, result) => {
       if(err) console.log(err);
    });
    res.send({id:req.body.id}).status(201);
});

app.listen(3001, () => {
    console.log('server running on port 3001');
});
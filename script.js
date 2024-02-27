const fs = require("fs");
const mysql = require("mysql2");
const conf = require("./conf.js");
const connection = mysql.createConnection(conf);

const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const { parseArgs } = require("util");
const app = express();

// Parte db
const executeQuery = (sql) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) {
        console.error(err);
        reject();
      }
      console.log("done");
      resolve(result);
    });
  });
};

const insertUser = (m) => {
  const sql = `INSERT INTO User (username) VALUES ("` + m + `")`;
  return executeQuery(sql);
};

const insertCalcolare = (q, w, e, r) => {
  const sql =
    `INSERT INTO Calcolare (idUser, titleGroup, timestamp, rating) VALUES (` +
    q +
    `,"` +
    w +
    `",` +
    e +
    `,` +
    r +
    `)`;
  return executeQuery(sql);
};

const selectUser = () => {
  const sql = `
    SELECT * FROM User JOIN "Group"
       `;
  return executeQuery(sql);
};

const selectQuestion = () => {
  const sql = `
    SELECT Group.titleGroup, timer, value, sentence FROM "Group" JOIN Question ON Group.titleGroup = Question.titleGroup JOIN "Option" ON Option.idQuestion = Question.idQuestion
       `;
  return executeQuery(sql);
};

const selectRatings = () => {
  const sql = `
    SELECT timestamp, rating, username FROM Calcolare JOIN User ON User.idUser = Calcolare.idUser
       `;
  return executeQuery(sql);
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, "public")));
const server = http.createServer(app);
server.listen(80, () => {
  console.log("- server running");
});
let scores = [];
let answers = {};
app.get("/questions", (req, res) => {
  let questions = {};
  //inviare
  selectQuestion().then((result) => {
    questions["title"] = result[0].titleGroup;
    questions["timer"] = parseInt(result[0].timer);
    let count = -1;
    const arr = [];
    for (let index = 0; index < result.length; index++) {
      if (result[index].sentence !== arr[count]?.question) {
        count++;
        arr.push({
          id: count,
          question: result[index].sentence,
          answers: [result[index].value],
        });
      } else {
        arr[count].answers.push(result[index].value);
      }
    }
    questions["questions"] = arr;
    res.json({ questions: questions });
  });
});

app.get("/ratings", (req, res) => {
  //inviare
  selectRatings().then((result) => {
    res.json({ ratings: result });
  });
});

app.post("/answers", (req, res) => {
  //prendere
  answers = req.body.cose;
  insertUser(answers.username).then(() => {
    selectUser().then((appoggio) => {
      calcolaPunteggio(answers).then((a) => {
        insertCalcolare(
          appoggio[0].idUser,
          appoggio[0].titleGroup,
          answers.timestamp,
          a
        ).then(() => {
          res.json({ result: "Ok" });
        });
      });
    });
  });
});

async function calcolaPunteggio(answers) {
  let count = 0;
  const queryPromises = answers.answers.map(async (element) => {
    const result = await executeQuery(
      `SELECT * FROM "Option" WHERE idQuestion=` + (element.id + 1)
    );
    count += result[parseInt(element.value) - 1].points;
  });
  await Promise.all(queryPromises);
  return count;
}

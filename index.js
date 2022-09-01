const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3005;
const fs = require('fs');
const dataj = fs.readFileSync("./database.json");
const parseData = JSON.parse(dataj);
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(express.json());
app.use(cors());

//데이터베이스 연결
const connection = mysql.createConnection({
    host: parseData.host,
    user:parseData.user,
    password:parseData.password,
    port:parseData.port,
    database: parseData.database
})

// music 페이지
app.get('/music', async (req, res) => {
    connection.query(
        "select * from music",
        (err, rows, fileds) => {
            res.send(rows);
            console.log(err);
        }
    )
});

// CD & DVD (elbum) 페이지
app.get('/elbum', async (req, res) => {
    connection.query(
        "select * from elbum",
        (err, rows, fileds) => {
            res.send(rows);
            console.log(err);
        }
    )
})

// md 페이지
app.get('/md', async (req, res) => {
    connection.query(
        "select * from md",
        (err, rows, fileds) => {
            res.send(rows);
            console.log(err);
        }
    )
})

// Artist 페이지
app.get('/artist', async (req, res) => {
    connection.query(
        "select * from artist",
        (err, rows, fileds) => {
            res.send(rows);
            console.log(err);
        }
    )
})

// 회원가입 요청
app.post("/join", async(req, res) => {
    let myPlanintextPass = req.body.userpass;
    let myPass = "";
    if(myPlanintextPass != '' && myPlanintextPass != undefined) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(myPlanintextPass, salt, function(err, hash) {
                // Store hash in your password DB
                myPass = hash;
                console.log(myPass);
                // 쿼리 작성
                const { userid, username, useremail, userphone, useraddr } = req.body;
                connection.query("insert into member(id,password,name,email,phone,address) values(?,?,?,?,?,?)",
                [userid, myPass, username, useremail, userphone, useraddr],
                (err, result, fields) => {
                    console.log(result);
                    console.log(err);
                    res.send("등록되었습니다.");
                }
                )
            })
        })
    }
})

// 로그인 요청
app.post('/login', async(req, res) => {
    // useremail 값에 일치하는 데이터가 있는지 select문
    // userpass 암호화해서 쿼리 결과의 패스워드랑 일치하는지를 체크
    const { id, password } = req.body;
    console.log(req.body);
    connection.query(`select * from member where id = '${id}'`,
        (err, rows, fields) => {
            if(rows != undefined) {
                if(rows[0] == undefined) {
                    res.send("1번실패")
                }else {
                    bcrypt.compare(password, rows[0].password, function(err, flag) {
                        if(flag == true) {
                            res.send(rows[0])
                        }else {
                            res.send("2번실패");
                        }
                    });
                }
            }else {
                res.send("3번실패");
            }
        }
    )
})

app.listen(PORT, ()=>{
    console.log('서버가 실행됐습니다');
});

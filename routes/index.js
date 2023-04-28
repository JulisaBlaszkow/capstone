const express = require('express');
const router = express.Router();


const bodyParser = require('body-parser');
//const canvas = require('canvas');
const width = 1000;
const height = 1000;

// const app = express();
const port = 3000;

//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

//app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('data.db', (err) => {
    if (err) {
        //cannot open database
        return console.error(err.message);

    }

    console.log('connected to in memory SQlite database');
});

// db.close((err)=>{
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('close the databases connection');
// });

// router.get('/',(req,res) => {
//     res.send("hello world")
//     console.log('hihihih');
//     console.log(req.body);
// });

/* GET home page. */
router.post('/', function (req, res, next) {
    console.log("asdfljjasldfjalsdjf");
    console.log("HIIII: " + JSON.stringify(req.body));
    console.log("test" + req.body.sensor, req.body.time, req.body.data[0])
    res.render('index', {title: 'Express'});

    // db.each('SELECT * from demotwo;' , function(err, rows){
    //   console.log(rows);
    // })
    // db.run('' , [], function (res, e) {});



    db.run(`INSERT INTO dennis(x, y) VALUES (?, ?);`, [[req.body.time], req.body.data[0]], function (err) {
        if (err) {
            return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
 });








//http://localhost:3000/   chart now lives here
//data now lives here
//practice querrying in the console

// let sql = "SELECT x date,\n" +
//     "       y val\n" +
//     "FROM demoTable\n "
// ;

let sql = "SELECT ID, x date, y val\n" +
    "FROM dennis\n" +
    "WHERE x >= IFNULL((SELECT x\n" +
    "                   FROM dennis AS T2\n" +
    "                   ORDER BY x DESC\n" +
    "                   LIMIT 1 OFFSET 339),0)";

router.get('/data', async function (req, res) {
    const results = [];
    try {
        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            } else {

                rows.forEach((row) => {
                    //console.log(row.date, + "   "+ row.val);
                    results.push({x: row.date, y: row.val});
                });
            }
            //res.send(JSON.stringify(results));
           //console.log(results);
            res.json(results);
        });
    }catch (err){
           console.log(err)
         }
    });

router.get('/energy', async function (req, res) {
    const finalout = [];
    const values = [];
    const out = [];
    const outout = [];
    const timestamps = [];
    try {
        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            } else {

                rows.forEach((row) => {
                    //console.log(row.date, + "   "+ row.val);
                    //results.push({x: row.date, y: row.val});
                    timestamps.push(row.date);
                    values.push(row.val);
                    //outout.push(0);
                });
                console.log(values.length);
                while (values.length>0){
                    const next = values.splice(0,17)
                    //const timeanchor = timestamps.splice(0,20)
                    const sum = next.reduce((a,b) => {
                            return a + b;

                    },0);
                    out.push(sum);

                }

            }

            //res.send(JSON.stringify(results));
            //console.log("output    " + out);
            let n = 0;
            let m = 0;
            let u =0;
            for(n=0;n<out.length;n++){
                u = out[n];
                //console.log("temp" +temp);
                for(m=0;m<17;m++){
                    //console.log("temp" +temp);
                    outout.push(u);
                }

            }
            //console.log("OUTOUT    " + outout);
            timestamps.forEach((t,o) => {
                finalout.push({x: timestamps[o], y:outout[o]})
            });
            //console.log(finalout)

            res.json(finalout);
        });
    }catch (err){
        console.log(err)
    }
});








module.exports = router;
const express = require('express');
const router = express.Router();
//const GoogleChartsNode = require('google-charts-node');



const bodyParser = require('body-parser');
const canvas = require('canvas');
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



    db.run(`INSERT INTO demoTable(x, y) VALUES (?, ?);`, [[req.body.time], req.body.data[0]], function (err) {
        if (err) {
            return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
 });


const chartCallback = (ChartJs) => {
    console.log('chart rebuilt ');
}

async function createImage() {
    const labels = Utils.months({count: 7});
    const data = {
        labels: labels,
        datasets: [{
            label: 'My First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)'
            ],
            borderWidth: 1
        }]
    };
    const config = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
    };


    //const dataUrl = await caguration); // convasRenderService.renderToBuffer(confinverts chart to image
    // console.log(dataUrl); this does not actually print anything here
    const dataUrl = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUA\n" +
        "    AAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO\n" +
        "        9TXL0Y4OHwAAAABJRU5ErkJggg==\" alt=\"Red dot"
    return dataUrl;
}


// let sql = "SELECT x date,\n" +
//     "       y val\n" +
//     "FROM demoTable\n "
// ;

//let results = [];


//Table Extract worked until an attempt was made to call it inside router.get ()
// and then it decided it didn't know what db.all was and i got db.all is not a function smhh

// function TableExtract (db, callback){
//
//     db.all(sql,[1], (err,rows) => {
//         if (err){
//             throw err;
//         }
//         else{
//             // console.log("read from experiment: " + row.date  + "  "+ row.val + "  " + row.day );
//             rows.forEach((row)=>{
//                 results.push(row.val);
//             });
//         }
//         console.log(results);
//
//     });
// }

// TableExtract(db, function(err,content){
//     if(err) throw (err);
//     let Extractedval = content;
//     console.log = ("wheee" , Extractedval);
//     return Extractedval
// });

// const TableInside = TableExtract(db, function(err,content){
//     if(err) throw (err);
//     let Extractedval = content;
//     console.log = ("wheee" , Extractedval);
//     return Extractedval
// })

//replace random numbers with stuff from the database.
//query database within the function
//(maybe need to loop through rows)
//0. make the chart look like what i want, with static random data
//2. successfully console log the data and that it looks like data that should go into the chart
//3. instead of printing it then JSON Stringify it and and send it as a response

//http://localhost:3000/   chart now lives here
//data now lives here
//practice querrying in the console

// let sql = "SELECT x date,\n" +
//     "       y val\n" +
//     "FROM demoTable\n "
// ;

let sql = "SELECT ID, x date, y val\n" +
    "FROM demoTable\n" +
    "WHERE x >= IFNULL((SELECT x\n" +
    "                   FROM demoTable AS T2\n" +
    "                   ORDER BY x DESC\n" +
    "                   LIMIT 1 OFFSET 30),0)";

router.get('/data', async function (req, res) {
    const results = [];
    try {
        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            } else {

                rows.forEach((row) => {
                    console.log(row.date, + "   "+ row.val);
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



        //NO MORE SSR
        // const numbers = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        //console.log(numbers);
        // res.send(JSON.stringify(results));
        // try{
        //   const image = await createImage()
        //   //res.type("image/png")
        //   //res.send(image)
        //
        // }catch (err){
        //   console.log(err)
        // }
        //
        // //res.send("hello world")
        // console.log('hihihih');
        // //console.log(req.body);
    });





module.exports = router;
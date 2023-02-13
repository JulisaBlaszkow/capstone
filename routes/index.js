const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const canvas = require('canvas');
const {ChartJSNodeCanvas} = require('chartjs-node-canvas');
const width = 1000;
const height = 1000;

// const app = express();
const port = 3000;

//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

//router.get('/',(req,res) => {
//  res.send("hello world")
//  console.log('hihihih');
//  console.log(req.body);
//});

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

/* GET home page. */
router.post('/', function(req, res, next) {

  console.log("HIIII: " + JSON.stringify(req.body));
  console.log("test" + req.body.sensor, req.body.time, req.body.data[0])
  res.render('index', { title: 'Express' });
  // db.each('SELECT * from dennis;' , function(err, rows){
  //   console.log(rows);
  // })
  // db.run('' , [], function (res, e) {});
  db.run(`INSERT INTO dennis(x, y) VALUES (?, ?);`, [[req.body.time], req.body.data[0]], function(err) {
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
const canvasRenderService = new ChartJSNodeCanvas({width, height, chartCallback});
async function createImage () {

  const configuration = {
    type: 'line',
    data: {
      labels: [1,2,3,4,5,6,7],
      datasets: [{
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75,192,192)',
        tension: 0.1
      }]
    }
  }

  //const dataUrl = await caguration); // convasRenderService.renderToBuffer(confinverts chart to image
 // console.log(dataUrl); this does not actually print anything here
  const dataUrl = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUA\n" +
      "    AAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO\n" +
      "        9TXL0Y4OHwAAAABJRU5ErkJggg==\" alt=\"Red dot"
  return dataUrl;
};

router.get('/',async function (req,res){
  try{
    const image = await createImage()
    //res.type("image/png")
    //res.send(image)
    res.send( '<html>'+
        '<head></head>'+
        '<body>'+
        //'<img src = "${image}" />' +
        // '<img src = {image} />' +
        '<img src="' + image + '"/>' +
        //'<img src = image />' +
        //'<img src= +image+>'+
        //^this does not quite work. shows like the little 'not found image icon' thingie.

        // '<img src="data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUA\n' +
        // '    AAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO\n' +
        // '        9TXL0Y4OHwAAAABJRU5ErkJggg==" alt="Red dot" />'+
        //^this works
        '</body>'+
        '</html>')
    console.log(image);
    console.log('wheeee');
  }catch (err){
    console.log(err)
  }

  //res.send("hello world")
  console.log('hihihih');
  //console.log(req.body);
});


module.exports = {
  createImage   //for exporting to another file
}


module.exports = router;
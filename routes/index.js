var express = require('express');
var router = express.Router();
var arr={}
let resCounter=-1
let arrTimesOfChange={}
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/addResponse',(req,res)=>{
    console.log('hi...')
    resCounter++
    console.log("send..."+req.body.date+" "+req.body.name+" "+req.body.resp)
    if(req.body.date in arr) {
        arr[`${req.body.date}`].push({name: req.body.name, resp: req.body.resp, resCounter: resCounter});
        arrTimesOfChange[`${req.body.date}`]=new Date().toLocaleString()
    }
    else {
        arr[`${req.body.date}`] = [{name: req.body.name, resp: req.body.resp, resCounter: resCounter}];
        arrTimesOfChange[`${req.body.date}`] = new Date().toLocaleString()
    }
        console.log(arr[`${req.body.date}`])
    res.json(arr[`${req.body.date}`]);
});
//write a function that gets the DELETE api from the client and deletes the response with the id and date
router.delete('/deleteResponse',(req,res)=>{
    let date = req.body.date.split('showRes')[0];
    console.log(date)
    //console.log("delete..."+req.body.date+" "+req.body.id)
    let numberId = parseInt(req.body.id);
    //delete the response with the id and date from arr not using "filter"
    console.log(arr[`${date}`])
    console.log(date)
    arr[`${date}`]=arr[`${date}`].filter(elem=>elem.resCounter!=numberId)
    arrTimesOfChange[`${date}`]=new Date().toLocaleString()

    res.json(arr[`${date}`]);
});
router.get('/getResponses/:date',(req,res)=>{
    if(req.params.date in arr)
         res.json(arr[`${req.params.date}`]);
    else
        res.json([]);
});
module.exports = router;

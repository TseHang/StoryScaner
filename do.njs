#!/usr/local/bin/node

var querystring = require('querystring'),
    fs = require('fs'),
    param = querystring.parse(process.env.QUERY_STRING),
    dic = JSON.parse(fs.readFileSync('name.json', 'utf8')),
    id = querystring.parse(process.env.QUERY_STRING).id ;
    //birthday = querystring.parse(process.env.QUERY_STRING).birthday;

console.log('Access-Control-Allow-Origin: *');
console.log('Content-type: text/plain; character=utf-8\n');

if (id === '*') {
    console.log(JSON.stringify(dic));
} else if (id in dic) {
    console.log(dic[id]);
} else {
    console.log("查無此學號");
}
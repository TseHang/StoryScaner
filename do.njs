#!/usr/local/bin/node

var querystring = require('querystring'),
    fs = require('fs'),
    param = querystring.parse(process.env.QUERY_STRING),
    dic = JSON.parse(fs.readFileSync('name.json', 'utf8')),
    id = querystring.parse(process.env.QUERY_STRING).id;

console.log('Content-type: text/plain; character=utf-8\n');
console.log('Access-Control-Allow-Origin: *\n');

if (id in dic) {
    console.log(dic[id]);
} else {
    console.log("查無此學號");
}

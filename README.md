# iterate79

A Simple JavaScript Iterator.

## Install

```
$ npm install --save iterate79
```

## Usage

### 配列を直列処理する

```js
var it79 = require('iterate79');
it79.ary(
	[
		'one',
		'two',
		'three'
	] ,
	function(it, data, idx){
		console.log(data);// <- 'one', next 'two', next 'three'
		console.log(idx);// <- 0, next 1, next 2
		setTimeout(function(){
			it.next();
		}, 100);
	},
	function(){
		console.log('done!');
	}
);
```

### オブジェクト(連想配列)を直列処理する

```js
var it79 = require('iterate79');
it79.ary(
	{
		'one': 1,
		'two': 2,
		'three': 3
	} ,
	function(it, data, idx){
		console.log(data);// <- 1, next 2, next 3, ...
		console.log(idx);// <- 'one', next 'two', next 'three', ...
		setTimeout(function(){
			it.next();
		}, 100);
	},
	function(){
		console.log('done!');
	}
);
```

### 配列から複数件ずつ並列処理する(bundle機能)

```js
var it79 = require('iterate79');
it79.ary(
	{
		'one': 1,
		'two': 2,
		'three': 3,
		'four': 4,
		'five': 5,
		'six': 6,
		'seven': 7,
		'eight': 8
	} ,
	3, // 3件ずつ並行処理する
	function(it, data, idx){
		it.next();
	},
	function(){
		console.log('done!');
	}
);
```

### 配列の直列処理を中断する

```js
var it79 = require('iterate79');
it79.ary(
	{
		'one': 1,
		'two': 2,
		'three': 3,
		'four': 4,
		'five': 5,
		'six': 6,
		'seven': 7,
		'eight': 8
	} ,
	function(it, data, idx){
		setTimeout(function(){
			if( idx == 'five' ){
				it.break() // 'five' のときに中断し、その後の処理は実行しない
			}else{
				it.next();
			}
		}, 100);
	},
	function(){
		console.log('done!');
	}
);
```

### 関数を直列処理する

```js
var it79 = require('iterate79');
it79.fnc(
	{} , // <- initial value of `arg`.
	[
		function(it, arg){
			console.log(arg.test); // <- undefined
			arg.test = 1;
			it.next(arg);
		},
		function(it, arg){
			console.log(arg.test); // <- 1
			arg.test = 2;
			it.next(arg);
		},
		function(it, arg){
			console.log(arg.test); // <- 2
			it.next();
		}
	]
);
```

### 関数の直列処理で連想配列のキーを指定してジャンプする

```js
var it79 = require('iterate79');
it79.fnc(
	{} , // <- initial value of `arg`.
	{
		'fnc1': function(it, arg){
			arg.test = 1;
			it.goto('fnc3', arg); // fnc2 をスキップして fnc3 へ進む
		},
		'fnc2': function(it, arg){
			arg.test = 2; // この関数はスキップされる
			it.next(arg);
		},
		'fnc3': function(it, arg){
			console.log(arg.test); // <- 1
			it.next(arg);
		}
	}
);
```

### 関数の直列処理を中断する

```js
function( callback ){
	var it79 = require('iterate79');
	it79.fnc(
		{} , // <- initial value of `arg`.
		{
			'fnc1': function(it, arg){
				arg.test = 1;
				callback();
				it.break(); // ここで中断。fnc2以降は実行されない。
			},
			'fnc2': function(it, arg){
				arg.test = 2; // この関数はスキップされる
				it.next(arg);
			},
			'fnc3': function(it, arg){
				arg.test = 3; // この関数はスキップされる
				callback();
			}
		}
	);
}
```

## Change log

### iterate79 1.0.0 (2016-11-20)

- `ary()` に、 bundle機能を追加。複数件ずつ並列して処理するオプション。
- `ary()` に、 `it.break()` を追加。配列の直列処理を途中で抜けられるようになった。
- `fnc()` で、 連想配列に格納された関数群を直列処理できるようになった。
- `fnc()` に、 `it.goto()` を追加。関数の添字を指定してジャンプできるようになった。
- `fnc()` に、 `it.break()` を追加。関数の直列処理を途中で抜けられるようになった。

### iterate79 0.1.0 (2016-09-05)

- stack overflow が起きることがある不具合を修正。

### iterate79 0.0.1 (2015-08-20)

- initial release.

## License

MIT License.

## Author

Tomoya Koyanagi (@tomk79)

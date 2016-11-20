# node-iterate79

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
		console.log(data);// <- 1, next 2, next 3
		console.log(idx);// <- 'one', next 'two', next 'three'
		setTimeout(function(){
			it.next();
		}, 100);
	},
	function(){
		console.log('done!');
	}
);
```

### 配列から複数件ずつ並列処理する

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
	3,
	function(it, data, idx){
		console.log(data);// <- 1, next 2, next 3
		console.log(idx);// <- 'one', next 'two', next 'three'
		setTimeout(function(){
			it.next();
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
			setTimeout(function(){
				it.next(arg);
			},1000);
		},
		function(it, arg){
			console.log(arg.test); // <- 1
			arg.test = 2;
			setTimeout(function(){
				it.next(arg);
			},10);
		},
		function(it, arg){
			console.log(arg.test); // <- 2
			it.next();
		}
	]
);
```


## License

MIT License.

## Author

Tomoya Koyanagi (@tomk79)

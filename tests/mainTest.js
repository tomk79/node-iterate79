var assert = require('assert');
var path = require('path');
var fs = require('fs');
var it79 = require(__dirname+'/../node/main.js');

describe('配列の直列処理', function() {

	it('配列を処理する(配列)', function(done) {
		this.timeout(10000);

		var ary = [
			'one',
			'two',
			'three',
			'four',
			'five',
			'six'
		];
		it79.ary(
			ary ,
			function(it, data, idx){
				assert.equal(data, ary[idx]);
				setTimeout(function(){
					it.next();
				}, 100);
			},
			function(){
				assert.equal(1, 1);
				done();
			}
		);
	});

	it('配列を処理する(連想配列/オブジェクト)', function(done) {
		this.timeout(10000);

		var obj = {
			'one': 1,
			'two': 2,
			'three': 3,
			'four': 4,
			'five': 5,
			'six': 6
		};
		it79.ary(
			obj ,
			function(it, data, idx){
				assert.equal(data, obj[idx]);
				setTimeout(function(){
					it.next();
				}, 100);
			},
			function(){
				assert.equal(1, 1);
				done();
			}
		);
	});

	it('配列を複数件ずつ並列処理する', function(done) {
		this.timeout(700);

		var val = 0;
		var obj = {
			'one': 1,
			'two': 2,
			'three': 3,
			'four': 4,
			'five': 5,
			'six': 6,
			'seven': 7,
			'eight': 8
		};
		it79.ary(
			obj ,
			3, // 3件ずつ並列処理
			function(it, data, idx){
				assert.equal(data, obj[idx]);
				val ++;
				setTimeout(function(){
					it.next();
				}, 100);
			},
			function(){
				assert.equal(val, 8);
				done();
			}
		);
	});

	it('配列の直列処理を中断する', function(done) {
		this.timeout(1000);

		var lastKey = 0;
		var lastVal = 0;
		var obj = {
			'one': 1,
			'two': 2,
			'three': 3,
			'four': 4,
			'five': 5,
			'six': 6,
			'seven': 7,
			'eight': 8
		};
		it79.ary(
			obj ,
			3, // 3件ずつ並列処理
			function(it, data, idx){
				assert.equal(data, obj[idx]);
				lastKey = idx;
				lastVal = data;
				setTimeout(function(){
					if(idx == 'five'){
						it.break();//ここで直列処理を中断して抜ける
					}else{
						it.next();
					}
				}, 100);
			},
			function(){
				assert.equal(lastKey, 'six');// 端数の途中で break したので、six までは実行される。
				assert.equal(lastVal, 6);
				done();
			}
		);
	});

});

describe('メソッドの直列処理', function() {

	it('関数を直列処理する(暗黙的start)', function(done) {
		this.timeout(5000);

		it79.fnc(
			{} , // <- initial value of `arg`.
			[
				function(it, arg){
					assert.equal(arg.test, undefined);
					arg.test = 1;
					setTimeout(function(){
						it.next(arg);
					},1000);
				},
				function(it, arg){
					assert.equal(arg.test, 1);
					arg.test = 2;
					setTimeout(function(){
						it.next(arg);
					},10);
				},
				function(it, arg){
					assert.equal(arg.test, 2);
					done();
					it.next(arg);
				}
			]
		);
	});

	it('関数を直列処理する(明示的start)', function(done) {
		this.timeout(5000);

		it79.fnc([
			function(it, arg){
				assert.equal(arg.test, undefined);
				arg.test = 1;
				setTimeout(function(){
					it.next(arg);
				},1000);
			},
			function(it, arg){
				assert.equal(arg.test, 1);
				arg.test = 2;
				setTimeout(function(){
					it.next(arg);
				},10);
			},
			function(it, arg){
				assert.equal(arg.test, 2);
				done();
				it.next(arg);
			}
		]).start(
			{} // <- initial value of `arg`.
		);
	});

	it('関数の直列処理を中断する', function(done) {
		this.timeout(5000);

		var val = 0;
		it79.fnc(
			{},
			[
				function(it1, arg){
					it79.fnc(
						{},
						[
							function(it, arg){
								val = 1;
								setTimeout(function(){
									it.next(arg);
								},100);
							},
							function(it, arg){
								val = 2;
								setTimeout(function(){
									it.next(arg);
								},100);
							},
							function(it, arg){
								val = 3;
								setTimeout(function(){
									it1.next(arg);
									it.break(arg);//ここでイテレーションを中断する
								},100);
							},
							function(it, arg){
								// これは実行されない
								val = 4;
								it1.next(arg);
							}
						]
					);
				},
				function(it1, arg){
					setTimeout(function(){
						assert.equal(val, 3);
						done();
						it1.next(arg);
					},100);
				}
			]
		);
	});

	it('任意の関数にジャンプする', function(done) {
		this.timeout(10*1000);

		var val = 0;
		var val2 = 'nothing';
		it79.fnc(
			{},
			[
				function(it1, arg){
					it79.fnc(
						{},
						{
							'fnc1': function(it2, arg2){
								// val = 1;
								// it2.next(arg2);
								it2.goto('fnc3', arg2); // <- fnc2 をスキップして fnc3 を実行する
							},
							'fnc2': function(it2, arg2){
								val = 2;
								val2 = 'fnc2';//この関数はスキップされる
								it2.next(arg2);
							},
							'fnc3': function(it2, arg2){
								val = 3;
								it2.next(arg2);
							},
							'fnc4': function(it2, arg2){
								val = 4;
								it1.next(arg);
							}
						}
					);
				},
				function(it1, arg){
					// console.log(val);
					// console.log(val2);
					assert.equal(val, 4);
					assert.equal(val2, 'nothing');
					done();
					// it1.next(arg);
				}
			]
		);
	});

});

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
			'three'
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
			'three': 3
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

});

describe('メソッドの直列処理', function() {

	it('関数を処理する(暗黙的start)', function(done) {
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

	it('関数を処理する(明示的start)', function(done) {
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

});

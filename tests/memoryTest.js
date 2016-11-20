var assert = require('assert');
var path = require('path');
var fs = require('fs');
var it79 = require(__dirname+'/../node/main.js');

describe('ary() を大量に生成してみるテスト', function() {

	it('ary() 大量発生', function(done) {
		this.timeout(10*60*1000);
		// done(); return;

		var sufix = '';
		for(var i = 0; i < 200; i ++){
			sufix += ' test string,';
		}

		var ary = [];
		for(var i = 0; i < 10; i ++){
			ary.push( 'array1 value '+i+' - '+sufix+' - value '+i );
		}
		var ary2 = [];
		for(var i = 0; i < 10000; i ++){
			ary2.push( 'array2 value '+i+' - '+sufix+' - value '+i );
		}

		it79.ary(
			JSON.parse(JSON.stringify(ary)) ,
			function(it1, data1, idx1){
				it79.ary(
					JSON.parse(JSON.stringify(ary2)) ,
					function(it2, data2, idx2){
						assert.equal(data2, ary2[idx2]);
						setTimeout(function(){
							it2.next();
						}, 0);
					},
					function(){
						assert.equal(1, 1);
						console.log('    '+idx1 + ' done');
						it1.next();
					}
				);
			},
			function(){
				assert.equal(1, 1);
				setTimeout(function(){
					console.log('    done');
					done();
				}, 10000);
			}
		);
	});

});

describe('fnc() を大量に生成してみるテスト', function() {

	it('ary() 大量発生', function(done) {
		this.timeout(10*60*1000);
		// done(); return;

		var sufix = '';
		for(var i = 0; i < 200; i ++){
			sufix += ' test string,';
		}

		var ary = [];
		for(var i = 0; i < 10; i ++){
			ary.push( 'array1 value '+i+' - '+sufix+' - value '+i );
		}
		var ary2 = [];
		for(var i = 0; i < 10000; i ++){
			ary2.push( 'array2 value '+i+' - '+sufix+' - value '+i );
		}

		it79.ary(
			ary ,
			function(it1, data1, idx1){

				it79.fnc(
					JSON.parse(JSON.stringify(ary2)) ,
					{
						'fnc1': function(it2, arg2){
							assert.equal(arg2.test, undefined);
							arg2.test = 1;
							arg2.testFnc1 = 'large text1:';
							for(var i = 0; i < 20000; i ++){
								arg2.testFnc1 += ' test string,';
							}
							setTimeout(function(){
								it2.next(arg2);
							},100);
						},
						'fnc2': function(it2, arg2){
							assert.equal(arg2.test, 1);
							arg2.test = 2;
							arg2.testFnc2 = 'large text2:';
							for(var i = 0; i < 20000; i ++){
								arg2.testFnc2 += ' test string,';
							}
							setTimeout(function(){
								it2.next(arg2);
							},100);
						},
						'fnc3': function(it2, arg2){
							assert.equal(arg2.test, 2);
							setTimeout(function(){
								console.log('    '+idx1 + ' done');
								it1.next();
							},3000);
						}
					}
				);
			},
			function(){
				// assert.equal(1, 1);
				setTimeout(function(){
					console.log('    done');
					done();
				}, 10000);
			}
		);
	});

});

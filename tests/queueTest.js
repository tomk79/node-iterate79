var assert = require('assert');
var path = require('path');
var fs = require('fs');
var it79 = require(__dirname+'/../node/main.js');

describe('Queue', function() {

	it('Queue Test (Single Thread)', function(done) {
		this.timeout(10000);
		var charFin = '';

		var queue = new it79.queue({
			'threadLimit': 1,
			'process': function(data, itDone){
				// console.log('=-=-=-=-= process');
				// console.log(data);
				setTimeout(function(){
					charFin += data.char;
					itDone();
				}, data.sleep);
			}
		});
		// console.log(queue);
		queue.push({'sleep': 1000, 'char': 'a'});
		queue.push({'sleep':  100, 'char': 'b'});
		queue.push({'sleep':  100, 'char': 'c'});
		queue.push({'sleep':  100, 'char': 'd'});
		queue.push({'sleep':  100, 'char': 'e'});
		queue.push({'sleep':  100, 'char': 'f'});
		queue.push({'sleep':  100, 'char': 'g'});
		queue.push({'sleep':  100, 'char': 'h'});
		queue.push({'sleep': 1000, 'char': 'i'});
		queue.push({'sleep': 1000, 'char': 'j'});
		queue.push({'sleep': 1000, 'char': 'k'});
		queue.push({'sleep': 1000, 'char': 'l'});

		setTimeout(function(){
			assert.equal(charFin, 'abcdefghijkl'); // 直列処理だから順番通りに並ぶ
			done();
		}, 5800); // 1スレッドで直列処理するので、合計秒数は少なくともかかる
	});

	it('Queue Test (3 Threads)', function(done) {
		this.timeout(10000);
		var charFin = '';

		var queue = new it79.queue({
			'threadLimit': 3,
			'process': function(data, itDone){
				// console.log('=-=-=-=-= process');
				// console.log(data);
				setTimeout(function(){
					charFin += data.char;
					itDone();
				}, data.sleep);
			}
		});
		// console.log(queue);
		queue.push({'sleep': 1000, 'char': 'a'});
		queue.push({'sleep':  100, 'char': 'b'});
		queue.push({'sleep':  100, 'char': 'c'});
		queue.push({'sleep':  100, 'char': 'd'});
		queue.push({'sleep':  100, 'char': 'e'});
		queue.push({'sleep':  100, 'char': 'f'});
		queue.push({'sleep':  100, 'char': 'g'});
		queue.push({'sleep':  100, 'char': 'h'});
		queue.push({'sleep': 1000, 'char': 'i'});
		queue.push({'sleep': 1000, 'char': 'j'});
		queue.push({'sleep': 1000, 'char': 'k'});
		queue.push({'sleep': 1000, 'char': 'l'});

		setTimeout(function(){
			assert.equal(charFin, 'bcdefghaijkl'); // 並列処理なので、時間が係る処理の前に短い処理が割り込むことができる
			done();
		}, 4200); // 3スレッド並列処理されるので、合計秒数より早く終る
	});

});

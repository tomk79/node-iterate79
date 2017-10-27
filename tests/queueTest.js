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
			'process': function(data, itDone, queryInfo){
				// console.log('=-=-=-=-= process');
				// console.log(data);
				// console.log(queryInfo);
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

	it('Queue Test (3 Threads, update, remove)', function(done) {
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
		var idA = queue.push({'sleep': 1000, 'char': 'a'});
		queue.push({'sleep':  100, 'char': 'b'});
		queue.push({'sleep':  100, 'char': 'c'});
		var idD = queue.push({'sleep':  100, 'char': 'd'});
		queue.push({'sleep':  100, 'char': 'e'});
		queue.push({'sleep':  100, 'char': 'f'});
		queue.push({'sleep':  100, 'char': 'g'});
		queue.push({'sleep':  100, 'char': 'h'});
		queue.push({'sleep': 1000, 'char': 'i'});
		queue.push({'sleep': 1000, 'char': 'j'});
		queue.push({'sleep': 1000, 'char': 'k'});
		var idL = queue.push({'sleep': 1000, 'char': 'l'});

		assert.ok(queue.remove(idD)); // dを削除
		assert.equal(queue.checkStatus(idD), 'removed'); // 削除フラグが立つのみで、物理的には行列待ちを続ける
		assert.ok(queue.update(idL, {'sleep': 1000, 'char': 'L'})); // Lのみ大文字に置き換え

		setTimeout(function(){
			var allStatus = queue.getAllStatus();
			var statusCount = 0, activeCount = 0;
			for( var idx in allStatus ){
				statusCount ++;
				if( allStatus[idx] == 2 ){ // 2 = 実行中のキュー数
					activeCount ++;
				}
			}
			assert.equal(statusCount, 5);
			assert.equal(activeCount, 3);
			assert.equal(queue.checkStatus(idA), 'progressing');
			assert.equal(queue.checkStatus(idD), 'undefined');
			assert.equal(queue.checkStatus(idL), 'waiting');
		}, 500);
		setTimeout(function(){
			assert.equal(queue.checkStatus(idA), 'undefined');
		}, 1200);

		setTimeout(function(){
			assert.equal(charFin, 'bcefghaijkL'); // 並列処理なので、時間が係る処理の前に短い処理が割り込むことができる
			done();
		}, 4200); // 3スレッド並列処理されるので、合計秒数より早く終る
	});

});

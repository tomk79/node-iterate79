/**
 * node-iterate79/queue.js
 */
var Promise = require('es6-promise').Promise;

/**
 * construct
 */
module.exports = function(_options){
	var _this = this,
		options = {},
		queue = [],
		threads = [],
		status = {},
		timerRunQueue;

	options = _options || {};
	options.process = _options.process || function(data, done){ done(); };
	options.threadLimit = _options.threadLimit || 1;
	for( var i = 0; i < options.threadLimit; i ++ ){
		threads.push({
			'active': false
		});
	}

	/**
	 * QueueItemを追加する
	 */
	this.push = function(data){
		var newQueueItemId;
		while(1){
			var microtimestamp = (new Date).getTime();
			newQueueItemId = microtimestamp + '-' + md5( microtimestamp );
			if( status[newQueueItemId] ){
				// 登録済みの Queue Item ID は発行不可
				continue;
			}
			break;
		}

		queue.push({
			'id': newQueueItemId,
			'data': data
		});
		status[newQueueItemId] = 1; // 1 = 実行待ち, 2 = 実行中, undefined = 未登録 または 実行済み

		runQueue(); // キュー処理をキックする
		return newQueueItemId;
	}

	/**
	 * QueueItemを更新する
	 */
	this.update = function(queueItemId, data){
		var st = this.checkStatus(queueItemId);
		if(st != 'waiting'){
			// 待ち状態でなければ更新できない
			return false;
		}
		for(var idx in queue){
			if(queue[idx].id == queueItemId){
				queue[idx].data = data;
				break;
			}
		}
		return true;
	}

	/**
	 * QueueItemを削除する
	 */
	this.remove = function(queueItemId){
		var st = this.checkStatus(queueItemId);
		if(st != 'waiting'){
			// 待ち状態でなければ削除できない
			return false;
		}
		status[queueItemId] = 99; // <- removed
		return true;
	}

	/**
	 * 状態を確認する
	 */
	this.checkStatus = function(queueItemId){
		var st = status[queueItemId];
		switch(status[queueItemId]){
			case 1:
				return 'waiting'; break;
			case 2:
				return 'progressing'; break;
			case 99:
				return 'removed'; break;
		}
		return 'undefined'; // <- 未定義および完了済みを含む
	}

	/**
	 * 状態管理情報を取得する
	 */
	this.getAllStatus = function(){
		return status;
	}

	/**
	 * md5ハッシュを求める
	 */
	function md5( str ){
		str = str.toString();
		var crypto = require('crypto');
		var md5 = crypto.createHash('md5');
		md5.update(str, 'utf8');
		return md5.digest('hex');
	}

	/**
	 * 先頭から1件取り出す
	 */
	function shift(){
		// console.log('----- shift');
		var rtn = queue.shift();
		// console.log(rtn);
		return rtn;
	}

	/**
	 * キュー処理をキックする
	 */
	function runQueue(){
		clearTimeout(timerRunQueue);
		if( !queue.length ){
			// 誰も待っていない場合
			return;
		}

		new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
			var threadNumber = false;

			// 空きスレッドを検索
			for( var idx in threads ){
				if( !threads[idx].active ){
					threadNumber = idx;
					threads[threadNumber].active = true; // スレッドを予約
					break;
				}
			}
			if( threadNumber === false ){
				// スレッドがあいてない場合ポーリング
				timerRunQueue = setTimeout(function(){
					runQueue();
				}, 10);
				return;
			}

			var currentData = shift();

			if(status[currentData.id] == 99){
				// 削除された Queue Item
				status[currentData.id] = undefined; delete(status[currentData.id]); // <- 処理済み にステータスを変更
				threads[threadNumber].active = false; // 予約したスレッドを解放
				runQueue();
				return;
			}


			// ステータスを 実行中 に変更
			status[currentData.id] = 2;

			// 予約したスレッドに、Queue Item ID を記憶する
			threads[threadNumber].active = currentData.id;

			// 実行
			options.process(currentData.data, function(){
				status[currentData.id] = undefined; delete(status[currentData.id]); // <- 処理済み にステータスを変更
				threads[threadNumber].active = false;
				runQueue();
			}, {
				'id': currentData.id
			});
		}); });
		return;
	}

}

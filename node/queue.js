/**
 * node-iterate79/queue.js
 */
(function(module){
	var Promise = require('es6-promise').Promise;
	var _this,
		options = {},
		queue = [],
		threads = [],
		timerRunQueue;

	/**
	 * construct
	 */
	module.exports = function(_options){
		_this = this;
		options = _options || {};
		options.process = _options.process || function(data, done){ done(); };
		options.threadLimit = _options.threadLimit || 1;
		for( var i = 0; i < options.threadLimit; i ++ ){
			threads.push({
				'active': false
			});
		}
	}

	module.exports.prototype.push = function(data){
		var rtn = queue.push(data);
		runQueue(); // キュー処理をキックする
		return rtn;
	}

	module.exports.prototype.shift = function(){
		// console.log('----- shift');
		var rtn = queue.shift();
		// console.log(rtn);
		return rtn;
	}

	/**
	 * キュー処理をキックする
	 * @return {[type]} [description]
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

			var currentData = _this.shift();
			// console.log(currentData, queue);
			// console.log(threadNumber);

			options.process(currentData, function(){
				threads[threadNumber].active = false;
				runQueue();
			});
		}); });
		return;
	}

})(module);

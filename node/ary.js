/**
 * node-iterate79/ary.js
 */
(function(module){
	var Promise = require('es6-promise').Promise;

	/**
	 * 配列の直列処理
	 */
	module.exports = function( ary, fnc, fncComplete ){
		var bundle = 1;
		if( arguments.length >= 4 ){
			ary = arguments[0];
			bundle = arguments[1];
			fnc = arguments[arguments.length-2];
			fncComplete = arguments[arguments.length-1];
		}
		bundle = bundle || 1;

		return new (function( ary, bundle, fnc, fncComplete ){
			var _this = this;
			this.idx = -1;
			this.idxs = []; // <- array keys
			for( var i in ary ){
				this.idxs.push(i);
			}
			this.bundle = bundle||1;
			this.bundleProgress = 1;
			this.ary = ary||[];
			this.fnc = fnc||function(){};
			this.completed = false;
			this.fncComplete = fncComplete||function(){};

			this.next = function(){
				var _this = this;
				new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
					_this.bundleProgress --;
					if( _this.bundleProgress > 0 ){
						// bundleごとの処理が終わっていない
						return;
					}
					if( _this.idx+1 >= _this.idxs.length && _this.bundleProgress<=0 ){
						_this.destroy();
						return;
					}
					var tmp_idx = _this.idx;
					_this.idx = _this.idx+_this.bundle;
					for(var i = 0; i<_this.bundle; i++){
						tmp_idx ++;
						if( tmp_idx >= _this.idxs.length ){
							// 端数があった場合、bundleの数に欠員が出る可能性がある。
							break;
						}
						_this.bundleProgress ++;
						_this.fnc( _this, _this.ary[_this.idxs[tmp_idx]], _this.idxs[tmp_idx] );
					}
					return;
				}); });
				return this;
			}
			this.break = function(){
				var _this = this;
				_this.destroy();
				return;
			}
			this.destroy = function(){
				var _this = this;
				_this.idx = _this.idxs.length - 1;
				_this.bundleProgress = 0;
				if(_this.completed){return;}
				_this.completed = true;
				_this.fncComplete();
				return;
			}
			this.next();
			return;
		})(ary, bundle, fnc, fncComplete);
	}

})(module);

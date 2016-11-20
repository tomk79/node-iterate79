/**
 * node-iterate79/ary.js
 */
(function(module){
	var Promise = require('es6-promise').Promise;

	/**
	 * 配列の直列処理
	 */
	module.exports = function(ary, fnc, fncComplete){
		return new (function( ary, fnc, fncComplete ){
			this.idx = -1;
			this.idxs = [];
			for( var i in ary ){
				this.idxs.push(i);
			}
			this.ary = ary||[];
			this.fnc = fnc||function(){};
			this.fncComplete = fncComplete||function(){};

			this.next = function(){
				var _this = this;
				new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
					if( _this.idx+1 >= _this.idxs.length ){
						_this.fncComplete();
						return _this;
					}
					_this.idx ++;
					_this.fnc( _this, _this.ary[_this.idxs[_this.idx]], _this.idxs[_this.idx] );
				}); });
				return this;
			}
			this.next();
		})(ary, fnc, fncComplete);
	}

})(module);

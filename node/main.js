/**
 * node-iterate79
 */
(function(exports){
	var Promise = require('es6-promise').Promise;

	/**
	 * 配列の直列処理
	 */
	exports.ary = function(ary, fnc, fncComplete){
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

	/**
	 * 関数の直列処理
	 */
	exports.fnc = function(aryFuncs){
		var mode = 'explicit';
		var defaultArg = undefined;
		if( arguments.length >= 2 ){
			mode = 'implicit';
			defaultArg = arguments[0];
			aryFuncs = arguments[arguments.length-1];
		}


		function iterator( aryFuncs ){
			aryFuncs = aryFuncs||[];

			var idx = 0;
			var funcs = aryFuncs;
			var isStarted = false;//2重起動防止

			this.start = function(arg){
				var _this = this;
				if(isStarted){return this;}
				isStarted = true;
				new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
					_this.next(arg);
				}); });
				return this;
			}

			this.next = function(arg){
				var _this = this;
				arg = arg||{};
				if(funcs.length <= idx){return this;}
				new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
					(funcs[idx++])(_this, arg);
				}); });
				return this;
			};
		}
		var rtn = new iterator(aryFuncs);
		if( mode == 'implicit' ){
			rtn.start(defaultArg);
			return rtn;
		}
		return rtn;
	}


})(exports);

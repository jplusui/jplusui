/**
 * @author xuld
 */


include("fx/base.js");
include("dom/base.js");


/**
 * @namespace Fx
 */
Object.extend(Fx, {
	
	/**
	 * 用于特定 css 补间动画的引擎。 
	 */
	tweeners: {},
	
	/**
	 * 默认的补间动画的引擎。 
	 */
	defaultTweeners: [],
	
	/**
	 * 用于数字的动画引擎。
	 */
	numberTweener: {
		get: function(target, name){
			return Dom.styleNumber(target.node, name);
		},
				
		/**
		 * 常用计算。
		 * @param {Object} from 开始。
		 * @param {Object} to 结束。
		 * @param {Object} delta 变化。
		 */
		compute: function(from, to, delta){
			return (to - from) * delta + from;
		},
		
		parse: function(value){
			return typeof value == "number" ? value : parseFloat(value);
		},
		
		set: function(target, name, value){
			target.node.style[name] = value;
		}
	},

	/**
	 * 补间动画
	 * @class Fx.Tween
	 * @extends Fx
	 */
	Tween: Fx.extend({
		
		/**
		 * 初始化当前特效。
		 */
		constructor: function(){
			
		},
		
		/**
		 * 根据指定变化量设置值。
		 * @param {Number} delta 变化量。 0 - 1 。
		 * @protected override
		 */
		set: function(delta){
			var options = this.options,
				params = options.params,
				target = options.target,
				tweener,
				key,
				value;

			// 对当前每个需要执行的特效进行重新计算并赋值。
			for (key in params) {
				value = params[key];
				tweener = value.tweener;
				tweener.set(target, key, tweener.compute(value.from, value.to, delta));
			}
		},
		
		/**
		 * 生成当前变化所进行的初始状态。
		 * @param {Object} options 开始。
		 * @protected override
		 */
		init: function (options) {
				
			// 对每个设置属性
			var key,
				tweener,
				part,
				value,
				parsed,
				i,
				// 生成新的 tween 对象。
				params = {};
			
			for (key in options.params) {

				// value
				value = options.params[key];

				// 如果 value 是字符串，判断 += -= 或 a-b
				if (typeof value === 'string' && (part = /^([+-]=|(.+?)-)(.*)$/.exec(value))) {
					value = part[3];
				}

				// 找到用于变化指定属性的解析器。
				tweener = Fx.tweeners[key = key.toCamelCase()];
				
				// 已经编译过，直接使用， 否则找到合适的解析器。
				if (!tweener) {
					
					// 如果是纯数字属性，使用 numberParser 。
					if(key in Dom.styleNumbers) {
						tweener = Fx.numberTweener;
					} else {
						
						i = Fx.defaultTweeners.length;
						
						// 尝试使用每个转换器
						while (i-- > 0) {
							
							// 获取转换器
							parsed = Fx.defaultTweeners[i].parse(value, key);
							
							// 如果转换后结果合格，证明这个转换器符合此属性。
							if (parsed || parsed === 0) {
								tweener = Fx.defaultTweeners[i];
								break;
							}
						}

						// 找不到合适的解析器。
						if (!tweener) {
							continue;
						}
						
					}

					// 缓存 tweeners，下次直接使用。
					Fx.tweeners[key] = tweener;
				}
				
				// 如果有特殊功能。 ( += -= a-b)
				if(part){
					parsed = part[2];
					i = parsed ? tweener.parse(parsed) : tweener.get(options.target, key);
					parsed = parsed ? tweener.parse(value) : (i + parseFloat(part[1] === '+=' ? value : '-' + value));
				} else {
					parsed = tweener.parse(value);
					i = tweener.get(options.target, key);
				}
				
				params[key] = {
					tweener: tweener,
					from: i,
					to: parsed		
				};
				
				assert(i !== null && parsed !== null, "Fx.Tween#init(options): 无法正确获取属性 {key} 的值({from} {to})。", key, i, parsed);
				
			}

			options.params = params;
		}
	
	}),
	
	createTweener: function(tweener){
		return Object.extendIf(tweener, Fx.numberTweener);
	}
	
});

Object.each(Dom.styleFix, function(value, key){
	Fx.tweeners[key] = this;
}, Fx.createTweener({
	set: function (target, name, value) {
		Dom.styleFix[name].call(target, value);
	}
}));

Fx.tweeners.scrollTop = Fx.createTweener({
	set: function (target, name, value) {
		target.setScroll(null, value);
	},
	get: function (target) {
		return target.getScroll().y;
	}
});

Fx.tweeners.scrollLeft = Fx.createTweener({
	set: function (target, name, value) {
		target.setScroll(value);
	},
	get: function (target) {
		return target.getScroll().x;
	}
});

Fx.defaultTweeners.push(Fx.createTweener({

	set: navigator.isStd ? function (target, name, value) {
		
		target.node.style[name] = value + 'px';
	} : function(target, name, value) {
		try {
			
			// ie 对某些负属性内容报错
			target.node.style[name] = value;
		}catch(e){}
	}

}));
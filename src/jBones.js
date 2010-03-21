/*

jBones

jBones is a small code optimization tool which parses compressed javascript code and shows you what keywords are still bloat bloating you code.

Each keyword found in your code is counted then weighted according to the potential byte economies you make by rewriting your code so that they get compressed. In other words, jBones doesnt tell you how to shrink your code, but it points you in the right direction.

Usage:
	First, make sure you have processed your javascript code through JSLint and a code compressor such as JSMin or the YUI Compressor. Also make sure that the code compressor you use has the "compress variables" option enabled.
	
	Simply copy paste you block of code in the big text aread and click "Parse".
	
	You will be shown the list of keywords.
	
	You can also adjust the list of ignored keywords manually.

Features:
	- Count occurences of words in code
	- List of reserved keywords to skip
	- Apples a first pass for unpunctuated keywords and a second with punctation
	- Calculate best-case economy if keywords are made compressable

Future features:
	- Highlight all keywords in the code
	- Highlight individual keywords when cursor hover on keywords
	- Show small info tooltip on hover
	- Better estimation of optimal economy - needs to be backed with actual real life scenarios

*/

jBonesOptions = {
	dontCount : {
		"function" : true,
		"else" : true,
		"if" : true,
		"throw" : true,
		"catch" : true,
		"while" : true,
		"length" : true,
		"return" : true,
		"arguments" : true,
		"typeof" : true,
		"var" : true,
		"try" : true,
		"this" : true,
		"split" : true,
		"shift" : true,
		"empty" : true,
		"finally" : true,
		"for" : true,
		"not" : true,
		"if" : true,
		"in" : true
	},
	nonBreakChar : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY_.[\"']",
	minWordLength : 1,
	minEconomy : 5
}

function jBones(options) {
	var fn,
		parse,
		latestSource;
	fn = function jBones(txt) {
		return parse(txt);
	};
	fn.options = options;
	parse = function parse(txt) {
		latestSource = txt;
		var word = "";
		var occurences = fn.occurences = {};
		for (var i=0; i <= txt.length; i = i + 1) {
			var char = txt[i];
			if (options.nonBreakChar.indexOf(char)+1>0) {
				word = word + txt[i];
			} else {
				if (word.length > options.minWordLength && !options.dontCount[word]) {
					// Simultaneously check if this occurence already exists and increment its value				
					occurences[word] = (occurences[word]) ?
						{
							word: word,
							count : occurences[word].count + 1,
							economy : occurences[word].economy + (word.length - 1)
						} : {
							word : word,
							count : 1,
							economy : 0
						};
				}
				word = "";
			} 
		}
		return occurences;
	};
	fn.occurences = {};
	fn.economyRatio = function economyRatio() {
		var economy,
			economies,
			economySize,
			codeSize;
		economySize = 0;
		economies = this.economies();
		for (economy in economies) {
			economySize = economySize + economies[economy].economy;
		} 
		codeSize = latestSource.length;
		// YOU WHERE ABOUT TO COUNT THE ECONOMY RATIO!!!
		return parseInt(100-((economySize / codeSize) * 100));
	};
	fn.economies = function economies() {
		var occurence,
			economies = [];
		for (occurence in fn.occurences) {
			if (options.minEconomy < fn.occurences[occurence].economy) {
				economies.push(fn.occurences[occurence]);
			}
		}
		economies.sort(function(a, b) {
			return (a.economy < b.economy);
		})
		return economies;
	}
	return fn;
};

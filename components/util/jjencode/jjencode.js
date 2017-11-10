define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * 加密指定的 JavaScript 源码。
     * @param {String} text 要加密的代码。
     * @param {String} gv 加密的文本。
     * @return {String} 返回已加密的代码。
     * @example obfuscate("var a =1")
     * @see http://utf-8.jp/public/jjencode.html
     */
    function jjencode(text, gv) {
        if (gv === void 0) { gv = "$"; }
        var r = "";
        var n;
        var t;
        var b = ["___", "__$", "_$_", "_$$", "$__", "$_$", "$$_", "$$$", "$___", "$__$", "$_$_", "$_$$", "$$__", "$$_$", "$$$_", "$$$$",];
        var s = "";
        for (var i = 0; i < text.length; i++) {
            n = text.charCodeAt(i);
            if (n == 0x22 || n == 0x5c) {
                s += "\\\\\\" + text.charAt(i).toString(16);
            }
            else if ((0x21 <= n && n <= 0x2f) || (0x3A <= n && n <= 0x40) || (0x5b <= n && n <= 0x60) || (0x7b <= n && n <= 0x7f)) {
                //}else if( (0x20 <= n && n <= 0x2f) || (0x3A <= n == 0x40) || ( 0x5b <= n && n <= 0x60 ) || ( 0x7b <= n && n <= 0x7f ) ){
                s += text.charAt(i);
            }
            else if ((0x30 <= n && n <= 0x39) || (0x61 <= n && n <= 0x66)) {
                if (s)
                    r += "\"" + s + "\"+";
                r += gv + "." + b[n < 0x40 ? n - 0x30 : n - 0x57] + "+";
                s = "";
            }
            else if (n == 0x6c) {
                if (s)
                    r += "\"" + s + "\"+";
                r += "(![]+\"\")[" + gv + "._$_]+";
                s = "";
            }
            else if (n == 0x6f) {
                if (s)
                    r += "\"" + s + "\"+";
                r += gv + "._$+";
                s = "";
            }
            else if (n == 0x74) {
                if (s)
                    r += "\"" + s + "\"+";
                r += gv + ".__+";
                s = "";
            }
            else if (n == 0x75) {
                if (s)
                    r += "\"" + s + "\"+";
                r += gv + "._+";
                s = "";
            }
            else if (n < 128) {
                if (s)
                    r += "\"" + s;
                else
                    r += "\"";
                r += "\\\\\"+" + n.toString(8).replace(/[0-7]/g, function (c) { return gv + "." + b[c] + "+"; });
                s = "";
            }
            else {
                if (s)
                    r += "\"" + s;
                else
                    r += "\"";
                r += "\\\\\"+" + gv + "._+" + n.toString(16).replace(/[0-9a-f]/gi, function (c) { return gv + "." + b[parseInt(c, 16)] + "+"; });
                s = "";
            }
        }
        if (s)
            r += "\"" + s + "\"+";
        r =
            gv + "=~[];" +
                gv + "={___:++" + gv + ",$$$$:(![]+\"\")[" + gv + "],__$:++" + gv + ",$_$_:(![]+\"\")[" + gv + "],_$_:++" +
                gv + ",$_$$:({}+\"\")[" + gv + "],$$_$:(" + gv + "[" + gv + "]+\"\")[" + gv + "],_$$:++" + gv + ",$$$_:(!\"\"+\"\")[" +
                gv + "],$__:++" + gv + ",$_$:++" + gv + ",$$__:({}+\"\")[" + gv + "],$$_:++" + gv + ",$$$:++" + gv + ",$___:++" + gv + ",$__$:++" + gv + "};" +
                gv + ".$_=" +
                "(" + gv + ".$_=" + gv + "+\"\")[" + gv + ".$_$]+" +
                "(" + gv + "._$=" + gv + ".$_[" + gv + ".__$])+" +
                "(" + gv + ".$$=(" + gv + ".$+\"\")[" + gv + ".__$])+" +
                "((!" + gv + ")+\"\")[" + gv + "._$$]+" +
                "(" + gv + ".__=" + gv + ".$_[" + gv + ".$$_])+" +
                "(" + gv + ".$=(!\"\"+\"\")[" + gv + ".__$])+" +
                "(" + gv + "._=(!\"\"+\"\")[" + gv + "._$_])+" +
                gv + ".$_[" + gv + ".$_$]+" +
                gv + ".__+" +
                gv + "._$+" +
                gv + ".$;" +
                gv + ".$$=" +
                gv + ".$+" +
                "(!\"\"+\"\")[" + gv + "._$$]+" +
                gv + ".__+" +
                gv + "._+" +
                gv + ".$+" +
                gv + ".$$;" +
                gv + ".$=(" + gv + ".___)[" + gv + ".$_][" + gv + ".$_];" +
                gv + ".$(" + gv + ".$(" + gv + ".$$+\"\\\"\"+" + r + "\"\\\"\")())();";
        return r;
    }
    exports.default = jjencode;
});
//# sourceMappingURL=jjencode.js.map
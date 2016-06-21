/**
 * 表示一个 TypeScript 语法树转换器。
 */
var ts = require("typescript");
/**
 * 转换指定的程序。
 * @param program 要转换的程序。
 * @param options 转换的选项。
 */
function transpile(program, options) {
    var checker = program.getTypeChecker();
    // 处理每个源文件。
    for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
        var sourceFile = _a[_i];
        visitSourceFile(sourceFile);
    }
    /**
     * 处理一个文件。
     * @param sourceFile 要处理的文件。
     */
    function visitSourceFile(sourceFile) {
        var sourceFileComment = getJsDocCommentOfSourceFile(sourceFile);
        console.log(sourceFileComment.tags.map(function (t) { return sourceFile.text.substring(t.pos, t.end); }).join("####"));
        //c.forEach(p)
        //function p(c) {
        //    try {
        //        var ccc = ts.parseIsolatedJSDocComment(sourceFile.text, c.pos, c.end)
        //        debugger
        //    } catch (e) {
        //        console.log(" $$$", ccc);
        //    }
        //    console.log("| ", sourceFile.text.substring(c.pos, c.end));
        //}
    }
    /**
     * 获取文件的首个注释。
     * @param sourceFile
     */
    function getJsDocCommentOfSourceFile(sourceFile) {
        var comments = ts.getJsDocComments(sourceFile, sourceFile);
        if (!comments.length)
            return;
        var comment = comments[0];
        if (!comment.hasTrailingNewLine)
            return;
        return parseJsDoc(sourceFile.text, comment.pos, comment.end);
    }
    /**
     * 解析 JS 文档注释。
     * @param text
     * @param pos
     * @param end
     */
    function parseJsDoc(text, pos, end) {
        return ts.parseIsolatedJSDocComment(text, pos, end).jsDocComment;
    }
    // 更新注释。
    ts.writeCommentRange = function (text, lineMap, writer, comment, newLine) {
        console.log("输出注释:" + text.substring(comment.pos, comment.end));
    };
    return program;
}
exports.transpile = transpile;
// #region 解析文档注释
var defaultTagName = "summary";
function parseJsDoc() {
}
/**
 * 从源文件的文档注释标签截取信息。
 * @param tagName 标签名。
 * @param argument 标签参数，即从当前标签结束到下一个标签之间的文本。
 * @param tag 文档标签。
 * @param result 存放解析结果的对象。
 */
function parseJsDocTag(tagName, argument, tag, result) {
    switch (tagName.toLowerCase()) {
        // 类型名
        case "augments":
        case "extend":
            return parseJsDocTag("extends", argument, tag, result);
        case "module":
            return parseJsDocTag("namespace", argument, tag, result);
        case "lends":
            return parseJsDocTag("memberof", argument, tag, result);
        case "extends": // (synonyms: @extends)  Indicate that a symbol inherits from, ands adds to, a parent symbol.
        case "namespace": // Document a namespace object.
        case "memberof":
            if (result[tagName])
                reportDocError(result, tag, "Duplicate tag: @" + tag.tagName.text + ".");
            // TODO：解析 argument 为类型。
            result[tagName] = argument;
            break;
        // 允许重复的类型名
        case "implements": // This symbol implements an interface.
        case "borrows":
            // TODO：解析 argument 为类型。
            result[tagName] = result[tagName] || [];
            result[tagName].push(argument);
            break;
        // 成员名
        case "emits":
            return parseJsDocTag("fires", argument, tag, result);
        case "name": // Document the name of an object.
        case "fires": // (synonyms: @emits)  Describe the events this method may fire.
        case "alias":
            if (result[tagName])
                reportDocError(result, tag, "Duplicate tag: @" + tag.tagName.text + ".");
            // TODO：解析 argument 为名字。
            result[tagName] = argument;
            break;
        // 单行文本
        // 允许重复的单行文本
        case "author": // Identify the author of an item.
        case "copyright": // Document some copyright information.
        case "license":
            result[tagName] = (result[tagName] ? result[tagName] + "," : "") + argument;
            break;
        // 多行文本
        case "desc":
            return parseJsDocTag("description", argument, tag, result);
        case "fileoverview":
        case "fileOverview":
        case "overview":
            return parseJsDocTag("file", argument, tag, result);
        case "classdesc": // Use the following text to describe the entire class.
        case "summary": // A shorter version of the full description.
        case "description": // (synonyms: @desc) Describe a symbol.
        case "file": //(synonyms: @fileoverview, @overview)  Describe a file.
        case "todo":
            result[tagName] = (result[tagName] ? result[tagName] + "\n" : "") + argument;
            break;
        // 地址
        case "see": // Refer to some other documentation for more information.
        case "requires": // This file requires a JavaScript module.
        case "throws":
            result[tagName] = result[tagName] || [];
            // TODO: 解析特殊的地址
            result[tagName].push(argument);
            break;
        // 布尔型标签
        case "inner":
            return parseJsDocTag("internal", argument, tag, result);
        case "host":
            return parseJsDocTag("external", argument, tag, result);
        case "abstract": // This member must be implemented by the inheritor.
        case "virtual": // This member must be overridden by the inheritor.
        case "override": // Indicate that a symbol overrides its parent.
        case "readonly": // This symbol is meant to be read- only.
        case "private": // This symbol is meant to be private.
        case "protected": // This symbol is meant to be protected.
        case "public": // This symbol is meant to be public.
        case "internal": // This symbol is meant to be internal.
        case "static": // Document a static member.
        case "ignore": // Omit a symbol from the documentation.
        case "external": //(synonyms: @host)  Identifies an external class, namespace, or module.
        case "inheritdoc":
            if (result[tagName])
                reportDocError(result, tag, "Duplicate tag: @" + tagName + ". The specific member has been marked as " + tagName + ".");
            if (argument)
                reportDocError(result, tag, "Tag @" + tagName + " has no parameters.");
            result[tagName] = true;
            break;
        // 可选名字的布尔型标签
        case "func":
        case "method":
            return parseJsDocTag("function", argument, tag, result);
        case "prop":
            return parseJsDocTag("property", argument, tag, result);
        case "constructs": // This function member will be the constructor for the previous class.
        case "constructor":
            return parseJsDocTag("class", argument, tag, result);
        case "constant":
            return parseJsDocTag("const", argument, tag, result);
        case "var":
            return parseJsDocTag("member", argument, tag, result);
        case "function": // (synonyms: @func, @method)  Describe a function or method.
        case "property": // (synonyms: @prop)   Document a property of an object.
        case "class": //  (synonyms: @constructor) This function is intended to be called with the "new" keyword.
        case "interface": // This symbol is an interface that others can implement
        case "enum": // Document a collection of related properties.
        case "const": // (synonyms: @const)  Document an object as a constant.
        case "member": // (synonyms: @var) Document a member.
        case "callback": // Document a callback function.
        case "event": // Document an event.
        case "config": // Document a config.
        case "exports": // Identify the member that is exported by a JavaScript module.
        case "instance": // Document an instance member..
        case "global":
            // TODO：解析 argument 为名字。
            if (argument)
                result.name = argument;
            argument[argument] = true;
            break;
        // 代码
        case "default": //  (synonyms: @defaultvalue)  Document the default value.
        case "example":
            argument[argument] = result;
            break;
        case "defaultvalue":
            return parseJsDocTag("default", argument, tag, result);
        // 版本
        case "deprecated": // Document that this is no longer the preferred way.
        case "version": // Documents the version number of an item.
        case "since":
            if (result[tagName])
                reportDocError(result, tag, "Duplicate tag: @" + tag.tagName.text + ".");
            // TODO：解析版本号
            result[tagName] = argument;
            break;
        // 特定标签
        case "return":
            return parseJsDocTag("returns", argument, tag, result);
        case "returns":
            // todo
            break;
        case "type": // Document the type of an object.
        case "this":
            // todo
            break;
        case "typedef":
            // todo
            break;
        case "arg":
        case "argument":
            return parseJsDocTag("param", argument, tag, result);
        case "param":
            // todo
            break;
        case "access":
            switch (argument) {
                case "private":
                case "protected":
                case "public":
                case "internal":
                    return parseJsDocTag(argument, null, tag, result);
                default:
                    reportDocError(result, tag, "Invalid argument of tag @" + tagName + ": '" + argument + "'. Supported values are: 'private', 'protected', 'public', 'internal'.");
                    break;
            }
            break;
        case "kind":
            switch (argument) {
                case "func":
                case "method":
                case "prop":
                case "constructs": // This function member will be the constructor for the previous class.
                case "constructor":
                case "constant":
                case "var":
                case "function": // (synonyms: @func, @method)  Describe a function or method.
                case "property": // (synonyms: @prop)   Document a property of an object.
                case "class": //  (synonyms: @constructor) This function is intended to be called with the "new" keyword.
                case "interface": // This symbol is an interface that others can implement
                case "enum": // Document a collection of related properties.
                case "const": // (synonyms: @const)  Document an object as a constant.
                case "member": // (synonyms: @var) Document a member.
                case "callback": // Document a callback function.
                case "event": // Document an event.
                case "config": // Document a config.
                case "exports": // Identify the member that is exported by a JavaScript module.
                case "instance":
                    return parseJsDocTag(argument, null, tag, result);
                default:
                    reportDocError(result, tag, "Invalid argument of tag @" + tagName + ": '" + argument + "'.");
                    break;
            }
        case "listens": // List the events that a symbol listens for.
        case "mixes": // This object mixes in all the members from another object.
        case "mixin": // Document a mixin object.
        case "tutorial": // Insert a link to an included tutorial file.
        case "variation": // Distinguish different objects with the same name.
        default:
            reportDocError(result, tag, "Unknown tag @" + tagName + ".");
            break;
    }
}
function reportDocError(result, node, message) {
    result.diagnostics.push({
        file: node.getSourceFile(),
        start: node.pos,
        length: node.end - node.pos,
        messageText: message,
        category: ts.DiagnosticCategory.Warning,
        code: -1
    });
}
// #endregion
//# sourceMappingURL=transpiler.js.map
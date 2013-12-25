/**
 * Created by XadillaX on 13-12-20.
 */
var cheerio = require("cheerio");
var fs = require("fs");

String.prototype.replaceAll = function(reallyDo, replaceWith, ignoreCase) {
    if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
        return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi": "g")), replaceWith);
    } else {
        return this.replace(reallyDo, replaceWith);
    }
}

function newsParser(tplFilename) {
    this.tpl = fs.readFileSync(tplFilename, "utf8");
}

newsParser.prototype.summary = function(content, callback) {
    if(typeof this.tpl !== "string") callback("");

    content = content.replaceAll(" ", "");
    content = content.replaceAll("\n", "");
    content = content.replaceAll("\r", "");
    content = content.replaceAll("\t", "");
    content = content.replaceAll("&nbsp;", "");

    var tpl = this.tpl.replace("{:content}", content);
    $ = cheerio.load(tpl);

    content = $("article").text();
    return content;
};

/**
 * parse the content to adapt mobile
 * @param content
 * @param callback
 */
newsParser.prototype.parse = function(content, callback) {
    if(typeof this.tpl !== "string") callback("");

    var tpl = this.tpl.replace("{:content}", content);
    $ = cheerio.load(tpl);

    //$(function() {
        // Images adaptation
        $("img").addClass("img-thumbnail");
        $("img").addClass("img-responsive");
        $("img").removeAttr("style");

        // Tables adaptation
        $("table").removeAttr("style");
        $("table").removeAttr("border");
        $("table").addClass("table");
        $("table").addClass("table-bordered");
        $("table").addClass("table-striped");

        // Links adaptation
        $("a").removeAttr("style");
        $("a").addClass("btn btn-default btn-xs btn-info");

        // Links content
        $("a").each(function(idx, elem) {
            if($(this).html().match(/.*\.(doc|xls|ppt|docx|xlsx|pptx)/)) {
                $(this).html("<i class='glyphicon glyphicon-paperclip'></i> 下载附件");
                $(this).removeClass("btn-info");
                $(this).addClass("btn-warning");
            } else if($(this).html().match(/http.*\/\/.*/)) {
                $(this).html("<i class='glyphicon glyphicon-flag'></i> 打开链接");
                $(this).removeClass("btn-info");
                $(this).addClass("btn-warning");
            }
        });

        callback($.html());
    //});
};

module.exports = newsParser;

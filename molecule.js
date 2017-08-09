/*
 *  -login 
 *
 *  -add <url> [target]
 *  -upload <file>
 *  -rm/delete <file_name>
 *  -mv/change <file_name> <new_file_name>
 *  -list/ls <path>
 *  -search <key>
 *  -details
 */

var casper = require("casper").create();
var stat = casper.cli.get(0), arg1 = casper.cli.get(1), arg2 = casper.cli.get(2);

var url = "https://pan.baidu.com/";

login_condition = stat == "-login";
upload_condition = stat == "-upload" && arg1 != undefined;
add_condition = stat == "-add" && arg1 != undefined;
delete_condition = (stat == "-rm" || stat == "-delete") && arg1 != undefined;
mv_condition = (stat == "-mv" || stat == "-change") && arg1 != undefined && arg2 != undefined;
list_condition = (stat == "-list" || stat == "-ls");
search_condition = stat == "-search" && arg1 != undefined;
details_condition = stat == "-details";

if (add_condition) {
    url = arg2 == undefined ? url : url + "disk/home#list/vmode=list&path=" + encodeURI(arg2);
    casper.start(url);

    var sel_offline_download = "a[data-button-id=b13]";
    var sel_new_link_task = "a#_disk_id_2";
    var sel_input_link = "input#share-offline-link";
    var sel_submit = "a[data-button-id=b69]";

    casper.waitForSelector(sel_offline_download, function() { this.click(sel_offline_download); });
    casper.waitForSelector(sel_new_link_task, function() { this.click(sel_new_link_task); });
    casper.waitForSelector(sel_input_link, function() { this.sendKeys(sel_input_link, arg1); });
    casper.waitForSelector(sel_submit, function() { this.click(sel_submit); });
}

function f_map(e) {
    var position = e.getAttribute("_position");
    var file_type = e.childNodes[1].getAttribute('class').replace("ovdhGNg5 ", "");
    var file_name = e.childNodes[2].firstChild.firstChild.getAttribute('title');
    var file_size = e.childNodes[3].innerHTML;
    var file_date = e.childNodes[4].innerHTML;
    return [position, file_type, file_name, file_size, file_date];
}

function eval(sel_ele, f_map) {
    var ele_list = document.querySelectorAll(sel_ele);
    return Array.prototype.map.call(ele_list, f_map);
}

if (upload_condition) {
    casper.start(url);
    casper.waitForSelector('a[data-button-id=b9]', function() {
        this.fillSelectors('a[data-button-id=b9] form', { 'input#h5Input0': arg1 }, true);
        this.echo("upload begin!! please wait...");
    });

    casper.waitFor(function() {
        var sel_dd_list = "dd[_position]";
        var dirs = this.evaluate(eval, sel_dd_list, f_map);
        var upload_result = false;
        for (i in dirs) {
            if (dirs[i][2] == arg1) { upload_result = true; }
        }
        return upload_result;
    }, function() {
        this.echo("upload over!!");
    });
}

if (login_condition) {
    casper.start(url);
    var RQ = "div.tang-pass-qrcode-imgWrapper";
    casper.then(function() {
        if ("百度网盘-全部文件" == this.getTitle()) {
            this.echo("login success");
        } else {
            this.echo("login page loading...");
            this.wait(10000, function(){
                this.captureSelector("RQ.png", RQ)
                this.echo("login page over, 100 sec auto exit, please scan..")
            });
            this.wait(100000);
        }
    });
}

if (list_condition) {
    url = arg1 == undefined ? url : url + "disk/home#list/vmode=list&path=" + encodeURI(arg1);
    casper.start(url);

    var sel_dd_list = "dd[_position]";
    casper.waitForSelector(sel_dd_list, function() {
        var dirs = this.evaluate(eval, sel_dd_list, f_map);
        var len_list = [0, 0, 0, 0, 0];
        var result_str = "";
        var dirs_len = dirs.length;
        this.echo(dirs_len + ' dirs found:');

        for(i in dirs) {
            var tmp_list = dirs[i];
            for(j in tmp_list) {
                var tmp_str_len = tmp_list[j].replace(/[\u0391-\uFFE5]/g, "00").length;
                len_list[j] = len_list[j] > tmp_str_len ? len_list[j] : tmp_str_len;
            }
        }
        for(i in dirs) {
            var tmp_list = dirs[i];
            for(j in tmp_list) {
                var tmp_str_len = tmp_list[j].replace(/[\u0391-\uFFE5]/g, "00").length;
                var add_space = len_list[j] - tmp_str_len + 1;
                result_str += tmp_list[j];
                for(var c=0;c<add_space;c++){ result_str += " "; }
            }
            if((dirs_len-i)!=1){result_str += "\n";}
        }

        this.echo(result_str);
    });
}

if (details_condition) {
    casper.start(url);

    casper.then(function() {
        this.echo("总共容量:" + this.getHTML('span[node-type="azFNGab"]'));
        this.echo("已用容量:" + this.getHTML('span[node-type="FOPyGQb"]'));
        this.echo("当前用户:" + this.getHTML('span[class="username"]'));
    });
}

casper.run();

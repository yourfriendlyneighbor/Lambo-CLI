"use strict";

const $ = require('jquery');
const cmd = require('./command.js');
const remote = require('electron').remote;
const rule = require('./changeCSS.js');
const fs = require('fs');
const path = require('path');
const url = require('url');
const http = require('http');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;


$(document).ready(function() {

    let user = cmd.user;
    let working_directory = cmd.working_directory;

    /* Utility Functions */
    function updateUser(){
        user = cmd.user
    }

    function updateDirectory(){
        working_directory = cmd.working_directory
    }

    /* Commands */

    function clear(){
        terminal.text("");
        var date = new Date().toString();
        date = date.substr(0, date.indexOf("GMT") - 1);

        terminal.append('Welcome ', user, '! It is currently: ', date);
        terminal.append('\n');
    }

    function color(args){
        const text = rule.getCSSRule('.console');
        const prompt = rule.getCSSRule('.yellow');
        const path = rule.getCSSRule('.green');
        const screen = rule.getCSSRule('body');
        if(args[0] == undefined){
            text.style.color = "#fff";
            prompt.style.color = "#ff0";
            path.style.color = "#90ee90";
            screen.style.backgroundColor = "#222";
        }else{
            const Usertext = args[0];
            const Userprompt = args[1];
            const Userpath = args[2];
            const Userscreen = args[3];

            text.style.color = Usertext;
            prompt.style.color = Userprompt;
            path.style.color = Userpath;
            screen.style.backgroundColor = Userscreen;
        }
    }

    function dir(args){
        var d = args[0] || working_directory;
        fs.readdir(d, function(err, items) {
            for (var i=0; i<items.length; i++) {
                var file = d + '/' + items[i];
                fs.stat(file, generate_callback(file));
            }
        });
    }

    function generate_callback(file) {
        return function(err, stats) {
                if(fs.lstatSync(file).isDirectory()){
                    terminal.append("<br/>Directory::" + file + "<br/>")
                }else{
                    terminal.append("<br/>File::" + file + " Size:: " + stats['size'] + "<br/>")
                }

            }
    };

    function ping(args){
        terminal.append("<br/>Ping is coming soon :)<br/>")
    }

    /* Start Program */
    const userTitle = $('#user');
    const dirTitle = $('#working_dir');
    const terminal = $('.terminal');
    const prompt = '$';
    const commands = cmd.commands

    let commandHistory = [];
    let historyIndex = 0;

    let command = "";

    var date = new Date().toString();
    date = date.substr(0, date.indexOf("GMT") - 1);

    terminal.append('Welcome ', user, '! It is currently: ', date);
    terminal.append('\n');

    displayCommandline();

    function displayCommandline(){
        terminal.append('<span class="prompt">'+prompt+'</span>')
        terminal.append('<span class="path">&nbsp;'+working_directory+'&nbsp;</span>')
    }

    function erase(n){
        command = command.slice(0, -n);
        terminal.html(terminal.html().slice(0, -n))
    }

    function clearCommand() {
		if (command.length > 0) {
			erase(command.length);
		}
    }

    function appendCommand(str) {
    	terminal.append(str);
    	command += str;
    }


    $(document).keydown(function(e) {
        e = e || window.event;
        var key = e.which || e.keyCode; // keyCode detection
        var ctrl = e.ctrlKey ? e.ctrlKey : ((key === 17) ? true : false); // ctrl detection

        if (/*key == 67 && ctrl || */key == 88 && ctrl) {
            var window = remote.getCurrentWindow();
            window.close();
        }
    })

    $(document).on('keydown', (e) => {
        e = e || window.event;
	    var keyCode = typeof e.which === "number" ? e.which : e.keyCode;

        if(keyCode === 8){
            e.preventDefault();
            if(command !== ""){
                erase(1)
            }
        }

        if(keyCode === 38 || keyCode === 40){
            if(keyCode === 38){
                historyIndex--;
                if(historyIndex < 0){
                    historyIndex++
                }
            }else{
                historyIndex++;
                if(historyIndex > commandHistory.length -1){
                    historyIndex--
                }
            }
        }

        var cm = commandHistory[historyIndex];
        if(cm !== undefined){
            clearCommand();
            appendCommand(cm)
        }

    })

    function processCommand() {
		var isValid = false;

		var args = command.split(" ");
		var cdd = args[0];
		args.shift();

        try {
            for (var i = 0; i < commands.length; i++) {
                if (cdd.toLowerCase() === commands[i].name) {
                    if(commands[i].name.toLowerCase() == "cls"){
                        clear()
                    }else if(commands[i].name.toLowerCase() == "color"){
                        color(args)
                    }else if(commands[i].name.toLowerCase() == "dir"){
                        dir(args)
                    }else if(commands[i].name.toLowerCase() == "ping"){
                        ping(args)
                    }else{
                        terminal.append(cmd[commands[i].name.toLowerCase()](args))
                        updateDirectory();
                    }
                    isValid = true;
                    break;
                }
            }
        } catch (e) {
                terminal.append("<br/>"+e+"<br/>")
        }


		// No match was found...
		if (!isValid) {
			terminal.append("Lambo: Command not found: " + command + "\n");
		}

		// Add to command history and clean up.
		commandHistory.push(command);
		historyIndex = commandHistory.length;
		command = "";

        terminal.append("<br />")
    }

    $(document).on('keypress', (e) => {
        e = e || window.event;
        var keyCode = typeof e.which === "number"? e.which : e.keyCode;

        switch (keyCode) {
				// ENTER
				case 13:
						{
								terminal.append("<br />");
								processCommand();
								displayCommandline();
								break;
						}
				default:
						{
								appendCommand(String.fromCharCode(keyCode));
						}
		}
    });
    // Check for updates:
    try {
        $.get("https://c4ihdxwm60ahtuxy.herokuapp.com/checkForUpdates", function(data, status){
            var current_version = fs.readFileSync('version_term', 'utf8');
            current_version = current_version.split('');
            current_version.splice(current_version.length-1, 1);
            current_version.splice(current_version.length-1, 1);
            current_version = current_version.join('');
            var current_version_num = current_version.replace('v','').replace('.','');

            var new_version = data.version;
            var new_version_num = new_version.replace('v','').replace('.','');

            console.log(current_version_num);
            console.log(new_version_num);

            if(current_version_num < new_version_num){
                fs.writeFile('version_term', new_version);
                $.get("https://c4ihdxwm60ahtuxy.herokuapp.com"+data.path, function(data, status){
                    console.log(data);
                    for(var i=0;i<data.length;i++){
                        var file_url = 'http://c4ihdxwm60ahtuxy.herokuapp.com'+data[i];
                        file_url = file_url.replace('/app','');
                        file_url = file_url.replace('updates','Lambo_CLI');
                        console.log(file_url);
                        var DOWNLOAD_DIR = 'downloads';

                        if (!fs.existsSync(DOWNLOAD_DIR)){
                            fs.mkdirSync(DOWNLOAD_DIR);
                        }
                        download_file_httpget(file_url);

                        // Function to download file using HTTP.get
                        function download_file_httpget(file_url) {
                            var options = {
                                host: url.parse(file_url).host,
                                port: 80,
                                path: url.parse(file_url).pathname
                            };

                            var file_name = url.parse(file_url).pathname.split('/').pop();
                            var file = fs.createWriteStream(DOWNLOAD_DIR + "/" + file_name);

                            http.get(options, function(res) {
                                res.on('data', function(data) {
                                    console.log(data);
                                    console.log(file);
                                    file.write(data);
                                }).on('end', function() {
                                    file.end();
                                    console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
                                });
                            });
                        };
                    }
                })

            }
        });
    }catch (e) {
        terminal.append("<br/>"+e+"<br/>")
    }
});

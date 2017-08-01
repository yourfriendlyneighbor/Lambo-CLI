"use strict";

const $ = require('jquery');
const cmd = require('./command.js');
const remote = require('electron').remote;
const rule = require('./changeCSS.js');
const fs = require('fs');
const path = require('path');

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

});

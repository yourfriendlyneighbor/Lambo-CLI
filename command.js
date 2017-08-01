var process = require('process');
var username = require('username');
var fs = require('fs');
var path = require('path');
var process = require('process');

var commandLine = function(){
    this.working_directory = process.cwd();
    this.user = username.sync();

    this.commands = [
        {
            "name": "cls",
            "help": "Clears the console. <br /> CLS"
        },
        {
            "name": "lambo",
            "help": "Displays infomation about the console your using. <br /> LAMBO -v"
        },
        {
            "name": "echo",
            "help": "Displays messages. <br /> ECHO [message]"
        },
        {
            "name": "help",
            "help": ""
        },
        {
            "name": "color",
            "help": "Sets the Prompt Color, Text Color, Background Color, and Path Color. <br /> COLOR [text] [prompt] [path] [screen] <br /> If no argument is given, this command restores the color to what it was when Lambo.exe started."
        },
        {
            "name": "dir",
            "help": "Displays a list of files and subdirectories in a directory. <br /> DIR [drive:][path][filename]"
        },
        {
            "name": "mkfile", // Create file
            "help": "Creates a file. <br /> MKFILE [drive:][path][filename] [content]"
        },
        {
            "name": "rmfile", // Delete file
            "help": "Removes a file. <br /> RMFILE [drive:][path][filename]"
        },
        {
            "name": "mkdir", // Create directory
            "help": "Creates a folder. <br /> MKDIR [drive:][path][filename]"
        },
        {
            "name": "rmdir", // Remove directory
            "help": "Removes a folder. <br /> RMDIR [drive:][path][filename]"
        },
        {
            "name": "cd", // Remove directory
            "help": "Changes the current directory. <br /> CD [..]"
        }
    ]

    this.version = "1.0.0 Alpha";
}

// Commands
commandLine.prototype['help'] = function(args){
    for(var i=0;i<this.commands.length;i++){
        if(this.commands[i].name == args[0].toLowerCase()){
            var item = this.commands[i].help;
            return item
        }
    }
}

commandLine.prototype['lambo'] = function(args){
    if(args[0] == undefined){
        return this['help'](['lambo'])
    }else if(args[0] == "-v"){
        return this.version
    }
}

commandLine.prototype['echo'] = function(args){
    if(args[0] == undefined){
        return this['help'](['echo'])
    }else{
        return args.join(" ") + '\n'
    }
}

commandLine.prototype['mkfile'] = function(args){
    var c = args[1] == undefined ? "" : args[1];
    console.log(args[1] == undefined);

    if(args[0] == undefined){
        return this['help'](['mkfile'])
    }else{
        fs.writeFile(args[0], c);
        return "Done."
    }
}

commandLine.prototype['rmfile'] = function(args){
     if(args[0] == undefined){
        return this['help'](['rmfile'])
    }else{
        fs.unlink(args[0]);
        return "Done."
    }
}

commandLine.prototype['mkdir'] = function(args){
    if(args[0] == undefined){
        return this['help'](['mkdir'])
    }else{
        fs.mkdirSync(args[0]);
        return "Done."
    }
}

commandLine.prototype['rmdir'] = function(args){
    if(args[0] == undefined){
        return this['help'](['rmdir'])
    }else{
        fs.rmdirSync(args[0]);
        return "Done."
    }
}

commandLine.prototype['cd'] = function(args){
    if(args[0] == undefined){
        return this['help']['cd']
    }else{
        process.chdir(args[0]);
        this.updateWorkingDirectory();
        return "Success"
    }
}

// Innerprogram functions

commandLine.prototype.updateWorkingDirectory = function(){
    this.working_directory = process.cwd()
}

var c = new commandLine()

module.exports = c

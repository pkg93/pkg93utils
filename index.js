#!/usr/bin/env node
const colors = require("colors"); // eslint-disable-line no-unused-vars
const fs = require("fs");
const readlineSync = require("readline-sync");
const yesno = require("yesno");
const version = "v" + require("./package.json").version;
const help = `${("pkg93utils " + version).bold}

${"Usage:".bold} pkg93utils <command>

${"Commands:".bold}
sync                      Synchronises packages in a repo with repo.json
init <repo|pkg>           Initializes a repository or a package.
sans
`;

function syncDir(dir) {
  if (fs.existsSync(dir + "/repo.json")) {
    var repo = require(dir + "/repo.json");
    repo.packages = [];
    console.log("SYNC".magenta.bold + " " + dir);
    var folders = fs.readdirSync(dir);
    folders.forEach((file) => {
      var filestat = fs.statSync(dir + "/" + file);
      if (file != ".git" && file != "node_modules" && filestat.isDirectory()) {
        if (fs.existsSync(dir + "/" + file + "/package.json")) {
          console.log("PKG  ".green.bold + file);
          repo.packages.push(file);
        }
      }
    });
    console.log("WRIT ".magenta.bold + dir + "/repo.json");
    fs.writeFileSync(dir + "/repo.json",
      JSON.stringify(repo, undefined, 2) + "\n");
    console.log("OK   ".green.bold + "Synchronised successfully.");
    return true;
  } else {
    console.error("ERR  ".red.bold + dir + " is not a valid repository.");
    return false;
  }
}

if (process.argv.length < 3) {
  console.log(help);
} else if (process.argv[2] == "sync") {
  var dir = process.cwd();
  if (!syncDir(dir)) {
    process.exit(1);
  }
} else if (process.argv[2] == "init") {
  if (process.argv[3] == "pkg") {
    console.log(`
This utility will walk you through creating a basic package.json file.
It only sets up a name, description, injector and an optional uninstaller.
`);
    var output = {};
    output.name = process.cwd().split("/")[process.cwd().split("/").length - 1];
    console.log("I'm assuming your package name is " + output.name + ".");
    output.description = readlineSync.question(
      "Enter a description of your package: "
    );
    output.inject = readlineSync.question(
      "Type the filename of your package's injector: "
    );
    var rem = readlineSync.question(
      "Type the filename of your package's uninstaller, or type none if you " +
      "haven't made one: (none) ",
      {defaultInput: "none"}
    );
    if (rem != "none") {output.uninstall = rem;}
    console.log("About to write to " + (process.argv[4] || process.cwd()) +
      "/package.json: \n" + JSON.stringify(output, undefined, 2));
    yesno.ask("Is this ok? [Yn]", true, function(ok) {
      if (ok) {
        fs.writeFileSync(process.argv[4] || process.cwd() + "/package.json",
          JSON.stringify(output, null, 2));
        console.log("Done.");
        process.exit(0);
      } else {
        console.log("Aborted.");
        process.exit(1);
      }
    }, ["y", "yes", "ye"], ["n", "no", "nope"]);
  } else if (process.argv[3] == "repo") {
    console.log(`
This utility will walk you through creating a repo.json file.
It only sets up a name, message and packages, which is all you need.
`);
    var output = {};
    var defaultName = process.argv[4] ||
      process.cwd().split("/")[process.cwd().split("/").length - 1];
    output.name = readlineSync.question("Enter a name: (" + defaultName + ") ",
      {defaultInput: defaultName});
    output.msg = readlineSync.question(
      "Enter a message for your users to see: (Hello, World!)",
      {defaultInput: "Hello, World!"}
    );
    var dir = process.argv[4] || process.cwd();
    console.log("About to write to " + dir + "/package.json: \n" +
      JSON.stringify(output, undefined, 2));
    yesno.ask("Is this ok? [Yn]", true, function(ok) {
      if (ok) {
        fs.writeFileSync(dir + "/repo.json", JSON.stringify(output, null, 2));
        console.log("Synchronising packages with repo.json...");
        if (!syncDir(dir)) {
          process.exit(1);
        } else {
          console.log("Done.");
          process.exit(0);
        }
      } else {
        console.error("Aborted.");
        process.exit(1);
      }
    }, ["y", "yes", "ye"], ["n", "no", "nope"]);
  } else {
    console.error("ERR  ".red.bold + "You must specify repo or pkg.");
    process.exit(1);
  }
}
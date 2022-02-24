#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import { createSpinner } from "nanospinner";
import shell from "shelljs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import minimist from "minimist";
import buildOptions from "minimist-options";

const options = buildOptions({
    folder: {
        type: "string",
        alias: "f",
        default: null,
    },
});

const args = minimist(process.argv.slice(2), options);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

// Args
let arg_folderName = args["folder"];

process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
});

async function welcome() {
    figlet("Dotnet APP", function (err, data) {
        if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            process.exit(1);
        }

        const startMessage = gradient.atlas.multiline(data);
        console.log(startMessage);
    });

    await sleep();
}

async function menu() {
    console.log(`
        ${chalk.bgBlue("ARGUMENTS")} 
        Has been found the next arguments
        Folder name: ${
            arg_folderName
                ? chalk.underline(arg_folderName)
                : chalk.bgRed("Not found")
        }
        So let's create dotnet application...
    `);

    const menuAnsewer = await inquirer.prompt({
        name: "choose_menu",
        type: "list",
        message: "Choose your build\n",
        choices: ["Console", "Web API"],
    });

    return menuAnsewer.choose_menu;
}

function handleWithArgs() {
    if (arg_folderName) {
        shell.mkdir("-p", arg_folderName);
        shell.cd(arg_folderName);
    }
}

function builder(option) {
    handleWithArgs();

    const spinner = createSpinner(
        `Create ${option} application...\n\n`
    ).start();

    if (option === "Console") {
        shell.exec("dotnet new sln");
        shell.exec("dotnet new console");

        console.log("\n");
        spinner.success({
            text: `The ${option} has been created successfully!`,
        });

        process.exit(0);
    } else if (option === "Web API") {
        shell.exec("dotnet new sln");

        shell.exec("dotnet new webapi -n API");

        shell.exec("dotnet new classlib -n Services");
        shell.exec("dotnet new classlib -n Database");
        shell.exec("dotnet new classlib -n Models");
        shell.exec("dotnet new classlib -n Providers");

        shell.exec("dotnet sln add API");
        shell.exec("dotnet sln add Services");
        shell.exec("dotnet sln add Database");
        shell.exec("dotnet sln add Models");
        shell.exec("dotnet sln add Providers");
        shell.exec("dotnet sln list");

        shell.cd("API");
        shell.exec("dotnet add reference ../Services");
        shell.exec("dotnet add reference ../Providers");
        shell.cd("..");
        shell.cd("Services");
        shell.exec("dotnet add reference ../Models");
        shell.exec("dotnet add reference ../Database");
        shell.cd("..");
        shell.cd("Providers");
        shell.exec("dotnet add reference ../Services");
        shell.cd("..");
        shell.cd("Database");
        shell.exec("dotnet add reference ../Models");
        shell.cd("..");
        shell.exec("dotnet new gitignore");

        console.log("\n\n");
        spinner.success({
            text: `The ${option} has been created successfully!`,
        });

        process.exit(0);
    }
}

// Run it with top-level await
console.clear();
await welcome();
const option = await menu();
builder(option);

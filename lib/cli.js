#!/usr/bin/env node

'use strict';

const meow = require('meow');
const fetch = require('node-fetch')
const chalk = require('chalk')
const ora = require('ora')
const link = require('terminal-link')

const cli = meow(`
 Usage
   $ stalk <GitHub user>
`, {
  flags: {
    user: {
      type: 'string'
    }
  }
});

if (!cli.input[0]) {
  cli.showHelp(2)
} else {
  const spinner = ora(`Sending request for user ${chalk.green(cli.input[0])}\n`).start();
  fetch(`https://api.github.com/users/${cli.input[0]}`)
    .then(res => res.json())
    .then(json => {
      spinner.succeed()
      console.log(json)
      console.log(`${chalk.red('»')} ${chalk.underline('User Information')}`)
      console.log(`${chalk.green('»')} ${chalk.bold('Name')}: ${json.name}`)
      console.log(`${chalk.green('»')} ${chalk.bold('Bio')}: ${json.bio}`)
      console.log(`${chalk.green('»')} ${chalk.bold('Company')}: ${json.company}`)
      console.log(`${chalk.green('»')} ${chalk.bold('Website')}: ${link(`${json.blog}`, `${json.blog}`)}`)
      console.log(`${chalk.green('»')} ${chalk.bold('Location')}: ${json.location}`)

      console.log(`${chalk.red('\n»')} ${chalk.underline('Repository Statistics')}`)
      console.log(`${chalk.green('»')} ${chalk.bold('Public Repos:')}: ${json.public_repos}`)

    });
}
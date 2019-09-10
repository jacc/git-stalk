#!/usr/bin/env node

'use strict';

const meow = require('meow');
const fetch = require('node-fetch')
const chalk = require('chalk')
const ora = require('ora')
const link = require('terminal-link')
const pretty = require('pretty-date')

const cli = meow(`
  Usage
   $ stalk <GitHub user>
   $ stalk <GitHub user> -r

  Options
   -r, --recent: only get recent commit by user.
  
  Example
   $ stalk jacc
   $ stalk jacc -r
`, {
  flags: {
    user: {
      type: 'string'
    },
    recent: {
      type: 'boolean',
      alias: 'r'
    }
  }
});

if (!cli.input[0]) {
  cli.showHelp(2)
} else if (!cli.flags.recent) {
  const spinner = ora(`Requesting information for ${chalk.green(cli.input[0])}...`).start();
  fetch(`https://api.github.com/users/${cli.input[0]}`)
    .then(res => res.json())
    .then(json => {
      spinner.succeed()
      console.log(`${chalk.yellow('»')} ${chalk.underline('User Information')}`)
      console.log(json.name != null ? `${chalk.green('»')} ${chalk.bold('Name')}: ${json.name}` : `${chalk.red('»')} No ${chalk.red('public name')} found.`)
      console.log(json.bio != null ? `${chalk.green('»')} ${chalk.bold('Bio')}: ${json.bio}` : `${chalk.red('»')} No ${chalk.red('bio')} found.`)
      console.log(`${chalk.green('»')} ${chalk.bold('Followers/following')}: ${json.followers} / ${json.following} (${json.followers / json.following} ratio)`)
      console.log(json.company != null ? `${chalk.green('»')} ${chalk.bold('Company')}: ${json.company}` : `${chalk.red('»')} No ${chalk.red('company')} found.`)
      console.log(json.blog != null ? `${chalk.green('»')} ${chalk.bold('Website')}: ${link(`${json.blog}`, `${json.blog}`)}` : `${chalk.red('»')} No ${chalk.red('public website')} found.`)
      console.log(json.location != null ? `${chalk.green('»')} ${chalk.bold('Location')}: ${json.location}` : `${chalk.red('»')} No ${chalk.red('public location')} found.`)

      console.log(`${chalk.yellow('\n»')} ${chalk.underline('Repository Statistics')}`)
      console.log(`${chalk.green('»')} ${chalk.bold('Public Repos')}: ${json.public_repos}`)
      console.log(`${chalk.green('»')} ${chalk.bold('Public Gists')}: ${json.public_gists}`)

    });
} else if (cli.flags.recent = true) {
  const spinner = ora(`Requesting information for ${chalk.green(cli.input[0])}...`).start();
  fetch(`https://api.github.com/users/${cli.input[0]}/events`)
    .then(res => res.json())
    .then(json => {
      var eventType;
      switch (json[0].type) {
        case "PushEvent":
          eventType = `${chalk.green('Committed')} to ${chalk.green(json[0].repo.name)} with message '${chalk.green(json[0].payload.commits[0].message)}'`
          break;
        case "WatchEvent":
          eventType = `${chalk.yellow('Starred')} the repo ${chalk.green(json[0].repo.name)}`
          break;
        case "CreateEvent":
          eventType = `${chalk.yellow('Created')} the repo ${chalk.green(json[0].repo.name)}`
          break;
      }
      spinner.succeed()
      console.log(`\n${chalk.green('»')} ${cli.input[0]}'s latest public event (${chalk.green(pretty.format(new Date(json[0].created_at)))}):\n${eventType}`)
    })
}
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
  const spinner = ora(`Requesting information for ${chalk.green(cli.input[0])}...\n`).start();
  fetch(`https://api.github.com/users/${cli.input[0]}`)
    .then(res => res.json())
    .then(json => {
      if (json.message) {
        spinner.text = `User ${chalk.red(cli.input[0])} was not found.`
        spinner.fail()
      } else {
        //spinner.text = 'yay'
        spinner.succeed()
        console.log(`${chalk.yellow('»')} ${chalk.underline('User Information')}`)
        console.log(json.name != null ? `${chalk.green('»')} ${chalk.bold('Name')}: ${json.name}` : `${chalk.red('»')} No ${chalk.red('public name')} found.`)
        console.log(json.bio != null ? `${chalk.green('»')} ${chalk.bold('Bio')}: ${json.bio}` : `${chalk.red('»')} No ${chalk.red('bio')} found.`)
        console.log(`${chalk.green('»')} ${chalk.bold('Followers/following')}: ${json.followers} / ${json.following} (${json.followers / json.following} ratio)`)
        console.log(json.company != null ? `${chalk.green('»')} ${chalk.bold('Company')}: ${json.company}` : `${chalk.red('»')} No ${chalk.red('company')} found.`)
        console.log(json.blog != null ? `${chalk.green('»')} ${chalk.bold('Website')}: ${link(`${json.blog}`, `${json.blog}`)}` : `${chalk.red('»')} No ${chalk.red('public website')} found.`)
        console.log(json.location != null ? `${chalk.green('»')} ${chalk.bold('Location')}: ${json.location}` : `${chalk.red('»')} No ${chalk.red('public location')} found.`)
  
        console.log(`${chalk.yellow('\n»')} ${chalk.underline('Latest Activity')}`)
        console.log(`${chalk.green('»')} ${chalk.bold('Activity')}: soon TM`)
        console.log(`${chalk.green('»')} ${chalk.bold('When')}: soon TM`) /* ${pretty.format(new Date(json[0].created_at))} for when I eventually add the events endpoint */
        console.log(`${chalk.green('»')} ${chalk.bold('Repository')}: soon TM`)
      
        console.log(`${chalk.yellow('\n»')} ${chalk.underline('Repository Statistics')}`)
        console.log(`${chalk.green('»')} ${chalk.bold('Public repos')}: ${json.public_repos}`)
        console.log(`${chalk.green('»')} ${chalk.bold('Public gists')}: ${json.public_gists}`)
        console.log(`${chalk.green('»')} ${chalk.bold('Total stargazers')}: soon TM`)
        console.log(`${chalk.green('»')} ${chalk.bold('Total forks')}: soon TM`)
  
  
      }
    });
} else if (cli.flags.recent = true) {
  const spinner = ora(`Requesting latest activity for ${chalk.green(cli.input[0])}...`).start();
  fetch(`https://api.github.com/users/${cli.input[0]}/events`)
    .then(res => res.json())
    .then(json => {
       if (json.message) {
        spinner.text = `User ${chalk.red(cli.input[0])} was not found.`
        spinner.fail()
      } else if(json = '[]') {
        spinner.text = `User ${chalk.red(cli.input[0])} has no public events (according to the GitHub API).`
        spinner.fail()
      } else {
      var eventType;
      /* why are there so many EVENT TYPES GITHUB WHY */
      switch (json[0].type) {
        case "PushEvent":
          eventType = `${chalk.green('Committed')} to ${chalk.green(json[0].repo.name)} with message '${chalk.green(json[0].payload.commits[0].message)}'`
          break;
        case "WatchEvent":
          eventType = `${chalk.yellow('Starred')} the repo ${chalk.yellow(json[0].repo.name)}`
          break;
        case "CreateEvent":
            if (json[0].payload.ref === null) eventType = `${chalk.green('Created')} a ${chalk.green(`repository`)} (${chalk.green(json[0].repo.name)})`
            eventType = `${chalk.green('Created')} a ${chalk.green(`${json[0].payload.ref_type} ${json[0].payload.ref}`)} on ${chalk.green(json[0].repo.name)}`
            break;
        case "DeleteEvent":
            if (json[0].payload.ref === null) eventType = `${chalk.red('Deleted')} a ${chalk.red(`repository`)} (${chalk.red(json[0].repo.name)})`
            eventType = `${chalk.red('Deleted')} a ${chalk.green(`${json[0].payload.ref_type} ${json[0].payload.ref}`)} on ${chalk.red(json[0].repo.name)}`
            break;
      }
      spinner.succeed()
      console.log(`\n${chalk.green('»')} ${cli.input[0]}'s latest public event (${chalk.green(pretty.format(new Date(json[0].created_at)))}):\n${eventType}`)
    }
    })
}
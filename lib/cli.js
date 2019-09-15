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
   $ stalk <GitHub user/repo name>
   $ stalk <GitHub user> -ra

  Options
   -ra, --recent: only get recent actvity by user.
  
  Example
   $ stalk jacc
   $ stalk jacc/git-stalk
   $ stalk jacc -ra
`, {
  flags: {
    query: {
      type: 'string'
    },
    recent: {
      type: 'boolean',
      alias: 'ra'
    }
  }
});

if (!cli.input[0]) {
  cli.showHelp(2)
} else if (!cli.flags.recent && cli.input[0].includes('/')) {
  var strings = [];
  strings.push(cli.input[0].split('/')) // this is the stupidest shit i think i'll ever do but it's 12:16 am so do i really care
  const spinner = ora(`Requesting information for ${chalk.green(`${strings[0][0]}${chalk.white('/')}${strings[0][1]}`)}...\n`).start(); // god help me
  fetch(`https://api.github.com/users/${strings[0][0]}/repos`)
    .then(res => res.json())
    .then(json => {

      /*

      this is completely and utterly busted
      i really need to add error handling if the repo doesn't exist / is private
      do something with the promise thing when you're actually OK

      love, past jack

      */

      async function match(string) { //  god bless magnetardev
        try {
          return Promise.resolve(Promise.resolve(json.filter(el => el.name == string)))
        } catch (e) {
          console.log(e)
        }
      }

      match(strings[0][1])
        .then(res => {

          console.log(res)

          spinner.text = ''
          spinner.stopAndPersist()

          console.log(`${chalk.yellow('»')} ${chalk.underline(`Information on ${res[0].full_name}\n`)}`)
          console.log(`${chalk.green('»')} ${chalk.bold(`Owner`)}: ${res[0].owner.login}`)
          console.log(`${chalk.green('»')} ${chalk.bold(`Description`)}: ${res[0].description}`)
          console.log(`${chalk.green('»')} ${chalk.bold(`Primary language`)}: ${`${(res[0].language)}`}`)
          console.log(`${chalk.green('»')} ${chalk.bold(`License`)}: ${`${(res[0].license == null ? 'No license.' : res[0].license)}`}`)

          console.log(`${chalk.green('\n»')} ${chalk.bold(`Star count`)}: ${`${(res[0].stargazers_count)}`}`)
          console.log(`${chalk.green('»')} ${chalk.bold(`Watchers count`)}: ${`${(res[0].watchers_count)}`}`)
          console.log(`${chalk.green('»')} ${chalk.bold(`Fork count`)}: ${`${(res[0].forks_count)}`}`)
          console.log(`${chalk.green('»')} ${chalk.bold(`(Open) issues count`)}: ${`${(res[0].open_issues_count)}`}`)

          console.log(`${chalk.green('\n»')} ${chalk.bold(`Created`)}: ${`${pretty.format(new Date(res[0].created_at))}`}`)
          console.log(`${chalk.green('»')} ${chalk.bold(`Last commit`)}: ${`${pretty.format(new Date(res[0].pushed_at))}`}`)
          console.log(`${chalk.green('»')} ${chalk.bold(`Last update`)}: ${`${pretty.format(new Date(res[0].updated_at))}`}`)


        })
    })
} else if (!cli.flags.recent && !cli.input[0].includes('/')) {
  const spinner = ora(`Requesting information for ${chalk.green(cli.input[0])}...\n`).start();
  fetch(`https://api.github.com/users/${cli.input[0]}`)
    .then(res => res.json())
    .then(json => {
      if (json.message) {
        spinner.text = `User ${chalk.red(cli.input[0])} was not found.`
        spinner.fail()
      } else {
        spinner.text = ''
        spinner.stopAndPersist()

        console.log(`${chalk.yellow('»')} ${chalk.underline(`${json.type} Information`)}`)
        console.log(json.name != null ? `${chalk.green('»')} ${chalk.bold('Name')}: ${json.name}` : `${chalk.red('»')} No ${chalk.red('public name')} found.`)
        console.log(json.bio != null ? `${chalk.green('»')} ${chalk.bold('Bio')}: ${json.bio}` : `${chalk.red('»')} No ${chalk.red('bio')} found.`)

        if (json.type !== 'Organization') {
          console.log(`${chalk.green('»')} ${chalk.bold('Followers/following')}: ${json.followers} / ${json.following} (${json.followers / json.following} ratio)`)
        } else {
          console.log(`${chalk.red('»')} ${chalk.bold(`Followers are not available on ${chalk.red(`organizations`)}`)}`)
        }

        console.log(json.company != null ? `${chalk.green('»')} ${chalk.bold('Company')}: ${json.company}` : `${chalk.red('»')} No ${chalk.red('company')} found.`)
        console.log(json.blog != null ? `${chalk.green('»')} ${chalk.bold('Website')}: ${link(`${json.blog}`, `${json.blog}`)}` : `${chalk.red('»')} No ${chalk.red('public website')} found.`)
        console.log(json.location != null ? `${chalk.green('»')} ${chalk.bold('Location')}: ${json.location}` : `${chalk.red('»')} No ${chalk.red('public location')} found.`)

        if (json.type !== 'Organization') {
          console.log(`${chalk.yellow('\n»')} ${chalk.underline('Repository Statistics')}`)
          console.log(`${chalk.green('»')} ${chalk.bold('Public repos')}: ${json.public_repos}`)
          console.log(`${chalk.green('»')} ${chalk.bold('Public gists')}: ${json.public_gists}`)
          console.log(`${chalk.green('»')} ${chalk.bold('Total stargazers')}: soon TM`)
          console.log(`${chalk.green('»')} ${chalk.bold('Total forks')}: soon TM`)
        }
      }
    });
} else if (cli.flags.recent = true) {
  const spinner = ora(`Requesting latest activity for ${chalk.green(cli.input[0])}...`).start();
  fetch(`https://api.github.com/users/${cli.input[0]}/events`)
    .then(res => res.json())
    .then(json => {

      if (!json.message) {
        spinner.text = `User ${chalk.red(cli.input[0])} was not found.`
        spinner.fail()
      }

      /* currently broken -- find better detection for no events */

      // else if (json[0].type === undefined) {
      // spinner.text = `User ${chalk.red(cli.input[0])} has no public events (according to the GitHub API).`
      // spinner.fail()
      /*}*/
      else {
        var eventType;
        /* big thanks to git@thelittlewonder, without him I think I would have wasted an unholy amount of time on researching event types */
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
          case "ForkEvent":
            eventType = `${chalk.green('Forked')} the repo ${chalk.green(json[0].repo.name)}`
            break;
          case "PullRequestEvent":
            if (json[0].payload.action === "closed") eventType = `${chalk.red('Closed')} a ${chalk.green(`pull request`)} on ${chalk.red(json[0].repo.name)}`
            if (json[0].payload.action === "opened") eventType = `${chalk.green('Opened')} a ${chalk.green(`pull request`)} on ${chalk.green(json[0].repo.name)}`
            break;
          case "IssuesEvent":
            if (json[0].payload.action === "closed") eventType = `${chalk.red('Closed')} an ${chalk.green(`issue`)} on ${chalk.red(json[0].repo.name)}`
            if (json[0].payload.action === "opened") eventType = `${chalk.green('Opened')} an ${chalk.green(`pull request`)} on ${chalk.green(json[0].repo.name)}`
            break;
          case "PullRequestReviewCommentEvent":
            eventType = `${chalk.gray('Commented')} on their pull request on the repo ${chalk.gray(json[0].repo.name)}`
            break;
        }
        spinner.text = ''
        spinner.stopAndPersist()
        console.log(`\n${chalk.green('»')} ${cli.input[0]}'s latest public event (${chalk.green(pretty.format(new Date(json[0].created_at)))}):\n${eventType}`)
      }
    })
}
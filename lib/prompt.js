const files = require('./files')
const inquirer = require('inquirer')
const _ = require('lodash')
const fs = require('fs')
const touch = require('touch')
const {
  _: [defaultRepoName, defaultRepoDescription]
} = require('minimist')(process.argv.slice(2))

// (void) => Promise<{ username: string, password: string }>
function getUsernamePassword() {
  const questions = [
    {
      name: 'username',
      type: 'input',
      message: 'Enter your Github username or e-mail address:',
      validate: value => value.length ? true : 'Please enter your username or e-email address'
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: value => value.length ? true : 'Please enter your password'
    }
  ]

  return inquirer.prompt(questions)
}

// (void) => Promise<{ name, description, visibility }>
function getRepoConfig() {
  const questions = [
    {
      name: 'name',
      type: 'input',
      message: 'Enter a name for this repository:',
      default: defaultRepoName || files.getCurrentDirectoryBase(),
      validate: value => value.length ? true : 'Please enter a name for the repository'
    },
    {
      name: 'description',
      type: 'input',
      message: '(Optional) Enter a description for this repository',
      default: defaultRepoDescription || null
    },
    {
      name: 'visibility',
      type: 'list',
      message: 'Public or private:',
      choices: ['public', 'private'],
      default: 'public'
    }
  ]

  return inquirer.prompt(questions)
}

// (void) => Promise<void>
function createGitIgnore() {
  const fileList = _.without(fs.readdirSync('.'), '.git', 'gitignore')

  return new Promise(function(resolve, reject) {
    if (fileList.length) {
      inquirer.prompt([
        {
          name: 'ignore',
          type: 'checkbox',
          message: 'Select the files and/or folders you wish to ignore:',
          choices: fileList,
          default: ['node_modules', 'bower_components', '.vscode', '.idea']
        }
      ])
      .then(answers => {
        if (answers.ignore.length) {
          fs.writeFileSync('.gitignore', answers.ignore.join('\n'))
        } else {
          touch('.gitignore')
        }
        resolve('done')
      })
    } else {
      touch('.gitignore')
      resolve('done')
    }
  })
}

module.exports = {

  // (void) => Promise<{ username: string, password: string }>
  getUsernamePassword,

  // (void) => Promise<{ name: string, description: string, visibility: string }>
  getRepoConfig,

  // (void) => Promise<void>
  createGitIgnore

}
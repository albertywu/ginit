const {good, bad} = require('./utils')
const prompt = require('./prompt')
const Spinner = require('clui').Spinner
const GitHubApi = require('github')
const github = new GitHubApi({ version: '3.0.0' })
const git = require('simple-git')()
const Preferences = require('preferences')
const prefs = new Preferences('ginit')

// ({ username: string, password: string }) => Promise<string>
function fetchGithubToken({ username, password }) {
  let status = new Spinner('Authenticating you, please wait...')
  status.start()

  return new Promise(function(resolve, reject) {
    github.authenticate({
      type: 'basic',
      username,
      password
    })

    github.authorization.create({
      scopes: ['user', 'public_repo', 'repo', 'repo:status'],
      note: 'ginit, the command-line tool for initializing Git repos'
    }, function(err, resp) {
      status.stop()
      if (err) {
        reject(err)
      } else if (resp.token) {
        prefs.github = resp.token
        resolve(resp.token)
      }
    })
  })
}

// () => Promise<void>
function authenticate() {
  return new Promise(function(resolve, reject) {
    getGithubToken()
    .then(token => {
      github.authenticate({
        type: 'oauth',
        token
      })
      resolve(token)
    })
    .catch(err => reject(err))
  })
}

// () => Promise<string>
function getGithubToken() {
  return new Promise(function(resolve, reject) {
    if (prefs.github && prefs.github.token) {
      resolve(prefs.github.token)
    } else {
      return prompt
      .getUsernamePassword()
      .then(fetchGithubToken)
    }
  })
}

// () => Promise<string>
function createRepo() {
  return new Promise(function(resolve, reject) {
    prompt
    .getRepoConfig()
    .then(({ name, description, visibility }) => {
      let status = new Spinner('Creating repository...')
      status.start()

      github.authenticate({
        type: 'oauth',
        token: prefs.github.token
      })

      github.repos.create({
        name,
        description,
        private: visibility === 'private'
      }, function(err, resp) {
        status.stop()
        if (err) {
          reject(err)
        } else {
          resolve(resp.ssh_url)
        }
      })
    })
  })
}

// (url: string) => Promise<void>
function setupRepo(url) {
  let status = new Spinner('Setting up the repository...')
  status.start()

  return new Promise(function(resolve, reject) {
    git
    .init()
    .add('.gitignore')
    .then(_ => good('git add .gitignore'))
    .add('./*')
    .then(_ => good('git add ./*'))
    .commit('Initial commit')
    .then(_ => good('git commit -m \'Initial Commit\''))
    .addRemote('origin', url)
    .then(_ => good('git remote add origin ${url}'))
    .push('origin', 'master')
    .then(
      function() {
        good('git push origin master')
        status.stop()
        resolve('done')
      }
    )
  })
}

module.exports = {

  // () => Promise<string>
  createRepo,

  // (url: string) => Promise<void>
  setupRepo,

  // (void) => Promise<string|errCode>
  authenticate

}
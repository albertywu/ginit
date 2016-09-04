#!/usr/bin/env node

const {ascii, bad} = require('./lib/utils')
const files = require('./lib/files')
const github = require('./lib/github')
const prompt = require('./lib/prompt')
const clear = require('clear')

clear()
ascii('Ginit')

if (files.directoryExists('.git')) {
  bad('Already a git repository!')
  process.exit()
}

github
  .authenticate()               // (void) => Promise<void>
  .then(prompt.createGitIgnore) // (void) => Promise<void>
  .then(github.createRepo)      // (void) => Promise<string>
  .then(github.setupRepo)       // (url: string) => Promise<void>
  .catch(handleServerError)     // (err: Object) => void

// (err: { code: number, status: string }) => void
function handleServerError(err) {
  if (err) {
    bad(`[${err.code}]: ${err.status}`)
  }
}
const chalk = require('chalk')
const figlet = require('figlet')

module.exports = {

  bad: (text) => console.log(
    chalk.red(text)
  ),

  good: (text) => console.log(
    chalk.green(text)
  ),

  ascii: (text) => console.log(
    chalk.yellow(
      figlet.textSync('Ginit', { horizontalLayout: 'full' })
    )
  )

}
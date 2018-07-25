const warnLargePullRequest = require('./src/warnLargePullRequest')

const printPayload = context => {
  console.log(JSON.stringify(context, null, 2))
}

const handlePullRequestOpenedEvent = async context => {
  // printPayload(context)
  await warnLargePullRequest(context)
}

/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

  app.on(['pull_request.opened'], handlePullRequestOpenedEvent)

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}

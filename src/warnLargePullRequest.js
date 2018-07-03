const CODE_CHANGE_THRESHOLD = 500

module.exports = async context => {
  const { additions, deletions } = context.payload.pull_request

  if (additions > CODE_CHANGE_THRESHOLD || deletions > CODE_CHANGE_THRESHOLD) {
    await context.github.pullRequests.createReview(
      Object.assign(context.issue(), {
        body: `:fearful: This PR is too large for review (+${additions} -${deletions}).\nWe generally accept ${CODE_CHANGE_THRESHOLD} lines of code change at maximum.\nPlease split your changes into several PRs for easier review. :pray:`,
        event: 'COMMENT'
      })
    )

    await context.github.issues.addLabels(
      Object.assign(context.issue(), {
        labels: ['large PR']
      })
    )
  }
}

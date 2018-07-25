const mm = require('micromatch')

// Additions and deletions LOC threshold of a PR
const CODE_CHANGE_THRESHOLD = 500

// Array of glob patterns indicating a set of files to be ignored from LOC checking
const FILE_CHANGE_IGNORE = [
  "flow-typed/**",
  "**/__snapshots__/**",
  "**/__fixtures__/**",
  "yarn.lock"
]

const isIgnoredFile = fileName => mm.isMatch(fileName, FILE_CHANGE_IGNORE)
const calcTotalAdjustment = (files, key) => files.reduce((acc, file) => acc + (isIgnoredFile(file.filename) ? file[key] : 0), 0)

module.exports = async context => {
  const { additions, deletions } = context.payload.pull_request

  const files = await context.github.paginate(
    context.github.pullRequests.getFiles(context.issue()),
    res => res.data
  )

  const addAdjustment = calcTotalAdjustment(files, "additions")
  const deleteAdjustment = calcTotalAdjustment(files, "deletions")
  const isViolated = additions - addAdjustment > CODE_CHANGE_THRESHOLD || deletions - deleteAdjustment > CODE_CHANGE_THRESHOLD

  if (isViolated) {
    await context.github.pullRequests.createReview(
      Object.assign(context.issue(), {
        body: `:fearful: This PR is too large for review (\`+${additions}\` \`-${deletions}\`).\nWe generally accept \`${CODE_CHANGE_THRESHOLD}\` lines of code change at maximum.\nPlease split your changes into several PRs for easier review. :pray:`,
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

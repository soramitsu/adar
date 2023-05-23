@Library('jenkins-library@feature/DOPS-2406-limit-the-execution-time') _

def pipeline = new org.js.AppPipeline(steps: this,
    dockerImageName: 'adar/web',
    buildDockerImage: 'docker.soramitsu.co.jp/build-tools/node:14-ubuntu-extended',
    dockerRegistryCred: 'bot-adar-rw',
    // buildEnvironment: buildEnvironment,
    dockerImageTags: ['adar': 'latest', 'adar-dev': 'dev'],
    copyStaticToBranch: true,
    sonarProjectName: 'adar-web',
    sonarProjectKey: 'jp.co.soramitsu:adar-web',
    stageDeploy: true,
    downstreamJob: '../deploy/web-stage1',
    copyToBranches: ['fleek-pre', 'fleek'],
    copyFile: 'env.json',
    // ipfsHashNotification: true,
    fleekDefaultSiteName: 'dawn-block-3896',
    secretScannerExclusion: '.*env.json',
    // ipfsHashChatID: '-1001375555544'
)
pipeline.runPipeline()

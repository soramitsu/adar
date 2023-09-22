@Library('jenkins-library') _

def pipeline = new org.js.AppPipeline(steps: this,
    dockerImageName: 'adar/web',
    buildDockerImage: 'build-tools/node:16-ubuntu',
    dockerRegistryCred: 'bot-adar-rw',
    // buildEnvironment: buildEnvironment,
    dockerImageTags: ['adar': 'latest', 'adar-dev': 'dev'],
    sonarProjectName: 'adar-web',
    sonarProjectKey: 'jp.co.soramitsu:adar-web',
    fleekDeployProd: true,
    fleekDeployStage: true,
    fleekDefaultSiteNameStage: 'dawn-block-3896',
    fleekDefaultSiteNameProd: 'wild-hat-6209',
    fleekBranchesStage: ['fleek-pre'],
    fleekBranchesProd: ['fleek'],
    copyFileStage: 'env-stage.json',
    copyFileProd: 'env.json',
    ipfsHashNotificationStage: false,
    ipfsHashNotificationProd: false,
    ipfsHashChatIDStage: '',
    ipfsHashChatIDProd: '',
    // ipfsHashChatID: '-1001375555544',
    secretScannerExclusion: 'Jenkinsfile-UCAN|.*env.json\$|.*env-stage.json\$',
    sonarSrcPath: 'src',
    sonarTestsPath: 'tests',
    dojoProductType: 'Dev'
)
pipeline.runPipeline()

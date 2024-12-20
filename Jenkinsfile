@Library('jenkins-library') _

def pipeline = new org.js.AppPipeline(steps: this,
    dockerImageName: 'adar/web',
    buildDockerImage: 'build-tools/node:20.18-alpine',
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
    ipfsHashNotificationStage: true,
    ipfsHashNotificationProd: false,
    ipfsHashChatIDStage: '-1002140545050',
    ipfsHashChatIDProd: '',
    noIndex: true,
    // ipfsHashChatID: '-1001375555544',
    secretScannerExclusion: 'Jenkinsfile-UCAN|.*env.json\$|.*env-stage.json\$',
    sonarSrcPath: 'src',
    sonarTestsPath: 'tests',
    dojoProductType: 'Dev',
    movingFiles: [ "*":"./", ".well-known/":"./"],
    k8sPrDeploy: true,
    vaultPrPath: "argocd-cc/src/charts/adar/web/environments/tachi/",
    vaultUser: "adar-rw",
    vaultCredId: "adarVaultCreds",
    valuesDestPath: "argocd-cc/src/charts/adar/web/",
    devValuesPath: "dev/dev/",
    initialSecretName: "adar-adar-web-eso-base",
    initialNameSpace: "adar-dev-web",
    targetNameSpace: "adar-${env.CHANGE_ID}-web",
    targetSecretName: "adar-${env.CHANGE_ID}-adar-pr-adar-web-eso-base"
)
pipeline.runPipeline()

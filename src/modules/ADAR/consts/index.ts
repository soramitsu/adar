import type { Stage } from '@/store/routeAssets/types';

export enum AdarPageNames {
  Send = 'Send',
  KYC = 'KYC',
  RouteAssets = 'RouteAssets',
  About = 'About',
  RoutingHistory = 'RoutingHistory',
}

export enum AdarComponents {
  RouteAssetsAuthorize = 'RouteAssets/Stages/Authorize',
  RouteAssetsDone = 'RouteAssets/Stages/Done',
  RouteAssetsProcessTemplate = 'RouteAssets/Stages/ProcessTemplate',
  RouteAssetsReviewDetails = 'RouteAssets/Stages/ReviewDetails',
  RouteAssetsRouting = 'RouteAssets/Stages/Routing',
  RouteAssetsTransactionOverview = 'RouteAssets/Stages/TransactionOverview',
  RouteAssetsUploadTemplate = 'RouteAssets/Stages/UploadTemplate',
  RouteAssetsNavigation = 'App/Header/RouteAssetsNavigation',
  BalanceWidget = 'App/Header/BalanceWidget',
  RouteAssetsFixIssuesDialog = 'RouteAssets/FixIssuesDialog',
  RouteAssetsSelectInputAssetDialog = 'RouteAssets/SelectInputAssetDialog',
  RouteAssetsSwapDialog = 'RouteAssets/SwapDialog',
  RouteAssetsFailedTransactionsDialog = 'RouteAssets/FailedTransactionsDialog',
  RouteAssetsConfirmFinishRoutingDialog = 'RouteAssets/ConfirmFinishingRoutingDialog',
  RouteAssetsSelectReportFormatDialog = 'RouteAssets/SelectReportFormatDialog',
}

export const Stages: Array<Stage> = [
  createStage('uploadTemplate', 'uploadTemplate'),
  createStage('processTemplate', 'processTemplate'),
  createStage('transactionOverview', 'transactionOverview'),
  createStage('reviewDetails', 'reviewDetails'),
  // createStage('authorize', 'authorize'),
  createStage('routing', 'routing'),
  createStage('done', 'done'),
];

export const Links = {
  terms: '/adar/terms/ADARUpdatedTerms.html',
  privacy: '/adar/terms/ADARPrivacyPolicy.html',
  about: 'https://adar.com/',
};

function createStage(title: string, componentName: string): Stage {
  return {
    title,
    component: componentName,
  };
}

export const inputTokenVariants = ['xor', 'val', 'pswap', 'xstusd'];

export const slippageMultiplier = '2'; // price impact - percent of total amount

export const adarFee = '0.25'; // adar fee - percent of total amount

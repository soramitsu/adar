import { FPNumber } from '@sora-substrate/sdk/build';
import { XOR } from '@sora-substrate/sdk/build/assets/consts';
import { defineMutations } from 'direct-vuex';

import { SwapTransferBatchStatus } from './types';

import type { RouteAssetsState, Recipient, TransactionInfo, RouteAssetsSubscription } from './types';
import type { PrimaryMarketsEnabledAssets } from '@sora-substrate/liquidity-proxy/build/types';
import type { HistoryItem } from '@sora-substrate/sdk';
import type { AccountBalance } from '@sora-substrate/sdk/build/assets/types';

const mutations = defineMutations<RouteAssetsState>()({
  setData(state, { file, recipients }: { file: File; recipients: Array<Recipient> }): void {
    state.file = file;
    state.recipients = recipients;
  },
  clearData(state) {
    state.file = null;
    state.recipients = [];
    state.processingState.currentStageIndex = 0;
    state.processingState.inputToken = XOR;
    state.processingState.txInfo = undefined;
    state.processingState.datetime = undefined;
    state.processingState.status = SwapTransferBatchStatus.INITIAL;
    state.processingState.pricesAreUpdated = true;
    state.processingState.txHistoryData = undefined;
    state.processingState.transferTokenBalances = {};
  },
  setSubscriptions(state, subscriptions: Array<RouteAssetsSubscription> = []): void {
    state.subscriptions = subscriptions;
  },
  addSubscription(state, subscription: RouteAssetsSubscription): void {
    state.subscriptions.push(subscription);
  },
  addSubscribeObjectToSubscription(state, { quoteSubscription, outputAssetId }) {
    const subscription = state.subscriptions.find((item) => item.assetAddress === outputAssetId);
    if (subscription) {
      subscription.quoteSubscription = quoteSubscription;
    }
  },
  addSwapQuoteToSubscription(state, { outputAssetId, swapQuote, isAvailable, liquiditySources }): void {
    const subscription = state.subscriptions.find((item) => item.assetAddress === outputAssetId);
    if (subscription) {
      subscription.swapQuote = swapQuote;
      subscription.liquiditySources = liquiditySources;
      subscription.isAvailable = isAvailable;
    }
  },
  setEnabledAssetsSubscription(state, subscription): void {
    state.enabledAssetsSubscription = subscription;
  },
  cleanEnabledAssetsSubscription(state) {
    state.enabledAssetsSubscription?.unsubscribe();
    state.enabledAssetsSubscription = null;
  },
  setRecipientStatus(state, { id, status }) {
    const recipient = state.recipients.find((recipient) => recipient.id === id);
    if (recipient) recipient.status = status;
  },
  setRecipientTxId(state, { id, txId }) {
    const recipient = state.recipients.find((recipient) => recipient.id === id);
    if (recipient) recipient.txId = txId;
  },
  setRecipientCompleted(state, id) {
    const recipient = state.recipients.find((recipient) => recipient.id === id);
    if (recipient) recipient.isCompleted = true;
  },
  setRecipientTokenAmount(state, { id, amount }) {
    const recipient = state.recipients.find((recipient) => recipient.id === id);
    if (recipient) {
      recipient.amount = amount;
    }
  },
  setRecipientExchangeRate(state, { id, rate }) {
    const recipient = state.recipients.find((recipient) => recipient.id === id);
    if (recipient) {
      recipient.exchangeRate = rate;
    }
  },
  setInputToken(state, asset) {
    state.processingState.inputToken = asset;
  },
  setInputTokenBalance(state, balance: Nullable<AccountBalance>): void {
    state.processingState.inputTokenBalance = balance;
  },
  setTransferTokenBalances(state, { balance, address }: { balance: Nullable<AccountBalance>; address: string }): void {
    if (balance) state.processingState.transferTokenBalances[address] = balance;
  },
  editRecipient(state, { id, name, wallet, usd, amount, asset }) {
    const recipient = state.recipients.find((recipient) => recipient.id === id);
    if (recipient) {
      recipient.name = name;
      recipient.wallet = wallet;
      recipient.usd = usd;
      recipient.amount = amount;
      recipient.asset = asset;
    }
  },
  deleteRecipient(state, id) {
    const idx = state.recipients.findIndex((item) => item.id === id);
    state.recipients.splice(idx, 1);
  },
  setCurrentStageIndex(state, index) {
    state.processingState.currentStageIndex = index;
  },
  progressCurrentStageIndex(state, delta) {
    const newIndex = state.processingState.currentStageIndex + delta;
    state.processingState.currentStageIndex = newIndex < 0 ? 0 : newIndex;
  },
  setTokensRouted(state, tokens) {
    state.processingState.tokensRouted = tokens.maps((token) => ({ token, amount: 0 }));
  },
  setTxInfo(state, txInfo: TransactionInfo) {
    state.processingState.txInfo = txInfo;
  },
  setTxDatetime(state, date: Date) {
    state.processingState.datetime = date;
  },
  setTxStatus(state, status: SwapTransferBatchStatus) {
    state.processingState.status = status;
  },
  setPrimaryMarketsEnabledAssets(state, assets: PrimaryMarketsEnabledAssets): void {
    state.enabledAssets = Object.freeze({ ...assets });
  },
  setSlippageTolerance(state, slippage: string): void {
    state.processingState.slippageTolerance = slippage;
  },
  updateMaxInputAmount(
    state,
    {
      amount,
      assetSymbol,
      totalLiquidityProviderFee,
    }: { amount: FPNumber; assetSymbol: string; totalLiquidityProviderFee: FPNumber }
  ): void {
    state.processingState.maxInputAmount = {
      amount,
      assetSymbol,
      updateDate: new Date(),
      totalLiquidityProviderFee,
    };
  },
  setPricesAreUpdated(state, value: boolean): void {
    state.processingState.pricesAreUpdated = value;
  },
  updateTxHistoryData(state, historyItem: HistoryItem): void {
    state.processingState.txHistoryData = historyItem;
  },
  toggleUseTransfer(state, id): void {
    const recipient = state.recipients.find((recipient) => recipient.id === id);
    if (!recipient) return;
    recipient.useTransfer = !recipient.useTransfer;
  },
});

export default mutations;

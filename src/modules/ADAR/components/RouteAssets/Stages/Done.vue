<template>
  <div class="route-assets-review-details">
    <div class="container routing-summary-section">
      <div class="route-assets__page-header-title">{{ t('adar.routeAssets.stages.done.title') }}</div>
      <div class="route-assets__page-header-description">
        {{ t('adar.routeAssets.stages.done.description') }}
      </div>
      <div class="fields-container">
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.inputAsset') }}</div>
          <div class="field__value">
            <div>{{ inputToken.symbol }}</div>
            <div>
              <token-logo class="token-logo" :token="inputToken" />
            </div>
          </div>
        </div>
        <s-divider />
        <div class="field" v-if="finalAmount">
          <div class="field__label">{{ t('adar.routeAssets.total') }}</div>
          <div class="field__value">
            {{ finalAmountFormatted }} <span class="usd">{{ totalUSD }}</span>
          </div>
        </div>
        <div v-else>
          <spinner />
        </div>
        <s-divider />
        <div class="field" v-if="incompletedRecipientsLength > 0">
          <div class="field__label">{{ t('adar.routeAssets.stages.done.failedTransactions') }}</div>
          <warning-message class="warning-message" :text="t('adar.routeAssets.stages.done.rerun')" :isError="true" />
          <div class="field__value">
            {{ incompletedRecipientsLength }}
          </div>
        </div>
      </div>
      <div class="buttons-container">
        <s-button
          type="primary"
          class="s-typography-button--medium"
          @click.stop="showFailedTransactionsDialog = true"
          v-if="withErrors"
        >
          {{ t('adar.routeAssets.stages.done.rerun') }}
        </s-button>
        <s-button
          v-if="!withErrors"
          type="secondary"
          class="s-typography-button--big"
          @click.stop="onReportDownloadClick()"
          :disabled="!finalAmount"
        >
          {{ t('adar.routeAssets.stages.done.pdfButton') }}
        </s-button>
        <s-button
          type="link"
          class="s-typography-button--big open-finish-routing-button"
          @click.stop="openFinishRoutingDialog"
          v-if="withErrors"
        >
          <span>{{ t('adar.routeAssets.stages.done.finishAnyway') }}</span>
        </s-button>
        <s-button v-else type="primary" class="s-typography-button--big" @click.stop="onFinishRouting">
          {{ t('adar.routeAssets.stages.done.finish') }}
        </s-button>
      </div>
    </div>
    <div v-if="summaryData.length > 0" class="container routing-details-section">
      <div class="route-assets__page-header-title">{{ t('adar.routeAssets.stages.done.routingDetails.title') }}</div>
      <div v-for="(assetData, idx) in summaryData" :key="idx" class="asset-data-container fields-container">
        <div class="asset-title">
          <div>
            <token-logo class="token-logo" :token="assetData.asset" />
          </div>
          <div>{{ assetData.asset.symbol }}</div>
        </div>
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.recipients') }}</div>
          <div class="field__value">{{ assetData.recipientsNumber }}</div>
        </div>
        <s-divider />
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.stages.done.routingDetails.amount') }}</div>
          <div class="field__value">{{ formatNumber(assetData.total) }}</div>
          <div class="field__value usd">{{ formatNumber(assetData.usd, 2) }}</div>
        </div>
        <s-divider />
        <div class="field">
          <div class="field__label">{{ t('adar.routeAssets.txStatus.status') }}</div>
          <div class="field__value" :class="`field__value_${assetData.status}`">{{ assetData.status }}</div>
        </div>
      </div>
    </div>
    <failed-transactions-dialog :visible.sync="showFailedTransactionsDialog"></failed-transactions-dialog>
    <confirm-finish-routing-dialog
      :visible.sync="showFinishRoutingDialog"
      @onConfirmClick="onFinishRouting"
    ></confirm-finish-routing-dialog>
    <select-report-format-dialog
      :visible.sync="showSelectReportFormatDialog"
      @onConfirmClick="onFinishRouting"
      @onPDFSelect="downloadPDF"
      @onCSVSelect="downloadCSV"
    ></select-report-format-dialog>
  </div>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/util/build';
import { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';
import { components, api } from '@soramitsu/soraneo-wallet-web';
import { jsPDF as JsPDF } from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { groupBy, sumBy } from 'lodash';
import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import Spinner from '@/modules/ADAR/components/App/shared/InlineSpinner.vue';
import { AdarComponents } from '@/modules/ADAR/consts';
import { adarLazyComponent } from '@/modules/ADAR/router';
import { action, getter, state } from '@/store/decorators';
import {
  MaxInputAmountInfo,
  Recipient,
  RecipientStatus,
  SummaryAssetRecipientsInfo,
  SwapTransferBatchStatus,
  TransactionInfo,
} from '@/store/routeAssets/types';

import WarningMessage from '../WarningMessage.vue';

import type { HistoryItem } from '@sora-substrate/util';

@Component({
  components: {
    TokenLogo: components.TokenLogo,
    WarningMessage,
    FailedTransactionsDialog: adarLazyComponent(AdarComponents.RouteAssetsFailedTransactionsDialog),
    ConfirmFinishRoutingDialog: adarLazyComponent(AdarComponents.RouteAssetsConfirmFinishRoutingDialog),
    SelectReportFormatDialog: adarLazyComponent(AdarComponents.RouteAssetsSelectReportFormatDialog),
    Spinner,
  },
})
export default class RoutingCompleted extends Mixins(TranslationMixin) {
  @getter.routeAssets.inputToken inputToken!: Asset;
  @getter.routeAssets.completedRecipients private completedRecipients!: Array<Recipient>;
  @getter.routeAssets.incompletedRecipients private incompletedRecipients!: Array<Recipient>;
  @getter.routeAssets.recipients private recipients!: Array<Recipient>;
  @getter.routeAssets.batchTxInfo private batchTxInfo!: TransactionInfo;
  @getter.routeAssets.batchTxDatetime private batchTxDatetime!: Nullable<Date>;
  @state.wallet.account.fiatPriceObject private fiatPriceObject!: any;
  @state.wallet.account.accountAssets private accountAssets!: Array<AccountAsset>;
  @action.routeAssets.cancelProcessing private cancelProcessing!: () => void;
  @getter.routeAssets.overallUSDNumber overallUSDNumber!: string;
  @getter.routeAssets.maxInputAmount maxInputAmount!: MaxInputAmountInfo;
  @getter.routeAssets.txHistoryData txHistoryData!: HistoryItem;
  @getter.routeAssets.batchTxStatus batchTxStatus!: SwapTransferBatchStatus;
  @getter.routeAssets.recipientsGroupedByToken recipientsGroupedByToken!: (
    asset?: Asset | AccountAsset
  ) => SummaryAssetRecipientsInfo[];

  showFailedTransactionsDialog = false;
  showFinishRoutingDialog = false;
  showSelectReportFormatDialog = false;

  get finalAmount() {
    if (this.batchTxStatus === SwapTransferBatchStatus.FAILED) return '0';
    return this.txHistoryData?.amount;
  }

  get txHistoryDataReceivers() {
    return this.txHistoryData?.payload?.receivers || [];
  }

  get finalAmountFormatted() {
    return new FPNumber(this.finalAmount || 0).dp(4).toLocaleString();
  }

  get incompletedRecipientsLength() {
    return this.incompletedRecipients.length;
  }

  get totalAmount() {
    return this.maxInputAmount.totalAmountWithFee.dp(4);
  }

  get totalUSD() {
    if (this.batchTxStatus === SwapTransferBatchStatus.FAILED) return '0';
    return this.overallUSDNumber;
  }

  get withErrors() {
    return this.incompletedRecipientsLength > 0;
  }

  get summaryData() {
    return Object.values(
      groupBy(
        this.completedRecipients.map((item) => ({ symbol: item.asset.symbol, ...item })),
        'symbol'
      )
    ).map((assetArray: Array<Recipient>) => {
      return {
        recipientsNumber: assetArray.length,
        asset: assetArray[0].asset,
        usd: sumBy(assetArray, (item: Recipient) => Number(item.usd)),
        total: sumBy(assetArray, (item: Recipient) => Number(item.amount)),
        required:
          sumBy(assetArray, (item: Recipient) => Number(item.usd)) / Number(this.getAssetUSDPrice(this.inputToken)),
        totalTransactions: assetArray.length,
        status: this.getStatus(assetArray),
      };
    });
  }

  getStatus(assetArray) {
    if (assetArray.some((recipient) => recipient.status === RecipientStatus.FAILED))
      return this.t('adar.routeAssets.txStatus.failed');
    return assetArray.find((recipient) => recipient.status === RecipientStatus.PENDING)
      ? this.t('adar.routeAssets.txStatus.waiting')
      : this.t('adar.routeAssets.txStatus.success');
  }

  getAssetUSDPrice(asset: Asset) {
    return FPNumber.fromCodecValue(this.fiatPriceObject[asset.address] ?? 0, 18);
  }

  getRecipientTransferAmount(address: string, assetAddress: string): FPNumber {
    const formattedAddress = address.startsWith('cn') ? address : api.formatAddress(address);
    return new FPNumber(
      this.txHistoryDataReceivers.find(
        (item) => item.accountId === formattedAddress && item.asset.address === assetAddress
      )?.amount ?? '0'
    );
  }

  formatNumber(num: number, dp = 4) {
    return new FPNumber(num).toLocaleString(dp);
  }

  openFinishRoutingDialog() {
    this.showFinishRoutingDialog = true;
  }

  onFinishRouting() {
    this.cancelProcessing();
    this.showFinishRoutingDialog = false;
  }

  onReportDownloadClick() {
    this.showSelectReportFormatDialog = true;
  }

  headers = [
    '№',
    this.t('adar.routeAssets.name'),
    this.t('adar.routeAssets.wallet'),
    this.t('adar.routeAssets.usd'),
    this.t('adar.routeAssets.inputAsset'),
    this.t('adar.routeAssets.asset'),
    this.t('adar.routeAssets.stages.transactionOverview.amount'),
    this.t('adar.routeAssets.stages.done.report.exchangeRate'),
    // this.t('adar.routeAssets.status'),
  ];

  getReportData(isCsv = false) {
    return this.recipients.map((recipient, idx) => {
      const usd = recipient.usd.dp(2);
      const amount = this.getRecipientTransferAmount(recipient.wallet, recipient.asset.address);
      const rate = recipient.exchangeRate ?? FPNumber.ZERO;
      return [
        `${idx + 1}`,
        recipient.name,
        recipient.wallet,
        isCsv ? usd.toFixed(2) : usd.toLocaleString(),
        recipient.useTransfer ? recipient.asset.symbol : this.inputToken.symbol,
        recipient.asset.symbol,
        isCsv ? amount.toFixed(7) : amount.toLocaleString(),
        isCsv ? rate.toFixed(7) : rate.toLocaleString(),
        // recipient.status.toString(),
      ];
    });
  }

  downloadCSV(fileName: string) {
    const { txId, blockId, from, blockNumber } = this.batchTxInfo;
    const datetime = this.batchTxDatetime;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      // `Transaction Id - ${txId}\n` +
      // `Block Hash - ${blockId}\n` +
      // `Sender wallet - ${from}\n` +
      `${this.t('adar.routeAssets.stages.done.report.datetime')} - ${datetime?.toUTCString()}\n` +
      `${this.t('adar.routeAssets.stages.done.report.timestampUTC')} - ${datetime?.getTime()}\n` +
      this.headers.join(',') +
      `,${this.t('adar.routeAssets.stages.done.report.transactionId')},${this.t(
        'adar.routeAssets.stages.done.report.blockNumber'
      )},${this.t('adar.routeAssets.stages.done.report.senderWallet')}` +
      '\n' +
      this.getReportData(true)
        .map((e) => `${e.join(',')},${txId},${blockNumber},${from}`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link); // Required for FF

    link.click();
  }

  downloadPDF(fileName: string) {
    const doc = new JsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' });
    const { txId, blockId, from, blockNumber } = this.batchTxInfo;
    const datetime = this.batchTxDatetime;
    doc.setFontSize(12);
    doc.text(`${this.t('adar.routeAssets.stages.done.report.transactionId')} - ${txId}`, 5, 5);
    doc.text(`${this.t('adar.routeAssets.stages.done.report.blockNumber')} - ${blockNumber}`, 5, 10);
    doc.text(`${this.t('adar.routeAssets.stages.done.report.blockId')} - ${blockId}`, 5, 15);
    doc.text(`${this.t('adar.routeAssets.stages.done.report.senderWallet')} - ${from}`, 5, 20);
    doc.text(`${this.t('adar.routeAssets.stages.done.report.datetime')} - ${datetime?.toUTCString()}`, 5, 25);
    doc.text(`${this.t('adar.routeAssets.stages.done.report.timestampUTC')} - ${datetime?.getTime()}`, 5, 30);
    autoTable(doc, {
      head: [this.headers],
      body: this.getReportData() as RowInput[],
      startY: 35,
      rowPageBreak: 'avoid',
      margin: { top: 5, left: 5, right: 5, bottom: 5 },
      styles: {
        lineColor: [237, 228, 231],
        lineWidth: 0.3,
        fontSize: 10,
      },
      headStyles: {
        textColor: [161, 154, 157],
        fillColor: [253, 247, 251],
      },
      bodyStyles: {
        fillColor: [253, 247, 251],
        textColor: [38, 38, 45],
        cellPadding: { top: 10, right: 5, bottom: 10, left: 5 },
      },
      alternateRowStyles: {
        fillColor: [255, 250, 251],
      },
      columnStyles: {
        0: {
          cellWidth: 10,
          cellPadding: { top: 10, right: 2, bottom: 10, left: 2 },
        },
        1: {
          minCellWidth: 30,
        },
        3: {
          minCellWidth: 25,
        },
        4: {
          cellWidth: 25,
        },
        5: {
          cellWidth: 25,
        },
        6: {
          minCellWidth: 45,
        },
        7: {
          minCellWidth: 25,
        },
        8: {
          fontStyle: 'bold',
          cellWidth: 25,
        },
      },
      didParseCell: function (data) {
        if (data.row.section === 'body') {
          if (data.cell.text.includes(RecipientStatus.FAILED)) {
            data.cell.styles.textColor = [231, 76, 60];
          }
          if (data.cell.text.includes(RecipientStatus.SUCCESS)) {
            data.cell.styles.textColor = [52, 173, 135];
          }
        }
      },
      // includeHiddenHtml: true
    });
    doc.save(`${fileName}.pdf`);
  }
}
</script>

<style lang="scss">
.route-assets-review-details {
  text-align: center;
  font-weight: 300;
  font-feature-settings: 'case' on;
  margin: 0 auto;

  &__button {
    width: 100%;
    padding: inherit 30px;
  }

  .token-logo {
    > span {
      width: 16px;
      height: 16px;
    }
  }

  .routing-summary-section {
    & > * {
      margin-bottom: $inner-spacing-medium;
    }
  }

  .routing-details-section {
    text-align: left;

    & > * {
      margin-bottom: $inner-spacing-medium;
    }

    .asset-title {
      @include flex-start;
      gap: 8px;
      font-weight: 700;
      font-size: 24px;
      line-height: 20px;
      margin-bottom: $inner-spacing-medium;

      .token-logo {
        > span {
          width: 36px;
          height: 36px;
        }
      }
    }

    .asset-data-container {
      box-shadow: var(--s-shadow-element);
      border-radius: 30px;
      background: var(--s-color-utility-body);
      padding: 16px;
    }
  }
}
</style>

<style scoped lang="scss">
.usd {
  color: var(--s-color-fiat-value);
  &::before {
    content: '$';
    display: inline;
  }
}

.buttons-container {
  button {
    display: block;
    width: 100%;
    margin: 16px 0 0 0;

    span {
      span {
        white-space: wrap;
      }
    }
  }
}

.open-finish-routing-button {
  font-weight: 400;
  font-size: 14px;
  text-decoration: underline;
  color: var(--s-color-base-content-secondary);
  text-transform: none;
}
</style>

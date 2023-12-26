<template>
  <div v-loading="parentLoading" class="routing-history">
    <div class="container">
      <div class="routing-history__title-icon">
        <div>
          <svg width="26" height="29" viewBox="0 0 26 29" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M16.9484 0.653093C16.5608 0.41069 16.1666 0.247417 15.7211 0.144744C15.2757 0.0420717 14.8737 0 13.7118 0H5.76874C3.76282 0 3.03543 0.208858 2.3021 0.601049C1.56876 0.99324 0.99324 1.56876 0.601049 2.3021C0.208858 3.03543 0 3.76282 0 5.76874V22.7313C0 24.7372 0.208858 25.4646 0.601049 26.1979C0.99324 26.9312 1.56876 27.5068 2.3021 27.899C3.03543 28.2911 3.76282 28.5 5.76874 28.5H19.7313C21.7372 28.5 22.4646 28.2911 23.1979 27.899C23.9312 27.5068 24.5068 26.9312 24.899 26.1979C25.2911 25.4646 25.5 24.7372 25.5 22.7313V11.7882C25.5 10.6263 25.4579 10.2243 25.3553 9.77887C25.2526 9.33339 25.0893 8.93921 24.8469 8.55161C24.6045 8.164 24.35 7.85004 23.5284 7.02843L18.4716 1.97157C17.65 1.14996 17.336 0.895495 16.9484 0.653093ZM14.8519 3.16426C14.5363 2.85148 14 3.07505 14 3.51941V9.5C14 9.77615 14.2239 10 14.5 10H20.5351C20.9817 10 21.2042 9.45917 20.8871 9.14485L14.8519 3.16426Z"
            />
          </svg>
        </div>
      </div>
      <div class="routing-history__page-header-title">{{ t('adar.routingHistory.title') }}</div>
      <div class="routing-history__page-header-description">
        {{ t('adar.routingHistory.description') }}
      </div>
      <div class="routing-history__period period">
        <div class="routing-history__page-header-description">
          <div class="period__label">{{ t('adar.routingHistory.periodLabel') }}</div>
          <s-dropdown type="button" :button-type="'link'" placement="bottom-start" @select="handleSelectPeriodMenu">
            {{ selectedPeriod.title }}
            <template #menu>
              <s-dropdown-item v-for="(periodItem, idx) in dropdownPeriodMenuItems" :key="idx" :value="periodItem">
                {{ periodItem.title }}
              </s-dropdown-item>
            </template>
          </s-dropdown>
        </div>
        <s-button
          type="primary"
          class="s-typography-button--medium restart-button"
          @click.stop="onDownloadClick"
          :disabled="!adarTxs.length"
        >
          {{ t('adar.routingHistory.downloadButtonTitle') }}
        </s-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/util/build';
import { mixins } from '@soramitsu/soraneo-wallet-web';
import { startOfWeek, startOfMonth, subWeeks, subMonths, startOfYear, subYears, isAfter } from 'date-fns';
import { jsPDF as JsPDF } from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import { fetchData } from '@/modules/ADAR/indexer/queries/adarStats';
import { state } from '@/store/decorators';

import type { HistoryItem } from '@sora-substrate/util';

@Component({
  components: {},
})
export default class RoutingHistory extends Mixins(mixins.LoadingMixin, TranslationMixin) {
  @state.wallet.account.address private address!: string;

  selectedPeriod = {
    title: '',
    date: new Date(),
  };

  dropdownPeriodMenuItems = [
    {
      title: this.t('adar.routingHistory.dropdownItems.thisWeek'),
      action: () => this.getStartDate(0),
    },
    {
      title: this.t('adar.routingHistory.dropdownItems.lastWeek'),
      action: () => this.getStartDate(1),
    },
    {
      title: this.t('adar.routingHistory.dropdownItems.thisMonth'),
      action: () => this.getStartDate(undefined, 0),
    },
    {
      title: this.t('adar.routingHistory.dropdownItems.3Months'),
      action: () => this.getStartDate(undefined, 2),
    },
    {
      title: this.t('adar.routingHistory.dropdownItems.6Months'),
      action: () => this.getStartDate(undefined, 5),
    },
    {
      title: this.t('adar.routingHistory.dropdownItems.year'),
      action: () => this.getStartDate(undefined, 0),
    },
  ];

  getStartDate(deltaWeeks?: number, deltaMonths?: number, deltaYears?: number) {
    let date = new Date();
    if (deltaWeeks !== undefined) {
      date = startOfWeek(subWeeks(date, deltaWeeks));
    }
    if (deltaMonths !== undefined) {
      date = startOfMonth(subMonths(date, deltaMonths));
    }
    if (deltaYears !== undefined) {
      date = startOfYear(subYears(date, deltaYears));
    }
    return date;
  }

  handleSelectPeriodMenu({ title, action }) {
    this.selectedPeriod.title = title;
    this.selectedPeriod.date = action();
  }

  adarTxs: Array<HistoryItem> = [];

  created() {
    this.withApi(async () => {
      this.handleSelectPeriodMenu(this.dropdownPeriodMenuItems[0]);
      if (this.address) this.adarTxs = await fetchData(this.address);
    });
  }

  readonly datetime = this.formatDate(new Date().getTime(), 'D-MMM-YYYY--HH-mm-ss');

  onDownloadClick() {
    this.downloadCSV(`ADAR--routings--${this.selectedPeriod.title.split(' ').join('')}--${this.datetime}`);
  }

  headers = [
    '№',
    // this.t('adar.routeAssets.name'),
    this.t('adar.routeAssets.wallet'),
    // this.t('adar.routeAssets.usd'),
    this.t('adar.routeAssets.inputAsset'),
    this.t('adar.routeAssets.asset'),
    this.t('adar.routeAssets.stages.transactionOverview.amount'),
    // this.t('adar.routeAssets.stages.done.report.exchangeRate'),
    // this.t('adar.routeAssets.status'),
  ];

  getReportData(isCsv = false) {
    return this.userTxs.map((tx) => {
      const info = {
        txId: tx.txId,
        datetime: new Date((tx as any).endTime),
        blockId: tx.blockId,
        blockNumber: tx.blockHeight,
        from: this.address,
      };
      const outputTxs = tx?.payload?.receivers.map((recipient, idx) => {
        const fpAmount = new FPNumber(recipient.amount);
        return [
          `${idx + 1}`,
          //   recipient.name,
          recipient.accountId,
          // isCsv ? usd.toFixed(2) : usd.toLocaleString(),
          tx.symbol,
          recipient.asset.symbol,
          isCsv ? fpAmount.toFixed(7) : fpAmount.toLocaleString(),
          //   isCsv ? rate.toFixed(7) : rate.toLocaleString(),
          // recipient.status.toString(),
        ];
      });
      return { info, outputTxs };
    });
  }

  downloadCSV(fileName: string) {
    let csvContent = 'data:text/csv;charset=utf-8,';
    this.getReportData(true)
      .filter((item) => isAfter(item.info.datetime, this.selectedPeriod.date))
      .forEach((tx) => {
        const { txId, from, blockNumber, datetime } = tx.info;
        const txContent =
          `${this.t('adar.routeAssets.stages.done.report.datetime')} - ${datetime?.toUTCString()}\n` +
          this.headers.join(',') +
          `,${this.t('adar.routeAssets.stages.done.report.transactionId')},${this.t(
            'adar.routeAssets.stages.done.report.blockNumber'
          )},${this.t('adar.routeAssets.stages.done.report.senderWallet')}` +
          '\n' +
          tx.outputTxs.map((e) => `${e.join(',')},${txId},${blockNumber},${from}`).join('\n') +
          '\n\n';
        csvContent = csvContent + txContent;
      });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link); // Required for FF

    link.click();
  }

  downloadPDF(fileName: string) {
    const doc = new JsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' });
    this.getReportData()
      .filter((item) => isAfter(item.info.datetime, this.selectedPeriod.date))
      .forEach((tx) => {
        const { txId, blockId, from, blockNumber, datetime } = tx.info;
        doc.setFontSize(12);
        doc.text(`${this.t('adar.routeAssets.stages.done.report.transactionId')} - ${txId}`, 5, 5);
        doc.text(`${this.t('adar.routeAssets.stages.done.report.blockNumber')} - ${blockNumber}`, 5, 10);
        doc.text(`${this.t('adar.routeAssets.stages.done.report.blockId')} - ${blockId}`, 5, 15);
        doc.text(`${this.t('adar.routeAssets.stages.done.report.senderWallet')} - ${from}`, 5, 20);
        doc.text(`${this.t('adar.routeAssets.stages.done.report.datetime')} - ${datetime?.toUTCString()}`, 5, 25);
        autoTable(doc, {
          head: [this.headers],
          body: tx.outputTxs as RowInput[],
          startY: 30,
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
        });
        doc.addPage();
      });

    doc.save(`${fileName}.pdf`);
  }

  get userTxs() {
    return this.adarTxs.filter((item) => !item.errorMessage);
  }
}
</script>

<style lang="scss">
.routing-history {
  max-width: 988px;
  margin-left: auto;
  margin-right: auto;
  .container {
    margin: 0 auto $inner-spacing-medium;
    max-width: 464px;
  }

  &__page-header-title {
    font-weight: 600;
    font-size: 28px;
    line-height: var(--s-line-height-small);
    text-align: center;
    letter-spacing: -0.02em;
    font-feature-settings: 'case' on;
    color: var(--s-color-base-content-primary);
  }

  &__page-header-description {
    text-align: center;
    font-weight: 300;
    font-size: var(--s-font-size-small);
    line-height: var(--s-line-height-medium);
    margin-top: 20px;
    margin-bottom: 20px;
  }

  &__title-icon {
    margin: 20px auto;
    width: 64px;
    height: 64px;
    border-radius: 100%;
    position: relative;
    background-color: var(--s-color-theme-accent);
    box-shadow: 1px 1px 10px 0px rgba(255, 255, 255, 1) inset;
    & > div {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      fill: var(--s-color-base-background);
    }
  }

  &__period {
    box-shadow: var(--s-shadow-element);
    border-radius: 30px;
    background: var(--s-color-base-background);
    padding: 4px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .period__label {
      text-align: left;
      text-transform: uppercase;
      color: var(--s-color-brand-day);
      font-weight: 600;
    }
  }
}
</style>

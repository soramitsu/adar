"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[2989],{42989:function(t,e,a){a.r(e),a.d(e,{default:function(){return v}});var i=a(23166),o=a(97582),s=a(86424),n=a(89445),r=a(2586),c=a(21329),d=a(68282),l=a(69781),m=a(49053),h=a(50961),u=a(47489);const y="history";let g=class extends((0,n.Wr)(s.tA.PaginationSearchMixin,r.Z)){constructor(...t){super(...t),(0,i.Z)(this,"FontSizeRate",s.WALLET_CONSTS.FontSizeRate),(0,i.Z)(this,"transactions",void 0),(0,i.Z)(this,"currencies",void 0),(0,i.Z)(this,"isValidNetwork",void 0),(0,i.Z)(this,"libraryTheme",void 0),(0,i.Z)(this,"getTransactions",void 0),(0,i.Z)(this,"getCurrencies",void 0),(0,i.Z)(this,"pageAmount",5),(0,i.Z)(this,"currentView",y),(0,i.Z)(this,"selectedItem",{})}created(){this.withApi((async()=>{this.initMoonpayApi(),await this.prepareEvmNetwork(),await Promise.all([this.getTransactions(),this.getCurrencies()])}))}get currenciesById(){return this.currencies.reduce(((t,e)=>({...t,[e.id]:e})),{})}get emptyHistory(){return!this.transactions.length}get total(){return this.transactions.length}get historyItems(){return this.getPageItems(this.transactions)}get formattedItems(){const{currenciesById:t,historyItems:e,formatDate:a}=this,i=e=>(t[e]?.code??"").toUpperCase(),o=t=>Number.isFinite(t)?String(t):t;return e.map((t=>{return{...t,formatted:{fiat:i(t.baseCurrencyId),fiatAmount:o(t.baseCurrencyAmount),crypto:i(t.currencyId),cryptoAmount:o(t.quoteCurrencyAmount),date:a(new Date(t.updatedAt).getTime()),icon:(e=t.status,e===u.D.Completed?"basic-check-mark-24":e===u.D.Failed?"basic-clear-X-24":"basic-more-horizontal-24")}};var e}))}get detailsWidgetUrl(){if(!this.selectedItem.id)return"";const t=(0,h.UK)({colorCode:(0,h.y_)("--s-color-theme-accent"),language:this.language,transactionId:this.selectedItem.id});return`${this.selectedItem.returnUrl}?${t}`}get bridgeTxToSora(){if(this.selectedItem.id)return this.getBridgeHistoryItemByMoonpayId(this.selectedItem.id)}get isCompletedTransaction(){return this.selectedItem?.status===u.D.Completed}get externalAccountIsMoonpayRecipient(){return this.selectedItem?.walletAddress?.toLowerCase?.()===this.evmAddress.toLowerCase()}get actionButtonType(){return this.bridgeTxToSora?"secondary":"primary"}get actionButtonDisabled(){return!this.externalAccountIsMoonpayRecipient}get actionButtonText(){return this.evmAddress?this.bridgeTxToSora?this.t("moonpay.buttons.view"):this.externalAccountIsMoonpayRecipient?this.isValidNetwork?this.t("moonpay.buttons.transfer"):this.t("changeNetworkText"):this.t("changeAccountText"):this.t("connectWalletText")}get isHistoryView(){return this.currentView===y}changeView(t){this.currentView=t}async handlePaginationClick(t){let e=1;switch(t){case s.WALLET_CONSTS.PaginationButton.Prev:e=this.currentPage-1;break;case s.WALLET_CONSTS.PaginationButton.Next:e=this.currentPage+1;break;case s.WALLET_CONSTS.PaginationButton.Last:e=this.lastPage}this.currentPage=e}handleBack(){this.loading=!1,this.changeView(y)}async navigateToDetails(t){try{this.selectedItem=t,this.changeView("details")}catch(t){console.error(t)}}async handleTransaction(){this.selectedItem.id&&(this.isValidNetwork?this.bridgeTxToSora?.id?(await this.prepareEvmNetwork(),await this.showHistory(this.bridgeTxToSora.id)):await this.prepareMoonpayTxForBridgeTransfer(this.selectedItem):this.changeEvmNetworkProvided())}};(0,o.gn)([m.SB.moonpay.transactions],g.prototype,"transactions",void 0),(0,o.gn)([m.SB.moonpay.currencies],g.prototype,"currencies",void 0),(0,o.gn)([m.Yn.web3.isValidNetwork],g.prototype,"isValidNetwork",void 0),(0,o.gn)([m.Yn.libraryTheme],g.prototype,"libraryTheme",void 0),(0,o.gn)([m.aD.moonpay.getTransactions],g.prototype,"getTransactions",void 0),(0,o.gn)([m.aD.moonpay.getCurrencies],g.prototype,"getCurrencies",void 0),g=(0,o.gn)([(0,n.wA)({components:{MoonpayLogo:c.default,FormattedAmount:s.wx.FormattedAmount,GenericPageHeader:(0,l.kF)(d.z8.GenericPageHeader),IFrameWidget:(0,l.kF)(d.z8.IFrameWidget),HistoryPagination:s.wx.HistoryPagination}})],g);var p=g,v=(0,a(1001).Z)(p,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("div",{staticClass:"moonpay-history"},[e("moonpay-logo",{attrs:{theme:t.libraryTheme}}),t.isHistoryView?[e("div",{staticClass:"moonpay-history-title"},[t._v(t._s(t.t("moonpay.history.title")))]),e("div",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],class:["moonpay-history-list",{empty:t.emptyHistory}]},[t._l(t.formattedItems,(function(a){return e("div",{directives:[{name:"button",rawName:"v-button"}],key:a.id,staticClass:"moonpay-history-item",attrs:{tabindex:"0"},on:{click:function(e){return t.navigateToDetails(a)}}},[e("div",{staticClass:"moonpay-history-item-data"},[e("div",{staticClass:"moonpay-history-item__date"},[t._v(t._s(a.formatted.date))]),e("div",{staticClass:"moonpay-history-item__amount"},[a.formatted.cryptoAmount?[e("formatted-amount",{staticClass:"moonpay-history-item-amount",attrs:{"value-can-be-hidden":"",value:a.formatted.cryptoAmount,"font-size-rate":t.FontSizeRate.MEDIUM,"asset-symbol":a.formatted.crypto}}),e("i",{staticClass:"network-icon network-icon--ethereum"}),t._v("  "),e("span",[t._v(t._s(t.t("forText")))]),t._v("   ")]:t._e(),e("formatted-amount",{staticClass:"moonpay-history-item-amount",attrs:{"value-can-be-hidden":"",value:a.formatted.fiatAmount,"font-size-rate":t.FontSizeRate.MEDIUM,"asset-symbol":a.formatted.fiat}})],2),e("div",{staticClass:"moonpay-history-item__wallet-address"},[t._v(" "+t._s(a.walletAddress)+" ")])]),e("s-icon",{class:["moonpay-history-item-icon",a.status],attrs:{name:a.formatted.icon,size:"14"}})],1)})),t.emptyHistory?e("span",[t._v(t._s(t.t("moonpay.history.empty")))]):t._e()],2),t.emptyHistory?t._e():e("history-pagination",{staticClass:"moonpay-history-pagination",attrs:{"current-page":t.currentPage,"page-amount":t.pageAmount,total:t.total,loading:t.loading,"last-page":t.lastPage},on:{"pagination-click":t.handlePaginationClick}})]:[e("i-frame-widget",{attrs:{src:t.detailsWidgetUrl}}),t.isCompletedTransaction?e("s-button",{staticClass:"moonpay-details-button s-typography-button--big",attrs:{type:t.actionButtonType,disabled:t.actionButtonDisabled,loading:t.loading},on:{click:t.handleTransaction}},[t._v(" "+t._s(t.actionButtonText)+" ")]):t._e()]],2)}),[],!1,null,"38a298b6",null).exports}}]);
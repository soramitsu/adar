"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[6621],{26621:function(i,t,o){o.r(t),o.d(t,{default:function(){return m}});var a=o(23166),e=o(97582),n=o(86424),s=o(89445),l=o(81462),r=o(21329),g=o(68282),p=o(69781),d=o(49053),c=o(50961),h=o(2586);let y=class extends((0,s.Wr)(h.Z)){constructor(...i){super(...i),(0,a.Z)(this,"widgetUrl",""),(0,a.Z)(this,"transactionsPolling",void 0),(0,a.Z)(this,"account",void 0),(0,a.Z)(this,"libraryTheme",void 0),(0,a.Z)(this,"transactions",void 0),(0,a.Z)(this,"pollingTimestamp",void 0),(0,a.Z)(this,"dialogVisibility",void 0),(0,a.Z)(this,"setDialogVisibility",void 0),(0,a.Z)(this,"createTransactionsPolling",void 0)}handleLoggedInStateChange(i){i||this.stopPollingMoonpay()}handleVisibleStateChange(i){i&&!this.pollingTimestamp&&this.startPollingMoonpay()}handleLanguageChange(){this.pollingTimestamp||this.updateWidgetUrl()}async handleLastTransaction(i,t){!i||t&&t.id===i.id||await this.prepareBridgeForTransfer(i)}get lastCompletedTransaction(){if(0!==this.pollingTimestamp)return this.transactions.find((i=>Date.parse(i.createdAt)>=this.pollingTimestamp&&"completed"===i.status))}get visibility(){return this.dialogVisibility}set visibility(i){this.setDialogVisibility(i)}async created(){this.withApi((()=>{this.initMoonpayApi(),this.updateWidgetUrl()}))}beforeDestroy(){this.stopPollingMoonpay()}createMoonpayWidgetUrl(){return this.moonpayApi.createWidgetUrl({colorCode:(0,c.y_)("--s-color-theme-accent"),externalTransactionId:this.account.address,language:this.language})}updateWidgetUrl(){this.widgetUrl="";const i=this.createMoonpayWidgetUrl();setTimeout((()=>{this.widgetUrl=i}))}async startPollingMoonpay(){console.info("Moonpay: start polling to get user transactions"),this.transactionsPolling=await this.createTransactionsPolling()}stopPollingMoonpay(){console.info("Moonpay: stop polling"),"function"==typeof this.transactionsPolling&&this.transactionsPolling()}async prepareBridgeForTransfer(i){this.setDialogVisibility(!1),this.stopPollingMoonpay(),this.updateWidgetUrl(),await this.showNotification(l.u.Success),await this.prepareMoonpayTxForBridgeTransfer(i,!0)}};(0,e.gn)([d.Yn.wallet.account.account],y.prototype,"account",void 0),(0,e.gn)([d.Yn.libraryTheme],y.prototype,"libraryTheme",void 0),(0,e.gn)([d.SB.moonpay.transactions],y.prototype,"transactions",void 0),(0,e.gn)([d.SB.moonpay.pollingTimestamp],y.prototype,"pollingTimestamp",void 0),(0,e.gn)([d.SB.moonpay.dialogVisibility],y.prototype,"dialogVisibility",void 0),(0,e.gn)([d.QF.moonpay.setDialogVisibility],y.prototype,"setDialogVisibility",void 0),(0,e.gn)([d.aD.moonpay.createTransactionsPolling],y.prototype,"createTransactionsPolling",void 0),(0,e.gn)([(0,s.RL)("isLoggedIn",{immediate:!0})],y.prototype,"handleLoggedInStateChange",null),(0,e.gn)([(0,s.RL)("visibility",{immediate:!0})],y.prototype,"handleVisibleStateChange",null),(0,e.gn)([(0,s.RL)("language"),(0,s.RL)("libraryTheme")],y.prototype,"handleLanguageChange",null),(0,e.gn)([(0,s.RL)("lastCompletedTransaction")],y.prototype,"handleLastTransaction",null),y=(0,e.gn)([(0,s.wA)({components:{DialogBase:n.wx.DialogBase,MoonpayLogo:r.default,IFrameWidget:(0,p.kF)(g.z8.IFrameWidget)}})],y);var u=y,m=(0,o(1001).Z)(u,(function(){var i=this,t=i._self._c;i._self._setupProxy;return t("dialog-base",{staticClass:"moonpay-dialog",attrs:{visible:i.visibility},on:{"update:visible":function(t){i.visibility=t}},scopedSlots:i._u([{key:"title",fn:function(){return[t("moonpay-logo",{attrs:{theme:i.libraryTheme}})]},proxy:!0}])},[t("i-frame-widget",{attrs:{src:i.widgetUrl}})],1)}),[],!1,null,null,null).exports}}]);
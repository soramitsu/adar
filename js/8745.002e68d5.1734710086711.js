"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[8745],{88745:function(t,e,s){s.r(e),s.d(e,{default:function(){return y}});var a=s(23166),i=s(97582),o=s(86424),r=s(89445),n=s(40535),l=s(89334),d=s(68282),u=s(93489),m=s(94503),c=s(49053);let p=class extends((0,r.Wr)(l.Z,n.Z)){constructor(...t){super(...t),(0,a.Z)(this,"HiddenValue",o.WALLET_CONSTS.HiddenValue),(0,a.Z)(this,"DateFormat","ll LT"),(0,a.Z)(this,"id",void 0),(0,a.Z)(this,"lockedAsset",void 0),(0,a.Z)(this,"debtAsset",void 0),(0,a.Z)(this,"shouldBalanceBeHidden",void 0),(0,a.Z)(this,"pageAmount",5)}async updateHistory(t,e){this.checkTriggerUpdate(t,e)}get lockedAssetSymbol(){return this.lockedAsset?.symbol??""}get debtAssetSymbol(){return this.debtAsset?.symbol??""}get dataVariables(){return{id:this.id,first:this.pageAmount,offset:this.pageAmount*(this.currentPage-1)}}get updateVariables(){return{id:this.id,fromTimestamp:this.intervalTimestamp}}getItemTimestamp(t){return t?.timestamp??0}async requestData(t){return await(0,u.V)(t)}getTitle(t){switch(t){case m.rC.Created:return this.t("operations.CreateVault");case m.rC.Closed:return this.t("operations.CloseVault");case m.rC.DebtIncreased:return this.t("operations.BorrowVaultDebt");case m.rC.CollateralDeposit:return this.t("operations.DepositCollateral");case m.rC.DebtPayment:return this.t("operations.RepayVaultDebt");case m.rC.Liquidated:return this.t("kensetsu.liquidated");default:return""}}getAmount(t,e){return t?this.HiddenValue:e.amount?.toLocaleString()??""}getOperationMessage(t){const e=this.shouldBalanceBeHidden;switch(t.type){case m.rC.Created:return this.t("operations.finalized.CreateVault",{symbol:this.debtAssetSymbol,symbol2:this.lockedAssetSymbol});case m.rC.Closed:return this.t("operations.finalized.CloseVault",{symbol:this.debtAssetSymbol,symbol2:this.lockedAssetSymbol});case m.rC.DebtIncreased:return this.t("operations.finalized.BorrowVaultDebt",{symbol:this.debtAssetSymbol,amount:this.getAmount(e,t)});case m.rC.CollateralDeposit:return this.t("operations.finalized.DepositCollateral",{symbol:this.lockedAssetSymbol,amount:this.getAmount(e,t)});case m.rC.DebtPayment:return this.t("operations.finalized.RepayVaultDebt",{symbol:this.debtAssetSymbol,amount:this.getAmount(e,t)});case m.rC.Liquidated:return this.t("kensetsu.liquidatedMessage",{symbol:this.lockedAssetSymbol,amount:this.getAmount(e,t)});default:return""}}};(0,i.gn)([(0,r.fI)({default:void 0,type:Number})],p.prototype,"id",void 0),(0,i.gn)([(0,r.fI)({default:d.u8,type:Object})],p.prototype,"lockedAsset",void 0),(0,i.gn)([(0,r.fI)({default:d.u8,type:Object})],p.prototype,"debtAsset",void 0),(0,i.gn)([c.SB.wallet.settings.shouldBalanceBeHidden],p.prototype,"shouldBalanceBeHidden",void 0),(0,i.gn)([(0,r.RL)("id",{immediate:!0})],p.prototype,"updateHistory",null),p=(0,i.gn)([(0,r.wA)({components:{HistoryPagination:o.wx.HistoryPagination}})],p);var h=p,y=(0,s(1001).Z)(h,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("s-card",{staticClass:"details-history",attrs:{"border-radius":"small",size:"big",primary:""},scopedSlots:t._u([{key:"header",fn:function(){return[e("h4",[t._v(t._s(t.$t("kensetsu.positionHistory")))])]},proxy:!0}])},[t.hasItems?[e("div",{directives:[{name:"loading",rawName:"v-loading",value:t.loadingState,expression:"loadingState"}],staticClass:"details-history__items s-flex-column"},t._l(t.items,(function(s,a){return e("div",{key:a,staticClass:"history-item s-flex-column"},[e("div",{staticClass:"history-item-info s-flex"},[e("div",{staticClass:"history-item-operation ch3",attrs:{"data-type":s.type}},[t._v(t._s(t.getTitle(s.type)))]),e("div",{staticClass:"history-item-title p4"},[t._v(t._s(t.getOperationMessage(s)))])]),e("div",{staticClass:"history-item-date"},[t._v(t._s(t.formatDate(s.timestamp,t.DateFormat)))])])})),0),e("history-pagination",{attrs:{"current-page":t.currentPage,"page-amount":t.pageAmount,loading:t.loading,total:t.total,"last-page":t.lastPage},on:{"pagination-click":t.onPaginationClick}})]:e("div",{directives:[{name:"loading",rawName:"v-loading",value:t.loadingState,expression:"loadingState"}],staticClass:"details-history__empty p4"},[t._v(t._s(t.t("noDataText")))])],2)}),[],!1,null,"150126c7",null).exports}}]);
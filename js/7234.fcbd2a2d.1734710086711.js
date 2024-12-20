"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[7234],{67234:function(t,e,s){s.r(e),s.d(e,{default:function(){return k}});var i=s(23166),o=s(97582),n=s(37981),a=s(69826),r=s(86424),u=s(89445),l=s(55174),p=s(36113),c=s(95405),h=s(68282),d=s(69781),m=s(49053),g=s(50961),w=s(25118);let S=class extends((0,u.Wr)(r.tA.FormattedAmountMixin,r.tA.TransactionMixin,c.Z,l.Z,p.Z)){constructor(...t){super(...t),(0,i.Z)(this,"networkFees",void 0),(0,i.Z)(this,"isExchangeB",void 0),(0,i.Z)(this,"fromValue",void 0),(0,i.Z)(this,"toValue",void 0),(0,i.Z)(this,"isAvailable",void 0),(0,i.Z)(this,"swapQuote",void 0),(0,i.Z)(this,"allowLossPopup",void 0),(0,i.Z)(this,"selectedDexId",void 0),(0,i.Z)(this,"slippageTolerance",void 0),(0,i.Z)(this,"xor",void 0),(0,i.Z)(this,"liquiditySource",void 0),(0,i.Z)(this,"nodeIsConnected",void 0),(0,i.Z)(this,"tokenFrom",void 0),(0,i.Z)(this,"tokenTo",void 0),(0,i.Z)(this,"swapMarketAlgorithm",void 0),(0,i.Z)(this,"setFromValue",void 0),(0,i.Z)(this,"setToValue",void 0),(0,i.Z)(this,"setAmountWithoutImpact",void 0),(0,i.Z)(this,"setExchangeB",void 0),(0,i.Z)(this,"setLiquidityProviderFee",void 0),(0,i.Z)(this,"setRewards",void 0),(0,i.Z)(this,"setRoute",void 0),(0,i.Z)(this,"setDistribution",void 0),(0,i.Z)(this,"selectDexId",void 0),(0,i.Z)(this,"setSubscriptionPayload",void 0),(0,i.Z)(this,"setTokenFromAddress",void 0),(0,i.Z)(this,"setTokenToAddress",void 0),(0,i.Z)(this,"switchTokens",void 0),(0,i.Z)(this,"reset",void 0),(0,i.Z)(this,"resetBalanceSubscriptions",void 0),(0,i.Z)(this,"updateBalanceSubscriptions",void 0),(0,i.Z)(this,"delimiters",n.FPNumber.DELIMITERS_CONFIG),(0,i.Z)(this,"KnownSymbols",a.KnownSymbols),(0,i.Z)(this,"isTokenFromSelected",!1),(0,i.Z)(this,"showSettings",!1),(0,i.Z)(this,"showSelectTokenDialog",!1),(0,i.Z)(this,"lossWarningVisibility",!1),(0,i.Z)(this,"quoteSubscription",null),(0,i.Z)(this,"quoteLoading",!1),(0,i.Z)(this,"recountSwapValues",(0,g._1)(this.runRecountSwapValues,100))}handleLiquiditySourceChange(){this.runRecountSwapValues()}updateConnectionSubsriptions(t){t?this.enableSwapSubscriptions():this.resetSwapSubscriptions()}get tokenFromSymbol(){return this.tokenFrom?.symbol??""}get areTokensSelected(){return!(!this.tokenFrom||!this.tokenTo)}get isZeroFromAmount(){return(0,g.yA)(this.fromValue)}get isZeroToAmount(){return(0,g.yA)(this.toValue)}get hasZeroAmount(){return this.isZeroFromAmount||this.isZeroToAmount}get areZeroAmounts(){return this.isZeroFromAmount&&this.isZeroToAmount}get fromFiatAmount(){return this.tokenFrom&&this.fromValue?this.getFPNumberFiatAmountByFPNumber(new n.FPNumber(this.fromValue),this.tokenFrom)??n.FPNumber.ZERO:n.FPNumber.ZERO}get toFiatAmount(){return this.tokenTo&&this.toValue?this.getFPNumberFiatAmountByFPNumber(new n.FPNumber(this.toValue),this.tokenTo)??n.FPNumber.ZERO:n.FPNumber.ZERO}get fiatDifference(){return(0,w.gb)(this.fromFiatAmount,this.toFiatAmount).toFixed(2)}get fiatDifferenceFormatted(){return this.formatStringValue(this.fiatDifference)}get isErrorFiatDifferenceStatus(){const t=Number(this.fiatDifference),e=Number.isFinite(t)?t:0;return(0,w.n2)(e)===w.gn.Error}get isXorOutputSwap(){return this.tokenTo?.address===a.XOR.address}get isMaxSwapAvailable(){return!!this.preparedForSwap&&(0,g.oI)(this.tokenFrom,this.fromValue,this.networkFee,this.xor,this.isXorOutputSwap)}get preparedForSwap(){return this.isLoggedIn&&this.areTokensSelected}get isInsufficientLiquidity(){return this.isAvailable&&this.preparedForSwap&&!this.areZeroAmounts&&this.hasZeroAmount}get isInsufficientBalance(){return!!this.tokenFrom&&(this.preparedForSwap&&(0,g.Vl)(this.tokenFrom,this.fromValue,this.networkFee))}get isInsufficientXorForFee(){const t=this.preparedForSwap&&(0,g.LG)(this.xor,this.networkFee,this.isXorOutputSwap);if(t||!this.isXorOutputSwap)return t;const e=this.getFPNumberFromCodec(this.xor.balance?.transferable??"0",this.xor.decimals),s=this.getFPNumberFromCodec(this.networkFee,this.xor.decimals).sub(e),i=this.getFPNumber(this.toValue,this.xor.decimals).sub(n.FPNumber.gt(s,this.Zero)?s:this.Zero);return n.FPNumber.lte(i,this.Zero)}get networkFee(){return this.networkFees[n.Operation.Swap]}get isConfirmSwapDisabled(){return!this.areTokensSelected||!this.isAvailable||this.areZeroAmounts||this.isInsufficientLiquidity||this.isInsufficientBalance||this.isInsufficientXorForFee}created(){this.withApi((async()=>{await r.hi.swap.update(),this.enableSwapSubscriptions()}))}getTokenBalance(t){return(0,g.rh)(t)}resetFieldFrom(){this.setFromValue("")}resetFieldTo(){this.setToValue("")}handleInputFieldFrom(t){this.areTokensSelected&&!(0,g.yA)(t)||this.resetFieldTo(),t!==this.fromValue&&(this.setFromValue(t),this.recountSwapValues())}handleInputFieldTo(t){this.areTokensSelected&&!(0,g.yA)(t)||this.resetFieldFrom(),t!==this.toValue&&(this.setToValue(t),this.recountSwapValues())}runRecountSwapValues(){const t=this.isExchangeB?this.toValue:this.fromValue;if(!this.areTokensSelected||(0,g.yA)(t)||!this.swapQuote)return this.setAmountWithoutImpact(),this.setLiquidityProviderFee(),this.setRewards(),this.setRoute(),this.setDistribution(),void this.selectDexId();const e=this.isExchangeB?this.setFromValue:this.setToValue,s=this.isExchangeB?this.resetFieldFrom:this.resetFieldTo,i=this.isExchangeB?this.tokenFrom:this.tokenTo;try{const{dexId:s,result:{amount:o,amountWithoutImpact:n,fee:a,rewards:r,route:u,distribution:l}}=this.swapQuote(this.tokenFrom.address,this.tokenTo.address,t,this.isExchangeB,[this.liquiditySource].filter(Boolean));e(this.getStringFromCodec(o,i.decimals)),this.setAmountWithoutImpact(n),this.setLiquidityProviderFee(a),this.setRewards(r),this.setRoute(u),this.setDistribution(l),this.selectDexId(s)}catch(t){console.error(t),s()}}resetQuoteSubscription(){this.quoteSubscription?.unsubscribe(),this.quoteSubscription=null}async subscribeOnQuote(){if(this.resetQuoteSubscription(),!this.areTokensSelected)return;this.quoteLoading=!0;const t=r.hi.swap.getDexesSwapQuoteObservable(this.tokenFrom.address,this.tokenTo.address);t?this.quoteSubscription=t.subscribe((t=>{this.setSubscriptionPayload(t),this.runRecountSwapValues(),this.quoteLoading=!1})):this.setSubscriptionPayload()}handleFocusField(t=!1){const e=t?this.isZeroToAmount:this.isZeroFromAmount,s=this.isExchangeB;this.setExchangeB(t),e&&(this.resetFieldFrom(),this.resetFieldTo()),s!==this.isExchangeB&&this.recountSwapValues()}async handleSwitchTokens(){this.areTokensSelected&&(await this.switchTokens(),this.runRecountSwapValues())}handleMaxValue(){if(!this.tokenFrom)return;this.setExchangeB(!1);const t=(0,g.MN)(this.tokenFrom,this.networkFee);this.handleInputFieldFrom(t)}openSelectTokenDialog(t){this.isTokenFromSelected=t,this.showSelectTokenDialog=!0}async handleSelectToken(t){t&&await this.withSelectAssetLoading((async()=>{this.isTokenFromSelected?await this.setTokenFromAddress(t.address):await this.setTokenToAddress(t.address),this.subscribeOnQuote()}))}handleSwapClick(){this.isErrorFiatDifferenceStatus&&this.allowLossPopup?this.lossWarningVisibility=!0:this.handleConfirm()}handleConfirm(){this.confirmOrExecute(this.exchangeTokens)}async exchangeTokens(){this.isConfirmSwapDisabled||await this.withNotifications((async()=>{await r.hi.swap.execute(this.tokenFrom,this.tokenTo,this.fromValue,this.toValue,this.slippageTolerance,this.isExchangeB,this.liquiditySource,this.selectedDexId),this.resetFieldFrom(),this.resetFieldTo(),this.setExchangeB(!1)}))}openSettingsDialog(){this.showSettings=!0}enableSwapSubscriptions(){this.updateBalanceSubscriptions(),this.subscribeOnQuote()}resetSwapSubscriptions(){this.resetBalanceSubscriptions(),this.resetQuoteSubscription()}beforeDestroy(){this.resetSwapSubscriptions()}destroyed(){this.reset()}};(0,o.gn)([m.SB.wallet.settings.networkFees],S.prototype,"networkFees",void 0),(0,o.gn)([m.SB.swap.isExchangeB],S.prototype,"isExchangeB",void 0),(0,o.gn)([m.SB.swap.fromValue],S.prototype,"fromValue",void 0),(0,o.gn)([m.SB.swap.toValue],S.prototype,"toValue",void 0),(0,o.gn)([m.SB.swap.isAvailable],S.prototype,"isAvailable",void 0),(0,o.gn)([m.SB.swap.swapQuote],S.prototype,"swapQuote",void 0),(0,o.gn)([m.SB.swap.allowLossPopup],S.prototype,"allowLossPopup",void 0),(0,o.gn)([m.SB.swap.selectedDexId],S.prototype,"selectedDexId",void 0),(0,o.gn)([m.SB.settings.slippageTolerance],S.prototype,"slippageTolerance",void 0),(0,o.gn)([m.Yn.assets.xor],S.prototype,"xor",void 0),(0,o.gn)([m.Yn.swap.swapLiquiditySource],S.prototype,"liquiditySource",void 0),(0,o.gn)([m.Yn.settings.nodeIsConnected],S.prototype,"nodeIsConnected",void 0),(0,o.gn)([m.Yn.swap.tokenFrom],S.prototype,"tokenFrom",void 0),(0,o.gn)([m.Yn.swap.tokenTo],S.prototype,"tokenTo",void 0),(0,o.gn)([m.Yn.swap.swapMarketAlgorithm],S.prototype,"swapMarketAlgorithm",void 0),(0,o.gn)([m.QF.swap.setFromValue],S.prototype,"setFromValue",void 0),(0,o.gn)([m.QF.swap.setToValue],S.prototype,"setToValue",void 0),(0,o.gn)([m.QF.swap.setAmountWithoutImpact],S.prototype,"setAmountWithoutImpact",void 0),(0,o.gn)([m.QF.swap.setExchangeB],S.prototype,"setExchangeB",void 0),(0,o.gn)([m.QF.swap.setLiquidityProviderFee],S.prototype,"setLiquidityProviderFee",void 0),(0,o.gn)([m.QF.swap.setRewards],S.prototype,"setRewards",void 0),(0,o.gn)([m.QF.swap.setRoute],S.prototype,"setRoute",void 0),(0,o.gn)([m.QF.swap.setDistribution],S.prototype,"setDistribution",void 0),(0,o.gn)([m.QF.swap.selectDexId],S.prototype,"selectDexId",void 0),(0,o.gn)([m.QF.swap.setSubscriptionPayload],S.prototype,"setSubscriptionPayload",void 0),(0,o.gn)([m.aD.swap.setTokenFromAddress],S.prototype,"setTokenFromAddress",void 0),(0,o.gn)([m.aD.swap.setTokenToAddress],S.prototype,"setTokenToAddress",void 0),(0,o.gn)([m.aD.swap.switchTokens],S.prototype,"switchTokens",void 0),(0,o.gn)([m.aD.swap.reset],S.prototype,"reset",void 0),(0,o.gn)([m.aD.swap.resetSubscriptions],S.prototype,"resetBalanceSubscriptions",void 0),(0,o.gn)([m.aD.swap.updateSubscriptions],S.prototype,"updateBalanceSubscriptions",void 0),(0,o.gn)([(0,u.RL)("liquiditySource")],S.prototype,"handleLiquiditySourceChange",null),(0,o.gn)([(0,u.RL)("nodeIsConnected")],S.prototype,"updateConnectionSubsriptions",null),S=(0,o.gn)([(0,u.wA)({components:{BaseWidget:(0,d.kF)(h.z8.BaseWidget),SwapSettings:(0,d.kF)(h.z8.SwapSettings),SwapConfirm:(0,d.kF)(h.z8.SwapConfirm),SwapStatusActionBadge:(0,d.kF)(h.z8.SwapStatusActionBadge),SwapTransactionDetails:(0,d.kF)(h.z8.SwapTransactionDetails),SwapLossWarningDialog:(0,d.kF)(h.z8.SwapLossWarningDialog),SlippageTolerance:(0,d.kF)(h.z8.SlippageTolerance),SelectToken:(0,d.kF)(h.z8.SelectToken),TokenInput:(0,d.kF)(h.z8.TokenInput),ValueStatusWrapper:(0,d.kF)(h.z8.ValueStatusWrapper),FormattedAmount:r.wx.FormattedAmount}})],S);var F=S,k=(0,s(1001).Z)(F,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("base-widget",t._b({staticClass:"swap-widget",attrs:{title:t.t("exchange.Swap")},scopedSlots:t._u([{key:"filters",fn:function(){return[e("swap-status-action-badge",{scopedSlots:t._u([{key:"label",fn:function(){return[t._v(t._s(t.t("marketText"))+":")]},proxy:!0},{key:"value",fn:function(){return[t._v(t._s(t.swapMarketAlgorithm))]},proxy:!0},{key:"action",fn:function(){return[e("s-button",{staticClass:"el-button--settings",attrs:{type:"action",icon:"basic-settings-24"},on:{click:t.openSettingsDialog}})]},proxy:!0}])})]},proxy:!0}])},"base-widget",t.$attrs,!1),[e("div",{staticClass:"swap-form"},[e("token-input",{attrs:{"data-test-name":"swapFrom","is-select-available":"",balance:t.getTokenBalance(t.tokenFrom),"is-max-available":t.isMaxSwapAvailable,title:t.t("transfers.from"),token:t.tokenFrom,value:t.fromValue},on:{input:t.handleInputFieldFrom,focus:function(e){return t.handleFocusField(!1)},max:t.handleMaxValue,select:function(e){return t.openSelectTokenDialog(!0)}},scopedSlots:t._u([t.areTokensSelected&&!t.isZeroToAmount&&t.isExchangeB?{key:"title-append",fn:function(){return[e("span",{staticClass:"input-title--uppercase input-title--primary"},[t._v(" ("+t._s(t.t("swap.estimated"))+") ")])]},proxy:!0}:null],null,!0)}),e("s-button",{staticClass:"el-button--switch-tokens",attrs:{"data-test-name":"switchToken",type:"action",icon:"arrows-swap-90-24",disabled:!t.areTokensSelected},on:{click:t.handleSwitchTokens}}),e("token-input",{attrs:{"data-test-name":"swapTo","is-select-available":"",balance:t.getTokenBalance(t.tokenTo),title:t.t("transfers.to"),token:t.tokenTo,value:t.toValue},on:{input:t.handleInputFieldTo,focus:function(e){return t.handleFocusField(!0)},select:function(e){return t.openSelectTokenDialog(!1)}},scopedSlots:t._u([!t.areTokensSelected||t.isZeroFromAmount||t.isExchangeB?null:{key:"title-append",fn:function(){return[e("span",{staticClass:"input-title--uppercase input-title--primary"},[t._v(" ("+t._s(t.t("swap.estimated"))+") ")])]},proxy:!0},t.tokenTo?{key:"fiat-amount-append",fn:function(){return[e("value-status-wrapper",{staticClass:"price-difference__value",attrs:{value:t.fiatDifference,badge:""}},[e("formatted-amount",{attrs:{value:t.fiatDifferenceFormatted}},[t._v("%")])],1)]},proxy:!0}:null],null,!0)}),e("slippage-tolerance",{staticClass:"slippage-tolerance-settings"}),t.isLoggedIn?e("s-button",{staticClass:"action-button s-typography-button--large",attrs:{"data-test-name":"confirmSwap",type:"primary",disabled:t.isConfirmSwapDisabled,loading:t.loading||t.quoteLoading||t.isSelectAssetLoading},on:{click:t.handleSwapClick}},[t.areTokensSelected?t.isAvailable?t.areZeroAmounts?[t._v(" "+t._s(t.t("buttons.enterAmount"))+" ")]:t.isInsufficientLiquidity?[t._v(" "+t._s(t.t("swap.insufficientLiquidity"))+" ")]:t.isInsufficientBalance?[t._v(" "+t._s(t.t("insufficientBalanceText",{tokenSymbol:t.tokenFromSymbol}))+" ")]:t.isInsufficientXorForFee?[t._v(" "+t._s(t.t("insufficientBalanceText",{tokenSymbol:t.KnownSymbols.XOR}))+" ")]:[t.isErrorFiatDifferenceStatus?e("s-icon",{staticClass:"action-button-icon",attrs:{name:"notifications-alert-triangle-24",size:"18"}}):t._e(),t._v(" "+t._s(t.t("exchange.Swap"))+" ")]:[t._v(" "+t._s(t.t("pairIsNotCreated"))+" ")]:[t._v(" "+t._s(t.t("buttons.chooseTokens"))+" ")]],2):e("s-button",{staticClass:"action-button s-typography-button--large",attrs:{type:"primary"},on:{click:t.connectSoraWallet}},[t._v(" "+t._s(t.t("connectWalletText"))+" ")]),t.areTokensSelected&&!t.hasZeroAmount?e("swap-transaction-details",{attrs:{"info-only":!1}}):t._e(),e("select-token",{attrs:{visible:t.showSelectTokenDialog,connected:t.isLoggedIn,asset:t.isTokenFromSelected?t.tokenTo:t.tokenFrom},on:{"update:visible":function(e){t.showSelectTokenDialog=e},select:t.handleSelectToken}}),e("swap-loss-warning-dialog",{attrs:{visible:t.lossWarningVisibility,value:t.fiatDifferenceFormatted},on:{"update:visible":function(e){t.lossWarningVisibility=e},confirm:t.handleConfirm}}),e("swap-confirm",{attrs:{visible:t.confirmDialogVisibility,"is-insufficient-balance":t.isInsufficientBalance},on:{"update:visible":function(e){t.confirmDialogVisibility=e},confirm:t.exchangeTokens}}),e("swap-settings",{attrs:{visible:t.showSettings},on:{"update:visible":function(e){t.showSettings=e}}})],1)])}),[],!1,null,"ca9e17c0",null).exports}}]);
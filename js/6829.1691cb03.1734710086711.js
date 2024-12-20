"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[6829],{36829:function(e,i,t){t.r(i),t.d(i,{default:function(){return S}});var s=t(23166),n=(t(70560),t(97582)),o=t(37981),a=t(69826),d=t(86424),r=t(89445),l=t(58608),c=t(55174),u=t(47614),h=t(57478),p=t(95405),k=t(68282),f=t(69781),g=t(51475),T=t(49053),y=t(50961);let v=class extends((0,r.Wr)(d.tA.TransactionMixin,d.tA.NetworkFeeWarningMixin,l.Z,u.Z,c.Z,p.Z,h.Z)){constructor(...e){super(...e),(0,s.Z)(this,"FocusedField",g.G),(0,s.Z)(this,"slippageToleranceValue",void 0),(0,s.Z)(this,"xor",void 0),(0,s.Z)(this,"isLoggedIn",void 0),(0,s.Z)(this,"shareOfPool",void 0),(0,s.Z)(this,"liquidityInfo",void 0),(0,s.Z)(this,"isNotFirstLiquidityProvider",void 0),(0,s.Z)(this,"setFirstTokenAddress",void 0),(0,s.Z)(this,"setSecondTokenAddress",void 0),(0,s.Z)(this,"addLiquidity",void 0),(0,s.Z)(this,"updateSubscriptions",void 0),(0,s.Z)(this,"resetSubscriptions",void 0),(0,s.Z)(this,"resetData",void 0),(0,s.Z)(this,"setData",void 0),(0,s.Z)(this,"setFirstTokenValue",void 0),(0,s.Z)(this,"setSecondTokenValue",void 0),(0,s.Z)(this,"setFocusedField",void 0),(0,s.Z)(this,"showSelectTokenDialog",!1),(0,s.Z)(this,"isFirstTokenSelected",!1),(0,s.Z)(this,"insufficientBalanceTokenSymbol","")}handleLoggedInStateChange(e,i){i&&!e&&this.handleBack()}updateConnectionSubsriptions(e){e?this.updateSubscriptions():this.resetSubscriptions()}async mounted(){await this.withParentLoading((async()=>{this.parseCurrentRoute(),this.isValidRoute&&this.firstRouteAddress&&this.secondRouteAddress?await this.setData({firstAddress:this.firstRouteAddress,secondAddress:this.secondRouteAddress}):await this.setFirstTokenAddress(a.XOR.address)}))}destroyed(){this.resetData()}get areTokensSelected(){return!(!this.firstToken||!this.secondToken)}get removeLiquidityFormattedFee(){return this.formatCodecNumber(this.networkFees[o.Operation.RemoveLiquidity])}get isXorSufficientForNextOperation(){const e={type:this.isAvailable?o.Operation.AddLiquidity:o.Operation.CreatePair};return this.firstToken?.address===a.XOR.address&&(e.amount=this.getFPNumber(this.firstTokenValue),e.isXor=!0),this.isXorSufficientForNextTx(e)}get isFirstMaxButtonAvailable(){return!(!this.firstToken||!this.isLoggedIn)&&(0,y.oI)(this.firstToken,this.firstTokenValue,this.networkFee,this.xor)}get isSecondMaxButtonAvailable(){return!(!this.secondToken||!this.isLoggedIn)&&(0,y.oI)(this.secondToken,this.secondTokenValue,this.networkFee,this.xor)}get isInsufficientBalance(){if(this.isLoggedIn&&this.areTokensSelected){if((0,y.Vl)(this.firstToken,this.firstTokenValue,this.networkFee))return this.insufficientBalanceTokenSymbol=this.firstToken.symbol,!0;if((0,y.Vl)(this.secondToken,this.secondTokenValue,this.networkFee))return this.insufficientBalanceTokenSymbol=this.secondToken.symbol,!0}return this.insufficientBalanceTokenSymbol="",!1}async handleAddLiquidityMaxValue(e,i){e&&await this.handleTokenChange((0,y.MN)(e,this.networkFee),i)}async handleAddLiquidity(){if(this.allowFeePopup&&!this.isXorSufficientForNextOperation){if(this.openWarningFeeDialog(),await this.waitOnFeeWarningConfirmation(),!this.isWarningFeeDialogConfirmed)return;this.isWarningFeeDialogConfirmed=!1}this.confirmOrExecute(this.depositLiquidity)}async handleTokenChange(e,i){await i(e)}getTokenBalance(e){return(0,y.rh)(e)}openSelectTokenDialog(e){this.isFirstTokenSelected=e,this.showSelectTokenDialog=!0}async selectToken(e){const i=e?.address;i&&await this.withSelectAssetLoading((async()=>{this.isFirstTokenSelected?await this.setFirstTokenAddress(i):await this.setSecondTokenAddress(i),this.firstToken?.address===a.XSTUSD.address&&this.secondToken?.address===a.XOR.address&&(await this.setFirstTokenAddress(a.XOR.address),await this.setSecondTokenAddress(a.XSTUSD.address))})),this.updateRouteAfterSelectTokens(this.firstToken,this.secondToken)}async depositLiquidity(){await this.withNotifications((async()=>{await this.addLiquidity(),this.handleBack()}))}handleBack(){f.ZP.push({name:k.sn.Pool})}};(0,n.gn)([T.SB.settings.slippageTolerance],v.prototype,"slippageToleranceValue",void 0),(0,n.gn)([T.Yn.assets.xor],v.prototype,"xor",void 0),(0,n.gn)([T.Yn.wallet.account.isLoggedIn],v.prototype,"isLoggedIn",void 0),(0,n.gn)([T.Yn.addLiquidity.shareOfPool],v.prototype,"shareOfPool",void 0),(0,n.gn)([T.Yn.addLiquidity.liquidityInfo],v.prototype,"liquidityInfo",void 0),(0,n.gn)([T.Yn.addLiquidity.isNotFirstLiquidityProvider],v.prototype,"isNotFirstLiquidityProvider",void 0),(0,n.gn)([T.aD.addLiquidity.setFirstTokenAddress],v.prototype,"setFirstTokenAddress",void 0),(0,n.gn)([T.aD.addLiquidity.setSecondTokenAddress],v.prototype,"setSecondTokenAddress",void 0),(0,n.gn)([T.aD.addLiquidity.addLiquidity],v.prototype,"addLiquidity",void 0),(0,n.gn)([T.aD.addLiquidity.updateSubscriptions],v.prototype,"updateSubscriptions",void 0),(0,n.gn)([T.aD.addLiquidity.resetSubscriptions],v.prototype,"resetSubscriptions",void 0),(0,n.gn)([T.aD.addLiquidity.resetData],v.prototype,"resetData",void 0),(0,n.gn)([T.aD.addLiquidity.setDataFromLiquidity],v.prototype,"setData",void 0),(0,n.gn)([T.aD.addLiquidity.setFirstTokenValue],v.prototype,"setFirstTokenValue",void 0),(0,n.gn)([T.aD.addLiquidity.setSecondTokenValue],v.prototype,"setSecondTokenValue",void 0),(0,n.gn)([T.QF.addLiquidity.setFocusedField],v.prototype,"setFocusedField",void 0),(0,n.gn)([(0,r.RL)("isLoggedIn")],v.prototype,"handleLoggedInStateChange",null),(0,n.gn)([(0,r.RL)("nodeIsConnected")],v.prototype,"updateConnectionSubsriptions",null),v=(0,n.gn)([(0,r.wA)({components:{AddLiquidityConfirm:(0,f.kF)(k.z8.AddLiquidityConfirm),AddLiquidityTransactionDetails:(0,f.kF)(k.z8.AddLiquidityTransactionDetails),GenericPageHeader:(0,f.kF)(k.z8.GenericPageHeader),SelectToken:(0,f.kF)(k.z8.SelectToken),SlippageTolerance:(0,f.kF)(k.z8.SlippageTolerance),NetworkFeeWarningDialog:(0,f.kF)(k.z8.NetworkFeeWarningDialog),TokenInput:(0,f.kF)(k.z8.TokenInput),InfoLine:d.wx.InfoLine}})],v);var F=v,S=(0,t(1001).Z)(F,(function(){var e=this,i=e._self._c;e._self._setupProxy;return i("div",{directives:[{name:"loading",rawName:"v-loading",value:e.parentLoading,expression:"parentLoading"}],staticClass:"container"},[i("generic-page-header",{attrs:{"has-button-back":"",title:e.t("addLiquidity.title"),tooltip:e.t("pool.description")},on:{back:e.handleBack}}),i("s-form",{staticClass:"el-form--actions",attrs:{"show-message":!1}},[i("token-input",{attrs:{balance:e.getTokenBalance(e.firstToken),"is-select-available":"","is-max-available":e.isFirstMaxButtonAvailable,title:e.t("createPair.deposit"),token:e.firstToken,value:e.firstTokenValue,disabled:!e.areTokensSelected},on:{input:function(i){return e.handleTokenChange(i,e.setFirstTokenValue)},focus:function(i){return e.setFocusedField(e.FocusedField.First)},max:function(i){return e.handleAddLiquidityMaxValue(i,e.setFirstTokenValue)},select:function(i){return e.openSelectTokenDialog(!0)}}}),i("s-icon",{staticClass:"icon-divider",attrs:{name:"plus-16"}}),i("token-input",{attrs:{balance:e.getTokenBalance(e.secondToken),"is-select-available":"","is-max-available":e.isSecondMaxButtonAvailable,title:e.t("createPair.deposit"),token:e.secondToken,value:e.secondTokenValue,disabled:!e.areTokensSelected},on:{input:function(i){return e.handleTokenChange(i,e.setSecondTokenValue)},focus:function(i){return e.setFocusedField(e.FocusedField.Second)},max:function(i){return e.handleAddLiquidityMaxValue(i,e.setSecondTokenValue)},select:function(i){return e.openSelectTokenDialog(!1)}}}),i("slippage-tolerance",{staticClass:"slippage-tolerance-settings"}),i("s-button",{staticClass:"action-button s-typography-button--large",attrs:{type:"primary",disabled:!e.areTokensSelected||e.emptyAssets||e.isInsufficientBalance,loading:e.loading||e.isSelectAssetLoading},on:{click:e.handleAddLiquidity}},[e.areTokensSelected?e.emptyAssets?[e._v(" "+e._s(e.t("buttons.enterAmount"))+" ")]:e.isInsufficientBalance?[e._v(" "+e._s(e.t("insufficientBalanceText",{tokenSymbol:e.insufficientBalanceTokenSymbol}))+" ")]:[e._v(" "+e._s(e.t("createPair.supply"))+" ")]:[e._v(" "+e._s(e.t("buttons.chooseTokens"))+" ")]],2),e.areTokensSelected?[e.isAvailable&&e.isNotFirstLiquidityProvider||!e.emptyAssets?e._e():i("div",{staticClass:"info-line-container"},[i("p",{staticClass:"info-line-container__title"},[e._v(e._s(e.t("createPair.firstLiquidityProvider")))]),i("info-line",{scopedSlots:e._u([{key:"info-line-prefix",fn:function(){return[i("p",{staticClass:"info-line--first-liquidity",domProps:{innerHTML:e._s(e.t("createPair.firstLiquidityProviderInfo"))}})]},proxy:!0}],null,!1,3709695096)})],1),!e.emptyAssets||(e.liquidityInfo||{}).balance?i("add-liquidity-transaction-details",{staticClass:"info-line-container",attrs:{"info-only":!1}}):e._e()]:e._e()],2),i("select-token",{attrs:{"is-add-liquidity":"",visible:e.showSelectTokenDialog,connected:e.isLoggedIn,asset:e.isFirstTokenSelected?e.secondToken:e.firstToken,"is-first-token-selected":e.isFirstTokenSelected,"disabled-custom":e.isFirstTokenSelected},on:{"update:visible":function(i){e.showSelectTokenDialog=i},select:e.selectToken}}),i("add-liquidity-confirm",{attrs:{visible:e.confirmDialogVisibility,"parent-loading":e.parentLoading||e.loading,"share-of-pool":e.shareOfPool,"first-token":e.firstToken,"second-token":e.secondToken,"first-token-value":e.firstTokenValue,"second-token-value":e.secondTokenValue,price:e.price,"price-reversed":e.priceReversed,"slippage-tolerance":e.slippageToleranceValue,"insufficient-balance-token-symbol":e.insufficientBalanceTokenSymbol},on:{"update:visible":function(i){e.confirmDialogVisibility=i},confirm:e.depositLiquidity}}),i("network-fee-warning-dialog",{attrs:{visible:e.showWarningFeeDialog,fee:e.removeLiquidityFormattedFee},on:{"update:visible":function(i){e.showWarningFeeDialog=i},confirm:e.confirmNetworkFeeWariningDialog}})],1)}),[],!1,null,"51203fdc",null).exports}}]);
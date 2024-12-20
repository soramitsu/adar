"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[5435],{35435:function(t,e,i){i.r(e),i.d(e,{default:function(){return f}});var s=i(23166),a=i(97582),n=i(37981),l=i(86424),o=i(89445),r=i(68282),u=i(69781),d=i(49053),h=i(50961),m=i(19316),p=i(46697),c=i(76858);let F=class extends((0,o.Wr)(c.Z,l.tA.DialogMixin,l.tA.LoadingMixin)){constructor(...t){super(...t),(0,s.Z)(this,"isAdding",void 0),(0,s.Z)(this,"shouldBalanceBeHidden",void 0),(0,s.Z)(this,"value","")}resetValue(){this.value=""}get networkFee(){const t=this.isAdding?n.Operation.DemeterFarmingDepositLiquidity:n.Operation.DemeterFarmingWithdrawLiquidity;return this.networkFees[t]}get title(){const t=this.isAdding?this.hasStake?"add":"start":"remove";return this.t(`demeterFarming.actions.${t}`)}get inputTitle(){const t=this.isAdding?"amountAdd":"amountRemove";return this.t(`demeterFarming.${t}`)}get valuePartCharClass(){return`${{3:"three",2:"two"}[this.value.toString().length]??"one"}-char`}get part(){return new n.FPNumber(this.value).div(n.FPNumber.HUNDRED)}get poolShareAfter(){if(this.isAdding){const t=new n.FPNumber(this.depositFee),e=this.valueFunds.mul(t),i=this.lockedFunds.add(this.valueFunds.sub(e));return this.isFarm?i.div(this.funds.sub(e)).mul(n.FPNumber.HUNDRED):i}{const t=n.FPNumber.max(this.lockedFunds,this.funds),e=n.FPNumber.max(this.lockedFunds.sub(this.valueFunds),n.FPNumber.ZERO);return this.isFarm?e.div(t).mul(n.FPNumber.HUNDRED):e}}get poolShareAfterFiat(){return this.isFarm||!this.poolAsset?null:this.getFiatAmountByFPNumber(this.poolShareAfter,this.poolAsset)}get poolShareAfterFormatted(){return this.poolShareAfter.toLocaleString()+(this.isFarm?"%":"")}get poolShareAfterText(){return this.isFarm?this.t("demeterFarming.info.poolShareWillBe"):this.t("demeterFarming.info.stakeWillBe",{symbol:this.poolAssetSymbol})}get valueFunds(){if(!this.poolAsset)return n.FPNumber.ZERO;if(!this.isFarm)return new n.FPNumber(this.value);if(this.isAdding){const t=n.FPNumber.fromCodecValue(this.networkFee);return((0,h.AN)(this.poolAsset)?this.availableFunds.sub(t):this.availableFunds).mul(this.part)}return this.lockedFunds.mul(this.part)}get valueFundsEmpty(){return this.valueFunds.isZero()}get stakingBalance(){return this.isAdding?this.availableFunds:this.lockedFunds}get stakingBalanceCodec(){return this.stakingBalance.toCodecString()}get isMaxButtonAvailable(){if(this.shouldBalanceBeHidden)return!1;if(!this.poolAsset)return!1;const t=n.FPNumber.fromCodecValue(this.networkFee),e=this.isAdding&&(0,h.AN)(this.poolAsset)?this.stakingBalance.sub(t):this.stakingBalance;return!n.FPNumber.eq(this.valueFunds,e)}get maxStake(){return this.poolAsset?this.isAdding?(0,h.MN)(this.poolAsset,this.networkFee):this.lockedFunds.toString():r.m8}get isInsufficientBalance(){if(this.isFarm)return!1;const t=new n.FPNumber(this.maxStake,this.poolAsset?.decimals);return n.FPNumber.lt(t,this.valueFunds)}handleValue(t){this.value=String(t)}handleMaxValue(){this.handleValue(this.maxStake)}handleConfirm(){const t={pool:this.pool,accountPool:this.accountPool,value:this.valueFunds},e=this.isAdding?"add":"remove";this.$emit(e,t)}};(0,a.gn)([(0,o.fI)({default:()=>!0,type:Boolean})],F.prototype,"isAdding",void 0),(0,a.gn)([d.SB.wallet.settings.shouldBalanceBeHidden],F.prototype,"shouldBalanceBeHidden",void 0),(0,a.gn)([(0,o.RL)("visible")],F.prototype,"resetValue",null),F=(0,a.gn)([(0,o.wA)({components:{DialogTitle:(0,m.Y)(p.o.DialogTitle),TokenInput:(0,u.kF)(r.z8.TokenInput),DialogBase:l.wx.DialogBase,InfoLine:l.wx.InfoLine}})],F);var g=F,f=(0,i(1001).Z)(g,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("dialog-base",{attrs:{visible:t.isVisible,title:t.title},on:{"update:visible":function(e){t.isVisible=e}}},[e("div",{staticClass:"stake-dialog"},[e("dialog-title",{attrs:{"base-asset":t.baseAsset,"pool-asset":t.poolAsset,"is-farm":t.isFarm}}),t.isAdding?e("div",{staticClass:"stake-dialog-info"},[t.pricesAvailable?[e("info-line",{attrs:{label:t.TranslationConsts.APR,value:t.apr}}),e("info-line",{attrs:{label:t.t("demeterFarming.info.totalLiquidityLocked"),value:t.tvl}})]:t._e(),e("info-line",{attrs:{label:t.t("demeterFarming.info.rewardToken"),value:t.rewardAssetSymbol}})],2):t._e(),e("s-form",{staticClass:"el-form--actions",attrs:{"show-message":!1}},[t.isFarm?e("s-float-input",{key:"farm-input",class:["s-input--stake-part","s-input--token-value",t.valuePartCharClass],attrs:{size:"medium",value:t.value,decimals:0,max:100},on:{input:t.handleValue}},[e("div",{staticClass:"amount",attrs:{slot:"top"},slot:"top"},[t._v(t._s(t.inputTitle))]),e("div",{staticClass:"el-buttons el-buttons--between",attrs:{slot:"right"},slot:"right"},[e("span",{staticClass:"percent"},[t._v("%")]),t.isMaxButtonAvailable?e("s-button",{staticClass:"el-button--max s-typography-button--small",attrs:{type:"primary",alternative:"",size:"mini","border-radius":"mini"},on:{click:function(e){return e.stopPropagation(),t.handleValue(100)}}},[t._v(" "+t._s(t.t("buttons.max"))+" ")]):t._e()],1),e("s-slider",{staticClass:"slider-container",attrs:{slot:"bottom",value:Number(t.value),"show-tooltip":!1},on:{input:t.handleValue},slot:"bottom"})],1):e("token-input",{key:"stake-input",attrs:{balance:t.stakingBalanceCodec,"is-max-available":t.isMaxButtonAvailable,title:t.inputTitle,token:t.poolAsset,value:t.value},on:{input:t.handleValue,max:t.handleMaxValue}})],1),t.hasStake?e("info-line",{attrs:{"value-can-be-hidden":"",label:t.poolShareText,value:t.poolShareFormatted,"fiat-value":t.poolShareFiat}}):t._e(),e("info-line",{attrs:{"value-can-be-hidden":"",label:t.poolShareAfterText,value:t.poolShareAfterFormatted,"fiat-value":t.poolShareAfterFiat}}),t.isAdding?e("info-line",{attrs:{label:t.t("demeterFarming.info.fee"),"label-tooltip":t.t("demeterFarming.info.feeTooltip"),value:t.depositFeeFormatted}}):t._e(),e("info-line",{attrs:{label:t.t("networkFeeText"),"label-tooltip":t.t("networkFeeTooltipText"),value:t.networkFeeFormatted,"asset-symbol":t.xorSymbol,"fiat-value":t.getFiatAmountByCodecString(t.networkFee),"is-formatted":""}}),e("s-button",{staticClass:"s-typography-button--large action-button",attrs:{type:"primary",loading:t.parentLoading,disabled:t.isInsufficientXorForFee||t.valueFundsEmpty||t.isInsufficientBalance},on:{click:t.handleConfirm}},[t.isInsufficientXorForFee?[t._v(" "+t._s(t.t("insufficientBalanceText",{tokenSymbol:t.xorSymbol}))+" ")]:t.isInsufficientBalance?[t._v(" "+t._s(t.t("insufficientBalanceText",{tokenSymbol:t.poolAssetSymbol}))+" ")]:t.valueFundsEmpty?[t._v(" "+t._s(t.t("buttons.enterAmount"))+" ")]:[t._v(" "+t._s(t.t("confirmText"))+" ")]],2)],1)])}),[],!1,null,"4f880de4",null).exports}}]);
"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[4612],{24612:function(t,e,a){a.r(e),a.d(e,{default:function(){return b}});var o=a(23166),s=a(97582),n=a(86424),r=a(89445),l=a(36113),i=a(68282),c=a(69781),d=a(19316),u=a(46697),p=a(76858);let m=class extends((0,r.Wr)(p.Z,l.Z)){constructor(...t){super(...t),(0,o.Z)(this,"border",void 0),(0,o.Z)(this,"showBalance",void 0),(0,o.Z)(this,"link",i.yX.demeterFarmingPlatform)}get title(){const t=this.activeStatus?this.hasStake?"active":"inactive":"stopped";return this.t(`demeterFarming.staking.${t}`)}get primaryButtonText(){return this.t("demeterFarming.actions."+(this.hasStake?"add":"start"))}get poolAssetBalanceFormatted(){return this.poolAssetBalance.toLocaleString()}get poolAssetBalanceFiat(){return this.getFiatAmountByFPNumber(this.poolAssetBalance,this.poolAsset)}};(0,s.gn)([(0,r.fI)({default:!1,type:Boolean})],m.prototype,"border",void 0),(0,s.gn)([(0,r.fI)({default:!1,type:Boolean})],m.prototype,"showBalance",void 0),m=(0,s.gn)([(0,r.wA)({components:{CalculatorButton:(0,d.Y)(u.o.CalculatorButton),PoolInfo:(0,c.kF)(i.z8.PoolInfo),InfoLine:n.wx.InfoLine}})],m);var f=m,y=(0,a(1001).Z)(f,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("s-card",{class:["demeter-pool-card",{border:t.border}]},[e("pool-info",{scopedSlots:t._u([{key:"prepend",fn:function(){return[e("div",{staticClass:"demeter-pool-card-status"},[t.hasStake?e("s-icon",{class:["demeter-pool-card-status-icon",{active:t.activeStatus}],attrs:{name:"basic-placeholder-24",size:"12"}}):t._e(),e("span",{staticClass:"demeter-pool-card-status-title"},[t._v(t._s(t.title))])],1)]},proxy:!0},t.hasStake||t.hasRewards?{key:"buttons",fn:function(){return[e("s-button",{staticClass:"s-typography-button--medium",attrs:{type:"secondary",disabled:!t.hasRewards},on:{click:t.claim}},[t._v(t._s(t.t("demeterFarming.actions.claim")))]),e("s-button",{staticClass:"s-typography-button--medium",attrs:{type:"secondary",disabled:!t.hasStake},on:{click:t.remove}},[t._v(t._s(t.t("demeterFarming.actions.remove")))])]},proxy:!0}:null,{key:"append",fn:function(){return[t.activeStatus?[t.isLoggedIn?e("s-button",{key:"connected",staticClass:"s-typography-button--large action-button",attrs:{type:"primary",disabled:t.depositDisabled},on:{click:t.add}},[t._v(" "+t._s(t.primaryButtonText)+" ")]):e("s-button",{key:"disconnected",staticClass:"s-typography-button--large action-button",attrs:{type:"primary"},on:{click:t.connectSoraWallet}},[t._v(" "+t._s(t.t("connectWalletText"))+" ")])]:t._e(),e("a",{staticClass:"demeter-pool-card-copyright",attrs:{href:t.link,target:"_blank",rel:"nofollow noopener"}},[t._v(" "+t._s(t.t("demeterFarming.poweredBy"))+" ")])]},proxy:!0}],null,!0)},[t.isLoggedIn&&t.showBalance?e("info-line",{attrs:{"value-can-be-hidden":"",label:t.t("demeterFarming.info.owned",{symbol:t.poolAssetSymbol}),value:t.poolAssetBalanceFormatted,"fiat-value":t.poolAssetBalanceFiat}}):t._e(),t.pricesAvailable?e("info-line",{attrs:{value:t.apr},scopedSlots:t._u([{key:"info-line-prefix",fn:function(){return[e("div",{staticClass:"apr"},[e("span",{staticClass:"apr-label"},[t._v(t._s(t.TranslationConsts.APR))]),e("calculator-button",{nativeOn:{click:function(e){return t.calculator.apply(null,arguments)}}},[e("span",[t._v(t._s(t.t("demeterFarming.calculator")))])])],1)]},proxy:!0}],null,!1,1538608339)}):t._e(),t.pricesAvailable?e("info-line",{attrs:{label:t.t("demeterFarming.info.totalLiquidityLocked"),value:t.tvl}}):t._e(),e("info-line",{attrs:{label:t.t("demeterFarming.info.rewardToken"),value:t.rewardAssetSymbol}}),t.hasStake||t.hasRewards?e("info-line",{attrs:{"value-can-be-hidden":"",label:t.t("demeterFarming.info.earned",{symbol:t.rewardAssetSymbol}),value:t.rewardsFormatted,"fiat-value":t.rewardsFiat}}):t._e(),t.hasStake?e("info-line",{key:"has-stake",attrs:{"value-can-be-hidden":"",label:t.poolShareText,value:t.poolShareFormatted,"fiat-value":t.poolShareFiat}}):e("info-line",{key:"no-stake",attrs:{label:t.t("demeterFarming.info.fee"),"label-tooltip":t.t("demeterFarming.info.feeTooltip"),value:t.depositFeeFormatted}})],1)],1)}),[],!1,null,"4e69ad12",null),b=y.exports}}]);
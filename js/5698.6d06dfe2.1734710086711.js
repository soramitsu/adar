"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[5698],{65698:function(e,t,a){a.r(t),a.d(t,{default:function(){return f}});var s=a(23166),i=(a(70560),a(97582)),r=a(37981),n=a(86424),o=a(89445),d=a(68282),l=a(69781),c=a(50961),u=a(19316),w=a(93838),h=a(50149),g=a(82002);let v=class extends((0,o.Wr)(h.Z,g.Z,n.tA.TransactionMixin,n.tA.DialogMixin)){constructor(...e){super(...e),(0,s.Z)(this,"payoutNetworkFee",null),(0,s.Z)(this,"selectedRewards",[])}resetValue(){this.visible&&(this.selectedRewards=[])}async handlePendingRewardsChange(){this.payoutNetworkFee=await this.getPayoutNetworkFee({payouts:this.payouts})}get networkFee(){return this.payoutNetworkFee??"0"}get title(){return this.t("soraStaking.pendingRewardsDialog.title")}get rewards(){if(!this.pendingRewards||!this.rewardAsset)return[];return this.pendingRewards.map((e=>e.validators.map((t=>{const a=this.validators.find((e=>e.address===t.address));if(!a)throw new Error(`There is no validator "${t.address}" in the list`);const s=this.formatName(a),i=((this.historyDepth??0)-(this.currentEra-Number(e.era)))*w.Cc,n=Math.floor(i/24),o=n<1?"less then 1 day left":n+" days left",d=n<5,l=t.value,u=(0,c.Gc)(new r.FPNumber(l,this.rewardAsset?.decimals))+" "+this.rewardAsset?.symbol,h=this.getFiatAmountByFPNumber(new r.FPNumber(l,this.rewardAsset?.decimals),this.rewardAsset??void 0);return{id:`${t.address}-${e.era}`,era:e.era,validators:e.validators,name:s,daysLeft:n,daysLeftFormatted:o,alert:d,value:l,valueFormatted:u,valueFiat:h,validator:a}})))).flat()}isRewardSelected(e){return this.selectedRewards.some((t=>t.id===e.id))}toggleRewardSelection(e){const t=this.selectedRewards.findIndex((t=>t.id===e.id)),a=[...this.selectedRewards];t>-1?a.splice(t,1):a.push(e),this.selectedRewards=a}computedClassDaysLeft(e){const t=["days-left"];return e&&t.push("days-left--alert"),t.join(" ")}get noReward(){return!this.rewards.length}get noSelectedRewards(){return!this.selectedRewards.length}get payouts(){return this.selectedRewards.map((e=>({era:e.era,validators:e.validators.map((e=>e.address))})))}async handleConfirm(){await this.withNotifications((async()=>{await this.payout({payouts:this.payouts}),await this.getPendingRewards(),this.closeDialog()}))}};(0,i.gn)([(0,o.RL)("visible",{immediate:!0})],v.prototype,"resetValue",null),(0,i.gn)([(0,o.RL)("selectedRewards")],v.prototype,"handlePendingRewardsChange",null),v=(0,i.gn)([(0,o.wA)({components:{TokenInput:(0,l.kF)(d.z8.TokenInput),ValidatorAvatar:(0,u.qU)(w.Jh.ValidatorAvatar),DialogBase:n.wx.DialogBase,InfoLine:n.wx.InfoLine,FormattedAmount:n.wx.FormattedAmount}})],v);var m=v,f=(0,a(1001).Z)(m,(function(){var e=this,t=e._self._c;e._self._setupProxy;return t("dialog-base",{attrs:{visible:e.isVisible,title:e.title},on:{"update:visible":function(t){e.isVisible=t}}},[t("div",{staticClass:"pending-rewards-dialog"},[t("s-scrollbar",{staticClass:"pending-rewards-scrollbar"},[t("s-card",{staticClass:"information",attrs:{shadow:"always",primary:""}},[t("div",{staticClass:"information-content"},[t("div",{staticClass:"information-text"},[e._v(" "+e._s(e.t("soraStaking.pendingRewardsDialog.information"))+" ")]),t("div",{staticClass:"information-icon"},[t("s-icon",{attrs:{name:"notifications-alert-triangle-24",size:"20px"}})],1)])]),e._l(e.rewards,(function(a){return t("s-card",{key:a.id,staticClass:"reward",attrs:{"border-radius":"medium",shadow:"always",size:"mini"},nativeOn:{click:function(t){return e.toggleRewardSelection(a)}}},[t("div",{staticClass:"reward-content"},[t("validator-avatar",{staticClass:"avatar",attrs:{validator:a.validator}},[a.alert?t("s-icon",{staticClass:"alert-icon",attrs:{slot:"icon",name:"notifications-alert-triangle-24",size:"16px"},slot:"icon"}):e._e()],1),t("div",{staticClass:"reward-lines"},[t("div",{staticClass:"reward-line"},[t("div",{staticClass:"name"},[e._v(" "+e._s(a.name)+" ")]),t("div",{staticClass:"value"},[e._v(" "+e._s(a.valueFormatted)+" ")])]),t("div",{staticClass:"reward-line"},[t("div",{class:e.computedClassDaysLeft(a.alert)},[e._v(" "+e._s(a.daysLeftFormatted)+" ")]),t("formatted-amount",{staticClass:"value-fiat",attrs:{"is-fiat-value":"","with-left-shift":"",value:a.valueFiat}})],1)]),t("div",{class:{"reward-check":!0,"reward-check--selected":e.isRewardSelected(a)}},[t("s-icon",{attrs:{name:"basic-check-mark-24",size:"18px"}})],1)],1)])}))],2),t("div",{staticClass:"info"},[t("info-line",{attrs:{label:e.t("networkFeeText"),"label-tooltip":e.t("networkFeeTooltipText"),value:e.networkFeeFormatted,"asset-symbol":e.xor?.symbol,"fiat-value":e.getFiatAmountByCodecString(e.networkFee),"is-formatted":""}})],1),t("s-button",{staticClass:"s-typography-button--large action-button",attrs:{type:"primary",loading:e.parentLoading||e.loading,disabled:e.isInsufficientXorForFee||e.noReward||e.noSelectedRewards},on:{click:e.handleConfirm}},[e.isInsufficientXorForFee?[e._v(" "+e._s(e.t("insufficientBalanceText",{tokenSymbol:e.stakingAsset?.symbol}))+" ")]:e.noReward?[e._v(e._s(e.t("soraStaking.pendingRewardsDialog.noPendingRewards")))]:e.noSelectedRewards?[e._v(e._s(e.t("soraStaking.pendingRewardsDialog.noSelectedRewards")))]:[e._v(e._s(e.t("soraStaking.pendingRewardsDialog.payout"))+" ("+e._s(e.selectedRewards.length)+")")]],2)],1)])}),[],!1,null,"7a916aec",null).exports}}]);
"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[2081],{92081:function(t,e,i){i.r(e),i.d(e,{default:function(){return m}});var s=i(23166),a=i(97582),o=i(86424),n=i(89445),l=i(49053),d=i(19316),r=i(93838),h=i(50149);let c=class extends((0,n.Wr)(h.Z,o.tA.DialogMixin,o.tA.TransactionMixin)){constructor(...t){super(...t),(0,s.Z)(this,"setStakingInfo",void 0),(0,s.Z)(this,"getStakingInfo",void 0),(0,s.Z)(this,"getNominateNetworkFee",void 0),(0,s.Z)(this,"ValidatorsListMode",r.Ql),(0,s.Z)(this,"mode",r.Ql.USER),(0,s.Z)(this,"isSelectingEditingMode",!1),(0,s.Z)(this,"nominateNetworkFee",null)}async handleSelectedValidatorsChange(){this.withApi((async()=>{this.nominateNetworkFee=await this.getNominateNetworkFee()}))}resetMode(){this.visible&&(this.setMode(r.Ql.USER),this.selectValidators([]))}get networkFee(){return this.nominateNetworkFee??"0"}get title(){return this.hasTabs?this.t("soraStaking.info.validators"):this.t("soraStaking.validatorsDialog.title.edit")}get hasBackButton(){return this.isEditMode||this.isSelectingEditingMode}get isEditMode(){return[r.Ql.RECOMMENDED,r.Ql.SELECT].includes(this.mode)}get hasTabs(){return this.tabs.includes(this.mode)}get tabs(){return[r.Ql.USER,r.Ql.ALL]}get hasChanges(){const t=this.selectedValidators.map((t=>t.address)),e=this.stakingInfo?.myValidators;return!!e&&!(t.every((t=>e.includes(t)))&&t.length===e.length)}get tooManySelected(){return this.selectedValidators.length>this.maxNominations}get confirmText(){switch(this.mode){case r.Ql.USER:return this.t("soraStaking.validators.change");case r.Ql.RECOMMENDED:return this.isInsufficientXorForFee?this.t("insufficientBalanceText",{tokenSymbol:this.xor?.symbol??""}):this.hasChanges?this.t("soraStaking.validators.save"):this.t("soraStaking.validators.alreadyNominated");case r.Ql.SELECT:return this.isInsufficientXorForFee?this.t("insufficientBalanceText",{tokenSymbol:this.xor?.symbol??""}):this.hasChanges?this.tooManySelected?this.t("soraStaking.validators.tooManyValidators"):this.t("soraStaking.validators.selected",{selected:this.selectedValidators.length,total:this.validators.length}):this.t("soraStaking.validators.alreadyNominated");default:return""}}get showConfirmButton(){return this.mode!==r.Ql.ALL&&!this.isSelectingEditingMode}get confirmDisabled(){return!(!this.isInsufficientXorForFee||this.mode===r.Ql.USER)||(this.mode===r.Ql.RECOMMENDED?!this.hasChanges:this.mode===r.Ql.SELECT&&(0===this.selectedValidators.length||!this.hasChanges||this.tooManySelected))}handleBack(){this.isSelectingEditingMode?this.setMode(r.Ql.USER):this.isSelectingEditingMode=!0}async handleConfirm(){this.mode===r.Ql.USER?this.isSelectingEditingMode=!0:await this.withNotifications((async()=>{if(await this.nominate(),!this.stakingInfo)throw new Error("There is no staking info");this.setStakingInfo({...this.stakingInfo,myValidators:this.selectedValidators.map((t=>t.address))}),this.mode=r.Ql.USER}))}setMode(t){this.mode=t,this.isSelectingEditingMode=!1}handleRecommendedMode(){this.setMode(r.Ql.RECOMMENDED)}handleSelectedMode(){this.setMode(r.Ql.SELECT)}};(0,a.gn)([l.QF.staking.setStakingInfo],c.prototype,"setStakingInfo",void 0),(0,a.gn)([l.aD.staking.getStakingInfo],c.prototype,"getStakingInfo",void 0),(0,a.gn)([l.aD.staking.getNominateNetworkFee],c.prototype,"getNominateNetworkFee",void 0),(0,a.gn)([(0,n.RL)("selectedValidators")],c.prototype,"handleSelectedValidatorsChange",null),(0,a.gn)([(0,n.RL)("visible")],c.prototype,"resetMode",null),c=(0,a.gn)([(0,n.wA)({components:{DialogBase:o.wx.DialogBase,StakingHeader:(0,d.qU)(r.Jh.StakingHeader),ValidatorsList:(0,d.qU)(r.Jh.ValidatorsList),SelectValidatorsMode:(0,d.qU)(r.Jh.SelectValidatorsMode),InfoLine:o.wx.InfoLine}})],c);var g=c,m=(0,i(1001).Z)(g,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("dialog-base",{staticClass:"validators-dialog",attrs:{visible:t.isVisible},on:{"update:visible":function(e){t.isVisible=e}}},[e("staking-header",{staticClass:"header",attrs:{"has-back-button":t.hasBackButton},on:{back:t.handleBack}},[t._v(" "+t._s(t.title)+" ")]),t.isSelectingEditingMode?e("select-validators-mode",{on:{recommended:t.handleRecommendedMode,selected:t.handleSelectedMode}}):e("div",{staticClass:"content"},[t.hasTabs?e("s-tabs",{staticClass:"tabs",attrs:{type:"rounded"},model:{value:t.mode,callback:function(e){t.mode=e},expression:"mode"}},t._l(t.tabs,(function(i){return e("s-tab",{key:i,attrs:{label:t.t(`soraStaking.validatorsDialog.tabs.${i}`),name:i}})})),1):t._e(),e("validators-list",{attrs:{mode:t.mode},on:{"update:selected":t.selectValidators}}),t.showConfirmButton?e("div",{staticClass:"bottom"},[e("s-button",{staticClass:"confirm",attrs:{type:"primary",loading:t.parentLoading||t.loading,disabled:t.confirmDisabled},on:{click:t.handleConfirm}},[t._v(" "+t._s(t.confirmText)+" ")]),t.isEditMode?e("div",{staticClass:"info"},[e("info-line",{attrs:{label:t.t("networkFeeText"),"label-tooltip":t.t("networkFeeTooltipText"),value:t.networkFeeFormatted,"asset-symbol":t.xor?.symbol,"fiat-value":t.getFiatAmountByCodecString(t.networkFee),"is-formatted":""}})],1):t._e()],1):t._e()],1)],1)}),[],!1,null,"eda92af6",null).exports}}]);
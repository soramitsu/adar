"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[7955],{27955:function(t,s,i){i.r(s),i.d(s,{default:function(){return p}});var e=i(23166),a=i(97582),n=i(37981),c=i(86424),r=i(89445),o=i(89334),l=i(49053);let d=class extends((0,r.Wr)(o.Z,c.tA.LoadingMixin)){constructor(...t){super(...t),(0,e.Z)(this,"fees",void 0),(0,e.Z)(this,"attemptCounter",void 0),(0,e.Z)(this,"getUserKycAttempt",void 0)}get total(){return this.attemptCounter.totalFreeAttempts||"4"}get retryFee(){const t=n.FPNumber.DELIMITERS_CONFIG.decimal;if(this.fees.retry){const[s,i]=this.fees.retry.split(".");return`${s}${t}${i}`}return""}async handleConfirm(){this.$emit("confirm")}mounted(){this.getUserKycAttempt()}};(0,a.gn)([l.SB.soraCard.fees],d.prototype,"fees",void 0),(0,a.gn)([l.SB.soraCard.attemptCounter],d.prototype,"attemptCounter",void 0),(0,a.gn)([l.aD.soraCard.getUserKycAttempt],d.prototype,"getUserKycAttempt",void 0),d=(0,a.gn)([(0,r.wA)({components:{}})],d);var _=d,p=(0,i(1001).Z)(_,(function(){var t=this,s=t._self._c;t._self._setupProxy;return s("div",{directives:[{name:"loading",rawName:"v-loading",value:t.parentLoading,expression:"parentLoading"}]},[s("div",{staticClass:"tos__disclaimer"},[s("h4",{staticClass:"tos__disclaimer-header"},[t._v(t._s(t.t("card.attentionText")))]),s("p",{staticClass:"tos__disclaimer-paragraph"},[t._v(" "+t._s(t.t("card.guideline.paidAttemptDisclaimer",{count:t.total,cost:t.retryFee}))+" ")]),s("div",{staticClass:"tos__disclaimer-warning icon"},[s("s-icon",{attrs:{name:"notifications-alert-triangle-24",size:"28px"}})],1)]),s("div",{staticClass:"kyc-instructions"},[s("div",{staticClass:"kyc-instructions__text-info"},[s("div",{staticClass:"kyc-instructions__section"},[s("span",{staticClass:"kyc-instructions__number"},[t._v("1")]),s("div",{staticClass:"text"},[s("h4",{staticClass:"kyc-instructions__point"},[t._v(t._s(t.t("card.guideline.photoTitle")))]),s("span",{staticClass:"kyc-instructions__point-desc"},[t._v(t._s(t.t("card.guideline.photoDesc")))]),s("div",{staticClass:"line"})])]),s("div",{staticClass:"kyc-instructions__section"},[s("span",{staticClass:"kyc-instructions__number"},[t._v("2")]),s("div",{staticClass:"text"},[s("h4",{staticClass:"kyc-instructions__point"},[t._v(t._s(t.t("card.guideline.selfieTitle")))]),s("span",{staticClass:"kyc-instructions__point-desc"},[t._v(t._s(t.t("card.guideline.selfieDesc")))]),s("div",{staticClass:"line"})])]),s("div",{staticClass:"kyc-instructions__section"},[s("span",{staticClass:"kyc-instructions__number"},[t._v("3")]),s("div",{staticClass:"text"},[s("h4",{staticClass:"kyc-instructions__point"},[t._v(t._s(t.t("card.guideline.proofAddressTitle")))]),s("span",{staticClass:"kyc-instructions__point-desc"},[t._v(t._s(t.t("card.guideline.proofAddressDesc")))]),s("p",{staticClass:"kyc-instructions__point-note"},[t._v(t._s(t.t("card.guideline.proofAddressNote")))]),s("div",{staticClass:"line"})])]),s("div",{staticClass:"kyc-instructions__section"},[s("span",{staticClass:"kyc-instructions__number"},[t._v("4")]),s("div",{staticClass:"text"},[s("h4",{staticClass:"kyc-instructions__point"},[t._v(t._s(t.t("card.guideline.personalTitle")))]),s("span",{staticClass:"kyc-instructions__point-desc"},[t._v(t._s(t.t("card.guideline.personalDesc")))]),s("div",{staticClass:"line line--last"})])])])]),s("s-button",{staticClass:"sora-card__btn s-typography-button--large",attrs:{type:"primary"},on:{click:t.handleConfirm}},[s("span",{staticClass:"text"},[t._v(t._s(t.t("card.okReadyText")))])])],1)}),[],!1,null,"6286ecf5",null).exports}}]);
"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[3338],{3338:function(t,e,a){a.r(e),a.d(e,{default:function(){return y}});var s,o=a(23166),n=a(97582),i=a(86424),r=a(89445),c=a(66419),d=a(68282),u=a(69781),p=a(49053),l=a(25825),h=a(50961);!function(t){t.StartPage="StartPage",t.KYC="KYC",t.ConfirmationInfo="ConfirmationInfo",t.Dashboard="Dashboard",t.Maintenance="Maintenance"}(s||(s={}));let g=class extends((0,r.Wr)(i.tA.LoadingMixin,c.Z)){constructor(...t){super(...t),(0,o.Z)(this,"Step",s),(0,o.Z)(this,"attemptCounter",void 0),(0,o.Z)(this,"wantsToPassKycAgain",void 0),(0,o.Z)(this,"currentStatus",void 0),(0,o.Z)(this,"soraCardEnabled",void 0),(0,o.Z)(this,"setWillToPassKycAgain",void 0),(0,o.Z)(this,"getUserStatus",void 0),(0,o.Z)(this,"getUserKycAttempt",void 0),(0,o.Z)(this,"getUserIban",void 0),(0,o.Z)(this,"getFees",void 0),(0,o.Z)(this,"subscribeToTotalXorBalance",void 0),(0,o.Z)(this,"unsubscribeFromTotalXorBalance",void 0),(0,o.Z)(this,"subscribeOnList",void 0),(0,o.Z)(this,"subscribeOnUpdates",void 0),(0,o.Z)(this,"unsubscribe",void 0),(0,o.Z)(this,"loginAccount",void 0),(0,o.Z)(this,"source",void 0),(0,o.Z)(this,"step",null),(0,o.Z)(this,"getReadyPage",!1),(0,o.Z)(this,"isRedirectFromFearless",!0)}get isUnderMaintenance(){return this.step===s.Maintenance}get showIntro(){return[s.StartPage,s.Maintenance].includes(this.step)}get hasFreeAttempts(){return this.attemptCounter.hasFreeAttempts}get hasTokens(){const t=localStorage.getItem("PW-token"),e=localStorage.getItem("PW-refresh-token");return"undefined"!==e&&(!!t&&!!e)}openKycPage(t=!1){this.getReadyPage=t,this.step=s.KYC}openStartPage(){this.step=s.StartPage}openKycResultPage(){this.step=s.ConfirmationInfo}openDashboard(){this.step=s.Dashboard}logout(){this.openStartPage()}async checkKyc(){if(void 0!==this.soraCardEnabled&&null!==this.soraCardEnabled||await(0,h.RP)(),this.soraCardEnabled)return await this.getUserStatus(),await this.getUserKycAttempt(),this.currentStatus===l.$Z.Rejected&&this.wantsToPassKycAgain&&this.hasFreeAttempts?(this.getReadyPage=!0,void(this.step=s.KYC)):this.currentStatus===l.$Z.Accepted?(await this.getUserIban(),void(this.step=s.Dashboard)):void([l.$Z.Pending,l.$Z.Rejected].includes(this.currentStatus)?this.step=s.ConfirmationInfo:this.step=s.StartPage);this.step=s.Maintenance}async handleAccountChange(t){const e=(t??this.$route).query?.fearless,a=(t??this.$route).query?.name;e&&a&&i.hi.validateAddress(e)&&await this.loginAccount({address:e,name:a,source:i.WALLET_CONSTS.AppWallet.FearlessWallet}),this.subscribeToTotalXorBalance()}async created(){await this.withLoading((async()=>{await this.withParentLoading((async()=>{await Promise.all([this.subscribeOnList,this.subscribeOnUpdates].map((t=>t?.())))}))})),await this.withApi(this.handleAccountChange);const t=localStorage.getItem("PW-refresh-token");this.source===i.WALLET_CONSTS.AppWallet.FearlessWallet&&t&&window.injectedWeb3?.["fearless-wallet"]?.saveSoraCardToken?.(t)}async beforeRouteLeave(t,e,a){this.setWillToPassKycAgain(!1),await this.unsubscribe(),a()}async beforeRouteUpdate(t,e,a){await this.handleAccountChange(t),a()}async beforeDestroy(){await this.unsubscribeFromTotalXorBalance()}async mounted(){await this.$nextTick(),this.checkKyc(),this.getFees()}};(0,n.gn)([p.SB.soraCard.attemptCounter],g.prototype,"attemptCounter",void 0),(0,n.gn)([p.SB.soraCard.wantsToPassKycAgain],g.prototype,"wantsToPassKycAgain",void 0),(0,n.gn)([p.Yn.soraCard.currentStatus],g.prototype,"currentStatus",void 0),(0,n.gn)([p.Yn.settings.soraCardEnabled],g.prototype,"soraCardEnabled",void 0),(0,n.gn)([p.QF.soraCard.setWillToPassKycAgain],g.prototype,"setWillToPassKycAgain",void 0),(0,n.gn)([p.aD.soraCard.getUserStatus],g.prototype,"getUserStatus",void 0),(0,n.gn)([p.aD.soraCard.getUserKycAttempt],g.prototype,"getUserKycAttempt",void 0),(0,n.gn)([p.aD.soraCard.getUserIban],g.prototype,"getUserIban",void 0),(0,n.gn)([p.aD.soraCard.getFees],g.prototype,"getFees",void 0),(0,n.gn)([p.aD.soraCard.subscribeToTotalXorBalance],g.prototype,"subscribeToTotalXorBalance",void 0),(0,n.gn)([p.aD.soraCard.unsubscribeFromTotalXorBalance],g.prototype,"unsubscribeFromTotalXorBalance",void 0),(0,n.gn)([p.aD.pool.subscribeOnAccountLiquidityList],g.prototype,"subscribeOnList",void 0),(0,n.gn)([p.aD.pool.subscribeOnAccountLiquidityUpdates],g.prototype,"subscribeOnUpdates",void 0),(0,n.gn)([p.aD.pool.unsubscribeAccountLiquidityListAndUpdates],g.prototype,"unsubscribe",void 0),(0,n.gn)([p.aD.wallet.account.loginAccount],g.prototype,"loginAccount",void 0),(0,n.gn)([p.SB.wallet.account.source],g.prototype,"source",void 0),g=(0,n.gn)([(0,r.wA)({components:{SoraCardIntro:(0,u.kF)(d.z8.SoraCardIntroPage),SoraCardKyc:(0,u.kF)(d.z8.SoraCardKYC),ConfirmationInfo:(0,u.kF)(d.z8.ConfirmationInfo),Dashboard:(0,u.kF)(d.z8.Dashboard)}})],g);var b=g,y=(0,a(1001).Z)(b,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("div",{staticClass:"sora-card-wrapper"},[t.step===t.Step.ConfirmationInfo?e("confirmation-info",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],on:{"confirm-apply":t.openKycPage}}):t.showIntro?e("sora-card-intro",{attrs:{maintenance:t.isUnderMaintenance},on:{"confirm-apply":t.openKycPage}}):t.step===t.Step.KYC?e("sora-card-kyc",{attrs:{getReadyPage:t.getReadyPage},on:{"go-to-start":t.openStartPage,"go-to-kyc-result":t.openKycResultPage,"go-to-dashboard":t.openDashboard}}):t.step===t.Step.Dashboard?e("dashboard",{on:{logout:t.logout}}):t._e()],1)}),[],!1,null,null,null).exports}}]);
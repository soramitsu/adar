"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[5996],{75996:function(t,e,s){s.r(e),s.d(e,{default:function(){return h}});var i=s(23166),o=s(97582),r=s(57950),n=s(86424),a=s(89445),l=s(68282),c=s(49053),p=s(50961);let d=class extends((0,a.Wr)(n.tA.TranslationMixin,n.tA.LoadingMixin,n.tA.NotificationMixin,n.tA.FormattedAmountMixin)){constructor(...t){super(...t),(0,i.Z)(this,"alerts",void 0),(0,i.Z)(this,"allowTopUpAlert",void 0),(0,i.Z)(this,"isBrowserNotificationApiAvailable",void 0),(0,i.Z)(this,"whitelistIdsBySymbol",void 0),(0,i.Z)(this,"getAsset",void 0),(0,i.Z)(this,"removePriceAlert",void 0),(0,i.Z)(this,"setDepositNotifications",void 0),(0,i.Z)(this,"setBrowserNotifsPopupEnabled",void 0),(0,i.Z)(this,"setBrowserNotifsPopupBlocked",void 0),(0,i.Z)(this,"scrollKey",0),(0,i.Z)(this,"topUpNotifs",null)}get showCreateAlertBtn(){return this.alerts.length<n.WALLET_CONSTS.MAX_ALERTS_NUMBER}isNotificationsEnabledByUser(){if(!this.isBrowserNotificationApiAvailable)return this.showAppNotification(this.t("alerts.noSupportMsg"),"error"),!1;switch(Notification.permission){case"denied":return this.setBrowserNotifsPopupBlocked(!0),!1;case"default":return this.setBrowserNotifsPopupEnabled(!0),!1;default:return!0}}getDescription(t){return"drop"===t.type?this.t("alerts.onDropDesc",{token:t.token,price:`$${t.price}`}):this.t("alerts.onRaiseDesc",{token:t.token,price:`$${t.price}`})}getInfo(t){const e=new r.FPNumber(t.price),s=this.getAsset(this.whitelistIdsBySymbol[t.token]),i=r.FPNumber.fromCodecValue(this.getAssetFiatPrice(s)??l.m8),o=(0,p._Q)(e,i),n=(0,p.Zd)(o,2).toString(),a=(0,p.iL)(i);return`${n}% · ${this.t("alerts.currentPrice")}: $${a}`}async recenterDialog(){await this.$nextTick();const t=this.$parent?.$parent;t?.computeTop?.()}forceCloseAlertMenu(t){this.$refs["alertMenu"+t]?.[0]?.doClose?.()}getType(t){return t.once?this.t("alerts.once"):this.t("alerts.always")}handleCreateAlert(){this.isNotificationsEnabledByUser()&&this.$emit("create")}scrollForceUpdate(){this.scrollKey++}handleDeleteAlert(t){this.removePriceAlert(t),this.forceCloseAlertMenu(t),this.recenterDialog(),this.scrollForceUpdate()}handleEditAlert(t,e){this.$emit("edit-alert",{...t,position:e}),this.forceCloseAlertMenu(e)}handleTopUpNotifs(t){this.isNotificationsEnabledByUser(),this.setDepositNotifications(t)}mounted(){this.recenterDialog(),"granted"!==Notification.permission&&this.setDepositNotifications(!1),this.topUpNotifs=this.allowTopUpAlert}};(0,o.gn)([c.SB.wallet.settings.alerts],d.prototype,"alerts",void 0),(0,o.gn)([c.SB.wallet.settings.allowTopUpAlert],d.prototype,"allowTopUpAlert",void 0),(0,o.gn)([c.SB.settings.isBrowserNotificationApiAvailable],d.prototype,"isBrowserNotificationApiAvailable",void 0),(0,o.gn)([c.Yn.wallet.account.whitelistIdsBySymbol],d.prototype,"whitelistIdsBySymbol",void 0),(0,o.gn)([c.Yn.assets.assetDataByAddress],d.prototype,"getAsset",void 0),(0,o.gn)([c.QF.wallet.settings.removePriceAlert],d.prototype,"removePriceAlert",void 0),(0,o.gn)([c.QF.wallet.settings.setDepositNotifications],d.prototype,"setDepositNotifications",void 0),(0,o.gn)([c.QF.settings.setBrowserNotifsPopupEnabled],d.prototype,"setBrowserNotifsPopupEnabled",void 0),(0,o.gn)([c.QF.settings.setBrowserNotifsPopupBlocked],d.prototype,"setBrowserNotifsPopupBlocked",void 0),d=(0,o.gn)([(0,a.wA)({components:{AccountCard:n.wx.AccountCard,TokenLogo:n.wx.TokenLogo}})],d);var u=d,h=(0,s(1001).Z)(u,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("div",[e("s-scrollbar",{key:t.scrollKey,staticClass:"alerts-list-scrollbar"},[e("div",{staticClass:"alerts-list"},t._l(t.alerts,(function(s,i){return e("account-card",{directives:[{name:"button",rawName:"v-button"}],key:i,staticClass:"alerts-list__item",scopedSlots:t._u([{key:"avatar",fn:function(){return[e("token-logo",{attrs:{tokenSymbol:s.token}})]},proxy:!0},{key:"name",fn:function(){return[e("span",{staticClass:"condition"},[t._v(t._s(t.getDescription(s)))])]},proxy:!0},{key:"description",fn:function(){return[e("span",{staticClass:"current-price"},[t._v(t._s(t.getInfo(s)))])]},proxy:!0}],null,!0)},[e("div",{staticClass:"alerts-list__type"},[t._v(t._s(t.getType(s)))]),e("el-popover",{ref:"alertMenu"+i,refInFor:!0,attrs:{"popper-class":"settings-alert-popover",trigger:"click","visible-arrow":!1}},[e("div",{directives:[{name:"button",rawName:"v-button"}],staticClass:"settings-alert-option",on:{click:function(e){return t.handleEditAlert(s,i)}}},[e("s-icon",{attrs:{name:"el-icon-edit"}}),e("span",[t._v(t._s(t.t("alerts.edit")))])],1),e("div",{directives:[{name:"button",rawName:"v-button"}],staticClass:"settings-alert-option",on:{click:function(e){return t.handleDeleteAlert(i)}}},[e("s-icon",{attrs:{name:"el-icon-delete"}}),e("span",[t._v(t._s(t.t("alerts.delete")))])],1),e("div",{attrs:{slot:"reference"},slot:"reference"},[e("s-icon",{staticClass:"options-icon",attrs:{name:"basic-more-vertical-24"}})],1)])],1)})),1)]),t.alerts.length?e("s-divider"):t._e(),t.showCreateAlertBtn?e("div",{staticClass:"settings-alert-section"},[e("s-button",{staticClass:"el-dialog__close",attrs:{type:"action",icon:"plus-16",disabled:t.loading},on:{click:t.handleCreateAlert}}),e("span",{staticClass:"create"},[t._v(t._s(t.t("alerts.createBtn")))])],1):t._e(),e("div",{staticClass:"settings-alert-section"},[e("s-switch",{attrs:{disabled:t.loading},on:{change:t.handleTopUpNotifs},model:{value:t.topUpNotifs,callback:function(e){t.topUpNotifs=e},expression:"topUpNotifs"}}),e("span",[t._v(t._s(t.t("alerts.enableSwitch")))])],1)],1)}),[],!1,null,"86a5a3be",null).exports}}]);
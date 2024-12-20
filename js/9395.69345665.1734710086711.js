"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[9395],{49395:function(s,t,e){e.r(t),e.d(t,{default:function(){return p}});var o=e(23166),r=e(97582),i=e(86424),d=e(77606),a=e.n(d),n=e(89445),u=e(57478),k=e(89334),c=e(68282),g=e(19307),l=e(69781),h=e(49053);let B=class extends((0,n.Wr)(k.Z,i.tA.LoadingMixin,u.Z)){constructor(...s){super(...s),(0,o.Z)(this,"orderBooks",void 0),(0,o.Z)(this,"responsiveClass",void 0),(0,o.Z)(this,"orderBookEnabled",void 0),(0,o.Z)(this,"orderBookId",void 0),(0,o.Z)(this,"baseAsset",void 0),(0,o.Z)(this,"quoteAsset",void 0),(0,o.Z)(this,"setCurrentOrderBook",void 0),(0,o.Z)(this,"getOrderBooksInfo",void 0),(0,o.Z)(this,"subscribeToOrderBookStats",void 0),(0,o.Z)(this,"unsubscribeFromOrderBookStats",void 0),(0,o.Z)(this,"unsubscribeFromBidsAndAsks",void 0),(0,o.Z)(this,"settingsVisibility",!1)}updateSubscription(){this.subscribeToOrderBookStats(),this.firstRouteAddress&&this.secondRouteAddress&&this.baseAsset?.address!==this.firstRouteAddress&&this.updateRouteAfterSelectTokens(this.baseAsset,this.quoteAsset)}checkAvailability(s){!1===s&&(0,l.WF)(c.sn.Swap)}get isScreenHuge(){return this.responsiveClass===g.zB.HugeDesktop}async setData(s){a()(this.orderBooks)&&await this.getOrderBooksInfo();const t=Object.values(this.orderBooks).find((({orderBookId:t})=>t.base===s.firstAddress&&t.quote===s.secondAddress));t&&this.setCurrentOrderBook(t.orderBookId)}created(){this.withApi((async()=>{if(await this.getOrderBooksInfo(),this.orderBookId)return void this.updateRouteAfterSelectTokens(this.baseAsset,this.quoteAsset);const s=Object.values(this.orderBooks);if(this.parseCurrentRoute(),this.isValidRoute&&this.firstRouteAddress&&this.secondRouteAddress){const t=s.find((({orderBookId:s})=>s.base===this.firstRouteAddress&&s.quote===this.secondRouteAddress));t&&this.setCurrentOrderBook(t.orderBookId)}if(!this.orderBookId){const t=s[0];t&&(this.setCurrentOrderBook(t.orderBookId),this.updateRouteAfterSelectTokens(this.baseAsset,this.quoteAsset))}}))}beforeDestroy(){this.unsubscribeFromOrderBookStats(),this.unsubscribeFromBidsAndAsks()}};(0,r.gn)([h.SB.orderBook.orderBooks],B.prototype,"orderBooks",void 0),(0,r.gn)([h.SB.settings.screenBreakpointClass],B.prototype,"responsiveClass",void 0),(0,r.gn)([h.Yn.settings.orderBookEnabled],B.prototype,"orderBookEnabled",void 0),(0,r.gn)([h.Yn.orderBook.orderBookId],B.prototype,"orderBookId",void 0),(0,r.gn)([h.Yn.orderBook.baseAsset],B.prototype,"baseAsset",void 0),(0,r.gn)([h.Yn.orderBook.quoteAsset],B.prototype,"quoteAsset",void 0),(0,r.gn)([h.QF.orderBook.setCurrentOrderBook],B.prototype,"setCurrentOrderBook",void 0),(0,r.gn)([h.aD.orderBook.getOrderBooksInfo],B.prototype,"getOrderBooksInfo",void 0),(0,r.gn)([h.aD.orderBook.subscribeToOrderBookStats],B.prototype,"subscribeToOrderBookStats",void 0),(0,r.gn)([h.aD.orderBook.unsubscribeFromOrderBookStats],B.prototype,"unsubscribeFromOrderBookStats",void 0),(0,r.gn)([h.aD.orderBook.unsubscribeFromBidsAndAsks],B.prototype,"unsubscribeFromBidsAndAsks",void 0),(0,r.gn)([(0,n.RL)("orderBookId",{immediate:!0})],B.prototype,"updateSubscription",null),(0,r.gn)([(0,n.RL)("orderBookEnabled",{immediate:!0})],B.prototype,"checkAvailability",null),B=(0,r.gn)([(0,n.wA)({components:{BookWidget:(0,l.kF)(c.z8.BookWidget),SetLimitOrderWidget:(0,l.kF)(c.z8.SetLimitOrderWidget),HistoryOrderWidget:(0,l.kF)(c.z8.HistoryOrderWidget),BookChartsWidget:(0,l.kF)(c.z8.BookChartsWidget),MarketTradesWidget:(0,l.kF)(c.z8.MarketTradesWidget),CustomisePageWidget:(0,l.kF)(c.z8.CustomisePage)}})],B);var b=B,p=(0,e(1001).Z)(b,(function(){var s=this,t=s._self._c;s._self._setupProxy;return t("div",[s.isScreenHuge?t("div",{staticClass:"order-book-widgets--huge"},[t("div",{staticClass:"column-1"},[t("set-limit-order-widget",{staticClass:"set-widget"}),t("customise-page-widget",{staticClass:"setting-widget",attrs:{visible:s.settingsVisibility},on:{"update:visible":function(t){s.settingsVisibility=t}}})],1),t("div",{staticClass:"column-2"},[t("book-charts-widget",{staticClass:"chart-widget"}),t("history-order-widget",{staticClass:"history-widget"})],1),t("div",{staticClass:"column-3"},[t("book-widget",{staticClass:"book-widget"}),t("market-trades-widget",{staticClass:"trades-widget"})],1)]):t("div",{staticClass:"order-book-widgets"},[t("div",{staticClass:"column-2"},[t("set-limit-order-widget",{staticClass:"set-widget"}),t("book-widget",{staticClass:"book-widget"})],1),t("div",{staticClass:"column-3"},[t("history-order-widget",{staticClass:"history-widget"}),t("market-trades-widget",{staticClass:"trades-widget"})],1),t("div",{staticClass:"column-1"},[t("book-charts-widget",{staticClass:"chart-widget"})],1)])])}),[],!1,null,null,null).exports}}]);
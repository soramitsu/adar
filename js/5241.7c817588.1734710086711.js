"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[5241,1459],{92483:function(t,e,a){a.r(e),a.d(e,{default:function(){return x}});var s=a(23166),i=a(97582),n=a(37981),r=a(69826),o=a(86424),l=a(27484),d=a.n(l),c=a(89445),u=a(36113),m=a(27206),h=a(68282),f=a(94393),b=a(69781),g=a(49053),p=a(50961);const v="0";let y=class extends((0,c.Wr)(o.tA.LoadingMixin,o.tA.FormattedAmountMixin,u.Z)){constructor(...t){super(...t),(0,s.Z)(this,"xor",r.XOR),(0,s.Z)(this,"blockDuration",6e3),(0,s.Z)(this,"defaultBurned",{chameleon:n.FPNumber.ZERO,kensetsu:n.FPNumber.ZERO}),(0,s.Z)(this,"campaignsObj",{chameleon:{id:"chameleon",title:"Reserve KARMA by burning your XOR",description:"Burn 100M XOR (permanently remove from your wallet) on SORA for KARMA in a fair launch; KARMA token is a reward token for LPs who provide liquidity to Chameleon liquidity pools. 22 days only (till Jun 6 2024).",link:"https://medium.com/@shibarimoto/earn-karma-with-a-sora-chameleon-01b25c12fd49",receivedAsset:{symbol:"KARMA",address:"",name:"Chameleon",decimals:18},rate:1e8,max:1e3,from:15739737,fromTimestamp:17157915e5,to:16056666,toTimestamp:1717693074e3,disabledText:"Already distributed"},kensetsu:{id:"kensetsu",title:"Reserve KEN by burning your XOR",description:"Burn 1M XOR (permanently remove from your wallet) on SORA for KEN in a fair launch of Kensetsu; KEN incentivizes liquidity and is deflationary token with a status symbol appeal. 30 days only (till Mar 20 2024).",link:"https://medium.com/@shibarimoto/kensetsu-ken-356077ebee78",receivedAsset:r.KEN,rate:1e6,max:1e4,from:14464e3,fromTimestamp:170809728e4,to:14939200,toTimestamp:1710949772883,disabledText:"Already distributed"}}),(0,s.Z)(this,"campaigns",Object.values(this.campaignsObj)),(0,s.Z)(this,"interval",null),(0,s.Z)(this,"totalXorBurned",{...this.defaultBurned}),(0,s.Z)(this,"accountXorBurned",{...this.defaultBurned}),(0,s.Z)(this,"timeLeftFormatted",{chameleon:"30D",kensetsu:"30D"}),(0,s.Z)(this,"ended",{chameleon:!1,kensetsu:!1}),(0,s.Z)(this,"burnDialogVisible",!1),(0,s.Z)(this,"selectedReceivedAsset",this.campaigns[0].receivedAsset),(0,s.Z)(this,"selectedBurnedAsset",r.XOR),(0,s.Z)(this,"selectedRate",this.campaigns[0].rate),(0,s.Z)(this,"selectedMax",this.campaigns[0].max),(0,s.Z)(this,"blockNumber",void 0),(0,s.Z)(this,"soraNetwork",void 0)}get minBlock(){return Math.min(...this.campaigns.map((t=>t.from)))}get maxBlock(){return Math.max(...this.campaigns.map((t=>t.to)))}getFormattedXor(t){return this.getFPNumber(t).toLocaleString()}getFormattedXorFiat(t){return this.getFiatAmountByString(`${t}`,this.xor)}getFormattedTotalXorBurned(t){return this.totalXorBurned[t]?.toLocaleString()??v}getFormattedTotalReserved(t,e){return this.totalXorBurned[t]?.div(e).toLocaleString(3)??v}getFormattedAccountXorBurned(t){return this.accountXorBurned[t]?.toLocaleString()??v}getFormattedAccountReserved(t,e){return this.accountXorBurned[t]?.div(e).toLocaleString(3)??v}calcCountdown(){for(const t of this.campaigns){const e=(t.to-this.blockNumber)*this.blockDuration;if(e<=0){this.timeLeftFormatted[t.id]="0D 0H 0M",this.ended[t.id]=!0;continue}const a=d().duration(e);this.timeLeftFormatted[t.id]=a.format("D[D] HH[H] mm[M]")}}async fetchData(){const t=this.minBlock,e=this.maxBlock,a=this.soraAddress,s=await(0,f.r)(t,e),i={...this.defaultBurned},r={...this.defaultBurned};for(const t of this.campaigns){const e=s.filter((({blockHeight:e})=>e>=t.from&&e<=t.to)).reduce(((t,{address:e,amount:a})=>(t[e]||(t[e]=n.FPNumber.ZERO),t[e]=t[e].add(a),t)),{}),o=new n.FPNumber(t.rate);Object.entries(e).forEach((([e,s])=>{s.gte(o)&&(r[t.id]=r[t.id].add(s),a===e&&(i[t.id]=i[t.id].add(s)))}))}this.accountXorBurned={...i},this.totalXorBurned={...r}}async fetchDataAndCalcCountdown(){await this.withLoading((async()=>{this.calcCountdown(),await this.fetchData()}))}handleBurnClick(t){const e=this.campaignsObj[t];this.selectedReceivedAsset=e.receivedAsset,this.selectedRate=e.rate,this.selectedMax=e.max,this.burnDialogVisible=!0}async mounted(){await this.withApi((async()=>{(this.soraNetwork??await(0,p.RP)())!==o.WALLET_CONSTS.SoraNetwork.Prod&&(this.campaignsObj.chameleon.from=11e3,this.campaignsObj.chameleon.to=1e6,this.campaignsObj.kensetsu.from=0,this.campaignsObj.kensetsu.to=1e4),await this.fetchDataAndCalcCountdown(),this.interval=setInterval(this.fetchDataAndCalcCountdown,6e4)}))}handleBurnConfirm(t){t&&(this.loading=!0)}beforeUnmount(){this.interval&&clearInterval(this.interval)}};(0,i.gn)([g.SB.settings.blockNumber],y.prototype,"blockNumber",void 0),(0,i.gn)([g.SB.wallet.settings.soraNetwork],y.prototype,"soraNetwork",void 0),y=(0,i.gn)([(0,c.wA)({components:{GenericPageHeader:(0,b.kF)(h.z8.GenericPageHeader),InfoLine:o.wx.InfoLine,ExternalLink:o.wx.ExternalLink,BurnDialog:m.default}})],y);var k=y,x=(0,a(1001).Z)(k,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("div",{staticClass:"burn-container s-flex-column"},[e("s-row",{attrs:{gutter:16}},t._l(t.campaigns,(function({id:a,title:s,description:i,link:n,receivedAsset:r,rate:o,disabledText:l}){return e("s-col",{key:a,staticClass:"burn-column s-flex",attrs:{xs:12,sm:12,md:12,lg:6,xl:6}},[e("s-form",{directives:[{name:"loading",rawName:"v-loading",value:t.parentLoading,expression:"parentLoading"}],staticClass:"container container--burn el-form--actions",class:{disabled:t.ended[a]},attrs:{"show-message":!1}},[e("generic-page-header",{staticClass:"page-header--burn",attrs:{title:s}}),e("p",{staticClass:"description centered p4"},[t._v(" "+t._s(i)+" ")]),e("external-link",{staticClass:"p4 link",attrs:{title:"Read more",href:n}}),e("info-line",{attrs:{label:`1 ${r.symbol}`,value:t.getFormattedXor(o),"asset-symbol":t.xor.symbol,"fiat-value":t.getFormattedXorFiat(o),"is-formatted":""}}),e("info-line",{attrs:{label:"Time left",value:t.timeLeftFormatted[a]}}),e("info-line",{attrs:{label:`Your reserved ${r.symbol} tokens`,value:t.getFormattedAccountReserved(a,o),"asset-symbol":r.symbol,"is-formatted":"","value-can-be-hidden":""}}),e("info-line",{attrs:{label:"Your burned XOR tokens",value:t.getFormattedAccountXorBurned(a),"asset-symbol":t.xor.symbol,"is-formatted":"","value-can-be-hidden":""}}),e("div",{staticClass:"info-card-container s-flex"},[e("div",{staticClass:"info-card-item s-flex-column"},[e("span",{staticClass:"info-card-title"},[t._v("TOTAL XOR BURNED")]),e("span",{staticClass:"info-card-value"},[t._v(" "+t._s(t.getFormattedTotalXorBurned(a))+" ")])]),e("div",{staticClass:"info-card-item s-flex-column"},[e("span",{staticClass:"info-card-title"},[t._v("TOTAL "+t._s(r.symbol)+" RESERVED")]),e("span",{staticClass:"info-card-value"},[t._v(" "+t._s(t.getFormattedTotalReserved(a,o))+" ")])])]),t.isLoggedIn?e("s-button",{staticClass:"action-button s-typography-button--large",attrs:{type:"primary",disabled:t.ended[a],loading:t.parentLoading||!t.ended[a]&&t.loading},on:{click:function(e){return t.handleBurnClick(a)}}},[t.ended[a]?[t._v(t._s(l??"TIME IS OVER"))]:[t._v("BURN MY XOR")]],2):e("s-button",{staticClass:"action-button s-typography-button--large",attrs:{type:"primary"},on:{click:t.connectSoraWallet}},[t._v(" "+t._s(t.t("connectWalletText"))+" ")])],1)],1)})),1),e("s-card",{staticClass:"burn-info",attrs:{"border-radius":"small",shadow:"always",size:"medium",pressed:""}},[e("div",{staticClass:"burn-info__content s-flex-column"},[e("div",{staticClass:"burn-info__desc s-flex"},[e("p",{staticClass:"description p4"},[t._v(" The 'Burn XOR' is a community-proposed initiative. It’s not officially endorsed by any centralized authority or organization. Participation and interaction with the 'Burn XOR' should be considered with understanding of its community-driven nature. ")]),e("div",{staticClass:"burn-info__badge"},[e("s-icon",{staticClass:"burn-info__icon",attrs:{name:"notifications-alert-triangle-24",size:"24"}})],1)])])]),e("burn-dialog",{attrs:{visible:t.burnDialogVisible,"received-asset":t.selectedReceivedAsset,"burned-asset":t.selectedBurnedAsset,rate:t.selectedRate,max:t.selectedMax},on:{"update:visible":function(e){t.burnDialogVisible=e},confirm:t.handleBurnConfirm}})],1)}),[],!1,null,"12a55447",null).exports}}]);
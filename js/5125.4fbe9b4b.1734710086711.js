"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[5125],{75125:function(t,i,e){e.r(i),e.d(i,{default:function(){return p}});var s=e(23166),l=e(97582),a=e(86424),r=e(89445),o=e(68282),n=e(69781),c=e(46697),v=e(19316),d=e(93838),u=e(50149);let f=class extends((0,r.Wr)(u.Z,a.tA.DialogMixin,a.tA.LoadingMixin)){constructor(...t){super(...t),(0,s.Z)(this,"filter",void 0),(0,s.Z)(this,"localFilter",{...d.mE})}get filterData(){return this.t("soraStaking.validatorsFilterDialog.filters")}onVisibleChange(){this.isVisible&&(this.localFilter={...this.filter})}save(){this.$emit("save",this.localFilter)}resetAll(){this.localFilter={...d.mE}}};(0,l.gn)([(0,r.fI)({type:Object,required:!0})],f.prototype,"filter",void 0),(0,l.gn)([(0,r.RL)("isVisible",{deep:!0})],f.prototype,"onVisibleChange",null),f=(0,l.gn)([(0,r.wA)({components:{DialogTitle:(0,v.qU)(c.o.DialogTitle),TokenInput:(0,n.kF)(o.z8.TokenInput),DialogBase:a.wx.DialogBase,InfoLine:a.wx.InfoLine}})],f);var g=f,p=(0,e(1001).Z)(g,(function(){var t=this,i=t._self._c;t._self._setupProxy;return i("dialog-base",{staticClass:"validators-filter-dialog",attrs:{visible:t.isVisible},on:{"update:visible":function(i){t.isVisible=i}}},[i("div",{staticClass:"filter-container"},[i("h1",{staticClass:"title"},[t._v(" "+t._s(t.t("soraStaking.validatorsFilterDialog.title"))+" ")]),i("div",{staticClass:"filter"},t._l(t.filterData,(function(e,s){return i("div",{key:e.name,staticClass:"filter-item"},[i("div",{staticClass:"filter-item-header"},[i("div",{staticClass:"filter-item-label"},[t._v(t._s(e.name))]),i("s-switch",{staticClass:"filter-item-switch",class:{"is-active":t.localFilter[s]},model:{value:t.localFilter[s],callback:function(i){t.$set(t.localFilter,s,i)},expression:"localFilter[key]"}})],1),i("div",{staticClass:"filter-item-description"},[t._v(t._s(e.description))])])})),0),i("s-button",{staticClass:"save-button",attrs:{type:"primary"},on:{click:t.save}},[t._v(" "+t._s(t.t("soraStaking.validatorsFilterDialog.save"))+" ")]),i("div",{directives:[{name:"button",rawName:"v-button"}],staticClass:"reset-all",on:{click:t.resetAll}},[t._v(" "+t._s(t.t("soraStaking.validatorsFilterDialog.reset"))+" ")])],1)])}),[],!1,null,"64e47305",null).exports}}]);
"use strict";(self.webpackChunkadar=self.webpackChunkadar||[]).push([[6776],{46776:function(t,e,i){i.r(e),i.d(e,{default:function(){return p}});var o=i(23166),s=i(97582),n=i(25387),r=i.n(n),l=i(89445),a=i(50961);let d=class extends l.w3{constructor(...t){super(...t),(0,o.Z)(this,"id",void 0),(0,o.Z)(this,"primaryTitle",void 0),(0,o.Z)(this,"title",void 0),(0,o.Z)(this,"tooltip",void 0),(0,o.Z)(this,"full",void 0),(0,o.Z)(this,"delimeter",void 0),(0,o.Z)(this,"extensive",void 0),(0,o.Z)(this,"flat",void 0),(0,o.Z)(this,"loading",void 0),(0,o.Z)(this,"onResize",void 0),(0,o.Z)(this,"container",void 0),(0,o.Z)(this,"content",void 0),(0,o.Z)(this,"observer",null),(0,o.Z)(this,"handleContentResize",(0,a._1)(this.onContentResize,300,{leading:!1})),(0,o.Z)(this,"size",{width:0,height:0}),(0,o.Z)(this,"capitalize",a.kC)}get hasHeader(){return!!this.title||!!this.$slots.title}get hasContent(){return!!this.$slots.default}get shadow(){return this.flat?"never":"always"}mounted(){this.createContentObserver(),this.updateSize(this.getWidgetSize())}beforeDestroy(){this.destroyContentObserver()}createContentObserver(){this.hasContent&&(this.observer=new ResizeObserver(this.handleContentResize),this.observer.observe(this.content))}destroyContentObserver(){this.observer?.disconnect(),this.observer=null}getWidgetSize(){return this.getElementSize(this.container.$el)}getWidgetContentSize(){return this.getElementSize(this.content)}getElementSize(t){const{width:e,height:i}=t.getBoundingClientRect();return{width:Math.floor(e),height:Math.floor(i)}}updateSize(t){this.size=t}onContentResize(){const t=this.getWidgetContentSize();r()(t)(this.size)||(this.onResize(this.id,this.getWidgetSize()),this.updateSize(this.getWidgetContentSize()))}};(0,s.gn)([(0,l.fI)({default:"",type:String})],d.prototype,"id",void 0),(0,s.gn)([(0,l.fI)({default:!1,type:Boolean})],d.prototype,"primaryTitle",void 0),(0,s.gn)([(0,l.fI)({default:"",type:String})],d.prototype,"title",void 0),(0,s.gn)([(0,l.fI)({default:"",type:String})],d.prototype,"tooltip",void 0),(0,s.gn)([(0,l.fI)({default:!1,type:Boolean})],d.prototype,"full",void 0),(0,s.gn)([(0,l.fI)({default:!1,type:Boolean})],d.prototype,"delimeter",void 0),(0,s.gn)([(0,l.fI)({default:!1,type:Boolean})],d.prototype,"extensive",void 0),(0,s.gn)([(0,l.fI)({default:!1,type:Boolean})],d.prototype,"flat",void 0),(0,s.gn)([(0,l.fI)({default:!1,type:Boolean})],d.prototype,"loading",void 0),(0,s.gn)([(0,l.fI)({default:()=>{},type:Function})],d.prototype,"onResize",void 0),(0,s.gn)([(0,l.Rl)("container")],d.prototype,"container",void 0),(0,s.gn)([(0,l.Rl)("content")],d.prototype,"content",void 0),d=(0,s.gn)([l.wA],d);var h=d,p=(0,i(1001).Z)(h,(function(){var t=this,e=t._self._c;t._self._setupProxy;return e("s-card",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],ref:"container",class:["base-widget",{delimeter:t.delimeter,full:t.full,flat:t.flat}],attrs:{size:"big",primary:"",shadow:t.shadow},scopedSlots:t._u([t.hasHeader?{key:"header",fn:function(){return[e("div",{class:["base-widget-block","base-widget-header",{"with-content":t.hasContent}]},[e("div",{class:["base-widget-block","base-widget-title",{primary:t.primaryTitle}]},[t._t("title",(function(){return[t.title?e("span",[t._v(t._s(t.capitalize(t.title)))]):t._e(),t.tooltip?e("s-tooltip",{attrs:{"border-radius":"mini",content:t.tooltip}},[e("s-icon",{attrs:{name:"info-16",size:"14px"}})],1):t._e()]}))],2),t.$slots.filters?e("div",{staticClass:"base-widget-block base-widget-filters"},[t._t("filters")],2):t._e(),t.$slots.types?e("div",{staticClass:"base-widget-block base-widget-types"},[t._t("types")],2):t._e()])]},proxy:!0}:null],null,!0)},[t.hasContent?e("div",{ref:"content",class:["base-widget-content",{extensive:t.extensive}]},[t._t("default")],2):t._e()])}),[],!1,null,"5056a063",null).exports}}]);
(()=>{var yt="2.11.1";var O=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._config={},this._hass=null}set hass(e){this._hass=e,this.render()}setConfig(e){if(!e.entity)throw new Error("Please define an entity");this._config=e,this.render()}getEntity(){return!this._hass||!this._config.entity?null:this._hass.states[this._config.entity]}getRelatedEntity(e,t=""){if(!this._hass||!this._config.entity)return null;let i=this._config.entity.replace(/^[^.]+\./,"").replace(/_?(text|display|gif_url)$/i,""),s=`${e}.${i}${t}`;if(this._hass.states[s])return this._hass.states[s];let r=Object.keys(this._hass.states).filter(n=>{if(!n.startsWith(`${e}.`))return!1;let a=n.replace(/^[^.]+\./,"");return a.includes(i)||i.includes(a.replace(t,""))});if(t){let n=r.find(a=>a.endsWith(t));if(n)return this._hass.states[n]}else{let n=r.sort((a,o)=>a.length-o.length);if(n.length>0)return this._hass.states[n[0]]}return r.length>0?this._hass.states[r[0]]:null}async callService(e,t,i={}){if(this._hass)try{await this._hass.callService(e,t,i)}catch(s){console.error(`iPIXEL service call failed: ${e}.${t}`,s)}}getResolution(){let e=this.getRelatedEntity("sensor","_width")||this._hass?.states["sensor.display_width"],t=this.getRelatedEntity("sensor","_height")||this._hass?.states["sensor.display_height"];if(e&&t){let i=parseInt(e.state),s=parseInt(t.state);if(!isNaN(i)&&!isNaN(s)&&i>0&&s>0)return[i,s]}return[64,16]}isOn(){return this.getRelatedEntity("switch")?.state==="on"}hexToRgb(e){let t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]:[255,255,255]}render(){}getCardSize(){return 2}};var P=`
  :host {
    --ipixel-primary: var(--primary-color, #03a9f4);
    --ipixel-accent: var(--accent-color, #ff9800);
    --ipixel-text: var(--primary-text-color, #fff);
    --ipixel-bg: var(--ha-card-background, #1c1c1c);
    --ipixel-border: var(--divider-color, #333);
  }

  .card-content { padding: 16px; }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .card-title {
    font-size: 1.1em;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4caf50;
  }
  .status-dot.off { background: #f44336; }
  .status-dot.unavailable { background: #9e9e9e; }

  .section-title {
    font-size: 0.85em;
    font-weight: 500;
    margin-bottom: 8px;
    opacity: 0.8;
  }

  .control-row { margin-bottom: 12px; }

  /* Buttons */
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85em;
    font-weight: 500;
    transition: all 0.2s;
  }
  .btn-primary { background: var(--ipixel-primary); color: #fff; }
  .btn-primary:hover { opacity: 0.9; }
  .btn-secondary {
    background: rgba(255,255,255,0.1);
    color: var(--ipixel-text);
    border: 1px solid var(--ipixel-border);
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.15); }
  .btn-danger { background: #f44336; color: #fff; }
  .btn-success { background: #4caf50; color: #fff; }

  .icon-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.1);
    border: 1px solid var(--ipixel-border);
    border-radius: 6px;
    cursor: pointer;
    color: inherit;
  }
  .icon-btn:hover { background: rgba(255,255,255,0.15); }
  .icon-btn.active {
    background: rgba(3, 169, 244, 0.3);
    border-color: var(--ipixel-primary);
  }
  .icon-btn svg { width: 20px; height: 20px; fill: currentColor; }

  /* Slider */
  .slider-row { display: flex; align-items: center; gap: 12px; }
  .slider-label { min-width: 70px; font-size: 0.85em; }
  .slider {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(to right,
      var(--ipixel-primary) 0%,
      var(--ipixel-primary) var(--value, 50%),
      rgba(255,255,255,0.25) var(--value, 50%),
      rgba(255,255,255,0.25) 100%);
    outline: none;
    cursor: pointer;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid var(--ipixel-primary);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid var(--ipixel-primary);
    cursor: pointer;
  }
  .slider-value { min-width: 40px; text-align: right; font-size: 0.85em; font-weight: 500; }

  /* Dropdown */
  .dropdown {
    width: 100%;
    padding: 8px 12px;
    background: rgba(255,255,255,0.08);
    border: 1px solid var(--ipixel-border);
    border-radius: 6px;
    color: inherit;
    font-size: 0.9em;
    cursor: pointer;
  }

  /* Input */
  .text-input {
    width: 100%;
    padding: 10px 12px;
    background: rgba(255,255,255,0.08);
    border: 1px solid var(--ipixel-border);
    border-radius: 6px;
    color: inherit;
    font-size: 0.9em;
    box-sizing: border-box;
  }
  .text-input:focus { outline: none; border-color: var(--ipixel-primary); }

  /* Button Grid */
  .button-grid { display: grid; gap: 8px; }
  .button-grid-4 { grid-template-columns: repeat(4, 1fr); }
  .button-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .button-grid-2 { grid-template-columns: repeat(2, 1fr); }

  /* Mode buttons */
  .mode-btn {
    padding: 10px 8px;
    background: rgba(255,255,255,0.08);
    border: 1px solid var(--ipixel-border);
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
    font-size: 0.8em;
    color: inherit;
    transition: all 0.2s;
  }
  .mode-btn:hover { background: rgba(255,255,255,0.12); }
  .mode-btn.active { background: rgba(3, 169, 244, 0.25); border-color: var(--ipixel-primary); }

  /* Color picker */
  .color-row { display: flex; align-items: center; gap: 12px; }
  .color-picker {
    width: 40px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--ipixel-border);
    border-radius: 4px;
    cursor: pointer;
    background: none;
  }

  /* List items */
  .list-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background: rgba(255,255,255,0.05);
    border-radius: 6px;
    margin-bottom: 8px;
    gap: 12px;
  }
  .list-item:last-child { margin-bottom: 0; }
  .list-item-info { flex: 1; }
  .list-item-name { font-weight: 500; font-size: 0.9em; }
  .list-item-meta { font-size: 0.75em; opacity: 0.6; margin-top: 2px; }
  .list-item-actions { display: flex; gap: 4px; }

  /* Empty state */
  .empty-state { text-align: center; padding: 24px; opacity: 0.6; font-size: 0.9em; }

  @media (max-width: 400px) {
    .button-grid-4 { grid-template-columns: repeat(2, 1fr); }
  }
`;var q={A:[124,18,17,18,124],B:[127,73,73,73,54],C:[62,65,65,65,34],D:[127,65,65,34,28],E:[127,73,73,73,65],F:[127,9,9,9,1],G:[62,65,73,73,122],H:[127,8,8,8,127],I:[0,65,127,65,0],J:[32,64,65,63,1],K:[127,8,20,34,65],L:[127,64,64,64,64],M:[127,2,12,2,127],N:[127,4,8,16,127],O:[62,65,65,65,62],P:[127,9,9,9,6],Q:[62,65,81,33,94],R:[127,9,25,41,70],S:[70,73,73,73,49],T:[1,1,127,1,1],U:[63,64,64,64,63],V:[31,32,64,32,31],W:[63,64,56,64,63],X:[99,20,8,20,99],Y:[7,8,112,8,7],Z:[97,81,73,69,67],a:[32,84,84,84,120],b:[127,72,68,68,56],c:[56,68,68,68,32],d:[56,68,68,72,127],e:[56,84,84,84,24],f:[8,126,9,1,2],g:[12,82,82,82,62],h:[127,8,4,4,120],i:[0,68,125,64,0],j:[32,64,68,61,0],k:[127,16,40,68,0],l:[0,65,127,64,0],m:[124,4,24,4,120],n:[124,8,4,4,120],o:[56,68,68,68,56],p:[124,20,20,20,8],q:[8,20,20,24,124],r:[124,8,4,4,8],s:[72,84,84,84,32],t:[4,63,68,64,32],u:[60,64,64,32,124],v:[28,32,64,32,28],w:[60,64,48,64,60],x:[68,40,16,40,68],y:[12,80,80,80,60],z:[68,100,84,76,68],0:[62,81,73,69,62],1:[0,66,127,64,0],2:[66,97,81,73,70],3:[33,65,69,75,49],4:[24,20,18,127,16],5:[39,69,69,69,57],6:[60,74,73,73,48],7:[1,113,9,5,3],8:[54,73,73,73,54],9:[6,73,73,41,30]," ":[0,0,0,0,0],".":[0,96,96,0,0],",":[0,128,96,0,0],":":[0,54,54,0,0],";":[0,128,54,0,0],"!":[0,0,95,0,0],"?":[2,1,81,9,6],"-":[8,8,8,8,8],"+":[8,8,62,8,8],"=":[20,20,20,20,20],_:[64,64,64,64,64],"/":[32,16,8,4,2],"\\":[2,4,8,16,32],"(":[0,28,34,65,0],")":[0,65,34,28,0],"[":[0,127,65,65,0],"]":[0,65,65,127,0],"<":[8,20,34,65,0],">":[0,65,34,20,8],"*":[20,8,62,8,20],"#":[20,127,20,127,20],"@":[62,65,93,85,30],"&":[54,73,85,34,80],"%":[35,19,8,100,98],$:[18,42,127,42,36],"'":[0,0,7,0,0],'"':[0,7,0,7,0],"`":[0,1,2,0,0],"^":[4,2,1,2,4],"~":[8,4,8,16,8]};function ht(d,e,t,i="#ff6600",s="#111"){let r=[],o=Math.floor((t-7)/2);for(let f=0;f<t;f++)for(let p=0;p<e;p++)r.push(s);let l=d.length*6-1,h=Math.max(1,Math.floor((e-l)/2));for(let f of d){let p=q[f]||q[" "];for(let x=0;x<5;x++)for(let b=0;b<7;b++){let m=p[x]>>b&1,u=h+x,v=o+b;u>=0&&u<e&&v<t&&v>=0&&(r[v*e+u]=m?i:s)}h+=6}return r}function _t(d,e,t,i="#ff6600",s="#111"){let a=Math.floor((t-7)/2),o=d.length*6,l=e+o+e,c=[];for(let f=0;f<t;f++)for(let p=0;p<l;p++)c.push(s);let h=e;for(let f of d){let p=q[f]||q[" "];for(let x=0;x<5;x++)for(let b=0;b<7;b++){let m=p[x]>>b&1,u=h+x,v=a+b;u>=0&&u<l&&v<t&&v>=0&&(c[v*l+u]=m?i:s)}h+=6}return{pixels:c,width:l}}var wt={VCR_OSD_MONO:{16:{font_size:16,offset:[0,0],pixel_threshold:70,var_width:!0},24:{font_size:24,offset:[0,0],pixel_threshold:70,var_width:!0},32:{font_size:28,offset:[-1,2],pixel_threshold:30,var_width:!1}},CUSONG:{16:{font_size:16,offset:[0,-1],pixel_threshold:70,var_width:!1},24:{font_size:24,offset:[0,0],pixel_threshold:70,var_width:!1},32:{font_size:32,offset:[0,0],pixel_threshold:70,var_width:!1}}},X={},Y={};function Nt(d){return window.location.pathname.includes("preview.html")||window.location.port==="8080"?`./fonts/${d}.ttf`:`/hacsfiles/ipixel_color/fonts/${d}.ttf`}async function H(d){return X[d]===!0?!0:X[d]===!1?!1:(Y[d]||(Y[d]=(async()=>{let e=Nt(d);try{let i=await new FontFace(d,`url(${e})`).load();return document.fonts.add(i),X[d]=!0,console.log(`iPIXEL: Font ${d} loaded successfully`),!0}catch(t){return console.warn(`iPIXEL: Failed to load font ${d}:`,t),X[d]=!1,!1}})()),Y[d])}function J(d){return X[d]===!0}function Et(d){return d<=18?16:d<=28?24:32}function vt(d){let e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(d);return e?{r:parseInt(e[1],16),g:parseInt(e[2],16),b:parseInt(e[3],16)}:{r:0,g:0,b:0}}function St(d,e,t,i="#ff6600",s="#111",r="VCR_OSD_MONO"){let n=wt[r];if(!n)return console.warn(`iPIXEL: Unknown font: ${r}`),null;if(!J(r))return H(r),null;let a=Et(t),o=n[a],l=document.createElement("canvas");l.width=e,l.height=t;let c=l.getContext("2d");if(c.imageSmoothingEnabled=!1,c.fillStyle=s,c.fillRect(0,0,e,t),!d||d.trim()===""){let g=[];for(let _=0;_<e*t;_++)g.push(s);return g}c.font=`${o.font_size}px "${r}"`,c.fillStyle=i,c.textBaseline="top";let f=c.measureText(d).width,p=Math.floor((e-f)/2)+o.offset[0],x=Math.floor((t-o.font_size)/2)+o.offset[1];c.fillText(d,p,x);let b=c.getImageData(0,0,e,t),m=[],u=vt(i),v=vt(s);for(let g=0;g<b.data.length;g+=4){let _=b.data[g],y=b.data[g+1],S=b.data[g+2];(_+y+S)/3>=o.pixel_threshold?m.push(i):m.push(s)}return m}function It(d,e,t,i="#ff6600",s="#111",r="VCR_OSD_MONO"){let n=wt[r];if(!n)return null;if(!J(r))return H(r),null;let a=Et(t),o=n[a],c=document.createElement("canvas").getContext("2d");c.font=`${o.font_size}px "${r}"`;let h=Math.ceil(c.measureText(d).width),f=e+h+e,p=document.createElement("canvas");p.width=f,p.height=t;let x=p.getContext("2d");if(x.imageSmoothingEnabled=!1,x.fillStyle=s,x.fillRect(0,0,f,t),!d||d.trim()===""){let g=[];for(let _=0;_<f*t;_++)g.push(s);return{pixels:g,width:f}}x.font=`${o.font_size}px "${r}"`,x.fillStyle=i,x.textBaseline="top";let b=e+o.offset[0],m=Math.floor((t-o.font_size)/2)+o.offset[1];x.fillText(d,b,m);let u=x.getImageData(0,0,f,t),v=[];for(let g=0;g<u.data.length;g+=4){let _=u.data[g],y=u.data[g+1],S=u.data[g+2];(_+y+S)/3>=o.pixel_threshold?v.push(i):v.push(s)}return{pixels:v,width:f}}var Xt=function(d,e,t,i){return new(t||(t=Promise))(function(s,r){function n(l){try{o(i.next(l))}catch(c){r(c)}}function a(l){try{o(i.throw(l))}catch(c){r(c)}}function o(l){var c;l.done?s(l.value):(c=l.value,c instanceof t?c:new t(function(h){h(c)})).then(n,a)}o((i=i.apply(d,e||[])).next())})},A=function(d){return this instanceof A?(this.v=d,this):new A(d)},Ht=function(d,e,t){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var i,s=t.apply(d,e||[]),r=[];return i={},n("next"),n("throw"),n("return"),i[Symbol.asyncIterator]=function(){return this},i;function n(h){s[h]&&(i[h]=function(f){return new Promise(function(p,x){r.push([h,f,p,x])>1||a(h,f)})})}function a(h,f){try{(p=s[h](f)).value instanceof A?Promise.resolve(p.value.v).then(o,l):c(r[0][2],p)}catch(x){c(r[0][3],x)}var p}function o(h){a("next",h)}function l(h){a("throw",h)}function c(h,f){h(f),r.shift(),r.length&&a(r[0][0],r[0][1])}};function Ct(d,{includeLastEmptyLine:e=!0,encoding:t="utf-8",delimiter:i=/\r?\n/g}={}){return Ht(this,arguments,function*(){let s=yield A((h=>Xt(void 0,void 0,void 0,function*(){let f=yield fetch(h);if(f.body===null)throw new Error("Cannot read file");return f.body.getReader()}))(d)),{value:r,done:n}=yield A(s.read()),a=new TextDecoder(t),o,l=r?a.decode(r):"";if(typeof i=="string"){if(i==="")throw new Error("delimiter cannot be empty string!");o=new RegExp(i.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&"),"g")}else o=/g/.test(i.flags)===!1?new RegExp(i.source,i.flags+"g"):i;let c=0;for(;;){let h=o.exec(l);if(h!==null)yield yield A(l.substring(c,h.index)),c=o.lastIndex;else{if(n===!0)break;let f=l.substring(c);({value:r,done:n}=yield A(s.read())),l=f+(l?a.decode(r):""),c=0}}(e||c<l.length)&&(yield yield A(l.substring(c)))})}var B=function(d,e,t,i){return new(t||(t=Promise))(function(s,r){function n(l){try{o(i.next(l))}catch(c){r(c)}}function a(l){try{o(i.throw(l))}catch(c){r(c)}}function o(l){var c;l.done?s(l.value):(c=l.value,c instanceof t?c:new t(function(h){h(c)})).then(n,a)}o((i=i.apply(d,e||[])).next())})},Vt=function(d){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var e,t=d[Symbol.asyncIterator];return t?t.call(d):(d=typeof __values=="function"?__values(d):d[Symbol.iterator](),e={},i("next"),i("throw"),i("return"),e[Symbol.asyncIterator]=function(){return this},e);function i(s){e[s]=d[s]&&function(r){return new Promise(function(n,a){(function(o,l,c,h){Promise.resolve(h).then(function(f){o({value:f,done:c})},l)})(n,a,(r=d[s](r)).done,r.value)})}}},kt="[\\s]+",Wt={glyphname:"empty",codepoint:8203,bbw:0,bbh:0,bbxoff:0,bbyoff:0,swx0:0,swy0:0,dwx0:0,dwy0:0,swx1:0,swy1:0,dwx1:0,dwy1:0,vvectorx:0,vvectory:0,hexdata:[]},zt=["glyphname","codepoint","bbw","bbh","bbxoff","bbyoff","swx0","swy0","dwx0","dwy0","swx1","swy1","dwx1","dwy1","vvectorx","vvectory","hexdata"],jt={lr:"lrtb",rl:"rltb",tb:"tbrl",bt:"btrl",lrtb:void 0,lrbt:void 0,rltb:void 0,rlbt:void 0,tbrl:void 0,tblr:void 0,btrl:void 0,btlr:void 0},K={lr:1,rl:2,tb:0,bt:-1},ft=class{constructor(){this.headers=void 0,this.__headers={},this.props={},this.glyphs=new Map,this.__glyph_count_to_check=null,this.__curline_startchar=null,this.__curline_chars=null}load_filelines(e){var t,i;return B(this,void 0,void 0,function*(){try{this.__f=e,yield this.__parse_headers()}finally{if(typeof Deno<"u"&&this.__f!==void 0)try{for(var s,r=Vt(this.__f);!(s=yield r.next()).done;)s.value}catch(n){t={error:n}}finally{try{s&&!s.done&&(i=r.return)&&(yield i.call(r))}finally{if(t)throw t.error}}}return this})}__parse_headers(){var e,t;return B(this,void 0,void 0,function*(){for(;;){let i=(t=yield(e=this.__f)===null||e===void 0?void 0:e.next())===null||t===void 0?void 0:t.value,s=i.split(/ (.+)/,2),r=s.length,n;if(r===2){let a=s[0],o=s[1].trim();switch(a){case"STARTFONT":this.__headers.bdfversion=parseFloat(o);break;case"FONT":this.__headers.fontname=o;break;case"SIZE":n=o.split(" "),this.__headers.pointsize=parseInt(n[0],10),this.__headers.xres=parseInt(n[1],10),this.__headers.yres=parseInt(n[2],10);break;case"FONTBOUNDINGBOX":n=o.split(" "),this.__headers.fbbx=parseInt(n[0],10),this.__headers.fbby=parseInt(n[1],10),this.__headers.fbbxoff=parseInt(n[2],10),this.__headers.fbbyoff=parseInt(n[3],10);break;case"STARTPROPERTIES":return this.__parse_headers_after(),void(yield this.__parse_props());case"COMMENT":"comment"in this.__headers&&Array.isArray(this.__headers.comment)||(this.__headers.comment=[]),this.__headers.comment.push(o.replace(/^[\s"'\t\r\n]+|[\s"'\t\r\n]+$/g,""));break;case"SWIDTH":n=o.split(" "),this.__headers.swx0=parseInt(n[0],10),this.__headers.swy0=parseInt(n[1],10);break;case"DWIDTH":n=o.split(" "),this.__headers.dwx0=parseInt(n[0],10),this.__headers.dwy0=parseInt(n[1],10);break;case"SWIDTH1":n=o.split(" "),this.__headers.swx1=parseInt(n[0],10),this.__headers.swy1=parseInt(n[1],10);break;case"DWIDTH1":n=o.split(" "),this.__headers.dwx1=parseInt(n[0],10),this.__headers.dwy1=parseInt(n[1],10);break;case"VVECTOR":n=kt.split(o),this.__headers.vvectorx=parseInt(n[0],10),this.__headers.vvectory=parseInt(n[1],10);break;case"METRICSSET":case"CONTENTVERSION":this.__headers[a.toLowerCase()]=parseInt(o,10);break;case"CHARS":return console.warn("It looks like the font does not have property block beginning with 'STARTPROPERTIES' keyword"),this.__parse_headers_after(),this.__curline_chars=i,void(yield this.__parse_glyph_count());case"STARTCHAR":return console.warn("It looks like the font does not have property block beginning with 'STARTPROPERTIES' keyword"),console.warn("Cannot find 'CHARS' line"),this.__parse_headers_after(),this.__curline_startchar=i,void(yield this.__prepare_glyphs())}}if(r===1&&s[0].trim()==="ENDFONT")return console.warn("It looks like the font does not have property block beginning with 'STARTPROPERTIES' keyword"),void console.warn("This font does not have any glyphs")}})}__parse_headers_after(){"metricsset"in this.__headers||(this.__headers.metricsset=0),this.headers=this.__headers}__parse_props(){var e,t;return B(this,void 0,void 0,function*(){for(;;){let i=((t=yield(e=this.__f)===null||e===void 0?void 0:e.next())===null||t===void 0?void 0:t.value).split(/ (.+)/,2),s=i.length;if(s===2){let r=i[0],n=i[1].replace(/^[\s"'\t\r\n]+|[\s"'\t\r\n]+$/g,"");r==="COMMENT"?("comment"in this.props&&Array.isArray(this.props.comment)||(this.props.comment=[]),this.props.comment.push(n.replace(/^[\s"'\t\r\n]+|[\s"'\t\r\n]+$/g,""))):this.props[r.toLowerCase()]=n}else if(s===1){let r=i[0].trim();if(r==="ENDPROPERTIES")return void(yield this.__parse_glyph_count());if(r==="ENDFONT")return void console.warn("This font does not have any glyphs");this.props[r]=null}}})}__parse_glyph_count(){var e,t;return B(this,void 0,void 0,function*(){let i;if(this.__curline_chars===null?i=(t=yield(e=this.__f)===null||e===void 0?void 0:e.next())===null||t===void 0?void 0:t.value:(i=this.__curline_chars,this.__curline_chars=null),i.trim()==="ENDFONT")return void console.warn("This font does not have any glyphs");let s=i.split(/ (.+)/,2);s[0]==="CHARS"?this.__glyph_count_to_check=parseInt(s[1].trim(),10):(this.__curline_startchar=i,console.warn("Cannot find 'CHARS' line next to 'ENDPROPERTIES' line")),yield this.__prepare_glyphs()})}__prepare_glyphs(){var e,t;return B(this,void 0,void 0,function*(){let i=0,s=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],r=[],n=!1,a=!1;for(;;){let o;if(this.__curline_startchar===null?o=(t=yield(e=this.__f)===null||e===void 0?void 0:e.next())===null||t===void 0?void 0:t.value:(o=this.__curline_startchar,this.__curline_startchar=null),o==null)return console.warn("This font does not have 'ENDFONT' keyword"),void this.__prepare_glyphs_after();let l=o.split(/ (.+)/,2),c=l.length;if(c===2){let h=l[0],f=l[1].trim(),p;switch(h){case"STARTCHAR":s=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],s[0]=f,a=!1;break;case"ENCODING":i=parseInt(f,10),s[1]=i;break;case"BBX":p=f.split(" "),s[2]=parseInt(p[0],10),s[3]=parseInt(p[1],10),s[4]=parseInt(p[2],10),s[5]=parseInt(p[3],10);break;case"SWIDTH":p=f.split(" "),s[6]=parseInt(p[0],10),s[7]=parseInt(p[1],10);break;case"DWIDTH":p=f.split(" "),s[8]=parseInt(p[0],10),s[9]=parseInt(p[1],10);break;case"SWIDTH1":p=f.split(" "),s[10]=parseInt(p[0],10),s[11]=parseInt(p[1],10);break;case"DWIDTH1":p=f.split(" "),s[12]=parseInt(p[0],10),s[13]=parseInt(p[1],10);break;case"VVECTOR":p=kt.split(f),s[14]=parseInt(p[0],10),s[15]=parseInt(p[1],10)}}else if(c===1){let h=l[0].trim();switch(h){case"BITMAP":r=[],n=!0;break;case"ENDCHAR":n=!1,s[16]=r,this.glyphs.set(i,s),a=!0;break;case"ENDFONT":if(a)return void this.__prepare_glyphs_after();default:n&&r.push(h)}}}})}__prepare_glyphs_after(){let e=this.glyphs.size;this.__glyph_count_to_check!==e&&(this.__glyph_count_to_check===null?console.warn("The glyph count next to 'CHARS' keyword does not exist"):console.warn(`The glyph count next to 'CHARS' keyword is ${this.__glyph_count_to_check.toString()}, which does not match the actual glyph count ${e.toString()}`))}get length(){return this.glyphs.size}itercps(e,t){let i=e??1,s=t??null,r,n=[...this.glyphs.keys()];switch(i){case 1:r=n.sort((a,o)=>a-o);break;case 0:r=n;break;case 2:r=n.sort((a,o)=>o-a);break;case-1:r=n.reverse()}if(s!==null){let a=o=>{if(typeof s=="number")return o<s;if(Array.isArray(s)&&s.length===2&&typeof s[0]=="number"&&typeof s[1]=="number")return o<=s[1]&&o>=s[0];if(Array.isArray(s)&&Array.isArray(s[0]))for(let l of s){let[c,h]=l;if(o<=h&&o>=c)return!0}return!1};r=r.filter(a)}return r}*iterglyphs(e,t){for(let i of this.itercps(e,t))yield this.glyphbycp(i)}glyphbycp(e){let t=this.glyphs.get(e);if(t==null)return console.warn(`Glyph "${String.fromCodePoint(e)}" (codepoint ${e.toString()}) does not exist in the font. Will return 'null'`),null;{let i={};return zt.forEach((s,r)=>{var n,a,o;n=i,a=s,o=t[r],n[a]=o}),new D(i,this)}}glyph(e){let t=e.codePointAt(0);return t===void 0?null:this.glyphbycp(t)}lacksglyphs(e){let t=[],i=e.length;for(let s,r=0;r<i;r++){s=e[r];let n=s.codePointAt(0);n!==void 0&&this.glyphs.has(n)||t.push(s)}return t.length!==0?t:null}drawcps(e,t={}){var i,s,r,n,a,o,l;let c=(i=t.linelimit)!==null&&i!==void 0?i:512,h=(s=t.mode)!==null&&s!==void 0?s:1,f=(r=t.direction)!==null&&r!==void 0?r:"lrtb",p=(n=t.usecurrentglyphspacing)!==null&&n!==void 0&&n,x=(a=t.missing)!==null&&a!==void 0?a:null;if(this.headers===void 0)throw new Error("Font is not loaded");let b,m,u,v,g,_,y,S,w,k,I,T,R,M,F,z,j,G,pt=(o=jt[f])!==null&&o!==void 0?o:f,xt=pt.slice(0,2),ut=pt.slice(2,4);xt in K&&ut in K?(_=K[xt],y=K[ut]):(_=1,y=0),y===0||y===2?b=1:y!==1&&y!==-1||(b=0),_===1||_===-1?m=1:_!==2&&_!==0||(m=0),h===1&&(S=_>0?this.headers.fbbx:this.headers.fbby,_>0?(T="dwx0",R="dwy0"):(T="dwx1",R="dwy1"),I=T in this.headers?this.headers[T]:R in this.headers?this.headers[R]:null);let gt=[];v=[];let bt=[];F=[],z=0;let mt=()=>{gt.push(v),p?F.shift():F.pop(),bt.push(F)},Ft=e[Symbol.iterator]();for(j=!1;;){if(j)j=!1;else{if(g=(l=Ft.next())===null||l===void 0?void 0:l.value,g===void 0)break;let U=this.glyphbycp(g);w=U!==null?U:x?x instanceof D?x:new D(x,this):new D(Wt,this),u=w.draw(),G=u.width(),M=0,h===1&&T!==void 0&&R!==void 0&&(k=w.meta[T]||w.meta[R],k==null&&(k=I),k!=null&&S!==void 0&&(M=k-S))}if(G!==void 0&&M!==void 0&&u!==void 0&&w!==void 0&&g!==void 0)if(z+=G+M,z<=c)v.push(u),F.push(M);else{if(v.length===0)throw new Error(`\`_linelimit\` (${c}) is too small the line can't even contain one glyph: "${w.chr()}" (codepoint ${g}, width: ${G})`);mt(),z=0,v=[],F=[],j=!0}}v.length!==0&&mt();let Bt=gt.map((U,Dt)=>V.concatall(U,{direction:_,align:b,offsetlist:bt[Dt]}));return V.concatall(Bt,{direction:y,align:m})}draw(e,t={}){let{linelimit:i,mode:s,direction:r,usecurrentglyphspacing:n,missing:a}=t;return this.drawcps(e.split("").map(o=>{let l=o.codePointAt(0);return l===void 0?8203:l}),{linelimit:i,mode:s,direction:r,usecurrentglyphspacing:n,missing:a})}drawall(e={}){let{order:t,r:i,linelimit:s,mode:r,direction:n,usecurrentglyphspacing:a}=e,o=r??0;return this.drawcps(this.itercps(t,i),{linelimit:s,mode:o,direction:n,usecurrentglyphspacing:a})}},D=class{constructor(e,t){this.meta=e,this.font=t}toString(){return this.draw().toString()}repr(){var e;return"Glyph("+JSON.stringify(this.meta,null,2)+", Font(<"+((e=this.font.headers)===null||e===void 0?void 0:e.fontname)+">)"}cp(){return this.meta.codepoint}chr(){return String.fromCodePoint(this.cp())}draw(e,t){let i=t??null,s;switch(e??0){case 0:s=this.__draw_fbb();break;case 1:s=this.__draw_bb();break;case 2:s=this.__draw_original();break;case-1:if(i===null)throw new Error("Parameter bb in draw() method must be set when mode=-1");s=this.__draw_user_specified(i)}return s}__draw_user_specified(e){let t=this.meta.bbxoff,i=this.meta.bbyoff,[s,r,n,a]=e;return this.__draw_bb().crop(s,r,-t+n,-i+a)}__draw_original(){return new V(this.meta.hexdata.map(e=>e?parseInt(e,16).toString(2).padStart(4*e.length,"0"):""))}__draw_bb(){let e=this.meta.bbw,t=this.meta.bbh,i=this.__draw_original(),s=i.bindata,r=s.length;return r!==t&&console.warn(`Glyph "${this.meta.glyphname.toString()}" (codepoint ${this.meta.codepoint.toString()})'s bbh, ${t.toString()}, does not match its hexdata line count, ${r.toString()}`),i.bindata=s.map(n=>n.slice(0,e)),i}__draw_fbb(){let e=this.font.headers;if(e===void 0)throw new Error("Font is not loaded");return this.__draw_user_specified([e.fbbx,e.fbby,e.fbbxoff,e.fbbyoff])}origin(e={}){var t,i,s,r;let n=(t=e.mode)!==null&&t!==void 0?t:0,a=(i=e.fromorigin)!==null&&i!==void 0&&i,o=(s=e.xoff)!==null&&s!==void 0?s:null,l=(r=e.yoff)!==null&&r!==void 0?r:null,c,h=this.meta.bbxoff,f=this.meta.bbyoff;switch(n){case 0:let p=this.font.headers;if(p===void 0)throw new Error("Font is not loaded");c=[p.fbbxoff,p.fbbyoff];break;case 1:case 2:c=[h,f];break;case-1:if(o===null||l===null)throw new Error("Parameter xoff and yoff in origin() method must be all set when mode=-1");c=[o,l]}return a?c:[0-c[0],0-c[1]]}},V=class d{constructor(e){this.bindata=e}toString(){return this.bindata.join(`
`).replace(/0/g,".").replace(/1/g,"#").replace(/2/g,"&")}repr(){return`Bitmap(${JSON.stringify(this.bindata,null,2)})`}width(){return this.bindata[0].length}height(){return this.bindata.length}clone(){return new d([...this.bindata])}static __crop_string(e,t,i){let s=e,r=e.length,n=0;t<0&&(n=0-t,s=s.padStart(n+r,"0")),t+i>r&&(s=s.padEnd(t+i-r+s.length,"0"));let a=t+n;return s.slice(a,a+i)}static __string_offset_concat(e,t,i){let s=i??0;if(s===0)return e+t;let r=e.length,n=r+s,a=n+t.length,o=Math.min(0,n),l=Math.max(r,a),c=d.__crop_string(e,o,l-o),h=d.__crop_string(t,o-n,l-o);return c.split("").map((f,p)=>(parseInt(h[p],10)||parseInt(f,10)).toString()).join("")}static __listofstr_offset_concat(e,t,i){let s=i??0,r,n;if(s===0)return e.concat(t);let a=e[0].length,o=e.length,l=o+s,c=l+t.length,h=Math.min(0,l),f=Math.max(o,c),p=[];for(let x=h;x<f;x++)r=x<0||x>=o?"0".repeat(a):e[x],n=x<l||x>=c?"0".repeat(a):t[x-l],p.push(r.split("").map((b,m)=>(parseInt(n[m],10)||parseInt(b,10)).toString()).join(""));return p}static __crop_bitmap(e,t,i,s,r){let n,a=[],o=e.length;for(let l=0;l<i;l++)n=o-r-i+l,n<0||n>=o?a.push("0".repeat(t)):a.push(d.__crop_string(e[n],s,t));return a}crop(e,t,i,s){let r=i??0,n=s??0;return this.bindata=d.__crop_bitmap(this.bindata,e,t,r,n),this}overlay(e){let t=this.bindata,i=e.bindata;return t.length!==i.length&&console.warn("the bitmaps to overlay have different height"),t[0].length!==i[0].length&&console.warn("the bitmaps to overlay have different width"),this.bindata=t.map((s,r)=>{let n=s,a=i[r];return n.split("").map((o,l)=>(parseInt(a[l],10)||parseInt(o,10)).toString()).join("")}),this}static concatall(e,t={}){var i,s,r;let n=(i=t.direction)!==null&&i!==void 0?i:1,a=(s=t.align)!==null&&s!==void 0?s:1,o=(r=t.offsetlist)!==null&&r!==void 0?r:null,l,c,h,f,p,x,b;if(n>0){h=Math.max(...e.map(u=>u.height())),p=Array(h).fill("");let m=(u,v,g)=>n===1?d.__string_offset_concat(u,v,g):d.__string_offset_concat(v,u,g);for(let u=0;u<h;u++){c=a?-u-1:u,f=0;let v=e.length;for(let g=0;g<v;g++){let _=e[g];o&&g!==0&&(f=o[g-1]),u<_.height()?c>=0?p[c]=m(p[c],_.bindata[c],f):p[h+c]=m(p[h+c],_.bindata[_.height()+c],f):c>=0?p[c]=m(p[c],"0".repeat(_.width()),f):p[h+c]=m(p[h+c],"0".repeat(_.width()),f)}}}else{h=Math.max(...e.map(u=>u.width())),p=[],f=0;let m=e.length;for(let u=0;u<m;u++){let v=e[u];o&&u!==0&&(f=o[u-1]),l=v.bindata,x=v.width(),x!==h&&(b=a?0:x-h,l=this.__crop_bitmap(l,h,v.height(),b,0)),p=n===0?d.__listofstr_offset_concat(p,l,f):d.__listofstr_offset_concat(l,p,f)}}return new this(p)}concat(e,t={}){let{direction:i,align:s,offset:r}=t,n=r??0;return this.bindata=d.concatall([this,e],{direction:i,align:s,offsetlist:[n]}).bindata,this}static __enlarge_bindata(e,t,i){let s=t??1,r=i??1,n=[...e];return s>1&&(n=n.map(a=>a.split("").reduce((o,l)=>o.concat(Array(s).fill(l)),[]).join(""))),r>1&&(n=n.reduce((a,o)=>a.concat(Array(r).fill(o)),[])),n}enlarge(e,t){return this.bindata=d.__enlarge_bindata(this.bindata,e,t),this}replace(e,t){let i=typeof e=="number"?e.toString():e,s=typeof t=="number"?t.toString():t;return this.bindata=this.bindata.map(r=>((n,a,o)=>{if("replaceAll"in String.prototype)return n.replaceAll(a,o);{let l=c=>c.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&");return n.replace(new RegExp(l(a),"g"),o)}})(r,i,s)),this}shadow(e,t){let i=e??1,s=t??-1,r,n,a,o,l,c,h=this.clone();return c=this.width(),r=this.height(),c+=Math.abs(i),r+=Math.abs(s),h.bindata=h.bindata.map(f=>f.replace(/1/g,"2")),i>0?(n=0,o=-i):(n=i,o=0),s>0?(a=0,l=-s):(a=s,l=0),this.crop(c,r,n,a),h.crop(c,r,o,l),h.overlay(this),this.bindata=h.bindata,this}glow(e){var t,i,s,r,n,a,o,l,c,h,f,p,x,b;let m=e??0,u,v,g,_;g=this.width(),_=this.height(),g+=2,_+=2,this.crop(g,_,-1,-1);let y=this.todata(2),S=y.length;for(let w=0;w<S;w++){u=y[w];let k=u.length;for(let I=0;I<k;I++)v=u[I],v===1&&((t=y[w])[i=I-1]||(t[i]=2),(s=y[w])[r=I+1]||(s[r]=2),(n=y[w-1])[I]||(n[I]=2),(a=y[w+1])[I]||(a[I]=2),m===1&&((o=y[w-1])[l=I-1]||(o[l]=2),(c=y[w-1])[h=I+1]||(c[h]=2),(f=y[w+1])[p=I-1]||(f[p]=2),(x=y[w+1])[b=I+1]||(x[b]=2)))}return this.bindata=y.map(w=>w.map(k=>k.toString()).join("")),this}bytepad(e){let t=e??8,i=this.width(),s=this.height(),r=i%t;return r===0?this:this.crop(i+t-r,s)}todata(e){let t;switch(e??1){case 0:t=this.bindata.join(`
`);break;case 1:t=this.bindata;break;case 2:t=this.bindata.map(i=>i.split("").map(s=>parseInt(s,10)));break;case 3:t=[].concat(...this.todata(2));break;case 4:t=this.bindata.map(i=>{if(!/^[01]+$/.test(i))throw new Error(`Invalid binary string: ${i}`);return parseInt(i,2).toString(16).padStart(-1*Math.floor(-1*this.width()/4),"0")});break;case 5:t=this.bindata.map(i=>{if(!/^[01]+$/.test(i))throw new Error(`Invalid binary string: ${i}`);return parseInt(i,2)})}return t}draw2canvas(e,t){let i=t??{0:null,1:"black",2:"red"};return this.todata(2).forEach((s,r)=>{s.forEach((n,a)=>{let o=n.toString();if(o==="0"||o==="1"||o==="2"){let l=i[o];l!=null&&(e.fillStyle=l,e.fillRect(a,r,1,1))}})}),this}},Mt=d=>B(void 0,void 0,void 0,function*(){return yield new ft().load_filelines(d)});var Gt={VCR_OSD_MONO:{16:{file:"VCR_OSD_MONO_16.bdf",yOffset:0},24:{file:"VCR_OSD_MONO_24.bdf",yOffset:0},32:{file:"VCR_OSD_MONO_32.bdf",yOffset:2}},CUSONG:{16:{file:"CUSONG_16.bdf",yOffset:-1},24:{file:"CUSONG_24.bdf",yOffset:0},32:{file:"CUSONG_32.bdf",yOffset:0}}},N=new Map,Z=new Map;function Ut(d){return window.location.pathname.includes("preview.html")||window.location.port==="8080"?`./fonts/${d}`:`/hacsfiles/ipixel_color/fonts/${d}`}function Q(d){return d<=18?16:d<=28?24:32}async function L(d,e=16){let t=`${d}_${e}`;if(N.has(t))return N.get(t);if(Z.has(t))return Z.get(t);let i=Gt[d];if(!i||!i[e])return console.warn(`iPIXEL BDF: No config for font ${d} at height ${e}`),null;let s=i[e],r=(async()=>{try{let n=Ut(s.file);console.log(`iPIXEL BDF: Loading ${n}...`);let o={font:await Mt(Ct(n)),config:s};return N.set(t,o),console.log(`iPIXEL BDF: Font ${d} (${e}px) loaded successfully`),o}catch(n){return console.warn(`iPIXEL BDF: Failed to load font ${d} (${e}px):`,n),Z.delete(t),null}})();return Z.set(t,r),r}function Tt(d,e=16){let t=`${d}_${e}`;return N.has(t)}function Rt(d,e,t,i="#ff6600",s="#111",r="VCR_OSD_MONO"){let n=Q(t),a=`${r}_${n}`,o=N.get(a);if(!o)return L(r,n),null;let{font:l,config:c}=o,h=new Array(e*t).fill(s);if(!d||d.trim()==="")return h;try{let f=l.draw(d,{direction:"lrtb",mode:1}),p=f.bindata,x=f.width(),b=f.height(),m=Math.floor((e-x)/2),u=Math.floor((t-b)/2)+(c.yOffset||0);for(let v=0;v<b;v++){let g=p[v]||"";for(let _=0;_<g.length;_++){let y=m+_,S=u+v;if(y>=0&&y<e&&S>=0&&S<t){let w=S*e+y;h[w]=g[_]==="1"?i:s}}}}catch(f){return console.warn("iPIXEL BDF: Error rendering text:",f),null}return h}function Ot(d,e,t,i="#ff6600",s="#111",r="VCR_OSD_MONO"){let n=Q(t),a=`${r}_${n}`,o=N.get(a);if(!o)return L(r,n),null;let{font:l,config:c}=o;if(!d||d.trim()===""){let h=e*3;return{pixels:new Array(h*t).fill(s),width:h}}try{let h=l.draw(d,{direction:"lrtb",mode:1}),f=h.bindata,p=h.width(),x=h.height(),b=e+p+e,m=new Array(b*t).fill(s),u=e,v=Math.floor((t-x)/2)+(c.yOffset||0);for(let g=0;g<x;g++){let _=f[g]||"";for(let y=0;y<_.length;y++){let S=u+y,w=v+g;if(S>=0&&S<b&&w>=0&&w<t){let k=w*b+S;m[k]=_[y]==="1"?i:s}}}return{pixels:m,width:b}}catch(h){return console.warn("iPIXEL BDF: Error rendering scroll text:",h),null}}var tt=class{constructor(e){this.renderer=e}init(e,t){let{width:i,height:s}=this.renderer;switch(e){case"scroll_ltr":case"scroll_rtl":t.offset=0;break;case"blink":t.visible=!0;break;case"snow":case"breeze":t.phases=[];for(let r=0;r<i*s;r++)t.phases[r]=Math.random()*Math.PI*2;break;case"laser":t.position=0;break;case"fade":t.opacity=0,t.direction=1;break;case"typewriter":t.charIndex=0,t.cursorVisible=!0;break;case"bounce":t.offset=0,t.direction=1;break;case"sparkle":t.sparkles=[];for(let r=0;r<Math.floor(i*s*.1);r++)t.sparkles.push({x:Math.floor(Math.random()*i),y:Math.floor(Math.random()*s),brightness:Math.random(),speed:.05+Math.random()*.1});break}}step(e,t){let{width:i,extendedWidth:s}=this.renderer;switch(e){case"scroll_ltr":t.offset-=1,t.offset<=-(s||i)&&(t.offset=i);break;case"scroll_rtl":t.offset+=1,t.offset>=(s||i)&&(t.offset=-i);break;case"blink":t.visible=!t.visible;break;case"laser":t.position=(t.position+1)%i;break;case"fade":t.opacity+=t.direction*.05,t.opacity>=1?(t.opacity=1,t.direction=-1):t.opacity<=0&&(t.opacity=0,t.direction=1);break;case"typewriter":t.tick%3===0&&t.charIndex++,t.cursorVisible=t.tick%10<5;break;case"bounce":t.offset+=t.direction;let r=Math.max(0,(s||i)-i);t.offset>=r?(t.offset=r,t.direction=-1):t.offset<=0&&(t.offset=0,t.direction=1);break;case"sparkle":for(let n of t.sparkles)n.brightness+=n.speed,n.brightness>1&&(n.brightness=0,n.x=Math.floor(Math.random()*i),n.y=Math.floor(Math.random()*this.renderer.height));break}}render(e,t,i,s,r){let{width:n,height:a}=this.renderer,o=s||i||[],l=i||[],c=r||n;for(let h=0;h<a;h++)for(let f=0;f<n;f++){let p,x=f;if(e==="scroll_ltr"||e==="scroll_rtl"||e==="bounce"){for(x=f-(t.offset||0);x<0;)x+=c;for(;x>=c;)x-=c;p=o[h*c+x]||"#111"}else if(e==="typewriter"){let _=(t.charIndex||0)*6;f<_?p=l[h*n+f]||"#111":f===_&&t.cursorVisible?p="#ffffff":p="#111"}else p=l[h*n+f]||"#111";let[b,m,u]=this._hexToRgb(p);if(b>20||m>20||u>20)switch(e){case"blink":t.visible||(b=m=u=17);break;case"snow":{let g=t.phases?.[h*n+f]||0,_=t.tick||0,y=.3+.7*Math.abs(Math.sin(g+_*.3));b*=y,m*=y,u*=y;break}case"breeze":{let g=t.phases?.[h*n+f]||0,_=t.tick||0,y=.4+.6*Math.abs(Math.sin(g+_*.15+f*.2));b*=y,m*=y,u*=y;break}case"laser":{let g=t.position||0,y=Math.abs(f-g)<3?1:.3;b*=y,m*=y,u*=y;break}case"fade":{let g=t.opacity||1;b*=g,m*=g,u*=g;break}}if(e==="sparkle"&&t.sparkles){for(let g of t.sparkles)if(g.x===f&&g.y===h){let _=Math.sin(g.brightness*Math.PI);b=Math.min(255,b+_*200),m=Math.min(255,m+_*200),u=Math.min(255,u+_*200)}}this.renderer.setPixel(f,h,[b,m,u])}}_hexToRgb(e){if(!e||e==="#111"||e==="#000")return[17,17,17];if(e==="#050505")return[5,5,5];let t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]:[17,17,17]}};function qt(d,e,t){let i,s,r,n=Math.floor(d*6),a=d*6-n,o=t*(1-e),l=t*(1-a*e),c=t*(1-(1-a)*e);switch(n%6){case 0:i=t,s=c,r=o;break;case 1:i=l,s=t,r=o;break;case 2:i=o,s=t,r=c;break;case 3:i=o,s=l,r=t;break;case 4:i=c,s=o,r=t;break;case 5:i=t,s=o,r=l;break}return[i*255,s*255,r*255]}var et=class{constructor(e){this.renderer=e}init(e,t){let{width:i,height:s}=this.renderer;switch(e){case"rainbow":t.position=0;break;case"matrix":let r=[[0,255,0],[0,255,255],[255,0,255]];t.colorMode=r[Math.floor(Math.random()*r.length)],t.buffer=[];for(let a=0;a<s;a++)t.buffer.push(Array(i).fill(null).map(()=>[0,0,0]));break;case"plasma":t.time=0;break;case"gradient":t.time=0;break;case"fire":t.heat=[];for(let a=0;a<i*s;a++)t.heat[a]=0;t.palette=this._createFirePalette();break;case"water":t.current=[],t.previous=[];for(let a=0;a<i*s;a++)t.current[a]=0,t.previous[a]=0;t.damping=.95;break;case"stars":t.stars=[];let n=Math.floor(i*s*.15);for(let a=0;a<n;a++)t.stars.push({x:Math.floor(Math.random()*i),y:Math.floor(Math.random()*s),brightness:Math.random(),speed:.02+Math.random()*.05,phase:Math.random()*Math.PI*2});break;case"confetti":t.particles=[];for(let a=0;a<20;a++)t.particles.push(this._createConfettiParticle(i,s,!0));break}}step(e,t){let{width:i,height:s}=this.renderer;switch(e){case"rainbow":t.position=(t.position+.01)%1;break;case"matrix":this._stepMatrix(t,i,s);break;case"plasma":case"gradient":t.time=(t.time||0)+.05;break;case"fire":this._stepFire(t,i,s);break;case"water":this._stepWater(t,i,s);break;case"stars":for(let r of t.stars)r.phase+=r.speed;break;case"confetti":for(let r=0;r<t.particles.length;r++){let n=t.particles[r];n.y+=n.speed,n.x+=n.drift,n.rotation+=n.rotationSpeed,n.y>s&&(t.particles[r]=this._createConfettiParticle(i,s,!1))}break}}render(e,t){switch(e){case"rainbow":this._renderRainbow(t);break;case"matrix":this._renderMatrix(t);break;case"plasma":this._renderPlasma(t);break;case"gradient":this._renderGradient(t);break;case"fire":this._renderFire(t);break;case"water":this._renderWater(t);break;case"stars":this._renderStars(t);break;case"confetti":this._renderConfetti(t);break}}_renderRainbow(e){let{width:t,height:i}=this.renderer,s=e.position||0;for(let r=0;r<t;r++){let n=(s+r/t)%1,[a,o,l]=qt(n,1,.6);for(let c=0;c<i;c++)this.renderer.setPixel(r,c,[a,o,l])}}_stepMatrix(e,t,i){let s=e.buffer,r=e.colorMode,n=.15;s.pop();let a=s[0].map(([o,l,c])=>[o*(1-n),l*(1-n),c*(1-n)]);s.unshift(JSON.parse(JSON.stringify(a)));for(let o=0;o<t;o++)Math.random()<.08&&(s[0][o]=[Math.floor(Math.random()*r[0]),Math.floor(Math.random()*r[1]),Math.floor(Math.random()*r[2])])}_renderMatrix(e){let{width:t,height:i}=this.renderer,s=e.buffer;if(s)for(let r=0;r<i;r++)for(let n=0;n<t;n++){let[a,o,l]=s[r]?.[n]||[0,0,0];this.renderer.setPixel(n,r,[a,o,l])}}_renderPlasma(e){let{width:t,height:i}=this.renderer,s=e.time||0,r=t/2,n=i/2;for(let a=0;a<t;a++)for(let o=0;o<i;o++){let l=a-r,c=o-n,h=Math.sqrt(l*l+c*c),f=Math.sin(a/8+s),p=Math.sin(o/6+s*.8),x=Math.sin(h/6-s*1.2),b=Math.sin((a+o)/10+s*.5),m=(f+p+x+b+4)/8,u=Math.sin(m*Math.PI*2)*.5+.5,v=Math.sin(m*Math.PI*2+2)*.5+.5,g=Math.sin(m*Math.PI*2+4)*.5+.5;this.renderer.setPixel(a,o,[u*255,v*255,g*255])}}_renderGradient(e){let{width:t,height:i}=this.renderer,r=(e.time||0)*10;for(let n=0;n<t;n++)for(let a=0;a<i;a++){let o=(Math.sin((n+r)*.05)*.5+.5)*255,l=(Math.cos((a+r)*.05)*.5+.5)*255,c=(Math.sin((n+a+r)*.03)*.5+.5)*255;this.renderer.setPixel(n,a,[o,l,c])}}_createFirePalette(){let e=[];for(let t=0;t<256;t++){let i,s,r;t<64?(i=t*4,s=0,r=0):t<128?(i=255,s=(t-64)*4,r=0):t<192?(i=255,s=255,r=(t-128)*4):(i=255,s=255,r=255),e.push([i,s,r])}return e}_stepFire(e,t,i){let s=e.heat;for(let r=0;r<t*i;r++)s[r]=Math.max(0,s[r]-Math.random()*10);for(let r=0;r<i-1;r++)for(let n=0;n<t;n++){let a=r*t+n,o=(r+1)*t+n,l=r*t+Math.max(0,n-1),c=r*t+Math.min(t-1,n+1);s[a]=(s[o]+s[l]+s[c])/3.05}for(let r=0;r<t;r++)Math.random()<.6&&(s[(i-1)*t+r]=180+Math.random()*75)}_renderFire(e){let{width:t,height:i}=this.renderer,s=e.heat,r=e.palette;for(let n=0;n<i;n++)for(let a=0;a<t;a++){let o=n*t+a,l=Math.floor(Math.min(255,s[o])),[c,h,f]=r[l];this.renderer.setPixel(a,n,[c,h,f])}}_stepWater(e,t,i){let{current:s,previous:r,damping:n}=e,a=[...r];for(let o=0;o<s.length;o++)r[o]=s[o];for(let o=1;o<i-1;o++)for(let l=1;l<t-1;l++){let c=o*t+l;s[c]=(a[(o-1)*t+l]+a[(o+1)*t+l]+a[o*t+(l-1)]+a[o*t+(l+1)])/2-s[c],s[c]*=n}if(Math.random()<.1){let o=Math.floor(Math.random()*(t-2))+1,l=Math.floor(Math.random()*(i-2))+1;s[l*t+o]=255}}_renderWater(e){let{width:t,height:i}=this.renderer,s=e.current;for(let r=0;r<i;r++)for(let n=0;n<t;n++){let a=r*t+n,o=Math.abs(s[a]),l=Math.min(255,o*2),c=l>200?l:0,h=l>150?l*.8:l*.3,f=Math.min(255,50+l);this.renderer.setPixel(n,r,[c,h,f])}}_renderStars(e){let{width:t,height:i}=this.renderer;for(let s=0;s<i;s++)for(let r=0;r<t;r++)this.renderer.setPixel(r,s,[5,5,15]);for(let s of e.stars){let r=(Math.sin(s.phase)*.5+.5)*255,n=Math.floor(s.x),a=Math.floor(s.y);n>=0&&n<t&&a>=0&&a<i&&this.renderer.setPixel(n,a,[r,r,r*.9])}}_createConfettiParticle(e,t,i){let s=[[255,0,0],[0,255,0],[0,0,255],[255,255,0],[255,0,255],[0,255,255],[255,128,0],[255,192,203]];return{x:Math.random()*e,y:i?Math.random()*t:-2,speed:.2+Math.random()*.3,drift:(Math.random()-.5)*.3,color:s[Math.floor(Math.random()*s.length)],size:1+Math.random(),rotation:Math.random()*Math.PI*2,rotationSpeed:(Math.random()-.5)*.2}}_renderConfetti(e){let{width:t,height:i}=this.renderer;for(let s=0;s<i;s++)for(let r=0;r<t;r++)this.renderer.setPixel(r,s,[10,10,10]);for(let s of e.particles){let r=Math.floor(s.x),n=Math.floor(s.y);if(r>=0&&r<t&&n>=0&&n<i){this.renderer.setPixel(r,n,s.color);let a=Math.abs(Math.sin(s.rotation))*.5+.5,[o,l,c]=s.color;this.renderer.setPixel(r,n,[o*a,l*a,c*a])}}}};function Pt(d,e,t){let i,s,r,n=Math.floor(d*6),a=d*6-n,o=t*(1-e),l=t*(1-a*e),c=t*(1-(1-a)*e);switch(n%6){case 0:i=t,s=c,r=o;break;case 1:i=l,s=t,r=o;break;case 2:i=o,s=t,r=c;break;case 3:i=o,s=l,r=t;break;case 4:i=c,s=o,r=t;break;case 5:i=t,s=o,r=l;break}return[i*255,s*255,r*255]}var it=class{constructor(e){this.renderer=e}init(e,t){switch(e){case"color_cycle":t.hue=0;break;case"rainbow_text":t.offset=0;break;case"neon":t.glowIntensity=0,t.direction=1,t.baseColor=t.fgColor||"#ff00ff";break}}step(e,t){switch(e){case"color_cycle":t.hue=(t.hue+.01)%1;break;case"rainbow_text":t.offset=(t.offset+.02)%1;break;case"neon":t.glowIntensity+=t.direction*.05,t.glowIntensity>=1?(t.glowIntensity=1,t.direction=-1):t.glowIntensity<=.3&&(t.glowIntensity=.3,t.direction=1);break}}render(e,t,i){let{width:s,height:r}=this.renderer,n=i||[];for(let a=0;a<r;a++)for(let o=0;o<s;o++){let l=n[a*s+o]||"#111",[c,h,f]=this._hexToRgb(l);if(c>20||h>20||f>20)switch(e){case"color_cycle":{let[x,b,m]=Pt(t.hue,1,.8),u=(c+h+f)/(3*255);c=x*u,h=b*u,f=m*u;break}case"rainbow_text":{let x=(t.offset+o/s)%1,[b,m,u]=Pt(x,1,.8),v=(c+h+f)/(3*255);c=b*v,h=m*v,f=u*v;break}case"neon":{let x=this._hexToRgb(t.baseColor||"#ff00ff"),b=t.glowIntensity||.5;if(c=x[0]*b,h=x[1]*b,f=x[2]*b,b>.8){let m=(b-.8)*5;c=c+(255-c)*m*.3,h=h+(255-h)*m*.3,f=f+(255-f)*m*.3}break}}this.renderer.setPixel(o,a,[c,h,f])}}_hexToRgb(e){if(!e||e==="#111"||e==="#000")return[17,17,17];if(e==="#050505")return[5,5,5];let t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]:[17,17,17]}};var E={TEXT:"text",AMBIENT:"ambient",COLOR:"color"},C={fixed:{category:E.TEXT,name:"Fixed",description:"Static display"},scroll_ltr:{category:E.TEXT,name:"Scroll Left",description:"Text scrolls left to right"},scroll_rtl:{category:E.TEXT,name:"Scroll Right",description:"Text scrolls right to left"},blink:{category:E.TEXT,name:"Blink",description:"Text blinks on/off"},breeze:{category:E.TEXT,name:"Breeze",description:"Gentle wave brightness"},snow:{category:E.TEXT,name:"Snow",description:"Sparkle effect"},laser:{category:E.TEXT,name:"Laser",description:"Scanning beam"},fade:{category:E.TEXT,name:"Fade",description:"Fade in/out"},typewriter:{category:E.TEXT,name:"Typewriter",description:"Characters appear one by one"},bounce:{category:E.TEXT,name:"Bounce",description:"Text bounces back and forth"},sparkle:{category:E.TEXT,name:"Sparkle",description:"Random sparkle overlay"},rainbow:{category:E.AMBIENT,name:"Rainbow",description:"HSV rainbow gradient"},matrix:{category:E.AMBIENT,name:"Matrix",description:"Digital rain effect"},plasma:{category:E.AMBIENT,name:"Plasma",description:"Classic plasma waves"},gradient:{category:E.AMBIENT,name:"Gradient",description:"Moving color gradients"},fire:{category:E.AMBIENT,name:"Fire",description:"Fire/flame simulation"},water:{category:E.AMBIENT,name:"Water",description:"Ripple/wave effect"},stars:{category:E.AMBIENT,name:"Stars",description:"Twinkling starfield"},confetti:{category:E.AMBIENT,name:"Confetti",description:"Falling colored particles"},color_cycle:{category:E.COLOR,name:"Color Cycle",description:"Cycle through colors"},rainbow_text:{category:E.COLOR,name:"Rainbow Text",description:"Rainbow gradient on text"},neon:{category:E.COLOR,name:"Neon",description:"Pulsing neon glow"}},W=class{constructor(e){this.renderer=e,this.textEffects=new tt(e),this.ambientEffects=new et(e),this.colorEffects=new it(e),this.currentEffect="fixed",this.effectState={}}getEffectInfo(e){return C[e]||C.fixed}getEffectsByCategory(e){return Object.entries(C).filter(([t,i])=>i.category===e).map(([t,i])=>({name:t,...i}))}initEffect(e,t={}){let i=this.getEffectInfo(e);switch(this.currentEffect=e,this.effectState={tick:0,...t},i.category){case E.TEXT:this.textEffects.init(e,this.effectState);break;case E.AMBIENT:this.ambientEffects.init(e,this.effectState);break;case E.COLOR:this.colorEffects.init(e,this.effectState);break}return this.effectState}step(){let e=this.getEffectInfo(this.currentEffect);switch(this.effectState.tick=(this.effectState.tick||0)+1,e.category){case E.TEXT:this.textEffects.step(this.currentEffect,this.effectState);break;case E.AMBIENT:this.ambientEffects.step(this.currentEffect,this.effectState);break;case E.COLOR:this.colorEffects.step(this.currentEffect,this.effectState);break}}render(e,t,i){switch(this.getEffectInfo(this.currentEffect).category){case E.AMBIENT:this.ambientEffects.render(this.currentEffect,this.effectState);break;case E.TEXT:this.textEffects.render(this.currentEffect,this.effectState,e,t,i);break;case E.COLOR:this.colorEffects.render(this.currentEffect,this.effectState,e);break}}isAmbient(e){return this.getEffectInfo(e).category===E.AMBIENT}needsAnimation(e){return e!=="fixed"}},fe=Object.entries(C).filter(([d,e])=>e.category===E.TEXT).map(([d])=>d),pe=Object.entries(C).filter(([d,e])=>e.category===E.AMBIENT).map(([d])=>d),xe=Object.entries(C).filter(([d,e])=>e.category===E.COLOR).map(([d])=>d),ue=Object.keys(C);var st=class{constructor(e,t={}){this.container=e,this.width=t.width||64,this.height=t.height||16,this.pixelGap=t.pixelGap||.1,this.buffer=[],this.prevBuffer=[],this._initBuffer(),this._colorPixels=[],this._extendedColorPixels=[],this.extendedWidth=this.width,this.effect="fixed",this.speed=50,this.animationId=null,this.lastFrameTime=0,this._isRunning=!1,this.pixelElements=[],this.svgCreated=!1,this._svg=null,this.effectManager=new W(this)}_initBuffer(){this.buffer=[],this.prevBuffer=[];for(let e=0;e<this.width*this.height;e++)this.buffer.push([0,0,0]),this.prevBuffer.push([-1,-1,-1])}_createSvg(){let t=100/this.width,i=t,s=this.height*i,r=this.pixelGap,n=document.createElementNS("http://www.w3.org/2000/svg","svg");n.setAttribute("viewBox",`0 0 100 ${s}`),n.setAttribute("preserveAspectRatio","xMidYMid meet"),n.style.width="100%",n.style.height="100%",n.style.display="block",this.pixelElements=[];for(let a=0;a<this.height;a++)for(let o=0;o<this.width;o++){let l=document.createElementNS("http://www.w3.org/2000/svg","rect");l.setAttribute("x",o*t),l.setAttribute("y",a*i),l.setAttribute("width",t-r),l.setAttribute("height",i-r),l.setAttribute("rx","0.3"),l.setAttribute("fill","rgb(17, 17, 17)"),n.appendChild(l),this.pixelElements.push(l)}this.container&&this.container.isConnected!==!1&&(this.container.innerHTML="",this.container.appendChild(n)),this._svg=n,this.svgCreated=!0}_ensureSvgInContainer(){return this.container?this._svg&&this._svg.parentNode===this.container?!0:this._svg&&this.container.isConnected!==!1?(this.container.innerHTML="",this.container.appendChild(this._svg),!0):!1:!1}setPixel(e,t,i){if(e>=0&&e<this.width&&t>=0&&t<this.height){let s=t*this.width+e;s<this.buffer.length&&(this.buffer[s]=i)}}clear(){for(let e=0;e<this.buffer.length;e++)this.buffer[e]=[0,0,0]}flush(){this.svgCreated?this._ensureSvgInContainer()||this._createSvg():this._createSvg();for(let e=0;e<this.buffer.length;e++){let t=this.buffer[e],i=this.prevBuffer[e];if(!t||!Array.isArray(t))continue;if(!i||!Array.isArray(i)){this.prevBuffer[e]=[-1,-1,-1];continue}let[s,r,n]=t,[a,o,l]=i;if(s!==a||r!==o||n!==l){let c=this.pixelElements[e];if(c){let h=s>20||r>20||n>20;c.setAttribute("fill",`rgb(${Math.round(s)}, ${Math.round(r)}, ${Math.round(n)})`),h?c.style.filter=`drop-shadow(0 0 2px rgb(${Math.round(s)}, ${Math.round(r)}, ${Math.round(n)}))`:c.style.filter=""}this.prevBuffer[e]=[s,r,n]}}}setData(e,t=null,i=null){this._colorPixels=e||[],t?(this._extendedColorPixels=t,this.extendedWidth=i||this.width):(this._extendedColorPixels=e||[],this.extendedWidth=this.width)}setEffect(e,t=50){let i=this._isRunning;this.effect!==e&&(this.effect=e,this.effectManager.initEffect(e,{speed:t})),this.speed=t,i&&e!=="fixed"&&this.start()}start(){this._isRunning||(this._isRunning=!0,this.lastFrameTime=performance.now(),this._animate())}stop(){this._isRunning=!1,this.animationId&&(cancelAnimationFrame(this.animationId),this.animationId=null)}get isRunning(){return this._isRunning}_animate(){if(!this._isRunning)return;let e=performance.now(),t=500-(this.speed-1)*4.7;e-this.lastFrameTime>=t&&(this.lastFrameTime=e,this.effectManager.step()),this._renderFrame(),this.animationId=requestAnimationFrame(()=>this._animate())}_renderFrame(){this.effectManager.render(this._colorPixels,this._extendedColorPixels,this.extendedWidth),this.flush()}renderStatic(){this.svgCreated||this._createSvg(),this._renderFrame()}setDimensions(e,t){(e!==this.width||t!==this.height)&&(this.width=e,this.height=t,this.extendedWidth=e,this._initBuffer(),this.svgCreated=!1,this.effectManager=new W(this),this.effect!=="fixed"&&this.effectManager.initEffect(this.effect,{speed:this.speed}))}setContainer(e){e!==this.container&&(this.container=e,this._svg&&e&&(e.innerHTML="",e.appendChild(this._svg)))}destroy(){this.stop(),this.pixelElements=[],this._svg=null,this.svgCreated=!1}};function Lt(d,e,t,i=1){let r=100/d,n=r,a=e*n,o=i*.1,l="";for(let c=0;c<e;c++)for(let h=0;h<d;h++){let f=t[c*d+h]||"#111",x=f!=="#111"&&f!=="#000"&&f!=="#1a1a1a"&&f!=="#050505"?`filter:drop-shadow(0 0 2px ${f});`:"";l+=`<rect x="${h*r}" y="${c*n}" width="${r-o}" height="${n-o}" fill="${f}" rx="0.3" style="${x}"/>`}return`
    <svg viewBox="0 0 100 ${a}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block;">
      ${l}
    </svg>`}var $t="iPIXEL_DisplayState",Yt={text:"",mode:"text",effect:"fixed",speed:50,fgColor:"#ff6600",bgColor:"#000000",font:"VCR_OSD_MONO",lastUpdate:0};function Jt(){try{let d=localStorage.getItem($t);if(d)return JSON.parse(d)}catch(d){console.warn("iPIXEL: Could not load saved state",d)}return{...Yt}}function Kt(d){try{localStorage.setItem($t,JSON.stringify(d))}catch(e){console.warn("iPIXEL: Could not save state",e)}}window.iPIXELDisplayState||(window.iPIXELDisplayState=Jt());function At(){return window.iPIXELDisplayState}function $(d){return window.iPIXELDisplayState={...window.iPIXELDisplayState,...d,lastUpdate:Date.now()},Kt(window.iPIXELDisplayState),window.dispatchEvent(new CustomEvent("ipixel-display-update",{detail:window.iPIXELDisplayState})),window.iPIXELDisplayState}var rt=new Map,nt=class extends O{constructor(){super(),this._renderer=null,this._displayContainer=null,this._lastState=null,this._cachedResolution=null,this._rendererId=null,this._handleDisplayUpdate=e=>{this._updateDisplay(e.detail)},window.addEventListener("ipixel-display-update",this._handleDisplayUpdate)}connectedCallback(){this._rendererId||(this._rendererId=`renderer_${Date.now()}_${Math.random().toString(36).substr(2,9)}`),rt.has(this._rendererId)&&(this._renderer=rt.get(this._rendererId)),L("VCR_OSD_MONO",16).then(()=>{this._lastState&&this._updateDisplay(this._lastState)}),L("VCR_OSD_MONO",24),L("VCR_OSD_MONO",32),L("CUSONG",16),L("CUSONG",24),L("CUSONG",32),H("VCR_OSD_MONO"),H("CUSONG")}disconnectedCallback(){window.removeEventListener("ipixel-display-update",this._handleDisplayUpdate),this._renderer&&this._rendererId&&(this._renderer.stop(),rt.set(this._rendererId,this._renderer))}_getResolutionCached(){let[e,t]=this.getResolution();if(e>0&&t>0&&e!==64){this._cachedResolution=[e,t];try{localStorage.setItem("iPIXEL_Resolution",JSON.stringify([e,t]))}catch{}}if(this._cachedResolution)return this._cachedResolution;try{let i=localStorage.getItem("iPIXEL_Resolution");if(i){let s=JSON.parse(i);if(Array.isArray(s)&&s.length===2)return this._cachedResolution=s,s}}catch{}return this._config?.width&&this._config?.height?[this._config.width,this._config.height]:[e||64,t||16]}_updateDisplay(e){if(!this._displayContainer)return;let[t,i]=this._getResolutionCached(),s=this.isOn();if(this._renderer?(this._renderer.setContainer(this._displayContainer),(this._renderer.width!==t||this._renderer.height!==i)&&this._renderer.setDimensions(t,i)):(this._renderer=new st(this._displayContainer,{width:t,height:i}),this._rendererId&&rt.set(this._rendererId,this._renderer)),!s){this._renderer.stop();let m=ht("",t,i,"#111","#050505");this._displayContainer.innerHTML=Lt(t,i,m);return}let r=e?.text||"",n=e?.effect||"fixed",a=e?.speed||50,o=e?.fgColor||"#ff6600",l=e?.bgColor||"#111",c=e?.mode||"text",h=e?.font||"VCR_OSD_MONO";this._lastState=e;let f=r,p=o;if(c==="clock"?(f=new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}),p="#00ff88"):c==="gif"?(f="GIF",p="#ff44ff"):c==="rhythm"&&(f="***",p="#44aaff"),C[n]?.category==="ambient")this._renderer.setData([],[],t);else{let m=Q(i),u=h!=="LEGACY"&&Tt(h,m),v=h!=="LEGACY"&&J(h),g=(w,k,I,T,R)=>{if(u){let M=Rt(w,k,I,T,R,h);if(M)return M}if(v){let M=St(w,k,I,T,R,h);if(M)return M}return ht(w,k,I,T,R)},_=(w,k,I,T,R)=>{if(u){let M=Ot(w,k,I,T,R,h);if(M)return M}if(v){let M=It(w,k,I,T,R,h);if(M)return M}return _t(w,k,I,T,R)},y=v?f.length*10:f.length*6;if((n==="scroll_ltr"||n==="scroll_rtl"||n==="bounce")&&y>t){let w=_(f,t,i,p,l),k=g(f,t,i,p,l);this._renderer.setData(k,w.pixels,w.width)}else{let w=g(f,t,i,p,l);this._renderer.setData(w)}}this._renderer.setEffect(n,a),n==="fixed"?(this._renderer.stop(),this._renderer.renderStatic()):this._renderer.start()}render(){if(!this._hass)return;let[e,t]=this._getResolutionCached(),i=this.isOn(),s=this._config.name||this.getEntity()?.attributes?.friendly_name||"iPIXEL Display",r=At(),a=this.getEntity()?.state||"",l=this.getRelatedEntity("select","_mode")?.state||r.mode||"text",c=r.text||a,h=r.effect||"fixed",f=r.speed||50,p=r.fgColor||"#ff6600",x=r.bgColor||"#111",b=r.font||"VCR_OSD_MONO",u=C[h]?.category==="ambient",v=Object.entries(C).filter(([y,S])=>S.category==="text").map(([y,S])=>`<option value="${y}">${S.name}</option>`).join(""),g=Object.entries(C).filter(([y,S])=>S.category==="ambient").map(([y,S])=>`<option value="${y}">${S.name}</option>`).join(""),_=Object.entries(C).filter(([y,S])=>S.category==="color").map(([y,S])=>`<option value="${y}">${S.name}</option>`).join("");this.shadowRoot.innerHTML=`
      <style>${P}
        .display-container { background: #000; border-radius: 8px; padding: 8px; border: 2px solid #222; }
        .display-screen {
          background: #000;
          border-radius: 4px;
          overflow: hidden;
          min-height: 60px;
        }
        .display-footer { display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.75em; opacity: 0.6; }
        .mode-badge { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; text-transform: capitalize; }
        .effect-badge { background: rgba(100,149,237,0.2); padding: 2px 6px; border-radius: 3px; margin-left: 4px; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">
              <span class="status-dot ${i?"":"off"}"></span>
              ${s}
            </div>
            <button class="icon-btn ${i?"active":""}" id="power-btn">
              <svg viewBox="0 0 24 24"><path d="M13,3H11V13H13V3M17.83,5.17L16.41,6.59C18.05,7.91 19,9.9 19,12A7,7 0 0,1 12,19A7,7 0 0,1 5,12C5,9.9 5.95,7.91 7.59,6.59L6.17,5.17C4.23,6.82 3,9.26 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12C21,9.26 19.77,6.82 17.83,5.17Z"/></svg>
            </button>
          </div>
          <div class="display-container">
            <div class="display-screen" id="display-screen"></div>
            <div class="display-footer">
              <span>${e} x ${t}</span>
              <span>
                <span class="mode-badge">${i?l:"Off"}</span>
                ${i&&h!=="fixed"?`<span class="effect-badge">${C[h]?.name||h}</span>`:""}
              </span>
            </div>
          </div>
        </div>
      </ha-card>`,this._displayContainer=this.shadowRoot.getElementById("display-screen"),this._updateDisplay({text:c,effect:h,speed:f,fgColor:p,bgColor:x,mode:l,font:b}),this._attachPowerButton()}_attachPowerButton(){this.shadowRoot.getElementById("power-btn")?.addEventListener("click",()=>{let e=this._switchEntityId;if(!e){let t=this.getRelatedEntity("switch");t&&(this._switchEntityId=t.entity_id,e=t.entity_id)}if(e&&this._hass.states[e])this._hass.callService("switch","toggle",{entity_id:e});else{let t=Object.keys(this._hass.states).filter(r=>r.startsWith("switch.")),i=this._config.entity?.replace(/^[^.]+\./,"").replace(/_?(text|display|gif_url)$/i,"")||"",s=t.find(r=>r.includes(i.substring(0,10)));s?(this._switchEntityId=s,this._hass.callService("switch","toggle",{entity_id:s})):console.warn("iPIXEL: No switch found. Entity:",this._config.entity,"Available:",t)}})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var ot=class extends O{render(){if(!this._hass)return;let e=this.isOn();this.shadowRoot.innerHTML=`
      <style>${P}</style>
      <ha-card>
        <div class="card-content">
          <div class="section-title">Quick Actions</div>
          <div class="control-row">
            <div class="button-grid button-grid-4">
              <button class="icon-btn ${e?"active":""}" data-action="power" title="Power">
                <svg viewBox="0 0 24 24"><path d="M13,3H11V13H13V3M17.83,5.17L16.41,6.59C18.05,7.91 19,9.9 19,12A7,7 0 0,1 12,19A7,7 0 0,1 5,12C5,9.9 5.95,7.91 7.59,6.59L6.17,5.17C4.23,6.82 3,9.26 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12C21,9.26 19.77,6.82 17.83,5.17Z"/></svg>
              </button>
              <button class="icon-btn" data-action="clear" title="Clear">
                <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>
              </button>
              <button class="icon-btn" data-action="clock" title="Clock">
                <svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/></svg>
              </button>
              <button class="icon-btn" data-action="sync" title="Sync Time">
                <svg viewBox="0 0 24 24"><path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4M18.2,7.27L19.62,5.85C18.27,4.5 16.5,3.5 14.5,3.13V5.17C15.86,5.5 17.08,6.23 18.2,7.27M20,12H22A10,10 0 0,0 12,2V4A8,8 0 0,1 20,12M5.8,16.73L4.38,18.15C5.73,19.5 7.5,20.5 9.5,20.87V18.83C8.14,18.5 6.92,17.77 5.8,16.73M4,12H2A10,10 0 0,0 12,22V20A8,8 0 0,1 4,12Z"/></svg>
              </button>
            </div>
          </div>
          <div class="section-title">Brightness</div>
          <div class="control-row">
            <div class="slider-row">
              <input type="range" class="slider" id="brightness" min="1" max="100" value="50">
              <span class="slider-value" id="brightness-val">50%</span>
            </div>
          </div>
          <div class="section-title">Display Mode</div>
          <div class="control-row">
            <div class="button-grid button-grid-3">
              <button class="mode-btn" data-mode="textimage">Text+Image</button>
              <button class="mode-btn" data-mode="text">Text</button>
              <button class="mode-btn" data-mode="clock">Clock</button>
              <button class="mode-btn" data-mode="gif">GIF</button>
              <button class="mode-btn" data-mode="rhythm">Rhythm</button>
            </div>
          </div>
          <div class="section-title">Orientation</div>
          <div class="control-row">
            <select class="dropdown" id="orientation">
              <option value="0">0\xB0 (Normal)</option>
              <option value="90">90\xB0</option>
              <option value="180">180\xB0</option>
              <option value="270">270\xB0</option>
            </select>
          </div>
          <div class="section-title">Screen Buffer</div>
          <div class="control-row">
            <div class="button-grid button-grid-3">
              ${[1,2,3,4,5,6,7,8,9].map(t=>`<button class="mode-btn" data-screen="${t}">${t}</button>`).join("")}
            </div>
          </div>
          <div class="section-title">Advanced</div>
          <div class="control-row">
            <div class="button-grid button-grid-2">
              <button class="mode-btn" id="diy-mode-btn" data-action="diy-on">DIY Mode On</button>
              <button class="mode-btn" data-action="diy-off">DIY Mode Off</button>
            </div>
          </div>
          <div class="control-row" style="margin-top: 8px;">
            <div style="display: flex; gap: 8px;">
              <input type="text" class="text-input" id="raw-command" placeholder="Raw hex (e.g., 05 00 07 01 01)" style="flex: 1;">
              <button class="btn btn-secondary" id="send-raw-btn">Send</button>
            </div>
          </div>
        </div>
      </ha-card>`,this._attachControlListeners()}_attachControlListeners(){this.shadowRoot.querySelectorAll("[data-action]").forEach(t=>{t.addEventListener("click",i=>{let s=i.currentTarget.dataset.action;if(s==="power"){let r=this.getRelatedEntity("switch");r&&this._hass.callService("switch","toggle",{entity_id:r.entity_id})}else s==="clear"?($({text:"",mode:"text",effect:"fixed",speed:50,fgColor:"#ff6600",bgColor:"#000000"}),this.callService("ipixel_color","clear_pixels")):s==="clock"?($({text:"",mode:"clock",effect:"fixed",speed:50,fgColor:"#00ff88",bgColor:"#000000"}),this.callService("ipixel_color","set_clock_mode",{style:1})):s==="sync"&&this.callService("ipixel_color","sync_time")})});let e=this.shadowRoot.getElementById("brightness");e&&(e.style.setProperty("--value",`${e.value}%`),e.addEventListener("input",t=>{t.target.style.setProperty("--value",`${t.target.value}%`),this.shadowRoot.getElementById("brightness-val").textContent=`${t.target.value}%`}),e.addEventListener("change",t=>{this.callService("ipixel_color","set_brightness",{level:parseInt(t.target.value)})})),this.shadowRoot.querySelectorAll("[data-mode]").forEach(t=>{t.addEventListener("click",i=>{let s=i.currentTarget.dataset.mode,r=this.getRelatedEntity("select","_mode");r&&this._hass.callService("select","select_option",{entity_id:r.entity_id,option:s}),$({mode:s,fgColor:{text:"#ff6600",textimage:"#ff6600",clock:"#00ff88",gif:"#ff44ff",rhythm:"#44aaff"}[s]||"#ff6600",text:s==="clock"?"":window.iPIXELDisplayState?.text||""}),this.shadowRoot.querySelectorAll("[data-mode]").forEach(a=>a.classList.remove("active")),i.currentTarget.classList.add("active")})}),this.shadowRoot.getElementById("orientation")?.addEventListener("change",t=>{let i=this.getRelatedEntity("select","_orientation");i&&this._hass.callService("select","select_option",{entity_id:i.entity_id,option:t.target.value})}),this.shadowRoot.querySelectorAll("[data-screen]").forEach(t=>{t.addEventListener("click",i=>{let s=parseInt(i.currentTarget.dataset.screen);this.callService("ipixel_color","set_screen",{screen:s}),this.shadowRoot.querySelectorAll("[data-screen]").forEach(r=>r.classList.remove("active")),i.currentTarget.classList.add("active")})}),this.shadowRoot.querySelectorAll('[data-action="diy-on"], [data-action="diy-off"]').forEach(t=>{t.addEventListener("click",i=>{let s=i.currentTarget.dataset.action==="diy-on";this.callService("ipixel_color","set_diy_mode",{enable:s})})}),this.shadowRoot.getElementById("send-raw-btn")?.addEventListener("click",()=>{let t=this.shadowRoot.getElementById("raw-command")?.value;t&&t.trim()&&this.callService("ipixel_color","send_raw_command",{hex_data:t.trim()})}),this.shadowRoot.getElementById("raw-command")?.addEventListener("keypress",t=>{if(t.key==="Enter"){let i=t.target.value;i&&i.trim()&&this.callService("ipixel_color","send_raw_command",{hex_data:i.trim()})}})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var at=class extends O{constructor(){super(),this._activeTab="text"}_buildTextEffectOptions(){let e=Object.entries(C).filter(([i,s])=>s.category===E.TEXT).map(([i,s])=>`<option value="${i}">${s.name}</option>`).join(""),t=Object.entries(C).filter(([i,s])=>s.category===E.COLOR).map(([i,s])=>`<option value="${i}">${s.name}</option>`).join("");return`
      <optgroup label="Text Effects">
        ${e}
      </optgroup>
      <optgroup label="Color Effects">
        ${t}
      </optgroup>
    `}_buildAmbientEffectOptions(){return Object.entries(C).filter(([e,t])=>t.category===E.AMBIENT).map(([e,t])=>`<option value="${e}">${t.name}</option>`).join("")}_buildAmbientGrid(){let e=this._selectedAmbient||"rainbow";return Object.entries(C).filter(([t,i])=>i.category===E.AMBIENT).map(([t,i])=>`
        <button class="effect-btn ${t===e?"active":""}" data-effect="${t}">
          ${i.name}
        </button>
      `).join("")}render(){if(!this._hass)return;let e=this._activeTab==="text";this.shadowRoot.innerHTML=`
      <style>${P}
        .tabs { display: flex; gap: 4px; margin-bottom: 16px; }
        .tab {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: rgba(255,255,255,0.05);
          color: var(--primary-text-color, #fff);
          cursor: pointer;
          border-radius: 8px;
          font-size: 0.9em;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .tab:hover { background: rgba(255,255,255,0.1); }
        .tab.active {
          background: var(--primary-color, #03a9f4);
          color: #fff;
        }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .input-row { display: flex; gap: 8px; margin-bottom: 12px; }
        .input-row .text-input { flex: 1; }
        select optgroup { font-weight: bold; color: var(--primary-text-color, #fff); }
        select option { font-weight: normal; }
        .effect-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .effect-btn {
          padding: 12px 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: var(--primary-text-color, #fff);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.75em;
          text-align: center;
          transition: all 0.2s ease;
        }
        .effect-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .effect-btn.active {
          background: var(--primary-color, #03a9f4);
          border-color: var(--primary-color, #03a9f4);
        }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="tabs">
            <button class="tab ${e?"active":""}" id="tab-text">Text</button>
            <button class="tab ${e?"":"active"}" id="tab-ambient">Ambient</button>
          </div>

          <!-- Text Tab -->
          <div class="tab-content ${e?"active":""}" id="content-text">
            <div class="section-title">Display Text</div>
            <div class="input-row">
              <input type="text" class="text-input" id="text-input" placeholder="Enter text to display...">
              <button class="btn btn-primary" id="send-btn">Send</button>
            </div>
            <div class="section-title">Effect</div>
            <div class="control-row">
              <select class="dropdown" id="text-effect">
                ${this._buildTextEffectOptions()}
              </select>
            </div>
            <div class="section-title">Speed</div>
            <div class="control-row">
              <div class="slider-row">
                <input type="range" class="slider" id="text-speed" min="1" max="100" value="50">
                <span class="slider-value" id="text-speed-val">50</span>
              </div>
            </div>
            <div class="section-title">Font</div>
            <div class="control-row">
              <select class="dropdown" id="font-select">
                <option value="VCR_OSD_MONO">VCR OSD Mono</option>
                <option value="CUSONG">CUSONG</option>
                <option value="LEGACY">Legacy (Bitmap)</option>
              </select>
            </div>
            <div class="section-title">Colors</div>
            <div class="control-row">
              <div class="color-row">
                <span style="font-size: 0.85em;">Text:</span>
                <input type="color" class="color-picker" id="text-color" value="#ff6600">
                <span style="font-size: 0.85em; margin-left: 16px;">Background:</span>
                <input type="color" class="color-picker" id="bg-color" value="#000000">
              </div>
            </div>
          </div>

          <!-- Ambient Tab -->
          <div class="tab-content ${e?"":"active"}" id="content-ambient">
            <div class="section-title">Ambient Effect</div>
            <div class="effect-grid" id="ambient-grid">
              ${this._buildAmbientGrid()}
            </div>
            <div class="section-title">Speed</div>
            <div class="control-row">
              <div class="slider-row">
                <input type="range" class="slider" id="ambient-speed" min="1" max="100" value="50">
                <span class="slider-value" id="ambient-speed-val">50</span>
              </div>
            </div>
            <button class="btn btn-primary" id="apply-ambient-btn" style="width: 100%; margin-top: 8px;">Apply Effect</button>
          </div>
        </div>
      </ha-card>`,this._attachListeners()}_getTextFormValues(){return{text:this.shadowRoot.getElementById("text-input")?.value||"",effect:this.shadowRoot.getElementById("text-effect")?.value||"fixed",speed:parseInt(this.shadowRoot.getElementById("text-speed")?.value||"50"),fgColor:this.shadowRoot.getElementById("text-color")?.value||"#ff6600",bgColor:this.shadowRoot.getElementById("bg-color")?.value||"#000000",font:this.shadowRoot.getElementById("font-select")?.value||"VCR_OSD_MONO"}}_getAmbientFormValues(){return{effect:this._selectedAmbient||"rainbow",speed:parseInt(this.shadowRoot.getElementById("ambient-speed")?.value||"50")}}_updateTextPreview(){let{text:e,effect:t,speed:i,fgColor:s,bgColor:r,font:n}=this._getTextFormValues();$({text:e||"Preview",mode:"text",effect:t,speed:i,fgColor:s,bgColor:r,font:n})}_updateAmbientPreview(){let{effect:e,speed:t}=this._getAmbientFormValues();$({text:"",mode:"ambient",effect:e,speed:t,fgColor:"#ffffff",bgColor:"#000000"})}_attachListeners(){this.shadowRoot.getElementById("tab-text")?.addEventListener("click",()=>{this._activeTab="text",this.render()}),this.shadowRoot.getElementById("tab-ambient")?.addEventListener("click",()=>{this._activeTab="ambient",this.render()});let e=this.shadowRoot.getElementById("text-speed");e&&(e.style.setProperty("--value",`${e.value}%`),e.addEventListener("input",i=>{i.target.style.setProperty("--value",`${i.target.value}%`),this.shadowRoot.getElementById("text-speed-val").textContent=i.target.value,this._updateTextPreview()})),this.shadowRoot.getElementById("text-effect")?.addEventListener("change",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("font-select")?.addEventListener("change",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("text-color")?.addEventListener("input",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("bg-color")?.addEventListener("input",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("text-input")?.addEventListener("input",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("send-btn")?.addEventListener("click",()=>{let{text:i,effect:s,speed:r,fgColor:n,bgColor:a,font:o}=this._getTextFormValues();if(i){$({text:i,mode:"text",effect:s,speed:r,fgColor:n,bgColor:a,font:o}),this._config.entity&&this._hass.callService("text","set_value",{entity_id:this._config.entity,value:i});let l=o==="LEGACY"?"CUSONG":o;this.callService("ipixel_color","display_text",{text:i,effect:s,speed:r,color_fg:this.hexToRgb(n),color_bg:this.hexToRgb(a),font:l})}}),this.shadowRoot.querySelectorAll(".effect-btn").forEach(i=>{i.addEventListener("click",s=>{let r=s.target.dataset.effect;this._selectedAmbient=r,this.shadowRoot.querySelectorAll(".effect-btn").forEach(n=>n.classList.remove("active")),s.target.classList.add("active"),this._updateAmbientPreview()})});let t=this.shadowRoot.getElementById("ambient-speed");t&&(t.style.setProperty("--value",`${t.value}%`),t.addEventListener("input",i=>{i.target.style.setProperty("--value",`${i.target.value}%`),this.shadowRoot.getElementById("ambient-speed-val").textContent=i.target.value,this._updateAmbientPreview()})),this.shadowRoot.getElementById("apply-ambient-btn")?.addEventListener("click",()=>{let{effect:i,speed:s}=this._getAmbientFormValues();$({text:"",mode:"ambient",effect:i,speed:s,fgColor:"#ffffff",bgColor:"#000000"})})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var lt=class extends O{render(){if(!this._hass)return;let e=this._config.items||[];this.shadowRoot.innerHTML=`
      <style>${P}
        .playlist-actions { display: flex; gap: 8px; margin-top: 12px; }
        .playlist-actions .btn { flex: 1; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="card-header"><div class="card-title">Playlist</div></div>
          <div id="playlist-items">
            ${e.length===0?'<div class="empty-state">No playlist items yet</div>':e.map((t,i)=>`
                <div class="list-item">
                  <div class="list-item-info">
                    <div class="list-item-name">${t.name||`Item ${i+1}`}</div>
                    <div class="list-item-meta">${t.mode||"text"} - ${(t.duration_ms||5e3)/1e3}s</div>
                  </div>
                  <div class="list-item-actions">
                    <button class="icon-btn" style="width:28px;height:28px;">
                      <svg viewBox="0 0 24 24" style="width:16px;height:16px;"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                    </button>
                  </div>
                </div>`).join("")}
          </div>
          <div class="playlist-actions">
            <button class="btn btn-success" id="start-btn">\u25B6 Start</button>
            <button class="btn btn-danger" id="stop-btn">\u25A0 Stop</button>
            <button class="btn btn-secondary" id="add-btn">+ Add</button>
          </div>
        </div>
      </ha-card>`,this.shadowRoot.getElementById("start-btn")?.addEventListener("click",()=>{this.callService("ipixel_color","start_playlist")}),this.shadowRoot.getElementById("stop-btn")?.addEventListener("click",()=>{this.callService("ipixel_color","stop_playlist")})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var ct=class extends O{render(){if(!this._hass)return;let e=new Date,t=(e.getHours()*60+e.getMinutes())/1440*100;this.shadowRoot.innerHTML=`
      <style>${P}
        .timeline { background: rgba(255,255,255,0.05); border-radius: 6px; padding: 12px; margin-bottom: 12px; }
        .timeline-header { display: flex; justify-content: space-between; font-size: 0.7em; opacity: 0.5; margin-bottom: 6px; }
        .timeline-bar { height: 24px; background: rgba(255,255,255,0.1); border-radius: 4px; position: relative; overflow: hidden; }
        .timeline-now { position: absolute; width: 2px; height: 100%; background: #f44336; left: ${t}%; }
        .power-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .power-row label { font-size: 0.85em; }
        .power-row input[type="time"] { padding: 6px 10px; background: rgba(255,255,255,0.08); border: 1px solid var(--ipixel-border); border-radius: 4px; color: inherit; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="section-title">Today's Timeline</div>
          <div class="timeline">
            <div class="timeline-header"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
            <div class="timeline-bar"><div class="timeline-now"></div></div>
          </div>
          <div class="section-title">Power Schedule</div>
          <div class="control-row">
            <div class="power-row">
              <label>On:</label><input type="time" id="power-on" value="07:00">
              <label>Off:</label><input type="time" id="power-off" value="22:00">
              <button class="btn btn-primary" id="save-power">Save</button>
            </div>
          </div>
          <div class="section-title">Time Slots</div>
          <div id="time-slots"><div class="empty-state">No time slots configured</div></div>
          <button class="btn btn-secondary" id="add-slot" style="width: 100%; margin-top: 8px;">+ Add Time Slot</button>
        </div>
      </ha-card>`,this.shadowRoot.getElementById("save-power")?.addEventListener("click",()=>{this.callService("ipixel_color","set_power_schedule",{enabled:!0,on_time:this.shadowRoot.getElementById("power-on")?.value,off_time:this.shadowRoot.getElementById("power-off")?.value})})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var dt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(e){this._config=e,this.render()}set hass(e){this._hass=e,this.render()}render(){if(!this._hass)return;let e=Object.keys(this._hass.states).filter(t=>t.startsWith("text.")||t.startsWith("switch.")).sort();this.shadowRoot.innerHTML=`
      <style>
        .row { margin-bottom: 12px; }
        label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 0.9em; }
        select, input {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
          background: var(--card-background-color);
          color: inherit;
          box-sizing: border-box;
        }
      </style>
      <div class="row">
        <label>Entity</label>
        <select id="entity">
          <option value="">Select entity</option>
          ${e.map(t=>`
            <option value="${t}" ${this._config?.entity===t?"selected":""}>
              ${this._hass.states[t]?.attributes?.friendly_name||t}
            </option>
          `).join("")}
        </select>
      </div>
      <div class="row">
        <label>Name (optional)</label>
        <input type="text" id="name" value="${this._config?.name||""}" placeholder="Display name">
      </div>`,this.shadowRoot.querySelectorAll("select, input").forEach(t=>{t.addEventListener("change",()=>this.fireConfig())})}fireConfig(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:{type:this._config?.type||"custom:ipixel-display-card",entity:this.shadowRoot.getElementById("entity")?.value,name:this.shadowRoot.getElementById("name")?.value||void 0}},bubbles:!0,composed:!0}))}};customElements.define("ipixel-display-card",nt);customElements.define("ipixel-controls-card",ot);customElements.define("ipixel-text-card",at);customElements.define("ipixel-playlist-card",lt);customElements.define("ipixel-schedule-card",ct);customElements.define("ipixel-simple-editor",dt);window.customCards=window.customCards||[];[{type:"ipixel-display-card",name:"iPIXEL Display",description:"LED matrix preview with power control"},{type:"ipixel-controls-card",name:"iPIXEL Controls",description:"Brightness, mode, and orientation controls"},{type:"ipixel-text-card",name:"iPIXEL Text",description:"Text input with effects and colors"},{type:"ipixel-playlist-card",name:"iPIXEL Playlist",description:"Playlist management"},{type:"ipixel-schedule-card",name:"iPIXEL Schedule",description:"Power schedule and time slots"}].forEach(d=>window.customCards.push({...d,preview:!0,documentationURL:"https://github.com/cagcoach/ha-ipixel-color"}));console.info(`%c iPIXEL Cards %c ${yt} `,"background:#03a9f4;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;","background:#333;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");})();

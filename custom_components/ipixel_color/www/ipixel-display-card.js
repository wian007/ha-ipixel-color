(()=>{var re=Object.defineProperty;var Ht=(d,e)=>()=>(d&&(e=d(d=0)),e);var zt=(d,e)=>{for(var t in e)re(d,t,{get:e[t],enumerable:!0})};var qt={};zt(qt,{$Bitmap:()=>_e,$Font:()=>me,$Glyph:()=>be,Bitmap:()=>V,Font:()=>lt,Glyph:()=>F});var X,he,fe,Gt,pe,ue,ge,rt,lt,F,V,me,be,_e,Ut=Ht(()=>{X=function(d,e,t,s){function i(o){return o instanceof t?o:new t(function(n){n(o)})}return new(t||(t=Promise))(function(o,n){function r(c){try{l(s.next(c))}catch(f){n(f)}}function a(c){try{l(s.throw(c))}catch(f){n(f)}}function l(c){c.done?o(c.value):i(c.value).then(r,a)}l((s=s.apply(d,e||[])).next())})},he=function(d){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var e=d[Symbol.asyncIterator],t;return e?e.call(d):(d=typeof __values=="function"?__values(d):d[Symbol.iterator](),t={},s("next"),s("throw"),s("return"),t[Symbol.asyncIterator]=function(){return this},t);function s(o){t[o]=d[o]&&function(n){return new Promise(function(r,a){n=d[o](n),i(r,a,n.done,n.value)})}}function i(o,n,r,a){Promise.resolve(a).then(function(l){o({value:l,done:r})},n)}},fe=(d,e,t)=>{d[e]=t},Gt="[\\s]+",pe={glyphname:"empty",codepoint:8203,bbw:0,bbh:0,bbxoff:0,bbyoff:0,swx0:0,swy0:0,dwx0:0,dwy0:0,swx1:0,swy1:0,dwx1:0,dwy1:0,vvectorx:0,vvectory:0,hexdata:[]},ue=["glyphname","codepoint","bbw","bbh","bbxoff","bbyoff","swx0","swy0","dwx0","dwy0","swx1","swy1","dwx1","dwy1","vvectorx","vvectory","hexdata"],ge={lr:"lrtb",rl:"rltb",tb:"tbrl",bt:"btrl",lrtb:void 0,lrbt:void 0,rltb:void 0,rlbt:void 0,tbrl:void 0,tblr:void 0,btrl:void 0,btlr:void 0},rt={lr:1,rl:2,tb:0,bt:-1},lt=class{constructor(){this.headers=void 0,this.__headers={},this.props={},this.glyphs=new Map,this.__glyph_count_to_check=null,this.__curline_startchar=null,this.__curline_chars=null}load_filelines(e){var t,s;return X(this,void 0,void 0,function*(){try{this.__f=e,yield this.__parse_headers()}finally{if(typeof Deno<"u"&&this.__f!==void 0)try{for(var i=he(this.__f),o;o=yield i.next(),!o.done;){let n=o.value}}catch(n){t={error:n}}finally{try{o&&!o.done&&(s=i.return)&&(yield s.call(i))}finally{if(t)throw t.error}}}return this})}__parse_headers(){var e,t;return X(this,void 0,void 0,function*(){for(;;){let s=(t=yield(e=this.__f)===null||e===void 0?void 0:e.next())===null||t===void 0?void 0:t.value,i=s.split(/ (.+)/,2),o=i.length,n;if(o===2){let r=i[0],a=i[1].trim();switch(r){case"STARTFONT":this.__headers.bdfversion=parseFloat(a);break;case"FONT":this.__headers.fontname=a;break;case"SIZE":n=a.split(" "),this.__headers.pointsize=parseInt(n[0],10),this.__headers.xres=parseInt(n[1],10),this.__headers.yres=parseInt(n[2],10);break;case"FONTBOUNDINGBOX":n=a.split(" "),this.__headers.fbbx=parseInt(n[0],10),this.__headers.fbby=parseInt(n[1],10),this.__headers.fbbxoff=parseInt(n[2],10),this.__headers.fbbyoff=parseInt(n[3],10);break;case"STARTPROPERTIES":this.__parse_headers_after(),yield this.__parse_props();return;case"COMMENT":(!("comment"in this.__headers)||!Array.isArray(this.__headers.comment))&&(this.__headers.comment=[]),this.__headers.comment.push(a.replace(/^[\s"'\t\r\n]+|[\s"'\t\r\n]+$/g,""));break;case"SWIDTH":n=a.split(" "),this.__headers.swx0=parseInt(n[0],10),this.__headers.swy0=parseInt(n[1],10);break;case"DWIDTH":n=a.split(" "),this.__headers.dwx0=parseInt(n[0],10),this.__headers.dwy0=parseInt(n[1],10);break;case"SWIDTH1":n=a.split(" "),this.__headers.swx1=parseInt(n[0],10),this.__headers.swy1=parseInt(n[1],10);break;case"DWIDTH1":n=a.split(" "),this.__headers.dwx1=parseInt(n[0],10),this.__headers.dwy1=parseInt(n[1],10);break;case"VVECTOR":n=Gt.split(a),this.__headers.vvectorx=parseInt(n[0],10),this.__headers.vvectory=parseInt(n[1],10);break;case"METRICSSET":case"CONTENTVERSION":this.__headers[r.toLowerCase()]=parseInt(a,10);break;case"CHARS":console.warn("It looks like the font does not have property block beginning with 'STARTPROPERTIES' keyword"),this.__parse_headers_after(),this.__curline_chars=s,yield this.__parse_glyph_count();return;case"STARTCHAR":console.warn("It looks like the font does not have property block beginning with 'STARTPROPERTIES' keyword"),console.warn("Cannot find 'CHARS' line"),this.__parse_headers_after(),this.__curline_startchar=s,yield this.__prepare_glyphs();return}}if(o===1&&i[0].trim()==="ENDFONT"){console.warn("It looks like the font does not have property block beginning with 'STARTPROPERTIES' keyword"),console.warn("This font does not have any glyphs");return}}})}__parse_headers_after(){"metricsset"in this.__headers||(this.__headers.metricsset=0),this.headers=this.__headers}__parse_props(){var e,t;return X(this,void 0,void 0,function*(){for(;;){let i=((t=yield(e=this.__f)===null||e===void 0?void 0:e.next())===null||t===void 0?void 0:t.value).split(/ (.+)/,2),o=i.length;if(o===2){let n=i[0],r=i[1].replace(/^[\s"'\t\r\n]+|[\s"'\t\r\n]+$/g,"");n==="COMMENT"?((!("comment"in this.props)||!Array.isArray(this.props.comment))&&(this.props.comment=[]),this.props.comment.push(r.replace(/^[\s"'\t\r\n]+|[\s"'\t\r\n]+$/g,""))):this.props[n.toLowerCase()]=r}else if(o===1){let n=i[0].trim();if(n==="ENDPROPERTIES"){yield this.__parse_glyph_count();return}if(n==="ENDFONT"){console.warn("This font does not have any glyphs");return}else this.props[n]=null}}})}__parse_glyph_count(){var e,t;return X(this,void 0,void 0,function*(){let s;if(this.__curline_chars===null?s=(t=yield(e=this.__f)===null||e===void 0?void 0:e.next())===null||t===void 0?void 0:t.value:(s=this.__curline_chars,this.__curline_chars=null),s.trim()==="ENDFONT"){console.warn("This font does not have any glyphs");return}let i=s.split(/ (.+)/,2);i[0]==="CHARS"?this.__glyph_count_to_check=parseInt(i[1].trim(),10):(this.__curline_startchar=s,console.warn("Cannot find 'CHARS' line next to 'ENDPROPERTIES' line")),yield this.__prepare_glyphs()})}__prepare_glyphs(){var e,t;return X(this,void 0,void 0,function*(){let s=0,i=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],o=[],n=!1,r=!1;for(;;){let a;if(this.__curline_startchar===null?a=(t=yield(e=this.__f)===null||e===void 0?void 0:e.next())===null||t===void 0?void 0:t.value:(a=this.__curline_startchar,this.__curline_startchar=null),a==null){console.warn("This font does not have 'ENDFONT' keyword"),this.__prepare_glyphs_after();return}let l=a.split(/ (.+)/,2),c=l.length;if(c===2){let f=l[0],h=l[1].trim(),u;switch(f){case"STARTCHAR":i=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],i[0]=h,r=!1;break;case"ENCODING":s=parseInt(h,10),i[1]=s;break;case"BBX":u=h.split(" "),i[2]=parseInt(u[0],10),i[3]=parseInt(u[1],10),i[4]=parseInt(u[2],10),i[5]=parseInt(u[3],10);break;case"SWIDTH":u=h.split(" "),i[6]=parseInt(u[0],10),i[7]=parseInt(u[1],10);break;case"DWIDTH":u=h.split(" "),i[8]=parseInt(u[0],10),i[9]=parseInt(u[1],10);break;case"SWIDTH1":u=h.split(" "),i[10]=parseInt(u[0],10),i[11]=parseInt(u[1],10);break;case"DWIDTH1":u=h.split(" "),i[12]=parseInt(u[0],10),i[13]=parseInt(u[1],10);break;case"VVECTOR":u=Gt.split(h),i[14]=parseInt(u[0],10),i[15]=parseInt(u[1],10);break}}else if(c===1){let f=l[0].trim();switch(f){case"BITMAP":o=[],n=!0;break;case"ENDCHAR":n=!1,i[16]=o,this.glyphs.set(s,i),r=!0;break;case"ENDFONT":if(r){this.__prepare_glyphs_after();return}default:n&&o.push(f);break}}}})}__prepare_glyphs_after(){let e=this.glyphs.size;this.__glyph_count_to_check!==e&&(this.__glyph_count_to_check===null?console.warn("The glyph count next to 'CHARS' keyword does not exist"):console.warn(`The glyph count next to 'CHARS' keyword is ${this.__glyph_count_to_check.toString()}, which does not match the actual glyph count ${e.toString()}`))}get length(){return this.glyphs.size}itercps(e,t){let s=e??1,i=t??null,o,n=[...this.glyphs.keys()];switch(s){case 1:o=n.sort((r,a)=>r-a);break;case 0:o=n;break;case 2:o=n.sort((r,a)=>a-r);break;case-1:o=n.reverse();break}if(i!==null){let r=a=>{if(typeof i=="number")return a<i;if(Array.isArray(i)&&i.length===2&&typeof i[0]=="number"&&typeof i[1]=="number")return a<=i[1]&&a>=i[0];if(Array.isArray(i)&&Array.isArray(i[0]))for(let l of i){let[c,f]=l;if(a<=f&&a>=c)return!0}return!1};o=o.filter(r)}return o}*iterglyphs(e,t){for(let s of this.itercps(e,t))yield this.glyphbycp(s)}glyphbycp(e){let t=this.glyphs.get(e);if(t==null)return console.warn(`Glyph "${String.fromCodePoint(e)}" (codepoint ${e.toString()}) does not exist in the font. Will return 'null'`),null;{let s={};return ue.forEach((i,o)=>{fe(s,i,t[o])}),new F(s,this)}}glyph(e){let t=e.codePointAt(0);return t===void 0?null:this.glyphbycp(t)}lacksglyphs(e){let t=[],s=e.length;for(let i,o=0;o<s;o++){i=e[o];let n=i.codePointAt(0);(n===void 0||!this.glyphs.has(n))&&t.push(i)}return t.length!==0?t:null}drawcps(e,t={}){var s,i,o,n,r,a,l;let c=(s=t.linelimit)!==null&&s!==void 0?s:512,f=(i=t.mode)!==null&&i!==void 0?i:1,h=(o=t.direction)!==null&&o!==void 0?o:"lrtb",u=(n=t.usecurrentglyphspacing)!==null&&n!==void 0?n:!1,p=(r=t.missing)!==null&&r!==void 0?r:null;if(this.headers===void 0)throw new Error("Font is not loaded");let g,v,m,b,_,y,w,I,E,C,k,R,x,S,P,A,B,z,Y=(a=ge[h])!==null&&a!==void 0?a:h,J=Y.slice(0,2),K=Y.slice(2,4);J in rt&&K in rt?(y=rt[J],w=rt[K]):(y=1,w=0),w===0||w===2?g=1:(w===1||w===-1)&&(g=0),y===1||y===-1?v=1:(y===2||y===0)&&(v=0),f===1&&(I=y>0?this.headers.fbbx:this.headers.fbby,y>0?(R="dwx0",x="dwy0"):(R="dwx1",x="dwy1"),R in this.headers?k=this.headers[R]:x in this.headers?k=this.headers[x]:k=null);let Z=[];b=[];let D=[];P=[],A=0;let Ft=()=>{Z.push(b),u?P.shift():P.pop(),D.push(P)},oe=e[Symbol.iterator]();for(B=!1;;){if(B)B=!1;else{if(_=(l=oe.next())===null||l===void 0?void 0:l.value,_===void 0)break;let nt=this.glyphbycp(_);nt!==null?E=nt:p?p instanceof F?E=p:E=new F(p,this):E=new F(pe,this),m=E.draw(),z=m.width(),S=0,f===1&&R!==void 0&&x!==void 0&&(C=E.meta[R]||E.meta[x],C==null&&(C=k),C!=null&&I!==void 0&&(S=C-I))}if(z!==void 0&&S!==void 0&&m!==void 0&&E!==void 0&&_!==void 0)if(A+=z+S,A<=c)b.push(m),P.push(S);else{if(b.length===0)throw new Error(`\`_linelimit\` (${c}) is too small the line can't even contain one glyph: "${E.chr()}" (codepoint ${_}, width: ${z})`);Ft(),A=0,b=[],P=[],B=!0}}b.length!==0&&Ft();let ne=Z.map((nt,ae)=>V.concatall(nt,{direction:y,align:g,offsetlist:D[ae]}));return V.concatall(ne,{direction:w,align:v})}draw(e,t={}){let{linelimit:s,mode:i,direction:o,usecurrentglyphspacing:n,missing:r}=t;return this.drawcps(e.split("").map(a=>{let l=a.codePointAt(0);return l===void 0?8203:l}),{linelimit:s,mode:i,direction:o,usecurrentglyphspacing:n,missing:r})}drawall(e={}){let{order:t,r:s,linelimit:i,mode:o,direction:n,usecurrentglyphspacing:r}=e,a=o??0;return this.drawcps(this.itercps(t,s),{linelimit:i,mode:a,direction:n,usecurrentglyphspacing:r})}},F=class{constructor(e,t){this.meta=e,this.font=t}toString(){return this.draw().toString()}repr(){var e;return"Glyph("+JSON.stringify(this.meta,null,2)+", Font(<"+((e=this.font.headers)===null||e===void 0?void 0:e.fontname)+">)"}cp(){return this.meta.codepoint}chr(){return String.fromCodePoint(this.cp())}draw(e,t){let s=e??0,i=t??null,o;switch(s){case 0:o=this.__draw_fbb();break;case 1:o=this.__draw_bb();break;case 2:o=this.__draw_original();break;case-1:if(i!==null)o=this.__draw_user_specified(i);else throw new Error("Parameter bb in draw() method must be set when mode=-1");break}return o}__draw_user_specified(e){let t=this.meta.bbxoff,s=this.meta.bbyoff,[i,o,n,r]=e;return this.__draw_bb().crop(i,o,-t+n,-s+r)}__draw_original(){return new V(this.meta.hexdata.map(e=>e?parseInt(e,16).toString(2).padStart(e.length*4,"0"):""))}__draw_bb(){let e=this.meta.bbw,t=this.meta.bbh,s=this.__draw_original(),i=s.bindata,o=i.length;return o!==t&&console.warn(`Glyph "${this.meta.glyphname.toString()}" (codepoint ${this.meta.codepoint.toString()})'s bbh, ${t.toString()}, does not match its hexdata line count, ${o.toString()}`),s.bindata=i.map(n=>n.slice(0,e)),s}__draw_fbb(){let e=this.font.headers;if(e===void 0)throw new Error("Font is not loaded");return this.__draw_user_specified([e.fbbx,e.fbby,e.fbbxoff,e.fbbyoff])}origin(e={}){var t,s,i,o;let n=(t=e.mode)!==null&&t!==void 0?t:0,r=(s=e.fromorigin)!==null&&s!==void 0?s:!1,a=(i=e.xoff)!==null&&i!==void 0?i:null,l=(o=e.yoff)!==null&&o!==void 0?o:null,c,f=this.meta.bbxoff,h=this.meta.bbyoff;switch(n){case 0:let u=this.font.headers;if(u===void 0)throw new Error("Font is not loaded");c=[u.fbbxoff,u.fbbyoff];break;case 1:c=[f,h];break;case 2:c=[f,h];break;case-1:if(a!==null&&l!==null)c=[a,l];else throw new Error("Parameter xoff and yoff in origin() method must be all set when mode=-1");break}return r?c:[0-c[0],0-c[1]]}},V=class d{constructor(e){this.bindata=e}toString(){return this.bindata.join(`
`).replace(/0/g,".").replace(/1/g,"#").replace(/2/g,"&")}repr(){return`Bitmap(${JSON.stringify(this.bindata,null,2)})`}width(){return this.bindata[0].length}height(){return this.bindata.length}clone(){return new d([...this.bindata])}static __crop_string(e,t,s){let i=e,o=e.length,n=0;t<0&&(n=0-t,i=i.padStart(n+o,"0")),t+s>o&&(i=i.padEnd(t+s-o+i.length,"0"));let r=t+n;return i.slice(r,r+s)}static __string_offset_concat(e,t,s){let i=s??0;if(i===0)return e+t;let o=e.length,n=t.length,r=o+i,a=r+n,l=Math.min(0,r),c=Math.max(o,a),f=d.__crop_string(e,l,c-l),h=d.__crop_string(t,l-r,c-l);return f.split("").map((u,p)=>(parseInt(h[p],10)||parseInt(u,10)).toString()).join("")}static __listofstr_offset_concat(e,t,s){let i=s??0,o,n;if(i===0)return e.concat(t);let r=e[0].length,a=e.length,l=t.length,c=a+i,f=c+l,h=Math.min(0,c),u=Math.max(a,f),p=[];for(let g=h;g<u;g++)g<0||g>=a?o="0".repeat(r):o=e[g],g<c||g>=f?n="0".repeat(r):n=t[g-c],p.push(o.split("").map((v,m)=>(parseInt(n[m],10)||parseInt(v,10)).toString()).join(""));return p}static __crop_bitmap(e,t,s,i,o){let n,r=[],a=e.length;for(let l=0;l<s;l++)n=a-o-s+l,n<0||n>=a?r.push("0".repeat(t)):r.push(d.__crop_string(e[n],i,t));return r}crop(e,t,s,i){let o=s??0,n=i??0;return this.bindata=d.__crop_bitmap(this.bindata,e,t,o,n),this}overlay(e){let t=this.bindata,s=e.bindata;return t.length!==s.length&&console.warn("the bitmaps to overlay have different height"),t[0].length!==s[0].length&&console.warn("the bitmaps to overlay have different width"),this.bindata=t.map((i,o)=>{let n=i,r=s[o];return n.split("").map((a,l)=>(parseInt(r[l],10)||parseInt(a,10)).toString()).join("")}),this}static concatall(e,t={}){var s,i,o;let n=(s=t.direction)!==null&&s!==void 0?s:1,r=(i=t.align)!==null&&i!==void 0?i:1,a=(o=t.offsetlist)!==null&&o!==void 0?o:null,l,c,f,h,u,p,g;if(n>0){f=Math.max(...e.map(m=>m.height())),u=Array(f).fill("");let v=(m,b,_)=>n===1?d.__string_offset_concat(m,b,_):d.__string_offset_concat(b,m,_);for(let m=0;m<f;m++){r?c=-m-1:c=m,h=0;let b=e.length;for(let _=0;_<b;_++){let y=e[_];a&&_!==0&&(h=a[_-1]),m<y.height()?c>=0?u[c]=v(u[c],y.bindata[c],h):u[f+c]=v(u[f+c],y.bindata[y.height()+c],h):c>=0?u[c]=v(u[c],"0".repeat(y.width()),h):u[f+c]=v(u[f+c],"0".repeat(y.width()),h)}}}else{f=Math.max(...e.map(m=>m.width())),u=[],h=0;let v=e.length;for(let m=0;m<v;m++){let b=e[m];a&&m!==0&&(h=a[m-1]),l=b.bindata,p=b.width(),p!==f&&(r?g=0:g=p-f,l=this.__crop_bitmap(l,f,b.height(),g,0)),n===0?u=d.__listofstr_offset_concat(u,l,h):u=d.__listofstr_offset_concat(l,u,h)}}return new this(u)}concat(e,t={}){let{direction:s,align:i,offset:o}=t,n=o??0;return this.bindata=d.concatall([this,e],{direction:s,align:i,offsetlist:[n]}).bindata,this}static __enlarge_bindata(e,t,s){let i=t??1,o=s??1,n=[...e];return i>1&&(n=n.map(r=>r.split("").reduce((a,l)=>a.concat(Array(i).fill(l)),[]).join(""))),o>1&&(n=n.reduce((r,a)=>r.concat(Array(o).fill(a)),[])),n}enlarge(e,t){return this.bindata=d.__enlarge_bindata(this.bindata,e,t),this}replace(e,t){let s=typeof e=="number"?e.toString():e,i=typeof t=="number"?t.toString():t,o=(n,r,a)=>{if("replaceAll"in String.prototype)return n.replaceAll(r,a);{let l=c=>c.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&");return n.replace(new RegExp(l(r),"g"),a)}};return this.bindata=this.bindata.map(n=>o(n,s,i)),this}shadow(e,t){let s=e??1,i=t??-1,o,n,r,a,l,c,f=this.clone();return c=this.width(),o=this.height(),c+=Math.abs(s),o+=Math.abs(i),f.bindata=f.bindata.map(h=>h.replace(/1/g,"2")),s>0?(n=0,a=-s):(n=s,a=0),i>0?(r=0,l=-i):(r=i,l=0),this.crop(c,o,n,r),f.crop(c,o,a,l),f.overlay(this),this.bindata=f.bindata,this}glow(e){var t,s,i,o,n,r,a,l,c,f,h,u,p,g;let v=e??0,m,b,_,y;_=this.width(),y=this.height(),_+=2,y+=2,this.crop(_,y,-1,-1);let w=this.todata(2),I=w.length;for(let E=0;E<I;E++){m=w[E];let C=m.length;for(let k=0;k<C;k++)b=m[k],b===1&&((t=w[E])[s=k-1]||(t[s]=2),(i=w[E])[o=k+1]||(i[o]=2),(n=w[E-1])[k]||(n[k]=2),(r=w[E+1])[k]||(r[k]=2),v===1&&((a=w[E-1])[l=k-1]||(a[l]=2),(c=w[E-1])[f=k+1]||(c[f]=2),(h=w[E+1])[u=k-1]||(h[u]=2),(p=w[E+1])[g=k+1]||(p[g]=2)))}return this.bindata=w.map(E=>E.map(C=>C.toString()).join("")),this}bytepad(e){let t=e??8,s=this.width(),i=this.height(),o=s%t;return o===0?this:this.crop(s+t-o,i)}todata(e){let t=e??1,s;switch(t){case 0:s=this.bindata.join(`
`);break;case 1:s=this.bindata;break;case 2:s=this.bindata.map(i=>i.split("").map(o=>parseInt(o,10)));break;case 3:s=[].concat(...this.todata(2));break;case 4:s=this.bindata.map(i=>{if(!/^[01]+$/.test(i))throw new Error(`Invalid binary string: ${i}`);return parseInt(i,2).toString(16).padStart(Math.floor(-1*this.width()/4)*-1,"0")});break;case 5:s=this.bindata.map(i=>{if(!/^[01]+$/.test(i))throw new Error(`Invalid binary string: ${i}`);return parseInt(i,2)});break}return s}draw2canvas(e,t){let s=t??{0:null,1:"black",2:"red"};return this.todata(2).forEach((i,o)=>{i.forEach((n,r)=>{let a=n.toString();if(a==="0"||a==="1"||a==="2"){let l=s[a];l!=null&&(e.fillStyle=l,e.fillRect(r,o,1,1))}})}),this}},me=d=>X(void 0,void 0,void 0,function*(){return yield new lt().load_filelines(d)}),be=(d,e)=>new F(d,e),_e=d=>new V(d)});var Yt={};zt(Yt,{default:()=>Ee});function Ee(d,{includeLastEmptyLine:e=!0,encoding:t="utf-8",delimiter:s=/\r?\n/g}={}){return xe(this,arguments,function*(){let o=yield H(we(d)),{value:n,done:r}=yield H(o.read()),a=new TextDecoder(t),l=n?a.decode(n):"",c;if(typeof s=="string"){if(s==="")throw new Error("delimiter cannot be empty string!");c=new RegExp(ye(s),"g")}else/g/.test(s.flags)===!1?c=new RegExp(s.source,s.flags+"g"):c=s;let f=0;for(;;){let h=c.exec(l);if(h===null){if(r===!0)break;let u=l.substring(f);({value:n,done:r}=yield H(o.read())),l=u+(l?a.decode(n):""),f=0;continue}yield yield H(l.substring(f,h.index)),f=c.lastIndex}(e||f<l.length)&&(yield yield H(l.substring(f)))})}var ve,H,xe,ye,we,Jt=Ht(()=>{ve=function(d,e,t,s){function i(o){return o instanceof t?o:new t(function(n){n(o)})}return new(t||(t=Promise))(function(o,n){function r(c){try{l(s.next(c))}catch(f){n(f)}}function a(c){try{l(s.throw(c))}catch(f){n(f)}}function l(c){c.done?o(c.value):i(c.value).then(r,a)}l((s=s.apply(d,e||[])).next())})},H=function(d){return this instanceof H?(this.v=d,this):new H(d)},xe=function(d,e,t){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var s=t.apply(d,e||[]),i,o=[];return i={},n("next"),n("throw"),n("return"),i[Symbol.asyncIterator]=function(){return this},i;function n(h){s[h]&&(i[h]=function(u){return new Promise(function(p,g){o.push([h,u,p,g])>1||r(h,u)})})}function r(h,u){try{a(s[h](u))}catch(p){f(o[0][3],p)}}function a(h){h.value instanceof H?Promise.resolve(h.value.v).then(l,c):f(o[0][2],h)}function l(h){r("next",h)}function c(h){r("throw",h)}function f(h,u){h(u),o.shift(),o.length&&r(o[0][0],o[0][1])}},ye=d=>d.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&"),we=d=>ve(void 0,void 0,void 0,function*(){let e=yield fetch(d);if(e.body===null)throw new Error("Cannot read file");return e.body.getReader()})});var Vt="2.12.0";var Nt="iPIXEL_DisplayState",Xt="iPIXEL_TestMode",le={text:"",mode:"text",effect:"fixed",speed:50,fgColor:"#ff6600",bgColor:"#000000",font:"VCR_OSD_MONO",lastUpdate:0};function ce(){try{let d=localStorage.getItem(Nt);if(d)return JSON.parse(d)}catch(d){console.warn("iPIXEL: Could not load saved state",d)}return{...le}}function de(d){try{localStorage.setItem(Nt,JSON.stringify(d))}catch(e){console.warn("iPIXEL: Could not save state",e)}}window.iPIXELDisplayState||(window.iPIXELDisplayState=ce());function at(){return window.iPIXELDisplayState}function M(d){return window.iPIXELDisplayState={...window.iPIXELDisplayState,...d,lastUpdate:Date.now()},de(window.iPIXELDisplayState),window.dispatchEvent(new CustomEvent("ipixel-display-update",{detail:window.iPIXELDisplayState})),window.iPIXELDisplayState}function N(){if(window.iPIXELTestMode!==void 0)return window.iPIXELTestMode;try{return localStorage.getItem(Xt)==="true"}catch{return!1}}function jt(d){window.iPIXELTestMode=d;try{localStorage.setItem(Xt,String(d))}catch{}window.dispatchEvent(new CustomEvent("ipixel-test-mode-change",{detail:{enabled:d}}))}function Wt(){let d=[];typeof navigator<"u"&&!navigator.bluetooth&&d.push("WebBluetooth");try{document.createElement("canvas").getContext("2d")||d.push("Canvas")}catch{d.push("Canvas")}return d}var $=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._config={},this._hass=null,this._handleTestModeChange=()=>this.render(),window.addEventListener("ipixel-test-mode-change",this._handleTestModeChange)}disconnectedCallback(){window.removeEventListener("ipixel-test-mode-change",this._handleTestModeChange)}set hass(e){this._hass=e,this.render()}setConfig(e){if(!e.entity&&!N()){this._config=e;return}this._config=e,this.render()}isInTestMode(){return N()||!this._config.entity||!this.getEntity()}getEntity(){return!this._hass||!this._config.entity?null:this._hass.states[this._config.entity]}getRelatedEntity(e,t=""){if(!this._hass||!this._config.entity)return null;let s=(t||(e==="switch"?"power":"")).replace(/^_/,""),i=this._hass.entities||{},o=i[this._config.entity];if(o?.device_id){let c=Object.values(i).filter(h=>h.device_id===o.device_id&&h.entity_id.startsWith(`${e}.`)&&this._hass.states[h.entity_id]),f=c.find(h=>h.translation_key===s)||c.find(h=>h.entity_id.endsWith(`_${s}`));if(f)return this._hass.states[f.entity_id];if(!s&&c.length)return this._hass.states[c[0].entity_id]}let n=this._config.entity.replace(/^[^.]+\./,"").replace(/_?(text|display|gif_url|image_url)$/i,""),r=`${e}.${n}${s?`_${s}`:""}`;if(this._hass.states[r])return this._hass.states[r];let a=Object.keys(this._hass.states).filter(c=>c.startsWith(`${e}.`)&&c.replace(/^[^.]+\./,"").startsWith(n));if(s){let c=a.find(f=>f.endsWith(`_${s}`));return c?this._hass.states[c]:null}let l=a.sort((c,f)=>c.length-f.length);return l.length?this._hass.states[l[0]]:null}async setRelatedEntity(e,t,s){let i=this.getRelatedEntity(e,t);if(!i){console.warn(`iPIXEL: no ${e} entity '${t}' found for ${this._config.entity}`);return}if(this.isInTestMode()){console.info(`iPIXEL [Test Mode]: ${e}.${t} = ${s}`);return}let o={entity_id:i.entity_id};if(e==="number")return this._hass.callService("number","set_value",{...o,value:s});if(e==="select")return this._hass.callService("select","select_option",{...o,option:String(s)});if(e==="switch")return this._hass.callService("switch",s?"turn_on":"turn_off",o);if(e==="text")return this._hass.callService("text","set_value",{...o,value:s})}async callService(e,t,s={}){if(this._hass){if(this.isInTestMode()){console.info(`iPIXEL [Test Mode]: ${e}.${t}`,s);return}e==="ipixel_color"&&this._config.entity&&!s.entity_id&&!s.device_id&&(s={...s,entity_id:this._config.entity});try{await this._hass.callService(e,t,s)}catch(i){console.error(`iPIXEL service call failed: ${e}.${t}`,i)}}}getResolution(){let e=this.getRelatedEntity("sensor","width"),t=this.getRelatedEntity("sensor","height");if(e&&t){let s=parseInt(e.state),i=parseInt(t.state);if(!isNaN(s)&&!isNaN(i)&&s>0&&i>0)return[s,i]}return[64,16]}isOn(){return this.isInTestMode()?!0:this.getRelatedEntity("switch","power")?.state==="on"}hexToRgb(e){let t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]:[255,255,255]}render(){}getCardSize(){return 2}};var L=`
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
    .button-grid-3 { grid-template-columns: repeat(2, 1fr); }
  }

  /* Mobile-friendly touch targets */
  @media (max-width: 600px) {
    .btn { padding: 10px 16px; min-height: 40px; }
    .icon-btn { width: 40px; height: 40px; }
    .slider::-webkit-slider-thumb { width: 24px; height: 24px; }
    .slider::-moz-range-thumb { width: 24px; height: 24px; }
    .dropdown { padding: 10px 12px; }
    .text-input { padding: 12px; }
  }
`;function ht(d){if(!d||d==="#111"||d==="#000")return[17,17,17];if(d==="#050505")return[5,5,5];let e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(d);return e?[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]:[17,17,17]}function tt(d,e,t){let s=0,i=0,o=0,n=Math.floor(d*6),r=d*6-n,a=t*(1-e),l=t*(1-r*e),c=t*(1-(1-r)*e);switch(n%6){case 0:s=t,i=c,o=a;break;case 1:s=l,i=t,o=a;break;case 2:s=a,i=t,o=c;break;case 3:s=a,i=l,o=t;break;case 4:s=c,i=a,o=t;break;case 5:s=t,i=a,o=l;break}return[s*255,i*255,o*255]}var ft=class{constructor(e){this.renderer=e}init(e,t){let{width:s,height:i}=this.renderer;switch(e){case"scroll_ltr":case"scroll_rtl":t.offset=0;break;case"blink":t.visible=!0;break;case"snow":case"breeze":t.phases=[];for(let o=0;o<s*i;o++)t.phases.push(Math.random()*Math.PI*2);break;case"laser":t.position=0;break;case"fade":t.opacity=0,t.direction=1;break;case"typewriter":t.charIndex=0,t.cursorVisible=!0;break;case"bounce":t.offset=0,t.direction=1;break;case"sparkle":t.sparkles=[];for(let o=0;o<Math.floor(s*i*.1);o++)t.sparkles.push({x:Math.floor(Math.random()*s),y:Math.floor(Math.random()*i),brightness:Math.random(),speed:.05+Math.random()*.1});break}}step(e,t){let{width:s,extendedWidth:i}=this.renderer;switch(e){case"scroll_ltr":t.offset-=1,t.offset<=-(i||s)&&(t.offset=s);break;case"scroll_rtl":t.offset+=1,t.offset>=(i||s)&&(t.offset=-s);break;case"blink":t.visible=!t.visible;break;case"laser":t.position=(t.position+1)%s;break;case"fade":t.opacity+=t.direction*.05,t.opacity>=1?(t.opacity=1,t.direction=-1):t.opacity<=0&&(t.opacity=0,t.direction=1);break;case"typewriter":t.tick%3===0&&t.charIndex++,t.cursorVisible=t.tick%10<5;break;case"bounce":{t.offset+=t.direction;let o=Math.max(0,(i||s)-s);t.offset>=o?(t.offset=o,t.direction=-1):t.offset<=0&&(t.offset=0,t.direction=1);break}case"sparkle":{let o=t.sparkles;for(let n of o)n.brightness+=n.speed,n.brightness>1&&(n.brightness=0,n.x=Math.floor(Math.random()*s),n.y=Math.floor(Math.random()*this.renderer.height));break}}}render(e,t,s,i,o){let{width:n,height:r}=this.renderer,a=i||s||[],l=s||[],c=o||n;for(let f=0;f<r;f++)for(let h=0;h<n;h++){let u,p=h;if(e==="scroll_ltr"||e==="scroll_rtl"||e==="bounce"){for(p=h-(t.offset||0);p<0;)p+=c;for(;p>=c;)p-=c;u=a[f*c+p]||"#111"}else if(e==="typewriter"){let y=(t.charIndex||0)*6;h<y?u=l[f*n+h]||"#111":h===y&&t.cursorVisible?u="#ffffff":u="#111"}else u=l[f*n+h]||"#111";let[g,v,m]=ht(u);if(g>20||v>20||m>20)switch(e){case"blink":t.visible||(g=v=m=17);break;case"snow":{let _=t.phases,y=_?.[f*n+h]||0,w=t.tick||0,I=.3+.7*Math.abs(Math.sin(y+w*.3));g*=I,v*=I,m*=I;break}case"breeze":{let _=t.phases,y=_?.[f*n+h]||0,w=t.tick||0,I=.4+.6*Math.abs(Math.sin(y+w*.15+h*.2));g*=I,v*=I,m*=I;break}case"laser":{let _=t.position||0,w=Math.abs(h-_)<3?1:.3;g*=w,v*=w,m*=w;break}case"fade":{let _=t.opacity||1;g*=_,v*=_,m*=_;break}}if(e==="sparkle"&&t.sparkles){let _=t.sparkles;for(let y of _)if(y.x===h&&y.y===f){let w=Math.sin(y.brightness*Math.PI);g=Math.min(255,g+w*200),v=Math.min(255,v+w*200),m=Math.min(255,m+w*200)}}this.renderer.setPixel(h,f,[g,v,m])}}},pt=class{constructor(e){this.renderer=e}init(e,t){let{width:s,height:i}=this.renderer;switch(e){case"rainbow":t.position=0;break;case"matrix":{let o=[[0,255,0],[0,255,255],[255,0,255]];t.colorMode=o[Math.floor(Math.random()*o.length)],t.buffer=[];for(let n=0;n<i;n++)t.buffer.push(Array(s).fill(null).map(()=>[0,0,0]));break}case"plasma":case"gradient":t.time=0;break;case"fire":t.heat=[];for(let o=0;o<s*i;o++)t.heat.push(0);t.palette=this._createFirePalette();break;case"water":t.current=[],t.previous=[];for(let o=0;o<s*i;o++)t.current.push(0),t.previous.push(0);t.damping=.95;break;case"stars":{t.stars=[];let o=Math.floor(s*i*.15);for(let n=0;n<o;n++)t.stars.push({x:Math.floor(Math.random()*s),y:Math.floor(Math.random()*i),brightness:Math.random(),speed:.02+Math.random()*.05,phase:Math.random()*Math.PI*2});break}case"confetti":t.particles=[];for(let o=0;o<20;o++)t.particles.push(this._createConfettiParticle(s,i,!0));break;case"plasma_wave":case"radial_pulse":case"hypnotic":case"aurora":t.time=0;break;case"lava":t.time=0,t.noise=[];for(let o=0;o<s*i;o++)t.noise.push(Math.random()*Math.PI*2);break}}step(e,t){let{width:s,height:i}=this.renderer;switch(e){case"rainbow":t.position=(t.position+.01)%1;break;case"matrix":this._stepMatrix(t,s,i);break;case"plasma":case"gradient":t.time=(t.time||0)+.05;break;case"fire":this._stepFire(t,s,i);break;case"water":this._stepWater(t,s,i);break;case"stars":{let o=t.stars;for(let n of o)n.phase+=n.speed;break}case"confetti":{let o=t.particles;for(let n=0;n<o.length;n++){let r=o[n];r.y+=r.speed,r.x+=r.drift,r.rotation+=r.rotationSpeed,r.y>i&&(o[n]=this._createConfettiParticle(s,i,!1))}break}case"plasma_wave":case"radial_pulse":case"hypnotic":case"lava":case"aurora":t.time=(t.time||0)+.03;break}}render(e,t){switch(e){case"rainbow":this._renderRainbow(t);break;case"matrix":this._renderMatrix(t);break;case"plasma":this._renderPlasma(t);break;case"gradient":this._renderGradient(t);break;case"fire":this._renderFire(t);break;case"water":this._renderWater(t);break;case"stars":this._renderStars(t);break;case"confetti":this._renderConfetti(t);break;case"plasma_wave":this._renderPlasmaWave(t);break;case"radial_pulse":this._renderRadialPulse(t);break;case"hypnotic":this._renderHypnotic(t);break;case"lava":this._renderLava(t);break;case"aurora":this._renderAurora(t);break}}_renderRainbow(e){let{width:t,height:s}=this.renderer,i=e.position||0;for(let o=0;o<t;o++){let n=(i+o/t)%1,[r,a,l]=tt(n,1,.6);for(let c=0;c<s;c++)this.renderer.setPixel(o,c,[r,a,l])}}_stepMatrix(e,t,s){let i=e.buffer,o=e.colorMode,n=.15;i.pop();let r=i[0].map(([a,l,c])=>[a*(1-n),l*(1-n),c*(1-n)]);i.unshift(JSON.parse(JSON.stringify(r)));for(let a=0;a<t;a++)Math.random()<.08&&(i[0][a]=[Math.floor(Math.random()*o[0]),Math.floor(Math.random()*o[1]),Math.floor(Math.random()*o[2])])}_renderMatrix(e){var t;let{width:s,height:i}=this.renderer,o=e.buffer;if(o)for(let n=0;n<i;n++)for(let r=0;r<s;r++){let[a,l,c]=((t=o[n])==null?void 0:t[r])||[0,0,0];this.renderer.setPixel(r,n,[a,l,c])}}_renderPlasma(e){let{width:t,height:s}=this.renderer,i=e.time||0,o=t/2,n=s/2;for(let r=0;r<t;r++)for(let a=0;a<s;a++){let l=r-o,c=a-n,f=Math.sqrt(l*l+c*c),h=Math.sin(r/8+i),u=Math.sin(a/6+i*.8),p=Math.sin(f/6-i*1.2),g=Math.sin((r+a)/10+i*.5),v=(h+u+p+g+4)/8,m=Math.sin(v*Math.PI*2)*.5+.5,b=Math.sin(v*Math.PI*2+2)*.5+.5,_=Math.sin(v*Math.PI*2+4)*.5+.5;this.renderer.setPixel(r,a,[m*255,b*255,_*255])}}_renderGradient(e){let{width:t,height:s}=this.renderer,o=(e.time||0)*10;for(let n=0;n<t;n++)for(let r=0;r<s;r++){let a=(Math.sin((n+o)*.05)*.5+.5)*255,l=(Math.cos((r+o)*.05)*.5+.5)*255,c=(Math.sin((n+r+o)*.03)*.5+.5)*255;this.renderer.setPixel(n,r,[a,l,c])}}_createFirePalette(){let e=[];for(let t=0;t<256;t++){let s,i,o;t<64?(s=t*4,i=0,o=0):t<128?(s=255,i=(t-64)*4,o=0):t<192?(s=255,i=255,o=(t-128)*4):(s=255,i=255,o=255),e.push([s,i,o])}return e}_stepFire(e,t,s){let i=e.heat;for(let o=0;o<t*s;o++)i[o]=Math.max(0,i[o]-Math.random()*10);for(let o=0;o<s-1;o++)for(let n=0;n<t;n++){let r=o*t+n,a=(o+1)*t+n,l=o*t+Math.max(0,n-1),c=o*t+Math.min(t-1,n+1);i[r]=(i[a]+i[l]+i[c])/3.05}for(let o=0;o<t;o++)Math.random()<.6&&(i[(s-1)*t+o]=180+Math.random()*75)}_renderFire(e){let{width:t,height:s}=this.renderer,i=e.heat,o=e.palette;for(let n=0;n<s;n++)for(let r=0;r<t;r++){let a=n*t+r,l=Math.floor(Math.min(255,i[a])),[c,f,h]=o[l];this.renderer.setPixel(r,n,[c,f,h])}}_stepWater(e,t,s){let i=e.current,o=e.previous,n=e.damping,r=[...o];for(let a=0;a<i.length;a++)o[a]=i[a];for(let a=1;a<s-1;a++)for(let l=1;l<t-1;l++){let c=a*t+l;i[c]=(r[(a-1)*t+l]+r[(a+1)*t+l]+r[a*t+(l-1)]+r[a*t+(l+1)])/2-i[c],i[c]*=n}if(Math.random()<.1){let a=Math.floor(Math.random()*(t-2))+1,l=Math.floor(Math.random()*(s-2))+1;i[l*t+a]=255}}_renderWater(e){let{width:t,height:s}=this.renderer,i=e.current;for(let o=0;o<s;o++)for(let n=0;n<t;n++){let r=o*t+n,a=Math.abs(i[r]),l=Math.min(255,a*2),c=l>200?l:0,f=l>150?l*.8:l*.3,h=Math.min(255,50+l);this.renderer.setPixel(n,o,[c,f,h])}}_renderStars(e){let{width:t,height:s}=this.renderer;for(let o=0;o<s;o++)for(let n=0;n<t;n++)this.renderer.setPixel(n,o,[5,5,15]);let i=e.stars;for(let o of i){let n=(Math.sin(o.phase)*.5+.5)*255,r=Math.floor(o.x),a=Math.floor(o.y);r>=0&&r<t&&a>=0&&a<s&&this.renderer.setPixel(r,a,[n,n,n*.9])}}_createConfettiParticle(e,t,s){let i=[[255,0,0],[0,255,0],[0,0,255],[255,255,0],[255,0,255],[0,255,255],[255,128,0],[255,192,203]];return{x:Math.random()*e,y:s?Math.random()*t:-2,speed:.2+Math.random()*.3,drift:(Math.random()-.5)*.3,color:i[Math.floor(Math.random()*i.length)],size:1+Math.random(),rotation:Math.random()*Math.PI*2,rotationSpeed:(Math.random()-.5)*.2}}_renderConfetti(e){let{width:t,height:s}=this.renderer;for(let o=0;o<s;o++)for(let n=0;n<t;n++)this.renderer.setPixel(n,o,[10,10,10]);let i=e.particles;for(let o of i){let n=Math.floor(o.x),r=Math.floor(o.y);if(n>=0&&n<t&&r>=0&&r<s){let a=Math.abs(Math.sin(o.rotation))*.5+.5,[l,c,f]=o.color;this.renderer.setPixel(n,r,[l*a,c*a,f*a])}}}_renderPlasmaWave(e){let{width:t,height:s}=this.renderer,i=e.time||0;for(let o=0;o<t;o++)for(let n=0;n<s;n++){let r=o/t,a=n/s,l=Math.sin(r*10+i)+Math.sin(a*10+i)+Math.sin((r+a)*10+i)+Math.sin(Math.sqrt((r-.5)**2+(a-.5)**2)*20-i*2),c=Math.sin(l*Math.PI)*.5+.5,f=Math.sin(l*Math.PI+2.094)*.5+.5,h=Math.sin(l*Math.PI+4.188)*.5+.5;this.renderer.setPixel(o,n,[c*255,f*255,h*255])}}_renderRadialPulse(e){let{width:t,height:s}=this.renderer,i=e.time||0,o=t/2,n=s/2;for(let r=0;r<t;r++)for(let a=0;a<s;a++){let l=r-o,c=a-n,f=Math.sqrt(l*l+c*c),h=Math.sin(f*.8-i*3)*.5+.5,u=Math.sin(i*2)*.3+.7,p=(f/20+i*.5)%1,[g,v,m]=tt(p,.8,h*u);this.renderer.setPixel(r,a,[g,v,m])}}_renderHypnotic(e){let{width:t,height:s}=this.renderer,i=e.time||0,o=t/2,n=s/2;for(let r=0;r<t;r++)for(let a=0;a<s;a++){let l=r-o,c=a-n,f=Math.sqrt(l*l+c*c),h=Math.atan2(c,l),p=Math.sin(h*4+f*.5-i*2)*.5+.5,g=p*(Math.sin(i)*.5+.5),v=p*(Math.sin(i+2.094)*.5+.5),m=p*(Math.sin(i+4.188)*.5+.5);this.renderer.setPixel(r,a,[g*255,v*255,m*255])}}_renderLava(e){let{width:t,height:s}=this.renderer,i=e.time||0;for(let o=0;o<t;o++)for(let n=0;n<s;n++){let r=o/t,a=n/s,l=Math.sin(r*8+i*.7)*Math.cos(a*6+i*.5),c=Math.sin(r*12-i*.3)*Math.sin(a*10+i*.8),f=Math.cos((r+a)*5+i),h=(l+c+f+3)/6,u,p,g;h<.3?(u=h*3*100,p=0,g=0):h<.6?(u=100+(h-.3)*3*155,p=(h-.3)*3*100,g=0):(u=255,p=100+(h-.6)*2.5*155,g=(h-.6)*2.5*100),this.renderer.setPixel(o,n,[u,p,g])}}_renderAurora(e){let{width:t,height:s}=this.renderer,i=e.time||0;for(let o=0;o<t;o++)for(let n=0;n<s;n++){let r=o/t,a=n/s,l=Math.sin(r*6+i)*.3,c=Math.sin(r*4-i*.7)*.2,f=Math.sin(r*8+i*1.3)*.15,h=.5+l+c+f,u=Math.abs(a-h),p=Math.max(0,1-u*4),g=Math.pow(p,1.5),v=Math.sin(r*3+i*.5),m=g*(.2+v*.3)*255,b=g*(.8+Math.sin(i+r)*.2)*255,_=g*(.6+v*.4)*255,y=Math.sin(o*127.1+n*311.7)*.5+.5,w=Math.sin(i*3+o+n)*.5+.5;if(y>.98&&p<.3){let I=w*180;m=Math.max(m,I),b=Math.max(b,I),_=Math.max(_,I*.9)}this.renderer.setPixel(o,n,[m,b,_])}}},ut=class{constructor(e){this.renderer=e}init(e,t){switch(e){case"color_cycle":t.hue=0;break;case"rainbow_text":t.offset=0;break;case"neon":t.glowIntensity=0,t.direction=1,t.baseColor=t.fgColor||"#ff00ff";break}}step(e,t){switch(e){case"color_cycle":t.hue=(t.hue+.01)%1;break;case"rainbow_text":t.offset=(t.offset+.02)%1;break;case"neon":t.glowIntensity+=t.direction*.05,t.glowIntensity>=1?(t.glowIntensity=1,t.direction=-1):t.glowIntensity<=.3&&(t.glowIntensity=.3,t.direction=1);break}}render(e,t,s){let{width:i,height:o}=this.renderer,n=s||[];for(let r=0;r<o;r++)for(let a=0;a<i;a++){let l=n[r*i+a]||"#111",[c,f,h]=ht(l);if(c>20||f>20||h>20)switch(e){case"color_cycle":{let[p,g,v]=tt(t.hue,1,.8),m=(c+f+h)/(3*255);c=p*m,f=g*m,h=v*m;break}case"rainbow_text":{let p=(t.offset+a/i)%1,[g,v,m]=tt(p,1,.8),b=(c+f+h)/(3*255);c=g*b,f=v*b,h=m*b;break}case"neon":{let p=ht(t.baseColor||"#ff00ff"),g=t.glowIntensity||.5;if(c=p[0]*g,f=p[1]*g,h=p[2]*g,g>.8){let v=(g-.8)*5;c=c+(255-c)*v*.3,f=f+(255-f)*v*.3,h=h+(255-h)*v*.3}break}}this.renderer.setPixel(a,r,[c,f,h])}}},G={TEXT:"text",AMBIENT:"ambient",COLOR:"color"},T={fixed:{category:"text",name:"Fixed",description:"Static display"},scroll_ltr:{category:"text",name:"Scroll Left",description:"Text scrolls left to right"},scroll_rtl:{category:"text",name:"Scroll Right",description:"Text scrolls right to left"},blink:{category:"text",name:"Blink",description:"Text blinks on/off"},breeze:{category:"text",name:"Breeze",description:"Gentle wave brightness"},snow:{category:"text",name:"Snow",description:"Sparkle effect"},laser:{category:"text",name:"Laser",description:"Scanning beam"},fade:{category:"text",name:"Fade",description:"Fade in/out"},typewriter:{category:"text",name:"Typewriter",description:"Characters appear one by one"},bounce:{category:"text",name:"Bounce",description:"Text bounces back and forth"},sparkle:{category:"text",name:"Sparkle",description:"Random sparkle overlay"},rainbow:{category:"ambient",name:"Rainbow",description:"HSV rainbow gradient"},matrix:{category:"ambient",name:"Matrix",description:"Digital rain effect"},plasma:{category:"ambient",name:"Plasma",description:"Classic plasma waves"},gradient:{category:"ambient",name:"Gradient",description:"Moving color gradients"},fire:{category:"ambient",name:"Fire",description:"Fire/flame simulation"},water:{category:"ambient",name:"Water",description:"Ripple/wave effect"},stars:{category:"ambient",name:"Stars",description:"Twinkling starfield"},confetti:{category:"ambient",name:"Confetti",description:"Falling colored particles"},plasma_wave:{category:"ambient",name:"Plasma Wave",description:"Multi-frequency sine waves"},radial_pulse:{category:"ambient",name:"Radial Pulse",description:"Expanding ring patterns"},hypnotic:{category:"ambient",name:"Hypnotic",description:"Spiral pattern"},lava:{category:"ambient",name:"Lava",description:"Flowing lava/magma"},aurora:{category:"ambient",name:"Aurora",description:"Northern lights"},color_cycle:{category:"color",name:"Color Cycle",description:"Cycle through colors"},rainbow_text:{category:"color",name:"Rainbow Text",description:"Rainbow gradient on text"},neon:{category:"color",name:"Neon",description:"Pulsing neon glow"}},et=class{constructor(e){this.renderer=e,this.textEffects=new ft(e),this.ambientEffects=new pt(e),this.colorEffects=new ut(e),this.currentEffect="fixed",this.effectState={tick:0}}getEffectInfo(e){return T[e]||T.fixed}getEffectsByCategory(e){return Object.entries(T).filter(([,t])=>t.category===e).map(([t,s])=>({key:t,...s}))}initEffect(e,t={}){let s=this.getEffectInfo(e);switch(this.currentEffect=e,this.effectState={tick:0,...t},s.category){case"text":this.textEffects.init(e,this.effectState);break;case"ambient":this.ambientEffects.init(e,this.effectState);break;case"color":this.colorEffects.init(e,this.effectState);break}return this.effectState}step(){let e=this.getEffectInfo(this.currentEffect);switch(this.effectState.tick=(this.effectState.tick||0)+1,e.category){case"text":this.textEffects.step(this.currentEffect,this.effectState);break;case"ambient":this.ambientEffects.step(this.currentEffect,this.effectState);break;case"color":this.colorEffects.step(this.currentEffect,this.effectState);break}}render(e,t,s){switch(this.getEffectInfo(this.currentEffect).category){case"ambient":this.ambientEffects.render(this.currentEffect,this.effectState);break;case"text":this.textEffects.render(this.currentEffect,this.effectState,e,t,s);break;case"color":this.colorEffects.render(this.currentEffect,this.effectState,e);break}}isAmbient(e){return this.getEffectInfo(e).category==="ambient"}needsAnimation(e){return e!=="fixed"}},Se=Object.entries(T).filter(([,d])=>d.category==="text").map(([d])=>d),Ce=Object.entries(T).filter(([,d])=>d.category==="ambient").map(([d])=>d),Ie=Object.entries(T).filter(([,d])=>d.category==="color").map(([d])=>d),ke=Object.keys(T),W=class{constructor(e,t={}){this.container=e,this.width=t.width||64,this.height=t.height||16,this.pixelGap=t.pixelGap||.15,this.glowEnabled=t.glow!==!1,this.scale=t.scale||8,this.buffer=[],this._initBuffer(),this._colorPixels=[],this._extendedColorPixels=[],this.extendedWidth=this.width,this.effect="fixed",this.speed=50,this.animationId=null,this.lastFrameTime=0,this._isRunning=!1,this._canvas=null,this._ctx=null,this._imageData=null,this._glowCanvas=null,this._glowCtx=null,this._wrapper=null,this._canvasCreated=!1,this._pixelTemplate=null,this.effectManager=new et(this)}_initBuffer(){this.buffer=[];for(let e=0;e<this.width*this.height;e++)this.buffer.push([0,0,0])}_createCanvas(){if(typeof document>"u")return;let e=this.width*this.scale,t=this.height*this.scale;this._wrapper=document.createElement("div"),this._wrapper.style.cssText=`
      position: relative;
      width: 100%;
      aspect-ratio: ${this.width} / ${this.height};
      background: #0a0a0a;
      border-radius: 4px;
      overflow: hidden;
    `,this.glowEnabled&&(this._glowCanvas=document.createElement("canvas"),this._glowCanvas.width=e,this._glowCanvas.height=t,this._glowCanvas.style.cssText=`
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        filter: blur(${this.scale*.6}px); opacity: 0.5;
      `,this._glowCtx=this._glowCanvas.getContext("2d",{alpha:!1}),this._wrapper.appendChild(this._glowCanvas)),this._canvas=document.createElement("canvas"),this._canvas.width=e,this._canvas.height=t,this._canvas.style.cssText=`
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      image-rendering: pixelated; image-rendering: crisp-edges;
    `,this._ctx=this._canvas.getContext("2d",{alpha:!1}),this._wrapper.appendChild(this._canvas),this._imageData=this._ctx.createImageData(e,t),this._createPixelTemplate(),this._fillBackground(),this.container&&this.container.isConnected!==!1&&(this.container.innerHTML="",this.container.appendChild(this._wrapper)),this._canvasCreated=!0}_createPixelTemplate(){let e=this.scale,t=Math.max(1,Math.floor(e*this.pixelGap)),s=e-t,i=Math.max(1,Math.floor(e*.15));this._pixelTemplate=[];for(let o=0;o<e;o++)for(let n=0;n<e;n++){let r=!1;if(n<s&&o<s)if(n<i&&o<i){let a=i-n,l=i-o;r=a*a+l*l<=i*i}else if(n>=s-i&&o<i){let a=n-(s-i-1),l=i-o;r=a*a+l*l<=i*i}else if(n<i&&o>=s-i){let a=i-n,l=o-(s-i-1);r=a*a+l*l<=i*i}else if(n>=s-i&&o>=s-i){let a=n-(s-i-1),l=o-(s-i-1);r=a*a+l*l<=i*i}else r=!0;this._pixelTemplate.push(r)}}_fillBackground(){if(!this._imageData)return;let e=this._imageData.data,t=10,s=10,i=10;for(let o=0;o<e.length;o+=4)e[o]=t,e[o+1]=s,e[o+2]=i,e[o+3]=255}_ensureCanvasInContainer(){return this.container?this._wrapper&&this._wrapper.parentNode===this.container?!0:this._wrapper&&this.container.isConnected!==!1?(this.container.innerHTML="",this.container.appendChild(this._wrapper),!0):!1:!1}setPixel(e,t,s){if(e>=0&&e<this.width&&t>=0&&t<this.height){let i=t*this.width+e;i<this.buffer.length&&(this.buffer[i]=s)}}clear(){for(let e=0;e<this.buffer.length;e++)this.buffer[e]=[0,0,0]}flush(){if(this._canvasCreated?this._ensureCanvasInContainer()||this._createCanvas():this._createCanvas(),!this._imageData||!this._ctx||!this._pixelTemplate)return;let e=this._imageData.data,t=this.scale,s=this.width*t,i=this._pixelTemplate,o=10,n=10,r=10;for(let a=0;a<this.height;a++)for(let l=0;l<this.width;l++){let c=a*this.width+l,f=this.buffer[c];if(!f||!Array.isArray(f))continue;let h=Math.round(f[0]),u=Math.round(f[1]),p=Math.round(f[2]),g=l*t,v=a*t;for(let m=0;m<t;m++)for(let b=0;b<t;b++){let _=m*t+b,y=((v+m)*s+(g+b))*4;i[_]?(e[y]=h,e[y+1]=u,e[y+2]=p,e[y+3]=255):(e[y]=o,e[y+1]=n,e[y+2]=r,e[y+3]=255)}}this._ctx.putImageData(this._imageData,0,0),this.glowEnabled&&this._glowCtx&&this._glowCtx.drawImage(this._canvas,0,0)}setData(e,t=null,s=null){this._colorPixels=e||[],t?(this._extendedColorPixels=t,this.extendedWidth=s||this.width):(this._extendedColorPixels=e||[],this.extendedWidth=this.width)}setEffect(e,t=50){let s=this._isRunning;this.effect!==e&&(this.effect=e,this.effectManager.initEffect(e,{speed:t})),this.speed=t,s&&e!=="fixed"&&this.start()}start(){this._isRunning||(this._isRunning=!0,this.lastFrameTime=performance.now(),this._animate())}stop(){this._isRunning=!1,this.animationId&&(cancelAnimationFrame(this.animationId),this.animationId=null)}get isRunning(){return this._isRunning}_animate(){if(!this._isRunning)return;let e=performance.now(),t=500-(this.speed-1)*4.7;e-this.lastFrameTime>=t&&(this.lastFrameTime=e,this.effectManager.step()),this._renderFrame(),this.animationId=requestAnimationFrame(()=>this._animate())}_renderFrame(){this.effectManager.render(this._colorPixels,this._extendedColorPixels,this.extendedWidth),this.flush()}renderStatic(){this._canvasCreated||this._createCanvas(),this._renderFrame()}setDimensions(e,t){(e!==this.width||t!==this.height)&&(this.width=e,this.height=t,this.extendedWidth=e,this._initBuffer(),this._canvasCreated=!1,this.effectManager=new et(this),this.effect!=="fixed"&&this.effectManager.initEffect(this.effect,{speed:this.speed}))}setContainer(e){e!==this.container&&(this.container=e,this._wrapper&&e&&(e.innerHTML="",e.appendChild(this._wrapper)))}destroy(){this.stop(),this._canvas=null,this._ctx=null,this._imageData=null,this._glowCanvas=null,this._glowCtx=null,this._wrapper=null,this._canvasCreated=!1,this._pixelTemplate=null}};var it={A:[124,18,17,18,124],B:[127,73,73,73,54],C:[62,65,65,65,34],D:[127,65,65,34,28],E:[127,73,73,73,65],F:[127,9,9,9,1],G:[62,65,73,73,122],H:[127,8,8,8,127],I:[0,65,127,65,0],J:[32,64,65,63,1],K:[127,8,20,34,65],L:[127,64,64,64,64],M:[127,2,12,2,127],N:[127,4,8,16,127],O:[62,65,65,65,62],P:[127,9,9,9,6],Q:[62,65,81,33,94],R:[127,9,25,41,70],S:[70,73,73,73,49],T:[1,1,127,1,1],U:[63,64,64,64,63],V:[31,32,64,32,31],W:[63,64,56,64,63],X:[99,20,8,20,99],Y:[7,8,112,8,7],Z:[97,81,73,69,67],a:[32,84,84,84,120],b:[127,72,68,68,56],c:[56,68,68,68,32],d:[56,68,68,72,127],e:[56,84,84,84,24],f:[8,126,9,1,2],g:[12,82,82,82,62],h:[127,8,4,4,120],i:[0,68,125,64,0],j:[32,64,68,61,0],k:[127,16,40,68,0],l:[0,65,127,64,0],m:[124,4,24,4,120],n:[124,8,4,4,120],o:[56,68,68,68,56],p:[124,20,20,20,8],q:[8,20,20,24,124],r:[124,8,4,4,8],s:[72,84,84,84,32],t:[4,63,68,64,32],u:[60,64,64,32,124],v:[28,32,64,32,28],w:[60,64,48,64,60],x:[68,40,16,40,68],y:[12,80,80,80,60],z:[68,100,84,76,68],0:[62,81,73,69,62],1:[0,66,127,64,0],2:[66,97,81,73,70],3:[33,65,69,75,49],4:[24,20,18,127,16],5:[39,69,69,69,57],6:[60,74,73,73,48],7:[1,113,9,5,3],8:[54,73,73,73,54],9:[6,73,73,41,30]," ":[0,0,0,0,0],".":[0,96,96,0,0],",":[0,128,96,0,0],":":[0,54,54,0,0],";":[0,128,54,0,0],"!":[0,0,95,0,0],"?":[2,1,81,9,6],"-":[8,8,8,8,8],"+":[8,8,62,8,8],"=":[20,20,20,20,20],_:[64,64,64,64,64],"/":[32,16,8,4,2],"\\":[2,4,8,16,32],"(":[0,28,34,65,0],")":[0,65,34,28,0],"[":[0,127,65,65,0],"]":[0,65,65,127,0],"<":[8,20,34,65,0],">":[0,65,34,20,8],"*":[20,8,62,8,20],"#":[20,127,20,127,20],"@":[62,65,93,85,30],"&":[54,73,85,34,80],"%":[35,19,8,100,98],$:[18,42,127,42,36],"'":[0,0,7,0,0],'"':[0,7,0,7,0],"`":[0,1,2,0,0],"^":[4,2,1,2,4],"~":[8,4,8,16,8]};function Mt(d,e,t,s="#ff6600",i="#111"){let o=[],a=Math.floor((t-7)/2);for(let h=0;h<t;h++)for(let u=0;u<e;u++)o.push(i);let l=d.length*6-1,f=Math.max(1,Math.floor((e-l)/2));for(let h of d){let u=it[h]||it[" "];for(let p=0;p<5;p++)for(let g=0;g<7;g++){let v=u[p]>>g&1,m=f+p,b=a+g;m>=0&&m<e&&b<t&&b>=0&&(o[b*e+m]=v?s:i)}f+=6}return o}function Tt(d,e,t,s="#ff6600",i="#111"){let r=Math.floor((t-7)/2),a=d.length*6,l=e+a+e,c=[];for(let h=0;h<t;h++)for(let u=0;u<l;u++)c.push(i);let f=e;for(let h of d){let u=it[h]||it[" "];for(let p=0;p<5;p++)for(let g=0;g<7;g++){let v=u[p]>>g&1,m=f+p,b=r+g;m>=0&&m<l&&b<t&&b>=0&&(c[b*l+m]=v?s:i)}f+=6}return{pixels:c,width:l}}var $t={VCR_OSD_MONO:{16:{font_size:16,offset:[0,0],pixel_threshold:70,var_width:!0},24:{font_size:24,offset:[0,0],pixel_threshold:70,var_width:!0},32:{font_size:28,offset:[-1,2],pixel_threshold:30,var_width:!1}},CUSONG:{16:{font_size:16,offset:[0,-1],pixel_threshold:70,var_width:!1},24:{font_size:24,offset:[0,0],pixel_threshold:70,var_width:!1},32:{font_size:32,offset:[0,0],pixel_threshold:70,var_width:!1}}},Q={},ct={},Re=d=>typeof window>"u"?`/fonts/${d}.ttf`:`${window.location.pathname.substring(0,window.location.pathname.lastIndexOf("/")+1)}fonts/${d}.ttf`,Kt=Re;function kt(d){Kt=d}function st(d){return d<=18?16:d<=28?24:32}async function q(d,e){return Q[d]===!0?!0:Q[d]===!1?!1:(d in ct||(ct[d]=(async()=>{if(typeof document>"u")return!1;let s=(e||Kt)(d);try{let o=await new FontFace(d,`url(${s})`).load();return document.fonts.add(o),Q[d]=!0,!0}catch(i){return console.warn(`PixelDisplay: Failed to load font ${d}:`,i),Q[d]=!1,!1}})()),ct[d])}function ot(d){return Q[d]===!0}function Lt(d,e,t,s="#ff6600",i="#111",o="VCR_OSD_MONO"){if(typeof document>"u")return null;let n=$t[o];if(!n)return null;if(!ot(o))return q(o),null;let r=st(t),a=n[r],l=document.createElement("canvas");l.width=e,l.height=t;let c=l.getContext("2d");if(!c)return null;if(c.imageSmoothingEnabled=!1,c.fillStyle=i,c.fillRect(0,0,e,t),!d||d.trim()===""){let m=[];for(let b=0;b<e*t;b++)m.push(i);return m}c.font=`${a.font_size}px "${o}"`,c.fillStyle=s,c.textBaseline="top";let h=c.measureText(d).width,u=Math.floor((e-h)/2)+a.offset[0],p=Math.floor((t-a.font_size)/2)+a.offset[1];c.fillText(d,u,p);let g=c.getImageData(0,0,e,t),v=[];for(let m=0;m<g.data.length;m+=4){let b=g.data[m],_=g.data[m+1],y=g.data[m+2],w=(b+_+y)/3;v.push(w>=a.pixel_threshold?s:i)}return v}function Pt(d,e,t,s="#ff6600",i="#111",o="VCR_OSD_MONO"){if(typeof document>"u")return null;let n=$t[o];if(!n)return null;if(!ot(o))return q(o),null;let r=st(t),a=n[r],c=document.createElement("canvas").getContext("2d");if(!c)return null;c.font=`${a.font_size}px "${o}"`;let f=Math.ceil(c.measureText(d).width),h=e+f+e,u=document.createElement("canvas");u.width=h,u.height=t;let p=u.getContext("2d");if(!p)return null;if(p.imageSmoothingEnabled=!1,p.fillStyle=i,p.fillRect(0,0,h,t),!d||d.trim()===""){let _=[];for(let y=0;y<h*t;y++)_.push(i);return{pixels:_,width:h}}p.font=`${a.font_size}px "${o}"`,p.fillStyle=s,p.textBaseline="top";let g=e+a.offset[0],v=Math.floor((t-a.font_size)/2)+a.offset[1];p.fillText(d,g,v);let m=p.getImageData(0,0,h,t),b=[];for(let _=0;_<m.data.length;_+=4){let y=m.data[_],w=m.data[_+1],I=m.data[_+2],E=(y+w+I)/3;b.push(E>=a.pixel_threshold?s:i)}return{pixels:b,width:h}}var gt=null,mt=null;async function Me(){if(gt&&mt)return!0;try{let d=await Promise.resolve().then(()=>(Ut(),qt)),e=await Promise.resolve().then(()=>(Jt(),Yt));gt=d.$Font;let t=e;return mt=t.default||t.$fetchline||e,!0}catch{return console.warn("PixelDisplay: bdfparser/fetchline packages not available. BDF font rendering disabled."),!1}}var Zt={VCR_OSD_MONO:{16:{file:"VCR_OSD_MONO_16.bdf",yOffset:0},24:{file:"VCR_OSD_MONO_24.bdf",yOffset:0},32:{file:"VCR_OSD_MONO_32.bdf",yOffset:2}},CUSONG:{16:{file:"CUSONG_16.bdf",yOffset:-1},24:{file:"CUSONG_24.bdf",yOffset:0},32:{file:"CUSONG_32.bdf",yOffset:0}}},j=new Map,dt=new Map,Te=(d,e)=>typeof window>"u"?`/fonts/${e||d}`:`${window.location.pathname.substring(0,window.location.pathname.lastIndexOf("/")+1)}fonts/${e||d}`,Qt=Te;function Rt(d){Qt=d}function te(d){return d<=18?16:d<=28?24:32}async function O(d,e=16,t){let s=`${d}_${e}`;if(j.has(s))return j.get(s);if(dt.has(s))return dt.get(s);let i=Zt[d];if(!i||!i[e])return console.warn(`PixelDisplay BDF: No config for font ${d} at height ${e}`),null;let o=i[e],n=(async()=>{try{if(!await Me()||!gt||!mt)return null;let l=(t||Qt)(d,o.file),f={font:await gt(mt(l)),config:o};return j.set(s,f),f}catch(r){return console.warn(`PixelDisplay BDF: Failed to load font ${d} (${e}px):`,r),dt.delete(s),null}})();return dt.set(s,n),n}function Ot(d,e=16){let t=`${d}_${e}`;return j.has(t)}function At(d,e,t,s="#ff6600",i="#111",o="VCR_OSD_MONO"){let n=te(t),r=`${o}_${n}`,a=j.get(r);if(!a)return O(o,n),null;let{font:l,config:c}=a,f=new Array(e*t).fill(i);if(!d||d.trim()==="")return f;try{let h=l.draw(d,{direction:"lrtb",mode:1}),u=h.bindata,p=h.width(),g=h.height(),v=Math.floor((e-p)/2),m=Math.floor((t-g)/2)+(c.yOffset||0);for(let b=0;b<g;b++){let _=u[b]||"";for(let y=0;y<_.length;y++){let w=v+y,I=m+b;if(w>=0&&w<e&&I>=0&&I<t){let E=I*e+w;f[E]=_[y]==="1"?s:i}}}}catch(h){return console.warn("PixelDisplay BDF: Error rendering text:",h),null}return f}function Bt(d,e,t,s="#ff6600",i="#111",o="VCR_OSD_MONO"){let n=te(t),r=`${o}_${n}`,a=j.get(r);if(!a)return O(o,n),null;let{font:l,config:c}=a;if(!d||d.trim()===""){let f=e*3;return{pixels:new Array(f*t).fill(i),width:f}}try{let f=l.draw(d,{direction:"lrtb",mode:1}),h=f.bindata,u=f.width(),p=f.height(),g=e+u+e,v=new Array(g*t).fill(i),m=e,b=Math.floor((t-p)/2)+(c.yOffset||0);for(let _=0;_<p;_++){let y=h[_]||"";for(let w=0;w<y.length;w++){let I=m+w,E=b+_;if(I>=0&&I<g&&E>=0&&E<t){let C=E*g+I;v[C]=y[w]==="1"?s:i}}}return{pixels:v,width:g}}catch(f){return console.warn("PixelDisplay BDF: Error rendering scroll text:",f),null}}function bt(d){if(d.baseUrl){let e=d.baseUrl.replace(/\/+$/,"");kt(t=>`${e}/${t}.ttf`),Rt((t,s)=>`${e}/${s||t}`)}d.ttfResolver&&kt(d.ttfResolver),d.bdfResolver&&Rt(d.bdfResolver)}var $e=typeof window<"u"&&(typeof window.hassConnection<"u"||document.querySelector("home-assistant")!==null);if($e)bt({ttfResolver:d=>`/hacsfiles/ipixel_color/fonts/${d}.ttf`,bdfResolver:(d,e)=>`/hacsfiles/ipixel_color/fonts/${e||d}`});else if(typeof window<"u"){let d=window.location.pathname.substring(0,window.location.pathname.lastIndexOf("/")+1);bt({baseUrl:`${d}fonts`})}var _t=new Map,vt=class extends ${constructor(){super(),this._renderer=null,this._displayContainer=null,this._lastState=null,this._cachedResolution=null,this._rendererId=null,this._handleDisplayUpdate=e=>{this._updateDisplay(e.detail)},window.addEventListener("ipixel-display-update",this._handleDisplayUpdate)}connectedCallback(){this._rendererId||(this._rendererId=`renderer_${Date.now()}_${Math.random().toString(36).substr(2,9)}`),_t.has(this._rendererId)&&(this._renderer=_t.get(this._rendererId)),O("VCR_OSD_MONO",16).then(()=>{this._lastState&&this._updateDisplay(this._lastState)}),O("VCR_OSD_MONO",24),O("VCR_OSD_MONO",32),O("CUSONG",16),O("CUSONG",24),O("CUSONG",32),q("VCR_OSD_MONO"),q("CUSONG")}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("ipixel-display-update",this._handleDisplayUpdate),this._renderer&&this._rendererId&&(this._renderer.stop(),_t.set(this._rendererId,this._renderer))}_getResolutionCached(){let[e,t]=this.getResolution();if(e>0&&t>0){this._cachedResolution=[e,t];try{localStorage.setItem("iPIXEL_Resolution",JSON.stringify([e,t]))}catch{}return this._cachedResolution}try{let s=localStorage.getItem("iPIXEL_Resolution");if(s){let i=JSON.parse(s);if(Array.isArray(i)&&i.length===2&&i[0]>0&&i[1]>0)return this._cachedResolution=i,i}}catch{}return this._cachedResolution?this._cachedResolution:this._config?.width&&this._config?.height?[this._config.width,this._config.height]:[e||64,t||16]}_updateDisplay(e){if(!this._displayContainer)return;let[t,s]=this._getResolutionCached(),i=this.isOn();if(this._renderer?(this._renderer.setContainer(this._displayContainer),(this._renderer.width!==t||this._renderer.height!==s)&&this._renderer.setDimensions(t,s)):(this._renderer=new W(this._displayContainer,{width:t,height:s}),this._rendererId&&_t.set(this._rendererId,this._renderer)),!i){this._renderer.setData([]),this._renderer.setEffect("fixed",50),this._renderer.stop(),this._renderer.renderStatic();return}let o=e?.text||"",n=e?.effect||"fixed",r=e?.speed||50,a=e?.fgColor||"#ff6600",l=e?.bgColor||"#111",c=e?.mode||"text",f=e?.font||"VCR_OSD_MONO";this._lastState=e;let h=o,u=a;if(c==="clock"?(h=new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}),u="#00ff88"):c==="gif"?(h="GIF",u="#ff44ff"):c==="rhythm"&&(h="***",u="#44aaff"),T[n]?.category==="ambient")this._renderer.setData([],[],t);else{let v=st(s),m=f!=="LEGACY"&&Ot(f,v),b=f!=="LEGACY"&&ot(f),_=(E,C,k,R,x)=>{if(m){let S=At(E,C,k,R,x,f);if(S)return S}if(b){let S=Lt(E,C,k,R,x,f);if(S)return S}return Mt(E,C,k,R,x)},y=(E,C,k,R,x)=>{if(m){let S=Bt(E,C,k,R,x,f);if(S)return S}if(b){let S=Pt(E,C,k,R,x,f);if(S)return S}return Tt(E,C,k,R,x)},w=b?h.length*10:h.length*6;if((n==="scroll_ltr"||n==="scroll_rtl"||n==="bounce")&&w>t){let E=y(h,t,s,u,l),C=_(h,t,s,u,l);this._renderer.setData(C,E.pixels,E.width)}else{let E=_(h,t,s,u,l);this._renderer.setData(E)}}this._renderer.setEffect(n,r),n==="fixed"?(this._renderer.stop(),this._renderer.renderStatic()):this._renderer.start()}_getTestModeState(){let e=[{text:"iPIXEL",effect:"scroll_ltr",speed:40,fgColor:"#ff6600",bgColor:"#000000",mode:"text",font:"VCR_OSD_MONO"},{text:"Hello!",effect:"rainbow_cycle",speed:50,fgColor:"#00ff88",bgColor:"#000000",mode:"text",font:"VCR_OSD_MONO"},{text:"TEST",effect:"fixed",speed:50,fgColor:"#03a9f4",bgColor:"#111111",mode:"text",font:"VCR_OSD_MONO"},{text:"",effect:"rainbow",speed:60,fgColor:"#ffffff",bgColor:"#000000",mode:"ambient",font:"VCR_OSD_MONO"}],t=Math.floor(Date.now()/1e4)%e.length;return e[t]}render(){let e=this.isInTestMode();if(!this._hass&&!e)return;let[t,s]=this._getResolutionCached(),i=this.isOn(),o=this._config.name||this.getEntity()?.attributes?.friendly_name||"iPIXEL Display",n=at(),a=this.getEntity()?.state||"",c=this.getRelatedEntity("select","mode")?.state||n.mode||"text",f=n.text||a||(e?"iPIXEL":""),h=n.effect||"fixed",u=n.speed||50,p=n.fgColor||"#ff6600",g=n.bgColor||"#111",v=n.font||"VCR_OSD_MONO",b=T[h]?.category==="ambient",_=Wt(),y=N(),w="";if(e){let R=_.length>0?`<div class="test-mode-features">Missing: ${_.join(", ")}</div>`:"";w=`
        <div class="test-mode-banner">
          <div class="test-mode-header">
            <span class="test-mode-label">Test Mode</span>
            <button class="test-mode-toggle ${y?"active":""}" id="test-mode-toggle">
              ${y?"ON":"OFF"}
            </button>
          </div>
          <div class="test-mode-desc">Preview display without a device</div>
          ${R}
        </div>`}else w=`
        <div class="test-mode-hint">
          <button class="test-mode-hint-btn" id="test-mode-toggle" title="Enable test mode for preview without a device">
            <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15Z"/></svg>
            Test
          </button>
        </div>`;let I=Object.entries(T).filter(([R,x])=>x.category==="text").map(([R,x])=>`<option value="${R}">${x.name}</option>`).join(""),E=Object.entries(T).filter(([R,x])=>x.category==="ambient").map(([R,x])=>`<option value="${R}">${x.name}</option>`).join(""),C=Object.entries(T).filter(([R,x])=>x.category==="color").map(([R,x])=>`<option value="${R}">${x.name}</option>`).join("");this.shadowRoot.innerHTML=`
      <style>${L}
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
        .test-mode-banner {
          background: linear-gradient(135deg, rgba(255,152,0,0.15), rgba(255,87,34,0.1));
          border: 1px solid rgba(255,152,0,0.3);
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 12px;
        }
        .test-mode-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .test-mode-label {
          font-size: 0.85em;
          font-weight: 600;
          color: #ff9800;
        }
        .test-mode-toggle {
          padding: 3px 10px;
          border: 1px solid rgba(255,152,0,0.4);
          border-radius: 12px;
          background: rgba(255,152,0,0.1);
          color: #ff9800;
          cursor: pointer;
          font-size: 0.75em;
          font-weight: 600;
          transition: all 0.2s;
        }
        .test-mode-toggle.active {
          background: #ff9800;
          color: #000;
        }
        .test-mode-desc {
          font-size: 0.75em;
          opacity: 0.7;
        }
        .test-mode-features {
          font-size: 0.7em;
          opacity: 0.6;
          margin-top: 4px;
          font-style: italic;
        }
        .test-mode-hint {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;
        }
        .test-mode-hint-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid rgba(255,152,0,0.3);
          border-radius: 10px;
          background: rgba(255,152,0,0.08);
          color: #ff9800;
          cursor: pointer;
          font-size: 0.75em;
          opacity: 0.85;
          transition: opacity 0.2s, background 0.2s;
          -webkit-tap-highlight-color: rgba(255,152,0,0.2);
        }
        .test-mode-hint-btn:hover,
        .test-mode-hint-btn:active { opacity: 1; background: rgba(255,152,0,0.15); }
        .test-mode-badge {
          background: rgba(255,152,0,0.2);
          color: #ff9800;
          padding: 2px 6px;
          border-radius: 3px;
          margin-left: 4px;
          font-size: 0.75em;
        }
        .demo-controls {
          display: flex;
          gap: 6px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .demo-btn {
          padding: 5px 10px;
          border: 1px solid rgba(255,152,0,0.3);
          border-radius: 6px;
          background: rgba(255,152,0,0.08);
          color: inherit;
          cursor: pointer;
          font-size: 0.75em;
          transition: all 0.2s;
        }
        .demo-btn:hover { background: rgba(255,152,0,0.2); }
        .demo-btn.active { background: rgba(255,152,0,0.25); border-color: #ff9800; }
      </style>
      <ha-card>
        <div class="card-content">
          ${w}
          <div class="card-header">
            <div class="card-title">
              <span class="status-dot ${i?"":"off"}"></span>
              ${o}
              ${e?'<span class="test-mode-badge">Demo</span>':""}
            </div>
            <button class="icon-btn ${i?"active":""}" id="power-btn">
              <svg viewBox="0 0 24 24"><path d="M13,3H11V13H13V3M17.83,5.17L16.41,6.59C18.05,7.91 19,9.9 19,12A7,7 0 0,1 12,19A7,7 0 0,1 5,12C5,9.9 5.95,7.91 7.59,6.59L6.17,5.17C4.23,6.82 3,9.26 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12C21,9.26 19.77,6.82 17.83,5.17Z"/></svg>
            </button>
          </div>
          <div class="display-container">
            <div class="display-screen" id="display-screen"></div>
            <div class="display-footer">
              <span>${t} x ${s}</span>
              <span>
                <span class="mode-badge">${i?c:"Off"}</span>
                ${i&&h!=="fixed"?`<span class="effect-badge">${T[h]?.name||h}</span>`:""}
              </span>
            </div>
          </div>
          ${e?`
          <div class="demo-controls">
            <button class="demo-btn" data-demo="text">Text</button>
            <button class="demo-btn" data-demo="scroll">Scroll</button>
            <button class="demo-btn" data-demo="rainbow">Rainbow</button>
            <button class="demo-btn" data-demo="clock">Clock</button>
            <button class="demo-btn" data-demo="fire">Fire</button>
            <button class="demo-btn" data-demo="stars">Stars</button>
          </div>`:""}
        </div>
      </ha-card>`,this._displayContainer=this.shadowRoot.getElementById("display-screen");let k=e&&!n.text&&n.effect==="fixed"?this._getTestModeState():{text:f,effect:h,speed:u,fgColor:p,bgColor:g,mode:c,font:v};this._updateDisplay(k),this._attachPowerButton(),this._attachTestModeListeners()}_attachPowerButton(){this.shadowRoot.getElementById("power-btn")?.addEventListener("click",()=>{if(this.isInTestMode()){this._testPowerState=!this._testPowerState,this.render();return}let e=this._switchEntityId;if(!e){let t=this.getRelatedEntity("switch","power");t&&(this._switchEntityId=t.entity_id,e=t.entity_id)}if(e&&this._hass?.states[e])this._hass.callService("switch","toggle",{entity_id:e});else{let t=Object.keys(this._hass?.states||{}).filter(o=>o.startsWith("switch.")),s=this._config.entity?.replace(/^[^.]+\./,"").replace(/_?(text|display|gif_url)$/i,"")||"",i=t.find(o=>o.includes(s.substring(0,10)));i?(this._switchEntityId=i,this._hass.callService("switch","toggle",{entity_id:i})):console.warn("iPIXEL: No switch found. Entity:",this._config.entity,"Available:",t)}})}_attachTestModeListeners(){this.shadowRoot.getElementById("test-mode-toggle")?.addEventListener("click",()=>{jt(!N())}),this.shadowRoot.querySelectorAll("[data-demo]").forEach(e=>{e.addEventListener("click",t=>{let s=t.currentTarget.dataset.demo,o={text:{text:"iPIXEL",effect:"fixed",speed:50,fgColor:"#ff6600",bgColor:"#000000",mode:"text",font:"VCR_OSD_MONO"},scroll:{text:"Hello World!",effect:"scroll_ltr",speed:40,fgColor:"#00ff88",bgColor:"#000000",mode:"text",font:"VCR_OSD_MONO"},rainbow:{text:"",effect:"rainbow",speed:60,fgColor:"#ffffff",bgColor:"#000000",mode:"ambient",font:"VCR_OSD_MONO"},clock:{text:"",effect:"fixed",speed:50,fgColor:"#00ff88",bgColor:"#000000",mode:"clock",font:"VCR_OSD_MONO"},fire:{text:"",effect:"fire",speed:50,fgColor:"#ffffff",bgColor:"#000000",mode:"ambient",font:"VCR_OSD_MONO"},stars:{text:"",effect:"stars",speed:40,fgColor:"#ffffff",bgColor:"#000000",mode:"ambient",font:"VCR_OSD_MONO"}}[s];o&&(M(o),this.shadowRoot.querySelectorAll("[data-demo]").forEach(n=>n.classList.remove("active")),t.currentTarget.classList.add("active"))})})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var ee={textimage:"Text (rendered)",text:"Text (native)",clock:"Clock",gif:"Image / GIF",rhythm:"Rhythm"},Dt={text:{icon:"M3,5H21V7H3V5M3,11H21V13H3V11M3,17H21V19H3V17Z",label:"Scrolling text is rendered by the panel itself"},clock:{icon:"M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z",label:"Clock is rendered by the panel itself"},rhythm:{icon:"M10,2H14V22H10V2M4,8H8V22H4V8M16,12H20V22H16V12Z",label:"Music visualiser is rendered by the panel itself"}},xt=class extends ${constructor(){super(),this._timer=null,this._frame=null,this._frameUrl=null,this._layoutKey=null,this._resizeObserver=null}setConfig(e){if(!e.entity)throw new Error("Please define an entity of the iPIXEL display");this._config={refresh:2,show_controls:!0,show_panels:!0,...e},this.render()}set hass(e){let t=!this._hass;this._hass=e,t||this._needsRerender()?this.render():this._updateDynamic()}connectedCallback(){this._startRefresh()}disconnectedCallback(){super.disconnectedCallback(),this._stopRefresh(),this._resizeObserver?.disconnect()}_camera(){return this.getRelatedEntity("camera","preview")}_mode(){return this.getRelatedEntity("select","mode")?.state||"textimage"}_power(){return this.getRelatedEntity("switch","power")}_brightness(){return this.getRelatedEntity("number","brightness")}_panelCount(){return this.getRelatedEntity("sensor","panel_count")}_layout(){let[e,t]=this.getResolution(),s=this.getRelatedEntity("sensor","width"),i=s?.attributes?.tiles;return Array.isArray(i)&&i.length?{width:e,height:t,tiles:i,missing:s.attributes.missing_panels||[]}:{width:e,height:t,tiles:[{panel:"single",x:0,y:0,width:e,height:t}],missing:[]}}_needsRerender(){let e=JSON.stringify([this._layout(),this._mode(),this._power()?.state,this._panelCount()?.state]),t=e!==this._layoutKey;return this._layoutKey=e,t}_startRefresh(){this._stopRefresh();let e=Math.max(.5,Number(this._config?.refresh)||2);this._timer=setInterval(()=>this._loadFrame(),e*1e3),this._loadFrame()}_stopRefresh(){this._timer&&clearInterval(this._timer),this._timer=null}async _loadFrame(){let t=this._camera()?.attributes?.entity_picture;if(!this._hass||!t){this._frame=null,this._draw();return}let s=this._hass.hassUrl?this._hass.hassUrl(t):t,i=`${s}${s.includes("?")?"&":"?"}ts=${Date.now()}`;try{let o=await fetch(i,{cache:"no-store"});if(!o.ok)throw new Error(`HTTP ${o.status}`);let n=await o.blob();if(n.size===0){this._frame=null,this._draw();return}this._frame=await createImageBitmap(n)}catch{this._frame=null}this._draw()}_draw(){let e=this.shadowRoot?.getElementById("wall");if(!e)return;let{width:t,height:s,tiles:i}=this._layout(),o=this.isOn(),n=this._mode(),r=this._config.show_panels!==!1&&i.length>1,a=Math.max(120,e.parentElement?.clientWidth||320),l=Math.max(1,...i.map(x=>x.x+x.width)),c=Math.max(1,...i.map(x=>x.y+x.height)),f=r?2:0,h=r?new Set(i.map(x=>x.x)).size-1:0,u=r?new Set(i.map(x=>x.y)).size-1:0,p=Math.max(2,Math.floor(a/(l+h*f))),g=window.devicePixelRatio||1,v=l*p+h*f*p,m=c*p+u*f*p;e.style.width=`${v}px`,e.style.height=`${m}px`,e.width=Math.round(v*g),e.height=Math.round(m*g);let b=e.getContext("2d");b.setTransform(g,0,0,g,0,0),b.fillStyle="#000",b.fillRect(0,0,v,m);let _=null;if(o&&this._frame&&!Dt[n]){let x=document.createElement("canvas");x.width=t,x.height=s;let S=x.getContext("2d");S.imageSmoothingEnabled=!1,S.drawImage(this._frame,0,0,t,s),_=S.getImageData(0,0,t,s).data}let y=[...new Set(i.map(x=>x.x))].sort((x,S)=>x-S),w=[...new Set(i.map(x=>x.y))].sort((x,S)=>x-S),I=x=>r?y.filter(S=>S>0&&S<=x).length*f*p:0,E=x=>r?w.filter(S=>S>0&&S<=x).length*f*p:0,C=Math.max(1,p-Math.max(1,Math.round(p*.18))),k=Math.min(C/2,Math.max(1,p*.25));for(let x of i){let S=x.x*p+I(x.x),P=x.y*p+E(x.y);r&&(b.fillStyle="#141414",b.fillRect(S-2,P-2,x.width*p+4,x.height*p+4),b.strokeStyle="#3d3d3d",b.lineWidth=1,b.strokeRect(S-2.5,P-2.5,x.width*p+5,x.height*p+5));for(let A=0;A<x.height;A++)for(let B=0;B<x.width;B++){let z=24,Y=24,J=24;if(_){let D=((x.y+A)*t+(x.x+B))*4;_[D]+_[D+1]+_[D+2]>18&&(z=_[D],Y=_[D+1],J=_[D+2])}b.fillStyle=`rgb(${z},${Y},${J})`;let K=S+B*p+(p-C)/2,Z=P+A*p+(p-C)/2;p>=5?(b.beginPath(),b.roundRect(K,Z,C,C,k),b.fill()):b.fillRect(K,Z,C,C)}}let R=this.shadowRoot.getElementById("overlay");if(R){let x="";if(!o)x='<div class="overlay-text">Off</div>';else if(Dt[n]){let S=Dt[n];x=`<svg viewBox="0 0 24 24"><path fill="currentColor" d="${S.icon}"/></svg><div class="overlay-text">${S.label}</div>`}else this._frame||(x='<div class="overlay-text">No frame yet</div>');R.innerHTML=x,R.style.display=x?"flex":"none"}}_updateDynamic(){let e=this._brightness(),t=this.shadowRoot?.getElementById("brightness");t&&e&&document.activeElement!==t&&(t.value=e.state);let s=this.shadowRoot?.getElementById("brightness-value");s&&e&&(s.textContent=`${Math.round(Number(e.state))}%`),this._draw()}render(){if(!this._hass||!this._config?.entity)return;let{width:e,height:t,tiles:s,missing:i}=this._layout(),o=this.isOn(),n=this._mode(),r=this._config.name||this.getEntity()?.attributes?.friendly_name?.replace(/ (Display|Tekst)$/i,"")||"iPIXEL",a=this._brightness(),l=this._panelCount(),c=this.getRelatedEntity("text","display"),f=this._config.show_controls!==!1;this.shadowRoot.innerHTML=`
      <style>${L}
        .wall-wrap { position: relative; background: #000; border-radius: 10px; padding: 10px; border: 2px solid #222; display: flex; justify-content: center; }
        canvas { display: block; image-rendering: pixelated; }
        #overlay { position: absolute; inset: 10px; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: rgba(255,255,255,0.55); pointer-events: none; }
        #overlay svg { width: 28px; height: 28px; }
        .overlay-text { font-size: 0.8em; text-align: center; padding: 0 12px; }
        .meta { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 0.75em; opacity: 0.7; flex-wrap: wrap; gap: 6px; }
        .badge { background: rgba(255,255,255,0.1); padding: 2px 7px; border-radius: 3px; }
        .badge.warn { background: rgba(255,152,0,0.25); color: #ffb74d; }
        .controls { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
        .row { display: flex; align-items: center; gap: 10px; }
        .row label { font-size: 0.8em; opacity: 0.75; min-width: 70px; }
        .row input[type=range] { flex: 1; }
        .modes { display: flex; gap: 6px; flex-wrap: wrap; }
        .mode-btn { padding: 5px 10px; border-radius: 14px; border: 1px solid var(--divider-color, #444); background: transparent; color: inherit; cursor: pointer; font-size: 0.78em; }
        .mode-btn.active { background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4); color: #fff; }
        .text-row { display: flex; gap: 6px; }
        .text-row input { flex: 1; padding: 7px 9px; border-radius: 6px; border: 1px solid var(--divider-color, #444); background: var(--card-background-color, #1c1c1c); color: inherit; }
        .text-row button { padding: 7px 12px; border-radius: 6px; border: none; background: var(--primary-color, #03a9f4); color: #fff; cursor: pointer; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="card-header">
            <div class="card-title"><span class="status-dot ${o?"":"off"}"></span>${r}</div>
            <button class="icon-btn ${o?"active":""}" id="power-btn" title="Power">
              <svg viewBox="0 0 24 24"><path d="M13,3H11V13H13V3M17.83,5.17L16.41,6.59C18.05,7.91 19,9.9 19,12A7,7 0 0,1 12,19A7,7 0 0,1 5,12C5,9.9 5.95,7.91 7.59,6.59L6.17,5.17C4.23,6.82 3,9.26 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12C21,9.26 19.77,6.82 17.83,5.17Z"/></svg>
            </button>
          </div>
          <div class="wall-wrap"><canvas id="wall"></canvas><div id="overlay"></div></div>
          <div class="meta">
            <span>${e} \xD7 ${t}${s.length>1?` \xB7 ${s.length} panels`:""}</span>
            <span>
              <span class="badge">${o?ee[n]||n:"Off"}</span>
              ${l&&s.length>1?`<span class="badge ${i.length?"warn":""}">${l.state} online</span>`:""}
            </span>
          </div>
          ${f?`
          <div class="controls">
            ${a?`
            <div class="row">
              <label>Brightness</label>
              <input type="range" id="brightness" min="1" max="100" value="${a.state}">
              <span id="brightness-value" style="font-size:0.8em;min-width:36px;text-align:right">${Math.round(Number(a.state))}%</span>
            </div>`:""}
            <div class="row">
              <label>Mode</label>
              <div class="modes">
                ${Object.entries(ee).map(([p,g])=>`<button class="mode-btn ${n===p?"active":""}" data-mode="${p}">${g}</button>`).join("")}
              </div>
            </div>
            ${c?`
            <div class="text-row">
              <input type="text" id="text-input" placeholder="Text (templates allowed)" value="${(c.state||"").replace(/"/g,"&quot;")}">
              <button id="text-send">Show</button>
            </div>`:""}
          </div>`:""}
        </div>
      </ha-card>`,this.shadowRoot.getElementById("power-btn")?.addEventListener("click",()=>{let p=this._power();p&&this._hass.callService("switch","toggle",{entity_id:p.entity_id})}),this.shadowRoot.getElementById("brightness")?.addEventListener("change",p=>{this.setRelatedEntity("number","brightness",parseInt(p.target.value))}),this.shadowRoot.getElementById("brightness")?.addEventListener("input",p=>{let g=this.shadowRoot.getElementById("brightness-value");g&&(g.textContent=`${p.target.value}%`)}),this.shadowRoot.querySelectorAll("[data-mode]").forEach(p=>p.addEventListener("click",g=>{this.setRelatedEntity("select","mode",g.currentTarget.dataset.mode),this.callService("ipixel_color","update_display")}));let h=()=>{let p=this.shadowRoot.getElementById("text-input")?.value||"";if(!p)return;let g=this._mode(),v=g==="text"||g==="textimage"?g:"textimage";this.callService("ipixel_color","display_text",{text:p,mode:v}),this.setRelatedEntity("text","display",p)};this.shadowRoot.getElementById("text-send")?.addEventListener("click",h),this.shadowRoot.getElementById("text-input")?.addEventListener("keydown",p=>{p.key==="Enter"&&h()}),this._resizeObserver?.disconnect();let u=this.shadowRoot.querySelector(".wall-wrap");u&&typeof ResizeObserver<"u"&&(this._resizeObserver=new ResizeObserver(()=>this._draw()),this._resizeObserver.observe(u)),this._draw(),this._loadFrame()}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}getCardSize(){return 4}};var Le=[{value:1,name:"Style 1 (Digital)"},{value:2,name:"Style 2 (Minimal)"},{value:3,name:"Style 3 (Bold)"},{value:4,name:"Style 4 (Retro)"},{value:5,name:"Style 5 (Neon)"},{value:6,name:"Style 6 (Matrix)"},{value:7,name:"Style 7 (Classic)"},{value:8,name:"Style 8 (Modern)"}],Pe=[{value:0,name:"Static"},{value:1,name:"Scroll Left"},{value:2,name:"Scroll Right"},{value:3,name:"Scroll Up"},{value:4,name:"Scroll Down"},{value:5,name:"Flash"},{value:6,name:"Fade In/Out"},{value:7,name:"Bounce"}],yt=class extends ${constructor(){super(),this._clockStyle=1,this._is24Hour=!0,this._showDate=!1,this._upsideDown=!1,this._animationMode=0}render(){let e=this.isInTestMode();if(!this._hass&&!e)return;let t=this.isOn();this.shadowRoot.innerHTML=`
      <style>${L}
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }
        .toggle-label {
          font-size: 0.85em;
          color: var(--primary-text-color, #fff);
        }
        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .toggle-switch.active {
          background: var(--primary-color, #03a9f4);
        }
        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .toggle-switch.active::after {
          transform: translateX(20px);
        }
        .subsection {
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        }
        .subsection-title {
          font-size: 0.75em;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.6;
          margin-bottom: 8px;
        }
        .screen-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
        }
        .screen-btn {
          padding: 8px 4px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: var(--primary-text-color, #fff);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8em;
          text-align: center;
          transition: all 0.2s;
        }
        .screen-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .screen-btn.active {
          background: var(--primary-color, #03a9f4);
          border-color: var(--primary-color, #03a9f4);
        }
        .screen-btn.delete {
          background: rgba(244,67,54,0.2);
          border-color: rgba(244,67,54,0.3);
          color: #f44336;
        }
        .screen-btn.delete:hover {
          background: rgba(244,67,54,0.4);
        }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .compact-row { display: flex; gap: 8px; align-items: center; }
        .compact-row select { flex: 1; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="section-title">Quick Actions</div>
          <div class="control-row">
            <div class="button-grid button-grid-4">
              <button class="icon-btn ${t?"active":""}" data-action="power" title="Power">
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

          <div class="section-title">Clock Settings</div>
          <div class="subsection">
            <div class="compact-row" style="margin-bottom: 12px;">
              <select class="dropdown" id="clock-style">
                ${Le.map(s=>`<option value="${s.value}"${s.value===this._clockStyle?" selected":""}>${s.name}</option>`).join("")}
              </select>
              <button class="btn btn-primary" id="apply-clock-btn">Apply</button>
            </div>
            <div class="toggle-row">
              <span class="toggle-label">24-Hour Format</span>
              <div class="toggle-switch ${this._is24Hour?"active":""}" id="toggle-24h"></div>
            </div>
            <div class="toggle-row">
              <span class="toggle-label">Show Date</span>
              <div class="toggle-switch ${this._showDate?"active":""}" id="toggle-date"></div>
            </div>
          </div>

          <div class="section-title">Text Animation</div>
          <div class="control-row">
            <select class="dropdown" id="animation-mode">
              ${Pe.map(s=>`<option value="${s.value}"${s.value===this._animationMode?" selected":""}>${s.name}</option>`).join("")}
            </select>
          </div>

          <div class="section-title">Orientation & Display</div>
          <div class="two-col">
            <div>
              <div class="subsection-title">Rotation</div>
              <select class="dropdown" id="orientation">
                <option value="0">0\xB0 (Normal)</option>
                <option value="1">180\xB0</option>
              </select>
            </div>
            <div>
              <div class="subsection-title">Flip</div>
              <div class="toggle-row" style="padding: 4px 0;">
                <span class="toggle-label">Upside Down</span>
                <div class="toggle-switch ${this._upsideDown?"active":""}" id="toggle-upside-down"></div>
              </div>
            </div>
          </div>

          <div class="section-title">Screen Slots</div>
          <div class="subsection">
            <div class="subsection-title">Select Screen (1-9)</div>
            <div class="screen-grid" style="margin-bottom: 12px;">
              ${[1,2,3,4,5,6,7,8,9].map(s=>`<button class="screen-btn" data-screen="${s}">${s}</button>`).join("")}
            </div>
            <div class="subsection-title">Delete Screen</div>
            <div class="screen-grid">
              ${[1,2,3,4,5,6,7,8,9,10].map(s=>`<button class="screen-btn delete" data-delete="${s}">\xD7${s}</button>`).join("")}
            </div>
          </div>

          <div class="section-title">Font Settings</div>
          <div class="subsection">
            <div class="two-col" style="margin-bottom: 12px;">
              <div>
                <div class="subsection-title">Size (0 = auto, max 128)</div>
                <input type="number" class="text-input" id="font-size" value="${this.getRelatedEntity("number","font_size")?.state??0}" min="0" max="128" style="width: 100%;">
              </div>
            </div>
          </div>

          <div class="section-title">DIY Mode</div>
          <div class="control-row">
            <select class="dropdown" id="diy-mode">
              <option value="">-- Select Action --</option>
              <option value="1">Enter (Clear Display)</option>
              <option value="3">Enter (Preserve Content)</option>
              <option value="0">Exit (Keep Previous)</option>
              <option value="2">Exit (Keep Current)</option>
            </select>
          </div>

          <div class="section-title">Raw Command</div>
          <div class="control-row" style="margin-top: 8px;">
            <div style="display: flex; gap: 8px;">
              <input type="text" class="text-input" id="raw-command" placeholder="Raw hex (e.g., 05 00 07 01 01)" style="flex: 1;">
              <button class="btn btn-secondary" id="send-raw-btn">Send</button>
            </div>
          </div>
        </div>
      </ha-card>`,this._attachControlListeners()}_attachControlListeners(){this.shadowRoot.querySelectorAll("[data-action]").forEach(t=>{t.addEventListener("click",s=>{let i=s.currentTarget.dataset.action;if(i==="power"){let o=this.getRelatedEntity("switch","power");o&&this._hass.callService("switch","toggle",{entity_id:o.entity_id})}else i==="clear"?(M({text:"",mode:"text",effect:"fixed",speed:50,fgColor:"#ff6600",bgColor:"#000000"}),this.callService("ipixel_color","clear_display")):i==="clock"?this._applyClockSettings():i==="sync"&&this.callService("ipixel_color","sync_time")})});let e=this.shadowRoot.getElementById("brightness");e&&(e.style.setProperty("--value",`${e.value}%`),e.addEventListener("input",t=>{t.target.style.setProperty("--value",`${t.target.value}%`),this.shadowRoot.getElementById("brightness-val").textContent=`${t.target.value}%`}),e.addEventListener("change",t=>{this.callService("ipixel_color","set_brightness",{level:parseInt(t.target.value)})})),this.shadowRoot.querySelectorAll("[data-mode]").forEach(t=>{t.addEventListener("click",s=>{let i=s.currentTarget.dataset.mode,o=this.getRelatedEntity("select","mode");o&&this._hass.callService("select","select_option",{entity_id:o.entity_id,option:i}),M({mode:i,fgColor:{text:"#ff6600",textimage:"#ff6600",clock:"#00ff88",gif:"#ff44ff",rhythm:"#44aaff"}[i]||"#ff6600",text:i==="clock"?"":window.iPIXELDisplayState?.text||""}),this.shadowRoot.querySelectorAll("[data-mode]").forEach(r=>r.classList.remove("active")),s.currentTarget.classList.add("active")})}),this.shadowRoot.getElementById("clock-style")?.addEventListener("change",t=>{this._clockStyle=parseInt(t.target.value)}),this.shadowRoot.getElementById("apply-clock-btn")?.addEventListener("click",()=>{this._applyClockSettings()}),this.shadowRoot.getElementById("toggle-24h")?.addEventListener("click",t=>{this._is24Hour=!this._is24Hour,t.currentTarget.classList.toggle("active",this._is24Hour)}),this.shadowRoot.getElementById("toggle-date")?.addEventListener("click",t=>{this._showDate=!this._showDate,t.currentTarget.classList.toggle("active",this._showDate)}),this.shadowRoot.getElementById("animation-mode")?.addEventListener("change",t=>{this._animationMode=parseInt(t.target.value),M({animationMode:this._animationMode}),this.setRelatedEntity("number","text_animation",this._animationMode)}),this.shadowRoot.getElementById("orientation")?.addEventListener("change",t=>{let s=parseInt(t.target.value);this.callService("ipixel_color","set_orientation",{orientation:s})}),this.shadowRoot.getElementById("toggle-upside-down")?.addEventListener("click",t=>{this._upsideDown=!this._upsideDown,t.currentTarget.classList.toggle("active",this._upsideDown),this.callService("ipixel_color","set_upside_down",{upside_down:this._upsideDown})}),this.shadowRoot.querySelectorAll("[data-screen]").forEach(t=>{t.addEventListener("click",s=>{let i=parseInt(s.currentTarget.dataset.screen);this.callService("ipixel_color","set_screen",{screen:i}),this.shadowRoot.querySelectorAll("[data-screen]").forEach(o=>o.classList.remove("active")),s.currentTarget.classList.add("active")})}),this.shadowRoot.querySelectorAll("[data-delete]").forEach(t=>{t.addEventListener("click",s=>{let i=parseInt(s.currentTarget.dataset.delete);confirm(`Delete screen slot ${i}?`)&&this.callService("ipixel_color","delete_slot",{slot:i})})}),this.shadowRoot.getElementById("font-size")?.addEventListener("change",t=>{let s=parseInt(t.target.value);M({fontSize:s}),this.setRelatedEntity("number","font_size",s)}),this.shadowRoot.getElementById("diy-mode")?.addEventListener("change",t=>{let s=t.target.value;s!==""&&(this.callService("ipixel_color","set_diy_mode",{mode:s}),setTimeout(()=>{t.target.value=""},500))}),this.shadowRoot.getElementById("send-raw-btn")?.addEventListener("click",()=>{let t=this.shadowRoot.getElementById("raw-command")?.value;t&&t.trim()&&this.callService("ipixel_color","send_raw_command",{hex_data:t.trim()})}),this.shadowRoot.getElementById("raw-command")?.addEventListener("keypress",t=>{if(t.key==="Enter"){let s=t.target.value;s&&s.trim()&&this.callService("ipixel_color","send_raw_command",{hex_data:s.trim()})}})}_applyClockSettings(){M({text:"",mode:"clock",effect:"fixed",speed:50,fgColor:"#00ff88",bgColor:"#000000",clockStyle:this._clockStyle,is24Hour:this._is24Hour,showDate:this._showDate}),this.callService("ipixel_color","set_clock_mode",{style:this._clockStyle,format_24:this._is24Hour,show_date:this._showDate})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var Oe=[{value:0,name:"None"},{value:1,name:"Rainbow Wave"},{value:2,name:"Rainbow Cycle"},{value:3,name:"Rainbow Pulse"},{value:4,name:"Rainbow Fade"},{value:5,name:"Rainbow Chase"},{value:6,name:"Rainbow Sparkle"},{value:7,name:"Rainbow Gradient"},{value:8,name:"Rainbow Theater"},{value:9,name:"Rainbow Fire"}],Ae=[{value:0,name:"Classic Bars"},{value:1,name:"Mirrored Bars"},{value:2,name:"Center Out"},{value:3,name:"Wave Style"},{value:4,name:"Particle Style"}],wt=class extends ${constructor(){super(),this._activeTab="text",this._rhythmLevels=[0,0,0,0,0,0,0,0,0,0,0],this._selectedRhythmStyle=0,this._selectedAmbient="rainbow"}_buildTextEffectOptions(){let e=Object.entries(T).filter(([s,i])=>i.category===G.TEXT).map(([s,i])=>`<option value="${s}">${i.name}</option>`).join(""),t=Object.entries(T).filter(([s,i])=>i.category===G.COLOR).map(([s,i])=>`<option value="${s}">${i.name}</option>`).join("");return`
      <optgroup label="Text Effects">
        ${e}
      </optgroup>
      <optgroup label="Color Effects">
        ${t}
      </optgroup>
    `}_buildAmbientEffectOptions(){return Object.entries(T).filter(([e,t])=>t.category===G.AMBIENT).map(([e,t])=>`<option value="${e}">${t.name}</option>`).join("")}_buildAmbientGrid(){let e=this._selectedAmbient||"rainbow";return Object.entries(T).filter(([t,s])=>s.category===G.AMBIENT).map(([t,s])=>`
        <button class="effect-btn ${t===e?"active":""}" data-effect="${t}">
          ${s.name}
        </button>
      `).join("")}_buildRainbowOptions(){return Oe.map(e=>`<option value="${e.value}">${e.name}</option>`).join("")}_buildRhythmStyleGrid(){let e=this._selectedRhythmStyle||0;return Ae.map(t=>`
      <button class="style-btn ${t.value===e?"active":""}" data-style="${t.value}">
        ${t.name}
      </button>
    `).join("")}_buildRhythmLevelSliders(){let e=["32Hz","64Hz","125Hz","250Hz","500Hz","1kHz","2kHz","4kHz","8kHz","12kHz","16kHz"];return this._rhythmLevels.map((t,s)=>`
      <div class="rhythm-band">
        <label>${e[s]}</label>
        <input type="range" class="rhythm-slider" data-band="${s}" min="0" max="15" value="${t}">
        <span class="rhythm-val">${t}</span>
      </div>
    `).join("")}render(){let e=this.isInTestMode();if(!this._hass&&!e)return;let t=this._activeTab==="text",s=this._activeTab==="ambient",i=this._activeTab==="rhythm",o=this._activeTab==="advanced";this.shadowRoot.innerHTML=`
      <style>${L}
        .tabs { display: flex; gap: 4px; margin-bottom: 16px; }
        .tab {
          flex: 1;
          padding: 10px 8px;
          border: none;
          background: rgba(255,255,255,0.05);
          color: var(--primary-text-color, #fff);
          cursor: pointer;
          border-radius: 8px;
          font-size: 0.8em;
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
        .effect-btn, .style-btn {
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
        .effect-btn:hover, .style-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .effect-btn.active, .style-btn.active {
          background: var(--primary-color, #03a9f4);
          border-color: var(--primary-color, #03a9f4);
        }
        .style-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .rhythm-band {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .rhythm-band label {
          width: 50px;
          font-size: 0.75em;
          opacity: 0.8;
        }
        .rhythm-slider {
          flex: 1;
          height: 4px;
        }
        .rhythm-val {
          width: 20px;
          font-size: 0.75em;
          text-align: right;
        }
        .rhythm-container {
          max-height: 300px;
          overflow-y: auto;
          padding-right: 8px;
        }
        .gfx-textarea {
          width: 100%;
          min-height: 150px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: var(--primary-text-color, #fff);
          font-family: monospace;
          font-size: 0.8em;
          padding: 12px;
          resize: vertical;
        }
        .gfx-textarea:focus {
          outline: none;
          border-color: var(--primary-color, #03a9f4);
        }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="tabs">
            <button class="tab ${t?"active":""}" id="tab-text">Text</button>
            <button class="tab ${s?"active":""}" id="tab-ambient">Ambient</button>
            <button class="tab ${i?"active":""}" id="tab-rhythm">Rhythm</button>
            <button class="tab ${o?"active":""}" id="tab-advanced">GFX</button>
          </div>

          <!-- Text Tab -->
          <div class="tab-content ${t?"active":""}" id="content-text">
            <div class="section-title">Display Text</div>
            <div class="input-row">
              <input type="text" class="text-input" id="text-input" placeholder="Enter text to display...">
              <button class="btn btn-primary" id="send-btn">Send</button>
            </div>
            <div class="two-col">
              <div>
                <div class="section-title">Effect</div>
                <div class="control-row">
                  <select class="dropdown" id="text-effect">
                    ${this._buildTextEffectOptions()}
                  </select>
                </div>
              </div>
              <div>
                <div class="section-title">Rainbow Mode</div>
                <div class="control-row">
                  <select class="dropdown" id="rainbow-mode">
                    ${this._buildRainbowOptions()}
                  </select>
                </div>
              </div>
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
          <div class="tab-content ${s?"active":""}" id="content-ambient">
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

          <!-- Rhythm Tab -->
          <div class="tab-content ${i?"active":""}" id="content-rhythm">
            <div class="section-title">Visualization Style</div>
            <div class="style-grid" id="rhythm-style-grid">
              ${this._buildRhythmStyleGrid()}
            </div>
            <div class="section-title">Frequency Levels (0-15)</div>
            <div class="rhythm-container">
              ${this._buildRhythmLevelSliders()}
            </div>
            <button class="btn btn-primary" id="apply-rhythm-btn" style="width: 100%; margin-top: 12px;">Apply Rhythm</button>
          </div>

          <!-- Advanced/GFX Tab -->
          <div class="tab-content ${o?"active":""}" id="content-advanced">
            <div class="section-title">GFX JSON Data</div>
            <textarea class="gfx-textarea" id="gfx-json" placeholder='Enter GFX JSON data...
Example:
{
  "width": 64,
  "height": 16,
  "pixels": [
    {"x": 0, "y": 0, "color": "#ff0000"},
    {"x": 1, "y": 0, "color": "#00ff00"}
  ]
}'></textarea>
            <button class="btn btn-primary" id="apply-gfx-btn" style="width: 100%; margin-top: 12px;">Render GFX</button>
            <div class="section-title" style="margin-top: 16px;">Per-Character Colors</div>
            <div class="input-row">
              <input type="text" class="text-input" id="multicolor-text" placeholder="Text (e.g., HELLO)">
            </div>
            <div class="input-row">
              <input type="text" class="text-input" id="multicolor-colors" placeholder="Colors (e.g., #ff0000,#00ff00,#0000ff)">
            </div>
            <button class="btn btn-primary" id="apply-multicolor-btn" style="width: 100%; margin-top: 8px;">Send Multicolor Text</button>
          </div>
        </div>
      </ha-card>`,this._attachListeners()}_getTextFormValues(){return{text:this.shadowRoot.getElementById("text-input")?.value||"",effect:this.shadowRoot.getElementById("text-effect")?.value||"fixed",rainbowMode:parseInt(this.shadowRoot.getElementById("rainbow-mode")?.value||"0"),speed:parseInt(this.shadowRoot.getElementById("text-speed")?.value||"50"),fgColor:this.shadowRoot.getElementById("text-color")?.value||"#ff6600",bgColor:this.shadowRoot.getElementById("bg-color")?.value||"#000000",font:this.shadowRoot.getElementById("font-select")?.value||"VCR_OSD_MONO"}}_getRhythmFormValues(){return{style:this._selectedRhythmStyle||0,levels:[...this._rhythmLevels]}}_getGfxFormValues(){let e=this.shadowRoot.getElementById("gfx-json")?.value||"";try{return JSON.parse(e)}catch{return null}}_getMulticolorFormValues(){let e=this.shadowRoot.getElementById("multicolor-text")?.value||"",s=(this.shadowRoot.getElementById("multicolor-colors")?.value||"").split(",").map(i=>i.trim()).filter(i=>i);return{text:e,colors:s}}_getAmbientFormValues(){return{effect:this._selectedAmbient||"rainbow",speed:parseInt(this.shadowRoot.getElementById("ambient-speed")?.value||"50")}}_updateTextPreview(){let{text:e,effect:t,speed:s,fgColor:i,bgColor:o,font:n}=this._getTextFormValues();M({text:e||"Preview",mode:"text",effect:t,speed:s,fgColor:i,bgColor:o,font:n})}_updateAmbientPreview(){let{effect:e,speed:t}=this._getAmbientFormValues();M({text:"",mode:"ambient",effect:e,speed:t,fgColor:"#ffffff",bgColor:"#000000"})}_attachListeners(){this.shadowRoot.getElementById("tab-text")?.addEventListener("click",()=>{this._activeTab="text",this.render()}),this.shadowRoot.getElementById("tab-ambient")?.addEventListener("click",()=>{this._activeTab="ambient",this.render()}),this.shadowRoot.getElementById("tab-rhythm")?.addEventListener("click",()=>{this._activeTab="rhythm",this.render()}),this.shadowRoot.getElementById("tab-advanced")?.addEventListener("click",()=>{this._activeTab="advanced",this.render()});let e=this.shadowRoot.getElementById("text-speed");e&&(e.style.setProperty("--value",`${e.value}%`),e.addEventListener("input",s=>{s.target.style.setProperty("--value",`${s.target.value}%`),this.shadowRoot.getElementById("text-speed-val").textContent=s.target.value,this._updateTextPreview()})),this.shadowRoot.getElementById("text-effect")?.addEventListener("change",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("rainbow-mode")?.addEventListener("change",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("font-select")?.addEventListener("change",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("text-color")?.addEventListener("input",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("bg-color")?.addEventListener("input",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("text-input")?.addEventListener("input",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("send-btn")?.addEventListener("click",()=>{let{text:s,effect:i,rainbowMode:o,speed:n,fgColor:r,bgColor:a,font:l}=this._getTextFormValues();if(s){if(M({text:s,mode:"text",effect:i,speed:n,fgColor:r,bgColor:a,font:l,rainbowMode:o}),this.isInTestMode())return;this._config.entity&&this._hass&&this._hass.callService("text","set_value",{entity_id:this._config.entity,value:s});let c=l==="LEGACY"?"CUSONG":l;this.callService("ipixel_color","display_text",{text:s,effect:i,speed:n,color_fg:this.hexToRgb(r),color_bg:this.hexToRgb(a),font:c,rainbow_mode:o})}}),this.shadowRoot.querySelectorAll(".effect-btn").forEach(s=>{s.addEventListener("click",i=>{let o=i.target.dataset.effect;this._selectedAmbient=o,this.shadowRoot.querySelectorAll(".effect-btn").forEach(n=>n.classList.remove("active")),i.target.classList.add("active"),this._updateAmbientPreview()})});let t=this.shadowRoot.getElementById("ambient-speed");t&&(t.style.setProperty("--value",`${t.value}%`),t.addEventListener("input",s=>{s.target.style.setProperty("--value",`${s.target.value}%`),this.shadowRoot.getElementById("ambient-speed-val").textContent=s.target.value,this._updateAmbientPreview()})),this.shadowRoot.getElementById("apply-ambient-btn")?.addEventListener("click",()=>{let{effect:s,speed:i}=this._getAmbientFormValues();M({text:"",mode:"ambient",effect:s,speed:i,fgColor:"#ffffff",bgColor:"#000000"})}),this.shadowRoot.querySelectorAll(".style-btn").forEach(s=>{s.addEventListener("click",i=>{let o=parseInt(i.target.dataset.style);this._selectedRhythmStyle=o,this.shadowRoot.querySelectorAll(".style-btn").forEach(n=>n.classList.remove("active")),i.target.classList.add("active")})}),this.shadowRoot.querySelectorAll(".rhythm-slider").forEach(s=>{s.addEventListener("input",i=>{let o=parseInt(i.target.dataset.band),n=parseInt(i.target.value);this._rhythmLevels[o]=n,i.target.nextElementSibling.textContent=n})}),this.shadowRoot.getElementById("apply-rhythm-btn")?.addEventListener("click",()=>{let{style:s,levels:i}=this._getRhythmFormValues();M({text:"",mode:"rhythm",rhythmStyle:s,rhythmLevels:i}),this.callService("ipixel_color","set_rhythm_mode",{style:s,levels:i})}),this.shadowRoot.getElementById("apply-gfx-btn")?.addEventListener("click",()=>{let s=this._getGfxFormValues();if(!s){console.warn("iPIXEL: Invalid GFX JSON");return}M({text:"",mode:"gfx",gfxData:s});let i=Array.isArray(s)?{elements:s}:s;this.callService("ipixel_color","draw_visuals",i)}),this.shadowRoot.getElementById("apply-multicolor-btn")?.addEventListener("click",()=>{let{text:s,colors:i}=this._getMulticolorFormValues();if(s&&i.length>0){M({text:s,mode:"multicolor",colors:i});let o=s.split(/(\s+)/).filter(n=>n!=="").reduce((n,r)=>{if(/^\s+$/.test(r))return{out:n.out+r,i:n.i};let a=i[n.i%i.length].replace("#","");return{out:`${n.out}[#${a}]${r}[/]`,i:n.i+1}},{out:"",i:0}).out;this.callService("ipixel_color","display_text",{text:o,mode:"text"})}})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var ie="iPIXEL_Presets",Et=class extends ${constructor(){super(),this._presets=this._loadPresets(),this._editingPreset=null,this._selectedIcon="\u{1F4FA}"}_loadPresets(){try{let e=localStorage.getItem(ie);return e?JSON.parse(e):[]}catch{return[]}}_savePresets(){try{localStorage.setItem(ie,JSON.stringify(this._presets))}catch(e){console.warn("iPIXEL: Failed to save presets",e)}}render(){let e=this.isInTestMode();!this._hass&&!e||(this.shadowRoot.innerHTML=`
      <style>${L}
        .preset-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          max-height: 300px;
          overflow-y: auto;
        }
        .preset-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: all 0.2s;
        }
        .preset-item:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        .preset-item.active {
          border-color: var(--primary-color, #03a9f4);
          background: rgba(3, 169, 244, 0.1);
        }
        .preset-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2em;
        }
        .preset-info {
          flex: 1;
          min-width: 0;
        }
        .preset-name {
          font-weight: 500;
          font-size: 0.9em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .preset-desc {
          font-size: 0.75em;
          opacity: 0.6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .preset-actions {
          display: flex;
          gap: 4px;
        }
        .preset-actions button {
          padding: 6px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .preset-actions button:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .preset-actions button.delete:hover {
          background: rgba(244,67,54,0.2);
          color: #f44;
        }
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          opacity: 0.5;
        }
        .empty-state svg {
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }
        .add-preset-form {
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 16px;
        }
        .form-row {
          margin-bottom: 12px;
        }
        .form-row label {
          display: block;
          font-size: 0.8em;
          opacity: 0.7;
          margin-bottom: 4px;
        }
        .form-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .icon-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
          margin-top: 8px;
        }
        .icon-option {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1em;
          transition: all 0.2s;
          background: transparent;
        }
        .icon-option:hover {
          background: rgba(255,255,255,0.1);
        }
        .icon-option.selected {
          border-color: var(--primary-color, #03a9f4);
          background: rgba(3, 169, 244, 0.2);
        }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">Presets</div>
            <button class="icon-btn" id="add-preset-btn" title="Save Current as Preset">
              <svg viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg>
            </button>
          </div>

          <div class="preset-list" id="preset-list">
            ${this._presets.length===0?`
              <div class="empty-state">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z"/></svg>
                <div>No presets saved</div>
                <div style="font-size: 0.85em; margin-top: 4px;">Click + to save current display</div>
              </div>
            `:this._presets.map((t,s)=>`
              <div class="preset-item" data-index="${s}">
                <div class="preset-icon" style="background: ${t.fgColor||"#ff6600"}20; color: ${t.fgColor||"#ff6600"}">
                  ${t.icon||"\u{1F4FA}"}
                </div>
                <div class="preset-info">
                  <div class="preset-name">${this._escapeHtml(t.name)}</div>
                  <div class="preset-desc">${t.mode} \xB7 ${t.effect||"fixed"}${t.text?' \xB7 "'+t.text.substring(0,15)+(t.text.length>15?"...":"")+'"':""}</div>
                </div>
                <div class="preset-actions">
                  <button class="edit" data-action="edit" data-index="${s}" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>
                  </button>
                  <button class="delete" data-action="delete" data-index="${s}" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                  </button>
                </div>
              </div>
            `).join("")}
          </div>

          <div class="add-preset-form" id="preset-form" style="display: none;">
            <div class="form-row">
              <label>Preset Name</label>
              <input type="text" class="text-input" id="preset-name" placeholder="My Preset">
            </div>
            <div class="form-row">
              <label>Icon</label>
              <div class="icon-grid" id="icon-grid">
                ${["\u{1F4FA}","\u{1F4AC}","\u23F0","\u{1F3B5}","\u{1F3A8}","\u2B50","\u2764\uFE0F","\u{1F525}","\u{1F4A1}","\u{1F308}","\u{1F3AE}","\u{1F4E2}","\u{1F3E0}","\u{1F514}","\u2728","\u{1F389}"].map(t=>`
                  <button type="button" class="icon-option${t===this._selectedIcon?" selected":""}" data-icon="${t}">${t}</button>
                `).join("")}
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-secondary" id="cancel-preset-btn">Cancel</button>
              <button class="btn btn-primary" id="save-preset-btn">Save Preset</button>
            </div>
          </div>
        </div>
      </ha-card>`,this._attachListeners())}_escapeHtml(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML}_attachListeners(){this.shadowRoot.getElementById("add-preset-btn")?.addEventListener("click",()=>{this._editingPreset=null,this._selectedIcon="\u{1F4FA}",this.shadowRoot.getElementById("preset-form").style.display="block",this.shadowRoot.getElementById("preset-name").value="",this.shadowRoot.querySelectorAll(".icon-option").forEach(e=>e.classList.remove("selected")),this.shadowRoot.querySelector(".icon-option")?.classList.add("selected")}),this.shadowRoot.getElementById("cancel-preset-btn")?.addEventListener("click",()=>{this.shadowRoot.getElementById("preset-form").style.display="none",this._editingPreset=null}),this.shadowRoot.getElementById("save-preset-btn")?.addEventListener("click",()=>{let e=this.shadowRoot.getElementById("preset-name").value.trim()||"Preset",s=this.shadowRoot.querySelector(".icon-option.selected")?.dataset.icon||"\u{1F4FA}",i=at(),o={name:e,icon:s,text:i.text||"",mode:i.mode||"text",effect:i.effect||"fixed",speed:i.speed||50,fgColor:i.fgColor||"#ff6600",bgColor:i.bgColor||"#000000",font:i.font||"VCR_OSD_MONO",rainbowMode:i.rainbowMode||0,createdAt:Date.now()};this._editingPreset!==null?this._presets[this._editingPreset]=o:this._presets.push(o),this._savePresets(),this.shadowRoot.getElementById("preset-form").style.display="none",this._editingPreset=null,this.render()}),this.shadowRoot.querySelectorAll(".icon-option").forEach(e=>{e.addEventListener("click",t=>{this.shadowRoot.querySelectorAll(".icon-option").forEach(s=>s.classList.remove("selected")),t.currentTarget.classList.add("selected"),this._selectedIcon=t.currentTarget.dataset.icon})}),this.shadowRoot.querySelectorAll(".preset-item").forEach(e=>{e.addEventListener("click",t=>{if(t.target.closest(".preset-actions"))return;let s=parseInt(e.dataset.index),i=this._presets[s];i&&(M({text:i.text,mode:i.mode,effect:i.effect,speed:i.speed,fgColor:i.fgColor,bgColor:i.bgColor,font:i.font,rainbowMode:i.rainbowMode}),i.mode==="text"&&i.text&&this.callService("ipixel_color","display_text",{text:i.text,effect:i.effect,speed:i.speed,color_fg:this.hexToRgb(i.fgColor),color_bg:this.hexToRgb(i.bgColor),font:i.font,rainbow_mode:i.rainbowMode}),this.shadowRoot.querySelectorAll(".preset-item").forEach(o=>o.classList.remove("active")),e.classList.add("active"))})}),this.shadowRoot.querySelectorAll('[data-action="edit"]').forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();let s=parseInt(t.currentTarget.dataset.index),i=this._presets[s];i&&(this._editingPreset=s,this._selectedIcon=i.icon||"\u{1F4FA}",this.shadowRoot.getElementById("preset-form").style.display="block",this.shadowRoot.getElementById("preset-name").value=i.name,this.shadowRoot.querySelectorAll(".icon-option").forEach(o=>{o.classList.toggle("selected",o.dataset.icon===i.icon)}))})}),this.shadowRoot.querySelectorAll('[data-action="delete"]').forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();let s=parseInt(t.currentTarget.dataset.index);confirm("Delete this preset?")&&(this._presets.splice(s,1),this._savePresets(),this.render())})})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var se="iPIXEL_Schedules",St=class extends ${constructor(){super(),this._schedules=this._loadSchedules(),this._powerSchedule=this._loadPowerSchedule(),this._editingSlot=null,this._checkInterval=null}connectedCallback(){this._checkInterval=setInterval(()=>this._checkSchedules(),6e4),this._checkSchedules()}disconnectedCallback(){super.disconnectedCallback(),this._checkInterval&&clearInterval(this._checkInterval)}_loadSchedules(){try{let e=localStorage.getItem(se);return e?JSON.parse(e):[]}catch{return[]}}_saveSchedules(){try{localStorage.setItem(se,JSON.stringify(this._schedules))}catch(e){console.warn("iPIXEL: Failed to save schedules",e)}}_loadPowerSchedule(){try{let e=localStorage.getItem("iPIXEL_PowerSchedule");return e?JSON.parse(e):{enabled:!1,onTime:"07:00",offTime:"22:00"}}catch{return{enabled:!1,onTime:"07:00",offTime:"22:00"}}}_savePowerSchedule(){try{localStorage.setItem("iPIXEL_PowerSchedule",JSON.stringify(this._powerSchedule))}catch(e){console.warn("iPIXEL: Failed to save power schedule",e)}}_checkSchedules(){let e=new Date,t=`${e.getHours().toString().padStart(2,"0")}:${e.getMinutes().toString().padStart(2,"0")}`,s=e.getDay();for(let i of this._schedules)i.enabled&&(i.days&&!i.days.includes(s)||i.startTime===t&&(M({text:i.text||"",mode:i.mode||"text",effect:i.effect||"fixed",fgColor:i.fgColor||"#ff6600",bgColor:i.bgColor||"#000000"}),i.mode==="text"&&i.text?this.callService("ipixel_color","display_text",{text:i.text,effect:i.effect,color_fg:this.hexToRgb(i.fgColor),color_bg:this.hexToRgb(i.bgColor)}):i.mode==="clock"&&this.callService("ipixel_color","set_clock_mode",{style:1})))}render(){let e=this.isInTestMode();if(!this._hass&&!e)return;let t=new Date,s=(t.getHours()*60+t.getMinutes())/1440*100,i=`${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}`,o=this._schedules.filter(r=>r.enabled).map(r=>{let a=this._timeToMinutes(r.startTime),l=r.endTime?this._timeToMinutes(r.endTime):a+60,c=a/1440*100,f=(l-a)/1440*100;return`<div class="timeline-block" style="left: ${c}%; width: ${f}%; background: ${r.fgColor||"#03a9f4"}40;" title="${r.name||"Schedule"}"></div>`}).join(""),n=["Su","Mo","Tu","We","Th","Fr","Sa"];this.shadowRoot.innerHTML=`
      <style>${L}
        .timeline { background: rgba(255,255,255,0.05); border-radius: 6px; padding: 12px; margin-bottom: 12px; }
        .timeline-header { display: flex; justify-content: space-between; font-size: 0.7em; opacity: 0.5; margin-bottom: 6px; }
        .timeline-bar { height: 32px; background: rgba(255,255,255,0.1); border-radius: 4px; position: relative; overflow: hidden; }
        .timeline-now { position: absolute; width: 2px; height: 100%; background: #f44336; left: ${s}%; z-index: 2; }
        .timeline-block { position: absolute; height: 100%; border-radius: 2px; z-index: 1; }
        .power-section { background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
        .power-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .power-row label { font-size: 0.85em; }
        .power-row input[type="time"] {
          padding: 6px 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          color: inherit;
        }
        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
          max-height: 250px;
          overflow-y: auto;
        }
        .schedule-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .schedule-toggle {
          width: 36px;
          height: 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
        }
        .schedule-toggle.active {
          background: var(--primary-color, #03a9f4);
        }
        .schedule-toggle::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .schedule-toggle.active::after {
          transform: translateX(16px);
        }
        .schedule-info { flex: 1; min-width: 0; }
        .schedule-name { font-weight: 500; font-size: 0.9em; }
        .schedule-time { font-size: 0.75em; opacity: 0.6; }
        .schedule-actions button {
          padding: 4px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          border-radius: 4px;
        }
        .schedule-actions button:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .add-slot-form {
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 16px;
          margin-top: 12px;
        }
        .form-row { margin-bottom: 12px; }
        .form-row label { display: block; font-size: 0.8em; opacity: 0.7; margin-bottom: 4px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .day-selector {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .day-btn {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          background: transparent;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 0.75em;
          transition: all 0.2s;
        }
        .day-btn.selected {
          background: var(--primary-color, #03a9f4);
          border-color: var(--primary-color, #03a9f4);
          color: #fff;
        }
        .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
        .current-time { font-size: 0.85em; opacity: 0.7; text-align: right; margin-bottom: 4px; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="current-time">Current: ${i}</div>

          <div class="section-title">Timeline</div>
          <div class="timeline">
            <div class="timeline-header">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
            </div>
            <div class="timeline-bar">
              ${o}
              <div class="timeline-now"></div>
            </div>
          </div>

          <div class="section-title">Power Schedule</div>
          <div class="power-section">
            <div class="power-row">
              <div class="schedule-toggle ${this._powerSchedule.enabled?"active":""}" id="power-toggle"></div>
              <label>On:</label>
              <input type="time" id="power-on" value="${this._powerSchedule.onTime}">
              <label>Off:</label>
              <input type="time" id="power-off" value="${this._powerSchedule.offTime}">
              <button class="btn btn-primary" id="save-power">Save</button>
            </div>
          </div>

          <div class="section-title">Content Schedules</div>
          <div class="schedule-list" id="schedule-list">
            ${this._schedules.length===0?`
              <div class="empty-state" style="padding: 20px; text-align: center; opacity: 0.5;">
                No schedules configured
              </div>
            `:this._schedules.map((r,a)=>`
              <div class="schedule-item" data-index="${a}">
                <div class="schedule-toggle ${r.enabled?"active":""}" data-action="toggle" data-index="${a}"></div>
                <div class="schedule-info">
                  <div class="schedule-name">${this._escapeHtml(r.name||"Schedule "+(a+1))}</div>
                  <div class="schedule-time">
                    ${r.startTime}${r.endTime?" - "+r.endTime:""} \xB7
                    ${r.days?r.days.map(l=>n[l]).join(", "):"Daily"} \xB7
                    ${r.mode||"text"}
                  </div>
                </div>
                <div class="schedule-actions">
                  <button data-action="edit" data-index="${a}" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>
                  </button>
                  <button data-action="delete" data-index="${a}" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                  </button>
                </div>
              </div>
            `).join("")}
          </div>

          <button class="btn btn-secondary" id="add-slot" style="width: 100%;">+ Add Schedule</button>

          <div class="add-slot-form" id="slot-form" style="display: none;">
            <div class="form-row">
              <label>Name</label>
              <input type="text" class="text-input" id="slot-name" placeholder="Morning Message">
            </div>
            <div class="form-grid">
              <div class="form-row">
                <label>Start Time</label>
                <input type="time" class="text-input" id="slot-start" value="08:00" style="width: 100%;">
              </div>
              <div class="form-row">
                <label>End Time (optional)</label>
                <input type="time" class="text-input" id="slot-end" style="width: 100%;">
              </div>
            </div>
            <div class="form-row">
              <label>Days</label>
              <div class="day-selector" id="day-selector">
                ${n.map((r,a)=>`
                  <button type="button" class="day-btn selected" data-day="${a}">${r}</button>
                `).join("")}
              </div>
            </div>
            <div class="form-grid">
              <div class="form-row">
                <label>Mode</label>
                <select class="dropdown" id="slot-mode">
                  <option value="text">Text</option>
                  <option value="clock">Clock</option>
                  <option value="off">Power Off</option>
                </select>
              </div>
              <div class="form-row">
                <label>Effect</label>
                <select class="dropdown" id="slot-effect">
                  <option value="fixed">Fixed</option>
                  <option value="scroll_ltr">Scroll Left</option>
                  <option value="scroll_rtl">Scroll Right</option>
                  <option value="blink">Blink</option>
                </select>
              </div>
            </div>
            <div class="form-row" id="text-row">
              <label>Text</label>
              <input type="text" class="text-input" id="slot-text" placeholder="Good Morning!">
            </div>
            <div class="form-grid">
              <div class="form-row">
                <label>Text Color</label>
                <input type="color" id="slot-fg-color" value="#ff6600" style="width: 100%; height: 32px;">
              </div>
              <div class="form-row">
                <label>Background</label>
                <input type="color" id="slot-bg-color" value="#000000" style="width: 100%; height: 32px;">
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-secondary" id="cancel-slot">Cancel</button>
              <button class="btn btn-primary" id="save-slot">Save Schedule</button>
            </div>
          </div>
        </div>
      </ha-card>`,this._attachListeners()}_timeToMinutes(e){let[t,s]=e.split(":").map(Number);return t*60+s}_escapeHtml(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML}_attachListeners(){this.shadowRoot.getElementById("power-toggle")?.addEventListener("click",e=>{this._powerSchedule.enabled=!this._powerSchedule.enabled,e.currentTarget.classList.toggle("active",this._powerSchedule.enabled)}),this.shadowRoot.getElementById("save-power")?.addEventListener("click",()=>{this._powerSchedule.onTime=this.shadowRoot.getElementById("power-on")?.value||"07:00",this._powerSchedule.offTime=this.shadowRoot.getElementById("power-off")?.value||"22:00",this._savePowerSchedule(),this.callService("ipixel_color","set_power_schedule",{enabled:this._powerSchedule.enabled,on_time:this._powerSchedule.onTime,off_time:this._powerSchedule.offTime})}),this.shadowRoot.getElementById("add-slot")?.addEventListener("click",()=>{this._editingSlot=null,this._resetSlotForm(),this.shadowRoot.getElementById("slot-form").style.display="block"}),this.shadowRoot.getElementById("cancel-slot")?.addEventListener("click",()=>{this.shadowRoot.getElementById("slot-form").style.display="none",this._editingSlot=null}),this.shadowRoot.querySelectorAll(".day-btn").forEach(e=>{e.addEventListener("click",t=>{t.currentTarget.classList.toggle("selected")})}),this.shadowRoot.getElementById("slot-mode")?.addEventListener("change",e=>{let t=this.shadowRoot.getElementById("text-row");t&&(t.style.display=e.target.value==="text"?"block":"none")}),this.shadowRoot.getElementById("save-slot")?.addEventListener("click",()=>{let e=Array.from(this.shadowRoot.querySelectorAll(".day-btn.selected")).map(s=>parseInt(s.dataset.day)),t={name:this.shadowRoot.getElementById("slot-name")?.value||"Schedule",startTime:this.shadowRoot.getElementById("slot-start")?.value||"08:00",endTime:this.shadowRoot.getElementById("slot-end")?.value||"",days:e.length===7?null:e,mode:this.shadowRoot.getElementById("slot-mode")?.value||"text",effect:this.shadowRoot.getElementById("slot-effect")?.value||"fixed",text:this.shadowRoot.getElementById("slot-text")?.value||"",fgColor:this.shadowRoot.getElementById("slot-fg-color")?.value||"#ff6600",bgColor:this.shadowRoot.getElementById("slot-bg-color")?.value||"#000000",enabled:!0};this._editingSlot!==null?this._schedules[this._editingSlot]=t:this._schedules.push(t),this._saveSchedules(),this.shadowRoot.getElementById("slot-form").style.display="none",this._editingSlot=null,this.render()}),this.shadowRoot.querySelectorAll('[data-action="toggle"]').forEach(e=>{e.addEventListener("click",t=>{let s=parseInt(t.currentTarget.dataset.index);this._schedules[s].enabled=!this._schedules[s].enabled,this._saveSchedules(),t.currentTarget.classList.toggle("active",this._schedules[s].enabled)})}),this.shadowRoot.querySelectorAll('[data-action="edit"]').forEach(e=>{e.addEventListener("click",t=>{let s=parseInt(t.currentTarget.dataset.index),i=this._schedules[s];i&&(this._editingSlot=s,this._fillSlotForm(i),this.shadowRoot.getElementById("slot-form").style.display="block")})}),this.shadowRoot.querySelectorAll('[data-action="delete"]').forEach(e=>{e.addEventListener("click",t=>{let s=parseInt(t.currentTarget.dataset.index);confirm("Delete this schedule?")&&(this._schedules.splice(s,1),this._saveSchedules(),this.render())})})}_resetSlotForm(){this.shadowRoot.getElementById("slot-name").value="",this.shadowRoot.getElementById("slot-start").value="08:00",this.shadowRoot.getElementById("slot-end").value="",this.shadowRoot.getElementById("slot-mode").value="text",this.shadowRoot.getElementById("slot-effect").value="fixed",this.shadowRoot.getElementById("slot-text").value="",this.shadowRoot.getElementById("slot-fg-color").value="#ff6600",this.shadowRoot.getElementById("slot-bg-color").value="#000000",this.shadowRoot.querySelectorAll(".day-btn").forEach(e=>e.classList.add("selected")),this.shadowRoot.getElementById("text-row").style.display="block"}_fillSlotForm(e){this.shadowRoot.getElementById("slot-name").value=e.name||"",this.shadowRoot.getElementById("slot-start").value=e.startTime||"08:00",this.shadowRoot.getElementById("slot-end").value=e.endTime||"",this.shadowRoot.getElementById("slot-mode").value=e.mode||"text",this.shadowRoot.getElementById("slot-effect").value=e.effect||"fixed",this.shadowRoot.getElementById("slot-text").value=e.text||"",this.shadowRoot.getElementById("slot-fg-color").value=e.fgColor||"#ff6600",this.shadowRoot.getElementById("slot-bg-color").value=e.bgColor||"#000000";let t=e.days||[0,1,2,3,4,5,6];this.shadowRoot.querySelectorAll(".day-btn").forEach(s=>{s.classList.toggle("selected",t.includes(parseInt(s.dataset.day)))}),this.shadowRoot.getElementById("text-row").style.display=e.mode==="text"?"block":"none"}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var Be=["#FFFFFF","#000000","#FF0000","#00FF00","#0080FF","#FFFF00","#FF00FF","#00FFFF","#FF8000","#8000FF","#2EC4FF","#0010A0","#A0FF00","#FF80C0","#808080","#C0C0C0"],De=[{value:"16x16",label:"16\xD716"},{value:"32x8",label:"32\xD78"},{value:"32x16",label:"32\xD716"},{value:"32x32",label:"32\xD732"},{value:"64x16",label:"64\xD716"},{value:"64x20",label:"64\xD720"},{value:"64x64",label:"64\xD764"},{value:"96x16",label:"96\xD716"},{value:"128x16",label:"128\xD716"},{value:"192x16",label:"192\xD716"}],U={r:25,g:25,b:25},Ct=class extends ${constructor(){super(),this._width=64,this._height=16,this._tool="pen",this._drawing=!1,this._gridOn=!0,this._currentColor="#ff6600",this._scale=8,this._sending=!1,this._logicalCanvas=document.createElement("canvas"),this._ctx=this._logicalCanvas.getContext("2d"),this._displayCanvas=null,this._dctx=null,this._initialized=!1}setConfig(e){if(!e.entity&&!this.isInTestMode()){this._config=e;return}this._config=e}set hass(e){let t=!!this._hass;if(this._hass=e,!t){let[s,i]=this.getResolution();this._width=s,this._height=i,this._logicalCanvas.width=s,this._logicalCanvas.height=i,this.render()}}render(){let e=this.isInTestMode();if(!this._hass&&!e)return;let t=this.getEntity(),s=this.isOn(),[i,o]=this.getResolution(),n=`${this._width}x${this._height}`,r=De.map(l=>`<button class="preset-btn ${l.value===n?"active":""}" data-res="${l.value}">${l.label}</button>`).join(""),a=Be.map(l=>`<div class="color-swatch ${l.toLowerCase()===this._currentColor.toLowerCase()?"active":""}" data-color="${l}" style="background:${l}"></div>`).join("");this.shadowRoot.innerHTML=`
      <style>
        ${L}

        .editor-toolbar {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .tool-group {
          display: flex;
          gap: 4px;
        }

        .color-palette {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 12px;
        }

        .color-swatch {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          border: 2px solid transparent;
          box-sizing: border-box;
        }

        .color-swatch:hover {
          border-color: rgba(255,255,255,0.5);
        }

        .color-swatch.active {
          border-color: var(--ipixel-primary);
          box-shadow: 0 0 0 1px var(--ipixel-primary);
        }

        .canvas-container {
          background: #050608;
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 12px;
          overflow: auto;
          text-align: center;
        }

        #editor-canvas {
          display: inline-block;
          cursor: crosshair;
          image-rendering: pixelated;
          touch-action: none;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75em;
          opacity: 0.6;
          margin-bottom: 8px;
        }

        .tool-icon {
          font-size: 16px;
        }

        .resolution-inputs {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .resolution-inputs input {
          width: 48px;
          padding: 5px 6px;
          background: rgba(255,255,255,0.08);
          border: 1px solid var(--ipixel-border);
          border-radius: 6px;
          color: inherit;
          font-size: 0.85em;
          text-align: center;
        }

        .resolution-inputs span {
          opacity: 0.5;
          font-size: 0.85em;
        }

        .resolution-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 8px;
        }

        .preset-btn {
          padding: 3px 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--ipixel-border);
          border-radius: 4px;
          color: inherit;
          font-size: 0.7em;
          cursor: pointer;
          opacity: 0.7;
        }

        .preset-btn:hover {
          opacity: 1;
          background: rgba(255,255,255,0.12);
        }

        .preset-btn.active {
          border-color: var(--ipixel-primary);
          opacity: 1;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      </style>

      <ha-card>
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">
              <span class="status-dot ${s?"":"off"}"></span>
              ${this._config.name||"Pixel Editor"}
            </div>
          </div>

          <!-- Toolbar -->
          <div class="editor-toolbar">
            <div class="tool-group">
              <button class="icon-btn ${this._tool==="pen"?"active":""}" id="pen-tool" title="Pen Tool">
                <span class="tool-icon">&#9998;</span>
              </button>
              <button class="icon-btn ${this._tool==="eraser"?"active":""}" id="eraser-tool" title="Eraser Tool">
                <span class="tool-icon">&#9746;</span>
              </button>
            </div>
            <input type="color" class="color-picker" id="color-picker" value="${this._currentColor}" title="Pick Color">
            <button class="icon-btn ${this._gridOn?"active":""}" id="grid-toggle" title="Toggle LED Grid">
              <span class="tool-icon">&#9638;</span>
            </button>
            <div class="resolution-inputs">
              <input type="number" id="res-width" value="${this._width}" min="1" max="512" title="Width">
              <span>\xD7</span>
              <input type="number" id="res-height" value="${this._height}" min="1" max="512" title="Height">
            </div>
          </div>

          <!-- Resolution Presets -->
          <div class="resolution-presets" id="res-presets">
            ${r}
          </div>

          <!-- Color Palette -->
          <div class="color-palette" id="palette">
            ${a}
          </div>

          <!-- Canvas -->
          <div class="canvas-container">
            <canvas id="editor-canvas"></canvas>
          </div>

          <!-- Info -->
          <div class="info-row">
            <span>Tool: ${this._tool} | Grid: ${this._gridOn?"LED":"Flat"}</span>
            <span>Device: ${i}\xD7${o}</span>
          </div>

          <!-- Actions -->
          <div class="button-grid button-grid-3">
            <button class="btn btn-secondary" id="clear-btn">Clear</button>
            <button class="btn btn-secondary" id="import-btn">Import</button>
            <button class="btn btn-primary send-btn" id="send-btn" ${this._sending?"disabled":""}>
              ${this._sending?"Sending...":e?"Preview Only":"Send to Device"}
            </button>
          </div>

          <!-- Hidden file input for import -->
          <input type="file" id="file-input" accept="image/png,image/gif,image/jpeg" style="display:none">
        </div>
      </ha-card>
    `,this._initCanvas(),this._attachListeners()}_initCanvas(){this._displayCanvas=this.shadowRoot.getElementById("editor-canvas"),this._displayCanvas&&(this._dctx=this._displayCanvas.getContext("2d"),(this._logicalCanvas.width!==this._width||this._logicalCanvas.height!==this._height)&&(this._logicalCanvas.width=this._width,this._logicalCanvas.height=this._height),this._updateDisplaySize(),this._renderDisplay(),this._initialized=!0)}_updateDisplaySize(){this._displayCanvas&&(this._displayCanvas.width=this._width*this._scale,this._displayCanvas.height=this._height*this._scale)}_renderDisplay(){if(!this._dctx||!this._ctx)return;this._updateDisplaySize(),this._dctx.fillStyle="#050608",this._dctx.fillRect(0,0,this._displayCanvas.width,this._displayCanvas.height);let e=this._ctx.getImageData(0,0,this._width,this._height).data,t=this._scale,s=t*.38;for(let i=0;i<this._height;i++)for(let o=0;o<this._width;o++){let n=(i*this._width+o)*4,r=e[n],a=e[n+1],l=e[n+2],f=e[n+3]===0,h=o*t,u=i*t,p=h+t/2,g=u+t/2;if(this._dctx.fillStyle=`rgb(${U.r},${U.g},${U.b})`,this._dctx.fillRect(h,u,t,t),this._gridOn)if(f)this._dctx.fillStyle="rgb(5,5,5)",this._dctx.beginPath(),this._dctx.arc(p,g,s,0,Math.PI*2),this._dctx.fill();else{let v=this._dctx.createRadialGradient(p,g,s*.3,p,g,s*1.8);v.addColorStop(0,`rgba(${r},${a},${l},0.4)`),v.addColorStop(1,`rgba(${r},${a},${l},0)`),this._dctx.fillStyle=v,this._dctx.beginPath(),this._dctx.arc(p,g,s*1.8,0,Math.PI*2),this._dctx.fill(),this._dctx.fillStyle=`rgb(${r},${a},${l})`,this._dctx.beginPath(),this._dctx.arc(p,g,s,0,Math.PI*2),this._dctx.fill()}else f?this._dctx.fillStyle=`rgb(${U.r},${U.g},${U.b})`:this._dctx.fillStyle=`rgb(${r},${a},${l})`,this._dctx.fillRect(h,u,t,t)}}_getPixelPos(e){if(!this._displayCanvas)return null;let t=this._displayCanvas.getBoundingClientRect(),s=t.width/this._width,i=t.height/this._height,o=e.touches?e.touches[0].clientX:e.clientX,n=e.touches?e.touches[0].clientY:e.clientY,r=Math.floor((o-t.left)/s),a=Math.floor((n-t.top)/i);return r<0||a<0||r>=this._width||a>=this._height?null:{x:r,y:a}}_drawAt(e){let t=this._getPixelPos(e);t&&(this._tool==="pen"?(this._ctx.fillStyle=this._currentColor,this._ctx.fillRect(t.x,t.y,1,1)):this._ctx.clearRect(t.x,t.y,1,1),this._renderDisplay())}_attachListeners(){let e=this.shadowRoot.getElementById("editor-canvas");if(!e)return;e.addEventListener("mousedown",s=>{s.preventDefault(),this._drawing=!0,this._drawAt(s)}),e.addEventListener("mousemove",s=>{this._drawing&&this._drawAt(s)}),window.addEventListener("mouseup",()=>{this._drawing=!1}),e.addEventListener("touchstart",s=>{s.preventDefault(),this._drawing=!0,this._drawAt(s)},{passive:!1}),e.addEventListener("touchmove",s=>{s.preventDefault(),this._drawing&&this._drawAt(s)},{passive:!1}),e.addEventListener("touchend",()=>{this._drawing=!1}),this.shadowRoot.getElementById("pen-tool")?.addEventListener("click",()=>{this._tool="pen",this.render()}),this.shadowRoot.getElementById("eraser-tool")?.addEventListener("click",()=>{this._tool="eraser",this.render()}),this.shadowRoot.getElementById("color-picker")?.addEventListener("input",s=>{this._currentColor=s.target.value,this._updatePaletteSelection()}),this.shadowRoot.querySelectorAll(".color-swatch").forEach(s=>{s.addEventListener("click",()=>{this._currentColor=s.dataset.color,this.shadowRoot.getElementById("color-picker").value=this._currentColor,this._updatePaletteSelection()})}),this.shadowRoot.getElementById("grid-toggle")?.addEventListener("click",()=>{this._gridOn=!this._gridOn,this.render()});let t=()=>{let s=parseInt(this.shadowRoot.getElementById("res-width")?.value,10),i=parseInt(this.shadowRoot.getElementById("res-height")?.value,10);s>0&&i>0&&(s!==this._width||i!==this._height)&&this._resizeCanvas(s,i)};this.shadowRoot.getElementById("res-width")?.addEventListener("change",t),this.shadowRoot.getElementById("res-height")?.addEventListener("change",t),this.shadowRoot.querySelectorAll(".preset-btn").forEach(s=>{s.addEventListener("click",()=>{let[i,o]=s.dataset.res.split("x").map(a=>parseInt(a,10));this._resizeCanvas(i,o);let n=this.shadowRoot.getElementById("res-width"),r=this.shadowRoot.getElementById("res-height");n&&(n.value=i),r&&(r.value=o)})}),this.shadowRoot.getElementById("clear-btn")?.addEventListener("click",()=>{this._clearCanvas()}),this.shadowRoot.getElementById("import-btn")?.addEventListener("click",()=>{this.shadowRoot.getElementById("file-input")?.click()}),this.shadowRoot.getElementById("file-input")?.addEventListener("change",s=>{let i=s.target.files?.[0];i&&this._handleImport(i)}),this.shadowRoot.getElementById("send-btn")?.addEventListener("click",()=>{this._sendToDevice()})}_updatePaletteSelection(){this.shadowRoot.querySelectorAll(".color-swatch").forEach(e=>{e.dataset.color.toLowerCase()===this._currentColor.toLowerCase()?e.classList.add("active"):e.classList.remove("active")})}_resizeCanvas(e,t){let s=this._ctx.getImageData(0,0,this._width,this._height);this._width=e,this._height=t,this._logicalCanvas.width=e,this._logicalCanvas.height=t,this._ctx.putImageData(s,0,0),this._updateDisplaySize(),this._renderDisplay();let i=this.shadowRoot.querySelector(".info-row span:first-child");i&&(i.textContent=`Tool: ${this._tool} | Grid: ${this._gridOn?"LED":"Flat"}`)}_clearCanvas(){this._ctx.clearRect(0,0,this._width,this._height),this._renderDisplay()}_handleImport(e){let t=new FileReader;t.onload=s=>{let i=new Image;i.onload=()=>{this._ctx.clearRect(0,0,this._width,this._height),this._ctx.imageSmoothingEnabled=!1,this._ctx.drawImage(i,0,0,this._width,this._height),this._renderDisplay()},i.src=s.target.result},t.readAsDataURL(e)}async _sendToDevice(){if(!this._sending){this._sending=!0,this.render();try{let e=this._ctx.getImageData(0,0,this._width,this._height).data,t=[];for(let s=0;s<this._height;s++)for(let i=0;i<this._width;i++){let o=(s*this._width+i)*4,n=e[o],r=e[o+1],a=e[o+2];e[o+3]>0&&t.push({x:i,y:s,color:this._rgbToHex(n,r,a)})}t.length>0&&await this.callService("ipixel_color","set_pixels",{pixels:t})}catch(e){console.error("Failed to send pixels to device:",e)}finally{this._sending=!1,this.render()}}}_rgbToHex(e,t,s){return(e<<16|t<<8|s).toString(16).padStart(6,"0")}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}getCardSize(){return 4}};var It=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(e){this._config=e,this.render()}set hass(e){this._hass=e,this.render()}render(){if(!this._hass)return;let e=Object.keys(this._hass.states).filter(t=>t.startsWith("text.")||t.startsWith("switch.")).sort();this.shadowRoot.innerHTML=`
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
      </div>`,this.shadowRoot.querySelectorAll("select, input").forEach(t=>{t.addEventListener("change",()=>this.fireConfig())})}fireConfig(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:{type:this._config?.type||"custom:ipixel-display-card",entity:this.shadowRoot.getElementById("entity")?.value,name:this.shadowRoot.getElementById("name")?.value||void 0}},bubbles:!0,composed:!0}))}};customElements.define("ipixel-wall-card",xt);customElements.define("ipixel-display-card",vt);customElements.define("ipixel-controls-card",yt);customElements.define("ipixel-text-card",wt);customElements.define("ipixel-playlist-card",Et);customElements.define("ipixel-schedule-card",St);customElements.define("ipixel-editor-card",Ct);customElements.define("ipixel-simple-editor",It);window.customCards=window.customCards||[];[{type:"ipixel-wall-card",name:"iPIXEL Wall",description:"Live preview of a panel or combined display (real frames, panels shown as tiles) with power, brightness, mode and text"},{type:"ipixel-display-card",name:"iPIXEL Display",description:"Simulated LED matrix preview with effects (no device needed)"},{type:"ipixel-controls-card",name:"iPIXEL Controls",description:"Brightness, mode, and orientation controls"},{type:"ipixel-text-card",name:"iPIXEL Text",description:"Text input with effects and colors"},{type:"ipixel-playlist-card",name:"iPIXEL Playlist",description:"Playlist management"},{type:"ipixel-schedule-card",name:"iPIXEL Schedule",description:"Power schedule and time slots"},{type:"ipixel-editor-card",name:"iPIXEL Pixel Editor",description:"Draw custom pixel art and send to your LED matrix"}].forEach(d=>window.customCards.push({...d,preview:!0,documentationURL:"https://github.com/wian007/ha-ipixel-color"}));console.info(`%c iPIXEL Cards %c ${Vt} `,"background:#03a9f4;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;","background:#333;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");})();

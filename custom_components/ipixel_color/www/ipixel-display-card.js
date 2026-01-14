(()=>{var J="2.11.1";var M=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._config={},this._hass=null}set hass(e){this._hass=e,this.render()}setConfig(e){if(!e.entity)throw new Error("Please define an entity");this._config=e,this.render()}getEntity(){return!this._hass||!this._config.entity?null:this._hass.states[this._config.entity]}getRelatedEntity(e,t=""){if(!this._hass||!this._config.entity)return null;let i=this._config.entity.replace(/^[^.]+\./,"").replace(/_?(text|display|gif_url)$/i,""),s=`${e}.${i}${t}`;if(this._hass.states[s])return this._hass.states[s];let r=Object.keys(this._hass.states).filter(o=>{if(!o.startsWith(`${e}.`))return!1;let n=o.replace(/^[^.]+\./,"");return n.includes(i)||i.includes(n.replace(t,""))});if(t){let o=r.find(n=>n.endsWith(t));if(o)return this._hass.states[o]}else{let o=r.sort((n,a)=>n.length-a.length);if(o.length>0)return this._hass.states[o[0]]}return r.length>0?this._hass.states[r[0]]:null}async callService(e,t,i={}){if(this._hass)try{await this._hass.callService(e,t,i)}catch(s){console.error(`iPIXEL service call failed: ${e}.${t}`,s)}}getResolution(){let e=this.getRelatedEntity("sensor","_width")||this._hass?.states["sensor.display_width"],t=this.getRelatedEntity("sensor","_height")||this._hass?.states["sensor.display_height"];if(e&&t){let i=parseInt(e.state),s=parseInt(t.state);if(!isNaN(i)&&!isNaN(s)&&i>0&&s>0)return[i,s]}return[64,16]}isOn(){return this.getRelatedEntity("switch")?.state==="on"}hexToRgb(e){let t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]:[255,255,255]}render(){}getCardSize(){return 2}};var k=`
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
`;var O={A:[124,18,17,18,124],B:[127,73,73,73,54],C:[62,65,65,65,34],D:[127,65,65,34,28],E:[127,73,73,73,65],F:[127,9,9,9,1],G:[62,65,73,73,122],H:[127,8,8,8,127],I:[0,65,127,65,0],J:[32,64,65,63,1],K:[127,8,20,34,65],L:[127,64,64,64,64],M:[127,2,12,2,127],N:[127,4,8,16,127],O:[62,65,65,65,62],P:[127,9,9,9,6],Q:[62,65,81,33,94],R:[127,9,25,41,70],S:[70,73,73,73,49],T:[1,1,127,1,1],U:[63,64,64,64,63],V:[31,32,64,32,31],W:[63,64,56,64,63],X:[99,20,8,20,99],Y:[7,8,112,8,7],Z:[97,81,73,69,67],a:[32,84,84,84,120],b:[127,72,68,68,56],c:[56,68,68,68,32],d:[56,68,68,72,127],e:[56,84,84,84,24],f:[8,126,9,1,2],g:[12,82,82,82,62],h:[127,8,4,4,120],i:[0,68,125,64,0],j:[32,64,68,61,0],k:[127,16,40,68,0],l:[0,65,127,64,0],m:[124,4,24,4,120],n:[124,8,4,4,120],o:[56,68,68,68,56],p:[124,20,20,20,8],q:[8,20,20,24,124],r:[124,8,4,4,8],s:[72,84,84,84,32],t:[4,63,68,64,32],u:[60,64,64,32,124],v:[28,32,64,32,28],w:[60,64,48,64,60],x:[68,40,16,40,68],y:[12,80,80,80,60],z:[68,100,84,76,68],0:[62,81,73,69,62],1:[0,66,127,64,0],2:[66,97,81,73,70],3:[33,65,69,75,49],4:[24,20,18,127,16],5:[39,69,69,69,57],6:[60,74,73,73,48],7:[1,113,9,5,3],8:[54,73,73,73,54],9:[6,73,73,41,30]," ":[0,0,0,0,0],".":[0,96,96,0,0],",":[0,128,96,0,0],":":[0,54,54,0,0],";":[0,128,54,0,0],"!":[0,0,95,0,0],"?":[2,1,81,9,6],"-":[8,8,8,8,8],"+":[8,8,62,8,8],"=":[20,20,20,20,20],_:[64,64,64,64,64],"/":[32,16,8,4,2],"\\":[2,4,8,16,32],"(":[0,28,34,65,0],")":[0,65,34,28,0],"[":[0,127,65,65,0],"]":[0,65,65,127,0],"<":[8,20,34,65,0],">":[0,65,34,20,8],"*":[20,8,62,8,20],"#":[20,127,20,127,20],"@":[62,65,93,85,30],"&":[54,73,85,34,80],"%":[35,19,8,100,98],$:[18,42,127,42,36],"'":[0,0,7,0,0],'"':[0,7,0,7,0],"`":[0,1,2,0,0],"^":[4,2,1,2,4],"~":[8,4,8,16,8]};function Y(d,e,t,i="#ff6600",s="#111"){let r=[],a=Math.floor((t-7)/2);for(let h=0;h<t;h++)for(let m=0;m<e;m++)r.push(s);let c=d.length*6-1,x=Math.max(1,Math.floor((e-c)/2));for(let h of d){let m=O[h]||O[" "];for(let f=0;f<5;f++)for(let p=0;p<7;p++){let g=m[f]>>p&1,y=x+f,E=a+p;y>=0&&y<e&&E<t&&E>=0&&(r[E*e+y]=g?i:s)}x+=6}return r}function Z(d,e,t,i="#ff6600",s="#111"){let n=Math.floor((t-7)/2),a=d.length*6,c=e+a+e,l=[];for(let h=0;h<t;h++)for(let m=0;m<c;m++)l.push(s);let x=e;for(let h of d){let m=O[h]||O[" "];for(let f=0;f<5;f++)for(let p=0;p<7;p++){let g=m[f]>>p&1,y=x+f,E=n+p;y>=0&&y<c&&E<t&&E>=0&&(l[E*c+y]=g?i:s)}x+=6}return{pixels:l,width:c}}var Q={VCR_OSD_MONO:{16:{font_size:16,offset:[0,0],pixel_threshold:70,var_width:!0},24:{font_size:24,offset:[0,0],pixel_threshold:70,var_width:!0},32:{font_size:28,offset:[-1,2],pixel_threshold:30,var_width:!1}},CUSONG:{16:{font_size:16,offset:[0,-1],pixel_threshold:70,var_width:!1},24:{font_size:24,offset:[0,0],pixel_threshold:70,var_width:!1},32:{font_size:32,offset:[0,0],pixel_threshold:70,var_width:!1}}},P={},$={};function at(d){return`/hacsfiles/ipixel_color/fonts/${d}.ttf`}async function F(d){return P[d]===!0?!0:P[d]===!1?!1:($[d]||($[d]=(async()=>{let e=at(d);try{let i=await new FontFace(d,`url(${e})`).load();return document.fonts.add(i),P[d]=!0,console.log(`iPIXEL: Font ${d} loaded successfully`),!0}catch(t){return console.warn(`iPIXEL: Failed to load font ${d}:`,t),P[d]=!1,!1}})()),$[d])}function B(d){return P[d]===!0}function tt(d){return d<=18?16:d<=28?24:32}function K(d){let e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(d);return e?{r:parseInt(e[1],16),g:parseInt(e[2],16),b:parseInt(e[3],16)}:{r:0,g:0,b:0}}function et(d,e,t,i="#ff6600",s="#111",r="VCR_OSD_MONO"){let o=Q[r];if(!o)return console.warn(`iPIXEL: Unknown font: ${r}`),null;if(!B(r))return F(r),null;let n=tt(t),a=o[n],c=document.createElement("canvas");c.width=e,c.height=t;let l=c.getContext("2d");if(l.imageSmoothingEnabled=!1,l.fillStyle=s,l.fillRect(0,0,e,t),!d||d.trim()===""){let b=[];for(let _=0;_<e*t;_++)b.push(s);return b}l.font=`${a.font_size}px "${r}"`,l.fillStyle=i,l.textBaseline="top";let h=l.measureText(d).width,m=Math.floor((e-h)/2)+a.offset[0],f=Math.floor((t-a.font_size)/2)+a.offset[1];l.fillText(d,m,f);let p=l.getImageData(0,0,e,t),g=[],y=K(i),E=K(s);for(let b=0;b<p.data.length;b+=4){let _=p.data[b],v=p.data[b+1],w=p.data[b+2];(_+v+w)/3>=a.pixel_threshold?g.push(i):g.push(s)}return g}function it(d,e,t,i="#ff6600",s="#111",r="VCR_OSD_MONO"){let o=Q[r];if(!o)return null;if(!B(r))return F(r),null;let n=tt(t),a=o[n],l=document.createElement("canvas").getContext("2d");l.font=`${a.font_size}px "${r}"`;let x=Math.ceil(l.measureText(d).width),h=e+x+e,m=document.createElement("canvas");m.width=h,m.height=t;let f=m.getContext("2d");if(f.imageSmoothingEnabled=!1,f.fillStyle=s,f.fillRect(0,0,h,t),!d||d.trim()===""){let b=[];for(let _=0;_<h*t;_++)b.push(s);return{pixels:b,width:h}}f.font=`${a.font_size}px "${r}"`,f.fillStyle=i,f.textBaseline="top";let p=e+a.offset[0],g=Math.floor((t-a.font_size)/2)+a.offset[1];f.fillText(d,p,g);let y=f.getImageData(0,0,h,t),E=[];for(let b=0;b<y.data.length;b+=4){let _=y.data[b],v=y.data[b+1],w=y.data[b+2];(_+v+w)/3>=a.pixel_threshold?E.push(i):E.push(s)}return{pixels:E,width:h}}var D=class{constructor(e){this.renderer=e}init(e,t){let{width:i,height:s}=this.renderer;switch(e){case"scroll_ltr":case"scroll_rtl":t.offset=0;break;case"blink":t.visible=!0;break;case"snow":case"breeze":t.phases=[];for(let r=0;r<i*s;r++)t.phases[r]=Math.random()*Math.PI*2;break;case"laser":t.position=0;break;case"fade":t.opacity=0,t.direction=1;break;case"typewriter":t.charIndex=0,t.cursorVisible=!0;break;case"bounce":t.offset=0,t.direction=1;break;case"sparkle":t.sparkles=[];for(let r=0;r<Math.floor(i*s*.1);r++)t.sparkles.push({x:Math.floor(Math.random()*i),y:Math.floor(Math.random()*s),brightness:Math.random(),speed:.05+Math.random()*.1});break}}step(e,t){let{width:i,extendedWidth:s}=this.renderer;switch(e){case"scroll_ltr":t.offset-=1,t.offset<=-(s||i)&&(t.offset=i);break;case"scroll_rtl":t.offset+=1,t.offset>=(s||i)&&(t.offset=-i);break;case"blink":t.visible=!t.visible;break;case"laser":t.position=(t.position+1)%i;break;case"fade":t.opacity+=t.direction*.05,t.opacity>=1?(t.opacity=1,t.direction=-1):t.opacity<=0&&(t.opacity=0,t.direction=1);break;case"typewriter":t.tick%3===0&&t.charIndex++,t.cursorVisible=t.tick%10<5;break;case"bounce":t.offset+=t.direction;let r=Math.max(0,(s||i)-i);t.offset>=r?(t.offset=r,t.direction=-1):t.offset<=0&&(t.offset=0,t.direction=1);break;case"sparkle":for(let o of t.sparkles)o.brightness+=o.speed,o.brightness>1&&(o.brightness=0,o.x=Math.floor(Math.random()*i),o.y=Math.floor(Math.random()*this.renderer.height));break}}render(e,t,i,s,r){let{width:o,height:n}=this.renderer,a=s||i||[],c=i||[],l=r||o;for(let x=0;x<n;x++)for(let h=0;h<o;h++){let m,f=h;if(e==="scroll_ltr"||e==="scroll_rtl"||e==="bounce"){for(f=h-(t.offset||0);f<0;)f+=l;for(;f>=l;)f-=l;m=a[x*l+f]||"#111"}else if(e==="typewriter"){let _=(t.charIndex||0)*6;h<_?m=c[x*o+h]||"#111":h===_&&t.cursorVisible?m="#ffffff":m="#111"}else m=c[x*o+h]||"#111";let[p,g,y]=this._hexToRgb(m);if(p>20||g>20||y>20)switch(e){case"blink":t.visible||(p=g=y=17);break;case"snow":{let b=t.phases?.[x*o+h]||0,_=t.tick||0,v=.3+.7*Math.abs(Math.sin(b+_*.3));p*=v,g*=v,y*=v;break}case"breeze":{let b=t.phases?.[x*o+h]||0,_=t.tick||0,v=.4+.6*Math.abs(Math.sin(b+_*.15+h*.2));p*=v,g*=v,y*=v;break}case"laser":{let b=t.position||0,v=Math.abs(h-b)<3?1:.3;p*=v,g*=v,y*=v;break}case"fade":{let b=t.opacity||1;p*=b,g*=b,y*=b;break}}if(e==="sparkle"&&t.sparkles){for(let b of t.sparkles)if(b.x===h&&b.y===x){let _=Math.sin(b.brightness*Math.PI);p=Math.min(255,p+_*200),g=Math.min(255,g+_*200),y=Math.min(255,y+_*200)}}this.renderer.setPixel(h,x,[p,g,y])}}_hexToRgb(e){if(!e||e==="#111"||e==="#000")return[17,17,17];if(e==="#050505")return[5,5,5];let t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]:[17,17,17]}};function ct(d,e,t){let i,s,r,o=Math.floor(d*6),n=d*6-o,a=t*(1-e),c=t*(1-n*e),l=t*(1-(1-n)*e);switch(o%6){case 0:i=t,s=l,r=a;break;case 1:i=c,s=t,r=a;break;case 2:i=a,s=t,r=l;break;case 3:i=a,s=c,r=t;break;case 4:i=l,s=a,r=t;break;case 5:i=t,s=a,r=c;break}return[i*255,s*255,r*255]}var X=class{constructor(e){this.renderer=e}init(e,t){let{width:i,height:s}=this.renderer;switch(e){case"rainbow":t.position=0;break;case"matrix":let r=[[0,255,0],[0,255,255],[255,0,255]];t.colorMode=r[Math.floor(Math.random()*r.length)],t.buffer=[];for(let n=0;n<s;n++)t.buffer.push(Array(i).fill(null).map(()=>[0,0,0]));break;case"plasma":t.time=0;break;case"gradient":t.time=0;break;case"fire":t.heat=[];for(let n=0;n<i*s;n++)t.heat[n]=0;t.palette=this._createFirePalette();break;case"water":t.current=[],t.previous=[];for(let n=0;n<i*s;n++)t.current[n]=0,t.previous[n]=0;t.damping=.95;break;case"stars":t.stars=[];let o=Math.floor(i*s*.15);for(let n=0;n<o;n++)t.stars.push({x:Math.floor(Math.random()*i),y:Math.floor(Math.random()*s),brightness:Math.random(),speed:.02+Math.random()*.05,phase:Math.random()*Math.PI*2});break;case"confetti":t.particles=[];for(let n=0;n<20;n++)t.particles.push(this._createConfettiParticle(i,s,!0));break}}step(e,t){let{width:i,height:s}=this.renderer;switch(e){case"rainbow":t.position=(t.position+.01)%1;break;case"matrix":this._stepMatrix(t,i,s);break;case"plasma":case"gradient":t.time=(t.time||0)+.05;break;case"fire":this._stepFire(t,i,s);break;case"water":this._stepWater(t,i,s);break;case"stars":for(let r of t.stars)r.phase+=r.speed;break;case"confetti":for(let r=0;r<t.particles.length;r++){let o=t.particles[r];o.y+=o.speed,o.x+=o.drift,o.rotation+=o.rotationSpeed,o.y>s&&(t.particles[r]=this._createConfettiParticle(i,s,!1))}break}}render(e,t){switch(e){case"rainbow":this._renderRainbow(t);break;case"matrix":this._renderMatrix(t);break;case"plasma":this._renderPlasma(t);break;case"gradient":this._renderGradient(t);break;case"fire":this._renderFire(t);break;case"water":this._renderWater(t);break;case"stars":this._renderStars(t);break;case"confetti":this._renderConfetti(t);break}}_renderRainbow(e){let{width:t,height:i}=this.renderer,s=e.position||0;for(let r=0;r<t;r++){let o=(s+r/t)%1,[n,a,c]=ct(o,1,.6);for(let l=0;l<i;l++)this.renderer.setPixel(r,l,[n,a,c])}}_stepMatrix(e,t,i){let s=e.buffer,r=e.colorMode,o=.15;s.pop();let n=s[0].map(([a,c,l])=>[a*(1-o),c*(1-o),l*(1-o)]);s.unshift(JSON.parse(JSON.stringify(n)));for(let a=0;a<t;a++)Math.random()<.08&&(s[0][a]=[Math.floor(Math.random()*r[0]),Math.floor(Math.random()*r[1]),Math.floor(Math.random()*r[2])])}_renderMatrix(e){let{width:t,height:i}=this.renderer,s=e.buffer;if(s)for(let r=0;r<i;r++)for(let o=0;o<t;o++){let[n,a,c]=s[r]?.[o]||[0,0,0];this.renderer.setPixel(o,r,[n,a,c])}}_renderPlasma(e){let{width:t,height:i}=this.renderer,s=e.time||0,r=t/2,o=i/2;for(let n=0;n<t;n++)for(let a=0;a<i;a++){let c=n-r,l=a-o,x=Math.sqrt(c*c+l*l),h=Math.sin(n/8+s),m=Math.sin(a/6+s*.8),f=Math.sin(x/6-s*1.2),p=Math.sin((n+a)/10+s*.5),g=(h+m+f+p+4)/8,y=Math.sin(g*Math.PI*2)*.5+.5,E=Math.sin(g*Math.PI*2+2)*.5+.5,b=Math.sin(g*Math.PI*2+4)*.5+.5;this.renderer.setPixel(n,a,[y*255,E*255,b*255])}}_renderGradient(e){let{width:t,height:i}=this.renderer,r=(e.time||0)*10;for(let o=0;o<t;o++)for(let n=0;n<i;n++){let a=(Math.sin((o+r)*.05)*.5+.5)*255,c=(Math.cos((n+r)*.05)*.5+.5)*255,l=(Math.sin((o+n+r)*.03)*.5+.5)*255;this.renderer.setPixel(o,n,[a,c,l])}}_createFirePalette(){let e=[];for(let t=0;t<256;t++){let i,s,r;t<64?(i=t*4,s=0,r=0):t<128?(i=255,s=(t-64)*4,r=0):t<192?(i=255,s=255,r=(t-128)*4):(i=255,s=255,r=255),e.push([i,s,r])}return e}_stepFire(e,t,i){let s=e.heat;for(let r=0;r<t*i;r++)s[r]=Math.max(0,s[r]-Math.random()*10);for(let r=0;r<i-1;r++)for(let o=0;o<t;o++){let n=r*t+o,a=(r+1)*t+o,c=r*t+Math.max(0,o-1),l=r*t+Math.min(t-1,o+1);s[n]=(s[a]+s[c]+s[l])/3.05}for(let r=0;r<t;r++)Math.random()<.6&&(s[(i-1)*t+r]=180+Math.random()*75)}_renderFire(e){let{width:t,height:i}=this.renderer,s=e.heat,r=e.palette;for(let o=0;o<i;o++)for(let n=0;n<t;n++){let a=o*t+n,c=Math.floor(Math.min(255,s[a])),[l,x,h]=r[c];this.renderer.setPixel(n,o,[l,x,h])}}_stepWater(e,t,i){let{current:s,previous:r,damping:o}=e,n=[...r];for(let a=0;a<s.length;a++)r[a]=s[a];for(let a=1;a<i-1;a++)for(let c=1;c<t-1;c++){let l=a*t+c;s[l]=(n[(a-1)*t+c]+n[(a+1)*t+c]+n[a*t+(c-1)]+n[a*t+(c+1)])/2-s[l],s[l]*=o}if(Math.random()<.1){let a=Math.floor(Math.random()*(t-2))+1,c=Math.floor(Math.random()*(i-2))+1;s[c*t+a]=255}}_renderWater(e){let{width:t,height:i}=this.renderer,s=e.current;for(let r=0;r<i;r++)for(let o=0;o<t;o++){let n=r*t+o,a=Math.abs(s[n]),c=Math.min(255,a*2),l=c>200?c:0,x=c>150?c*.8:c*.3,h=Math.min(255,50+c);this.renderer.setPixel(o,r,[l,x,h])}}_renderStars(e){let{width:t,height:i}=this.renderer;for(let s=0;s<i;s++)for(let r=0;r<t;r++)this.renderer.setPixel(r,s,[5,5,15]);for(let s of e.stars){let r=(Math.sin(s.phase)*.5+.5)*255,o=Math.floor(s.x),n=Math.floor(s.y);o>=0&&o<t&&n>=0&&n<i&&this.renderer.setPixel(o,n,[r,r,r*.9])}}_createConfettiParticle(e,t,i){let s=[[255,0,0],[0,255,0],[0,0,255],[255,255,0],[255,0,255],[0,255,255],[255,128,0],[255,192,203]];return{x:Math.random()*e,y:i?Math.random()*t:-2,speed:.2+Math.random()*.3,drift:(Math.random()-.5)*.3,color:s[Math.floor(Math.random()*s.length)],size:1+Math.random(),rotation:Math.random()*Math.PI*2,rotationSpeed:(Math.random()-.5)*.2}}_renderConfetti(e){let{width:t,height:i}=this.renderer;for(let s=0;s<i;s++)for(let r=0;r<t;r++)this.renderer.setPixel(r,s,[10,10,10]);for(let s of e.particles){let r=Math.floor(s.x),o=Math.floor(s.y);if(r>=0&&r<t&&o>=0&&o<i){this.renderer.setPixel(r,o,s.color);let n=Math.abs(Math.sin(s.rotation))*.5+.5,[a,c,l]=s.color;this.renderer.setPixel(r,o,[a*n,c*n,l*n])}}}};function st(d,e,t){let i,s,r,o=Math.floor(d*6),n=d*6-o,a=t*(1-e),c=t*(1-n*e),l=t*(1-(1-n)*e);switch(o%6){case 0:i=t,s=l,r=a;break;case 1:i=c,s=t,r=a;break;case 2:i=a,s=t,r=l;break;case 3:i=a,s=c,r=t;break;case 4:i=l,s=a,r=t;break;case 5:i=t,s=a,r=c;break}return[i*255,s*255,r*255]}var z=class{constructor(e){this.renderer=e}init(e,t){switch(e){case"color_cycle":t.hue=0;break;case"rainbow_text":t.offset=0;break;case"neon":t.glowIntensity=0,t.direction=1,t.baseColor=t.fgColor||"#ff00ff";break}}step(e,t){switch(e){case"color_cycle":t.hue=(t.hue+.01)%1;break;case"rainbow_text":t.offset=(t.offset+.02)%1;break;case"neon":t.glowIntensity+=t.direction*.05,t.glowIntensity>=1?(t.glowIntensity=1,t.direction=-1):t.glowIntensity<=.3&&(t.glowIntensity=.3,t.direction=1);break}}render(e,t,i){let{width:s,height:r}=this.renderer,o=i||[];for(let n=0;n<r;n++)for(let a=0;a<s;a++){let c=o[n*s+a]||"#111",[l,x,h]=this._hexToRgb(c);if(l>20||x>20||h>20)switch(e){case"color_cycle":{let[f,p,g]=st(t.hue,1,.8),y=(l+x+h)/(3*255);l=f*y,x=p*y,h=g*y;break}case"rainbow_text":{let f=(t.offset+a/s)%1,[p,g,y]=st(f,1,.8),E=(l+x+h)/(3*255);l=p*E,x=g*E,h=y*E;break}case"neon":{let f=this._hexToRgb(t.baseColor||"#ff00ff"),p=t.glowIntensity||.5;if(l=f[0]*p,x=f[1]*p,h=f[2]*p,p>.8){let g=(p-.8)*5;l=l+(255-l)*g*.3,x=x+(255-x)*g*.3,h=h+(255-h)*g*.3}break}}this.renderer.setPixel(a,n,[l,x,h])}}_hexToRgb(e){if(!e||e==="#111"||e==="#000")return[17,17,17];if(e==="#050505")return[5,5,5];let t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]:[17,17,17]}};var u={TEXT:"text",AMBIENT:"ambient",COLOR:"color"},C={fixed:{category:u.TEXT,name:"Fixed",description:"Static display"},scroll_ltr:{category:u.TEXT,name:"Scroll Left",description:"Text scrolls left to right"},scroll_rtl:{category:u.TEXT,name:"Scroll Right",description:"Text scrolls right to left"},blink:{category:u.TEXT,name:"Blink",description:"Text blinks on/off"},breeze:{category:u.TEXT,name:"Breeze",description:"Gentle wave brightness"},snow:{category:u.TEXT,name:"Snow",description:"Sparkle effect"},laser:{category:u.TEXT,name:"Laser",description:"Scanning beam"},fade:{category:u.TEXT,name:"Fade",description:"Fade in/out"},typewriter:{category:u.TEXT,name:"Typewriter",description:"Characters appear one by one"},bounce:{category:u.TEXT,name:"Bounce",description:"Text bounces back and forth"},sparkle:{category:u.TEXT,name:"Sparkle",description:"Random sparkle overlay"},rainbow:{category:u.AMBIENT,name:"Rainbow",description:"HSV rainbow gradient"},matrix:{category:u.AMBIENT,name:"Matrix",description:"Digital rain effect"},plasma:{category:u.AMBIENT,name:"Plasma",description:"Classic plasma waves"},gradient:{category:u.AMBIENT,name:"Gradient",description:"Moving color gradients"},fire:{category:u.AMBIENT,name:"Fire",description:"Fire/flame simulation"},water:{category:u.AMBIENT,name:"Water",description:"Ripple/wave effect"},stars:{category:u.AMBIENT,name:"Stars",description:"Twinkling starfield"},confetti:{category:u.AMBIENT,name:"Confetti",description:"Falling colored particles"},color_cycle:{category:u.COLOR,name:"Color Cycle",description:"Cycle through colors"},rainbow_text:{category:u.COLOR,name:"Rainbow Text",description:"Rainbow gradient on text"},neon:{category:u.COLOR,name:"Neon",description:"Pulsing neon glow"}},A=class{constructor(e){this.renderer=e,this.textEffects=new D(e),this.ambientEffects=new X(e),this.colorEffects=new z(e),this.currentEffect="fixed",this.effectState={}}getEffectInfo(e){return C[e]||C.fixed}getEffectsByCategory(e){return Object.entries(C).filter(([t,i])=>i.category===e).map(([t,i])=>({name:t,...i}))}initEffect(e,t={}){let i=this.getEffectInfo(e);switch(this.currentEffect=e,this.effectState={tick:0,...t},i.category){case u.TEXT:this.textEffects.init(e,this.effectState);break;case u.AMBIENT:this.ambientEffects.init(e,this.effectState);break;case u.COLOR:this.colorEffects.init(e,this.effectState);break}return this.effectState}step(){let e=this.getEffectInfo(this.currentEffect);switch(this.effectState.tick=(this.effectState.tick||0)+1,e.category){case u.TEXT:this.textEffects.step(this.currentEffect,this.effectState);break;case u.AMBIENT:this.ambientEffects.step(this.currentEffect,this.effectState);break;case u.COLOR:this.colorEffects.step(this.currentEffect,this.effectState);break}}render(e,t,i){switch(this.getEffectInfo(this.currentEffect).category){case u.AMBIENT:this.ambientEffects.render(this.currentEffect,this.effectState);break;case u.TEXT:this.textEffects.render(this.currentEffect,this.effectState,e,t,i);break;case u.COLOR:this.colorEffects.render(this.currentEffect,this.effectState,e);break}}isAmbient(e){return this.getEffectInfo(e).category===u.AMBIENT}needsAnimation(e){return e!=="fixed"}},Et=Object.entries(C).filter(([d,e])=>e.category===u.TEXT).map(([d])=>d),Ct=Object.entries(C).filter(([d,e])=>e.category===u.AMBIENT).map(([d])=>d),Mt=Object.entries(C).filter(([d,e])=>e.category===u.COLOR).map(([d])=>d),kt=Object.keys(C);var H=class{constructor(e,t={}){this.container=e,this.width=t.width||64,this.height=t.height||16,this.pixelGap=t.pixelGap||.1,this.buffer=[],this.prevBuffer=[],this._initBuffer(),this._colorPixels=[],this._extendedColorPixels=[],this.extendedWidth=this.width,this.effect="fixed",this.speed=50,this.animationId=null,this.lastFrameTime=0,this._isRunning=!1,this.pixelElements=[],this.svgCreated=!1,this._svg=null,this.effectManager=new A(this)}_initBuffer(){this.buffer=[],this.prevBuffer=[];for(let e=0;e<this.width*this.height;e++)this.buffer.push([0,0,0]),this.prevBuffer.push([-1,-1,-1])}_createSvg(){let t=100/this.width,i=t,s=this.height*i,r=this.pixelGap,o=document.createElementNS("http://www.w3.org/2000/svg","svg");o.setAttribute("viewBox",`0 0 100 ${s}`),o.setAttribute("preserveAspectRatio","xMidYMid meet"),o.style.width="100%",o.style.height="100%",o.style.display="block",this.pixelElements=[];for(let n=0;n<this.height;n++)for(let a=0;a<this.width;a++){let c=document.createElementNS("http://www.w3.org/2000/svg","rect");c.setAttribute("x",a*t),c.setAttribute("y",n*i),c.setAttribute("width",t-r),c.setAttribute("height",i-r),c.setAttribute("rx","0.3"),c.setAttribute("fill","rgb(17, 17, 17)"),o.appendChild(c),this.pixelElements.push(c)}this.container&&this.container.isConnected!==!1&&(this.container.innerHTML="",this.container.appendChild(o)),this._svg=o,this.svgCreated=!0}_ensureSvgInContainer(){return this.container?this._svg&&this._svg.parentNode===this.container?!0:this._svg&&this.container.isConnected!==!1?(this.container.innerHTML="",this.container.appendChild(this._svg),!0):!1:!1}setPixel(e,t,i){if(e>=0&&e<this.width&&t>=0&&t<this.height){let s=t*this.width+e;s<this.buffer.length&&(this.buffer[s]=i)}}clear(){for(let e=0;e<this.buffer.length;e++)this.buffer[e]=[0,0,0]}flush(){this.svgCreated?this._ensureSvgInContainer()||this._createSvg():this._createSvg();for(let e=0;e<this.buffer.length;e++){let t=this.buffer[e],i=this.prevBuffer[e];if(!t||!Array.isArray(t))continue;if(!i||!Array.isArray(i)){this.prevBuffer[e]=[-1,-1,-1];continue}let[s,r,o]=t,[n,a,c]=i;if(s!==n||r!==a||o!==c){let l=this.pixelElements[e];if(l){let x=s>20||r>20||o>20;l.setAttribute("fill",`rgb(${Math.round(s)}, ${Math.round(r)}, ${Math.round(o)})`),x?l.style.filter=`drop-shadow(0 0 2px rgb(${Math.round(s)}, ${Math.round(r)}, ${Math.round(o)}))`:l.style.filter=""}this.prevBuffer[e]=[s,r,o]}}}setData(e,t=null,i=null){this._colorPixels=e||[],t?(this._extendedColorPixels=t,this.extendedWidth=i||this.width):(this._extendedColorPixels=e||[],this.extendedWidth=this.width)}setEffect(e,t=50){let i=this._isRunning;this.effect!==e&&(this.effect=e,this.effectManager.initEffect(e,{speed:t})),this.speed=t,i&&e!=="fixed"&&this.start()}start(){this._isRunning||(this._isRunning=!0,this.lastFrameTime=performance.now(),this._animate())}stop(){this._isRunning=!1,this.animationId&&(cancelAnimationFrame(this.animationId),this.animationId=null)}get isRunning(){return this._isRunning}_animate(){if(!this._isRunning)return;let e=performance.now(),t=500-(this.speed-1)*4.7;e-this.lastFrameTime>=t&&(this.lastFrameTime=e,this.effectManager.step()),this._renderFrame(),this.animationId=requestAnimationFrame(()=>this._animate())}_renderFrame(){this.effectManager.render(this._colorPixels,this._extendedColorPixels,this.extendedWidth),this.flush()}renderStatic(){this.svgCreated||this._createSvg(),this._renderFrame()}setDimensions(e,t){(e!==this.width||t!==this.height)&&(this.width=e,this.height=t,this.extendedWidth=e,this._initBuffer(),this.svgCreated=!1,this.effectManager=new A(this),this.effect!=="fixed"&&this.effectManager.initEffect(this.effect,{speed:this.speed}))}setContainer(e){e!==this.container&&(this.container=e,this._svg&&e&&(e.innerHTML="",e.appendChild(this._svg)))}destroy(){this.stop(),this.pixelElements=[],this._svg=null,this.svgCreated=!1}};function rt(d,e,t,i=1){let r=100/d,o=r,n=e*o,a=i*.1,c="";for(let l=0;l<e;l++)for(let x=0;x<d;x++){let h=t[l*d+x]||"#111",f=h!=="#111"&&h!=="#000"&&h!=="#1a1a1a"&&h!=="#050505"?`filter:drop-shadow(0 0 2px ${h});`:"";c+=`<rect x="${x*r}" y="${l*o}" width="${r-a}" height="${o-a}" fill="${h}" rx="0.3" style="${f}"/>`}return`
    <svg viewBox="0 0 100 ${n}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block;">
      ${c}
    </svg>`}var ot="iPIXEL_DisplayState",lt={text:"",mode:"text",effect:"fixed",speed:50,fgColor:"#ff6600",bgColor:"#000000",font:"VCR_OSD_MONO",lastUpdate:0};function dt(){try{let d=localStorage.getItem(ot);if(d)return JSON.parse(d)}catch(d){console.warn("iPIXEL: Could not load saved state",d)}return{...lt}}function ht(d){try{localStorage.setItem(ot,JSON.stringify(d))}catch(e){console.warn("iPIXEL: Could not save state",e)}}window.iPIXELDisplayState||(window.iPIXELDisplayState=dt());function nt(){return window.iPIXELDisplayState}function S(d){return window.iPIXELDisplayState={...window.iPIXELDisplayState,...d,lastUpdate:Date.now()},ht(window.iPIXELDisplayState),window.dispatchEvent(new CustomEvent("ipixel-display-update",{detail:window.iPIXELDisplayState})),window.iPIXELDisplayState}var V=new Map,W=class extends M{constructor(){super(),this._renderer=null,this._displayContainer=null,this._lastState=null,this._cachedResolution=null,this._rendererId=null,this._handleDisplayUpdate=e=>{this._updateDisplay(e.detail)},window.addEventListener("ipixel-display-update",this._handleDisplayUpdate)}connectedCallback(){this._rendererId||(this._rendererId=`renderer_${Date.now()}_${Math.random().toString(36).substr(2,9)}`),V.has(this._rendererId)&&(this._renderer=V.get(this._rendererId)),F("VCR_OSD_MONO").then(()=>{this._lastState&&this._updateDisplay(this._lastState)}),F("CUSONG")}disconnectedCallback(){window.removeEventListener("ipixel-display-update",this._handleDisplayUpdate),this._renderer&&this._rendererId&&(this._renderer.stop(),V.set(this._rendererId,this._renderer))}_getResolutionCached(){let[e,t]=this.getResolution();if(e>0&&t>0&&e!==64){this._cachedResolution=[e,t];try{localStorage.setItem("iPIXEL_Resolution",JSON.stringify([e,t]))}catch{}}if(this._cachedResolution)return this._cachedResolution;try{let i=localStorage.getItem("iPIXEL_Resolution");if(i){let s=JSON.parse(i);if(Array.isArray(s)&&s.length===2)return this._cachedResolution=s,s}}catch{}return this._config?.width&&this._config?.height?[this._config.width,this._config.height]:[e||64,t||16]}_updateDisplay(e){if(!this._displayContainer)return;let[t,i]=this._getResolutionCached(),s=this.isOn();if(this._renderer?(this._renderer.setContainer(this._displayContainer),(this._renderer.width!==t||this._renderer.height!==i)&&this._renderer.setDimensions(t,i)):(this._renderer=new H(this._displayContainer,{width:t,height:i}),this._rendererId&&V.set(this._rendererId,this._renderer)),!s){this._renderer.stop();let g=Y("",t,i,"#111","#050505");this._displayContainer.innerHTML=rt(t,i,g);return}let r=e?.text||"",o=e?.effect||"fixed",n=e?.speed||50,a=e?.fgColor||"#ff6600",c=e?.bgColor||"#111",l=e?.mode||"text",x=e?.font||"VCR_OSD_MONO";this._lastState=e;let h=r,m=a;if(l==="clock"?(h=new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}),m="#00ff88"):l==="gif"?(h="GIF",m="#ff44ff"):l==="rhythm"&&(h="***",m="#44aaff"),C[o]?.category==="ambient")this._renderer.setData([],[],t);else{let g=x!=="LEGACY"&&B(x),y=(v,w,I,T,L)=>{if(g){let R=et(v,w,I,T,L,x);if(R)return R}return Y(v,w,I,T,L)},E=(v,w,I,T,L)=>{if(g){let R=it(v,w,I,T,L,x);if(R)return R}return Z(v,w,I,T,L)},b=g?h.length*10:h.length*6;if((o==="scroll_ltr"||o==="scroll_rtl"||o==="bounce")&&b>t){let v=E(h,t,i,m,c),w=y(h,t,i,m,c);this._renderer.setData(w,v.pixels,v.width)}else{let v=y(h,t,i,m,c);this._renderer.setData(v)}}this._renderer.setEffect(o,n),o==="fixed"?(this._renderer.stop(),this._renderer.renderStatic()):this._renderer.start()}render(){if(!this._hass)return;let[e,t]=this._getResolutionCached(),i=this.isOn(),s=this._config.name||this.getEntity()?.attributes?.friendly_name||"iPIXEL Display",r=nt(),n=this.getEntity()?.state||"",c=this.getRelatedEntity("select","_mode")?.state||r.mode||"text",l=r.text||n,x=r.effect||"fixed",h=r.speed||50,m=r.fgColor||"#ff6600",f=r.bgColor||"#111",p=r.font||"VCR_OSD_MONO",y=C[x]?.category==="ambient",E=Object.entries(C).filter(([v,w])=>w.category==="text").map(([v,w])=>`<option value="${v}">${w.name}</option>`).join(""),b=Object.entries(C).filter(([v,w])=>w.category==="ambient").map(([v,w])=>`<option value="${v}">${w.name}</option>`).join(""),_=Object.entries(C).filter(([v,w])=>w.category==="color").map(([v,w])=>`<option value="${v}">${w.name}</option>`).join("");this.shadowRoot.innerHTML=`
      <style>${k}
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
                <span class="mode-badge">${i?c:"Off"}</span>
                ${i&&x!=="fixed"?`<span class="effect-badge">${C[x]?.name||x}</span>`:""}
              </span>
            </div>
          </div>
        </div>
      </ha-card>`,this._displayContainer=this.shadowRoot.getElementById("display-screen"),this._updateDisplay({text:l,effect:x,speed:h,fgColor:m,bgColor:f,mode:c,font:p}),this._attachPowerButton()}_attachPowerButton(){this.shadowRoot.getElementById("power-btn")?.addEventListener("click",()=>{let e=this._switchEntityId;if(!e){let t=this.getRelatedEntity("switch");t&&(this._switchEntityId=t.entity_id,e=t.entity_id)}if(e&&this._hass.states[e])this._hass.callService("switch","toggle",{entity_id:e});else{let t=Object.keys(this._hass.states).filter(r=>r.startsWith("switch.")),i=this._config.entity?.replace(/^[^.]+\./,"").replace(/_?(text|display|gif_url)$/i,"")||"",s=t.find(r=>r.includes(i.substring(0,10)));s?(this._switchEntityId=s,this._hass.callService("switch","toggle",{entity_id:s})):console.warn("iPIXEL: No switch found. Entity:",this._config.entity,"Available:",t)}})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var j=class extends M{render(){if(!this._hass)return;let e=this.isOn();this.shadowRoot.innerHTML=`
      <style>${k}</style>
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
        </div>
      </ha-card>`,this._attachControlListeners()}_attachControlListeners(){this.shadowRoot.querySelectorAll("[data-action]").forEach(t=>{t.addEventListener("click",i=>{let s=i.currentTarget.dataset.action;if(s==="power"){let r=this.getRelatedEntity("switch");r&&this._hass.callService("switch","toggle",{entity_id:r.entity_id})}else s==="clear"?(S({text:"",mode:"text",effect:"fixed",speed:50,fgColor:"#ff6600",bgColor:"#000000"}),this.callService("ipixel_color","clear_pixels")):s==="clock"?(S({text:"",mode:"clock",effect:"fixed",speed:50,fgColor:"#00ff88",bgColor:"#000000"}),this.callService("ipixel_color","set_clock_mode",{style:1})):s==="sync"&&this.callService("ipixel_color","sync_time")})});let e=this.shadowRoot.getElementById("brightness");e&&(e.style.setProperty("--value",`${e.value}%`),e.addEventListener("input",t=>{t.target.style.setProperty("--value",`${t.target.value}%`),this.shadowRoot.getElementById("brightness-val").textContent=`${t.target.value}%`}),e.addEventListener("change",t=>{this.callService("ipixel_color","set_brightness",{level:parseInt(t.target.value)})})),this.shadowRoot.querySelectorAll("[data-mode]").forEach(t=>{t.addEventListener("click",i=>{let s=i.currentTarget.dataset.mode,r=this.getRelatedEntity("select","_mode");r&&this._hass.callService("select","select_option",{entity_id:r.entity_id,option:s}),S({mode:s,fgColor:{text:"#ff6600",textimage:"#ff6600",clock:"#00ff88",gif:"#ff44ff",rhythm:"#44aaff"}[s]||"#ff6600",text:s==="clock"?"":window.iPIXELDisplayState?.text||""}),this.shadowRoot.querySelectorAll("[data-mode]").forEach(n=>n.classList.remove("active")),i.currentTarget.classList.add("active")})}),this.shadowRoot.getElementById("orientation")?.addEventListener("change",t=>{let i=this.getRelatedEntity("select","_orientation");i&&this._hass.callService("select","select_option",{entity_id:i.entity_id,option:t.target.value})})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var N=class extends M{constructor(){super(),this._activeTab="text"}_buildTextEffectOptions(){let e=Object.entries(C).filter(([i,s])=>s.category===u.TEXT).map(([i,s])=>`<option value="${i}">${s.name}</option>`).join(""),t=Object.entries(C).filter(([i,s])=>s.category===u.COLOR).map(([i,s])=>`<option value="${i}">${s.name}</option>`).join("");return`
      <optgroup label="Text Effects">
        ${e}
      </optgroup>
      <optgroup label="Color Effects">
        ${t}
      </optgroup>
    `}_buildAmbientEffectOptions(){return Object.entries(C).filter(([e,t])=>t.category===u.AMBIENT).map(([e,t])=>`<option value="${e}">${t.name}</option>`).join("")}_buildAmbientGrid(){let e=this._selectedAmbient||"rainbow";return Object.entries(C).filter(([t,i])=>i.category===u.AMBIENT).map(([t,i])=>`
        <button class="effect-btn ${t===e?"active":""}" data-effect="${t}">
          ${i.name}
        </button>
      `).join("")}render(){if(!this._hass)return;let e=this._activeTab==="text";this.shadowRoot.innerHTML=`
      <style>${k}
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
      </ha-card>`,this._attachListeners()}_getTextFormValues(){return{text:this.shadowRoot.getElementById("text-input")?.value||"",effect:this.shadowRoot.getElementById("text-effect")?.value||"fixed",speed:parseInt(this.shadowRoot.getElementById("text-speed")?.value||"50"),fgColor:this.shadowRoot.getElementById("text-color")?.value||"#ff6600",bgColor:this.shadowRoot.getElementById("bg-color")?.value||"#000000",font:this.shadowRoot.getElementById("font-select")?.value||"VCR_OSD_MONO"}}_getAmbientFormValues(){return{effect:this._selectedAmbient||"rainbow",speed:parseInt(this.shadowRoot.getElementById("ambient-speed")?.value||"50")}}_updateTextPreview(){let{text:e,effect:t,speed:i,fgColor:s,bgColor:r,font:o}=this._getTextFormValues();S({text:e||"Preview",mode:"text",effect:t,speed:i,fgColor:s,bgColor:r,font:o})}_updateAmbientPreview(){let{effect:e,speed:t}=this._getAmbientFormValues();S({text:"",mode:"ambient",effect:e,speed:t,fgColor:"#ffffff",bgColor:"#000000"})}_attachListeners(){this.shadowRoot.getElementById("tab-text")?.addEventListener("click",()=>{this._activeTab="text",this.render()}),this.shadowRoot.getElementById("tab-ambient")?.addEventListener("click",()=>{this._activeTab="ambient",this.render()});let e=this.shadowRoot.getElementById("text-speed");e&&(e.style.setProperty("--value",`${e.value}%`),e.addEventListener("input",i=>{i.target.style.setProperty("--value",`${i.target.value}%`),this.shadowRoot.getElementById("text-speed-val").textContent=i.target.value,this._updateTextPreview()})),this.shadowRoot.getElementById("text-effect")?.addEventListener("change",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("font-select")?.addEventListener("change",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("text-color")?.addEventListener("input",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("bg-color")?.addEventListener("input",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("text-input")?.addEventListener("input",()=>{this._updateTextPreview()}),this.shadowRoot.getElementById("send-btn")?.addEventListener("click",()=>{let{text:i,effect:s,speed:r,fgColor:o,bgColor:n,font:a}=this._getTextFormValues();if(i){S({text:i,mode:"text",effect:s,speed:r,fgColor:o,bgColor:n,font:a}),this._config.entity&&this._hass.callService("text","set_value",{entity_id:this._config.entity,value:i});let c=a==="LEGACY"?"CUSONG":a;this.callService("ipixel_color","display_text",{text:i,effect:s,speed:r,color_fg:this.hexToRgb(o),color_bg:this.hexToRgb(n),font:c})}}),this.shadowRoot.querySelectorAll(".effect-btn").forEach(i=>{i.addEventListener("click",s=>{let r=s.target.dataset.effect;this._selectedAmbient=r,this.shadowRoot.querySelectorAll(".effect-btn").forEach(o=>o.classList.remove("active")),s.target.classList.add("active"),this._updateAmbientPreview()})});let t=this.shadowRoot.getElementById("ambient-speed");t&&(t.style.setProperty("--value",`${t.value}%`),t.addEventListener("input",i=>{i.target.style.setProperty("--value",`${i.target.value}%`),this.shadowRoot.getElementById("ambient-speed-val").textContent=i.target.value,this._updateAmbientPreview()})),this.shadowRoot.getElementById("apply-ambient-btn")?.addEventListener("click",()=>{let{effect:i,speed:s}=this._getAmbientFormValues();S({text:"",mode:"ambient",effect:i,speed:s,fgColor:"#ffffff",bgColor:"#000000"})})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var G=class extends M{render(){if(!this._hass)return;let e=this._config.items||[];this.shadowRoot.innerHTML=`
      <style>${k}
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
      </ha-card>`,this.shadowRoot.getElementById("start-btn")?.addEventListener("click",()=>{this.callService("ipixel_color","start_playlist")}),this.shadowRoot.getElementById("stop-btn")?.addEventListener("click",()=>{this.callService("ipixel_color","stop_playlist")})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var U=class extends M{render(){if(!this._hass)return;let e=new Date,t=(e.getHours()*60+e.getMinutes())/1440*100;this.shadowRoot.innerHTML=`
      <style>${k}
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
      </ha-card>`,this.shadowRoot.getElementById("save-power")?.addEventListener("click",()=>{this.callService("ipixel_color","set_power_schedule",{enabled:!0,on_time:this.shadowRoot.getElementById("power-on")?.value,off_time:this.shadowRoot.getElementById("power-off")?.value})})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var q=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(e){this._config=e,this.render()}set hass(e){this._hass=e,this.render()}render(){if(!this._hass)return;let e=Object.keys(this._hass.states).filter(t=>t.startsWith("text.")||t.startsWith("switch.")).sort();this.shadowRoot.innerHTML=`
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
      </div>`,this.shadowRoot.querySelectorAll("select, input").forEach(t=>{t.addEventListener("change",()=>this.fireConfig())})}fireConfig(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:{type:this._config?.type||"custom:ipixel-display-card",entity:this.shadowRoot.getElementById("entity")?.value,name:this.shadowRoot.getElementById("name")?.value||void 0}},bubbles:!0,composed:!0}))}};customElements.define("ipixel-display-card",W);customElements.define("ipixel-controls-card",j);customElements.define("ipixel-text-card",N);customElements.define("ipixel-playlist-card",G);customElements.define("ipixel-schedule-card",U);customElements.define("ipixel-simple-editor",q);window.customCards=window.customCards||[];[{type:"ipixel-display-card",name:"iPIXEL Display",description:"LED matrix preview with power control"},{type:"ipixel-controls-card",name:"iPIXEL Controls",description:"Brightness, mode, and orientation controls"},{type:"ipixel-text-card",name:"iPIXEL Text",description:"Text input with effects and colors"},{type:"ipixel-playlist-card",name:"iPIXEL Playlist",description:"Playlist management"},{type:"ipixel-schedule-card",name:"iPIXEL Schedule",description:"Power schedule and time slots"}].forEach(d=>window.customCards.push({...d,preview:!0,documentationURL:"https://github.com/cagcoach/ha-ipixel-color"}));console.info(`%c iPIXEL Cards %c ${J} `,"background:#03a9f4;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;","background:#333;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");})();

(()=>{var R="2.7.0";var h=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._config={},this._hass=null}set hass(e){this._hass=e,this.render()}setConfig(e){if(!e.entity)throw new Error("Please define an entity");this._config=e,this.render()}getEntity(){return!this._hass||!this._config.entity?null:this._hass.states[this._config.entity]}getRelatedEntity(e,t=""){if(!this._hass||!this._config.entity)return null;let s=this._config.entity.replace(/^[^.]+\./,"").replace(/_?(text|display|gif_url)$/i,""),i=`${e}.${s}${t}`;if(this._hass.states[i])return this._hass.states[i];let o=Object.keys(this._hass.states).filter(n=>{if(!n.startsWith(`${e}.`))return!1;let r=n.replace(/^[^.]+\./,"");return r.includes(s)||s.includes(r.replace(t,""))});if(t){let n=o.find(r=>r.endsWith(t));if(n)return this._hass.states[n]}else{let n=o.sort((r,y)=>r.length-y.length);if(n.length>0)return this._hass.states[n[0]]}return o.length>0?this._hass.states[o[0]]:null}async callService(e,t,s={}){if(this._hass)try{await this._hass.callService(e,t,s)}catch(i){console.error(`iPIXEL service call failed: ${e}.${t}`,i)}}getResolution(){let e=this.getRelatedEntity("sensor","_width")||this._hass?.states["sensor.display_width"],t=this.getRelatedEntity("sensor","_height")||this._hass?.states["sensor.display_height"];if(e&&t){let s=parseInt(e.state),i=parseInt(t.state);if(!isNaN(s)&&!isNaN(i)&&s>0&&i>0)return[s,i]}return[64,16]}isOn(){return this.getRelatedEntity("switch")?.state==="on"}hexToRgb(e){let t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]:[255,255,255]}render(){}getCardSize(){return 2}};var g=`
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
`;var P={A:[124,18,17,18,124],B:[127,73,73,73,54],C:[62,65,65,65,34],D:[127,65,65,34,28],E:[127,73,73,73,65],F:[127,9,9,9,1],G:[62,65,73,73,122],H:[127,8,8,8,127],I:[0,65,127,65,0],J:[32,64,65,63,1],K:[127,8,20,34,65],L:[127,64,64,64,64],M:[127,2,12,2,127],N:[127,4,8,16,127],O:[62,65,65,65,62],P:[127,9,9,9,6],Q:[62,65,81,33,94],R:[127,9,25,41,70],S:[70,73,73,73,49],T:[1,1,127,1,1],U:[63,64,64,64,63],V:[31,32,64,32,31],W:[63,64,56,64,63],X:[99,20,8,20,99],Y:[7,8,112,8,7],Z:[97,81,73,69,67],a:[32,84,84,84,120],b:[127,72,68,68,56],c:[56,68,68,68,32],d:[56,68,68,72,127],e:[56,84,84,84,24],f:[8,126,9,1,2],g:[12,82,82,82,62],h:[127,8,4,4,120],i:[0,68,125,64,0],j:[32,64,68,61,0],k:[127,16,40,68,0],l:[0,65,127,64,0],m:[124,4,24,4,120],n:[124,8,4,4,120],o:[56,68,68,68,56],p:[124,20,20,20,8],q:[8,20,20,24,124],r:[124,8,4,4,8],s:[72,84,84,84,32],t:[4,63,68,64,32],u:[60,64,64,32,124],v:[28,32,64,32,28],w:[60,64,48,64,60],x:[68,40,16,40,68],y:[12,80,80,80,60],z:[68,100,84,76,68],0:[62,81,73,69,62],1:[0,66,127,64,0],2:[66,97,81,73,70],3:[33,65,69,75,49],4:[24,20,18,127,16],5:[39,69,69,69,57],6:[60,74,73,73,48],7:[1,113,9,5,3],8:[54,73,73,73,54],9:[6,73,73,41,30]," ":[0,0,0,0,0],".":[0,96,96,0,0],",":[0,128,96,0,0],":":[0,54,54,0,0],";":[0,128,54,0,0],"!":[0,0,95,0,0],"?":[2,1,81,9,6],"-":[8,8,8,8,8],"+":[8,8,62,8,8],"=":[20,20,20,20,20],_:[64,64,64,64,64],"/":[32,16,8,4,2],"\\":[2,4,8,16,32],"(":[0,28,34,65,0],")":[0,65,34,28,0],"[":[0,127,65,65,0],"]":[0,65,65,127,0],"<":[8,20,34,65,0],">":[0,65,34,20,8],"*":[20,8,62,8,20],"#":[20,127,20,127,20],"@":[62,65,93,85,30],"&":[54,73,85,34,80],"%":[35,19,8,100,98],$:[18,42,127,42,36],"'":[0,0,7,0,0],'"':[0,7,0,7,0],"`":[0,1,2,0,0],"^":[4,2,1,2,4],"~":[8,4,8,16,8]};function F(a,e,t,s="#ff6600",i="#111"){let o=[],y=Math.floor((t-7)/2);for(let f=0;f<t;f++)for(let l=0;l<e;l++)o.push(i);let u=a.length*6-1,b=Math.max(1,Math.floor((e-u)/2));for(let f of a){let l=P[f]||P[" "];for(let c=0;c<5;c++)for(let d=0;d<7;d++){let p=l[c]>>d&1,x=b+c,v=y+d;x>=0&&x<e&&v<t&&v>=0&&(o[v*e+x]=p?s:i)}b+=6}return o}function D(a,e,t,s=1,i="fixed",o=50){let r=100/a,y=r,u=e*y,m=.2+(100-o)*.08,b=1+(100-o)*.15,f="";for(let d=0;d<e;d++)for(let p=0;p<a;p++){let x=t[d*a+p]||"#111",v=x!=="#111"&&x!=="#000"&&x!=="#1a1a1a"&&x!=="#050505",_=p/a*m*.3,w=v?`filter: drop-shadow(0 0 2px ${x});`:"";if(v)if(i==="blink")w+=`animation: ipixel-blink ${m}s ease-in-out infinite;`;else if(i==="breeze")w+=`animation: ipixel-breeze ${m*1.5}s ease-in-out infinite; animation-delay: ${_}s;`;else if(i==="snow"){let A=Math.random()*m;w+=`animation: ipixel-snow ${m*2}s ease-in-out infinite; animation-delay: ${A}s;`}else i==="laser"&&(w+=`animation: ipixel-laser ${m}s linear infinite; animation-delay: ${_}s;`);f+=`<rect x="${p*r}" y="${d*y}" width="${r-s*.1}" height="${y-s*.1}" fill="${x}" rx="0.3" style="${w}"/>`}let l=f,c="";if(i==="scroll_ltr"||i==="scroll_rtl"){let d=f.replace(/x="(\d+\.?\d*)"/g,(p,x)=>`x="${parseFloat(x)+100}"`);l=f+d,i==="scroll_ltr"?c=`animation: ipixel-scroll-ltr ${b}s linear infinite;`:c=`animation: ipixel-scroll-rtl ${b}s linear infinite;`}return`
    <svg viewBox="0 0 100 ${u}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block;overflow:hidden;">
      <defs>
        <clipPath id="displayClip">
          <rect x="0" y="0" width="100" height="${u}"/>
        </clipPath>
        <style>
          @keyframes ipixel-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes ipixel-breeze {
            0%, 100% { opacity: 1; transform: translateX(0); }
            50% { opacity: 0.4; transform: translateX(1px); }
          }
          @keyframes ipixel-snow {
            0%, 100% { opacity: 1; }
            25% { opacity: 0.2; }
            50% { opacity: 0.8; }
            75% { opacity: 0.3; }
          }
          @keyframes ipixel-laser {
            0%, 100% { opacity: 0.2; filter: brightness(0.5); }
            50% { opacity: 1; filter: brightness(1.5); }
          }
          @keyframes ipixel-scroll-ltr {
            0% { transform: translateX(-100px); }
            100% { transform: translateX(0); }
          }
          @keyframes ipixel-scroll-rtl {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100px); }
          }
        </style>
      </defs>
      <g clip-path="url(#displayClip)">
        <g style="${c}">${l}</g>
      </g>
    </svg>`}var B="iPIXEL_DisplayState",T={text:"",mode:"text",effect:"fixed",speed:50,fgColor:"#ff6600",bgColor:"#000000",lastUpdate:0};function M(){try{let a=localStorage.getItem(B);if(a)return JSON.parse(a)}catch(a){console.warn("iPIXEL: Could not load saved state",a)}return{...T}}function H(a){try{localStorage.setItem(B,JSON.stringify(a))}catch(e){console.warn("iPIXEL: Could not save state",e)}}window.iPIXELDisplayState||(window.iPIXELDisplayState=M());function X(){return window.iPIXELDisplayState}function E(a){return window.iPIXELDisplayState={...window.iPIXELDisplayState,...a,lastUpdate:Date.now()},H(window.iPIXELDisplayState),window.dispatchEvent(new CustomEvent("ipixel-display-update",{detail:window.iPIXELDisplayState})),window.iPIXELDisplayState}var C=class extends h{constructor(){super(),this._handleDisplayUpdate=()=>this.render(),window.addEventListener("ipixel-display-update",this._handleDisplayUpdate)}disconnectedCallback(){window.removeEventListener("ipixel-display-update",this._handleDisplayUpdate)}render(){if(!this._hass)return;let[e,t]=this.getResolution(),s=this.isOn(),i=this._config.name||this.getEntity()?.attributes?.friendly_name||"iPIXEL Display",o=X(),r=this.getEntity()?.state||"",u=this.getRelatedEntity("select","_mode")?.state||o.mode||"text",m=o.text||r,b=o.effect||"fixed",f=o.speed||50,l="",c=o.fgColor||"#ff6600",d=o.bgColor||"#111",p=b,x=f;s?u==="clock"?(l=new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}),c="#00ff88"):u==="gif"?(l="GIF",c="#ff44ff"):u==="rhythm"?(l="***",c="#44aaff"):l=m||"":(l="",d="#050505");let v=F(l,e,t,c,d),_=D(e,t,v,1,p,x);this.shadowRoot.innerHTML=`
      <style>${g}
        .display-container { background: #000; border-radius: 8px; padding: 8px; border: 2px solid #222; }
        .display-screen {
          background: #000;
          border-radius: 4px;
          overflow: hidden;
          min-height: 60px;
        }
        .display-footer { display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.75em; opacity: 0.6; }
        .mode-badge { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; text-transform: capitalize; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">
              <span class="status-dot ${s?"":"off"}"></span>
              ${i}
            </div>
            <button class="icon-btn ${s?"active":""}" id="power-btn">
              <svg viewBox="0 0 24 24"><path d="M13,3H11V13H13V3M17.83,5.17L16.41,6.59C18.05,7.91 19,9.9 19,12A7,7 0 0,1 12,19A7,7 0 0,1 5,12C5,9.9 5.95,7.91 7.59,6.59L6.17,5.17C4.23,6.82 3,9.26 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12C21,9.26 19.77,6.82 17.83,5.17Z"/></svg>
            </button>
          </div>
          <div class="display-container">
            <div class="display-screen">${_}</div>
            <div class="display-footer">
              <span>${e} x ${t}</span>
              <span class="mode-badge">${s?p!=="fixed"?p.replace("_"," "):u:"Off"}</span>
            </div>
          </div>
        </div>
      </ha-card>`,this._attachPowerButton()}_attachPowerButton(){this.shadowRoot.getElementById("power-btn")?.addEventListener("click",()=>{let e=this._switchEntityId;if(!e){let t=this.getRelatedEntity("switch");t&&(this._switchEntityId=t.entity_id,e=t.entity_id)}if(e&&this._hass.states[e])this._hass.callService("switch","toggle",{entity_id:e});else{let t=Object.keys(this._hass.states).filter(o=>o.startsWith("switch.")),s=this._config.entity?.replace(/^[^.]+\./,"").replace(/_?(text|display|gif_url)$/i,"")||"",i=t.find(o=>o.includes(s.substring(0,10)));i?(this._switchEntityId=i,this._hass.callService("switch","toggle",{entity_id:i})):console.warn("iPIXEL: No switch found. Entity:",this._config.entity,"Available:",t)}})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var L=class extends h{render(){if(!this._hass)return;let e=this.isOn();this.shadowRoot.innerHTML=`
      <style>${g}</style>
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
      </ha-card>`,this._attachControlListeners()}_attachControlListeners(){this.shadowRoot.querySelectorAll("[data-action]").forEach(t=>{t.addEventListener("click",s=>{let i=s.currentTarget.dataset.action;if(i==="power"){let o=this.getRelatedEntity("switch");o&&this._hass.callService("switch","toggle",{entity_id:o.entity_id})}else i==="clear"?(E({text:"",mode:"text",effect:"fixed",speed:50,fgColor:"#ff6600",bgColor:"#000000"}),this.callService("ipixel_color","clear_pixels")):i==="clock"?(E({text:"",mode:"clock",effect:"fixed",speed:50,fgColor:"#00ff88",bgColor:"#000000"}),this.callService("ipixel_color","set_clock_mode",{style:1})):i==="sync"&&this.callService("ipixel_color","sync_time")})});let e=this.shadowRoot.getElementById("brightness");e&&(e.style.setProperty("--value",`${e.value}%`),e.addEventListener("input",t=>{t.target.style.setProperty("--value",`${t.target.value}%`),this.shadowRoot.getElementById("brightness-val").textContent=`${t.target.value}%`}),e.addEventListener("change",t=>{this.callService("ipixel_color","set_brightness",{level:parseInt(t.target.value)})})),this.shadowRoot.querySelectorAll("[data-mode]").forEach(t=>{t.addEventListener("click",s=>{let i=s.currentTarget.dataset.mode,o=this.getRelatedEntity("select","_mode");o&&this._hass.callService("select","select_option",{entity_id:o.entity_id,option:i}),E({mode:i,fgColor:{text:"#ff6600",textimage:"#ff6600",clock:"#00ff88",gif:"#ff44ff",rhythm:"#44aaff"}[i]||"#ff6600",text:i==="clock"?"":window.iPIXELDisplayState?.text||""}),this.shadowRoot.querySelectorAll("[data-mode]").forEach(r=>r.classList.remove("active")),s.currentTarget.classList.add("active")})}),this.shadowRoot.getElementById("orientation")?.addEventListener("change",t=>{let s=this.getRelatedEntity("select","_orientation");s&&this._hass.callService("select","select_option",{entity_id:s.entity_id,option:t.target.value})})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var S=class extends h{render(){this._hass&&(this.shadowRoot.innerHTML=`
      <style>${g}
        .input-row { display: flex; gap: 8px; margin-bottom: 12px; }
        .input-row .text-input { flex: 1; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="section-title">Display Text</div>
          <div class="input-row">
            <input type="text" class="text-input" id="text-input" placeholder="Enter text to display...">
            <button class="btn btn-primary" id="send-btn">Send</button>
          </div>
          <div class="section-title">Effect</div>
          <div class="control-row">
            <select class="dropdown" id="effect">
              <option value="fixed">Fixed</option>
              <option value="scroll_ltr" selected>Scroll Left to Right</option>
              <option value="scroll_rtl">Scroll Right to Left</option>
              <option value="blink">Blink</option>
              <option value="breeze">Breeze</option>
              <option value="snow">Snow</option>
              <option value="laser">Laser</option>
            </select>
          </div>
          <div class="section-title">Speed</div>
          <div class="control-row">
            <div class="slider-row">
              <input type="range" class="slider" id="speed" min="1" max="100" value="50">
              <span class="slider-value" id="speed-val">50</span>
            </div>
          </div>
          <div class="section-title">Colors</div>
          <div class="control-row">
            <div class="color-row">
              <span style="font-size: 0.85em;">Text:</span>
              <input type="color" class="color-picker" id="text-color" value="#ffffff">
              <span style="font-size: 0.85em; margin-left: 16px;">Background:</span>
              <input type="color" class="color-picker" id="bg-color" value="#000000">
            </div>
          </div>
        </div>
      </ha-card>`,this._attachListeners())}_attachListeners(){let e=this.shadowRoot.getElementById("speed");e&&(e.style.setProperty("--value",`${e.value}%`),e.addEventListener("input",t=>{t.target.style.setProperty("--value",`${t.target.value}%`),this.shadowRoot.getElementById("speed-val").textContent=t.target.value})),this.shadowRoot.getElementById("send-btn")?.addEventListener("click",()=>{let t=this.shadowRoot.getElementById("text-input")?.value,s=this.shadowRoot.getElementById("effect")?.value||"fixed",i=parseInt(this.shadowRoot.getElementById("speed")?.value||"50"),o=this.shadowRoot.getElementById("text-color")?.value||"#ff6600",n=this.shadowRoot.getElementById("bg-color")?.value||"#000000";t&&(E({text:t,mode:"text",effect:s,speed:i,fgColor:o,bgColor:n}),this._config.entity&&this._hass.callService("text","set_value",{entity_id:this._config.entity,value:t}),this.callService("ipixel_color","display_text",{text:t,effect:s,speed:i,color_fg:this.hexToRgb(o),color_bg:this.hexToRgb(n)}))})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var k=class extends h{render(){if(!this._hass)return;let e=this._config.items||[];this.shadowRoot.innerHTML=`
      <style>${g}
        .playlist-actions { display: flex; gap: 8px; margin-top: 12px; }
        .playlist-actions .btn { flex: 1; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="card-header"><div class="card-title">Playlist</div></div>
          <div id="playlist-items">
            ${e.length===0?'<div class="empty-state">No playlist items yet</div>':e.map((t,s)=>`
                <div class="list-item">
                  <div class="list-item-info">
                    <div class="list-item-name">${t.name||`Item ${s+1}`}</div>
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
      </ha-card>`,this.shadowRoot.getElementById("start-btn")?.addEventListener("click",()=>{this.callService("ipixel_color","start_playlist")}),this.shadowRoot.getElementById("stop-btn")?.addEventListener("click",()=>{this.callService("ipixel_color","stop_playlist")})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var I=class extends h{render(){if(!this._hass)return;let e=new Date,t=(e.getHours()*60+e.getMinutes())/1440*100;this.shadowRoot.innerHTML=`
      <style>${g}
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
      </ha-card>`,this.shadowRoot.getElementById("save-power")?.addEventListener("click",()=>{this.callService("ipixel_color","set_power_schedule",{enabled:!0,on_time:this.shadowRoot.getElementById("power-on")?.value,off_time:this.shadowRoot.getElementById("power-off")?.value})})}static getConfigElement(){return document.createElement("ipixel-simple-editor")}static getStubConfig(){return{entity:""}}};var $=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(e){this._config=e,this.render()}set hass(e){this._hass=e,this.render()}render(){if(!this._hass)return;let e=Object.keys(this._hass.states).filter(t=>t.startsWith("text.")||t.startsWith("switch.")).sort();this.shadowRoot.innerHTML=`
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
      </div>`,this.shadowRoot.querySelectorAll("select, input").forEach(t=>{t.addEventListener("change",()=>this.fireConfig())})}fireConfig(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:{type:this._config?.type||"custom:ipixel-display-card",entity:this.shadowRoot.getElementById("entity")?.value,name:this.shadowRoot.getElementById("name")?.value||void 0}},bubbles:!0,composed:!0}))}};customElements.define("ipixel-display-card",C);customElements.define("ipixel-controls-card",L);customElements.define("ipixel-text-card",S);customElements.define("ipixel-playlist-card",k);customElements.define("ipixel-schedule-card",I);customElements.define("ipixel-simple-editor",$);window.customCards=window.customCards||[];[{type:"ipixel-display-card",name:"iPIXEL Display",description:"LED matrix preview with power control"},{type:"ipixel-controls-card",name:"iPIXEL Controls",description:"Brightness, mode, and orientation controls"},{type:"ipixel-text-card",name:"iPIXEL Text",description:"Text input with effects and colors"},{type:"ipixel-playlist-card",name:"iPIXEL Playlist",description:"Playlist management"},{type:"ipixel-schedule-card",name:"iPIXEL Schedule",description:"Power schedule and time slots"}].forEach(a=>window.customCards.push({...a,preview:!0,documentationURL:"https://github.com/cagcoach/ha-ipixel-color"}));console.info(`%c iPIXEL Cards %c ${R} `,"background:#03a9f4;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;","background:#333;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");})();

export function setupBrowserAgent(api){
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const point=(x,y)=>{if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1280||y<0||y>720)throw new Error('坐标必须位于1280×720游戏画面内。');return {x,y};};
 const duration=n=>{if(!Number.isFinite(n)||n<0||n>3000)throw new Error('持续时间必须介于0和3000毫秒。');return n;};
 let busy=false;
 const run=async task=>{if(busy)throw new Error('请等待上一个操作结束。');busy=true;try{await task();await pause(60);return api.read();}finally{api.up();busy=false;}};
 const bridge={
  get_state:()=>api.read(),
  click:({x,y})=>{point(x,y);return run(async()=>{api.down(x,y);await pause(35);api.up();});},
  drag:({from_x,from_y,to_x,to_y,duration_ms=600})=>{point(from_x,from_y);point(to_x,to_y);duration(duration_ms);return run(async()=>{api.down(from_x,from_y);const steps=Math.max(1,Math.ceil(duration_ms/25));for(let i=1;i<=steps;i++){await pause(duration_ms/steps);api.move(from_x+(to_x-from_x)*i/steps,from_y+(to_y-from_y)*i/steps);}api.up();});},
  press_key:({code,duration_ms=60})=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','Enter','Escape'].includes(code))throw new Error('不支持的按键。');duration(duration_ms);return run(async()=>{window.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true,cancelable:true}));try{await pause(duration_ms);}finally{window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));}});}
 };
 window.xiaoheAgent=Object.freeze(bridge);
 const controls=document.createElement('div');controls.id='game-accessible-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','小禾的校园安全日：当前可用按钮');document.body.appendChild(controls);
 const status=document.createElement('div');status.id='game-accessible-state';status.setAttribute('role','status');status.style.cssText='position:fixed;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';document.body.appendChild(status);
 let previous='';
 function sync(){const state=api.read(),actions=state.actions||[],key=JSON.stringify([state.scene,state.paused,actions,innerWidth,innerHeight]);if(key===previous)return;previous=key;controls.replaceChildren();status.textContent=JSON.stringify(state);const scale=Math.min(innerWidth/1280,innerHeight/720),ox=(innerWidth-1280*scale)/2,oy=(innerHeight-720*scale)/2;for(const action of actions){const b=document.createElement('button');b.type='button';b.textContent=action.label;b.setAttribute('aria-label',action.label);b.dataset.gameAction=action.id;b.tabIndex=-1;b.disabled=!!action.disabled;const [x,y,w,h]=action.rect;b.style.cssText=`position:fixed;left:${ox+x*scale}px;top:${oy+y*scale}px;width:${w*scale}px;height:${h*scale}px;opacity:0;z-index:4;border:0;padding:0;cursor:pointer`;b.addEventListener('pointerenter',()=>api.hover?.(x+w/2,y+h/2));b.addEventListener('pointerleave',()=>api.hover?.(-1,-1));b.addEventListener('click',()=>bridge.click({x:x+w/2,y:y+h/2}).catch(e=>console.warn(e.message)));b.addEventListener('keydown',e=>{if(e.code==='Enter'||e.code==='Space'){e.preventDefault();e.stopPropagation();b.click();}});controls.appendChild(b);}}
 const interval=setInterval(sync,200);sync();
 const lifecycle=new AbortController();window.addEventListener('pagehide',()=>{clearInterval(interval);lifecycle.abort();},{once:true});
 const registry=document.modelContext;
 if(typeof registry?.registerTool==='function'){
  const result=value=>({content:[{type:'text',text:JSON.stringify(value)}]});
  const tools=[
   {name:'read_xiaohe_game',description:'读取当前关卡、游戏状态和可点击按钮。所有坐标以1280×720画面为准。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:async()=>result(bridge.get_state())},
   {name:'click_xiaohe_game',description:'在游戏画面点击指定坐标，遵循现有按钮、解锁、暂停和旁白规则。',inputSchema:{type:'object',properties:{x:{type:'number',minimum:0,maximum:1280},y:{type:'number',minimum:0,maximum:720}},required:['x','y'],additionalProperties:false},execute:async input=>result(await bridge.click(input))},
   {name:'drag_xiaohe_game',description:'按住并拖动游戏角色，结束时释放。用于走廊拖动等操作。',inputSchema:{type:'object',properties:{from_x:{type:'number'},from_y:{type:'number'},to_x:{type:'number'},to_y:{type:'number'},duration_ms:{type:'number',minimum:0,maximum:3000}},required:['from_x','from_y','to_x','to_y'],additionalProperties:false},execute:async input=>result(await bridge.drag(input))},
   {name:'press_xiaohe_key',description:'按下并释放游戏按键，可用方向键、Enter、Space或Escape。',inputSchema:{type:'object',properties:{code:{type:'string',enum:['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter','Space','Escape']},duration_ms:{type:'number',minimum:0,maximum:3000}},required:['code'],additionalProperties:false},execute:async input=>result(await bridge.press_key(input))}
  ];
  for(const tool of tools){try{Promise.resolve(registry.registerTool(tool,{signal:lifecycle.signal})).catch(e=>console.warn('浏览器代理工具注册未完成',e.message));}catch(e){console.warn('浏览器代理工具不可用',e.message);}}
 }
}

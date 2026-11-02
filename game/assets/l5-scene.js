import {drawAssemblyGroups} from './l5-assembly-visual.js?v=20261102-1';
import {motionRenderer,newGait,updateGait} from './l5-motion.js?v=20261102-motion1';
import {L5_COPY} from './l5-content.js?v=anna-l5-1';

// Only level five owns this state machine; other levels keep their existing controls.
export function createL5(g) {
 const {ctx,W,H,IMG,preferences,bg,drawAt,shadow,text,pill,rr,hit,say,sfx,stopSound,go,STR,voiceBusy}=g;
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const st={phase:'route',t:0,age:0,x:640,y:520,focus:0,focusVisible:false,hover:-1,mistakes:{},feedback:null,move:null,done:0,queueOffset:0};
 const routeSide=Math.random()<.5?'left':'right';
 const classOrder=shuffle(['一年一班','一年二班','一年三班']);
 const classXs=[370,720,1070];
 const gait={hero:newGait(),girl:newGait(),boy:newGait(18)};
 const motion=motionRenderer(ctx,IMG,drawAt,shadow);
 let options=[],voice='intro';
 const box=(x,y,w,h)=>{ctx.save();ctx.fillStyle='#fff7e8';ctx.strokeStyle='#edc18a';ctx.lineWidth=3;rr(x,y,w,h,25);ctx.fill();ctx.stroke();ctx.restore();};
 const speak=k=>{voice=k;stopSound();say('vo_l5_'+k);};
 function choices(items){options=items;st.focus=0;}
 function setPhase(p,k){st.phase=p;st.age=0;st.focus=0;if(k)speak(k);}
 function decision(p){
  if(p==='route'){setPhase(p,'intro');choices([{id:'left',label:'走左边',rect:[210,610,350,76]},{id:'right',label:'走右边',rect:[720,610,350,76]}]);}
  if(p==='stop'){setPhase(p,'stopQuestion');choices(shuffle([{id:'stop',label:'停一停，等一等'},{id:'push',label:'从旁边挤过去'}]).map((o,i)=>({...o,rect:[210+i*510,610,350,76]})));}
  if(p==='bag'){setPhase(p,'bagQuestion');choices(shuffle([{id:'continue',label:'继续去集合'},{id:'return',label:'回去拿水杯'}]).map((o,i)=>({...o,rect:[210+i*510,610,350,76]})));}
  if(p==='class'){setPhase(p,'classQuestion');choices(classOrder.map((label,i)=>({id:label,label,rect:[classXs[i]-151,210,302,370]})));}
 }
 function move(to,duration,next){options=[];duration=Math.max(.8,Math.hypot(to[0]-st.x,to[1]-st.y)/110+.24);st.move={fromX:st.x,fromY:st.y,toX:to[0],toY:to[1],t:0,duration,next};setPhase('moving');}
 function feedback(ok,k,next,retry){st.feedback={ok,next,retry};setPhase('feedback',k);choices([{id:'ack',label:ok?'继续前进':'再想一想',rect:[460,610,360,76]}]);sfx(ok?'sfx_ok':'sfx_no');}
 function wrong(k){st.mistakes[st.phase]=(st.mistakes[st.phase]||0)+1;feedback(false,k,null,st.phase);}
 function activate(id){
  if(st.age<.35||st.move)return;
  if((st.phase==='feedback'||st.phase==='success')&&voiceBusy())return;
  if(st.phase==='feedback'){
   const f=st.feedback;st.feedback=null;
   if(!f.ok){decision(f.retry);return;}
   if(f.next==='walkStop'){st.done=1;move([routeSide==='left'?270:1010,515],1.5,'toQueue');}
   else if(f.next==='waitQueue'){options=[];setPhase('waiting');}
   else if(f.next==='walkClass'){st.done=2;move([1060,520],2.2,'class');}
   return;
  }
  if(st.phase==='route'){if(id===routeSide)feedback(true,'routeOk','walkStop');else wrong('routeWrong');}
  else if(st.phase==='stop'){if(id==='stop')feedback(true,'stopOk','waitQueue');else wrong('stopWrong');}
  else if(st.phase==='bag'){if(id==='continue')feedback(true,'bagOk','walkClass');else wrong('bagWrong');}
  else if(st.phase==='class'){
   if(id!=='一年一班'){wrong('classWrong');return;}
   st.done=3;st.x=145;st.y=560;const i=classOrder.indexOf(id);move([classXs[i],540],2,'report');
  }
  else if(st.phase==='report') {st.done=4;options=[];setPhase('success','success');sfx('sfx_star');}
  else if(st.phase==='success')go('win',{id:'l5',line:'有序集合，听从指挥',bg:'bg_playground'});
 }
 function arrived(next){
  if(next==='toQueue'){st.x=200;st.y=520;move([460,520],2.1,'stop');}
  else if(next==='class'){gait.hero.blend=0;st.x=145;st.y=560;st.focusVisible=false;st.hover=-1;decision('class');}
  else if(next==='report'){setPhase('report','report');choices([{id:'hand',label:'举手：到！',rect:[460,610,360,76]}]);}
  else decision(next);
 }
 function actor(name,x,y,h,walking=false){let g=name==='sp_xiaoman'?gait.girl:name==='sp_l5_boy'?gait.boy:gait.hero;if(name==='sp_teacher')g=null;motion.actor(name,x,y,h,g);}
 function routeSign(){
  ctx.fillStyle='#737d79';ctx.fillRect(627,280,20,119);box(505,212,270,86);
  ctx.fillStyle='#168b54';rr(514,221,252,68,13);ctx.fill();
  text('安全出口',605,254,24,'#fff');ctx.save();ctx.translate(709,254);if(routeSide==='left')ctx.scale(-1,1);ctx.strokeStyle='#fff';ctx.lineWidth=10;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(-25,0);ctx.lineTo(17,0);ctx.moveTo(3,-17);ctx.lineTo(21,0);ctx.lineTo(3,17);ctx.stroke();ctx.restore();
 }
 const isAssembly=()=>['class','report','success'].includes(st.phase)||(st.phase==='moving'&&st.move?.next==='report')||(st.phase==='feedback'&&st.feedback?.retry==='class');
 return {
  enter(){decision('route');},
  debugState(){return {phase:st.phase,done:st.done,routeSide,classOrder,x:st.x,y:st.y,moving:!!st.move,gait:{hero:{...gait.hero},girl:{...gait.girl},boy:{...gait.boy}},mistakes:{...st.mistakes},voice,feedback:st.feedback,options:options.map(o=>({id:o.id,label:o.label,rect:o.rect})),hint:Object.values(st.mistakes).some(n=>n>=2)};},
  update(dt){st.t+=dt;st.age+=dt;const beforeX=st.x,beforeQueue=st.queueOffset;let travelled=0;
   if(st.move){const m=st.move;m.t+=dt;const k=Math.min(1,m.t/m.duration),a=Math.min(.24/m.duration,.25),e=k<a?k*k/(2*a*(1-a)):k>1-a?1-(1-k)*(1-k)/(2*a*(1-a)):(k-a/2)/(1-a);st.x=m.fromX+(m.toX-m.fromX)*e;st.y=m.fromY+(m.toY-m.fromY)*e;travelled=st.x-beforeX;if(k===1){st.move=null;arrived(m.next);}}
   if(st.phase==='waiting'){st.queueOffset=Math.min(100,st.age*55);if(st.age>=1.8)move([710,520],1.8,'bag');}
   updateGait(gait.hero,travelled,dt);updateGait(gait.girl,st.queueOffset-beforeQueue,dt);updateGait(gait.boy,(st.queueOffset-beforeQueue)*.88,dt);
   if(st.phase==='success'&&st.age>2.5&&options.length===0)choices([{id:'finish',label:'完成挑战',rect:[460,610,360,76]}]);
  },
  draw(){
   const assembly=isAssembly(),route=st.phase==='route'||(st.phase==='feedback'&&st.feedback?.retry==='route')||(st.phase==='feedback'&&st.feedback?.next==='walkStop')||(st.phase==='moving'&&st.move?.next==='toQueue');
   bg(route?'bg_l5_fork':assembly?'bg_l5_class_courtyard':'bg_l5_assembly');
   if(route){routeSign();actor('sp_xiaohe',st.x,st.y,210,!!st.move);if(st.mistakes.route>=2){ctx.save();ctx.strokeStyle='#ffcc45';ctx.lineWidth=5;rr(498,205,284,100,26);ctx.stroke();ctx.restore();}}
   else if(assembly){
    drawAssemblyGroups({ctx,text,rr},st,classOrder,classXs,actor);
    const heroH=200+30*Math.max(0,Math.min(1,(st.y-540)/20));
    if(st.phase==='success')motion.raise(st.x,st.y,heroH,st.age);else actor('sp_xiaohe',st.x,st.y,heroH,!!st.move);
    if(st.phase==='success'){text('到！',st.x+100,350,38,'#dc4a30');for(let i=0;i<5;i++){ctx.save();ctx.translate(st.x+Math.cos(i*1.26+st.t)*135,365+Math.sin(i*1.26+st.t)*65);drawAt('sp_star',0,0,28);ctx.restore();}}
   }else{
    actor('sp_xiaoman',735+st.queueOffset,505,210);actor('sp_l5_boy',930+st.queueOffset*.88,490,185);
    actor('sp_xiaohe',st.x,st.y,250,!!st.move);
   }
   // Spoken guidance carries the explanation; only actionable controls remain on screen.
   if(st.phase==='class'){if(st.mistakes.class>=2){const x=classXs[classOrder.indexOf('一年一班')];ctx.strokeStyle='#ffca44';ctx.lineWidth=6;rr(x-132,210,264,96,30);ctx.stroke();}}
   else options.forEach((o,i)=>{const listening=(st.phase==='feedback'||st.phase==='success')&&voiceBusy();pill(...o.rect,o.label,listening?false:(st.phase==='feedback'?st.feedback.ok:true),27);const hinted=st.mistakes[st.phase]>=2&&((st.phase==='stop'&&o.id==='stop')||(st.phase==='bag'&&o.id==='continue'));if(st.focus===i||hinted){ctx.save();ctx.strokeStyle=hinted?'#08ad98':'#fff0c6';ctx.lineWidth=hinted?5:2;rr(o.rect[0]-4,o.rect[1]-4,o.rect[2]+8,o.rect[3]+8,34);ctx.stroke();ctx.restore();}});
  },
  onDown(x,y){const o=options.find(o=>hit(x,y,...o.rect));if(o)activate(o.id);},
  onHover(x,y){st.hover=st.phase==='class'?options.findIndex(o=>hit(x,y,...o.rect)):-1;},
  key(code){if(!options.length)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(code)){st.focusVisible=true;st.hover=-1;}if(code==='ArrowRight'||code==='ArrowDown')st.focus=(st.focus+1)%options.length;if(code==='ArrowLeft'||code==='ArrowUp')st.focus=(st.focus+options.length-1)%options.length;},
  tap(){if(options.length)activate(options[st.focus].id);},onUp(){}
 };
}

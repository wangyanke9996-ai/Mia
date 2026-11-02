// Scene furniture remains part of the courtyard, without adding explanatory panels.
export function drawAssemblyGroups(g,st,classOrder,classXs,actor){
 const {ctx,text,rr}=g;
 const styles={
  '一年一班':{ink:'#168d7f',light:'#cceee0',rim:'#6ec3ac'},
  '一年二班':{ink:'#d48b38',light:'#f7e3b9',rim:'#e7bd74'},
  '一年三班':{ink:'#4889bb',light:'#d9eaf7',rim:'#91bad8'}
 };
 const active=st.phase==='class'?(st.hover>=0?st.hover:st.focusVisible?st.focus:-1):-1;
 classOrder.forEach((label,i)=>{const x=classXs[i],s=styles[label],selected=st.done>=3&&label==='一年一班',highlight=i===active||selected;
  ctx.save();
  const paint=ctx.createRadialGradient(x,545,10,x,545,170);paint.addColorStop(0,s.light);paint.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=paint;ctx.beginPath();ctx.ellipse(x,547,170,44,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=highlight?s.light:'rgba(255,251,236,.28)';ctx.beginPath();ctx.ellipse(x,541,151,34,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=highlight?s.rim:'rgba(255,252,240,.86)';ctx.lineWidth=highlight?5:4;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.52)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,541,141,27,0,0,Math.PI*2);ctx.stroke();
  // A rooted wooden post and a small base make the sign physically grounded.
  ctx.fillStyle='rgba(41,62,68,.11)';ctx.beginPath();ctx.ellipse(x+7,533,30,8,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#b88c5d';rr(x-7,286,14,246,5);ctx.fill();ctx.fillStyle='#efcf9d';rr(x-4,287,5,243,2);ctx.fill();
  ctx.fillStyle='#cfa97a';rr(x-25,526,50,10,5);ctx.fill();
  ctx.shadowColor=highlight?'rgba(81,100,79,.22)':'rgba(71,70,57,.13)';ctx.shadowBlur=highlight?17:11;ctx.shadowOffsetY=5;
  ctx.fillStyle='#e8c99d';rr(x-125,222,250,82,27);ctx.fill();
  const cream=ctx.createLinearGradient(0,217,0,297);cream.addColorStop(0,'#fffdf2');cream.addColorStop(1,'#fff0d5');ctx.fillStyle=cream;rr(x-125,217,250,82,27);ctx.fill();ctx.shadowColor='transparent';
  ctx.strokeStyle=highlight?s.rim:'#e8bf83';ctx.lineWidth=highlight?3.5:2;ctx.stroke();ctx.strokeStyle='#fffdf7';ctx.lineWidth=2;rr(x-120,222,240,72,23);ctx.stroke();
  ctx.fillStyle=s.light;ctx.beginPath();ctx.arc(x-87,258,18,0,Math.PI*2);ctx.fill();ctx.fillStyle=s.ink;
  // Matching leaf emblems distinguish the groups without giving away the answer.
  ctx.save();ctx.translate(x-87,258);ctx.rotate(-.5);ctx.beginPath();ctx.ellipse(-3,-2,5,9,0,0,Math.PI*2);ctx.ellipse(5,2,4,7,.7,0,Math.PI*2);ctx.fill();ctx.restore();
  text(label,x+17,258,28,'#243e60');ctx.restore();
 });
 classOrder.forEach((label,i)=>{const x=classXs[i];if(label==='一年一班')actor('sp_teacher',x-105,540,235);else actor(label==='一年二班'?'sp_xiaoman':'sp_l5_boy',x+35,540,185);});
}

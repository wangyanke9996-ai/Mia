// Generated frame metadata is kept beside the renderer; loaded image keys are level-five only.
export const L5_MOTION = {
 hero:{key:'sp_l5_motion_hero',file:'xh_walk_f24_256x384_g6x4_fps24_loop.png',frames:24,cols:6,stride:104},
 girl:{key:'sp_l5_motion_girl',file:'xm_walk_f24_256x384_g6x4_fps24_loop.png',frames:24,cols:6,stride:108},
 boy:{key:'sp_l5_motion_boy',file:'boy_walk_f24_256x384_g6x4_fps24_loop.png',frames:24,cols:6,stride:84},
 hand:{key:'sp_l5_motion_hand',file:'xh_raise_f24_256x384_g6x4_fps20_once.png',frames:24,cols:6}
};
export function newGait(offset=0){return {distance:offset,blend:0,facing:1};}
export function updateGait(gait,dx,dt){if(Math.abs(dx)>.0001){gait.distance+=Math.abs(dx);gait.facing=dx<0?-1:1;}const target=Math.abs(dx)>.0001?1:0;gait.blend+=(target-gait.blend)*(1-Math.exp(-dt*(target?24:18)));if(gait.blend<.002)gait.blend=0;}
export function motionRenderer(ctx,IMG,drawAt,shadow){
 function frame(meta,index,x,y,h,alpha=1,facing=1){const im=IMG[meta.key];if(!im?.naturalWidth)return;const scale=h/350;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(facing,1);ctx.drawImage(im,index%6*256,Math.floor(index/6)*384,256,384,-128*scale,-368*scale,256*scale,384*scale);ctx.restore();}
 return {
  actor(name,x,y,h,gait){const kind=name==='sp_xiaoman'?'girl':name==='sp_l5_boy'?'boy':'hero';if(['sp_xiaohe','sp_xiaoman','sp_xiaohe_greeting'].includes(name))name=name.replace('sp_','sp_l5_');shadow(x,y-1,h*.21,.12);const blend=gait?.blend||0;if(blend<1)drawAt(name,x,y,h,1-blend);if(blend>0){const meta=L5_MOTION[kind];const phase=gait.distance/(meta.stride*h/230);frame(meta,Math.floor(phase*24)%24,x,y,h,blend,gait.facing);}},
  raise(x,y,h,t){shadow(x,y-1,h*.21,.12);frame(L5_MOTION.hand,Math.min(23,Math.floor(Math.max(0,t)/1.25*24)),x,y,h);}
 };
}

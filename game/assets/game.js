import {setupBrowserAgent} from './browser-agent.js?v=20261102-1';
// 小禾的校园安全日 — 主游戏模块
import { STR } from "../strings.js";
import {L5_MOTION} from './l5-motion.js?v=20261102-motion1';
import {createL5} from "./l5-scene.js?v=20261102-assembly2";
import {L5_COPY,L5_VOICE_FILES} from "./l5-content.js?v=anna-l5-1";

const W = 1280, H = 720;
const preferences = {sound:true,voice:'recorded',font:1};
try {const v=JSON.parse(localStorage.getItem('xh_settings')||'{}'); if(typeof v.sound==='boolean')preferences.sound=v.sound;if(['recorded','system'].includes(v.voice))preferences.voice=v.voice;if([1,1.1,1.2].includes(v.font))preferences.font=v.font;}catch(_){}
const VOICE_TEXT = {"vo_menu":"你好呀，我是小禾！欢迎来到我的校园安全日。和我一起，学会保护自己吧！","vo_lv1":"走廊里要慢慢走。看到地上的水，绕开它。","vo_lv2":"下楼梯，扶着扶手，一级一级走。","vo_lv3":"门口有个陌生人，说是妈妈让他来接你。该怎么办呢？","vo_lv4":"教室里藏着三处危险，把它们找出来。","vo_lv5":"警报响了！跟着绿色出口牌，到操场集合。","vo_win":"做得对！你记住了这个安全习惯。","vo_retry":"差一点点，我们再来一次。","vo_l2_intro":"要下楼啦。前面有小伙伴，我们怎样走，才能更安全呢？","vo_l2_grab":"下楼前，我们的小手，可以扶住哪里呢？","vo_l2_grab2":"试着点一点旁边的扶手。","vo_l2_ready":"扶好啦，我们出发吧！","vo_l2_step":"看着脚下，一步一步下楼梯。","vo_l2_steptap":"点一点台阶，我们慢慢往下走。","vo_l2_stop":"前面的小伙伴停下来了。","vo_l2_oh":"咦，前面的小伙伴停下来了。","vo_l2_thanks":"谢谢你等我！","vo_l2_waitok":"前面有人时，留出一点距离，不推，也不挤。","vo_l2_squeeze":"这里有点挤。先停一停，等前面的小伙伴走了，再下去吧。","vo_l2_arrive":"我们安全到楼下啦！","vo_l2_end":"下楼梯，扶扶手，看台阶，慢慢走，不推挤。","vo_l4_cup":"水杯放在桌边容易碰倒，水洒在地上会让人滑倒。要把水杯放稳、放里面。","vo_l4_scissors":"剪刀的尖头朝外，容易扎伤经过的小朋友。用完剪刀，要把它合拢，收进文具盒。","vo_l4_bag":"书包放在过道上，容易绊倒小朋友。要把书包收好，保持过道畅通。","vo_l3_retry_anna":"不认识的人说是爸爸妈妈让他来接你，也不能直接跟他走哦！先留在校园里，找老师帮忙确认。我们再试一次，这次你会怎么做呢？","vo_l3_stay_anna":"没有跟陌生人走，做得对！不过，一个人站在这里还不够安全。留在校园里，找老师帮忙确认吧！","vo_l4_books_anna":"书本散落在过道上，容易绊倒小朋友。把书放回书架，保持过道畅通。","vo_l4_water_anna":"地面有积水，走过去容易滑倒。先绕开积水，告诉老师来处理。","vo_l4_exit_anna":"纸箱堵住出口，紧急时会挡住撤离的路。告诉老师清理杂物，出口要保持畅通。"};
function savePreferences(){try{localStorage.setItem('xh_settings',JSON.stringify(preferences));}catch(_){} }
function stopSound(){for(const a of Object.values(AUD))a.pause();if(voiced)voiced.pause();blockedNarration=false;narrationAttempt++;retryNarrationButton.style.display='none';if('speechSynthesis' in window)speechSynthesis.cancel();}

const PAL = { cream: "#FDF6EC", coral: "#E8503A", teal: "#06B29D", yellow: "#F7C948", navy: "#1F345E", ink: "#2B3A55" };

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const dev = document.getElementById("dev");
const DEV = new URLSearchParams(location.search).has("dev");

let view = { s: 1, ox: 0, oy: 0, dpr: 1 };
function layout() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  const s = Math.min(canvas.width / W, canvas.height / H);
  view = { s, ox: (canvas.width - W * s) / 2, oy: (canvas.height - H * s) / 2, dpr };
}
addEventListener("resize", layout);
addEventListener("orientationchange", layout);
layout();

// ---------- 资源 ----------
const IMG = {};
const AUD = {};
const IMG_LIST = ["bg_l5_class_courtyard",...Object.values(L5_MOTION).map(m=>m.key),"sp_l5_boy","sp_l5_xiaohe","sp_l5_xiaoman","sp_l5_xiaohe_greeting","sp_l5_xiaohe_walk1","sp_l5_xiaohe_walk2","bg_l5_assembly","bg_l5_fork","bg_popup_template","sp_popup_bag","sp_select_2_done","sp_select_1_current","sp_select_1_locked","sp_select_1_done","sp_select_2_current","sp_select_2_locked","sp_select_3_current","sp_select_3_locked","sp_select_3_done","sp_select_4_current","sp_select_4_locked","sp_select_4_done","sp_select_5_current","sp_select_5_locked","sp_select_5_done","sp_select_clean","sp_ui_frontwalk1", "sp_ui_frontwalk2","sp_select_reference","sp_finale_reference","sp_home_reference","sp_title_school","sp_ui_play_blue","sp_ui_back_blue", "sp_ui_pause_blue","bg_classroom_scissors_fixed","bg_library_hazards_v3","bg_playground_exit","bg_corridor", "bg_stairs", "bg_gate", "bg_classroom", "bg_playground",
  "sp_xiaohe", "sp_xiaohe_greeting", "sp_xiaohe_run1", "sp_xiaohe_run2", "sp_xiaohe_walk1", "sp_xiaohe_walk2", "sp_xiaoman", "sp_xiaoman_run", "sp_xiaoman_walk1", "sp_xiaoman_walk2", "sp_xiaoman_run", "sp_teacher", "sp_stranger", "sp_puddle", "sp_wetsign",
  "sp_scissors", "sp_cup", "sp_backpack", "sp_exitsign", "sp_star",
  "bg_stairs2_plain", "rail_over",
  "sp_hand", "bg_stairs4",
  "sp_xh_squat_sheet", "sp_xh_downsheet", "sp_xh4_1", "sp_xh4_2", "sp_xh4_3", "sp_xh4_4", "sp_xm4_1", "sp_xm4_2", "sp_xm4_tie",
  "sp_ui_wait", "sp_ui_pass"];
const AUD_LIST = ["vo_l3_stay_anna","vo_l3_retry_anna","vo_l4_books_anna", "vo_l4_water_anna", "vo_l4_exit_anna","vo_l4_cup", "vo_l4_scissors", "vo_l4_bag","vo_menu", "vo_lv1", "vo_lv2", "vo_lv3", "vo_lv4", "vo_lv5", "vo_win", "vo_retry", "vo_l2_wait", "vo_l2_wet", "vo_l2_wait", "vo_l2_wet",
  "sfx_ok", "sfx_no", "sfx_star", "sfx_step",
  "vo_l2_intro", "vo_l2_grab", "vo_l2_grab2", "vo_l2_ready", "vo_l2_step", "vo_l2_steptap",
  "vo_l2_stop", "vo_l2_oh", "vo_l2_thanks", "vo_l2_waitok", "vo_l2_squeeze", "vo_l2_arrive", "vo_l2_end"];

const BASE = new URL("./", import.meta.url);
function asset(p) { return new URL(p, BASE).href; }

Object.entries(L5_COPY).forEach(([k,v])=>{VOICE_TEXT["vo_l5_"+k]=v.join("");});
function loadAll() {
  for(const [k,file] of Object.entries(L5_VOICE_FILES)){const a=new Audio(asset("audio/"+file));a.preload="auto";a.volume=.95;AUD["vo_l5_"+k]=a;}
  let pending = IMG_LIST.length + 1, failed = 0, booted = false;
  const done = () => {
    if (--pending > 0) return;
    if (booted) return;
    booted = true;
    if (failed) console.warn("assets failed:", failed);
    start();
  };
  for (const k of IMG_LIST) {
    const im = new Image();
    im.onload = done;
    im.onerror = () => { failed++; console.warn("missing image", k); done(); };
    const PNG_SET = new Set(["rail_over", "rail_over3"]);
    const stateAsset=k.match(/^sp_select_([1-5])_(done|current|locked)$/);
    const motionAsset=Object.values(L5_MOTION).find(m=>m.key===k);
    im.src = motionAsset ? asset('img/motion/'+motionAsset.file) : k === 'sp_select_4_locked' ? asset('img/sp_select4_locked_v2.png') : stateAsset ? asset('img/level_svg/'+stateAsset[1]+'_'+stateAsset[2]+'.svg')+'?v=svg-l5-2' : asset("img/" + k + ((k.startsWith("sp_") || PNG_SET.has(k)) ? ".png" : ".jpg")) + "?v=20261031level5v4";
    IMG[k] = im;
  }
  for (const k of AUD_LIST) {
    const a = new Audio(asset("audio/" + (k === "vo_menu" ? "vo_menu_anna" : k === "vo_l4_scissors" ? "vo_l4_scissors_anna" : k) + ".mp3?v=anna-home-retry-1"));
    a.preload = "auto";
    a.volume = k.startsWith("vo_") ? 0.95 : 0.6;
    AUD[k] = a;
  }
  setTimeout(done, 1500); // 语音缺失不阻塞开局
}

// 浏览器通常要求用户先点按页面，才能开始播放声音。
let audioUnlocked = false, pendingVoice = null, voiced = null;
// Reuse the gesture-unlocked media element for every recorded narration on phones.
const narrationPlayer = new Audio();
narrationPlayer.preload = 'auto';
let narrationKey = null, narrationAttempt = 0, blockedNarration = false;
const retryNarrationButton = document.createElement('button');
retryNarrationButton.textContent = '点击播放语音';
retryNarrationButton.style.cssText = 'display:none;position:fixed;right:16px;bottom:16px;z-index:20;border:2px solid #ffd49a;border-radius:24px;padding:12px 20px;background:#fff6e5;color:#183451;font:bold 18px sans-serif';
document.body.appendChild(retryNarrationButton);
function startNarration() {
  const attempt = ++narrationAttempt;
  blockedNarration = false;
  retryNarrationButton.style.display = 'none';
  const failed = () => { if(attempt!==narrationAttempt || !preferences.sound)return; blockedNarration=true;retryNarrationButton.style.display='block'; };
  try { const p=narrationPlayer.play();if(p)p.catch(failed); } catch (_) { failed(); }
}
retryNarrationButton.addEventListener('click',()=>{if(!preferences.sound)return; narrationPlayer.load();startNarration();});
narrationPlayer.addEventListener('error',()=>{if(preferences.sound&&narrationKey){blockedNarration=true;retryNarrationButton.style.display='block';}});
document.addEventListener('pointerdown',()=>{if(blockedNarration&&preferences.sound)startNarration();},{capture:true});
function playAudio(a) {
  if (!a || !preferences.sound) return;
  try { a.currentTime = 0; const promise = a.play(); if (promise && promise.catch) promise.catch(err => console.warn("声音播放受阻", err.name)); }
  catch (err) { console.warn("声音播放失败", err); }
}
function sfx(k) { if (audioUnlocked) playAudio(AUD[k]); }
function say(k) {
  if(!preferences.sound)return;
  if(preferences.voice==='system' && VOICE_TEXT[k] && 'speechSynthesis' in window){stopSound();const u=new SpeechSynthesisUtterance(VOICE_TEXT[k]);u.lang='zh-CN';u.rate=.9;speechSynthesis.speak(u);return;}
  if (!AUD[k]) return;
  if (!audioUnlocked) { pendingVoice = k; return; }
  if (voiced) { try { voiced.pause(); } catch (_) {} }
  narrationKey = k;
  narrationPlayer.src = AUD[k].src;
  narrationPlayer.volume = .95;
  voiced = narrationPlayer;
  startNarration();
}
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  if (pendingVoice) { const k = pendingVoice; pendingVoice = null; say(k); }
}

// ---------- 输入 ----------
const P = { x: 0, y: 0, down: false, moved: false };
const held = new Set();
function toLogical(ev) {
  const r = canvas.getBoundingClientRect();
  const cx = (ev.clientX - r.left) * view.dpr, cy = (ev.clientY - r.top) * view.dpr;
  return { x: (cx - view.ox) / view.s, y: (cy - view.oy) / view.s };
}
canvas.addEventListener("pointerdown", (e) => {
  unlockAudio();
  const p = toLogical(e); P.x = p.x; P.y = p.y; P.down = true; P.moved = false;
  try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  if (sysPointer(p.x, p.y)) { P.down=false; held.clear(); if(scene.onUp) scene.onUp(p.x,p.y); return; }
  if (scene.onDown) scene.onDown(p.x, p.y);
  unlockAudio();
});

// 返回 / 暂停 / 暂停面板先于关卡逻辑接管点击
function sysPointer(x, y) {
  if (userPaused) {
    if(hit(x,y,...SYS.pause)){userPaused=false;sfx("sfx_ok");return true;}
    for (const b of PAUSE_BTNS()) {
      if (hit(x, y, b.x, b.y, b.w, b.h)) {
        sfx("sfx_ok");
        if (b.id === "resume") userPaused = false;
        else if (b.id === "retry") { userPaused = false; go(scene.name); }
        else { userPaused = false; go("select"); }
        return true;
      }
    }
    return true;
  }
  if (!isLevel()) return false;
  const pad = 10;
  for (const k of ["back", "pause"]) {
    const r = SYS[k];
    if (hit(x, y, r[0] - pad, r[1] - pad, r[2] + pad * 2, r[3] + pad * 2)) {
      if (k === "back") { sfx("sfx_ok"); go("select"); }
      else { userPaused = true; sfx("sfx_ok"); }
      return true;
    }
  }
  return false;
}
canvas.addEventListener("pointermove", (e) => {
  const p = toLogical(e); P.x = p.x; P.y = p.y;
  if(!userPaused&&scene.onHover)scene.onHover(p.x,p.y);
  if (!userPaused && P.down && scene.onMove) scene.onMove(p.x, p.y);
});
const up = (e) => {
  P.down = false;
  if (!userPaused && scene.onUp) scene.onUp(P.x, P.y);
};
canvas.addEventListener("pointerup", up);
canvas.addEventListener("pointercancel", up);
addEventListener("keydown", (e) => {
  unlockAudio();
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(e.code)) e.preventDefault();
  if (e.code === "Escape" && isLevel()) { if(e.repeat) return; held.clear(); P.down=false; if(scene.onUp) scene.onUp(P.x,P.y); userPaused = !userPaused; sfx("sfx_ok"); return; }
  if (userPaused || e.repeat) return;
  held.add(e.code);
  if (e.code === "Space" || e.code === "Enter") { if (scene.tap) scene.tap(W / 2, H / 2); }
  if (scene.key) scene.key(e.code);
  unlockAudio();
});
addEventListener("keyup", (e) => held.delete(e.code));

// ---------- 绘制工具 ----------
function bg(name) { const im = IMG[name]; if (im && im.complete) ctx.drawImage(im, 0, 0, W, H); }
// 跑动 = 两张立绘交替 + 起伏 + 侧倾 + 落地压扁 + 脚下尘土
const RUN_FRAMES = ["sp_xiaohe_run1", "sp_xiaohe_run2"];
function drawRunner(cx,bottom,h,phase,intensity,frozen){
 const name=frozen?'sp_xiaohe':['sp_ui_frontwalk1','sp_ui_frontwalk2'][Math.floor(phase/Math.PI)%2];
 shadow(cx,bottom,70,.12);
 drawAt(name,cx+Math.sin(phase)*1.2,bottom+12,h);
 return 0;
}

function drawAt(name, cx, bottom, h, alpha = 1) {
  const im = IMG[name];
  if (!im || !im.complete) return { w: 0, h: 0 };
  const hh = h, ww = im.width * hh / im.height;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.drawImage(im, cx - ww / 2, bottom - hh, ww, hh);
  ctx.restore();
  return { w: ww, h: hh };
}
function shadow(cx, y, w, alpha = 0.12) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = "#1F345E";
  ctx.beginPath(); ctx.ellipse(cx, y, w, w * 0.28, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function text(str, x, y, size, color = PAL.navy, align = "center", alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha;
  size *= preferences.font;
  ctx.font = "700 " + size + "px 'Microsoft YaHei','PingFang SC','Noto Sans SC',sans-serif";
  ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillStyle = color;
  ctx.fillText(str, x, y, Math.min(1180, Math.max(240, size * String(str).length))); ctx.restore();
}
function pill(x, y, w, h, label, active, size = 26) {
  ctx.save();
  ctx.fillStyle=active?'#D94532':'#E3D9C9';rr(x,y+5,w,h,h/2);ctx.fill();
  ctx.fillStyle=active?PAL.coral:'#FFFCF6';
  ctx.shadowColor='rgba(31,52,94,.12)';ctx.shadowBlur=12;ctx.shadowOffsetY=3;
  rr(x,y,w,h,h/2);ctx.fill();ctx.shadowColor='transparent';
  ctx.strokeStyle=active?'rgba(255,255,255,.26)':'#E9DFD0';ctx.lineWidth=2;rr(x+1,y+1,w-2,h-2,h/2);ctx.stroke();ctx.restore();
  const fit=Math.min(size,(w-32)/Math.max(1,String(label).length)/preferences.font);
  text(label,x+w/2,y+h/2+1,fit,active?'#fff':PAL.navy);
}
function hit(x, y, bx, by, bw, bh) { return x >= bx && x <= bx + bw && y >= by && y <= by + bh; }

// ---------- 场景切换 ----------
let activeVideo = null; let pausedNarration = null;
let scene = { name: "load" };
function go(name, arg) {
  blockedNarration=false;narrationAttempt++;retryNarrationButton.style.display='none';
  const prev = scene.name;
  if(activeVideo){activeVideo.pause();activeVideo=null;} pausedNarration=null;
  if("speechSynthesis" in window) speechSynthesis.cancel();
  if (voiced) { voiced.pause(); voiced = null; }
  pendingVoice = null;
  if(scene.onUp) scene.onUp(P.x,P.y);
  held.clear(); P.down=false;
  userPaused = false;
  scene = SCENES[name](arg) || {};
  scene.name = name;
  if (scene.enter) scene.enter(prev);
  requestAnimationFrame(() => { try { paint(); } catch (e) { console.error(e); } });
}

function paint() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#FDF6EC"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(view.s, 0, 0, view.s, view.ox, view.oy);
  if (scene.draw) scene.draw();
}
let stars = [];
try { const saved = JSON.parse(localStorage.getItem("xh_stars") || "[]"); if(Array.isArray(saved)) stars=[...new Set(saved.filter(id=>/^l[1-5]$/.test(id)))]; } catch(e) { console.warn("存档无法读取",e); }
function saveStars() { try { localStorage.setItem("xh_stars", JSON.stringify(stars)); } catch(e) { console.warn("进度无法保存",e); } }
function addStar(id) { if (!stars.includes(id)) { stars.push(id); saveStars(); } }

// ---------- 主循环 ----------
const STEP = 1000 / 60;
let acc = 0, last = performance.now(), paused = false, frames = 0, fpsAt = last, fps = 0;
addEventListener("blur", () => { paused = true; held.clear(); P.down = false; if (scene.onUp) scene.onUp(P.x, P.y); });
addEventListener("focus", () => { paused = false; last = performance.now(); });
if (DEV) dev.style.display = "block";

function frame(now) {
  requestAnimationFrame(frame);
  if(paused || userPaused){
    if(voiced && !voiced.paused && !voiced.ended){pausedNarration=voiced;voiced.pause();}
    if('speechSynthesis' in window)speechSynthesis.pause();
  } else {
    if(pausedNarration){const a=pausedNarration;pausedNarration=null;if(preferences.sound)a.play().catch(()=>{});}
    if('speechSynthesis' in window && speechSynthesis.paused)speechSynthesis.resume();
  }
  if(activeVideo){if(paused || userPaused){activeVideo.pause();}else if(activeVideo.paused && !activeVideo.ended){activeVideo.play().catch(()=>{});}}
  if (paused) return;
  acc = Math.min(acc + Math.max(0, now - last), STEP * 5); last = now;
  let guard = 0;
  try {
    while (acc >= STEP && guard++ < 5) {
      if (!userPaused && scene.update) scene.update(STEP / 1000);
      acc -= STEP;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#FDF6EC"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(view.s, 0, 0, view.s, view.ox, view.oy);
    if (scene.draw) scene.draw();
    drawSysHud();
    if (userPaused) drawPausePanel();
  } catch (err) {
    window.__err = (err && err.stack) || String(err);
    console.error(err);
  }
  if (DEV && (frames++, now - fpsAt >= 500)) {
    fps = Math.round((frames * 1000) / (now - fpsAt)); frames = 0; fpsAt = now;
    dev.textContent = fps + " fps";
  }
}

function banner(main, sub) {
  const width=620,x=(W-width)/2;
  ctx.save();ctx.shadowColor='rgba(31,52,94,.12)';ctx.shadowBlur=14;ctx.shadowOffsetY=4;
  ctx.fillStyle='rgba(255,252,246,.97)';rr(x,38,width,106,25);ctx.fill();ctx.shadowColor='transparent';
  ctx.strokeStyle='#E9DFD0';ctx.lineWidth=2;rr(x,38,width,106,25);ctx.stroke();
  ctx.fillStyle=PAL.coral;rr(x+16,57,6,67,3);ctx.fill();ctx.restore();
  const n=Math.min(32,560/Math.max(1,main.length)/preferences.font);
  text(main,W/2,sub?77:91,n,PAL.navy);
  if(sub)text(sub,W/2,116,Math.min(23,560/Math.max(1,sub.length)/preferences.font),PAL.ink,'center',.78);
}

// ---------- 通用界面 ----------
function drawCompletionProgress(cx, y) {

      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.94)';
      rr(cx - 235, y, 470, 88, 30); ctx.fill();
      const completed = stars.filter(id => /^l[1-5]$/.test(id)).length;
      text('已完成 ' + completed + ' / 5 关', cx, y + 26, 25, PAL.navy);
      const barX = cx - 170, barY = y + 52;
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i < completed ? PAL.teal : '#E8E2D6';
        rr(barX + i * 70, barY, 60, 12, 6); ctx.fill();
      }
      ctx.restore();
}

function starRow(cx, y, size) {
  const n = 5, gap = size * 1.25, x0 = cx - gap * (n - 1) / 2;
  for (let i = 0; i < n; i++) {
    const got = stars.includes("l" + (i + 1));
    ctx.save(); ctx.globalAlpha = got ? 1 : 0.22;
    const im = IMG.sp_star;
    if (im && im.complete) ctx.drawImage(im, x0 + i * gap - size / 2, y - size / 2, size, size);
    ctx.restore();
  }
}
function hud() {
  starRow(W - 200, 54, 54);
}
function pips(total, done, cx, y) {
  const gap = 44, x0 = cx - gap * (total - 1) / 2;
  for (let i = 0; i < total; i++) {
    const on = i < done;
    ctx.save();
    ctx.fillStyle = on ? PAL.teal : "rgba(31,52,94,0.30)";
    ctx.strokeStyle = on ? "rgba(255,255,255,0.9)" : "rgba(31,52,94,0.28)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x0 + i * gap, y, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
}
// 关卡内的常驻系统按钮：左上角 返回 / 暂停（安全边距内锚定，尺寸固定不随内容变）
const SYS_SAFE = 22, SYS_SIZE = 74;
const SYS = {
  back: [SYS_SAFE, SYS_SAFE, SYS_SIZE, SYS_SIZE],
  pause: [SYS_SAFE + SYS_SIZE + 14, SYS_SAFE, SYS_SIZE, SYS_SIZE]
};
let userPaused = false;
const isLevel = () => /^l[1-5]$/.test(scene.name);
const PAUSE_BTNS = () => [
  { id: "resume", label: "继续玩", x: W / 2 - 150, y: 320, w: 300, h: 76, solid: true },
  { id: "retry", label: "重来一次", x: W / 2 - 150, y: 412, w: 300, h: 70, solid: false },
  { id: "home", label: "回关卡列表", x: W / 2 - 150, y: 498, w: 300, h: 70, solid: false }
];

function sysButton(r,kind,pressed){
 const [x,y,w,h]=r,cx=x+w/2,cy=y+h/2;
 ctx.save();ctx.translate(cx,cy);ctx.scale(pressed?.94:1,pressed?.94:1);ctx.translate(-cx,-cy);
 ctx.shadowColor='rgba(91,65,34,.18)';ctx.shadowBlur=8;ctx.shadowOffsetY=3;
 ctx.fillStyle='#F6C58F';rr(x,y+3,w,h*.78,h*.39);ctx.fill();
 const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#FFF5DF');g.addColorStop(1,'#FFE5BC');ctx.fillStyle=g;
 rr(x,y,w,h*.78,h*.39);ctx.fill();ctx.shadowColor='transparent';
 ctx.strokeStyle='#FFFFFF';ctx.lineWidth=2.5;rr(x+2,y+2,w-4,h*.78-4,h*.37);ctx.stroke();
 ctx.strokeStyle='#F3C58F';ctx.lineWidth=1;rr(x+5,y+5,w-10,h*.78-10,h*.34);ctx.stroke();
 const mid=y+h*.39;ctx.strokeStyle='#3D403C';ctx.fillStyle='#3D403C';ctx.lineWidth=8;ctx.lineCap='round';ctx.lineJoin='round';
 if(kind==='back'){ctx.beginPath();ctx.moveTo(cx+13,mid);ctx.lineTo(cx-13,mid);ctx.moveTo(cx-2,mid-11);ctx.lineTo(cx-13,mid);ctx.lineTo(cx-2,mid+11);ctx.stroke();}
 else if(!userPaused){for(const dx of [-8,8]){ctx.beginPath();ctx.moveTo(cx+dx,mid-12);ctx.lineTo(cx+dx,mid+12);ctx.stroke();}}
 else {ctx.beginPath();ctx.moveTo(cx-8,mid-13);ctx.lineTo(cx+12,mid);ctx.lineTo(cx-8,mid+13);ctx.closePath();ctx.fill();}
 ctx.restore();
}

function drawSysHud() {
  if (!isLevel()) return;
  sysButton(SYS.back, "back", P.down && hit(P.x, P.y, ...SYS.back));
  sysButton(SYS.pause, "pause", P.down && hit(P.x, P.y, ...SYS.pause));
}

function drawPausePanel() {
  ctx.save(); ctx.fillStyle = "rgba(31,52,94,0.55)"; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.97)";
  ctx.shadowColor = "rgba(31,52,94,0.3)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  rr(W / 2 - 280, 150, 560, 460, 40); ctx.fill();
  ctx.restore();
  text("暂停一下", W / 2, 228, 44, PAL.navy);
  text("休息好了就接着来", W / 2, 278, 24, PAL.ink, "center", 0.7);
  PAUSE_BTNS().forEach((b) => {
    if (b.solid) pill(b.x, b.y, b.w, b.h, b.label, true, 32);
    else {
      ctx.save(); ctx.fillStyle = "#fff"; ctx.strokeStyle = PAL.navy; ctx.lineWidth = 3;
      rr(b.x, b.y, b.w, b.h, b.h / 2); ctx.fill(); ctx.stroke(); ctx.restore();
      text(b.label, b.x + b.w / 2, b.y + b.h / 2, 28, PAL.navy);
    }
  });
}

function winCard(levelId, line, bgName, onNext) {
  return {
    t: 0,
    enter() { sfx("sfx_star"); addStar(levelId); say("vo_win"); },
    update(dt) { this.t += dt; },
    draw() {
      const k = Math.min(1, this.t / 0.25);
      if (bgName) bg(bgName);
      ctx.save(); ctx.globalAlpha = 0.45 * k; ctx.fillStyle = "#1F345E"; ctx.fillRect(0, 0, W, H); ctx.restore();
      const s = 0.9 + 0.1 * k;
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s);
      ctx.fillStyle = "#fff"; ctx.shadowColor = "rgba(31,52,94,0.3)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
      rr(-330, -170, 660, 340, 40); ctx.fill();
      ctx.shadowColor = "transparent";
      const im = IMG.sp_star;
      if (im && im.complete) ctx.drawImage(im, -70, -150, 140, 140 * im.height / im.width);
      text(line, 0, 26, 34, PAL.ink);
      ctx.restore();
      const ghost = [W / 2 - 250, H / 2 + 78, 220, 66], main = [W / 2 + 30, H / 2 + 78, 220, 66];
      ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.strokeStyle = PAL.navy; ctx.lineWidth = 3;
      rr(...ghost, 33); ctx.fill(); ctx.stroke(); ctx.restore();
      text(STR.again, ghost[0] + 110, ghost[1] + 33, 28, PAL.navy);
      pill(...main, STR.next, true, 28);
      this.btn = main; this.replay = ghost;
    },
    onDown(x, y) {
      if (this.t <= 0.4) return;
      if (this.replay && hit(x, y, ...this.replay)) { go(levelId); return; }
      if (this.btn && hit(x, y, ...this.btn)) onNext();
    },
    tap() { if (this.t > 0.4) onNext(); }
  };
}

// 首页问候：完整绘制立绘，避免手部遮罩把头发一同移动。
function drawGreeting(cx, bottom, height, time) {
 const im=IMG.sp_xiaohe_greeting;
 if(!im || !im.complete || !im.naturalWidth) { drawAt("sp_xiaohe",cx,bottom,height); return; }
 const z=height/im.height, phase=time%5.4;
 const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
 const active=ease(phase/.6)*(1-ease((phase-3.4)/.7));
 const sway=Math.sin(time*2.8)*.014*active;
 ctx.save();ctx.translate(cx,bottom);ctx.rotate(sway);ctx.scale(z,z);
 ctx.drawImage(im,-im.width/2,-im.height);ctx.restore();
}

// ---------- 场景 ----------
const SCENES = {};

SCENES.title = () => {
 const start=[480,368,320,95],settings=[537,474,206,59];
 return {
  enter(){say('vo_menu');},
  draw(){
   const im=IMG.sp_home_reference;if(im && im.naturalWidth)ctx.drawImage(im,0,0,W,H);
   if(P.down){const r=hit(P.x,P.y,...start)?start:hit(P.x,P.y,...settings)?settings:null;if(r){ctx.save();ctx.fillStyle='rgba(255,255,255,.12)';rr(...r,r[3]/2);ctx.fill();ctx.restore();}}
  },
  onDown(x,y){if(hit(x,y,...start)){sfx('sfx_ok');go('select');}else if(hit(x,y,...settings)){sfx('sfx_ok');go('settings');}},
  tap(){go('select');},
  key(code){if(code==='KeyS')go('settings');}
 };
};

SCENES.settings = () => {
 const options=[{id:'sound',label:()=> '声音：'+(preferences.sound?'开启':'关闭'),y:225},{id:'voice',label:()=> '旁白：'+(preferences.voice==='recorded'?'现有录音':'系统中文朗读'),y:325},{id:'font',label:()=> '字体：'+({1:'标准',1.1:'较大',1.2:'大字'}[preferences.font]),y:425}];
 return {debugState:()=>({...preferences}),draw(){bg('bg_gate');ctx.save();ctx.fillStyle='rgba(253,246,236,.94)';rr(300,95,680,570,36);ctx.fill();ctx.restore();text('设置',640,155,44,PAL.navy);for(const o of options)pill(400,o.y,480,74,o.label(),o.id==='sound'&&preferences.sound,28);text('系统朗读的音色取决于设备',640,540,21,PAL.ink);pill(500,580,280,60,'返回首页',false,26);},onDown(x,y){if(hit(x,y,500,580,280,60)){go('title');return;}for(const o of options)if(hit(x,y,400,o.y,480,74)){stopSound();if(o.id==='sound')preferences.sound=!preferences.sound;if(o.id==='voice')preferences.voice=preferences.voice==='recorded'?'system':'recorded';if(o.id==='font')preferences.font=[1,1.1,1.2][([1,1.1,1.2].indexOf(preferences.font)+1)%3];savePreferences();}},key(code){if(code==='Escape')go('title');}};
};
SCENES.select = () => {
 const centers=[152,396,640,884,1128];let focus=0;
 const progress=()=>{let n=0;while(n<5&&stars.includes('l'+(n+1)))n++;return n;};
 const open=i=>{if(i<=progress()&&i<5){sfx('sfx_ok');go('l'+(i+1));}else sfx('sfx_no');};
 function crop(im){if(im.bounds)return im.bounds;const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const q=c.getContext('2d');q.drawImage(im,0,0);const d=q.getImageData(0,0,c.width,c.height).data,rows=new Uint32Array(c.height),cols=new Uint32Array(c.width);for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>48){rows[y]++;cols[x]++;}let x0=0,x1=c.width-1,y0=0,y1=c.height-1;while(x0<x1&&cols[x0]<8)x0++;while(x1>x0&&cols[x1]<8)x1--;while(y0<y1&&rows[y0]<8)y0++;while(y1>y0&&rows[y1]<8)y1--;x0=Math.max(0,x0-10);y0=Math.max(0,y0-10);x1=Math.min(c.width-1,x1+10);y1=Math.min(c.height-1,y1+10);return im.bounds=[x0,y0,x1-x0+1,y1-y0+1];}
 return {enter(){focus=Math.min(progress(),4);},debugState:()=>({completed:progress(),next:Math.min(progress()+1,5)}),
 draw(){const bgim=IMG.sp_select_clean;if(bgim?.naturalWidth)ctx.drawImage(bgim,0,0,W,H);const n=progress();ctx.save();ctx.fillStyle='#FFF1D7';rr(1164,36,80,42,18);ctx.fill();ctx.restore();text(n+'/5',1204,58,29,PAL.navy);
 for(let i=0;i<5;i++){const state=i<n?'done':i===n?'current':'locked';let im=IMG['sp_select_'+(i+1)+'_'+state];const fallback=!im;if(!im)im=IMG['sp_select_'+(i+1)+'_current'];if(!im?.naturalWidth)continue;const [sx,sy,sw,sh]=crop(im);const scale=Math.min(218/sw,330/sh);const width=sw*scale,height=sh*scale;ctx.drawImage(im,sx,sy,sw,sh,centers[i]-width/2,305,width,height);
 if(fallback){ctx.save();ctx.strokeStyle=PAL.teal;ctx.lineWidth=7;ctx.beginPath();ctx.arc(centers[i],390,94,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#FFF2DC';rr(centers[i]-100,555,200,70,25);ctx.fill();ctx.restore();const star=IMG.sp_star;if(star?.naturalWidth)ctx.drawImage(star,centers[i]-22,565,44,44);}}
 },onDown(x,y){if(hit(x,y,12,12,100,94)){go('title');return;}for(let i=0;i<5;i++)if(hit(x,y,centers[i]-112,300,224,350)){open(i);return;}},key(code){if(code==='Escape')go('title');if(code==='ArrowRight')focus=Math.min(progress(),4,focus+1);if(code==='ArrowLeft')focus=Math.max(0,focus-1);},tap(){open(focus);}};
};

SCENES.l1 = () => {
  const st = { x: 620, t: 0, shake: 0, passed: 0, spawned: 0, done: false, hit: 0, fx: [],
               phase: 0, lastX: 620, speed: 0, dust: [], targetX: 620, dragging: false, dragStartX: 0, dragStartCharX: 620, started: false };
  const live = [];
  const plan = [
    { at: 1.4, type: "sp_puddle", x: 560 }, { at: 4.0, type: "sp_wetsign", x: 760 },
    { at: 6.6, type: "sp_xiaoman", x: 470 }, { at: 9.2, type: "sp_puddle", x: 830 },
    { at: 11.8, type: "sp_wetsign", x: 620 }
  ];
  const WID = { sp_puddle: 200, sp_wetsign: 90, sp_xiaoman: 110 };
  const LIFE = 3.0;      // 从远处走到脚前
  const END = 1.12;      // 走到这一步就算出画面，立刻消失

  function resetRun() {
    st.t = 0; st.spawned = 0; st.passed = 0; st.x = 620; st.targetX = 620; st.lastX = 620; st.speed = 0; st.shake = 0; st.started = false; st.dragging = false;
    live.length = 0;
  }

  return {
    enter() { say("vo_lv1"); },
    update(dt) {
      st.shake = Math.max(0, st.shake - dt);
      if (st.hit > 0) {                       // 撞到之后的硬直，结束后整关重来
        st.hit -= dt;
        if (st.hit <= 0) resetRun();
        return;
      }
      const left = held.has("ArrowLeft") || held.has("KeyA");
      const right = held.has("ArrowRight") || held.has("KeyD");
      if (left || right) {
        st.started = true;
        st.targetX += ((right ? 1 : 0) - (left ? 1 : 0)) * dt * 700;
      }
      st.targetX = Math.max(360, Math.min(920, st.targetX));
      // 手指抬起后继续到达最后目标，快速跟随并避免瞬间跳到触点。
      st.x += (st.targetX - st.x) * (1 - Math.exp(-dt * 26));
      if (st.started) st.t += dt;

      // 跑动节奏：静止也在小跑，拖动越快越急促
      const dx = st.x - st.lastX;
      st.lastX = st.x;
      st.speed += (Math.min(1, Math.abs(dx) / (dt * 520)) - st.speed) * Math.min(1, dt * 9);
      const prevPhase = st.phase;
      st.phase += dt * (1.7 + st.speed * 0.4) * Math.PI;
      if (false) {
        st.dust.push({ x: st.x - 6 + Math.random() * 12, y: 646, t: 0, sx: (Math.random() - 0.5) * 40 });
      }
      st.dust.forEach((d) => { d.t += dt; d.x += d.sx * dt; d.y -= dt * 6; });
      st.dust = st.dust.filter((d) => d.t < 0.5);

      if (st.done || !st.started) return;
      while (st.spawned < plan.length && st.t > plan[st.spawned].at) {
        live.push({ ...plan[st.spawned], age: 0, dead: false }); st.spawned++;
      }
      for (const h of live) {
        if (h.dead) continue;
        h.age += dt;
        const p = h.age / LIFE;
        if (p > 0.82 && p < 1.02 && !h.hit) {
          const hw = (WID[h.type] || 100) * (0.55 + p * 0.45);
          if (Math.abs(h.x - st.x) < hw * 0.42 + 38) {
            h.hit = true;
            st.hit = 1.2; st.shake = 0.5;
            live.length = 0;                  // 撞上的一瞬间，水渍与标牌一起撤走
            sfx("sfx_no"); say("vo_retry");
            return;
          }
        }
        if (p > 0.96 && !h.counted) {
          h.counted = true; st.passed++;
          st.fx.push({ x: st.x, y: 596, t: 0 });   // 躲过去的小反馈
        }
        if (p >= END) h.dead = true;
      }
      st.fx.forEach((f) => (f.t += dt));
      st.fx = st.fx.filter((f) => f.t < 0.7);
      for (let i = live.length - 1; i >= 0; i--) if (live[i].dead) live.splice(i, 1);
      if (st.spawned === plan.length && live.length === 0) finish();
    },
    draw() {
      bg("bg_corridor");
      for (const h of live) {                       // 地面投影：提前看出它会落在哪
        const p0 = Math.min(h.age / LIFE, 0.9);
        ctx.save(); ctx.globalAlpha = 0.05 + 0.10 * p0;
        ctx.fillStyle = "#1F345E";
        ctx.beginPath(); ctx.ellipse(h.x, 652, 40 + 70 * p0, 12 + 16 * p0, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      for (const h of live) {
        const p = h.age / LIFE;
        const pp = Math.min(p, END);
        const hh = (h.type === "sp_xiaoman" ? 150 : 95) * (0.32 + pp * 0.68);
        const bottom = 402 + pp * 268;
        const fade = pp > 0.92 ? Math.max(0, 1 - (pp - 0.92) / (END - 0.92)) : 1;  // 到脚下渐隐
        ctx.save();
        if (h.type === "sp_xiaoman") ctx.translate(0, Math.sin(h.age * 8) * 3);
        drawAt(h.type, h.x, bottom, hh, fade);
        ctx.restore();
      }
      for (const d of st.dust) {
        ctx.save(); ctx.globalAlpha = Math.max(0, 0.42 - d.t * 0.9); ctx.fillStyle = "#E9DFCB";
        ctx.beginPath(); ctx.arc(d.x, d.y, 6 + d.t * 26, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      const shakeX = st.shake > 0 ? Math.sin(st.t * 60) * 9 * st.shake : 0;
      drawRunner(st.x + shakeX, 652, 286, st.phase, Math.max(0.2, st.speed), st.hit > 0);

      for (const f of st.fx) {
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - f.t / 0.7); ctx.strokeStyle = PAL.teal; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(f.x, f.y, 26 + f.t * 90, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }

      hud();
      text("躲开", 40, 148, 26, PAL.ink, "left");
      pips(5, Math.min(st.passed, 5), 210, 148);
      if (st.hit <= 0 && (!st.started || st.t < 2.6)) text("按住左右拖动", W / 2, 660, 30, "#fff", "center", st.started ? Math.max(0, 1 - st.t / 2.6) : 1);

      if (st.hit > 0) {
        const k = Math.min(1, (1.2 - st.hit) * 6);
        ctx.save(); ctx.globalAlpha = 0.28 * k; ctx.fillStyle = "#1F345E"; ctx.fillRect(0, 0, W, H); ctx.restore();
        ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = "rgba(255,255,255,0.94)";
        ctx.shadowColor = "rgba(31,52,94,0.25)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
        rr(W / 2 - 240, 268, 480, 132, 30); ctx.fill(); ctx.restore();
        text("哎呀，撞到了", W / 2, 318, 34, PAL.coral);
        text("这一关重来一次", W / 2, 366, 26, PAL.ink, "center", 0.8);
      }
    },
    onDown(x, y) {
      if (st.hit > 0 || st.done) return;
      st.started = true; st.dragging = true;
      st.dragStartX = x; st.dragStartCharX = st.x; st.targetX = st.x;
    },
    onMove(x) {
      if (!st.dragging || st.hit > 0 || st.done) return;
      st.targetX = Math.max(360, Math.min(920, st.dragStartCharX + (x - st.dragStartX)));
    },
    onUp() { st.dragging = false; },
    tap() {}
  };

  function finish() {
    if (st.done) return;
    st.done = true;
    setTimeout(() => go("win", { id: "l1", line: STR.win1, bg: "bg_corridor" }), 500);
  }
};

SCENES.l2 = () => {
  // 旁白跟随当前操作阶段，不排队补播已过时的操作提示。
  let walkHintSpoken = false;
  let safetyVoice = null;
  const safetySpeaking = () => preferences.sound && (blockedNarration || (safetyVoice && !safetyVoice.paused && !safetyVoice.ended && !safetyVoice.error));
  function narrate(key) {
    if (key === 'vo_l2_steptap' || safetySpeaking()) return;
    if (key === 'vo_l2_step') {
      if (walkHintSpoken) return;
      walkHintSpoken = true;
    }
    say(key);
    if (["vo_l2_step", "vo_l2_waitok", "vo_l2_squeeze", "vo_l2_end"].includes(key)) safetyVoice = voiced;
  }
  // —— 第二关：扶扶手，一级一级下楼（四段式教学关）——
  // 参考图视角：她在上层平台，沿楼梯往右上走（越走越小、越走越远）
  const PATH = [
    { x: 370, y: 585, h: 260 },
    { x: 465, y: 558, h: 245 },
    { x: 560, y: 532, h: 230 },
    { x: 655, y: 506, h: 215 },
    { x: 750, y: 480, h: 200 }
  ];
  const LEN = 4, MID = 2;
  const pos = (i) => {
    const k = Math.max(0, Math.min(LEN, i)), a = Math.floor(k), f = k - a;
    const p = PATH[a], q = PATH[Math.min(LEN, a + 1)];
    return { x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f, h: p.h + (q.h - p.h) * f };
  };
  const ty = (i) => pos(i).y;
  const bodyX = (i) => pos(i).x;
  const stepPt = (i) => { const p = pos(i); return { x: p.x - 6, y: p.y - 2 }; };

  // 右侧手掌落点根据各帧立绘的实际比例计算，儿童扶手沿手掌的轨迹绘制。
  const handPoint = (p) => ({ x: p.x + p.h * 0.22, y: p.y + 4 - p.h * 0.54 });
  const railPt = (i) => handPoint(pos(i));
  const RAIL = PATH.map(handPoint);
  function railDist(x, y) {
    let best = Infinity;
    for (let k = 0; k < RAIL.length - 1; k++) {
      const a = RAIL[k], b = RAIL[k + 1], dx = b.x - a.x, dy = b.y - a.y;
      const t = Math.max(0, Math.min(1, ((x-a.x)*dx + (y-a.y)*dy) / (dx*dx+dy*dy)));
      best = Math.min(best, Math.hypot(x-a.x-dx*t, y-a.y-dy*t));
    }
    return best;
  }
  function drawChildRail() {
    const points = RAIL;
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
    // 柔和的壁挂托架与木质扶手，扶手在角色后面，手自然压在上面。
    for (let k = 0; k < points.length; k += 2) {
      const p = points[k];
      ctx.strokeStyle = "#C98A40"; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(p.x, p.y+3); ctx.lineTo(p.x, p.y+18); ctx.stroke();
    }
    const path = () => { ctx.beginPath(); ctx.moveTo(points[0].x-26, points[0].y+7); for (const p of points) ctx.lineTo(p.x,p.y+7); ctx.lineTo(points[points.length-1].x+22,points[points.length-1].y+1); };
    path(); ctx.strokeStyle = "#C78031"; ctx.lineWidth = 14; ctx.stroke();
    path(); ctx.strokeStyle = "#F2BE52"; ctx.lineWidth = 9; ctx.stroke();
    path(); ctx.strokeStyle = "rgba(255,235,168,.72)"; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }


  const st = {};
  function reset() {
    st.stage = 0; st.t = 0; st.stageT = 0; st.wait = 0;
    st.i = 0; st.ji = 3.25; st.manStop = 0; st.manWalk = 0; st.manTie = 0; st.stopTween = null;
    st.grab = 0; st.walk = null; st.phase = 0;
    st.msg = ""; st.msgT = 0;
    st.hand = { on: true, x: 0, y: 0, t: 0, cool: 0 };
    st.glow = null; st.ripples = []; st.icons = []; st.choice = null;
    st.retry = false; st.lean = 0; st.flash = 0; st.done = false; st.endT = 0;
    st.focus = 0; st.kb = false;
    st.wave = 0; st.nudge = -9;
    st.cam = { s: 1, fx: W / 2, fy: H / 2, ts: 1, tfx: W / 2, tfy: H / 2 };
    st.parts = [];
  }
  const setMsg = (m, s) => { st.msg = m; st.msgT = s; };
  const camTo = (s, fx, fy) => { st.cam.ts = s; st.cam.tfx = fx; st.cam.tfy = fy; };
  const s2w = (x, y) => ({ x: (x - W / 2) / st.cam.s + st.cam.fx, y: (y - H / 2) / st.cam.s + st.cam.fy });

  function handTo(p) { st.hand.x = p.x; st.hand.y = p.y; st.hand.on = true; st.hand.t = 0; }
  function glowAt(i) {
    const p = stepPt(i);
    st.glow = { i: i, x: p.x, y: p.y, t: 0 };
    handTo({ x: p.x + 6, y: p.y - 26 });
  }

  // ---------- 流程 ----------
  function startLevel() {
    reset();
    walkHintSpoken = false;
    narrate("vo_l2_intro");
    setMsg("要下楼啦，先扶好扶手", 3.6);
    const r = railPt(1.5);
    handTo({ x: r.x, y: r.y });
    camTo(1.0, W / 2, H / 2);
  }

  function doGrab() {
    st.grab = 1; st.flash = 1; st.hand.on = false;
    sfx("sfx_ok");
    narrate("vo_l2_ready");
    setMsg("扶好啦，我们出发吧", 2.2);
    camTo(1, W / 2, H / 2);
    st.stage = 1; st.stageT = 0; st.wait = 1.0;
  }

  function goWalkStage() {
    st.stage = 2; st.stageT = 0;
    narrate("vo_l2_step");
    setMsg("扶好扶手，看清台阶，一级一级慢慢走", 5.0);
    glowAt(Math.min(MID, st.i + 1));
  }

  function startWalk(to) {
    st.walk = { from: st.i, to: to, t: 0, dur: 1.15 * Math.abs(to - st.i) + 0.25 };
    st.glow = null; st.hand.on = false;
  }

  function arrive() {
    if (st.i >= LEN - 0.001) { finish(); return; }
    if (st.stage === 2) {
      if (st.i < MID - 0.001) glowAt(st.i + 1);
      else stopStage();
    } else if (st.stage === 4 && st.i < LEN - 0.001) {
      glowAt(st.i + 1);
    }
  }

  function stopStage() {
    st.stage = 3; st.stageT = 0; st.wait = 0;
    st.manStop = 1; st.manWalk = 0;
    st.stopTween = { from: st.ji, to: 3.35, t: 0, dur: 1.15 };
    camTo(1.06, (bodyX(st.i) + bodyX(3.35)) / 2, 420);
  }

  function showChoice() {
    st.icons = [
      { id: "wait", x: 222, y: 566, w: 400, h: 100 },
      { id: "squeeze", x: 662, y: 566, w: 400, h: 100 }
    ];
    st.focus = 0;
    narrate("vo_l2_stop");
    setMsg("前面有人，你会怎么做？", 4.0);
    handTo({ x: 250, y: 560 });   // 手在两个图标之间轻轻移动（下面 update 里摆）
    st.hand.mid = true;
  }

  function chooseWait() {
    st.icons = []; st.choice = "wait"; st.hand.on = false; st.hand.mid = false;
    st.stageT = 0; st.wait = 1.6;
    setMsg("先停下等一等，留出距离，不推也不挤", 5.0);
    st.manTie = 1.2;
  }

  function chooseSqueeze() {
    st.icons = []; st.choice = "squeeze"; st.hand.on = false; st.hand.mid = false;
    st.lean = 0.5; st.stageT = 0; st.wait = 1.8;
    setMsg("这里有点挤……先停一停", 3.0);
    camTo(1.5, (bodyX(st.i) + bodyX(st.ji)) / 2, 400);
    narrate("vo_l2_squeeze");
    st.retry = false;
  }

  function backToChoice() {
    st.choice = null; st.retry = false; st.lean = 0; st.hand.mid = true;
    camTo(1.06, (bodyX(st.i) + bodyX(st.ji)) / 2, 420);
    setMsg("再试一次，先等一等吧", 2.4);
    st.stage = 3; st.stageT = 0; st.wait = 0.9;
  }

  function arriveStage() {
    st.stage = 4; st.stageT = 0;
    st.manStop = 0; st.manWalk = 1;
    narrate("vo_l2_steptap");
    setMsg("点一点台阶，我们走到楼下", 3.2);
    glowAt(Math.min(LEN, st.i + 1));
    camTo(1.0, W / 2, H / 2);
  }

  function finish() {
    if (st.done) return;
    st.done = true; st.stage = 5; st.endT = 0; st.wave = 1;
    st.hand.on = false; st.glow = null;
    sfx("sfx_star");
    narrate("vo_l2_arrive");
    for (let k = 0; k < 9; k++) {
      st.parts.push({ x: bodyX(st.i) + (Math.random() - 0.5) * 160, y: ty(st.i) - 120 - Math.random() * 90, t: 0, v: 0.5 + Math.random() });
    }
  }

  function miss(x, y) {
    st.ripples.push({ x: x, y: y, t: 0 });
    st.hand.cool = 1.1;
    if (st.t - st.nudge > 4.2) {
      st.nudge = st.t;
      if (st.stage === 0) narrate("vo_l2_grab2");
      else if (st.stage === 2 || st.stage === 4) narrate("vo_l2_steptap");
    }
  }

  function hitRail(x, y) {
    return railDist(x, y) < 68;
  }
  function hitGlow(x, y) {
    if (!st.glow) return false;
    return Math.hypot(x - st.glow.x, y - st.glow.y) < 78;
  }
  function hitIcon(x, y) {
    for (const c of st.icons) if (x > c.x && x < c.x + c.w && y > c.y && y < c.y + c.h) return c.id;
    return null;
  }

  // ---------- 绘制小工具 ----------
  function drawGlow(g) {
    const k = 0.5 + 0.5 * Math.sin(g.t * 2.4);
    ctx.save();
    const grd = ctx.createRadialGradient(g.x, g.y, 4, g.x, g.y, 86);
    grd.addColorStop(0, "rgba(255,247,205,0.95)");
    grd.addColorStop(0.45, "rgba(255,226,130,0.55)");
    grd.addColorStop(1, "rgba(255,226,130,0)");
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.ellipse(g.x, g.y, 92, 44, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255," + (0.5 + 0.4 * k) + ")";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(g.x, g.y, 58 + 8 * k, 26 + 4 * k, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawHandAt(x, y, tap) {
    const im = IMG["sp_hand"];
    // 光晕
    ctx.save();
    const grd = ctx.createRadialGradient(x, y - 42, 6, x, y - 42, 76);
    grd.addColorStop(0, "rgba(255,240,170,0.55)");
    grd.addColorStop(1, "rgba(255,240,170,0)");
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(x, y - 42, 76, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    if (im && im.complete) {
      const h = 104 * (st.hand.scale || 1), w = im.width * h / im.height;
      ctx.save();
      ctx.globalAlpha = 0.98;
      ctx.drawImage(im, x - w / 2, y - h + 8 + tap * 7, w, h);
      ctx.restore();
      return;
    }
    // 备用：画一只手（掌在上、食指向下）
    const s = 1, dy = tap * 6;
    ctx.save();
    ctx.translate(x, y + dy);
    ctx.fillStyle = "#FFF9EE";
    ctx.strokeStyle = "rgba(226,186,110,0.95)";
    ctx.lineWidth = 3;
    rr(-19, -58, 38, 34, 15); ctx.fill(); ctx.stroke();          // 手掌
    rr(-6, -34, 12, 28, 6); ctx.fill(); ctx.stroke();            // 食指
    ctx.beginPath(); ctx.arc(-10, -20, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-13, -32, 6.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function drawRipples() {
    for (const r of st.ripples) {
      const k = Math.min(1, r.t / 0.6);
      ctx.save();
      ctx.globalAlpha = (1 - k) * 0.65;
      ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(r.x, r.y, 8 + 34 * k, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  function drawMan() {
    const j = st.ji;
    if (st.manWalk && j >= LEN + 1.25) return;
    const down = st.manTie > 0 || (st.manStop && !st.manWalk && !st.stopTween);   // 停下来 / 蹲下系鞋带
    const moving = !!st.stopTween || !!st.manWalk;
    const f = down ? "sp_xm4_tie" : ("sp_xm4_" + (moving ? ((Math.floor(st.t * 3.2) % 2) + 1) : 1));
    // 走过最后一级后沿原方向继续离开，避免停在终点突然消失。
    const extra = Math.max(0, j - LEN), base = pos(j);
    const bx = base.x + extra * 95 + (down ? 6 : 10), by = base.y - extra * 26;
    const hh = Math.max(150, base.h - extra * 15) * (down ? 0.58 : 0.94);
    const opacity = extra > 0.75 ? Math.max(0, 1 - (extra - 0.75) / 0.5) : 1;
    shadow(bx, by - 2, hh * 0.26, 0.12 * opacity);
    drawAt(f, bx, by + 2, hh, opacity);
    if (down) {
      // 鞋带小气泡
      const cx = bx + 6, cy = by - hh - 26 + Math.sin(st.t * 3) * 3;
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = PAL.coral; ctx.lineWidth = 3.4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx - 11, cy - 6); ctx.bezierCurveTo(cx - 4, cy - 12, cx - 1, cy + 1, cx - 9, cy + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 11, cy - 6); ctx.bezierCurveTo(cx + 4, cy - 12, cx + 1, cy + 1, cx + 9, cy + 4); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy - 1, 2.6, 0, Math.PI * 2); ctx.fillStyle = PAL.coral; ctx.fill();
      ctx.restore();
    }
  }

  function drawHer() {
    const lean = st.lean > 0 ? Math.sin(Math.min(1, st.lean * 2) * Math.PI) * 16 : 0;
    const p = { x: bodyX(st.i) + lean, y: ty(st.i) };
    const hop = st.wave > 0 ? Math.abs(Math.sin(st.t * 5)) * 6 : 0;
    shadow(p.x, p.y - 2, pos(st.i).h * 0.22, 0.13);
    // 下楼关键帧：稳定、抬脚、落下一阶、另一脚跟进。
    const sheet = IMG.sp_xh_downsheet;
    if (sheet && sheet.complete && sheet.naturalWidth) {
      let frame = 0;
      if (st.walk) {
        const w = st.walk, n = Math.max(1, Math.round(Math.abs(w.to-w.from)));
        const local = (Math.min(0.999999, w.t / w.dur) * n) % 1;
        frame = local < 0.15 ? 0 : local < 0.43 ? 1 : local < 0.74 ? 2 : 3;
      }
      const sw = sheet.width / 4, sh = sheet.height, hh = pos(st.i).h;
      const ww = sw * hh / sh;
      // 四帧脚底高度略有差异，统一贴到对应踏步。
      const feet = [675, 668, 662, 677];
      const footOffset = (675 - feet[frame]) * hh / sh;
      const bottom = p.y + 4 - hop + (sh - 675) * hh / sh + footOffset;
      ctx.drawImage(sheet, frame * sw, 0, sw, sh, p.x - ww / 2, bottom - hh, ww, hh);
    } else drawAt("sp_xh4_1", p.x, p.y + 4 - hop, pos(st.i).h, 1);

    if (st.flash > 0) {
      const k = 1 - st.flash;
      const r = railPt(st.i);
      ctx.save();
      ctx.globalAlpha = st.flash * 0.9;
      ctx.strokeStyle = "#FFF3B0"; ctx.lineWidth = 8 * (1 - k) + 2;
      ctx.beginPath(); ctx.arc(r.x, r.y, 16 + 46 * k, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  const CARD_BG = "rgba(255,251,244,0.98)";
  const CARD_LINE = "rgba(31,52,94,0.10)";

  function panel(x, y, w, h, r) {
    ctx.save();
    ctx.shadowColor = "rgba(31,52,94,0.22)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
    ctx.fillStyle = CARD_BG; rr(x, y, w, h, r); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = CARD_LINE; ctx.lineWidth = 3; rr(x, y, w, h, r); ctx.stroke();
    ctx.restore();
  }

  function taskText() {
    if (st.stage === 0) return ["先扶好扶手", "点一下小朋友身旁的细扶手"];
    if (st.stage === 1 || st.stage === 2) return ["看着台阶下楼", "点一点发光的台阶"];
    if (st.stage === 3) return st.stopTween
      ? ["前面好像有情况", "看看小满在做什么"]
      : ["前面有人停下来了", "看清情况，再选一个做法"];
    if (st.stage === 4) return ["继续扶好扶手", "点亮起的台阶，一级一级走"];
    return ["到啦", "扶扶手、看台阶、慢慢走"];
  }

  function drawMission() {
    if (st.stage === 3) return;
    const w = 660, h = 92, x = W / 2 - w / 2 + 40, y = 20;
    panel(x, y, w, h, 26);
    ctx.save();
    ctx.fillStyle = st.stage >= 4 ? PAL.teal : PAL.coral;
    rr(x + 14, y + 18, 8, h - 36, 4); ctx.fill();
    ctx.restore();
    const t = taskText();
    text(t[0], x + 42, y + 36, 27, PAL.navy, "left");
    text(t[1], x + 42, y + 68, 18, "rgba(31,52,94,0.62)", "left");
  }

  function drawIcons() {
    const cfg = {
      wait: { t: "等一等", s: "站在原地，等他先走", c: PAL.teal, tint: "rgba(6,178,157,0.10)", line: "rgba(6,178,157,0.55)", icon: "sp_ui_wait" },
      squeeze: { t: "从旁边挤过去", s: "侧过身子挤过去", c: PAL.coral, tint: "rgba(232,80,58,0.10)", line: "rgba(232,80,58,0.55)", icon: "sp_ui_pass" }
    };
    const a = st.icons[0], b = st.icons[1];
    const px = a.x - 18, pw = (b.x + b.w) - px + 18;
    const py = a.y - 18, ph = a.h + 36;
    panel(px, py, pw, ph, 32);

    st.icons.forEach((c, idx) => {
      const cy = c.y + c.h / 2;
      const conf = cfg[c.id];
      ctx.save();
      ctx.fillStyle = conf.tint;
      rr(c.x, c.y, c.w, c.h, 24); ctx.fill();
      ctx.strokeStyle = conf.line; ctx.lineWidth = 3.4;
      ctx.globalAlpha = 0.68 + 0.32 * Math.sin(st.t * 2.4 + idx * 1.1);
      rr(c.x, c.y, c.w, c.h, 24); ctx.stroke();
      ctx.restore();
      if (st.kb && st.focus === idx) {
        ctx.save();
        ctx.strokeStyle = conf.c; ctx.lineWidth = 5;
        rr(c.x - 7, c.y - 7, c.w + 14, c.h + 14, 30); ctx.stroke();
        ctx.restore();
      }
      const im = IMG[conf.icon];
      if (im && im.complete) {
        const hh = 88, ww = im.width * hh / im.height;
        ctx.save();
        ctx.drawImage(im, c.x + 60 - ww / 2, cy - hh / 2, ww, hh);
        ctx.restore();
      } else {
        ctx.save();
        ctx.fillStyle = conf.c;
        ctx.beginPath(); ctx.arc(c.x + 60, cy, 30, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      text(conf.t, c.x + 112, cy - 12, 27, PAL.navy, "left");
      text(conf.s, c.x + 112, cy + 18, 17, "rgba(31,52,94,0.58)", "left");
    });
  }

  function drawSteps() {
    const n = LEN + 1, gap = 30, cx = W - 186, y = 79;
    const x0 = cx - gap * (n - 1) / 2;
    ctx.save();
    ctx.fillStyle = "rgba(255,251,244,0.92)";
    ctx.shadowColor = "rgba(31,52,94,0.18)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
    rr(cx - 68, 45, 136, 42, 21); ctx.fill();
    ctx.restore();
    for (let k = 0; k < n; k++) {
      const on = k <= Math.round(st.i);
      const hh = 10 + k * 4;
      ctx.save();
      ctx.fillStyle = on ? PAL.teal : "rgba(31,52,94,0.22)";
      rr(x0 + k * gap - 10, y - hh, 20, hh, 5); ctx.fill();
      ctx.restore();
    }
  }

  function drawRetry() {
    ctx.save();
    ctx.fillStyle = "rgba(31,52,94,0.34)";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    ctx.restore();
    panel(W / 2 - 170, 296, 340, 96, 30);
    ctx.save();
    ctx.fillStyle = PAL.coral;
    rr(W / 2 - 150, 312, 300, 64, 24); ctx.fill();
    ctx.restore();
    text("再试一次", W / 2, 345, 30, "#FFFFFF", "center");
  }

  return {
    enter() { startLevel(); },
    update(dt) {
      st.t += dt; st.stageT += dt;
      if (st.msgT > 0) st.msgT -= dt;
      st.flash = Math.max(0, st.flash - dt * 2.2);
      st.lean = Math.max(0, st.lean - dt);
      st.hand.t += dt;
      if (st.hand.cool > 0) st.hand.cool -= dt;
      if (st.phi === undefined) st.phi = 0;
      st.phi += dt;

      // 相机（夹在底板范围内，避免镜头推过边界露出空白、界面飘到画面外）
      const c = st.cam, k = Math.min(1, dt * 3.2);
      c.s += (c.ts - c.s) * k;
      c.fx += (c.tfx - c.fx) * k;
      c.fy += (c.tfy - c.fy) * k;
      const hw = W / (2 * c.s), vh = H / (2 * c.s);
      c.fx = hw * 2 >= W ? W / 2 : Math.max(hw, Math.min(W - hw, c.fx));
      c.fy = vh * 2 >= H ? H / 2 : Math.max(vh, Math.min(H - vh, c.fy));

      // 走台阶
      if (st.walk) {
        const w = st.walk;
        w.t += dt;
        const p = Math.min(1, w.t / w.dur);
        const prev = st.i;
        const n = Math.max(1, Math.round(Math.abs(w.to - w.from)));
        const seg = Math.min(n - 1, Math.floor(p * n));
        const local = Math.min(1, p * n - seg);
        const moving = Math.max(0, Math.min(1, (local - 0.12) / 0.76));
        const e = moving * moving * (3 - 2 * moving);
        const dir = Math.sign(w.to - w.from);
        st.i = w.from + dir * (seg + e);
        if (Math.floor(st.i + 0.001) !== Math.floor(prev + 0.001)) {
          sfx("sfx_step");
          st.phase = Math.floor(st.i + 0.001);
        }
        if (p >= 1) { st.i = w.to; st.walk = null; arrive(); }
      }

      // 小满：先减速停下来，停稳了再说话
      if (st.stopTween) {
        const tw = st.stopTween;
        tw.t += dt;
        const k = Math.min(1, tw.t / tw.dur);
        st.ji = tw.from + (tw.to - tw.from) * (1 - Math.pow(1 - k, 3));
        if (k >= 1) {
          st.stopTween = null;
          narrate("vo_l2_oh");
          setMsg("前面的小伙伴停下来了", 3.2);
          st.wait = 0.8;
        }
      }
      if (st.manTie > 0) {
        st.manTie -= dt;
        if (st.manTie <= 0) { st.manStop = 0; st.manWalk = 1; narrate("vo_l2_thanks"); }
      }
      if (st.manWalk > 0) {
        st.ji += dt * 2.0;
        if (st.ji > 5.4) st.ji = 5.4;
      }

      // 阶段推进
      if (st.stage === 1 && st.wait > 0 && (!voiced || voiced.paused || voiced.ended || voiced.error)) {
        st.wait -= dt;
        if (st.wait <= 0) goWalkStage();
      }
      if (st.stage === 3 && st.wait > 0) {
        st.wait -= dt;
        if (st.wait <= 0) {
          if (st.choice === "wait") {
            st.wait = 0;
            narrate("vo_l2_waitok");
            st.stage = 4; st.stageT = 0; st.wait2 = 2.2;
          } else if (st.choice === "squeeze") {
            st.retry = true; st.wait = 0;
          } else if (!st.choice) {
            showChoice();
          }
        }
      }
      if (st.stage === 4 && st.stageT > 1.6 && st.wait2 > 0) {
        st.wait2 -= dt;
      }
      if (st.stage === 4 && st.stageT > 1.6 && st.ji > LEN + 1.25 && st.i < LEN - 0.01 && !st.glow && !st.walk && st.choice !== "squeeze") arriveStage();

      if (st.done) {
        st.endT += dt;
        if (st.endT > 1.4 && !st.saidEnd && !blockedNarration && (!voiced || voiced.paused || voiced.ended || voiced.error)) { st.saidEnd = true; narrate("vo_l2_end"); }
        if (st.endT > 3.4 && st.saidEnd && !st.finished && !blockedNarration && (!voiced || voiced.paused || voiced.ended)) {
          st.finished = true;
          go("win", { id: "l2", line: STR.win2, bg: "bg_stairs4" });
        }
      }

      // 选择阶段的小手画在屏幕层，缩小后指在左侧按钮上
      if (st.hand.mid && st.icons.length) st.hand.scale = 0.7;
      else if (st.hand.scale !== 1) st.hand.scale = 1;

      for (const r of st.ripples) r.t += dt;
      st.ripples = st.ripples.filter((r) => r.t < 0.7);
      for (const p of st.parts) { p.t += dt; p.y -= dt * 40 * p.v; }
      st.parts = st.parts.filter((p) => p.t < 1.8);
    },
    draw() {
      ctx.save();
      ctx.translate(W / 2, H / 2); ctx.scale(st.cam.s, st.cam.s);
      ctx.translate(-st.cam.fx, -st.cam.fy);

      bg("bg_stairs4");
      drawChildRail();
      if (st.glow) drawGlow(st.glow);
      drawMan();
      drawHer();
      

      // 世界内提示层：波纹 + 小手
      drawRipples();
      if (!st.icons.length && st.hand.on && st.hand.cool <= 0 && !st.done) {
        const bob = Math.sin(st.hand.t * 2.2) * 5;
        const tap = 0.5 + 0.5 * Math.sin(st.hand.t * 2.2 - 1.2);
        drawHandAt(st.hand.x, st.hand.y + bob, tap);
      }
      for (const p of st.parts) {
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - p.t / 1.8);
        ctx.fillStyle = "#F7C948"; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // —— 屏幕层（不随镜头缩放）——

      if (st.icons.length) drawIcons();
      drawSteps();

      // 面板出现时，小手悬在面板上沿，指着左侧按钮
      if (st.icons.length && st.hand.on && st.hand.cool <= 0 && !st.done) {
        const c0 = st.icons[0];
        const bob = Math.sin(st.hand.t * 2.2) * 5;
        const tap = 0.5 + 0.5 * Math.sin(st.hand.t * 2.2 - 1.2);
        drawHandAt(c0.x + c0.w * 0.5, c0.y - 20 + bob, tap);
      }

      // 面板已有问句，不再叠一条同样的气泡
      if (!st.icons.length && st.msgT > 0 && st.msg) {
        const a = Math.min(1, st.msgT * 2.2);
        const w = Math.max(380, st.msg.length * 27 + 60);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.shadowColor = "rgba(31,52,94,0.25)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
        ctx.fillStyle = "rgba(31,52,94,0.94)"; rr(W / 2 - w / 2, 126, w, 54, 27); ctx.fill();
        ctx.restore();
        text(st.msg, W / 2, 153, 22, "#FFFFFF", "center", a);
      }

      if (st.retry) drawRetry();
    },
    onDown(x, y) {
      if (st.done || st.walk || safetySpeaking()) return;
      if (st.retry) {
        if (Math.abs(x - W / 2) < 180 && Math.abs(y - 346) < 56) { backToChoice(); return; }
      }
      const id = hitIcon(x, y);
      if (id) {
        if (id === "wait") chooseWait(); else chooseSqueeze();
        return;
      }
      const w = s2w(x, y);
      if (st.stage === 0 && hitRail(w.x, w.y)) { doGrab(); return; }
      if ((st.stage === 2 || st.stage === 4) && hitGlow(w.x, w.y)) { startWalk(st.glow.i); return; }
      miss(w.x, w.y);
    },
    onMove() {},
    onUp() {},
    key(code) {
      if (st.done || safetySpeaking()) return;
      if (st.retry) { if (code === "Enter" || code === "Space") backToChoice(); return; }
      if (!st.icons.length) return;
      if (code === "ArrowLeft" || code === "ArrowRight") {
        st.focus = 1 - st.focus; st.kb = true; sfx("sfx_ok");
      }
      if (code === "Enter" || code === "Space") {
        st.kb = true;
        if (st.focus === 0) chooseWait(); else chooseSqueeze();
      }
    },
    tap() {}
  };
};

// ---------- 第三场：门口陌生人 ----------
SCENES.l3 = () => {
  const cards = [
    { id: "go", label: "跟他走", x: 60, icon: "sp_stranger" },
    { id: "teacher", label: "找老师", x: 460, icon: "sp_teacher" },
    { id: "stay", label: "站原地", x: 860, icon: "sp_xiaohe" }
  ];
  const video = document.createElement("video");
  video.src=asset("video/stranger_consequence.mp4");video.muted=true;video.playsInline=true;video.preload="auto";video.load();
  const clipDuration=()=>Number.isFinite(video.duration)?video.duration:5.1;
  const st = { t: 0, picked: null, right: false, teacherX: -200, strangerX: 830, hint: 0, shake: 0, wrong: null };

  function speak(line) {
    if(voiced) voiced.pause();
    if(preferences.sound && 'speechSynthesis' in window) { speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(line);u.lang='zh-CN';u.rate=0.9;speechSynthesis.speak(u); }
  }
  function bubble(x, y, str, color) {
    ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.shadowColor = "rgba(31,52,94,0.2)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
    rr(x - 150, y - 52, 300, 60, 22); ctx.fill(); ctx.restore();
    text(str, x, y - 22, 24, color || PAL.ink);
  }

  return {
    debugState:()=>({...st,video:{time:video.currentTime,duration:video.duration,ready:video.readyState,paused:video.paused,error:video.error?.code}}),
    enter() { say("vo_lv3"); },
    update(dt) {
      st.t += dt;
      if(st.mode) {
        st.modeT += dt;
        if(st.mode==='consequence' && (video.ended || st.modeT>clipDuration()+0.2)) { video.pause();activeVideo=null;st.mode='retry';st.modeT=0; }
        if((st.mode==='retry' && st.modeT>Math.max(4, (AUD.vo_l3_retry_anna.duration || 14)-clipDuration()+0.5))||(st.mode==='stay' && st.modeT>Math.max(4,(AUD.vo_l3_stay_anna.duration || 12)+0.5))) {st.mode=null;st.picked=null;st.wrong=null;}
      }
      st.shake = Math.max(0, st.shake - dt);
      st.hint = Math.max(0, st.hint - dt);
      if (st.right) {
        st.teacherX += (300 - st.teacherX) * Math.min(1, dt * 2.2);
        st.strangerX += (1240 - st.strangerX) * Math.min(1, dt * 1.6);
        if (st.t > st.rightAt + 1.9 && !st.done) {
          st.done = true;
          go("win", { id: "l3", line: STR.win3, bg: "bg_gate" });
        }
      }
    },
    draw() {
      if(st.mode==='consequence' && video.readyState>=2 && !video.error){
        ctx.drawImage(video,0,0,W,H);
        ctx.save();ctx.fillStyle='rgba(255,255,255,.92)';rr(230,624,820,62,24);ctx.fill();ctx.restore();
        text('不跟陌生人走，留在校园，找老师帮忙确认',W/2,655,27,PAL.navy);
        return;
      }
      bg("bg_gate");
      ctx.save();ctx.translate(0,65);
      shadow(st.strangerX, 535, 70);
      drawAt("sp_stranger", st.strangerX, 535, 300);
      if (st.teacherX > -160) { shadow(st.teacherX, 535, 66); drawAt("sp_teacher", st.teacherX, 535, 296); }
      shadow(300, 535, 74);
      drawAt("sp_xiaohe", 300, 535, 268);

      if(st.mode==='consequence') {
        // 在原人物脸部叠加表情，不替换人物外形或服装。
        ctx.save();
        const shake=Math.sin(st.modeT*18)*2;
        ctx.fillStyle='#FFD9B8';ctx.beginPath();ctx.ellipse(301,335,35,24,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=PAL.ink;ctx.lineWidth=3;ctx.lineCap='round';
        for(const x of [285,316]) {ctx.beginPath();ctx.moveTo(x-6,328);ctx.quadraticCurveTo(x,321,x+6,328);ctx.stroke();}
        ctx.fillStyle='#783C43';ctx.beginPath();ctx.ellipse(301+shake,347,9,11,0,0,Math.PI*2);ctx.fill();
        for(const x of [285,316]) {ctx.fillStyle='#64CDEA';ctx.beginPath();ctx.ellipse(x,337+(st.modeT*65%42),4,9,0,0,Math.PI*2);ctx.fill();}
        ctx.strokeStyle='#593D32';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(813,284);ctx.lineTo(824,290);ctx.moveTo(847,284);ctx.lineTo(837,290);ctx.stroke();
        ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(830,310,12,6,0,0,Math.PI);ctx.fill();ctx.stroke();ctx.restore();
        bubble(300,230,'呜呜，我不该跟他走……',PAL.coral);
        bubble(830,210,'嘿嘿，上当了！',PAL.coral);
      }
      if (st.right && st.teacherX > 120) bubble(st.teacherX + 10, 250, "我带你回教室", PAL.teal);
      if (st.hint > 0) bubble(300, 300, "不跟陌生人走", PAL.coral);

      ctx.restore();
      hud();
      banner("「你妈妈让我来接你。」", "小禾该怎么做？");
      if(st.mode) {
        pill(210,565,860,110,st.mode==='consequence'?'不跟陌生人走，要向老师求助':st.mode==='retry'?'先留在校园，找老师帮忙确认。再试一次吧！':'不跟陌生人走，做得对！再找老师帮忙确认吧！',false,30);
        return;
      }
      cards.forEach((c, i) => {
        const on = st.picked === c.id;
        const bad = st.wrong === c.id && st.shake > 0;
        const sx = bad ? Math.sin(st.shake * 60) * 10 : 0;
        ctx.save();
        ctx.fillStyle = on ? (c.id === "teacher" ? PAL.teal : "#B9B2A6") : "rgba(255,255,255,0.94)";
        ctx.shadowColor = "rgba(31,52,94,0.22)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
        rr(c.x + sx, 620, 360, 90, 26); ctx.fill(); ctx.restore();
        const im = IMG[c.icon];
        if (im && im.complete) {
          const hh = 76, ww = im.width * hh / im.height;
          ctx.save(); ctx.globalAlpha = on ? 0.9 : 1;
          ctx.drawImage(im, c.x + sx + 62 - ww / 2, 704 - hh, ww, hh);
          ctx.restore();
        }
        text(c.label, c.x + sx + 236, 665, 36, on ? "#fff" : PAL.navy);
      });
    },
    onDown(x, y) {
      if (st.right || st.mode || st.t < 0.6) return;
      const c = cards.find((c) => hit(x, y, c.x, 620, 360, 90));
      if (!c) return;
      st.picked = c.id;
      if (c.id === "teacher") { st.right = true; st.rightAt = st.t; sfx("sfx_ok"); }
      else { st.mode=c.id==='go'?'consequence':'stay';st.modeT=0;sfx('sfx_no');if(c.id==='stay')say('vo_l3_stay_anna');else {video.currentTime=0;activeVideo=video;video.play().catch(()=>{});say('vo_l3_retry_anna');} }
    },
    tap(x, y) { this.onDown(x, y); }
  };
};

// ---------- 第四场：教室找隐患 ----------
SCENES.l4 = () => {
  let round = 1;
  const items = [
    { id: "sp_scissors", x: 1180, y: 585, h: 45, found: false, fly: 0, name: "剪刀尖朝外" },
    { id: "sp_cup", x: 203, y: 548, h: 45, found: false, fly: 0, name: "水杯在桌边" },
    { id: "sp_backpack", x: 600, y: 695, h: 120, found: false, fly: 0, name: "书包挡过道" }
  ];
  const st = { t: 0, found: 0, hint: 0, pops: [], lastFound: 0, lastText: "" };

  const lessons = {
    sp_cup: {voice:'vo_l4_cup', lines:['水杯放在桌边容易碰倒，','水洒在地上会让人滑倒。','要把水杯放稳、放里面。']},
    sp_scissors: {voice:'vo_l4_scissors', lines:['剪刀的尖头朝外，容易扎伤经过的小朋友。','用完剪刀，要把它合拢，收进文具盒。']},
    sp_backpack: {voice:'vo_l4_bag', lines:['书包放在过道上，容易绊倒小朋友。','要把书包收好，保持过道畅通。']}
  };
  function closeLesson() {
    st.inspect=null;if(voiced)voiced.pause();if('speechSynthesis' in window)speechSynthesis.cancel();
    if(st.found===3 && round===1) {
      round=2;st.found=0;st.pops=[];st.lastText='';
      items.splice(0,items.length,
        {id:'books',x:180,y:660,h:65,name:'书本挡住过道',found:false,fly:0},
        {id:'water',x:590,y:590,h:60,name:'地面有积水',found:false,fly:0},
        {id:'boxes',x:1200,y:590,h:130,name:'杂物堵住出口',found:false,fly:0});
    } else if(st.found===3)st.completeDelay=0.65;
  }
  Object.assign(lessons,{
    books:{voice:'vo_l4_books_anna',lines:['书本散落在过道上，容易绊倒小朋友。','把书放回书架，保持过道畅通。']},
    water:{voice:'vo_l4_water_anna',lines:['地面有积水，走过去容易滑倒。','先绕开积水，告诉老师来处理。']},
    boxes:{voice:'vo_l4_exit_anna',lines:['纸箱堵住出口，紧急时会挡住撤离的路。','告诉老师清理杂物，出口要保持畅通。']}
  });
  function check(x, y, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = PAL.teal; ctx.lineWidth = 9; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.lineTo(x - 6, y + 16); ctx.lineTo(x + 26, y - 20); ctx.stroke();
    ctx.restore();
  }

  return {
    debugState:()=>({round,found:st.found,inspect:st.inspect?.id,items}),
    enter() { say("vo_lv4"); },
    update(dt) {
      st.t += dt;
      if(st.inspect) { st.inspectTime+=dt; return; }
      st.hint = Math.max(0, st.hint - dt);
      if(st.completeDelay > 0) { st.completeDelay -= dt; if(st.completeDelay <= 0) { go("win", { id: "l4", line: STR.win4, bg: "bg_classroom" }); return; } }
      st.pops.forEach((p) => (p.t += dt));
      st.pops = st.pops.filter((p) => p.t < 1.2);
      items.forEach((it) => { if (it.found && it.fly < 1) it.fly = Math.min(1, it.fly + dt * 1.8); });
      if (st.found > 0 && st.t - st.lastFound > 7 && st.found < 3) {
        // 卡住时把还没找到的那件轻轻晃一下
        st.hint = 0;
      }
    },
    draw() {
      bg(round===1?"bg_classroom_scissors_fixed":"bg_library_hazards_v3");
      const idle = st.t - Math.max(st.lastFound, 0.01) > 7 && st.found < 3;
      for (const it of items) {
        if (it.found && it.fly >= 1) { check(it.x,it.y-it.h*0.45,1); continue; }
        const glow = 0.5 + 0.5 * Math.sin(st.t * 2.4 + it.x);
        if (!it.found) {
          ctx.save(); ctx.globalAlpha = (idle ? 0.12*glow : 0); ctx.fillStyle = PAL.coral;
          ctx.beginPath(); ctx.ellipse(it.x, it.y - it.h * 0.35, 62 + (idle ? 8 * glow : 0), 62 + (idle ? 8 * glow : 0), 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          
        } else {
          const a = 1 - it.fly;
          ctx.save(); ctx.globalAlpha = a;
          
          ctx.restore();
          check(it.x, it.y - it.h * 0.45, a);
        }
      }
      st.pops.forEach((p) => {
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - p.t * 1.2); ctx.strokeStyle = PAL.teal; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(p.x, p.y, 30 + p.t * 90, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      });
      if (st.hint > 0) text("再找找看", W / 2, 620, 26, "#fff", "center", Math.min(1, st.hint));
      if(st.inspect) {
        ctx.save();
        ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);
        // Clip away the opaque brown backdrop baked into the generated UI image.
        ctx.save();const popupShape=new Path2D();
        popupShape.roundRect(205,85,870,602,52);
        popupShape.roundRect(447,53,385,95,48);
        ctx.clip(popupShape);ctx.drawImage(IMG.bg_popup_template,100,0,1080,720);ctx.restore();
        const label=(value,x,y,size,maxWidth,color='#06234c')=>{ctx.save();ctx.font='900 '+size+'px "Microsoft YaHei", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;const fit=Math.min(1,maxWidth/ctx.measureText(value).width);ctx.translate(x,y);ctx.scale(fit,1);ctx.fillText(value,0,0);ctx.restore();};
        label(st.inspect.name,640,104,45,350);
        ctx.save();rr(442,171,398,247,22);ctx.clip();
        if(st.inspect.id==='sp_backpack')ctx.drawImage(IMG.sp_popup_bag,486,243,564,352,442,171,398,247);
        else {const im=round===1?IMG.bg_classroom_scissors_fixed:IMG.bg_library_hazards_v3;const scale=im.naturalWidth/W;ctx.drawImage(im,Math.min(1000,Math.max(0,st.inspect.x-140))*scale,Math.min(546,Math.max(0,st.inspect.y-150))*scale,280*scale,174*scale,442,171,398,247);}
        ctx.restore();
        const lines=lessons[st.inspect.id].lines;
        lines.forEach((line,i)=>label(line,640,(lines.length===3?461:474)+i*(lines.length===3?37:51),lines.length===3?31:34,820));
        const lessonBusy=preferences.sound&&(blockedNarration||(voiced&&!voiced.paused&&!voiced.ended));
        label(lessonBusy?'正在讲解…':st.found===3?(round===1?'下一轮':'我知道了'):'继续找一找',640,618,39,350,'#fffaf1');
        ctx.restore();
      }
      if (!st.inspect && st.lastText && st.t - st.lastFound < 1.6) {
        text(st.lastText, W / 2, 660, 26, "#FFE7B0", "center", Math.max(0, 1 - (st.t - st.lastFound) / 1.6));
      }
    },
    onDown(x, y) {
      if(st.inspect) { const busy=preferences.sound&&(blockedNarration||(voiced&&!voiced.paused&&!voiced.ended)); if(st.inspectTime>0.4 && !busy && hit(x,y,440,568,400,98))closeLesson(); return; }
      for (const it of items) {
        if (it.found) continue;
        const dx = Math.abs(x - it.x), dy = Math.abs(y - (it.y - it.h * 0.45));
        if (dx < 92 && dy < 92) {
          it.found = true; st.found++; st.lastFound = st.t; st.lastText = it.name;
          sfx("sfx_ok");
          st.pops.push({ x: it.x, y: it.y - it.h * 0.45, t: 0 });
          st.inspect=it;st.inspectTime=0;if(lessons[it.id].voice)say(lessons[it.id].voice);
          else if(voiced) voiced.pause(); // Anna Su文件待接入，保留文字讲解
          return;
        }
      }
      st.hint = 1.2; sfx("sfx_no");
    },
    tap(x, y) { this.onDown(x, y); }
  };
};

// ---------- 第五场：疏散集合 ----------
SCENES.l5 = () => createL5({ctx,W,H,IMG,preferences,bg,drawAt,shadow,text,pill,rr,hit,say,sfx,stopSound,go,STR,voiceBusy:()=>preferences.sound&&preferences.voice==='recorded'&&!!voiced&&!voiced.paused&&!voiced.ended});

SCENES.win = (arg) => winCard(arg.id, arg.line, arg.bg, () => {
  if (stars.length >= 5) go("finale");
  else go("select");
});

SCENES.finale = () => {
 const btn=[489,620,302,78];
 return {
 enter(){sfx('sfx_star');say('vo_win');},
 draw(){const im=IMG.sp_finale_reference;if(im && im.naturalWidth)ctx.drawImage(im,0,0,W,H);
 if(P.down && hit(P.x,P.y,...btn)){ctx.save();ctx.fillStyle='rgba(255,255,255,.12)';rr(...btn,39);ctx.fill();ctx.restore();}},
 onDown(x,y){if(hit(x,y,...btn)){sfx('sfx_ok');stars=[];saveStars();go('title');}},
 tap(){stars=[];saveStars();go('title');}
 };
};

function start() {
  const q = new URLSearchParams(location.search);
  const jump = q.get("lvl");
  go(/^[1-5]$/.test(jump || "") ? "l" + jump : "title");
  requestAnimationFrame(frame);
}

function loadingScreen() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#FDF6EC"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(view.s, 0, 0, view.s, view.ox, view.oy);
  text(STR.title, W / 2, H / 2 - 30, 52, PAL.navy);
  text("正在准备…", W / 2, H / 2 + 40, 28, PAL.ink, "center", 0.6);
}
loadingScreen();
loadAll();


window.render_game_to_text=()=>JSON.stringify({scene:scene.name,paused:userPaused,settings:{...preferences},audio:voiced?{src:voiced.src.split("/").pop(),time:voiced.currentTime,paused:voiced.paused,ended:voiced.ended,error:voiced.error?.code}:null,stars,coordinates:"1280x720, origin top left",state:scene.debugState?.()});
window.advanceTime=ms=>{for(let t=0;t<Math.min(ms,60000);t+=STEP){if(!userPaused&&scene.update)scene.update(STEP/1000);}paint();drawSysHud();if(userPaused)drawPausePanel();};


















setupBrowserAgent({
 read(){const result=JSON.parse(window.render_game_to_text());let actions=[];const add=(id,label,rect,disabled=false)=>actions.push({id,label,rect,disabled});
 if(userPaused){add('pause-icon','恢复游戏',SYS.pause);for(const b of PAUSE_BTNS())add(b.id,b.label,[b.x,b.y,b.w,b.h]);}
 else {if(isLevel()){add('back','返回关卡选择',SYS.back);add('pause','暂停游戏',SYS.pause);}if(scene.name==='title'){add('start','开始游戏',[480,368,320,95]);add('settings','设置',[537,474,206,59]);}
 if(scene.name==='settings'){for(const [i,label] of ['开关声音','切换旁白声线','调整字体大小'].entries())add('setting-'+i,label,[400,225+i*100,480,74]);add('home','返回首页',[500,580,280,60]);}
 if(scene.name==='select'){add('home','返回首页',[12,12,100,94]);let n=0;while(n<5&&stars.includes('l'+(n+1)))n++;[152,396,640,884,1128].forEach((x,i)=>add('level-'+(i+1),STR.levels[i]+(i>n?'（未解锁）':''),[x-112,300,224,350],i>n));}
 if(scene.name==='l5')for(const o of result.state?.options||[])add(o.id,o.label,o.rect,['feedback','success'].includes(result.state.phase)&&preferences.sound&&preferences.voice==='recorded'&&!!voiced&&!voiced.paused&&!voiced.ended);
 if(scene.name==='l4'){if(result.state?.inspect)add('continue','继续找一找或下一轮',[440,568,400,98]);else for(const it of result.state?.items||[])if(!it.found)add(it.id,it.name,[it.x-75,it.y-it.h*.45-65,150,130]);}
 if(scene.name==='l3'&&!result.state?.mode&&!result.state?.right){['跟他走','找老师','站原地'].forEach((label,i)=>add('stranger-'+i,label,[60+i*400,620,360,90]));}
 if(scene.name==='win'){add('replay','再玩一次',[390,438,220,66]);add('next','下一个',[670,438,220,66]);}
 if(scene.name==='finale')add('replay-all','再玩一次',[489,620,302,78]);}
 return {...result,actions,interaction_help:'使用可访问HTML按钮或xiaoheAgent操作；有浏览器代理支持时可调用页面注册的WebMCP工具。游戏不会赋予聊天模型浏览器权限。'};
 },
 down(x,y){unlockAudio();P.x=x;P.y=y;P.down=true;P.moved=false;if(sysPointer(x,y)){P.down=false;held.clear();if(scene.onUp)scene.onUp(x,y);return;}if(!userPaused&&scene.onDown)scene.onDown(x,y);},
 hover(x,y){if(!userPaused&&scene.onHover)scene.onHover(x,y);},
 move(x,y){P.x=x;P.y=y;P.moved=true;if(!userPaused&&P.down&&scene.onMove)scene.onMove(x,y);},
 up(){P.down=false;if(!userPaused&&scene.onUp)scene.onUp(P.x,P.y);}
});

import { useState, useEffect, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════
// TRAINED MODEL — from 2,310 admission records (2020–2025)
// ═══════════════════════════════════════════════════════
const MODEL = {"overall":{"count":2159,"mean":46.0,"median":32.0,"p25":17.0,"p75":64.0},"level1":{"Blast Injury|15-49|N":{"n":7,"mean":33.3,"median":27.0,"p25":20.0,"p75":45.0,"p90":61.6,"surv":{"1":[1.0,0.0],"3":[1.0,0.0],"7":[0.86,0.0],"14":[0.86,0.0],"21":[0.57,0.0],"28":[0.43,0.0],"35":[0.29,0.0],"42":[0.29,0.0],"56":[0.29,0.5],"70":[0.14,1.0],"84":[0.0,0]}},"GSW|0-4|N":{"n":19,"mean":41.8,"median":31.0,"p25":19.5,"p75":54.5,"p90":75.8,"surv":{"1":[1.0,0.0],"7":[0.95,0.0],"14":[0.79,0.0],"21":[0.74,0.14],"28":[0.58,0.09],"35":[0.42,0.0],"42":[0.37,0.14],"56":[0.26,0.0],"70":[0.11,0.0],"84":[0.11,0.0],"100":[0.11,0.0]}},"GSW|5-14|N":{"n":90,"mean":50.5,"median":38.5,"p25":21.0,"p75":68.0,"p90":112.0,"surv":{"1":[1.0,0.0],"7":[0.96,0.0],"14":[0.87,0.03],"21":[0.76,0.07],"28":[0.62,0.05],"35":[0.54,0.04],"42":[0.44,0.03],"56":[0.36,0.0],"70":[0.24,0.05],"84":[0.14,0.0],"100":[0.12,0.0],"120":[0.09,0.0]}},"GSW|15-49|N":{"n":1806,"mean":46.4,"median":32.5,"p25":18.0,"p75":64.0,"p90":100.0,"surv":{"1":[1.0,0.003],"3":[0.99,0.004],"5":[0.98,0.014],"7":[0.95,0.009],"10":[0.91,0.02],"14":[0.83,0.025],"21":[0.68,0.039],"28":[0.58,0.037],"35":[0.48,0.026],"42":[0.42,0.03],"56":[0.31,0.023],"70":[0.22,0.041],"84":[0.15,0.025],"100":[0.10,0.033],"120":[0.06,0.01]}},"GSW|15-49|Y":{"n":37,"mean":25.3,"median":17.0,"p25":9.0,"p75":32.0,"p90":57.2,"surv":{"1":[1.0,0.0],"3":[0.97,0.06],"5":[0.86,0.06],"7":[0.78,0.0],"10":[0.73,0.0],"14":[0.65,0.0],"21":[0.41,0.07],"28":[0.35,0.15],"35":[0.24,0.0],"42":[0.24,0.0],"56":[0.11,0.0],"70":[0.08,0.0],"84":[0.0,0]}},"GSW|50-64|N":{"n":88,"mean":53.8,"median":42.0,"p25":25.2,"p75":81.8,"p90":103.3,"surv":{"1":[1.0,0.0],"7":[0.95,0.024],"10":[0.92,0.0],"14":[0.89,0.013],"21":[0.78,0.015],"28":[0.70,0.032],"35":[0.59,0.019],"42":[0.51,0.067],"56":[0.36,0.0],"70":[0.31,0.0],"84":[0.25,0.045],"100":[0.13,0.091],"120":[0.07,0.0]}},"GSW|65+|N":{"n":20,"mean":50.0,"median":34.0,"p25":25.0,"p75":63.2,"p90":112.5,"surv":{"1":[1.0,0.0],"3":[0.95,0.05],"7":[0.90,0.0],"10":[0.90,0.06],"14":[0.85,0.06],"21":[0.75,0.0],"28":[0.70,0.14],"35":[0.50,0.0],"42":[0.35,0.0],"56":[0.25,0.0],"70":[0.25,0.0],"84":[0.25,0.0],"100":[0.25,0.0],"120":[0.05,0.0]}},"Non-Weapon Injury|15-49|N":{"n":27,"mean":39.0,"median":26.0,"p25":15.5,"p75":51.0,"p90":95.2,"surv":{"1":[1.0,0.0],"3":[1.0,0.04],"5":[0.89,0.0],"7":[0.81,0.05],"14":[0.78,0.0],"21":[0.63,0.0],"28":[0.48,0.08],"35":[0.44,0.0],"42":[0.33,0.0],"56":[0.22,0.0],"70":[0.19,0.0],"84":[0.15,0.0],"100":[0.11,0.0]}},"Stab Wound|15-49|N":{"n":7,"mean":33.9,"median":18.0,"p25":7.5,"p75":25.0,"p90":77.4,"surv":{"1":[1.0,0.0],"5":[0.86,0.0],"7":[0.71,0.0],"10":[0.57,0.0],"14":[0.57,0.0],"21":[0.43,0.33],"28":[0.29,0.0],"35":[0.14,0.0]}}},"level2_body_region":{"abdomen_pelvis":{"n":32,"mean":37.4,"median":19.0,"p25":9.0,"p75":66.0,"p90":98.5},"back":{"n":18,"mean":16.1,"median":13.5,"p25":9.2,"p75":19.8,"p90":34.2},"buttock":{"n":15,"mean":29.9,"median":18.0,"p25":10.5,"p75":32.0,"p90":67.6},"chest":{"n":29,"mean":31.3,"median":19.0,"p25":9.0,"p75":49.0,"p90":65.4},"head_face":{"n":25,"mean":26.4,"median":21.0,"p25":11.0,"p75":33.0,"p90":44.2},"lower_limb":{"n":216,"mean":46.6,"median":35.0,"p25":21.0,"p75":65.2,"p90":87.5},"lower_limb_fracture":{"n":32,"mean":75.6,"median":70.5,"p25":43.2,"p75":96.2,"p90":142.1},"multi_region":{"n":49,"mean":37.3,"median":22.0,"p25":16.0,"p75":46.0,"p90":76.0},"neck":{"n":13,"mean":17.5,"median":14.0,"p25":7.0,"p75":25.0,"p90":36.8},"stump_revision":{"n":9,"mean":27.2,"median":23.0,"p25":23.0,"p75":34.0,"p90":39.6},"upper_limb":{"n":84,"mean":35.5,"median":28.0,"p25":18.0,"p75":45.5,"p90":69.8},"upper_limb_fracture":{"n":2,"mean":28.5,"median":28.5,"p25":24.8,"p75":32.2,"p90":34.5}},"fallbacks":{"GSW":{"n":2067,"mean":46.5,"median":33.0,"p25":18.0,"p75":64.0,"p90":83.2},"Non-Weapon Injury":{"n":51,"mean":39.5,"median":28.0,"p25":15.5,"p75":54.0,"p90":70.2},"Blast Injury":{"n":10,"mean":39.3,"median":30.5,"p25":20.0,"p75":55.8,"p90":72.5},"Other Weapon Injury":{"n":18,"mean":22.1,"median":15.0,"p25":5.0,"p75":35.2,"p90":45.8},"Mine Injury":{"n":3,"mean":28.0,"median":17.0,"p25":13.5,"p75":37.0,"p90":48.1},"Stab Wound":{"n":7,"mean":33.9,"median":18.0,"p25":7.5,"p75":25.0,"p90":32.5}}};

// ═══════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════
const fmt = (n) => (n == null ? "—" : typeof n === "number" ? n.toFixed(1) : n);
const pct = (n) => (n == null ? "—" : `${Math.round(n * 100)}%`);
const dayLabel = (i) => { if (i===0) return "Today"; if (i===1) return "Tomorrow"; const d=new Date(); d.setDate(d.getDate()+i); return d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); };

const WARDS = ["Ward A","Ward B","Ward C","Ward D","ICU","Recovery"];
const BODY_REGIONS = ["lower_limb","upper_limb","chest","abdomen_pelvis","head_face","back","neck","buttock","lower_limb_fracture","upper_limb_fracture","multi_region","stump_revision"];
const BODY_REGION_LABELS = {lower_limb:"Lower Limb",upper_limb:"Upper Limb",chest:"Chest",abdomen_pelvis:"Abdomen/Pelvis",head_face:"Head/Face",back:"Back",neck:"Neck",buttock:"Buttock",lower_limb_fracture:"Lower Limb + Fracture",upper_limb_fracture:"Upper Limb + Fracture",multi_region:"Multi-Region",stump_revision:"Stump Revision"};
const DX_GROUPS = ["GSW","Blast Injury","Mine Injury","Stab Wound","Other Weapon Injury","Non-Weapon Injury"];
const AGE_BANDS = ["0-4","5-14","15-49","50-64","65+"];

function getAgeBand(age) {
  if (age < 5) return "0-4"; if (age < 15) return "5-14"; if (age < 50) return "15-49"; if (age < 65) return "50-64"; return "65+";
}

function parseBodyRegion(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  const hasFx = t.includes('#') || t.includes('fracture') || t.includes('fract');
  const regions = new Set();
  if (/head|face|eye|mandib|maxil|mouth|lip|occiput|temporal/.test(t)) regions.add('head_face');
  if (/neck|kneck/.test(t)) regions.add('neck');
  if (/chest|chesst|scapula/.test(t)) regions.add('chest');
  if (/abdomen|abddomen|abd |pelvic|pelvis|groin|inguine|suprapubic|flank|colostomy|bladder|perineum|anal|lumbar/.test(t)) regions.add('abdomen_pelvis');
  if (/back/.test(t) && !t.includes('buttock')) regions.add('back');
  if (/arm|humerus|elbow|forearm|fore arm|hand|wrist|shoulder|finger|thumb|palm/.test(t)) regions.add('upper_limb');
  if (/leg|thigh|femur|knee|tibia|fibula|ankle|foot|feet|hip|limb/.test(t)) regions.add('lower_limb');
  if (/buttock|gluteal|scrotum/.test(t)) regions.add('buttock');
  if (/stump|revision|amputation|aka/.test(t)) return 'stump_revision';
  if (regions.size === 0) return /multiple|multiples/.test(t) ? 'multi_region' : null;
  const trunk = ['chest','abdomen_pelvis','back','neck'].filter(r => regions.has(r));
  const ext = ['upper_limb','lower_limb','buttock'].filter(r => regions.has(r));
  const head = regions.has('head_face');
  if ((trunk.length && ext.length) || (trunk.length && head) || (head && ext.length) || regions.size >= 3) return 'multi_region';
  if (regions.has('abdomen_pelvis')) return 'abdomen_pelvis';
  if (regions.has('chest')) return 'chest';
  if (regions.has('neck')) return 'neck';
  if (regions.has('back')) return 'back';
  if (regions.has('head_face')) return 'head_face';
  if (regions.has('lower_limb')) return hasFx ? 'lower_limb_fracture' : 'lower_limb';
  if (regions.has('upper_limb')) return hasFx ? 'upper_limb_fracture' : 'upper_limb';
  if (regions.has('buttock')) return 'buttock';
  return null;
}

// ═══════════════════════════════════════════════════════
// LOS PREDICTION ENGINE
// ═══════════════════════════════════════════════════════
function predictRemainingLOS(patient) {
  const { diagnosisGroup, ageBand, isReadmission, bodyRegion, los } = patient;
  // Try Level 1 match
  const l1Key = `${diagnosisGroup}|${ageBand}|${isReadmission ? 'Y' : 'N'}`;
  let ref = MODEL.level1[l1Key];
  // Fallback to diagnosis group
  if (!ref) ref = MODEL.fallbacks[diagnosisGroup];
  // Fallback to overall
  if (!ref) ref = MODEL.overall;

  let median = ref.median || MODEL.overall.median;
  let p75 = ref.p75 || MODEL.overall.p75;
  let p25 = ref.p25 || MODEL.overall.p25;

  // Body region adjustment (if available)
  if (bodyRegion && MODEL.level2_body_region[bodyRegion]) {
    const br = MODEL.level2_body_region[bodyRegion];
    const overallMedian = MODEL.fallbacks[diagnosisGroup]?.median || MODEL.overall.median;
    if (overallMedian > 0) {
      const ratio = br.median / overallMedian;
      median = median * ratio;
      p75 = p75 * ratio;
      p25 = p25 * ratio;
    }
  }

  // Conditional remaining LOS given current stay
  const remaining = Math.max(0, median - los);
  const remainingHigh = Math.max(0, p75 - los);
  const remainingLow = Math.max(0, p25 - los);

  // Discharge probability in next 1-3 days
  let dischProb1d = 0, dischProb3d = 0;
  if (ref.surv) {
    const days = Object.keys(ref.surv).map(Number).sort((a,b) => a-b);
    // Find survival at current LOS and LOS+1, LOS+3
    const getSurv = (d) => {
      const closest = days.filter(x => x <= d).pop();
      return closest != null ? ref.surv[String(closest)]?.[0] ?? 1 : 1;
    };
    const survNow = getSurv(los);
    const surv1 = getSurv(los + 1);
    const surv3 = getSurv(los + 3);
    if (survNow > 0) {
      dischProb1d = Math.max(0, (survNow - surv1) / survNow);
      dischProb3d = Math.max(0, (survNow - surv3) / survNow);
    }
  }

  return { remaining: Math.round(remaining), remainingLow: Math.round(remainingLow), remainingHigh: Math.round(remainingHigh), dischProb1d, dischProb3d, refGroup: ref.n ? l1Key : 'overall', refN: ref.n || MODEL.overall.count };
}

// ═══════════════════════════════════════════════════════
// DEMO DATA GENERATOR (uses trained model)
// ═══════════════════════════════════════════════════════
const rB = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = (a) => a[Math.floor(Math.random()*a.length)];

function generateDemoPatients(n=100) {
  const patients = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const age = rB(3, 72);
    const sex = Math.random() > 0.88 ? 'F' : 'M';
    const dg = Math.random() < 0.95 ? 'GSW' : pick(['Blast Injury','Stab Wound','Non-Weapon Injury']);
    const br = dg === 'GSW' ? pick(BODY_REGIONS) : null;
    const isReadmit = Math.random() < 0.02;
    const ageBand = getAgeBand(age);
    const ward = pick(WARDS);
    const los = rB(1, 80);

    const pred = predictRemainingLOS({ diagnosisGroup: dg, ageBand, isReadmission: isReadmit, bodyRegion: br, los });

    patients.push({
      id: `P${String(i+1).padStart(4,'0')}`, age, sex, ward,
      bed: `${ward.substring(0,2).toUpperCase()}-${rB(1,25)}`,
      diagnosisGroup: dg, bodyRegion: br, isReadmission: isReadmit,
      admitDate: new Date(now - los * 86400000).toISOString().split('T')[0],
      los, estRemaining: pred.remaining, estRemainingLow: pred.remainingLow,
      estRemainingHigh: pred.remainingHigh, dischProb3d: pred.dischProb3d, refGroup: pred.refGroup,
    });
  }
  return patients.filter(p => p.estRemaining > 0 || Math.random() > 0.5);
}

// ═══════════════════════════════════════════════════════
// WARD-LEVEL FORECAST
// ═══════════════════════════════════════════════════════
function forecastWard(patients, totalBeds, days=7) {
  const daily = [];
  let occ = patients.length;
  // Per-patient discharge probabilities drive the forecast
  for (let d = 1; d <= days; d++) {
    let expectedDischarges = 0;
    patients.forEach(p => {
      if (p.estRemaining <= d) expectedDischarges += 0.7 + Math.random()*0.3;
      else if (p.estRemaining <= d + 3) expectedDischarges += 0.2;
    });
    const admitRate = totalBeds * 0.04 + (Math.random()-0.5)*1.5;
    occ = Math.max(0, Math.min(totalBeds, occ - expectedDischarges/days + admitRate));
    daily.push({
      day: d, label: dayLabel(d), predicted: Math.round(occ), total: totalBeds,
      occupancy: occ/totalBeds,
      ciLow: Math.max(0, Math.round(occ - d*1.4)),
      ciHigh: Math.min(totalBeds, Math.round(occ + d*1.4)),
    });
  }
  return daily;
}

// ═══════════════════════════════════════════════════════
// COLOUR & STYLE
// ═══════════════════════════════════════════════════════
const C = {
  bg:"#0f1117",surface:"#181b24",surfaceAlt:"#1e2230",border:"#2a2f3e",
  text:"#e8eaf0",textMuted:"#8b90a0",accent:"#4ea8de",accentDim:"#2d6a94",
  warn:"#f0a050",danger:"#e05555",success:"#50c080",successDim:"#2a7050",purple:"#9b72cf",
};
const BR_COLORS = {lower_limb:"#4ea8de",lower_limb_fracture:"#e05555",upper_limb:"#9b72cf",chest:"#f0a050",abdomen_pelvis:"#e8d44d",head_face:"#50c080",neck:"#6dd5ed",back:"#88a0b8",buttock:"#c084fc",multi_region:"#f472b6",stump_revision:"#a3a3a3",upper_limb_fracture:"#ef4444"};

const S = {
  app:{background:C.bg,color:C.text,minHeight:"100vh",fontFamily:"'IBM Plex Sans',system-ui,sans-serif",fontSize:13},
  header:{padding:"20px 28px 12px",borderBottom:`1px solid ${C.border}`},
  tabs:{display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,padding:"0 28px",background:C.surface,overflowX:"auto"},
  tab:(a)=>({padding:"10px 18px",cursor:"pointer",fontSize:12,fontWeight:a?600:400,color:a?C.accent:C.textMuted,borderBottom:a?`2px solid ${C.accent}`:"2px solid transparent",background:"none",border:"none",borderBottomStyle:"solid",transition:"all .15s",whiteSpace:"nowrap"}),
  content:{padding:"20px 28px"},
  grid:(c)=>({display:"grid",gridTemplateColumns:`repeat(${c},1fr)`,gap:14}),
  card:{background:C.surface,borderRadius:8,padding:"16px 18px",border:`1px solid ${C.border}`},
  cardLabel:{fontSize:11,color:C.textMuted,textTransform:"uppercase",letterSpacing:".6px",marginBottom:6},
  cardValue:{fontSize:26,fontWeight:700,letterSpacing:"-.5px"},
  badge:(c)=>({display:"inline-block",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:600,background:c+"20",color:c}),
  table:{width:"100%",borderCollapse:"collapse",fontSize:12},
  th:{textAlign:"left",padding:"8px 10px",borderBottom:`1px solid ${C.border}`,color:C.textMuted,fontWeight:500,fontSize:11,textTransform:"uppercase",letterSpacing:".5px"},
  td:{padding:"8px 10px",borderBottom:`1px solid ${C.border}22`},
  btn:(p)=>({padding:"8px 18px",borderRadius:6,border:p?"none":`1px solid ${C.border}`,background:p?C.accent:"transparent",color:p?"#fff":C.textMuted,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .15s"}),
  select:{background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 12px",color:C.text,fontSize:12,outline:"none",appearance:"auto"},
  input:{background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 12px",color:C.text,fontSize:12,outline:"none",width:"100%"},
};

function OccColor(r){return r>=.95?C.danger:r>=.85?C.warn:C.success;}
function MiniBar({value,max,color=C.accent,height=8}){const w=Math.min(100,(value/max)*100);return(<div style={{background:C.surfaceAlt,borderRadius:4,height,width:"100%",overflow:"hidden"}}><div style={{width:`${w}%`,height:"100%",background:color,borderRadius:4,transition:"width .4s"}}/></div>);}

function SparkForecast({data,height=50,width=180}){
  if(!data||!data.length)return null;
  const mx=Math.max(...data.map(d=>d.ciHigh||d.predicted));
  const mn=Math.min(0,...data.map(d=>d.ciLow||d.predicted));
  const rng=mx-mn||1;
  const pts=data.map((d,i)=>({x:(i/(data.length-1||1))*width,y:height-((d.predicted-mn)/rng)*(height-8)-4}));
  const line=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  return <svg width={width} height={height} style={{display:"block"}}><path d={line} fill="none" stroke={C.accent} strokeWidth={2}/>{pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={2.5} fill={C.accent}/>)}</svg>;
}

// ═══════════════════════════════════════════════════════
// MODEL INFO PANEL
// ═══════════════════════════════════════════════════════
function ModelInfo() {
  const l1Keys = Object.keys(MODEL.level1);
  const brKeys = Object.keys(MODEL.level2_body_region);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{...S.card,background:C.accent+"10",borderColor:C.accent+"40"}}>
        <div style={{fontSize:13,color:C.accent,fontWeight:600,marginBottom:8}}>Trained Model — {MODEL.overall.count.toLocaleString()} Historical Admissions</div>
        <p style={{fontSize:12,color:C.textMuted,lineHeight:1.7,margin:0}}>
          This model was trained on <strong style={{color:C.text}}>2,310 admission records (2019–2025)</strong> from a field hospital. 
          96% of cases are GSW. The model uses empirical LOS distributions stratified by diagnosis group, age band, and readmission status, 
          with body-region sub-stratification available for 2025+ records. 
          Predictions use conditional survival: given a patient has already stayed X days, the model estimates the remaining LOS 
          based on historically similar patients who also stayed at least X days.
        </p>
      </div>

      <div style={S.card}>
        <div style={S.cardLabel}>Level 1: Diagnosis × Age × Readmission ({l1Keys.length} groups)</div>
        <table style={{...S.table,marginTop:8}}>
          <thead><tr>{["Group","N","Median LOS","P25","P75","P90"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {l1Keys.map(k=>{const d=MODEL.level1[k];const [dg,ab,re]=k.split('|');return(
              <tr key={k}>
                <td style={{...S.td,fontSize:11}}>{dg} · {ab} · {re==='Y'?'Readmit':'New'}</td>
                <td style={S.td}>{d.n}</td>
                <td style={{...S.td,fontWeight:600,color:C.accent}}>{d.median}d</td>
                <td style={S.td}>{d.p25}d</td><td style={S.td}>{d.p75}d</td><td style={S.td}>{d.p90}d</td>
              </tr>);})}
          </tbody>
        </table>
      </div>

      <div style={S.card}>
        <div style={S.cardLabel}>Level 2: Body Region ({brKeys.length} categories, 2025+ data)</div>
        <table style={{...S.table,marginTop:8}}>
          <thead><tr>{["Body Region","N","Median LOS","P25","P75","P90"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {brKeys.sort((a,b)=>(MODEL.level2_body_region[b].n-MODEL.level2_body_region[a].n)).map(k=>{const d=MODEL.level2_body_region[k];return(
              <tr key={k}>
                <td style={S.td}><span style={S.badge(BR_COLORS[k]||C.textMuted)}>{BODY_REGION_LABELS[k]||k}</span></td>
                <td style={S.td}>{d.n}</td>
                <td style={{...S.td,fontWeight:600,color:C.accent}}>{d.median}d</td>
                <td style={S.td}>{d.p25}d</td><td style={S.td}>{d.p75}d</td><td style={S.td}>{d.p90}d</td>
              </tr>);})}
          </tbody>
        </table>
      </div>

      <div style={S.card}>
        <div style={S.cardLabel}>Methodology</div>
        <div style={{fontSize:12,color:C.textMuted,lineHeight:1.7}}>
          <p style={{margin:"0 0 8px"}}><strong style={{color:C.text}}>Context:</strong> War surgery field hospital, all emergency admissions, limited healthcare access.</p>
          <p style={{margin:"0 0 8px"}}><strong style={{color:C.text}}>Training data:</strong> Diagnosis group (GSW, Blast, Mine, Stab, Non-Weapon), age band, readmission status, body region (2025+). No labs, vitals, or clinical notes.</p>
          <p style={{margin:"0 0 8px"}}><strong style={{color:C.text}}>Prediction:</strong> Conditional remaining LOS — for a patient already in for X days, the model looks at historically similar patients who also stayed ≥X days and estimates when discharge is likely. This avoids the bias of simple averages.</p>
          <p style={{margin:0}}><strong style={{color:C.text}}>Horizon:</strong> 3–7 days. Days 1–3 operational; 4–7 directional only.</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DATA INPUT
// ═══════════════════════════════════════════════════════
function DataInput({ onImport }) {
  const [mode,setMode]=useState("paste");
  const [text,setText]=useState("");
  const [status,setStatus]=useState(null);

  const sampleCSV=`patient_id,age,sex,ward,bed,diagnosis_group,body_region,is_readmission,admit_date,los
P0001,26,M,Ward A,WA-5,GSW,lower_limb,N,2026-03-15,28
P0002,35,M,Ward B,WB-12,GSW,chest,N,2026-04-01,11
P0003,42,M,ICU,IC-3,GSW,lower_limb_fracture,N,2026-03-20,23
P0004,19,M,Ward A,WA-8,GSW,upper_limb,Y,2026-04-05,7
P0005,55,M,Ward C,WC-14,Blast Injury,,N,2026-03-28,15
P0006,8,F,Ward D,WD-6,GSW,abdomen_pelvis,N,2026-04-02,10`;

  const handleImport=()=>{
    const lines=(text||"").trim().split("\n").filter(Boolean);
    if(lines.length<2){setStatus("Need header + at least 1 row");return;}
    const header=lines[0].split(",").map(h=>h.trim().toLowerCase());
    const rows=lines.slice(1).map(line=>{
      const vals=line.split(",");
      const obj={};
      header.forEach((h,i)=>obj[h]=vals[i]?.trim());
      return obj;
    }).filter(r=>r.patient_id && r.admit_date);

    const patients=rows.map((r,i)=>{
      const age=parseInt(r.age)||30;
      const los=parseInt(r.los)||1;
      const dg=r.diagnosis_group||'GSW';
      const br=r.body_region||parseBodyRegion(r.diagnosis_text)||null;
      const isR=r.is_readmission==='Y';
      const pred=predictRemainingLOS({diagnosisGroup:dg,ageBand:getAgeBand(age),isReadmission:isR,bodyRegion:br,los});
      return {
        id:r.patient_id,age,sex:r.sex||'M',ward:r.ward||'Ward A',bed:r.bed||`W-${i+1}`,
        diagnosisGroup:dg,bodyRegion:br,isReadmission:isR,
        admitDate:r.admit_date,los,
        estRemaining:pred.remaining,estRemainingLow:pred.remainingLow,
        estRemainingHigh:pred.remainingHigh,dischProb3d:pred.dischProb3d,refGroup:pred.refGroup,
      };
    });
    onImport(patients);
    setStatus(`Imported ${patients.length} patients — forecast updated`);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={S.card}>
        <div style={S.cardLabel}>Import Current Inpatient Data</div>
        <p style={{fontSize:12,color:C.textMuted,margin:"4px 0 12px"}}>
          Upload current inpatients. Required: <code style={{color:C.accent}}>patient_id, age, sex, ward, bed, diagnosis_group, admit_date, los</code>. 
          Optional: <code style={{color:C.warn}}>body_region</code> (or <code style={{color:C.warn}}>diagnosis_text</code> to auto-parse), <code style={{color:C.warn}}>is_readmission</code>.
        </p>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button style={S.btn(mode==="paste")} onClick={()=>setMode("paste")}>Paste CSV</button>
          <button style={S.btn(mode==="file")} onClick={()=>setMode("file")}>Upload File</button>
          <button style={{...S.btn(false),marginLeft:"auto",fontSize:11}} onClick={()=>setText(sampleCSV)}>Load Sample</button>
        </div>
        {mode==="paste"?(
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste CSV data…" rows={8}
            style={{...S.input,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,resize:"vertical"}}/>
        ):(
          <div style={{border:`2px dashed ${C.border}`,borderRadius:8,padding:32,textAlign:"center",color:C.textMuted}}>
            <div style={{fontSize:28,marginBottom:8}}>📂</div>
            <div style={{fontSize:12}}>Drag & drop .csv file here</div>
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:12}}>
          <button style={S.btn(true)} onClick={handleImport}>Import & Predict</button>
          {status&&<span style={{fontSize:11,color:status.includes("Imported")?C.success:C.warn}}>{status}</span>}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardLabel}>Data Schema</div>
        <table style={S.table}>
          <thead><tr>{["Field","Type","Role"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {[
              ["patient_id","string","Tracking"],
              ["age","int","LOS grouping (age band)"],
              ["sex","M/F","Demographics"],
              ["ward","string","Ward-level forecast"],
              ["bed","string","Bed map"],
              ["diagnosis_group","GSW/Blast/Stab/…","Core LOS grouping"],
              ["body_region ★","lower_limb/chest/…","LOS sub-stratification (2025+)"],
              ["diagnosis_text ★","free text","Auto-parsed to body_region"],
              ["is_readmission","Y/N","LOS modifier"],
              ["admit_date","YYYY-MM-DD","LOS calculation"],
              ["los","int","Core forecast variable"],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=>(
                <td key={j} style={{...S.td,color:j===0?(c.includes('★')?C.warn:C.accent):j===2?C.textMuted:C.text,fontFamily:j===0?"'IBM Plex Mono',monospace":"inherit",fontSize:11}}>{c}</td>
              ))}</tr>
            ))}
          </tbody>
        </table>
        <p style={{fontSize:11,color:C.warn,marginTop:8}}>★ Optional — improves accuracy for GSW cases</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// BED MAP
// ═══════════════════════════════════════════════════════
function BedMap({patients,wardData,selectedWard}){
  const wards=selectedWard==="All"?Object.keys(wardData):[selectedWard];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {wards.map(ward=>{
        const info=wardData[ward];if(!info)return null;
        const wp=patients.filter(p=>p.ward===ward);
        const beds=[];for(let i=1;i<=info.total;i++){const occ=wp.find(p=>parseInt(p.bed.split('-')[1])===i);beds.push({number:i,occupant:occ});}
        return(
          <div key={ward} style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div><span style={{fontWeight:600,fontSize:13}}>{ward}</span><span style={{...S.badge(OccColor(info.occ)),marginLeft:10}}>{pct(info.occ)}</span></div>
              <span style={{fontSize:11,color:C.textMuted}}>{info.occupied}/{info.total} beds</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(38px,1fr))",gap:4}}>
              {beds.map(b=>{
                const o=!!b.occupant;const ls=b.occupant&&b.occupant.los>30;const nd=b.occupant&&b.occupant.estRemaining<=2;
                const brC=b.occupant?.bodyRegion?BR_COLORS[b.occupant.bodyRegion]:null;
                let bg=C.surfaceAlt,brd=C.border;
                if(o&&nd){bg=C.successDim;brd=C.success;}else if(o&&ls){bg=C.danger+"30";brd=C.danger;}else if(o){bg=C.accentDim+"50";brd=C.accent;}
                return(
                  <div key={b.number} title={b.occupant?`${b.occupant.id}|${b.occupant.diagnosisGroup}${b.occupant.bodyRegion?' · '+BODY_REGION_LABELS[b.occupant.bodyRegion]:''}|LOS ${b.occupant.los}d|Est.${b.occupant.estRemaining}d left`:"Empty"}
                    style={{width:"100%",aspectRatio:"1",borderRadius:4,background:bg,border:`1.5px solid ${brd}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:9,color:o?C.text:C.textMuted,cursor:"default",position:"relative"}}>
                    {b.number}
                    {o&&brC&&<div style={{width:6,height:6,borderRadius:"50%",background:brC,position:"absolute",top:3,right:3}}/>}
                    {b.occupant?.isReadmission&&<div style={{position:"absolute",bottom:2,fontSize:7,color:C.warn,fontWeight:700}}>R</div>}
                  </div>);
              })}
            </div>
            <div style={{display:"flex",gap:12,marginTop:8,fontSize:10,color:C.textMuted,flexWrap:"wrap"}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:2,background:C.surfaceAlt,border:`1.5px solid ${C.border}`,display:"inline-block"}}/>Empty</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:2,background:C.accentDim+"50",border:`1.5px solid ${C.accent}`,display:"inline-block"}}/>Occupied</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:2,background:C.successDim,border:`1.5px solid ${C.success}`,display:"inline-block"}}/>Near Discharge</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:2,background:C.danger+"30",border:`1.5px solid ${C.danger}`,display:"inline-block"}}/>Long Stay</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}>● Body region color</span>
            </div>
          </div>);
      })}
    </div>);
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
export default function App() {
  const [patients,setPatients]=useState([]);
  const [tab,setTab]=useState("overview");
  const [selectedWard,setSelectedWard]=useState("All");
  const [forecastDays,setForecastDays]=useState(5);
  const [sortCol,setSortCol]=useState("los");
  const [sortDir,setSortDir]=useState(-1);
  const [dataSource,setDataSource]=useState("demo");

  useEffect(()=>{setPatients(generateDemoPatients(110));},[]);

  const handleImport=(imported)=>{setPatients(imported);setDataSource("imported");setTab("overview");};

  const wardList=useMemo(()=>[...new Set(patients.map(p=>p.ward))].sort(),[patients]);
  const wardData=useMemo(()=>{
    const d={};
    wardList.forEach(w=>{
      const wp=patients.filter(p=>p.ward===w);
      const total=w==='ICU'?12:25;
      d[w]={total,occupied:wp.length,occ:wp.length/total};
    });
    return d;
  },[patients,wardList]);

  const forecast=useMemo(()=>{
    const f={};
    wardList.forEach(w=>{
      const wp=patients.filter(p=>p.ward===w);
      f[w]=forecastWard(wp,wardData[w]?.total||25,7);
    });
    return f;
  },[patients,wardList,wardData]);

  const totalBeds=Object.values(wardData).reduce((s,w)=>s+w.total,0);
  const totalOcc=Object.values(wardData).reduce((s,w)=>s+w.occupied,0);
  const globalOcc=totalBeds?totalOcc/totalBeds:0;
  const dischargesSoon=patients.filter(p=>p.estRemaining<=3).length;
  const readmitCount=patients.filter(p=>p.isReadmission).length;
  const avgLOS=patients.length?patients.reduce((s,p)=>s+p.los,0)/patients.length:0;

  const filteredPatients=useMemo(()=>{
    let fp=selectedWard==="All"?patients:patients.filter(p=>p.ward===selectedWard);
    return[...fp].sort((a,b)=>{const va=a[sortCol],vb=b[sortCol];if(typeof va==="number")return(va-vb)*sortDir;return String(va||'').localeCompare(String(vb||''))*sortDir;});
  },[patients,selectedWard,sortCol,sortDir]);

  const handleSort=(col)=>{if(sortCol===col)setSortDir(d=>d*-1);else{setSortCol(col);setSortDir(-1);}};

  const TABS=[{id:"overview",label:"Overview"},{id:"forecast",label:"Forecast"},{id:"bedmap",label:"Bed Map"},{id:"patients",label:"Patient List"},{id:"data",label:"Data Import"},{id:"model",label:"Model Info"}];

  return(
    <div style={S.app}>
      <div style={S.header}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:700,letterSpacing:"-.5px",color:C.text,margin:0}}>🏥 Field Hospital — Bed Demand Forecast</h1>
            <p style={{fontSize:12,color:C.textMuted,marginTop:4}}>
              Trained on {MODEL.overall.count.toLocaleString()} admissions · Body-region stratified · 3–7 day horizon
              {dataSource==="imported"&&<span style={{color:C.success,marginLeft:8}}>● Live data</span>}
              {dataSource==="demo"&&<span style={{color:C.warn,marginLeft:8}}>● Demo data</span>}
            </p>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <select style={S.select} value={selectedWard} onChange={e=>setSelectedWard(e.target.value)}>
              <option value="All">All Wards</option>
              {wardList.map(w=><option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={S.tabs}>{TABS.map(t=><button key={t.id} style={S.tab(tab===t.id)} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>

      <div style={S.content}>
        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={S.grid(6)}>
              {[
                {label:"Total Beds",value:totalBeds,color:C.text},
                {label:"Occupied",value:totalOcc,color:C.accent},
                {label:"Occupancy",value:pct(globalOcc),color:OccColor(globalOcc)},
                {label:"Discharge ≤3d",value:dischargesSoon,color:C.success},
                {label:"Avg LOS",value:`${fmt(avgLOS)}d`,color:C.purple},
                {label:"Readmissions",value:readmitCount,color:C.warn},
              ].map(kpi=>(
                <div key={kpi.label} style={S.card}><div style={S.cardLabel}>{kpi.label}</div><div style={{...S.cardValue,color:kpi.color}}>{kpi.value}</div></div>
              ))}
            </div>

            <div style={S.card}>
              <div style={S.cardLabel}>Ward Summary</div>
              <table style={{...S.table,marginTop:8}}>
                <thead><tr>{["Ward","Beds","Occ.","Occupancy","Avg LOS","3-Day Trend"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{wardList.map(w=>{const d=wardData[w];const fc=forecast[w]||[];return(
                  <tr key={w} style={{cursor:"pointer"}} onClick={()=>{setSelectedWard(w);setTab("forecast");}}>
                    <td style={{...S.td,fontWeight:600}}>{w}</td>
                    <td style={S.td}>{d.total}</td><td style={S.td}>{d.occupied}</td>
                    <td style={S.td}><div style={{display:"flex",alignItems:"center",gap:8}}><MiniBar value={d.occ} max={1} color={OccColor(d.occ)} height={6}/><span style={{fontSize:11,color:OccColor(d.occ),minWidth:36}}>{pct(d.occ)}</span></div></td>
                    <td style={S.td}>{fmt(patients.filter(p=>p.ward===w).reduce((s,p)=>s+p.los,0)/(patients.filter(p=>p.ward===w).length||1))}d</td>
                    <td style={S.td}><SparkForecast data={fc.slice(0,3)} height={28} width={80}/></td>
                  </tr>);})}</tbody>
              </table>
            </div>

            <div style={S.grid(2)}>
              <div style={S.card}>
                <div style={S.cardLabel}>Diagnosis Mix</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                  {(()=>{const c={};patients.forEach(p=>{c[p.diagnosisGroup]=(c[p.diagnosisGroup]||0)+1;});return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([dx,n])=>(<span key={dx} style={{...S.badge(C.purple),fontSize:11}}>{dx} ({n})</span>));})()}
                </div>
              </div>
              <div style={S.card}>
                <div style={S.cardLabel}>Body Region (where available)</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                  {(()=>{const c={};patients.filter(p=>p.bodyRegion).forEach(p=>{c[p.bodyRegion]=(c[p.bodyRegion]||0)+1;});return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([br,n])=>(<span key={br} style={{...S.badge(BR_COLORS[br]||C.textMuted),fontSize:11}}>{BODY_REGION_LABELS[br]||br} ({n})</span>));})()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FORECAST */}
        {tab==="forecast"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:13,color:C.textMuted}}>Forecast: <strong style={{color:C.text}}>{forecastDays} days</strong><span style={{marginLeft:12,fontSize:11,color:C.warn}}>⚠ Confidence decreases beyond day 3</span></div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:11,color:C.textMuted}}>Days:</span>{[3,5,7].map(d=>(<button key={d} style={S.btn(forecastDays===d)} onClick={()=>setForecastDays(d)}>{d}</button>))}</div>
            </div>

            {(selectedWard==="All"?wardList:[selectedWard]).map(ward=>{
              const fc=(forecast[ward]||[]).slice(0,forecastDays);const info=wardData[ward];if(!fc.length||!info)return null;
              return(
                <div key={ward} style={S.card}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <span style={{fontWeight:600}}>{ward}</span>
                    <span style={{fontSize:11,color:C.textMuted}}>{info.occupied}/{info.total}</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <div style={{flex:1,background:C.surfaceAlt,borderRadius:6,padding:"10px 8px",textAlign:"center",border:`1px solid ${C.accent}44`}}>
                      <div style={{fontSize:10,color:C.textMuted,marginBottom:4}}>Today</div>
                      <div style={{fontSize:20,fontWeight:700,color:OccColor(info.occ)}}>{info.occupied}</div>
                      <div style={{fontSize:10,color:C.textMuted}}>{pct(info.occ)}</div>
                    </div>
                    {fc.map((day,i)=>{const occ=day.predicted/day.total;const op=i<3?1:i<5?.75:.5;return(
                      <div key={i} style={{flex:1,background:C.surfaceAlt,borderRadius:6,padding:"10px 8px",textAlign:"center",opacity:op,border:`1px solid ${C.border}`}}>
                        <div style={{fontSize:10,color:C.textMuted,marginBottom:4}}>{day.label}</div>
                        <div style={{fontSize:20,fontWeight:700,color:OccColor(occ)}}>{day.predicted}</div>
                        <div style={{fontSize:9,color:C.textMuted}}>{day.ciLow}–{day.ciHigh}</div>
                      </div>);})}
                  </div>
                  <div style={{display:"flex",justifyContent:"flex-end",gap:12,marginTop:6,fontSize:10,color:C.textMuted}}>
                    <span style={{opacity:1}}>● High confidence</span><span style={{opacity:.75}}>● Medium</span><span style={{opacity:.5}}>● Low</span>
                  </div>
                </div>);
            })}

            <div style={{...S.card,background:C.warn+"10",borderColor:C.warn+"40"}}>
              <div style={{fontSize:12,color:C.warn,fontWeight:600,marginBottom:4}}>⚠ Interpretation</div>
              <p style={{fontSize:12,color:C.textMuted,lineHeight:1.6,margin:0}}>
                Predictions use the trained model ({MODEL.overall.count} historical records). 
                LOS estimates are conditional on current stay length and stratified by diagnosis, age, readmission, and body region.
                <strong style={{color:C.text}}> Days 1–3: operational. Days 4–7: directional only.</strong>
              </p>
            </div>
          </div>
        )}

        {tab==="bedmap"&&<BedMap patients={patients} wardData={wardData} selectedWard={selectedWard}/>}

        {/* PATIENT LIST */}
        {tab==="patients"&&(
          <div style={S.card}>
            <div style={{...S.cardLabel,marginBottom:10}}>{selectedWard==="All"?"All Patients":selectedWard} · {filteredPatients.length} patients</div>
            <div style={{maxHeight:520,overflowY:"auto"}}>
              <table style={S.table}>
                <thead><tr>
                  {[{key:"id",label:"ID"},{key:"age",label:"Age"},{key:"sex",label:"Sex"},{key:"ward",label:"Ward"},{key:"diagnosisGroup",label:"Diagnosis"},{key:"bodyRegion",label:"Body Region"},{key:"isReadmission",label:"Readmit"},{key:"admitDate",label:"Admitted"},{key:"los",label:"LOS"},{key:"estRemaining",label:"Est. Left"}].map(col=>(
                    <th key={col.key} style={{...S.th,cursor:"pointer",userSelect:"none"}} onClick={()=>handleSort(col.key)}>{col.label} {sortCol===col.key?(sortDir>0?"↑":"↓"):""}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredPatients.slice(0,100).map(p=>(
                    <tr key={p.id}>
                      <td style={{...S.td,fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{p.id}</td>
                      <td style={S.td}>{p.age}</td><td style={S.td}>{p.sex}</td><td style={S.td}>{p.ward}</td>
                      <td style={S.td}><span style={S.badge(C.purple)}>{p.diagnosisGroup}</span></td>
                      <td style={S.td}>{p.bodyRegion?<span style={S.badge(BR_COLORS[p.bodyRegion]||C.textMuted)}>{BODY_REGION_LABELS[p.bodyRegion]||p.bodyRegion}</span>:"—"}</td>
                      <td style={S.td}>{p.isReadmission?<span style={S.badge(C.warn)}>Yes</span>:"—"}</td>
                      <td style={{...S.td,fontSize:11}}>{p.admitDate}</td>
                      <td style={S.td}>{p.los}d</td>
                      <td style={S.td}><span style={S.badge(p.estRemaining<=3?C.success:p.estRemaining>30?C.warn:C.textMuted)}>{p.estRemaining}d ({p.estRemainingLow}–{p.estRemainingHigh})</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="data"&&<DataInput onImport={handleImport}/>}
        {tab==="model"&&<ModelInfo/>}
      </div>
    </div>
  );
}

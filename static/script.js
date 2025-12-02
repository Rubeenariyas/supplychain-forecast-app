/* static/script.js - particle background + theme + KPI rendering + analytics helpers */

/* ---------------- PARTICLE BACKGROUND ---------------- */
(function particles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = window.innerWidth, H = window.innerHeight, DPR = window.devicePixelRatio || 1;
  function resize() {
    DPR = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  const count = Math.max(28, Math.round(W / 120));
  const colors = ['rgba(155,92,255,0.06)', 'rgba(0,210,255,0.05)', 'rgba(255,77,109,0.04)'];
  const particles = Array.from({ length: count }).map((_, i) => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.14, vy: (Math.random() - 0.5) * 0.06,
    r: 0.8 + Math.random() * 3.2, col: colors[i % colors.length], sway: 0.6 + Math.random() * 1.6, phase: Math.random() * Math.PI * 2
  }));

  function step() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() / 1000;
    particles.forEach(p => {
      p.x += p.vx + Math.sin(t * p.sway + p.phase) * 0.2;
      p.y += p.vy;
      if (p.x < -40) p.x = W + 40; if (p.x > W + 40) p.x = -40;
      if (p.y < -40) p.y = H + 40; if (p.y > H + 40) p.y = -40;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
      g.addColorStop(0, p.col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();

/* ---------------- THEME TOGGLE ---------------- */
(function themeToggle() {
  const toggles = Array.from(document.querySelectorAll('#themeToggle'));
  if (!toggles.length) return;
  const saved = localStorage.getItem('theme') || 'dark';
  document.body.classList.remove('light-mode','dark-mode');
  document.body.classList.add(saved + '-mode');
  toggles.forEach(t => t.checked = saved === 'dark');

  toggles.forEach(toggle => toggle.addEventListener('change', () => {
    const mode = toggle.checked ? 'dark' : 'light';
    document.body.classList.remove('light-mode','dark-mode');
    document.body.classList.add(mode + '-mode');
    localStorage.setItem('theme', mode);
  }));
})();

/* ---------------- UTILS ---------------- */
function toNum(v){ if (v===null||v===undefined||v==='') return NaN; const n = Number(v); return isNaN(n)?NaN:n; }
function sum(a){ return a.reduce((s,x)=>s+(isNaN(x)?0:x),0); }
function avg(a){ return a.length?sum(a)/a.length:0; }

/* ---------------- KPI ICONS + RENDER ---------------- */
const KPI_ICONS = {
  "Total Revenue": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v4M8 6h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10v6a4 4 0 004 4h4a4 4 0 004-4v-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "Average Revenue": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12h3l3 8 4-16 3 8 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "Avg Order Quantity": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 7h18M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7" stroke="currentColor" stroke-width="1.5"/></svg>`,
  "Avg Lead Time": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.2"/></svg>`,
  "Avg Shipping Time": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 7h13l4 4v7a1 1 0 01-1 1H6a1 1 0 01-1-1V7z" stroke="currentColor" stroke-width="1.2"/><circle cx="7.5" cy="18.5" r="1.5" stroke="currentColor" stroke-width="1.2"/></svg>`,
  "Avg Defect Rate": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2l2 7H22" stroke="currentColor" stroke-width="1.5"/><path d="M2 13h20" stroke="currentColor" stroke-width="1.2"/></svg>`,
  };

function computeKPIs(dfLocal, targetCol){
  if (!dfLocal || !dfLocal.length) return {};
  const revenue = dfLocal.map(r=>toNum(r[targetCol])).filter(x=>!isNaN(x));
  const totalRevenue = sum(revenue), average = revenue.length?avg(revenue):0;

  const first = dfLocal[0];
  const find = (candidates) => candidates.find(c => first && (c in first));
  const orderCol = find(['Number of products sold','Order quantities','Order_quantities']);
  const leadCol = find(['Lead times','Manufacturing lead time','Lead_time']);
  const shipCol = find(['Shipping times','Shipping_time','Shipping_times']);
  const defectCol = find(['Defect rates','Defect_rate','Defect_Rate']);
  // const manufCol = find(['Manufacturing costs','Manufacturing_Costs','Manufacturing cost']);

  const avgOrder = orderCol ? avg(dfLocal.map(r => toNum(r[orderCol])).filter(x=>!isNaN(x))) : null;
  const avgLead = leadCol ? avg(dfLocal.map(r=>toNum(r[leadCol])).filter(x=>!isNaN(x))) : null;
  const avgShip = shipCol ? avg(dfLocal.map(r=>toNum(r[shipCol])).filter(x=>!isNaN(x))) : null;
  const avgDef = defectCol ? avg(dfLocal.map(r=>toNum(r[defectCol])).filter(x=>!isNaN(x))) : null;
  // const avgManuf = manufCol ? avg(dfLocal.map(r=>toNum(r[manufCol])).filter(x=>!isNaN(x))) : null;

  return { totalRevenue, average, avgOrder, avgLead, avgShip, avgDef};
}

function renderKPIsToDOM(dfLocal, targetCol){
  const k = computeKPIs(dfLocal, targetCol);
  const container = document.getElementById('kpiRow');
  if (!container) return;
  const items = [
    { label: 'Total Revenue', value: k.totalRevenue?`₹ ${Number(k.totalRevenue).toLocaleString()}`:'N/A' },
    { label: 'Average Revenue', value: k.average?`₹ ${k.average.toFixed(2)}`:'N/A' },
    { label: 'Avg Order Quantity', value: k.avgOrder? k.avgOrder.toFixed(2) : 'N/A' },
    { label: 'Avg Lead Time', value: k.avgLead? `${k.avgLead.toFixed(2)} days`: 'N/A' },
    { label: 'Avg Shipping Time', value: k.avgShip? `${k.avgShip.toFixed(2)} days`: 'N/A' },
    { label: 'Avg Defect Rate', value: k.avgDef? (k.avgDef.toFixed(2) + ' %') : 'N/A' },
    // { label: 'Avg Manufacturing Cost', value: k.avgManuf? `₹ ${k.avgManuf.toFixed(2)}` : 'N/A' }
  ];

  container.innerHTML = items.map(it => `
    <div class="kpi glass" role="group" aria-label="${it.label}">
      <div class="kpi-head">
        <div class="kpi-icon" aria-hidden="true">${KPI_ICONS[it.label] || ''}</div>
        <h4>${it.label}</h4>
      </div>
      <div class="kpi-value">${it.value}</div>
    </div>
  `).join('');
}

/* ---------------- Analytics small renderers (Trend/Pie/Bar/Correlations) -----------
   These functions are used on analytics.html and eda.html pages if Plotly & df are provided.
*/
function renderTrendChart(dfLocal, targetCol, mountId='trendChart'){
  if (!window.Plotly) return;
  if (!dfLocal || !dfLocal.length) return;
  const timeCol = ('Month' in dfLocal[0]) ? 'Month' : (('Date' in dfLocal[0]) ? 'Date' : null);
  let x=[], y=[];
  if (timeCol){
    const agg = {};
    dfLocal.forEach(r => { const k = r[timeCol] ?? 'Unknown'; const v = toNum(r[targetCol]); if (!isNaN(v)) agg[k] = (agg[k]||0) + v; });
    const keys = Object.keys(agg);
    const numeric = keys.every(k => !isNaN(Number(k)));
    const sorted = numeric ? keys.sort((a,b)=>Number(a)-Number(b)) : keys;
    x = sorted; y = sorted.map(k => agg[k]);
  } else {
    x = dfLocal.map((_,i)=>i+1); y = dfLocal.map(r => toNum(r[targetCol]) || 0);
  }
  const trace = { x, y, type:'scatter', mode:'lines+markers', line:{color:'#00D2FF', width:3}, marker:{size:7} };
  const layout = { paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)', margin:{t:20,l:48,r:20,b:40} };
  Plotly.react(mountId, [trace], layout, {responsive:true,displayModeBar:false});
}

function renderProductPie(dfLocal, mountId='productPie', targetCol){
  if (!window.Plotly) return;
  if (!dfLocal || !dfLocal.length) return;

  const col = ('Product type' in dfLocal[0]) 
                ? 'Product type' 
                : Object.keys(dfLocal[0]).find(k=>/product/i.test(k));

  if (!col) return;

  const sums = {};
  dfLocal.forEach(r=>{
    const k = r[col] ?? 'Missing';
    const v = toNum(r[targetCol]);
    if (!isNaN(v)) sums[k] = (sums[k]||0) + v;
  });

  const data = [{
    labels: Object.keys(sums),
    values: Object.values(sums),
    type: "pie",
    hole: 0.45,
    textinfo: "label+percent",
    textposition: "inside",
    automargin: true
  }];

  const layout = {
    height: 260,        // 🔥 Increased height
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { t: 10, b: 10, l: 10, r: 10 },
  };

  Plotly.react(mountId, data, layout, {responsive:true, displayModeBar:false});
}

function renderSeasonBar(dfLocal, mountId='seasonBar', targetCol){
  if (!window.Plotly) return;
  if (!dfLocal || !dfLocal.length) return;

  const candidates = ["Season","Seasonal_Factor","season"];
  const col = candidates.find(c => c in dfLocal[0]) || Object.keys(dfLocal[0]).find(k=>/season/i.test(k));

  if (!col) return;

  const sums = {};
  dfLocal.forEach(r=>{
    const k = r[col] ?? "Missing";
    const v = toNum(r[targetCol]);
    if (!isNaN(v)) sums[k]=(sums[k]||0)+v;
  });

  const x = Object.keys(sums);
  const y = x.map(k=>sums[k]);

  const data = [{
    x, y,
    type: "bar",
    marker: { color: "#B06BFF" }
  }];

  const layout = {
    height: 260,        // 🔥 Increased height
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { t: 30, b: 60, l: 50, r: 10 }
  };

  Plotly.react(mountId, data, layout, {responsive:true, displayModeBar:false});
}

/* ---------- Correlation -> PowerBI-style insight cards ---------- */

function computeTopCorrelations(dfLocal, numericCols, targetCol){
  function corr(x,y){
    const n = x.length; if (n < 2) return 0;
    const xm = avg(x), ym = avg(y);
    let num = 0, dx = 0, dy = 0;
    for (let i = 0; i < n; i++){ const a = x[i] - xm, b = y[i] - ym; num += a*b; dx += a*a; dy += b*b; }
    return num / Math.sqrt((dx*dy) || 1);
  }

  const results = [];
  const targetVec = dfLocal.map(r => toNum(r[targetCol]));

  numericCols.forEach(col => {
    if (col === targetCol) return;
    const vcol = dfLocal.map(r => toNum(r[col]));
    const paired = vcol.map((v,i)=>({x:v,y:targetVec[i]})).filter(p => !isNaN(p.x) && !isNaN(p.y));
    if (paired.length < 5) return; // require minimal rows
    const xs = paired.map(p=>p.x), ys = paired.map(p=>p.y);
    results.push({ col, corr: corr(xs, ys) });
  });

  results.sort((a,b) => Math.abs(b.corr) - Math.abs(a.corr));
  return results;
}

function shortLabel(k){
  return k.replace(/_/g,' ').replace(/\b([a-z])/g, s => s.toUpperCase());
}

/* small helper to pick style class & icon based on correlation */
function styleForCorr(c){
  const absC = Math.abs(c);
  if (absC >= 0.5) return { cls: 'card-positive', iconCls: 'icon-positive', tone: 'positive', emoji: '📈' };
  if (absC >= 0.3) return { cls: 'card-neutral',  iconCls: 'icon-neutral',  tone: 'neutral',  emoji: '⚖️'  };
  return { cls: 'card-negative', iconCls: 'icon-negative', tone: 'negative', emoji: '⚠️' };
}

/* Generate a single card element HTML */
function buildInsightCardHTML(col, corr){
  const s = styleForCorr(corr);
  const dir = corr > 0 ? 'positively' : 'negatively';
  const strength = Math.abs(corr);
  const strengthText = strength >= 0.75 ? 'very strong' : (strength >= 0.5 ? 'strong' : (strength >= 0.3 ? 'moderate' : 'weak'));

  // small actions (buttons) - non-functional but visually like PowerBI
  const actions = `
    <div class="insight-actions">
      <button class="btn" style="background:rgba(255,255,255,0.03);color:var(--neon1);border-radius:8px;">Explore</button>
      <button class="btn" style="background:rgba(255,255,255,0.03);color:var(--neon2);border-radius:8px;">Drill</button>
    </div>
  `;

  return `
    <div class="insight-card-mini ${s.cls}">
      <div class="insight-icon ${s.iconCls}" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.12"></rect>
          <path d="M6 16L10 11L14 15L18 9" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="insight-body">
        <div class="insight-title">${shortLabel(col)}</div>
        <div class="insight-sub">
          Corr: <b>${corr.toFixed(2)}</b> — ${shortLabel(col)} is ${dir} correlated with revenue.
          This is a <b>${strengthText}</b> relationship.
        </div>

        ${actions}
      </div>
    </div>
  `;
}





// extraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

function renderDemoChart(dfLocal, targetCol) {
  if (!window.Plotly) return;

  const col = "Customer demographics";
  if (!(col in dfLocal[0])) return;

  const sums = {};
  dfLocal.forEach(r=>{
    const k = r[col] ?? "Unknown";
    const v = toNum(r[targetCol]);
    if (!isNaN(v)) sums[k] = (sums[k] || 0) + v;
  });

  const x = Object.keys(sums);
  const y = Object.values(sums);

  const data = [{
    x, y,
    type: "bar",
    marker: { color: "#6A5CFF" },
  }];

  const layout = {
    height: 260,   // 🔥 same style as Season chart
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { t: 30, b: 60, l: 50, r: 10 },
    yaxis: { automargin:true }
  };

  Plotly.react("demoBar", data, layout, {responsive: true, displayModeBar: false});
}




function renderRevCost(dfLocal, targetCol) {
  if (!window.Plotly) return;

  const col = "Costs";
  if (!(col in dfLocal[0])) return;

  const revenue = dfLocal.map(r => toNum(r[targetCol]));
  const costs = dfLocal.map(r => toNum(r[col]));
  const idx = dfLocal.map((_, i) => i + 1);

  const data = [
    {
      x: idx,
      y: revenue,
      name: "Revenue",
      type: "bar",
      marker: { color: "#00C8FF" }
    },
    {
      x: idx,
      y: costs,
      name: "Costs",
      type: "bar",
      marker: { color: "#FF6A6A" }
    }
  ];

  const layout = {
    height: 260,   // 🔥 matches theme
    barmode: "group",
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { t: 30, b: 60, l: 50, r: 10 },
    legend: {
      orientation: "h",
      x: 0.5,
      xanchor: "center",
      y: -0.2
    }
  };

  Plotly.react("revCost", data, layout, {responsive: true, displayModeBar: false});
}




/* Render into DOM (replaces previous function) */
function renderCorrelationInsights(dfLocal, numericCols, targetCol){
  const grid = document.getElementById('insightGrid');
  const rec = document.getElementById('insightRecommendations');
  if (!grid || !rec) return;

  const res = computeTopCorrelations(dfLocal, numericCols, targetCol);

  // cards grid (top 6)
  grid.innerHTML = res.slice(0, 6).map(r => buildInsightCardHTML(r.col, r.corr)).join('');

  // recommendations (top 3)
  rec.innerHTML = buildRecommendations(res);
}


/* ---------------- INIT on DOM ready ---------------- */
document.addEventListener('DOMContentLoaded', function(){
  // If analytics page, df/numericCols should be provided by template
  try {
    if (typeof df !== 'undefined' && df && df.length && typeof target !== 'undefined') {
      renderKPIsToDOM(df, target);
      if (window.Plotly) {
        try { renderTrendChart(df, target); } catch(e){}
        try { renderProductPie(df, 'productPie', target); } catch(e){}
        try { renderSeasonBar(df, 'seasonBar', target); } catch(e){}
        try { renderCorrelationInsights(df, (typeof numericCols !== 'undefined' ? numericCols : []), target); } catch(e){}
        try { renderDemoChart(df, target); } catch(e){}
try { renderRevCost(df, target); } catch(e){}


      }

    } else {
      // fallback: try to use serverKPIs if provided
      if (typeof serverKPIs !== 'undefined' && serverKPIs !== null) {
        // leave server value as-is; KPIs updated on analytics page only
      }
    }
  } catch (e) { console.warn('init error', e); }

  // EDA page: auto fill selects if present & attach draw handler
  try {
    if (typeof numericCols !== 'undefined' && document.getElementById('xSelect')) {
      function fill(sel, arr, includeEmpty=true){
        if (!sel) return;
        let html = includeEmpty?'<option value="">-- Select --</option>':'';
        arr.forEach(v=> html += `<option value="${v}">${v}</option>`);
        sel.innerHTML = html;
      }
      fill(document.getElementById('xSelect'), numericCols.concat(typeof categoricalCols!=='undefined'?categoricalCols:[]));
      fill(document.getElementById('ySelect'), numericCols, false);
      fill(document.getElementById('zSelect'), numericCols, false);
      if (document.getElementById('colorSelect')) fill(document.getElementById('colorSelect'), numericCols.concat(typeof categoricalCols!=='undefined'?categoricalCols:[]));
      if (document.getElementById('groupSelect')) fill(document.getElementById('groupSelect'), typeof categoricalCols!=='undefined'?categoricalCols:[]);
    }
    // // EDA draw button behaviour (lightweight)
    // const chartType = document.getElementById('chartType');
    // if (chartType) {
    //   const controls = ['xDiv','yDiv','zDiv','colorDiv','groupDiv'];
    //   function hideAll(){ controls.forEach(i=>{ const el=document.getElementById(i); if(el) el.classList.add('hidden'); }); }
    //   chartType.addEventListener('change', (e)=>{
    //     hideAll();
    //     const v = e.target.value;
    //     if (v==='hist' || v==='box' || v==='pie' || v==='bar') document.getElementById('xDiv').classList.remove('hidden');
    //     if (v==='scatter2d') { document.getElementById('xDiv').classList.remove('hidden'); document.getElementById('yDiv').classList.remove('hidden'); document.getElementById('colorDiv').classList.remove('hidden'); }
    //     if (v==='scatter3d') { document.getElementById('xDiv').classList.remove('hidden'); document.getElementById('yDiv').classList.remove('hidden'); document.getElementById('zDiv').classList.remove('hidden'); }
    //   });

    //   const drawBtn = document.getElementById('drawBtn');
    //   if (drawBtn) {
    //     drawBtn.addEventListener('click', (ev)=>{
    //       ev.preventDefault();
    //       const chart = chartType.value;
    //       if (!chart) { alert('Select chart type'); return; }
    //       const x = document.getElementById('xSelect')?document.getElementById('xSelect').value:''; const y = document.getElementById('ySelect')?document.getElementById('ySelect').value:''; const z = document.getElementById('zSelect')?document.getElementById('zSelect').value:''; 
    //       const status = document.getElementById('chartStatus'); if (status) status.innerText = 'Rendering...';
    //       try {
    //         if (chart==='hist') {
    //           if (!x) { alert('Select X'); return; }
    //           const vals = df.map(r=>toNum(r[x])).filter(v=>!isNaN(v));
    //           Plotly.newPlot('chartArea', [{ x: vals, type: 'histogram' }], {}, {responsive:true});
    //         } else if (chart==='box') {
    //           if (!x) { alert('Select X'); return; }
    //           const vals = df.map(r=>toNum(r[x])).filter(v=>!isNaN(v));
    //           Plotly.newPlot('chartArea', [{ y: vals, type: 'box' }], {}, {responsive:true});
    //         } else if (chart==='pie') {
    //           if (!x) { alert('Select categorical'); return; }
    //           const counts={}; df.forEach(r=>{ const k = r[x] ?? 'Missing'; counts[k] = (counts[k]||0)+1; });
    //           Plotly.newPlot('chartArea',[{ labels:Object.keys(counts), values:Object.values(counts), type:'pie' }], {}, {responsive:true});
    //         } else if (chart==='bar') {
    //           if (!x) { alert('Select X'); return; }
    //           const sums={}; df.forEach(r=>{ const k = r[x] ?? 'Missing'; const v = toNum(r[target])||0; sums[k]=(sums[k]||0)+v; });
    //           Plotly.newPlot('chartArea',[{ x:Object.keys(sums), y:Object.values(sums), type:'bar' }], {}, {responsive:true});
    //         } else if (chart==='scatter2d'){
    //           if (!x||!y){ alert('Select X & Y'); return; }
    //           const trace = { x: df.map(r=>toNum(r[x])), y: df.map(r=>toNum(r[y])), mode:'markers', type:'scatter' };
    //           Plotly.newPlot('chartArea', [trace], {}, {responsive:true});
    //         } else if (chart==='scatter3d'){
    //           if (!x||!y||!z){ alert('Select X,Y,Z'); return; }
    //           Plotly.newPlot('chartArea', [{ x: df.map(r=>toNum(r[x])), y: df.map(r=>toNum(r[y])), z: df.map(r=>toNum(r[z])), mode:'markers', type:'scatter3d' }], {}, {responsive:true});
    //         } else if (chart==='heatmap'){
    //           const cols = numericCols;
    //           const matrix = cols.map(c1 => cols.map(c2 => {
    //             const pts = df.map(r=>({x:toNum(r[c1]), y:toNum(r[c2])})).filter(p=>!isNaN(p.x)&&!isNaN(p.y));
    //             if (pts.length<2) return 0;
    //             const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y); const xm=avg(xs), ym=avg(ys);
    //             let num=0, dx=0, dy=0;
    //             for (let i=0;i<xs.length;i++){ const a=xs[i]-xm,b=ys[i]-ym; num+=a*b; dx+=a*a; dy+=b*b; }
    //             return num/Math.sqrt(dx*dy||1);
    //           }));
    //           Plotly.newPlot('chartArea',[{ z: matrix, x: cols, y: cols, type:'heatmap', colorscale:'RdBu' }], {}, {responsive:true});
    //         }
    //         if (status) status.innerText = 'Rendered';
    //       } catch (err) {
    //         console.error(err); alert('Error: '+err.message);
    //         if (status) status.innerText = 'Error';
    //       }
    //     });
    //   }
    // }
  } catch (e) {}
});

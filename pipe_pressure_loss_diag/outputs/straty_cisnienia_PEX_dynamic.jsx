import { useState, useEffect, useRef, useCallback } from "react";
import * as Chart from "chart.js";

// Register Chart.js components
Chart.Chart.register(
  Chart.LineController,
  Chart.LineElement,
  Chart.PointElement,
  Chart.LinearScale,
  Chart.LogarithmicScale,
  Chart.Tooltip,
  Chart.Legend,
  Chart.Filler
);

// ─── Physics ───
const WATER_PROPS = {
  20: { rho: 998.0, mu: 1.002e-3, label: "20°C" },
  40: { rho: 992.2, mu: 0.653e-3, label: "40°C" },
  60: { rho: 983.2, mu: 0.467e-3, label: "60°C" },
  80: { rho: 971.8, mu: 0.3544e-3, label: "80°C" },
  90: { rho: 965.3, mu: 0.315e-3, label: "90°C" },
};

const ROUGHNESS = 7e-6;

const DIAMETERS_MM = [25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160];

const SDR_OPTIONS = [
  { value: 7.4, label: "SDR 7.4 (PN 16)" },
  { value: 9, label: "SDR 9 (PN 12.5)" },
  { value: 11, label: "SDR 11 (PN 10)" },
  { value: 17, label: "SDR 17 (PN 6)" },
];

const PIPE_COLORS = [
  "#E63946", "#D62828", "#F77F00", "#E9A820",
  "#2A9D8F", "#264653", "#457B9D", "#1D3557",
  "#6A4C93", "#B5838D", "#588157",
];

// ─── Hydraulic calculations ───
function colebrookFriction(Re, D) {
  if (Re < 2320) return 64.0 / Re;
  let f = 0.25 / Math.pow(Math.log10(ROUGHNESS / (3.7 * D) + 5.74 / Math.pow(Re, 0.9)), 2);
  for (let i = 0; i < 50; i++) {
    const rhs = -2.0 * Math.log10(ROUGHNESS / (3.7 * D) + 2.51 / (Re * Math.sqrt(f)));
    const fNew = 1.0 / (rhs * rhs);
    if (Math.abs(fNew - f) / f < 1e-10) break;
    f = fNew;
  }
  return f;
}

function calcPressureLoss(flowKgh, dIn, rho, mu) {
  const nu = mu / rho;
  const flowM3s = flowKgh / (rho * 3600.0);
  const A = Math.PI * dIn * dIn / 4.0;
  const v = flowM3s / A;
  const Re = v * dIn / nu;
  if (Re < 1.0) return 0;
  const f = colebrookFriction(Re, dIn);
  return f * (rho * v * v) / (2.0 * dIn);
}

function findFlowForDp(targetDp, dIn, rho, mu) {
  let qMin = 0.1, qMax = 500000;
  for (let i = 0; i < 200; i++) {
    const qMid = (qMin + qMax) / 2.0;
    const dpMid = calcPressureLoss(qMid, dIn, rho, mu);
    if (Math.abs(dpMid - targetDp) < 0.01) return qMid;
    if (dpMid < targetDp) qMin = qMid; else qMax = qMid;
  }
  return (qMin + qMax) / 2.0;
}

function getPipes(sdr) {
  return DIAMETERS_MM.map((dn) => {
    const wall = dn / sdr;
    const dIn = (dn - 2 * wall) / 1000.0;
    return { dn, wall: Math.round(wall * 10) / 10, dIn, label: `Ø${dn}` };
  });
}

// ─── Crosshair plugin ───
const crosshairPlugin = {
  id: "crosshair",
  afterDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const meta = chart._crosshairMeta;
    if (!meta || !meta.x || !meta.y) return;
    const { left, right, top, bottom } = chartArea;
    if (meta.x < left || meta.x > right || meta.y < top || meta.y > bottom) return;

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(150,150,150,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(meta.x, top);
    ctx.lineTo(meta.x, bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(left, meta.y);
    ctx.lineTo(right, meta.y);
    ctx.stroke();

    // Axis labels
    const xVal = scales.x.getValueForPixel(meta.x);
    const yVal = scales.y.getValueForPixel(meta.y);
    if (xVal > 0 && yVal > 0) {
      ctx.setLineDash([]);
      ctx.font = "bold 11px monospace";

      // X label
      ctx.fillStyle = "rgba(30,30,30,0.85)";
      const xText = `${xVal.toFixed(0)} Pa/m`;
      const xW = ctx.measureText(xText).width + 8;
      ctx.fillRect(meta.x - xW / 2, bottom + 4, xW, 18);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(xText, meta.x, bottom + 7);

      // Y label
      ctx.fillStyle = "rgba(30,30,30,0.85)";
      const yText = `${yVal.toFixed(0)} kg/h`;
      const yW = ctx.measureText(yText).width + 8;
      ctx.fillRect(left - yW - 6, meta.y - 9, yW, 18);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(yText, left - 8, meta.y);
    }
    ctx.restore();
  },
};

Chart.Chart.register(crosshairPlugin);

// ─── Component ───
export default function PressureLossChart() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [temp, setTemp] = useState(80);
  const [sdr, setSdr] = useState(7.4);
  const [enabledPipes, setEnabledPipes] = useState(
    Object.fromEntries(DIAMETERS_MM.map((d) => [d, true]))
  );
  const [showVelocity, setShowVelocity] = useState(true);
  const [velStep, setVelStep] = useState(0.1);
  const [dpMin, setDpMin] = useState(10);
  const [dpMax, setDpMax] = useState(1000);
  const [hoverInfo, setHoverInfo] = useState(null);

  const togglePipe = (dn) =>
    setEnabledPipes((prev) => ({ ...prev, [dn]: !prev[dn] }));

  const buildChart = useCallback(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const { rho, mu } = WATER_PROPS[temp];
    const pipes = getPipes(sdr);
    const dpRange = [];
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      dpRange.push(Math.pow(10, Math.log10(dpMin) + (i / steps) * (Math.log10(dpMax) - Math.log10(dpMin))));
    }

    // Pipe datasets
    const datasets = [];
    pipes.forEach((p, i) => {
      if (!enabledPipes[p.dn]) return;
      const data = dpRange.map((dp) => ({
        x: dp,
        y: findFlowForDp(dp, p.dIn, rho, mu),
      }));
      datasets.push({
        label: `Ø${p.dn} (d=${(p.dIn * 1000).toFixed(1)})`,
        data,
        borderColor: PIPE_COLORS[i],
        backgroundColor: PIPE_COLORS[i] + "20",
        borderWidth: 2.5,
        pointRadius: 0,
        pointHitRadius: 8,
        tension: 0.4,
        order: 1,
        pipeIndex: i,
      });
    });

    // Velocity datasets
    if (showVelocity) {
      const maxV = 5.0;
      const majorV = new Set([0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0]);
      for (let v = velStep; v <= maxV + 0.001; v = Math.round((v + velStep) * 100) / 100) {
        const data = [];
        pipes.forEach((p) => {
          if (!enabledPipes[p.dn]) return;
          const A = Math.PI * p.dIn * p.dIn / 4.0;
          const qKgh = v * A * rho * 3600.0;
          const dp = calcPressureLoss(qKgh, p.dIn, rho, mu);
          if (dp >= dpMin && dp <= dpMax) data.push({ x: dp, y: qKgh });
        });
        if (data.length >= 2) {
          data.sort((a, b) => a.x - b.x);
          const isMajor = majorV.has(Math.round(v * 10) / 10);
          datasets.push({
            label: `${v.toFixed(1)} m/s`,
            data,
            borderColor: isMajor ? "rgba(100,100,100,0.5)" : "rgba(170,170,170,0.3)",
            borderWidth: isMajor ? 1.2 : 0.6,
            borderDash: isMajor ? [6, 4] : [3, 3],
            pointRadius: 0,
            tension: 0.3,
            order: 2,
            isVelocity: true,
            velocityValue: v,
            isMajorVelocity: isMajor,
          });
        }
      }
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart.Chart(ctx, {
      type: "line",
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
        onHover(e) {
          const chart = chartRef.current;
          if (!chart) return;
          const rect = chart.canvas.getBoundingClientRect();
          chart._crosshairMeta = {
            x: e.native ? e.native.offsetX * (chart.canvas.width / rect.width) / (window.devicePixelRatio || 1) : null,
            y: e.native ? e.native.offsetY * (chart.canvas.height / rect.height) / (window.devicePixelRatio || 1) : null,
          };

          // Find nearest pipe point
          const elements = chart.getElementsAtEventForMode(e, "nearest", { intersect: false }, false);
          if (elements.length > 0) {
            const el = elements[0];
            const ds = chart.data.datasets[el.datasetIndex];
            if (!ds.isVelocity) {
              const pt = ds.data[el.index];
              const dIn = pipes.find((p) => ds.label.startsWith(`Ø${p.dn}`))?.dIn;
              if (dIn && pt) {
                const A = Math.PI * dIn * dIn / 4.0;
                const qM3s = pt.y / (rho * 3600);
                const vel = qM3s / A;
                setHoverInfo({
                  pipe: ds.label,
                  dp: pt.x.toFixed(1),
                  flow: pt.y.toFixed(0),
                  velocity: vel.toFixed(2),
                  color: ds.borderColor,
                });
              }
            }
          } else {
            setHoverInfo(null);
          }
          chart.draw();
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            filter: (item) => !item.dataset.isVelocity,
            callbacks: {
              title: (items) => items[0]?.dataset.label || "",
              label: (item) => {
                const dp = item.parsed.x.toFixed(1);
                const q = item.parsed.y.toFixed(0);
                return `  ${dp} Pa/m → ${q} kg/h`;
              },
            },
            backgroundColor: "rgba(20,20,30,0.92)",
            titleFont: { size: 13, weight: "bold" },
            bodyFont: { size: 12, family: "monospace" },
            padding: 10,
            cornerRadius: 6,
          },
        },
        scales: {
          x: {
            type: "logarithmic",
            min: dpMin,
            max: dpMax,
            title: {
              display: true,
              text: "Strata ciśnienia [Pa/m]",
              font: { size: 14, weight: "bold" },
              padding: 10,
            },
            grid: { color: "rgba(0,0,0,0.08)" },
            ticks: {
              callback: (v) => {
                const nice = [10, 20, 30, 50, 80, 100, 150, 200, 300, 500, 800, 1000, 2000, 5000, 10000];
                return nice.includes(Math.round(v)) ? v : "";
              },
              font: { size: 11 },
              maxRotation: 0,
            },
          },
          y: {
            type: "logarithmic",
            title: {
              display: true,
              text: "Przepływ masowy [kg/h]",
              font: { size: 14, weight: "bold" },
              padding: 10,
            },
            grid: { color: "rgba(0,0,0,0.08)" },
            ticks: {
              callback: (v) => {
                const nice = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];
                return nice.includes(Math.round(v)) ? v.toLocaleString() : "";
              },
              font: { size: 11 },
            },
          },
        },
        animation: { duration: 600, easing: "easeOutQuart" },
      },
    });
  }, [temp, sdr, enabledPipes, showVelocity, velStep, dpMin, dpMax]);

  useEffect(() => {
    buildChart();
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [buildChart]);

  const pipes = getPipes(sdr);

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
      background: "linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0f172a 100%)",
      color: "#e2e8f0",
      minHeight: "100vh",
      padding: "16px",
    }}>
      {/* Header */}
      <div style={{
        textAlign: "center",
        marginBottom: 16,
        padding: "16px 0 12px",
        borderBottom: "1px solid rgba(100,160,255,0.15)",
      }}>
        <h1 style={{
          fontSize: 22,
          fontWeight: 800,
          margin: 0,
          letterSpacing: "-0.5px",
          background: "linear-gradient(90deg, #60a5fa, #34d399, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Straty ciśnienia w rurach PEX
        </h1>
        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
          Darcy-Weisbach / Colebrook-White • k = 7 μm
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginBottom: 14,
      }}>
        {/* Temperature */}
        <div style={cardStyle}>
          <label style={labelStyle}>Temperatura wody</label>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {Object.entries(WATER_PROPS).map(([t, props]) => (
              <button key={t} onClick={() => setTemp(Number(t))}
                style={{
                  ...btnStyle,
                  background: temp === Number(t) ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "rgba(255,255,255,0.05)",
                  color: temp === Number(t) ? "#fff" : "#94a3b8",
                  fontWeight: temp === Number(t) ? 700 : 400,
                }}>
                {props.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
            ρ = {WATER_PROPS[temp].rho} kg/m³ &nbsp;|&nbsp; μ = {(WATER_PROPS[temp].mu * 1000).toFixed(4)} mPa·s
          </div>
        </div>

        {/* SDR */}
        <div style={cardStyle}>
          <label style={labelStyle}>Typ rury (SDR)</label>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {SDR_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setSdr(opt.value)}
                style={{
                  ...btnStyle,
                  background: sdr === opt.value ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.05)",
                  color: sdr === opt.value ? "#fff" : "#94a3b8",
                  fontWeight: sdr === opt.value ? 700 : 400,
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pressure range */}
        <div style={cardStyle}>
          <label style={labelStyle}>Zakres strat ciśnienia [Pa/m]</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select value={dpMin} onChange={(e) => setDpMin(Number(e.target.value))} style={selectStyle}>
              {[1, 5, 10, 20, 50, 100].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <span style={{ color: "#64748b" }}>—</span>
            <select value={dpMax} onChange={(e) => setDpMax(Number(e.target.value))} style={selectStyle}>
              {[500, 1000, 2000, 5000, 10000].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Velocity */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={labelStyle}>Krzywe prędkości</label>
            <button onClick={() => setShowVelocity(!showVelocity)}
              style={{
                ...btnStyle,
                fontSize: 10,
                padding: "2px 8px",
                background: showVelocity ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)",
                color: showVelocity ? "#34d399" : "#64748b",
              }}>
              {showVelocity ? "ON" : "OFF"}
            </button>
          </div>
          {showVelocity && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[0.1, 0.2, 0.5, 1.0].map((s) => (
                <button key={s} onClick={() => setVelStep(s)}
                  style={{
                    ...btnStyle,
                    background: velStep === s ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "rgba(255,255,255,0.05)",
                    color: velStep === s ? "#fff" : "#94a3b8",
                    fontWeight: velStep === s ? 700 : 400,
                  }}>
                  co {s} m/s
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pipe toggles */}
      <div style={{
        display: "flex", gap: 6, flexWrap: "wrap",
        marginBottom: 14, justifyContent: "center",
      }}>
        <button onClick={() => setEnabledPipes(Object.fromEntries(DIAMETERS_MM.map((d) => [d, true])))}
          style={{ ...btnStyle, fontSize: 10, color: "#60a5fa", borderColor: "rgba(96,165,250,0.3)" }}>
          ▪ Wszystkie
        </button>
        <button onClick={() => setEnabledPipes(Object.fromEntries(DIAMETERS_MM.map((d) => [d, false])))}
          style={{ ...btnStyle, fontSize: 10, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>
          ▫ Żadna
        </button>
        {pipes.map((p, i) => (
          <button key={p.dn} onClick={() => togglePipe(p.dn)}
            style={{
              ...btnStyle,
              background: enabledPipes[p.dn] ? PIPE_COLORS[i] + "30" : "rgba(255,255,255,0.03)",
              color: enabledPipes[p.dn] ? PIPE_COLORS[i] : "#475569",
              borderColor: enabledPipes[p.dn] ? PIPE_COLORS[i] + "60" : "rgba(255,255,255,0.08)",
              fontWeight: enabledPipes[p.dn] ? 700 : 400,
            }}>
            Ø{p.dn}
            <span style={{ fontSize: 9, opacity: 0.7, marginLeft: 2 }}>
              ({(p.dIn * 1000).toFixed(1)})
            </span>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        position: "relative",
        background: "rgba(255,255,255,0.97)",
        borderRadius: 10,
        padding: "12px 8px 8px",
        height: "min(55vh, 520px)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
      }}>
        <canvas ref={canvasRef} />
      </div>

      {/* Hover info bar */}
      {hoverInfo && (
        <div style={{
          marginTop: 10,
          padding: "8px 14px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 8,
          display: "flex",
          gap: 20,
          justifyContent: "center",
          alignItems: "center",
          fontSize: 13,
          border: `1px solid ${hoverInfo.color}40`,
        }}>
          <span style={{ color: hoverInfo.color, fontWeight: 700 }}>{hoverInfo.pipe}</span>
          <span>ΔP = <b>{hoverInfo.dp}</b> Pa/m</span>
          <span>Q = <b>{hoverInfo.flow}</b> kg/h</span>
          <span>v = <b>{hoverInfo.velocity}</b> m/s</span>
        </div>
      )}

      {/* Dimensions table */}
      <div style={{
        marginTop: 14,
        background: "rgba(255,255,255,0.04)",
        borderRadius: 8,
        padding: 12,
        overflow: "auto",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(100,160,255,0.2)" }}>
              <th style={thStyle}>Ø zew.</th>
              <th style={thStyle}>Ścianka</th>
              <th style={thStyle}>d wewn.</th>
              <th style={thStyle}>Pole A</th>
              {[50, 100, 200, 500].map((dp) => (
                <th key={dp} style={thStyle}>{dp} Pa/m</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pipes.map((p, i) => {
              const A = Math.PI * p.dIn * p.dIn / 4.0 * 1e6;
              const { rho: r, mu: m } = WATER_PROPS[temp];
              return (
                <tr key={p.dn} style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  opacity: enabledPipes[p.dn] ? 1 : 0.35,
                  cursor: "pointer",
                }} onClick={() => togglePipe(p.dn)}>
                  <td style={{ ...tdStyle, color: PIPE_COLORS[i], fontWeight: 700 }}>Ø{p.dn} mm</td>
                  <td style={tdStyle}>{p.wall.toFixed(1)} mm</td>
                  <td style={tdStyle}>{(p.dIn * 1000).toFixed(1)} mm</td>
                  <td style={tdStyle}>{A.toFixed(0)} mm²</td>
                  {[50, 100, 200, 500].map((dp) => (
                    <td key={dp} style={{ ...tdStyle, color: "#60a5fa" }}>
                      {findFlowForDp(dp, p.dIn, r, m).toFixed(0)} kg/h
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: "center", fontSize: 10, color: "#475569", marginTop: 10, padding: "4px 0" }}>
        Obliczenia hydrauliczne rur PEX • Darcy-Weisbach / Colebrook-White • Interaktywny wykres
      </div>
    </div>
  );
}

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  borderRadius: 8,
  padding: "10px 12px",
  border: "1px solid rgba(255,255,255,0.06)",
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: "#94a3b8",
  marginBottom: 6,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const btnStyle = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 5,
  padding: "4px 10px",
  fontSize: 11,
  cursor: "pointer",
  transition: "all 0.15s",
  background: "rgba(255,255,255,0.05)",
  fontFamily: "inherit",
};

const selectStyle = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 5,
  padding: "4px 8px",
  color: "#e2e8f0",
  fontSize: 12,
  fontFamily: "inherit",
  cursor: "pointer",
};

const thStyle = {
  padding: "6px 8px",
  textAlign: "right",
  color: "#94a3b8",
  fontWeight: 600,
  fontSize: 10,
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "5px 8px",
  textAlign: "right",
  fontSize: 11,
};

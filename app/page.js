"use client";
import { useState } from "react";

const DEFAULT_DATA = {
  priceNow: 159500,
  price6MonthAgo: 93400,
  chinaImportPct: 72.4,
  top3Production: 84,
  geoEvents: 6,
  supplyDeficit: 80000,
};

const DEFAULT_CONTEXT = [
  "한국은 리튬 전량 수입 의존",
  "2026.1~2월 대중국 수입 비중 44.6%로 다변화 진행 중",
  "EV + AI 데이터센터 ESS 수요 동시 급증",
  "JP모건 2026년 리튬 가격 톤당 17,500달러 전망",
];

const RISK_FACTORS = [
  { key: "priceVolatility", label: "가격 변동성", weight: 0.15, icon: "📉", unit: "6개월 변동률" },
  { key: "importDependency", label: "수입 의존도", weight: 0.25, icon: "🚢", unit: "대중국 비중" },
  { key: "productionConcentration", label: "생산 집중도", weight: 0.15, icon: "⛏️", unit: "상위3국 점유율" },
  { key: "geopoliticalRisk", label: "지정학적 리스크", weight: 0.20, icon: "🌍", unit: "이벤트 건수" },
  { key: "supplyDemandGap", label: "수급 균형", weight: 0.25, icon: "⚖️", unit: "공급부족(톤)" },
];

function calcVolatility(now, ago) {
  if (!ago || ago === 0) return 0;
  return Math.abs((now - ago) / ago) * 100;
}
function scorePrice(v) { return v >= 30 ? 3 : v >= 10 ? 2 : 1; }
function scoreImport(p) { return p >= 60 ? 3 : p >= 40 ? 2 : 1; }
function scoreProd(p) { return p >= 80 ? 3 : p >= 60 ? 2 : 1; }
function scoreGeo(e) { return e >= 3 ? 3 : e >= 1 ? 2 : 1; }
function scoreSupply(d) { return d >= 50000 ? 3 : d > 0 ? 2 : 1; }

function getRisk(score) {
  if (score >= 2.3) return { level: "HIGH", color: "#dc2626", bg: "#fef2f2", glow: "rgba(220,38,38,0.3)" };
  if (score >= 1.7) return { level: "MEDIUM", color: "#d97706", bg: "#fffbeb", glow: "rgba(217,119,6,0.3)" };
  return { level: "LOW", color: "#16a34a", bg: "#f0fdf4", glow: "rgba(22,163,74,0.3)" };
}

function RiskGauge({ score }) {
  const risk = getRisk(score);
  const angle = ((score - 1) / 2) * 180;
  const rad = (angle * Math.PI) / 180;
  const size = 260, cx = size / 2, cy = size / 2, r = size / 2 - 24;

  const segs = [
    { s: 0, e: 60, c: "#16a34a" },
    { s: 60, e: 120, c: "#d97706" },
    { s: 120, e: 180, c: "#dc2626" },
  ];

  return (
    <div style={{ position: "relative", width: size, height: size / 2 + 40, margin: "0 auto" }}>
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {segs.map((seg, i) => {
          const sa = (seg.s * Math.PI) / 180, ea = (seg.e * Math.PI) / 180;
          return (
            <path key={i}
              d={`M ${cx - r * Math.cos(sa)} ${cy - r * Math.sin(sa)} A ${r} ${r} 0 0 1 ${cx - r * Math.cos(ea)} ${cy - r * Math.sin(ea)}`}
              fill="none" stroke={seg.c} strokeWidth="16" strokeLinecap="round" opacity={0.2}
            />
          );
        })}
        <path
          d={`M ${cx + r} ${cy} A ${r} ${r} 0 ${angle > 90 ? 1 : 0} 0 ${cx - r * Math.cos(rad)} ${cy - r * Math.sin(rad)}`}
          fill="none" stroke={risk.color} strokeWidth="16" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 10px ${risk.glow})`, transition: "all 0.8s ease" }}
        />
        <line x1={cx} y1={cy} x2={cx - (r - 30) * Math.cos(rad)} y2={cy - (r - 30) * Math.sin(rad)}
          stroke={risk.color} strokeWidth="3" strokeLinecap="round"
          style={{ transition: "all 0.8s ease" }}
        />
        <circle cx={cx} cy={cy} r="7" fill={risk.color} />
      </svg>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{
          fontSize: 38, fontWeight: 800, color: risk.color, letterSpacing: 6,
          fontFamily: "'Bebas Neue', sans-serif",
          textShadow: `0 0 20px ${risk.glow}`,
        }}>
          {risk.level}
        </div>
        <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 2 }}>
          종합 점수: {score.toFixed(2)} / 3.00
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ score, label, icon, weight, detail }) {
  const risk = getRisk(score);
  const pct = (score / 3) * 100;
  return (
    <div style={{
      padding: "16px 18px", borderRadius: 12,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      marginBottom: 10, transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{label}</span>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 4,
            background: "rgba(148,163,184,0.12)", color: "#94a3b8",
          }}>가중치 {(weight * 100).toFixed(0)}%</span>
        </div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: risk.color,
          padding: "3px 12px", borderRadius: 8, background: `${risk.color}12`,
          border: `1px solid ${risk.color}30`,
        }}>
          {score === 3 ? "HIGH" : score === 2 ? "MEDIUM" : "LOW"} ({score}/3)
        </div>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 4, width: `${pct}%`,
          background: `linear-gradient(90deg, ${risk.color}99, ${risk.color})`,
          transition: "width 0.8s ease",
          boxShadow: `0 0 12px ${risk.glow}`,
        }} />
      </div>
      <div style={{ fontSize: 11, color: "#64748b", marginTop: 8, lineHeight: 1.5 }}>{detail}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [contextItems, setContextItems] = useState(DEFAULT_CONTEXT);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [error, setError] = useState(null);

  const volatility = calcVolatility(data.priceNow, data.price6MonthAgo);
  const scores = {
    priceVolatility: scorePrice(volatility),
    importDependency: scoreImport(data.chinaImportPct),
    productionConcentration: scoreProd(data.top3Production),
    geopoliticalRisk: scoreGeo(data.geoEvents),
    supplyDemandGap: scoreSupply(data.supplyDeficit),
  };
  const totalScore = RISK_FACTORS.reduce((s, f) => s + scores[f.key] * f.weight, 0);
  const risk = getRisk(totalScore);

  const details = {
    priceVolatility: `6개월 변동률: ${volatility.toFixed(1)}% (${data.price6MonthAgo.toLocaleString()} → ${data.priceNow.toLocaleString()} CNY/톤, GFEX 기준)`,
    importDependency: `대중국 수산화리튬 수입 비중: ${data.chinaImportPct}% (2025년 연간, K-stat 기준)`,
    productionConcentration: `상위 3국(호주·칠레·중국) 점유율: ${data.top3Production}% (USGS)`,
    geopoliticalRisk: `최근 12개월 수출규제·무역갈등 이벤트: ${data.geoEvents}건`,
    supplyDemandGap: `2026년 공급 부족 전망: ${(data.supplyDeficit / 10000).toFixed(1)}만 톤 LCE (Morgan Stanley)`,
  };

  const runAI = async () => {
    setLoading(true);
    setError(null);
    setAiResult(null);

    const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

    const prompt = `당신은 핵심광물 수급 리스크 전문 분석가입니다. 아래 리스크 진단 모델과 실측값을 바탕으로 한국의 리튬 수급 리스크를 분석해주세요.
분석 기준일: ${today}

[리스크 진단 모델 — 5요인 가중평균, 1~3점]
1. 가격 변동성 (가중치 15%)
   - HIGH(3점): 6개월 변동률 ≥ 30%
   - MEDIUM(2점): 10% ≤ 변동률 < 30%
   - LOW(1점): 변동률 < 10%

2. 수입 의존도 (가중치 25%) ★최고 가중치
   - HIGH(3점): 대중국 수입비중 ≥ 60%
   - MEDIUM(2점): 40% ≤ 비중 < 60%
   - LOW(1점): 비중 < 40%

3. 생산 집중도 (가중치 15%)
   - HIGH(3점): 상위 3국 점유율 ≥ 80%
   - MEDIUM(2점): 60% ≤ 점유율 < 80%
   - LOW(1점): 점유율 < 60%

4. 지정학적 리스크 (가중치 20%)
   - HIGH(3점): 수출규제·무역갈등 이벤트 ≥ 3건/12개월
   - MEDIUM(2점): 1~2건
   - LOW(1점): 0건

5. 수급 균형 (가중치 25%) ★최고 가중치
   - HIGH(3점): 공급부족 ≥ 50,000톤 LCE
   - MEDIUM(2점): 0 < 부족량 < 50,000톤
   - LOW(1점): 공급 충족 또는 과잉

[종합 판정 기준]
- HIGH: 종합점수 ≥ 2.3 / MEDIUM: 1.7~2.3 / LOW: 1.7 미만

[현재 측정값 및 진단 결과]
- 종합 리스크: ${risk.level} (${totalScore.toFixed(2)}/3.00)
1. 가격 변동성: ${scores.priceVolatility}/3점 — ${details.priceVolatility}
2. 수입 의존도: ${scores.importDependency}/3점 — ${details.importDependency}
3. 생산 집중도: ${scores.productionConcentration}/3점 — ${details.productionConcentration}
4. 지정학적 리스크: ${scores.geopoliticalRisk}/3점 — ${details.geopoliticalRisk}
5. 수급 균형: ${scores.supplyDemandGap}/3점 — ${details.supplyDemandGap}

[추가 맥락]
${contextItems.map(item => `- ${item}`).join("\n")}

각 요인이 임계값을 어떻게 초과했는지 명시하고, 가중치가 높은 요인(수입의존도·수급균형)을 중심으로 서술하세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력:
{"summary":"종합 판단 3문장 이내","causes":["주요 원인 1 (임계값 초과 근거 포함)","주요 원인 2","주요 원인 3"],"strategies":["대응 전략 1 (구체적 행동 포함)","대응 전략 2","대응 전략 3"],"outlook":"향후 전망 3문장 이내"}`;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const result = await res.json();

      if (result.error) {
        throw new Error(result.error);
      }

      const text = result.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.summary) {
          setAiResult(parsed);
        } else {
          throw new Error("응답 형식 오류");
        }
      } else {
        throw new Error("JSON을 찾을 수 없습니다");
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const inp = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)",
    color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box",
    transition: "border 0.2s",
  };
  const lbl = { fontSize: 11, color: "#94a3b8", marginBottom: 6, display: "block", fontWeight: 500 };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(170deg, #080e1a 0%, #0f172a 40%, #0c1220 100%)",
      color: "#e2e8f0",
      fontFamily: "'Noto Sans KR', sans-serif",
      padding: "32px 20px",
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-block", padding: "4px 14px", borderRadius: 20,
            background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)",
            fontSize: 11, color: "#60a5fa", letterSpacing: 2, marginBottom: 12,
          }}>
            AI-POWERED RISK ASSESSMENT
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, margin: "8px 0 0",
            background: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            핵심광물 수급 리스크 진단 시스템
          </h1>
          <p style={{ fontSize: 13, color: "#475569", marginTop: 8, lineHeight: 1.5 }}>
            리튬 (Li) · 5요인 가중평균 모델 · K-stat / USGS / Trading Economics / Morgan Stanley 기반
          </p>
        </div>

        {/* Gauge */}
        <div style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005))",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20, padding: "28px 24px 20px", marginBottom: 20,
          boxShadow: `0 0 40px ${risk.glow}`,
          transition: "box-shadow 0.8s ease",
        }}>
          <RiskGauge score={totalScore} />
        </div>

        {/* Factor Scores */}
        <div style={{
          background: "rgba(255,255,255,0.015)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20, padding: 20, marginBottom: 20,
        }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#94a3b8",
            marginBottom: 14, letterSpacing: 1, textTransform: "uppercase",
          }}>
            요인별 리스크 평가
          </div>
          {RISK_FACTORS.map((f) => (
            <ScoreBar key={f.key} score={scores[f.key]} label={f.label}
              icon={f.icon} weight={f.weight} detail={details[f.key]} />
          ))}
        </div>

        {/* Data Input */}
        <button onClick={() => setShowInputs(!showInputs)} style={{
          width: "100%", padding: "14px", borderRadius: 12,
          border: "1px solid rgba(96,165,250,0.25)", background: "rgba(96,165,250,0.06)",
          color: "#60a5fa", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 14,
          transition: "all 0.2s",
        }}>
          {showInputs ? "▲ 데이터 입력 닫기" : "▼ 데이터 직접 입력 (시나리오 분석)"}
        </button>

        {showInputs && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: 20, marginBottom: 20,
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
          }}>
            <div>
              <label style={lbl}>현재 리튬 가격 (CNY/톤)</label>
              <input type="number" value={data.priceNow} style={inp}
                onChange={e => setData({ ...data, priceNow: Number(e.target.value) })} />
            </div>
            <div>
              <label style={lbl}>6개월 전 가격 (CNY/톤)</label>
              <input type="number" value={data.price6MonthAgo} style={inp}
                onChange={e => setData({ ...data, price6MonthAgo: Number(e.target.value) })} />
            </div>
            <div>
              <label style={lbl}>대중국 수입 비중 (%)</label>
              <input type="number" value={data.chinaImportPct} style={inp}
                onChange={e => setData({ ...data, chinaImportPct: Number(e.target.value) })} />
            </div>
            <div>
              <label style={lbl}>상위3국 생산 점유율 (%)</label>
              <input type="number" value={data.top3Production} style={inp}
                onChange={e => setData({ ...data, top3Production: Number(e.target.value) })} />
            </div>
            <div>
              <label style={lbl}>지정학 이벤트 수 (건/12개월)</label>
              <input type="number" value={data.geoEvents} style={inp}
                onChange={e => setData({ ...data, geoEvents: Number(e.target.value) })} />
            </div>
            <div>
              <label style={lbl}>공급 부족량 (톤 LCE)</label>
              <input type="number" value={data.supplyDeficit} style={inp}
                onChange={e => setData({ ...data, supplyDeficit: Number(e.target.value) })} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button onClick={() => setData(DEFAULT_DATA)} style={{
                padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)",
                background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer",
              }}>
                ↺ 기본값으로 리셋
              </button>
            </div>
          </div>
        )}

        {/* Context Editor */}
        <button onClick={() => setShowContext(!showContext)} style={{
          width: "100%", padding: "14px", borderRadius: 12,
          border: "1px solid rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.06)",
          color: "#a78bfa", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 14,
          transition: "all 0.2s",
        }}>
          {showContext ? "▲ 추가 맥락 닫기" : "▼ 추가 맥락 편집 (AI 분석 배경 정보)"}
        </button>

        {showContext && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(167,139,250,0.15)",
            borderRadius: 16, padding: 20, marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 14, lineHeight: 1.6 }}>
              AI 분석 시 참고할 배경 정보입니다. 상황 변화에 따라 자유롭게 수정·추가·삭제하세요.
            </div>
            {contextItems.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const updated = [...contextItems];
                    updated[i] = e.target.value;
                    setContextItems(updated);
                  }}
                  style={{
                    flex: 1, padding: "9px 12px", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)",
                    color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={() => setContextItems(contextItems.filter((_, idx) => idx !== i))}
                  style={{
                    padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(220,38,38,0.3)",
                    background: "rgba(220,38,38,0.08)", color: "#f87171", fontSize: 13,
                    cursor: "pointer", flexShrink: 0,
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => setContextItems([...contextItems, ""])}
                style={{
                  padding: "8px 16px", borderRadius: 8,
                  border: "1px solid rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.08)",
                  color: "#a78bfa", fontSize: 12, cursor: "pointer",
                }}
              >
                + 항목 추가
              </button>
              <button
                onClick={() => setContextItems(DEFAULT_CONTEXT)}
                style={{
                  padding: "8px 16px", borderRadius: 8,
                  border: "1px solid rgba(148,163,184,0.2)", background: "transparent",
                  color: "#94a3b8", fontSize: 12, cursor: "pointer",
                }}
              >
                ↺ 기본값으로 리셋
              </button>
            </div>
          </div>
        )}

        {/* AI Button */}
        <button onClick={runAI} disabled={loading} style={{
          width: "100%", padding: "16px", borderRadius: 14, border: "none",
          cursor: loading ? "wait" : "pointer",
          background: loading
            ? "linear-gradient(135deg, #1e293b, #334155)"
            : "linear-gradient(135deg, #3b82f6, #8b5cf6, #a855f7)",
          color: "#fff", fontSize: 15, fontWeight: 700, letterSpacing: 1,
          marginBottom: 20,
          boxShadow: loading ? "none" : "0 4px 24px rgba(99,102,241,0.35)",
          transition: "all 0.3s ease",
        }}>
          {loading ? "⏳ AI가 데이터를 분석하고 있습니다..." : "🤖 AI 실시간 원인 분석 & 대응 전략 생성"}
        </button>

        {/* Error */}
        {error && (
          <div style={{
            padding: 16, borderRadius: 12, marginBottom: 16,
            background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
            color: "#fca5a5", fontSize: 13,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* AI Results */}
        {aiResult && (
          <div style={{
            background: "linear-gradient(180deg, rgba(99,102,241,0.05), rgba(255,255,255,0.01))",
            border: "1px solid rgba(99,102,241,0.15)",
            borderRadius: 20, padding: 24, marginBottom: 20,
          }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: "#a78bfa",
              marginBottom: 18, letterSpacing: 1,
            }}>
              🤖 AI 분석 결과
            </div>

            {/* Summary */}
            <div style={{
              padding: 16, borderRadius: 12, marginBottom: 16,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>
                📋 종합 판단
              </div>
              <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.8 }}>{aiResult.summary}</div>
            </div>

            {/* Causes */}
            <div style={{
              padding: 16, borderRadius: 12, marginBottom: 16,
              background: "rgba(220,38,38,0.03)", border: "1px solid rgba(220,38,38,0.1)",
            }}>
              <div style={{ fontSize: 11, color: "#f87171", marginBottom: 10, fontWeight: 600 }}>
                ⚠️ 주요 원인 분석
              </div>
              {aiResult.causes?.map((c, i) => (
                <div key={i} style={{
                  fontSize: 13, color: "#e2e8f0", marginBottom: 10, paddingLeft: 14,
                  borderLeft: "3px solid rgba(220,38,38,0.3)", lineHeight: 1.7,
                }}>
                  {c}
                </div>
              ))}
            </div>

            {/* Strategies */}
            <div style={{
              padding: 16, borderRadius: 12, marginBottom: 16,
              background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.1)",
            }}>
              <div style={{ fontSize: 11, color: "#4ade80", marginBottom: 10, fontWeight: 600 }}>
                ✅ 대응 전략 제안
              </div>
              {aiResult.strategies?.map((s, i) => (
                <div key={i} style={{
                  fontSize: 13, color: "#e2e8f0", marginBottom: 10, paddingLeft: 14,
                  borderLeft: "3px solid rgba(34,197,94,0.3)", lineHeight: 1.7,
                }}>
                  {s}
                </div>
              ))}
            </div>

            {/* Outlook */}
            <div style={{
              padding: 16, borderRadius: 12,
              background: "rgba(96,165,250,0.03)", border: "1px solid rgba(96,165,250,0.1)",
            }}>
              <div style={{ fontSize: 11, color: "#60a5fa", marginBottom: 8, fontWeight: 600 }}>
                🔮 향후 전망
              </div>
              <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.8 }}>{aiResult.outlook}</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: "center", fontSize: 11, color: "#1e293b", padding: "20px 0",
          borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 12,
        }}>
          데이터 출처: 한국무역협회 K-stat · USGS · Trading Economics · KOTRA · Morgan Stanley · Bernstein
          <br />PBL 프로젝트 1 — AI 기반 핵심광물 수급 리스크 진단 시스템
        </div>
      </div>
    </div>
  );
}

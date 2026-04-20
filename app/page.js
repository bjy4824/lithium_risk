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
  { key: "priceVolatility",        label: "가격 변동성",    weight: 0.15 },
  { key: "importDependency",       label: "수입 의존도",    weight: 0.25 },
  { key: "productionConcentration",label: "생산 집중도",    weight: 0.15 },
  { key: "geopoliticalRisk",       label: "지정학적 리스크", weight: 0.20 },
  { key: "supplyDemandGap",        label: "수급 균형",      weight: 0.25 },
];

function calcVolatility(now, ago) {
  if (!ago || ago === 0) return 0;
  return Math.abs((now - ago) / ago) * 100;
}
function scorePrice(v)  { return v >= 30 ? 3 : v >= 10 ? 2 : 1; }
function scoreImport(p) { return p >= 60 ? 3 : p >= 40 ? 2 : 1; }
function scoreProd(p)   { return p >= 80 ? 3 : p >= 60 ? 2 : 1; }
function scoreGeo(e)    { return e >= 3  ? 3 : e >= 1  ? 2 : 1; }
function scoreSupply(d) { return d >= 50000 ? 3 : d > 0 ? 2 : 1; }

function getRisk(score) {
  if (score >= 2.3) return { level: "HIGH",   color: "#eb5757" };
  if (score >= 1.7) return { level: "MEDIUM", color: "#c49a3c" };
  return               { level: "LOW",    color: "#529e72" };
}

const FONT = "'Inter', 'Noto Sans KR', -apple-system, sans-serif";

/* ── Gauge ── */
function RiskGauge({ score }) {
  const risk = getRisk(score);
  const angle = ((score - 1) / 2) * 180;
  const rad   = (angle * Math.PI) / 180;
  const S = 200, cx = S / 2, cy = S / 2, r = S / 2 - 18;

  const segs = [
    { s: 0,   e: 60,  c: "#529e72" },
    { s: 60,  e: 120, c: "#c49a3c" },
    { s: 120, e: 180, c: "#eb5757" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width={S} height={S / 2 + 16} viewBox={`0 0 ${S} ${S / 2 + 16}`}>
        {segs.map((seg, i) => {
          const sa = (seg.s * Math.PI) / 180, ea = (seg.e * Math.PI) / 180;
          return (
            <path key={i}
              d={`M ${cx - r * Math.cos(sa)} ${cy - r * Math.sin(sa)} A ${r} ${r} 0 0 1 ${cx - r * Math.cos(ea)} ${cy - r * Math.sin(ea)}`}
              fill="none" stroke={seg.c} strokeWidth="10" strokeLinecap="round" opacity={0.15}
            />
          );
        })}
        <path
          d={`M ${cx + r} ${cy} A ${r} ${r} 0 ${angle > 90 ? 1 : 0} 0 ${cx - r * Math.cos(rad)} ${cy - r * Math.sin(rad)}`}
          fill="none" stroke={risk.color} strokeWidth="10" strokeLinecap="round"
          style={{ transition: "all 0.6s ease" }}
        />
        <line
          x1={cx} y1={cy}
          x2={cx - (r - 20) * Math.cos(rad)} y2={cy - (r - 20) * Math.sin(rad)}
          stroke={risk.color} strokeWidth="1.5" strokeLinecap="round"
          style={{ transition: "all 0.6s ease" }}
        />
        <circle cx={cx} cy={cy} r="4" fill={risk.color} />
      </svg>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: risk.color, letterSpacing: "0.08em" }}>
          {risk.level}
        </div>
        <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
          {score.toFixed(2)} / 3.00
        </div>
      </div>
    </div>
  );
}

/* ── Score row ── */
function FactorRow({ label, score, weight, detail }) {
  const risk = getRisk(score);
  const level = score === 3 ? "HIGH" : score === 2 ? "MED" : "LOW";
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, color: "#e6e6e6" }}>{label}</span>
          <span style={{ fontSize: 10, color: "#555" }}>{(weight * 100).toFixed(0)}%</span>
        </div>
        <span style={{ fontSize: 11, color: risk.color, fontWeight: 500 }}>{level}</span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
        <div style={{
          height: "100%", borderRadius: 2, width: `${(score / 3) * 100}%`,
          background: risk.color, opacity: 0.55,
          transition: "width 0.5s ease",
        }} />
      </div>
      <div style={{ fontSize: 11, color: "#555", marginTop: 5, lineHeight: 1.5 }}>{detail}</div>
    </div>
  );
}

/* ── Disclosure ── */
function Disclosure({ label, open, onToggle, children }) {
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <button onClick={onToggle} style={{
        width: "100%", padding: "10px 0", background: "none", border: "none",
        cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 13, color: "#787774", fontFamily: FONT }}>{label}</span>
        <span style={{ fontSize: 10, color: "#555", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>
      {open && <div style={{ paddingBottom: 16 }}>{children}</div>}
    </div>
  );
}

/* ── Main ── */
export default function Dashboard() {
  const [data, setData]               = useState(DEFAULT_DATA);
  const [contextItems, setContextItems] = useState(DEFAULT_CONTEXT);
  const [aiResult, setAiResult]       = useState(null);
  const [loading, setLoading]         = useState(false);
  const [showInputs, setShowInputs]   = useState(false);
  const [showContext, setShowContext]  = useState(false);
  const [error, setError]             = useState(null);

  const volatility = calcVolatility(data.priceNow, data.price6MonthAgo);
  const scores = {
    priceVolatility:        scorePrice(volatility),
    importDependency:       scoreImport(data.chinaImportPct),
    productionConcentration: scoreProd(data.top3Production),
    geopoliticalRisk:       scoreGeo(data.geoEvents),
    supplyDemandGap:        scoreSupply(data.supplyDeficit),
  };
  const totalScore = RISK_FACTORS.reduce((s, f) => s + scores[f.key] * f.weight, 0);
  const risk = getRisk(totalScore);

  const details = {
    priceVolatility:        `6개월 변동률 ${volatility.toFixed(1)}% — ${data.price6MonthAgo.toLocaleString()} → ${data.priceNow.toLocaleString()} CNY/톤`,
    importDependency:       `대중국 수입 비중 ${data.chinaImportPct}% (2025년, K-stat)`,
    productionConcentration:`호주·칠레·중국 점유율 ${data.top3Production}% (USGS)`,
    geopoliticalRisk:       `수출규제·무역갈등 이벤트 ${data.geoEvents}건/12개월`,
    supplyDemandGap:        `공급 부족 전망 ${(data.supplyDeficit / 10000).toFixed(1)}만 톤 LCE (Morgan Stanley)`,
  };

  const runAI = async () => {
    setLoading(true); setError(null); setAiResult(null);
    const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
    const prompt = `당신은 산업통상자원부 자문 수준의 핵심광물 공급망 리스크 전문 분석가입니다.
아래 정량 진단 결과를 바탕으로, 정책 보고서에 인용 가능한 수준의 전문적 분석을 작성해주세요.
분석 기준일: ${today}

[리스크 진단 모델 — 5요인 가중평균, 1~3점]
1. 가격 변동성 (가중치 15%): HIGH≥30%, MEDIUM 10~30%, LOW<10%
2. 수입 의존도 (가중치 25%): HIGH≥60%, MEDIUM 40~60%, LOW<40%
3. 생산 집중도 (가중치 15%): HIGH≥80%, MEDIUM 60~80%, LOW<60%
4. 지정학적 리스크 (가중치 20%): HIGH≥3건, MEDIUM 1~2건, LOW 0건
5. 수급 균형 (가중치 25%): HIGH≥50000톤, MEDIUM 0~50000톤, LOW 충족

[현재 측정값 및 진단 결과]
- 종합 리스크: ${risk.level} (${totalScore.toFixed(2)}/3.00)
${RISK_FACTORS.map((f, i) => `${i + 1}. ${f.label}: ${scores[f.key]}/3 — ${details[f.key]}`).join("\n")}

[추가 맥락]
${contextItems.map(item => `- ${item}`).join("\n")}

[작성 지침]
- summary: 종합 리스크 판정 근거를 가중치 높은 요인 중심으로 서술. 수치를 구체적으로 인용할 것. 4~5문장.
- causes: 각 원인마다 ① 해당 지표가 임계값을 얼마나 초과했는지 ② 그것이 한국 공급망에 미치는 구체적 영향을 포함. 3가지.
- strategies: 각 전략마다 ① 담당 주체(산업부·KOTRA·기업 등) ② 단기(~1년)/중기(1~3년) 구분 ③ 기대 효과를 명시. 3가지.
- outlook: 리스크 완화 또는 심화 시나리오를 모두 포함하고, 핵심 변수(가격·정책·수요)를 언급. 불확실성도 솔직히 서술. 4~5문장.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력:
{"summary":"...","causes":["...","...","..."],"strategies":["...","...","..."],"outlook":"..."}`;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      const raw = result.text || "";
      const codeBlock = raw.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonMatch = codeBlock ? codeBlock[1] : (raw.match(/\{[\s\S]*\}/) || [])[0];
      if (!jsonMatch) throw new Error(`JSON을 찾을 수 없습니다. 원문 응답:\n${raw || "(빈 응답)"}`);
      let parsed;
      try { parsed = JSON.parse(jsonMatch); }
      catch (parseErr) { throw new Error(`JSON 파싱 실패: ${parseErr.message}\n원문:\n${jsonMatch}`); }
      if (!parsed.summary) throw new Error(`응답 형식 오류 — 수신된 키: ${Object.keys(parsed).join(", ") || "없음"}`);
      setAiResult(parsed);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "7px 10px", borderRadius: 4,
    border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)",
    color: "#e6e6e6", fontSize: 13, fontFamily: FONT, outline: "none", boxSizing: "border-box",
  };

  const AI_SECTIONS = aiResult ? [
    { title: "종합 판단",  body: aiResult.summary,     type: "text" },
    { title: "주요 원인",  body: aiResult.causes,      type: "list" },
    { title: "대응 전략",  body: aiResult.strategies,  type: "list" },
    { title: "향후 전망",  body: aiResult.outlook,     type: "text" },
  ] : [];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#191919",
      color: "#e6e6e6",
      fontFamily: FONT,
      padding: "60px 24px 80px",
    }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>
            핵심광물 수급 리스크 — 리튬 (Li)
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#e6e6e6", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            리튬 공급 리스크 모니터
          </h1>
          <p style={{ fontSize: 12, color: "#555", margin: 0, lineHeight: 1.6 }}>
            5요인 가중평균 모델 · K-stat / USGS / Trading Economics / Morgan Stanley
          </p>
        </div>

        {/* Gauge + score */}
        <div style={{ display: "flex", alignItems: "center", gap: 40, marginBottom: 40 }}>
          <RiskGauge score={totalScore} />
          <div>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              종합 리스크
            </div>
            <div style={{ fontSize: 36, fontWeight: 600, color: risk.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
              {risk.level}
            </div>
            <div style={{ fontSize: 13, color: "#555", marginTop: 8 }}>
              {totalScore.toFixed(2)} / 3.00
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }} />

        {/* Section label */}
        <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
          요인별 리스크
        </div>

        {/* Factor rows */}
        <div style={{ marginBottom: 32 }}>
          {RISK_FACTORS.map(f => (
            <FactorRow key={f.key} label={f.label} score={scores[f.key]}
              weight={f.weight} detail={details[f.key]} />
          ))}
        </div>

        {/* Disclosures */}
        <Disclosure label="데이터 직접 입력" open={showInputs} onToggle={() => setShowInputs(!showInputs)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["현재 리튬 가격 (CNY/톤)", "priceNow"],
              ["6개월 전 가격 (CNY/톤)",  "price6MonthAgo"],
              ["대중국 수입 비중 (%)",     "chinaImportPct"],
              ["상위3국 생산 점유율 (%)", "top3Production"],
              ["지정학 이벤트 수 (건/12개월)", "geoEvents"],
              ["공급 부족량 (톤 LCE)",    "supplyDeficit"],
            ].map(([label, key]) => (
              <div key={key}>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{label}</div>
                <input type="number" value={data[key]} style={inputStyle}
                  onChange={e => setData({ ...data, [key]: Number(e.target.value) })} />
              </div>
            ))}
          </div>
          <button onClick={() => setData(DEFAULT_DATA)} style={{
            marginTop: 12, padding: "5px 10px", borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.08)", background: "none",
            color: "#555", fontSize: 11, fontFamily: FONT, cursor: "pointer",
          }}>
            기본값으로 리셋
          </button>
        </Disclosure>

        <Disclosure label="추가 맥락 편집" open={showContext} onToggle={() => setShowContext(!showContext)}>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 10 }}>
            AI 분석 시 참고할 배경 정보입니다.
          </div>
          {contextItems.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input type="text" value={item} style={{ ...inputStyle, flex: 1 }}
                onChange={e => {
                  const updated = [...contextItems];
                  updated[i] = e.target.value;
                  setContextItems(updated);
                }} />
              <button
                onClick={() => setContextItems(contextItems.filter((_, idx) => idx !== i))}
                style={{
                  padding: "0 10px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.08)",
                  background: "none", color: "#555", fontSize: 13, fontFamily: FONT, cursor: "pointer",
                }}>×</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => setContextItems([...contextItems, ""])} style={{
              padding: "5px 10px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.08)",
              background: "none", color: "#787774", fontSize: 11, fontFamily: FONT, cursor: "pointer",
            }}>+ 추가</button>
            <button onClick={() => setContextItems(DEFAULT_CONTEXT)} style={{
              padding: "5px 10px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.08)",
              background: "none", color: "#555", fontSize: 11, fontFamily: FONT, cursor: "pointer",
            }}>기본값으로 리셋</button>
          </div>
        </Disclosure>

        {/* AI button */}
        <div style={{ marginTop: 28 }}>
          <button onClick={runAI} disabled={loading} style={{
            padding: "9px 20px", borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.1)",
            background: loading ? "none" : "rgba(255,255,255,0.05)",
            color: loading ? "#555" : "#e6e6e6",
            fontSize: 13, fontFamily: FONT, fontWeight: 500,
            cursor: loading ? "wait" : "pointer",
            transition: "all 0.15s",
          }}>
            {loading ? "분석 중..." : "AI 분석 실행"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop: 16, fontSize: 12, color: "#eb5757" }}>{error}</div>
        )}

        {/* AI Results */}
        {aiResult && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
              AI 분석 결과
            </div>
            {AI_SECTIONS.map((sec, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: "#787774", marginBottom: 8, fontWeight: 500 }}>
                  {sec.title}
                </div>
                {sec.type === "text" ? (
                  <p style={{ margin: 0, fontSize: 13, color: "#d1d5db", lineHeight: 1.8 }}>{sec.body}</p>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {sec.body?.map((item, j) => (
                      <li key={j} style={{
                        fontSize: 13, color: "#d1d5db", lineHeight: 1.7,
                        paddingLeft: 14, position: "relative", marginBottom: 6,
                      }}>
                        <span style={{ position: "absolute", left: 0, color: "#555" }}>–</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 60, fontSize: 11, color: "#333", lineHeight: 1.7 }}>
          K-stat · USGS · Trading Economics · KOTRA · Morgan Stanley · Bernstein
        </div>
      </div>
    </div>
  );
}

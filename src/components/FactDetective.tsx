import React, { useState, useRef } from "react";

/**
 * Fact Detective — MIL claim / URL / image checker component.
 *
 * Calls /api/fact-detective (powered by gemini-2.5-flash via @google/genai with Google Search Grounding).
 * Uses SIFT method (Stop / Investigate / Find Coverage / Trace) to deliver structured verification case files.
 */

export type Verdict = "REAL" | "FAKE" | "MIXED" | "UNKNOWN";

export interface Evidence {
  point: string;
  source: string;
  url?: string;
}

export type ClaimType = "factual" | "opinion" | "satire" | "outdated";

export interface MethodSteps {
  stop?: string;
  investigateSource?: string;
  findBetterCoverage?: string;
  traceClaims?: string;
}

export interface Result {
  verdict: Verdict;
  headline: string;
  explanation: string;
  evidence: Evidence[];
  confidence: number;
  claimType?: ClaimType;
  method?: MethodSteps;
  searchGrounded?: boolean;
  searchWarning?: string;
  modelUsed?: string;
}

/**
 * Strict validation function to clamp confidence score between 0 and 100 before updating state,
 * and explicitly cap the displayed percentage to 15% if grounding fails.
 */
export function validateConfidenceScore(score: any, isGrounded: boolean = true): number {
  let val = Math.round(Number(score) || 0);
  if (isNaN(val)) {
    val = 50;
  }
  if (!isGrounded) {
    val = Math.min(val, 15);
  }
  return Math.min(100, Math.max(0, val));
}

const CLAIM_TYPE_LABEL: Record<ClaimType, string> = {
  factual: "Factual claim",
  opinion: "Opinion / commentary",
  satire: "Satire",
  outdated: "Outdated information",
};

type Tab = "claim" | "url" | "image";

const VERDICT_LABEL: Record<Verdict, string> = {
  REAL: "Verified",
  FAKE: "Debunked",
  MIXED: "Mixed / Needs Context",
  UNKNOWN: "Inconclusive",
};

const VERDICT_COLOR: Record<Verdict, string> = {
  REAL: "#3d5c3a",
  FAKE: "#a3352b",
  MIXED: "#a0762a",
  UNKNOWN: "#6b6250",
};

export default function FactDetective() {
  const [tab, setTab] = useState<Tab>("claim");
  const [claimText, setClaimText] = useState("");
  const [urlText, setUrlText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [strictVerifyResult, setStrictVerifyResult] = useState<any | null>(null);
  const [isMethodExpanded, setIsMethodExpanded] = useState(false);
  const [showRawTextToggle, setShowRawTextToggle] = useState(false);

  // New features state
  const [enableThinking, setEnableThinking] = useState(false);
  const [activeIntelTool, setActiveIntelTool] = useState<string | null>(null);
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelOutput, setIntelOutput] = useState<{ tool: string; analysis: string } | null>(null);

  // Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "model"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  function handleFile(file: File) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resStr = reader.result as string;
        resolve({ data: resStr.split(",")[1], mediaType: file.type || "image/jpeg" });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleRunIntel(toolKey: string) {
    setActiveIntelTool(toolKey);
    setIntelLoading(true);
    setIntelOutput(null);

    try {
      const claimToUse = claimText || urlText || result?.headline || "";
      const res = await fetch("/api/fact-detective/intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim: claimToUse,
          tool: toolKey,
          verdict: result?.verdict || "UNKNOWN",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIntelOutput({ tool: toolKey, analysis: data.analysis });
      } else {
        setIntelOutput({ tool: toolKey, analysis: `Error: ${data.error}` });
      }
    } catch (e: any) {
      setIntelOutput({ tool: toolKey, analysis: `Failed to run analysis: ${e.message}` });
    } finally {
      setIntelLoading(false);
    }
  }

  async function handleSendChat(customText?: string) {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const newMessages = [...chatMessages, { role: "user" as const, text: textToSend.trim() }];
    setChatMessages(newMessages);
    if (!customText) setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/fact-detective/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim: claimText || urlText || result?.headline || "Investigated statement",
          verdict: result?.verdict || "UNKNOWN",
          messages: newMessages,
          enableThinking,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages([...newMessages, { role: "model", text: data.text }]);
      } else {
        setChatMessages([...newMessages, { role: "model", text: `⚠️ Error: ${data.error}` }]);
      }
    } catch (e: any) {
      setChatMessages([...newMessages, { role: "model", text: `⚠️ Network error: ${e.message}` }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  async function runInvestigation() {
    setError(null);
    setResult(null);
    setStrictVerifyResult(null);
    setRawResponse(null);
    setIntelOutput(null);

    if (tab === "claim" && !claimText.trim()) {
      setError("Enter a claim to investigate first.");
      return;
    }
    if (tab === "url" && !urlText.trim()) {
      setError("Enter a URL to investigate first.");
      return;
    }
    if (tab === "image" && !imageFile) {
      setError("Upload an image to investigate first.");
      return;
    }

    setLoading(true);
    setProgress(5);
    setProgressStage(enableThinking ? "🧠 High Thinking Mode: Performing deep reasoning..." : "1/4 STOP: Identifying core factual claims...");

    let currentProgress = 5;
    const progressInterval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 6) + 3;
      if (currentProgress >= 95) {
        currentProgress = 95;
      }
      setProgress(currentProgress);

      if (enableThinking) {
        setProgressStage("🧠 Deep Reasoning: Cross-referencing evidence matrix...");
      } else if (currentProgress < 25) {
        setProgressStage("1/4 STOP: Identifying core factual claim...");
      } else if (currentProgress < 50) {
        setProgressStage("2/4 INVESTIGATE: Checking source track record & domain...");
      } else if (currentProgress < 75) {
        setProgressStage("3/4 FIND COVERAGE: Searching independent fact checks...");
      } else {
        setProgressStage("4/4 TRACE: Cross-referencing evidence & finalizing verdict...");
      }
    }, 350);

    try {
      let payload: Record<string, unknown>;

      if (tab === "claim") {
        payload = { mode: "claim", claim: claimText.trim() };
      } else if (tab === "url") {
        payload = { mode: "url", url: urlText.trim() };
      } else {
        const { data, mediaType } = await fileToBase64(imageFile as File);
        payload = { mode: "image", imageData: data, mediaType };
      }

      if (tab === "claim" && claimText.trim()) {
        try {
          const verifyRes = await fetch("/api/fact-verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ claim: claimText.trim() })
          });
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            setStrictVerifyResult(verifyData);
          }
        } catch (strictErr) {
          console.warn("Strict fact verify call failed:", strictErr);
        }
      }

      const res = await fetch("/api/fact-detective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, enableThinking }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Server returned HTTP ${res.status}: ${errBody}`);
      }

      const data = await res.json();

      console.log("=== RAW GEMINI MODEL RESPONSE ===");
      console.log(data.rawText);
      console.log("=================================");

      if (data.groundingMetadata) {
        console.log("=== GROUNDING METADATA ===");
        console.log(data.groundingMetadata);
        console.log("==========================");
      }

      setRawResponse(data.rawText || null);

      if (!data.success) {
        setError(data.error || "Failed to process Gemini investigation response.");
        return;
      }

      setProgress(100);
      setProgressStage("Investigation complete!");
      const rawResult = data.result as Result;
      const isGrounded = rawResult.searchGrounded ?? true;
      const sanitizedResult: Result = {
        ...rawResult,
        confidence: validateConfidenceScore(rawResult.confidence, isGrounded)
      };
      setResult(sanitizedResult);

      // Auto-initialize chat drawer context
      if (chatMessages.length === 0) {
        setChatMessages([
          {
            role: "model",
            text: `👋 Greetings detective! I am your AI assistant. I've logged the investigation for: **"${data.result.headline}"** (${data.result.verdict}). Ask me any follow-up questions, request deeper source background, or analyze logical fallacies!`
          }
        ]);
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Investigation failed due to an unexpected error.";
      console.error("[FactDetective] Error:", errMsg);
      setError(errMsg);
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.eyebrow}>Bytespark · MIL Toolkit</div>
        <h2 style={styles.title}>Fact Detective</h2>
        <div style={styles.sub}>Bring your evidence. We'll open a case with Gemini & Google Search Grounding.</div>
      </div>

      <div style={styles.card}>
        {/* Navigation & Mode Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div style={styles.tabs}>
            {(["claim", "url", "image"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setResult(null);
                  setError(null);
                  setRawResponse(null);
                }}
                style={{
                  ...styles.tab,
                  ...(tab === t ? styles.tabActive : {}),
                }}
              >
                {t === "claim" ? "Claim" : t === "url" ? "Website" : "Image"}
              </button>
            ))}
          </div>

          {/* High Thinking / Deep Reasoning Mode Switch */}
          <label style={styles.thinkingToggleWrap}>
            <input
              type="checkbox"
              checked={enableThinking}
              onChange={(e) => setEnableThinking(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <span style={styles.thinkingText}>
              🧠 Deep Reasoning Mode <small style={{ color: "#7A1F2B", fontWeight: 700 }}>(gemini-3.1-pro-preview)</small>
            </span>
          </label>
        </div>

        {/* Input fields */}
        {tab === "claim" && (
          <div>
            <label style={styles.label}>Statement, headline, or post text</label>
            <textarea
              style={styles.textarea}
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              placeholder='e.g. "Balendra Shah (Balen) is a Prime Minister of Nepal"'
            />
          </div>
        )}

        {tab === "url" && (
          <div>
            <label style={styles.label}>Website or article URL</label>
            <input
              style={styles.input}
              type="text"
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
              placeholder="https://example.com/article"
            />
          </div>
        )}

        {tab === "image" && (
          <div>
            <label style={styles.label}>Upload an image to examine</label>
            <div
              style={styles.drop}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" style={styles.previewImg} />
              ) : (
                <span>Click to choose an image, or drag one here</span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          </div>
        )}

        {/* Search Grounding Feature Indicator Badge */}
        <div style={styles.groundingBadgeRow}>
          <span style={styles.groundingBadge}>
            🌐 Grounding: Live Google Search Data ({enableThinking ? "gemini-3.1-pro-preview" : "gemini-3.6-flash"})
          </span>
        </div>

        <button style={styles.go} onClick={runInvestigation} disabled={loading}>
          {loading ? `Investigating… ${progress}%` : enableThinking ? "🧠 Open Deep Investigation" : "Open Investigation"}
        </button>

        {loading && (
          <div style={styles.loadingProgressBox}>
            <div style={styles.loadingHeader}>
              <span style={styles.loadingStageText}>{progressStage}</span>
              <span style={styles.loadingPercentText}>{progress}%</span>
            </div>
            <div style={styles.bar}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${progress}%`,
                  transition: "width 0.3s ease-out",
                  background: "#1c1a17",
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <div style={styles.errorTitle}>🚨 Investigation Error</div>
            <div>{error}</div>
            {rawResponse && (
              <div style={{ marginTop: 10 }}>
                <button
                  style={styles.debugToggleBtn}
                  onClick={() => setShowRawTextToggle(!showRawTextToggle)}
                >
                  {showRawTextToggle ? "Hide Raw Model Response" : "Show Raw Model Response"}
                </button>
                {showRawTextToggle && (
                  <pre style={styles.rawPre}>{rawResponse}</pre>
                )}
              </div>
            )}
          </div>
        )}

        {result && (
          <div style={styles.result}>
            {(!result.searchGrounded || result.searchWarning) && (
              <div style={styles.groundingWarningBox}>
                <div style={styles.warningTitle}>⚠️ Search Grounding Unavailable</div>
                <div>{result.searchWarning || "Note: could not verify with live search"}</div>
              </div>
            )}

            {/* Stamp Badge */}
            <div style={styles.stampRow}>
              <div
                style={{
                  ...styles.stamp,
                  borderColor: VERDICT_COLOR[result.verdict],
                  color: VERDICT_COLOR[result.verdict],
                }}
              >
                {VERDICT_LABEL[result.verdict] || result.verdict}
              </div>

              {result.claimType && (
                <span style={styles.claimTypeTag}>
                  {CLAIM_TYPE_LABEL[result.claimType] || result.claimType}
                </span>
              )}
            </div>

            <div style={styles.verdictText}>
              <strong style={styles.headlineText}>{result.headline}</strong>
              <p style={{ marginTop: 6, marginBottom: 0, color: "#1c1a17" }}>{result.explanation}</p>
            </div>

            {result.evidence?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={styles.evidenceHeader}>Evidence Log</h4>
                <ul style={styles.evidenceList}>
                  {result.evidence.map((e, i) => (
                    <li key={i} style={styles.evidenceItem}>
                      <span>{e.point}</span>
                      {e.url ? (
                        <>
                          {" — "}
                          <a
                            href={e.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.sourceLink}
                          >
                            {e.source || "source link"}
                          </a>
                        </>
                      ) : e.source ? (
                        <span style={{ color: "#6b6250" }}> — {e.source}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={styles.confidenceWrap}>
              <div style={styles.confidenceHeader}>
                <span>Confidence Rating</span>
                <span>{validateConfidenceScore(result.confidence, result.searchGrounded ?? true)}%</span>
              </div>
              <div style={styles.bar}>
                <div style={{ ...styles.barFill, width: `${validateConfidenceScore(result.confidence, result.searchGrounded ?? true)}%` }} />
              </div>
            </div>

            {/* Strict Fact Verification Assistant (Raw JSON Pass-Through Output) */}
            {strictVerifyResult && (
              <div style={{
                marginTop: 18,
                padding: 14,
                backgroundColor: "#111827",
                borderRadius: 8,
                border: "1px solid #1f2937",
                color: "#f3f4f6"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>
                    🤖 Fact Verification Assistant (Raw JSON Pass-Through Response)
                  </span>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "#9ca3af", backgroundColor: "#1f2937", padding: "2px 6px", borderRadius: 4 }}>
                    temp: 0.1 · googleSearch: enabled
                  </span>
                </div>
                <pre style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  backgroundColor: "#030712",
                  padding: 12,
                  borderRadius: 6,
                  color: "#34d399",
                  overflowX: "auto",
                  border: "1px solid #111827",
                  margin: 0
                }}>
                  {JSON.stringify(strictVerifyResult, null, 2)}
                </pre>
              </div>
            )}

            {/* Gemini Intelligence Analysis Tools */}
            <div style={styles.intelBox}>
              <div style={styles.intelTitle}>✨ Gemini Deep Intelligence Tools</div>
              <div style={styles.intelGrid}>
                <button
                  style={{ ...styles.intelBtn, ...(activeIntelTool === "source_audit" ? styles.intelBtnActive : {}) }}
                  onClick={() => handleRunIntel("source_audit")}
                  disabled={intelLoading}
                >
                  🏛️ Source Track Record
                </button>
                <button
                  style={{ ...styles.intelBtn, ...(activeIntelTool === "bias_framing" ? styles.intelBtnActive : {}) }}
                  onClick={() => handleRunIntel("bias_framing")}
                  disabled={intelLoading}
                >
                  ⚖️ Media Bias & Framing
                </button>
                <button
                  style={{ ...styles.intelBtn, ...(activeIntelTool === "fallacy_checker" ? styles.intelBtnActive : {}) }}
                  onClick={() => handleRunIntel("fallacy_checker")}
                  disabled={intelLoading}
                >
                  🧩 Logical Fallacies
                </button>
                <button
                  style={{ ...styles.intelBtn, ...(activeIntelTool === "timeline" ? styles.intelBtnActive : {}) }}
                  onClick={() => handleRunIntel("timeline")}
                  disabled={intelLoading}
                >
                  📜 Claim Timeline
                </button>
              </div>

              {intelLoading && (
                <div style={styles.intelLoadingText}>Running Gemini Intelligence tool...</div>
              )}

              {intelOutput && (
                <div style={styles.intelOutputCard}>
                  <div style={styles.intelOutputHeader}>
                    {intelOutput.tool === "source_audit" && "🏛️ Source Authority & Track Record Audit"}
                    {intelOutput.tool === "bias_framing" && "⚖️ Media Bias & Rhetoric Framing Analysis"}
                    {intelOutput.tool === "fallacy_checker" && "🧩 Logical Fallacy Breakdown"}
                    {intelOutput.tool === "timeline" && "📜 Claim Historical Origin & Timeline"}
                  </div>
                  <div style={styles.intelOutputBody}>{intelOutput.analysis}</div>
                </div>
              )}
            </div>

            {/* SIFT Breakdown */}
            {result.method && (
              <div style={styles.methodSection}>
                <button
                  style={styles.methodToggle}
                  onClick={() => setIsMethodExpanded(!isMethodExpanded)}
                >
                  <span>{isMethodExpanded ? "▼ Hide investigation breakdown" : "▶ How we investigated this (SIFT Method)"}</span>
                </button>

                {isMethodExpanded && (
                  <div style={styles.methodContent}>
                    {result.method.stop && (
                      <div style={styles.methodStep}>
                        <strong style={styles.stepTitle}>1. STOP (Claim Identified)</strong>
                        <p style={styles.stepText}>{result.method.stop}</p>
                      </div>
                    )}
                    {result.method.investigateSource && (
                      <div style={styles.methodStep}>
                        <strong style={styles.stepTitle}>2. INVESTIGATE SOURCE</strong>
                        <p style={styles.stepText}>{result.method.investigateSource}</p>
                      </div>
                    )}
                    {result.method.findBetterCoverage && (
                      <div style={styles.methodStep}>
                        <strong style={styles.stepTitle}>3. FIND BETTER COVERAGE</strong>
                        <p style={styles.stepText}>{result.method.findBetterCoverage}</p>
                      </div>
                    )}
                    {result.method.traceClaims && (
                      <div style={styles.methodStep}>
                        <strong style={styles.stepTitle}>4. TRACE CLAIMS TO ORIGIN</strong>
                        <p style={styles.stepText}>{result.method.traceClaims}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Gemini Multi-Turn Follow-up Chatbot Drawer */}
            <div style={styles.chatSection}>
              <button
                style={styles.chatToggleBtn}
                onClick={() => setChatOpen(!chatOpen)}
              >
                💬 {chatOpen ? "Close Detective Chatbot" : "Ask Detective Assistant (Follow-up Chat)"}
              </button>

              {chatOpen && (
                <div style={styles.chatDrawer}>
                  <div style={styles.chatHeader}>
                    <span>Gemini Detective Assistant</span>
                    <small style={{ color: "#a0762a" }}>Multi-turn SIFT Chat</small>
                  </div>

                  {/* Chips for quick questions */}
                  <div style={styles.chipRow}>
                    <button style={styles.chip} onClick={() => handleSendChat("Why was this claim assigned this verdict?")}>
                      Why this verdict?
                    </button>
                    <button style={styles.chip} onClick={() => handleSendChat("Can you give me a 2-sentence simple summary for students?")}>
                      Student summary
                    </button>
                    <button style={styles.chip} onClick={() => handleSendChat("What primary sources should I check myself?")}>
                      Primary sources
                    </button>
                  </div>

                  <div style={styles.chatBox}>
                    {chatMessages.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          ...styles.chatMsg,
                          ...(m.role === "user" ? styles.chatUserMsg : styles.chatModelMsg),
                        }}
                      >
                        <strong>{m.role === "user" ? "You" : "Detective AI"}:</strong>
                        <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{m.text}</div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div style={{ ...styles.chatMsg, ...styles.chatModelMsg }}>
                        <em>Detective AI is thinking...</em>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  <div style={styles.chatInputRow}>
                    <input
                      type="text"
                      style={styles.chatInput}
                      value={chatInput}
                      placeholder="Ask a follow-up question..."
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    />
                    <button
                      style={styles.chatSendBtn}
                      onClick={() => handleSendChat()}
                      disabled={chatLoading || !chatInput.trim()}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Developer Raw Response Inspector */}
            {rawResponse && (
              <div style={{ marginTop: 18, borderTop: "1px solid #8a7d5e", paddingTop: 10 }}>
                <button
                  style={styles.debugToggleBtn}
                  onClick={() => setShowRawTextToggle(!showRawTextToggle)}
                >
                  {showRawTextToggle ? "Hide Raw Model Response" : "Inspect Raw Gemini Model Response"}
                </button>
                {showRawTextToggle && (
                  <pre style={styles.rawPre}>{rawResponse}</pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 640, margin: "0 auto", fontFamily: "'IBM Plex Mono', monospace, courier" },
  header: { textAlign: "center", marginBottom: 20 },
  eyebrow: { fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#a99a6f" },
  title: { fontFamily: "Georgia, serif", fontSize: 30, margin: "6px 0", color: "#1c1a17" },
  sub: { fontStyle: "italic", color: "#8a7d5e", fontSize: 14, fontFamily: "Georgia, serif" },
  card: {
    background: "#eee6d3",
    border: "1px solid #8a7d5e",
    padding: "22px 20px",
    borderRadius: 4,
    boxShadow: "0 4px 12px rgba(28,26,23,0.06)",
  },
  tabs: { display: "flex", gap: 6, marginBottom: 18, borderBottom: "2px solid #1c1a17" },
  tab: {
    flex: 1,
    padding: "10px 8px",
    background: "#d8c8a0",
    border: "1px solid #8a7d5e",
    borderBottom: "none",
    fontWeight: 600,
    fontSize: 12,
    textTransform: "uppercase",
    cursor: "pointer",
    color: "#6b6250",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  tabActive: { background: "#eee6d3", color: "#1c1a17" },
  label: { display: "block", fontSize: 11, textTransform: "uppercase", color: "#6b6250", marginBottom: 8, letterSpacing: "0.05em" },
  textarea: {
    width: "100%",
    minHeight: 95,
    fontSize: 15,
    padding: 12,
    background: "#fbf7ec",
    border: "1px solid #8a7d5e",
    borderRadius: 2,
    fontFamily: "Georgia, serif",
    color: "#1c1a17",
    lineHeight: 1.5,
    boxSizing: "border-box",
  },
  input: {
    width: "100%",
    fontSize: 15,
    padding: 12,
    background: "#fbf7ec",
    border: "1px solid #8a7d5e",
    borderRadius: 2,
    fontFamily: "'IBM Plex Mono', monospace",
    color: "#1c1a17",
    boxSizing: "border-box",
  },
  drop: {
    border: "2px dashed #8a7d5e",
    padding: 24,
    textAlign: "center",
    background: "#fbf7ec",
    cursor: "pointer",
    color: "#6b6250",
    fontSize: 13,
  },
  previewImg: { maxWidth: "100%", maxHeight: 200, borderRadius: 2 },
  go: {
    marginTop: 16,
    width: "100%",
    padding: 13,
    background: "#1c1a17",
    color: "#eee6d3",
    border: "none",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    cursor: "pointer",
    borderRadius: 2,
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 700,
  },
  loadingProgressBox: {
    marginTop: 14,
    padding: 12,
    background: "#fbf7ec",
    border: "1px solid #8a7d5e",
    borderRadius: 2,
  },
  loadingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  loadingStageText: {
    color: "#1c1a17",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  loadingPercentText: {
    color: "#7A1F2B",
    fontWeight: 700,
  },
  groundingWarningBox: {
    marginBottom: 16,
    padding: 12,
    background: "#fdf3e7",
    border: "1px solid #a0762a",
    color: "#a0762a",
    fontSize: 12,
    borderRadius: 2,
    fontFamily: "Georgia, serif",
  },
  warningTitle: {
    fontWeight: 700,
    marginBottom: 4,
    textTransform: "uppercase",
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  errorBox: {
    marginTop: 16,
    padding: 14,
    background: "#f4e2df",
    border: "1px solid #a3352b",
    color: "#a3352b",
    fontSize: 13,
    borderRadius: 2,
  },
  errorTitle: {
    fontWeight: 700,
    marginBottom: 4,
    textTransform: "uppercase",
    fontSize: 12,
  },
  result: { marginTop: 22, borderTop: "2px dashed #8a7d5e", paddingTop: 18 },
  stampRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  stamp: {
    display: "inline-block",
    fontSize: 18,
    fontWeight: 800,
    padding: "6px 14px",
    border: "3px solid currentColor",
    borderRadius: 4,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    transform: "rotate(-3deg)",
    boxShadow: "2px 2px 0px rgba(0,0,0,0.1)",
  },
  claimTypeTag: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#6b6250",
    border: "1px solid #8a7d5e",
    borderRadius: 12,
    padding: "3px 10px",
  },
  verdictText: { fontSize: 16, lineHeight: 1.5, marginBottom: 16, fontFamily: "Georgia, serif" },
  headlineText: { fontSize: 18, color: "#1c1a17" },
  evidenceHeader: { fontSize: 11, textTransform: "uppercase", color: "#6b6250", margin: "0 0 8px", letterSpacing: "0.05em" },
  evidenceList: { margin: 0, paddingLeft: 18 },
  evidenceItem: { fontSize: 14, marginBottom: 6, lineHeight: 1.4, fontFamily: "Georgia, serif" },
  sourceLink: { color: "#7A1F2B", textDecoration: "underline", fontWeight: 600 },
  confidenceWrap: { marginTop: 16, fontSize: 12, color: "#6b6250" },
  confidenceHeader: { display: "flex", justifyContent: "space-between", marginBottom: 4, textTransform: "uppercase", fontSize: 11 },
  bar: { height: 8, background: "#d8c8a0", border: "1px solid #8a7d5e", marginTop: 4, overflow: "hidden", borderRadius: 2 },
  barFill: { height: "100%", background: "#1c1a17" },
  methodSection: { marginTop: 18, borderTop: "1px dashed #8a7d5e", paddingTop: 12 },
  methodToggle: {
    background: "none",
    border: "none",
    color: "#6b6250",
    fontSize: 12,
    cursor: "pointer",
    textTransform: "uppercase",
    fontWeight: 700,
    padding: 0,
    letterSpacing: "0.05em",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  methodContent: { marginTop: 10, paddingLeft: 8, borderLeft: "2px solid #8a7d5e" },
  methodStep: { marginBottom: 10 },
  stepTitle: { display: "block", fontSize: 11, textTransform: "uppercase", color: "#1c1a17" },
  stepText: { margin: "2px 0 0", fontSize: 13, fontFamily: "Georgia, serif", color: "#3a352c", lineHeight: 1.4 },
  debugToggleBtn: {
    background: "none",
    border: "1px solid #8a7d5e",
    color: "#8a7d5e",
    fontSize: 11,
    cursor: "pointer",
    textTransform: "uppercase",
    padding: "4px 8px",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  rawPre: {
    marginTop: 8,
    padding: 10,
    background: "#1c1a17",
    color: "#eee6d3",
    fontSize: 11,
    borderRadius: 3,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    maxHeight: 200,
    overflowY: "auto",
  },
  thinkingToggleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#fbf7ec",
    border: "1px solid #8a7d5e",
    padding: "6px 12px",
    borderRadius: 3,
    cursor: "pointer",
  },
  thinkingText: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1c1a17",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  groundingBadgeRow: {
    marginTop: 10,
    marginBottom: 4,
  },
  groundingBadge: {
    display: "inline-block",
    fontSize: 11,
    color: "#3d5c3a",
    background: "#eef5ed",
    border: "1px solid #3d5c3a",
    borderRadius: 3,
    padding: "3px 8px",
    fontWeight: 600,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  intelBox: {
    marginTop: 18,
    paddingTop: 14,
    borderTop: "1px dashed #8a7d5e",
  },
  intelTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
    color: "#1c1a17",
    marginBottom: 8,
  },
  intelGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  intelBtn: {
    padding: "8px 10px",
    background: "#fbf7ec",
    border: "1px solid #8a7d5e",
    borderRadius: 3,
    fontSize: 12,
    fontWeight: 600,
    color: "#1c1a17",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  intelBtnActive: {
    background: "#1c1a17",
    color: "#eee6d3",
  },
  intelLoadingText: {
    marginTop: 10,
    fontSize: 12,
    fontStyle: "italic",
    color: "#7A1F2B",
  },
  intelOutputCard: {
    marginTop: 12,
    padding: 12,
    background: "#fbf7ec",
    border: "1px solid #8a7d5e",
    borderRadius: 3,
  },
  intelOutputHeader: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1c1a17",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  intelOutputBody: {
    fontSize: 13,
    lineHeight: 1.5,
    fontFamily: "Georgia, serif",
    color: "#2a2620",
    whiteSpace: "pre-wrap",
  },
  chatSection: {
    marginTop: 18,
    borderTop: "1px dashed #8a7d5e",
    paddingTop: 14,
  },
  chatToggleBtn: {
    width: "100%",
    padding: "10px",
    background: "#3a352c",
    color: "#eee6d3",
    border: "none",
    borderRadius: 3,
    fontWeight: 700,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    cursor: "pointer",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  chatDrawer: {
    marginTop: 12,
    padding: 12,
    background: "#fbf7ec",
    border: "1px solid #8a7d5e",
    borderRadius: 3,
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 700,
    fontSize: 13,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottom: "1px solid #8a7d5e",
  },
  chipRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  chip: {
    background: "#eee6d3",
    border: "1px solid #8a7d5e",
    borderRadius: 12,
    padding: "3px 9px",
    fontSize: 11,
    cursor: "pointer",
    color: "#1c1a17",
  },
  chatBox: {
    maxHeight: 220,
    overflowY: "auto",
    paddingRight: 4,
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  chatMsg: {
    padding: "8px 10px",
    borderRadius: 4,
    fontSize: 13,
    lineHeight: 1.4,
    fontFamily: "Georgia, serif",
  },
  chatUserMsg: {
    background: "#eee6d3",
    border: "1px solid #8a7d5e",
    alignSelf: "flex-end",
    maxWidth: "88%",
  },
  chatModelMsg: {
    background: "#ffffff",
    border: "1px solid #8a7d5e",
    alignSelf: "flex-start",
    maxWidth: "92%",
  },
  chatInputRow: {
    display: "flex",
    gap: 6,
  },
  chatInput: {
    flex: 1,
    padding: "8px 10px",
    fontSize: 13,
    border: "1px solid #8a7d5e",
    borderRadius: 2,
    fontFamily: "Georgia, serif",
  },
  chatSendBtn: {
    padding: "8px 14px",
    background: "#1c1a17",
    color: "#eee6d3",
    border: "none",
    borderRadius: 2,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'IBM Plex Mono', monospace",
  },
};

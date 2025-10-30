import { useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";

const CONTRACT_ADDRESS = "REPLACE_WITH_CONTRACT_ADDRESS";
const CONTRACT_ABI = [];

export default function App() {
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [minting, setMinting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [refLink, setRefLink] = useState("");

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatus("Install MetaMask or a Base wallet.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
    } catch {
      setStatus("Wallet connection failed.");
    }
  }

  function previewName() {
    const clean = (name || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 30);
    setPreview(clean ? `${clean}.aliveonbase` : "");
  }

  async function mint() {
    if (!name) {
      setStatus("Enter a name first.");
      return;
    }
    const clean = name.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    try {
      setMinting(true);
      setStatus("Awaiting confirmation...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const fee = ethers.parseEther("0.0001");
      const tx = await contract.register(clean, { value: fee });
      setStatus("Transaction sent...");
      await tx.wait();
      setStatus(`Success — ${clean}.aliveonbase registered.`);
      setPreview(`${clean}.aliveonbase`);
      setRefLink(`https://aliveonbase.vercel.app/?ref=${account}`);
      setShowPopup(true);
    } catch (e) {
      console.error(e);
      setStatus("Transaction failed or cancelled.");
    } finally {
      setMinting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container">
        <header className="header">
          <div className="logo">Alive On Base</div>
          <div style={{ display: "flex", gap: 12 }}>
            <a
              href="https://x.com/aliveonbase"
              target="_blank"
              rel="noreferrer"
              className="text-[14px] text-white/80"
            >
              Follow
            </a>
            <button onClick={connectWallet} className="btn btn-primary">
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
            </button>
          </div>
        </header>

        <main className="hero">
          <motion.div
            className="hero-left"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 style={{ fontSize: 44, fontWeight: 800, marginBottom: 12 }}>
              Alive On Base.
              <span
                style={{
                  display: "block",
                  color: "var(--base-blue)",
                  fontWeight: 600,
                  fontSize: 24,
                }}
              >
                A digital pulse that never stops.
              </span>
            </h1>
            <p style={{ color: "var(--muted)", maxWidth: 640, marginBottom: 18 }}>
              Register your <strong style={{ color: "var(--base-blue)" }}>.aliveonbase</strong>{" "}
              identity and receive an on-chain proof card.
            </p>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input
                type="text"
                placeholder="choose name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={previewName}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "rgba(255,255,255,0.07)",
                  color: "#fff",
                  minWidth: 220,
                  outline: "none",
                }}
              />
              <button
                onClick={mint}
                disabled={minting}
                className="btn btn-primary"
              >
                {minting ? "Minting..." : "Mint Name"}
              </button>
              <button
                onClick={previewName}
                className="btn"
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "var(--muted)",
                }}
              >
                Preview
              </button>
            </div>

            {status && <p style={{ marginTop: 12, color: "var(--muted)" }}>{status}</p>}
          </motion.div>

          <motion.div
            className="hero-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card" role="img" aria-label="card preview">
              <div className="card-title">{preview || "yourname.aliveonbase"}</div>
              <div className="card-sub">Proof of registration</div>
            </div>
          </motion.div>
        </main>

        {showPopup && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
          >
            <div
              style={{
                background: "#0b1630",
                padding: "30px 40px",
                borderRadius: 16,
                textAlign: "center",
                maxWidth: 420,
              }}
            >
              <h2 style={{ color: "#fff", fontSize: 22, marginBottom: 10 }}>
                You’re Alive on Base 🎉
              </h2>
              <p style={{ color: "#9fb0d6", fontSize: 15, marginBottom: 20 }}>
                Registration complete. Share your link to invite others:
              </p>
              <input
                readOnly
                value={refLink}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.07)",
                  color: "#fff",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  marginBottom: 20,
                  textAlign: "center",
                }}
              />
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `I just claimed my name on Base 🎯 I’m officially alive!\n\nMint yours and join the movement: ${refLink}`
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  background: "#0052ff",
                  color: "#fff",
                  borderRadius: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Share on X
              </a>
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => setShowPopup(false)}
                  style={{
                    background: "transparent",
                    color: "#9fb0d6",
                    border: "none",
                    marginTop: 10,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <footer
          style={{
            marginTop: 36,
            padding: "24px 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            color: "var(--muted)",
          }}
        >
          © {new Date().getFullYear()} Alive On Base — Built on Base
        </footer>
      </div>
    </div>
  );
}

import { useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";

const CONTRACT_ADDRESS = "REPLACE_WITH_CONTRACT_ADDRESS";
const CONTRACT_ABI = []; // paste ABI JSON here after contract deploy

export default function App() {
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [minting, setMinting] = useState(false);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatus("Install MetaMask or a Base-compatible wallet.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
    } catch {
      setStatus("Wallet connection cancelled or failed.");
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
    if (!name) return setStatus("Enter a name first.");
    const clean = name.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    try {
      setMinting(true);
      setStatus("Awaiting wallet confirmation...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const fee = ethers.parseEther("0.0001");
      const tx = await contract.register(clean, { value: fee });
      setStatus("Transaction sent — waiting for confirmation...");
      await tx.wait();
      setStatus(`Success — ${clean}.aliveonbase registered.`);
      setPreview(`${clean}.aliveonbase`);
    } catch (e) {
      console.error(e);
      setStatus("Transaction failed or was cancelled.");
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
            <a href="https://x.com/aliveonbase" target="_blank" rel="noreferrer" className="text-[14px] text-white/80">Follow</a>
            <button onClick={connectWallet} className="btn btn-primary">
              {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "Connect Wallet"}
            </button>
          </div>
        </header>

        <main className="hero">
          <motion.div className="hero-left" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 style={{ fontSize: 44, fontWeight: 800, marginBottom: 12 }}>
              Alive On Base.
              <span style={{ display: "block", color: "var(--base-blue)", fontWeight: 600, fontSize: 24 }}>A digital pulse that never stops.</span>
            </h1>
            <p style={{ color: "var(--muted)", maxWidth: 640, marginBottom: 18 }}>
              Register your <strong style={{ color: "var(--base-blue)" }}>.aliveonbase</strong> identity and receive an on-chain proof card.
            </p>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input
                type="text"
                placeholder="choose name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={previewName}
                style={{ padding: "10px 14px", borderRadius: 10, border: "none", minWidth: 220 }}
              />
              <button onClick={mint} disabled={minting} className="btn btn-primary">
                {minting ? "Minting..." : "Mint Name"}
              </button>
              <button onClick={previewName} className="btn" style={{ border: "1px solid rgba(255,255,255,0.06)", color: "var(--muted)" }}>
                Preview
              </button>
            </div>

            {status && <p style={{ marginTop: 12, color: "var(--muted)" }}>{status}</p>}
          </motion.div>

          <motion.div className="hero-right" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="card" role="img" aria-label="card preview">
              <div className="card-title">{preview || "yourname.aliveonbase"}</div>
              <div className="card-sub">Proof of registration</div>
            </div>
          </motion.div>
        </main>

        <section style={{ padding: "28px 0" }}>
          <h3 style={{ marginBottom: 12 }}>Why mint an Alive Name?</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ minWidth: 220, padding: 18, borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
              <strong>Proof of Life</strong>
              <p style={{ color: "var(--muted)" }}>On-chain identity that shows your presence on Base.</p>
            </div>
            <div style={{ minWidth: 220, padding: 18, borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
              <strong>Collector Status</strong>
              <p style={{ color: "var(--muted)" }}>Early names are memorable and scarce.</p>
            </div>
            <div style={{ minWidth: 220, padding: 18, borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
              <strong>Future Utility</strong>
              <p style={{ color: "var(--muted)" }}>Names will enable priority access and integrations.</p>
            </div>
          </div>
        </section>

        <footer style={{ marginTop: 36, padding: "24px 0", borderTop: "1px solid rgba(255,255,255,0.06)", color: "var(--muted)" }}>
          © {new Date().getFullYear()} Alive On Base — Built on Base
        </footer>
      </div>
    </div>
  );
}

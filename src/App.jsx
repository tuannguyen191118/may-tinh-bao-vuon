import { useMemo, useState } from "react";
import {
  Calculator,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import "./App.css";

const defaultPrices = {
  ri6: { A: 35, B: 25, CD: 15, Kem: 10 },
  thai: { A: 45, B: 35, CD: 20, Kem: 15 },
};

const defaultRates = {
  ri6: { A: 30, B: 40, CD: 20, Kem: 10 },
  thai: { A: 40, B: 30, CD: 20, Kem: 10 },
};

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function moneyK(v) {
  return Math.round(v * 1000).toLocaleString("vi-VN") + " đ";
}

function million(v) {
  return (v / 1_000_000).toLocaleString("vi-VN", {
    maximumFractionDigits: 1,
  }) + " triệu";
}

function RateInput({ label, value, onChange }) {
  return (
    <div className="rate-box">
      <div className="row">
        <span>{label}</span>
        <div>
          <input
            className="mini-input"
            value={value}
            onChange={(e) => onChange(toNumber(e.target.value))}
          />
          <span className="unit">%</span>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(toNumber(e.target.value))}
      />
    </div>
  );
}

function VarietyCard({ title, tons, setTons, rates, setRate, prices }) {
  const sum = rates.A + rates.B + rates.CD + rates.Kem;
  const avg =
    (prices.A * rates.A +
      prices.B * rates.B +
      prices.CD * rates.CD +
      prices.Kem * rates.Kem) /
    100;

  return (
    <div className="card">
      <div className="between">
        <div>
          <h2>{title}</h2>
          <p>Giá trị bình quân: {moneyK(avg)}/kg</p>
        </div>
        <span className={sum === 100 ? "badge ok" : "badge warn"}>
          Tổng {sum}%
        </span>
      </div>

      <label>Sản lượng ước tính</label>
      <div className="input-wrap">
        <input
          value={tons}
          onChange={(e) => setTons(toNumber(e.target.value))}
        />
        <span>tấn</span>
      </div>

      <RateInput label="Loại A" value={rates.A} onChange={(v) => setRate("A", v)} />
      <RateInput label="Loại B" value={rates.B} onChange={(v) => setRate("B", v)} />
      <RateInput label="C,D" value={rates.CD} onChange={(v) => setRate("CD", v)} />
      <RateInput label="Kem" value={rates.Kem} onChange={(v) => setRate("Kem", v)} />
    </div>
  );
}

function PriceCard({ title, prices, setPrice }) {
  return (
    <div className="card">
      <h2>Giá {title} theo loại</h2>
      <div className="price-grid">
        {[
          ["A", "Loại A"],
          ["B", "Loại B"],
          ["CD", "C,D"],
          ["Kem", "Kem"],
        ].map(([key, label]) => (
          <div key={key}>
            <label>{label}</label>
            <div className="input-wrap small">
              <input
                value={prices[key]}
                onChange={(e) => setPrice(key, toNumber(e.target.value))}
              />
              <span>k/kg</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [buyPrice, setBuyPrice] = useState(30);
  const [ri6Tons, setRi6Tons] = useState(20);
  const [thaiTons, setThaiTons] = useState(20);
  const [prices, setPrices] = useState(defaultPrices);
  const [rates, setRates] = useState(defaultRates);

  const result = useMemo(() => {
    const ri6Avg =
      (prices.ri6.A * rates.ri6.A +
        prices.ri6.B * rates.ri6.B +
        prices.ri6.CD * rates.ri6.CD +
        prices.ri6.Kem * rates.ri6.Kem) /
      100;

    const thaiAvg =
      (prices.thai.A * rates.thai.A +
        prices.thai.B * rates.thai.B +
        prices.thai.CD * rates.thai.CD +
        prices.thai.Kem * rates.thai.Kem) /
      100;

    const totalTons = ri6Tons + thaiTons;
    const avg =
      totalTons > 0
        ? (ri6Avg * ri6Tons + thaiAvg * thaiTons) / totalTons
        : 0;

    const profitPerKgK = avg - buyPrice;
    const profitVND = profitPerKgK * 1000 * totalTons * 1000;
    const costVND = buyPrice * 1000 * totalTons * 1000;
    const revenueVND = avg * 1000 * totalTons * 1000;

    return { avg, profitPerKgK, profitVND, costVND, revenueVND };
  }, [prices, rates, ri6Tons, thaiTons, buyPrice]);

  const status =
    result.profitPerKgK >= 2 ? "safe" : result.profitPerKgK >= 0 ? "thin" : "loss";

  function reset() {
    setBuyPrice(30);
    setRi6Tons(20);
    setThaiTons(20);
    setPrices(defaultPrices);
    setRates(defaultRates);
  }

  return (
    <main>
      <section className="hero">
        <div className="between">
          <div>
            <p className="green">
              <Calculator size={16} /> Máy tính bao vườn
            </p>
            <h1>Sầu riêng lời hay lỗ?</h1>
          </div>
          <button onClick={reset}>
            <RotateCcw size={18} />
          </button>
        </div>

        <label>Giá nông dân chào bán đồng giá</label>
        <div className="big-input">
          <input value={buyPrice} onChange={(e) => setBuyPrice(toNumber(e.target.value))} />
          <span>k/kg</span>
        </div>
      </section>

      <section className="card result">
        <div className="between">
          <div>
            <p>Kết quả toàn vườn</p>
            <h1 style={{
    color: result.profitVND >= 0 ? "#16a34a" : "#dc2626",
  }}
>
  {million(result.profitVND)}</h1>
          </div>

          {status === "safe" && <span className="badge ok"><CheckCircle2 size={16} /> An toàn</span>}
          {status === "thin" && <span className="badge warn"><AlertTriangle size={16} /> Mỏng lời</span>}
          {status === "loss" && <span className="badge bad"><TrendingDown size={16} /> Lỗ</span>}
        </div>

        <div className="grid">
          <div>
            <p>Bình quân thực</p>
            <b>{moneyK(result.avg)}/kg</b>
          </div>
          <div>
            <p>Lời/lỗ mỗi kg</p>
            <b>{result.profitPerKgK >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {moneyK(result.profitPerKgK)}</b>
          </div>
          <div>
            <p>Tiền mua</p>
            <b>{million(result.costVND)}</b>
          </div>
          <div>
            <p>Giá trị bán ra</p>
            <b>{million(result.revenueVND)}</b>
          </div>
        </div>

        <div className="break-even">
          <p>Giá mua tối đa để hòa vốn</p>
          <h2>{moneyK(result.avg)}/kg</h2>
          <small>Muốn an toàn 2k/kg thì nên mua tối đa khoảng {moneyK(result.avg - 2)}/kg.</small>
        </div>
      </section>

      <VarietyCard
        title="Ri6"
        tons={ri6Tons}
        setTons={setRi6Tons}
        rates={rates.ri6}
        prices={prices.ri6}
        setRate={(key, v) => setRates((r) => ({ ...r, ri6: { ...r.ri6, [key]: v } }))}
      />

      <VarietyCard
        title="Thái"
        tons={thaiTons}
        setTons={setThaiTons}
        rates={rates.thai}
        prices={prices.thai}
        setRate={(key, v) => setRates((r) => ({ ...r, thai: { ...r.thai, [key]: v } }))}
      />

      <PriceCard
        title="Ri6"
        prices={prices.ri6}
        setPrice={(key, v) => setPrices((p) => ({ ...p, ri6: { ...p.ri6, [key]: v } }))}
      />

      <PriceCard
        title="Thái"
        prices={prices.thai}
        setPrice={(key, v) => setPrices((p) => ({ ...p, thai: { ...p.thai, [key]: v } }))}
      />

      <p className="note">
        Bản thử nghiệm dùng để ước lượng nhanh. Khi đi thực tế nên cộng thêm hao hụt, vận chuyển, nhân công và rủi ro phân loại sai.
      </p>
    </main>
  );
}
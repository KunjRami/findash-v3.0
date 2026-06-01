import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import usePortfolioStore from "../../store/portfolioStore";

export default function AddHoldingModal({ onClose }) {
  const addItem = usePortfolioStore((s) => s.addItem);

  const [form, setForm] = useState({
    symbol: "",
    company_name: "",
    quantity: "",
    buy_price: "",
    buy_date: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleAdd = async () => {
    if (
      !form.symbol ||
      !form.company_name ||
      !form.quantity ||
      !form.buy_price
    ) {
      setErr("Symbol, name, quantity and buy price are required.");
      return;
    }

    setSubmitting(true);
    setErr("");

    const result = await addItem({
      symbol: form.symbol.toUpperCase().includes(".")
        ? form.symbol.toUpperCase()
        : `${form.symbol.toUpperCase()}.NS`,
      company_name: form.company_name,
      quantity: parseFloat(form.quantity),
      buy_price: parseFloat(form.buy_price),
      buy_date: form.buy_date || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErr(result.error || "Failed to add holding.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fin-card w-full max-w-md p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-fin-text-primary">
            Add Holding
          </h3>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-fin-muted text-fin-text-secondary"
          >
            <X size={16} />
          </button>
        </div>

        {err && (
          <div className="bg-fin-red/10 border border-fin-red/30 text-fin-red text-xs p-3 rounded-lg">
            {err}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.symbol}
            onChange={handleChange("symbol")}
            placeholder="RELIANCE.NS"
            className="fin-input"
          />

          <input
            value={form.company_name}
            onChange={handleChange("company_name")}
            placeholder="Reliance Industries"
            className="fin-input"
          />

          <input
            type="number"
            value={form.quantity}
            onChange={handleChange("quantity")}
            placeholder="10"
            className="fin-input"
          />

          <input
            type="number"
            value={form.buy_price}
            onChange={handleChange("buy_price")}
            placeholder="2400"
            className="fin-input"
          />

          <input
            value={form.buy_date}
            onChange={handleChange("buy_date")}
            placeholder="2024-01-15"
            className="fin-input col-span-2"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="fin-btn-ghost flex-1"
          >
            Cancel
          </button>

          <button
            onClick={handleAdd}
            disabled={submitting}
            className="fin-btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Add Holding
          </button>
        </div>
      </motion.div>
    </div>
  );
}
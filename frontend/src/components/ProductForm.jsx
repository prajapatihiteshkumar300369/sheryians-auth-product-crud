import { useEffect, useState } from "react";

const initialState = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  image: ""
};

export default function ProductForm({ editingProduct, onSaved, onCancel }) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        stock: editingProduct.stock,
        image: editingProduct.image || ""
      });
    } else {
      setForm(initialState);
    }
  }, [editingProduct]);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await onSaved({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock)
      });
      setForm(initialState);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors?.map((item) => item.message).join(", ") ||
          err.response?.data?.message ||
          "Something went wrong"
      );
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{editingProduct ? "Update Product" : "Create Product"}</h2>

      <input
        name="name"
        placeholder="Product name"
        value={form.name}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        required
      />

      <input
        name="price"
        type="number"
        min="0"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
        required
      />

      <input
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
        required
      />

      <input
        name="stock"
        type="number"
        min="0"
        placeholder="Stock"
        value={form.stock}
        onChange={handleChange}
        required
      />

      <input
        name="image"
        placeholder="Image URL"
        value={form.image}
        onChange={handleChange}
      />

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button type="submit">
          {editingProduct ? "Update" : "Create"}
        </button>

        {editingProduct && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

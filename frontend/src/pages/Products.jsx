import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import ProductForm from "../components/ProductForm";

const PAGE_SIZE = 9;

export default function Products() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState("");

  async function loadProducts(targetPage = page) {
    try {
      const response = await api.get("/products", {
        params: { page: targetPage, limit: PAGE_SIZE }
      });
      const { products: list, pagination } = response.data;

      // If the last item of the last page was deleted, step back one page.
      if (!list.length && targetPage > 1) {
        setPage(targetPage - 1);
        return;
      }

      setProducts(list);
      setTotalPages(Math.max(pagination.totalPages, 1));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load products");
    }
  }

  useEffect(() => {
    loadProducts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function saveProduct(data) {
    if (editingProduct) {
      await api.put(`/products/${editingProduct._id}`, data);
      setEditingProduct(null);
    } else {
      await api.post("/products", data);
      setPage(1);
    }

    await loadProducts(editingProduct ? page : 1);
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      if (editingProduct?._id === id) setEditingProduct(null);
      await loadProducts(page);
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div>
      <header className="navbar">
        <div>
          <strong>E-Commerce</strong>
          {user && <span className="welcome">Hi, {user.name}</span>}
        </div>

        {user ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <div className="actions">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </header>

      <main className="container">
        {user && (
          <ProductForm
            editingProduct={editingProduct}
            onSaved={saveProduct}
            onCancel={() => setEditingProduct(null)}
          />
        )}

        {error && <p className="error">{error}</p>}

        <section>
          <h2>Products</h2>

          <div className="grid">
            {products.map((product) => (
              <article className="card product" key={product._id}>
                {product.image && (
                  <img src={product.image} alt={product.name} />
                )}

                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>
                  <b>₹{product.price}</b>
                </p>
                <p>Category: {product.category}</p>
                <p>Stock: {product.stock}</p>

                {user && (
                  <div className="actions">
                    <button onClick={() => setEditingProduct(product)}>
                      Edit
                    </button>
                    <button
                      className="danger"
                      onClick={() => deleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          {!products.length && !error && <p>No products found.</p>}

          {totalPages > 1 && (
            <div className="actions pagination">
              <button
                className="secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                className="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

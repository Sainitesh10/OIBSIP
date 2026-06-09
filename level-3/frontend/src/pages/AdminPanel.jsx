import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const AdminPanel = () => {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Refill quantity tracking: key = ingredientId, val = qty
  const [refillQty, setRefillQty] = useState({});

  // Add new ingredient state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('veg');
  const [newStock, setNewStock] = useState(100);
  const [newThreshold, setNewThreshold] = useState(20);
  const [newPrice, setNewPrice] = useState(15);
  const [addLoading, setAddLoading] = useState(false);

  const { API_URL } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const inventoryRes = await axios.get(`${API_URL}/inventory`);
      const ordersRes = await axios.get(`${API_URL}/orders/all-orders`);
      setInventory(inventoryRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to fetch administrator data dashboard.' });
    } finally {
      setLoading(false);
    }
  };

  // Refill callback
  const handleRefill = async (id) => {
    const qty = refillQty[id];
    if (!qty || isNaN(qty) || parseInt(qty) <= 0) return;

    try {
      const { data } = await axios.post(`${API_URL}/inventory/refill`, {
        ingredientId: id,
        quantity: parseInt(qty),
      });

      setInventory(inventory.map(ing => ing._id === id ? data.ingredient : ing));
      setRefillQty({ ...refillQty, [id]: '' });
      setMessage({ type: 'success', text: `Refilled stock level successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Refill request failed.' });
    }
  };

  // Create new ingredient callback
  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!newName) return;

    setAddLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/inventory/add-ingredient`, {
        name: newName,
        category: newCategory,
        stock: newStock,
        threshold: newThreshold,
        price: newPrice,
      });

      setInventory([...inventory, data.ingredient]);
      setNewName('');
      setNewStock(100);
      setNewThreshold(20);
      setNewPrice(15);
      setMessage({ type: 'success', text: 'New ingredient added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add ingredient.' });
    } finally {
      setAddLoading(false);
    }
  };

  // Change order status callback
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { data } = await axios.put(`${API_URL}/orders/status`, {
        orderId,
        status: newStatus,
      });

      setOrders(orders.map(order => order._id === orderId ? data.order : order));
      setMessage({ type: 'success', text: `Order status updated to ${newStatus}` });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update order status.' });
    }
  };

  const lowStockAlerts = inventory.filter(ing => ing.stock < ing.threshold);
  const pendingOrders = orders.filter(o => o.status !== 'Delivered');

  return (
    <div>
      <Navbar />
      <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Control banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '28px', color: 'var(--accent-orange)' }}>
              ⚙️ Store Admin Control Center
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '6px' }}>
              Manage store inventory stocks, monitor alerts, and dispatch customer orders.
            </p>
          </div>
        </div>

        {message.text && (
          <div className="glass-card animate-slideup" style={{
            padding: '16px',
            marginBottom: '30px',
            textAlign: 'center',
            fontWeight: 700,
            background: message.type === 'success' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 107, 53, 0.1)',
            borderColor: message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-orange)',
            color: message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-orange)',
          }}>
            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
          </div>
        )}

        {/* Info stats widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'Share Tech Mono' }}>
              {orders.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
              Total Orders Logged
            </div>
          </div>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-orange)', fontFamily: 'Share Tech Mono' }}>
              {pendingOrders.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
              Pending Dispatch
            </div>
          </div>
          <div className="glass-card" style={{
            padding: '20px',
            textAlign: 'center',
            borderColor: lowStockAlerts.length > 0 ? 'var(--accent-orange)' : 'var(--border)',
            background: lowStockAlerts.length > 0 ? 'rgba(255, 107, 53, 0.05)' : 'var(--card)'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 800,
              color: lowStockAlerts.length > 0 ? 'var(--accent-orange)' : 'var(--accent-green)',
              fontFamily: 'Share Tech Mono'
            }}>
              {lowStockAlerts.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
              Low Stock Warnings
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>Loading Dashboard details...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '40px' }}>
            
            {/* Left: Inventory and Add Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              
              {/* Inventory Management Table */}
              <div>
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '18px', letterSpacing: '1px', marginBottom: '20px' }}>
                  📊 Store Inventory Status
                </h2>
                <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                        <th style={{ padding: '10px' }}>Name</th>
                        <th style={{ padding: '10px' }}>Stock</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Alert Threshold</th>
                        <th style={{ padding: '10px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((ing) => {
                        const isLow = ing.stock < ing.threshold;
                        
                        // Map progress bar color dynamically
                        const progressPct = Math.min((ing.stock / 150) * 100, 100);
                        const progressColor = isLow ? 'var(--accent-orange)' : ing.stock >= 40 ? 'var(--accent-green)' : '#ffd54f';

                        return (
                          <tr key={ing._id} style={{ borderBottom: '1px solid rgba(0,245,255,0.05)' }}>
                            <td style={{ padding: '12px 10px', fontWeight: 600 }}>
                              {ing.name}
                              <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                                {ing.category} | ₹{ing.price}
                              </div>
                            </td>
                            <td style={{ padding: '12px 10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontFamily: 'Share Tech Mono', fontWeight: 700, color: isLow ? 'var(--accent-orange)' : '#fff', fontSize: '14px' }}>
                                  {ing.stock}
                                </span>
                                {isLow && <span style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: 700 }}>⚠️</span>}
                              </div>
                              <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                                <div style={{ width: `${progressPct}%`, height: '100%', background: progressColor, borderRadius: '2px' }}></div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Share Tech Mono' }}>
                              {ing.threshold}
                            </td>
                            <td style={{ padding: '12px 10px' }}>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <input
                                  type="number"
                                  placeholder="+ Qty"
                                  className="input-cyber"
                                  style={{ width: '64px', padding: '6px', fontSize: '11px' }}
                                  value={refillQty[ing._id] || ''}
                                  onChange={(e) => setRefillQty({ ...refillQty, [ing._id]: e.target.value })}
                                />
                                <button
                                  onClick={() => handleRefill(ing._id)}
                                  className="btn-cyber btn-cyan"
                                  style={{ padding: '6px 12px', fontSize: '11px' }}
                                >
                                  Refill
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add New Stock Item form */}
              <div>
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '18px', letterSpacing: '1px', marginBottom: '20px' }}>
                  ➕ Add New Inventory Item
                </h2>
                <div className="glass-card" style={{ padding: '24px' }}>
                  <form onSubmit={handleAddIngredient} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '15px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                          Item Name
                        </label>
                        <input
                          type="text"
                          className="input-cyber"
                          placeholder="e.g. Red Paprika"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                          Category
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="input-cyber"
                          style={{ background: 'rgba(10,10,20,0.9)', color: '#fff' }}
                        >
                          <option value="base">Base</option>
                          <option value="sauce">Sauce</option>
                          <option value="cheese">Cheese</option>
                          <option value="veg">Veggies</option>
                          <option value="meat">Meat</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                          Stock Level
                        </label>
                        <input
                          type="number"
                          className="input-cyber"
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                          Alert Threshold
                        </label>
                        <input
                          type="number"
                          className="input-cyber"
                          value={newThreshold}
                          onChange={(e) => setNewThreshold(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                          Unit Price (₹)
                        </label>
                        <input
                          type="number"
                          className="input-cyber"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`btn-cyber btn-cyan ${addLoading ? 'btn-disabled' : ''}`}
                      disabled={addLoading}
                      style={{ marginTop: '10px' }}
                    >
                      {addLoading ? 'Adding item...' : 'Add Ingredient to Catalog'}
                    </button>
                  </form>
                </div>
              </div>

            </div>

            {/* Right: Orders Dispatch board */}
            <div>
              <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '18px', letterSpacing: '1px', marginBottom: '20px' }}>
                🛵 Customer Orders Dispatch Board
              </h2>
              {orders.length === 0 ? (
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                  No customer orders have been placed yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '850px', overflowY: 'auto', paddingRight: '10px' }}>
                  {orders.map((order) => {
                    const dateFormatted = new Date(order.createdAt).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    });

                    return (
                      <div key={order._id} className="glass-card" style={{ padding: '20px' }}>
                        
                        {/* Order Header */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid var(--border)',
                          paddingBottom: '10px',
                          marginBottom: '12px',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>ID: </span>
                            <span style={{ fontSize: '13px', fontFamily: 'Share Tech Mono', color: 'var(--accent-cyan)', fontWeight: 700 }}>{order._id}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            {dateFormatted}
                          </div>
                        </div>

                        {/* Customer Information */}
                        <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '12px', lineHeight: '1.4' }}>
                          <p><strong>Customer:</strong> {order.user?.name} ({order.user?.email})</p>
                          <p><strong>Address:</strong> {order.address}</p>
                        </div>

                        {/* Pizzas mapping */}
                        <div style={{
                          background: 'rgba(5,5,10,0.5)',
                          borderRadius: '6px',
                          padding: '10px 14px',
                          marginBottom: '15px'
                        }}>
                          <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            Items
                          </div>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '12px', color: '#fff', marginBottom: '6px' }}>
                              <span><strong>{item.quantity}x</strong> {item.name} (₹{item.price})</span>
                              {item.pizzaType === 'custom' && item.details && (
                                <div style={{ fontSize: '10px', color: 'var(--muted)', paddingLeft: '14px', marginTop: '2px' }}>
                                  Base: {item.details.base} | Sauce: {item.details.sauce} | Cheese: {item.details.cheese}
                                  {item.details.veggies?.length > 0 && ` | Veggies: ${item.details.veggies.join(', ')}`}
                                </div>
                              )}
                            </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(0,245,255,0.1)', paddingTop: '6px', marginTop: '8px', fontSize: '12px' }}>
                            <span style={{ color: 'var(--muted)' }}>Total Amount:</span>
                            <span style={{ color: 'var(--accent-cyan)', fontFamily: 'Share Tech Mono', fontWeight: 700 }}>₹{order.totalAmount}</span>
                          </div>
                        </div>

                        {/* Status Dispatch controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Current Status:
                            </span>
                            <div style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: order.status === 'Delivered' ? 'var(--accent-green)' : 'var(--accent-orange)',
                              marginTop: '2px'
                            }}>
                              {order.status === 'Delivered' ? '🏠 Delivered' : `⏳ ${order.status}`}
                            </div>
                          </div>

                          {order.status !== 'Delivered' && (
                            <div>
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                className="input-cyber"
                                style={{
                                  width: '150px',
                                  padding: '6px 10px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  background: 'rgba(10,10,20,0.9)',
                                  color: '#fff',
                                }}
                              >
                                <option value="Order Received">📝 Order Received</option>
                                <option value="In the kitchen">🍳 In the kitchen</option>
                                <option value="Sent to delivery">🛵 Sent to delivery</option>
                                <option value="Delivered">🏠 Delivered</option>
                              </select>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;

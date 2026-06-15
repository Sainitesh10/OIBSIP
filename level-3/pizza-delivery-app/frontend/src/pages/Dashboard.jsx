import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [pizzas, setPizzas] = useState([]);
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Mock Payment Bypass state
  const [showMockModal, setShowMockModal] = useState(false);
  const [pendingTx, setPendingTx] = useState(null);

  const { API_URL, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenu();
    // Load local cart if any
    const savedCart = localStorage.getItem('pizzaCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const fetchMenu = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/pizzas/menu`);
      setPizzas(data);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to load pizza menu.' });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (pizza) => {
    const existing = cart.find(item => item.pizzaId === pizza._id && item.pizzaType === 'preset');
    let updated;
    if (existing) {
      updated = cart.map(item =>
        item.pizzaId === pizza._id && item.pizzaType === 'preset'
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updated = [...cart, {
        pizzaType: 'preset',
        pizzaId: pizza._id,
        name: pizza.name,
        price: pizza.price,
        quantity: 1
      }];
    }
    setCart(updated);
    localStorage.setItem('pizzaCart', JSON.stringify(updated));
    setMessage({ type: 'success', text: `${pizza.name} added to cart!` });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const updateQuantity = (index, delta) => {
    const updated = cart.map((item, idx) => {
      if (idx === index) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);

    setCart(updated);
    localStorage.setItem('pizzaCart', JSON.stringify(updated));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Initiate checkout flow
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!address.trim()) {
      return setMessage({ type: 'error', text: 'Please provide a delivery address.' });
    }

    setMessage({ type: '', text: '' });
    setOrderLoading(true);

    try {
      // Step 1: Create transaction order in backend
      const { data } = await axios.post(`${API_URL}/orders/checkout`, { items: cart });

      // Step 2: Check if key is a placeholder to bypass real Razorpay
      const isPlaceholder = data.razorpayOrderId.startsWith('order_mock_');

      if (isPlaceholder) {
        // Show simulated Razorpay dialog
        setPendingTx({
          razorpayOrderId: data.razorpayOrderId,
          amount: data.amount,
          items: cart,
          address
        });
        setShowMockModal(true);
        setOrderLoading(false);
      } else {
        // Load real Razorpay script & checkout
        const options = {
          key: 'YOUR_RAZORPAY_KEY', // will be read from backend or injected
          amount: Math.round(data.amount * 100),
          currency: data.currency,
          name: 'PizzaFlow',
          description: 'Pizza Purchase Transaction',
          order_id: data.razorpayOrderId,
          handler: async (response) => {
            await finalizeOrder({
              items: cart,
              razorpayOrderId: data.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              address
            });
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: '#00f5ff',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setOrderLoading(false);
      }
    } catch (error) {
      console.error(error);
      setOrderLoading(false);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Checkout failed.' });
    }
  };

  // Finalize order callback
  const finalizeOrder = async (orderPayload) => {
    setOrderLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/orders/place-order`, orderPayload);
      setCart([]);
      localStorage.removeItem('pizzaCart');
      setShowMockModal(false);
      setPendingTx(null);
      setMessage({ type: 'success', text: 'Order placed successfully! Redirecting to tracking...' });
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to place order.' });
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Banner */}
        <div className="glass-card" style={{
          padding: '40px',
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.05) 0%, rgba(189, 0, 255, 0.05) 100%)',
        }}>
          <div>
            <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '32px', marginBottom: '10px' }}>
              🍕 Fresh Pizza, Delivered Fast
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
              Choose from our hand-crafted menu items, or customize your own slice by slice!
            </p>
          </div>
          <button
            onClick={() => navigate('/custom')}
            className="btn-cyber btn-cyan"
            style={{ fontSize: '14px', padding: '16px 32px' }}
          >
            🎨 Custom Pizza Builder
          </button>
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

        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr', gap: '40px' }}>
          
          {/* Menu Catalog */}
          <div>
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '20px', letterSpacing: '1px', marginBottom: '24px' }}>
              📋 Hand-Crafted Pizza Menu
            </h2>
            {loading ? (
              <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading menu items...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {pizzas.map((pizza) => (
                  <div key={pizza._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{
                      height: '160px',
                      background: `url(${pizza.image}) center/cover no-repeat`,
                      borderBottom: '1px solid var(--border)'
                    }}></div>
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{pizza.name}</h3>
                      <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: '1.5', flex: 1, marginBottom: '16px' }}>
                        {pizza.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '20px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                          ₹{pizza.price}
                        </span>
                        <button
                          onClick={() => addToCart(pizza)}
                          className="btn-cyber btn-cyan"
                          style={{ padding: '8px 16px', fontSize: '11px' }}
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout/Cart Sidebar */}
          <div>
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '20px', letterSpacing: '1px', marginBottom: '24px' }}>
              🛒 My Cart ({cart.reduce((s,i)=>s+i.quantity, 0)})
            </h2>
            <div className="glass-card" style={{ padding: '24px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: '14px' }}>
                  Your cart is empty. Add a pizza to get started!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
                    {cart.map((item, idx) => (
                      <div key={idx} style={{
                        paddingBottom: '15px',
                        borderBottom: '1px solid var(--border)',
                        marginBottom: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{item.name}</div>
                          {item.pizzaType === 'custom' && item.details && (
                            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', lineHeight: '1.4' }}>
                              Crust: {item.details.base} | Sauce: {item.details.sauce} | Cheese: {item.details.cheese}
                              {item.details.veggies?.length > 0 && ` | Veggies: ${item.details.veggies.join(', ')}`}
                            </div>
                          )}
                          <div style={{ fontSize: '13px', color: 'var(--accent-cyan)', marginTop: '6px', fontFamily: 'Share Tech Mono' }}>
                            ₹{item.price} x {item.quantity}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button onClick={() => updateQuantity(idx, -1)} className="btn-cyber btn-orange" style={{ padding: '2px 8px', fontSize: '10px' }}>-</button>
                          <span style={{ fontSize: '14px', fontWeight: 700, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(idx, 1)} className="btn-cyber btn-cyan" style={{ padding: '2px 8px', fontSize: '10px' }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', borderBottom: '2px dashed var(--border)', paddingBottom: '15px' }}>
                    <span>Total Amount:</span>
                    <span style={{ color: 'var(--accent-cyan)', fontFamily: 'Share Tech Mono' }}>₹{cartTotal}</span>
                  </div>

                  <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                        Delivery Address
                      </label>
                      <textarea
                        className="input-cyber"
                        placeholder="Enter full address for delivery..."
                        rows="3"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        style={{ resize: 'none', fontFamily: 'inherit' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className={`btn-cyber btn-orange ${orderLoading ? 'btn-disabled' : ''}`}
                      disabled={orderLoading}
                      style={{ width: '100%' }}
                    >
                      {orderLoading ? 'Processing Checkout...' : 'Pay with Razorpay'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Simulated Razorpay Sandbox Dialog */}
      {showMockModal && pendingTx && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 5, 10, 0.85)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card animate-slideup" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '30px',
            border: '2px solid var(--accent-cyan)',
            boxShadow: '0 0 30px rgba(0, 245, 255, 0.2)'
          }}>
            <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '18px', color: 'var(--accent-cyan)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💳 Razorpay Checkout <span style={{ fontSize: '11px', background: 'rgba(255,107,53,0.1)', color: 'var(--accent-orange)', padding: '2px 8px', borderRadius: '4px' }}>SANDBOX MODE</span>
            </h3>
            
            <div style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.6', marginBottom: '20px' }}>
              <p style={{ marginBottom: '8px' }}><strong>Order ID:</strong> {pendingTx.razorpayOrderId}</p>
              <p style={{ marginBottom: '8px' }}><strong>Amount Due:</strong> ₹{pendingTx.amount}</p>
              <p>Since no Razorpay Credentials are set in the `.env` configuration file, you can simulate a payment capture here.</p>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => finalizeOrder({
                  items: pendingTx.items,
                  razorpayOrderId: pendingTx.razorpayOrderId,
                  razorpayPaymentId: 'mock_success',
                  razorpaySignature: 'mock_signature_bypass',
                  address: pendingTx.address
                })}
                className="btn-cyber btn-cyan"
                style={{ flex: 1, fontSize: '11px' }}
              >
                Mock Success (Pay)
              </button>
              <button
                onClick={() => {
                  setShowMockModal(false);
                  setPendingTx(null);
                }}
                className="btn-cyber btn-orange"
                style={{ flex: 1, fontSize: '11px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

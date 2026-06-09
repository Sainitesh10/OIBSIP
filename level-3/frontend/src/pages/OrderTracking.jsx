import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { API_URL } = useAuth();

  useEffect(() => {
    fetchOrders();

    // Set up 5 seconds status polling to reflect admin changes in real time
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/orders/user-orders`);
      setOrders(data);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch orders log.');
    } finally {
      setLoading(false);
    }
  };

  // Status mapping to step index
  const statusSteps = {
    'Order Received': 0,
    'In the kitchen': 1,
    'Sent to delivery': 2,
    'Delivered': 3
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '40px 5%', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 900,
          fontSize: '28px',
          color: 'var(--accent-cyan)',
          letterSpacing: '-1px',
          textShadow: '0 0 10px rgba(0, 245, 255, 0.4)',
          marginBottom: '30px',
        }}>
          📦 Track My Orders
        </h1>

        {error && (
          <div className="glass-card animate-slideup" style={{
            padding: '14px',
            marginBottom: '24px',
            textAlign: 'center',
            color: 'var(--accent-orange)',
            borderColor: 'var(--accent-orange)',
            background: 'rgba(255, 107, 53, 0.1)',
            fontWeight: 700
          }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>Loading order records...</div>
        ) : orders.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
            No orders found. Once you place an order, it will appear here for tracking!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {orders.map((order) => {
              const currentStep = statusSteps[order.status] ?? 0;
              const dateFormatted = new Date(order.createdAt).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              });

              return (
                <div key={order._id} className="glass-card animate-slideup" style={{ padding: '24px' }}>
                  
                  {/* Order header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '16px',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Order ID
                      </div>
                      <div style={{ fontSize: '14px', fontFamily: 'Share Tech Mono, monospace', color: '#fff', fontWeight: 700 }}>
                        {order._id}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>
                        Placed On
                      </div>
                      <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>
                        {dateFormatted}
                      </div>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    padding: '20px 0 40px 0',
                    margin: '0 20px',
                    flexWrap: 'wrap',
                    gap: '20px'
                  }}>
                    
                    {/* Connecting line */}
                    <div style={{
                      position: 'absolute',
                      top: '30px',
                      left: '0',
                      right: '0',
                      height: '3px',
                      background: 'rgba(0, 245, 255, 0.15)',
                      zIndex: 0,
                      display: 'none', // hidden on mobile wraps
                    }} className="timeline-line"></div>

                    {[
                      { step: 0, title: 'Received', icon: '📝' },
                      { step: 1, title: 'In Kitchen', icon: '🍳' },
                      { step: 2, title: 'Dispatched', icon: '🛵' },
                      { step: 3, title: 'Delivered', icon: '🏠' }
                    ].map((stepObj) => {
                      const isActive = stepObj.step <= currentStep;
                      const isCurrent = stepObj.step === currentStep;

                      return (
                        <div key={stepObj.step} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                          zIndex: 1,
                          flex: 1,
                          minWidth: '70px',
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: isCurrent ? 'var(--accent-cyan)' : isActive ? 'rgba(0, 245, 255, 0.2)' : '#101020',
                            border: '1px solid',
                            borderColor: isActive ? 'var(--accent-cyan)' : 'var(--border)',
                            color: isCurrent ? 'var(--bg)' : isActive ? 'var(--accent-cyan)' : 'var(--muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            boxShadow: isCurrent ? 'var(--glow-cyan)' : 'none',
                            transition: 'all 0.3s ease',
                          }}>
                            {stepObj.icon}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: isCurrent ? 'var(--accent-cyan)' : isActive ? '#fff' : 'var(--muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginTop: '10px',
                            textAlign: 'center',
                          }}>
                            {stepObj.title}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order details */}
                  <div style={{
                    background: 'rgba(10, 10, 20, 0.4)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: '1.8fr 1.2fr',
                    gap: '20px',
                    flexWrap: 'wrap',
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                        Pizzas Ordered
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '13px', color: '#fff', display: 'flex', flexDirection: 'column' }}>
                            <span><strong>{item.quantity}x</strong> {item.name} (₹{item.price})</span>
                            {item.pizzaType === 'custom' && item.details && (
                              <span style={{ fontSize: '10px', color: 'var(--muted)', paddingLeft: '22px', marginTop: '2px' }}>
                                Base: {item.details.base} | Sauce: {item.details.sauce} | Cheese: {item.details.cheese}
                                {item.details.veggies?.length > 0 && ` | Veggies: ${item.details.veggies.join(', ')}`}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                        Delivery Address
                      </div>
                      <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.5', marginBottom: '15px' }}>
                        {order.address}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '10px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700 }}>Total Paid:</span>
                        <span style={{ color: 'var(--accent-cyan)', fontFamily: 'Share Tech Mono', fontWeight: 700, fontSize: '16px' }}>
                          ₹{order.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 600px) {
          .timeline-line {
            display: block !important;
          }
        }
      `}} />
    </div>
  );
};

export default OrderTracking;

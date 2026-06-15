import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const CustomPizza = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selection states
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedVeggies, setSelectedVeggies] = useState([]);

  // Step state: 1 = Base, 2 = Sauce, 3 = Cheese, 4 = Veggies/Review
  const [step, setStep] = useState(1);

  const { API_URL } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/pizzas/ingredients`);
      setIngredients(data);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch ingredients catalog.');
    } finally {
      setLoading(false);
    }
  };

  const bases = ingredients.filter(i => i.category === 'base');
  const sauces = ingredients.filter(i => i.category === 'sauce');
  const cheeses = ingredients.filter(i => i.category === 'cheese');
  const veggies = ingredients.filter(i => i.category === 'veg');

  // Calculate price dynamically: Base price 120 + prices of selected items
  const customPizzaPrice = 120 + 
    (selectedBase ? selectedBase.price : 0) +
    (selectedSauce ? selectedSauce.price : 0) +
    (selectedCheese ? selectedCheese.price : 0) +
    selectedVeggies.reduce((sum, v) => sum + v.price, 0);

  const handleVeggieToggle = (veg) => {
    if (selectedVeggies.find(v => v._id === veg._id)) {
      setSelectedVeggies(selectedVeggies.filter(v => v._id !== veg._id));
    } else {
      setSelectedVeggies([...selectedVeggies, veg]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) {
      return setError('Please make sure you have selected a base, sauce, and cheese.');
    }

    const customItem = {
      pizzaType: 'custom',
      name: 'Custom Pizza',
      price: customPizzaPrice,
      quantity: 1,
      details: {
        base: selectedBase.name,
        sauce: selectedSauce.name,
        cheese: selectedCheese.name,
        veggies: selectedVeggies.map(v => v.name)
      }
    };

    const storedCart = localStorage.getItem('pizzaCart');
    const cart = storedCart ? JSON.parse(storedCart) : [];
    cart.push(customItem);
    localStorage.setItem('pizzaCart', JSON.stringify(cart));
    
    navigate('/');
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--muted)' }}>
          Loading ingredients list...
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '40px 5%', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Step Indicator Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { num: 1, label: '1. Select Base' },
            { num: 2, label: '2. Choose Sauce' },
            { num: 3, label: '3. Choose Cheese' },
            { num: 4, label: '4. Choose Veggies & Review' }
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < step || (s.num === 2 && selectedBase) || (s.num === 3 && selectedBase && selectedSauce) || (s.num === 4 && selectedBase && selectedSauce && selectedCheese)) {
                  setStep(s.num);
                }
              }}
              style={{
                flex: 1,
                minWidth: '130px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: step === s.num ? 'rgba(0, 245, 255, 0.1)' : 'rgba(10, 10, 20, 0.4)',
                border: '1px solid',
                borderColor: step === s.num ? 'var(--accent-cyan)' : 'var(--border)',
                color: step === s.num ? 'var(--accent-cyan)' : 'var(--muted)',
                fontWeight: 700,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {s.label}
            </div>
          ))}
        </div>

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

        <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.8fr', gap: '40px' }}>
          
          {/* Step selections */}
          <div>
            
            {/* STEP 1: BASE */}
            {step === 1 && (
              <div className="animate-slideup">
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '20px', marginBottom: '20px', letterSpacing: '1px' }}>
                  🍕 Step 1: Select Pizza Base (Exactly 1)
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {bases.map((base) => (
                    <div
                      key={base._id}
                      onClick={() => { setSelectedBase(base); setStep(2); }}
                      className="glass-card"
                      style={{
                        padding: '20px',
                        cursor: 'pointer',
                        borderColor: selectedBase?._id === base._id ? 'var(--accent-cyan)' : 'var(--border)',
                        background: selectedBase?._id === base._id ? 'rgba(0, 245, 255, 0.05)' : 'var(--card)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>{base.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>In Stock: {base.stock}</div>
                      </div>
                      <span style={{ fontFamily: 'Share Tech Mono', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        +₹{base.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: SAUCE */}
            {step === 2 && (
              <div className="animate-slideup">
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '20px', marginBottom: '20px', letterSpacing: '1px' }}>
                  🥫 Step 2: Choose Sauce (Exactly 1)
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sauces.map((sauce) => (
                    <div
                      key={sauce._id}
                      onClick={() => { setSelectedSauce(sauce); setStep(3); }}
                      className="glass-card"
                      style={{
                        padding: '20px',
                        cursor: 'pointer',
                        borderColor: selectedSauce?._id === sauce._id ? 'var(--accent-cyan)' : 'var(--border)',
                        background: selectedSauce?._id === sauce._id ? 'rgba(0, 245, 255, 0.05)' : 'var(--card)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>{sauce.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>In Stock: {sauce.stock}</div>
                      </div>
                      <span style={{ fontFamily: 'Share Tech Mono', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        +₹{sauce.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: CHEESE */}
            {step === 3 && (
              <div className="animate-slideup">
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '20px', marginBottom: '20px', letterSpacing: '1px' }}>
                  🧀 Step 3: Select Cheese Type (Exactly 1)
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cheeses.map((cheese) => (
                    <div
                      key={cheese._id}
                      onClick={() => { setSelectedCheese(cheese); setStep(4); }}
                      className="glass-card"
                      style={{
                        padding: '20px',
                        cursor: 'pointer',
                        borderColor: selectedCheese?._id === cheese._id ? 'var(--accent-cyan)' : 'var(--border)',
                        background: selectedCheese?._id === cheese._id ? 'rgba(0, 245, 255, 0.05)' : 'var(--card)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>{cheese.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>In Stock: {cheese.stock}</div>
                      </div>
                      <span style={{ fontFamily: 'Share Tech Mono', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        +₹{cheese.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: VEGGIES */}
            {step === 4 && (
              <div className="animate-slideup">
                <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '20px', marginBottom: '20px', letterSpacing: '1px' }}>
                  🥦 Step 4: Opt Veggie Toppings (Choose Multiple)
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {veggies.map((veg) => {
                    const isSelected = selectedVeggies.find(v => v._id === veg._id);
                    return (
                      <div
                        key={veg._id}
                        onClick={() => handleVeggieToggle(veg)}
                        className="glass-card"
                        style={{
                          padding: '16px 20px',
                          cursor: 'pointer',
                          borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border)',
                          background: isSelected ? 'rgba(0, 245, 255, 0.05)' : 'var(--card)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>
                            {isSelected ? '✅ ' : '⬜ '} {veg.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Stock: {veg.stock}</div>
                        </div>
                        <span style={{ fontFamily: 'Share Tech Mono', color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: 700 }}>
                          +₹{veg.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Pizza design preview */}
          <div>
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '20px', letterSpacing: '1px', marginBottom: '24px' }}>
              🍕 Custom Pizza Summary
            </h2>
            <div className="glass-card" style={{ padding: '24px' }}>
              
              {/* Pizza base cost breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Basic Prep Cost:</span>
                  <span style={{ color: 'var(--text)', fontFamily: 'Share Tech Mono' }}>₹120</span>
                </div>
                {selectedBase && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Base: <strong>{selectedBase.name}</strong></span>
                    <span style={{ color: 'var(--accent-cyan)', fontFamily: 'Share Tech Mono' }}>+₹{selectedBase.price}</span>
                  </div>
                )}
                {selectedSauce && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Sauce: <strong>{selectedSauce.name}</strong></span>
                    <span style={{ color: 'var(--accent-cyan)', fontFamily: 'Share Tech Mono' }}>+₹{selectedSauce.price}</span>
                  </div>
                )}
                {selectedCheese && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Cheese: <strong>{selectedCheese.name}</strong></span>
                    <span style={{ color: 'var(--accent-cyan)', fontFamily: 'Share Tech Mono' }}>+₹{selectedCheese.price}</span>
                  </div>
                )}
                {selectedVeggies.length > 0 && (
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ marginBottom: '6px' }}>Veggies chosen:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '12px' }}>
                      {selectedVeggies.map((veg) => (
                        <div key={veg._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa' }}>
                          <span>• {veg.name}</span>
                          <span style={{ color: 'var(--accent-cyan)', fontFamily: 'Share Tech Mono' }}>+₹{veg.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Total custom Pizza Price */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', marginBottom: '24px' }}>
                <span>Dynamic Slice Price:</span>
                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'Share Tech Mono', fontSize: '20px' }}>₹{customPizzaPrice}</span>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="btn-cyber btn-orange"
                    style={{ flex: 1, fontSize: '12px' }}
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={step === 4 ? handleAddToCart : () => setStep(step + 1)}
                  className="btn-cyber btn-cyan"
                  style={{ flex: 2, fontSize: '12px' }}
                  disabled={
                    (step === 1 && !selectedBase) ||
                    (step === 2 && !selectedSauce) ||
                    (step === 3 && !selectedCheese)
                  }
                >
                  {step === 4 ? 'Confirm & Add' : 'Next Step →'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomPizza;

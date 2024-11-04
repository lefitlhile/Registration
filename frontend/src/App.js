import React, { useState } from 'react';
import './App.css';

function Header() {
  return (
    <header className="header">
      <img 
        src={require('./img/logo.png')} 
        alt="Logo" 
        width="166" 
        height="51" 
        className="logo"/>
      <h1 className="heading"> </h1>
    </header>
  );
}

const GoogleAuthButton = () => {
  return (
    <button style={googleStyles.button}>
      <img 
        src={require('./img/Gicon.png')} 
        alt="Google icon" 
        style={googleStyles.image}
      />
      <span style={googleStyles.text}>Continue With Google</span>
    </button>
  );
};

const googleStyles = {
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid transparent',
    borderRadius: '4px',
    padding: '16px 0',
    backgroundColor: '#fff',
    width: '418px',
    height: '52px',
    cursor: 'pointer',
  },
  image: {
    width: '20px',
    height: '20px',
    marginRight: '12px',
  },
  text: {
    fontSize: '16px',
    color: '#2e2e2e',
    fontFamily: 'Cabin, sans-serif',
    fontWeight: 400,
    lineHeight: '19.44px',
  }
};

const Separator = () => {
  return (
    <div style={separatorStyles.container}>
      <div style={separatorStyles.line}></div>
      <span style={separatorStyles.text}>Or</span>
      <div style={separatorStyles.line}></div>
    </div>
  );
};

const separatorStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: '16px',
    margin: '20px 0',
  },
  line: {
    width: '60px',
    height: '1px',
    backgroundImage: 'linear-gradient(to right, transparent, #999, transparent)',
  },
  text: {
    color: '#afa8a8',
    fontFamily: 'Cabin, sans-serif',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '19.44px',
  }
};

function SignUpForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Registration successful:', data);
        // Optionally, redirect or show success message
      } else {
        setError(data.errors.map(err => err.msg).join(', '));
      }
    } catch (error) {
      setError('An unexpected error occurred.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {error && <div className="error-message">{error}</div>}
      <div className="input-group">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="input-group">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <div className="checkbox-group">
        <input
          type="checkbox"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
        />
        <label>Remember Me</label>
      </div>
      <button type="submit" className="register-button" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}

const Footer = () => {
  return (
    <div style={footerStyles.div}>
      <span style={footerStyles.text}>Already have an account? </span>
      <a href="/login" style={footerStyles.link}>Log In</a>
    </div>
  );
};

const footerStyles = {
  div: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    fontFamily: 'Cabin, sans-serif',
    fontSize: '20px',
    lineHeight: '24.5px',
    width: '300px',
    height: '14px',
  },
  text: {
    color: '#000',
    marginRight: '5px'
  },
  link: {
    color: '#FFA500',
    textDecoration: 'none'
  }
};

function App() {
  return (
    <div className="App">
      <div className="left-section">
        <Header />
        <div className="content">
          <h2 className="form-header">SIGN UP</h2>
          <p className="form-subheader">Create an account to get started.</p>
          <GoogleAuthButton />
          <Separator />
          <SignUpForm />
          <Footer />
        </div>
      </div>
      <div className="right-section">
        <img 
          src={require('./img/LOGIMG.jpg')} 
          alt="Decorative"
          className="decorative-image" 
          width="400" height="600"
        />
      </div>
    </div>
  );
}

export default App;

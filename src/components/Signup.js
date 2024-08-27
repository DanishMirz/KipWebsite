import React, { useState } from 'react';
import { signUpUser } from './Signup';  // Import your signUpUser function

function LoginSignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User logged in:', user);
      })
      .catch((error) => {
        console.error('Login error:', error);
      });
  };

  const handleSignup = () => {
    signUpUser(email, password);  // Call signUpUser when signing up
  };

  return (
    <div className="login-signup-form">
      <h2>Login or Sign Up</h2>
      <input
        type="email"
        value={email}
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
}

export default LoginSignupForm;

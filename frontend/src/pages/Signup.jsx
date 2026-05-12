import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import PhoneInput from '../components/PhoneInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    setFormData({ ...formData, phoneNumber: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email ends with @gmail.com
    if (!formData.email.endsWith('@gmail.com')) {
      return setError('Only @gmail.com email addresses are accepted');
    }

    // Validate phone number is not empty
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      return setError('Please enter a valid phone number');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-dark-light to-dark p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="glass rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            MM Bank
          </h1>
          <p className="text-gray-400 text-center mb-6 text-sm sm:text-base">Create Account</p>

          {error && <Alert message={error} type="error" onClose={() => setError('')} />}

          <form onSubmit={handleSubmit}>
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="yourname@gmail.com" required />
            <PhoneInput label="Phone Number" value={formData.phoneNumber} onChange={handlePhoneChange} placeholder="Phone number" required />
            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
            <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
            <Input label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Your address" />

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-secondary">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;

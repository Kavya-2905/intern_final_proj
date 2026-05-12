import { useState, useEffect } from 'react';
import { loanService } from '../services';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [emiData, setEmiData] = useState(null);
  const [formData, setFormData] = useState({
    type: 'personal',
    amount: '',
    interestRate: '',
    tenure: ''
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await loanService.getLoans();
      setLoans(response.data.data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load loans' });
    } finally {
      setLoading(false);
    }
  };

  const calculateEMI = async () => {
    try {
      const response = await loanService.calculateEMI({
        amount: formData.amount,
        interestRate: formData.interestRate,
        tenure: formData.tenure
      });
      setEmiData(response.data.data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to calculate EMI' });
    }
  };

  const applyLoan = async (e) => {
    e.preventDefault();
    try {
      await loanService.applyLoan(formData);
      setAlert({ type: 'success', message: 'Loan application submitted!' });
      fetchLoans();
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to apply for loan' });
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">EMI Calculator</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Input label="Amount (₹)" type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
          <Input label="Interest Rate (%)" type="number" value={formData.interestRate} onChange={(e) => setFormData({...formData, interestRate: e.target.value})} />
          <Input label="Tenure (months)" type="number" value={formData.tenure} onChange={(e) => setFormData({...formData, tenure: e.target.value})} />
        </div>
        <Button onClick={calculateEMI} className="mt-4">Calculate EMI</Button>

        {emiData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-dark-light/50 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-gray-400 text-sm">Monthly EMI</p><p className="text-xl font-bold text-primary">₹{emiData.emi}</p></div>
              <div><p className="text-gray-400 text-sm">Total Interest</p><p className="text-xl font-bold text-secondary">₹{emiData.totalInterest}</p></div>
              <div><p className="text-gray-400 text-sm">Total Amount</p><p className="text-xl font-bold text-accent">₹{emiData.totalAmount}</p></div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Apply for Loan</h2>
        <form onSubmit={applyLoan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Loan Type</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="input-field">
              <option value="personal">Personal Loan</option>
              <option value="home">Home Loan</option>
              <option value="education">Education Loan</option>
              <option value="vehicle">Vehicle Loan</option>
            </select>
          </div>
          <Input label="Amount (₹)" type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
          <Input label="Interest Rate (%)" type="number" value={formData.interestRate} onChange={(e) => setFormData({...formData, interestRate: e.target.value})} required />
          <Input label="Tenure (months)" type="number" value={formData.tenure} onChange={(e) => setFormData({...formData, tenure: e.target.value})} required />
          <Button type="submit" className="w-full">Apply Now</Button>
        </form>
      </div>

      <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">My Loans</h2>
        {loans.length > 0 ? (
          <div className="space-y-3">
            {loans.map((loan, idx) => (
              <div key={loan._id} className="p-4 bg-dark-light/50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold capitalize">{loan.type} Loan</p>
                  <p className="text-sm text-gray-400">₹{loan.amount?.toLocaleString()} - EMI: ₹{loan.emi}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm capitalize ${
                  loan.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                  loan.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {loan.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">No loans yet</p>
        )}
      </div>
    </div>
  );
};

export default Loans;

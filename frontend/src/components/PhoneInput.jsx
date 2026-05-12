import { useState } from 'react';

const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+49', country: 'Germany', flag: '🇩' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+971', country: 'UAE', flag: '🇦' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+65', country: 'Singapore', flag: '🇸' },
];

const PhoneInput = ({ label, value, onChange, placeholder, error, required = false }) => {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState(value?.replace(selectedCountry.code, '') || '');

  const handleCountryChange = (e) => {
    const country = countryCodes.find(c => c.code === e.target.value);
    setSelectedCountry(country);
    const fullNumber = country.code + phoneNumber;
    onChange({ target: { name: 'phoneNumber', value: fullNumber } });
  };

  const handlePhoneChange = (e) => {
    const number = e.target.value;
    // Only allow digits
    if (number === '' || /^[0-9]{0,15}$/.test(number)) {
      setPhoneNumber(number);
      const fullNumber = selectedCountry.code + number;
      onChange({ target: { name: 'phoneNumber', value: fullNumber } });
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <div className="relative">
          <select
            value={selectedCountry.code}
            onChange={handleCountryChange}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-3 pr-8 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
            style={{ minWidth: '100px' }}
          >
            {countryCodes.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.code}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder || 'Phone number'}
          className={`flex-1 px-4 py-3 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300`}
          required={required}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default PhoneInput;

import React, { useState, useEffect, useRef } from 'react';
import './RetroSelect.css';

const RetroSelect = ({ value, onChange, options, label, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    // Use the id if available, otherwise fallback to the option itself
    const newValue = option.id || option;
    setSelectedValue(newValue);
    setIsOpen(false);
    onChange({ target: { value: newValue } });
  };

  const getDisplayValue = (val) => {
    if (options[0] && options[0].name) {
      const option = options.find(opt => opt.id === val);
      return option ? option.name : val;
    }
    return val;
  };

  return (
    <div className={`retro-select-container ${type}`} ref={dropdownRef}>
      <label>{label}</label>
      <div 
        className={`retro-select ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-value">
          {getDisplayValue(selectedValue)}
        </div>
        <div className="select-arrow"></div>
      </div>
      {isOpen && (
        <div className="options-container">
          <div className="options-list">
            {options.map((option, index) => (
              <div
                key={option.id || option}
                className={`option ${(option.id || option) === selectedValue ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
                style={{ '--index': index }}
              >
                {option.name || option}
                <div className="option-highlight"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetroSelect;
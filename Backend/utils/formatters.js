// backend/utils/formatters.js
/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: PKR)
 * @returns {string} - Formatted amount
 */
function formatCurrency(amount, currency = 'PKR') {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency
    }).format(amount);
  }
  
  /**
   * Format date to locale string
   * @param {Date|string} date - Date to format
   * @param {string} locale - Locale code (default: en-US)
   * @returns {string} - Formatted date
   */
  function formatDate(date, locale = 'en-US') {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  /**
   * Format time to locale string
   * @param {Date|string} date - Date to format
   * @param {string} locale - Locale code (default: en-US)
   * @returns {string} - Formatted time
   */
  function formatTime(date, locale = 'en-US') {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  /**
   * Format name with proper capitalization
   * @param {string} name - Name to format
   * @returns {string} - Formatted name
   */
  function formatName(name) {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }
  
  module.exports = {
    formatCurrency,
    formatDate,
    formatTime,
    formatName
  };
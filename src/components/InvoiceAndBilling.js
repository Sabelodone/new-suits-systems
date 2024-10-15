import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import './InvoiceAndBilling.css';
import EmailSettings from './EmailSettings';

const InvoiceAndBilling = ({ clients }) => {
  const [invoices, setInvoices] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    clientId: '',
    items: [{ description: '', amount: '' }],
  });
  const [emailStatus, setEmailStatus] = useState('');
  const [emailSettings, setEmailSettings] = useState({
    serviceId: '',
    templateId: '',
    userId: '',
  });
  const [emailSettingsSaved, setEmailSettingsSaved] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  // Handle email settings save
  const handleSettingsSave = (settings) => {
    setEmailSettings(settings);
    setEmailSettingsSaved(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes in invoice items
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [name]: value };
    setInvoiceData((prev) => ({ ...prev, items: newItems }));
  };

  // Add a new item to the invoice
  const addItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', amount: '' }],
    }));
  };

  // Handle invoice submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const totalAmount = invoiceData.items.reduce((acc, item) => acc + Number(item.amount), 0);
    const newInvoice = {
      id: invoices.length + 1,
      invoiceNumber: `INV-${invoices.length + 1}`,
      clientName: clients.find(client => client.id === invoiceData.clientId)?.name,
      dateIssued: new Date(),
      totalAmount,
      status: 'Pending',
      items: invoiceData.items,
    };
    setCurrentInvoice(newInvoice);
    setShowReviewModal(true);
  };

  // Send invoice email
  const sendInvoiceEmail = (invoice) => {
    const client = clients.find(client => client.id === invoice.clientId);
    
    // Check if client exists
    if (!client) {
      setEmailStatus('Client not found. Cannot send invoice.');
      return;
    }

    // Prepare template parameters for email
    const templateParams = {
      to_name: client.name,
      to_email: client.email,
      invoice_number: invoice.invoiceNumber,
      total_amount: `ZAR ${invoice.totalAmount.toFixed(2)}`,
      date_issued: new Date(invoice.dateIssued).toLocaleDateString(),
      items: invoice.items.map(item => `${item.description}: ZAR ${item.amount}`).join(', '),
    };

    // Send the email using EmailJS
    emailjs.send(emailSettings.serviceId, emailSettings.templateId, templateParams, emailSettings.userId)
      .then((response) => {
        setEmailStatus('Invoice sent successfully!');
        setInvoices((prevInvoices) => [...prevInvoices, invoice]);
      }, (err) => {
        setEmailStatus('Failed to send invoice. Please try again.');
      });
  };

  // Confirm and send the invoice
  const handleConfirmSend = () => {
    if (currentInvoice) {
      sendInvoiceEmail(currentInvoice);
    }
    setShowReviewModal(false);
    setInvoiceData({ clientId: '', items: [{ description: '', amount: '' }] });
  };

  // Cancel sending the invoice
  const handleCancelSend = () => {
    setShowReviewModal(false);
  };

  // Calculate total amount due and invoice count
  const totalAmountDue = invoices.reduce((acc, invoice) => acc + invoice.totalAmount, 0);
  const totalInvoices = invoices.length;

  return (
    <div className="invoice-and-billing">
      {/* Conditionally render the EmailSettings component */}
      {!emailSettingsSaved && <EmailSettings onSettingsSave={handleSettingsSave} />}

      <h2>Invoice and Billing Management</h2>
      <form className="create-invoice" onSubmit={handleSubmit}>
        <h3>Create Invoice</h3>
        <div className="form-group">
          <label>Client:</label>
          <select name="clientId" value={invoiceData.clientId} onChange={handleChange} required>
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Render invoice items */}
        {invoiceData.items.map((item, index) => (
          <div key={index} className="invoice-item">
            <div className="form-group">
              <label>Description:</label>
              <input
                type="text"
                name="description"
                value={item.description}
                onChange={(e) => handleItemChange(index, e)}
                required
              />
            </div>
            <div className="form-group">
              <label>Amount (ZAR):</label>
              <input
                type="number"
                name="amount"
                value={item.amount}
                onChange={(e) => handleItemChange(index, e)}
                required
              />
            </div>
          </div>
        ))}

        <button type="button" className="btn-add-item" onClick={addItem}>
          Add Item
        </button>
        <button type="submit" className="btn-create-invoice">Create Invoice</button>
      </form>

      {emailStatus && <p className="email-status">{emailStatus}</p>}

      {/* Invoice List */}
      <div className="invoice-list">
        <h3>Invoices</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Client</th>
              <th>Date Issued</th>
              <th>Total Amount (ZAR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.invoiceNumber}</td>
                <td>{invoice.clientName}</td>
                <td>{new Date(invoice.dateIssued).toLocaleDateString()}</td>
                <td>ZAR {invoice.totalAmount.toFixed(2)}</td>
                <td>{invoice.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Billing Summary */}
      <div className="billing-summary">
        <h3>Billing Summary</h3>
        <p>Total Invoices: {totalInvoices}</p>
        <p>Total Amount Due: ZAR {totalAmountDue.toFixed(2)}</p>
      </div>

      {showReviewModal && (
  <div className="modal show" style={{ display: 'block' }} tabindex="-1" role="dialog">
    <div className="modal-dialog modal-md" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Review Invoice</h5>
          <button type="button" className="close" onClick={handleCancelSend}>
            <span>&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <p><strong>Invoice Number:</strong> {currentInvoice?.invoiceNumber}</p>
          <p><strong>Client:</strong> {currentInvoice?.clientName}</p>
          <p><strong>Date Issued:</strong> {new Date(currentInvoice?.dateIssued).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ZAR {currentInvoice?.totalAmount.toFixed(2)}</p>
          <h4>Items:</h4>
          <ul>
            {currentInvoice?.items.map((item, index) => (
              <li key={index}>{item.description}: ZAR {item.amount}</li>
            ))}
          </ul>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleConfirmSend}>Confirm & Send</button>
          <button className="btn btn-secondary" onClick={handleCancelSend}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default InvoiceAndBilling;

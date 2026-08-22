const sendSupportTicket = async (req, res) => {
  try {
    const { to, subject, content } = req.body;
    console.log(`Sending support email to ${to}: ${subject}`);
    // Fake sending email for now
    res.json({ success: true, message: 'Ticket received' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit ticket' });
  }
};

module.exports = { sendSupportTicket };

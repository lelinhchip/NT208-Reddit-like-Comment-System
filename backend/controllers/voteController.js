const Vote = require('../models/Vote');

exports.vote = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { user_id, value } = req.body;

    if (![1, -1].includes(Number(value)))
      return res.status(400).json({ message: 'value phải là 1 hoặc -1' });

    await Vote.upsert(post_id, user_id, value);
    await Vote.recalcScore(post_id);

    res.json({ message: 'Vote recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const { Attachment } = require('../models/index');

// ── UPLOAD ATTACHMENT ──────────────────────────────────
const uploadAttachment = async (req, res) => {
  
  try {
    const { taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const attachment = await Attachment.create({
      taskId: taskId,
      uploadedBy: req.user.id,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
    });

    res.status(201).json({
      message: 'File uploaded successfully.',
      attachment: attachment,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── GET ATTACHMENTS FOR A TASK ─────────────────────────
const getAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const attachments = await Attachment.findAll({
      where: { taskId: taskId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(attachments);
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

// ── DELETE ATTACHMENT ──────────────────────────────────
const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await Attachment.findByPk(attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found.' });
    }

    if (attachment.uploadedBy !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only delete your own attachments.' });
    }

    await attachment.destroy();
    res.status(200).json({ message: 'Attachment deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

module.exports = { uploadAttachment, getAttachments, deleteAttachment };
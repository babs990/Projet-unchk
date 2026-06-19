// ── Helpers de réponse standardisés ─────────────────────────────────────────

const success = (res, data = {}, message = 'Succès', status = 200) =>
  res.status(status).json({ success: true, message, data });

const created = (res, data = {}, message = 'Créé avec succès') =>
  res.status(201).json({ success: true, message, data });

const paginated = (res, rows, total, page, limit, message = 'Succès') =>
  res.status(200).json({
    success: true,
    message,
    data: rows,
    pagination: {
      total,
      page:       parseInt(page),
      limit:      parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  });

const error = (res, message = 'Erreur', status = 400, errors = []) =>
  res.status(status).json({ success: false, message, errors });

module.exports = { success, created, paginated, error };

async function register(req, res, next) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: "Les champs 'email' et 'password' sont requis",
      });
    }

    const result = await authService.register({ email, password, role });

    res.status(201).json({
      status: 'success',
      data: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}
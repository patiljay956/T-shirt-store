const cookieToken = (user, res) => {
    const token = user.getJwtToken();

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("token", token, options)
        .json({ user, token, message: "User successfully signed up" });
};

export { cookieToken };

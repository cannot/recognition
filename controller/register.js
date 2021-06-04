const User = require("../models/user");
const { validationResult } = require("express-validator/check");

// GET route for reading data
exports.getFrontPage = (req, res, next) => {

    var val = req.session;
    console.log(val);

    return res.render("index", {
        pageTitle: "Front Page",
        user: val
    });
};

// GET route for registration
exports.getRegister = (req, res, next) => {
    var message = req.flash("notification");

    return res.render("register/register", {
        pageTitle: "Create Account",
        errMessage: message.length > 0 ? message[0] : null,
        oldInput: {
            firstname: '',
            lastname: '',
            email: '',
            username: '',
            password: ''
        },
        errFields: {
            errFirstName: '',
            errLastName: '',
            errEmail: '',
            errUsername: '',
            errPassword: '',
            errPasswordConf: ''
        }
    });
};

//POST route for updating data
exports.postRegister = (req, res, next) => {

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const passwordConf = req.body.passwordConf;
    const usertype = req.body.usertype;

    const valError = validationResult(req);
    var errArray = valError.array();

    console.log(req);

    if (!valError.isEmpty()) {

        let eFirstname, eLastname, eEmail, eUsername, ePass, ePassConf, eUserType;
        errArray.forEach(i => {
            switch (i.param) {
                case 'firstname':
                    eFirstname = i.msg;
                    break;
                case 'lastname':
                    eLastname = i.msg;
                    break;
                case 'email':
                    eEmail = i.msg;
                    break;
                case 'username':
                    eUsername = i.msg;
                    break;
                case 'password':
                    ePass = i.msg;
                    break;
                case 'passwordConf':
                    ePassConf = i.msg;
                    break;
                case 'usertype':
                    eUserType = i.msg;
                    break;
            }
        })
        return res.render("register/register", {
            pageTitle: "Create Account",
            path: "/register",
            oldInput: {
                firstname: firstname,
                lastname: lastname,
                email: email,
                username: '',
                password: ''
            },
            errFields: {
                errFirstName: '',
                errLastName: '',
                errEmail: '',
                errUsername: '',
                errPassword: '',
                errPasswordConf: '',
                errUserType: ''
            }
        });
    }

    if (
        firstname &&
        lastname &&
        email &&
        username &&
        password &&
        passwordConf &&
        usertype
    ) {
        var userData = {
            firstname: firstname,
            lastname: lastname,
            email: email,
            username: username,
            password: password,
            passwordConf: passwordConf,
            usertype: usertype,
            loginAttempts: 1,
            lockUntil: 1,
            userId: 1
        };

        User.create(userData, function(error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                req.session.userType = usertype;

                return res.redirect("/account");
            }
        });
    } else {
        req.flash("notification", "All fields required.");
        res.redirect("/register");
    }
};

// GET login
exports.getLogin = (req, res, next) => {
    let message = req.flash("notification");

    return res.render("register/login", {
        pageTitle: "Login",
        errMessage: message.length > 0 ? message[0] : null,
        oldInput: {
            email: ''
        },
        errFields: {
            errEmail: '',
            errPassword: '',
        }
    });
};

// POST login
exports.postLogin = async(req, res, next) => {
    const email = req.body.logemail,
        password = req.body.logpassword;

    const valError = validationResult(req);
    var errArray = valError.array();

    console.log(errArray);

    if (!valError.isEmpty()) {
        let eEmail, ePass;
        errArray.forEach(i => {
            switch (i.param) {
                case 'logemail':
                    eEmail = i.msg;
                    break;
                case 'logpassword':
                    ePass = i.msg;
                    break;
            }
        })
        return res.render("register/login", {
            pageTitle: "Login",
            path: "/login",
            oldInput: {
                email
            },
            errFields: {
                errEmail: eEmail,
                errPassword: ePass,
            },
            errMessage: null
        });
    }

    User.authenticate(email, password, function(
        user,
        error
    ) {

        //console.log(user);

        if (!user) {
            var err = new Error("Wrong email or password.");
            err.status = 401;
            return next(err);
        } else {
            req.session.userFirstname = user.firstname;
            req.session.userLastname = user.lastname;
            req.session.userEmail = user.email;
            req.session.userUsername = user.username;
            req.session.userType = user.usertype;

            req.session.userId = user._id;
            return res.redirect("/");
        }
    });

};

// GET for logout
exports.getLogout = (req, res, next) => {
    // delete session object
    req.session.destroy(function(err) {
        if (err) {
            return next(err);
        } else {
            return res.redirect("/");
        }
    });
};
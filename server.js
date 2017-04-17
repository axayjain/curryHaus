var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/curryDb';

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/view/index.html');
});

app.get('/admin', function (req, res) {
    res.sendFile(__dirname + '/public/view/admin.html');
})

app.post('/enterUserData', function (req, res) {
    var userData = getDateTime(req.body);

    getRandomNum(function (data) {
        userData.otp = data;
        var sms = {
            "mobile": userData.number,
            "message": "Curry Hauz!! Otp:-" + userData.otp
        };
        //sendSMSInternal(sms);
        console.log(userData.otp);
        MongoClient.connect(url, function (err, db) {
            db.collection('users').findOne({
                email: userData.email
            }, function (err, data) {
                if (data) {
                    res.json(false);
                } else {
                    insertDoc(db, function () {
                        res.json(true);
                        db.close();
                    })
                }
            });
        });
        var insertDoc = function (db, callback) {
            db.collection('users').insert(userData, function (err, result) {
                assert.equal(err, null);
                console.log("Inserted a document into the checks collection.");
                callback();
            });
        };
    });
})

app.post('/verifyOtp', function (req, res) {
    var userData = req.body;
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        findDocument(db, function () {
            //console.log('found');
            db.close();
        });
    });
    var findDocument = function (db, callback) {
        db.collection('users').findOne({
            email: userData.email
        }, function (err, data) {
            if (data) {
                if (data.otp == userData.otp) {
                    db.collection('users').update({
                        email: userData.email,
                    }, {
                        $set: {
                            "status": true
                        }
                    })
                    res.json(true);
                    //sendEmail(userData);
                } else {
                    res.json(false);
                }
                callback();
            } else {
                console.log("none");
                callback();
            }
        });
    }
})

app.post('/resendOtp', function (req, res) {
    var userData = req.body;
    getRandomNum(function (data) {
        userData.otp = data;
        var sms = {
            "mobile": userData.number,
            "message": "Curry Hauz!! Otp:-" + userData.otp
        };
        //sendSMSInternal(sms);
        console.log(userData.otp);
        MongoClient.connect(url, function (err, db) {
            db.collection('users').findOne({
                email: userData.email
            }, function (err, data) {
                if (data) {
                    updateDoc(db, function () {
                        res.json(true);
                        db.close();
                    })
                } else {
                    res.json(false);
                }
            });
        });
        var updateDoc = function (db, callback) {
            db.collection('users').update({
                email: userData.email
            }, {
                $set: {
                    otp: userData.otp
                }
            });
            callback();
        };
    });
})

app.post('/loginAdmin', function (req, res) {
    //console.log(req.body);
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        db.collection('admin').findOne({
            userName: req.body.userName,
            password: req.body.password
        }, function (err, data) {
            if (data) {
                db.collection('users').find({}).toArray(function (err, doc) {
                    res.json(doc);
                })
            } else {
                res.json(false);
            }
        })
    });

})

//date and time function
function getDateTime(userData) {
    var today = new Date();
    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes();
    userData.date = date;
    userData.time = time;
    return userData;
}


// function to send text
function sendSMSInternal(r) {

    var request = require('request');
    var url = 'http://www.myvaluefirst.com/smpp/sendsms?username=realboxtrans&password=realbox123&to=' + r.mobile + '&from=REALBX&text=' + r.message;

    //console.log(url);
    request(url, function (error, response, body) {
        console.log(r.mobile + ' - ' + response.body);
        // if (!error && response.statusCode == 200)
        //    //resolve({ err: null, success: true })
        // else
        //     //resolve({ err: error, success: false });
    });
}


// function to generate otp
function getRandomNum(cb) {
    var num = Math.floor(Math.random() * 9000) + 1000;
    cb(num);
}


//email function
function sendEmail(r) {
    var helper = require('sendgrid').mail;

    from_email = new helper.Email("curryHuaz@gmail.com");
    to_email = new helper.Email(r.email);
    subject = "Sending with SendGrid is Fun";
    content = new helper.Content("text/plain", "and easy to do anywhere, even with Node.js");
    mail = new helper.Mail(from_email, subject, to_email, content);

    var sg = require('sendgrid')("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");
    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
    });

    sg.API(request, function (error, response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
    })
}

http.listen(3000, function () {
    console.log('listening on *3000');
});
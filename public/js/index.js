$(document).ready(function () {
    makeTemplates();
    homeScreen.show();
})

var homeScreen = new function () {
    this.show = function () {
        var userInfo = {
            "name": "",
            "number": "",
            "email": "",
            "otp": "",
            "date": "",
            "time": "",
            "status": false
        };
        var helper = {
            submitUser: submitUser
        }
        rb('.screenContainer', 'inputScreen', '', helper);

        function submitUser() {
            var userName = $('.inputName').val();
            var userNumber = $('.inputNumber').val();
            var userEmail = $('.inputEmail').val();
            if (userName && userNumber && userEmail) {
                userInfo.name = userName;
                userInfo.number = userNumber;
                userInfo.email = userEmail;
                //console.log(userInfo);
                execute('enterUserData', userInfo, function (data) {
                    if (data) {
                        otpScreen.show(userInfo);
                    } else {
                        alert("already registered account");
                    }

                })
            } else {
                alert("Please fill out all fields");
            }
        }
    }
}

var otpScreen = new function () {
    this.show = function (userInfo) {
        var otpHelper = {
            submitOtp: submitOtp,
            resendOtp: resendOtp
        }
        rb('.screenContainer', 'otpScreen', '', otpHelper);

        function submitOtp() {
            var otp = $('.inputOtp').val();
            if (otp) {
                var otpJson = {
                    "otp": otp,
                    "email": userInfo.email
                }
                execute('verifyOtp', otpJson, function (data) {
                    if (data) {
                        thankYouScreen.show(userInfo);
                    } else {
                        alert("wrong OTP");
                    }
                })
            } else {
                alert('Please enter the otp first');
            }

        }

        function resendOtp() {
            execute('resendOtp',userInfo, function (data) {
                if (data) {
                    alert("new otp send");
                }
                else{
                    alert("something went wrong. Please try after sometime.")
                }
            });
        }
    }
}

var thankYouScreen = new function () {
    this.show = function (userInfo) {
        rb('.screenContainer', 'thankYouScreen', userInfo);
    }
}
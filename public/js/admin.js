$(document).ready(function () {
    makeTemplates();
    loginScreen.show();
})

var loginScreen = new function () {
    this.show = function () {
        var helper = {
            adminLogin: adminLogin
        }
        rb('.contentContainer', 'loginScreen', '', helper);

        function adminLogin(){
            var userName=$('.userName').val();
            var password=$('.password').val();
            if(userName && password){
                var adminData={
                    "userName":userName,
                    "password":password
                }
                execute('loginAdmin', adminData, function(data){
                    if(data){
                       console.log(data);
                       showUsersScreen.show(data);
                    }
                    else{
                        alert("invalid username or password");
                    }
                })
            }
            else{
                alert("Please fill both username and password.");
            }
        }
    }
}

var showUsersScreen= new function(){
    this.show= function(users){
        $('.headerTitle').html('Users Data');
        var usersData={
            users:users
        }
        rb('.contentContainer', 'dataBlock', usersData);
    }
} 
class GameSettings{
    constructor(root){
        this.root = root;
        this.$settings = $(`
<div class = "game_settings">
    <div class = "game_settings_login">
        <div class = "game_settings_title">
        登录
        </div>
        <div class = "game_settings_username">
            <div class = "game_settings_item">
                <input type = "text" placeholder = "用户名">
            </div>
        </div>
        <div class = "game_settings_passwd">
            <div class = "game_settings_item">
                <input type = "password" placeholder = "密码">
            </div>
        </div>
        <div class = "game_settings_affirm">
            <div class = "game_settings_item">
                <button>确认</button>
            </div>
        </div>
        <div class = "game_settings_error">
        </div>
        <div class = "game_settings_choice">
            注册
        </div>
        <br>
        <div class = "game_settings_qq">
            <img width = "40" src = "http://59.110.53.20:8000/static/image/settings/qq_logo.png">
            <br>
            <div class = "game_settings_qq_title">
                QQ一键登录
            </div>
        </div>
    </div>
    <div class = "game_settings_register">
        <div class = "game_settings_title">
            注册
        </div>
        <div class = "game_settings_username">
            <div class = "game_settings_item">
                <input type = "text" placeholder = "用户名">
            </div>
        </div>
        <div class = "game_settings_passwd">
            <div class = "game_settings_item">
                <input type = "password" placeholder = "密码">
            </div>
        </div>
        <div class = "game_settings_comfirm_passwd">
            <div class = "game_settings_item">
                <input type = "password" placeholder = "确认密码">
            </div>
        </div>
        <div class = "game_settings_affirm">
            <div class = "game_settings_item">
                <button>确认</button>
            </div>
        </div>
        <div class = "game_settings_error">
        </div>
        <div class = "game_settings_choice">
            登录
        </div>
        <br>
        <div class = "game_settings_qq">
            <img width = "40" src = "http://59.110.53.20:8000/static/image/settings/qq_logo.png">
            <br>
            <div class = "game_settings_qq_title">
                QQ一键注册
            </div>
        </div>
    </div>
</div>
            `);

        this.$login = this.$settings.find(".game_settings_login");
        this.$login_username = this.$login.find(".game_settings_username input");
        this.$login_passwd = this.$login.find(".game_settings_passwd input");
        this.$login_affirm = this.$login.find(".game_settings_affirm button");
        this.$login_error = this.$login.find(".game_settings_error");
        this.$login_register = this.$login.find(".game_settings_choice");

        this.$login.hide();

        this.$register = this.$settings.find(".game_settings_register");
        this.$register_username = this.$register.find(".game_settings_username input");
        this.$register_passwd_1 = this.$register.find(".game_settings_passwd input");
        this.$register_passwd_2 = this.$register.find(".game_settings_comfirm_passwd input");
        this.$register_affirm = this.$register.find(".game_settings_affirm button");
        this.$register_error = this.$register.find(".game_settings_error");
        this.$register_login = this.$register.find(".game_settings_choice");

        this.$register.hide();

        this.root.$lty.append(this.$settings);
        this.platform = "WEB";
        this.username = "";
        this.photo = "";

        this.start();
    }

    start(){
        this.get_info();
        this.listening_events();
    }

    listening_events(){
        let outer = this;
        this.listening_events_login();
        this.listening_events_register();
    }

    listening_events_login(){
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });
        this.$login_affirm.click(function(){
            outer.remote_login();
        })
    }

    listening_events_register(){
        let outer = this;
        this.$register_login.click(function(){
            outer.login();
        });
        this.$register_affirm.click(function(){
            outer.remote_register();
        })
    }

    register(){
        this.$login.hide();
        this.$register.show();
    }

    login(){
        this.$register.hide();
        this.$login.show();
    }

    remote_login(){
        let outer = this;
        let username = this.$login_username.val();
        let passwd = this.$login_passwd.val();
        this.$login_error.empty();
        console.log(username, passwd);
        $.ajax({
            url: "http://59.110.53.20:8000/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: passwd,
            },
            success: function(resp){
                console.log(resp);
                if(resp.result === "success"){
                    location.reload();
                } else {
                    outer.$login_error.html(resp.result);
                }
            }
        })
    }

    remote_register(){
        let outer = this;
        let username = this.$register_username.val();
        let passwd_1 = this.$register_passwd_1.val();
        let passwd_2 = this.$register_passwd_2.val();
        this.$register_error.empty();

        $.ajax({
            url:"http://59.110.53.20:8000/settings/register/",
            type: "GET",
            data:{
                username: username,
                passwd_1: passwd_1,
                passwd_2: passwd_2,
            },
            success: function(resp){
                console.log(resp);
                if(resp.result == "success"){
                    outer.login();
                } else {
                    outer.$register_error.html(resp.result);
                }
            }

        })
    }

    remote_logout(){
        $.ajax({
            url: "http://59.110.53.20:8000/settings/logout/",
            type: "GET",
            success: function(resp) {
                console.log(resp);
                if(resp.result === "success"){
                    location.reload();
                }
            }
        })
    }

    get_info(){
        let outer = this;
        $.ajax({
            url: "http://59.110.53.20:8000/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp){
                console.log(resp);
                if(resp.result === "success"){
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        });
    }

    show(){
        this.$settings.show();
    }

    hide(){
        this.$settings.hide();
    }
}


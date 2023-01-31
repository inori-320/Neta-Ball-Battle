class GameSettings{
    constructor(root){
        this.root = root;
        this.$settings = $(`
<div class = "game_settings">
    <div class = "game_settings_login">
        <div class = "game_settings_login_title">
        登录
        </div>
        <div class = "game_settings_login_"></div>
    </div>
    <div class = "game_settings_register">
    </div>
</div>
            `);

        this.$login = this.$settings.find(".game_settings_login");
        this.$login.hide();

        this.$register = this.$settings.find(".game_settings_register");
        this.$register.hide();

        this.root.$lty.append(this.$settings);
        this.platform = "WEB";
        this.username = "";
        this.photo = "";

        this.start();
    }

    start(){
        this.get_info();
    }

    register(){
        this.$login.hide();
        this.$register.show();
    }

    login(){
        this.$register.hide();
        this.$login.show();
    }

    get_info(){
        let outer = this;
        $.ajax({
            url: "http://8.130.15.181:8000/settings/getinfo/",
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


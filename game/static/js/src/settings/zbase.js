class GameSettings{
    constructor(root){
        this.root = root;
        this.platform = "WEB";
        this.username = "";
        this.photo = "";

        this.start();
    }

    start(){
        this.get_info();
    }

    register(){
    }

    login(){
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
    }

    hide(){
    }
}


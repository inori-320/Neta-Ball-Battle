class GameMenu{
    constructor(root){
        this.root = root;
        this.$menu = $(`
<div class="game_menu">
    <div class = "game_menu_block">
        <div class = "game_menu_block_item game_menu_block_single">
            单人模式
        </div>
        <br>
        <div class = "game_menu_block_item game_menu_block_multi">
            多人模式
        </div>
        <br>
        <div class = "game_menu_block_item game_menu_block_explain">
            游戏帮助
        </div>
        <br>
        <div class = "game_menu_block_item game_menu_block_settings">
            退出登录
        </div>
    </div>
</div>
`);
        this.$menu.hide();
        this.root.$lty.append(this.$menu);
        this.$single = this.$menu.find('.game_menu_block_single');
        this.$multi = this.$menu.find('.game_menu_block_multi');
        this.$explain = this.$menu.find('.game_menu_block_explain');
        this.$settings = this.$menu.find('.game_menu_block_settings');

        this.start();
    }

    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let outer = this;
        this.$single.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");

        });
        this.$explain.click(function(){
            outer.hide();
            outer.root.explain.show();
        });
        this.$settings.click(function(){
            outer.root.settings.remote_logout();
        });
    }

    show(){
        this.$menu.show();
    }

    hide(){
        this.$menu.hide();
    }
}

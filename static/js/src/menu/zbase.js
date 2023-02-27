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
        <div class = "game_menu_block_item game_menu_block_settings">
            退出
        </div>
    </div>
</div>
`);
        this.$menu.hide();
        this.root.$lty.append(this.$menu);
        this.$single = this.$menu.find('.game_menu_block_single');
        this.$multi = this.$menu.find('.game_menu_block_multi');
        this.$settings = this.$menu.find('.game_menu_block_settings');

        this.start();
    }

    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let now_menu = this;
        this.$single.click(function(){
            console.log("click single mode.");
            now_menu.hide();
            now_menu.root.playground.show("single mode");
        });
        this.$multi.click(function(){
            console.log("click multi mode.");
            now_menu.hide();
            now_menu.root.playground.show("multi mode");

        });
        this.$settings.click(function(){
            console.log("launch setting.");
            now_menu.root.settings.remote_logout();
        });
    }

    show(){
        this.$menu.show();
    }

    hide(){
        this.$menu.hide();
    }
}

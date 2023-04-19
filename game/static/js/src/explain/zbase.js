class GameExplain{
    constructor(root){
        this.root = root;
        this.$explain = $(`
<div class="game_explain">
    <div class="game_explain_game">
        <div class="game_explain_game_title">游戏说明</div>
        <p class="game_explain_game_detail">
            本游戏玩法为类吃鸡模式，分为单人模式和多人模式，单人模式由玩家一人和6名AI组成，多人模式由三名玩家组成。击败所有角色即可获得胜利。
        </p>
    </div>
    <br>
    <div class="game_explain_operation">
        <div class="game_explain_operation_title">操作说明</div>
        <div class="game_explain_operation_detail">
            <p>鼠标右键：移动</p>
            <p>鼠标左键：朝目标方向使用技能</p>
            <p>Q: 发射火球</p>
            <p>技能效果：使目标朝被攻击方向击退一段距离</p>
            <p>W: 发射冰球</p>
            <p>技能效果：使目标立即停止移动并且在2秒内移动速度减半</p>
            <p>F：闪现</p>
            <p>技能效果：使自身朝选定方向移动一段距离</p>
            <p>Enter：多人游戏中聊天</p>
            <p>Esc：关闭聊天框</p>
        </div>
    </div>
    <div class="game_explain_return">返回</div>
</div>
        `);

        this.$return = this.$explain.find('.game_explain_return');
        this.$explain.hide();
        this.root.$lty.append(this.$explain);

        this.start();
    }

    start(){
        this.listening_event();
    }

    listening_event(){
        let outer = this;
        this.$return.click(function(){
            outer.hide();
            outer.root.menu.show();
        });
    }

    show(){
        this.$explain.show();
    }

    hide(){
        this.$explain.hide();
    }
}

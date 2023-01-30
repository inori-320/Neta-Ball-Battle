class Particle extends GameObject{
    constructor(playground, x, y, r, vx, vy, speed, color, move_length){
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.r = r;
        this.speed = speed;
        this.color = color;
        this.move_length = move_length;
        this.vy = vy;
        this.vx = vx;
        this.ctx = this.playground.game_map.ctx;
        this.friction = 0.9;
    }

    start(){
    }

    update(){
        if(this.move_length < 1 || this.speed < 1) {
            this.del();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

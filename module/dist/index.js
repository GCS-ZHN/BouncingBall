import { Game } from "./Game.js";
(function () {
    const canvas = document.getElementById("gameboard");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const Game1 = new Game(100, canvas.getContext("2d"), 20, 10, 80, 80, 1, 1, false);
    (function process(now) {
        Game1.update(now);
        window.requestAnimationFrame(process);
    })(new Date().getDate());
})();
